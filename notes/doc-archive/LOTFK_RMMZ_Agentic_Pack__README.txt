# Leaves of the Fallen Kingdom — RPG Maker MZ companion pack

Eight RPG Maker MZ plugins for **Leaves of the Fallen Kingdom — 落叶王朝**,
providing tea trade mechanics, Wuxing combat stances, sacred beast summons,
faction diplomacy, corruption effects, day/night cycles, and shared utilities.

This pack is maintained as a companion artifact to the main TEA app. It is outside the TypeScript compile surface, but it remains an active repo surface and must keep its docs aligned with the shipped plugin files.

## What's Inside

### Plugins (`plugins/`)
- **LOTFK_Utils.js** — Shared helpers: clamp, state accessor, notetag parser, RNG
- **LOTFK_Core.js** — Game state, factions, corruption, day cycle, variable sync
- **LOTFK_CorruptionVFX.js** — Visual corruption effects: screen tints, particles, UI pulse
- **LOTFK_DayNightCycle.js** — 7-phase time system with tints and night market bonuses
- **LOTFK_Diplomacy.js** — Faction trust HUD, trust-gated Common Events, status scene
- **LOTFK_TradeAndRoutes.js** — Market scenes, dynamic pricing, contracts, route travel
- **LOTFK_BrewBattle.js** — Wuxing tea stance battle system with elemental bonuses
- **LOTFK_BeastSummon.js** — Sacred Beast summon gauges and finisher skills

### Documentation
- `PLUGIN_SPEC.txt` — Full data model, commands, pricing formula, Wuxing cycle
- `STATUS.txt` — Current implementation and maintenance status
- `EVENT_HOOKUPS.txt` — Recommended MZ editor event wiring

## Install in RPG Maker MZ
1. Copy all `.js` files from `plugins/` into your project's `js/plugins/` folder.
2. Open **Plugin Manager** and enable them in order (see below).
3. Configure plugin parameters (state IDs, variable IDs, market definitions).
4. Wire plugin commands into events/common events per `EVENT_HOOKUPS.txt`.

## Plugin Order (in Plugin Manager)
```
1. (VisuStella Tier 0-1 plugins, if used)
2. LOTFK_Utils
3. LOTFK_Core
4. LOTFK_CorruptionVFX
5. LOTFK_DayNightCycle
6. LOTFK_Diplomacy
7. LOTFK_TradeAndRoutes
8. LOTFK_BrewBattle
9. LOTFK_BeastSummon
```

## Key Features

### Trade System
- **Dynamic pricing** — supply/demand + corruption modifiers
- **Scene_LOTFKMarket** — Buy, Sell, and Contract tabs with Window_Gold
- **Contract system** — deliver items between markets for gold + faction trust
- **Night market** — prices adjust during night phases via DayNightCycle integration

### Route Travel
- **Scene_LOTFKRouteMap** — node-based travel between unlocked markets
- **Random events** — bandit ambush, corruption spread, merchant gifts, Wei patrols
- **Day advancement** — travel time scaled by route risk

### Wuxing Battle Stances
- **Brew Swap** command in actor battle menu
- **5 stances** — Wood, Fire, Earth, Metal, Water (mapped to RMMZ states)
- **Generating cycle** — stance feeds skill element = bonus damage
- **Overcoming cycle** — stance conquers skill element = bigger bonus
- **Corruption inversion** — healing becomes drain at high corruption

### Sacred Beast Summoning
- **4 beasts** — Azure Dragon, Vermilion Bird, White Tiger, Black Tortoise
- **Stance-aligned gauges** — charge while holding matching elemental stance
- **Window_BeastGauge** — battle overlay showing charge progress
- **Corruption gate** — summon blocked if corruption exceeds beast threshold

### Faction Diplomacy
- **Window_FactionHUD** — map overlay with Shu/Wu/Wei trust meters
- **Trust gates** — auto-trigger Common Events when trust crosses thresholds
- **Scene_FactionStatus** — detailed faction view from menu

### Corruption Visuals
- **Tiered screen tints** — progressive violet overlay at 25/50/75 corruption
- **Message window pulse** — border opacity modulation during dialogue
- **Corruption particles** — screen flash particles at high corruption

### Day/Night Cycle
- **7 phases** — dawn, morning, noon, afternoon, dusk, night, midnight
- **Auto-advance** — configurable step count per phase
- **Phase tints** — warm amber dawn to cool blue midnight
- **Save persistence** — step counter persists across saves

### Core Systems
- **Faction trust** — Shu, Wu, Wei with event-accessible variables
- **Corruption** — 0-100 scale with threshold-triggered Common Events
- **Variable sync** — auto-sync to Game Variables for event conditions
- **Save/Load** — full state persistence via DataManager aliasing

## References
- Installing plugins: https://www.rpgmakerweb.com/blog/using-plugins-in-mz
- Plugin annotations: https://rpgmakerofficial.com/product/mz/plugin/make/annotation.html
- registerCommand: https://rpgmakerofficial.com/product/mz/plugin/make/koushiki.html
