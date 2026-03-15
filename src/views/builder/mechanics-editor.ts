import type { LocaleCode } from "../../config/environment.ts";
import { humanizeBuilderIdentifier } from "../../domain/builder/builder-display.ts";
import { interpolateRoutePath } from "../../shared/constants/route-patterns.ts";
import { appRoutes } from "../../shared/constants/routes.ts";
import type {
  DialogueGraph,
  GameFlagDefinition,
  QuestDefinition,
  TriggerDefinition,
} from "../../shared/contracts/game.ts";
import type { Messages } from "../../shared/i18n/messages.ts";
import { escapeHtml } from "../layout.ts";
import { cardClasses, spinnerClasses } from "../shared/ui-components.ts";
import { buildBuilderJourneyConfig } from "./builder-journey.ts";
import { getTriggerEventLabel } from "./view-labels.ts";
import { renderWorkspaceFrame, renderWorkspaceShell } from "./workspace-shell.ts";

const renderTriggerEventOptions = (
  messages: Messages,
  selectedEvent?: TriggerDefinition["event"],
): string =>
  [
    { value: "scene-enter", label: messages.builder.triggerEventSceneEnter },
    { value: "npc-interact", label: messages.builder.triggerEventNpcInteract },
    { value: "chat", label: messages.builder.triggerEventChat },
    { value: "dialogue-confirmed", label: messages.builder.triggerEventDialogueConfirmed },
    { value: "combat-victory", label: messages.builder.triggerEventCombatVictory },
    { value: "item-acquired", label: messages.builder.triggerEventItemAcquired },
  ]
    .map(
      (option) =>
        `<option value="${option.value}"${selectedEvent === option.value ? " selected" : ""}>${escapeHtml(option.label)}</option>`,
    )
    .join("");

/**
 * Renders a quest edit form partial for HTMX swap into #mechanics-detail.
 */
export const renderQuestEditForm = (
  messages: Messages,
  locale: LocaleCode,
  projectId: string,
  quest: QuestDefinition,
): string => {
  const formAction = interpolateRoutePath(appRoutes.builderApiQuestForm, {
    projectId,
    questId: quest.id,
  });
  const deleteAction = interpolateRoutePath(appRoutes.builderApiQuestDetail, {
    projectId,
    questId: quest.id,
  });
  const firstStep = quest.steps[0];
  return `<div class="${cardClasses.bordered}">
    <div class="card-body gap-3">
      <div class="flex items-center justify-between gap-3">
        <h3 class="card-title">${escapeHtml(messages.builder.editQuest)}: ${escapeHtml(quest.title)}</h3>
        <form hx-delete="${escapeHtml(deleteAction)}" hx-target="#builder-content" hx-swap="innerHTML" hx-indicator="#quest-edit-spinner" hx-disabled-elt="button">
          <button type="submit" class="btn btn-error btn-outline btn-sm" aria-label="${escapeHtml(messages.builder.delete)}: ${escapeHtml(quest.title)}">${escapeHtml(messages.builder.delete)}</button>
        </form>
      </div>
      <form hx-post="${escapeHtml(formAction)}" hx-target="#builder-content" hx-swap="innerHTML" hx-indicator="#quest-edit-spinner" hx-disabled-elt="button, input, select, textarea">
        <input type="hidden" name="id" value="${escapeHtml(quest.id)}" />
        <fieldset class="fieldset">
          <legend class="fieldset-legend">${escapeHtml(messages.builder.titleLabel)}</legend>
          <input name="title" type="text" class="input w-full" value="${escapeHtml(quest.title)}" aria-required="true" required aria-label="${escapeHtml(messages.builder.titleLabel)}" />
        </fieldset>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">${escapeHtml(messages.builder.descriptionLabel)}</legend>
          <textarea name="description" class="textarea w-full" rows="3" aria-required="true" required aria-label="${escapeHtml(messages.builder.descriptionLabel)}">${escapeHtml(quest.description)}</textarea>
        </fieldset>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">${escapeHtml(messages.builder.idLabel)}</legend>
          <input name="triggerId" type="text" class="input w-full" value="${escapeHtml(firstStep?.triggerId ?? "")}" aria-required="true" required aria-label="${escapeHtml(messages.builder.idLabel)}" />
        </fieldset>
        <div class="flex items-center gap-2">
          <button type="submit" class="btn btn-primary btn-sm" aria-label="${escapeHtml(messages.builder.save)}">${escapeHtml(messages.builder.save)}</button>
          <span id="quest-edit-spinner" class="${spinnerClasses.sm}" aria-label="${escapeHtml(messages.common.loading)}"></span>
        </div>
      </form>
    </div>
  </div>`;
};

