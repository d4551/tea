You are a senior RPG Maker MZ plugin engineer. Implement a vertical slice of “Leaves of the Fallen Kingdom — 落叶王朝” with:
(A) Silk Road / Tea Horse Road travel + mercantile mechanics,
(B) a custom Tea Market UI (buy/sell/contracts/rumors) with dynamic pricing,
(C) “Brew Swap” battle command (tea stance swap) that interacts with Wuxing elements,
(D) corruption (“water remembers”) that can infect tea, markets, and trigger boss events.

HARD CONSTRAINTS:
- Do NOT edit MZ core scripts directly. Implement via plugins placed in /js/plugins and enabled via Plugin Manager. Provide plugin commands so events can drive systems.
- Follow MZ plugin conventions: IIFE wrapper, strict mode, method aliasing when redefining existing functions, PluginManager.registerCommand for plugin commands, and annotation headers (@target MZ, @command, @arg, etc.)
- Prefer data-driven design via Plugin Parameters (struct arrays) + notetags, so designers can tune without code edits.
- Ship with a minimal playable loop:
  1) Enter Yangtze Cliff Tea House → cutscene triggers Corruption Flag
  2) Open Tea Market → buy 1 tea, accept 1 caravan contract
  3) Travel to next node (route selection) → random event can raise corruption or attack
  4) Battle includes Brew Swap command → stance changes stats/skills
  5) Return to market → prices shift and trust/corruption variables update

DELIVERABLES:
- Plugins:
  /js/plugins/LOTFK_Core.js
  /js/plugins/LOTFK_TradeAndRoutes.js
  /js/plugins/LOTFK_BrewBattle.js
- A short README.md describing:
  plugin order, parameters, plugin commands, and how to hook to events.
- Optional: A demo “Common Event” plan (IDs referenced) but don’t require manual editor work if possible.

TECH SPECS:
1) Core State Model (persist in save):
- $gameSystem._lotfk = {
    version,
    factions: { wei: {pressure}, shu: {trust}, wu: {trust} },
    corruption: { level, flags:{} },
    markets: { [marketId]: { supplyByItemId, demandByItemId, lastRefreshDay } },
    playerTrade: { reputation, caravanCapacity, contracts: [] },
    route: { currentMarketId, unlockedMarketIds: [] }
  }

2) Tea + Wuxing:
- Each tea item has meta tags, e.g. <lotfkTea:green> <lotfkElement:wood> <lotfkQuality:2>
- Brew Stances (in battle): WOOD, FIRE, EARTH, METAL, WATER
- Brew Swap changes stance state on the active actor and modifies:
  - elemental resist/attack modifiers (implemented via states or temporary trait-style buffs)
  - unlocks 1 stance skill (optional)
  - interacts with corruption (corruption can “invert” stance benefits)

3) Markets:
- Market definition comes from plugin parameters (struct array):
  id, name, faction, basePriceMultiplier, allowedItems, specialRumors, routeEdges
- Dynamic price formula (deterministic + readable):
  price = baseItemPrice * marketMultiplier * supplyDemandMultiplier * corruptionMultiplier
  supplyDemandMultiplier = clamp(0.5..2.0) based on supply & demand values
  corruptionMultiplier increases prices for pure goods, decreases for tainted goods

4) Route Travel:
- Route selection UI: list unlocked markets + travel cost/time + risk.
- Travel executes:
  - consume time (store day count in $gameSystem._lotfk)
  - roll event table based on route risk and corruption
  - may trigger battle, merchant encounter, faction patrol, water source purification

5) Plugin Commands (must exist, for event use):
Core:
- LOTFK_Core.InitGameState
- LOTFK_Core.SetFactionTrust faction value
- LOTFK_Core.AddFactionTrust faction delta
- LOTFK_Core.AddCorruption delta
- LOTFK_Core.SetCorruption value
- LOTFK_Core.UnlockMarket marketId
Trade/Routes:
- LOTFK_TradeAndRoutes.OpenMarket marketId
- LOTFK_TradeAndRoutes.RefreshMarket marketId
- LOTFK_TradeAndRoutes.OpenRouteMap
- LOTFK_TradeAndRoutes.TravelTo marketId
Brew:
- LOTFK_BrewBattle.SetActorStance actorId stance
- LOTFK_BrewBattle.EnableBrewSwap true/false

IMPLEMENTATION NOTES:
- Use PluginManager.registerCommand(pluginName, commandName, func) and parse args as strings.
- Use method aliasing pattern when extending windows/scenes.
- Create custom scenes/windows for Market and Route UI using Window_Command/Window_Selectable patterns.
- Keep code readable and commented.

ACCEPTANCE TESTS:
- New game: calling InitGameState sets defaults and doesn’t crash.
- Market UI opens, lists buy/sell items, uses computed price, and transactions affect gold/inventory.
- Route UI opens, travel updates currentMarketId, triggers at least one random event in 10 travels.
- Battle: Actor command list includes “Brew Swap” when enabled; selecting it opens stance menu and applies stance state.
- Save/Load preserves all LOTFK state.
