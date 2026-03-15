import { appConfig, type LocaleCode } from "../config/environment.ts";
import type { OracleMode, OracleOutcome } from "../domain/oracle/oracle-types.ts";
import { type AppRouteKey, appRoutes } from "../shared/constants/routes.ts";
import type { UiErrorState } from "../shared/contracts/ui-state.ts";
import type { Messages } from "../shared/i18n/messages.ts";
import { escapeHtml } from "./layout.ts";

/**
 * Page context passed to the oracle for grounded, page-aware responses.
 */
export interface OraclePageContext {
  readonly currentPath: string;
  readonly activeRoute: AppRouteKey;
  readonly projectId?: string;
}

/**
 * Context for rendering the oracle section (drawer vs full page).
 */
export interface OracleSectionContext {
  /** Layout variant: drawer uses a compact single-column panel, page uses a two-column responsive layout. */
  readonly variant: "drawer" | "page";
  /** Optional page context for grounded AI responses. */
  readonly pageContext?: OraclePageContext;
}

type BaseOraclePanelState = {
  readonly mode: OracleMode;
  readonly question: string;
};

type OracleResolvedPanelState =
  | {
      readonly state: "success";
      readonly answer: string;
    }
  | {
      readonly state: "empty";
      readonly message: string;
    }
  | {
      readonly state: "unauthorized";
      readonly message: string;
    }
  | {
      readonly state: UiErrorState;
      readonly message: string;
    };

/**
 * Oracle panel state for initial rendering and HTMX partial updates.
 */
export type OraclePanelState =
  | (BaseOraclePanelState & { readonly state: "idle" | "loading" })
  | (BaseOraclePanelState & OracleResolvedPanelState);

const renderOracleChatHeader = (label: string, mode: OracleMode): string =>
  `<div class="chat-header text-xs text-base-content/60">${escapeHtml(label)} · ${escapeHtml(mode)}</div>`;

const renderOracleChatFooter = (): string =>
  `<div class="chat-footer text-[0.65rem] text-base-content/60">${escapeHtml(new Date().toLocaleTimeString())}</div>`;

/**
 * Adapts normalized service outcomes to panel-render states.
 *
 * @param outcome Oracle service outcome.
 * @param mode Current oracle mode.
 * @param question User-entered question.
 * @returns Typed oracle panel state for deterministic rendering.
 */
export const toOraclePanelState = (
  outcome: OracleOutcome,
  mode: OracleMode,
  question: string,
): OraclePanelState => {
  if (outcome.state === "success") {
    return {
      state: "success",
      mode,
      question,
      answer: outcome.answer,
    };
  }

  if (outcome.state === "empty") {
    return {
      state: "empty",
      mode,
      question,
      message: outcome.message,
    };
  }

  if (outcome.state === "unauthorized") {
    return {
      state: "unauthorized",
      mode,
      question,
      message: outcome.message,
    };
  }

  return {
    state: outcome.retryable ? "error-retryable" : "error-non-retryable",
    mode,
    question,
    message: outcome.message,
  };
};

/**
 * Renders the oracle interaction form and stateful result panel.
 *
 * @param messages Localized message catalog.
 * @param panelState Oracle UI state.
 * @param locale Active locale code for deterministic form submissions.
 * @param sectionContext Optional layout variant and page context.
 * @returns HTML section.
 */