/**
 * Renders a trigger edit form partial for HTMX swap into #mechanics-detail.
 */
export const renderTriggerEditForm = (
  messages: Messages,
  locale: LocaleCode,
  projectId: string,
  trigger: TriggerDefinition,
): string => {
  const formAction = interpolateRoutePath(appRoutes.builderApiTriggerForm, {
    projectId,
    triggerId: trigger.id,
  });
  const deleteAction = interpolateRoutePath(appRoutes.builderApiTriggerDetail, {
    projectId,
    triggerId: trigger.id,
  });
  return `<div class="${cardClasses.bordered}">
    <div class="card-body gap-3">
      <div class="flex items-center justify-between gap-3">
        <h3 class="card-title">${escapeHtml(messages.builder.editTrigger)}: ${escapeHtml(trigger.label)}</h3>
        <form hx-delete="${escapeHtml(deleteAction)}" hx-target="#builder-content" hx-swap="innerHTML" hx-indicator="#trigger-edit-spinner" hx-disabled-elt="button">
          <button type="submit" class="btn btn-error btn-outline btn-sm" aria-label="${escapeHtml(messages.builder.delete)}: ${escapeHtml(trigger.label)}">${escapeHtml(messages.builder.delete)}</button>
        </form>
      </div>
      <form hx-post="${escapeHtml(formAction)}" hx-target="#builder-content" hx-swap="innerHTML" hx-indicator="#trigger-edit-spinner" hx-disabled-elt="button, input, select, textarea">
        <input type="hidden" name="id" value="${escapeHtml(trigger.id)}" />
        <fieldset class="fieldset">
          <legend class="fieldset-legend">${escapeHtml(messages.builder.labelField)}</legend>
          <input name="label" type="text" class="input w-full" value="${escapeHtml(trigger.label)}" aria-required="true" required aria-label="${escapeHtml(messages.builder.labelField)}" />
        </fieldset>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">${escapeHtml(messages.builder.triggerEventLabel)}</legend>
          <select name="event" class="select w-full" aria-label="${escapeHtml(messages.builder.triggerEventLabel)}">${renderTriggerEventOptions(messages, trigger.event)}</select>
        </fieldset>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">${escapeHtml(messages.builder.sceneId)}</legend>
          <input name="sceneId" type="text" class="input w-full" value="${escapeHtml(trigger.sceneId ?? "")}" aria-label="${escapeHtml(messages.builder.sceneId)}" />
        </fieldset>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">${escapeHtml(messages.builder.npcIdLabel)}</legend>
          <input name="npcId" type="text" class="input w-full" value="${escapeHtml(trigger.npcId ?? "")}" placeholder="${escapeHtml(messages.builder.dialogueNpcIdPlaceholder)}" aria-label="${escapeHtml(messages.builder.npcIdLabel)}" />
        </fieldset>
        <div class="flex items-center gap-2">
          <button type="submit" class="btn btn-primary btn-sm" aria-label="${escapeHtml(messages.builder.save)}">${escapeHtml(messages.builder.save)}</button>
          <span id="trigger-edit-spinner" class="${spinnerClasses.sm}" aria-label="${escapeHtml(messages.common.loading)}"></span>
        </div>
      </form>
    </div>
  </div>`;
};

/**
 * Renders a dialogue graph edit form partial for HTMX swap into #mechanics-detail.
 */
