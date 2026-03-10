# LOTFK 插件规范（中文）

本规范定义伴随包当前实现约定，不是草案。

## 约定与加载顺序

- 插件放置于 `js/plugins`，通过 Plugin Manager 激活。
- 插件命令使用 `PluginManager.registerCommand`。
- 使用 IIFE + strict。
- 推荐顺序：
  1. （可选）VisuStella Tier 0-1 插件
  2. `LOTFK_Core`
  3. `LOTFK_TradeAndRoutes`
  4. `LOTFK_BrewBattle`

## 存档结构（简化）

```js
{
  version: 2,
  day: 1,
  factions: {
    shu: { trust: 0 },
    wu:  { trust: 0 },
    wei: { pressure: 0 }
  },
  corruption: {
    level: 0,
    flags: {},
    triggeredThresholds: []
  },
  markets: {
    [marketId]: {
      supplyByItemId: {},
      demandByItemId: {},
      lastRefreshDay: 0
    }
  },
  playerTrade: {
    reputation: 0,
    caravanCapacity: 10,
    contracts: [{ itemId, quantity, targetMarketId, faction, completed }]
  },
  route: {
    currentMarketId: "YANGTZE_TEA_HOUSE",
    unlockedMarketIds: ["YANGTZE_TEA_HOUSE"]
  }
}
```

## 核心 Notetag

- `lotfkTea`（green/yellow/white/oolong/dark）
- `lotfkElement`（wood/fire/earth/metal/water）
- `lotfkQuality`（0..3）
- `lotfkTainted`（true/false，可选）

## 插件指令

### LOTFK_Core

| 指令 | 参数 | 说明 |
| --- | --- | --- |
| `InitGameState` | 无 | 初始化（可重复调用） |
| `AdvanceDay` | days | 前进天数 |
| `SetFactionTrust` | faction, value | 设置信任/压力 |
| `AddFactionTrust` | faction, delta | 增减势力值 |
| `SetCorruption` | value | 设置腐败 |
| `AddCorruption` | delta | 修改腐败并处理阈值 |
| `SetCorruptionFlag` | flag, value | 设置故事标签 |
| `UnlockMarket` | marketId | 解锁市场 |
| `AddReputation` | delta | 声望调整 |
| `SyncVariables` | 无 | 强制同步变量 |

### LOTFK_TradeAndRoutes

| 指令 | 参数 | 说明 |
| --- | --- | --- |
| `OpenMarket` | marketId | 打开市场 Buy/Sell/Contract |
| `RefreshMarket` | marketId | 刷新供需 |
| `OpenRouteMap` | 无 | 打开路线地图 |
| `TravelTo` | marketId | 出行并推进天数 |
| `AddContract` | itemId, quantity, targetMarketId, faction | 添加任务 |

### LOTFK_BrewBattle

| 指令 | 参数 | 说明 |
| --- | --- | --- |
| `EnableBrewSwap` | enabled | 开关 Brew Swap |
| `SetActorStance` | actorId, stance | 强制设置站姿 |
| `ClearActorStance` | actorId | 清除站姿 |

## 价格公式（示例）

```
price = baseItemPrice
      * market.baseMultiplier
      * supplyDemandMultiplier (0.5 .. 2.0)
      * corruptionMultiplier
```

- 买价、卖价与市场风险/腐败阈值成比例。

## 旅行事件

- 战斗伏击、腐败扩散、商队补给、卫队巡逻事件按风险/腐败共同触发。

## 行为约束

- 五行生克/相克会改变伤害乘数。
- 高腐败状态下治疗可能反向为减益。
- 召唤受 stance 与腐败门槛约束。
