/**
 * Settings Panel View
 *
 * Runtime diagnostics, project knowledge, and advanced creator-assistance tooling.
 * Decomposed into sub-sections for maintainability.
 */
import type { LocaleCode } from "../../config/environment.ts";
import type { AiRuntimeSettingValue } from "../../domain/ai/ai-runtime-settings-service.ts";
import type {
  KnowledgeDocumentRecord,
  KnowledgeSearchMatch,
} from "../../domain/ai/knowledge-base-service.ts";
import type { AiRuntimeProfile } from "../../domain/ai/local-runtime-profile.ts";
import type { ProviderModelCatalogEntry } from "../../domain/ai/provider-model-catalog.ts";
import type { AiToolPlanSuccess } from "../../domain/ai/providers/provider-types.ts";
import type { BuilderPlatformReadiness } from "../../domain/builder/platform-readiness.ts";
import type { AvailableAiFeatures } from "../../domain/game/ai/game-ai-service.ts";
import type { ProjectBranding } from "../../shared/branding/project-branding.ts";
import { interpolateRoutePath } from "../../shared/constants/route-patterns.ts";
import { appRoutes, withQueryParameters } from "../../shared/constants/routes.ts";
import type { CapabilityState, FeatureCapability } from "../../shared/contracts/game.ts";
import type { Messages } from "../../shared/i18n/messages.ts";
import { escapeHtml } from "../layout.ts";
import { cardClasses, renderBuilderHiddenFields, spinnerClasses } from "../shared/ui-components.ts";
import {
  getCapabilityStatusBadgeClass,
  getCapabilityStatusLabel,
  isCapabilityUsable,
} from "./capability-state.ts";
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
        interpolateRoutePath(appRoutes.aiBuilderKnowledgeDocumentDetail, {
          documentId: document.id,
        }),
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

const renderCapabilityNotice = (
  messages: Messages,
  title: string,
  state: CapabilityState,
  unavailableMessage: string,
): string => {
  if (state.status === "ready") {
    return "";
  }

  return `<div role="alert" class="alert ${state.status === "degraded" ? "alert-warning" : "alert-info"} alert-soft">
    <div>
      <h3 class="font-bold">${escapeHtml(title)}</h3>
      <div class="text-sm">${escapeHtml(
        state.status === "degraded"
          ? messages.builder.creatorSafeAiDescription
          : unavailableMessage,
      )}</div>
    </div>
  </div>`;
};

const renderBrandControlPlane = (messages: Messages, branding: ProjectBranding): string => `
  <section id="builder-brand-control-plane" class="rounded-[1.5rem] border border-base-300 bg-base-100 shadow-sm">
    <div class="flex flex-col gap-5 p-5 lg:p-6">
      <div class="space-y-2">
        <h2 class="text-xl font-semibold tracking-tight">${escapeHtml(messages.builder.brandControlPlaneTitle)}</h2>
        <p class="text-sm leading-6 text-base-content/72">${escapeHtml(messages.builder.brandControlPlaneDescription)}</p>
      </div>
      <div class="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <article class="${cardClasses.bordered}">
          <div class="card-body gap-4">
            <div>
              <h3 class="card-title text-base">${escapeHtml(messages.builder.brandIdentityTitle)}</h3>
              <p class="text-sm text-base-content/70">${escapeHtml(messages.builder.brandIdentityDescription)}</p>
            </div>
            <div class="flex items-center gap-4 rounded-[1.25rem] border border-base-300 bg-base-200/60 p-4">
              <div class="inline-flex size-14 items-center justify-center rounded-2xl bg-primary text-lg font-semibold text-primary-content shadow-sm">
                ${escapeHtml(branding.logoMark)}
              </div>
              <div class="space-y-1">
                <p class="text-lg font-semibold">${escapeHtml(branding.appName)}</p>
                <p class="text-sm text-base-content/70">${escapeHtml(branding.appSubtitle)}</p>
              </div>
            </div>
            <dl class="grid gap-3 sm:grid-cols-2">
              <div class="rounded-box border border-base-300 bg-base-200/60 p-3">
                <dt class="text-xs uppercase tracking-[0.18em] text-base-content/55">${escapeHtml(messages.builder.brandBuilderShellNameLabel)}</dt>
                <dd class="mt-2 text-sm font-medium">${escapeHtml(branding.builderShellName)}</dd>
              </div>
              <div class="rounded-box border border-base-300 bg-base-200/60 p-3">
                <dt class="text-xs uppercase tracking-[0.18em] text-base-content/55">${escapeHtml(messages.builder.brandPlayerShellNameLabel)}</dt>
                <dd class="mt-2 text-sm font-medium">${escapeHtml(branding.playerShellName)}</dd>
              </div>
            </dl>
          </div>
        </article>
        <article class="${cardClasses.bordered}">
          <div class="card-body gap-4">
            <div>
              <h3 class="card-title text-base">${escapeHtml(messages.builder.brandVisualSystemTitle)}</h3>
              <p class="text-sm text-base-content/70">${escapeHtml(messages.builder.brandVisualSystemDescription)}</p>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="rounded-box border border-base-300 bg-base-200/60 p-3">
                <p class="text-xs uppercase tracking-[0.18em] text-base-content/55">${escapeHtml(messages.builder.brandSurfaceThemeLabel)}</p>
                <p class="mt-2 text-sm font-medium">${escapeHtml(branding.surfaceTheme)}</p>
              </div>
              <div class="rounded-box border border-base-300 bg-base-200/60 p-3">
                <p class="text-xs uppercase tracking-[0.18em] text-base-content/55">${escapeHtml(messages.builder.brandHeadingFontLabel)}</p>
                <p class="mt-2 text-sm font-medium">${escapeHtml(branding.headingFont)}</p>
              </div>
              <div class="rounded-box border border-base-300 bg-base-200/60 p-3">
                <p class="text-xs uppercase tracking-[0.18em] text-base-content/55">${escapeHtml(messages.builder.brandBodyFontLabel)}</p>
                <p class="mt-2 text-sm font-medium">${escapeHtml(branding.bodyFont)}</p>
              </div>
              <div class="rounded-box border border-base-300 bg-base-200/60 p-3">
                <p class="text-xs uppercase tracking-[0.18em] text-base-content/55">${escapeHtml(messages.builder.brandMonoFontLabel)}</p>
                <p class="mt-2 text-sm font-medium">${escapeHtml(branding.monoFont)}</p>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-3">
              <div class="rounded-box border border-base-300 bg-base-200/60 p-3">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-base-content/55">${escapeHtml(messages.builder.brandPrimaryColorLabel)}</p>
                <p class="mt-3 text-sm font-medium">${escapeHtml(branding.primaryColor)}</p>
              </div>
              <div class="rounded-box border border-base-300 bg-base-200/60 p-3">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-base-content/55">${escapeHtml(messages.builder.brandSecondaryColorLabel)}</p>
                <p class="mt-3 text-sm font-medium">${escapeHtml(branding.secondaryColor)}</p>
              </div>
              <div class="rounded-box border border-base-300 bg-base-200/60 p-3">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-base-content/55">${escapeHtml(messages.builder.brandAccentColorLabel)}</p>
                <p class="mt-3 text-sm font-medium">${escapeHtml(branding.accentColor)}</p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>`;

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

