# 可玩运行时（浏览器端权威运行栈）

本文件定义消费 `/game` 引导数据和会话传输的浏览器客户端契约。

## 1) 运行时分层与所有权

```mermaid
flowchart TB
  subgraph BrowserEntry["浏览器入口"]
    BE["game-client.ts"]
  end

  subgraph Session["会话编排"]
    BS["game-client-bootstrap-session.ts"]
    IN["game-client-input.ts"]
    TP["game-client-transport.ts"]
  end

  subgraph Render["渲染管线"]
    RN["game-client-renderer.ts"]
    TY["game-client-types.ts"]
  end

  subgraph Contracts["共享契约"]
    C1["shared/contracts/game-client-bootstrap.ts"]
    C2["shared/contracts/game.ts"]
  end

  BE --> BS --> C1
  BE --> IN --> C2
  BE --> TP --> C2
  BE --> RN --> TY
```

## 2) 页面到实时状态的链路

```mermaid
sequenceDiagram
  autonumber
  participant Page as /game SSR
  participant API as /api/game/session
  participant Bootstrap as game-client-bootstrap-session
  participant Transport as game-client-transport
  participant Renderer as game-client-renderer
  participant Persist as 本地持久化

  Page->>Bootstrap: 注入 bootstrap payload
  Bootstrap->>Bootstrap: 解析并校验
  Bootstrap->>Persist: 持久化会话元数据
  Bootstrap-->>Transport: 启动会话上下文
  Transport->>Transport: 打开 WS /api/game/session/:id/ws
  Transport-->>Renderer: 初始 state + frame contract
  Renderer->>Page: 画布、镜头、场景启动
  Page->>IN: 输入事件
  IN->>Transport: POST /api/game/session/:id/command
  Transport->>Transport: 应用结果
  Transport-->>Renderer: 插值帧 + HUD 更新
```

## 3) 传输契约

### 3.1 bootstrap 数据

- 由 `game` 路由创建并在 `game-client-bootstrap-session.ts` 校验。
- 必需字段：
  - `sessionId`, `resumeToken`, `projectId`
  - 快照元信息（版本、flags）
  - 渲染配置（viewport、frame/reconnect 预算）
  - 指令默认参数（`commandCooldownMs`, `commandTimeoutMs`）

### 3.2 命令循环

- UI 发送命令到 `POST /api/game/session/:id/command`。
- 响应是 authoritative；前端可展示 pending，但不得提前确认。
- 重试安全：
  - 超时转入恢复流程；
  - 每帧保留未发送队列。

### 3.3 恢复与重连

```mermaid
flowchart LR
  C1["断开"] --> C2["resumeToken 恢复"]
  C2 -->|成功| C3["恢复流"]
  C2 -->|token 缺失| C4["过期/无效"]
  C2 -->|重试超限| C5["需新建会话"]
  C3 --> C6["UI 恢复"]
  C4 --> C7["重建会话引导"]
  C5 --> C7
```

## 4) 渲染规则

- 渲染器只持有画布生命周期和场景插值。
- 传输层外部提供标准化帧数据。
- 重解析与 schema 校验不应进入高频渲染循环。
- 页面尺寸与可见性转移属于渲染器状态，不是传输状态。

## 5) 可玩页状态机

```mermaid
stateDiagram-v2
  [*] --> bootstrapMissing
  bootstrapMissing --> bootstrapParseError: 解析失败
  bootstrapMissing --> connecting: bootstrap 有效
  connecting --> connected: WS 打开且首帧到达
  connecting --> reconnecting: 可重试 WS 失败
  connected --> reconnecting: 网络断开
  connected --> commandPending: 命令发起
  commandPending --> connected: 收到响应
  reconnecting --> connected: 恢复成功
  reconnecting --> restoreExpired: 恢复失败
  restoreExpired --> terminalError: 需新会话
  terminalError --> [*]
```

## 6) 安全与反作弊

- 客户端不直接写任何权威状态。
- 观战/访客权限在发送命令前过滤。
- 恢复流程要求 session 与 `resumeToken` 同时有效。
- 回退帧通过 server 版本号与 envelope 进行裁决。

## 7) 性能与可靠性

- 画面帧率应受传输节奏约束，避免无限加速。
- 命令负载保持紧凑且类型化，减少网络抖动。
- WS 负责主状态帧；HUD SSE 提供低频叠加层更新。

## 8) 验收项

- bootstrap 解析与命令转换测试。
- WS 重连和恢复测试覆盖。
- locale/render 配置变更下的 bootstrap 兼容测试。
- 回放与观众权限约束测试。

## 9) 失败图

```mermaid
flowchart TB
  T1["命令超时"] -->|可重试| T2["恢复尝试"]
  T1 -->|不可重试| T3["终态错误"]
  T2 -->|token 有效| T4["恢复成功"]
  T2 -->|token 无效| T3
```

## 10) 流程总图

```mermaid
flowchart LR
  subgraph Client["客户端"]
    A["Page"]
    B["Transport"]
    C["Renderer"]
  end
  subgraph Server["服务端"]
    D["game-plugin.ts"]
    E["game-loop.ts"]
    F["Prisma sessions"]
  end
  A --> B --> D --> E --> F --> E --> C
```
