# HTMX 生命周期与扩展架构

本文定义 TEA 全局 HTMX 增强行为的所有权与契约。

## 1) 为什么要集中化扩展

集中化可避免在不同页面重复实现加载态、焦点、校验反馈和 Toast 行为，保证跨路由行为一致。

- 单一实现忙态与焦点恢复逻辑。
- 统一 `422` 校验碎片替换策略。
- 统一错误提示与可访问性行为。
- 跨路由的一致性提升。

## 2) 生命周期所有权

```mermaid
flowchart LR
  subgraph Browser["浏览器事件"]
    Evt["htmx:* 事件流"]
  end

  subgraph Shared["共享扩展层"]
    L1["layout-controls"]
    L2["focus-panel"]
    L3["oracle-indicator"]
    L4["server-toast"]
  end

  subgraph Routes["路由面"]
    R1["page-routes.ts"]
    R2["builder-routes.ts"]
    R3["game-routes.ts"]
    R4["builder-api.ts"]
  end

  Evt --> L1
  Evt --> L2
  Evt --> L3
  Evt --> L4
  Evt --> L5

  L1 --> R1
  L1 --> R2
  L1 --> R3
  L1 --> R4
  L2 --> R2
  L2 --> R3
  L3 --> R1
  L4 --> R1
```

## 3) 事件到所有者映射

| 事件 | 负责人 | 动作 |
| --- | --- | --- |
| `htmx:configRequest` | `layout-controls` | 注入请求上下文/CSRF |
| `htmx:beforeRequest` | `layout-controls` | 开始忙态与追踪 |
| `htmx:afterRequest` | `layout-controls` | 清理忙态与基线 UI |
| `htmx:beforeSwap` | `layout-controls` | 只允许通过白名单片段 |
| `htmx:afterSwap` | `layout-controls`/`focus-panel` | 恢复拓扑和焦点 |
| `htmx:afterSettle` | `layout-controls` | 最终可访问性断言 |
| `htmx:sendError`/`responseError` | `layout-controls`/`server-toast` | 清理忙态并输出结构化提示 |
| `htmx:load` | `focus-panel` | 确保可访问焦点 |

## 4) 扩展契约

### 4.1 `layout-controls`

- 范围：站点外壳和全局 UX。
- 契约：
  - 每目标忙态计数；
  - 可预测的 `aria-expanded` 切换；
  - swap 后恢复焦点；
  - 主题持久化；
  - 校验片段保留。

### 4.2 `focus-panel`

- 范围：片段换入后的焦点。
- 契约：
  - 片段通过 `[data-focus-panel="true"]` 声明；
  - 在恢复前确认目标存在；
  - 回退焦点为 `#main-content`。

### 4.3 `oracle-indicator`

- 范围：Oracle 提交状态提示。
- 契约：
  - 发起前克隆服务端渲染的 loading 面板模板；
  - 完成后清理；
  - 面板结构仍由 `renderOraclePanel` 统一负责。

### 4.4 `server-toast`

- 范围：服务端信封转通知。
- 契约：
  - 统一容器；
  - 文案先本地化；
  - 一个渲染器、多个生产者。

## 5) 渐进增强规则

- 共享扩展已覆盖的行为，不应在路由再实现。
- 不在模板中重复请求/提交脚本。
- 优先使用 `hx-*` 属性。
- 路由脚本只写共享层未覆盖行为。

## 6) 数据流：Builder 校验

```mermaid
sequenceDiagram
  autonumber
  participant Form as builder 表单
  participant Layout as layout-controls
  participant API as /api/builder
  participant Focus as focus-panel

  Form->>Layout: hx-post 提交
  Layout->>Layout: 设置忙态
  Layout->>API: 分发请求
  API-->>Layout: 422 验证片段
  Layout->>Layout: 允许校验 swap
  Layout->>Focus: afterSettle 恢复焦点
  Focus-->>Form: 聚焦首个可操作项
  Layout-->>Form: 清理忙态并保留 toast
```

## 7) 数据流：HUD 流

```mermaid
flowchart LR
  S["/api/game/session/:id/hud"] --> C["SSE 消费者"]
  C --> P["服务端渲染 HUD 片段"]
  P --> A["layout-controls 无障碍同步"]
```

## 8) 可访问性

- swap 后保持键盘顺序。
- 短时状态使用 `aria-live`。
- 不将焦点移动到不可见节点。
- 焦点恢复必须基于可预期选择器。