export const renderOracleSection = (
  messages: Messages,
  panelState: OraclePanelState,
  locale: LocaleCode,
  sectionContext?: OracleSectionContext,
): string => {
  const variant = sectionContext?.variant ?? "page";
  const pageContext = sectionContext?.pageContext;
  const isDrawer = variant === "drawer";

  const sectionClass = isDrawer
    ? "flex flex-col gap-4 overflow-y-auto"
    : "grid gap-4 lg:grid-cols-[1.5fr_1fr]";
  const titleClass = isDrawer ? "text-lg" : "text-2xl";

  const contextInputs = pageContext
    ? [
        `<input type="hidden" name="context_path" value="${escapeHtml(pageContext.currentPath)}" />`,
        `<input type="hidden" name="context_route" value="${escapeHtml(pageContext.activeRoute)}" />`,
        pageContext.projectId
          ? `<input type="hidden" name="context_project" value="${escapeHtml(pageContext.projectId)}" />`
          : "",
      ]
        .filter(Boolean)
        .join("")
    : "";

  return `<section aria-labelledby="oracle-title" class="${escapeHtml(sectionClass)}">
    <article class="card card-border bg-base-100 shadow-sm shrink-0">
      <div class="card-body gap-4">
        <h2 id="oracle-title" class="card-title ${escapeHtml(titleClass)}">${escapeHtml(messages.aiPlayground.cardTitle)}</h2>
        <p class="opacity-90 text-sm">${escapeHtml(messages.aiPlayground.cardDescription)}</p>
        <form
          id="oracle-form"
          method="get"
          action="${appRoutes.home}"
          hx-get="${appRoutes.aiPlaygroundPartial}"
          hx-target="#oracle-panel"
          hx-swap="outerHTML"
          hx-indicator="#oracle-loading"
          hx-params="*"
          hx-disabled-elt="find button, find input, find select"
          hx-ext="oracle-indicator"
          data-oracle-indicator-id="oracle-loading"
          data-oracle-panel-id="oracle-panel"
          data-loading-title="${escapeHtml(messages.aiPlayground.loadingTitle)}"
          data-loading-description="${escapeHtml(messages.aiPlayground.loadingDescription)}"
          data-send-error-message="${escapeHtml(messages.aiPlayground.networkErrorDescription)}"
          data-response-error-message="${escapeHtml(messages.aiPlayground.retryableErrorDescription)}"
          data-oracle-loading-template-id="oracle-loading-template"
          class="grid gap-3"
          aria-label="${escapeHtml(messages.aiPlayground.cardTitle)}"
        >
          <input type="hidden" name="lang" value="${escapeHtml(locale)}" />
          ${contextInputs}
          <fieldset class="fieldset">
            <label class="floating-label w-full">
              <span>${escapeHtml(messages.aiPlayground.promptLabel)}</span>
              <input
                id="oracle-question"
                class="input input-bordered w-full input-sm"
                type="text"
                name="question"
                value="${escapeHtml(panelState.question)}"
                maxlength="${appConfig.oracle.maxQuestionLength}"
                placeholder=" "
                aria-label="${escapeHtml(messages.aiPlayground.promptLabel)}"
                required
              />
            </label>
          </fieldset>
          <input type="hidden" name="mode" value="auto" />
          <button type="submit" class="btn btn-primary btn-sm w-full" aria-label="${escapeHtml(
            messages.aiPlayground.submit,
          )}">
            <span>${escapeHtml(messages.aiPlayground.submit)}</span>
            <span id="oracle-loading" class="loading loading-dots loading-sm text-primary" aria-label="${escapeHtml(
              messages.common.loading,
            )}"></span>
          </button>
        </form>
        <template id="oracle-loading-template">${renderOraclePanel(messages, {
          state: "loading",
          mode: panelState.mode,
          question: "",
        })}</template>
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
    return `<article id="oracle-panel" class="card card-border border-info/30 bg-info/5" role="status" aria-live="polite" aria-busy="true" tabindex="-1" data-focus-panel="true" hx-ext="focus-panel">
      <div class="card-body gap-3">
        <h3 class="card-title text-info text-sm">${escapeHtml(messages.aiPlayground.loadingTitle)}</h3>
        <div class="chat chat-start">
          ${renderOracleChatHeader(messages.aiPlayground.promptLabel, panelState.mode)}
          <div class="chat-bubble chat-bubble-info opacity-60" data-oracle-loading-question="true">${escapeHtml(panelState.question)}</div>
          ${renderOracleChatFooter()}
        </div>
        <div class="chat chat-end">
          ${renderOracleChatHeader(messages.aiPlayground.cardTitle, panelState.mode)}
          <div class="chat-bubble chat-bubble-info space-y-2 w-full max-w-xs">
            <span class="loading loading-dots loading-md opacity-70"></span>
          </div>
          ${renderOracleChatFooter()}
        </div>
      </div>
    </article>`;
  }

  if (panelState.state === "idle") {
    return `<article id="oracle-panel" class="card card-dash border-base-300 bg-base-200/40" aria-live="polite" tabindex="-1" data-focus-panel="true" hx-ext="focus-panel">
      <div class="card-body">
        <div class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          <div>
            <h3 class="font-semibold text-base-content/70">${escapeHtml(messages.aiPlayground.cardTitle)}</h3>
            <p class="text-sm">${escapeHtml(messages.aiPlayground.idleHint)}</p>
          </div>
        </div>
      </div>
    </article>`;
  }

  if (panelState.state === "success") {
    return `<article id="oracle-panel" class="card border border-success/30 bg-success/5" role="status" aria-live="polite" tabindex="-1" data-focus-panel="true" hx-ext="focus-panel">
      <div class="card-body gap-3">
        <h3 class="card-title text-success text-sm">${escapeHtml(messages.aiPlayground.successTitle)}</h3>
        <div class="chat chat-start">
          ${renderOracleChatHeader(messages.aiPlayground.promptLabel, panelState.mode)}
          <div class="chat-bubble chat-bubble-primary">${escapeHtml(panelState.question)}</div>
          ${renderOracleChatFooter()}
        </div>
        <div class="chat chat-end">
          ${renderOracleChatHeader(messages.aiPlayground.cardTitle, panelState.mode)}
          <div class="chat-bubble chat-bubble-success whitespace-pre-wrap">${escapeHtml(panelState.answer)}</div>
          ${renderOracleChatFooter()}
        </div>
      </div>
    </article>`;
  }

  if (panelState.state === "empty") {
    return `<article id="oracle-panel" class="card border border-warning/30 bg-warning/10" role="status" aria-live="polite" tabindex="-1" data-focus-panel="true" hx-ext="focus-panel">
      <div class="card-body">
        <div role="alert" class="alert alert-warning alert-vertical sm:alert-horizontal">
          <div>
            <h3 class="font-bold">${escapeHtml(messages.aiPlayground.emptyTitle)}</h3>
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
            <h3 class="font-bold">${escapeHtml(messages.aiPlayground.unauthorizedTitle)}</h3>
            <div class="text-sm">${escapeHtml(panelState.message)}</div>
          </div>
        </div>
      </div>
    </article>`;
  }

  if (panelState.state === "error-retryable") {
    return `<article id="oracle-panel" class="card border border-info/30 bg-info/10" role="status" aria-live="polite" tabindex="-1" data-focus-panel="true" hx-ext="focus-panel">
      <div class="card-body gap-3">
        <div role="alert" class="alert alert-info alert-vertical sm:alert-horizontal">
          <div>
            <h3 class="font-bold">${escapeHtml(messages.aiPlayground.retryableErrorTitle)}</h3>
            <div class="text-sm">${escapeHtml(panelState.message)}</div>
          </div>
        </div>
        <button class="btn btn-sm btn-outline" type="submit" form="oracle-form" aria-label="${escapeHtml(
          messages.common.retry,
        )}">${escapeHtml(messages.common.retry)}</button>
      </div>
    </article>`;
  }

  const message =
    "message" in panelState
      ? panelState.message
      : messages.aiPlayground.nonRetryableErrorDescription;

  return `<article id="oracle-panel" class="card border border-error/30 bg-error/10" role="status" aria-live="polite" tabindex="-1" data-focus-panel="true" hx-ext="focus-panel">
    <div class="card-body">
      <div role="alert" class="alert alert-error alert-vertical sm:alert-horizontal">
        <div>
          <h3 class="font-bold">${escapeHtml(messages.aiPlayground.nonRetryableErrorTitle)}</h3>
          <div class="text-sm">${escapeHtml(message)}</div>
        </div>
      </div>
    </div>
  </article>`;
};
