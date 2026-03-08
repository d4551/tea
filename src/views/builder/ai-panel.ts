/**
 * AI Tools Panel View
 *
 * Provider status, local runtime inventory, and builder-facing AI actions.
 */
import type { LocaleCode } from "../../config/environment.ts";
import type {
  KnowledgeDocumentRecord,
  KnowledgeSearchMatch,
} from "../../domain/ai/knowledge-base-service.ts";
import type { AiRuntimeProfile } from "../../domain/ai/local-runtime-profile.ts";
import type { AiToolPlanSuccess } from "../../domain/ai/providers/provider-types.ts";
import type { BuilderPlatformReadiness } from "../../domain/builder/platform-readiness.ts";
import type { AvailableAiFeatures } from "../../domain/game/ai/game-ai-service.ts";
import { appRoutes, withQueryParameters } from "../../shared/constants/routes.ts";
import type { Messages } from "../../shared/i18n/messages.ts";
import { escapeHtml } from "../layout.ts";
import { renderPlatformReadinessSection } from "./platform-readiness.ts";

/**
 * Renders the AI tools panel.
 *
 * @param messages Locale-resolved messages.
 * @param features Available AI feature snapshot.
 * @param runtimeProfile Local runtime profile.
 * @param locale Active locale.
 * @param projectId Active builder project identifier.
 * @param documents Indexed project-scoped knowledge documents.
 * @returns HTML string for the AI tools panel.
 */
const formatDocumentTimestamp = (timestampMs: number, locale: LocaleCode): string =>
  new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestampMs));

/**
 * Renders the indexed knowledge document list for the builder AI workspace.
 *
 * @param messages Locale-resolved messages.
 * @param locale Active locale.
 * @param projectId Active builder project identifier.
 * @param documents Indexed knowledge documents.
 * @returns HTML string for the knowledge document list.
 */
export const renderKnowledgeDocumentList = (
  messages: Messages,
  locale: LocaleCode,
  projectId: string,
  documents: readonly KnowledgeDocumentRecord[],
): string => {
  if (documents.length === 0) {
    return `<div role="status" class="alert alert-info alert-soft">${escapeHtml(messages.builder.noKnowledgeDocuments)}</div>`;
  }

  return `<ul class="space-y-3">${documents
    .map((document) => {
      const deleteHref = withQueryParameters(
        `${appRoutes.aiBuilderKnowledgeDocuments}/${encodeURIComponent(document.id)}`,
        {
          projectId,
          locale,
        },
      );
      return `<li class="rounded-box border border-base-300 bg-base-200/60 p-4">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="space-y-1">
            <h3 class="font-semibold">${escapeHtml(document.title)}</h3>
            <p class="text-xs text-base-content/70">${escapeHtml(document.source)}</p>
            <p class="text-xs text-base-content/60">${escapeHtml(formatDocumentTimestamp(document.updatedAtMs, locale))}</p>
          </div>
          <button
            type="button"
            class="btn btn-error btn-soft btn-xs"
            hx-delete="${escapeHtml(deleteHref)}"
            hx-target="#ai-knowledge-documents"
            hx-swap="innerHTML"
            hx-confirm="${escapeHtml(messages.builder.deleteKnowledgeDocumentConfirm)}"
            aria-label="${escapeHtml(messages.builder.deleteKnowledgeDocument)}: ${escapeHtml(document.title)}"
          >
            ${escapeHtml(messages.builder.deleteKnowledgeDocument)}
          </button>
        </div>
        <div class="mt-3 flex flex-wrap gap-2 text-xs">
          <span class="badge badge-outline">${escapeHtml(document.locale)}</span>
          <span class="badge badge-outline">${escapeHtml(`${document.chunkCount} ${messages.builder.knowledgeChunksLabel}`)}</span>
        </div>
      </li>`;
    })
    .join("")}</ul>`;
};

/**
 * Renders retrieval test results for the builder AI workspace.
 *
 * @param messages Locale-resolved messages.
 * @param result Retrieval result payload.
 * @returns HTML string for retrieval results.
 */
