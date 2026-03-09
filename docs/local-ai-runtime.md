# Local AI runtime

This document describes the local Transformers.js / ONNX runtime after the model-manager decomposition.

## Current shape

`src/domain/ai/model-manager.ts` remains the public facade, but its internal responsibilities are now split into focused modules.

```mermaid
flowchart TD
  Facade["model-manager.ts"]
  Runtime["local-model-runtime.ts"]
  Health["model-runtime-health.ts"]
  Cache["model-pipeline-cache.ts"]
  Loader["model-pipeline-loader.ts"]
  Runner["model-operation-runner.ts"]
  Contract["local-model-contract.ts"]
  Provider["providers/transformers-provider.ts"]

  Facade --> Runtime
  Facade --> Health
  Facade --> Cache
  Facade --> Loader
  Facade --> Runner
  Facade --> Contract
  Provider --> Facade
```

## Module responsibilities

| Module | Responsibility |
| --- | --- |
| `model-manager.ts` | Public singleton facade and operation entrypoints |
| `local-model-runtime.ts` | Shared facade types and runtime contract |
| `model-runtime-health.ts` | Warmup state, failure thresholds, circuit-open cooldown |
| `model-pipeline-cache.ts` | In-memory pipeline reuse and ownership |
| `model-pipeline-loader.ts` | Pipeline construction, cache recovery, registry resolution |
| `model-operation-runner.ts` | Timeout wrapping, validation, error normalization, logging |
| `local-model-contract.ts` | Typed local result and failure contracts |
| `transformers-provider.ts` | Stable `AiProvider` adapter over typed local results |

## Local runtime result model

All local operations return typed results instead of `null`-or-throw control flow internally.

```mermaid
flowchart LR
  Operation["Local model operation"] --> Result{"Result"}
  Result -->|ok| Success["Typed value"]
  Result -->|failure| Failure["LocalModelFailure"]
  Failure --> Code["Failure code"]
```

### Failure codes

| Code | Meaning |
| --- | --- |
| `timeout` | Operation exceeded the configured runtime budget |
| `circuit-open` | Runtime health blocked execution after repeated failures |
| `cache-corruption-recovered` | Cache corruption required purge/recovery |
| `unavailable` | Model lane disabled or pipeline unavailable |
| `invalid-output` | Pipeline responded with an unusable payload |
| `unexpected` | Unclassified runtime failure |

## Supported operation families

- sentiment classification
- text generation
- embeddings
- speech-to-text
- text-to-speech

Each family keeps the same external provider-facing behavior, but the internal manager now uses one typed failure language.

## Design rules

- Pipelines are lazy-loaded.
- Pipeline instances are cached and reused.
- Operation execution is wrapped once through the runner.
- Health state is managed separately from pipeline loading.
- Provider adaptation happens in `transformers-provider.ts`, not in route handlers.

## Adapter boundary

`transformers-provider.ts` still implements the existing `AiProvider` interface. It is responsible for translating typed local results back into:

- `AiGenerationResult`
- `AiClassificationResult`
- `AiTranscriptionResult`
- `AiSpeechSynthesisResult`
- `Float32Array | null` for embeddings

This preserves the public provider registry contract while allowing the local runtime to use stricter typed semantics internally.

## Operational guidance

The current structure follows the same recommended pattern used in current Transformers.js documentation:

- singleton or cached pipeline instances
- lazy construction on first use
- no route-level model ownership

That keeps expensive model setup isolated and reusable without introducing route-specific shortcuts.