const renderWorkbenchJumpLinks = (
  ariaLabel: string,
  links: ReadonlyArray<{ label: string; href: string; tone?: "primary" | "ghost" | "outline" }>,
): string => `<nav class="surface-scroll surface-scroll-x surface-scroll-fade-x touch-pan-x px-1" tabindex="0" aria-label="${escapeHtml(ariaLabel)}">
  <div class="flex min-w-max flex-nowrap gap-2 pb-1">
    ${links
      .map(
        (link) =>
          `<a class="btn btn-${escapeHtml(link.tone ?? "ghost")} btn-sm" href="${escapeHtml(link.href)}" aria-label="${escapeHtml(link.label)}">${escapeHtml(link.label)}</a>`,
      )
      .join("")}
  </div>
</nav>`;

const renderWorkbenchSummaryCard = (
  title: string,
  description: string,
  actions: ReadonlyArray<{ label: string; href: string; tone?: "primary" | "ghost" | "outline" }>,
): string => `<article class="${cardClasses.bordered}">
  <div class="card-body gap-4">
    <div class="space-y-2">
      <h3 class="card-title text-base">${escapeHtml(title)}</h3>
      <p class="text-sm leading-6 text-base-content/72">${escapeHtml(description)}</p>
    </div>
    <div class="flex flex-wrap gap-2">
      ${actions
        .map(
          (action) =>
            `<a class="btn btn-${escapeHtml(action.tone ?? "ghost")} btn-sm" href="${escapeHtml(action.href)}" aria-label="${escapeHtml(action.label)}">${escapeHtml(action.label)}</a>`,
        )
        .join("")}
    </div>
  </div>
</article>`;

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

