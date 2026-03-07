import { appConfig, type LocaleCode, normalizeLocale } from "../../config/environment.ts";
import { createLogger } from "../../lib/logger.ts";
import { prisma } from "../../shared/services/db.ts";
import { ProviderRegistry } from "./providers/provider-registry.ts";

const logger = createLogger("ai.knowledge-base");
let embeddingFallbackUntilMs = 0;
const embeddingFallbackCooldownMs = (): number => appConfig.ai.pipelineTimeoutMs * 4;

/**
 * Input payload for knowledge-document ingestion.
 */
export interface KnowledgeDocumentInput {
  /** Optional builder project scope for project-specific retrieval. */
  readonly projectId?: string;
  /** Human-readable document title. */
  readonly title: string;
  /** Source identifier such as a file path, URL, or note label. */
  readonly source: string;
  /** Raw plain-text body to chunk and embed. */
  readonly text: string;
  /** Locale used for retrieval and generation context. */
  readonly locale?: string;
}

/**
 * Persisted knowledge-document summary.
 */
export interface KnowledgeDocumentRecord {
  /** Stable persisted document id. */
  readonly id: string;
  /** Optional builder project scope. */
  readonly projectId: string | null;
  /** Human-readable document title. */
  readonly title: string;
  /** Source identifier. */
  readonly source: string;
  /** Normalized locale. */
  readonly locale: LocaleCode;
  /** Content hash for deduplication. */
  readonly contentHash: string;
  /** Number of persisted chunks. */
  readonly chunkCount: number;
  /** Creation time in epoch milliseconds. */
  readonly createdAtMs: number;
  /** Update time in epoch milliseconds. */
  readonly updatedAtMs: number;
}

/**
 * Ranked retrieval match from the knowledge base.
 */
export interface KnowledgeSearchMatch {
  /** Owning document id. */
  readonly documentId: string;
  /** Chunk id. */
  readonly chunkId: string;
  /** Document title. */
  readonly title: string;
  /** Source identifier. */
  readonly source: string;
  /** Locale of the matched document. */
  readonly locale: LocaleCode;
  /** Chunk ordinal within the document. */
  readonly ordinal: number;
  /** Retrieved text excerpt. */
  readonly text: string;
  /** Similarity score in the range -1..1. */
  readonly score: number;
}

/**
 * Retrieval-augmented assist result returned to API callers.
 */
export interface RetrievalAssistResult {
  /** Whether generation succeeded. */
  readonly ok: boolean;
  /** Retrieved support context. */
  readonly matches: readonly KnowledgeSearchMatch[];
  /** Generated response text when successful. */
  readonly text?: string;
  /** Model used for generation. */
  readonly model?: string;
  /** Generation duration in milliseconds. */
  readonly durationMs?: number;
  /** Error description when unsuccessful. */
  readonly error?: string;
  /** Whether the caller may retry. */
  readonly retryable?: boolean;
}

interface ChunkSeed {
  readonly ordinal: number;
  readonly text: string;
  readonly tokenEstimate: number;
}

interface EmbeddedChunkSeed extends ChunkSeed {
  readonly embedding: readonly number[];
}

const estimateTokenCount = (value: string): number =>
  Math.max(1, Math.ceil(value.trim().length / 4));

const trimNormalized = (value: string): string => value.replace(/\s+/gu, " ").trim();

const createContentHash = async (value: string): Promise<string> => {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (entry) => entry.toString(16).padStart(2, "0")).join(
    "",
  );
};