export const renderKnowledgeRetrievalResult = (
  messages: Messages,
  result: {
    readonly text: string;
    readonly matches: readonly KnowledgeSearchMatch[];
    readonly model: string;
  },
): string => {
  const matchRows =
    result.matches.length > 0
      ? result.matches
          .map(
            (match) => `<li class="rounded-box border border-base-300 bg-base-200/60 p-3">
              <div class="font-medium">${escapeHtml(match.title)}</div>
              <div class="text-xs text-base-content/70">${escapeHtml(match.source)}</div>
              <p class="mt-2 text-sm">${escapeHtml(match.text)}</p>
            </li>`,
          )
          .join("")
      : `<li class="rounded-box border border-base-300 bg-base-200/60 p-3">${escapeHtml(messages.builder.noKnowledgeMatches)}</li>`;

  return `<article class="card card-border bg-base-100 shadow-sm">
    <div class="card-body gap-4">
      <div>
        <h3 class="card-title">${escapeHtml(messages.builder.retrievalResultTitle)}</h3>
        <p class="text-sm text-base-content/70">${escapeHtml(result.text)}</p>
      </div>
      <div class="badge badge-outline">${escapeHtml(result.model)}</div>
      <ul class="space-y-3">${matchRows}</ul>
    </div>
  </article>`;
};

/**
 * Renders a structured tool plan preview for agentic execution review.
 *
 * @param messages Locale-resolved messages.
 * @param result Tool planning result.
 * @returns HTML string for the tool plan preview.
 */
export const renderToolPlanPreview = (
  messages: Messages,
  result: Pick<AiToolPlanSuccess, "steps" | "model">,
): string => `<article class="card card-border bg-base-100 shadow-sm">
  <div class="card-body gap-4">
    <div>
      <h3 class="card-title">${escapeHtml(messages.builder.toolPlanPreviewTitle)}</h3>
      <p class="text-sm text-base-content/70">${escapeHtml(messages.builder.toolPlanPreviewDescription)}</p>
    </div>
    <div class="badge badge-outline">${escapeHtml(result.model)}</div>
    <ol class="list-decimal space-y-2 pl-5 text-sm">
      ${result.steps
        .map(
          (step) => `<li>
            <div class="font-medium">${escapeHtml(step.title)}</div>
            ${
              step.detail
                ? `<div class="text-xs text-base-content/70">${escapeHtml(step.detail)}</div>`
                : ""
            }
          </li>`,
        )
        .join("")}
    </ol>
  </div>
</article>`;

