# Leaves of the Fallen Kingdom（LOTFK）伴随包

八个 RPG Maker MZ 插件组成的 RPG 陪伴包（落叶王朝）：
茶叶贸易系统、五行战斗站姿、神兽召唤、势力外交、腐败特效、昼夜循环与通用工具。

## 包含内容

### 插件文件（`plugins/`）

- `LOTFK_Utils.js`：工具函数、状态访问、notetag 解析、随机数。
- `LOTFK_Core.js`：势力、腐败、昼夜、变量同步。
- `LOTFK_CorruptionVFX.js`：屏幕色调、粒子、界面脉冲。
- `LOTFK_DayNightCycle.js`：7 阶段时间系统与增益。
- `LOTFK_Diplomacy.js`：信任 HUD、门槛事件、势力场景。
- `LOTFK_TradeAndRoutes.js`：市场、动态定价、交易合同、路线移动。
- `LOTFK_BrewBattle.js`：五行站姿战斗、元素加成。
- `LOTFK_BeastSummon.js`：神兽召唤 gauge 与终结技能。

## 文档

- `PLUGIN_SPEC.txt`：完整实现协议（命令、参数、数据结构）。
- `STATUS.txt`：实现状态与维护说明。
- `EVENT_HOOKUPS.txt`：RMMZ 事件集成样例。

## RPG Maker 安装

1. 将 `plugins/` 下全部 `.js` 复制到项目 `js/plugins/`。
2. 在 Plugin Manager 按顺序启用（见 `docs__rmmz-pack` 的顺序）。
3. 配置插件参数（状态ID、变量ID、市场定义）。
4. 按 `EVENT_HOOKUPS.txt` 进行事件/通用事件挂接。

## 主要特性（简要）

- 交易市场（动态价格、供需与腐败加权）。
- 阵营外交（信任门限与状态切换）。
- 腐败视觉化（多级提示与事件触发）。
- 五行战斗站姿（木火土金水循环）。
- 神兽召唤（姿态门控、冷却 gauge）。
- 昼夜系统（7阶段）。

## 推荐阅读顺序

1. 阅读 `LOTFK_RMMZ_Agentic_Pack__README.txt`（中文版对照本节）。
2. 阅读 `PLUGIN_SPEC.zh-CN.txt` 了解命令和参数。
3. 按 `EVENT_HOOKUPS.zh-CN.txt` 对齐事件。
