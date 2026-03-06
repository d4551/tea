# Implementation Tickets (Agent Execution Plan)

## Status: All phases IMPLEMENTED

## Phase 0 — Core Persistence (LOTFK_Core.js) ✓
- [x] Plugin header with @target MZ, @plugindesc, @help, @command, @param blocks
- [x] Initialize $gameSystem._lotfk on new game (Game_System alias)
- [x] Persist across save/load (DataManager.makeSaveContents/extractSaveContents)
- [x] Schema migration (v1 → v2: triggeredThresholds)
- [x] Plugin commands: InitGameState, AdvanceDay, Set/Add FactionTrust,
      Set/Add Corruption, SetCorruptionFlag, UnlockMarket, AddReputation, SyncVariables
- [x] Variable sync to Game Variables for event conditional access
- [x] Corruption threshold → Common Event system
- [x] Scene_Map onMapLoaded sync

## Phase 1 — Data Definitions (LOTFK_TradeAndRoutes.js) ✓
- [x] Plugin parameters: Markets[] with proper `/*~struct~LOTFKMarket:*/` block
- [x] Struct fields: id, name, faction, baseMultiplier, allowedItems (item[]),
      edges (string[]), risk (1-10)
- [x] Parameter parser with JSON.parse for nested arrays
- [x] Market state init: supplyByItemId, demandByItemId, lastRefreshDay

## Phase 2 — Market UI ✓
- [x] Scene_LOTFKMarket extends Scene_MenuBase
- [x] Window_MarketCommand (Buy / Sell / Contracts / Exit)
- [x] Window_MarketBuy with dynamic pricing (computePrice)
- [x] Window_MarketSell with 60% sell multiplier
- [x] Window_ContractList showing active contracts
- [x] Transaction logic: executeBuy/executeSell with S/D impact
- [x] Contract system: addContract, checkContracts (auto-complete at destination)
- [x] Gold window, scene prepare() pattern

## Phase 3 — Route UI + Travel Resolution ✓
- [x] Scene_LOTFKRouteMap extends Scene_MenuBase
- [x] Header window: current location + day count
- [x] Window_RouteList: unlocked connected markets with risk/days display
- [x] TravelTo: day advance, location update, market refresh
- [x] Random event table: bandit ambush, corruption spread,
      merchant encounter, Wei patrol
- [x] Risk-scaled troop IDs via plugin parameter

## Phase 4 — Brew Swap Battle Command (LOTFK_BrewBattle.js) ✓
- [x] Window_ActorCommand alias: add "Brew Swap" command
- [x] Window_BrewSwap: 5 Wuxing stances with active indicator + corruption marker
- [x] Scene_Battle integration: createBrewSwapWindow, handlers
- [x] Stance state application via RMMZ states (state IDs from params)
- [x] Remove old stance states before applying new
- [x] Wuxing generating cycle bonus (+30% configurable)
- [x] Wuxing overcoming cycle bonus (+50% configurable)
- [x] Corruption inversion (healing → drain at threshold)
- [x] Game_Action.makeDamageValue alias for Wuxing multipliers
- [x] DataManager.extractSaveContents alias to restore stances on load
- [x] Plugin commands: EnableBrewSwap, SetActorStance, ClearActorStance

## QA Checklist
- [ ] New game → InitGameState → defaults set, no crash
- [ ] OpenMarket → items listed with computed prices → buy/sell updates gold/inventory
- [ ] OpenRouteMap → shows reachable nodes → travel advances days
- [ ] 10 travels → at least 1 random event fires
- [ ] Battle → "Brew Swap" in actor commands → stance menu → state applied
- [ ] Wuxing bonus: Wood stance + Fire skill = +30% damage
- [ ] Save → Load → all LOTFK state preserved
- [ ] Corruption threshold → Common Event fires once
- [ ] Contract completion at destination → gold + trust reward
