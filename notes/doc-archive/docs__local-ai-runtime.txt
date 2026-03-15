# Local AI runtime (providers, health, and failure contracts)

This document describes the local AI runtime path that isolates model operations from request routes.

## 1) Layer model

```mermaid
flowchart TB
  subgraph Entry["Request entry"]
    R1["/api/ai/* routes"]
  end

  subgraph AI["Domain"]
    D1["provider-registry.ts"]
    D2["creator-worker.ts"]
    D3["knowledge-base-service.ts"]
  end

  subgraph Local["Local runtime"]
    L1["model-manager.ts"]
    L2["local-model-runtime.ts"]
    L3["model-runtime-health.ts"]
    L4["model-pipeline-loader.ts"]
    L5["model-pipeline-cache.ts"]
    L6["model-operation-runner.ts"]
    L7["local-model-contract.ts"]
    L8["providers/transformers-provider.ts"]
  end

  subgraph Contracts["Contract surfaces"]
    C1["provider contracts"]
    C2["local result contracts"]
    C3["knowledge contracts"]
  end

  R1 --> D1 --> D2 --> L1
  D1 --> D3
  L1 --> L2 --> L3 --> L4 --> L5 --> L6 --> L7 --> L8
  L1 --> C1 --> D1
  D3 --> C3
```

## 2) Execution sequence

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

  Route->>Registry: resolve provider
  Registry->>Manager: execute operation
  Manager->>Health: check gate + health budget
  Health-->>Manager: ok / warnings
  Manager->>Loader: lazy load pipeline
  Loader->>Runner: run wrapped operation
  Runner->>Provider: run typed op
  Provider-->>Runner: typed provider result
  Runner-->>Manager: Result / Failure
  alt success
    Manager->>Route: normalized provider result
    Route->>Route: include in success envelope
  else failure
    Manager->>Route: typed failure with retryable flag
    Route->>Route: emit error envelope
  end
  Route->>DB: optionally enrich with retrieval context
```

## 3) Failure taxonomy

| Code | Meaning | Recovery |
| --- | --- | --- |
| `timeout` | operation exceeded budget | retry with backoff if transient |
| `circuit-open` | failure threshold reached | wait cooldown + reset |
| `cache-corruption-recovered` | pipeline cache repaired | one controlled retry |
| `unavailable` | provider disabled / config missing | operator reconfigure required |
| `invalid-output` | malformed provider output | retry once then fail with diagnostics |
| `unexpected` | unknown runtime failure | operator triage required |

## 4) Contract guarantees

- Routes receive only normalized typed contracts.
- Routes never consume raw provider responses.
- Health state and warmup are tracked separately from pipeline lifecycle.
- Pipeline cache is reused in process with explicit corruption recovery boundaries.

## 4.1) API-compatible vendor presets

- Local API-compatible routing defaults to `ramalama` and remains overrideable with `AI_LOCAL_API_COMPATIBLE_VENDOR`.
- Cloud API-compatible routing supports explicit presets for `openai`, `claude`, `deepseek`, `gemini`, `copilot`, and `custom` through `AI_CLOUD_API_COMPATIBLE_VENDOR`.
- Vendor presets own base URLs, endpoint paths, and required static headers so providers that do not expose plain OpenAI `/v1/models` surfaces can still route through the shared provider contract.
- Manual overrides still win for `AI_*_API_COMPATIBLE_BASE_URL`, `AI_*_API_COMPATIBLE_*_MODEL`, and provider labels when operators need a custom deployment.

## 5) Knowledge integration

- Documents/chunks are stored in AI tables and reused across retrieval flow.
- Retrieval-assisted generation includes deterministic truncation strategy and context windows.
- Search miss is not fatal unless business config marks it hard-required.

## 6) Latency, observability, and hardening

- Each operation emits timing and model/pipeline identifiers.
- Failures are mapped into one typed error envelope with `correlationId`.
- Health endpoint exposes warmup state, circuit state, and recent failure counters.
- Timeouts are bounded and logged for operator action.

## 7) Dataflow map

```mermaid
flowchart LR
  subgraph "AI APIs"
    A["/api/ai/..."]
  end
  subgraph "Route guard"
    G["schema + auth + timeout"]
  end
  subgraph "Domain"
    R["provider registry"]
    W["creator worker"]
  end
  subgraph "Runtime"
    M["model-manager + pipeline"]
  end
  subgraph "Store"
    K["knowledge + request traces"]
  end
  A --> G --> R --> W --> M
  M --> K
```

## 8) Recommended tests

- Failure-mode tests for each typed failure code.
- Circuit-open and recovery tests.
- Cache corruption recovery path smoke.
- Timeout and unknown provider fallback tests.
