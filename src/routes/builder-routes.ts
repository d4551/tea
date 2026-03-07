/**
 * Builder Page Routes
 *
 * Server-rendered HTMX pages for the game builder dashboard.
 * Each route renders the full page on direct navigation, or the content
 * partial on HTMX requests (detected via HX-Request header).
 */
import { Elysia } from "elysia";
import { appConfig } from "../config/environment.ts";
import { getAiRuntimeProfile } from "../domain/ai/local-runtime-profile.ts";
import { builderService } from "../domain/builder/builder-service.ts";
import { evaluateBuilderPlatformReadiness } from "../domain/builder/platform-readiness.ts";
import { detectAvailableFeatures } from "../domain/game/ai/game-ai-service.ts";
import { gameScenes, gameSpriteManifests } from "../domain/game/data/sprite-data.ts";
import { gameLoop } from "../domain/game/game-loop.ts";
import { builderRequestContextPlugin } from "../plugins/builder-request-context.ts";
import { assetRelativePaths, toPublicAssetUrl } from "../shared/constants/assets.ts";
import {
  resolveRequestPathWithQuery,
  resolveRequestQueryParam,
} from "../shared/constants/routes.ts";
import { getMessages } from "../shared/i18n/translator.ts";
import { renderAiPanel } from "../views/builder/ai-panel.ts";
import { renderAssetsEditor } from "../views/builder/assets-editor.ts";
import { renderAutomationPanel } from "../views/builder/automation-panel.ts";
import { type DashboardStats, renderBuilderDashboard } from "../views/builder/builder-dashboard.ts";
import { type BuilderChromeProject, renderBuilderLayout } from "../views/builder/builder-layout.ts";
import { renderDialogueEditor } from "../views/builder/dialogue-editor.ts";
import { renderMechanicsEditor } from "../views/builder/mechanics-editor.ts";
import { renderNpcEditor } from "../views/builder/npc-editor.ts";
import { renderPlatformReadinessSection } from "../views/builder/platform-readiness.ts";
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
  if (isHtmx) return body;
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

  const builderBody = renderBuilderLayout({
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
  };
  return renderDocument(layout, messages.builder.title, builderBody, mergedScripts);
};

const toRecord = <T>(records: ReadonlyMap<string, T>): Record<string, T> =>
  Object.fromEntries(Array.from(records.entries()));

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
      return wrapOrPartial(
        request,
        builderLocale,
        messages,
        "dashboard",
        builderCurrentPath,
        builderProjectId,
        chromeProject,
        `<div role="alert" class="alert alert-warning alert-soft">${escapeHtml(messages.builder.projectNotFound)}</div>`,
      );
    }
    const totalScenes = project.scenes.size;
    const totalNpcs = Array.from(project.scenes.values()).reduce(
      (acc, scene) => acc + scene.npcs.length,
      0,
    );

    const stats: DashboardStats = {
      activeSessions: await gameLoop.countActiveSessions(),
      totalScenes,
      totalNpcs,
      aiAvailable: features.providers.length > 0,
      providers: [...features.providers],
      readiness: evaluateBuilderPlatformReadiness({
        sceneCount: totalScenes,
        spriteManifestCount: Object.keys(gameSpriteManifests).length,
        aiFeatures: features,
        rendererPreference: appConfig.playableGame.rendererPreference,
        onnxDevice: appConfig.ai.onnxDevice,
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
      "dashboard",
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
      return wrapOrPartial(
        request,
        builderLocale,
        messages,
        "scenes",
        builderCurrentPath,
        builderProjectId,
        chromeProject,
        `<div role="alert" class="alert alert-warning alert-soft">${escapeHtml(messages.builder.projectNotFound)}</div>`,
      );
    }
    const scenes = toRecord(project.scenes);
    const body = renderSceneEditor(messages, scenes, builderLocale, builderProjectId);
    return wrapOrPartial(
      request,
      builderLocale,
      messages,
      "scenes",
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
      return wrapOrPartial(
        request,
        builderLocale,
        messages,
        "npcs",
        builderCurrentPath,
        builderProjectId,
        chromeProject,
        `<div role="alert" class="alert alert-warning alert-soft">${escapeHtml(messages.builder.projectNotFound)}</div>`,
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
      "npcs",
      builderCurrentPath,
      builderProjectId,
      chromeProject,
      body,
    );
  })
  .get("/dialogue", async ({ request, builderLocale, builderProjectId, builderCurrentPath }) => {
    const messages = getMessages(builderLocale);
    const project = await builderService.getProject(builderProjectId);
    const chromeProject = toChromeProject(project);
    const catalog = await builderService.getDialogues(builderProjectId, builderLocale);
    const search = resolveRequestQueryParam(request, "search")?.trim() ?? "";
    const body = renderDialogueEditor(messages, catalog, builderLocale, builderProjectId, search);
    return wrapOrPartial(
      request,
      builderLocale,
      messages,
      "dialogue",
      builderCurrentPath,
      builderProjectId,
      chromeProject,
      body,
    );
  })
  .get("/assets", async ({ request, builderLocale, builderProjectId, builderCurrentPath }) => {
    const messages = getMessages(builderLocale);
    const project = await builderService.getProject(builderProjectId);
    const chromeProject = toChromeProject(project);
    if (!project) {
      return wrapOrPartial(
        request,
        builderLocale,
        messages,
        "assets",
        builderCurrentPath,
        builderProjectId,
        chromeProject,
        `<div role="alert" class="alert alert-warning alert-soft">${escapeHtml(messages.builder.projectNotFound)}</div>`,
      );
    }
    const features = await detectAvailableFeatures();
    const readiness = evaluateBuilderPlatformReadiness({
      sceneCount: project.scenes.size,
      spriteManifestCount: project.assets.size,
      aiFeatures: features,
      rendererPreference: appConfig.playableGame.rendererPreference,
      onnxDevice: appConfig.ai.onnxDevice,
    });

    const body = `
      <section class="space-y-8">
        <div class="flex flex-col gap-2">
          <h1 class="text-3xl font-bold">${escapeHtml(messages.builder.assets)}</h1>
          <p class="max-w-3xl text-base-content/70">${escapeHtml(messages.builder.assetPlaceholder)}</p>
        </div>

        <div role="alert" class="alert alert-warning alert-soft">
          <span>${escapeHtml(messages.builder.platformReadinessWarning)}</span>
        </div>

        ${renderPlatformReadinessSection({
          messages,
          locale: builderLocale,
          projectId: builderProjectId,
          readiness,
          keys: ["runtime2d", "runtime3d", "spritePipeline", "animationPipeline"],
        })}

        ${renderAssetsEditor(
          messages,
          builderLocale,
          builderProjectId,
          Array.from(project.assets.values()),
          Array.from(project.animationClips.values()),
          Array.from(project.generationJobs.values()),
          Array.from(project.artifacts.values()),
        )}
      </section>`;
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
      return wrapOrPartial(
        request,
        builderLocale,
        messages,
        "mechanics",
        builderCurrentPath,
        builderProjectId,
        chromeProject,
        `<div role="alert" class="alert alert-warning alert-soft">${escapeHtml(messages.builder.projectNotFound)}</div>`,
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
      "mechanics",
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
      return wrapOrPartial(
        request,
        builderLocale,
        messages,
        "automation",
        builderCurrentPath,
        builderProjectId,
        chromeProject,
        `<div role="alert" class="alert alert-warning alert-soft">${escapeHtml(messages.builder.projectNotFound)}</div>`,
      );
    }
    const body = renderAutomationPanel(
      messages,
      builderLocale,
      builderProjectId,
      Array.from(project.automationRuns.values()),
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
