import type { Prisma } from "@prisma/client";
import type { LocaleCode } from "../../config/environment.ts";
import type {
  BuilderArtifactPatch,
  BuilderDialoguePayload,
  BuilderMutationResult,
  BuilderNpcPayload,
  BuilderScenePayload,
  SceneDefinition,
  SceneNpcDefinition,
} from "../../shared/contracts/game.ts";
import { prisma } from "../../shared/services/db.ts";
import { safeJsonParse } from "../../shared/utils/safe-json.ts";
import { gameTextByLocale } from "../game/data/game-text.ts";
import { gameScenes } from "../game/data/sprite-data.ts";

/**
 * Builder-side mutable assets for a single project.
 */
interface BuilderProjectSnapshot {
  /** Logical project identifier. */
  readonly id: string;
  /** Scene registry by stable scene id. */
  readonly scenes: Map<string, SceneDefinition>;
  /** Dialogue registry by locale -> key -> value. */
  readonly dialogues: Map<LocaleCode, Map<string, string>>;
  /** Project publish status. */
  readonly published: boolean;
  /** Creation owner marker for audit trail compatibility. */
  readonly createdBy: string;
  /** Last update owner marker. */
  readonly updatedBy: string;
  /** Immutable source provenance marker. */
  readonly source: string;
  /** Stable project checksum. */
  readonly checksum: string;
  /** Last mutation version. */
  readonly version: number;
  /** Optional resume timestamp marker (ms since epoch). */
  readonly lastUpdatedAtMs: number;
  /** Latest immutable release version published from this project. */
  readonly latestReleaseVersion: number;
  /** Currently published release version, if any. */
  readonly publishedReleaseVersion: number | null;
}

/**
 * Result wrapper for write operations.
 */
export interface BuilderMutation<T> {
  /** Mutation result for envelope-style responses. */
  readonly result: BuilderMutationResult;
  /** The latest persisted payload after applying mutation. */
  readonly payload: T;
  /** Stable checksum for idempotent checks in UI or APIs. */
  readonly checksum: string;
}

/**
 * Per-operation preview for AI patch planning.
 */
export interface BuilderPatchPreviewOperation {
  /** Proposed patch operation. */
  readonly operation: BuilderArtifactPatch;
  /** Whether this operation can be applied safely. */
  readonly valid: boolean;
  /** Human-readable validation or preview hint. */
  readonly message: string;
  /** Existing value at the target location. */
  readonly before?: string;
  /** Value after applying this operation. */
  readonly after?: string;
}

/**
 * Structured preview for an AI patch plan.
 */
export interface BuilderPatchPreview {
  /** Target project identifier. */
  readonly projectId: string;
  /** Current project version. */
  readonly version: number;
  /** Current project checksum. */
  readonly checksum: string;
  /** Ordered operation preview list. */
  readonly operations: readonly BuilderPatchPreviewOperation[];
}

/**
 * Result envelope for transactional AI patch apply.
 */
export interface BuilderPatchApplyResult {
  /** Target project identifier. */
  readonly projectId: string;
  /** Updated project version after apply. */
  readonly version: number;
  /** Updated project checksum after apply. */
  readonly checksum: string;
  /** Number of operations applied. */
  readonly applied: number;
  /** Operation execution report. */
  readonly operations: readonly BuilderPatchPreviewOperation[];
}

/**
 * Service contract for builder persistence operations.
 */
