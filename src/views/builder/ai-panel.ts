/**
 * Settings Panel View
 *
 * Runtime diagnostics, project knowledge, and advanced creator-assistance tooling.
 * Decomposed into sub-sections for maintainability.
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
import { cardClasses, renderBuilderHiddenFields, spinnerClasses } from "../shared/ui-components.ts";
import { interpolateRoutePath } from "../../shared/constants/route-patterns.ts";
import { renderPlatformReadinessSection } from "./platform-readiness.ts";
import { renderWorkspaceFrame, renderWorkspaceShell } from "./workspace-shell.ts";

/**
 * Formats a knowledge document timestamp for display.
 *
 * @param timestampMs Epoch timestamp in milliseconds.
 * @param locale Active locale code.
 * @returns Formatted date/time string.
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
    return `<div role="status" class="alert alert-info alert-soft"><span>${escapeHtml(messages.builder.noKnowledgeDocuments)}</span></div>`;
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

  return `<article class="${cardClasses.bordered}">
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
): string => `<article class="${cardClasses.bordered}">
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

/* ------------------------------------------------------------------ */
/*  Sub-section renderers                                              */
/* ------------------------------------------------------------------ */

/**
 * Renders the settings status hero section with provider badges.
 *
 * @param messages Locale-resolved messages.
 * @param runtimeProfile Local runtime profile.
 * @param features Available AI features.
 * @returns HTML string for the settings status hero.
 */
const renderAiStatusHero = (
  messages: Messages,
  runtimeProfile: AiRuntimeProfile,
  features: AvailableAiFeatures,
): string => {
  const providerCount = features.providers.length;
  const providerList =
    providerCount > 0
      ? features.providers
          .map((p) => `<span class="badge badge-outline badge-sm">${escapeHtml(p)}</span>`)
          .join(" ")
      : `<span class="text-base-content/60">${escapeHtml(messages.ai.noProviderAvailable)}</span>`;

  return `<section class="rounded-[1.5rem] border border-base-300 bg-base-100 shadow-sm">
    <div class="p-5">
      <div class="grid w-full gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
        <div class="space-y-4">
          <div class="space-y-2">
            <span class="badge badge-secondary badge-soft">${escapeHtml(messages.builder.settings)}</span>
            <h1 class="text-2xl font-semibold lg:text-3xl">${escapeHtml(messages.builder.localRuntimeTitle)}</h1>
            <p class="text-base-content/75">${escapeHtml(messages.builder.localRuntimeDescription)}</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <span class="badge badge-outline">${escapeHtml(runtimeProfile.transformers.provider)}</span>
            <span class="badge badge-outline">${escapeHtml(runtimeProfile.transformers.integration)}</span>
            <span class="badge badge-outline">${escapeHtml(runtimeProfile.onnx.backend)}</span>
            <span class="badge badge-outline">${escapeHtml(`${runtimeProfile.onnx.threadCount}`)}</span>
          </div>
        </div>
        <div class="${cardClasses.bordered}">
          <div class="card-body gap-2">
            <h2 class="card-title">${escapeHtml(messages.builder.providerStatus)}</h2>
            <div>${providerList}</div>
            <p class="text-sm text-base-content/70">
              ${escapeHtml(messages.builder.creatorSafeAiDescription)}
            </p>
            <div class="stats stats-vertical rounded-box border border-base-300 bg-base-200/60 shadow-none sm:stats-horizontal">
              <div class="stat px-4 py-3">
                <div class="stat-title">${escapeHtml(messages.builder.providerStatus)}</div>
                <div class="stat-value text-secondary text-2xl">${providerCount}</div>
                <div class="stat-desc">${escapeHtml(messages.builder.localRuntimeTitle)}</div>
              </div>
              <div class="stat px-4 py-3">
                <div class="stat-title">${escapeHtml(messages.builder.runtimeLabel)}</div>
                <div class="stat-value text-primary text-lg">${escapeHtml(runtimeProfile.transformers.integration)}</div>
                <div class="stat-desc">${escapeHtml(runtimeProfile.onnx.backend)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>`;
};

const countAvailableCapabilities = (features: AvailableAiFeatures): number =>
  [
    features.richDialogue,
    features.visionAnalysis,
    features.sentimentAnalysis,
    features.embeddings,
    features.speechToText,
    features.speechSynthesis,
    features.localInference,
  ].filter(Boolean).length;

