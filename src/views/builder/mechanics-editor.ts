import type { LocaleCode } from "../../config/environment.ts";
import { appRoutes, withQueryParameters } from "../../shared/constants/routes.ts";
import type {
  DialogueGraph,
  GameFlagDefinition,
  QuestDefinition,
  TriggerDefinition,
} from "../../shared/contracts/game.ts";
import type { Messages } from "../../shared/i18n/messages.ts";
import { escapeHtml } from "../layout.ts";

const questFormAction = (base: string, id: string) =>
  `${base}/${encodeURIComponent(id)}/form`;
const questDeleteAction = (base: string, id: string) =>
  `${base}/${encodeURIComponent(id)}`;

/**
 * Renders a quest edit form partial for HTMX swap into #mechanics-detail.
 */
export const renderQuestEditForm = (
  messages: Messages,
  locale: LocaleCode,
  projectId: string,
  quest: QuestDefinition,
): string => {
  const formAction = withQueryParameters(questFormAction(appRoutes.builderApiQuests, quest.id), {
    locale,
    projectId,
  });
  const deleteAction = withQueryParameters(questDeleteAction(appRoutes.builderApiQuests, quest.id), {
    locale,
    projectId,
  });
  const firstStep = quest.steps[0];
  return `<div class="card card-border bg-base-100 shadow-sm">
    <div class="card-body gap-3">
      <div class="flex items-center justify-between gap-3">
        <h3 class="card-title">${escapeHtml(messages.builder.editQuest)}: ${escapeHtml(quest.id)}</h3>
        <form hx-delete="${escapeHtml(deleteAction)}" hx-target="#builder-content" hx-swap="innerHTML" hx-indicator="#quest-edit-spinner" hx-disabled-elt="button">
          <button type="submit" class="btn btn-error btn-outline btn-sm">${escapeHtml(messages.builder.delete)}</button>
        </form>
      </div>
      <form hx-post="${escapeHtml(formAction)}" hx-target="#builder-content" hx-swap="innerHTML" hx-indicator="#quest-edit-spinner" hx-disabled-elt="button, input, select, textarea">
        <input type="hidden" name="projectId" value="${escapeHtml(projectId)}" />
        <input type="hidden" name="locale" value="${escapeHtml(locale)}" />
        <input type="hidden" name="id" value="${escapeHtml(quest.id)}" />
      <input name="title" type="text" class="input input-bordered w-full" value="${escapeHtml(quest.title)}" required />
      <textarea name="description" class="textarea textarea-bordered w-full" rows="3" required>${escapeHtml(quest.description)}</textarea>
        <input name="triggerId" type="text" class="input input-bordered w-full" value="${escapeHtml(firstStep?.triggerId ?? "")}" required />
        <div class="flex items-center gap-2">
          <button type="submit" class="btn btn-primary btn-sm">${escapeHtml(messages.builder.save)}</button>
          <span id="quest-edit-spinner" class="loading loading-spinner loading-sm htmx-indicator" aria-hidden="true"></span>
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
  const formAction = withQueryParameters(questFormAction(appRoutes.builderApiTriggers, trigger.id), {
    locale,
    projectId,
  });
  const deleteAction = withQueryParameters(questDeleteAction(appRoutes.builderApiTriggers, trigger.id), {
    locale,
    projectId,
  });
  return `<div class="card card-border bg-base-100 shadow-sm">
    <div class="card-body gap-3">
      <div class="flex items-center justify-between gap-3">
        <h3 class="card-title">${escapeHtml(messages.builder.editTrigger)}: ${escapeHtml(trigger.id)}</h3>
        <form hx-delete="${escapeHtml(deleteAction)}" hx-target="#builder-content" hx-swap="innerHTML" hx-indicator="#trigger-edit-spinner" hx-disabled-elt="button">
          <button type="submit" class="btn btn-error btn-outline btn-sm">${escapeHtml(messages.builder.delete)}</button>
        </form>
      </div>
      <form hx-post="${escapeHtml(formAction)}" hx-target="#builder-content" hx-swap="innerHTML" hx-indicator="#trigger-edit-spinner" hx-disabled-elt="button, input, select, textarea">
        <input type="hidden" name="projectId" value="${escapeHtml(projectId)}" />
        <input type="hidden" name="locale" value="${escapeHtml(locale)}" />
        <input type="hidden" name="id" value="${escapeHtml(trigger.id)}" />
      <input name="label" type="text" class="input input-bordered w-full" value="${escapeHtml(trigger.label)}" required />
      <select name="event" class="select select-bordered w-full">
        <option value="scene-enter"${trigger.event === "scene-enter" ? " selected" : ""}>scene-enter</option>
        <option value="npc-interact"${trigger.event === "npc-interact" ? " selected" : ""}>npc-interact</option>
        <option value="chat"${trigger.event === "chat" ? " selected" : ""}>chat</option>
        <option value="dialogue-confirmed"${trigger.event === "dialogue-confirmed" ? " selected" : ""}>dialogue-confirmed</option>
      </select>
        <input name="sceneId" type="text" class="input input-bordered w-full" value="${escapeHtml(trigger.sceneId ?? "")}" placeholder="teaHouse" />
        <input name="npcId" type="text" class="input input-bordered w-full" value="${escapeHtml(trigger.npcId ?? "")}" placeholder="teaMonk" />
        <div class="flex items-center gap-2">
          <button type="submit" class="btn btn-primary btn-sm">${escapeHtml(messages.builder.save)}</button>
          <span id="trigger-edit-spinner" class="loading loading-spinner loading-sm htmx-indicator" aria-hidden="true"></span>
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
  const formAction = withQueryParameters(questFormAction(appRoutes.builderApiDialogueGraphs, graph.id), {
    locale,
    projectId,
  });
  const deleteAction = withQueryParameters(questDeleteAction(appRoutes.builderApiDialogueGraphs, graph.id), {
    locale,
    projectId,
  });
  const rootNode = graph.nodes.find((n) => n.id === "root" || n.id === graph.rootNodeId) ?? graph.nodes[0];
  const line = rootNode?.line ?? "";
  return `<div class="card card-border bg-base-100 shadow-sm">
    <div class="card-body gap-3">
      <div class="flex items-center justify-between gap-3">
        <h3 class="card-title">${escapeHtml(messages.builder.editDialogueGraph)}: ${escapeHtml(graph.id)}</h3>
        <form hx-delete="${escapeHtml(deleteAction)}" hx-target="#builder-content" hx-swap="innerHTML" hx-indicator="#graph-edit-spinner" hx-disabled-elt="button">
          <button type="submit" class="btn btn-error btn-outline btn-sm">${escapeHtml(messages.builder.delete)}</button>
        </form>
      </div>
      <form hx-post="${escapeHtml(formAction)}" hx-target="#builder-content" hx-swap="innerHTML" hx-indicator="#graph-edit-spinner" hx-disabled-elt="button, input, select, textarea">
        <input type="hidden" name="projectId" value="${escapeHtml(projectId)}" />
        <input type="hidden" name="locale" value="${escapeHtml(locale)}" />
        <input type="hidden" name="id" value="${escapeHtml(graph.id)}" />
        <input name="title" type="text" class="input input-bordered w-full" value="${escapeHtml(graph.title)}" required />
        <input name="npcId" type="text" class="input input-bordered w-full" value="${escapeHtml(graph.npcId ?? "")}" placeholder="teaMonk" />
        <textarea name="line" class="textarea textarea-bordered w-full" rows="3" required>${escapeHtml(line)}</textarea>
        <div class="flex items-center gap-2">
          <button type="submit" class="btn btn-primary btn-sm">${escapeHtml(messages.builder.save)}</button>
          <span id="graph-edit-spinner" class="loading loading-spinner loading-sm htmx-indicator" aria-hidden="true"></span>
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
  const createQuestAction = `${appRoutes.builderApiQuests}/create/form`;
  const createTriggerAction = `${appRoutes.builderApiTriggers}/create/form`;
  const createGraphAction = `${appRoutes.builderApiDialogueGraphs}/create/form`;

  const questEditHref = (id: string) =>
    withQueryParameters(`${appRoutes.builderApiQuests}/${encodeURIComponent(id)}`, {
      locale,
      projectId,
    });
  const questCards = quests
    .map(
      (quest) => `<article class="card card-border bg-base-100 shadow-sm">
        <div class="card-body gap-2">
          <div>
            <h3 class="card-title text-base">${escapeHtml(quest.title)}</h3>
            <p class="font-mono text-xs text-base-content/60">${escapeHtml(quest.id)}</p>
          </div>
          <p class="text-sm text-base-content/75">${escapeHtml(quest.description)}</p>
          <div class="flex flex-wrap gap-2">
            ${quest.steps
              .map((step) => `<span class="badge badge-outline">${escapeHtml(step.title)}</span>`)
              .join("")}
          </div>
          <button class="btn btn-outline btn-xs" hx-get="${escapeHtml(questEditHref(quest.id))}" hx-target="#mechanics-detail" hx-swap="innerHTML">${escapeHtml(messages.builder.preview)}</button>
        </div>
      </article>`,
    )
    .join("");

  const triggerCards = triggers
    .map(
      (trigger) => `<article class="card card-border bg-base-100 shadow-sm">
        <div class="card-body gap-2">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h3 class="card-title text-base">${escapeHtml(trigger.label)}</h3>
              <p class="font-mono text-xs text-base-content/60">${escapeHtml(trigger.id)}</p>
            </div>
            <span class="badge badge-outline">${escapeHtml(trigger.event)}</span>
          </div>
          <p class="text-sm text-base-content/75">${escapeHtml(trigger.sceneId ?? messages.builder.triggerSceneGlobal)}</p>
        </div>
      </article>`,
    )
    .join("");

  const graphCards = dialogueGraphs
    .map(
      (graph) => `<article class="card card-border bg-base-100 shadow-sm">
        <div class="card-body gap-2">
          <div>
            <h3 class="card-title text-base">${escapeHtml(graph.title)}</h3>
            <div class="font-mono text-xs text-base-content/60">${escapeHtml(graph.id)}</div>
          </div>
          <div class="flex flex-wrap gap-2">
            <span class="badge badge-soft">${graph.nodes.length} ${escapeHtml(messages.builder.nodesCountLabel)}</span>
            ${
              graph.npcId
                ? `<span class="badge badge-outline">${escapeHtml(graph.npcId)}</span>`
                : ""
            }
          </div>
        </div>
      </article>`,
    )
    .join("");

  return `<section class="space-y-6">
    <div class="grid gap-4 xl:grid-cols-3">
      <article class="card card-border bg-base-100 shadow-sm">
        <form class="card-body gap-3" hx-post="${escapeHtml(createQuestAction)}" hx-target="#builder-content" hx-swap="innerHTML" hx-indicator="#quest-create-spinner" hx-disabled-elt="button, input, select, textarea">
          <input type="hidden" name="projectId" value="${escapeHtml(projectId)}" />
          <input type="hidden" name="locale" value="${escapeHtml(locale)}" />
          <h2 class="card-title">${escapeHtml(messages.builder.questsTitle)}</h2>
          <input name="id" type="text" class="input input-bordered w-full" placeholder="quest.new" required />
          <input name="title" type="text" class="input input-bordered w-full" placeholder="${escapeHtml(messages.builder.questTitlePlaceholder)}" required />
          <textarea name="description" class="textarea textarea-bordered w-full" rows="3" placeholder="${escapeHtml(messages.builder.questDescriptionPlaceholder)}" required></textarea>
          <input name="triggerId" type="text" class="input input-bordered w-full" placeholder="trigger.new" required />
          <div class="flex items-center gap-2">
            <button type="submit" class="btn btn-primary btn-sm">${escapeHtml(messages.builder.createQuest)}</button>
            <span id="quest-create-spinner" class="loading loading-spinner loading-sm htmx-indicator" aria-hidden="true"></span>
          </div>
        </form>
      </article>

      <article class="card card-border bg-base-100 shadow-sm">
        <form class="card-body gap-3" hx-post="${escapeHtml(createTriggerAction)}" hx-target="#builder-content" hx-swap="innerHTML" hx-indicator="#trigger-create-spinner" hx-disabled-elt="button, input, select, textarea">
          <input type="hidden" name="projectId" value="${escapeHtml(projectId)}" />
          <input type="hidden" name="locale" value="${escapeHtml(locale)}" />
          <h2 class="card-title">${escapeHtml(messages.builder.triggersTitle)}</h2>
          <input name="id" type="text" class="input input-bordered w-full" placeholder="trigger.new" required />
          <input name="label" type="text" class="input input-bordered w-full" placeholder="${escapeHtml(messages.builder.triggerLabelPlaceholder)}" required />
          <select name="event" class="select select-bordered w-full">
            <option value="scene-enter">scene-enter</option>
            <option value="npc-interact">npc-interact</option>
            <option value="chat">chat</option>
            <option value="dialogue-confirmed">dialogue-confirmed</option>
          </select>
          <input name="sceneId" type="text" class="input input-bordered w-full" placeholder="teaHouse" />
          <input name="npcId" type="text" class="input input-bordered w-full" placeholder="teaMonk" />
          <div class="flex items-center gap-2">
            <button type="submit" class="btn btn-outline btn-sm">${escapeHtml(messages.builder.createTrigger)}</button>
            <span id="trigger-create-spinner" class="loading loading-spinner loading-sm htmx-indicator" aria-hidden="true"></span>
          </div>
        </form>
      </article>

      <article class="card card-border bg-base-100 shadow-sm">
        <form class="card-body gap-3" hx-post="${escapeHtml(createGraphAction)}" hx-target="#builder-content" hx-swap="innerHTML" hx-indicator="#graph-create-spinner" hx-disabled-elt="button, input, select, textarea">
          <input type="hidden" name="projectId" value="${escapeHtml(projectId)}" />
          <input type="hidden" name="locale" value="${escapeHtml(locale)}" />
          <h2 class="card-title">${escapeHtml(messages.builder.dialogueGraphsTitle)}</h2>
          <input name="id" type="text" class="input input-bordered w-full" placeholder="graph.npc.guide" required />
          <input name="title" type="text" class="input input-bordered w-full" placeholder="${escapeHtml(messages.builder.graphTitlePlaceholder)}" required />
          <input name="npcId" type="text" class="input input-bordered w-full" placeholder="teaMonk" />
          <textarea name="line" class="textarea textarea-bordered w-full" rows="3" placeholder="npc.teaMonk.greet" required></textarea>
          <div class="flex items-center gap-2">
            <button type="submit" class="btn btn-outline btn-sm">${escapeHtml(messages.builder.createDialogueGraph)}</button>
            <span id="graph-create-spinner" class="loading loading-spinner loading-sm htmx-indicator" aria-hidden="true"></span>
          </div>
        </form>
      </article>
    </div>

    <section class="space-y-3">
      <div class="flex items-center justify-between gap-3">
        <h2 class="text-2xl font-semibold">${escapeHtml(messages.builder.questsTitle)}</h2>
        <span class="badge badge-outline">${quests.length}</span>
      </div>
      <div class="grid gap-4 xl:grid-cols-2">${questCards || `<div role="alert" class="alert alert-info alert-soft"><span>${escapeHtml(messages.builder.mechanicsWorkspaceTitle)}</span></div>`}</div>
    </section>

    <section class="space-y-3">
      <div class="flex items-center justify-between gap-3">
        <h2 class="text-2xl font-semibold">${escapeHtml(messages.builder.triggersTitle)}</h2>
        <span class="badge badge-outline">${triggers.length}</span>
      </div>
      <div class="grid gap-4 xl:grid-cols-2">${triggerCards || `<div role="alert" class="alert alert-info alert-soft"><span>${escapeHtml(messages.builder.triggersTitle)}</span></div>`}</div>
    </section>

    <section class="space-y-3">
      <div class="flex items-center justify-between gap-3">
        <h2 class="text-2xl font-semibold">${escapeHtml(messages.builder.dialogueGraphsTitle)}</h2>
        <span class="badge badge-outline">${dialogueGraphs.length}</span>
      </div>
      <div class="grid gap-4 xl:grid-cols-2">${graphCards || `<div role="alert" class="alert alert-info alert-soft"><span>${escapeHtml(messages.builder.dialogueGraphsTitle)}</span></div>`}</div>
    </section>

    <section class="card card-border bg-base-100 shadow-sm">
      <div class="card-body gap-3">
        <h2 class="card-title">${escapeHtml(messages.builder.preview)}</h2>
        <div class="flex flex-wrap gap-2">
          ${flags.map((flag) => `<span class="badge badge-ghost">${escapeHtml(flag.key)}</span>`).join("")}
        </div>
      </div>
    </section>
    </div>

    <div id="mechanics-detail" class="space-y-4" aria-live="polite">
      <div role="alert" class="alert alert-info alert-soft"><span>${escapeHtml(messages.builder.mechanicsWorkspaceTitle)}</span></div>
    </div>
  </section>`;
};