const renderAiCapabilityStatusCards = (
  messages: Messages,
  featureCapabilities: FeatureCapability,
): string => {
  const cards = [
    {
      label: messages.builder.assistantReviewTitle,
      state: featureCapabilities.assist,
    },
    {
      label: messages.builder.testDialogue,
      state: featureCapabilities.test,
    },
    {
      label: messages.builder.toolPlanWorkspaceTitle,
      state: featureCapabilities.toolLikeSuggestions,
    },
    {
      label: messages.builder.creatorCapabilityKnowledgeRetrieval,
      state: featureCapabilities.knowledgeRetrieval,
    },
  ];

  return `<div class="grid gap-4 xl:grid-cols-4">${cards
    .map(
      (card) => `<article class="${cardClasses.bordered}">
        <div class="card-body gap-3">
          <div class="flex items-center justify-between gap-3">
            <h2 class="card-title text-base">${escapeHtml(card.label)}</h2>
            <span class="badge ${getCapabilityStatusBadgeClass(card.state.status)} badge-soft">${escapeHtml(
              getCapabilityStatusLabel(messages, card.state.status),
            )}</span>
          </div>
        </div>
      </article>`,
    )
    .join("")}</div>`;
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
      <div class="surface-scroll surface-scroll-x surface-scroll-fade-x touch-pan-x px-1" tabindex="0">
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
 * Search-state payload rendered by the model settings workspace.
 */
export interface AiModelCatalogSearchState {
  /** Active setting key currently being searched. */
  readonly settingKey: string;
  /** Provider lane used for the active search. */
  readonly provider: string;
  /** Slot identifier used for the active search. */
  readonly slot: string;
  /** Search query text. */
  readonly search: string;
  /** Optional author filter text. */
  readonly author: string;
  /** Normalized search result items. */
  readonly items: readonly ProviderModelCatalogEntry[];
  /** Optional error message when the provider search fails. */
  readonly error?: string;
}

const aiSettingSourceBadgeClass = (source: AiRuntimeSettingValue["source"]): string => {
  switch (source) {
    case "override":
      return "badge-primary badge-soft";
    case "env":
      return "badge-secondary badge-soft";
    default:
      return "badge-outline";
  }
};

const aiSettingSourceLabel = (
  messages: Messages,
  source: AiRuntimeSettingValue["source"],
): string => {
  switch (source) {
    case "override":
      return messages.builder.aiModelCatalogSourceOverride;
    case "env":
      return messages.builder.aiModelCatalogSourceEnv;
    default:
      return messages.builder.aiModelCatalogSourceDefault;
  }
};

const searchableProviderLanes = new Set([
  "transformers-local",
  "huggingface-inference",
  "ollama",
  "openai-compatible-local",
  "openai-compatible-cloud",
]);

const searchableSlots = new Set([
  "sentiment",
  "oracle",
  "npcDialogue",
  "embeddings",
  "speechToText",
  "textToSpeech",
  "imageGenerationModel",
  "chat",
  "embedding",
  "vision",
  "transcription",
  "speech",
  "moderation",
  "image",
]);

const renderAiSettingsForm = (
  messages: Messages,
  locale: LocaleCode,
  projectId: string,
  setting: AiRuntimeSettingValue,
  submitLabel: string,
): string => {
  const action = withQueryParameters(appRoutes.aiSettings, { projectId, locale });

  return `<form
    class="flex flex-wrap items-center gap-2"
    hx-patch="${escapeHtml(action)}"
    hx-target="#ai-model-settings-workspace"
    hx-swap="outerHTML"
    hx-disabled-elt="button, input, select, textarea"
  >
    <input type="hidden" name="key" value="${escapeHtml(setting.key)}" />
    <input
      type="${setting.valueType === "integer" || setting.valueType === "float" ? "number" : "text"}"
      ${setting.valueType === "float" ? `step="0.1"` : ""}
      class="input input-sm w-full md:w-56"
      name="value"
      value="${escapeHtml(String(setting.value))}"
      aria-label="${escapeHtml(setting.label)}"
    />
    <button type="submit" class="btn btn-primary btn-sm" aria-label="${escapeHtml(submitLabel)}">${escapeHtml(submitLabel)}</button>
    <button type="submit" name="reset" value="true" class="btn btn-ghost btn-sm" aria-label="${escapeHtml(
      messages.builder.aiModelCatalogResetSubmit,
    )}">${escapeHtml(messages.builder.aiModelCatalogResetSubmit)}</button>
  </form>`;
};

export const renderAiProviderSearchPanel = (
  messages: Messages,
  locale: LocaleCode,
  projectId: string,
  searchState?: AiModelCatalogSearchState,
): string => {
  if (!searchState) {
    return `<div id="ai-model-search-results" class="${cardClasses.bordered}">
      <div class="card-body">
        <h2 class="card-title">${escapeHtml(messages.builder.aiModelCatalogSearchTitle)}</h2>
        <div role="status" class="alert alert-info alert-soft">
          <span>${escapeHtml(messages.builder.aiModelCatalogSearchDescription)}</span>
        </div>
      </div>
    </div>`;
  }

  if (searchState.error) {
    return `<div id="ai-model-search-results" class="${cardClasses.bordered}">
      <div class="card-body">
        <h2 class="card-title">${escapeHtml(messages.builder.aiModelCatalogSearchTitle)}</h2>
        <div role="alert" class="alert alert-error alert-soft">
          <span>${escapeHtml(searchState.error)}</span>
        </div>
      </div>
    </div>`;
  }

  const applyAction = withQueryParameters(appRoutes.aiSettings, { projectId, locale });
  const rows =
    searchState.items.length > 0
      ? searchState.items
          .map(
            (item) => `<tr class="hover:bg-base-200/70">
              <td class="font-medium">${escapeHtml(item.label)}</td>
              <td><code class="text-xs">${escapeHtml(item.model)}</code></td>
              <td>${escapeHtml(item.summary)}</td>
              <td><span class="badge badge-outline badge-xs">${escapeHtml(item.source)}</span></td>
              <td class="text-right">
                <form
                  hx-patch="${escapeHtml(applyAction)}"
                  hx-target="#ai-model-settings-workspace"
                  hx-swap="outerHTML"
                  hx-disabled-elt="button, input"
                >
                  <input type="hidden" name="key" value="${escapeHtml(searchState.settingKey)}" />
                  <input type="hidden" name="value" value="${escapeHtml(item.model)}" />
                  <button type="submit" class="btn btn-primary btn-xs" aria-label="${escapeHtml(
                    messages.builder.save,
                  )}">${escapeHtml(messages.builder.save)}</button>
                </form>
              </td>
            </tr>`,
          )
          .join("")
      : `<tr><td colspan="5" class="text-sm text-base-content/70">${escapeHtml(
          messages.builder.aiModelCatalogNoResults,
        )}</td></tr>`;

  return `<div id="ai-model-search-results" class="${cardClasses.bordered}">
    <div class="card-body gap-4">
      <div class="flex items-center justify-between gap-3">
        <div>
          <h2 class="card-title">${escapeHtml(messages.builder.aiModelCatalogSearchTitle)}</h2>
          <p class="text-sm text-base-content/70">${escapeHtml(`${searchState.provider} · ${searchState.slot}`)}</p>
        </div>
        <span class="badge badge-outline">${escapeHtml(`${searchState.items.length}`)}</span>
      </div>
      <div class="surface-scroll surface-scroll-x surface-scroll-fade-x touch-pan-x px-1" tabindex="0">
        <table class="table table-sm">
          <thead>
            <tr>
              <th scope="col">${escapeHtml(messages.builder.titleLabel)}</th>
              <th scope="col">${escapeHtml(messages.builder.modelLabel)}</th>
              <th scope="col">${escapeHtml(messages.builder.descriptionLabel)}</th>
              <th scope="col">${escapeHtml(messages.builder.statusHeader)}</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  </div>`;
};

/**
 * Renders the model-catalog and runtime override workspace.
 *
 * @param messages Locale-resolved messages.
 * @param locale Active locale.
 * @param projectId Active project id.
 * @param runtimeProfile Effective runtime profile with editable settings.
 * @param searchState Optional active provider search state.
 * @returns HTML string for the runtime override workspace.
 */
export const renderAiModelSettingsWorkspace = (
  messages: Messages,
  locale: LocaleCode,
  projectId: string,
  runtimeProfile: AiRuntimeProfile,
  searchState?: AiModelCatalogSearchState,
): string => {
  const laneTitles: Readonly<Record<string, string>> = {
    "transformers-local": messages.builder.aiModelCatalogLaneTransformersLocal,
    ollama: messages.builder.aiModelCatalogLaneOllama,
    "openai-compatible-local": messages.builder.aiModelCatalogLaneApiCompatibleLocal,
    "openai-compatible-cloud": messages.builder.aiModelCatalogLaneApiCompatibleCloud,
    "huggingface-inference": messages.builder.aiModelCatalogLaneHfInference,
    "huggingface-endpoints": messages.builder.aiModelCatalogLaneHfEndpoints,
    "image-generation": messages.builder.aiModelCatalogLaneImageGeneration,
  };

  const laneIds = [
    "transformers-local",
    "ollama",
    "openai-compatible-local",
    "openai-compatible-cloud",
    "huggingface-inference",
    "image-generation",
  ];

  const laneContent = laneIds
    .map((laneId, index) => {
      const laneSettings = runtimeProfile.settings.filter(
        (setting) => setting.providerLane === laneId,
      );
      const laneActionMarkup =
        laneId === "ollama"
          ? `<form
              class="flex flex-wrap items-center gap-2"
              hx-post="${escapeHtml(withQueryParameters(appRoutes.aiProviderOllamaPull, { projectId, locale }))}"
              hx-target="#ai-model-settings-workspace"
              hx-swap="outerHTML"
              hx-disabled-elt="button, input"
            >
              <input type="hidden" name="slot" value="chat" />
              <input
                type="text"
                name="model"
                class="input input-sm w-full md:w-64"
                placeholder="${escapeHtml(messages.builder.aiModelCatalogPullPlaceholder)}"
                aria-label="${escapeHtml(messages.builder.aiModelCatalogPullPlaceholder)}"
              />
              <button type="submit" class="btn btn-secondary btn-sm" aria-label="${escapeHtml(
                messages.builder.aiModelCatalogPullSubmit,
              )}">${escapeHtml(messages.builder.aiModelCatalogPullSubmit)}</button>
            </form>`
          : "";
      const settingRows = laneSettings
        .map((setting) => {
          const valueCell =
            setting.valueType === "string" &&
            searchableProviderLanes.has(setting.providerLane) &&
            searchableSlots.has(setting.slot)
              ? `<div class="space-y-2">
                  <div class="flex flex-wrap items-center gap-2">
                    <code class="text-xs">${escapeHtml(String(setting.value))}</code>
                    <span class="badge ${aiSettingSourceBadgeClass(setting.source)} badge-xs">${escapeHtml(
                      aiSettingSourceLabel(messages, setting.source),
                    )}</span>
                  </div>
                  <form
                    class="flex flex-wrap items-center gap-2"
                    hx-get="${escapeHtml(
                      withQueryParameters(appRoutes.aiProviderModels, {
                        projectId,
                        locale,
                        provider: setting.providerLane,
                        slot: setting.slot,
                        settingKey: setting.key,
                      }),
                    )}"
                    hx-target="#ai-model-search-results"
                    hx-swap="innerHTML"
                    hx-disabled-elt="button, input, select, textarea"
                  >
                    <label class="input input-sm w-full md:w-64">
                      <svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <g stroke-linejoin="round" stroke-linecap="round" stroke-width="2.5" fill="none" stroke="currentColor">
                          <circle cx="11" cy="11" r="8"></circle>
                          <path d="m21 21-4.3-4.3"></path>
                        </g>
                      </svg>
                      <input type="search" name="search" placeholder="${escapeHtml(
                        messages.builder.aiModelCatalogSearchPlaceholder,
                      )}" aria-label="${escapeHtml(setting.label)}" />
                    </label>
                    <input type="text" name="author" class="input input-sm w-full md:w-40" placeholder="${escapeHtml(
                      messages.builder.aiModelCatalogAuthorPlaceholder,
                    )}" aria-label="${escapeHtml(messages.builder.aiModelCatalogAuthorPlaceholder)}" />
                    <button type="submit" class="btn btn-outline btn-sm" aria-label="${escapeHtml(
                      messages.builder.aiModelCatalogSearchSubmit,
                    )}">${escapeHtml(messages.builder.aiModelCatalogSearchSubmit)}</button>
                    <button
                      type="button"
                      class="btn btn-ghost btn-sm"
                      hx-patch="${escapeHtml(
                        withQueryParameters(appRoutes.aiSettings, { projectId, locale }),
                      )}"
                      hx-target="#ai-model-settings-workspace"
                      hx-swap="outerHTML"
                      hx-vals='${escapeHtml(JSON.stringify({ key: setting.key, reset: true }))}'
                      aria-label="${escapeHtml(messages.builder.aiModelCatalogResetSubmit)}"
                    >
                      ${escapeHtml(messages.builder.aiModelCatalogResetSubmit)}
                    </button>
                  </form>
                </div>`
              : renderAiSettingsForm(messages, locale, projectId, setting, messages.builder.save);

          return `<tr>
            <td class="font-medium">${escapeHtml(setting.label)}</td>
            <td><span class="badge badge-outline badge-xs">${escapeHtml(setting.slot)}</span></td>
            <td>${valueCell}</td>
          </tr>`;
        })
        .join("");

      return `<input type="radio" name="ai_model_tabs" class="tab" aria-label="${escapeHtml(
        laneTitles[laneId] ?? laneId,
      )}" ${index === 0 ? 'checked="checked"' : ""} />
      <div class="tab-content border-base-300 bg-base-100 p-4">
        <div class="${cardClasses.bordered}">
          <div class="card-body gap-4">
            <div class="flex items-center justify-between gap-3">
              <h3 class="card-title">${escapeHtml(laneTitles[laneId] ?? laneId)}</h3>
              <span class="badge badge-outline">${escapeHtml(`${laneSettings.length}`)}</span>
            </div>
            ${laneActionMarkup}
            ${
              laneSettings.length > 0
                ? `<div class="surface-scroll surface-scroll-x surface-scroll-fade-x touch-pan-x px-1" tabindex="0">
                    <table class="table table-sm">
                      <thead>
                        <tr>
                          <th scope="col">${escapeHtml(messages.builder.titleLabel)}</th>
                          <th scope="col">${escapeHtml(messages.builder.taskLabel)}</th>
                          <th scope="col">${escapeHtml(messages.builder.modelLabel)}</th>
                        </tr>
                      </thead>
                      <tbody>${settingRows}</tbody>
                    </table>
                  </div>`
                : `<div role="status" class="alert alert-info alert-soft"><span>${escapeHtml(
                    messages.builder.aiModelCatalogNoLaneSettings,
                  )}</span></div>`
            }
          </div>
        </div>
      </div>`;
    })
    .join("");

  return `<section id="ai-model-settings-workspace" class="space-y-4">
    <div class="${cardClasses.bordered}">
      <div class="card-body gap-4">
        <div>
          <h2 class="card-title">${escapeHtml(messages.builder.aiModelCatalogWorkspaceTitle)}</h2>
          <p class="text-sm text-base-content/70">${escapeHtml(
            messages.builder.aiModelCatalogWorkspaceDescription,
          )}</p>
        </div>
        <div class="tabs tabs-lift tabs-sm">${laneContent}</div>
      </div>
    </div>
    ${renderAiProviderSearchPanel(messages, locale, projectId, searchState)}
  </section>`;
};

/**
 * Renders the AI assist form (fieldset pattern, not form-control).
 *
 * @param messages Locale-resolved messages.
 * @param locale Active locale.
 * @param projectId Active project id.
 * @returns HTML string for the AI assist form.
 */
const renderAiAssistForm = (
  messages: Messages,
  locale: LocaleCode,
  projectId: string,
  state: CapabilityState,
): string => {
  const aiAssistHref = withQueryParameters(appRoutes.aiBuilderAssist, { projectId });

  return `<div class="${cardClasses.bordered}">
    <div class="card-body">
      <h2 class="card-title">${escapeHtml(messages.builder.assistantReviewTitle)}</h2>
      <p class="text-sm text-base-content/70">${escapeHtml(messages.builder.assistantReviewDescription)}</p>
      ${renderCapabilityNotice(
        messages,
        messages.builder.assistantReviewTitle,
        state,
        messages.ai.designAssistUnavailable,
      )}
      ${
        isCapabilityUsable(state)
          ? `<form
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
            </form>`
          : ""
      }
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
const renderAiTestForm = (
  messages: Messages,
  locale: LocaleCode,
  projectId: string,
  state: CapabilityState,
): string => {
  const aiTestHref = withQueryParameters(appRoutes.aiBuilderTest, { projectId });

  return `<div class="${cardClasses.bordered}">
    <div class="card-body">
      <h2 class="card-title">${escapeHtml(messages.builder.testDialogue)}</h2>
      ${renderCapabilityNotice(
        messages,
        messages.builder.testDialogue,
        state,
        messages.ai.dialogueGenerationUnavailable,
      )}
      ${
        isCapabilityUsable(state)
          ? `<form
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
            </form>`
          : ""
      }
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
  toolPlanState: CapabilityState,
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
        ${renderCapabilityNotice(
          messages,
          messages.builder.toolPlanWorkspaceTitle,
          toolPlanState,
          messages.ai.toolPlanningUnavailable,
        )}
        ${
          isCapabilityUsable(toolPlanState)
            ? `<form
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
              </form>`
            : ""
        }
        <div id="ai-tool-plan-result" class="mt-4" aria-live="polite"></div>
      </div>
    </div>
  </div>`;
};

/**
 * Renders the Hugging Face fine-tuning submission form.
 *
 * @param messages Locale-resolved messages.
 * @param locale Active locale.
 * @param projectId Active project id.
 * @returns HTML string for HF training submission workspace.
 */
const renderAiFineTuneWorkspace = (
  messages: Messages,
  locale: LocaleCode,
  projectId: string,
): string => {
  const submitHref = withQueryParameters(appRoutes.aiBuilderHfTraining, {
    projectId,
    locale,
  });
  return `<div class="${cardClasses.bordered}">
    <div class="card-body">
      <h2 class="card-title">${escapeHtml(messages.builder.fineTuneWorkspaceTitle)}</h2>
      <p class="text-sm text-base-content/70">${escapeHtml(messages.builder.fineTuneWorkspaceDescription)}</p>
      <form
        hx-post="${escapeHtml(submitHref)}"
        hx-target="#ai-hf-training-result"
        hx-swap="innerHTML"
        hx-indicator="#ai-hf-training-spinner"
        hx-disabled-elt="button, input, select, textarea"
        class="space-y-3"
      >
        ${renderBuilderHiddenFields(projectId, locale)}
        <fieldset class="fieldset">
          <legend class="fieldset-legend">${escapeHtml(messages.builder.hfTrainingDatasetLabel)}</legend>
          <input
            id="hf-training-dataset"
            name="datasetId"
            type="text"
            class="input w-full"
            placeholder="${escapeHtml(messages.builder.hfTrainingDatasetPlaceholder)}"
            required
            aria-required="true"
            aria-label="${escapeHtml(messages.builder.hfTrainingDatasetLabel)}"
          />
        </fieldset>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">${escapeHtml(messages.builder.hfTrainingSplitLabel)}</legend>
          <input
            id="hf-training-dataset-split"
            name="datasetSplit"
            type="text"
            class="input w-full"
            value="train"
            aria-label="${escapeHtml(messages.builder.hfTrainingSplitLabel)}"
          />
        </fieldset>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">${escapeHtml(messages.builder.hfTrainingBaseModelLabel)}</legend>
          <input
            id="hf-training-base-model"
            name="baseModel"
            type="text"
            class="input w-full"
            value="meta-llama/Llama-3.2-3B-Instruct"
            required
            aria-required="true"
            aria-label="${escapeHtml(messages.builder.hfTrainingBaseModelLabel)}"
          />
        </fieldset>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">${escapeHtml(messages.builder.hfTrainingOutputModelLabel)}</legend>
          <input
            id="hf-training-output-model"
            name="outputModel"
            type="text"
            class="input w-full"
            placeholder="${escapeHtml(messages.builder.hfTrainingOutputModelPlaceholder)}"
            required
            aria-required="true"
            aria-label="${escapeHtml(messages.builder.hfTrainingOutputModelLabel)}"
          />
        </fieldset>
        <div class="grid gap-3 sm:grid-cols-3">
          <fieldset class="fieldset">
            <legend class="fieldset-legend">${escapeHtml(messages.builder.hfTrainingMethodLabel)}</legend>
            <select
              id="hf-training-method"
              name="method"
              class="select w-full"
              aria-label="${escapeHtml(messages.builder.hfTrainingMethodLabel)}"
            >
              <option value="sft">${escapeHtml(messages.builder.hfTrainingMethodSft)}</option>
              <option value="dpo">${escapeHtml(messages.builder.hfTrainingMethodDpo)}</option>
              <option value="grpo">${escapeHtml(messages.builder.hfTrainingMethodGrpo)}</option>
              <option value="reward">${escapeHtml(messages.builder.hfTrainingMethodReward)}</option>
            </select>
          </fieldset>
          <fieldset class="fieldset">
            <legend class="fieldset-legend">${escapeHtml(messages.builder.hfTrainingEpochsLabel)}</legend>
            <input
              id="hf-training-epochs"
              name="epochs"
              type="number"
              min="1"
              step="1"
              value="3"
              class="input w-full"
              aria-label="${escapeHtml(messages.builder.hfTrainingEpochsLabel)}"
            />
          </fieldset>
          <fieldset class="fieldset">
            <legend class="fieldset-legend">${escapeHtml(messages.builder.hfTrainingLearningRateLabel)}</legend>
            <input
              id="hf-training-learning-rate"
              name="learningRate"
              type="number"
              min="0.000001"
              max="1"
              step="0.000001"
              value="0.00002"
              class="input w-full"
              aria-label="${escapeHtml(messages.builder.hfTrainingLearningRateLabel)}"
            />
          </fieldset>
        </div>
        <div class="flex items-center gap-2">
          <button type="submit" class="btn btn-secondary btn-sm" aria-label="${escapeHtml(messages.builder.hfTrainingSubmit)}">
            ${escapeHtml(messages.builder.hfTrainingSubmit)}
          </button>
          <span id="ai-hf-training-spinner" class="${spinnerClasses.sm}" aria-label="${escapeHtml(messages.common.loading)}"></span>
        </div>
      </form>
      <div id="ai-hf-training-result" class="mt-4" aria-live="polite"></div>
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
  featureCapabilities: FeatureCapability,
  runtimeProfile: AiRuntimeProfile,
  locale: LocaleCode,
  projectId: string,
  branding: ProjectBranding,
  readiness: BuilderPlatformReadiness,
  documents: readonly KnowledgeDocumentRecord[],
): string => {
  const capabilityCount = countAvailableCapabilities(features);
  const reviewQueueHref = withQueryParameters(
    interpolateRoutePath(appRoutes.builderAutomation, { projectId }),
    { lang: locale },
  );
  const playtestHref = withQueryParameters(interpolateRoutePath(appRoutes.game, { projectId }), {
    lang: locale,
  });
  const providerHref = withQueryParameters(
    `${interpolateRoutePath(appRoutes.builderAi, { projectId })}#builder-provider-workbench`,
    { lang: locale },
  );
  const assistantReviewHref = withQueryParameters(
    `${interpolateRoutePath(appRoutes.builderAi, { projectId })}#builder-assistant-review`,
    { lang: locale },
  );
  const knowledgeHref = withQueryParameters(
    `${interpolateRoutePath(appRoutes.builderAi, { projectId })}#builder-knowledge-workspace`,
    { lang: locale },
  );
  const brandingHref = withQueryParameters(
    `${interpolateRoutePath(appRoutes.builderAi, { projectId })}#builder-brand-control-plane`,
    { lang: locale },
  );
  const modelCatalogHref = withQueryParameters(
    `${interpolateRoutePath(appRoutes.builderAi, { projectId })}#builder-model-catalog`,
    { lang: locale },
  );
  const patchPreviewHref = withQueryParameters(
    `${interpolateRoutePath(appRoutes.builderAi, { projectId })}#builder-patch-preview`,
    { lang: locale },
  );
  const jumpLinks = renderWorkbenchJumpLinks(messages.builder.projectSettings, [
    { label: messages.builder.brandControlPlaneTitle, href: brandingHref },
    { label: messages.builder.providerStatus, href: providerHref, tone: "primary" },
    { label: messages.builder.assistantReviewTitle, href: assistantReviewHref },
    { label: messages.builder.knowledgeWorkspaceTitle, href: knowledgeHref },
    { label: messages.builder.aiModelCatalogWorkspaceTitle, href: modelCatalogHref },
    { label: messages.builder.previewChanges, href: patchPreviewHref },
    { label: messages.builder.operations, href: reviewQueueHref, tone: "outline" },
  ]);
  const workbenchCards = [
    renderWorkbenchSummaryCard(
      messages.builder.brandControlPlaneTitle,
      messages.builder.brandControlPlaneDescription,
      [
        { label: messages.builder.brandControlPlaneTitle, href: brandingHref, tone: "primary" },
        { label: messages.builder.knowledgeWorkspaceTitle, href: knowledgeHref },
      ],
    ),
    renderWorkbenchSummaryCard(
      messages.builder.providerStatus,
      messages.builder.advancedSettingsDescription,
      [
        { label: messages.builder.providerStatus, href: providerHref, tone: "primary" },
        { label: messages.builder.aiModelCatalogWorkspaceTitle, href: modelCatalogHref },
      ],
    ),
    renderWorkbenchSummaryCard(
      messages.builder.knowledgeWorkspaceTitle,
      messages.builder.knowledgeWorkspaceDescription,
      [
        { label: messages.builder.knowledgeWorkspaceTitle, href: knowledgeHref, tone: "primary" },
        { label: messages.builder.assistantReviewTitle, href: assistantReviewHref },
      ],
    ),
    renderWorkbenchSummaryCard(
      messages.builder.operations,
      messages.builder.advancedAutomationDescription,
      [
        { label: messages.builder.operations, href: reviewQueueHref, tone: "primary" },
        { label: messages.builder.previewChanges, href: patchPreviewHref, tone: "ghost" },
        { label: messages.builder.playtest, href: playtestHref, tone: "outline" },
      ],
    ),
  ].join("");

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
          <a class="btn btn-outline btn-sm" href="${escapeHtml(knowledgeHref)}" aria-label="${escapeHtml(messages.builder.knowledgeWorkspaceTitle)}">
            ${escapeHtml(messages.builder.knowledgeWorkspaceTitle)}
          </a>
          <a class="btn btn-primary btn-sm" href="${escapeHtml(reviewQueueHref)}" aria-label="${escapeHtml(messages.builder.operations)}">
            ${escapeHtml(messages.builder.operations)}
          </a>
        `,
      })}
      ${renderWorkspaceFrame({
        navigatorTitle: messages.builder.projectSettings,
        navigatorDescription: messages.builder.advancedSettingsDescription,
        navigatorBody: `<div role="alert" class="alert alert-warning alert-soft">
            <span>${escapeHtml(messages.builder.creatorSafeAiDescription)}</span>
          </div>
          <div class="rounded-[1.25rem] border border-base-300 bg-base-100 p-4 shadow-sm">
            ${jumpLinks}
          </div>
          ${renderAiStatusHero(messages, runtimeProfile, features)}
          ${renderAiCapabilityStatusCards(messages, featureCapabilities)}
          <div class="grid gap-4">
            ${renderAiCapabilityTable(messages, features)}
            ${renderAiModelInventory(messages, runtimeProfile)}
          </div>`,
        mainBody: `<div class="space-y-4">
          <section id="builder-capability-overview" class="rounded-[1.5rem] border border-base-300 bg-base-100 shadow-sm">
            <div class="flex flex-col gap-4 p-5 lg:p-6">
              <div class="space-y-2">
                <h2 class="text-xl font-semibold tracking-tight">${escapeHtml(messages.builder.projectSettings)}</h2>
                <p class="text-sm leading-6 text-base-content/72">${escapeHtml(messages.builder.advancedSettingsDescription)}</p>
              </div>
              <div class="grid gap-4 xl:grid-cols-4">
                ${workbenchCards}
              </div>
            </div>
          </section>

          ${renderBrandControlPlane(messages, branding)}

          <section id="builder-provider-workbench">
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
          </section>

          <section id="builder-assistant-review">
            <details class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
              <summary class="collapse-title font-semibold" aria-label="${escapeHtml(messages.builder.assistantReviewTitle)}">${escapeHtml(messages.builder.assistantReviewTitle)}</summary>
              <div class="collapse-content">
                <div class="grid gap-4 xl:grid-cols-2">
                  ${renderAiAssistForm(messages, locale, projectId, featureCapabilities.assist)}
                  ${renderAiTestForm(messages, locale, projectId, featureCapabilities.test)}
                </div>
              </div>
            </details>
          </section>

          <section id="builder-knowledge-workspace">
            <details class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
              <summary class="collapse-title font-semibold" aria-label="${escapeHtml(messages.builder.knowledgeWorkspaceTitle)}">${escapeHtml(messages.builder.knowledgeWorkspaceTitle)}</summary>
              <div class="collapse-content">
                <div class="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                  ${renderAiKnowledgeWorkspace(messages, locale, projectId, documents)}
                  <div class="space-y-4">
                    ${renderAiRetrievalAndToolPlan(
                      messages,
                      locale,
                      projectId,
                      featureCapabilities.toolLikeSuggestions,
                    )}
                    ${renderAiFineTuneWorkspace(messages, locale, projectId)}
                  </div>
                </div>
              </div>
            </details>
          </section>

          <section id="builder-model-catalog">
            <details class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
              <summary class="collapse-title font-semibold" aria-label="${escapeHtml(
                messages.builder.aiModelCatalogWorkspaceTitle,
              )}">${escapeHtml(messages.builder.aiModelCatalogWorkspaceTitle)}</summary>
              <div class="collapse-content">
                ${renderAiModelSettingsWorkspace(messages, locale, projectId, runtimeProfile)}
              </div>
            </details>
          </section>

          <section id="builder-patch-preview">
            <details class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
              <summary class="collapse-title font-semibold" aria-label="${escapeHtml(messages.builder.previewChanges)}">${escapeHtml(messages.builder.previewChanges)}</summary>
              <div class="collapse-content">
                ${renderAiPatchAndApiSurface(messages, locale, projectId)}
              </div>
            </details>
          </section>
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