/**
 * Renders the AI capability feature matrix table.
 *
 * @param messages Locale-resolved messages.
 * @param features Available AI features.
 * @returns HTML string for the capability table.
 */
const renderAiCapabilityTable = (messages: Messages, features: AvailableAiFeatures): string => {
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

  return `<div class="${cardClasses.bordered}">
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
  </div>`;
};

/**
 * Renders the model inventory table with env-var override hints.
 *
 * @param messages Locale-resolved messages.
 * @param runtimeProfile Local runtime profile.
 * @returns HTML string for the model inventory.
 */
const renderAiModelInventory = (messages: Messages, runtimeProfile: AiRuntimeProfile): string => {
  const modelRows = runtimeProfile.catalog
    .filter((entry) => entry.enabled)
    .map(
      (entry) => `<tr>
        <td class="font-medium">${escapeHtml(entry.label)}</td>
        <td><code class="text-xs">${escapeHtml(entry.model)}</code></td>
        <td><span class="badge badge-outline badge-xs">${escapeHtml(entry.task)}</span></td>
        <td><code class="text-xs">${escapeHtml(entry.configKey)}</code></td>
      </tr>`,
    )
    .join("");

  return `<div class="${cardClasses.bordered}">
    <div class="card-body">
      <h2 class="card-title">${escapeHtml(messages.builder.availableModels)}</h2>
      <p class="text-sm text-base-content/70">${escapeHtml(messages.builder.aiLaneDescription)}</p>
      <div class="overflow-x-auto">
        <table class="table table-sm" aria-label="${escapeHtml(messages.builder.availableModels)}">
          <thead>
            <tr>
              <th scope="col">${escapeHtml(messages.builder.capabilityHeader)}</th>
              <th scope="col">${escapeHtml(messages.builder.modelLabel)}</th>
              <th scope="col">${escapeHtml(messages.builder.taskLabel)}</th>
              <th scope="col">${escapeHtml(messages.builder.configKeyLabel)}</th>
            </tr>
          </thead>
          <tbody>${modelRows}</tbody>
        </table>
      </div>
      <div class="alert alert-info alert-soft mt-2" role="status">
        <svg xmlns="http://www.w3.org/2000/svg" class="size-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span class="text-sm">${escapeHtml(messages.builder.aiConfigOverrideHelp)}</span>
      </div>
    </div>
  </div>`;
};

/**
 * Renders the AI assist form (fieldset pattern, not form-control).
 *
 * @param messages Locale-resolved messages.
 * @param locale Active locale.
 * @param projectId Active project id.
 * @returns HTML string for the AI assist form.
 */
const renderAiAssistForm = (messages: Messages, locale: LocaleCode, projectId: string): string => {
  const aiAssistHref = withQueryParameters(appRoutes.aiBuilderAssist, { projectId });

  return `<div class="${cardClasses.bordered}">
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
        ${renderBuilderHiddenFields(projectId, locale)}
        <fieldset class="fieldset">
          <legend class="fieldset-legend">${escapeHtml(messages.builder.promptLabel)}</legend>
          <textarea id="ai-assist-prompt" name="prompt" class="textarea w-full" rows="4" placeholder="${escapeHtml(messages.builder.assistPromptPlaceholder)}" required aria-required="true" aria-label="${escapeHtml(messages.builder.promptLabel)}"></textarea>
        </fieldset>
        <div class="flex items-center gap-2">
          <button type="submit" class="btn btn-primary btn-sm" aria-label="${escapeHtml(messages.builder.designAssist)}">
            ${escapeHtml(messages.builder.designAssist)}
          </button>
          <span id="ai-assist-spinner" class="${spinnerClasses.sm}" aria-label="${escapeHtml(messages.common.loading)}"></span>
        </div>
      </form>
      <div id="ai-assist-result" class="mt-3" aria-live="polite"></div>
    </div>
  </div>`;
};

/**
 * Renders the AI dialogue test form.
 *
 * @param messages Locale-resolved messages.
 * @param locale Active locale.
 * @param projectId Active project id.
 * @returns HTML string for the test dialogue form.
 */
