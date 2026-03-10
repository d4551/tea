# TEA

<p align="center">
  <strong>基于 Bun 的 SSR 优先游戏运行时、构建器工作区与 AI 辅助工具集。</strong>
</p>

<p align="center">
  <a href="notes/doc-archive/README.txt">English</a>
  ·
  <a href="notes/doc-archive/README.zh-CN.txt">中文</a>
  ·
  <a href="notes/doc-archive/ARCHITECTURE.txt">架构文档</a>
  ·
  <a href="notes/doc-archive/docs__index.txt">文档索引</a>
</p>

<p align="center">
  <a href="notes/doc-archive/README.txt"><img alt="English documentation available" src="https://img.shields.io/badge/docs-English-0f766e?style=flat-square"></a>
  <a href="notes/doc-archive/README.zh-CN.txt"><img alt="中文文档" src="https://img.shields.io/badge/docs-%E4%B8%AD%E6%96%87-c2410c?style=flat-square"></a>
  <img alt="Bun 1.3.10" src="https://img.shields.io/badge/Bun-1.3.10-111827?style=flat-square">
  <img alt="TypeScript strict" src="https://img.shields.io/badge/TypeScript-strict-2563eb?style=flat-square">
  <img alt="Elysia 1.4.27" src="https://img.shields.io/badge/Elysia-1.4.27-059669?style=flat-square">
  <img alt="Prisma 7.4.2" src="https://img.shields.io/badge/Prisma-7.4.2-1f2937?style=flat-square">
  <img alt="HTMX 2.0.8" src="https://img.shields.io/badge/HTMX-2.0.8-1d4ed8?style=flat-square">
  <img alt="SSR first" src="https://img.shields.io/badge/rendering-SSR--first-7c3aed?style=flat-square">
  <img alt="Verify with bun run verify" src="https://img.shields.io/badge/verify-bun%20run%20verify-0f766e?style=flat-square">
</p>

> 需要英文文档？请打开 [README.md](notes/doc-archive/README.txt)。
>
> Need the English version? Open [README.md](notes/doc-archive/README.txt)。

TEA 是一个以 SSR 为默认渲染策略的游戏运行时与构建平台，基于 Bun、Elysia、HTMX、Tailwind CSS、DaisyUI、Prisma、PixiJS 和 Three.js 构建。这个仓库同时包含服务端渲染 Web 应用、游戏构建器工作区、服务端权威多人运行时、AI 辅助工具，以及一个 RPG Maker MZ 配套包。

## 快速概览

| 维度 | 当前实现 |
| --- | --- |
| 交付模型 | 默认 SSR，HTMX 负责渐进增强，仅在必要处使用浏览器运行时 |
| 主要表面 | 首页/oracle SSR、构建器工作区、游戏会话运行时、AI API、知识检索 |
| 后端 | 在 `src/app.ts` 中组装的 Elysia 应用，由 `src/server.ts` 启动 |
| 状态与持久化 | Prisma + SQLite 持久化会话、知识分块、oracle 数据和构建器驱动的运行时状态 |
| 渲染栈 | Tailwind CSS 4、DaisyUI 5、HTMX 2、PixiJS 8、Three.js 0.183 |
| 语言环境 | `src/config/environment.ts` 中的 `en-US` 与 `zh-CN` |
| 验证入口 | `bun run verify` |

## 代码库包含的内容

- 面向首页、构建器工作区、AI 页面和游戏路由的 SSR 文档渲染
- 基于 HTMX 的表单、导航、校验反馈与面板局部刷新
- 带有恢复、邀请、HUD、websocket 与持久化能力的服务端权威游戏循环
- 一个负责草稿项目编辑、发布校验、不可变版本快照和运行时会话播种的构建器领域层
- 面向本地 Transformers、Ollama 与 OpenAI-compatible 提供方的 AI 路由层
- 使用 Prisma 持久化游戏会话、构建器产物和 AI 知识检索数据
- 一个与主 TypeScript 应用并行维护的 `LOTFK_RMMZ_Agentic_Pack`

## 技术栈与版本锁定

| 层 | 包 | 版本 |
| --- | --- | --- |
| 运行时 | Bun | `1.3.10` |
| 语言 | TypeScript | `5.9.3` |
| 服务端 | Elysia | `1.4.27` |
| ORM | Prisma / `@prisma/client` | `7.4.2` |
| 渐进增强 | `htmx.org` | `2.0.8` |
| UI Kit | DaisyUI | `5.5.19` |
| CSS | Tailwind CSS | `4.2.1` |
| 2D 渲染 | PixiJS | `8.17.0` |
| 3D 渲染 | Three.js | `0.183.2` |
| 浏览器自动化/测试 | Playwright | `1.58.2` |