export const renderDialogueGraphEditForm = (
  messages: Messages,
  locale: LocaleCode,
  projectId: string,
  graph: DialogueGraph,
): string => {
  const formAction = interpolateRoutePath(appRoutes.builderApiDialogueGraphForm, {
    projectId,
    graphId: graph.id,
  });
  const deleteAction = interpolateRoutePath(appRoutes.builderApiDialogueGraphDetail, {
    projectId,
    graphId: graph.id,
  });
  const rootNode =
    graph.nodes.find((n) => n.id === "root" || n.id === graph.rootNodeId) ?? graph.nodes[0];
  const line = rootNode?.line ?? "";
  return `<div class="${cardClasses.bordered}">
    <div class="card-body gap-3">
      <div class="flex items-center justify-between gap-3">
        <h3 class="card-title">${escapeHtml(messages.builder.editDialogueGraph)}: ${escapeHtml(graph.title)}</h3>
        <form hx-delete="${escapeHtml(deleteAction)}" hx-target="#builder-content" hx-swap="innerHTML" hx-indicator="#graph-edit-spinner" hx-disabled-elt="button">
          <button type="submit" class="btn btn-error btn-outline btn-sm" aria-label="${escapeHtml(messages.builder.delete)}: ${escapeHtml(graph.title)}">${escapeHtml(messages.builder.delete)}</button>
        </form>
      </div>
      <form hx-post="${escapeHtml(formAction)}" hx-target="#builder-content" hx-swap="innerHTML" hx-indicator="#graph-edit-spinner" hx-disabled-elt="button, input, select, textarea">
        <input type="hidden" name="id" value="${escapeHtml(graph.id)}" />
        <fieldset class="fieldset">
          <legend class="fieldset-legend">${escapeHtml(messages.builder.titleLabel)}</legend>
          <input name="title" type="text" class="input w-full" value="${escapeHtml(graph.title)}" aria-required="true" required aria-label="${escapeHtml(messages.builder.titleLabel)}" />
        </fieldset>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">${escapeHtml(messages.builder.npcIdLabel)}</legend>
          <input name="npcId" type="text" class="input w-full" value="${escapeHtml(graph.npcId ?? "")}" placeholder="${escapeHtml(messages.builder.dialogueNpcIdPlaceholder)}" aria-label="${escapeHtml(messages.builder.npcIdLabel)}" />
        </fieldset>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">${escapeHtml(messages.builder.dialogueLine)}</legend>
          <textarea name="line" class="textarea w-full" rows="3" aria-required="true" required aria-label="${escapeHtml(messages.builder.dialogueLine)}">${escapeHtml(line)}</textarea>
        </fieldset>
        <div class="flex items-center gap-2">
          <button type="submit" class="btn btn-primary btn-sm" aria-label="${escapeHtml(messages.builder.save)}">${escapeHtml(messages.builder.save)}</button>
          <span id="graph-edit-spinner" class="${spinnerClasses.sm}" aria-label="${escapeHtml(messages.common.loading)}"></span>
        </div>
      </form>
    </div>
  </div>`;
};

/**
 * Renders the builder mechanics workspace.
 *
 * @param messages Locale-resolved messages.
 * @param locale Active locale.
 * @param projectId Active project identifier.
 * @param quests Authored quests.
 * @param triggers Authored triggers.
 * @param dialogueGraphs Authored dialogue graphs.
 * @param flags Authored flags.
 * @returns HTML for the mechanics workspace.
 */
