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
import { detectAvailableFeatures } from "../domain/game/ai/game-ai-service.ts";
import { gameScenes, gameSpriteManifests } from "../domain/game/data/sprite-data.ts";
import { assetRelativePaths, toPublicAssetUrl } from "../shared/constants/assets.ts";
import { gameAssetUrls } from "../shared/constants/game-assets.ts";
import { getMessages, resolveRequestLocale } from "../shared/i18n/translator.ts";
import { prisma } from "../shared/services/db.ts";
import { renderAiPanel } from "../views/builder/ai-panel.ts";
import { type DashboardStats, renderBuilderDashboard } from "../views/builder/builder-dashboard.ts";
import { renderBuilderLayout } from "../views/builder/builder-layout.ts";
import { renderDialogueEditor } from "../views/builder/dialogue-editor.ts";
import { renderNpcEditor } from "../views/builder/npc-editor.ts";
import { renderSceneEditor } from "../views/builder/scene-editor.ts";
import { escapeHtml, renderLayout } from "../views/layout.ts";

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
      activeSessions: await prisma.gameSession.count(),
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
  .get("/assets", async ({ request }) => {
    const locale = resolveRequestLocale(request);
    const messages = getMessages(locale);
    const sceneCards = Object.values(gameScenes)
      .map(
        (scene) => `
          <article class="card card-border bg-base-100 shadow-sm">
            <figure class="bg-base-200">
              <img src="${escapeHtml(scene.background)}" alt="${escapeHtml(scene.id)}" class="h-48 w-full object-cover" />
            </figure>
            <div class="card-body gap-3">
              <div class="flex items-center justify-between gap-3">
                <h2 class="card-title">${escapeHtml(scene.id)}</h2>
                <span class="badge badge-outline">${scene.geometry.width}×${scene.geometry.height}</span>
              </div>
              <p class="text-sm text-base-content/70">${escapeHtml(scene.titleKey)}</p>
              <div class="card-actions">
                <span class="badge badge-soft">${scene.npcs.length} NPCs</span>
                <span class="badge badge-soft">${scene.collisions.length} collision masks</span>
              </div>
            </div>
          </article>`,
      )
      .join("");

    const spriteCards = Object.entries(gameSpriteManifests)
      .map(
        ([key, manifest]) => `
          <article class="card card-border bg-base-100 shadow-sm">
            <figure class="bg-base-200 p-4">
              <img src="${escapeHtml(manifest.sheet)}" alt="${escapeHtml(key)}" class="h-40 w-full object-contain" />
            </figure>
            <div class="card-body gap-3">
              <div class="flex items-center justify-between gap-3">
                <h2 class="card-title">${escapeHtml(key)}</h2>
                <span class="badge badge-outline">${manifest.cols}×${manifest.rows}</span>
              </div>
              <p class="text-sm text-base-content/70">${escapeHtml(manifest.sheet)}</p>
              <div class="card-actions">
                <span class="badge badge-soft">${manifest.frameWidth}×${manifest.frameHeight}</span>
                <span class="badge badge-soft">scale ${manifest.scale}</span>
              </div>
            </div>
          </article>`,
      )
      .join("");

    const body = `
      <section class="space-y-8">
        <div class="flex flex-col gap-2">
          <h1 class="text-3xl font-bold">${escapeHtml(messages.builder.assets)}</h1>
          <p class="max-w-3xl text-base-content/70">${escapeHtml(messages.builder.assetPlaceholder)}</p>
        </div>

        <div class="grid gap-4 md:grid-cols-3">
          <article class="card card-border bg-base-100 shadow-sm">
            <div class="card-body">
              <h2 class="card-title">Runtime mount</h2>
              <p class="text-sm text-base-content/70">${escapeHtml(appConfig.playableGame.assetPrefix)}</p>
              <div class="card-actions"><span class="badge badge-primary">Playable client</span></div>
            </div>
          </article>
          <article class="card card-border bg-base-100 shadow-sm">
            <div class="card-body">
              <h2 class="card-title">Background</h2>
              <p class="text-sm text-base-content/70">${escapeHtml(gameAssetUrls.teaHouseBackground)}</p>
              <div class="card-actions"><span class="badge badge-soft">Mounted asset</span></div>
            </div>
          </article>
          <article class="card card-border bg-base-100 shadow-sm">
            <div class="card-body">
              <h2 class="card-title">Sprite sheets</h2>
              <p class="text-sm text-base-content/70">${Object.keys(gameSpriteManifests).length} runtime manifests</p>
              <div class="card-actions"><span class="badge badge-soft">Pixi renderer</span></div>
            </div>
          </article>
        </div>

        <section class="space-y-4">
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-2xl font-semibold">Scenes</h2>
            <span class="badge badge-outline">${Object.keys(gameScenes).length}</span>
          </div>
          <div class="grid gap-6 xl:grid-cols-2">${sceneCards}</div>
        </section>

        <section class="space-y-4">
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-2xl font-semibold">Sprites</h2>
            <span class="badge badge-outline">${Object.keys(gameSpriteManifests).length}</span>
          </div>
          <div class="grid gap-6 xl:grid-cols-2">${spriteCards}</div>
        </section>
      </section>`;
    return wrapOrPartial(request, locale, messages, "assets", body);
  })
  .get("/ai", async ({ request }) => {
    const locale = resolveRequestLocale(request);
    const messages = getMessages(locale);
    const projectId = resolveProjectId(request);
    const features = await detectAvailableFeatures();
    const body = renderAiPanel(messages, features, getAiRuntimeProfile(), locale, projectId);
    return wrapOrPartial(request, locale, messages, "ai", body);
  });