版本治理由 `scripts/dependency-drift-check.ts` 负责，并通过 `bun run dependency:drift` 执行。

## 运行时架构

应用入口位于 `src/app.ts`。`createApp()` 将共享请求插件、SSR 路由、类型化 API、AI 路由、可游玩游戏运行时和构建器工作区组装到同一个 Elysia 应用中。

```mermaid
flowchart LR
  subgraph Browser [Browser surfaces]
    Home["SSR pages"]
    Htmx["HTMX swaps"]
    Playable["Playable client"]
    Hud["SSE and websocket"]
  end

  subgraph Server [Elysia application]
    Request["request-context"]
    I18n["i18n-context"]
    Error["global onError"]
    Pages["page-routes"]
    GameRoutes["game-routes"]
    Api["api-routes"]
    BuilderRoutes["builder-routes"]
    BuilderApi["builder-api"]
    AiRoutes["ai-routes"]
    Views["SSR views"]
    Plugins["static, auth, swagger, lifecycle plugins"]
  end

  subgraph Domain [Domain owners]
    Oracle["oracle-service"]
    Game["game-loop"]
    Builder["builder-service"]
    Registry["provider-registry"]
    Knowledge["knowledge-base-service"]
    Worker["creator-worker"]
  end

  subgraph Data [Persistence and assets]
    Prisma["Prisma and SQLite"]
    Public["public assets"]
    Uploads["uploads and builder artifacts"]
  end

  Home --> Request
  Htmx --> Request
  Playable --> Request
  Hud --> Request
  Request --> I18n --> Error
  Error --> Pages
  Error --> GameRoutes
  Error --> Api
  Error --> BuilderRoutes
  Error --> BuilderApi
  Error --> AiRoutes
  Pages --> Views
  GameRoutes --> Game
  GameRoutes --> Builder
  Api --> Oracle
  BuilderRoutes --> Builder
  BuilderRoutes --> Registry
  BuilderRoutes --> Knowledge
  BuilderApi --> Builder
  BuilderApi --> Worker
  BuilderApi --> Registry
  BuilderApi --> Knowledge
  AiRoutes --> Registry
  AiRoutes --> Knowledge
  Pages --> Plugins
  GameRoutes --> Plugins
  BuilderRoutes --> Plugins
  BuilderApi --> Plugins
  Game --> Prisma
  Builder --> Prisma
  Knowledge --> Prisma
  Views --> Public
  Builder --> Uploads
```

## 请求生命周期

共享 HTTP 路径是确定性的：先注入请求上下文和语言解析，再由路由处理器调用类型化领域服务，最后由全局 Elysia `onError` 处理器把非预期异常收敛成统一错误信封。

```mermaid
sequenceDiagram
  autonumber
  participant Browser
  participant Request as request-context
  participant Locale as i18n-context
  participant Route as route handler
  participant Domain as domain service
  participant View as SSR view or API envelope
  participant Error as global onError

  Browser->>Request: HTTP request
  Request->>Locale: correlation id and locale negotiation
  Locale->>Route: typed request context
  Route->>Domain: boundary call
  alt success
    Domain-->>Route: typed data
    Route-->>View: document, fragment, or JSON body
  else typed failure
    Domain-->>Route: typed failure result
    Route-->>View: deterministic state or envelope
  else unexpected failure
    Route->>Error: thrown framework or runtime error
    Error-->>View: normalized error envelope
  end
  View-->>Browser: final response
```

## 构建器发布流水线

构建器页面编辑的是草稿项目状态。运行时会话不会直接读取可变草稿，而是先经过发布校验生成不可变版本快照，再由游戏循环基于该快照创建实时会话。

```mermaid
flowchart LR
  subgraph Authoring [Builder authoring]
    Draft["Draft project state"]
    Assets["Assets, scenes, dialogue, quests, automation specs"]
    Audit["Readiness audit"]
  end

  subgraph Publish [Publish boundary]
    Validate["validateBuilderProjectForPublish()"]
    Snapshot["Immutable release snapshot"]
  end

  subgraph Runtime [Runtime seeding]
    Create["game-loop.createSession()"]
    Session["Persisted game session"]
    Client["Playable bootstrap contract"]
  end

  Draft --> Assets --> Audit --> Validate
  Validate -->|pass| Snapshot
  Validate -->|issues| Audit
  Snapshot --> Create --> Session --> Client
```

