/**
 * Builder Page Routes
 *
 * Server-rendered HTMX pages for the game builder dashboard.
 * Each route renders the full page on direct navigation, or the content
 * partial on HTMX requests (detected via HX-Request header).
 */
import { Elysia } from "elysia";
import { appConfig } from "../config/environment.ts";
import { builderService, defaultBuilderProjectId } from "../domain/builder/builder-service.ts";
import { detectAvailableFeatures } from "../domain/game/ai/game-ai-service.ts";
import { gameSpriteManifests } from "../domain/game/data/sprite-data.ts";
import { assetRelativePaths, toPublicAssetUrl } from "../shared/constants/assets.ts";
import { getMessages, resolveRequestLocale } from "../shared/i18n/translator.ts";
import { renderAiPanel } from "../views/builder/ai-panel.ts";
import { type DashboardStats, renderBuilderDashboard } from "../views/builder/builder-dashboard.ts";
import { renderBuilderLayout } from "../views/builder/builder-layout.ts";
import { renderDialogueEditor } from "../views/builder/dialogue-editor.ts";
import { renderNpcEditor } from "../views/builder/npc-editor.ts";
import { renderSceneEditor } from "../views/builder/scene-editor.ts";
import { renderLayout } from "../views/layout.ts";

/**
 * Wraps builder content in the full page layout or returns partial for HTMX.
 */
const wrapOrPartial = (
  request: Request,
  locale: Parameters<typeof renderLayout>[0]["locale"],
  messages: ReturnType<typeof getMessages>,
  activeTab: string,
  body: string,
): string => {
  const isHtmx = request.headers.get("HX-Request") === "true";
  if (isHtmx) return body;
  const url = new URL(request.url);
  const currentPathWithQuery = `${url.pathname}${url.search}`;

  const builderBody = renderBuilderLayout({ locale, messages, activeTab, body });
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
    ],
  });
};

const resolveProjectId = (request: Request): string => {
  const rawProjectId = new URL(request.url).searchParams.get("projectId")?.trim() ?? "";
  return rawProjectId.length > 0 ? rawProjectId : defaultBuilderProjectId;
};

const toRecord = <T>(records: ReadonlyMap<string, T>): Record<string, T> =>
  Object.fromEntries(Array.from(records.entries()));

export const builderRoutes = new Elysia({ prefix: "/builder" })
  .get("/", async ({ request }) => {
    const locale = resolveRequestLocale(request);
    const messages = getMessages(locale);
    const features = await detectAvailableFeatures();
    const project = await builderService.getProject(resolveProjectId(request));
    if (!project) {
      return wrapOrPartial(
        request,
        locale,
        messages,
        "dashboard",
        `<p>${messages.builder.projectNotFound}</p>`,
      );
    }
    const totalScenes = project.scenes.size;
    const totalNpcs = Array.from(project.scenes.values()).reduce(
      (acc, scene) => acc + scene.npcs.length,
      0,
    );

    const stats: DashboardStats = {
      activeSessions: 0,
      totalScenes,
      totalNpcs,
      aiAvailable: features.providers.length > 0,
      providers: [...features.providers],
    };
    const body = renderBuilderDashboard(messages, locale, stats);
    return wrapOrPartial(request, locale, messages, "dashboard", body);
  })
  .get("/scenes", async ({ request }) => {
    const locale = resolveRequestLocale(request);
    const messages = getMessages(locale);
    const projectId = resolveProjectId(request);
    const project = await builderService.getProject(projectId);
    if (!project) {
      return wrapOrPartial(
        request,
        locale,
        messages,
        "scenes",
        `<p>${messages.builder.projectNotFound}</p>`,
      );
    }
    const scenes = toRecord(project.scenes);
    const body = renderSceneEditor(messages, scenes, locale, projectId);
    return wrapOrPartial(request, locale, messages, "scenes", body);
  })
  .get("/npcs", async ({ request }) => {
    const locale = resolveRequestLocale(request);
    const messages = getMessages(locale);
    const projectId = resolveProjectId(request);
    const project = await builderService.getProject(projectId);
    if (!project) {
      return wrapOrPartial(
        request,
        locale,
        messages,
        "npcs",
        `<p>${messages.builder.projectNotFound}</p>`,
      );
    }
    const scenes = toRecord(project.scenes);
    const body = renderNpcEditor(messages, scenes, gameSpriteManifests, locale, projectId);
    return wrapOrPartial(request, locale, messages, "npcs", body);
  })
  .get("/dialogue", async ({ request }) => {
    const locale = resolveRequestLocale(request);
    const messages = getMessages(locale);
    const projectId = resolveProjectId(request);
    const catalog = await builderService.getDialogues(projectId, locale);
    const body = renderDialogueEditor(messages, catalog, locale, projectId);
    return wrapOrPartial(request, locale, messages, "dialogue", body);
  })
  .get("/assets", ({ request }) => {
    const locale = resolveRequestLocale(request);
    const messages = getMessages(locale);
    const body = `<div class="space-y-4"><h1 class="text-2xl font-bold">${messages.builder.assets}</h1><p class="text-base-content/60">${messages.builder.assetPlaceholder}</p></div>`;
    return wrapOrPartial(request, locale, messages, "assets", body);
  })
  .get("/ai", async ({ request }) => {
    const locale = resolveRequestLocale(request);
    const messages = getMessages(locale);
    const projectId = resolveProjectId(request);
    const features = await detectAvailableFeatures();
    const body = renderAiPanel(messages, features, locale, projectId);
    return wrapOrPartial(request, locale, messages, "ai", body);
  });
