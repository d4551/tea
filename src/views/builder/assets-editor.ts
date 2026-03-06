import type { LocaleCode } from "../../config/environment.ts";
import { appRoutes, withQueryParameters } from "../../shared/constants/routes.ts";
import type {
  AnimationClip,
  BuilderAsset,
  GenerationArtifact,
  GenerationJob,
} from "../../shared/contracts/game.ts";
import type { Messages } from "../../shared/i18n/messages.ts";
import { escapeHtml } from "../layout.ts";

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
): string => {
  const createAssetAction = `${appRoutes.builderApiAssets}/create/form`;
  const uploadAssetAction = appRoutes.builderApiAssetsUpload;
  const createClipAction = `${appRoutes.builderApiAnimationClips}/create/form`;
  const createJobAction = `${appRoutes.builderApiGenerationJobs}/create/form`;
  const assetCards = assets
    .map(
      (asset) => `<article class="card card-border bg-base-100 shadow-sm">
        <div class="card-body gap-3">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h3 class="card-title text-base">${escapeHtml(asset.label)}</h3>
              <p class="font-mono text-xs text-base-content/60">${escapeHtml(asset.id)}</p>
            </div>
            <span class="badge badge-outline">${escapeHtml(asset.kind)}</span>
          </div>
          <div class="flex flex-wrap gap-2 text-xs">
            <span class="badge badge-soft">${escapeHtml(asset.sceneMode)}</span>
            <span class="badge ${asset.approved ? "badge-success" : "badge-warning"} badge-soft">${asset.approved ? escapeHtml(messages.builder.assetStatusApproved) : escapeHtml(messages.builder.assetStatusDraft)}</span>
          </div>
          <p class="break-all text-sm text-base-content/70">${escapeHtml(asset.source)}</p>
        </div>
      </article>`,
    )
    .join("");

  const clipCards = clips
    .map(
      (clip) => `<article class="card card-border bg-base-100 shadow-sm">
        <div class="card-body gap-2">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h3 class="card-title text-base">${escapeHtml(clip.label)}</h3>
              <p class="font-mono text-xs text-base-content/60">${escapeHtml(clip.id)}</p>
            </div>
            <span class="badge badge-outline">${escapeHtml(clip.sceneMode)}</span>
          </div>
          <div class="grid gap-2 text-sm text-base-content/75">
            <div>${escapeHtml(messages.builder.clipAssetLabel)}: ${escapeHtml(clip.assetId)}</div>
            <div>${escapeHtml(messages.builder.clipStateTagLabel)}: ${escapeHtml(clip.stateTag)}</div>
            <div>${escapeHtml(messages.builder.clipFrameCountLabel)}: ${clip.frameCount}</div>
          </div>
        </div>
      </article>`,
    )
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
            <div class="font-medium">${escapeHtml(artifact.label)}</div>
            <div class="text-base-content/70">${escapeHtml(artifact.summary)}</div>
          </div>`,
        )
        .join("");

      const jobSpinnerId = `job-${job.id.replace(/[^a-zA-Z0-9_.-]/g, "-")}-spinner`;
      const actions =
        job.status === "blocked_for_approval"
          ? `<div class="card-actions justify-end gap-2">
              <form hx-post="${escapeHtml(approveAction)}" hx-target="#builder-content" hx-swap="innerHTML" hx-indicator="#${jobSpinnerId}" hx-disabled-elt="button">
                <input type="hidden" name="approved" value="true" />
                <button type="submit" class="btn btn-primary btn-sm">${escapeHtml(messages.builder.approveAction)}</button>
              </form>
              <form hx-post="${escapeHtml(approveAction)}" hx-target="#builder-content" hx-swap="innerHTML" hx-indicator="#${jobSpinnerId}" hx-disabled-elt="button">
                <input type="hidden" name="approved" value="false" />
                <button type="submit" class="btn btn-outline btn-sm">${escapeHtml(messages.builder.cancelAction)}</button>
              </form>
              <span id="${jobSpinnerId}" class="loading loading-spinner loading-sm htmx-indicator" aria-hidden="true"></span>
            </div>`
          : "";

      return `<article class="card card-border bg-base-100 shadow-sm">
        <div class="card-body gap-3">
          <div class="flex items-center justify-between gap-3">
            <h3 class="card-title text-base">${escapeHtml(job.kind)}</h3>
            <span class="badge badge-outline">${escapeHtml(job.status)}</span>
          </div>
          <p class="text-sm text-base-content/75">${escapeHtml(job.prompt)}</p>
          ${linkedArtifacts}
          ${actions}
        </div>
      </article>`;
    })
    .join("");

  return `<section class="space-y-6">
    <div class="grid gap-4 xl:grid-cols-3">
      <article class="card card-border bg-base-100 shadow-sm">
        <div class="card-body gap-3">
          <h2 class="card-title">${escapeHtml(messages.builder.assetsWorkspaceTitle)}</h2>
          <form class="space-y-3" hx-post="${escapeHtml(uploadAssetAction)}" hx-target="#builder-content" hx-swap="innerHTML" hx-encoding="multipart/form-data" hx-indicator="#asset-upload-spinner" hx-disabled-elt="button, input, select, textarea">
            <input type="hidden" name="projectId" value="${escapeHtml(projectId)}" />
            <input type="hidden" name="locale" value="${escapeHtml(locale)}" />
            <input name="id" type="text" class="input input-bordered w-full" placeholder="asset.custom.hero" />
            <input name="label" type="text" class="input input-bordered w-full" placeholder="${escapeHtml(messages.builder.assetLabelPlaceholder)}" />
            <select name="kind" class="select select-bordered w-full">
              <option value="portrait">portrait</option>
              <option value="sprite-sheet">sprite-sheet</option>
              <option value="background">background</option>
              <option value="model">model</option>
              <option value="audio">audio</option>
            </select>
            <select name="sceneMode" class="select select-bordered w-full">
              <option value="2d">${escapeHtml(messages.builder.sceneMode2d)}</option>
              <option value="3d">${escapeHtml(messages.builder.sceneMode3d)}</option>
            </select>
            <input name="file" type="file" class="file-input file-input-bordered file-input-sm w-full" accept="image/*,audio/*,.glb,.gltf,.json" required />
            <div class="flex items-center gap-2">
              <button type="submit" class="btn btn-primary btn-sm">${escapeHtml(messages.builder.addAssetFile)}</button>
              <span id="asset-upload-spinner" class="loading loading-spinner loading-sm htmx-indicator" aria-hidden="true"></span>
            </div>
          </form>
          <div class="divider text-xs text-base-content/60">${escapeHtml(messages.builder.addAssetPath)}</div>
          <form class="space-y-3" hx-post="${escapeHtml(createAssetAction)}" hx-target="#builder-content" hx-swap="innerHTML" hx-indicator="#asset-create-spinner" hx-disabled-elt="button, input, select, textarea">
            <input type="hidden" name="projectId" value="${escapeHtml(projectId)}" />
            <input type="hidden" name="locale" value="${escapeHtml(locale)}" />
            <input name="id" type="text" class="input input-bordered w-full" placeholder="asset.custom.hero" required />
            <input name="label" type="text" class="input input-bordered w-full" placeholder="${escapeHtml(messages.builder.assetLabelPlaceholder)}" required />
            <select name="kind" class="select select-bordered w-full">
              <option value="portrait">portrait</option>
              <option value="sprite-sheet">sprite-sheet</option>
              <option value="background">background</option>
              <option value="model">model</option>
              <option value="audio">audio</option>
            </select>
            <select name="sceneMode" class="select select-bordered w-full">
              <option value="2d">${escapeHtml(messages.builder.sceneMode2d)}</option>
              <option value="3d">${escapeHtml(messages.builder.sceneMode3d)}</option>
            </select>
            <input name="source" type="text" class="input input-bordered w-full" placeholder="/assets/images/custom.png" required />
            <div class="flex items-center gap-2">
              <button type="submit" class="btn btn-outline btn-sm">${escapeHtml(messages.builder.addAssetPath)}</button>
              <span id="asset-create-spinner" class="loading loading-spinner loading-sm htmx-indicator" aria-hidden="true"></span>
            </div>
          </form>
        </div>
      </article>

      <article class="card card-border bg-base-100 shadow-sm">
        <form class="card-body gap-3" hx-post="${escapeHtml(createClipAction)}" hx-target="#builder-content" hx-swap="innerHTML" hx-indicator="#clip-create-spinner" hx-disabled-elt="button, input, select, textarea">
          <input type="hidden" name="projectId" value="${escapeHtml(projectId)}" />
          <input type="hidden" name="locale" value="${escapeHtml(locale)}" />
          <h2 class="card-title">${escapeHtml(messages.builder.animationClipsTitle)}</h2>
          <input name="id" type="text" class="input input-bordered w-full" placeholder="clip.hero.idle" required />
          <input name="assetId" type="text" class="input input-bordered w-full" placeholder="asset.sprite.hero" required />
          <input name="stateTag" type="text" class="input input-bordered w-full" placeholder="idle-down" required />
          <input name="frameCount" type="number" class="input input-bordered w-full" value="4" min="1" />
          <input name="playbackFps" type="number" class="input input-bordered w-full" value="8" min="1" />
          <div class="flex items-center gap-2">
            <button type="submit" class="btn btn-outline btn-sm">${escapeHtml(messages.builder.preview)}</button>
            <span id="clip-create-spinner" class="loading loading-spinner loading-sm htmx-indicator" aria-hidden="true"></span>
          </div>
        </form>
      </article>

      <article class="card card-border bg-base-100 shadow-sm">
        <form class="card-body gap-3" hx-post="${escapeHtml(createJobAction)}" hx-target="#builder-content" hx-swap="innerHTML" hx-indicator="#job-create-spinner" hx-disabled-elt="button, input, select, textarea">
          <input type="hidden" name="projectId" value="${escapeHtml(projectId)}" />
          <input type="hidden" name="locale" value="${escapeHtml(locale)}" />
          <h2 class="card-title">${escapeHtml(messages.builder.generationJobsTitle)}</h2>
          <select name="kind" class="select select-bordered w-full">
            <option value="portrait">portrait</option>
            <option value="sprite-sheet">sprite-sheet</option>
            <option value="tiles">tiles</option>
            <option value="voice-line">voice-line</option>
            <option value="animation-plan">animation-plan</option>
          </select>
          <textarea name="prompt" class="textarea textarea-bordered w-full" rows="4" placeholder="${escapeHtml(messages.builder.generationPromptPlaceholder)}" required></textarea>
          <input name="targetId" type="text" class="input input-bordered w-full" placeholder="${escapeHtml(messages.builder.generationTargetPlaceholder)}" />
          <div class="flex items-center gap-2">
            <button type="submit" class="btn btn-secondary btn-sm">${escapeHtml(messages.builder.createGenerationJob)}</button>
            <span id="job-create-spinner" class="loading loading-spinner loading-sm htmx-indicator" aria-hidden="true"></span>
          </div>
        </form>
      </article>
    </div>

    <section class="space-y-3">
      <h2 class="text-2xl font-semibold">${escapeHtml(messages.builder.assets)}</h2>
      <div class="grid gap-4 xl:grid-cols-3">${assetCards || `<div role="alert" class="alert alert-info alert-soft"><span>${escapeHtml(messages.builder.assetPlaceholder)}</span></div>`}</div>
    </section>

    <section class="space-y-3">
      <h2 class="text-2xl font-semibold">${escapeHtml(messages.builder.animationClipsTitle)}</h2>
      <div class="grid gap-4 xl:grid-cols-3">${clipCards || `<div role="alert" class="alert alert-info alert-soft"><span>${escapeHtml(messages.builder.preview)}</span></div>`}</div>
    </section>

    <section class="space-y-3">
      <h2 class="text-2xl font-semibold">${escapeHtml(messages.builder.generationJobsTitle)}</h2>
      <div class="grid gap-4 xl:grid-cols-2">${jobCards || `<div role="alert" class="alert alert-info alert-soft"><span>${escapeHtml(messages.builder.noPublishedRelease)}</span></div>`}</div>
    </section>
  </section>`;
};