## 持久化地图

Prisma schema 将持久化职责拆分为几个清晰区域：

- `OracleInteraction` 保存 oracle 的提问与返回结果。
- `AiKnowledgeDocument`、`AiKnowledgeChunk`、`AiKnowledgeChunkTerm` 支撑检索与搜索。
- `GameSession` 及其关联表保存权威运行时状态、角色、场景、背包、战斗和过场数据。
- 构建器版本与产物通过 builder 领域层流入运行时会话快照。

```mermaid
flowchart TD
  subgraph Knowledge [AI knowledge]
    Doc["AiKnowledgeDocument"]
    Chunk["AiKnowledgeChunk"]
    Term["AiKnowledgeChunkTerm"]
    Doc --> Chunk --> Term
  end

  subgraph Runtime [Game runtime]
    Session["GameSession"]
    Scene["Scene state, nodes, collisions, assets"]
    Actors["Participants, actors, NPCs"]
    Play["Runtime state, inventory, combat, cutscenes"]
    Session --> Scene
    Session --> Actors
    Session --> Play
  end

  subgraph Utility [Other persisted records]
    Oracle["OracleInteraction"]
  end

  Doc --> DB["SQLite via Prisma"]
  Session --> DB
  Oracle --> DB
```

## 状态模型

这个仓库在 SSR 片段与兜底 UI 表面上使用统一而收敛的状态词汇表。

```mermaid
stateDiagram-v2
  [*] --> idle
  idle --> loading
  loading --> success
  loading --> empty
  loading --> unauthorized
  loading --> retryable_error
  loading --> non_retryable_error
  retryable_error --> loading: retry
  success --> loading: refresh or mutate
  empty --> loading: retry or create
  unauthorized --> [*]
  non_retryable_error --> [*]
```

## 仓库结构地图

| 路径 | 职责 |
| --- | --- |
| `src/app.ts` | Elysia 顶层应用组装 |
| `src/server.ts` | 启动、就绪检查与可选 AI 预热 |
| `src/routes/page-routes.ts` | 首页与 oracle 片段 SSR 路由 |
| `src/routes/game-routes.ts` | 游戏页启动、邀请流与会话注水 |
| `src/routes/api-routes.ts` | 带类型化信封的健康检查与 oracle JSON API |
| `src/routes/ai-routes.ts` | AI 健康、能力、语音和知识 API |
| `src/routes/builder-routes.ts` | 构建器工作区 SSR 页面与面板 |
| `src/routes/builder-api.ts` | 构建器变更、发布流、AI 辅助与 SSE |
| `src/domain/game/` | 权威游戏逻辑、战斗、场景、背包与成长系统 |
| `src/domain/builder/` | 草稿状态、发布编排、creator worker、就绪度与资产存储 |
| `src/domain/ai/` | 提供方注册表、本地模型运行时、RAG 与 AI 适配层 |
| `src/views/` | SSR 布局、页面、构建器面板与共享 UI 渲染 |
| `src/htmx-extensions/` | shell 与面板的 HTMX 生命周期行为 |
| `src/playable-game/` | 浏览器侧运行时、渲染器、传输与启动契约消费者 |
| `src/shared/` | 契约、配置、常量、i18n、数据库服务与工具函数 |
| `prisma/` | Schema、迁移和本地 SQLite 数据文件 |
| `scripts/` | setup、build、doctor、migration、dev 和文档校验脚本 |
| `tests/` | 契约、路由、提供方、运行时和启动流程测试 |
| `packages/` | 共享契约与 seeded PRNG 的 workspace 包 |
| `LOTFK_RMMZ_Agentic_Pack/` | RPG Maker MZ 配套包 |

## 路由分组与所有权

| 表面 | Owner | 说明 |
| --- | --- | --- |
| 首页与 oracle SSR | `src/routes/page-routes.ts` | 使用 `i18n-context` 与 auth session context |
| 游戏 SSR 入口 | `src/routes/game-routes.ts` | 通过 `game-loop` 注水或加入会话 |
| 构建器 SSR | `src/routes/builder-routes.ts` | 渲染 dashboard、编辑器、就绪度、AI 与自动化面板 |
| 构建器 API | `src/routes/builder-api.ts` | 负责 mutation、发布流、AI 预览和流式更新 |
| 核心 JSON API | `src/routes/api-routes.ts` | 健康检查与 oracle 信封 |
| AI API | `src/routes/ai-routes.ts` | 提供方健康、本地运行时状态、语音和知识检索 |

