# TEA 文档索引（中文）

本文是当前文档合集的入口（无 `.md` 依赖）。

## 核心文档

| 文档 | 用途 |
| --- | --- |
| [README（英文）](notes/doc-archive/README.txt) | 项目总览、栈边界和核心工作流 |
| [README（中文）](notes/doc-archive/README.zh-CN.txt) | 本文档的中文版本 |
| [架构说明（英文）](notes/doc-archive/ARCHITECTURE.txt) | 拓扑、边界与数据流 |
| [架构说明（中文）](notes/doc-archive/ARCHITECTURE.zh-CN.txt) | 架构说明中文版本 |
| [运维手册（英文）](notes/doc-archive/docs__operator-runbook.txt) | 启动、验收、故障处理 |
| [运维手册（中文）](notes/doc-archive/docs__operator-runbook.zh-CN.txt) | 运维手册中文版本 |
| [API 与传输契约（英文）](notes/doc-archive/docs__api-contracts.txt) | HTTP / SSE / WebSocket 契约 |
| [API 与传输契约（中文）](notes/doc-archive/docs__api-contracts.zh-CN.txt) | API 契约中文版本 |
| [Builder 领域（英文）](notes/doc-archive/docs__builder-domain.txt) | Draft/Publish/发布流程 |
| [Builder 领域（中文）](notes/doc-archive/docs__builder-domain.zh-CN.txt) | 构建器领域中文版本 |

## 运行时文档

| 文档 | 用途 |
| --- | --- |
| [HTMX 扩展（英文）](notes/doc-archive/docs__htmx-extensions.txt) | 生命周期增强与共享扩展 |
| [HTMX 扩展（中文）](notes/doc-archive/docs__htmx-extensions.zh-CN.txt) | HTMX 扩展中文版本 |
| [Playable 运行时（英文）](notes/doc-archive/docs__playable-runtime.txt) | 浏览器端运行时与传输 |
| [Playable 运行时（中文）](notes/doc-archive/docs__playable-runtime.zh-CN.txt) | 可玩运行时中文版本 |
| [本地 AI 运行时（英文）](notes/doc-archive/docs__local-ai-runtime.txt) | AI provider 与本地模型 |
| [本地 AI 运行时（中文）](notes/doc-archive/docs__local-ai-runtime.zh-CN.txt) | 本地 AI 运行时中文版本 |
| [RMMZ 陪伴包（英文）](notes/doc-archive/docs__rmmz-pack.txt) | RPG Maker MZ 陪伴包说明 |
| [RMMZ 陪伴包（中文）](notes/doc-archive/docs__rmmz-pack.zh-CN.txt) | 陪伴包中文版本 |

## 陪伴包文档（英文）

| 文档 | 用途 |
| --- | --- |
| [LOTFK README（英文）](notes/doc-archive/LOTFK_RMMZ_Agentic_Pack__README.txt) | 插件清单与安装说明 |
| [LOTFK 插件规范（英文）](notes/doc-archive/LOTFK_RMMZ_Agentic_Pack__PLUGIN_SPEC.txt) | 插件参数、指令与数据模型 |
| [LOTFK 事件挂接（英文）](notes/doc-archive/LOTFK_RMMZ_Agentic_Pack__EVENT_HOOKUPS.txt) | 推荐事件脚本模板 |
| [LOTFK 状态（英文）](notes/doc-archive/LOTFK_RMMZ_Agentic_Pack__STATUS.txt) | 当前状态与维护规则 |

## 陪伴包文档（中文）

| 文档 | 用途 |
| --- | --- |
| [LOTFK README（中文）](notes/doc-archive/LOTFK_RMMZ_Agentic_Pack__README.zh-CN.txt) | 陪伴包中文说明 |
| [LOTFK 插件规范（中文）](notes/doc-archive/LOTFK_RMMZ_Agentic_Pack__PLUGIN_SPEC.zh-CN.txt) | 插件规范中文版本 |
| [LOTFK 事件挂接（中文）](notes/doc-archive/LOTFK_RMMZ_Agentic_Pack__EVENT_HOOKUPS.zh-CN.txt) | 事件脚本中文版本 |
| [LOTFK 状态（中文）](notes/doc-archive/LOTFK_RMMZ_Agentic_Pack__STATUS.zh-CN.txt) | 实施状态中文版本 |

## 阅读顺序

1. 先读 [README（中文）](notes/doc-archive/README.zh-CN.txt) 或 [README（英文）](notes/doc-archive/README.txt)。
2. 阅读 [架构说明（中文）](notes/doc-archive/ARCHITECTURE.zh-CN.txt) 或 [英文版](notes/doc-archive/ARCHITECTURE.txt)。
3. 阅读 API 与领域契约（`docs__api-contracts`, `docs__builder-domain`）后修改 API 或发布流程。
4. 阅读 `Builder` 运行时文档后修改创建/发布行为。
5. 阅读 playable + AI + HTMX 文档以覆盖前端与会话链路。
