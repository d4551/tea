import type { LocaleCode } from "../../config/environment.ts";
import type {
  BuilderDialoguePayload,
  BuilderMutationResult,
  BuilderNpcPayload,
  BuilderScenePayload,
  SceneDefinition,
  SceneNpcDefinition,
} from "../../shared/contracts/game.ts";
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
 * Service contract for builder persistence operations.
 */
export interface BuilderService {
  /** Creates a fresh in-memory project from game baseline data. */
  createProject(projectId: string): Promise<BuilderProjectSnapshot | null>;
  /** Returns one builder project snapshot by id. */
  getProject(projectId: string): Promise<BuilderProjectSnapshot | null>;
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
}

interface PersistedProjectRecord {
  readonly id: string;
  readonly scenes: Record<string, SceneDefinition>;
  readonly dialogues: Partial<Record<string, Record<string, string>>>;
  readonly published: boolean;
  readonly createdBy: string;
  readonly updatedBy: string;
  readonly source: string;
  readonly version: number;
  readonly checksum: string;
  readonly lastUpdatedAtMs: number;
}

interface PersistedBuilderStore {
  readonly schemaVersion: number;
  readonly createdAtMs: number;
  readonly updatedAtMs: number;
  readonly projects: readonly PersistedProjectRecord[];
}

interface BuilderProjectStore {
  id: string;
  scenes: Map<string, SceneDefinition>;
  dialogues: Map<LocaleCode, Map<string, string>>;
  published: boolean;
  createdBy: string;
  updatedBy: string;
  source: string;
  version: number;
  checksum: string;
  lastUpdatedAtMs: number;
}

const schemaVersion = 1;
const defaultStatePath = ".lotfk-builder-projects.json";
const persistencePath = Bun.env.BUILDER_PROJECT_STATE_PATH ?? defaultStatePath;

/**
 * Returns a deterministic checksum for JSON payloads.
 */
