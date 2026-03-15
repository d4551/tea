import type { LocaleCode } from "../../config/environment.ts";
import {
  BUILDER_LIBRARY_PAGE_SIZE,
  DEFAULT_ANIMATION_FRAME_COUNT,
  DEFAULT_ANIMATION_PLAYBACK_FPS,
} from "../../shared/constants/builder-defaults.ts";
import {
  BUILDER_QUERY_PARAM_ASSET_ID,
  BUILDER_QUERY_PARAM_PAGE,
} from "../../shared/constants/builder-query.ts";
import { interpolateRoutePath } from "../../shared/constants/route-patterns.ts";
import { appRoutes, withQueryParameters } from "../../shared/constants/routes.ts";
import { humanizeBuilderIdentifier } from "../../domain/builder/builder-display.ts";
import type { AnimationClip, BuilderAsset, BuilderAssetKind } from "../../shared/contracts/game.ts";
import type { Messages } from "../../shared/i18n/messages.ts";
import { escapeHtml } from "../layout.ts";
import { renderActionDropdown } from "../shared/navigation.ts";
import {
  cardClasses,
  renderBuilderHiddenFields,
  renderEmptyStateCompact,
  spinnerClasses,
} from "../shared/ui-components.ts";
import { buildAnimationAuthoringContext, buildCreatorAssistContext } from "./builder-flow.ts";
import { buildBuilderJourneyConfig } from "./builder-journey.ts";
import { renderCreatorAssistPanel } from "./creator-assist-panel.ts";
import { getAssetKindLabel, getAssetLabel, getSceneModeLabel } from "./view-labels.ts";
import {
  paginateWorkspaceItems,
  renderWorkspaceBrowseControls,
  renderWorkspaceFrame,
  renderWorkspaceShell,
} from "./workspace-shell.ts";

/**
 * Renders the authored asset, clip, and contextual draft workspace.
 *
 * @param messages Locale-resolved messages.
 * @param locale Active locale.
 * @param projectId Active project identifier.
 * @param assets Authored assets.
 * @param clips Authored animation clips.
 * @param search Optional search filter text.
 * @param page Current pagination page.
 * @param selectedAssetId Currently selected asset identifier.
 * @returns HTML for the assets workspace.
 */
