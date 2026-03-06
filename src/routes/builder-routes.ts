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
import { builderService, defaultBuilderProjectId } from "../domain/builder/builder-service.ts";
import { evaluateBuilderPlatformReadiness } from "../domain/builder/platform-readiness.ts";
import { detectAvailableFeatures } from "../domain/game/ai/game-ai-service.ts";
import { gameScenes, gameSpriteManifests } from "../domain/game/data/sprite-data.ts";
import { assetRelativePaths, toPublicAssetUrl } from "../shared/constants/assets.ts";
import { gameAssetUrls } from "../shared/constants/game-assets.ts";
import { getMessages, resolveRequestLocale } from "../shared/i18n/translator.ts";
import { prisma } from "../shared/services/db.ts";
import { renderAiPanel } from "../views/builder/ai-panel.ts";
import { renderAssetsEditor } from "../views/builder/assets-editor.ts";
import { renderAutomationPanel } from "../views/builder/automation-panel.ts";
import { type DashboardStats, renderBuilderDashboard } from "../views/builder/builder-dashboard.ts";
import {
  type BuilderChromeProject,
  renderBuilderLayout,
} from "../views/builder/builder-layout.ts";
import { renderDialogueEditor } from "../views/builder/dialogue-editor.ts";
import { renderMechanicsEditor } from "../views/builder/mechanics-editor.ts";
import { renderNpcEditor } from "../views/builder/npc-editor.ts";
import { renderPlatformReadinessSection } from "../views/builder/platform-readiness.ts";
import { renderSceneEditor } from "../views/builder/scene-editor.ts";
import { escapeHtml, renderLayout } from "../views/layout.ts";
import type { LayoutScript } from "../views/layout.ts";

/**
 * Wraps builder content in the full page layout or returns partial for HTMX.
 */
const wrapOrPartial = (
  request: Request,
  locale: Parameters<typeof renderLayout>[0]["locale"],
  messages: ReturnType<typeof getMessages>,
  activeTab: string,
  projectId: string,
  project: BuilderChromeProject | null,
  body: string,
  scripts: readonly LayoutScript[] = [],
): string => {
  const isHtmx = request.headers.get("HX-Request") === "true";
  if (isHtmx) return body;
  const url = new URL(request.url);
  const currentPathWithQuery = `${url.pathname}${url.search}`;

  const builderBody = renderBuilderLayout({
    locale,
    messages,
    activeTab,
    currentPath: url.pathname,
    projectId,
    project,
    body,
  });
  return renderLayout({
    locale,
    title: messages.builder.title,
    messages,
    activeRoute: "builder",
    currentPathWithQuery,
    body: builderBody,
    scripts: [
      {
        src: toPublicAssetUrl(
          appConfig.staticAssets.publicPrefix,
          assetRelativePaths.htmxExtensionFocusPanelFile,
        ),
      },
      ...scripts,
    ],
  });
};

