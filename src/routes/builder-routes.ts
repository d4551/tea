/**
 * Builder Page Routes
 *
 * Server-rendered HTMX pages for the game builder dashboard.
 * Each route renders the full page on direct navigation, or the content
 * partial on HTMX requests (detected via HX-Request header).
 */
import { Elysia } from "elysia";
import { appConfig } from "../config/environment.ts";
import { deriveFeatureCapability } from "../domain/ai/capability-snapshot.ts";
import { knowledgeBaseService } from "../domain/ai/knowledge-base-service.ts";
import { getAiRuntimeProfile } from "../domain/ai/local-runtime-profile.ts";
import { ProviderRegistry } from "../domain/ai/providers/provider-registry.ts";
import { builderService } from "../domain/builder/builder-service.ts";
import {
  deriveBuilderReadinessAudit,
  evaluateBuilderPlatformReadiness,
} from "../domain/builder/platform-readiness.ts";
import { detectAvailableFeatures } from "../domain/game/ai/game-ai-service.ts";
import { gameSpriteManifests } from "../domain/game/data/sprite-data.ts";
import { gameLoop } from "../domain/game/game-loop.ts";
import { defaultOracleMode } from "../shared/constants/oracle.ts";
import { builderRequestContextPlugin } from "../plugins/builder-request-context.ts";
import { assetRelativePaths, toPublicAssetUrl } from "../shared/constants/assets.ts";
import {
  BUILDER_QUERY_PARAM_ASSET_ID,
  BUILDER_QUERY_PARAM_PAGE,
  BUILDER_QUERY_PARAM_SCENE_ID,
} from "../shared/constants/builder-query.ts";
import { appRoutes, resolveRequestPathWithQuery } from "../shared/constants/routes.ts";
import { getMessages } from "../shared/i18n/translator.ts";
import { renderAiPanel } from "../views/builder/ai-panel.ts";
import { renderAssetsEditor } from "../views/builder/assets-editor.ts";
import { renderAutomationPanel } from "../views/builder/automation-panel.ts";
import { renderBuilderDashboard } from "../views/builder/builder-dashboard.ts";
import { deriveCreatorCapabilities } from "../views/builder/builder-flow.ts";
import {
  type BuilderChromeProject,
  renderBuilderLayout,
  renderBuilderSidebar,
  renderConsoleLayout,
  renderConsoleSidebar,
} from "../views/builder/builder-layout.ts";
import { renderBuilderStarterWorkspace } from "../views/builder/builder-starter.ts";
import { renderDialogueEditor } from "../views/builder/dialogue-editor.ts";
import { renderMechanicsEditor } from "../views/builder/mechanics-editor.ts";
import { renderNpcEditor } from "../views/builder/npc-editor.ts";
import { renderSceneEditor } from "../views/builder/scene-editor.ts";
import { type LayoutContext, type LayoutScript, type OraclePanelState, renderDocument } from "../views/layout.ts";
import { parseOracleMode } from "./oracle-input.ts";

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
  oraclePanelState?: OraclePanelState,
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
    oraclePanelState,
    hideTopBar: true,
    hideFooter: true,
  };
  return renderDocument(layout, messages.builder.title, builderBody, mergedScripts);
};

/**
 * Wraps console content in the console layout or returns partial for HTMX.
 */