## 渲染与 UX 模型

- SSR 是默认呈现方式，仓库没有 SPA shell。
- HTMX 负责定向 swap、校验响应和渐进增强。
- 浏览器侧 hydration 仅用于可游玩运行时和少量增强钩子。
- DaisyUI 与 Tailwind 提供 alerts、drawers、cards、tables 和 loading 等共享外壳组件。
- `src/config/environment.ts` 中支持的语言环境为 `en-US` 与 `zh-CN`。
- 共享 UI 状态词汇表为 `idle -> loading -> success | empty | error(retryable | non-retryable) | unauthorized`。

## 环境与运维

关键配置位于 `src/config/environment.ts`，覆盖：

- 主机、端口、静态资源路径和 Swagger 文档路径等网络启动设置
- cookie 命名、恢复 token 签名和保留窗口等认证与会话设置
- 重连延迟、恢复超时、视口尺寸和命令 TTL 等可游玩运行时配置
- 提供方启用、本地模型路径、ONNX 配置和回退策略等 AI 运行时配置
- polling 周期与自动化探测超时等构建器自动化配置

这个代码库明显偏向配置驱动。默认值是强类型的，大多数运维参数都可以按环境覆盖。

## 快速开始

```bash
bun install
bun run setup
bun run dev
```

新机器初始化脚本：

- `./scripts/install-macos.sh`
- `./scripts/install-linux.sh`
- `powershell -ExecutionPolicy Bypass -File .\scripts\install-windows.ps1`

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `bun run dev` | 启动本地应用和资源/watch 工作流 |
| `bun run setup` | 初始化 env、Prisma、资源与就绪检查 |
| `bun run doctor` | 输出结构化就绪报告 |
| `bun run build:assets` | 构建 CSS、HTMX 扩展、游戏客户端和编辑器 bundle |
| `bun run docs:check` | 校验文档表面 |
| `bun run lint` | 运行 Biome 检查 |
| `bun run typecheck` | 运行严格 TypeScript 检查 |
| `bun test` | 运行 Bun 测试套件 |
| `bun run dependency:drift` | 执行依赖版本锁定校验 |
| `bun run audit:security` | 按需运行 `bun audit` |
| `bun run verify` | 一次性运行资源、依赖、文档、lint、typecheck 和测试 |
| `bun run start` | 在本地以生产式方式启动应用 |

## 测试与验证范围

当前 `tests/` 与 `src/**/*.test.ts` 覆盖的重点包括：

- API 契约与错误信封
- auth session 行为
- 运行时启动和配置
- 游戏引擎与场景行为
- AI 提供方与本地运行时行为
- 构建器自动化与创作流程
- 共享契约与 async-result 工具

发布前建议运行：

```bash
bun run verify
```

## 文档地图

- [English README](notes/doc-archive/README.txt)
- [架构文档](notes/doc-archive/ARCHITECTURE.txt)
- [文档索引](notes/doc-archive/docs__index.txt)
- [API 与传输契约](notes/doc-archive/docs__api-contracts.txt)
- [构建器领域](notes/doc-archive/docs__builder-domain.txt)
- [HTMX 扩展](notes/doc-archive/docs__htmx-extensions.txt)
- [可游玩运行时](notes/doc-archive/docs__playable-runtime.txt)
- [本地 AI 运行时](notes/doc-archive/docs__local-ai-runtime.txt)
- [运维手册](notes/doc-archive/docs__operator-runbook.txt)
- [RMMZ 配套包](notes/doc-archive/docs__rmmz-pack.txt)

## 贡献说明

- `src/shared/contracts/` 是服务端、构建器和可游玩运行时边界的契约层。
- 新页面优先保持 SSR；在引入客户端运行时代码前，先考虑 HTMX 渐进增强。
- AI 能力相关改动应经过 `src/domain/ai/providers/provider-registry.ts` 或本地模型 facade，而不是绕过共享 owner。
- 发布流改动需要同时对照 builder 文档与运行时会话播种规则。
- 仓库可能存在正在进行中的本地改动；应在其基础上协作，而不是重置 worktree。