export const renderAssetsEditor = (
  messages: Messages,
  locale: LocaleCode,
  projectId: string,
  assets: readonly BuilderAsset[],
  clips: readonly AnimationClip[],
  search = "",
  page = 1,
  selectedAssetId = "",
): string => {
  const createAssetAction = appRoutes.builderApiAssetsCreateForm;
  const uploadAssetAction = appRoutes.builderApiAssetsUpload;
  const createClipAction = appRoutes.builderApiAnimationClipsCreateForm;
  const assetKindOptions: readonly BuilderAssetKind[] = [
    "portrait",
    "sprite-sheet",
    "background",
    "model",
    "audio",
  ];
  const assetKindOptionHtml = assetKindOptions
    .map(
      (option) =>
        `<option value="${option}">${escapeHtml(getAssetKindLabel(messages, option))}</option>`,
    )
    .join("");
  const normalizedSearch = search.trim().toLowerCase();
  const filteredAssets = assets
    .filter((asset) => {
      if (normalizedSearch.length === 0) {
        return true;
      }
      return (
        getAssetLabel(messages, asset).toLowerCase().includes(normalizedSearch) ||
        asset.id.toLowerCase().includes(normalizedSearch) ||
        asset.kind.toLowerCase().includes(normalizedSearch) ||
        asset.sceneMode.toLowerCase().includes(normalizedSearch) ||
        asset.source.toLowerCase().includes(normalizedSearch)
      );
    })
    .sort((left, right) =>
      getAssetLabel(messages, left).localeCompare(getAssetLabel(messages, right)),
    );
  const paginatedAssets = paginateWorkspaceItems(filteredAssets, page, BUILDER_LIBRARY_PAGE_SIZE);
  const selectedAsset =
    filteredAssets.find((asset) => asset.id === selectedAssetId) ??
    paginatedAssets.items[0] ??
    filteredAssets[0] ??
    null;
  const assetsPath = interpolateRoutePath(appRoutes.builderAssets, { projectId });
  const searchAction = withQueryParameters(assetsPath, {
    lang: locale,
  });
  const previousPageHref =
    paginatedAssets.page > 1
      ? withQueryParameters(assetsPath, {
          lang: locale,
          search,
          [BUILDER_QUERY_PARAM_PAGE]: String(paginatedAssets.page - 1),
          ...(selectedAsset ? { [BUILDER_QUERY_PARAM_ASSET_ID]: selectedAsset.id } : {}),
        })
      : undefined;
  const nextPageHref =
    paginatedAssets.page < paginatedAssets.totalPages
      ? withQueryParameters(assetsPath, {
          lang: locale,
          search,
          [BUILDER_QUERY_PARAM_PAGE]: String(paginatedAssets.page + 1),
          ...(selectedAsset ? { [BUILDER_QUERY_PARAM_ASSET_ID]: selectedAsset.id } : {}),
        })
      : undefined;
  const assetCards = paginatedAssets.items
    .map((asset) => {
      const isSelected = asset.id === selectedAsset?.id;
      const isImage =
        /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(asset.source) ||
        ["portrait", "sprite-sheet", "background"].includes(asset.kind);
      const detailHref = withQueryParameters(assetsPath, {
        lang: locale,
        search,
        [BUILDER_QUERY_PARAM_PAGE]: String(paginatedAssets.page),
        [BUILDER_QUERY_PARAM_ASSET_ID]: asset.id,
      });
      const previewHtml = isImage
        ? `<img src="${escapeHtml(asset.source)}" alt="${escapeHtml(asset.id)}" class="object-cover w-full h-full min-h-24 rounded-box bg-base-200" loading="lazy" onerror="this.outerHTML='<div class=\\'skeleton w-full min-h-24 rounded-box\\'></div>'" />`
        : `<div class="skeleton w-full h-24 rounded-box flex items-center justify-center text-base-content/40"><svg xmlns="http://www.w3.org/2000/svg" class="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/></svg></div>`;
      return `<article class="${cardClasses.bordered} card-compact ${isSelected ? "border-primary bg-primary/8" : ""}">
        <figure class="px-4 pt-4">
          <div class="overflow-hidden rounded-box bg-base-200 aspect-video max-h-24">${previewHtml}</div>
        </figure>
        <div class="card-body gap-2 p-4 pt-2">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <h3 class="card-title text-base truncate">${escapeHtml(getAssetLabel(messages, asset))}</h3>
              <p class="text-xs text-base-content/60 truncate">${escapeHtml(getAssetKindLabel(messages, asset.kind))}</p>
            </div>
            ${renderActionDropdown(
              messages.builder.openDetails,
              `<span class="btn btn-ghost btn-xs btn-square" aria-haspopup="menu">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/></svg>
              </span>`,
              [
                {
                  key: "open-source",
                  label: messages.builder.openDetails,
                  href: asset.source,
                  target: "_blank",
                  rel: "noreferrer",
                },
              ],
              { align: "end", widthClass: "w-40", menuClassName: "p-1" },
            )}
          </div>
          <div class="flex flex-wrap gap-1">
            <span class="badge badge-outline badge-sm">${escapeHtml(getAssetKindLabel(messages, asset.kind))}</span>
            <span class="badge badge-soft badge-sm">${escapeHtml(getSceneModeLabel(messages, asset.sceneMode))}</span>
            <span class="badge ${asset.approved ? "badge-success" : "badge-warning"} badge-soft badge-sm">${asset.approved ? escapeHtml(messages.builder.assetStatusApproved) : escapeHtml(messages.builder.assetStatusDraft)}</span>
          </div>
          <p class="break-all text-xs text-base-content/70 line-clamp-2">${escapeHtml(asset.source)}</p>
          <div class="card-actions justify-start">
            <a
              class="btn ${isSelected ? "btn-primary" : "btn-outline"} btn-sm"
              href="${escapeHtml(detailHref)}"
              hx-get="${escapeHtml(detailHref)}"
              hx-target="#builder-content"
              hx-swap="innerHTML"
              hx-push-url="true"
              aria-label="${escapeHtml(messages.builder.openDetails)}: ${escapeHtml(getAssetLabel(messages, asset))}"
            >${escapeHtml(messages.builder.openDetails)}</a>
          </div>
        </div>
      </article>`;
    })
    .join("");

  const clipCards = clips
    .map((clip) => {
      const durationMs =
        clip.frameCount > 0 && clip.playbackFps > 0
          ? Math.round((clip.frameCount / clip.playbackFps) * 1000)
          : 0;
      const durationLabel =
        durationMs > 0 ? `${(durationMs / 1000).toFixed(2)}s` : messages.common.notApplicable;
      const loopLabel = clip.loop
        ? messages.builder.clipTimelineLoop
        : messages.builder.clipTimelineNoLoop;

      return `<article class="${cardClasses.bordered}">
        <div class="card-body gap-2">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h3 class="card-title text-base">${escapeHtml(clip.label)}</h3>
              <p class="text-xs text-base-content/60">${escapeHtml(humanizeBuilderIdentifier(clip.stateTag))}</p>
            </div>
            <span class="badge badge-outline">${escapeHtml(getSceneModeLabel(messages, clip.sceneMode))}</span>
          </div>
          <div class="grid gap-2 text-sm text-base-content/75">
            <div>${escapeHtml(messages.builder.clipAssetLabel)}: ${escapeHtml(clip.assetId)}</div>
            <div>${escapeHtml(messages.builder.clipStateTagLabel)}: ${escapeHtml(clip.stateTag)}</div>
            <div>${escapeHtml(messages.builder.clipFrameCountLabel)}: ${clip.frameCount}</div>
          </div>
          <div class="mt-2 rounded-box bg-base-200/60 p-3" role="status" aria-label="${escapeHtml(messages.builder.clipTimelineDuration)}: ${escapeHtml(durationLabel)}">
            <div class="flex items-center justify-between text-xs text-base-content/70 mb-2">
              <span>${escapeHtml(messages.builder.clipTimelineDuration)}: ${escapeHtml(durationLabel)}</span>
              <span>${clip.playbackFps} ${escapeHtml(messages.builder.fpsUnit)}</span>
            </div>
            <progress class="progress progress-primary w-full" value="100" max="100" aria-hidden="true"></progress>
            <div class="flex items-center justify-between gap-2 mt-2">
              <span class="badge badge-xs badge-outline">${escapeHtml(messages.builder.clipFrameStart)}</span>
              <span class="badge badge-xs ${clip.loop ? "badge-success" : "badge-warning"} badge-soft">${escapeHtml(loopLabel)}</span>
              <span class="badge badge-xs badge-outline">${clip.frameCount}</span>
            </div>
          </div>
        </div>
      </article>`;
    })
    .join("");

  const emptyAssetAlert = renderEmptyStateCompact(
    messages.builder.noAssets,
    messages.builder.assetPlaceholder,
  );
  const assets2d = assets.filter((asset) => asset.sceneMode !== "3d").length;
  const assets3d = assets.filter((asset) => asset.sceneMode === "3d").length;
  const selectedAssetPreview =
    selectedAsset === null
      ? ""
      : /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(selectedAsset.source) ||
          ["portrait", "sprite-sheet", "background"].includes(selectedAsset.kind)
        ? `<img src="${escapeHtml(selectedAsset.source)}" alt="${escapeHtml(selectedAsset.id)}" class="aspect-video w-full rounded-box border border-base-300 bg-base-200 object-cover" loading="lazy" />`
        : `<div class="flex aspect-video items-center justify-center rounded-box border border-base-300 bg-base-200 text-sm text-base-content/60">${escapeHtml(getAssetKindLabel(messages, selectedAsset.kind))}</div>`;
  const creatorAssist = buildCreatorAssistContext(messages, locale, projectId, {
    entityType:
      selectedAsset?.kind === "portrait" || selectedAsset?.kind === "sprite-sheet"
        ? "character"
        : "asset",
    entityId: selectedAsset?.id ?? projectId,
    title: selectedAsset?.label ?? selectedAsset?.id ?? messages.builder.assets,
    targetId: selectedAsset?.id,
    assetKind: selectedAsset?.kind,
  });
  const animationContext =
    selectedAsset !== null
      ? buildAnimationAuthoringContext(selectedAsset.id, selectedAsset.sceneMode, messages)
      : null;
  const creatorJourney = buildBuilderJourneyConfig(messages, locale, projectId, "visuals");

  return `<section class="space-y-6 animate-fade-in-up">
    ${renderWorkspaceShell({
      eyebrow: messages.builder.assets,
      title: messages.builder.assetsWorkspaceTitle,
      description: messages.builder.assetsWorkspaceDescription,
      journey: creatorJourney,
      facets: [
        { label: messages.builder.capabilitySpritePipelineTitle, badgeClassName: "badge-warning" },
        {
          label: messages.builder.capabilityAnimationPipelineTitle,
          badgeClassName: "badge-warning",
        },
        { label: messages.builder.capability3dRuntimeTitle, badgeClassName: "badge-secondary" },
      ],
      metrics: [
        { label: messages.builder.assets, value: assets.length, toneClassName: "text-primary" },
        { label: messages.builder.animationClipsTitle, value: clips.length },
        { label: messages.builder.sceneMode2d, value: assets2d },
        {
          label: messages.builder.sceneMode3d,
          value: assets3d,
          toneClassName: assets3d > 0 ? "text-secondary" : "text-base-content",
        },
      ],
    })}
    ${renderWorkspaceFrame({
      navigatorTitle: messages.builder.assetsWorkspaceTitle,
      navigatorDescription: messages.builder.assetsWorkspaceDescription,
      navigatorBody: `${renderWorkspaceBrowseControls({
        action: searchAction,
        search,
        searchLabel: messages.builder.assetSearchLabel,
        searchPlaceholder: messages.builder.assetSearchPlaceholder,
        submitLabel: messages.builder.filterAction,
        resultsLabel: messages.builder.resultsLabel,
        previousLabel: messages.builder.previousPage,
        nextLabel: messages.builder.nextPage,
        pageLabel: messages.builder.pageLabel,
        page: paginatedAssets.page,
        totalPages: paginatedAssets.totalPages,
        totalItems: paginatedAssets.totalItems,
        startIndex: paginatedAssets.startIndex,
        endIndex: paginatedAssets.endIndex,
        hiddenFields: {
          lang: locale,
          projectId,
          ...(selectedAsset ? { [BUILDER_QUERY_PARAM_ASSET_ID]: selectedAsset.id } : {}),
        },
        htmxTarget: "#builder-content",
        previousHref: previousPageHref,
        nextHref: nextPageHref,
      })}
          <div class="space-y-3 max-h-[42vh] overflow-auto pr-1">
            ${assets.length === 0 ? emptyAssetAlert : assetCards}
          </div>
          <details class="collapse collapse-arrow rounded-box border border-base-300 bg-base-100">
            <summary class="collapse-title text-sm font-semibold">${escapeHtml(messages.builder.addAssetFile)}</summary>
            <div class="collapse-content pt-2">
              <form class="space-y-3" hx-post="${escapeHtml(uploadAssetAction)}" hx-target="#builder-content" hx-swap="innerHTML" hx-encoding="multipart/form-data" hx-indicator="#asset-upload-spinner" hx-disabled-elt="button, input, select, textarea">
                ${renderBuilderHiddenFields(projectId, locale)}
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">${escapeHtml(messages.builder.labelField)}</legend>
                  <input name="label" type="text" class="input w-full" placeholder="${escapeHtml(messages.builder.assetLabelPlaceholder)}" aria-required="true" required aria-label="${escapeHtml(messages.builder.labelField)}" />
                </fieldset>
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">${escapeHtml(messages.builder.assetKindLabel)}</legend>
                  <select name="kind" class="select w-full" aria-label="${escapeHtml(messages.builder.assetKindLabel)}">${assetKindOptionHtml}</select>
                </fieldset>
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">${escapeHtml(messages.builder.sceneModeLabel)}</legend>
                  <select name="sceneMode" class="select w-full" aria-label="${escapeHtml(messages.builder.sceneModeLabel)}">
                    <option value="2d">${escapeHtml(messages.builder.sceneMode2d)}</option>
                    <option value="3d">${escapeHtml(messages.builder.sceneMode3d)}</option>
                  </select>
                </fieldset>
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">${escapeHtml(messages.builder.uploadAsset)}</legend>
                  <input name="file" type="file" class="file-input file-input-sm w-full" accept="image/*,audio/*,.glb,.gltf,.usd,.usda,.usdc,.usdz,.json" aria-required="true" required aria-label="${escapeHtml(messages.builder.assetSourceLabel)}" />
                </fieldset>
                <details class="collapse collapse-arrow rounded-box border border-base-300 bg-base-100">
                  <summary class="collapse-title text-sm font-semibold">${escapeHtml(messages.builder.advancedTools)}</summary>
                  <div class="collapse-content pt-2">
                    <fieldset class="fieldset">
                      <legend class="fieldset-legend">${escapeHtml(messages.builder.assetIdFieldLabel)}</legend>
                      <input name="id" type="text" class="input w-full builder-mono" placeholder="${escapeHtml(messages.builder.assetIdPlaceholder)}" aria-label="${escapeHtml(messages.builder.assetIdFieldLabel)}" />
                    </fieldset>
                  </div>
                </details>
                <div class="flex items-center gap-2">
                  <button type="submit" class="btn btn-primary btn-sm" aria-label="${escapeHtml(messages.builder.addAssetFile)}">${escapeHtml(messages.builder.addAssetFile)}</button>
                  <span id="asset-upload-spinner" class="${spinnerClasses.sm}" aria-label="${escapeHtml(messages.common.loading)}"></span>
                </div>
              </form>
            </div>
          </details>
          <details class="collapse collapse-arrow rounded-box border border-base-300 bg-base-100">
            <summary class="collapse-title text-sm font-semibold">${escapeHtml(messages.builder.addAssetPath)}</summary>
            <div class="collapse-content pt-2">
              <form class="space-y-3" hx-post="${escapeHtml(createAssetAction)}" hx-target="#builder-content" hx-swap="innerHTML" hx-indicator="#asset-create-spinner" hx-disabled-elt="button, input, select, textarea">
                ${renderBuilderHiddenFields(projectId, locale)}
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">${escapeHtml(messages.builder.labelField)}</legend>
                  <input name="label" type="text" class="input w-full" placeholder="${escapeHtml(messages.builder.assetLabelPlaceholder)}" aria-required="true" required aria-label="${escapeHtml(messages.builder.labelField)}" />
                </fieldset>
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">${escapeHtml(messages.builder.assetKindLabel)}</legend>
                  <select name="kind" class="select w-full" aria-label="${escapeHtml(messages.builder.assetKindLabel)}">${assetKindOptionHtml}</select>
                </fieldset>
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">${escapeHtml(messages.builder.sceneModeLabel)}</legend>
                  <select name="sceneMode" class="select w-full" aria-label="${escapeHtml(messages.builder.sceneModeLabel)}">
                    <option value="2d">${escapeHtml(messages.builder.sceneMode2d)}</option>
                    <option value="3d">${escapeHtml(messages.builder.sceneMode3d)}</option>
                  </select>
                </fieldset>
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">${escapeHtml(messages.builder.assetSourceLabel)}</legend>
                  <input name="source" type="text" class="input w-full" placeholder="${escapeHtml(messages.builder.sourcePathPlaceholder)}" aria-required="true" required aria-label="${escapeHtml(messages.builder.assetSourceLabel)}" />
                </fieldset>
                <details class="collapse collapse-arrow rounded-box border border-base-300 bg-base-100">
                  <summary class="collapse-title text-sm font-semibold">${escapeHtml(messages.builder.advancedTools)}</summary>
                  <div class="collapse-content pt-2">
                    <fieldset class="fieldset">
                      <legend class="fieldset-legend">${escapeHtml(messages.builder.assetIdFieldLabel)}</legend>
                      <input name="id" type="text" class="input w-full builder-mono" placeholder="${escapeHtml(messages.builder.assetIdPlaceholder)}" aria-label="${escapeHtml(messages.builder.assetIdFieldLabel)}" />
                    </fieldset>
                  </div>
                </details>
                <div class="flex items-center gap-2">
                  <button type="submit" class="btn btn-outline btn-sm" aria-label="${escapeHtml(messages.builder.addAssetPath)}">${escapeHtml(messages.builder.addAssetPath)}</button>
                  <span id="asset-create-spinner" class="${spinnerClasses.sm}" aria-label="${escapeHtml(messages.common.loading)}"></span>
                </div>
              </form>
            </div>
          </details>`,
      mainBody: `<div class="space-y-4">
        ${
          selectedAsset
            ? `<article class="${cardClasses.bordered}">
                <div class="card-body gap-4">
                  <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div class="space-y-2">
                      <h2 class="card-title text-xl">${escapeHtml(getAssetLabel(messages, selectedAsset))}</h2>
                      <p class="text-sm leading-6 text-base-content/72">${escapeHtml(selectedAsset.source)}</p>
                    </div>
                    <div class="flex flex-wrap gap-2">
                      <span class="badge badge-outline">${escapeHtml(getAssetKindLabel(messages, selectedAsset.kind))}</span>
                      <span class="badge badge-soft">${escapeHtml(getSceneModeLabel(messages, selectedAsset.sceneMode))}</span>
                      <span class="badge ${selectedAsset.approved ? "badge-success" : "badge-warning"} badge-soft">${selectedAsset.approved ? escapeHtml(messages.builder.assetStatusApproved) : escapeHtml(messages.builder.assetStatusDraft)}</span>
                    </div>
                  </div>
                  <div class="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                    ${creatorAssist.actions
                      .map(
                        (
                          action,
                        ) => `<div class="rounded-box border border-base-300 bg-base-200/55 p-3">
                          <div class="font-medium">${escapeHtml(action.label)}</div>
                          <div class="mt-1 text-sm text-base-content/70">${escapeHtml(action.description)}</div>
                        </div>`,
                      )
                      .join("")}
                  </div>
                  ${renderCreatorAssistPanel(messages, locale, projectId, creatorAssist)}
                </div>
              </article>`
            : ""
        }
        <article class="${cardClasses.bordered}">
          <form class="card-body gap-3" hx-post="${escapeHtml(createClipAction)}" hx-target="#builder-content" hx-swap="innerHTML" hx-indicator="#clip-create-spinner" hx-disabled-elt="button, input, select, textarea">
          ${renderBuilderHiddenFields(projectId, locale)}
          <h2 class="card-title">${escapeHtml(messages.builder.animationAuthoringTitle)}</h2>
          <p class="text-sm text-base-content/70">${escapeHtml(messages.builder.animationAuthoringDescription)}</p>
          <fieldset class="fieldset">
            <legend class="fieldset-legend">${escapeHtml(messages.builder.clipAssetLabel)}</legend>
            <input name="assetId" type="text" class="input w-full" value="${escapeHtml(selectedAsset?.id ?? "")}" placeholder="${escapeHtml(messages.builder.assetIdPlaceholder)}" aria-required="true" required aria-label="${escapeHtml(messages.builder.clipAssetLabel)}" />
          </fieldset>
          <fieldset class="fieldset">
            <legend class="fieldset-legend">${escapeHtml(messages.builder.clipStateTagLabel)}</legend>
            <input name="stateTag" type="text" class="input w-full" placeholder="${escapeHtml(messages.builder.stateTagPlaceholder)}" aria-required="true" required aria-label="${escapeHtml(messages.builder.clipStateTagLabel)}" />
          </fieldset>
          <fieldset class="fieldset">
            <legend class="fieldset-legend">${escapeHtml(messages.builder.clipFrameCountLabel)}</legend>
            <input name="frameCount" type="number" class="input w-full" value="${DEFAULT_ANIMATION_FRAME_COUNT}" min="1" aria-label="${escapeHtml(messages.builder.clipFrameCountLabel)}" />
          </fieldset>
          <fieldset class="fieldset">
            <legend class="fieldset-legend">${escapeHtml(messages.builder.clipPlaybackLabel)}</legend>
            <input name="playbackFps" type="number" class="input w-full" value="${DEFAULT_ANIMATION_PLAYBACK_FPS}" min="1" aria-label="${escapeHtml(messages.builder.clipPlaybackLabel)}" />
          </fieldset>
          <details class="collapse collapse-arrow rounded-box border border-base-300 bg-base-100">
            <summary class="collapse-title text-sm font-semibold">${escapeHtml(messages.builder.advancedTools)}</summary>
            <div class="collapse-content pt-2">
              <fieldset class="fieldset">
                <legend class="fieldset-legend">${escapeHtml(messages.builder.clipIdLabel)}</legend>
                <input name="id" type="text" class="input w-full builder-mono" placeholder="${escapeHtml(messages.builder.clipIdPlaceholder)}" aria-label="${escapeHtml(messages.builder.animationClipIdFieldLabel)}" />
              </fieldset>
            </div>
          </details>
          <div class="flex items-center gap-2">
            <button type="submit" class="btn btn-outline btn-sm" aria-label="${escapeHtml(messages.builder.createAnimationClip)}">${escapeHtml(messages.builder.createAnimationClip)}</button>
            <span id="clip-create-spinner" class="${spinnerClasses.sm}" aria-label="${escapeHtml(messages.common.loading)}"></span>
          </div>
          ${
            animationContext
              ? `<div class="rounded-box border border-base-300 bg-base-200/50 p-3 text-sm leading-6 text-base-content/72">
                  <div class="font-medium">${escapeHtml(animationContext.assetId)}</div>
                  <div class="text-xs uppercase tracking-wide text-base-content/50">${escapeHtml(messages.builder.sceneModeLabel)}: ${escapeHtml(animationContext.sceneMode)}</div>
                  <ul class="mt-2 space-y-1">
                    ${animationContext.workflows
                      .map(
                        (workflow) =>
                          `<li>
                            <div class="font-medium">${escapeHtml(workflow.mode)}</div>
                            <ul class="ml-4 mt-1 list-disc">
                              ${workflow.actions.map((action) => `<li>${escapeHtml(action)}</li>`).join("")}
                            </ul>
                          </li>`,
                      )
                      .join("")}
                  </ul>
                </div>`
              : ""
          }
        </form>
        </article>
        <section class="space-y-3">
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-2xl font-semibold">${escapeHtml(messages.builder.animationClipsTitle)}</h2>
            <span class="badge badge-outline">${clips.length}</span>
          </div>
          <div class="grid gap-4 xl:grid-cols-2">${clips.length === 0 ? renderEmptyStateCompact(messages.builder.noAnimationClips, messages.builder.assetPlaceholder) : clipCards}</div>
        </section>
      </div>`,
      sideSections: [
        {
          title: messages.builder.preview,
          description:
            selectedAsset?.label ?? selectedAsset?.id ?? messages.builder.assetPlaceholder,
          body:
            selectedAsset === null
              ? `<div class="rounded-box border border-dashed border-base-300 bg-base-200/40 p-4 text-sm text-base-content/60">${escapeHtml(messages.builder.assetPlaceholder)}</div>`
              : `${selectedAssetPreview}
                <div class="flex flex-wrap gap-2">
                  <span class="badge badge-outline">${escapeHtml(getAssetKindLabel(messages, selectedAsset.kind))}</span>
                  <span class="badge badge-soft">${escapeHtml(getSceneModeLabel(messages, selectedAsset.sceneMode))}</span>
                  <span class="badge ${selectedAsset.approved ? "badge-success" : "badge-warning"} badge-soft">${selectedAsset.approved ? escapeHtml(messages.builder.assetStatusApproved) : escapeHtml(messages.builder.assetStatusDraft)}</span>
                </div>`,
        },
        {
          title: messages.builder.modePrimerTitle,
          description: messages.builder.modePrimerDescription,
          body: `<div class="space-y-3 text-sm leading-6 text-base-content/72">
            <div class="rounded-box border border-base-300 bg-base-200/55 p-3">
              <div class="font-medium text-primary">${escapeHtml(messages.builder.sceneMode2d)}</div>
              <p class="mt-1">${escapeHtml(messages.builder.assets2dGuide)}</p>
            </div>
            <div class="rounded-box border border-base-300 bg-base-200/55 p-3">
              <div class="font-medium text-secondary">${escapeHtml(messages.builder.sceneMode3d)}</div>
              <p class="mt-1">${escapeHtml(messages.builder.assets3dGuide)}</p>
            </div>
            <div class="rounded-box border border-base-300 bg-base-200/55 p-3">
              <div class="font-medium text-accent">${escapeHtml(messages.builder.modePrimerUsdTitle)}</div>
              <p class="mt-1">${escapeHtml(messages.builder.assetsUsdGuide)}</p>
            </div>
          </div>`,
        },
        {
          title: messages.builder.creatorAssistTitle,
          description: messages.builder.creatorAssistDescription,
          body: `<div class="space-y-3">
            <div class="rounded-box border border-base-300 bg-base-200/55 p-3 text-sm leading-6 text-base-content/72">
              <div class="font-medium">${escapeHtml(messages.builder.creatorAssistTitle)}</div>
              <p class="mt-1">${escapeHtml(messages.builder.creatorAssistDescription)}</p>
            </div>
            <div class="rounded-box border border-base-300 bg-base-200/55 p-3 text-sm leading-6 text-base-content/72">
              <div class="font-medium">${escapeHtml(messages.builder.animationAuthoringTitle)}</div>
              <p class="mt-1">${escapeHtml(messages.builder.animationAuthoringDescription)}</p>
            </div>
          </div>`,
        },
      ],
    })}
  </section>`;
};
