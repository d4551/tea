# API 与传输契约（扩展版）

本文档给出 TEA 所有公开接口（HTTP、SSE、WebSocket）的端到端契约图。

## 1) 统一信封

所有 JSON 响应都采用以下两种结构之一。

```ts
interface SuccessEnvelope<T> {
  ok: true;
  data: T;
}

interface ErrorEnvelope {
  ok: false;
  error: {
    code: string;
    message: string;
    retryable: boolean;
    correlationId: string;
  };
}
```

`correlationId` 由 `requestContext` 生成，用于日志追踪和跨接口复盘。

## 2) 契约拓扑图

```mermaid
flowchart TB
  subgraph Inbound["客户端入口"]
    B1["浏览器"]
    B2["运维工具"]
    B3["自动化作业"]
  end

  subgraph HTTP["HTTP 面"]
    A1["GET /api/health"]
    A2["POST /api/oracle"]
    A3["/api/ai/*"]
    A4["/api/builder/*"]
    A5["/api/game/session/*"]
    A6["GET /api/game/session/:id/state"]
  end

  subgraph Realtime["实时面"]
    R1["WS /api/game/session/:id/ws"]
    R2["SSE /api/game/session/:id/hud"]
  end

  B1 --> A1
  B1 --> A2
  B1 --> A3
  B1 --> A4
  B1 --> A5
  B1 --> A6
  B1 --> R1
  B1 --> R2
  B2 --> A1
  B2 --> A3
  B2 --> A4
  B2 --> A5
  B2 --> R1
  B3 --> A3
  B3 --> A4
  B3 --> A6
```

## 3) 请求生命周期与信封放置

```mermaid
sequenceDiagram
  autonumber
  participant C as 客户端
  participant R as 路由
  participant S as schema 边界
  participant D as 领域服务
  participant E as 信封映射器
  participant P as WS/SSE producer

  C->>R: 请求
  R->>S: 校验参数和 body
  alt schema 有效
    S->>D: 类型化 payload
    D-->>E: 类型化结果
    E-->>C: ok 响应
  else schema 无效
    S-->>E: 验证失败
    E-->>C: ok=false + 校验码
  else 运行时异常
    D-->>R: exception
    R->>E: 映射统一失败信封
    E-->>C: 归一化失败
  end
  Note over P: WS/SSE 由领域状态转移驱动输出
```

## 4) Surface 契约

### 4.1 健康与 oracle

- `GET /api/health`：就绪检查。
- `POST /api/oracle`：本地化问答入口。

### 4.2 游戏传输

| 方法 | 端点 | 契约 |
| --- | --- | --- |
| `POST` | `/api/game/session` | 创建权威会话 |
| `POST` | `/api/game/session/:id` | 使用 `resumeToken` 恢复 |
| `POST` | `/api/game/session/:id/command` | 命令信封 + 确定性状态机 |
| `POST` | `/api/game/session/:id/invite` | 发放邀请码 |
| `POST` | `/api/game/session/:id/join` | 应用邀请码 |
| `GET` | `/api/game/session/:id/state` | 轮询兜底状态 |
| `GET` | `/api/game/session/:id/hud` | SSE 事件 |
| `WS` | `/api/game/session/:id/ws` | 实时状态帧 |

### 4.3 Builder 家族

- `/api/builder/projects*` 仅处理可变草稿。
- scene/dialogue/asset/quest 端点只改写 builder 领域。
- `publish` 是受控状态迁移。
- AI/自动化 API 保持在项目上下文内，不可直接改 runtime session。

### 4.4 AI 家族

- `status/health/capabilities/catalog`：provider 健康与库存可见性。
- `knowledge/*`：检索与生成使用边界超时。
- `audio/*` 与 `generate/*`：provider 中介操作并返回标准错误信封。

## 5) 错误路由

```mermaid
flowchart TB
  EC["错误码"] --> R1{"retryable?"}
  R1 -->|是| M1["带退避重试"]
  R1 -->|否| R2{"鉴权问题?"}
  R2 -->|是| M2["重新登录 / 刷新会话"]
  R2 -->|否| R3{"校验问题?"}
  R3 -->|是| M3["用户更正输入"]
  R3 -->|否| R4{"会话上下文?"}
  R4 -->|是| M4["恢复路径"]
  R4 -->|否| M5["运维修复"]
```

## 6) 可靠性矩阵

- `auth/session`：硬失败，不重试。
- `validation`：硬失败，需修正输入。
- `provider transient`：provider 标记为可重试时再重试。
- `storage transient`：仅在幂等且成本可接受时重试。
- `publish` 校验：必须返回机器可读 issue 列表。

## 7) 安全与一致性

- 重定向和路径参数先 sanitize。
- 会话读取/写入都必须经过 token 拥有者校验。
- WS/SSE 生产前校验会话与通道身份。
- 不向客户端暴露内部 provider 原始码。

## 8) 前端状态机

```mermaid
stateDiagram-v2
  [*] --> idle
  idle --> loading: 打开页面/发起请求
  loading --> success: ok 信封
  loading --> retryableError: 可恢复失败
  loading --> nonRetryableError: 鉴权或校验失败
  retryableError --> loading: 重试
  success --> loading: 变更或刷新
  success --> restore: 恢复流程
  restore --> success: token 有效
  restore --> nonRetryableError: token 无效
  nonRetryableError --> [*]
```

## 9) 端到端命令数据流

```mermaid
sequenceDiagram
  autonumber
  actor User
  participant UI as /game 页面
  participant API as /api/game/session/:id/command
  participant Loop as game-loop
  participant Session as session store
  participant HUD as SSE endpoint
  participant WS as WS endpoint

  User->>UI: 发送命令
  UI->>API: POST envelope
  API->>Loop: processCommand()
  Loop->>Session: 持久化转移结果
  Loop-->>API: 命令信封 + 版本
  API-->>UI: 更新提示/状态
  Loop->>WS: 发布帧
  Loop->>HUD: 发布 HUD 增量
```

## 10) 验收建议

- 修改接口后先运行 `bun run docs:check`。
- 业务接口修改后补充/更新 `tests/` 中的契约测试。
- 变更传输行为时，验证 WS 与 SSE 命令链路。
