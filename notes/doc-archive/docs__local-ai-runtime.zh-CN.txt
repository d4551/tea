# 本地 AI 运行时（providers、健康与失败契约）

该文档描述将模型执行与路由解耦的本地 AI 执行路径。

## 1) 分层模型

```mermaid
flowchart TB
  subgraph Entry["请求入口"]
    R["/api/ai/*"]
  end

  subgraph AI["AI 领域"]
    D1["provider-registry.ts"]
    D2["creator-worker.ts"]
    D3["knowledge-base-service.ts"]
  end

  subgraph Local["本地运行层"]
    L1["model-manager.ts"]
    L2["local-model-runtime.ts"]
    L3["model-runtime-health.ts"]
    L4["model-pipeline-loader.ts"]
    L5["model-pipeline-cache.ts"]
    L6["model-operation-runner.ts"]
    L7["local-model-contract.ts"]
    L8["providers/transformers-provider.ts"]
  end

  subgraph Contracts["共享契约"]
    C1["provider 契约"]
    C2["本地结果契约"]
    C3["知识契约"]
  end

  R --> D1 --> D2 --> L1
  D1 --> D3
  L1 --> L2 --> L3 --> L4 --> L5 --> L6 --> L7 --> L8
  L1 --> C1 --> D1
  D3 --> C3
```

## 2) 执行序列

```mermaid
sequenceDiagram
  autonumber
  participant Route as /api/ai/*
  participant Registry as provider-registry
  participant Worker as creator-worker
  participant Manager as model-manager
  participant Health as model-runtime-health
  participant Loader as pipeline-loader
  participant Runner as operation-runner
  participant Provider as transformers-provider
  participant DB as knowledge tables

  Route->>Registry: 解析 provider
  Registry->>Manager: 执行 operation
  Manager->>Health: 检查健康与 budget
  Health-->>Manager: ok/警告
  Manager->>Loader: 惰性加载 pipeline
  Loader->>Runner: 包裹并执行 operation
  Runner->>Provider: 执行 typed op
  Provider-->>Runner: typed 结果
  Runner-->>Manager: 成功或失败
  alt success
    Manager->>Route: 标准化 provider 结果
  else failure
    Manager->>Route: 失败 + retryable 标志
  end
  Route->>DB: 必要时补充检索上下文
```

## 3) 失败分类

| Code | 含义 | 处理 |
| --- | --- | --- |
| `timeout` | 超时 | 可重试，遵守退避 |
| `circuit-open` | 熔断打开 | 等待 cooldown 后重置 |
| `cache-corruption-recovered` | 缓存错误修复后继续 | 重试一次 |
| `unavailable` | provider 不可用或配置缺失 | 需运维重配 |
| `invalid-output` | provider 输出非法 | 重试一次后反馈诊断 |
| `unexpected` | 未知异常 | 运维介入 |

## 4) 契约保证

- 路由只接收标准化 typed 合约，不处理原始输出。
- 健康与 warmup 与 pipeline 生命周期分离。
- 缓存按进程内复用，带有自愈界限。

## 5) 检索整合

- 文档/片段保存在 AI 表中用于检索。
- 检索增强生成应有确定性上下文窗口与截断策略。
- 检索 miss 不应导致硬失败，除非配置要求。

## 6) 可观测性

- 所有 operation 记录耗时和模型 ID。
- 失败统一写入 error envelope，并带 `correlationId`。
- 健康接口返回 warmup、circuit、失败计数。