const renderAiTestForm = (messages: Messages, locale: LocaleCode, projectId: string): string => {
  const aiTestHref = withQueryParameters(appRoutes.aiBuilderTest, { projectId });

  return `<div class="${cardClasses.bordered}">
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
        ${renderBuilderHiddenFields(projectId, locale)}
        <fieldset class="fieldset">
          <legend class="fieldset-legend">${escapeHtml(messages.builder.npcIdLabel)}</legend>
          <input id="ai-test-npc" name="npcId" type="text" class="input w-full" placeholder="${escapeHtml(messages.builder.testNpcPlaceholder)}" required aria-required="true" aria-label="${escapeHtml(messages.builder.npcIdLabel)}" />
        </fieldset>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">${escapeHtml(messages.builder.messageLabel)}</legend>
          <textarea id="ai-test-message" name="message" class="textarea w-full" rows="2" placeholder="${escapeHtml(messages.builder.testMessagePlaceholder)}" required aria-required="true" aria-label="${escapeHtml(messages.builder.messageLabel)}"></textarea>
        </fieldset>
        <div class="flex items-center gap-2">
          <button type="submit" class="btn btn-primary btn-sm" aria-label="${escapeHtml(messages.builder.testDialogue)}">
            ${escapeHtml(messages.builder.testDialogue)}
          </button>
          <span id="ai-test-spinner" class="${spinnerClasses.sm}" aria-label="${escapeHtml(messages.common.loading)}"></span>
        </div>
      </form>
      <div id="ai-test-result" class="mt-3" aria-live="polite"></div>
    </div>
  </div>`;
};

/**
 * Renders the knowledge workspace (ingest + document list).
 *
 * @param messages Locale-resolved messages.
 * @param locale Active locale.
 * @param projectId Active project id.
 * @param documents Indexed knowledge documents.
 * @returns HTML string for the knowledge workspace.
 */
const renderAiKnowledgeWorkspace = (
  messages: Messages,
  locale: LocaleCode,
  projectId: string,
  documents: readonly KnowledgeDocumentRecord[],
): string => {
  const aiKnowledgeIngestHref = withQueryParameters(appRoutes.aiBuilderKnowledgeDocuments, {
    projectId,
    locale,
  });

  return `<div class="${cardClasses.bordered}">
    <div class="card-body">
      <h2 class="card-title">${escapeHtml(messages.builder.knowledgeWorkspaceTitle)}</h2>
      <p class="text-sm text-base-content/70">${escapeHtml(messages.builder.knowledgeWorkspaceDescription)}</p>
      <form
        hx-post="${escapeHtml(aiKnowledgeIngestHref)}"
        hx-target="#ai-knowledge-documents"
        hx-swap="innerHTML"
        hx-indicator="#ai-ingest-spinner"
        hx-disabled-elt="button, input, select, textarea"
        class="space-y-3"
      >
        <fieldset class="fieldset">
          <legend class="fieldset-legend">${escapeHtml(messages.builder.knowledgeTitleLabel)}</legend>
          <input id="knowledge-title" name="title" type="text" class="input w-full" required aria-required="true" aria-label="${escapeHtml(messages.builder.knowledgeTitleLabel)}" />
        </fieldset>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">${escapeHtml(messages.builder.knowledgeSourceLabel)}</legend>
          <input id="knowledge-source" name="source" type="text" class="input w-full" required aria-required="true" aria-label="${escapeHtml(messages.builder.knowledgeSourceLabel)}" />
        </fieldset>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">${escapeHtml(messages.builder.knowledgeTextLabel)}</legend>
          <textarea id="knowledge-text" name="text" class="textarea w-full min-h-36" required aria-required="true" aria-label="${escapeHtml(messages.builder.knowledgeTextLabel)}"></textarea>
        </fieldset>
        <div class="flex items-center gap-2">
          <button type="submit" class="btn btn-primary btn-sm" aria-label="${escapeHtml(messages.builder.ingestKnowledgeDocument)}">
            ${escapeHtml(messages.builder.ingestKnowledgeDocument)}
            <span id="ai-ingest-spinner" class="${spinnerClasses.xs}" aria-label="${escapeHtml(messages.common.loading)}"></span>
          </button>
        </div>
      </form>
      <div id="ai-knowledge-documents" class="mt-4" aria-live="polite">
        ${renderKnowledgeDocumentList(messages, locale, projectId, documents)}
      </div>
    </div>
  </div>`;
};

/**
 * Renders the retrieval search + tool plan column.
 *
 * @param messages Locale-resolved messages.
 * @param locale Active locale.
 * @param projectId Active project id.
 * @returns HTML string for retrieval + tool plan workspace.
 */
