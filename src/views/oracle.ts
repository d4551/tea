import { appConfig, type LocaleCode } from "../config/environment.ts";
import type { OracleMode, OracleOutcome } from "../domain/oracle/oracle-types.ts";
import { oracleModes } from "../shared/constants/oracle.ts";
import { appRoutes } from "../shared/constants/routes.ts";
import type { Messages } from "../shared/i18n/messages.ts";
import { escapeHtml } from "./layout.ts";

/**
 * Oracle panel state for initial rendering and HTMX partial updates.
 */
export type OraclePanelState =
  | {
      readonly state: "idle";
      readonly mode: OracleMode;
      readonly question: string;
    }
  | {
      readonly state: "loading";
      readonly mode: OracleMode;
      readonly question: string;
    }
  | ({
      readonly mode: OracleMode;
      readonly question: string;
    } & OracleOutcome);

/**
 * Renders the oracle interaction form and stateful result panel.
 *
 * @param messages Localized message catalog.
 * @param panelState Oracle UI state.
 * @param locale Active locale code for deterministic form submissions.
 * @returns HTML section.
 */
export const renderOracleSection = (
  messages: Messages,
  panelState: OraclePanelState,
  locale: LocaleCode,
): string => {
  const modeOptions = renderModeOptions(messages, panelState.mode);

  return `<section aria-labelledby="oracle-title" class="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
    <article class="card border border-base-300 bg-base-100 shadow-sm">
      <div class="card-body gap-4">
        <h2 id="oracle-title" class="card-title text-2xl">${escapeHtml(messages.oracle.cardTitle)}</h2>
        <p class="opacity-90">${escapeHtml(messages.oracle.cardDescription)}</p>
        <form
          id="oracle-form"
          method="get"
          action="${appRoutes.home}"
          hx-get="${appRoutes.oraclePartial}"
          hx-target="#oracle-panel"
          hx-swap="outerHTML"
          hx-indicator="#oracle-loading"
          hx-params="*"
          hx-disabled-elt="find button, find input, find select"
          hx-ext="oracle-indicator"
          data-oracle-indicator-id="oracle-loading"
          data-oracle-panel-id="oracle-panel"
          data-loading-title="${escapeHtml(messages.oracle.loadingTitle)}"
          data-loading-description="${escapeHtml(messages.oracle.loadingDescription)}"
          data-send-error-message="${escapeHtml(messages.oracle.networkErrorDescription)}"
          data-response-error-message="${escapeHtml(messages.oracle.retryableErrorDescription)}"
          class="grid gap-3"
          aria-label="${escapeHtml(messages.oracle.cardTitle)}"
        >
          <input type="hidden" name="lang" value="${escapeHtml(locale)}" />
          <fieldset class="fieldset">
            <legend class="fieldset-legend">${escapeHtml(messages.oracle.questionLabel)}</legend>
            <input
              id="oracle-question"
              class="input input-bordered w-full"
              type="text"
              name="question"
              value="${escapeHtml(panelState.question)}"
              maxlength="${appConfig.oracle.maxQuestionLength}"
              placeholder="${escapeHtml(messages.oracle.questionPlaceholder)}"
              aria-label="${escapeHtml(messages.oracle.questionLabel)}"
              required
            />
          </fieldset>
          <fieldset class="fieldset">
            <legend class="fieldset-legend">${escapeHtml(messages.oracle.stateModeLabel)}</legend>
            <select id="oracle-mode" name="mode" class="select select-bordered" aria-label="${escapeHtml(
              messages.oracle.stateModeLabel,
            )}">
              ${modeOptions}
            </select>
          </fieldset>
          <button type="submit" class="btn btn-primary w-full sm:w-max" aria-label="${escapeHtml(
            messages.oracle.submit,
          )}">
            <span>${escapeHtml(messages.oracle.submit)}</span>
            <span id="oracle-loading" class="loading loading-spinner loading-sm htmx-indicator" aria-label="${escapeHtml(
              messages.common.loading,
            )}"></span>
          </button>
        </form>
      </div>
    </article>
    ${renderOraclePanel(messages, panelState)}
  </section>`;
};

/**
 * Renders only the oracle panel for partial HTMX updates.
 *
 * @param messages Localized message catalog.
 * @param panelState Oracle UI state.
 * @returns HTML panel.
 */