const splitKnowledgeText = (
  text: string,
  chunkSize: number,
  chunkOverlap: number,
): readonly ChunkSeed[] => {
  const normalized = text.replace(/\r\n/gu, "\n").trim();
  if (normalized.length === 0) {
    return [];
  }

  const chunks: ChunkSeed[] = [];
  let cursor = 0;
  let ordinal = 0;
  const minimumBoundaryDistance = Math.max(1, Math.floor(chunkSize * 0.5));

  while (cursor < normalized.length) {
    const maxEnd = Math.min(cursor + chunkSize, normalized.length);
    let sliceEnd = maxEnd;
    if (maxEnd < normalized.length) {
      let boundary = normalized.lastIndexOf("\n\n", maxEnd);
      if (boundary <= cursor + minimumBoundaryDistance) {
        boundary = normalized.lastIndexOf(". ", maxEnd);
      }
      if (boundary <= cursor + minimumBoundaryDistance) {
        boundary = normalized.lastIndexOf(" ", maxEnd);
      }

      if (boundary > cursor + minimumBoundaryDistance) {
        sliceEnd = boundary;
      }
    }

    const chunkText = trimNormalized(normalized.slice(cursor, sliceEnd));
    if (chunkText.length > 0) {
      chunks.push({
        ordinal,
        text: chunkText,
        tokenEstimate: estimateTokenCount(chunkText),
      });
      ordinal += 1;
    }

    if (sliceEnd >= normalized.length) {
      break;
    }

    cursor = Math.max(sliceEnd - chunkOverlap, cursor + 1);
  }

  return chunks;
};

const toEmbeddingArray = (embedding: Float32Array): readonly number[] =>
  Array.from(embedding, (entry) => Number(entry));

const createFallbackEmbedding = (text: string): Float32Array => {
  const dimension = appConfig.ai.ragHashDimension;
  const values = new Float32Array(dimension);
  const tokens = trimNormalized(text)
    .toLowerCase()
    .split(/[^a-z0-9\u4e00-\u9fff]+/u);

  for (const token of tokens) {
    if (token.length === 0) {
      continue;
    }

    let hash = 0;
    for (const character of token) {
      hash = (hash * 31 + (character.codePointAt(0) ?? 0)) >>> 0;
    }
    const slot = hash % dimension;
    values[slot] = (values[slot] ?? 0) + 1;
  }

  let magnitude = 0;
  for (const value of values) {
    magnitude += value * value;
  }

  if (magnitude === 0) {
    values[0] = 1;
    return values;
  }

  const normalizedMagnitude = Math.sqrt(magnitude);
  for (let index = 0; index < values.length; index += 1) {
    values[index] = (values[index] ?? 0) / normalizedMagnitude;
  }

  return values;
};

const parseEmbedding = (value: unknown): readonly number[] | null => {
  if (!Array.isArray(value)) {
    return null;
  }

  const normalized = value
    .filter((entry): entry is number => typeof entry === "number" && Number.isFinite(entry))
    .map((entry) => Number(entry));
  return normalized.length > 0 ? normalized : null;
};

const cosineSimilarity = (left: readonly number[], right: readonly number[]): number => {
  const length = Math.min(left.length, right.length);
  if (length === 0) {
    return -1;
  }

  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  for (let index = 0; index < length; index += 1) {
    const leftValue = left[index] ?? 0;
    const rightValue = right[index] ?? 0;
    dot += leftValue * rightValue;
    leftMagnitude += leftValue * leftValue;
    rightMagnitude += rightValue * rightValue;
  }

  if (leftMagnitude === 0 || rightMagnitude === 0) {
    return -1;
  }

  return dot / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude));
};

const resolveEmbedding = async (text: string): Promise<Float32Array> => {
  if (Date.now() < embeddingFallbackUntilMs) {
    logger.info("knowledge.embedding.fallback", {
      dimension: appConfig.ai.ragHashDimension,
      mode: "sticky",
    });
    return createFallbackEmbedding(text);
  }

  try {
    const registry = await ProviderRegistry.getInstance();
    const embedding = await registry.generateEmbedding(text);
    if (embedding) {
      return embedding;
    }
  } catch (error: unknown) {
    logger.warn("knowledge.embedding.provider.failed", { error: String(error) });
    embeddingFallbackUntilMs = Date.now() + embeddingFallbackCooldownMs();
  }

  logger.info("knowledge.embedding.fallback", {
    dimension: appConfig.ai.ragHashDimension,
    mode: "direct",
  });
  embeddingFallbackUntilMs = Date.now() + embeddingFallbackCooldownMs();
  return createFallbackEmbedding(text);
};