const renderAiRetrievalAndToolPlan = (
  messages: Messages,
  locale: LocaleCode,
  projectId: string,
): string => {
  const aiKnowledgeSearchHref = withQueryParameters(appRoutes.aiBuilderKnowledgeSearch, {
    projectId,
    locale,
  });
  const aiToolPlanHref = withQueryParameters(appRoutes.aiBuilderToolPlan, {
    projectId,
    locale,
  });

  return `<div class="space-y-4">
    <div class="${cardClasses.bordered}">
      <div class="card-body">
        <h2 class="card-title">${escapeHtml(messages.builder.retrievalWorkspaceTitle)}</h2>
        <p class="text-sm text-base-content/70">${escapeHtml(messages.builder.retrievalWorkspaceDescription)}</p>
        <form
          hx-post="${escapeHtml(aiKnowledgeSearchHref)}"
          hx-target="#ai-retrieval-result"
          hx-swap="innerHTML"
          hx-indicator="#ai-retrieval-spinner"
          hx-disabled-elt="button, input, select, textarea"
          class="space-y-3"
        >
          <fieldset class="fieldset">
            <legend class="fieldset-legend">${escapeHtml(messages.builder.promptLabel)}</legend>
            <textarea id="retrieval-prompt" name="prompt" class="textarea w-full" rows="4" placeholder="${escapeHtml(messages.builder.retrievalPromptPlaceholder)}" required aria-required="true" aria-label="${escapeHtml(messages.builder.runRetrievalAssist)}"></textarea>
          </fieldset>
          <button type="submit" class="btn btn-primary btn-sm" aria-label="${escapeHtml(messages.builder.runRetrievalAssist)}">
            ${escapeHtml(messages.builder.runRetrievalAssist)}
            <span id="ai-retrieval-spinner" class="${spinnerClasses.xs}" aria-label="${escapeHtml(messages.common.loading)}"></span>
          </button>
        </form>
        <div id="ai-retrieval-result" class="mt-4" aria-live="polite"></div>
      </div>
    </div>

    <div class="${cardClasses.bordered}">
      <div class="card-body">
        <h2 class="card-title">${escapeHtml(messages.builder.toolPlanWorkspaceTitle)}</h2>
        <p class="text-sm text-base-content/70">${escapeHtml(messages.builder.toolPlanWorkspaceDescription)}</p>
        <form
          hx-post="${escapeHtml(aiToolPlanHref)}"
          hx-target="#ai-tool-plan-result"
          hx-swap="innerHTML"
          hx-indicator="#ai-plan-spinner"
          hx-disabled-elt="button, input, select, textarea"
          class="space-y-3"
        >
          <fieldset class="fieldset">
            <legend class="fieldset-legend">${escapeHtml(messages.builder.automationGoalLabel)}</legend>
            <textarea id="tool-plan-goal" name="goal" class="textarea w-full" rows="4" placeholder="${escapeHtml(messages.builder.toolPlanGoalPlaceholder)}" required aria-required="true" aria-label="${escapeHtml(messages.builder.automationGoalLabel)}"></textarea>
          </fieldset>
          <button type="submit" class="btn btn-outline btn-sm" aria-label="${escapeHtml(messages.builder.previewToolPlan)}">
            ${escapeHtml(messages.builder.previewToolPlan)}
            <span id="ai-plan-spinner" class="${spinnerClasses.xs}" aria-label="${escapeHtml(messages.common.loading)}"></span>
          </button>
        </form>
        <div id="ai-tool-plan-result" class="mt-4" aria-live="polite"></div>
      </div>
    </div>
  </div>`;
};

/**
 * Renders the patch preview and API surface cards.
 *
 * @param messages Locale-resolved messages.
 * @param locale Active locale.
 * @param projectId Active project id.
 * @returns HTML string for patch preview + API surface.
 */