const wrapOrPartialConsole = (
  request: Request,
  locale: LayoutContext["locale"],
  messages: ReturnType<typeof getMessages>,
  activeTab: string,
  currentPath: string,
  projectId: string,
  project: BuilderChromeProject | null,
  body: string,
  oraclePanelState?: OraclePanelState,
): string => {
  const isHtmx = request.headers.get("HX-Request") === "true";

  const consoleBody = renderConsoleLayout({
    locale,
    messages,
    activeTab,
    currentPath,
    projectId,
    project,
    body,
  });

  if (isHtmx) return consoleBody;

  const currentPathWithQuery = resolveRequestPathWithQuery(request);
  const customSidebarHtml = renderConsoleSidebar({
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
    oraclePanelState,
    hideTopBar: true,
    hideFooter: true,
  };
  return renderDocument(layout, messages.builder.advancedTools, consoleBody, []);
};

const resolveOraclePanelState = (request: Request): OraclePanelState => {
  const searchParams = new URL(request.url).searchParams;
  const openAiAssistant = searchParams.get("openAiAssistant");
  const hasOpenSignal =
    openAiAssistant === "true" || openAiAssistant === "1" || searchParams.has("question");
  if (!hasOpenSignal) {
    return {
      state: "idle",
      mode: defaultOracleMode,
      question: "",
    };
  }

  return {
    state: "idle",
    mode: parseOracleMode(searchParams.get("mode") ?? undefined),
    question: searchParams.get("question") ?? "",
  };
};

const toRecord = <T>(records: ReadonlyMap<string, T>): Record<string, T> =>
  Object.fromEntries(Array.from(records.entries()));

const wrapMissingProject = (
  request: Request,
  locale: LayoutContext["locale"],
  messages: ReturnType<typeof getMessages>,
  activeTab: string,
  currentPath: string,
  projectId: string,
  project: BuilderChromeProject | null,
  oraclePanelState?: OraclePanelState,
): string =>
  wrapOrPartial(
    request,
    locale,
    messages,
    activeTab,
    currentPath,
    projectId,
    project,
    renderBuilderStarterWorkspace(messages, locale, projectId, currentPath),
    oraclePanelState,
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

const resolveBuilderPage = (request: Request): number => {
  const rawPage = new URL(request.url).searchParams.get(BUILDER_QUERY_PARAM_PAGE) ?? "";
  const page = Number.parseInt(rawPage, 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
};

const resolveRouteProjectId = (
  routeProjectId: string | undefined,
  fallbackProjectId: string,
): string => {
  const normalized = routeProjectId?.trim() ?? "";
  return normalized.length > 0 ? normalized : fallbackProjectId;
};

export const builderRoutes = new Elysia({ prefix: "/projects" })
  .use(builderRequestContextPlugin)
  .get("/new", async ({ request, builderLocale, builderCurrentPath }) => {
    const messages = getMessages(builderLocale);
    const oraclePanelState = resolveOraclePanelState(request);
    return wrapOrPartial(
      request,
      builderLocale,
      messages,
      "start",
      builderCurrentPath,
      "",
      null,
      renderBuilderStarterWorkspace(messages, builderLocale, "", appRoutes.builderStart),
      oraclePanelState,
    );
  })
  .get(
    "/:projectId/start",
    async ({ request, params, builderLocale, builderProjectId, builderCurrentPath }) => {
      const projectId = resolveRouteProjectId(params.projectId, builderProjectId);
      const messages = getMessages(builderLocale);
      const project = await builderService.getProject(projectId);
      const oraclePanelState = resolveOraclePanelState(request);
      const chromeProject = toChromeProject(project);
      if (!project) {
        return wrapMissingProject(
          request,
          builderLocale,
          messages,
          "start",
          builderCurrentPath,
          projectId,
          chromeProject,
          oraclePanelState,
        );
      }
      const features = await detectAvailableFeatures();
      const registry = await ProviderRegistry.getInstance();
      const registryStatus = await registry.getStatus();
      const totalScenes = project.scenes.size;
      const sceneValues = Array.from(project.scenes.values());
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
      const totalNpcs = sceneValues.reduce((acc, scene) => acc + scene.npcs.length, 0);
      const readiness = evaluateBuilderPlatformReadiness({
        sceneCount: totalScenes,
        spriteManifestCount: project.spriteAtlases.size,
        aiFeatures: features,
        rendererPreference: appConfig.playableGame.rendererPreference,
        onnxDevice: appConfig.ai.onnxDevice,
        audit: readinessAudit,
      });

      const dashboard = {
        activeSessions: await gameLoop.countActiveSessions(),
        totalScenes,
        totalNpcs,
        assetCount: readinessAudit.assetCount,
        animationClipCount: readinessAudit.animationClipCount,
        dialogueGraphCount: project.dialogueGraphs.size,
        questCount: project.quests.size,
        draftVersion: project.version,
        latestReleaseVersion: project.latestReleaseVersion,
        publishedReleaseVersion: project.publishedReleaseVersion,
        published: project.published,
        creatorCapabilities: deriveCreatorCapabilities(messages, registryStatus, readiness),
      };
      const body = renderBuilderDashboard(
        messages,
        builderLocale,
        dashboard,
        projectId,
        project.published,
      );
      return wrapOrPartial(
        request,
        builderLocale,
        messages,
        "start",
        builderCurrentPath,
        projectId,
        chromeProject,
        body,
        oraclePanelState,
      );
    },
  )
  .get(
    "/:projectId/world",
    async ({
      request,
      params,
      builderLocale,
      builderProjectId,
      builderCurrentPath,
      builderSearch,
    }) => {
      const projectId = resolveRouteProjectId(params.projectId, builderProjectId);
      const messages = getMessages(builderLocale);
      const project = await builderService.getProject(projectId);
      const oraclePanelState = resolveOraclePanelState(request);
      const chromeProject = toChromeProject(project);
      if (!project) {
        return wrapMissingProject(
          request,
          builderLocale,
          messages,
          "world",
          builderCurrentPath,
          projectId,
          chromeProject,
          oraclePanelState,
        );
      }
      const searchParams = new URL(request.url).searchParams;
      const scenes = toRecord(project.scenes);
      const body = renderSceneEditor(
        messages,
        scenes,
        builderLocale,
        projectId,
        builderSearch,
        resolveBuilderPage(request),
        searchParams.get(BUILDER_QUERY_PARAM_SCENE_ID) ?? "",
      );
      return wrapOrPartial(
        request,
        builderLocale,
        messages,
        "world",
        builderCurrentPath,
        projectId,
        chromeProject,
        body,
        oraclePanelState,
      );
    },
  )
  .get(
    "/:projectId/characters",
    async ({ request, params, builderLocale, builderProjectId, builderCurrentPath, builderSearch }) => {
      const projectId = resolveRouteProjectId(params.projectId, builderProjectId);
      const messages = getMessages(builderLocale);
      const project = await builderService.getProject(projectId);
      const oraclePanelState = resolveOraclePanelState(request);
      const chromeProject = toChromeProject(project);
      if (!project) {
        return wrapMissingProject(
          request,
          builderLocale,
          messages,
          "characters",
          builderCurrentPath,
          projectId,
          chromeProject,
          oraclePanelState,
        );
      }
      const scenes = toRecord(project.scenes);
      const builderPage = resolveBuilderPage(request);
      const body = renderNpcEditor(messages, scenes, gameSpriteManifests, builderLocale, projectId, builderSearch, builderPage);
      return wrapOrPartial(
        request,
        builderLocale,
        messages,
        "characters",
        builderCurrentPath,
        projectId,
        chromeProject,
        body,
        oraclePanelState,
      );
    },
  )
  .get(
    "/:projectId/story",
    async ({
      request,
      params,
      builderLocale,
      builderProjectId,
      builderCurrentPath,
      builderSearch,
    }) => {
      const projectId = resolveRouteProjectId(params.projectId, builderProjectId);
      const messages = getMessages(builderLocale);
      const project = await builderService.getProject(projectId);
      const oraclePanelState = resolveOraclePanelState(request);
      const chromeProject = toChromeProject(project);
      if (!project) {
        return wrapMissingProject(
          request,
          builderLocale,
          messages,
          "story",
          builderCurrentPath,
          projectId,
          chromeProject,
          oraclePanelState,
        );
      }
      const catalog = await builderService.getDialogues(projectId, builderLocale);
      const builderPage = resolveBuilderPage(request);
      const body = renderDialogueEditor(messages, catalog, builderLocale, projectId, builderSearch, builderPage);
      return wrapOrPartial(
        request,
        builderLocale,
        messages,
        "story",
        builderCurrentPath,
        projectId,
        chromeProject,
        body,
        oraclePanelState,
      );
    },
  )
  .get(
    "/:projectId/assets",
    async ({
      request,
      params,
      builderLocale,
      builderProjectId,
      builderCurrentPath,
      builderSearch,
    }) => {
      const projectId = resolveRouteProjectId(params.projectId, builderProjectId);
      const messages = getMessages(builderLocale);
      const project = await builderService.getProject(projectId);
      const oraclePanelState = resolveOraclePanelState(request);
      const chromeProject = toChromeProject(project);
      if (!project) {
        return wrapMissingProject(
          request,
          builderLocale,
          messages,
          "assets",
          builderCurrentPath,
          projectId,
          chromeProject,
          oraclePanelState,
        );
      }
      const searchParams = new URL(request.url).searchParams;
      const body = renderAssetsEditor(
        messages,
        builderLocale,
        projectId,
        Array.from(project.assets.values()),
        Array.from(project.animationClips.values()),
        builderSearch,
        resolveBuilderPage(request),
        searchParams.get(BUILDER_QUERY_PARAM_ASSET_ID) ?? "",
      );
      return wrapOrPartial(
        request,
        builderLocale,
        messages,
        "assets",
        builderCurrentPath,
        projectId,
        chromeProject,
        body,
        oraclePanelState,
      );
    },
  )
  .get(
    "/:projectId/systems",
    async ({ request, params, builderLocale, builderProjectId, builderCurrentPath }) => {
      const projectId = resolveRouteProjectId(params.projectId, builderProjectId);
      const messages = getMessages(builderLocale);
      const project = await builderService.getProject(projectId);
      const oraclePanelState = resolveOraclePanelState(request);
      const chromeProject = toChromeProject(project);
      if (!project) {
        return wrapMissingProject(
          request,
          builderLocale,
          messages,
          "systems",
          builderCurrentPath,
          projectId,
          chromeProject,
          oraclePanelState,
        );
      }
      const body = renderMechanicsEditor(
        messages,
        builderLocale,
        projectId,
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
        projectId,
        chromeProject,
        body,
        oraclePanelState,
      );
    },
  )
  .get(
    "/:projectId/operations",
    async ({ request, params, builderLocale, builderProjectId, builderCurrentPath }) => {
      const projectId = resolveRouteProjectId(params.projectId, builderProjectId);
      const messages = getMessages(builderLocale);
      const project = await builderService.getProject(projectId);
      const oraclePanelState = resolveOraclePanelState(request);
      const chromeProject = toChromeProject(project);
      if (!project) {
        return wrapMissingProject(
          request,
          builderLocale,
          messages,
          "operations",
          builderCurrentPath,
          projectId,
          chromeProject,
          oraclePanelState,
        );
      }
      const builderPage = resolveBuilderPage(request);
      const body = renderAutomationPanel(
        messages,
        builderLocale,
        projectId,
        Array.from(project.automationRuns.values()),
        Array.from(project.artifacts.values()),
        builderPage,
      );
      return wrapOrPartialConsole(
        request,
        builderLocale,
        messages,
        "operations",
        builderCurrentPath,
        projectId,
        chromeProject,
        body,
        oraclePanelState,
      );
    },
  )
  .get(
    "/:projectId/settings",
    async ({ request, params, builderLocale, builderProjectId, builderCurrentPath }) => {
      const projectId = resolveRouteProjectId(params.projectId, builderProjectId);
      const messages = getMessages(builderLocale);
      const project = await builderService.getProject(projectId);
      const oraclePanelState = resolveOraclePanelState(request);
      const chromeProject = toChromeProject(project);
      if (!project) {
        return wrapMissingProject(
          request,
          builderLocale,
          messages,
          "settings",
          builderCurrentPath,
          projectId,
          chromeProject,
          oraclePanelState,
        );
      }
      const features = await detectAvailableFeatures();
      const registry = await ProviderRegistry.getInstance();
      const registryStatus = await registry.getStatus();
      const readiness = evaluateBuilderPlatformReadiness({
        sceneCount: project.scenes.size,
        spriteManifestCount: project.spriteAtlases.size,
        aiFeatures: features,
        rendererPreference: appConfig.playableGame.rendererPreference,
        onnxDevice: appConfig.ai.onnxDevice,
      });
      const body = renderAiPanel(
        messages,
        features,
        deriveFeatureCapability(registryStatus),
        await getAiRuntimeProfile(),
        builderLocale,
        projectId,
        readiness,
        await knowledgeBaseService.listDocuments(projectId),
      );
      return wrapOrPartialConsole(
        request,
        builderLocale,
        messages,
        "settings",
        builderCurrentPath,
        projectId,
        chromeProject,
        body,
        oraclePanelState,
      );
    },
  );