/**
 * Knowledge-base service for persisted RAG ingestion and retrieval.
 */
export class KnowledgeBaseService {
  /**
   * Stores one knowledge document by chunking, embedding, and persisting it transactionally.
   *
   * @param input Document ingestion payload.
   * @returns Persisted document summary.
   */
  async ingestDocument(input: KnowledgeDocumentInput): Promise<KnowledgeDocumentRecord> {
    const text = input.text.trim();
    if (text.length === 0) {
      throw new Error("Knowledge document text must not be empty.");
    }

    const locale = normalizeLocale(input.locale);
    const title = trimNormalized(input.title);
    const source = trimNormalized(input.source);
    const chunkSeeds = splitKnowledgeText(
      text,
      appConfig.ai.ragChunkSize,
      appConfig.ai.ragChunkOverlap,
    );

    if (chunkSeeds.length === 0) {
      throw new Error("Knowledge document produced no indexable chunks.");
    }

    const embeddedChunks: EmbeddedChunkSeed[] = [];
    for (const chunk of chunkSeeds) {
      const embedding = await resolveEmbedding(chunk.text);
      embeddedChunks.push({
        ...chunk,
        embedding: toEmbeddingArray(embedding),
      });
    }

    const contentHash = await createContentHash(`${locale}\n${title}\n${source}\n${text}`);
    const existing = await prisma.aiKnowledgeDocument.findFirst({
      where: {
        projectId: input.projectId ?? null,
        contentHash,
      },
      include: {
        chunks: {
          select: { id: true },
        },
      },
    });

    const persisted = existing
      ? await prisma.aiKnowledgeDocument.update({
          where: { id: existing.id },
          data: {
            title,
            source,
            locale,
            chunks: {
              deleteMany: {},
              createMany: {
                data: embeddedChunks.map((chunk) => ({
                  id: `${existing.id}:chunk:${chunk.ordinal}`,
                  ordinal: chunk.ordinal,
                  text: chunk.text,
                  embedding: JSON.parse(JSON.stringify(chunk.embedding)),
                  tokenEstimate: chunk.tokenEstimate,
                })),
              },
            },
          },
          include: {
            chunks: {
              select: { id: true },
            },
          },
        })
      : await prisma.aiKnowledgeDocument.create({
          data: {
            projectId: input.projectId ?? null,
            title,
            source,
            locale,
            contentHash,
            chunks: {
              createMany: {
                data: embeddedChunks.map((chunk) => ({
                  id: `${crypto.randomUUID()}:chunk:${chunk.ordinal}`,
                  ordinal: chunk.ordinal,
                  text: chunk.text,
                  embedding: JSON.parse(JSON.stringify(chunk.embedding)),
                  tokenEstimate: chunk.tokenEstimate,
                })),
              },
            },
          },
          include: {
            chunks: {
              select: { id: true },
            },
          },
        });

    logger.info("knowledge.document.ingested", {
      documentId: persisted.id,
      projectId: persisted.projectId,
      chunkCount: persisted.chunks.length,
      locale,
    });

    return {
      id: persisted.id,
      projectId: persisted.projectId,
      title: persisted.title,
      source: persisted.source,
      locale: normalizeLocale(persisted.locale),
      contentHash: persisted.contentHash,
      chunkCount: persisted.chunks.length,
      createdAtMs: persisted.createdAt.getTime(),
      updatedAtMs: persisted.updatedAt.getTime(),
    };
  }

