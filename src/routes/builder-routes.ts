/**
 * Builder Page Routes
 *
 * Server-rendered HTMX pages for the game builder dashboard.
 * Each route renders the full page on direct navigation, or the content
 * partial on HTMX requests (detected via HX-Request header).
 */
import { Elysia } from "elysia";
import { appConfig } from "../config/environment.ts";
import { knowledgeBaseService } from "../domain/ai/knowledge-base-service.ts";
import { getAiRuntimeProfile } from "../domain/ai/local-runtime-profile.ts";
import { builderService } from "../domain/builder/builder-service.ts";
import {
  deriveBuilderReadinessAudit,
  evaluateBuilderPlatformReadiness,
} from "../domain/builder/platform-readiness.ts";
import { detectAvailableFeatures } from "../domain/game/ai/game-ai-service.ts";
import { gameScenes, gameSpriteManifests } from "../domain/game/data/sprite-data.ts";
import { gameLoop } from "../domain/game/game-loop.ts";
import { builderRequestContextPlugin } from "../plugins/builder-request-context.ts";
import { assetRelativePaths, toPublicAssetUrl } from "../shared/constants/assets.ts";
import { resolveRequestPathWithQuery } from "../shared/constants/routes.ts";
import { getMessages } from "../shared/i18n/translator.ts";
import { renderAiPanel } from "../views/builder/ai-panel.ts";
import { renderAssetsEditor } from "../views/builder/assets-editor.ts";
import { renderAutomationPanel } from "../views/builder/automation-panel.ts";
import { type DashboardStats, renderBuilderDashboard } from "../views/builder/builder-dashboard.ts";
import {
  type BuilderChromeProject,
  renderBuilderLayout,
  renderBuilderSidebar,
} from "../views/builder/builder-layout.ts";
import { renderDialogueEditor } from "../views/builder/dialogue-editor.ts";
import { renderMechanicsEditor } from "../views/builder/mechanics-editor.ts";
import { renderNpcEditor } from "../views/builder/npc-editor.ts";
import { renderSceneEditor } from "../views/builder/scene-editor.ts";
import {
  escapeHtml,
  type LayoutContext,
  type LayoutScript,
  renderDocument,
} from "../views/layout.ts";

/**
 * Wraps builder content in the full page layout or returns partial for HTMX.
 */
const wrapOrPartial = (
  request: Request,
  locale: LayoutContext["locale"],
  messages: ReturnType<typeof getMessages>,
  activeTab: string,
  currentPath: string,
  projectId: string,
  project: BuilderChromeProject | null,
  body: string,
  scripts: readonly LayoutScript[] = [],
): string => {
  const isHtmx = request.headers.get("HX-Request") === "true";

  const builderBody = renderBuilderLayout({
    locale,
    messages,
    activeTab,
    currentPath,
    projectId,
    project,
    body,
  });

  if (isHtmx) return builderBody;

  const currentPathWithQuery = resolveRequestPathWithQuery(request);
  const baseScripts: readonly LayoutScript[] = [
    {
      src: toPublicAssetUrl(
        appConfig.staticAssets.publicPrefix,
        assetRelativePaths.htmxExtensionFocusPanelFile,
      ),
    },
    {
      src: toPublicAssetUrl(
        appConfig.staticAssets.publicPrefix,
        assetRelativePaths.builderSceneEditorBundleFile,
      ),
      type: "module",
    },
  ];
  const mergedScripts = [...baseScripts];
  for (const script of scripts) {
    if (
      mergedScripts.some(
        (candidate) => candidate.src === script.src && candidate.type === script.type,
      )
    ) {
      continue;
    }
    mergedScripts.push(script);
  }

  const customSidebarHtml = renderBuilderSidebar({
    locale,
    messages,
    activeTab,
    currentPath,
    projectId,
    project,
    body,
  });

  const layout: LayoutContext = {
    locale,
    messages,
    activeRoute: "builder",
    currentPathWithQuery,
    persistentProjectId: projectId,
    customSidebarHtml,
    hideTopBar: true,
    hideFooter: true,
  };
  return renderDocument(layout, messages.builder.title, builderBody, mergedScripts);
};

