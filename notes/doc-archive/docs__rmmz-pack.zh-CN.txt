# RPG Maker MZ 陪伴包文档

本文件用于管理 `LOTFK_RMMZ_Agentic_Pack` 的伴随交付说明。

## 1) 目标与职责

- 该包不在 TypeScript 编译路径内，但仍是仓库可交付资产的一部分。
- 文档与插件文件必须保持一致。
- 任何伴随包变更都应同步更新：
  - `LOTFK_RMMZ_Agentic_Pack__README*.txt`
  - `LOTFK_RMMZ_Agentic_Pack__PLUGIN_SPEC*.txt`
  - `LOTFK_RMMZ_Agentic_Pack__EVENT_HOOKUPS*.txt`
  - 本文档与 `docs__index*`

## 2) 资产地图

```mermaid
flowchart LR
  Repo["TEA 仓库"]
  App["Bun/Elysia 应用"]
  Pack["LOTFK_RMMZ_Agentic_Pack"]
  Plugins["plugins/*.js"]
  Docs["README / PLUGIN_SPEC / EVENT_HOOKUPS / STATUS"]

  Repo --> App
  Repo --> Pack
  Pack --> Plugins
  Pack --> Docs
```

## 3) 插件清单

- `LOTFK_Utils.js`：基础工具、随机、notetag、状态访问。
- `LOTFK_Core.js`：核心状态、势力、腐败、昼夜、变量同步。
- `LOTFK_CorruptionVFX.js`：腐败视觉效果与界面脉冲。
- `LOTFK_DayNightCycle.js`：7 阶段时序与场景色调。
- `LOTFK_Diplomacy.js`：势力信任 HUD 与门槛触发。
- `LOTFK_TradeAndRoutes.js`：市场、路线、任务、价格策略。
- `LOTFK_BrewBattle.js`：五行站姿系统。
- `LOTFK_BeastSummon.js`：神兽召唤与 gauge。

## 4) 安装与顺序

1. 将 `plugins/*.js` 拷贝到 RPG Maker MZ 项目的 `js/plugins/`。
2. 按文档顺序在 Plugin Manager 启用插件。
3. 配置参数（状态 ID、变量 ID、市场定义）。
4. 在 `EVENT_HOOKUPS` 中配置事件命令。

## 5) 功能能力

- 经济系统：动态供需、腐败修正、贸易任务。
- 昼夜系统：7 阶段循环与渐进色调。
- 外交系统：信任门槛与事件触发。
- 污秽效果：腐败状态视觉反馈。
- 战斗五行：五行位和相克增益。
- 神兽机制：姿态门控与召唤。

## 6) 数据与事件流

```mermaid
flowchart TB
  Events["Plugin 事件触发"] --> Core["Core State"]
  Core --> Trade["Trade/Combat/Faction Modules"]
  Trade --> VFX["视觉/HUD"]
  VFX --> RM["RPG Maker 事件条件"]
  RM --> Core
```

## 7) 维护清单

- `README` 与 `STATUS` 内容变更必须同步。
- 插件命令和参数变更更新 `PLUGIN_SPEC`。
- 事件挂接变更更新 `EVENT_HOOKUPS`。
- 文件移动或重命名同步 `notes/doc-archive/docs__index.txt` 与 `index.json` 映射。