export const renderOraclePanel = (messages: Messages, panelState: OraclePanelState): string => {
  if (panelState.state === "loading") {
    return `<article id="oracle-panel" class="card border border-info/30 bg-info/10" role="status" aria-live="polite" aria-busy="true" tabindex="-1" data-focus-panel="true" hx-ext="focus-panel">
      <div class="card-body">
        <h3 class="card-title text-info">${escapeHtml(messages.oracle.loadingTitle)}</h3>
        <p>${escapeHtml(messages.oracle.loadingDescription)}</p>
      </div>
    </article>`;
  }

  if (panelState.state === "idle") {
    return `<article id="oracle-panel" class="card border border-dashed border-base-300 bg-base-200/60" aria-live="polite" tabindex="-1" data-focus-panel="true" hx-ext="focus-panel">
      <div class="card-body">
        <h3 class="card-title">${escapeHtml(messages.oracle.cardTitle)}</h3>
        <p>${escapeHtml(messages.oracle.idleHint)}</p>
      </div>
    </article>`;
  }

  if (panelState.state === "success") {
    return `<article id="oracle-panel" class="card border border-success/30 bg-success/10" role="status" aria-live="polite" tabindex="-1" data-focus-panel="true" hx-ext="focus-panel">
      <div class="card-body">
        <h3 class="card-title text-success">${escapeHtml(messages.oracle.successTitle)}</h3>
        <p class="leading-relaxed">${escapeHtml(panelState.answer)}</p>
      </div>
    </article>`;
  }

  if (panelState.state === "empty") {
    return `<article id="oracle-panel" class="card border border-warning/30 bg-warning/10" role="status" aria-live="polite" tabindex="-1" data-focus-panel="true" hx-ext="focus-panel">
      <div class="card-body">
        <div role="alert" class="alert alert-warning alert-vertical sm:alert-horizontal">
          <div>
            <h3 class="font-bold">${escapeHtml(messages.oracle.emptyTitle)}</h3>
            <div class="text-sm">${escapeHtml(panelState.message)}</div>
          </div>
        </div>
      </div>
    </article>`;
  }

  if (panelState.state === "unauthorized") {
    return `<article id="oracle-panel" class="card border border-error/30 bg-error/10" role="status" aria-live="polite" tabindex="-1" data-focus-panel="true" hx-ext="focus-panel">
      <div class="card-body">
        <div role="alert" class="alert alert-error alert-vertical sm:alert-horizontal">
          <div>
            <h3 class="font-bold">${escapeHtml(messages.oracle.unauthorizedTitle)}</h3>
            <div class="text-sm">${escapeHtml(panelState.message)}</div>
          </div>
        </div>
      </div>
    </article>`;
  }

  if (panelState.retryable) {
    return `<article id="oracle-panel" class="card border border-info/30 bg-info/10" role="status" aria-live="polite" tabindex="-1" data-focus-panel="true" hx-ext="focus-panel">
      <div class="card-body gap-3">
        <div role="alert" class="alert alert-info alert-vertical sm:alert-horizontal">
          <div>
            <h3 class="font-bold">${escapeHtml(messages.oracle.retryableErrorTitle)}</h3>
            <div class="text-sm">${escapeHtml(panelState.message)}</div>
          </div>
        </div>
        <button class="btn btn-sm btn-outline" type="submit" form="oracle-form" aria-label="${escapeHtml(
          messages.common.retry,
        )}">${escapeHtml(messages.common.retry)}</button>
      </div>
    </article>`;
  }

  return `<article id="oracle-panel" class="card border border-error/30 bg-error/10" role="status" aria-live="polite" tabindex="-1" data-focus-panel="true" hx-ext="focus-panel">
    <div class="card-body">
      <div role="alert" class="alert alert-error alert-vertical sm:alert-horizontal">
        <div>
          <h3 class="font-bold">${escapeHtml(messages.oracle.nonRetryableErrorTitle)}</h3>
          <div class="text-sm">${escapeHtml(panelState.message)}</div>
        </div>
      </div>
    </div>
  </article>`;
};

const renderModeOptions = (messages: Messages, mode: OracleMode): string => {
  const options = oracleModes.map((oracleMode) => ({
    value: oracleMode,
    label: modeLabelFor(messages, oracleMode),
  }));

  return options
    .map((option) => {
      const selected = option.value === mode ? " selected" : "";
      return `<option value="${option.value}"${selected}>${escapeHtml(option.label)}</option>`;
    })
    .join("");
};

const modeLabelFor = (messages: Messages, mode: OracleMode): string => {
  if (mode === "auto") {
    return messages.oracle.modeAuto;
  }

  if (mode === "force-empty") {
    return messages.oracle.modeForceEmpty;
  }

  if (mode === "force-retryable-error") {
    return messages.oracle.modeForceRetryableError;
  }

  if (mode === "force-fatal-error") {
    return messages.oracle.modeForceFatalError;
  }

  if (mode === "force-unauthorized") {
    return messages.oracle.modeForceUnauthorized;
  }

  const unreachableMode: never = mode;
  return unreachableMode;
};