export interface BuilderService {
  /** Creates a fresh project from game baseline data. */
  createProject(projectId: string): Promise<BuilderProjectSnapshot | null>;
  /** Returns one builder project snapshot by id. */
  getProject(projectId: string): Promise<BuilderProjectSnapshot | null>;
  /** Returns one existing project snapshot without implicitly creating it. */
  peekProject(projectId: string): Promise<BuilderProjectSnapshot | null>;
  /** Returns one published release snapshot without implicitly creating it. */
  getPublishedProject(projectId: string): Promise<BuilderProjectSnapshot | null>;
  /** Persists any scene changes for a specific project. */
  saveScene(
    projectId: string,
    payload: BuilderScenePayload,
  ): Promise<BuilderMutation<SceneDefinition> | null>;
  /** Removes a scene from a project. */
  removeScene(projectId: string, sceneId: string): Promise<BuilderMutation<null> | null>;
  /** Persists an NPC payload into a scene. */
  saveNpc(
    projectId: string,
    payload: BuilderNpcPayload,
  ): Promise<BuilderMutation<SceneNpcDefinition | null> | null>;
  /** Removes an NPC from a project. */
  removeNpc(
    projectId: string,
    sceneId: string,
    npcId: string,
  ): Promise<BuilderMutation<SceneNpcDefinition[]> | null>;
  /** Persists dialogue text for locale-scoped catalog. */
  saveDialogue(
    projectId: string,
    payload: BuilderDialoguePayload,
  ): Promise<BuilderMutation<string> | null>;
  /** Removes dialogue key for locale-scoped catalog. */
  removeDialogue(
    projectId: string,
    locale: LocaleCode,
    key: string,
  ): Promise<BuilderMutation<string | null> | null>;
  /** Publishes or unpublishes a project. */
  publishProject(projectId: string, published: boolean): Promise<BuilderProjectSnapshot | null>;
  /** Finds a scene by project and scene id. */
  getScene(projectId: string, sceneId: string): Promise<SceneDefinition | null>;
  /** Finds an NPC from any project scene by character key. */
  findNpc(projectId: string, npcId: string): Promise<SceneNpcDefinition | null>;
  /** Lists scenes in canonical project order. */
  listScenes(projectId: string): Promise<readonly SceneDefinition[]>;
  /** Returns locale dictionary for one catalog. */
  getDialogues(projectId: string, locale: LocaleCode): Promise<Record<string, string>>;
  /** Builds a deterministic preview for proposed AI patch operations. */
  previewArtifactPatch(
    projectId: string,
    operations: readonly BuilderArtifactPatch[],
  ): Promise<BuilderPatchPreview | null>;
  /** Applies AI patch operations transactionally with optional version precondition. */
  applyArtifactPatch(
    projectId: string,
    operations: readonly BuilderArtifactPatch[],
    expectedVersion?: number,
  ): Promise<BuilderPatchApplyResult | null>;
}

interface BuilderProjectState {
  readonly scenes: Record<string, SceneDefinition>;
  readonly dialogues: Record<LocaleCode, Record<string, string>>;
}

type BuilderProjectRow = {
  readonly id: string;
  readonly state: Prisma.JsonValue;
  readonly checksum: string;
  readonly version: number;
  readonly createdBy: string;
  readonly updatedBy: string;
  readonly source: string;
  readonly latestReleaseVersion: number;
  readonly publishedReleaseVersion: number | null;
  readonly updatedAt: Date;
};

const DEFAULT_PROJECT_ID = "default";
const SUPPORTED_LOCALES = ["en-US", "zh-CN"] as const satisfies readonly LocaleCode[];

/**
 * Returns a deterministic checksum for JSON payloads.
 */