const resolveProjectId = (request: Request): string => {
  const rawProjectId = new URL(request.url).searchParams.get("projectId")?.trim() ?? "";
  return rawProjectId.length > 0 ? rawProjectId : defaultBuilderProjectId;
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
  .get("/", async ({ request }) => {
    const locale = resolveRequestLocale(request);
    const messages = getMessages(locale);
    const features = await detectAvailableFeatures();
    const projectId = resolveProjectId(request);
    const project = await builderService.getProject(projectId);
    const chromeProject = toChromeProject(project);
    if (!project) {
      return wrapOrPartial(
        request,
        locale,
        messages,
        "dashboard",
        projectId,
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
      activeSessions: await prisma.gameSession.count(),
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
    const body = renderBuilderDashboard(messages, locale, stats, projectId, project.published);
    return wrapOrPartial(request, locale, messages, "dashboard", projectId, chromeProject, body);
  })
  .get("/scenes", async ({ request }) => {
    const locale = resolveRequestLocale(request);
    const messages = getMessages(locale);
    const projectId = resolveProjectId(request);
    const project = await builderService.getProject(projectId);
    const chromeProject = toChromeProject(project);
    if (!project) {
      return wrapOrPartial(
        request,
        locale,
        messages,
        "scenes",
        projectId,
        chromeProject,
        `<div role="alert" class="alert alert-warning alert-soft">${escapeHtml(messages.builder.projectNotFound)}</div>`,
      );
    }
    const scenes = toRecord(project.scenes);
    const body = renderSceneEditor(messages, scenes, locale, projectId);
    return wrapOrPartial(request, locale, messages, "scenes", projectId, chromeProject, body, [
      {
        src: toPublicAssetUrl(
          appConfig.staticAssets.publicPrefix,
          assetRelativePaths.builderSceneEditorBundleFile,
        ),
        type: "module",
      },
    ]);
  })
  .get("/npcs", async ({ request }) => {
    const locale = resolveRequestLocale(request);
    const messages = getMessages(locale);
    const projectId = resolveProjectId(request);
    const project = await builderService.getProject(projectId);
    const chromeProject = toChromeProject(project);
    if (!project) {
      return wrapOrPartial(
        request,
        locale,
        messages,
        "npcs",
        projectId,
        chromeProject,
        `<div role="alert" class="alert alert-warning alert-soft">${escapeHtml(messages.builder.projectNotFound)}</div>`,
      );
    }
    const scenes = toRecord(project.scenes);
    const body = renderNpcEditor(messages, scenes, gameSpriteManifests, locale, projectId);
    return wrapOrPartial(request, locale, messages, "npcs", projectId, chromeProject, body);
  })
  .get("/dialogue", async ({ request }) => {
    const locale = resolveRequestLocale(request);
    const messages = getMessages(locale);
    const projectId = resolveProjectId(request);
    const project = await builderService.getProject(projectId);
    const chromeProject = toChromeProject(project);
    const catalog = await builderService.getDialogues(projectId, locale);
    const search = new URL(request.url).searchParams.get("search")?.trim() ?? "";
    const body = renderDialogueEditor(messages, catalog, locale, projectId, search);
    return wrapOrPartial(request, locale, messages, "dialogue", projectId, chromeProject, body);
  })
  .get("/assets", async ({ request }) => {
    const locale = resolveRequestLocale(request);
    const messages = getMessages(locale);
    const projectId = resolveProjectId(request);
    const project = await builderService.getProject(projectId);
    const chromeProject = toChromeProject(project);
    if (!project) {
      return wrapOrPartial(
        request,
        locale,
        messages,
        "assets",
        projectId,
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
          locale,
          projectId,
          readiness,
          keys: ["runtime2d", "runtime3d", "spritePipeline", "animationPipeline"],
        })}

        ${renderAssetsEditor(
          messages,
          locale,
          projectId,
          Array.from(project.assets.values()),
          Array.from(project.animationClips.values()),
          Array.from(project.generationJobs.values()),
          Array.from(project.artifacts.values()),
        )}
      </section>`;
    return wrapOrPartial(request, locale, messages, "assets", projectId, chromeProject, body);
  })
  .get("/mechanics", async ({ request }) => {
    const locale = resolveRequestLocale(request);
    const messages = getMessages(locale);
    const projectId = resolveProjectId(request);
    const project = await builderService.getProject(projectId);
    const chromeProject = toChromeProject(project);
    if (!project) {
      return wrapOrPartial(
        request,
        locale,
        messages,
        "mechanics",
        projectId,
        chromeProject,
        `<div role="alert" class="alert alert-warning alert-soft">${escapeHtml(messages.builder.projectNotFound)}</div>`,
      );
    }
    const body = renderMechanicsEditor(
      messages,
      locale,
      projectId,
      Array.from(project.quests.values()),
      Array.from(project.triggers.values()),
      Array.from(project.dialogueGraphs.values()),
      Array.from(project.flags.values()),
    );
    return wrapOrPartial(request, locale, messages, "mechanics", projectId, chromeProject, body);
  })
  .get("/automation", async ({ request }) => {
    const locale = resolveRequestLocale(request);
    const messages = getMessages(locale);
    const projectId = resolveProjectId(request);
    const project = await builderService.getProject(projectId);
    const chromeProject = toChromeProject(project);
    if (!project) {
      return wrapOrPartial(
        request,
        locale,
        messages,
        "automation",
        projectId,
        chromeProject,
        `<div role="alert" class="alert alert-warning alert-soft">${escapeHtml(messages.builder.projectNotFound)}</div>`,
      );
    }
    const body = renderAutomationPanel(
      messages,
      locale,
      projectId,
      Array.from(project.automationRuns.values()),
    );
    return wrapOrPartial(request, locale, messages, "automation", projectId, chromeProject, body);
  })
  .get("/ai", async ({ request }) => {
    const locale = resolveRequestLocale(request);
    const messages = getMessages(locale);
    const projectId = resolveProjectId(request);
    const project = await builderService.getProject(projectId);
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
      locale,
      projectId,
      readiness,
    );
    return wrapOrPartial(request, locale, messages, "ai", projectId, chromeProject, body);
  });
