# 事件挂接（MZ 编辑器）

本文件给出将 LOTFK 插件命令接入 RPG Maker MZ 事件系统的推荐方式。

## 方案：新建开始（LOTFK_Init）

- Plugin Command: `LOTFK_Core → InitGameState`
- Plugin Command: `LOTFK_Core → UnlockMarket`（`marketId = YANGTZE_TEA_HOUSE`）
- Plugin Command: `LOTFK_Core → SyncVariables`

## 方案：日夜推进（LOTFK_DayAdvance）

- Plugin Command: `LOTFK_Core → AdvanceDay`（days = 1）
- Plugin Command: `LOTFK_TradeAndRoutes → RefreshMarket`（marketId=current）

## 茶馆场景结束

- `LOTFK_Core → AddCorruption`（delta = 10）
- `LOTFK_Core → SetCorruptionFlag`（flag = inkTouched, value = true）
- `LOTFK_TradeAndRoutes → OpenMarket`（marketId = YANGTZE_TEA_HOUSE）

## 市场→路线图

- `LOTFK_TradeAndRoutes → OpenRouteMap`

## 关键势力事件

- `LOTFK_Core → AddFactionTrust`（faction=shu, delta=10）
- `LOTFK_Core → SyncVariables`

## 任务布置（对话）

- `LOTFK_TradeAndRoutes → AddContract`
  - itemId = 5
  - quantity = 3
  - targetMarketId = JINGDEZHEN_KILN
  - faction = wu

## 战斗准备

- `LOTFK_BrewBattle → EnableBrewSwap`（enabled=true）
- `LOTFK_BrewBattle → SetActorStance`（actorId=1, stance=water）

## 腐败阈值事件

- Core 参数设置：
  - 阈值 25 -> Common Event 10
  - 阈值 50 -> Common Event 11
  - 阈值 75 -> Common Event 12

## 变量同步（供事件条件使用）

- variable 1: Shu Trust
- variable 2: Wu Trust
- variable 3: Wei Pressure
- variable 4: Corruption
- variable 5: Day
- variable 6: Reputation

## HUD 与隐藏

- `LOTFK_Diplomacy → ShowFactionHUD`
- `LOTFK_Diplomacy → HideFactionHUD`

## 神兽流程

- `LOTFK_BeastSummon → ResetAllGauges`（战斗前）
- `LOTFK_BeastSummon → CheckBeastReady`（示例：`beastId = azure`, `switchId = 20`）
- `LOTFK_BeastSummon → ForceSummon`（剧情触发）

## Corruption 相关事件

- `LOTFK_CorruptionVFX → ForceCorruptionVFX`（level = 80）
- `LOTFK_CorruptionVFX → ClearCorruptionVFX`
- 在腐败上升后配合 `LOTFK_Core → AddCorruption` 再触发 `PulseCorruptionFlash`

## 昼夜系统

- `LOTFK_DayNightCycle → SetDayPhase`（例如：`midnight`）
- 多次 `AdvancePhase` 用于快速跳阶段
- `LOTFK_DayNightCycle → GetCurrentPhase` 读取当前阶段
