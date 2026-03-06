/**
 * AI Tools Panel View
 *
 * Provider status, test dialogue generation, and game design assistant.
 */
import type { LocaleCode } from "../../config/environment.ts";
import type { AvailableAiFeatures } from "../../domain/game/ai/game-ai-service.ts";
import { appRoutes, withQueryParameters } from "../../shared/constants/routes.ts";
import type { Messages } from "../../shared/i18n/messages.ts";
import { escapeHtml } from "../layout.ts";

/**
 * Renders the AI tools panel.
 *
 * @param messages Locale-resolved messages.
 * @param features Available AI feature snapshot.
 * @param locale Active locale.
 * @returns HTML string for the AI tools panel.
 */
export const renderAiPanel = (
  messages: Messages,
  features: AvailableAiFeatures,
  locale: LocaleCode,
  projectId: string,
): string => {
  const featureRows = [
    { label: messages.builder.dialogue, available: features.richDialogue },
    { label: messages.builder.visionLabel, available: features.visionAnalysis },
    { label: messages.builder.sentimentLabel, available: features.sentimentAnalysis },
    { label: messages.builder.embeddingsLabel, available: features.embeddings },
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

  return `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold">${escapeHtml(messages.builder.ai)}</h1>

      <!-- Provider Status -->
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body">
          <h2 class="card-title">${escapeHtml(messages.builder.providerStatus)}</h2>
          <div class="mb-2">${providerList}</div>
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

      <!-- Test Dialogue -->
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body">
          <h2 class="card-title">${escapeHtml(messages.builder.testDialogue)}</h2>
          <form
            hx-post="${escapeHtml(aiTestHref)}"
            hx-target="#ai-test-result"
            hx-swap="innerHTML"
            hx-indicator="#ai-test-spinner"
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
                <span aria-hidden="true">💬</span> ${escapeHtml(messages.builder.testDialogue)}
              </button>
              <span id="ai-test-spinner" class="loading loading-spinner loading-sm htmx-indicator" aria-hidden="true"></span>
            </div>
          </form>
          <div id="ai-test-result" class="mt-3" aria-live="polite">
            <!-- Test result swapped here -->
          </div>
        </div>
      </div>

      <!-- Design Assistant -->
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body">
          <h2 class="card-title">${escapeHtml(messages.builder.designAssist)}</h2>
          <form
            hx-post="${escapeHtml(aiAssistHref)}"
            hx-target="#ai-assist-result"
            hx-swap="innerHTML"
            hx-indicator="#ai-assist-spinner"
            class="space-y-3"
          >
            <input type="hidden" name="locale" value="${escapeHtml(locale)}" />
            <input type="hidden" name="projectId" value="${escapeHtml(projectId)}" />
            <div class="form-control">
              <label class="label" for="ai-assist-prompt">${escapeHtml(messages.builder.promptLabel)}</label>
              <textarea id="ai-assist-prompt" name="prompt" class="textarea textarea-bordered w-full" rows="3" placeholder="${escapeHtml(messages.builder.assistPromptPlaceholder)}" required aria-required="true"></textarea>
            </div>
            <div class="flex items-center gap-2">
              <button type="submit" class="btn btn-secondary btn-sm" aria-label="${escapeHtml(messages.builder.designAssist)}">
                <span aria-hidden="true">🧠</span> ${escapeHtml(messages.builder.designAssist)}
              </button>
              <span id="ai-assist-spinner" class="loading loading-spinner loading-sm htmx-indicator" aria-hidden="true"></span>
            </div>
          </form>
          <div id="ai-assist-result" class="mt-3" aria-live="polite">
            <!-- Design assist result swapped here -->
          </div>
        </div>
      </div>
    </div>`;
};
