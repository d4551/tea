# Platform gap audit (scope model, web-native benchmark, and missing workspaces)

This document audits TEA's current ownership model and builder IA, then benchmarks it against web-native creation platforms.

Primary benchmark set:

- PlayCanvas official docs and editor model
- Phaser engine docs
- Phaser Editor docs

Out of scope for scoring:

- Console and mobile export pipelines
- Native installers and desktop-only IDE behavior
- Marketplace monetization and ad SDK features
- Full desktop-engine parity targets

## 1) Current state map

### 1.1) Ownership scope table

| Scope | TEA today | Proof in repo | Audit result |
| --- | --- | --- | --- |
| `global` | AI runtime and provider behavior can be used without a project, and AI knowledge endpoints accept an omitted `projectId`. | `src/routes/ai-routes.ts`, `src/domain/ai/*`, `src/views/builder/ai-panel.ts` | Present, but narrow. Global scope exists mostly for AI runtime concerns, not for authoring assets or workspace IA. |
| `organization` | Organizations, roles, memberships, and principal sessions exist for auth and audit. | `prisma/schema.prisma` models `Organization`, `OrganizationRole`, `AppUserOrganizationMembership`, `AppPrincipalSession` | Present in auth, absent in builder content ownership. No organization-scoped asset or capability model. |
| `project` | Builder routes, authored content, uploads, generation jobs, automation runs, and most AI UI state are bound to one `projectId`. | `src/routes/builder-routes.ts`, `prisma/schema.prisma` `BuilderProject*`, `src/domain/builder/asset-storage.ts` | Dominant scope. TEA currently collapses most platform concerns into project scope. |
| `release` | Immutable releases exist and runtime sessions can seed from a published release version. | `BuilderProjectRelease` in `prisma/schema.prisma`, `builder-project-state-store`, `game-loop.ts` | Present and cleanly modeled, but used mostly as a publish snapshot instead of a first-class release workspace. |
| `session` | Runtime play state, actors, scene state, inventory, combat, cutscene state, and resume metadata are isolated per game session. | `GameSession*` models in `prisma/schema.prisma`, `src/domain/game/services/GameStateStore.ts` | Present and well-scoped. Runtime isolation is stronger than builder/platform isolation. |

### 1.2) Repo-grounded evidence of project-first IA

- Builder page routing is entirely `/:projectId/...`, including `start`, `world`, `characters`, `story`, `assets`, `systems`, `operations`, and `settings` in `src/routes/builder-routes.ts`.
- Builder sidebar groups expose authoring and runtime tabs inside one project shell in `src/views/builder/builder-layout.ts`.
- Authored content is persisted through `BuilderProject`, `BuilderProjectScene`, `BuilderProjectAsset`, `BuilderProjectDialogueGraph`, `BuilderProjectGenerationJob`, `BuilderProjectAutomationRun`, and related tables in `prisma/schema.prisma`.
- File storage writes under `builderUploadsDirectory/<projectId>/<scope>/...` in `src/domain/builder/asset-storage.ts`.
- Starter flow creates or opens one project, not a multi-game portfolio, in `src/views/builder/builder-starter.ts`.
- AI settings live under a project route even when the concerns are really global or cross-project, such as provider inventory, model settings, retrieval, tool planning, and voice preview in `src/views/builder/ai-panel.ts`.

### 1.3) Where TEA collapses platform concerns into `projectId`

TEA currently mixes three different kinds of concern under the same project shell:

1. Authoring data that should stay project-owned.
2. Platform capabilities that should be global or organization-owned.
3. Review and release flows that should be release-owned or queue-owned.

Concrete collisions:

- AI provider inventory and runtime settings are displayed inside `/:projectId/settings`, even though provider lanes, model catalogs, and runtime health are not inherently project-specific.
- Generated artifacts and automation review are grouped as project operations, but the UI does not expose a queue that spans projects or releases.
- Asset uploads and generated files are physically namespaced by project, which blocks a shared asset library unless assets are duplicated.
- Starter templates exist, but they behave as one-time project bootstrap data rather than reusable template or pack entities with their own lifecycle.

### 1.4) Current workspace surfaces

TEA currently exposes these builder surfaces:

- `start`: project dashboard
- `world`: scenes and nodes
- `characters`: NPC editing
- `story`: dialogue editing
- `assets`: assets and clips
- `systems`: quests, triggers, dialogue graphs, flags
- `operations`: automation runs and generated artifacts
- `settings`: AI runtime, retrieval, model settings, voice tools, patch preview
- `playtest`: runtime launch

Missing top-level surfaces:

- Games portfolio
- Shared libraries
- Template catalog
- Capability policy center
- Release history and channels
- Cross-project review queue

## 2) External benchmark

### 2.1) What the benchmark platforms make explicit

