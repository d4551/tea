# TEA —— Bun 原生游戏运行时 + Builder + AI 平台（中文）

<p align="center">
  <strong>基于 Bun、Elysia、HTMX 和 TypeScript strict 的 SSR-first 游戏内容创作与运行平台。</strong>
</p>

<p align="center">
  <a href="notes/doc-archive/README.txt">English</a>
  ·
  <a href="notes/doc-archive/README.zh-CN.txt">中文</a>
  ·
  <a href="notes/doc-archive/ARCHITECTURE.txt">Architecture</a>
  ·
  <a href="notes/doc-archive/docs__index.txt">Docs index</a>
  ·
  <a href="notes/doc-archive/docs__index.zh-CN.txt">中文文档索引</a>
</p>

> 此仓库通过文档归档文件（非 `.md`）作为唯一文档面，统一校验入口定义在 `notes/doc-archive/index.json`。

## 1) TEA 是什么，为什么这样设计

TEA 是一个单体 Bun 服务，拆分为四个可独立演进但可协同的领域：

- `Builder`：HTMX 增强的 SSR 页面中做内容编辑（草稿）。
- `Publish` 边界：校验草稿并生成不可变发布快照。
- `Game runtime`：从发布快照创建会话并提供实时更新。
- `AI services`：本地/Ollama/OpenAI 兼容提供商负责生成与检索。

关键规则：**运行态从不直接读取草稿**，每次玩法会话都只读发布快照。

## 2) 端到端运行模型

```mermaid
flowchart TB
  subgraph Browser["浏览器 surfaces"]
    B1["Home SSR"]
    B2["Builder SSR + HTMX"]
    B3["Playable SSR"]
    B4["WS + HUD SSE + command POST"]
  end

  subgraph AppKernel["src/app.ts 组合层"]
    K1["requestContext plugin"]
    K2["i18n + locale plugin"]
    K3["error-handler"]
    K4["staticAssets plugin"]
    K5["swagger + session/creator/ai plugins"]
  end

  subgraph RouteSurfaces["Route layer"]
    R1["page-routes.ts"]
    R2["builder-routes.ts"]
    R3["builder-api.ts"]
    R4["game-routes.ts"]
    R5["game-plugin.ts"]
    R6["api-routes.ts"]
    R7["ai-routes.ts"]
  end

  subgraph DomainCore["Domain layer"]
    D1["builder-service.ts"]
    D2["game-loop.ts"]
    D3["builder-publish-validation.ts"]
    D4["provider-registry.ts"]
    D5["knowledge-base-service.ts"]
    D6["oracle-service.ts"]
    D7["creator-worker.ts"]
  end

  subgraph Persistence["存储与资产"]
    S1["Prisma + SQLite"]
    S2["uploads + builder artifacts"]
    S3["public static output"]
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
  R7 --> D4
  R7 --> D5
  R6 --> D6
  R6 --> D7
  R1 --> K5

  D1 --> S1
  D2 --> S1
  D1 --> S2
  D3 --> S1
  D2 --> S2
  D4 --> S3
  D5 --> S1
```

## 3) 完整建造到游玩流程（UI 端到端）