const checksumOf = (value: unknown): string => {
  const payload = JSON.stringify(value);
  let hash = 0x811c9dc5;
  for (let index = 0; index < payload.length; index += 1) {
    hash ^= payload.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `checksum-${hash.toString(16).padStart(8, "0")}`;
};

/**
 * Type-safe record narrowing helper.
 */
const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

/**
 * Creates baseline builder state from the canonical game assets.
 */
const createBaselineState = (): BuilderProjectState => {
  const scenes = Object.fromEntries(
    Object.entries(gameScenes).map(([sceneId, scene]) => [sceneId, structuredClone(scene)]),
  ) as Record<string, SceneDefinition>;
  const dialogues: BuilderProjectState["dialogues"] = {
    "en-US": Object.fromEntries(Object.entries(gameTextByLocale["en-US"].npcs)),
    "zh-CN": Object.fromEntries(Object.entries(gameTextByLocale["zh-CN"].npcs)),
  };

  return { scenes, dialogues };
};

/**
 * Converts BuilderProjectState to Prisma JSON payload.
 */
const toInputState = (state: BuilderProjectState): Prisma.InputJsonValue =>
  JSON.parse(JSON.stringify(state)) as Prisma.InputJsonValue;

/**
 * Parses persisted JSON into normalized BuilderProjectState.
 */
const parseProjectState = (state: Prisma.JsonValue): BuilderProjectState => {
  const parsed = safeJsonParse<unknown>(JSON.stringify(state), {});
  const record = asRecord(parsed);
  const scenesRecord = asRecord(record.scenes);
  const dialoguesRecord = asRecord(record.dialogues);

  const scenes = Object.fromEntries(
    Object.entries(scenesRecord)
      .filter((entry): entry is [string, SceneDefinition] => entry[0].length > 0)
      .map(([sceneId, scene]) => [sceneId, structuredClone(scene as SceneDefinition)]),
  ) as Record<string, SceneDefinition>;

  const dialogues: BuilderProjectState["dialogues"] = {
    "en-US": {},
    "zh-CN": {},
  };
  for (const locale of SUPPORTED_LOCALES) {
    const localeCatalog = asRecord(dialoguesRecord[locale]);
    dialogues[locale] = Object.fromEntries(
      Object.entries(localeCatalog).filter(
        (entry): entry is [string, string] => entry[0].length > 0 && typeof entry[1] === "string",
      ),
    );
  }

  if (Object.keys(scenes).length === 0) {
    const baseline = createBaselineState();
    return baseline;
  }

  return { scenes, dialogues };
};

/**
 * Converts normalized state to map-based snapshot payload.
 */
const toProjectSnapshot = (
  row: BuilderProjectRow,
  state: BuilderProjectState,
  published: boolean,
): BuilderProjectSnapshot => ({
  id: row.id,
  scenes: new Map(
    Object.entries(state.scenes).map(([sceneId, scene]) => [sceneId, structuredClone(scene)]),
  ),
  dialogues: new Map(
    SUPPORTED_LOCALES.map((locale) => [locale, new Map(Object.entries(state.dialogues[locale]))]),
  ),
  published,
  createdBy: row.createdBy,
  updatedBy: row.updatedBy,
  source: row.source,
  checksum: row.checksum,
  version: row.version,
  lastUpdatedAtMs: row.updatedAt.getTime(),
  latestReleaseVersion: row.latestReleaseVersion,
  publishedReleaseVersion: row.publishedReleaseVersion,
});

/**
 * Converts optional locale strings to canonical supported locales.
 */
const normalizeLocale = (value: string | undefined): LocaleCode =>
  value === "zh-CN" || value === "en-US" ? value : "en-US";

/**
 * Clones scene definitions while preserving compile-time shape.
 */
const cloneScene = (scene: SceneDefinition): SceneDefinition =>
  structuredClone(scene) as SceneDefinition;

/**
 * Converts a scene mutation into a stable mutation result payload.
 */
const sceneMutationResult = (
  projectId: string,
  sceneId: string,
  action: BuilderMutationResult["action"],
): BuilderMutationResult => ({
  projectId,
  resourceType: "scene",
  resourceId: sceneId,
  action,
});

/**
 * Converts an NPC mutation into a stable mutation result payload.
 */
const npcMutationResult = (
  projectId: string,
  npcId: string,
  action: BuilderMutationResult["action"],
): BuilderMutationResult => ({
  projectId,
  resourceType: "npc",
  resourceId: npcId,
  action,
});

/**
 * Converts a dialogue mutation into a stable mutation result payload.
 */
const dialogueMutationResult = (
  projectId: string,
  key: string,
  action: BuilderMutationResult["action"],
): BuilderMutationResult => ({
  projectId,
  resourceType: "dialogue",
  resourceId: key,
  action,
});

/**
 * Parses JSON-like AI patch payload values into runtime values.
 */
const parsePatchValue = (value: string): unknown => safeJsonParse<unknown>(value, value);

type PatchTarget =
  | {
      readonly kind: "dialogue";
      readonly locale: LocaleCode;
      readonly key: string;
    }
  | {
      readonly kind: "scene";
      readonly sceneId: string;
    };

/**
 * Resolves a limited patch target from a JSON-pointer-like path.
 */
const parsePatchTarget = (path: string): PatchTarget | null => {
  const parts = path
    .split("/")
    .filter((part) => part.length > 0)
    .map((part) => decodeURIComponent(part));

  if (parts[0] === "dialogues" && parts.length >= 3) {
    const locale = normalizeLocale(parts[1]);
    const key = parts.slice(2).join("/");
    if (key.length === 0) {
      return null;
    }

    return { kind: "dialogue", locale, key };
  }

  if (parts[0] === "scenes" && parts.length === 2 && parts[1]) {
    return { kind: "scene", sceneId: parts[1] };
  }

  return null;
};

/**
 * Prisma-backed builder store with immutable release snapshots.
 */
class PrismaBuilderService implements BuilderService {
  private readonly initPromise = this.ensureDefaultProject();

  private async ensureDefaultProject(): Promise<void> {
    const existing = await prisma.builderProject.findUnique({
      where: { id: DEFAULT_PROJECT_ID },
      select: { id: true },
    });
    if (existing) {
      return;
    }

    const baseline = createBaselineState();
    await prisma.builderProject.create({
      data: {
        id: DEFAULT_PROJECT_ID,
        state: toInputState(baseline),
        checksum: checksumOf(baseline),
      },
    });
  }

  private async readProjectRow(projectId: string): Promise<BuilderProjectRow | null> {
    await this.initPromise;
    if (projectId.trim().length === 0) {
      return null;
    }

    return prisma.builderProject.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        state: true,
        checksum: true,
        version: true,
        createdBy: true,
        updatedBy: true,
        source: true,
        latestReleaseVersion: true,
        publishedReleaseVersion: true,
        updatedAt: true,
      },
    });
  }

  private async writeProjectState(
    row: BuilderProjectRow,
    state: BuilderProjectState,
    updatedBy: string,
  ): Promise<BuilderProjectRow | null> {
    const checksum = checksumOf(state);
    const updated = await prisma.builderProject.updateMany({
      where: { id: row.id, version: row.version },
      data: {
        state: toInputState(state),
        checksum,
        updatedBy,
        version: {
          increment: 1,
        },
      },
    });
    if (updated.count === 0) {
      return null;
    }

    return this.readProjectRow(row.id);
  }

  public async createProject(projectId: string): Promise<BuilderProjectSnapshot | null> {
    await this.initPromise;
    const sanitized = projectId.trim();
    if (sanitized.length === 0) {
      return null;
    }

    const existing = await this.readProjectRow(sanitized);
    if (existing) {
      return toProjectSnapshot(
        existing,
        parseProjectState(existing.state),
        existing.publishedReleaseVersion !== null,
      );
    }

    const baseline = createBaselineState();
    const created = await prisma.builderProject.create({
      data: {
        id: sanitized,
        state: toInputState(baseline),
        checksum: checksumOf(baseline),
      },
      select: {
        id: true,
        state: true,
        checksum: true,
        version: true,
        createdBy: true,
        updatedBy: true,
        source: true,
        latestReleaseVersion: true,
        publishedReleaseVersion: true,
        updatedAt: true,
      },
    });

    return toProjectSnapshot(created, baseline, false);
  }

  public async getProject(projectId: string): Promise<BuilderProjectSnapshot | null> {
    const row = await this.readProjectRow(projectId);
    if (!row) {
      return null;
    }

    return toProjectSnapshot(
      row,
      parseProjectState(row.state),
      row.publishedReleaseVersion !== null,
    );
  }

  public async peekProject(projectId: string): Promise<BuilderProjectSnapshot | null> {
    return this.getProject(projectId);
  }

  public async getPublishedProject(projectId: string): Promise<BuilderProjectSnapshot | null> {
    const row = await this.readProjectRow(projectId);
    if (!row || row.publishedReleaseVersion === null) {
      return null;
    }

    const release = await prisma.builderProjectRelease.findUnique({
      where: {
        projectId_releaseVersion: {
          projectId: row.id,
          releaseVersion: row.publishedReleaseVersion,
        },
      },
      select: {
        state: true,
      },
    });
    if (!release) {
      return null;
    }

    const publishedState = parseProjectState(release.state);
    return toProjectSnapshot(row, publishedState, true);
  }

  public async saveScene(
    projectId: string,
    payload: BuilderScenePayload,
  ): Promise<BuilderMutation<SceneDefinition> | null> {
    const row = await this.readProjectRow(projectId);
    if (!row) {
      return null;
    }

    const state = parseProjectState(row.state);
    const exists = Object.hasOwn(state.scenes, payload.id);
    state.scenes[payload.id] = cloneScene(payload.scene);

    const saved = await this.writeProjectState(row, state, "builder-editor");
    if (!saved) {
      return null;
    }

    return {
      result: sceneMutationResult(projectId, payload.id, exists ? "updated" : "created"),
      payload: cloneScene(state.scenes[payload.id] as SceneDefinition),
      checksum: saved.checksum,
    };
  }

  public async removeScene(
    projectId: string,
    sceneId: string,
  ): Promise<BuilderMutation<null> | null> {
    const row = await this.readProjectRow(projectId);
    if (!row) {
      return null;
    }

    const state = parseProjectState(row.state);
    if (!Object.hasOwn(state.scenes, sceneId)) {
      return null;
    }
    delete state.scenes[sceneId];

    const saved = await this.writeProjectState(row, state, "builder-editor");
    if (!saved) {
      return null;
    }

    return {
      result: sceneMutationResult(projectId, sceneId, "deleted"),
      payload: null,
      checksum: saved.checksum,
    };
  }

  public async saveNpc(
    projectId: string,
    payload: BuilderNpcPayload,
  ): Promise<BuilderMutation<SceneNpcDefinition | null> | null> {
    const row = await this.readProjectRow(projectId);
    if (!row) {
      return null;
    }

    const state = parseProjectState(row.state);
    const scene = state.scenes[payload.sceneId];
    if (!scene) {
      return null;
    }

    const existingIndex = scene.npcs.findIndex(
      (candidate) => candidate.characterKey === payload.npc.characterKey,
    );
    const nextNpc = structuredClone(payload.npc) as SceneNpcDefinition;
    const nextNpcs = [...scene.npcs];
    if (existingIndex === -1) {
      nextNpcs.push(nextNpc);
    } else {
      nextNpcs[existingIndex] = nextNpc;
    }

    state.scenes[payload.sceneId] = {
      ...scene,
      npcs: nextNpcs,
    };

    const saved = await this.writeProjectState(row, state, "builder-editor");
    if (!saved) {
      return null;
    }

    return {
      result: npcMutationResult(
        projectId,
        payload.npc.characterKey,
        existingIndex === -1 ? "created" : "updated",
      ),
      payload: nextNpc,
      checksum: saved.checksum,
    };
  }

  public async removeNpc(
    projectId: string,
    sceneId: string,
    npcId: string,
  ): Promise<BuilderMutation<SceneNpcDefinition[]> | null> {
    const row = await this.readProjectRow(projectId);
    if (!row) {
      return null;
    }

    const state = parseProjectState(row.state);
    const scene = state.scenes[sceneId];
    if (!scene) {
      return null;
    }

    const nextNpcs = scene.npcs.filter((candidate) => candidate.characterKey !== npcId);
    if (nextNpcs.length === scene.npcs.length) {
      return null;
    }

    state.scenes[sceneId] = {
      ...scene,
      npcs: nextNpcs,
    };

    const saved = await this.writeProjectState(row, state, "builder-editor");
    if (!saved) {
      return null;
    }

    return {
      result: npcMutationResult(projectId, npcId, "deleted"),
      payload: structuredClone(nextNpcs) as SceneNpcDefinition[],
      checksum: saved.checksum,
    };
  }

  public async saveDialogue(
    projectId: string,
    payload: BuilderDialoguePayload,
  ): Promise<BuilderMutation<string> | null> {
    const row = await this.readProjectRow(projectId);
    if (!row) {
      return null;
    }

    const state = parseProjectState(row.state);
    const locale = normalizeLocale(payload.locale);
    const catalog = state.dialogues[locale];
    const action: BuilderMutationResult["action"] = Object.hasOwn(catalog, payload.key)
      ? "updated"
      : "created";
    catalog[payload.key] = payload.text;

    const saved = await this.writeProjectState(row, state, "builder-editor");
    if (!saved) {
      return null;
    }

    return {
      result: dialogueMutationResult(projectId, payload.key, action),
      payload: payload.text,
      checksum: saved.checksum,
    };
  }

  public async removeDialogue(
    projectId: string,
    locale: LocaleCode,
    key: string,
  ): Promise<BuilderMutation<string | null> | null> {
    const row = await this.readProjectRow(projectId);
    if (!row) {
      return null;
    }

    const state = parseProjectState(row.state);
    const catalog = state.dialogues[locale];
    if (!Object.hasOwn(catalog, key)) {
      return null;
    }

    delete catalog[key];
    const saved = await this.writeProjectState(row, state, "builder-editor");
    if (!saved) {
      return null;
    }

    return {
      result: dialogueMutationResult(projectId, key, "deleted"),
      payload: null,
      checksum: saved.checksum,
    };
  }

  public async publishProject(
    projectId: string,
    published: boolean,
  ): Promise<BuilderProjectSnapshot | null> {
    await this.initPromise;
    const sanitized = projectId.trim();
    if (sanitized.length === 0) {
      return null;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const row = await tx.builderProject.findUnique({
        where: { id: sanitized },
      });
      if (!row) {
        return null;
      }

      if (published) {
        const nextReleaseVersion = row.latestReleaseVersion + 1;
        await tx.builderProjectRelease.create({
          data: {
            projectId: row.id,
            releaseVersion: nextReleaseVersion,
            checksum: row.checksum,
            state: JSON.parse(JSON.stringify(row.state ?? {})) as Prisma.InputJsonValue,
          },
        });

        await tx.builderProject.update({
          where: { id: row.id },
          data: {
            latestReleaseVersion: nextReleaseVersion,
            publishedReleaseVersion: nextReleaseVersion,
            updatedBy: "builder-publish",
            version: {
              increment: 1,
            },
          },
        });
      } else {
        await tx.builderProject.update({
          where: { id: row.id },
          data: {
            publishedReleaseVersion: null,
            updatedBy: "builder-publish",
            version: {
              increment: 1,
            },
          },
        });
      }

      return tx.builderProject.findUnique({
        where: { id: row.id },
        select: {
          id: true,
          state: true,
          checksum: true,
          version: true,
          createdBy: true,
          updatedBy: true,
          source: true,
          latestReleaseVersion: true,
          publishedReleaseVersion: true,
          updatedAt: true,
        },
      });
    });
    if (!updated) {
      return null;
    }

    return toProjectSnapshot(updated, parseProjectState(updated.state), published);
  }

  public async getScene(projectId: string, sceneId: string): Promise<SceneDefinition | null> {
    const row = await this.readProjectRow(projectId);
    if (!row) {
      return null;
    }

    const scene = parseProjectState(row.state).scenes[sceneId];
    return scene ? cloneScene(scene) : null;
  }

  public async findNpc(projectId: string, npcId: string): Promise<SceneNpcDefinition | null> {
    const row = await this.readProjectRow(projectId);
    if (!row) {
      return null;
    }

    const state = parseProjectState(row.state);
    for (const scene of Object.values(state.scenes)) {
      const npc = scene.npcs.find((candidate) => candidate.characterKey === npcId);
      if (npc) {
        return structuredClone(npc) as SceneNpcDefinition;
      }
    }

    return null;
  }

  public async listScenes(projectId: string): Promise<readonly SceneDefinition[]> {
    const row = await this.readProjectRow(projectId);
    if (!row) {
      return [];
    }

    return Object.values(parseProjectState(row.state).scenes).map((scene) => cloneScene(scene));
  }

  public async getDialogues(
    projectId: string,
    locale: LocaleCode,
  ): Promise<Record<string, string>> {
    const row = await this.readProjectRow(projectId);
    if (!row) {
      return {};
    }

    const state = parseProjectState(row.state);
    return { ...(state.dialogues[locale] ?? state.dialogues["en-US"]) };
  }

  public async previewArtifactPatch(
    projectId: string,
    operations: readonly BuilderArtifactPatch[],
  ): Promise<BuilderPatchPreview | null> {
    const row = await this.readProjectRow(projectId);
    if (!row) {
      return null;
    }

    const state = parseProjectState(row.state);
    const previewState = structuredClone(state) as BuilderProjectState;
    const reports: BuilderPatchPreviewOperation[] = [];

    for (const operation of operations) {
      const target = parsePatchTarget(operation.path);
      if (!target) {
        reports.push({
          operation,
          valid: false,
          message: "unsupported-path",
        });
        continue;
      }

      if (target.kind === "dialogue") {
        const catalog = previewState.dialogues[target.locale];
        const before = catalog[target.key];
        if (operation.op === "remove") {
          delete catalog[target.key];
          reports.push({
            operation,
            valid: true,
            message: "ok",
            before,
          });
          continue;
        }

        const nextValue = parsePatchValue(operation.value);
        const text = typeof nextValue === "string" ? nextValue : JSON.stringify(nextValue);
        catalog[target.key] = text;
        reports.push({
          operation,
          valid: true,
          message: "ok",
          before,
          after: text,
        });
        continue;
      }

      const beforeScene = previewState.scenes[target.sceneId];
      if (operation.op === "remove") {
        delete previewState.scenes[target.sceneId];
        reports.push({
          operation,
          valid: true,
          message: "ok",
          before: beforeScene ? JSON.stringify(beforeScene) : undefined,
        });
        continue;
      }

      const parsed = parsePatchValue(operation.value);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        reports.push({
          operation,
          valid: false,
          message: "invalid-scene-payload",
          before: beforeScene ? JSON.stringify(beforeScene) : undefined,
        });
        continue;
      }

      const nextScene = {
        ...(parsed as SceneDefinition),
        id: target.sceneId,
      } as SceneDefinition;
      previewState.scenes[target.sceneId] = structuredClone(nextScene);
      reports.push({
        operation,
        valid: true,
        message: "ok",
        before: beforeScene ? JSON.stringify(beforeScene) : undefined,
        after: JSON.stringify(nextScene),
      });
    }

    return {
      projectId: row.id,
      version: row.version,
      checksum: row.checksum,
      operations: reports,
    };
  }

  public async applyArtifactPatch(
    projectId: string,
    operations: readonly BuilderArtifactPatch[],
    expectedVersion?: number,
  ): Promise<BuilderPatchApplyResult | null> {
    const row = await this.readProjectRow(projectId);
    if (!row) {
      return null;
    }
    if (typeof expectedVersion === "number" && expectedVersion !== row.version) {
      return null;
    }

    const preview = await this.previewArtifactPatch(projectId, operations);
    if (!preview) {
      return null;
    }

    if (preview.operations.some((operation) => !operation.valid)) {
      return {
        projectId: row.id,
        version: row.version,
        checksum: row.checksum,
        applied: 0,
        operations: preview.operations,
      };
    }

    const nextState = parseProjectState(row.state);
    for (const operation of operations) {
      const target = parsePatchTarget(operation.path);
      if (!target) {
        continue;
      }

      if (target.kind === "dialogue") {
        if (operation.op === "remove") {
          delete nextState.dialogues[target.locale][target.key];
          continue;
        }

        const parsed = parsePatchValue(operation.value);
        nextState.dialogues[target.locale][target.key] =
          typeof parsed === "string" ? parsed : JSON.stringify(parsed);
        continue;
      }

      if (operation.op === "remove") {
        delete nextState.scenes[target.sceneId];
        continue;
      }

      const parsed = parsePatchValue(operation.value);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        continue;
      }

      nextState.scenes[target.sceneId] = {
        ...(parsed as SceneDefinition),
        id: target.sceneId,
      };
    }

    const saved = await this.writeProjectState(row, nextState, "builder-ai");
    if (!saved) {
      return null;
    }

    return {
      projectId: saved.id,
      version: saved.version,
      checksum: saved.checksum,
      applied: operations.length,
      operations: preview.operations,
    };
  }
}

const projects = new PrismaBuilderService();

/**
 * Shared builder service facade used by builder views and API routes.
 */
export const createBuilderService = (): BuilderService => projects;

/** Shared singleton for builder operations. */
export const builderService = createBuilderService();

/** Shared default project identifier for dashboard and API defaults. */
export const defaultBuilderProjectId = DEFAULT_PROJECT_ID;
