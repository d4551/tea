# TEA documentation index

Use this page as the entrypoint for the current documentation set.

## Core docs

| Document | Purpose |
| --- | --- |
| [README](/Users/brandondonnelly/Downloads/tea/README.md) | Top-level product, stack, workflow, and contributor rules |
| [README (Chinese)](/Users/brandondonnelly/Downloads/tea/README.zh-CN.md) | Chinese translation of the top-level product, stack, workflow, and contributor rules |
| [Architecture](/Users/brandondonnelly/Downloads/tea/ARCHITECTURE.md) | Runtime topology, ownership boundaries, state models, and transport surfaces |
| [Operator runbook](/Users/brandondonnelly/Downloads/tea/docs/operator-runbook.md) | Bootstrap, readiness, verification, drift checks, and triage workflows |
| [API and transport contracts](/Users/brandondonnelly/Downloads/tea/docs/api-contracts.md) | Current HTTP, SSE, websocket, and envelope surface map |
| [Builder domain](/Users/brandondonnelly/Downloads/tea/docs/builder-domain.md) | Draft, publish, release, and runtime seeding rules |

## Runtime docs

| Document | Purpose |
| --- | --- |
| [HTMX extensions](/Users/brandondonnelly/Downloads/tea/docs/htmx-extensions.md) | Shared HTMX lifecycle ownership and extension contracts |
| [Playable runtime](/Users/brandondonnelly/Downloads/tea/docs/playable-runtime.md) | Browser runtime decomposition, connection model, and bootstrap rules |
| [Local AI runtime](/Users/brandondonnelly/Downloads/tea/docs/local-ai-runtime.md) | Local model runtime decomposition, typed result model, and provider adaptation rules |
| [RMMZ companion pack](/Users/brandondonnelly/Downloads/tea/docs/rmmz-pack.md) | Status and maintenance contract for the repo’s RPG Maker MZ pack |

## Reading order

1. Start with [README](/Users/brandondonnelly/Downloads/tea/README.md) or [README (Chinese)](/Users/brandondonnelly/Downloads/tea/README.zh-CN.md).
2. Read [Architecture](/Users/brandondonnelly/Downloads/tea/ARCHITECTURE.md) for system boundaries.
3. Read [API and transport contracts](/Users/brandondonnelly/Downloads/tea/docs/api-contracts.md) and [Builder domain](/Users/brandondonnelly/Downloads/tea/docs/builder-domain.md) before changing route or publish behavior.
4. Use [Operator runbook](/Users/brandondonnelly/Downloads/tea/docs/operator-runbook.md) for day-to-day workflows.
5. Use the runtime-specific docs when changing HTMX, playable client, local AI, or the companion RMMZ pack.
