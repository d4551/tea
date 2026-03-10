# LOTFK RPG Maker MZ plugin spec

Current-state implementation contract for the companion pack. This document is maintained as a live reference, not a speculative implementation prompt.

## Sources / conventions
- Plugins are placed in `js/plugins` and activated via Plugin Manager.
- Plugin commands are defined with annotations and implemented via `PluginManager.registerCommand`.
- Use IIFE + strict mode. Alias existing methods — never replace prototypes.
- Place LOTFK plugins **below** any VisuStella plugins in Plugin Manager.

See:
- https://www.rpgmakerweb.com/blog/using-plugins-in-mz
- https://rpgmakerofficial.com/product/mz/plugin/make/annotation.html
- https://rpgmakerofficial.com/product/mz/plugin/make/koushiki.html

## Plugin Load Order
1. *(VisuStella Tier 0-1 plugins, if used)*
2. **LOTFK_Core** — state, factions, corruption, day cycle, variable sync
3. **LOTFK_TradeAndRoutes** — markets, pricing, contracts, travel
4. **LOTFK_BrewBattle** — Wuxing stances in combat

## Save State Schema
Stored under `$gameSystem._lotfk` and also persisted via `DataManager.makeSaveContents`:

```
{
  version: 2,
  day: 1,
  factions: {
    shu: { trust: 0 },
    wu:  { trust: 0 },
    wei: { pressure: 0 }
  },
  corruption: {
    level: 0,           // 0-100
    flags: {},          // named narrative flags
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
    contracts: [
      { itemId, quantity, targetMarketId, faction, completed }
    ]
  },
  route: {
    currentMarketId: "YANGTZE_TEA_HOUSE",
    unlockedMarketIds: ["YANGTZE_TEA_HOUSE"]
  }
}
```

## Variable Sync (LOTFK_Core)
Configure Game Variable IDs in plugin parameters to auto-sync LOTFK values
so event conditions can read them without script calls:
- Shu Trust, Wu Trust, Wei Pressure
- Corruption Level, Day, Trade Reputation

## Corruption Thresholds (LOTFK_Core)
Configure threshold levels (e.g. 25, 50, 75) and matching Common Event IDs.
When corruption reaches a threshold for the first time, that Common Event fires.

## Notetags
Items:
- `<lotfkTea:green|yellow|white|oolong|dark>`
- `<lotfkElement:wood|fire|earth|metal|water>`
- `<lotfkQuality:0..3>`
- `<lotfkTainted:true>` (optional — cheaper at high corruption)

## Plugin Commands

### LOTFK_Core
| Command | Args | Description |
|---------|------|-------------|
| InitGameState | — | Initialize LOTFK state (safe to repeat) |
| AdvanceDay | days | Advance in-game day counter |
| SetFactionTrust | faction, value | Set trust/pressure to exact value |
| AddFactionTrust | faction, delta | Add/subtract trust/pressure |
| SetCorruption | value | Set corruption (0-100) |
| AddCorruption | delta | Add/subtract corruption, checks thresholds |
| SetCorruptionFlag | flag, value | Set named narrative flag |
| UnlockMarket | marketId | Unlock a market node |
| AddReputation | delta | Add/subtract trade reputation |
| SyncVariables | — | Force-sync to Game Variables |

### LOTFK_TradeAndRoutes
| Command | Args | Description |
|---------|------|-------------|
| OpenMarket | marketId | Push Scene_LOTFKMarket (Buy/Sell/Contracts) |
| RefreshMarket | marketId | Randomize supply/demand values |
| OpenRouteMap | — | Push Scene_LOTFKRouteMap |
| TravelTo | marketId | Travel with day advance + risk events |
| AddContract | itemId, quantity, targetMarketId, faction | Add delivery contract |

### LOTFK_BrewBattle
| Command | Args | Description |
|---------|------|-------------|
| EnableBrewSwap | enabled | Toggle Brew Swap command globally |
| SetActorStance | actorId, stance | Force-set stance outside battle |
| ClearActorStance | actorId | Remove stance from actor |

## Market Pricing Formula
```
price = baseItemPrice
      * market.baseMultiplier
      * supplyDemandMultiplier (0.5 .. 2.0)
      * corruptionMultiplier

S/D multiplier = clamp(0.5, 2.0, 1 + (demand - supply) / 100)
Corruption (pure):    1 + corruptionLevel * 0.01
Corruption (tainted): clamp(0.5, 1.0, 1 - corruptionLevel * 0.005)
Sell price = Buy price * 0.6
```

Buying increases demand (+3/unit) and decreases supply (-2/unit).
Selling increases supply (+2/unit) and decreases demand (-1/unit).

## Market Struct (Plugin Parameter)
Markets are defined via `@type struct<LOTFKMarket>[]` with fields:
- `id` (string) — Unique ID e.g. YANGTZE_TEA_HOUSE
- `name` (string) — Display name
- `faction` (select: shu/wu/wei/neutral)
- `baseMultiplier` (number, decimals)
- `allowedItems` (item[]) — Items tradeable here
- `edges` (string[]) — Connected market IDs
- `risk` (number 1-10) — Travel risk level

## Wuxing Cycle (BrewBattle)
- **Generating:** Wood→Fire→Earth→Metal→Water→Wood
  - Actor stance feeds skill element → +30% damage (configurable)
- **Overcoming:** Wood→Earth, Fire→Metal, Earth→Water, Metal→Wood, Water→Fire
  - Actor stance conquers skill element → +50% damage (configurable)
- **Corruption Inversion:** At corruption >= threshold, healing becomes drain

## Travel Events
When risk roll triggers (chance = risk * 10% + corruption * 0.5%):
- 35% — Bandit ambush (battle with risk-scaled troop)
- 20% — Corruption spread (+risk*2 corruption)
- 20% — Merchant encounter (random gold gift)
- 25% — Wei patrol (+risk pressure)

## Contract System
- Contracts specify: deliver X of item Y to market Z for faction F
- Completing at destination: removes items, awards gold + reputation + faction trust
- Checked automatically when entering Contracts tab in market

## Scenes & Windows
- **Scene_LOTFKMarket** — extends Scene_MenuBase
  - Window_MarketCommand (Buy/Sell/Contracts/Exit)
  - Window_MarketBuy (items + dynamic prices)
  - Window_MarketSell (party items + sell prices)
  - Window_ContractList (active contracts)
  - Window_Gold
- **Scene_LOTFKRouteMap** — extends Scene_MenuBase
  - Window_Base header (current location + day)
  - Window_RouteList (reachable markets + risk/days)
- **Window_BrewSwap** — extends Window_Command (battle sub-window)
  - 5 Wuxing stances with active indicator
