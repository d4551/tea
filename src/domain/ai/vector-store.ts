import { Database } from "bun:sqlite";
import { appConfig } from "../../config/environment.ts";
import { createLogger } from "../../lib/logger.ts";

const logger = createLogger("ai.vector-store");

/**
 * Embedding dimension used by the default local embedding model (all-MiniLM-L6-v2).
 */
const EMBEDDING_DIMENSION = 384;

/**
 * Resolves the path for the dedicated vector index database file.
 *
 * Co-located with the main application database but in a separate file
 * to avoid WAL contention between Prisma's LibSQL adapter and bun:sqlite.
 *
 * @returns Absolute path to the vector database file.
 */
const resolveVectorDbPath = (): string => {
  const localDir = appConfig.database.localDirectory;
  if (localDir) {
    return `${localDir}/vec.db`;
  }
  return "./prisma/vec.db";
};

/**
 * Minimal contract for the sqlite-vec native module.
 * Declared inline so the package's type declarations are not required at compile time.
 */
interface SqliteVecModule {
  readonly load: (db: Database) => void;
}

/**
 * Attempts to dynamically load the sqlite-vec native module.
 * Returns null when the module is not installed or fails to load.
 *
 * @returns The sqlite-vec module or null if unavailable.
 */
const loadSqliteVecModule = (): SqliteVecModule | null => {
  // SAFETY: sqlite-vec is an optional native dependency. When unavailable
  // (e.g. CI, test environments, or unsupported platforms) the vector store
  // degrades gracefully to a no-op implementation. The require() is wrapped
  // in a conditional check rather than try/catch per project conventions.
  const m = (() => {
    const resolved = require.resolve("sqlite-vec");
    if (!resolved) {
      return null;
    }
    return require(resolved) as SqliteVecModule | undefined;
  })();

  if (m?.load) {
    return m;
  }
  logger.warn("vector-store.sqlite-vec-unavailable", {
    reason: "module could not be loaded or is missing the .load export",
  });
  return null;
};

/**
 * Single KNN search result from the vector index.
 */
export interface VectorSearchResult {
  /** Chunk identifier matching `AiKnowledgeChunk.id`. */
  readonly chunkId: string;
  /** Cosine distance (lower = more similar). Convert to similarity via `1 - distance`. */
  readonly distance: number;
}

/**
 * Persistent vector index backed by sqlite-vec and bun:sqlite.
 *
 * Maintains a `vec0` virtual table of chunk embeddings for sub-linear
 * approximate nearest-neighbour (ANN) search. Operates against a dedicated
 * SQLite file to avoid WAL contention with the main Prisma/LibSQL database.
 *
 * When the sqlite-vec native extension is unavailable (CI, test environments,
 * unsupported platforms) all operations degrade to safe no-ops. The
 * knowledge-base service falls back to BM25/Prisma-only search.
 */
class VectorStore {
  private db: Database | null = null;
  private _available = false;
  private _initialized = false;

  /**
   * Whether the vector store is operational.
   *
   * Returns `false` when the sqlite-vec native extension could not be loaded,
   * in which case all write/search operations are safe no-ops.
   */
  get available(): boolean {
    if (!this._initialized) {
      this.initialize();
    }
    return this._available;
  }

  /**
   * Attempts to initialize the database and load sqlite-vec.
   * Sets `_available` based on success.
   */
  private initialize(): void {
    if (this._initialized) {
      return;
    }
    this._initialized = true;

    const sqliteVec = loadSqliteVecModule();
    if (!sqliteVec) {
      logger.warn("vector-store.disabled", {
        reason: "sqlite-vec native extension not available",
      });
      return;
    }

    const dbPath = resolveVectorDbPath();
    const db = new Database(dbPath);

    sqliteVec.load(db);

    db.run(`
      CREATE VIRTUAL TABLE IF NOT EXISTS vec_knowledge_chunks USING vec0(
        chunk_id TEXT PRIMARY KEY,
        embedding FLOAT[${EMBEDDING_DIMENSION}]
      )
    `);

    this.db = db;
    this._available = true;
    logger.info("vector-store.initialized", { path: dbPath, dimension: EMBEDDING_DIMENSION });
  }

  /**
   * Returns the database handle if the store is available.
   *
   * @returns Database handle or null when the extension is unavailable.
   */
  private getDb(): Database | null {
    if (!this._initialized) {
      this.initialize();
    }
    return this.db;
  }

