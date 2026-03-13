import type { LocaleCode } from "../../config/environment.ts";
import type { BuilderPlatformReadiness } from "../../domain/builder/platform-readiness.ts";
import { appRoutes, withQueryParameters } from "../../shared/constants/routes.ts";
import type {
  AnimationClip,
  BuilderAsset,
  BuilderAssetKind,
  GenerationArtifact,
  GenerationJob,
} from "../../shared/contracts/game.ts";
import type { Messages } from "../../shared/i18n/messages.ts";
import { escapeHtml } from "../layout.ts";
import { renderPlatformReadinessSection } from "./platform-readiness.ts";
import {
  getArtifactLabel,
  getArtifactSummaryLabel,
  getAssetKindLabel,
  getAssetLabel,
  getGenerationJobKindLabel,
  getLongRunningStatusLabel,
  getSceneModeLabel,
} from "./view-labels.ts";
import { renderWorkspaceShell } from "./workspace-shell.ts";

/**
 * Renders the authored asset, clip, and generation job workspace.
 *
 * @param messages Locale-resolved messages.
 * @param locale Active locale.
 * @param projectId Active project identifier.
 * @param assets Authored assets.
 * @param clips Authored animation clips.
 * @param jobs Generation jobs.
 * @param artifacts Reviewable artifacts.
 * @returns HTML for the assets workspace.
 */