const renderAiPatchAndApiSurface = (
  messages: Messages,
  locale: LocaleCode,
  projectId: string,
): string => {
  const aiPreviewHref = withQueryParameters(appRoutes.aiBuilderPatchPreviewForm, {
    projectId,
    locale,
  });

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

  return `<div class="grid gap-4 xl:grid-cols-2">
    <div class="${cardClasses.bordered}">
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
          ${renderBuilderHiddenFields(projectId, locale)}
          <fieldset class="fieldset">
            <legend class="fieldset-legend">${escapeHtml(messages.builder.operationsJsonLabel)}</legend>
            <textarea id="operations-json" name="operationsJson" class="textarea w-full min-h-28" placeholder="${escapeHtml(messages.builder.operationsJsonPlaceholder)}" aria-label="${escapeHtml(messages.builder.operationsJsonLabel)}"></textarea>
          </fieldset>
          <div class="flex items-center gap-2">
            <button type="submit" class="btn btn-outline btn-sm" aria-label="${escapeHtml(messages.builder.previewChanges)}">${escapeHtml(messages.builder.previewChanges)}</button>
            <span id="ai-patch-spinner" class="${spinnerClasses.sm}" aria-label="${escapeHtml(messages.common.loading)}"></span>
          </div>
        </form>
        <div id="ai-patch-result" class="mt-3" aria-live="polite"></div>
      </div>
    </div>

    <div class="${cardClasses.bordered}">
      <div class="card-body">
        <h2 class="card-title">${escapeHtml(messages.builder.apiSurfaceTitle)}</h2>
        <p class="text-sm text-base-content/70">${escapeHtml(messages.builder.apiSurfaceDescription)}</p>
        <ul class="list rounded-box bg-base-200/60">${endpointRows}</ul>
      </div>
    </div>
  </div>`;
};

/* ------------------------------------------------------------------ */
/*  Main panel renderer                                                */
/* ------------------------------------------------------------------ */

