# Event Hookups (MZ Editor)

These are recommended event/common event configurations for wiring
LOTFK plugin commands into your RPG Maker MZ project.

## Common Event: LOTFK_Init (run on New Game autorun)
```
Plugin Command: LOTFK_Core → InitGameState
Plugin Command: LOTFK_Core → UnlockMarket  (marketId = YANGTZE_TEA_HOUSE)
Plugin Command: LOTFK_Core → SyncVariables
```

## Common Event: LOTFK_DayAdvance (call after rest/sleep events)
```
Plugin Command: LOTFK_Core → AdvanceDay  (days = 1)
Plugin Command: LOTFK_TradeAndRoutes → RefreshMarket  (marketId = current)
```

## Tea House Cutscene End
```
Plugin Command: LOTFK_Core → AddCorruption  (delta = 10)
Plugin Command: LOTFK_Core → SetCorruptionFlag  (flag = inkTouched, value = true)
Plugin Command: LOTFK_TradeAndRoutes → OpenMarket  (marketId = YANGTZE_TEA_HOUSE)
```

## Market Exit → Route Map (optional)
```
Plugin Command: LOTFK_TradeAndRoutes → OpenRouteMap
```

## Faction Event: Shu Alliance
```
Plugin Command: LOTFK_Core → AddFactionTrust  (faction = shu, delta = 10)
Plugin Command: LOTFK_Core → SyncVariables
```

## Contract Assignment (NPC dialogue)
```
Plugin Command: LOTFK_TradeAndRoutes → AddContract
  (itemId = 5, quantity = 3, targetMarketId = JINGDEZHEN_KILN, faction = wu)
```

## Battle Prep: Enable Brew Swap
```
Plugin Command: LOTFK_BrewBattle → EnableBrewSwap  (enabled = true)
```

## Battle Prep: Pre-set Stance (optional, for story battles)
```
Plugin Command: LOTFK_BrewBattle → SetActorStance  (actorId = 1, stance = water)
```

## Corruption Threshold Common Events
Configure in LOTFK_Core plugin parameters:
- Threshold 25 → Common Event 10 (minor visual effect, dialogue)
- Threshold 50 → Common Event 11 (corruption inversion begins, boss tease)
- Threshold 75 → Common Event 12 (Hundun boss encounter available)

## Variable Sync for Event Conditions
Configure in LOTFK_Core plugin parameters, then use in event conditions:
- Variable 1 = Shu Trust → branch on >= 30 for alliance events
- Variable 2 = Wu Trust → branch on >= 30 for trade bonuses
- Variable 3 = Wei Pressure → branch on >= 50 for invasion events
- Variable 4 = Corruption → branch on >= 25/50/75 for world changes
- Variable 5 = Day → branch on >= X for timed events
- Variable 6 = Reputation → branch on >= 10 for merchant perks

---

## Diplomacy HUD (show on world map)
```
Plugin Command: LOTFK_Diplomacy → ShowFactionHUD
```

## Diplomacy HUD (hide during cutscenes)
```
Plugin Command: LOTFK_Diplomacy → HideFactionHUD
```

## Trust Gate Check (run after trust changes)
```
Plugin Command: LOTFK_Diplomacy → CheckTrustGate  (faction = shu)
Plugin Command: LOTFK_Diplomacy → CheckTrustGate  (faction = wu)
Plugin Command: LOTFK_Diplomacy → CheckTrustGate  (faction = wei)
```

## Sacred Beast — Battle Setup
```
Plugin Command: LOTFK_BrewBattle → EnableBrewSwap  (enabled = true)
Plugin Command: LOTFK_BeastSummon → ResetAllGauges
```
> Beast gauges charge automatically at end of each turn based on stance alignment.

## Sacred Beast — Boss Battle Pre-Check
```
Plugin Command: LOTFK_BeastSummon → CheckBeastReady  (beastId = azure, switchId = 20)
Conditional Branch: Switch 20 = ON
  → Show Text: "The Azure Dragon stirs! You may invoke its power."
Else
  → Show Text: "The beast slumbers. Hold your stance and purify your spirit."
End
```

## Sacred Beast — Force Summon (story event)
```
Plugin Command: LOTFK_BeastSummon → ForceSummon  (beastId = vermilion)
```

## Corruption VFX — Force Effect for Cutscene
```
Plugin Command: LOTFK_CorruptionVFX → ForceCorruptionVFX  (level = 80)
Wait: 120 frames
Plugin Command: LOTFK_CorruptionVFX → ClearCorruptionVFX
```

## Corruption VFX — Flash on Corruption Gain
```
Plugin Command: LOTFK_Core → AddCorruption  (delta = 15)
Plugin Command: LOTFK_CorruptionVFX → PulseCorruptionFlash
```

## Day/Night — Set Phase for Story Moment
```
Plugin Command: LOTFK_DayNightCycle → SetDayPhase  (phase = midnight)
```

## Day/Night — Advance Phase after Rest
```
Plugin Command: LOTFK_DayNightCycle → AdvancePhase
Plugin Command: LOTFK_DayNightCycle → AdvancePhase
```
> Call AdvancePhase multiple times to skip forward (e.g. 2× to skip from night to dawn).

## Day/Night — Check Phase for Conditional
```
Plugin Command: LOTFK_DayNightCycle → GetCurrentPhase  (variableId = 30)
Conditional Branch: Variable 30 = "night"
  → Show Text: "The night market awakens. Prices shift."
End
```

## Updated LOTFK_Init (New Game autorun)
```
Plugin Command: LOTFK_Core → InitGameState
Plugin Command: LOTFK_Core → UnlockMarket  (marketId = YANGTZE_TEA_HOUSE)
Plugin Command: LOTFK_Core → SyncVariables
Plugin Command: LOTFK_Diplomacy → ShowFactionHUD
Plugin Command: LOTFK_DayNightCycle → SetDayPhase  (phase = morning)
```
