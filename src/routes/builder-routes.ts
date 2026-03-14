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
import { builderService, defaultBuilderProjectId } from "../domain/builder/builder-service.ts";
import {
  deriveBuilderReadinessAudit,
  evaluateBuilderPlatformReadiness,
} from "../domain/builder/platform-readiness.ts";
import { detectAvailableFeatures } from "../domain/game/ai/game-ai-service.ts";
import { gameSpriteManifests } from "../domain/game/data/sprite-data.ts";
import { gameLoop } from "../domain/game/game-loop.ts";
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
import { type LayoutContext, type LayoutScript, renderDocument } from "../views/layout.ts";

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
    hideTopBar: true,
    hideFooter: true,
  };
  return renderDocument(layout, messages.builder.advancedTools, consoleBody, []);
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

export const builderRoutes = new Elysia({ prefix: "/projects" })
  .use(builderRequestContextPlugin)
  .get("/new", async ({ request, builderLocale, builderCurrentPath }) => {
    const messages = getMessages(builderLocale);
    return wrapOrPartial(
      request,
      builderLocale,
      messages,
      "start",
      builderCurrentPath,
      defaultBuilderProjectId,
      null,
      renderBuilderStarterWorkspace(
        messages,
        builderLocale,
        defaultBuilderProjectId,
        appRoutes.builderStart,
      ),
    );
  })
  .get(
    "/:projectId/start",
    async ({ request, builderLocale, builderProjectId, builderCurrentPath }) => {
      const messages = getMessages(builderLocale);
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
      const features = await detectAvailableFeatures();
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
        creatorCapabilities: deriveCreatorCapabilities(messages, features, readiness),
      };
      const body = renderBuilderDashboard(
        messages,
        builderLocale,
        dashboard,
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
    },
  )
  .get(
    "/:projectId/world",
    async ({ request, builderLocale, builderProjectId, builderCurrentPath, builderSearch }) => {
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
      const searchParams = new URL(request.url).searchParams;
      const scenes = toRecord(project.scenes);
      const body = renderSceneEditor(
        messages,
        scenes,
        builderLocale,
        builderProjectId,
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
        builderProjectId,
        chromeProject,
        body,
      );
    },
  )
  .get(
    "/:projectId/characters",
    async ({ request, builderLocale, builderProjectId, builderCurrentPath }) => {
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
    },
  )
  .get(
    "/:projectId/story",
    async ({ request, builderLocale, builderProjectId, builderCurrentPath, builderSearch }) => {
      const messages = getMessages(builderLocale);
      const project = await builderService.getProject(builderProjectId);
      const chromeProject = toChromeProject(project);
      if (!project) {
        return wrapMissingProject(
          request,
          builderLocale,
          messages,
          "story",
          builderCurrentPath,
          builderProjectId,
          chromeProject,
        );
      }
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
  .get(
    "/:projectId/assets",
    async ({ request, builderLocale, builderProjectId, builderCurrentPath, builderSearch }) => {
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
      const searchParams = new URL(request.url).searchParams;
      const body = renderAssetsEditor(
        messages,
        builderLocale,
        builderProjectId,
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
        builderProjectId,
        chromeProject,
        body,
      );
    },
  )
  .get(
    "/:projectId/systems",
    async ({ request, builderLocale, builderProjectId, builderCurrentPath }) => {
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
    },
  )
  .get(
    "/:projectId/operations",
    async ({ request, builderLocale, builderProjectId, builderCurrentPath }) => {
      const messages = getMessages(builderLocale);
      const project = await builderService.getProject(builderProjectId);
      const chromeProject = toChromeProject(project);
      if (!project) {
        return wrapMissingProject(
          request,
          builderLocale,
          messages,
          "operations",
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
      return wrapOrPartialConsole(
        request,
        builderLocale,
        messages,
        "operations",
        builderCurrentPath,
        builderProjectId,
        chromeProject,
        body,
      );
    },
  )
  .get(
    "/:projectId/settings",
    async ({ request, builderLocale, builderProjectId, builderCurrentPath }) => {
      const messages = getMessages(builderLocale);
      const project = await builderService.getProject(builderProjectId);
      const chromeProject = toChromeProject(project);
      if (!project) {
        return wrapMissingProject(
          request,
          builderLocale,
          messages,
          "settings",
          builderCurrentPath,
          builderProjectId,
          chromeProject,
        );
      }
      const features = await detectAvailableFeatures();
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
        getAiRuntimeProfile(),
        builderLocale,
        builderProjectId,
        readiness,
        await knowledgeBaseService.listDocuments(builderProjectId),
      );
      return wrapOrPartialConsole(
        request,
        builderLocale,
        messages,
        "settings",
        builderCurrentPath,
        builderProjectId,
        chromeProject,
        body,
      );
    },
  );
