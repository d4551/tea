# LOTFK RPG Maker MZ 包状态（中文）

## 当前状态

该伴随包与 TEA 主仓库同步维护，提供以下核心能力：

- 通用工具
- 核心状态与腐败系统
- 昼夜循环
- 勇者外交
- 贸易与路线旅行
- BrewBattle 站姿
- 神兽召唤
- 腐败视觉特效

## 覆盖的插件

| 插件 | 职责 |
| --- | --- |
| `LOTFK_Utils.js` | 通用方法与工具 |
| `LOTFK_Core.js` | 状态、势力、腐败、变量同步 |
| `LOTFK_CorruptionVFX.js` | 腐败视觉效果 |
| `LOTFK_DayNightCycle.js` | 七阶段昼夜系统 |
| `LOTFK_Diplomacy.js` | 外交 UI 与信任门槛 |
| `LOTFK_TradeAndRoutes.js` | 市场、定价、合同、路线 |
| `LOTFK_BrewBattle.js` | 五行站姿战斗 |
| `LOTFK_BeastSummon.js` | 神兽召唤 |

## 文档契约

- `README`：安装与总览。
- `PLUGIN_SPEC`：实现级命令/参数定义。
- `EVENT_HOOKUPS`：编辑器事件接线。

## 维护规则

- 更新任何插件行为时同步更新相关文档。
- 不再引入旧版计划清单或 prompt 文档作为主说明。
- 运行时状态变化时，更新本文件与主文档索引。