export const renderMechanicsEditor = (
  messages: Messages,
  locale: LocaleCode,
  projectId: string,
  quests: readonly QuestDefinition[],
  triggers: readonly TriggerDefinition[],
  dialogueGraphs: readonly DialogueGraph[],
  flags: readonly GameFlagDefinition[],
): string => {
  const creatorJourney = buildBuilderJourneyConfig(messages, locale, projectId, "rules");
  const createQuestAction = interpolateRoutePath(appRoutes.builderApiQuestsCreateForm, {
    projectId,
  });
  const createTriggerAction = interpolateRoutePath(appRoutes.builderApiTriggersCreateForm, {
    projectId,
  });
  const createGraphAction = interpolateRoutePath(appRoutes.builderApiDialogueGraphsCreateForm, {
    projectId,
  });
  const questEditHref = (id: string) =>
    interpolateRoutePath(appRoutes.builderApiQuestDetail, { projectId, questId: id });
  const questCards = quests
    .map(
      (quest) => `<article class="${cardClasses.bordered}">
        <div class="card-body gap-2">
          <div>
            <h3 class="card-title text-base">${escapeHtml(quest.title)}</h3>
            <p class="text-xs text-base-content/60">${escapeHtml(messages.builder.mechanicsDetailHint)}</p>
          </div>
          <p class="text-sm text-base-content/75">${escapeHtml(quest.description)}</p>
          <div class="flex flex-wrap gap-2">
            ${quest.steps
              .map((step) => `<span class="badge badge-outline">${escapeHtml(step.title)}</span>`)
              .join("")}
          </div>
          <button
            class="btn btn-outline btn-xs"
            hx-get="${escapeHtml(questEditHref(quest.id))}"
            hx-target="#mechanics-detail"
            hx-swap="innerHTML"
            aria-label="${escapeHtml(messages.builder.openDetails)}: ${escapeHtml(quest.title)}"
          >${escapeHtml(messages.builder.openDetails)}</button>
        </div>
      </article>`,
    )
    .join("");

  const triggerEditHref = (id: string) =>
    interpolateRoutePath(appRoutes.builderApiTriggerDetail, { projectId, triggerId: id });
  const triggerCards = triggers
    .map(
      (trigger) => `<article class="${cardClasses.bordered}">
        <div class="card-body gap-2">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h3 class="card-title text-base">${escapeHtml(trigger.label)}</h3>
              <p class="text-xs text-base-content/60">${escapeHtml(trigger.npcId ? humanizeBuilderIdentifier(trigger.npcId) : messages.builder.triggerSceneGlobal)}</p>
            </div>
            <span class="badge badge-outline">${escapeHtml(getTriggerEventLabel(messages, trigger.event))}</span>
          </div>
          <p class="text-sm text-base-content/75">${escapeHtml(trigger.sceneId ?? messages.builder.triggerSceneGlobal)}</p>
          <button
            class="btn btn-outline btn-xs"
            hx-get="${escapeHtml(triggerEditHref(trigger.id))}"
            hx-target="#mechanics-detail"
            hx-swap="innerHTML"
            aria-label="${escapeHtml(messages.builder.openDetails)}: ${escapeHtml(trigger.label)}"
          >${escapeHtml(messages.builder.openDetails)}</button>
        </div>
      </article>`,
    )
    .join("");

  const graphEditHref = (id: string) =>
    interpolateRoutePath(appRoutes.builderApiDialogueGraphDetail, { projectId, graphId: id });
  const graphCards = dialogueGraphs
    .map(
      (graph) => `<article class="${cardClasses.bordered}">
        <div class="card-body gap-2">
          <div>
            <h3 class="card-title text-base">${escapeHtml(graph.title)}</h3>
            <div class="text-xs text-base-content/60">${escapeHtml(graph.npcId ? humanizeBuilderIdentifier(graph.npcId) : messages.builder.dialogueCreateDescription)}</div>
          </div>
          <div class="flex flex-wrap gap-2">
            <span class="badge badge-soft">${graph.nodes.length} ${escapeHtml(messages.builder.nodesCountLabel)}</span>
            ${
              graph.npcId
                ? `<span class="badge badge-outline">${escapeHtml(graph.npcId)}</span>`
                : ""
            }
          </div>
          <button
            class="btn btn-outline btn-xs"
            hx-get="${escapeHtml(graphEditHref(graph.id))}"
            hx-target="#mechanics-detail"
            hx-swap="innerHTML"
            aria-label="${escapeHtml(messages.builder.openDetails)}: ${escapeHtml(graph.title)}"
          >${escapeHtml(messages.builder.openDetails)}</button>
        </div>
      </article>`,
    )
    .join("");

  const emptyQuestAlert = `<div role="status" class="alert alert-info alert-soft"><span>${escapeHtml(messages.builder.noQuests)}</span></div>`;
  const emptyTriggerAlert = `<div role="status" class="alert alert-info alert-soft"><span>${escapeHtml(messages.builder.noTriggers)}</span></div>`;
  const emptyGraphAlert = `<div role="status" class="alert alert-info alert-soft"><span>${escapeHtml(messages.builder.noDialogueGraphs)}</span></div>`;

  return `<section class="space-y-6 animate-fade-in-up">
    ${renderWorkspaceShell({
      eyebrow: messages.builder.mechanics,
      title: messages.builder.mechanics,
      description: messages.builder.capabilityMechanicsDescription,
      journey: creatorJourney,
      facets: [
        { label: messages.builder.questsTitle, badgeClassName: "badge-primary" },
        { label: messages.builder.triggersTitle, badgeClassName: "badge-secondary" },
        { label: messages.builder.dialogueGraphsTitle, badgeClassName: "badge-accent" },
        { label: messages.builder.flagsTitle, badgeClassName: "badge-outline" },
      ],
      metrics: [
        {
          label: messages.builder.questsTitle,
          value: quests.length,
          toneClassName: "text-primary",
        },
        { label: messages.builder.triggersTitle, value: triggers.length },
        { label: messages.builder.dialogueGraphsTitle, value: dialogueGraphs.length },
        { label: messages.builder.flagsTitle, value: flags.length },
      ],
    })}
    ${renderWorkspaceFrame({
      navigatorTitle: messages.builder.mechanics,
      navigatorDescription: messages.builder.capabilityMechanicsDescription,
      navigatorBody: `<details class="collapse collapse-arrow rounded-box border border-base-300 bg-base-100" open>
          <summary class="collapse-title text-sm font-semibold">${escapeHtml(messages.builder.questsTitle)}</summary>
          <div class="collapse-content pt-2">
            <form class="space-y-3" hx-post="${escapeHtml(createQuestAction)}" hx-target="#builder-content" hx-swap="innerHTML" hx-indicator="#quest-create-spinner" hx-disabled-elt="button, input, select, textarea">
              <fieldset class="fieldset">
                <legend class="fieldset-legend">${escapeHtml(messages.builder.titleLabel)}</legend>
                <input name="title" type="text" class="input w-full" placeholder="${escapeHtml(messages.builder.questTitlePlaceholder)}" aria-required="true" required aria-label="${escapeHtml(messages.builder.titleLabel)}" />
              </fieldset>
              <fieldset class="fieldset">
                <legend class="fieldset-legend">${escapeHtml(messages.builder.descriptionLabel)}</legend>
                <textarea name="description" class="textarea w-full" rows="3" placeholder="${escapeHtml(messages.builder.questDescriptionPlaceholder)}" aria-required="true" required aria-label="${escapeHtml(messages.builder.descriptionLabel)}"></textarea>
              </fieldset>
              <fieldset class="fieldset">
                <legend class="fieldset-legend">${escapeHtml(messages.builder.idLabel)}</legend>
                <input name="triggerId" type="text" class="input w-full" placeholder="${escapeHtml(messages.builder.triggerIdPlaceholder)}" aria-required="true" required aria-label="${escapeHtml(messages.builder.idLabel)}" />
              </fieldset>
              <details class="collapse collapse-arrow rounded-box border border-base-300 bg-base-100">
                <summary class="collapse-title text-sm font-semibold">${escapeHtml(messages.builder.advancedTools)}</summary>
                <div class="collapse-content pt-2">
                  <fieldset class="fieldset">
                    <legend class="fieldset-legend">${escapeHtml(messages.builder.idLabel)}</legend>
                    <input name="id" type="text" class="input w-full builder-mono" placeholder="${escapeHtml(messages.builder.questIdPlaceholder)}" aria-label="${escapeHtml(messages.builder.idLabel)}" />
                  </fieldset>
                </div>
              </details>
              <div class="flex items-center gap-2">
                <button type="submit" class="btn btn-primary btn-sm" aria-label="${escapeHtml(messages.builder.createQuest)}">${escapeHtml(messages.builder.createQuest)}</button>
                <span id="quest-create-spinner" class="${spinnerClasses.sm}" aria-label="${escapeHtml(messages.common.loading)}"></span>
              </div>
            </form>
          </div>
        </details>
        <details class="collapse collapse-arrow rounded-box border border-base-300 bg-base-100">
          <summary class="collapse-title text-sm font-semibold">${escapeHtml(messages.builder.triggersTitle)}</summary>
          <div class="collapse-content pt-2">
            <form class="space-y-3" hx-post="${escapeHtml(createTriggerAction)}" hx-target="#builder-content" hx-swap="innerHTML" hx-indicator="#trigger-create-spinner" hx-disabled-elt="button, input, select, textarea">
              <fieldset class="fieldset">
                <legend class="fieldset-legend">${escapeHtml(messages.builder.labelField)}</legend>
                <input name="label" type="text" class="input w-full" placeholder="${escapeHtml(messages.builder.triggerLabelPlaceholder)}" aria-required="true" required aria-label="${escapeHtml(messages.builder.labelField)}" />
              </fieldset>
              <fieldset class="fieldset">
                <legend class="fieldset-legend">${escapeHtml(messages.builder.triggerEventLabel)}</legend>
                <select name="event" class="select w-full" aria-label="${escapeHtml(messages.builder.triggerEventLabel)}">${renderTriggerEventOptions(messages)}</select>
              </fieldset>
              <fieldset class="fieldset">
                <legend class="fieldset-legend">${escapeHtml(messages.builder.sceneId)}</legend>
                <input name="sceneId" type="text" class="input w-full" aria-label="${escapeHtml(messages.builder.sceneId)}" />
              </fieldset>
              <fieldset class="fieldset">
                <legend class="fieldset-legend">${escapeHtml(messages.builder.npcIdLabel)}</legend>
                <input name="npcId" type="text" class="input w-full" placeholder="${escapeHtml(messages.builder.dialogueNpcIdPlaceholder)}" aria-label="${escapeHtml(messages.builder.npcIdLabel)}" />
              </fieldset>
              <details class="collapse collapse-arrow rounded-box border border-base-300 bg-base-100">
                <summary class="collapse-title text-sm font-semibold">${escapeHtml(messages.builder.advancedTools)}</summary>
                <div class="collapse-content pt-2">
                  <fieldset class="fieldset">
                  <legend class="fieldset-legend">${escapeHtml(messages.builder.idLabel)}</legend>
                    <input name="id" type="text" class="input w-full builder-mono" placeholder="${escapeHtml(messages.builder.triggerIdPlaceholder)}" aria-label="${escapeHtml(messages.builder.idLabel)}" />
                  </fieldset>
                </div>
              </details>
              <div class="flex items-center gap-2">
                <button type="submit" class="btn btn-outline btn-sm" aria-label="${escapeHtml(messages.builder.createTrigger)}">${escapeHtml(messages.builder.createTrigger)}</button>
                <span id="trigger-create-spinner" class="${spinnerClasses.sm}" aria-label="${escapeHtml(messages.common.loading)}"></span>
              </div>
            </form>
          </div>
        </details>
        <details class="collapse collapse-arrow rounded-box border border-base-300 bg-base-100">
          <summary class="collapse-title text-sm font-semibold">${escapeHtml(messages.builder.dialogueGraphsTitle)}</summary>
          <div class="collapse-content pt-2">
            <form class="space-y-3" hx-post="${escapeHtml(createGraphAction)}" hx-target="#builder-content" hx-swap="innerHTML" hx-indicator="#graph-create-spinner" hx-disabled-elt="button, input, select, textarea">
              <fieldset class="fieldset">
                <legend class="fieldset-legend">${escapeHtml(messages.builder.titleLabel)}</legend>
                <input name="title" type="text" class="input w-full" placeholder="${escapeHtml(messages.builder.graphTitlePlaceholder)}" aria-required="true" required aria-label="${escapeHtml(messages.builder.titleLabel)}" />
              </fieldset>
              <fieldset class="fieldset">
                <legend class="fieldset-legend">${escapeHtml(messages.builder.npcIdLabel)}</legend>
                <input name="npcId" type="text" class="input w-full" placeholder="${escapeHtml(messages.builder.dialogueNpcIdPlaceholder)}" aria-label="${escapeHtml(messages.builder.npcIdLabel)}" />
              </fieldset>
              <fieldset class="fieldset">
                <legend class="fieldset-legend">${escapeHtml(messages.builder.dialogueLine)}</legend>
                <textarea name="line" class="textarea w-full" rows="3" placeholder="${escapeHtml(messages.builder.addLinePlaceholder)}" aria-required="true" required aria-label="${escapeHtml(messages.builder.dialogueLine)}"></textarea>
              </fieldset>
              <details class="collapse collapse-arrow rounded-box border border-base-300 bg-base-100">
                <summary class="collapse-title text-sm font-semibold">${escapeHtml(messages.builder.advancedTools)}</summary>
                <div class="collapse-content pt-2">
                  <fieldset class="fieldset">
                    <legend class="fieldset-legend">${escapeHtml(messages.builder.idLabel)}</legend>
                    <input name="id" type="text" class="input w-full builder-mono" placeholder="${escapeHtml(messages.builder.graphIdPlaceholder)}" aria-label="${escapeHtml(messages.builder.idLabel)}" />
                  </fieldset>
                </div>
              </details>
              <div class="flex items-center gap-2">
                <button type="submit" class="btn btn-outline btn-sm" aria-label="${escapeHtml(messages.builder.createDialogueGraph)}">${escapeHtml(messages.builder.createDialogueGraph)}</button>
                <span id="graph-create-spinner" class="${spinnerClasses.sm}" aria-label="${escapeHtml(messages.common.loading)}"></span>
              </div>
            </form>
          </div>
        </details>`,
      mainBody: `<div class="space-y-4">
          <section class="space-y-3">
            <div class="flex items-center justify-between gap-3">
              <h2 class="text-2xl font-semibold">${escapeHtml(messages.builder.questsTitle)}</h2>
              <span class="badge badge-outline">${quests.length}</span>
            </div>
            <div class="grid gap-4 xl:grid-cols-2">${quests.length === 0 ? emptyQuestAlert : questCards}</div>
          </section>

          <section class="space-y-3">
            <div class="flex items-center justify-between gap-3">
              <h2 class="text-2xl font-semibold">${escapeHtml(messages.builder.triggersTitle)}</h2>
              <span class="badge badge-outline">${triggers.length}</span>
            </div>
            <div class="grid gap-4 xl:grid-cols-2">${triggers.length === 0 ? emptyTriggerAlert : triggerCards}</div>
          </section>

          <section class="space-y-3">
            <div class="flex items-center justify-between gap-3">
              <h2 class="text-2xl font-semibold">${escapeHtml(messages.builder.dialogueGraphsTitle)}</h2>
              <span class="badge badge-outline">${dialogueGraphs.length}</span>
            </div>
            <div class="grid gap-4 xl:grid-cols-2">${dialogueGraphs.length === 0 ? emptyGraphAlert : graphCards}</div>
          </section>

          <div
            id="mechanics-detail"
            class="space-y-4"
            aria-live="polite"
            tabindex="-1"
            data-focus-panel="true"
            hx-ext="focus-panel"
          >
            <div role="alert" class="alert alert-info alert-soft"><span>${escapeHtml(messages.builder.mechanicsDetailHint)}</span></div>
          </div>
        </div>`,
      sideSections: [
        {
          title: messages.builder.flagsTitle,
          description: messages.builder.mechanicsDetailHint,
          body: `<div class="flex flex-wrap gap-2">
            ${
              flags.length > 0
                ? flags
                    .map((flag) => `<span class="badge badge-ghost">${escapeHtml(flag.key)}</span>`)
                    .join("")
                : `<span class="text-sm text-base-content/60">${escapeHtml(messages.builder.noFlags)}</span>`
            }
          </div>`,
        },
        {
          title: messages.builder.creatorSupportTitle,
          description: messages.builder.capabilityMechanicsDescription,
          body: `<div class="rounded-box border border-base-300 bg-base-200/55 p-3 text-sm leading-6 text-base-content/72">${escapeHtml(messages.builder.mechanicsDetailHint)}</div>`,
        },
      ],
    })}
  </section>`;
};
