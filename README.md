# TEA

## Start here / 从这里开始

- [Platform explainer / 平台白话说明 / ELI5](docs/platform-explainer.md)
- [GitHub description, technologies, and keywords / GitHub 描述、技术栈与关键词](docs/github-metadata.md)
- [Documentation index / 文档索引](docs/index.md)

SSR-first game runtime, builder workspace, and AI-enabled game platform built on Bun + TypeScript.

基于 Bun + TypeScript 的 SSR 优先游戏运行时、构建器工作区与 AI 游戏平台。

![Bun](https://img.shields.io/badge/Bun%20Runtime-1.3+-black?logo=bun&logoColor=white&style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white&style=for-the-badge)
![Prisma](https://img.shields.io/badge/Prisma-7%2B-2D3748?logo=prisma&style=for-the-badge)
![Tailwind](https://img.shields.io/badge/Tailwind-4%2A-38B2AC?logo=tailwindcss&logoColor=white&style=for-the-badge)
![HTMX](https://img.shields.io/badge/HTMX-Server%20Driven-336791?style=for-the-badge)
![Docs](https://img.shields.io/badge/Docs-Archive%20First-0F766E?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-2EA44F?style=for-the-badge)

## Overview / 概览

### English

SSR-first game runtime, builder workspace, and AI-enabled game platform built on Bun + TypeScript.

Runtime stack: Bun 1.3+ · TypeScript Strict · Prisma 7+ · Tailwind 4 / DaisyUI 5 · Pixi.js 8 (2D) · Three.js (3D/WebGPU).

Documentation parity strategy: every concept is mirrored with English first, then Simplified Chinese. Library docs: llms-stack-refresh for core stack; Context7 MCP for Pixi.js, Three.js, Transformers, Playwright, Biome.

### 中文

基于 Bun + TypeScript 的 SSR 优先游戏运行时、构建器工作区与 AI 游戏平台。

技术栈：Bun 1.3+、TypeScript Strict、Prisma 7+、Tailwind 4 / DaisyUI 5、Pixi.js 8（2D）、Three.js（3D/WebGPU）。

文档对照策略：每个概念先写英文，再给出对应的简体中文。库文档：llms-stack-refresh 覆盖核心栈；Context7 MCP 覆盖 Pixi.js、Three.js、Transformers、Playwright、Biome。

---

## Quick reference / 快速索引

### English

- [Platform explainer](docs/platform-explainer.md)
- [Documentation](#documentation--文档)
- [Architecture at a glance](#architecture-at-a-glance--架构一览)
- [Request and error lifecycle](#request-and-error-lifecycle--请求与错误流)
- [Builder publish flow](#builder-to-playable-runtime-pipeline--构建器到运行时发布链路)
- [End-to-end game creation (UI to runtime)](#end-to-end-game-creation-ui-runtime--游戏创建端到端流程)
- [Game session lifecycle](#game-session-lifecycle--游戏会话生命周期)
- [Data ownership and state model](#data-ownership-and-state-model--数据所有权与状态模型)
- [AI routing and reliability](#ai-reliability-chain--ai-可靠性链路)
- [Security and hardening](#security-and-hardening--安全与加固)
- [Repository map](#repository-map--仓库结构)
- [UI/API state model](#state-transitions-exposed-to-ui--ui-暴露的状态流)
- [Quality gates](#quality-gates-and-operations--质量门禁与运维)
- [Notes and contribution guidance](#notes-and-contribution-guidance--说明与贡献规范)

### 中文

- [平台白话说明](docs/platform-explainer.md)
- [文档](#documentation--文档)
- [架构一览](#architecture-at-a-glance--架构一览)
- [请求与错误流](#request-and-error-lifecycle--请求与错误流)
- [构建器发布链路](#builder-to-playable-runtime-pipeline--构建器到运行时发布链路)
- [游戏创建端到端流程](#end-to-end-game-creation-ui-runtime--游戏创建端到端流程)
- [游戏会话生命周期](#game-session-lifecycle--游戏会话生命周期)
- [数据所有权与状态模型](#data-ownership-and-state-model--数据所有权与状态模型)
- [AI 可靠性链路](#ai-reliability-chain--ai-可靠性链路)
- [安全与加固](#security-and-hardening--安全与加固)
- [仓库结构](#repository-map--仓库结构)
- [UI 暴露的状态流](#state-transitions-exposed-to-ui--ui-暴露的状态流)
- [质量门禁与运维](#quality-gates-and-operations--质量门禁与运维)
- [说明与贡献规范](#notes-and-contribution-guidance--说明与贡献规范)

---

## Documentation / 文档

### English

The source of truth is now a plaintext archive namespace in `notes/doc-archive/`.
Markdown is no longer used as the runtime documentation source.

Documentation workflow: project architecture and contracts live in `notes/doc-archive/`; library patterns use llms-stack-refresh (Bun, Elysia, htmx, Prisma, Tailwind, DaisyUI) and Context7 MCP (Pixi.js, Three.js, Transformers, Playwright, Biome). See `docs__context7-audit.txt` for coverage.

Key archives:

- Architecture: `notes/doc-archive/ARCHITECTURE.txt`
- Docs index: `notes/doc-archive/docs__index.txt`
- API contracts: `notes/doc-archive/docs__api-contracts.txt`
- Builder domain: `notes/doc-archive/docs__builder-domain.txt`
- HTMX extensions: `notes/doc-archive/docs__htmx-extensions.txt`
- Playable runtime: `notes/doc-archive/docs__playable-runtime.txt`
- Local AI runtime: `notes/doc-archive/docs__local-ai-runtime.txt`
- Operator runbook: `notes/doc-archive/docs__operator-runbook.txt`
- RMMZ pack: `notes/doc-archive/docs__rmmz-pack.txt`
- Companion pack status: `notes/doc-archive/LOTFK_RMMZ_Agentic_Pack__STATUS.txt`
- Context7 audit: `notes/doc-archive/docs__context7-audit.txt` (doc coverage and Context7 MCP usage)

### 中文

文档源真相已迁移到 `notes/doc-archive/` 的纯文本归档空间。
运行时文档不再使用 Markdown 作为源码。

文档工作流：项目架构与契约在 `notes/doc-archive/`；库模式使用 llms-stack-refresh（Bun、Elysia、htmx、Prisma、Tailwind、DaisyUI）与 Context7 MCP（Pixi.js、Three.js、Transformers、Playwright、Biome）。详见 `docs__context7-audit.txt`。

关键归档：

- 架构：`notes/doc-archive/ARCHITECTURE.txt`
- 文档索引：`notes/doc-archive/docs__index.txt`
- API 契约：`notes/doc-archive/docs__api-contracts.txt`
- 构建器域：`notes/doc-archive/docs__builder-domain.txt`
- HTMX 扩展：`notes/doc-archive/docs__htmx-extensions.txt`
- 可游玩运行时：`notes/doc-archive/docs__playable-runtime.txt`
- 本地 AI 运行时：`notes/doc-archive/docs__local-ai-runtime.txt`
- 运维手册：`notes/doc-archive/docs__operator-runbook.txt`
- RMMZ 包：`notes/doc-archive/docs__rmmz-pack.txt`
- 陪伴包状态：`notes/doc-archive/LOTFK_RMMZ_Agentic_Pack__STATUS.txt`
- Context7 审计：`notes/doc-archive/docs__context7-audit.txt`（文档覆盖与 Context7 MCP 使用）

---

## Executive summary / 执行摘要

### English

TEA combines SSR pages, a game-loop domain, a builder workspace, and AI tooling in one deterministic Bun platform.

The system is designed for predictable behavior across pages, HTMX fragments, JSON APIs, and runtime transport.

Core values:

- High reliability through strict boundaries and explicit fallback behavior.
- Composable releases that seed sessions in a controlled, reproducible way.
- Archive-first documentation for stable source/runtime parity.

Core capabilities:

- Homepage and oracle SSR with minimal client hydration.
- Game sessions with join, rejoin, combat progression, and resumable state.
- Builder drafting, policy checks, immutable releases, and publish gates.
- Multi-provider AI with retrieval and explicit fallback policy.

### 中文

TEA 将 SSR 页面、游戏循环域、构建器工作区与 AI 工具链统一到一套可预测的 Bun 平台。

平台目标是在页面、HTMX 片段、JSON API 与运行时传输上保持确定性行为。

核心价值：

- 通过严格边界和显式回退策略提升可靠性。
- 通过可复现方式将发布物注入会话，支持可组合运行时。
- 文档归档优先，保持源与运行时参考一致。

核心能力：

- 首页与 Oracle 采用 SSR 渲染，并最小化客户端 hydration。
- 会话支持加入、重连、战斗推进与可恢复状态。
- 构建器草稿、策略校验、不可变发布与发布门禁。
- 多供应商 AI，支持检索增强和明确回退链路。

---

## Architecture at a glance / 架构一览

### English

`src/app.ts` composes the platform as one Elysia application.
Composition layers are request context, locale context, route groups, domain services, contracts, and global error handling.
Ownership is separated so each module has one explicit behavioral and failure contract source.

<details>
<summary>Architecture Charts / 架构图表</summary>

<details>
<summary>English</summary>

```mermaid
flowchart TB
  subgraph Browser["Browser surfaces"]
    B_Page["SSR pages"]
    B_Frag["HTMX fragments"]
    B_Game["Playable client"]
    B_Events["WebSocket + SSE HUD"]
    B_Post["Command POST"]
  end

  subgraph Playable["Playable client layers"]
    P_Pixi["Pixi.js 2D"]
    P_Three["Three.js 3D/WebGPU"]
    P_Input["Input + config"]
  end

  subgraph App["Elysia app"]
    A_Plugin["request-context plugin"]
    A_Locale["i18n-context plugin"]
    A_Route["route groups"]
    A_Contract["contract validators"]
    A_Error["global onError + envelope"]
  end

  subgraph Domain["Domain services"]
    D_Game["game-loop"]
    D_Builder["builder-service"]
    D_Oracle["oracle-service"]
    D_AI["provider-registry"]
    D_Knowledge["knowledge-base-service"]
    D_Worker["creator-worker"]
  end

  subgraph Persistence["Persistence + artifacts"]
    P_DB["Prisma + SQLite"]
    P_Assets["public assets + uploads"]
    P_Artifacts["builder artifacts"]
    P_Pack["RMMZ pack data"]
    P_Audit["migrations + seeds + audit logs"]
  end

  B_Page --> A_Route
  B_Frag --> A_Route
  B_Game --> A_Route
  B_Events --> A_Route
  B_Post --> A_Route

  B_Game --> P_Pixi
  B_Game --> P_Three
  B_Game --> P_Input

  A_Plugin --> A_Locale --> A_Route
  A_Route --> D_Game --> P_DB
  A_Route --> D_Builder --> P_DB
  A_Route --> D_Oracle --> P_DB
  A_Route --> D_AI --> P_DB
  A_Route --> D_Knowledge --> P_DB
  A_Route --> D_Worker --> P_Artifacts

  A_Route --> A_Contract --> A_Error
  P_Audit --> D_Builder
  P_Artifacts --> B_Game
  P_Pack --> D_Game
```

</details>

<details>
<summary>中文</summary>

```mermaid
flowchart TB
  subgraph Browser["浏览器终端"]
    B_Page["SSR 页面"]
    B_Frag["HTMX 片段"]
    B_Game["可游玩客户端"]
    B_Events["WebSocket + SSE HUD"]
    B_Post["命令 POST"]
  end

  subgraph Playable["可游玩客户端层"]
    P_Pixi["Pixi.js 2D"]
    P_Three["Three.js 3D/WebGPU"]
    P_Input["输入 + 配置"]
  end

  subgraph App["Elysia 应用"]
    A_Plugin["request-context 插件"]
    A_Locale["i18n-context 插件"]
    A_Route["路由分组"]
    A_Contract["契约验证"]
    A_Error["全局 onError + 信封"]
  end

  subgraph Domain["领域服务"]
    D_Game["game-loop"]
    D_Builder["builder-service"]
    D_Oracle["oracle-service"]
    D_AI["provider-registry"]
    D_Knowledge["knowledge-base-service"]
    D_Worker["creator-worker"]
  end

  subgraph Persistence["持久化 + 产物"]
    P_DB["Prisma + SQLite"]
    P_Assets["public 资源 + 上传"]
    P_Artifacts["构建器产物"]
    P_Pack["RMMZ 包数据"]
    P_Audit["迁移 + 种子 + 审计日志"]
  end

  B_Page --> A_Route
  B_Frag --> A_Route
  B_Game --> A_Route
  B_Events --> A_Route
  B_Post --> A_Route

  B_Game --> P_Pixi
  B_Game --> P_Three
  B_Game --> P_Input

  A_Plugin --> A_Locale --> A_Route
  A_Route --> D_Game --> P_DB
  A_Route --> D_Builder --> P_DB
  A_Route --> D_Oracle --> P_DB
  A_Route --> D_AI --> P_DB
  A_Route --> D_Knowledge --> P_DB
  A_Route --> D_Worker --> P_Artifacts

  A_Route --> A_Contract --> A_Error
  P_Audit --> D_Builder
  P_Artifacts --> B_Game
  P_Pack --> D_Game
```

</details>

</details>

### 中文

`src/app.ts` 将整个平台作为单一 Elysia 应用组装。
组成层包含请求上下文、语言上下文、路由分组、领域服务、契约与全局错误处理。
所有权被分离，确保每个模块仅承担一组行为和失败语义。

---

## Request and error lifecycle / 请求与错误流

### English

All requests flow through a deterministic chain:
context resolution, route boundary, contract validation, domain execution, error normalization, and typed final output.
The same state vocabulary is applied to SSR pages, HTMX fragments, and JSON endpoints.

<details>
<summary>Request Lifecycle Charts / 请求生命周期图表</summary>

<details>
<summary>English</summary>

```mermaid
sequenceDiagram
  autonumber
  participant Browser
  participant Ctx as request-context
  participant I18n as i18n-context
  participant Guard as auth/session guard
  participant Contract as contracts
  participant Route as route handler
  participant Service as domain service
  participant Result as typed result
  participant Error as global onError
  participant Resp as SSR/Fragment/API response

  Browser->>Ctx: HTTP request
  Ctx->>I18n: add locale + correlation id
  I18n->>Guard: locale + session projection
  Guard->>Contract: guarded typed context
  Contract->>Route: validated envelope
  Route->>Service: domain boundary call
  alt success
    Service-->>Result: success payload
    Result-->>Resp: html / fragment / json
  else typed business failure
    Service-->>Route: business failure result
    Route-->>Resp: mapped failure state
  else unexpected exception
    Route->>Error: throw
    Error-->>Resp: normalized envelope
  end
  Resp-->>Browser: final output
```

</details>

<details>
<summary>中文</summary>

```mermaid
sequenceDiagram
  autonumber
  participant Browser
  participant Ctx as request-context
  participant I18n as i18n-context
  participant Guard as 鉴权/会话守卫
  participant Contract as 契约层
  participant Route as 路由处理器
  participant Service as 领域服务
  participant Result as 类型化结果
  participant Error as 全局 onError
  participant Resp as SSR/片段/API 响应

  Browser->>Ctx: HTTP 请求
  Ctx->>I18n: 补齐语言与链路ID
  I18n->>Guard: 语言 + 会话投影
  Guard->>Contract: 受保护的类型化上下文
  Contract->>Route: 校验通过的信封
  Route->>Service: 调用领域边界
  alt 成功
    Service-->>Result: 成功载荷
    Result-->>Resp: html / 片段 / json
  else 业务失败
    Service-->>Route: 业务失败结果
    Route-->>Resp: 映射后的失败状态
  else 非预期异常
    Route->>Error: 抛错
    Error-->>Resp: 统一错误信封
  end
  Resp-->>Browser: 最终返回
```

</details>

</details>

### 中文

每个请求都经过确定性链路：
上下文解析 → 路由边界 → 契约校验 → 领域执行 → 错误标准化 → 类型化最终输出。
页面、HTMX 片段和 JSON 接口共享同一状态词汇。

---

## Builder to playable runtime pipeline / 构建器到运行时发布链路

### English

Runtime sessions are created only from immutable release snapshots.
The workflow keeps authoring and publish boundaries distinct for reproducibility and auditability.

<details>
<summary>Builder Publish Charts / 构建器发布图表</summary>

<details>
<summary>English</summary>

```mermaid
flowchart TD
  subgraph Authoring["Authoring"]
    A_Draft["Draft edits"]
    A_Asset["Asset upload + references"]
    A_Audit["Readiness checks"]
    A_Report["Blocking report"]
  end

  subgraph Publish["Publish boundary"]
    P_Validate["validateBuilderProjectForPublish"]
    P_Contract["contract checks + invariants"]
    P_AssetCheck["asset consistency"]
    P_Release["immutable release snapshot"]
    P_Output["runtime contract payload"]
  end

  subgraph Runtime["Runtime seed"]
    R_Select["creator-worker selects release"]
    R_Create["game-loop.createSession"]
    R_Hydrate["session hydration"]
    R_Join["join / invite / reconnect"]
    R_Result["running session"]
  end

  A_Draft --> A_Asset --> A_Audit --> P_Validate
  P_Validate -->|pass| P_Contract --> P_AssetCheck
  P_AssetCheck -->|pass| P_Release --> P_Output --> R_Select
  P_Validate -->|fail| A_Report
  P_AssetCheck -->|fail| A_Report
  R_Select --> R_Create --> R_Hydrate --> R_Join --> R_Result
  R_Join -->|reconnect| R_Create
  R_Join -->|blocked by policy| A_Report
```

</details>

<details>
<summary>中文</summary>

```mermaid
flowchart TD
  subgraph Authoring["编辑阶段"]
    A_Draft["草稿编辑"]
    A_Asset["资源上传与引用"]
    A_Audit["可发布性检查"]
    A_Report["阻断报告"]
  end

  subgraph Publish["发布边界"]
    P_Validate["validateBuilderProjectForPublish"]
    P_Contract["契约校验 + 不变量"]
    P_AssetCheck["资源一致性"]
    P_Release["不可变发布快照"]
    P_Output["运行时契约输出"]
  end

  subgraph Runtime["运行时注入"]
    R_Select["creator-worker 选择发布物"]
    R_Create["game-loop.createSession"]
    R_Hydrate["会话状态注入"]
    R_Join["加入 / 邀请 / 重连"]
    R_Result["会话运行"]
  end

  A_Draft --> A_Asset --> A_Audit --> P_Validate
  P_Validate -->|通过| P_Contract --> P_AssetCheck
  P_AssetCheck -->|通过| P_Release --> P_Output --> R_Select
  P_Validate -->|不通过| A_Report
  P_AssetCheck -->|不通过| A_Report
  R_Select --> R_Create --> R_Hydrate --> R_Join --> R_Result
  R_Join -->|重连成功| R_Create
  R_Join -->|被策略拦截| A_Report
```

</details>

</details>

### 中文

运行时会话只允许基于不可变发布快照创建。
工作流将创作与发布边界分离，便于复现和审计。

---

## End-to-end game creation (UI → runtime) / 游戏创建端到端流程

### English

This section maps the full path from Builder UI interactions to a playable, persisted session.

The flow is validation-first: session hydration is the last step and must succeed before gameplay is exposed.

<details>
<summary>UI To Runtime Charts / UI 到运行时图表</summary>

<details>
<summary>English</summary>

```mermaid
flowchart TD
  UI["Builder UI action"] --> Draft["Draft write API"]
  Draft --> Validation["Frontend schema validation"]
  Validation --> ServerCheck["Server draft validation + CSRF + auth"]
  ServerCheck -->|ok| Autosave["Autosave draft state"]
  Autosave --> AssetCheck["Asset consistency checks"]
  AssetCheck --> PublishGate["Publish action + contract checks"]
  PublishGate -->|pass| Snapshot["Release snapshot"]
  Snapshot --> Queue["Creator worker queue"]
  Queue --> Seed["game-loop.createSession"]
  Seed --> Hydrate["Session hydration"]
  Hydrate --> Playable["Playable page rendered"]
  Playable --> Rejoin["Join/rejoin endpoint"]
  Rejoin --> Telemetry["Session telemetry + error envelope"]

  ServerCheck -->|fail| Alert["Validation error shown in UI"]
  PublishGate -->|fail| Block["Blocking report in builder"]
  AssetCheck -->|missing| Alert
```

</details>

<details>
<summary>中文</summary>

```mermaid
flowchart TD
  UI["构建器界面操作"] --> Draft["草稿写入接口"]
  Draft --> Validation["前端规则校验"]
  Validation --> ServerCheck["服务端草稿校验 + CSRF + 鉴权"]
  ServerCheck -->|通过| Autosave["草稿状态自动保存"]
  Autosave --> AssetCheck["资源一致性检查"]
  AssetCheck --> PublishGate["发布操作 + 契约校验"]
  PublishGate -->|通过| Snapshot["发布快照"]
  Snapshot --> Queue["Creator-worker 队列"]
  Queue --> Seed["game-loop.createSession"]
  Seed --> Hydrate["会话状态注入"]
  Hydrate --> Playable["可游玩页面渲染"]
  Playable --> Rejoin["加入/重连入口"]
  Rejoin --> Telemetry["会话遥测 + 错误信封"]

  ServerCheck -->|失败| Alert["UI 显示校验错误"]
  PublishGate -->|失败| Block["构建器阻断报告"]
  AssetCheck -->|缺失| Alert
```

</details>

</details>

### 中文

本节给出从构建器界面到可游玩的持久会话完整链路。

链路是以校验优先为原则：仅在会话注水成功后才暴露游戏操作。

---

## Game session lifecycle / 游戏会话生命周期

### English

Session state is explicit, persisted, and resumable by design. Created from immutable release snapshots only; heartbeat and TTL govern reconnection.

<details>
<summary>Session Lifecycle Charts / 会话生命周期图表</summary>

<details>
<summary>English</summary>

```mermaid
stateDiagram-v2
    [*] --> Created
    Created --> Loading : session requested
    Loading --> Running : hydration success
    Running --> Suspended : heartbeat miss
    Running --> Ended : explicit stop/completion
    Suspended --> Running : reconnect within TTL
    Suspended --> Expired : TTL exceeded
    Expired --> [*]
    Ended --> Archived : persist summary + logs
    Archived --> [*]
```

</details>

<details>
<summary>中文</summary>

```mermaid
stateDiagram-v2
    [*] --> Created
    Created --> Loading : 发起会话
    Loading --> Running : 注入成功
    Running --> Suspended : 心跳超时
    Running --> Ended : 手动结束/自然完成
    Suspended --> Running : TTL 内重连
    Suspended --> Expired : 超出 TTL
    Expired --> [*]
    Ended --> Archived : 落库摘要与日志
    Archived --> [*]
```

</details>

</details>

### 中文

会话状态被设计为显式、可落库并可恢复。仅从不可变发布快照创建；心跳与 TTL 控制重连。

---

## Data ownership and state model / 数据所有权与状态模型

### English

Responsibility ownership is single-sourced to avoid mixed concerns:

- Route layer owns transport shape, contract envelope, and fragment/page selection.
- Game domain owns session state, actor transitions, and scene progression.
- Builder domain owns validation, release snapshots, and artifact packaging.
- AI domain owns provider orchestration and fallback policy.
- Shared layer owns configuration, contracts, and cross-cutting utilities.

<details>
<summary>Ownership Charts / 所有权图表</summary>

<details>
<summary>English</summary>

```mermaid
flowchart LR
  subgraph CoreModels["Core runtime models"]
    GS["GameSession"]
    SC["Scene state + collision"]
    AC["Actors + NPCs"]
    IV["Inventory + status"]
    CB["Combat + cutscenes"]
  end

  subgraph BuilderModels["Builder models"]
    DR["Draft"]
    RL["Release snapshot"]
    CH["Checks + automation output"]
  end

  subgraph KnowledgeModels["Knowledge models"]
    KD["KnowledgeDocument"]
    KC["KnowledgeChunk"]
    KT["KnowledgeChunkTerm"]
  end

  DR --> RL --> GS
  CH --> RL
  GS --> SC --> AC
  AC --> IV --> CB
  KD --> KC --> KT
```

</details>

<details>
<summary>中文</summary>

```mermaid
flowchart LR
  subgraph CoreZh["核心运行模型"]
    GS["GameSession"]
    SC["场景状态 + 碰撞"]
    AC["角色 + NPC"]
    IV["背包 + 状态"]
    CB["战斗 + 过场动画"]
  end

  subgraph BuilderZh["构建器模型"]
    DR["草稿"]
    RL["发布快照"]
    CH["校验 + 自动化输出"]
  end

  subgraph KnowledgeZh["知识模型"]
    KD["KnowledgeDocument"]
    KC["KnowledgeChunk"]
    KT["KnowledgeChunkTerm"]
  end

  DR --> RL --> GS
  CH --> RL
  GS --> SC --> AC
  AC --> IV --> CB
  KD --> KC --> KT
```

</details>

</details>

### 中文

为避免职责混杂，采用单一责任归属：

- 路由层负责传输形态、错误信封和页面/片段选择。
- 游戏域负责会话状态、角色状态迁移与场景推进。
- 构建器域负责校验、发布快照和产物打包。
- AI 域负责供应商编排和回退策略。
- 共享层负责配置、契约和跨领域工具。

---

## AI reliability chain / AI 可靠性链路

### English

Provider orchestration is preference-based with explicit failover and validation gating.

<details>
<summary>AI Routing Charts / AI 路由图表</summary>

<details>
<summary>English</summary>

```mermaid
flowchart TD
  U["User request"] --> P["provider-registry"]
  P --> L["local provider"]
  P --> O["Ollama provider"]
  P --> R["remote provider"]
  L -->|ok| S["AI answer"]
  L -->|fail| O
  O -->|fail| R
  R -->|fail| F["fail-safe response + warning"]
  S --> K["knowledge-base enrichment"]
  K --> V["validated response"]
  F --> V
```

</details>

<details>
<summary>中文</summary>

```mermaid
flowchart TD
  U["用户请求"] --> P["provider-registry"]
  P --> L["本地供应商"]
  P --> O["Ollama 供应商"]
  P --> R["远端供应商"]
  L -->|可用| S["AI 回答"]
  L -->|失败| O
  O -->|失败| R
  R -->|再次失败| F["降级响应 + 告警"]
  S --> K["knowledge-base 增强"]
  K --> V["校验后的返回"]
  F --> V
```

</details>

</details>

### 中文

供应商链路按优先级编排，具备显式回退与校验门禁。

---

## Security and hardening / 安全与加固

### English

Hardening is layered:
request normalization, contract checks, static-asset validation, and deterministic failure outputs.

<details>
<summary>Security Charts / 安全图表</summary>

<details>
<summary>English</summary>

```mermaid
flowchart TD
  S0[Incoming HTTP request] --> S1[Decode + normalize path]
  S1 --> S2{Asset request?}
  S2 -->|Yes| S3[Static asset root validator]
  S2 -->|No| S4[Route boundary + typed contracts]
  S3 -->|pass| S5[Safe file read]
  S3 -->|fail| S6[404 + envelope]
  S4 --> S7[Auth + CSRF + payload parser]
  S7 -->|invalid| S6
  S7 -->|valid| S8[Domain service]
  S8 --> S9[Audit log + persistence]
  S9 --> S10[Response + observability tags]
```

</details>

<details>
<summary>中文</summary>

```mermaid
flowchart TD
  S0[收到 HTTP 请求] --> S1[路径解码 + 规范化]
  S1 --> S2{是否资源请求？}
  S2 -->|是| S3[静态资源根目录校验]
  S2 -->|否| S4[路由边界 + 类型化契约]
  S3 -->|通过| S5[安全文件读取]
  S3 -->|拒绝| S6[返回 404 + 信封]
  S4 --> S7[鉴权 + CSRF + 载荷解析]
  S7 -->|非法| S6
  S7 -->|合法| S8[领域服务]
  S8 --> S9[审计日志 + 落库]
  S9 --> S10[响应 + 可观测标签]
```

</details>

</details>

### 中文

安全加固采用分层设计：
请求规范化、契约校验、静态资源校验、确定性失败输出。

---

## Repository map / 仓库结构

### English

- `src/app.ts`: platform composition and route registration.
- `src/server.ts`: startup checks and lifecycle hooks.
- `src/routes/`: page, API, game, builder, and AI routing surfaces.
- `src/domain/`: authoritative game runtime, builder flow, and AI orchestration.
- `src/shared/`: contracts, configuration, and shared utilities.
- `src/playable-game/`: browser transport, Pixi.js/Three.js layers, input, debug.
- `src/htmx-extensions/`: layout-controls, focus-panel, SSE wiring.
- `src/plugins/`: game-plugin (HUD SSE, commands), sse-plugin.
- `scripts/`: archive/doc checks, asset pipeline, setup, maintenance tooling.
- `prisma/`: schema and migration metadata.
- `tests/`: unit and contract regression; `tests/e2e/` Playwright E2E.
- `notes/doc-archive/`: plaintext documentation archive.
- `.cursor/rules/`: llms-stack.mdc, context7.mdc (doc coverage rules).

### 中文

- `src/app.ts`：平台组合与路由注册。
- `src/server.ts`：启动检查与生命周期钩子。
- `src/routes/`：页面、API、游戏、构建器、AI 路由面。
- `src/domain/`：服务端权威游戏运行时、构建器与 AI 编排。
- `src/shared/`：契约、配置和通用工具。
- `src/playable-game/`：浏览器传输、Pixi.js/Three.js 层、输入、调试。
- `src/htmx-extensions/`：layout-controls、focus-panel、SSE 布线。
- `src/plugins/`：game-plugin（HUD SSE、命令）、sse-plugin。
- `scripts/`：文档归档检查、构建管线、setup、维护脚本。
- `prisma/`：schema 与迁移元数据。
- `tests/`：单元与契约回归；`tests/e2e/` Playwright E2E。
- `notes/doc-archive/`：纯文档归档区。
- `.cursor/rules/`：llms-stack.mdc、context7.mdc（文档覆盖规则）。

---

## State transitions exposed to UI / UI 暴露的状态流

### English

- `idle -> loading -> success | empty | error(retryable|non-retryable) | unauthorized`
- The same vocabulary is expected from pages, HTMX fragments, and JSON endpoints.

### 中文

- `idle -> loading -> success | empty | error(retryable|non-retryable) | unauthorized`
- 页面、HTMX 片段与 JSON 接口都必须使用同一状态词汇。

---

## Quality gates and operations / 质量门禁与运维

### English

Recommended command order after changes:

`bun install` → `bun run setup` → `bun run dev` → `bun run build:assets` → `bun run docs:check` → `bun run lint` → `bun run typecheck` → `bun test` → `bun run dependency:drift` → `bun run verify`

Run `bun run verify` after docs/runtime edits to ensure markdown path dependency is removed from checks.

### 中文

变更后建议执行顺序：

`bun install` → `bun run setup` → `bun run dev` → `bun run build:assets` → `bun run docs:check` → `bun run lint` → `bun run typecheck` → `bun test` → `bun run dependency:drift` → `bun run verify`

在文档或运行时改动后执行 `bun run verify`，确保检查脚本已移除 Markdown 路径依赖。

---

## Notes and contribution guidance / 说明与贡献规范

### English

When code changes, update implementation and archive entries in the same change set.

When runtime assumptions change, archive updates must be complete and synchronized.

Any new documentation block should preserve bilingual block structure: English then Simplified Chinese.

### 中文

代码变更应在同一次变更集中同步更新实现与归档。

运行时假设修改时，必须完整同步更新相关归档条目。

新增文档必须保留“英文块 + 简体中文块”结构，避免混排导致歧义。

---

## Change log / 更新摘要

### English

- README moved to explicit EN/ZH block structure with clear section-level boundaries.
- Language blocks are separated by headings and visual separators to reduce confusion.
- Architecture charts: added Playable client layers (Pixi.js, Three.js, Input), WebSocket + SSE HUD, Command POST.
- Request lifecycle: added auth/session guard step.
- Builder publish: added asset consistency check.
- Documentation: added Context7 audit, maintenance audit, and doc workflow (archive + llms-stack + Context7)
- Repository map: added htmx-extensions, plugins, tests/e2e, .cursor/rules.
- Quick reference: added Documentation, Game session lifecycle, Data ownership links.

### 中文

- README 已改为明确的英中文块结构并按章节分隔。
- 每个语言块使用独立标题和分隔符，降低阅读歧义。
- 架构图：新增可游玩客户端层（Pixi.js、Three.js、输入）、WebSocket + SSE HUD、命令 POST。
- 请求生命周期：新增鉴权/会话守卫步骤。
- 构建器发布：新增资源一致性检查。
- 文档：新增 Context7 审计、维护审计及文档工作流（归档 + llms-stack + Context7）。
- 仓库结构：新增 htmx-extensions、plugins、tests/e2e、.cursor/rules。
- 快速索引：新增文档、游戏会话生命周期、数据所有权链接。