export const renderAssetsEditor = (
  messages: Messages,
  locale: LocaleCode,
  projectId: string,
  assets: readonly BuilderAsset[],
  clips: readonly AnimationClip[],
  jobs: readonly GenerationJob[],
  artifacts: readonly GenerationArtifact[],
  readiness?: BuilderPlatformReadiness,
): string => {
  const createAssetAction = `${appRoutes.builderApiAssets}/create/form`;
  const uploadAssetAction = appRoutes.builderApiAssetsUpload;
  const createClipAction = `${appRoutes.builderApiAnimationClips}/create/form`;
  const createJobAction = `${appRoutes.builderApiGenerationJobs}/create/form`;
  const assetKindOptions: readonly BuilderAssetKind[] = [
    "portrait",
    "sprite-sheet",
    "background",
    "model",
    "audio",
  ];
  const generationKindOptions: readonly GenerationJob["kind"][] = [
    "portrait",
    "sprite-sheet",
    "tiles",
    "voice-line",
    "animation-plan",
  ];
  const assetKindOptionHtml = assetKindOptions
    .map(
      (option) =>
        `<option value="${option}">${escapeHtml(getAssetKindLabel(messages, option))}</option>`,
    )
    .join("");
  const generationKindOptionHtml = generationKindOptions
    .map(
      (option) =>
        `<option value="${option}">${escapeHtml(getGenerationJobKindLabel(messages, option))}</option>`,
    )
    .join("");
  const assetCards = assets
    .map(
      (asset) => `<article class="card card-border bg-base-100 shadow-sm">
        <div class="card-body gap-3">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h3 class="card-title text-base">${escapeHtml(getAssetLabel(messages, asset))}</h3>
              <p class="font-mono text-xs text-base-content/60">${escapeHtml(asset.id)}</p>
            </div>
            <span class="badge badge-outline">${escapeHtml(getAssetKindLabel(messages, asset.kind))}</span>
          </div>
          <div class="flex flex-wrap gap-2 text-xs">
            <span class="badge badge-soft">${escapeHtml(getSceneModeLabel(messages, asset.sceneMode))}</span>
            <span class="badge ${asset.approved ? "badge-success" : "badge-warning"} badge-soft">${asset.approved ? escapeHtml(messages.builder.assetStatusApproved) : escapeHtml(messages.builder.assetStatusDraft)}</span>
          </div>
          <p class="break-all text-sm text-base-content/70">${escapeHtml(asset.source)}</p>
        </div>
      </article>`,
    )
    .join("");

  const clipCards = clips
    .map((clip) => {
      const durationMs =
        clip.frameCount > 0 && clip.playbackFps > 0
          ? Math.round((clip.frameCount / clip.playbackFps) * 1000)
          : 0;
      const durationLabel = durationMs > 0 ? `${(durationMs / 1000).toFixed(2)}s` : "—";
      const loopLabel = clip.loop
        ? messages.builder.clipTimelineLoop
        : messages.builder.clipTimelineNoLoop;

      return `<article class="card card-border bg-base-100 shadow-sm">
        <div class="card-body gap-2">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h3 class="card-title text-base">${escapeHtml(clip.label)}</h3>
              <p class="font-mono text-xs text-base-content/60">${escapeHtml(clip.id)}</p>
            </div>
            <span class="badge badge-outline">${escapeHtml(getSceneModeLabel(messages, clip.sceneMode))}</span>
          </div>
          <div class="grid gap-2 text-sm text-base-content/75">
            <div>${escapeHtml(messages.builder.clipAssetLabel)}: ${escapeHtml(clip.assetId)}</div>
            <div>${escapeHtml(messages.builder.clipStateTagLabel)}: ${escapeHtml(clip.stateTag)}</div>
            <div>${escapeHtml(messages.builder.clipFrameCountLabel)}: ${clip.frameCount}</div>
          </div>
          <div class="mt-2 rounded-box bg-base-200/60 p-3" role="img" aria-label="${escapeHtml(messages.builder.clipTimelineDuration)}: ${durationLabel}">
            <div class="flex items-center justify-between text-xs text-base-content/70 mb-2">
              <span>${escapeHtml(messages.builder.clipTimelineDuration)}: ${escapeHtml(durationLabel)}</span>
              <span>${clip.playbackFps} FPS</span>
            </div>
            <progress class="progress progress-primary w-full" value="100" max="100" aria-hidden="true"></progress>
            <div class="flex items-center justify-between gap-2 mt-2">
              <span class="badge badge-xs badge-outline">0</span>
              <span class="badge badge-xs ${clip.loop ? "badge-success" : "badge-warning"} badge-soft">${escapeHtml(loopLabel)}</span>
              <span class="badge badge-xs badge-outline">${clip.frameCount}</span>
            </div>
          </div>
        </div>
      </article>`;
    })
    .join("");

  const artifactLookup = new Map(artifacts.map((artifact) => [artifact.id, artifact]));
  const jobCards = jobs
    .map((job) => {
      const approveAction = withQueryParameters(
        `${appRoutes.builderApiGenerationJobs}/${encodeURIComponent(job.id)}/approve`,
        {
          locale,
          projectId,
        },
      );
      const linkedArtifacts = job.artifactIds
        .map((artifactId) => artifactLookup.get(artifactId))
        .filter((artifact): artifact is GenerationArtifact => Boolean(artifact))
        .map(
          (artifact) => `<div class="rounded-box bg-base-200/70 p-3 text-sm">
            <div class="font-medium">${escapeHtml(getArtifactLabel(messages, artifact))}</div>
            <div class="text-base-content/70">${escapeHtml(getArtifactSummaryLabel(messages, artifact.summary))}</div>
          </div>`,
        )
        .join("");

      const jobSpinnerId = `job-${job.id.replace(/[^a-zA-Z0-9_.-]/g, "-")}-spinner`;
      const actions =
        job.status === "blocked_for_approval"
          ? `<div class="card-actions justify-end gap-2">
              <form hx-post="${escapeHtml(approveAction)}" hx-target="#builder-content" hx-swap="innerHTML" hx-indicator="#${jobSpinnerId}" hx-disabled-elt="button">
                <input type="hidden" name="approved" value="true" />
                <button
                  type="submit"
                  class="btn btn-primary btn-sm"
                  aria-label="${escapeHtml(messages.builder.approveAction)}: ${escapeHtml(getGenerationJobKindLabel(messages, job.kind))}"
                >${escapeHtml(messages.builder.approveAction)}</button>
              </form>
              <form hx-post="${escapeHtml(approveAction)}" hx-target="#builder-content" hx-swap="innerHTML" hx-indicator="#${jobSpinnerId}" hx-disabled-elt="button">
                <input type="hidden" name="approved" value="false" />
                <button
                  type="submit"
                  class="btn btn-outline btn-sm"
                  aria-label="${escapeHtml(messages.builder.cancelAction)}: ${escapeHtml(getGenerationJobKindLabel(messages, job.kind))}"
                >${escapeHtml(messages.builder.cancelAction)}</button>
              </form>
              <span id="${jobSpinnerId}" class="loading loading-spinner loading-sm htmx-indicator" aria-label="${escapeHtml(messages.common.loading)}"></span>
            </div>`
          : "";

      return `<article class="card card-border bg-base-100 shadow-sm">
        <div class="card-body gap-3">
          <div class="flex items-center justify-between gap-3">
            <h3 class="card-title text-base">${escapeHtml(getGenerationJobKindLabel(messages, job.kind))}</h3>
            <span class="badge badge-outline">${escapeHtml(getLongRunningStatusLabel(messages, job.status))}</span>
          </div>
          <p class="text-sm text-base-content/75">${escapeHtml(job.prompt)}</p>
          ${linkedArtifacts}
          ${actions}
        </div>
      </article>`;
    })
    .join("");

  const emptyAssetAlert = `<div role="status" class="alert alert-info alert-soft"><span>${escapeHtml(messages.builder.noAssets)}</span></div>`;
  const emptyClipAlert = `<div role="status" class="alert alert-info alert-soft"><span>${escapeHtml(messages.builder.noAnimationClips)}</span></div>`;
  const emptyJobAlert = `<div role="status" class="alert alert-info alert-soft"><span>${escapeHtml(messages.builder.noGenerationJobs)}</span></div>`;

  const assets2d = assets.filter((asset) => asset.sceneMode !== "3d").length;
  const assets3d = assets.filter((asset) => asset.sceneMode === "3d").length;

  return `<section class="space-y-6 animate-fade-in-up">
    ${renderWorkspaceShell({
      eyebrow: messages.builder.assets,
      title: messages.builder.assetsWorkspaceTitle,
      description: messages.builder.assetPlaceholder,
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
    ${
      readiness
        ? renderPlatformReadinessSection({
            messages,
            locale,
            projectId,
            readiness,
            keys: ["runtime2d", "runtime3d", "spritePipeline", "animationPipeline"],
          })
        : ""
    }
    <div class="grid gap-4 xl:grid-cols-3">
      <article class="card card-border bg-base-100 shadow-sm">
        <div class="card-body gap-3">
          <h2 class="card-title">${escapeHtml(messages.builder.assetsWorkspaceTitle)}</h2>
          <form class="space-y-3" hx-post="${escapeHtml(uploadAssetAction)}" hx-target="#builder-content" hx-swap="innerHTML" hx-encoding="multipart/form-data" hx-indicator="#asset-upload-spinner" hx-disabled-elt="button, input, select, textarea">
            <input type="hidden" name="projectId" value="${escapeHtml(projectId)}" />
            <input type="hidden" name="locale" value="${escapeHtml(locale)}" />
            <fieldset class="fieldset">
              <legend class="fieldset-legend">${escapeHtml(messages.builder.assetIdFieldLabel)}</legend>
              <input name="id" type="text" class="input w-full" placeholder="${escapeHtml(messages.builder.assetIdPlaceholder)}" aria-label="${escapeHtml(messages.builder.assetIdFieldLabel)}" />
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">${escapeHtml(messages.builder.labelField)}</legend>
              <input name="label" type="text" class="input w-full" placeholder="${escapeHtml(messages.builder.labelField)}" aria-label="${escapeHtml(messages.builder.labelField)}" />
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
            <div class="flex items-center gap-2">
              <button type="submit" class="btn btn-primary btn-sm" aria-label="${escapeHtml(messages.builder.addAssetFile)}">${escapeHtml(messages.builder.addAssetFile)}</button>
              <span id="asset-upload-spinner" class="loading loading-spinner loading-sm htmx-indicator" aria-label="${escapeHtml(messages.common.loading)}"></span>
            </div>
          </form>
          <div class="divider text-xs text-base-content/60">${escapeHtml(messages.builder.addAssetPath)}</div>
          <form class="space-y-3" hx-post="${escapeHtml(createAssetAction)}" hx-target="#builder-content" hx-swap="innerHTML" hx-indicator="#asset-create-spinner" hx-disabled-elt="button, input, select, textarea">
            <input type="hidden" name="projectId" value="${escapeHtml(projectId)}" />
            <input type="hidden" name="locale" value="${escapeHtml(locale)}" />
            <fieldset class="fieldset">
              <legend class="fieldset-legend">${escapeHtml(messages.builder.assetIdFieldLabel)}</legend>
              <input name="id" type="text" class="input w-full" placeholder="${escapeHtml(messages.builder.assetIdPlaceholder)}" aria-required="true" required aria-label="${escapeHtml(messages.builder.assetIdFieldLabel)}" />
            </fieldset>
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
            <div class="flex items-center gap-2">
              <button type="submit" class="btn btn-outline btn-sm" aria-label="${escapeHtml(messages.builder.addAssetPath)}">${escapeHtml(messages.builder.addAssetPath)}</button>
              <span id="asset-create-spinner" class="loading loading-spinner loading-sm htmx-indicator" aria-label="${escapeHtml(messages.common.loading)}"></span>
            </div>
          </form>
        </div>
      </article>

      <article class="card card-border bg-base-100 shadow-sm">
        <form class="card-body gap-3" hx-post="${escapeHtml(createClipAction)}" hx-target="#builder-content" hx-swap="innerHTML" hx-indicator="#clip-create-spinner" hx-disabled-elt="button, input, select, textarea">
          <input type="hidden" name="projectId" value="${escapeHtml(projectId)}" />
          <input type="hidden" name="locale" value="${escapeHtml(locale)}" />
          <h2 class="card-title">${escapeHtml(messages.builder.animationClipsTitle)}</h2>
          <fieldset class="fieldset">
            <legend class="fieldset-legend">${escapeHtml(messages.builder.clipIdLabel)}</legend>
            <input name="id" type="text" class="input w-full" placeholder="${escapeHtml(messages.builder.clipIdPlaceholder)}" aria-required="true" required aria-label="${escapeHtml(messages.builder.animationClipIdFieldLabel)}" />
          </fieldset>
          <fieldset class="fieldset">
            <legend class="fieldset-legend">${escapeHtml(messages.builder.clipAssetLabel)}</legend>
            <input name="assetId" type="text" class="input w-full" placeholder="${escapeHtml(messages.builder.assetIdPlaceholder)}" aria-required="true" required aria-label="${escapeHtml(messages.builder.clipAssetLabel)}" />
          </fieldset>
          <fieldset class="fieldset">
            <legend class="fieldset-legend">${escapeHtml(messages.builder.clipStateTagLabel)}</legend>
            <input name="stateTag" type="text" class="input w-full" placeholder="${escapeHtml(messages.builder.stateTagPlaceholder)}" aria-required="true" required aria-label="${escapeHtml(messages.builder.clipStateTagLabel)}" />
          </fieldset>
          <fieldset class="fieldset">
            <legend class="fieldset-legend">${escapeHtml(messages.builder.clipFrameCountLabel)}</legend>
            <input name="frameCount" type="number" class="input w-full" value="4" min="1" aria-label="${escapeHtml(messages.builder.clipFrameCountLabel)}" />
          </fieldset>
          <fieldset class="fieldset">
            <legend class="fieldset-legend">${escapeHtml(messages.builder.clipPlaybackLabel)}</legend>
            <input name="playbackFps" type="number" class="input w-full" value="8" min="1" aria-label="${escapeHtml(messages.builder.clipPlaybackLabel)}" />
          </fieldset>
          <div class="flex items-center gap-2">
            <button type="submit" class="btn btn-outline btn-sm" aria-label="${escapeHtml(messages.builder.createAnimationClip)}">${escapeHtml(messages.builder.createAnimationClip)}</button>
            <span id="clip-create-spinner" class="loading loading-spinner loading-sm htmx-indicator" aria-label="${escapeHtml(messages.common.loading)}"></span>
          </div>
        </form>
      </article>

      <article class="card card-border bg-base-100 shadow-sm">
        <form class="card-body gap-3" hx-post="${escapeHtml(createJobAction)}" hx-target="#builder-content" hx-swap="innerHTML" hx-indicator="#job-create-spinner" hx-disabled-elt="button, input, select, textarea">
          <input type="hidden" name="projectId" value="${escapeHtml(projectId)}" />
          <input type="hidden" name="locale" value="${escapeHtml(locale)}" />
          <h2 class="card-title">${escapeHtml(messages.builder.generationJobsTitle)}</h2>
          <fieldset class="fieldset">
            <legend class="fieldset-legend">${escapeHtml(messages.builder.generationJobKindLabel)}</legend>
            <select name="kind" class="select w-full" aria-label="${escapeHtml(messages.builder.generationJobKindLabel)}">${generationKindOptionHtml}</select>
          </fieldset>
          <fieldset class="fieldset">
            <legend class="fieldset-legend">${escapeHtml(messages.builder.generationPromptLabel)}</legend>
            <textarea name="prompt" class="textarea w-full" rows="4" placeholder="${escapeHtml(messages.builder.generationPromptPlaceholder)}" aria-required="true" required aria-label="${escapeHtml(messages.builder.promptLabel)}"></textarea>
          </fieldset>
          <fieldset class="fieldset">
            <legend class="fieldset-legend">${escapeHtml(messages.builder.generationTargetLabel)}</legend>
            <input name="targetId" type="text" class="input w-full" placeholder="${escapeHtml(messages.builder.generationTargetPlaceholder)}" aria-label="${escapeHtml(messages.builder.generationTargetLabel)}" />
          </fieldset>
          <div class="flex items-center gap-2">
            <button type="submit" class="btn btn-secondary btn-sm" aria-label="${escapeHtml(messages.builder.createGenerationJob)}">${escapeHtml(messages.builder.createGenerationJob)}</button>
            <span id="job-create-spinner" class="loading loading-spinner loading-sm htmx-indicator" aria-label="${escapeHtml(messages.common.loading)}"></span>
          </div>
        </form>
      </article>
    </div>

    <section class="space-y-3">
      <h2 class="text-2xl font-semibold">${escapeHtml(messages.builder.assets)}</h2>
      <div class="grid gap-4 xl:grid-cols-3">${assets.length === 0 ? emptyAssetAlert : assetCards}</div>
    </section>

    <section class="space-y-3">
      <h2 class="text-2xl font-semibold">${escapeHtml(messages.builder.animationClipsTitle)}</h2>
      <div class="grid gap-4 xl:grid-cols-3">${clips.length === 0 ? emptyClipAlert : clipCards}</div>
    </section>

    <section class="space-y-3">
      <h2 class="text-2xl font-semibold">${escapeHtml(messages.builder.generationJobsTitle)}</h2>
      <div class="grid gap-4 xl:grid-cols-2">${jobs.length === 0 ? emptyJobAlert : jobCards}</div>
    </section>
  </section>`;
};