const checksumOf = (value: unknown): string => {
  const payload = JSON.stringify(value);
  let hash = 0x811c9dc5;
  for (let i = 0; i < payload.length; i += 1) {
    hash ^= payload.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `checksum-${hash.toString(16).padStart(8, "0")}`;
};

/**
 * Resolves stable snapshot rows from mutable maps.
 */
const toSnapshot = (mutable: {
  readonly id: string;
  readonly scenes: Map<string, SceneDefinition>;
  readonly dialogues: Map<LocaleCode, Map<string, string>>;
  readonly published: boolean;
  readonly createdBy: string;
  readonly updatedBy: string;
  readonly source: string;
  readonly version: number;
  readonly lastUpdatedAtMs: number;
  readonly checksum: string;
}): BuilderProjectSnapshot => ({
  id: mutable.id,
  scenes: new Map(mutable.scenes),
  dialogues: new Map(mutable.dialogues),
  published: mutable.published,
  createdBy: mutable.createdBy,
  updatedBy: mutable.updatedBy,
  source: mutable.source,
  version: mutable.version,
  lastUpdatedAtMs: mutable.lastUpdatedAtMs,
  checksum: mutable.checksum,
});

/**
 * Converts optional locale strings to canonical supported locales.
 */
const normalizeLocale = (value: string | undefined): LocaleCode => {
  if (value === "zh-CN" || value === "en-US") return value;
  return "en-US";
};

/**
 * Parses persisted locale dictionaries while allowing loose shape.
 */
const toLocaleDictionary = (input: unknown): Map<LocaleCode, Map<string, string>> => {
  const output = new Map<LocaleCode, Map<string, string>>();

  if (input && typeof input === "object") {
    for (const [localeKey, catalogValue] of Object.entries(input as Record<string, unknown>)) {
      if (localeKey !== "en-US" && localeKey !== "zh-CN") {
        continue;
      }
      if (catalogValue && typeof catalogValue === "object") {
        const catalog = catalogValue as Record<string, unknown>;
        const entries: [string, string][] = [];
        for (const [lineKey, lineValue] of Object.entries(catalog)) {
          if (typeof lineValue === "string" && lineKey.length > 0) {
            entries.push([lineKey, lineValue]);
          }
        }
        output.set(localeKey, new Map(entries));
      }
    }
  }

  if (output.size === 0) {
    output.set("en-US", new Map(Object.entries(gameTextByLocale["en-US"].npcs)));
    output.set("zh-CN", new Map(Object.entries(gameTextByLocale["zh-CN"].npcs)));
  }

  return output;
};

/**
 * Parses persisted scenes while preserving order as map keys.
 */
const toScenesMap = (input: unknown): Map<string, SceneDefinition> => {
  if (input && typeof input === "object") {
    const entries = Object.entries(input as Record<string, SceneDefinition>);
    return new Map(
      entries.filter((entry): entry is [string, SceneDefinition] => entry[0].length > 0),
    );
  }

  return new Map<string, SceneDefinition>();
};

/**
 * Creates a new project snapshot prefilled from baseline game definitions.
 */
const createProjectFromBaseline = (projectId: string): BuilderProjectSnapshot => {
  const scenes = new Map<string, SceneDefinition>(
    Object.entries(gameScenes).map(([id, scene]) => [id, structuredClone(scene)]),
  );
  const dialogues = new Map<LocaleCode, Map<string, string>>();
  for (const [locale, catalog] of Object.entries(gameTextByLocale) as Array<
    [LocaleCode, (typeof gameTextByLocale)[LocaleCode]]
  >) {
    dialogues.set(locale, new Map<string, string>(Object.entries(catalog.npcs)));
  }

  const nowMs = Date.now();
  const snapshotShape = {
    id: projectId,
    scenes,
    dialogues,
    published: false,
    createdBy: "system",
    updatedBy: "system",
    source: "builder-service-seed",
    version: 1,
    lastUpdatedAtMs: nowMs,
  } satisfies {
    id: string;
    scenes: Map<string, SceneDefinition>;
    dialogues: Map<LocaleCode, Map<string, string>>;
    published: boolean;
    createdBy: string;
    updatedBy: string;
    source: string;
    version: number;
    lastUpdatedAtMs: number;
  };

  return {
    ...snapshotShape,
    checksum: checksumOf(Array.from(scenes)),
  };
};

/**
 * Clones scene definitions while preserving compile-time shape.
 */
const cloneScene = (scene: SceneDefinition): SceneDefinition =>
  structuredClone(scene) as SceneDefinition;

/**
 * Clones mutable scene and npc list.
 */
const withNpcList = (
  scene: SceneDefinition,
  npcs: readonly SceneNpcDefinition[],
): SceneDefinition => ({
  ...cloneScene(scene),
  npcs: structuredClone(npcs),
});

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
 * Serializes a mutable project to JSON-friendly storage shape.
 */
const projectToPersisted = (project: BuilderProjectStore): PersistedProjectRecord => ({
  id: project.id,
  scenes: Object.fromEntries(
    Array.from(project.scenes.entries()).map(([key, value]) => [key, value]),
  ),
  dialogues: Object.fromEntries(
    Array.from(project.dialogues.entries()).map(([locale, catalog]) => [
      locale,
      Object.fromEntries(Array.from(catalog.entries())),
    ]),
  ),
  published: project.published,
  createdBy: project.createdBy,
  updatedBy: project.updatedBy,
  source: project.source,
  version: project.version,
  checksum: project.checksum,
  lastUpdatedAtMs: project.lastUpdatedAtMs,
});

/**
 * Rehydrates a project from persisted storage.
 */
const persistedToProject = (project: PersistedProjectRecord): BuilderProjectStore => {
  const scenes = toScenesMap(project.scenes);
  const dialogues = toLocaleDictionary(project.dialogues);
  const nowMs = Date.now();

  return {
    id: project.id,
    scenes,
    dialogues,
    published: Boolean(project.published),
    createdBy: project.createdBy || "system",
    updatedBy: project.updatedBy || "system",
    source: project.source || "builder-service-seed",
    version: Number.isFinite(project.version) ? project.version : 1,
    checksum: project.checksum || checksumOf(Array.from(scenes.values())),
    lastUpdatedAtMs: Number.isFinite(project.lastUpdatedAtMs) ? project.lastUpdatedAtMs : nowMs,
  };
};

/**
 * In-memory singleton builder store with deterministic write semantics.
 */
class PersistentBuilderService implements BuilderService {
  private readonly projects = new Map<string, BuilderProjectStore>();
  private readonly init = this.load();

  private async normalizeProjectRecord(project: BuilderProjectStore): Promise<void> {
    if (project.scenes.size > 0 && project.dialogues.size > 0) {
      return;
    }

    const baseline = createProjectFromBaseline(project.id);

    if (project.scenes.size === 0) {
      project.scenes.clear();
      for (const [sceneId, scene] of baseline.scenes.entries()) {
        project.scenes.set(sceneId, cloneScene(scene));
      }
    }

    if (project.dialogues.size === 0) {
      project.dialogues.clear();
      for (const [locale, catalog] of baseline.dialogues.entries()) {
        project.dialogues.set(locale, new Map(catalog));
      }
    }
  }

  private async load(): Promise<void> {
    const file = Bun.file(persistencePath);
    if (!(await file.exists())) return;

    const raw = await file.text().catch(() => null);
    if (raw === null) return;

    const parsed = safeJsonParse<Partial<PersistedBuilderStore>>(raw, {});
    const nowMs = Date.now();

    if (!Array.isArray(parsed.projects)) {
      return;
    }

    const loadedProjects = parsed.projects
      .filter((record): record is PersistedProjectRecord => typeof record?.id === "string")
      .map((record) => persistedToProject(record));

    for (const project of loadedProjects) {
      project.createdBy = project.createdBy || "system";
      project.updatedBy = project.updatedBy || "system";
      project.source = project.source || "builder-service-seed";
      project.lastUpdatedAtMs = Number.isFinite(project.lastUpdatedAtMs)
        ? project.lastUpdatedAtMs
        : nowMs;
      project.version = Number.isFinite(project.version) ? project.version : 1;
      project.checksum = project.checksum || checksumOf(Array.from(project.scenes.values()));

      this.projects.set(project.id, project);
    }
  }

  private async persist(): Promise<void> {
    await this.init;
    const snapshot: PersistedBuilderStore = {
      schemaVersion,
      createdAtMs: Date.now(),
      updatedAtMs: Date.now(),
      projects: Array.from(this.projects.values()).map((project) => projectToPersisted(project)),
    };

    await Bun.write(persistencePath, JSON.stringify(snapshot));
  }

  private async resolveProject(projectId: string): Promise<BuilderProjectStore> {
    await this.init;
    if (!projectId || projectId.trim().length === 0) {
      throw new Error("project id is required");
    }

    const existing = this.projects.get(projectId);
    if (existing) {
      await this.normalizeProjectRecord(existing);
      return existing;
    }

    const created = createProjectFromBaseline(projectId);
    const mutable = {
      id: created.id,
      scenes: new Map(
        Array.from(created.scenes.entries()).map(([id, scene]) => [id, cloneScene(scene)]),
      ),
      dialogues: new Map(
        Array.from(created.dialogues.entries()).map(([locale, values]) => [
          locale,
          new Map(values),
        ]),
      ),
      published: created.published,
      createdBy: created.createdBy,
      updatedBy: created.updatedBy,
      source: created.source,
      version: created.version,
      checksum: created.checksum,
      lastUpdatedAtMs: created.lastUpdatedAtMs,
    };

    this.projects.set(projectId, mutable);
    await this.persist();
    return mutable;
  }

  private async touchProject(project: BuilderProjectStore): Promise<void> {
    project.version += 1;
    project.lastUpdatedAtMs = Date.now();
    project.updatedBy = "builder-editor";
    project.checksum = checksumOf(Array.from(project.scenes.values()).map((value) => value));
    await this.persist();
  }

  private updateSceneChecksum(project: BuilderProjectStore): void {
    project.checksum = checksumOf(Array.from(project.scenes.values()).map((value) => value));
  }

  private updateDialogueChecksum(project: BuilderProjectStore): void {
    project.checksum = checksumOf(
      Array.from(project.dialogues.entries()).map(([locale, dialog]) => [
        locale,
        Array.from(dialog.entries()),
      ]),
    );
  }

  public async createProject(projectId: string): Promise<BuilderProjectSnapshot | null> {
    const project = await this.resolveProject(projectId);
    return toSnapshot(project);
  }

  public async getProject(projectId: string): Promise<BuilderProjectSnapshot | null> {
    return toSnapshot(await this.resolveProject(projectId));
  }

  public async saveScene(
    projectId: string,
    payload: BuilderScenePayload,
  ): Promise<BuilderMutation<SceneDefinition> | null> {
    const project = await this.resolveProject(projectId);

    const existing = project.scenes.get(payload.id);
    const action: BuilderMutationResult["action"] = existing ? "updated" : "created";
    const scene = cloneScene(payload.scene);
    project.scenes.set(payload.id, scene);
    this.updateSceneChecksum(project);
    await this.touchProject(project);

    return {
      result: sceneMutationResult(projectId, payload.id, action),
      payload: cloneScene(scene),
      checksum: project.checksum,
    };
  }

  public async removeScene(
    projectId: string,
    sceneId: string,
  ): Promise<BuilderMutation<null> | null> {
    const project = await this.resolveProject(projectId);
    if (!project.scenes.has(sceneId)) {
      return null;
    }

    project.scenes.delete(sceneId);
    this.updateSceneChecksum(project);
    await this.touchProject(project);

    return {
      result: sceneMutationResult(projectId, sceneId, "deleted"),
      payload: null,
      checksum: project.checksum,
    };
  }

  public async saveNpc(
    projectId: string,
    payload: BuilderNpcPayload,
  ): Promise<BuilderMutation<SceneNpcDefinition | null> | null> {
    const project = await this.resolveProject(projectId);
    const scene = project.scenes.get(payload.sceneId);
    if (!scene) return null;

    const existingIndex = scene.npcs.findIndex(
      (npc) => npc.characterKey === payload.npc.characterKey,
    );
    let action: BuilderMutationResult["action"] = "updated";
    const upsertNpc = structuredClone(payload.npc) as SceneNpcDefinition;

    if (existingIndex === -1) {
      const npcs = [...scene.npcs, upsertNpc];
      project.scenes.set(payload.sceneId, withNpcList(scene, npcs));
      action = "created";
    } else {
      const npcs = [...scene.npcs];
      npcs[existingIndex] = upsertNpc;
      project.scenes.set(payload.sceneId, withNpcList(scene, npcs));
    }

    this.updateSceneChecksum(project);
    await this.touchProject(project);

    return {
      result: npcMutationResult(projectId, payload.npc.characterKey, action),
      payload: upsertNpc,
      checksum: project.checksum,
    };
  }

  public async removeNpc(
    projectId: string,
    sceneId: string,
    npcId: string,
  ): Promise<BuilderMutation<SceneNpcDefinition[]> | null> {
    const project = await this.resolveProject(projectId);
    const scene = project.scenes.get(sceneId);
    if (!scene) return null;

    const existingNpc = scene.npcs.find((candidate) => candidate.characterKey === npcId);
    if (!existingNpc) return null;

    project.scenes.set(
      sceneId,
      withNpcList(
        scene,
        scene.npcs.filter((candidate) => candidate.characterKey !== npcId),
      ),
    );

    this.updateSceneChecksum(project);
    await this.touchProject(project);

    return {
      result: npcMutationResult(projectId, npcId, "deleted"),
      payload: [...structuredClone(project.scenes.get(sceneId)?.npcs ?? [])],
      checksum: project.checksum,
    };
  }

  public async saveDialogue(
    projectId: string,
    payload: BuilderDialoguePayload,
  ): Promise<BuilderMutation<string> | null> {
    const project = await this.resolveProject(projectId);

    const locale = normalizeLocale(payload.locale);
    const catalog = project.dialogues.get(locale) ?? new Map<string, string>();
    const exists = catalog.has(payload.key);
    catalog.set(payload.key, payload.text);
    project.dialogues.set(locale, catalog);
    this.updateDialogueChecksum(project);
    await this.touchProject(project);

    return {
      result: dialogueMutationResult(projectId, payload.key, exists ? "updated" : "created"),
      payload: payload.text,
      checksum: project.checksum,
    };
  }

  public async removeDialogue(
    projectId: string,
    locale: LocaleCode,
    key: string,
  ): Promise<BuilderMutation<string | null> | null> {
    const project = await this.resolveProject(projectId);
    const localeMap = project.dialogues.get(locale);
    if (!localeMap?.has(key)) {
      return null;
    }

    localeMap.delete(key);
    this.updateDialogueChecksum(project);
    await this.touchProject(project);

    return {
      result: dialogueMutationResult(projectId, key, "deleted"),
      payload: null,
      checksum: project.checksum,
    };
  }

  public async publishProject(
    projectId: string,
    published: boolean,
  ): Promise<BuilderProjectSnapshot | null> {
    const project = await this.resolveProject(projectId);
    project.published = published;
    await this.touchProject(project);
    return toSnapshot(project);
  }

  public async getScene(projectId: string, sceneId: string): Promise<SceneDefinition | null> {
    const project = await this.resolveProject(projectId);
    const scene = project.scenes.get(sceneId);
    return scene ? cloneScene(scene) : null;
  }

  public async findNpc(projectId: string, npcId: string): Promise<SceneNpcDefinition | null> {
    const project = await this.resolveProject(projectId);
    for (const scene of project.scenes.values()) {
      const npc = scene.npcs.find((candidate) => candidate.characterKey === npcId);
      if (npc) {
        return structuredClone(npc) as SceneNpcDefinition;
      }
    }

    return null;
  }

  public async listScenes(projectId: string): Promise<readonly SceneDefinition[]> {
    const project = await this.resolveProject(projectId);
    return [...project.scenes.values()].map((scene) => cloneScene(scene));
  }

  public async getDialogues(
    projectId: string,
    locale: LocaleCode,
  ): Promise<Record<string, string>> {
    const project = await this.resolveProject(projectId);
    const dialogCatalog =
      project.dialogues.get(locale) ?? project.dialogues.get("en-US") ?? new Map<string, string>();
    return Object.fromEntries(dialogCatalog.entries());
  }
}

const DEFAULT_PROJECT_ID = "default";

const projects = new PersistentBuilderService();

/**
 * Shared builder service facade used by builder views and API routes.
 */
export const createBuilderService = (): BuilderService => projects;

/** Shared singleton for in-memory builder operations. */
export const builderService = createBuilderService();

/** Shared default project identifier for dashboard and API defaults. */
export const defaultBuilderProjectId = DEFAULT_PROJECT_ID;
