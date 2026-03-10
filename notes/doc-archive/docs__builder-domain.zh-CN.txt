# Builder 领域（完整作者模型与约束）

Builder 领域用于可变草稿编辑，与运行时的不可变快照消费严格隔离。

## 1) 核心不变式

1. **草稿可改，发布不可改。**
2. **所有 builder 写入经 `builder-service` 统一路由。**
3. **发布是受控状态迁移，不是直接数据库写入。**
4. **运行时只从已发布快照种子化。**
5. **AI 与自动化只在项目作用域内执行。**

## 2) 状态与所有权地图

```mermaid
flowchart LR
  subgraph UI["构建界面"]
    U1["/builder SSR 页面"]
    U2["builder-api 端点"]
    U3["AI + automation"]
  end

  subgraph Domain["领域服务"]
    D1["builder-service.ts"]
    D2["builder-project-state-store.ts"]
    D3["builder-publish-validation.ts"]
    D4["creator-worker.ts"]
    D5["provider-registry.ts"]
  end

  subgraph Storage["持久化"]
    S1["ProjectDraft"]
    S2["ProjectPublished"]
    S3["资源与场景节点"]
    S4["Automation 工件"]
  end

  U1 --> U2
  U2 --> D1
  U2 --> U3
  U3 --> D5 --> D1
  D1 --> D2 --> S1
  D1 --> D3 --> S2
  D2 --> S3
  D2 --> S4
```

## 3) 作者生命周期

```mermaid
sequenceDiagram
  autonumber
  actor Author
  participant UI as /builder
  participant API as /api/builder/*
  participant Svc as builder-service
  participant Store as builder-project-state-store
  participant Val as publish validation
  participant AI as /api/ai + provider registry
  participant Worker as creator-worker

  Author->>UI: 打开项目
  UI->>API: 加载草稿
  API->>Svc: getProject(projectId)
  Svc->>Store: 读取草稿与关系
  Store-->>Svc: scenes/dialogue/npcs/assets/quests 图
  Svc-->>API: 已校验 Draft 模型
  API-->>UI: SSR shell + HTMX tabs

  Author->>UI: 修改场景/对话/任务/资产
  UI->>API: patch 端点
  API->>Svc: updateProjectDraft()
  Svc->>Store: 版本化持久化
  Store-->>Svc: saved version
  Svc-->>API: 写入结果契约
  API-->>UI: 片段化状态回显

  Author->>UI: 触发 AI 生成
  UI->>API: 请求生成
  API->>AI: 生成计划
  AI->>Worker: 执行受限任务
  Worker->>Store: 持久化工件与诊断
  Worker-->>Svc: 结果 + 风险标签
  Svc-->>API: 生成补丁/待审列表
  API-->>UI: 生成片段与应用选项

  Author->>UI: 点击发布
  UI->>API: PATCH /api/builder/projects/:id/publish
  API->>Svc: publishProject(true)
  Svc->>Val: validateBuilderProjectForPublish()
  Val-->>Svc: pass 或 issues
  alt 校验通过
    Svc->>Store: 生成不可变快照
    Store-->>Svc: releaseVersion
    Svc-->>API: 发布指针
    API-->>UI: 允许 Play
  else 校验失败
    Svc-->>API: issues
    API-->>UI: 校验片段
  end
```

## 4) 领域边界与负责人

| 区域 | 负责人 | 职责 |
| --- | --- | --- |
| 核心编排 | `builder-service.ts` | create/read/update/publish 语义 |
| 草稿持久化 | `builder-project-state-store.ts` | 正规化、版本化写入 |
| 发布门禁 | `builder-publish-validation.ts` | 场景/NPC/对话/资产一致性 |
| 自动化执行 | `creator-worker.ts` | 生成任务与诊断 |
| Provider 选路 | `provider-registry.ts` | AI/检索路由 |
| 路由适配 | `builder-api.ts` | schema、信封、视图转换 |

## 5) 发布状态机

```mermaid
stateDiagram-v2
  [*] --> Draft
  Draft --> Validating: 点击 publish
  Validating --> ValidationFailed: 检查失败
  Validating --> Snapshotting: 检查通过
  Snapshotting --> Published: 创建不可变快照
  Snapshotting --> Draft: 持久化失败回退
  Published --> Unpublished: 取消发布
  Unpublished --> Published: 重新发布
  ValidationFailed --> Draft: 修复问题后返回
```

发布至少要满足：

- 元数据与 locale 一致性。
- 场景图完整、起始场景存在。
- NPC 与对话引用可解析。
- 至少有一个可运行入口供引导。
- 资源路径规范且可用。
- 触发器/动作 schema 有效。

## 6) 数据面图

```mermaid
flowchart TD
  subgraph Draft["草稿数据"]
    PD["ProjectDraft"]
    SC["Scenes + Nodes"]
    NPC["NPC + Dialogue"]
    Q["Quests + Automation"]
    AS["Assets + 上传元信息"]
  end

  subgraph Release["发布数据"]
    PP["ProjectPublished"]
    SNAP["Snapshot + 版本"]
    IDX["Snapshot index"]
  end

  subgraph Runtime["运行数据"]
    RTS["game-loop 种子"]
    SE["GameSession"]
  end

  PD --> SC --> PP --> SNAP --> IDX --> RTS --> SE
  NPC --> PP
  Q --> PP
  AS --> PP
```

## 7) 契约与韧性

- Builder 接口必须始终返回统一信封（含 HTMX fragment 路径）。
- 变更失败按 `validation`、`storage`、`authorization` 分类。
- 发布应支持幂等重试。
- 生成工件需带来源、时间戳、追踪 ID 以便复核。

## 8) 一线责任边界

- 路由只处理边界适配。
- 领域服务持有写入语义和验证。
- 持久化模块持有关系遍历与耐久保障。
- 自动化/AI 模块只返回 typed 结果，不直接改动会话状态。

## 9) 运行建议

- 调整 Builder 流程前，优先阅读本文件与 `docs__api-contracts`。
- 与发布相关改动必须跑 `bun run verify`。