export const renderAiPanel = (
  messages: Messages,
  features: AvailableAiFeatures,
  runtimeProfile: AiRuntimeProfile,
  locale: LocaleCode,
  projectId: string,
  readiness: BuilderPlatformReadiness,
  documents: readonly KnowledgeDocumentRecord[],
): string => {
  const capabilityCount = countAvailableCapabilities(features);
  const reviewQueueHref = withQueryParameters(
    interpolateRoutePath(appRoutes.builderAutomation, { projectId }),
    { lang: locale },
  );
  const playtestHref = withQueryParameters(
    interpolateRoutePath(appRoutes.game, { projectId }),
    { lang: locale },
  );

  return `
    <div class="space-y-6 animate-fade-in-up">
      ${renderWorkspaceShell({
        eyebrow: messages.builder.advancedTools,
        title: messages.builder.projectSettings,
        description: messages.builder.advancedSettingsDescription,
        facets: [
          { label: messages.builder.providerStatus, badgeClassName: "badge-secondary badge-soft" },
          { label: messages.builder.creatorSafeAiDescription, badgeClassName: "badge-outline" },
        ],
        metrics: [
          {
            label: messages.builder.providerStatus,
            value: features.providers.length,
            toneClassName: "text-secondary",
          },
          {
            label: messages.builder.knowledgeWorkspaceTitle,
            value: documents.length,
            toneClassName: "text-primary",
          },
          {
            label: messages.builder.capabilityHeader,
            value: capabilityCount,
            toneClassName: "text-accent",
          },
        ],
        actions: `
          <a class="btn btn-outline btn-sm" href="${escapeHtml(playtestHref)}" aria-label="${escapeHtml(messages.builder.playtest)}">
            ${escapeHtml(messages.builder.playtest)}
          </a>
          <a class="btn btn-primary btn-sm" href="${escapeHtml(reviewQueueHref)}" aria-label="${escapeHtml(messages.builder.operations)}">
            ${escapeHtml(messages.builder.operations)}
          </a>
        `,
      })}
      ${renderWorkspaceFrame({
        navigatorTitle: messages.builder.providerStatus,
        navigatorDescription: messages.builder.advancedSettingsDescription,
        navigatorBody: `<div role="alert" class="alert alert-warning alert-soft">
            <span>${escapeHtml(messages.builder.creatorSafeAiDescription)}</span>
          </div>
          ${renderAiStatusHero(messages, runtimeProfile, features)}
          <div class="grid gap-4">
            ${renderAiCapabilityTable(messages, features)}
            ${renderAiModelInventory(messages, runtimeProfile)}
          </div>`,
        mainBody: `<div class="space-y-4">
          <details class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box" open>
            <summary class="collapse-title font-semibold" aria-label="${escapeHtml(messages.builder.platformReadinessTitle)}">${escapeHtml(messages.builder.platformReadinessTitle)}</summary>
            <div class="collapse-content">
              ${renderPlatformReadinessSection({
                messages,
                locale,
                projectId,
                readiness,
                keys: ["aiAuthoring", "automation"],
              })}
            </div>
          </details>

          <details class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
            <summary class="collapse-title font-semibold" aria-label="${escapeHtml(messages.builder.assistantReviewTitle)}">${escapeHtml(messages.builder.assistantReviewTitle)}</summary>
            <div class="collapse-content">
              <div class="grid gap-4 xl:grid-cols-2">
                ${renderAiAssistForm(messages, locale, projectId)}
                ${renderAiTestForm(messages, locale, projectId)}
              </div>
            </div>
          </details>

          <details class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
            <summary class="collapse-title font-semibold" aria-label="${escapeHtml(messages.builder.knowledgeWorkspaceTitle)}">${escapeHtml(messages.builder.knowledgeWorkspaceTitle)}</summary>
            <div class="collapse-content">
              <div class="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                ${renderAiKnowledgeWorkspace(messages, locale, projectId, documents)}
                ${renderAiRetrievalAndToolPlan(messages, locale, projectId)}
              </div>
            </div>
          </details>

          <details class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
            <summary class="collapse-title font-semibold" aria-label="${escapeHtml(messages.builder.previewChanges)}">${escapeHtml(messages.builder.previewChanges)}</summary>
            <div class="collapse-content">
              ${renderAiPatchAndApiSurface(messages, locale, projectId)}
            </div>
          </details>
        </div>`,
        sideSections: [
          {
            title: messages.builder.voicePreviewTitle,
            description: messages.builder.voicePreviewDescription,
            body: `<p class="text-sm text-base-content/70">${escapeHtml(messages.builder.voicePreviewDescription)}</p>
              <div class="grid gap-4">
                <div class="${cardClasses.bordered}">
                  <div class="card-body">
                    <h2 class="card-title">${escapeHtml(messages.builder.speechSynthesisLabel)}</h2>
                    <form
                      hx-post="${escapeHtml(withQueryParameters(appRoutes.aiSynthesize, { projectId, locale }))}"
                      hx-target="#voice-synthesize-result"
                      hx-swap="innerHTML"
                      hx-indicator="#voice-synthesize-spinner"
                      hx-disabled-elt="button, input, select, textarea"
                      class="space-y-3"
                    >
                      <fieldset class="fieldset">
                        <legend class="fieldset-legend">${escapeHtml(messages.builder.promptLabel)}</legend>
                        <textarea id="voice-synthesize-text" name="text" class="textarea w-full" rows="4" placeholder="${escapeHtml(messages.builder.synthesizeTextPlaceholder)}" required aria-required="true" aria-label="${escapeHtml(messages.builder.promptLabel)}"></textarea>
                      </fieldset>
                      <div class="flex items-center gap-2">
                        <button type="submit" class="btn btn-primary btn-sm" aria-label="${escapeHtml(messages.builder.synthesizeSubmit)}">
                          ${escapeHtml(messages.builder.synthesizeSubmit)}
                        </button>
                        <span id="voice-synthesize-spinner" class="${spinnerClasses.sm}" aria-label="${escapeHtml(messages.common.loading)}"></span>
                      </div>
                    </form>
                    <div id="voice-synthesize-result" class="mt-3" aria-live="polite"></div>
                  </div>
                </div>
                <div class="${cardClasses.bordered}">
                  <div class="card-body">
                    <h2 class="card-title">${escapeHtml(messages.builder.speechToTextLabel)}</h2>
                    <form
                      hx-post="${escapeHtml(withQueryParameters(appRoutes.aiTranscribe, { projectId, locale }))}"
                      hx-target="#voice-transcribe-result"
                      hx-swap="innerHTML"
                      hx-indicator="#voice-transcribe-spinner"
                      hx-disabled-elt="button, input, select, textarea"
                      hx-encoding="multipart/form-data"
                      class="space-y-3"
                    >
                      <fieldset class="fieldset">
                        <legend class="fieldset-legend">${escapeHtml(messages.builder.transcribeFileLabel)}</legend>
                        <input id="voice-transcribe-file" name="file" type="file" class="file-input file-input-sm w-full" accept="audio/*" required aria-required="true" aria-label="${escapeHtml(messages.builder.transcribeFileLabel)}" />
                      </fieldset>
                      <div class="flex items-center gap-2">
                        <button type="submit" class="btn btn-outline btn-sm" aria-label="${escapeHtml(messages.builder.transcribeSubmit)}">
                          ${escapeHtml(messages.builder.transcribeSubmit)}
                        </button>
                        <span id="voice-transcribe-spinner" class="${spinnerClasses.sm}" aria-label="${escapeHtml(messages.common.loading)}"></span>
                      </div>
                    </form>
                    <div id="voice-transcribe-result" class="mt-3" aria-live="polite"></div>
                  </div>
                </div>
              </div>`,
          },
        ],
      })}
    </div>`;
};
