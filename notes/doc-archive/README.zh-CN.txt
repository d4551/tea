# TEA — Bun-native SSR 游戏运行时 + 构建器 + AI 平台（中文版本）

<p align="center">
  <strong>Bun + Elysia + HTMX + TypeScript strict 为核心的 SSR 优先游戏平台。</strong>
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

> 本文档是仓库文档化表面的权威文本（无 `.md` 源文件依赖）。

## 1) 系统目标与运行范式

TEA 的核心目标是把「编辑器创作」与「可玩的实时会话」解耦为两个稳定域：

- 构建端（Builder）：可变草稿，支持编辑、试错和自动化辅助。
- 运行端（Runtime）：不可变快照驱动，保证播放一致性和可恢复性。

关键设计原则：**运行时不允许直接读取构建草稿**，仅使用发布后的快照创建会话。

## 2) 高层架构图

```mermaid
flowchart TB
  subgraph 浏览器端["浏览器端入口"]
    B1["首页 SSR"]
    B2["构建器 SSR + HTMX"]
    B3["可玩页 SSR"]
    B4["WS + HUD SSE + 命令 POST"]
  end

  subgraph 应用内核["src/app.ts"]
    K1["requestContext 插件"]
    K2["i18n + locale"]
    K3["全局 onError"]
    K4["静态资源插件"]
    K5["auth/sessions/swagger/AI 等插件"]
  end

  subgraph 路由层["Route 层"]
    R1["page-routes.ts"]
    R2["builder-routes.ts"]
    R3["builder-api.ts"]
    R4["game-routes.ts"]
    R5["game-plugin.ts"]
    R6["ai-routes.ts"]
    R7["api-routes.ts"]
  end

  subgraph 领域层["Domain 层"]
    D1["builder-service.ts"]
    D2["game-loop.ts"]
    D3["builder-publish-validation.ts"]
    D4["provider-registry.ts"]
    D5["knowledge-base-service.ts"]
    D6["oracle-service.ts"]
    D7["creator-worker.ts"]
  end

  subgraph 存储层["持久化与资产"]
    S1["Prisma + SQLite"]
    S2["uploads / builder artifacts"]
    S3["public 静态产物"]
  end

  B1 --> K1
  B2 --> K1
  B3 --> K1
  B4 --> K1
  K1 --> K2 --> K3 --> K4 --> K5
  K5 --> R1
  K5 --> R2
  K5 --> R3
  K5 --> R4
  K5 --> R5
  K5 --> R6
  K5 --> R7

  R2 --> D1
  R3 --> D1
  R3 --> D4
  R3 --> D5
  R4 --> D1
  R4 --> D2
  R5 --> D2
  R5 --> D1
  R6 --> D4
  R6 --> D5
  R7 --> D6

  D1 --> S1
  D2 --> S1
  D2 --> S2
  D3 --> S1
  D5 --> S1
  D4 --> S3
  R1 --> K5
```

## 3) 从“创建到游玩”的完整链路（UI 端到端）

```mermaid
sequenceDiagram
  autonumber
  actor 作者 as Author
  participant 构建器界面 as /builder 页面
  participant 构建器接口 as /api/builder
  participant 构建服务 as builder-service
  participant 发布校验 as publish 校验
  participant 存储 as Prisma 草稿/发布存储
  participant 游戏页 as /game 页面
  participant 游戏接口 as game-plugin.ts
  participant 游戏内核 as game-loop.ts
  participant HUD as /api/game/session/:id/hud

  作者->>构建器界面: 打开 /builder?projectId=hero-fort
  构建器界面->>构建器接口: GET /builder shell + 草稿加载
  构建器接口->>构建服务: getProject(projectId)
  构建服务->>存储: 加载可变草稿
  存储-->>构建服务: scenes/npc/dialogue/automation/asset
  构建服务-->>构建器接口: 类型化 draft 数据
  构建器接口-->>构建器界面: SSR 页面 + HTMX 分片

  作者->>构建器接口: POST /api/builder/projects
  构建器接口-->>构建器接口: redirectPath 清洗 + 合同校验
  构建器接口->>构建服务: createProject()
  构建服务->>存储: 创建草稿主记录与默认值
  存储-->>构建服务: projectId
  构建服务-->>构建器接口: 新建成功
  构建器接口-->>构建器界面: HX-Redirect 到 /builder?projectId=<id>

  作者->>构建器界面: 编辑场景 / NPC / 对话 / 任务 / 资产
  构建器界面->>构建器接口: HTMX patch 变更
  构建器接口->>构建服务: updateProjectDraft()
  构建服务->>存储: 有版本的可变写入

  作者->>构建器界面: 点击 Publish
  构建器界面->>构建器接口: PATCH /api/builder/projects/:id/publish {published:true}
  构建器接口->>构建服务: publishProject(true)
  构建服务->>发布校验: validateBuilderProjectForPublish()
  发布校验-->>构建服务: OK 或 issues
  alt 校验通过
    构建服务->>存储: 物化不可变发布快照
    存储-->>构建服务: snapshot + releaseVersion
    构建服务-->>构建器接口: published=true
    构建器接口-->>构建器界面: 启用 Play 按钮
  else 校验失败
    发布校验-->>构建服务: issue 列表
    构建服务-->>构建器接口: failure
    构建器接口-->>构建器界面: 局部错误片段
  end

  作者->>游戏页: 打开 /game?projectId=<id>
  游戏页->>构建服务: getPublishedProject(id)
  构建服务-->>游戏页: 发布快照 + 引导信息
  游戏页->>游戏接口: POST /api/game/session {projectId, locale}
  游戏接口->>游戏内核: createSession()
  游戏内核->>存储: 创建权威会话
  存储-->>游戏内核: sessionId / resumeToken
  游戏内核-->>游戏页: bootstrap payload
  游戏页-->>作者: SSR 可玩页 + 引导数据

  作者->>游戏接口: POST /api/game/session/:id/command
  游戏接口->>游戏内核: processCommand()
  游戏内核->>存储: 持久化命令结果
  游戏内核-->>游戏接口: deterministic outcome
  游戏接口-->>作者: 命令执行结果

  并行执行
    作者->>游戏接口: GET /api/game/session/:id/hud
    游戏接口->>游戏内核: 订阅 HUD 通道
    游戏内核-->>作者: SSE 事件流
  并行执行
    作者->>游戏接口: WS /api/game/session/:id/ws
    游戏接口->>游戏内核: 订阅 WS
    游戏内核-->>作者: 增量状态帧
  end

  作者->>游戏接口: POST /api/game/session/:id {sessionId,resumeToken}
  游戏接口->>游戏内核: restoreSession()
  游戏内核-->>作者: 恢复成功或 unauthorized
```

