# TEA documentation index

Use this page as the entrypoint for the current documentation set.  
English and Chinese versions are available for all canonical documents.

## Core docs

| Document | Purpose |
| --- | --- |
| [Platform explainer](./platform-explainer.md) | Guided overview in English, Chinese, and Explain Like I'm 5 language with Mermaid charts |
| [README](notes/doc-archive/README.txt) | Top-level product, stack, workflow, and contributor rules |
| [README (Chinese)](notes/doc-archive/README.zh-CN.txt) | 顶层产品、技术栈、工作流与贡献规则 |
| [Architecture](notes/doc-archive/ARCHITECTURE.txt) | Runtime topology, ownership boundaries, state models, and transport surfaces |
| [Architecture (Chinese)](notes/doc-archive/ARCHITECTURE.zh-CN.txt) | 运行时拓扑、所有权边界、状态模型和传输面 |
| [Operator runbook](notes/doc-archive/docs__operator-runbook.txt) | Bootstrap, readiness, verification, drift checks, and triage workflows |
| [Operator runbook (Chinese)](notes/doc-archive/docs__operator-runbook.zh-CN.txt) | 启动、就绪、校验与故障处置流程 |
| [API and transport contracts](notes/doc-archive/docs__api-contracts.txt) | Current HTTP, SSE, and WebSocket contract surface map |
| [API and transport contracts (Chinese)](notes/doc-archive/docs__api-contracts.zh-CN.txt) | HTTP/SSE/WS 契约和错误路由映射 |
| [Builder domain](notes/doc-archive/docs__builder-domain.txt) | Draft, publish, release, and runtime seeding rules |
| [Builder domain (Chinese)](notes/doc-archive/docs__builder-domain.zh-CN.txt) | 草稿、发布、发布物和运行时注入规则 |
| [Platform gap audit](notes/doc-archive/docs__platform-gap-audit.txt) | Scope audit and web-native benchmark for platform IA, editor layout, and AI gaps |
| [Platform gap audit (Chinese)](notes/doc-archive/docs__platform-gap-audit.zh-CN.txt) | 平台作用域审计与 Web 原生引擎对标 |
| [Full gap inventory audit](./full-gap-inventory-audit.md) | Comprehensive findings on dead-end UI, masked no-ops, optimistic checks, and partial contracts |
| [Full gap remediation batches](./full-gap-remediation-batches.md) | Batch implementation plan to close those gap findings by risk and dependency order |

## Runtime docs

| Document | Purpose |
| --- | --- |
| [HTMX extensions](notes/doc-archive/docs__htmx-extensions.txt) | Shared HTMX lifecycle ownership and extension contracts |
| [HTMX extensions (Chinese)](notes/doc-archive/docs__htmx-extensions.zh-CN.txt) | HTMX 生命周期与共享扩展契约 |
| [Playable runtime](notes/doc-archive/docs__playable-runtime.txt) | Browser runtime decomposition, connection model, and bootstrap rules |
| [Playable runtime (Chinese)](notes/doc-archive/docs__playable-runtime.zh-CN.txt) | 可玩客户端分层、连接与 bootstrap 规则 |
| [Local AI runtime](notes/doc-archive/docs__local-ai-runtime.txt) | Local model runtime decomposition, typed result model, and provider adaptation rules |
| [Local AI runtime (Chinese)](notes/doc-archive/docs__local-ai-runtime.zh-CN.txt) | 本地 AI 运行时、类型结果与 Provider 适配 |
| [RMMZ companion pack](notes/doc-archive/docs__rmmz-pack.txt) | Status and maintenance contract for RPG Maker MZ companion pack |
| [RMMZ companion pack (Chinese)](notes/doc-archive/docs__rmmz-pack.zh-CN.txt) | RPG Maker MZ 陪伴包说明 |
| [Context7 audit](notes/doc-archive/docs__context7-audit.txt) | Context7 MCP integration and doc coverage for Pixi.js, Three.js, Transformers, Playwright, Biome |

## Pack docs

| Document | Purpose |
| --- | --- |
| [LOTFK README](notes/doc-archive/LOTFK_RMMZ_Agentic_Pack__README.txt) | Overview and installation for companion plugins |
| [LOTFK README (Chinese)](notes/doc-archive/LOTFK_RMMZ_Agentic_Pack__README.zh-CN.txt) | 陪伴包总览与安装说明 |
| [LOTFK plugin spec](notes/doc-archive/LOTFK_RMMZ_Agentic_Pack__PLUGIN_SPEC.txt) | Canonical plugin command and data model contract |
| [LOTFK plugin spec (Chinese)](notes/doc-archive/LOTFK_RMMZ_Agentic_Pack__PLUGIN_SPEC.zh-CN.txt) | 插件命令与数据模型约定 |
| [LOTFK event hookups](notes/doc-archive/LOTFK_RMMZ_Agentic_Pack__EVENT_HOOKUPS.txt) | Event wiring for RPG Maker editor integration |
| [LOTFK event hookups (Chinese)](notes/doc-archive/LOTFK_RMMZ_Agentic_Pack__EVENT_HOOKUPS.zh-CN.txt) | RPG Maker 事件挂接建议 |
| [LOTFK status](notes/doc-archive/LOTFK_RMMZ_Agentic_Pack__STATUS.txt) | Status and maintenance contract |
| [LOTFK status (Chinese)](notes/doc-archive/LOTFK_RMMZ_Agentic_Pack__STATUS.zh-CN.txt) | 状态与维护规则 |

## Reading order

1. Start with the [Platform explainer](./platform-explainer.md) if you want the shortest guided overview first.
2. Continue with [README](notes/doc-archive/README.txt) or [README (Chinese)](notes/doc-archive/README.zh-CN.txt).
3. Read [Architecture](notes/doc-archive/ARCHITECTURE.txt) or [Architecture (Chinese)](notes/doc-archive/ARCHITECTURE.zh-CN.txt) for system boundaries.
4. Review [API and transport contracts](notes/doc-archive/docs__api-contracts.txt) and [Builder domain](notes/doc-archive/docs__builder-domain.txt) before touching route or publish behavior.
5. Read [Platform gap audit](notes/doc-archive/docs__platform-gap-audit.txt) when changing ownership scope, workspace IA, shared assets, or AI governance.
6. Review [Full gap inventory audit](./full-gap-inventory-audit.md) and [Full gap remediation batches](./full-gap-remediation-batches.md) before extending builder authoring controls, automation review, or new AI patches.
7. Use runbook docs before routine operations and troubleshooting.
8. Use runtime-specific docs when changing HTMX, playable, AI, or companion pack behavior.