  /**
   * Inserts or replaces a chunk embedding in the vector index.
   * No-op when the vector store is unavailable.
   *
   * @param chunkId Chunk identifier matching `AiKnowledgeChunk.id`.
   * @param embedding Float32 embedding vector of length `EMBEDDING_DIMENSION`.
   */
  upsert(chunkId: string, embedding: Float32Array | readonly number[]): void {
    const db = this.getDb();
    if (!db) {
      return;
    }

    const blob =
      embedding instanceof Float32Array
        ? new Uint8Array(embedding.buffer, embedding.byteOffset, embedding.byteLength)
        : new Uint8Array(new Float32Array(embedding).buffer);

    db.run(`INSERT OR REPLACE INTO vec_knowledge_chunks (chunk_id, embedding) VALUES (?, ?)`, [
      chunkId,
      blob,
    ]);
  }

  /**
   * Batch-inserts chunk embeddings in a single transaction.
   * No-op when the vector store is unavailable.
   *
   * @param entries Array of chunk ID and embedding pairs.
   */
  upsertMany(
    entries: readonly {
      readonly chunkId: string;
      readonly embedding: Float32Array | readonly number[];
    }[],
  ): void {
    const db = this.getDb();
    if (!db) {
      return;
    }

    const stmt = db.prepare(
      `INSERT OR REPLACE INTO vec_knowledge_chunks (chunk_id, embedding) VALUES (?, ?)`,
    );

    const transaction = db.transaction(() => {
      for (const entry of entries) {
        const blob =
          entry.embedding instanceof Float32Array
            ? new Uint8Array(
                entry.embedding.buffer,
                entry.embedding.byteOffset,
                entry.embedding.byteLength,
              )
            : new Uint8Array(new Float32Array(entry.embedding).buffer);
        stmt.run(entry.chunkId, blob);
      }
    });
    transaction();
  }

  /**
   * Removes chunk embeddings by their IDs.
   * No-op when the vector store is unavailable.
   *
   * @param chunkIds Chunk identifiers to remove.
   */
  removeMany(chunkIds: readonly string[]): void {
    if (chunkIds.length === 0) {
      return;
    }

    const db = this.getDb();
    if (!db) {
      return;
    }

    const placeholders = chunkIds.map(() => "?").join(", ");
    db.run(
      `DELETE FROM vec_knowledge_chunks WHERE chunk_id IN (${placeholders})`,
      chunkIds as string[],
    );
  }

  /**
   * Finds the K nearest chunk embeddings to the given query vector.
   *
   * Uses sqlite-vec's ANN index for sub-linear search performance.
   * Returns an empty array when the vector store is unavailable.
   *
   * @param queryEmbedding Query embedding vector.
   * @param limit Maximum number of results.
   * @returns Ranked results ordered by ascending distance (most similar first).
   */
  search(
    queryEmbedding: Float32Array | readonly number[],
    limit: number,
  ): readonly VectorSearchResult[] {
    const db = this.getDb();
    if (!db) {
      return [];
    }

    const blob =
      queryEmbedding instanceof Float32Array
        ? new Uint8Array(
            queryEmbedding.buffer,
            queryEmbedding.byteOffset,
            queryEmbedding.byteLength,
          )
        : new Uint8Array(new Float32Array(queryEmbedding).buffer);

    const rows = db
      .query<{ chunk_id: string; distance: number }, [Uint8Array, number]>(
        `SELECT chunk_id, distance FROM vec_knowledge_chunks WHERE embedding MATCH ? ORDER BY distance LIMIT ?`,
      )
      .all(blob, limit);

    return rows.map((row) => ({
      chunkId: row.chunk_id,
      distance: row.distance,
    }));
  }

  /**
   * Returns the total number of indexed embeddings.
   * Returns 0 when the vector store is unavailable.
   *
   * @returns Embedding count.
   */
  count(): number {
    const db = this.getDb();
    if (!db) {
      return 0;
    }

    const row = db
      .query<{ count: number }, []>("SELECT count(*) as count FROM vec_knowledge_chunks")
      .get();
    return row?.count ?? 0;
  }

  /**
   * Disposes the database handle and releases resources.
   */
  dispose(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      logger.info("vector-store.disposed");
    }
  }
}

/**
 * Singleton vector store instance used by the knowledge-base service.
 */
export const vectorStore = new VectorStore();