## 4) 请求生命周期与错误信封

```mermaid
flowchart LR
  请求[HTTP/WS/SSE 请求]
  上下文[requestContext 插件]
  本地化[i18n + locale]
  守卫[鉴权与上下文守卫]
  校验[类型化参数校验]
  领域[领域服务]
  成功[成功信封]
  失败[error-envelope]
  输出[SSR 文档/片段/JSON]

  请求 --> 上下文 --> 本地化 --> 守卫 --> 校验 --> 领域
  领域 --> 成功 --> 输出
  领域 --> 失败 --> 输出
  校验 --> 失败 --> 输出
```

## 5) 路由与契约清单

- 页面：`page-routes.ts`、`builder-routes.ts`、`game-routes.ts`、`api-routes.ts`
- 构建器 API：`/api/builder/*`（项目、场景、NPC、对话、任务、资产、AI 等）
- 游戏 API：`/api/game/session/*`、`/api/game/session/*/hud`、`/api/game/session/*/ws`
- AI API：`/api/builder/ai/*`

## 6) 数据模型与状态流

```mermaid
flowchart LR
  编辑器交互["Builder UI 交互"] --> builderAPI["builder-api.ts"]
  builderAPI --> builderSvc["builder-service.ts"]
  builderSvc --> db1["Prisma: builder 草稿/发布表"]
  db1 --> builderSvc --> builderAPI --> 编辑器交互

  玩家交互["Player 交互"] --> gameAPI["game-plugin.ts"]
  gameAPI --> gameLoop["game-loop.ts"]
  gameLoop --> db2["Prisma: 会话表"]
  gameLoop --> ws["WS/Broadcast"]
  gameLoop --> sse["SSE HUD"]
  ws --> 玩家交互
  sse --> 玩家交互
```

## 7) 持久化与权限边界

- `GameSession` 与会话关联数据是权威运行源，命令必须通过服务端命令通道。
- `publish` 快照是不可变引用；运行时不得回读草稿。
- 资产上传与 AI 知识索引分别记录在不同表组，避免运行时污染。
- 关键入口统一通过上下文/鉴权/签名逻辑，减少越权调用。

## 8) 安全硬化要点

- 拒绝路径注入：静态资源路径归一化与 mount 根目录前缀校验。
- 参数边界：所有 API 入口基于严格 schema 做类型检查。
- 会话恢复：token 一致性和会话状态有效性校验。
- AI 工具调用：provider 读取通过注册表路由，不直接信任未授权模型结果。
- 发布门禁：场景、NPC、对话、任务、资产完整性都必须通过校验。

## 9) 性能与可维护性

- SSR 优先可保证首屏可预测性和 SEO，减少初始化抖动。
- HTMX 做局部刷新，把复杂前端状态机下沉到服务端片段。
- WS 与 SSE 分离，HUD 与全量状态解耦。
- 所有业务模块保持「单一所有者」：路由只编排，领域服务持有写逻辑。

## 10) 常见故障排查

| 表现 | 可能原因 | 排查路径 |
| --- | --- | --- |
| Play 按钮未激活 | 发布校验未通过 | 打开验证报错，补齐场景/NPC/对话依赖 |
| 刷新后会话丢失 | 恢复令牌过期或 sessionId 错误 | 重新创建会话并更新 resumeToken |
| 命令无效 | 命令结构与类型约束不符 | 检查 `command` 合约与 locale/session 上下文 |
| HUD/SSE 断开 | 会话通道过期或 token 不匹配 | 重连会话，重新订阅 HUD endpoint |
| 浏览器显示未发布内容 | /game 拉取到了草稿 | 确认 getPublishedProject 命中发布快照 |

## 11) 你应持续运行的验证命令

- `bun run lint`
- `bun run typecheck`
- `bun test`
- `bun run verify`
- `bun run docs:check`

> 运行后再合并任何影响 `/api/builder/publish`、`/api/game/session/*` 的改动。

## 12) 文档迁移说明

本项目已将展示文档迁移至 `notes/doc-archive/*.txt`，当前文档是中文主说明文档，建议与 `ARCHITECTURE.txt` 配套阅读。
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