```mermaid
sequenceDiagram
  autonumber
  actor User
  participant BuilderUI as /builder 页面
  participant BuilderAPI as /api/builder
  participant BuilderSvc as builderService
  participant PublishVal as publish 校验
  participant Store as Prisma
  participant GameRoute as /game
  participant GameAPI as game-plugin.ts
  participant GameLoop as game-loop.ts
  participant HUD as HUD SSE

  User->>BuilderUI: 打开 /builder?projectId=hero-fort
  BuilderUI->>BuilderAPI: GET /builder shell + 草稿
  BuilderAPI->>BuilderSvc: getProject(projectId)
  BuilderSvc->>Store: 查询草稿及关系
  Store-->>BuilderSvc: scenes / npcs / dialogue / quests / assets
  BuilderSvc-->>BuilderAPI: typed 草稿模型
  BuilderAPI-->>BuilderUI: SSR builder shell + HTMX tabs

  User->>BuilderAPI: POST /api/builder/projects 创建草稿
  BuilderAPI-->>BuilderAPI: 清理 redirectPath + 参数校验
  BuilderAPI->>BuilderSvc: createProject()
  BuilderSvc->>Store: 写入初始草稿
  Store-->>BuilderSvc: draftId + defaults
  BuilderSvc-->>BuilderAPI: created project
  BuilderAPI-->>BuilderUI: HX-Redirect /builder?projectId=<id>

  User->>BuilderUI: 编辑 scenes/dialogue/quests/automation
  BuilderUI->>BuilderAPI: patch 接口
  BuilderAPI->>BuilderSvc: updateProjectDraft()
  BuilderSvc->>Store: 版本化持久化

  User->>BuilderUI: 点击 Publish
  BuilderUI->>BuilderAPI: PATCH /api/builder/projects/:id/publish
  BuilderAPI->>BuilderSvc: publishProject(true)
  BuilderSvc->>PublishVal: validateBuilderProjectForPublish()
  PublishVal-->>BuilderSvc: issues 或 OK
  alt 通过
    BuilderSvc->>Store: 生成不可变发布快照
    Store-->>BuilderSvc: snapshot + releaseVersion
    BuilderSvc-->>BuilderAPI: published=true
    BuilderAPI-->>BuilderUI: 更新可试玩页面
  else 失败
    BuilderSvc-->>BuilderAPI: issue list
    BuilderAPI-->>BuilderUI: validation fragment
  end

  User->>GameRoute: 打开 /game?projectId=<id>
  GameRoute->>BuilderSvc: getPublishedProject(projectId)
  BuilderSvc-->>GameRoute: 快照 + bootstrap 元数据
  GameRoute->>GameAPI: POST /api/game/session {projectId, locale}
  GameAPI->>GameLoop: createSession()
  GameLoop->>Store: 建立会话与 resumeToken
  GameLoop-->>GameRoute: bootstrap payload
  GameRoute-->>User: SSR 页面 + initial state

  User->>GameAPI: POST /api/game/session/:id/command
  GameAPI->>GameLoop: processCommand()
  GameLoop->>Store: 持久化转移
  GameLoop-->>GameAPI: deterministic outcome
  GameAPI-->>User: 状态结果 + 下一步提示

  par
    User->>GameAPI: GET /api/game/session/:id/hud
    GameAPI->>GameLoop: subscribe HUD
    GameLoop-->>User: SSE stream
  and
    User->>GameAPI: WS /api/game/session/:id/ws
    GameAPI->>GameLoop: subscribe WS
    GameLoop-->>User: 实时状态帧
  end
```

## 4) 请求生命周期与错误信封

```mermaid
flowchart LR
  Req[HTTP/WS/SSE 请求]
  Ctx[requestContextPlugin]
  Locale[i18n + locale]
  Guard[鉴权/会话守卫]
  Validate[schema 验证]
  Domain[领域服务]
  Success[成功信封]
  Failure[error-envelope]
  Resp[SSR 文档/片段/JSON]

  Req --> Ctx --> Locale --> Guard --> Validate --> Domain
  Domain --> Success --> Resp
  Validate --> Failure --> Resp
  Domain --> Failure --> Resp
```

## 5) 路由与契约清单（当前）

- `src/routes/page-routes.ts`: SSR 导航与外壳。
- `src/routes/builder-routes.ts`: Builder 布局与入口。
- `src/routes/game-routes.ts`: Playable 页面与 bootstrap。
- `src/shared/contracts/*`: 统一契约定义。

## 6) 状态机（UI 层统一）

```mermaid
stateDiagram-v2
  [*] --> idle
  idle --> loading
  loading --> success: 成功响应
  loading --> errorRetryable: 可重试错误
  loading --> errorNonRetryable: 校验 / 鉴权
  success --> commandPending: 命令发起
  commandPending --> loading: 持续监听结果
  success --> empty: 无可玩发布
  success --> authorized: 成功发布
  authorized --> unauthorized: 登录失效
  errorRetryable --> loading: 重试
  errorNonRetryable --> idle
  unauthorized --> [*]
```

## 7) 运行与文档要求

- `bun run docs:check`：验证档案完整。
- `bun run verify`：发布前关键门禁。
- `bun run dependency:drift`：依赖策略检查。
- `bun run lint`、`bun run typecheck`、`bun test`：接口与运行时边界检测。
- `bun run docs:check` 与 `bun run verify` 不要求任何 `.md` 存在。

## 8) 后续改进建议

- 在 UI 端保持“创建→发布→游玩”每个步骤的可恢复状态可视化。
- 增强 `/api/game` 恢复边界用例。
- 继续扩展 `docs__playable-runtime` 与 `docs__local-ai-runtime` 的数据流场景。