| Capability | PlayCanvas | Phaser / Phaser Editor | TEA implication |
| --- | --- | --- | --- |
| Project workspace | PlayCanvas presents projects, assets, hierarchy, and inspector as distinct editor surfaces. | Phaser Editor uses a workbench with Files, Outline, Inspector, and Blocks views. | TEA needs clearer separation between portfolio, editor chrome, and settings surfaces. |
| Asset system | PlayCanvas has an asset registry and editor asset workflows instead of only scene-local attachment. | Phaser uses loader and pack files; Phaser Editor has an Asset Pack Editor. | TEA needs shared asset libraries and pack attachments, not only project-owned uploads. |
| Scene structure | PlayCanvas uses entity hierarchy and component composition. | Phaser has explicit scene lifecycle and multiple concurrent scenes; Phaser Editor exposes a Scene Editor and Outline. | TEA should separate scene hierarchy editing from list/detail forms and make composition more explicit. |
| Inspector model | PlayCanvas and Phaser Editor both expose property editing as a dedicated inspector surface. | Phaser Editor makes Inspector the primary editing surface for selected objects. | TEA currently edits through forms and collapsible panels; it lacks a true inspector workflow. |
| Reuse model | PlayCanvas supports entity cloning and template-style reuse patterns. | Phaser Editor supports prefab-like custom objects and reusable scene objects. | TEA needs first-class reusable templates and attachments instead of project-level copying. |
| Tilemaps and packs | PlayCanvas focuses more on entities and assets; Phaser has strong browser-native tilemap and pack workflows. | Phaser and Phaser Editor make tilemaps and asset packs explicit editor concepts. | TEA should promote tilemaps, packs, and reusable scene kits into the IA, not hide them inside scene JSON. |

### 2.2) Benchmark scoring notes

- PlayCanvas is strongest as a reference for browser-native editor layout, asset handling, and hierarchy-plus-inspector editing.
- Phaser engine is strongest as a reference for scene lifecycle, asset loading, pack files, and runtime organization.
- Phaser Editor is strongest as a reference for workbench layout, Outline and Inspector separation, prefab-like reuse, and editor-visible tilemaps.

### 2.3) Benchmark conclusions

The benchmark platforms do not make TEA's exact SSR-first and AI-first choices, but they consistently separate:

- portfolio and project selection
- files/assets and scene composition
- hierarchy and property editing
- reusable templates and one-off project content

TEA currently has strong runtime and release separation, but weaker authoring-surface separation.

## 3) Gap matrix

### 3.1) Platform IA gaps

| Gap | TEA today | Benchmark pattern | Why it matters | Priority |
| --- | --- | --- | --- | --- |
| Games portfolio | Starter flow opens or creates one project by ID. No portfolio surface. | Browser-native tools expose projects as a first-class home surface. | Multi-game authoring, discovery, and ownership review stay hidden behind manual IDs. | Foundational |
| Shared asset library | Assets are project-owned and stored under project paths. | PlayCanvas asset workflows and Phaser asset packs treat assets as reusable units. | Reuse requires duplication today, which blocks consistent branding and shared content. | Foundational |
| Template and pack ownership | Starter templates exist, but not as reusable catalog entities with versioning. | Prefab and pack patterns are explicit in web-native tools. | TEA cannot promote scene kits, NPC kits, or starter systems into reusable products. | Foundational |
| Organization-scoped capability policy | Organizations exist only in auth and audit, not in builder content or capabilities. | Team-facing web tools separate org policy from project editing. | Provider policy, shared models, and review permissions cannot be governed once for a team. | High leverage |
| Release workspace | Releases exist in persistence but not as a dedicated workspace with history, channels, or rollout state. | Editor platforms distinguish editing from publishing artifacts. | Publish remains a button, not a release management surface. | High leverage |
| Cross-project review queue | Operations are project-local. | Modern creation workflows centralize review state. | Generated artifacts and automation evidence are hard to supervise across many games. | High leverage |

### 3.2) Engine and editor gaps

| Gap | TEA today | Benchmark pattern | Why it matters | Priority |
| --- | --- | --- | --- | --- |
| Hierarchy plus inspector layout | Scene, asset, and AI editing are list-detail forms inside one workspace shell. | PlayCanvas hierarchy and Phaser Editor Outline plus Inspector are dedicated surfaces. | Complex scenes scale poorly without persistent selection and property editing. | Foundational |
| Prefab and reusable object model | Starter templates exist, but not reusable scene objects or component templates. | Phaser Editor prefab-like objects and PlayCanvas entity reuse. | Reusable NPCs, props, encounter kits, and UI kits require copy-paste today. | Foundational |
| Asset dependency graph | Assets, clips, timelines, atlases, and nodes are related, but not surfaced as a graph. | Asset packs and editor asset views make dependencies explicit. | Creators cannot answer what breaks when an asset changes. | High leverage |
| Import pipeline workspace | Upload exists, but there is no dedicated import review, validation, or variant pipeline workspace. | Web-native editors separate files, imports, and object usage. | Format normalization, derived variants, and validation stay implicit. | High leverage |
| Scene composition workspace | TEA has scene editing, but not a full viewport plus hierarchy plus inspector composition flow. | Scene Editor patterns in PlayCanvas and Phaser Editor. | Scene authoring remains form-heavy instead of composition-heavy. | High leverage |
| Publish channels | Release exists, but there is no channel model such as draft, internal, live, archived. | Publishing tools typically separate active build from revision history. | Release intent and rollout semantics are hidden. | Later |
| Collaboration surfaces | Auth and audit exist, but there is no project activity feed, lock model, assignment, or review ownership surface. | Browser-native tools normally expose team-aware workspace signals. | Multi-user editing will become confusing as soon as project count grows. | Later |