export const renderAiPanel = (
  messages: Messages,
  features: AvailableAiFeatures,
  runtimeProfile: AiRuntimeProfile,
  locale: LocaleCode,
  projectId: string,
  readiness: BuilderPlatformReadiness,
  documents: readonly KnowledgeDocumentRecord[],
): string => {
  const featureRows = [
    { label: messages.builder.dialogue, available: features.richDialogue },
    { label: messages.builder.visionLabel, available: features.visionAnalysis },
    { label: messages.builder.sentimentLabel, available: features.sentimentAnalysis },
    { label: messages.builder.embeddingsLabel, available: features.embeddings },
    { label: messages.builder.speechToTextLabel, available: features.speechToText },
    { label: messages.builder.speechSynthesisLabel, available: features.speechSynthesis },
    { label: messages.builder.localInferenceLabel, available: features.localInference },
  ]
    .map(
      (f) => `
      <tr>
        <td>${escapeHtml(f.label)}</td>
        <td>
          <span class="badge ${f.available ? "badge-success" : "badge-error"} badge-sm">
            ${escapeHtml(f.available ? messages.ai.statusAvailable : messages.ai.statusUnavailable)}
          </span>
        </td>
      </tr>`,
    )
    .join("");

  const providerList =
    features.providers.length > 0
      ? features.providers
          .map((p) => `<span class="badge badge-outline badge-sm">${escapeHtml(p)}</span>`)
          .join(" ")
      : `<span class="text-base-content/60">${escapeHtml(messages.ai.noProviderAvailable)}</span>`;
  const aiTestHref = withQueryParameters(appRoutes.aiBuilderTest, { projectId });
  const aiAssistHref = withQueryParameters(appRoutes.aiBuilderAssist, { projectId });
  const aiPreviewHref = withQueryParameters(appRoutes.aiBuilderPatchPreviewForm, {
    projectId,
    locale,
  });
  const aiKnowledgeIngestHref = withQueryParameters(appRoutes.aiBuilderKnowledgeDocuments, {
    projectId,
    locale,
  });
  const aiKnowledgeSearchHref = withQueryParameters(appRoutes.aiBuilderKnowledgeSearch, {
    projectId,
    locale,
  });
  const aiToolPlanHref = withQueryParameters(appRoutes.aiBuilderToolPlan, {
    projectId,
    locale,
  });

  const modelRows = runtimeProfile.catalog
    .filter((entry) => entry.enabled)
    .map(
      (entry) => `<tr>
        <td class="font-medium">${escapeHtml(entry.label)}</td>
        <td><code>${escapeHtml(entry.model)}</code></td>
        <td><code>${escapeHtml(entry.configKey)}</code></td>
      </tr>`,
    )
    .join("");

  const endpointRows = [
    appRoutes.aiStatus,
    appRoutes.aiCatalog,
    appRoutes.aiTranscribe,
    appRoutes.aiSynthesize,
    appRoutes.aiGenerateDialogue,
    appRoutes.aiGenerateScene,
    appRoutes.aiAssist,
  ]
    .map((route) => `<li><code>${escapeHtml(route)}</code></li>`)
    .join("");

  return `
    <div class="space-y-6">
      <div role="alert" class="alert alert-warning alert-soft">
        <span>${escapeHtml(messages.builder.platformReadinessWarning)}</span>
      </div>

      ${renderPlatformReadinessSection({
        messages,
        locale,
        projectId,
        readiness,
        keys: ["aiAuthoring", "automation"],
      })}

      <section class="hero rounded-[2rem] border border-base-300 bg-gradient-to-br from-base-200 via-base-100 to-base-200 shadow-sm">
        <div class="hero-content w-full px-0">
          <div class="grid w-full gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
            <div class="space-y-4">
              <div class="space-y-2">
                <span class="badge badge-secondary badge-soft">${escapeHtml(messages.builder.ai)}</span>
                <h1 class="text-3xl font-semibold lg:text-4xl">${escapeHtml(messages.builder.localRuntimeTitle)}</h1>
                <p class="text-base-content/75">${escapeHtml(messages.builder.localRuntimeDescription)}</p>
              </div>
              <div class="flex flex-wrap gap-2">
                <span class="badge badge-outline">${escapeHtml(runtimeProfile.transformers.provider)}</span>
                <span class="badge badge-outline">${escapeHtml(runtimeProfile.transformers.integration)}</span>
                <span class="badge badge-outline">${escapeHtml(runtimeProfile.onnx.backend)}</span>
                <span class="badge badge-outline">${escapeHtml(`${runtimeProfile.onnx.threadCount}`)}</span>
              </div>
            </div>
            <div class="card card-border bg-base-100 shadow-sm">
              <div class="card-body gap-2">
                <h2 class="card-title">${escapeHtml(messages.builder.providerStatus)}</h2>
                <div>${providerList}</div>
                <p class="text-sm text-base-content/70">
                  <code>${escapeHtml(runtimeProfile.transformers.cacheDirectory)}</code>
                </p>
                <p class="text-sm text-base-content/70">
                  <code>${escapeHtml(runtimeProfile.onnx.wasmPath)}</code>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div class="card card-border bg-base-100 shadow-sm">
          <div class="card-body">
            <h2 class="card-title">${escapeHtml(messages.builder.providerStatus)}</h2>
            <table class="table table-xs" aria-label="${escapeHtml(messages.builder.providerStatus)}">
              <thead>
                <tr>
                  <th scope="col">${escapeHtml(messages.builder.capabilityHeader)}</th>
                  <th scope="col">${escapeHtml(messages.builder.statusHeader)}</th>
                </tr>
              </thead>
              <tbody>${featureRows}</tbody>
            </table>
          </div>
        </div>

        <div class="card card-border bg-base-100 shadow-sm">
          <div class="card-body">
            <h2 class="card-title">${escapeHtml(messages.builder.availableModels)}</h2>
            <p class="text-sm text-base-content/70">${escapeHtml(messages.builder.aiLaneDescription)}</p>
            <div class="overflow-x-auto">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>${escapeHtml(messages.builder.capabilityHeader)}</th>
                    <th>${escapeHtml(messages.builder.modelLabel)}</th>
                    <th>${escapeHtml(messages.builder.configKeyLabel)}</th>
                  </tr>
                </thead>
                <tbody>${modelRows}</tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div class="card card-border bg-base-100 shadow-sm">
          <div class="card-body">
            <h2 class="card-title">${escapeHtml(messages.builder.assistantReviewTitle)}</h2>
            <p class="text-sm text-base-content/70">${escapeHtml(messages.builder.assistantReviewDescription)}</p>
            <form
              hx-post="${escapeHtml(aiAssistHref)}"
              hx-target="#ai-assist-result"
              hx-swap="innerHTML"
              hx-indicator="#ai-assist-spinner"
              hx-disabled-elt="button, input, select, textarea"
              class="space-y-3"
            >
              <input type="hidden" name="locale" value="${escapeHtml(locale)}" />
              <input type="hidden" name="projectId" value="${escapeHtml(projectId)}" />
              <div class="form-control">
                <label class="label" for="ai-assist-prompt">${escapeHtml(messages.builder.promptLabel)}</label>
                <textarea id="ai-assist-prompt" name="prompt" class="textarea textarea-bordered w-full" rows="4" placeholder="${escapeHtml(messages.builder.assistPromptPlaceholder)}" required aria-required="true"></textarea>
              </div>
              <div class="flex items-center gap-2">
                <button type="submit" class="btn btn-secondary btn-sm" aria-label="${escapeHtml(messages.builder.designAssist)}">
                  ${escapeHtml(messages.builder.designAssist)}
                </button>
                <span id="ai-assist-spinner" class="loading loading-spinner loading-sm htmx-indicator" aria-hidden="true"></span>
              </div>
            </form>
            <div id="ai-assist-result" class="mt-3" aria-live="polite"></div>
          </div>
        </div>

        <div class="card card-border bg-base-100 shadow-sm">
          <div class="card-body">
            <h2 class="card-title">${escapeHtml(messages.builder.testDialogue)}</h2>
            <form
              hx-post="${escapeHtml(aiTestHref)}"
              hx-target="#ai-test-result"
              hx-swap="innerHTML"
              hx-indicator="#ai-test-spinner"
              hx-disabled-elt="button, input, select, textarea"
              class="space-y-3"
            >
              <input type="hidden" name="locale" value="${escapeHtml(locale)}" />
              <input type="hidden" name="projectId" value="${escapeHtml(projectId)}" />
              <div class="form-control">
                <label class="label" for="ai-test-npc">${escapeHtml(messages.builder.npcIdLabel)}</label>
                <input id="ai-test-npc" name="npcId" type="text" class="input input-bordered w-full" placeholder="${escapeHtml(messages.builder.testNpcPlaceholder)}" required aria-required="true" />
              </div>
              <div class="form-control">
                <label class="label" for="ai-test-message">${escapeHtml(messages.builder.messageLabel)}</label>
                <textarea id="ai-test-message" name="message" class="textarea textarea-bordered w-full" rows="2" placeholder="${escapeHtml(messages.builder.testMessagePlaceholder)}" required aria-required="true"></textarea>
              </div>
              <div class="flex items-center gap-2">
                <button type="submit" class="btn btn-primary btn-sm" aria-label="${escapeHtml(messages.builder.testDialogue)}">
                  ${escapeHtml(messages.builder.testDialogue)}
                </button>
                <span id="ai-test-spinner" class="loading loading-spinner loading-sm htmx-indicator" aria-hidden="true"></span>
              </div>
            </form>
            <div id="ai-test-result" class="mt-3" aria-live="polite"></div>
          </div>
        </div>
      </div>

      <div class="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div class="card card-border bg-base-100 shadow-sm">
          <div class="card-body">
            <h2 class="card-title">${escapeHtml(messages.builder.knowledgeWorkspaceTitle)}</h2>
            <p class="text-sm text-base-content/70">${escapeHtml(messages.builder.knowledgeWorkspaceDescription)}</p>
            <form
              hx-post="${escapeHtml(aiKnowledgeIngestHref)}"
              hx-target="#ai-knowledge-documents"
              hx-swap="innerHTML"
              hx-disabled-elt="button, input, select, textarea"
              class="space-y-3"
            >
              <div class="form-control">
                <label class="label" for="knowledge-title">${escapeHtml(messages.builder.knowledgeTitleLabel)}</label>
                <input id="knowledge-title" name="title" type="text" class="input input-bordered w-full" required aria-required="true" />
              </div>
              <div class="form-control">
                <label class="label" for="knowledge-source">${escapeHtml(messages.builder.knowledgeSourceLabel)}</label>
                <input id="knowledge-source" name="source" type="text" class="input input-bordered w-full" required aria-required="true" />
              </div>
              <div class="form-control">
                <label class="label" for="knowledge-text">${escapeHtml(messages.builder.knowledgeTextLabel)}</label>
                <textarea id="knowledge-text" name="text" class="textarea textarea-bordered w-full min-h-36" required aria-required="true"></textarea>
              </div>
              <div class="flex items-center gap-2">
                <button type="submit" class="btn btn-secondary btn-sm">${escapeHtml(messages.builder.ingestKnowledgeDocument)}</button>
              </div>
            </form>
            <div id="ai-knowledge-documents" class="mt-4" aria-live="polite">
              ${renderKnowledgeDocumentList(messages, locale, projectId, documents)}
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <div class="card card-border bg-base-100 shadow-sm">
            <div class="card-body">
              <h2 class="card-title">${escapeHtml(messages.builder.retrievalWorkspaceTitle)}</h2>
              <p class="text-sm text-base-content/70">${escapeHtml(messages.builder.retrievalWorkspaceDescription)}</p>
              <form
                hx-post="${escapeHtml(aiKnowledgeSearchHref)}"
                hx-target="#ai-retrieval-result"
                hx-swap="innerHTML"
                hx-disabled-elt="button, input, select, textarea"
                class="space-y-3"
              >
                <div class="form-control">
                  <label class="label" for="retrieval-prompt">${escapeHtml(messages.builder.promptLabel)}</label>
                  <textarea id="retrieval-prompt" name="prompt" class="textarea textarea-bordered w-full" rows="4" placeholder="${escapeHtml(messages.builder.retrievalPromptPlaceholder)}" required aria-required="true"></textarea>
                </div>
                <button type="submit" class="btn btn-primary btn-sm">${escapeHtml(messages.builder.runRetrievalAssist)}</button>
              </form>
              <div id="ai-retrieval-result" class="mt-4" aria-live="polite"></div>
            </div>
          </div>

          <div class="card card-border bg-base-100 shadow-sm">
            <div class="card-body">
              <h2 class="card-title">${escapeHtml(messages.builder.toolPlanWorkspaceTitle)}</h2>
              <p class="text-sm text-base-content/70">${escapeHtml(messages.builder.toolPlanWorkspaceDescription)}</p>
              <form
                hx-post="${escapeHtml(aiToolPlanHref)}"
                hx-target="#ai-tool-plan-result"
                hx-swap="innerHTML"
                hx-disabled-elt="button, input, select, textarea"
                class="space-y-3"
              >
                <div class="form-control">
                  <label class="label" for="tool-plan-goal">${escapeHtml(messages.builder.automationGoalLabel)}</label>
                  <textarea id="tool-plan-goal" name="goal" class="textarea textarea-bordered w-full" rows="4" placeholder="${escapeHtml(messages.builder.toolPlanGoalPlaceholder)}" required aria-required="true"></textarea>
                </div>
                <button type="submit" class="btn btn-outline btn-sm">${escapeHtml(messages.builder.previewToolPlan)}</button>
              </form>
              <div id="ai-tool-plan-result" class="mt-4" aria-live="polite"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="card card-border bg-base-100 shadow-sm">
        <div class="card-body">
          <h2 class="card-title">${escapeHtml(messages.builder.previewChanges)}</h2>
          <p class="text-sm text-base-content/70">${escapeHtml(messages.builder.patchOperations)}</p>
          <form
            hx-post="${escapeHtml(aiPreviewHref)}"
            hx-target="#ai-patch-result"
            hx-swap="innerHTML"
            hx-indicator="#ai-patch-spinner"
            hx-disabled-elt="button, input, select, textarea"
            class="space-y-3"
          >
            <input type="hidden" name="projectId" value="${escapeHtml(projectId)}" />
            <input type="hidden" name="locale" value="${escapeHtml(locale)}" />
            <fieldset class="fieldset">
              <legend class="fieldset-legend">${escapeHtml(messages.builder.operationsJsonLabel)}</legend>
              <textarea name="operationsJson" class="textarea textarea-bordered w-full min-h-28" placeholder="${escapeHtml(messages.builder.operationsJsonPlaceholder)}"></textarea>
            </fieldset>
            <div class="flex items-center gap-2">
              <button type="submit" class="btn btn-outline btn-sm">${escapeHtml(messages.builder.previewChanges)}</button>
              <span id="ai-patch-spinner" class="loading loading-spinner loading-sm htmx-indicator" aria-hidden="true"></span>
            </div>
          </form>
          <div id="ai-patch-result" class="mt-3" aria-live="polite"></div>
        </div>
      </div>

      <div class="card card-border bg-base-100 shadow-sm">
        <div class="card-body">
          <h2 class="card-title">${escapeHtml(messages.builder.apiSurfaceTitle)}</h2>
          <p class="text-sm text-base-content/70">${escapeHtml(messages.builder.apiSurfaceDescription)}</p>
          <ul class="list rounded-box bg-base-200/60">${endpointRows}</ul>
        </div>
      </div>
    </div>`;
};