const toRecord = <T>(records: ReadonlyMap<string, T>): Record<string, T> =>
  Object.fromEntries(Array.from(records.entries()));

const renderBuilderWarningAlert = (message: string): string =>
  `<div role="alert" class="alert alert-warning alert-soft"><span>${escapeHtml(message)}</span></div>`;

const wrapMissingProject = (
  request: Request,
  locale: LayoutContext["locale"],
  messages: ReturnType<typeof getMessages>,
  activeTab: string,
  currentPath: string,
  projectId: string,
  project: BuilderChromeProject | null,
): string =>
  wrapOrPartial(
    request,
    locale,
    messages,
    activeTab,
    currentPath,
    projectId,
    project,
    renderBuilderWarningAlert(messages.builder.projectNotFound),
  );

const toChromeProject = (
  project: Awaited<ReturnType<typeof builderService.getProject>>,
): BuilderChromeProject | null =>
  project
    ? {
        id: project.id,
        version: project.version,
        latestReleaseVersion: project.latestReleaseVersion,
        publishedReleaseVersion: project.publishedReleaseVersion,
        published: project.published,
        lastUpdatedAtMs: project.lastUpdatedAtMs,
      }
    : null;

export const builderRoutes = new Elysia({ prefix: "/builder" })
  .use(builderRequestContextPlugin)
  .get("/", async ({ request, builderLocale, builderProjectId, builderCurrentPath }) => {
    const messages = getMessages(builderLocale);
    const features = await detectAvailableFeatures();
    const project = await builderService.getProject(builderProjectId);
    const chromeProject = toChromeProject(project);
    if (!project) {
      return wrapMissingProject(
        request,
        builderLocale,
        messages,
      "start",
        builderCurrentPath,
        builderProjectId,
        chromeProject,
      );
    }
    const totalScenes = project.scenes.size;
    const sceneValues = Array.from(project.scenes.values());
    const assetValues = Array.from(project.assets.values());
    const readinessAudit = deriveBuilderReadinessAudit({
      scenes: project.scenes.values(),
      assets: project.assets.values(),
      animationClips: project.animationClips.values(),
      animationTimelines: project.animationTimelines.values(),
      dialogueGraphs: project.dialogueGraphs.values(),
      quests: project.quests.values(),
      triggers: project.triggers.values(),
      flags: project.flags.values(),
      generationJobs: project.generationJobs.values(),
      automationRuns: project.automationRuns.values(),
      latestReleaseVersion: project.latestReleaseVersion,
      publishedReleaseVersion: project.publishedReleaseVersion,
    });
    const scenes2d = sceneValues.filter((scene) => scene.sceneMode !== "3d").length;
    const scenes3d = sceneValues.filter((scene) => scene.sceneMode === "3d").length;
    const totalNpcs = sceneValues.reduce((acc, scene) => acc + scene.npcs.length, 0);
    const sceneNodeCount = sceneValues.reduce((acc, scene) => acc + (scene.nodes?.length ?? 0), 0);
    const collisionMaskCount = sceneValues.reduce((acc, scene) => acc + scene.collisions.length, 0);

    const stats: DashboardStats = {
      activeSessions: await gameLoop.countActiveSessions(),
      totalScenes,
      scenes2d,
      scenes3d,
      totalNpcs,
      sceneNodeCount,
      collisionMaskCount,
      assetCount: readinessAudit.assetCount,
      spriteAssetCount: assetValues.filter((asset) =>
        ["background", "sprite-sheet", "portrait", "tiles", "tile-set"].includes(asset.kind),
      ).length,
      modelAssetCount: readinessAudit.modelAssetCount,
      openUsdAssetCount: readinessAudit.openUsdAssetCount,
      spriteAtlasCount: project.spriteAtlases.size,
      animationClipCount: readinessAudit.animationClipCount,
      animationTimelineCount: readinessAudit.animationTimelineCount,
      dialogueGraphCount: project.dialogueGraphs.size,
      questCount: project.quests.size,
      triggerCount: project.triggers.size,
      flagCount: project.flags.size,
      generationJobCount: readinessAudit.generationJobCount,
      artifactCount: project.artifacts.size,
      automationRunCount: readinessAudit.automationRunCount,
      automationStepCount: readinessAudit.automationStepCount,
      aiAvailable: features.providers.length > 0,
      aiFeatureDialogue: features.richDialogue,
      aiFeatureVision: features.visionAnalysis,
      aiFeatureSentiment: features.sentimentAnalysis,
      aiFeatureEmbeddings: features.embeddings,
      aiFeatureSpeechToText: features.speechToText,
      aiFeatureSpeechSynthesis: features.speechSynthesis,
      aiFeatureLocalInference: features.localInference,
      providers: [...features.providers],
      aiProviderCount: features.providers.length,
      draftVersion: project.version,
      latestReleaseVersion: project.latestReleaseVersion,
      publishedReleaseVersion: project.publishedReleaseVersion,
      published: project.published,
      rendererPreference: appConfig.playableGame.rendererPreference,
      onnxDevice: appConfig.ai.onnxDevice,
      readiness: evaluateBuilderPlatformReadiness({
        sceneCount: totalScenes,
        spriteManifestCount: Object.keys(gameSpriteManifests).length,
        aiFeatures: features,
        rendererPreference: appConfig.playableGame.rendererPreference,
        onnxDevice: appConfig.ai.onnxDevice,
        audit: readinessAudit,
      }),
    };
    const body = renderBuilderDashboard(
      messages,
      builderLocale,
      stats,
      builderProjectId,
      project.published,
    );
    return wrapOrPartial(
      request,
      builderLocale,
      messages,
      "start",
      builderCurrentPath,
      builderProjectId,
      chromeProject,
      body,
    );
  })
  .get("/scenes", async ({ request, builderLocale, builderProjectId, builderCurrentPath }) => {
    const messages = getMessages(builderLocale);
    const project = await builderService.getProject(builderProjectId);
    const chromeProject = toChromeProject(project);
    if (!project) {
      return wrapMissingProject(
        request,
        builderLocale,
        messages,
          "world",
        builderCurrentPath,
        builderProjectId,
        chromeProject,
      );
    }
    const scenes = toRecord(project.scenes);
    const body = renderSceneEditor(messages, scenes, builderLocale, builderProjectId);
    return wrapOrPartial(
      request,
      builderLocale,
      messages,
      "world",
      builderCurrentPath,
      builderProjectId,
      chromeProject,
      body,
    );
  })
  .get("/npcs", async ({ request, builderLocale, builderProjectId, builderCurrentPath }) => {
    const messages = getMessages(builderLocale);
    const project = await builderService.getProject(builderProjectId);
    const chromeProject = toChromeProject(project);
    if (!project) {
      return wrapMissingProject(
        request,
        builderLocale,
        messages,
          "characters",
        builderCurrentPath,
        builderProjectId,
        chromeProject,
      );
    }
    const scenes = toRecord(project.scenes);
    const body = renderNpcEditor(
      messages,
      scenes,
      gameSpriteManifests,
      builderLocale,
      builderProjectId,
    );
    return wrapOrPartial(
      request,
      builderLocale,
      messages,
      "characters",
      builderCurrentPath,
      builderProjectId,
      chromeProject,
      body,
    );
  })
  .get(
    "/dialogue",
    async ({ request, builderLocale, builderProjectId, builderCurrentPath, builderSearch }) => {
      const messages = getMessages(builderLocale);
      const project = await builderService.getProject(builderProjectId);
      const chromeProject = toChromeProject(project);
      const catalog = await builderService.getDialogues(builderProjectId, builderLocale);
      const body = renderDialogueEditor(
        messages,
        catalog,
        builderLocale,
        builderProjectId,
        builderSearch,
      );
      return wrapOrPartial(
        request,
        builderLocale,
        messages,
        "story",
        builderCurrentPath,
        builderProjectId,
        chromeProject,
        body,
      );
    },
  )
  .get("/assets", async ({ request, builderLocale, builderProjectId, builderCurrentPath }) => {
    const messages = getMessages(builderLocale);
    const project = await builderService.getProject(builderProjectId);
    const chromeProject = toChromeProject(project);
    if (!project) {
      return wrapMissingProject(
        request,
        builderLocale,
        messages,
        "assets",
        builderCurrentPath,
        builderProjectId,
        chromeProject,
      );
    }
    const body = renderAssetsEditor(
      messages,
      builderLocale,
      builderProjectId,
      Array.from(project.assets.values()),
      Array.from(project.animationClips.values()),
      Array.from(project.generationJobs.values()),
      Array.from(project.artifacts.values()),
    );
    return wrapOrPartial(
      request,
      builderLocale,
      messages,
      "assets",
      builderCurrentPath,
      builderProjectId,
      chromeProject,
      body,
    );
  })
  .get("/mechanics", async ({ request, builderLocale, builderProjectId, builderCurrentPath }) => {
    const messages = getMessages(builderLocale);
    const project = await builderService.getProject(builderProjectId);
    const chromeProject = toChromeProject(project);
    if (!project) {
      return wrapMissingProject(
        request,
        builderLocale,
        messages,
      "systems",
        builderCurrentPath,
        builderProjectId,
        chromeProject,
      );
    }
    const body = renderMechanicsEditor(
      messages,
      builderLocale,
      builderProjectId,
      Array.from(project.quests.values()),
      Array.from(project.triggers.values()),
      Array.from(project.dialogueGraphs.values()),
      Array.from(project.flags.values()),
    );
    return wrapOrPartial(
      request,
      builderLocale,
      messages,
      "systems",
      builderCurrentPath,
      builderProjectId,
      chromeProject,
      body,
    );
  })
  .get("/automation", async ({ request, builderLocale, builderProjectId, builderCurrentPath }) => {
    const messages = getMessages(builderLocale);
    const project = await builderService.getProject(builderProjectId);
    const chromeProject = toChromeProject(project);
    if (!project) {
      return wrapMissingProject(
        request,
        builderLocale,
        messages,
        "automation",
        builderCurrentPath,
        builderProjectId,
        chromeProject,
      );
    }
    const body = renderAutomationPanel(
      messages,
      builderLocale,
      builderProjectId,
      Array.from(project.automationRuns.values()),
      Array.from(project.artifacts.values()),
    );
    return wrapOrPartial(
      request,
      builderLocale,
      messages,
      "automation",
      builderCurrentPath,
      builderProjectId,
      chromeProject,
      body,
    );
  })
  .get("/ai", async ({ request, builderLocale, builderProjectId, builderCurrentPath }) => {
    const messages = getMessages(builderLocale);
    const project = await builderService.getProject(builderProjectId);
    const chromeProject = toChromeProject(project);
    const features = await detectAvailableFeatures();
    const readiness = evaluateBuilderPlatformReadiness({
      sceneCount: project?.scenes.size ?? Object.keys(gameScenes).length,
      spriteManifestCount: Object.keys(gameSpriteManifests).length,
      aiFeatures: features,
      rendererPreference: appConfig.playableGame.rendererPreference,
      onnxDevice: appConfig.ai.onnxDevice,
    });
    const body = renderAiPanel(
      messages,
      features,
      getAiRuntimeProfile(),
      builderLocale,
      builderProjectId,
      readiness,
      await knowledgeBaseService.listDocuments(builderProjectId),
    );
    return wrapOrPartial(
      request,
      builderLocale,
      messages,
      "ai",
      builderCurrentPath,
      builderProjectId,
      chromeProject,
      body,
    );
  });
