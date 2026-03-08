import { Database } from "bun:sqlite";

interface LegacyBuilderSceneRow {
  readonly projectId: string;
  readonly id: string;
  readonly geometry: string;
  readonly spawn: string;
  readonly npcs: string;
  readonly nodes: string | null;
  readonly collisions: string;
}

interface LegacyCollisionMask {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

interface LegacyNpcAi {
  readonly wanderRadius: number;
  readonly wanderSpeed: number;
  readonly idlePauseMs: readonly [number, number];
  readonly greetOnApproach: boolean;
  readonly greetLineKey: string;
}

interface LegacySceneNpc {
  readonly characterKey: string;
  readonly x: number;
  readonly y: number;
  readonly labelKey: string;
  readonly dialogueKeys: readonly string[];
  readonly interactRadius: number;
  readonly ai: LegacyNpcAi;
}

interface LegacyVector2 {
  readonly x: number;
  readonly y: number;
}

interface LegacyVector3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

interface LegacySceneNode2D {
  readonly id: string;
  readonly nodeType: "sprite" | "tile" | "spawn" | "trigger" | "camera";
  readonly assetId?: string;
  readonly animationClipId?: string;
  readonly position: LegacyVector2;
  readonly size: Readonly<{ readonly width: number; readonly height: number }>;
  readonly layer: string;
}

interface LegacySceneNode3D {
  readonly id: string;
  readonly nodeType: "model" | "light" | "camera" | "spawn" | "trigger";
  readonly assetId?: string;
  readonly animationClipId?: string;
  readonly position: LegacyVector3;
  readonly rotation: LegacyVector3;
  readonly scale: LegacyVector3;
}

type LegacySceneNode = LegacySceneNode2D | LegacySceneNode3D;

interface LegacySceneSnapshot {
  readonly projectId: string;
  readonly sceneId: string;
  readonly collisions: readonly LegacyCollisionMask[];
  readonly npcs: readonly LegacySceneNpc[];
  readonly nodes: readonly LegacySceneNode[];
}

interface LegacyDialogueGraphEdge {
  readonly to: string;
  readonly requiredFlag?: string;
  readonly advanceQuestStepId?: string;
}

interface LegacyDialogueGraphNode {
  readonly id: string;
  readonly line: string;
  readonly edges: readonly LegacyDialogueGraphEdge[];
}

interface LegacyBuilderDialogueGraphRow {
  readonly projectId: string;
  readonly id: string;
  readonly nodes: string;
}

interface LegacyDialogueGraphSnapshot {
  readonly projectId: string;
  readonly graphId: string;
  readonly nodes: readonly LegacyDialogueGraphNode[];
}

interface LegacyQuestStep {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly triggerId: string;
}

interface LegacyBuilderQuestRow {
  readonly projectId: string;
  readonly id: string;
  readonly steps: string;
}

interface LegacyQuestSnapshot {
  readonly projectId: string;
  readonly questId: string;
  readonly steps: readonly LegacyQuestStep[];
}

type LegacyTriggerFlagValue = string | number | boolean;

interface LegacyBuilderTriggerRow {
  readonly projectId: string;
  readonly id: string;
  readonly requiredFlags: string | null;
  readonly setFlags: string | null;
}

interface LegacyTriggerSnapshot {
  readonly projectId: string;
  readonly triggerId: string;
  readonly requiredFlags: Readonly<Record<string, LegacyTriggerFlagValue>>;
  readonly setFlags: Readonly<Record<string, LegacyTriggerFlagValue>>;
}

interface LegacyBuilderAssetRow {
  readonly projectId: string;
  readonly id: string;
  readonly tags: string | null;
  readonly variants: string | null;
}

interface LegacyAssetVariantSnapshot {
  readonly id: string;
  readonly format: string;
  readonly source: string;
  readonly usage: string;
  readonly mimeType?: string;
}

interface LegacyAssetSnapshot {
  readonly projectId: string;
  readonly assetId: string;
  readonly tags: readonly string[];
  readonly variants: readonly LegacyAssetVariantSnapshot[];
}

interface LegacyBuilderFlagRow {
  readonly projectId: string;
  readonly key: string;
  readonly initialValue: string | null;
}

interface LegacyBuilderFlagSnapshot {
  readonly projectId: string;
  readonly key: string;
  readonly initialValue: string | number | boolean | null;
}

interface LegacyBuilderGenerationJobRow {
  readonly projectId: string;
  readonly id: string;
  readonly artifactIds: string;
}

interface LegacyGenerationJobSnapshot {
  readonly projectId: string;
  readonly jobId: string;
  readonly artifactIds: readonly string[];
}

interface LegacyAutomationRunStep {
  readonly id: string;
  readonly action: "browser" | "http" | "builder" | "attach-file";
  readonly summary: string;
  readonly status: "pending" | "running" | "completed" | "failed";
  readonly evidenceSource?: string;
}

interface LegacyBuilderAutomationRunRow {
  readonly projectId: string;
  readonly id: string;
  readonly steps: string;
  readonly artifactIds: string;
}

interface LegacyAutomationRunSnapshot {
  readonly projectId: string;
  readonly runId: string;
  readonly steps: readonly LegacyAutomationRunStep[];
  readonly artifactIds: readonly string[];
}

interface LegacyPlayerProgressRow {
  readonly sessionId: string;
  readonly visitedScenes: string;
  readonly interactions: string;
}

interface LegacyPlayerProgressSnapshot {
  readonly sessionId: string;
  readonly visitedScenes: readonly string[];
  readonly interactions: Readonly<Record<string, boolean>>;
}

type LegacySessionFlagValue = string | number | boolean;

interface LegacyGameQuestStepState {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly state: "pending" | "active" | "completed";
}

interface LegacyGameQuestState {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly completed: boolean;
  readonly steps: readonly LegacyGameQuestStepState[];
}

interface LegacyGameSessionRow {
  readonly id: string;
  readonly state: string;
}

interface LegacyGameSessionSnapshot {
  readonly sessionId: string;
  readonly projectId?: string;
  readonly releaseVersion?: number;
  readonly sceneState: LegacyGameSessionSceneState | null;
  readonly quests: readonly LegacyGameQuestState[];
  readonly flags: Readonly<Record<string, LegacySessionFlagValue>>;
  readonly runtimeState: LegacyGameSessionRuntimeState | null;
  readonly npcs: readonly LegacyGameSessionNpc[];
}

interface LegacyGameSessionSceneState {
  readonly sceneMode: string;
  readonly sceneTitle: string;
  readonly background: string;
  readonly geometryWidth: number;
  readonly geometryHeight: number;
  readonly collisions: readonly LegacyCollisionMask[];
  readonly nodes: readonly LegacySceneNode[];
  readonly assets: readonly LegacyGameSessionAsset[];
}

interface LegacyGameSessionAsset {
  readonly id: string;
  readonly kind: string;
  readonly label: string;
  readonly sceneMode: string;
  readonly source: string;
  readonly sourceFormat: string;
  readonly sourceMimeType?: string;
  readonly approved: boolean;
  readonly createdAtMs: number;
  readonly updatedAtMs: number;
  readonly tags: readonly string[];
  readonly variants: readonly LegacyAssetVariantSnapshot[];
}

interface LegacyGameDialogue {
  readonly npcId: string;
  readonly npcLabel: string;
  readonly line: string;
  readonly lineKey: string;
}

interface LegacyGameSessionRuntimeState {
  readonly cameraX: number;
  readonly cameraY: number;
  readonly uiState: string;
  readonly actionState: string;
  readonly worldTimeMs: number;
  readonly dialogue: LegacyGameDialogue | null;
}

interface LegacyGameSessionNpcDialogueEntry {
  readonly key: string;
  readonly text: string;
}

interface LegacyGameSessionNpc {
  readonly id: string;
  readonly characterKey: string;
  readonly position: LegacyVector2;
  readonly label: string;
  readonly facing: string;
  readonly animation: string;
  readonly frame: number;
  readonly velocity: LegacyVector2;
  readonly bounds: Readonly<{
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
  }>;
  readonly aiEnabled: boolean;
  readonly dialogueIndex: number;
  readonly dialogueLineKeys: readonly string[];
  readonly dialogueEntries: readonly LegacyGameSessionNpcDialogueEntry[];
  readonly interactRadius: number;
  readonly homePosition: LegacyVector2;
  readonly aiProfile: Readonly<{
    readonly wanderRadius: number;
    readonly wanderSpeed: number;
    readonly idlePauseMs: readonly [number, number];
    readonly greetOnApproach: boolean;
    readonly greetLineKey: string;
  }>;
  readonly active: boolean;
  readonly state: string;
}

const parseJson = <T>(value: string | null, fallback: T): T => {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const extractKnowledgeTerms = (
  value: string,
): readonly { readonly term: string; readonly occurrenceCount: number }[] => {
  const counts = new Map<string, number>();
  for (const term of value
    .split(/\s+/u)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length >= 2)) {
    counts.set(term, (counts.get(term) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((left, right) => left[0].localeCompare(right[0]))
    .map(([term, occurrenceCount]) => ({
      term,
      occurrenceCount,
    }));
};

const resolveDatabasePath = (): string | null => {
  const databaseUrl = Bun.env.DATABASE_URL?.trim() ?? "";
  const matchedPrefix = ["libsql:file:", "file:"].find((prefix) => databaseUrl.startsWith(prefix));
  if (!matchedPrefix) {
    return null;
  }

  const relativePath = databaseUrl.slice(matchedPrefix.length).split("?")[0]?.trim() ?? "";
  if (relativePath.length === 0) {
    return null;
  }

  return Bun.resolveSync(relativePath, process.cwd());
};

const hasColumn = (database: Database, tableName: string, columnName: string): boolean => {
  const columns = database.query(`PRAGMA table_info("${tableName}")`).all() as readonly {
    readonly name: string;
  }[];
  return columns.some((column) => column.name === columnName);
};

const hasTable = (database: Database, tableName: string): boolean =>
  database
    .query('SELECT 1 FROM "sqlite_master" WHERE "type" = ? AND "name" = ? LIMIT 1')
    .get("table", tableName) !== null;

const captureLegacySceneSnapshots = (database: Database): readonly LegacySceneSnapshot[] => {
  if (
    !hasColumn(database, "BuilderProjectScene", "geometry") ||
    !hasColumn(database, "BuilderProjectScene", "spawn") ||
    !hasColumn(database, "BuilderProjectScene", "npcs") ||
    !hasColumn(database, "BuilderProjectScene", "nodes") ||
    !hasColumn(database, "BuilderProjectScene", "collisions")
  ) {
    return [];
  }

  const rows = database
    .query(
      'SELECT "projectId", "id", "geometry", "spawn", "npcs", "nodes", "collisions" FROM "BuilderProjectScene"',
    )
    .all() as readonly LegacyBuilderSceneRow[];

  return rows.map((row) => ({
    projectId: row.projectId,
    sceneId: row.id,
    collisions: parseJson<readonly LegacyCollisionMask[]>(
      row.collisions,
      [] as readonly LegacyCollisionMask[],
    ),
    npcs: parseJson<readonly LegacySceneNpc[]>(row.npcs, [] as readonly LegacySceneNpc[]),
    nodes: parseJson<readonly LegacySceneNode[]>(row.nodes, [] as readonly LegacySceneNode[]),
  }));
};

const captureLegacyDialogueGraphSnapshots = (
  database: Database,
): readonly LegacyDialogueGraphSnapshot[] => {
  if (!hasColumn(database, "BuilderProjectDialogueGraph", "nodes")) {
    return [];
  }

  const rows = database
    .query('SELECT "projectId", "id", "nodes" FROM "BuilderProjectDialogueGraph"')
    .all() as readonly LegacyBuilderDialogueGraphRow[];

  return rows.map((row) => ({
    projectId: row.projectId,
    graphId: row.id,
    nodes: parseJson<readonly LegacyDialogueGraphNode[]>(
      row.nodes,
      [] as readonly LegacyDialogueGraphNode[],
    ),
  }));
};

const captureLegacyQuestSnapshots = (database: Database): readonly LegacyQuestSnapshot[] => {
  if (!hasColumn(database, "BuilderProjectQuest", "steps")) {
    return [];
  }

  const rows = database
    .query('SELECT "projectId", "id", "steps" FROM "BuilderProjectQuest"')
    .all() as readonly LegacyBuilderQuestRow[];

  return rows.map((row) => ({
    projectId: row.projectId,
    questId: row.id,
    steps: parseJson<readonly LegacyQuestStep[]>(row.steps, [] as readonly LegacyQuestStep[]),
  }));
};

const captureLegacyTriggerSnapshots = (database: Database): readonly LegacyTriggerSnapshot[] => {
  if (
    !hasColumn(database, "BuilderProjectTrigger", "requiredFlags") ||
    !hasColumn(database, "BuilderProjectTrigger", "setFlags")
  ) {
    return [];
  }

  const rows = database
    .query('SELECT "projectId", "id", "requiredFlags", "setFlags" FROM "BuilderProjectTrigger"')
    .all() as readonly LegacyBuilderTriggerRow[];

  return rows.map((row) => ({
    projectId: row.projectId,
    triggerId: row.id,
    requiredFlags: parseJson<Readonly<Record<string, LegacyTriggerFlagValue>>>(
      row.requiredFlags,
      {},
    ),
    setFlags: parseJson<Readonly<Record<string, LegacyTriggerFlagValue>>>(row.setFlags, {}),
  }));
};

const captureLegacyAssetSnapshots = (database: Database): readonly LegacyAssetSnapshot[] => {
  if (
    !hasColumn(database, "BuilderProjectAsset", "tags") ||
    !hasColumn(database, "BuilderProjectAsset", "variants")
  ) {
    return [];
  }

  const rows = database
    .query('SELECT "projectId", "id", "tags", "variants" FROM "BuilderProjectAsset"')
    .all() as readonly LegacyBuilderAssetRow[];

  return rows.map((row) => ({
    projectId: row.projectId,
    assetId: row.id,
    tags: parseJson<readonly string[]>(row.tags, [] as readonly string[]).filter(
      (value): value is string => typeof value === "string" && value.length > 0,
    ),
    variants: parseJson<readonly unknown[]>(row.variants, [] as readonly unknown[]).flatMap(
      (item): readonly LegacyAssetVariantSnapshot[] => {
        if (
          item === null ||
          typeof item !== "object" ||
          Array.isArray(item) ||
          typeof (item as { id?: unknown }).id !== "string" ||
          typeof (item as { format?: unknown }).format !== "string" ||
          typeof (item as { source?: unknown }).source !== "string" ||
          typeof (item as { usage?: unknown }).usage !== "string"
        ) {
          return [];
        }

        const typedItem = item as {
          readonly id: string;
          readonly format: string;
          readonly source: string;
          readonly usage: string;
          readonly mimeType?: unknown;
        };

        return [
          {
            id: typedItem.id,
            format: typedItem.format,
            source: typedItem.source,
            usage: typedItem.usage,
            mimeType: typeof typedItem.mimeType === "string" ? typedItem.mimeType : undefined,
          },
        ];
      },
    ),
  }));
};

const captureLegacyBuilderFlagSnapshots = (
  database: Database,
): readonly LegacyBuilderFlagSnapshot[] => {
  if (!hasColumn(database, "BuilderProjectFlag", "initialValue")) {
    return [];
  }

  const rows = database
    .query('SELECT "projectId", "key", "initialValue" FROM "BuilderProjectFlag"')
    .all() as readonly LegacyBuilderFlagRow[];

  return rows.map((row) => {
    const parsed = parseJson<unknown>(row.initialValue, null);
    const initialValue =
      typeof parsed === "string" || typeof parsed === "number" || typeof parsed === "boolean"
        ? parsed
        : null;
    return {
      projectId: row.projectId,
      key: row.key,
      initialValue,
    };
  });
};

const captureLegacyGenerationJobSnapshots = (
  database: Database,
): readonly LegacyGenerationJobSnapshot[] => {
  if (!hasColumn(database, "BuilderProjectGenerationJob", "artifactIds")) {
    return [];
  }

  const rows = database
    .query('SELECT "projectId", "id", "artifactIds" FROM "BuilderProjectGenerationJob"')
    .all() as readonly LegacyBuilderGenerationJobRow[];

  return rows.map((row) => ({
    projectId: row.projectId,
    jobId: row.id,
    artifactIds: parseJson<readonly string[]>(row.artifactIds, [] as readonly string[]),
  }));
};

const captureLegacyAutomationRunSnapshots = (
  database: Database,
): readonly LegacyAutomationRunSnapshot[] => {
  if (
    !hasColumn(database, "BuilderProjectAutomationRun", "steps") ||
    !hasColumn(database, "BuilderProjectAutomationRun", "artifactIds")
  ) {
    return [];
  }

  const rows = database
    .query('SELECT "projectId", "id", "steps", "artifactIds" FROM "BuilderProjectAutomationRun"')
    .all() as readonly LegacyBuilderAutomationRunRow[];

  return rows.map((row) => ({
    projectId: row.projectId,
    runId: row.id,
    steps: parseJson<readonly LegacyAutomationRunStep[]>(
      row.steps,
      [] as readonly LegacyAutomationRunStep[],
    ),
    artifactIds: parseJson<readonly string[]>(row.artifactIds, [] as readonly string[]),
  }));
};

const captureLegacyPlayerProgressSnapshots = (
  database: Database,
): readonly LegacyPlayerProgressSnapshot[] => {
  if (
    !hasColumn(database, "PlayerProgress", "visitedScenes") ||
    !hasColumn(database, "PlayerProgress", "interactions")
  ) {
    return [];
  }

  const rows = database
    .query('SELECT "sessionId", "visitedScenes", "interactions" FROM "PlayerProgress"')
    .all() as readonly LegacyPlayerProgressRow[];

  return rows.map((row) => ({
    sessionId: row.sessionId,
    visitedScenes: parseJson<readonly string[]>(row.visitedScenes, [] as readonly string[]).filter(
      (value): value is string => typeof value === "string" && value.length > 0,
    ),
    interactions: Object.fromEntries(
      Object.entries(parseJson<Readonly<Record<string, boolean>>>(row.interactions, {})).flatMap(
        ([key, value]) =>
          typeof key === "string" && key.length > 0 && typeof value === "boolean"
            ? [[key, value]]
            : [],
      ),
    ),
  }));
};

const captureLegacyGameSessionSnapshots = (
  database: Database,
): readonly LegacyGameSessionSnapshot[] => {
  const rows = database
    .query('SELECT "id", "state" FROM "GameSession"')
    .all() as readonly LegacyGameSessionRow[];

  return rows.map((row) => {
    const stateRecord = parseJson<Record<string, unknown>>(row.state, {});
    const sceneCore =
      stateRecord.sceneCore !== null &&
      typeof stateRecord.sceneCore === "object" &&
      !Array.isArray(stateRecord.sceneCore)
        ? (stateRecord.sceneCore as Record<string, unknown>)
        : stateRecord;

    const questsSource = Array.isArray(sceneCore.quests) ? sceneCore.quests : [];
    const quests = questsSource.flatMap((quest: unknown): readonly LegacyGameQuestState[] => {
      if (
        quest === null ||
        typeof quest !== "object" ||
        Array.isArray(quest) ||
        typeof (quest as { id?: unknown }).id !== "string" ||
        typeof (quest as { title?: unknown }).title !== "string" ||
        typeof (quest as { description?: unknown }).description !== "string" ||
        typeof (quest as { completed?: unknown }).completed !== "boolean" ||
        !Array.isArray((quest as { steps?: unknown }).steps)
      ) {
        return [];
      }

      const typedQuest = quest as {
        readonly id: string;
        readonly title: string;
        readonly description: string;
        readonly completed: boolean;
        readonly steps: readonly unknown[];
      };

      const steps = typedQuest.steps.flatMap(
        (step: unknown): readonly LegacyGameQuestStepState[] => {
          if (
            step === null ||
            typeof step !== "object" ||
            Array.isArray(step) ||
            typeof (step as { id?: unknown }).id !== "string" ||
            typeof (step as { title?: unknown }).title !== "string" ||
            typeof (step as { description?: unknown }).description !== "string" ||
            ((step as { state?: unknown }).state !== "pending" &&
              (step as { state?: unknown }).state !== "active" &&
              (step as { state?: unknown }).state !== "completed")
          ) {
            return [];
          }

          const typedStep = step as {
            readonly id: string;
            readonly title: string;
            readonly description: string;
            readonly state: "pending" | "active" | "completed";
          };

          return [
            {
              id: typedStep.id,
              title: typedStep.title,
              description: typedStep.description,
              state: typedStep.state,
            },
          ];
        },
      );

      return [
        {
          id: typedQuest.id,
          title: typedQuest.title,
          description: typedQuest.description,
          completed: typedQuest.completed,
          steps,
        },
      ];
    });

    const flagsSource =
      sceneCore.flags !== null &&
      typeof sceneCore.flags === "object" &&
      !Array.isArray(sceneCore.flags)
        ? (sceneCore.flags as Record<string, unknown>)
        : {};

    const flags = Object.fromEntries(
      Object.entries(flagsSource).flatMap(([key, value]) =>
        typeof value === "string" || typeof value === "number" || typeof value === "boolean"
          ? [[key, value] as const]
          : [],
      ),
    );

    const sceneState = (() => {
      const geometrySource =
        sceneCore.geometry !== null &&
        typeof sceneCore.geometry === "object" &&
        !Array.isArray(sceneCore.geometry)
          ? (sceneCore.geometry as Record<string, unknown>)
          : null;
      if (
        (sceneCore.sceneMode !== "2d" && sceneCore.sceneMode !== "3d") ||
        typeof sceneCore.sceneTitle !== "string" ||
        typeof sceneCore.background !== "string" ||
        geometrySource === null ||
        typeof geometrySource.width !== "number" ||
        typeof geometrySource.height !== "number"
      ) {
        return null;
      }

      const collisions = (Array.isArray(sceneCore.collisions) ? sceneCore.collisions : []).flatMap(
        (collision: unknown): readonly LegacyCollisionMask[] => {
          if (
            collision !== null &&
            typeof collision === "object" &&
            !Array.isArray(collision) &&
            typeof (collision as { x?: unknown }).x === "number" &&
            typeof (collision as { y?: unknown }).y === "number" &&
            typeof (collision as { width?: unknown }).width === "number" &&
            typeof (collision as { height?: unknown }).height === "number"
          ) {
            return [
              {
                x: (collision as { x: number }).x,
                y: (collision as { y: number }).y,
                width: (collision as { width: number }).width,
                height: (collision as { height: number }).height,
              },
            ];
          }
          return [];
        },
      );

      const nodes = (Array.isArray(sceneCore.nodes) ? sceneCore.nodes : []).flatMap(
        (node: unknown): readonly LegacySceneNode[] => {
          if (node === null || typeof node !== "object" || Array.isArray(node)) {
            return [];
          }

          const typedNode = node as Record<string, unknown>;
          const position =
            typedNode.position !== null &&
            typeof typedNode.position === "object" &&
            !Array.isArray(typedNode.position)
              ? (typedNode.position as Record<string, unknown>)
              : null;
          if (
            typeof typedNode.id !== "string" ||
            typeof typedNode.nodeType !== "string" ||
            position === null ||
            typeof position.x !== "number" ||
            typeof position.y !== "number"
          ) {
            return [];
          }

          const rotation =
            typedNode.rotation !== null &&
            typeof typedNode.rotation === "object" &&
            !Array.isArray(typedNode.rotation)
              ? (typedNode.rotation as Record<string, unknown>)
              : null;
          const scale =
            typedNode.scale !== null &&
            typeof typedNode.scale === "object" &&
            !Array.isArray(typedNode.scale)
              ? (typedNode.scale as Record<string, unknown>)
              : null;

          if (
            rotation !== null &&
            scale !== null &&
            typeof position.z === "number" &&
            typeof rotation.x === "number" &&
            typeof rotation.y === "number" &&
            typeof rotation.z === "number" &&
            typeof scale.x === "number" &&
            typeof scale.y === "number" &&
            typeof scale.z === "number"
          ) {
            return [
              {
                id: typedNode.id,
                nodeType: typedNode.nodeType as LegacySceneNode3D["nodeType"],
                assetId: typeof typedNode.assetId === "string" ? typedNode.assetId : undefined,
                animationClipId:
                  typeof typedNode.animationClipId === "string"
                    ? typedNode.animationClipId
                    : undefined,
                position: {
                  x: position.x,
                  y: position.y,
                  z: position.z,
                },
                rotation: {
                  x: rotation.x,
                  y: rotation.y,
                  z: rotation.z,
                },
                scale: {
                  x: scale.x,
                  y: scale.y,
                  z: scale.z,
                },
              },
            ];
          }

          const size =
            typedNode.size !== null &&
            typeof typedNode.size === "object" &&
            !Array.isArray(typedNode.size)
              ? (typedNode.size as Record<string, unknown>)
              : null;
          if (
            size !== null &&
            typeof size.width === "number" &&
            typeof size.height === "number" &&
            typeof typedNode.layer === "string"
          ) {
            return [
              {
                id: typedNode.id,
                nodeType: typedNode.nodeType as LegacySceneNode2D["nodeType"],
                assetId: typeof typedNode.assetId === "string" ? typedNode.assetId : undefined,
                animationClipId:
                  typeof typedNode.animationClipId === "string"
                    ? typedNode.animationClipId
                    : undefined,
                position: {
                  x: position.x,
                  y: position.y,
                },
                size: {
                  width: size.width,
                  height: size.height,
                },
                layer: typedNode.layer,
              },
            ];
          }

          return [];
        },
      );

      const assets = (Array.isArray(sceneCore.assets) ? sceneCore.assets : []).flatMap(
        (asset: unknown): readonly LegacyGameSessionAsset[] => {
          if (asset === null || typeof asset !== "object" || Array.isArray(asset)) {
            return [];
          }

          const typedAsset = asset as Record<string, unknown>;
          if (
            typeof typedAsset.id !== "string" ||
            typeof typedAsset.kind !== "string" ||
            typeof typedAsset.label !== "string" ||
            (typedAsset.sceneMode !== "2d" && typedAsset.sceneMode !== "3d") ||
            typeof typedAsset.source !== "string" ||
            typeof typedAsset.sourceFormat !== "string" ||
            typeof typedAsset.approved !== "boolean" ||
            typeof typedAsset.createdAtMs !== "number" ||
            typeof typedAsset.updatedAtMs !== "number"
          ) {
            return [];
          }

          const tags = (Array.isArray(typedAsset.tags) ? typedAsset.tags : []).filter(
            (value): value is string => typeof value === "string",
          );
          const variants = (Array.isArray(typedAsset.variants) ? typedAsset.variants : []).flatMap(
            (variant: unknown): readonly LegacyAssetVariantSnapshot[] => {
              if (
                variant !== null &&
                typeof variant === "object" &&
                !Array.isArray(variant) &&
                typeof (variant as { id?: unknown }).id === "string" &&
                typeof (variant as { format?: unknown }).format === "string" &&
                typeof (variant as { source?: unknown }).source === "string" &&
                typeof (variant as { usage?: unknown }).usage === "string"
              ) {
                return [
                  {
                    id: (variant as { id: string }).id,
                    format: (variant as { format: string }).format,
                    source: (variant as { source: string }).source,
                    usage: (variant as { usage: string }).usage,
                    mimeType:
                      typeof (variant as { mimeType?: unknown }).mimeType === "string"
                        ? (variant as { mimeType: string }).mimeType
                        : undefined,
                  },
                ];
              }
              return [];
            },
          );

          return [
            {
              id: typedAsset.id,
              kind: typedAsset.kind,
              label: typedAsset.label,
              sceneMode: typedAsset.sceneMode,
              source: typedAsset.source,
              sourceFormat: typedAsset.sourceFormat,
              sourceMimeType:
                typeof typedAsset.sourceMimeType === "string"
                  ? typedAsset.sourceMimeType
                  : undefined,
              approved: typedAsset.approved,
              createdAtMs: typedAsset.createdAtMs,
              updatedAtMs: typedAsset.updatedAtMs,
              tags,
              variants,
            },
          ];
        },
      );

      return {
        sceneMode: sceneCore.sceneMode,
        sceneTitle: sceneCore.sceneTitle,
        background: sceneCore.background,
        geometryWidth: geometrySource.width,
        geometryHeight: geometrySource.height,
        collisions,
        nodes,
        assets,
      } satisfies LegacyGameSessionSceneState;
    })();

    const runtimeState = (() => {
      const cameraSource =
        sceneCore.camera !== null &&
        typeof sceneCore.camera === "object" &&
        !Array.isArray(sceneCore.camera)
          ? (sceneCore.camera as Record<string, unknown>)
          : null;
      const dialogueSource =
        sceneCore.dialogue !== null &&
        typeof sceneCore.dialogue === "object" &&
        !Array.isArray(sceneCore.dialogue)
          ? (sceneCore.dialogue as Record<string, unknown>)
          : null;
      const uiState = typeof sceneCore.uiState === "string" ? sceneCore.uiState : null;
      const actionState = typeof sceneCore.actionState === "string" ? sceneCore.actionState : null;
      const worldTimeMs =
        typeof sceneCore.worldTimeMs === "number" && Number.isFinite(sceneCore.worldTimeMs)
          ? sceneCore.worldTimeMs
          : null;

      if (
        cameraSource === null ||
        typeof cameraSource.x !== "number" ||
        typeof cameraSource.y !== "number" ||
        uiState === null ||
        actionState === null ||
        worldTimeMs === null
      ) {
        return null;
      }

      const dialogue =
        dialogueSource !== null &&
        typeof dialogueSource.npcId === "string" &&
        typeof dialogueSource.npcLabel === "string" &&
        typeof dialogueSource.line === "string" &&
        typeof dialogueSource.lineKey === "string"
          ? {
              npcId: dialogueSource.npcId,
              npcLabel: dialogueSource.npcLabel,
              line: dialogueSource.line,
              lineKey: dialogueSource.lineKey,
            }
          : null;

      return {
        cameraX: cameraSource.x,
        cameraY: cameraSource.y,
        uiState,
        actionState,
        worldTimeMs,
        dialogue,
      } satisfies LegacyGameSessionRuntimeState;
    })();

    const npcs = (Array.isArray(sceneCore.npcs) ? sceneCore.npcs : []).flatMap(
      (npc: unknown): readonly LegacyGameSessionNpc[] => {
        if (npc === null || typeof npc !== "object" || Array.isArray(npc)) {
          return [];
        }

        const typedNpc = npc as Record<string, unknown>;
        const position =
          typedNpc.position !== null &&
          typeof typedNpc.position === "object" &&
          !Array.isArray(typedNpc.position)
            ? (typedNpc.position as Record<string, unknown>)
            : null;
        const velocity =
          typedNpc.velocity !== null &&
          typeof typedNpc.velocity === "object" &&
          !Array.isArray(typedNpc.velocity)
            ? (typedNpc.velocity as Record<string, unknown>)
            : null;
        const bounds =
          typedNpc.bounds !== null &&
          typeof typedNpc.bounds === "object" &&
          !Array.isArray(typedNpc.bounds)
            ? (typedNpc.bounds as Record<string, unknown>)
            : null;
        const homePosition =
          typedNpc.homePosition !== null &&
          typeof typedNpc.homePosition === "object" &&
          !Array.isArray(typedNpc.homePosition)
            ? (typedNpc.homePosition as Record<string, unknown>)
            : null;
        const aiProfile =
          typedNpc.aiProfile !== null &&
          typeof typedNpc.aiProfile === "object" &&
          !Array.isArray(typedNpc.aiProfile)
            ? (typedNpc.aiProfile as Record<string, unknown>)
            : null;
        const idlePauseMs = Array.isArray(aiProfile?.idlePauseMs) ? aiProfile.idlePauseMs : null;

        if (
          typeof typedNpc.id !== "string" ||
          typeof typedNpc.characterKey !== "string" ||
          position === null ||
          typeof position.x !== "number" ||
          typeof position.y !== "number" ||
          typeof typedNpc.label !== "string" ||
          typeof typedNpc.facing !== "string" ||
          typeof typedNpc.animation !== "string" ||
          typeof typedNpc.frame !== "number" ||
          velocity === null ||
          typeof velocity.x !== "number" ||
          typeof velocity.y !== "number" ||
          bounds === null ||
          typeof bounds.x !== "number" ||
          typeof bounds.y !== "number" ||
          typeof bounds.width !== "number" ||
          typeof bounds.height !== "number" ||
          typeof typedNpc.aiEnabled !== "boolean" ||
          typeof typedNpc.dialogueIndex !== "number" ||
          typeof typedNpc.interactRadius !== "number" ||
          homePosition === null ||
          typeof homePosition.x !== "number" ||
          typeof homePosition.y !== "number" ||
          aiProfile === null ||
          typeof aiProfile.wanderRadius !== "number" ||
          typeof aiProfile.wanderSpeed !== "number" ||
          idlePauseMs === null ||
          idlePauseMs.length !== 2 ||
          typeof idlePauseMs[0] !== "number" ||
          typeof idlePauseMs[1] !== "number" ||
          typeof aiProfile.greetOnApproach !== "boolean" ||
          typeof aiProfile.greetLineKey !== "string" ||
          typeof typedNpc.active !== "boolean" ||
          typeof typedNpc.state !== "string"
        ) {
          return [];
        }

        const dialogueLineKeys = (
          Array.isArray(typedNpc.dialogueLineKeys) ? typedNpc.dialogueLineKeys : []
        ).filter((value): value is string => typeof value === "string");
        const dialogueEntries = (
          Array.isArray(typedNpc.dialogueEntries) ? typedNpc.dialogueEntries : []
        ).flatMap((entry: unknown): readonly LegacyGameSessionNpcDialogueEntry[] => {
          if (
            entry !== null &&
            typeof entry === "object" &&
            !Array.isArray(entry) &&
            typeof (entry as { key?: unknown }).key === "string" &&
            typeof (entry as { text?: unknown }).text === "string"
          ) {
            return [
              {
                key: (entry as { key: string }).key,
                text: (entry as { text: string }).text,
              },
            ];
          }
          return [];
        });

        return [
          {
            id: typedNpc.id,
            characterKey: typedNpc.characterKey,
            position: {
              x: position.x,
              y: position.y,
            },
            label: typedNpc.label,
            facing: typedNpc.facing,
            animation: typedNpc.animation,
            frame: typedNpc.frame,
            velocity: {
              x: velocity.x,
              y: velocity.y,
            },
            bounds: {
              x: bounds.x,
              y: bounds.y,
              width: bounds.width,
              height: bounds.height,
            },
            aiEnabled: typedNpc.aiEnabled,
            dialogueIndex: typedNpc.dialogueIndex,
            dialogueLineKeys,
            dialogueEntries,
            interactRadius: typedNpc.interactRadius,
            homePosition: {
              x: homePosition.x,
              y: homePosition.y,
            },
            aiProfile: {
              wanderRadius: aiProfile.wanderRadius,
              wanderSpeed: aiProfile.wanderSpeed,
              idlePauseMs: [idlePauseMs[0], idlePauseMs[1]],
              greetOnApproach: aiProfile.greetOnApproach,
              greetLineKey: aiProfile.greetLineKey,
            },
            active: typedNpc.active,
            state: typedNpc.state,
          },
        ];
      },
    );

    return {
      sessionId: row.id,
      projectId: typeof stateRecord.projectId === "string" ? stateRecord.projectId : undefined,
      releaseVersion:
        typeof stateRecord.releaseVersion === "number" &&
        Number.isFinite(stateRecord.releaseVersion)
          ? stateRecord.releaseVersion
          : undefined,
      sceneState,
      quests,
      flags,
      runtimeState,
      npcs,
    };
  });
};

const prepareLegacySceneColumns = (database: Database): void => {
  if (!hasColumn(database, "BuilderProjectScene", "geometry")) {
    return;
  }

  if (!hasColumn(database, "BuilderProjectScene", "geometryWidth")) {
    database.run(
      'ALTER TABLE "BuilderProjectScene" ADD COLUMN "geometryWidth" INTEGER NOT NULL DEFAULT 0',
    );
  }
  if (!hasColumn(database, "BuilderProjectScene", "geometryHeight")) {
    database.run(
      'ALTER TABLE "BuilderProjectScene" ADD COLUMN "geometryHeight" INTEGER NOT NULL DEFAULT 0',
    );
  }
  if (!hasColumn(database, "BuilderProjectScene", "spawnX")) {
    database.run(
      'ALTER TABLE "BuilderProjectScene" ADD COLUMN "spawnX" INTEGER NOT NULL DEFAULT 0',
    );
  }
  if (!hasColumn(database, "BuilderProjectScene", "spawnY")) {
    database.run(
      'ALTER TABLE "BuilderProjectScene" ADD COLUMN "spawnY" INTEGER NOT NULL DEFAULT 0',
    );
  }

  database.run(`
    UPDATE "BuilderProjectScene"
    SET
      "geometryWidth" = COALESCE(CAST(json_extract("geometry", '$.width') AS INTEGER), "geometryWidth"),
      "geometryHeight" = COALESCE(CAST(json_extract("geometry", '$.height') AS INTEGER), "geometryHeight"),
      "spawnX" = COALESCE(CAST(json_extract("spawn", '$.x') AS INTEGER), "spawnX"),
      "spawnY" = COALESCE(CAST(json_extract("spawn", '$.y') AS INTEGER), "spawnY")
  `);
};

const applyPrismaSchema = async (): Promise<void> => {
  const diff = Bun.spawn({
    cmd: [
      "bunx",
      "--bun",
      "prisma",
      "migrate",
      "diff",
      "--from-config-datasource",
      "--to-schema",
      "prisma/schema.prisma",
      "--script",
    ],
    cwd: process.cwd(),
    stdout: "pipe",
    stderr: "pipe",
    stdin: "ignore",
  });

  const execute = Bun.spawn({
    cmd: ["bunx", "--bun", "prisma", "db", "execute", "--stdin"],
    cwd: process.cwd(),
    stdout: "inherit",
    stderr: "pipe",
    stdin: diff.stdout,
  });

  const [diffError, executeError, diffExitCode, executeExitCode] = await Promise.all([
    new Response(diff.stderr).text(),
    new Response(execute.stderr).text(),
    diff.exited,
    execute.exited,
  ]);

  if (diffExitCode !== 0) {
    throw new Error(`Failed to generate Prisma schema diff: ${diffError.trim()}`);
  }

  if (executeExitCode !== 0) {
    throw new Error(`Failed to apply Prisma schema: ${executeError.trim()}`);
  }
};

const withRetryingDatabase = async (
  databasePath: string,
  run: (database: Database) => void,
): Promise<void> => {
  const maxAttempts = 5;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      {
        using database = new Database(databasePath, { create: true, strict: true });
        run(database);
      }
      return;
    } catch (error) {
      const isLastAttempt = attempt === maxAttempts;
      const message = error instanceof Error ? error.message : String(error);
      if (isLastAttempt || !message.includes("database is locked")) {
        throw error;
      }
      await Bun.sleep(100 * attempt);
    }
  }
};

const restoreLegacySceneChildren = (
  database: Database,
  snapshots: readonly LegacySceneSnapshot[],
): void => {
  if (snapshots.length === 0) {
    return;
  }

  const insertCollision = database.prepare(
    'INSERT OR IGNORE INTO "BuilderProjectSceneCollision" ("projectId", "sceneId", "ordinal", "x", "y", "width", "height") VALUES (?, ?, ?, ?, ?, ?, ?)',
  );
  const insertNpc = database.prepare(
    'INSERT OR IGNORE INTO "BuilderProjectSceneNpc" ("projectId", "sceneId", "characterKey", "ordinal", "x", "y", "labelKey", "interactRadius", "wanderRadius", "wanderSpeed", "idlePauseMinMs", "idlePauseMaxMs", "greetOnApproach", "greetLineKey") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
  );
  const insertNpcDialogueKey = database.prepare(
    'INSERT OR IGNORE INTO "BuilderProjectSceneNpcDialogueKey" ("projectId", "sceneId", "characterKey", "ordinal", "key") VALUES (?, ?, ?, ?, ?)',
  );
  const insertNode = database.prepare(
    'INSERT OR IGNORE INTO "BuilderProjectSceneNode" ("projectId", "sceneId", "id", "ordinal", "nodeType", "assetId", "animationClipId", "positionX", "positionY", "positionZ", "sizeWidth", "sizeHeight", "layer", "rotationX", "rotationY", "rotationZ", "scaleX", "scaleY", "scaleZ") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
  );

  const restore = database.transaction((rows: readonly LegacySceneSnapshot[]) => {
    for (const scene of rows) {
      for (const [ordinal, collision] of scene.collisions.entries()) {
        insertCollision.run(
          scene.projectId,
          scene.sceneId,
          ordinal,
          collision.x,
          collision.y,
          collision.width,
          collision.height,
        );
      }

      for (const [ordinal, npc] of scene.npcs.entries()) {
        insertNpc.run(
          scene.projectId,
          scene.sceneId,
          npc.characterKey,
          ordinal,
          npc.x,
          npc.y,
          npc.labelKey,
          npc.interactRadius,
          npc.ai.wanderRadius,
          npc.ai.wanderSpeed,
          npc.ai.idlePauseMs[0],
          npc.ai.idlePauseMs[1],
          npc.ai.greetOnApproach ? 1 : 0,
          npc.ai.greetLineKey,
        );

        for (const [dialogueOrdinal, dialogueKey] of npc.dialogueKeys.entries()) {
          insertNpcDialogueKey.run(
            scene.projectId,
            scene.sceneId,
            npc.characterKey,
            dialogueOrdinal,
            dialogueKey,
          );
        }
      }

      for (const [ordinal, node] of scene.nodes.entries()) {
        const isThreeDimensionalNode =
          "rotation" in node && "scale" in node && "z" in node.position;
        insertNode.run(
          scene.projectId,
          scene.sceneId,
          node.id,
          ordinal,
          node.nodeType,
          node.assetId ?? null,
          node.animationClipId ?? null,
          node.position.x,
          node.position.y,
          "z" in node.position ? node.position.z : null,
          "size" in node ? node.size.width : null,
          "size" in node ? node.size.height : null,
          "layer" in node ? node.layer : null,
          isThreeDimensionalNode ? node.rotation.x : null,
          isThreeDimensionalNode ? node.rotation.y : null,
          isThreeDimensionalNode ? node.rotation.z : null,
          isThreeDimensionalNode ? node.scale.x : null,
          isThreeDimensionalNode ? node.scale.y : null,
          isThreeDimensionalNode ? node.scale.z : null,
        );
      }
    }
  });

  restore(snapshots);
};

const toFlagValueColumns = (
  value: LegacyTriggerFlagValue,
): {
  readonly valueType: string;
  readonly stringValue: string | null;
  readonly numberValue: number | null;
  readonly boolValue: number | null;
} => {
  if (typeof value === "string") {
    return {
      valueType: "string",
      stringValue: value,
      numberValue: null,
      boolValue: null,
    };
  }

  if (typeof value === "number") {
    return {
      valueType: "number",
      stringValue: null,
      numberValue: value,
      boolValue: null,
    };
  }

  return {
    valueType: "boolean",
    stringValue: null,
    numberValue: null,
    boolValue: value ? 1 : 0,
  };
};

const restoreLegacyMechanicsChildren = (
  database: Database,
  dialogueGraphSnapshots: readonly LegacyDialogueGraphSnapshot[],
  questSnapshots: readonly LegacyQuestSnapshot[],
  triggerSnapshots: readonly LegacyTriggerSnapshot[],
): void => {
  if (
    dialogueGraphSnapshots.length === 0 &&
    questSnapshots.length === 0 &&
    triggerSnapshots.length === 0
  ) {
    return;
  }

  const insertDialogueGraphNode = database.prepare(
    'INSERT OR IGNORE INTO "BuilderProjectDialogueGraphNode" ("projectId", "graphId", "id", "ordinal", "line") VALUES (?, ?, ?, ?, ?)',
  );
  const insertDialogueGraphEdge = database.prepare(
    'INSERT OR IGNORE INTO "BuilderProjectDialogueGraphEdge" ("projectId", "graphId", "nodeId", "ordinal", "toNodeId", "requiredFlag", "advanceQuestStepId") VALUES (?, ?, ?, ?, ?, ?, ?)',
  );
  const insertQuestStep = database.prepare(
    'INSERT OR IGNORE INTO "BuilderProjectQuestStep" ("projectId", "questId", "id", "ordinal", "title", "description", "triggerId") VALUES (?, ?, ?, ?, ?, ?, ?)',
  );
  const insertTriggerRequiredFlag = database.prepare(
    'INSERT OR IGNORE INTO "BuilderProjectTriggerRequiredFlag" ("projectId", "triggerId", "key", "valueType", "stringValue", "numberValue", "boolValue") VALUES (?, ?, ?, ?, ?, ?, ?)',
  );
  const insertTriggerSetFlag = database.prepare(
    'INSERT OR IGNORE INTO "BuilderProjectTriggerSetFlag" ("projectId", "triggerId", "key", "valueType", "stringValue", "numberValue", "boolValue") VALUES (?, ?, ?, ?, ?, ?, ?)',
  );

  const restore = database.transaction(() => {
    for (const graph of dialogueGraphSnapshots) {
      for (const [nodeOrdinal, node] of graph.nodes.entries()) {
        insertDialogueGraphNode.run(
          graph.projectId,
          graph.graphId,
          node.id,
          nodeOrdinal,
          node.line,
        );
        for (const [edgeOrdinal, edge] of node.edges.entries()) {
          insertDialogueGraphEdge.run(
            graph.projectId,
            graph.graphId,
            node.id,
            edgeOrdinal,
            edge.to,
            edge.requiredFlag ?? null,
            edge.advanceQuestStepId ?? null,
          );
        }
      }
    }

    for (const quest of questSnapshots) {
      for (const [stepOrdinal, step] of quest.steps.entries()) {
        insertQuestStep.run(
          quest.projectId,
          quest.questId,
          step.id,
          stepOrdinal,
          step.title,
          step.description,
          step.triggerId,
        );
      }
    }

    for (const trigger of triggerSnapshots) {
      for (const [key, value] of Object.entries(trigger.requiredFlags)) {
        const columns = toFlagValueColumns(value);
        insertTriggerRequiredFlag.run(
          trigger.projectId,
          trigger.triggerId,
          key,
          columns.valueType,
          columns.stringValue,
          columns.numberValue,
          columns.boolValue,
        );
      }

      for (const [key, value] of Object.entries(trigger.setFlags)) {
        const columns = toFlagValueColumns(value);
        insertTriggerSetFlag.run(
          trigger.projectId,
          trigger.triggerId,
          key,
          columns.valueType,
          columns.stringValue,
          columns.numberValue,
          columns.boolValue,
        );
      }
    }
  });

  restore();
};

const restoreLegacyAssetChildren = (
  database: Database,
  assetSnapshots: readonly LegacyAssetSnapshot[],
): void => {
  if (assetSnapshots.length === 0) {
    return;
  }

  const insertAssetTag = database.prepare(
    'INSERT OR IGNORE INTO "BuilderProjectAssetTag" ("projectId", "assetId", "ordinal", "value") VALUES (?, ?, ?, ?)',
  );
  const insertAssetVariant = database.prepare(
    'INSERT OR IGNORE INTO "BuilderProjectAssetVariant" ("projectId", "assetId", "id", "ordinal", "format", "source", "usage", "mimeType") VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
  );

  const restore = database.transaction(() => {
    for (const asset of assetSnapshots) {
      for (const [ordinal, tag] of asset.tags.entries()) {
        insertAssetTag.run(asset.projectId, asset.assetId, ordinal, tag);
      }

      for (const [ordinal, variant] of asset.variants.entries()) {
        insertAssetVariant.run(
          asset.projectId,
          asset.assetId,
          variant.id,
          ordinal,
          variant.format,
          variant.source,
          variant.usage,
          variant.mimeType ?? null,
        );
      }
    }
  });

  restore();
};

const restoreLegacyBuilderFlagValues = (
  database: Database,
  flagSnapshots: readonly LegacyBuilderFlagSnapshot[],
): void => {
  if (flagSnapshots.length === 0) {
    return;
  }

  const updateFlag = database.prepare(
    'UPDATE "BuilderProjectFlag" SET "valueType" = ?, "stringValue" = ?, "numberValue" = ?, "boolValue" = ? WHERE "projectId" = ? AND "key" = ?',
  );

  const restore = database.transaction(() => {
    for (const flag of flagSnapshots) {
      if (flag.initialValue === null) {
        continue;
      }

      const columns = toFlagValueColumns(flag.initialValue);
      updateFlag.run(
        columns.valueType,
        columns.stringValue,
        columns.numberValue,
        columns.boolValue,
        flag.projectId,
        flag.key,
      );
    }
  });

  restore();
};

const restoreLegacyWorkerChildren = (
  database: Database,
  generationJobSnapshots: readonly LegacyGenerationJobSnapshot[],
  automationRunSnapshots: readonly LegacyAutomationRunSnapshot[],
): void => {
  if (generationJobSnapshots.length === 0 && automationRunSnapshots.length === 0) {
    return;
  }

  const insertGenerationJobArtifact = database.prepare(
    'INSERT OR IGNORE INTO "BuilderProjectGenerationJobArtifact" ("projectId", "jobId", "ordinal", "artifactId") VALUES (?, ?, ?, ?)',
  );
  const insertAutomationRunStep = database.prepare(
    'INSERT OR IGNORE INTO "BuilderProjectAutomationRunStep" ("projectId", "runId", "id", "ordinal", "action", "summary", "status", "evidenceSource") VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
  );
  const insertAutomationRunArtifact = database.prepare(
    'INSERT OR IGNORE INTO "BuilderProjectAutomationRunArtifact" ("projectId", "runId", "ordinal", "artifactId") VALUES (?, ?, ?, ?)',
  );

  const restore = database.transaction(() => {
    for (const job of generationJobSnapshots) {
      for (const [ordinal, artifactId] of job.artifactIds.entries()) {
        insertGenerationJobArtifact.run(job.projectId, job.jobId, ordinal, artifactId);
      }
    }

    for (const run of automationRunSnapshots) {
      for (const [ordinal, step] of run.steps.entries()) {
        insertAutomationRunStep.run(
          run.projectId,
          run.runId,
          step.id,
          ordinal,
          step.action,
          step.summary,
          step.status,
          step.evidenceSource ?? null,
        );
      }

      for (const [ordinal, artifactId] of run.artifactIds.entries()) {
        insertAutomationRunArtifact.run(run.projectId, run.runId, ordinal, artifactId);
      }
    }
  });

  restore();
};

const restoreLegacyPlayerProgressChildren = (
  database: Database,
  progressSnapshots: readonly LegacyPlayerProgressSnapshot[],
): void => {
  if (progressSnapshots.length === 0) {
    return;
  }

  const insertVisitedScene = database.prepare(
    'INSERT OR IGNORE INTO "PlayerProgressVisitedScene" ("sessionId", "ordinal", "sceneId") VALUES (?, ?, ?)',
  );
  const insertInteraction = database.prepare(
    'INSERT OR IGNORE INTO "PlayerProgressInteraction" ("sessionId", "interactionId") VALUES (?, ?)',
  );

  const restore = database.transaction(() => {
    for (const progress of progressSnapshots) {
      for (const [ordinal, sceneId] of progress.visitedScenes.entries()) {
        insertVisitedScene.run(progress.sessionId, ordinal, sceneId);
      }

      for (const [interactionId, completed] of Object.entries(progress.interactions)) {
        if (completed) {
          insertInteraction.run(progress.sessionId, interactionId);
        }
      }
    }
  });

  restore();
};

const toSessionFlagColumns = (
  value: LegacySessionFlagValue,
): {
  readonly valueType: string;
  readonly stringValue: string | null;
  readonly numberValue: number | null;
  readonly boolValue: number | null;
} => {
  if (typeof value === "string") {
    return { valueType: "string", stringValue: value, numberValue: null, boolValue: null };
  }

  if (typeof value === "number") {
    return { valueType: "number", stringValue: null, numberValue: value, boolValue: null };
  }

  return { valueType: "boolean", stringValue: null, numberValue: null, boolValue: value ? 1 : 0 };
};

const restoreLegacyGameSessionChildren = (
  database: Database,
  sessionSnapshots: readonly LegacyGameSessionSnapshot[],
): void => {
  if (sessionSnapshots.length === 0) {
    return;
  }

  const insertQuest = database.prepare(
    'INSERT OR IGNORE INTO "GameSessionQuest" ("sessionId", "id", "ordinal", "title", "description", "completed") VALUES (?, ?, ?, ?, ?, ?)',
  );
  const insertSceneState = database.prepare(
    'INSERT OR IGNORE INTO "GameSessionSceneState" ("sessionId", "sceneMode", "sceneTitle", "background", "geometryWidth", "geometryHeight") VALUES (?, ?, ?, ?, ?, ?)',
  );
  const insertSceneCollision = database.prepare(
    'INSERT OR IGNORE INTO "GameSessionSceneCollision" ("sessionId", "ordinal", "x", "y", "width", "height") VALUES (?, ?, ?, ?, ?, ?)',
  );
  const insertSceneNode = database.prepare(
    'INSERT OR IGNORE INTO "GameSessionSceneNode" ("sessionId", "id", "ordinal", "nodeType", "assetId", "animationClipId", "positionX", "positionY", "positionZ", "sizeWidth", "sizeHeight", "layer", "rotationX", "rotationY", "rotationZ", "scaleX", "scaleY", "scaleZ") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
  );
  const insertSceneAsset = database.prepare(
    'INSERT OR IGNORE INTO "GameSessionSceneAsset" ("sessionId", "id", "kind", "label", "sceneMode", "source", "sourceFormat", "sourceMimeType", "approved", "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
  );
  const insertSceneAssetTag = database.prepare(
    'INSERT OR IGNORE INTO "GameSessionSceneAssetTag" ("sessionId", "assetId", "ordinal", "value") VALUES (?, ?, ?, ?)',
  );
  const insertSceneAssetVariant = database.prepare(
    'INSERT OR IGNORE INTO "GameSessionSceneAssetVariant" ("sessionId", "assetId", "id", "ordinal", "format", "source", "usage", "mimeType") VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
  );
  const insertQuestStep = database.prepare(
    'INSERT OR IGNORE INTO "GameSessionQuestStep" ("sessionId", "questId", "id", "ordinal", "title", "description", "state") VALUES (?, ?, ?, ?, ?, ?, ?)',
  );
  const insertFlag = database.prepare(
    'INSERT OR IGNORE INTO "GameSessionFlag" ("sessionId", "key", "valueType", "stringValue", "numberValue", "boolValue") VALUES (?, ?, ?, ?, ?, ?)',
  );
  const insertRuntimeState = database.prepare(
    'INSERT OR IGNORE INTO "GameSessionRuntimeState" ("sessionId", "cameraX", "cameraY", "uiState", "actionState", "worldTimeMs", "dialogueNpcId", "dialogueNpcLabel", "dialogueLine", "dialogueLineKey") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
  );
  const insertNpc = database.prepare(
    'INSERT OR IGNORE INTO "GameSessionNpc" ("sessionId", "id", "ordinal", "characterKey", "positionX", "positionY", "label", "facing", "animation", "frame", "velocityX", "velocityY", "boundsX", "boundsY", "boundsWidth", "boundsHeight", "aiEnabled", "dialogueIndex", "interactRadius", "homePositionX", "homePositionY", "wanderRadius", "wanderSpeed", "idlePauseMinMs", "idlePauseMaxMs", "greetOnApproach", "greetLineKey", "active", "state") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
  );
  const insertNpcDialogueKey = database.prepare(
    'INSERT OR IGNORE INTO "GameSessionNpcDialogueKey" ("sessionId", "npcId", "ordinal", "key") VALUES (?, ?, ?, ?)',
  );
  const insertNpcDialogueEntry = database.prepare(
    'INSERT OR IGNORE INTO "GameSessionNpcDialogueEntry" ("sessionId", "npcId", "ordinal", "key", "text") VALUES (?, ?, ?, ?, ?)',
  );
  const updateSessionMetadata = database.prepare(
    'UPDATE "GameSession" SET "projectId" = ?, "releaseVersion" = ? WHERE "id" = ?',
  );

  const restore = database.transaction(() => {
    for (const session of sessionSnapshots) {
      updateSessionMetadata.run(
        session.projectId ?? null,
        session.releaseVersion ?? null,
        session.sessionId,
      );

      if (session.sceneState !== null) {
        insertSceneState.run(
          session.sessionId,
          session.sceneState.sceneMode,
          session.sceneState.sceneTitle,
          session.sceneState.background,
          session.sceneState.geometryWidth,
          session.sceneState.geometryHeight,
        );

        for (const [ordinal, collision] of session.sceneState.collisions.entries()) {
          insertSceneCollision.run(
            session.sessionId,
            ordinal,
            collision.x,
            collision.y,
            collision.width,
            collision.height,
          );
        }

        for (const [ordinal, node] of session.sceneState.nodes.entries()) {
          const isThreeDimensionalNode =
            "rotation" in node && "scale" in node && "z" in node.position;
          insertSceneNode.run(
            session.sessionId,
            node.id,
            ordinal,
            node.nodeType,
            node.assetId ?? null,
            node.animationClipId ?? null,
            node.position.x,
            node.position.y,
            "z" in node.position ? node.position.z : null,
            "size" in node ? node.size.width : null,
            "size" in node ? node.size.height : null,
            "layer" in node ? node.layer : null,
            isThreeDimensionalNode ? node.rotation.x : null,
            isThreeDimensionalNode ? node.rotation.y : null,
            isThreeDimensionalNode ? node.rotation.z : null,
            isThreeDimensionalNode ? node.scale.x : null,
            isThreeDimensionalNode ? node.scale.y : null,
            isThreeDimensionalNode ? node.scale.z : null,
          );
        }

        for (const asset of session.sceneState.assets) {
          insertSceneAsset.run(
            session.sessionId,
            asset.id,
            asset.kind,
            asset.label,
            asset.sceneMode,
            asset.source,
            asset.sourceFormat,
            asset.sourceMimeType ?? null,
            asset.approved ? 1 : 0,
            new Date(asset.createdAtMs).toISOString(),
            new Date(asset.updatedAtMs).toISOString(),
          );

          for (const [ordinal, tag] of asset.tags.entries()) {
            insertSceneAssetTag.run(session.sessionId, asset.id, ordinal, tag);
          }

          for (const [ordinal, variant] of asset.variants.entries()) {
            insertSceneAssetVariant.run(
              session.sessionId,
              asset.id,
              variant.id,
              ordinal,
              variant.format,
              variant.source,
              variant.usage,
              variant.mimeType ?? null,
            );
          }
        }
      }

      if (session.runtimeState !== null) {
        insertRuntimeState.run(
          session.sessionId,
          session.runtimeState.cameraX,
          session.runtimeState.cameraY,
          session.runtimeState.uiState,
          session.runtimeState.actionState,
          session.runtimeState.worldTimeMs,
          session.runtimeState.dialogue?.npcId ?? null,
          session.runtimeState.dialogue?.npcLabel ?? null,
          session.runtimeState.dialogue?.line ?? null,
          session.runtimeState.dialogue?.lineKey ?? null,
        );
      }

      for (const [npcOrdinal, npc] of session.npcs.entries()) {
        insertNpc.run(
          session.sessionId,
          npc.id,
          npcOrdinal,
          npc.characterKey,
          npc.position.x,
          npc.position.y,
          npc.label,
          npc.facing,
          npc.animation,
          npc.frame,
          npc.velocity.x,
          npc.velocity.y,
          npc.bounds.x,
          npc.bounds.y,
          npc.bounds.width,
          npc.bounds.height,
          npc.aiEnabled ? 1 : 0,
          npc.dialogueIndex,
          npc.interactRadius,
          npc.homePosition.x,
          npc.homePosition.y,
          npc.aiProfile.wanderRadius,
          npc.aiProfile.wanderSpeed,
          npc.aiProfile.idlePauseMs[0],
          npc.aiProfile.idlePauseMs[1],
          npc.aiProfile.greetOnApproach ? 1 : 0,
          npc.aiProfile.greetLineKey,
          npc.active ? 1 : 0,
          npc.state,
        );

        for (const [ordinal, key] of npc.dialogueLineKeys.entries()) {
          insertNpcDialogueKey.run(session.sessionId, npc.id, ordinal, key);
        }

        for (const [ordinal, entry] of npc.dialogueEntries.entries()) {
          insertNpcDialogueEntry.run(session.sessionId, npc.id, ordinal, entry.key, entry.text);
        }
      }

      for (const [questOrdinal, quest] of session.quests.entries()) {
        insertQuest.run(
          session.sessionId,
          quest.id,
          questOrdinal,
          quest.title,
          quest.description,
          quest.completed ? 1 : 0,
        );

        for (const [stepOrdinal, step] of quest.steps.entries()) {
          insertQuestStep.run(
            session.sessionId,
            quest.id,
            step.id,
            stepOrdinal,
            step.title,
            step.description,
            step.state,
          );
        }
      }

      for (const [key, value] of Object.entries(session.flags)) {
        const columns = toSessionFlagColumns(value);
        insertFlag.run(
          session.sessionId,
          key,
          columns.valueType,
          columns.stringValue,
          columns.numberValue,
          columns.boolValue,
        );
      }
    }
  });

  restore();
};

const rebuildKnowledgeChunkTerms = (database: Database): void => {
  if (!hasTable(database, "AiKnowledgeChunk") || !hasTable(database, "AiKnowledgeChunkTerm")) {
    return;
  }

  const rows = database
    .query('SELECT "id", "searchText" FROM "AiKnowledgeChunk"')
    .all() as readonly {
    readonly id: string;
    readonly searchText: string;
  }[];
  const clearTerms = database.prepare('DELETE FROM "AiKnowledgeChunkTerm"');
  const insertTerm = database.prepare(
    'INSERT OR IGNORE INTO "AiKnowledgeChunkTerm" ("chunkId", "term", "occurrenceCount") VALUES (?, ?, ?)',
  );

  const rebuild = database.transaction(() => {
    clearTerms.run();
    for (const row of rows) {
      for (const term of extractKnowledgeTerms(row.searchText)) {
        insertTerm.run(row.id, term.term, term.occurrenceCount);
      }
    }
  });

  rebuild();
};

const databasePath = resolveDatabasePath();
let legacySceneSnapshots: readonly LegacySceneSnapshot[] = [];
let legacyDialogueGraphSnapshots: readonly LegacyDialogueGraphSnapshot[] = [];
let legacyQuestSnapshots: readonly LegacyQuestSnapshot[] = [];
let legacyTriggerSnapshots: readonly LegacyTriggerSnapshot[] = [];
let legacyAssetSnapshots: readonly LegacyAssetSnapshot[] = [];
let legacyBuilderFlagSnapshots: readonly LegacyBuilderFlagSnapshot[] = [];
let legacyGenerationJobSnapshots: readonly LegacyGenerationJobSnapshot[] = [];
let legacyAutomationRunSnapshots: readonly LegacyAutomationRunSnapshot[] = [];
let legacyPlayerProgressSnapshots: readonly LegacyPlayerProgressSnapshot[] = [];
let legacyGameSessionSnapshots: readonly LegacyGameSessionSnapshot[] = [];

if (databasePath) {
  {
    using database = new Database(databasePath, { create: true, strict: true });
    legacySceneSnapshots = captureLegacySceneSnapshots(database);
    legacyDialogueGraphSnapshots = captureLegacyDialogueGraphSnapshots(database);
    legacyQuestSnapshots = captureLegacyQuestSnapshots(database);
    legacyTriggerSnapshots = captureLegacyTriggerSnapshots(database);
    legacyAssetSnapshots = captureLegacyAssetSnapshots(database);
    legacyBuilderFlagSnapshots = captureLegacyBuilderFlagSnapshots(database);
    legacyGenerationJobSnapshots = captureLegacyGenerationJobSnapshots(database);
    legacyAutomationRunSnapshots = captureLegacyAutomationRunSnapshots(database);
    legacyPlayerProgressSnapshots = captureLegacyPlayerProgressSnapshots(database);
    legacyGameSessionSnapshots = captureLegacyGameSessionSnapshots(database);
    prepareLegacySceneColumns(database);
  }
}

await applyPrismaSchema();

if (databasePath && legacySceneSnapshots.length > 0) {
  await withRetryingDatabase(databasePath, (database) => {
    restoreLegacySceneChildren(database, legacySceneSnapshots);
  });
}

if (
  databasePath &&
  (legacyDialogueGraphSnapshots.length > 0 ||
    legacyQuestSnapshots.length > 0 ||
    legacyTriggerSnapshots.length > 0)
) {
  await withRetryingDatabase(databasePath, (database) => {
    restoreLegacyMechanicsChildren(
      database,
      legacyDialogueGraphSnapshots,
      legacyQuestSnapshots,
      legacyTriggerSnapshots,
    );
  });
}

if (databasePath && legacyAssetSnapshots.length > 0) {
  await withRetryingDatabase(databasePath, (database) => {
    restoreLegacyAssetChildren(database, legacyAssetSnapshots);
  });
}

if (databasePath && legacyBuilderFlagSnapshots.length > 0) {
  await withRetryingDatabase(databasePath, (database) => {
    restoreLegacyBuilderFlagValues(database, legacyBuilderFlagSnapshots);
  });
}

if (
  databasePath &&
  (legacyGenerationJobSnapshots.length > 0 || legacyAutomationRunSnapshots.length > 0)
) {
  await withRetryingDatabase(databasePath, (database) => {
    restoreLegacyWorkerChildren(
      database,
      legacyGenerationJobSnapshots,
      legacyAutomationRunSnapshots,
    );
  });
}

if (databasePath && legacyPlayerProgressSnapshots.length > 0) {
  await withRetryingDatabase(databasePath, (database) => {
    restoreLegacyPlayerProgressChildren(database, legacyPlayerProgressSnapshots);
  });
}

if (databasePath && legacyGameSessionSnapshots.length > 0) {
  await withRetryingDatabase(databasePath, (database) => {
    restoreLegacyGameSessionChildren(database, legacyGameSessionSnapshots);
  });
}

if (databasePath) {
  await withRetryingDatabase(databasePath, (database) => {
    rebuildKnowledgeChunkTerms(database);
  });
}