### 3.3) AI gaps

| Gap | TEA today | Repo evidence | Why it matters | Priority |
| --- | --- | --- | --- | --- |
| Global vs project capability boundaries | Global AI runtime exists, but AI UX is still nested in project settings. | `src/routes/ai-routes.ts`, `src/views/builder/ai-panel.ts` | Users cannot tell what is a platform capability versus a project capability. | Foundational |
| Reusable capability profiles | Provider registry and runtime settings exist, but there is no named capability profile per org or project. | `src/domain/ai/*`, `src/views/builder/ai-panel.ts` | Repeating the same AI configuration across games creates drift. | Foundational |
| Cross-project retrieval | Knowledge can be global when `projectId` is omitted, but there is no explicit global knowledge workspace or scoping UI. | `src/routes/ai-routes.ts` knowledge endpoints | Shared world lore and design standards are not modeled as a deliberate library. | High leverage |
| World-scale planning | Tool planning exists, but it is not tied to a portfolio, release plan, or cross-project roadmap. | `aiPlanTools` in `src/routes/ai-routes.ts` | AI can suggest steps, but not operate against a real platform-level planning model. | High leverage |
| Review queue for AI output | Generated artifacts are project-local and reviewed inside project operations. | `src/domain/builder/creator-worker.ts`, `src/views/builder/automation-panel.ts` | AI-heavy teams need a central review surface to prevent hidden regressions. | High leverage |
| Provenance and policy UX | Provenance exists in APIs and audit records, but there is no dedicated governance UI. | `audit-service.ts`, tool plan and assist flows | Trust and policy become harder as AI surface area grows. | Later |
| Asset critique loop | TEA can do image and voice tasks, but lacks a dedicated critique and iteration loop inside asset authoring. | `game-ai-service.ts`, `ai-panel.ts` | AI stays separated from the actual art and design editing flow. | Later |

## 4) Recommended information architecture

### 4.1) Target ownership model

| Scope | Recommended contents |
| --- | --- |
| `global` | provider catalog, runtime defaults, shared knowledge, starter template registry, platform-level feature flags |
| `organization` | asset libraries, capability policies, team roles, shared packs, review queues, project portfolio metadata |
| `project` | scenes, NPCs, dialogue, quests, flags, project-attached assets, local knowledge, automation state |
| `release` | immutable snapshot, release notes, validation report, channel, rollout status, review signoff |
| `session` | player progress, live runtime state, transport state, resume tokens |

### 4.2) Recommended workspace and layout surfaces

Add these top-level surfaces before deepening the existing project shell:

- `Games`: portfolio, ownership, health, latest release, active sessions
- `Libraries`: shared assets, packs, templates, documentation, and imported source files
- `Templates`: starter templates, prefabs, scene kits, NPC kits, mechanic kits
- `Capabilities`: AI providers, model policies, runtime settings, governance, audit posture
- `Releases`: publish history, validation state, channels, rollback target, rollout metadata
- `Review Queue`: generated artifacts, automation evidence, pending approvals, provenance trail

Keep these inside the project shell:

- `World`
- `Characters`
- `Story`
- `Systems`
- `Project Assets`
- `Playtest`

### 4.3) Recommended interface additions

Introduce explicit first-class contracts for the platform layer:

- scope enum: `global | organization | project | release | session`
- `AssetLibrary`
- `SharedAsset`
- `ProjectTemplate`
- `CapabilityProfile`
- project attachment models that link shared assets and templates into a project without copying source ownership

Recommended route split:

- portfolio routes: `/games`, `/libraries`, `/templates`, `/capabilities`, `/releases`, `/review`
- project routes: `/projects/:projectId/...`

### 4.4) Suggested sequencing

1. Introduce scope contracts and route separation.
2. Add Games, Libraries, and Capabilities surfaces.
3. Move global and organization AI concerns out of project settings.
4. Add template and attachment models for reusable assets and kits.
5. Promote releases and review queue into first-class workspaces.
6. Rework project editors toward hierarchy plus inspector layouts.

## 5) Acceptance checklist

The audit is complete if future implementation work preserves these conclusions:

- TEA is currently strongest at `release` and `session` isolation.
- TEA is currently weakest at distinguishing `global`, `organization`, and `project` authoring concerns.
- AI already hints at a global scope, but the rest of the builder IA does not.
- Web-native editor benchmarks consistently separate workbench layout, asset management, scene structure, and reusable templates.
- The next architectural step is not "add more project tabs"; it is "introduce platform scopes and workspace separation."

## 6) Source notes

Primary external references used for this audit:

- PlayCanvas official engine and editor model
- Phaser official scene and loader documentation
- Phaser Editor official workbench, Scene Editor, Asset Pack Editor, prefab, and editable tilemap documentation

These references were used as pattern benchmarks, not as direct implementation targets.