  /**
   * Lists knowledge documents for optional project scope.
   *
   * @param projectId Optional project scope.
   * @returns Persisted document summaries sorted by update time.
   */
  async listDocuments(projectId?: string): Promise<readonly KnowledgeDocumentRecord[]> {
    const rows = await prisma.aiKnowledgeDocument.findMany({
      where: {
        ...(projectId ? { projectId } : {}),
      },
      include: {
        _count: {
          select: {
            chunks: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return rows.map((row) => ({
      id: row.id,
      projectId: row.projectId,
      title: row.title,
      source: row.source,
      locale: normalizeLocale(row.locale),
      contentHash: row.contentHash,
      chunkCount: row._count.chunks,
      createdAtMs: row.createdAt.getTime(),
      updatedAtMs: row.updatedAt.getTime(),
    }));
  }

  /**
   * Deletes one persisted knowledge document and all of its chunks.
   *
   * @param documentId Stable document id.
   * @param projectId Optional project scope guard.
   * @returns Whether a document was deleted.
   */
  async deleteDocument(documentId: string, projectId?: string): Promise<boolean> {
    const deleted = await prisma.aiKnowledgeDocument.deleteMany({
      where: {
        id: documentId,
        ...(projectId ? { projectId } : {}),
      },
    });

    return deleted.count > 0;
  }

  /**
   * Runs embeddings-backed semantic retrieval against the persisted knowledge base.
   *
   * @param query Search query.
   * @param options Optional project scope, locale, and limit overrides.
   * @returns Ranked retrieval matches.
   */
  async search(
    query: string,
    options: {
      readonly projectId?: string;
      readonly locale?: string;
      readonly limit?: number;
    } = {},
  ): Promise<readonly KnowledgeSearchMatch[]> {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length === 0) {
      return [];
    }

    const queryEmbedding = await resolveEmbedding(trimmedQuery);

    const targetLocale = options.locale ? normalizeLocale(options.locale) : undefined;
    const rows = await prisma.aiKnowledgeChunk.findMany({
      where: {
        document: {
          ...(options.projectId ? { projectId: options.projectId } : {}),
          ...(targetLocale ? { locale: targetLocale } : {}),
        },
      },
      include: {
        document: true,
      },
    });

    const ranked = rows
      .map((row) => {
        const embedding = parseEmbedding(row.embedding);
        if (!embedding) {
          return null;
        }

        return {
          documentId: row.documentId,
          chunkId: row.id,
          title: row.document.title,
          source: row.document.source,
          locale: normalizeLocale(row.document.locale),
          ordinal: row.ordinal,
          text: row.text,
          score: cosineSimilarity(Array.from(queryEmbedding), embedding),
        } satisfies KnowledgeSearchMatch;
      })
      .filter((match): match is KnowledgeSearchMatch => match !== null)
      .sort((left, right) => right.score - left.score)
      .slice(0, options.limit ?? appConfig.ai.ragSearchLimit);

    return ranked;
  }

  /**
   * Generates a retrieval-augmented response grounded in the persisted knowledge base.
   *
   * @param prompt User prompt.
   * @param options Optional project scope, locale, and retrieval limit overrides.
   * @returns Retrieval context plus generated answer or error details.
   */
  async assist(
    prompt: string,
    options: {
      readonly projectId?: string;
      readonly locale?: string;
      readonly limit?: number;
    } = {},
  ): Promise<RetrievalAssistResult> {
    const matches = await this.search(prompt, options);
    const registry = await ProviderRegistry.getInstance();
    const locale = normalizeLocale(options.locale);
    const systemPrompt = [
      "You are a grounded implementation assistant for the TEA game engine.",
      "Use the supplied retrieval context as the primary source of truth.",
      "If the retrieved context is insufficient, say so explicitly instead of inventing missing facts.",
      `Respond in locale ${locale}.`,
    ].join("\n");

    const contextBlock =
      matches.length > 0
        ? matches
            .map((match, index) => `[${index + 1}] ${match.title} (${match.source})\n${match.text}`)
            .join("\n\n")
        : "No retrieved knowledge matched the request.";

    const result = await registry.chat({
      systemPrompt,
      messages: [
        {
          role: "user",
          content: `Retrieved context:\n${contextBlock}\n\nRequest:\n${prompt}`,
        },
      ],
      temperature: 0.2,
    });

    if (!result.ok) {
      return {
        ok: false,
        matches,
        error: result.error,
        retryable: result.retryable,
      };
    }

    return {
      ok: true,
      matches,
      text: result.text,
      model: result.model,
      durationMs: result.durationMs,
    };
  }
}

/**
 * Singleton knowledge-base service used by API and builder flows.
 */
export const knowledgeBaseService = new KnowledgeBaseService();
