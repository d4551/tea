# LOTFK RMMZ companion pack status

## Status

Implemented and maintained as a companion artifact to the main TEA app.

## Scope

This pack provides the RPG Maker MZ plugin-side implementation for:

- shared utilities
- core state and corruption
- day/night cycle
- diplomacy
- trade and route travel
- brew battle stance mechanics
- sacred beast summons
- corruption visual effects

## Shipped plugin inventory

| Plugin | Responsibility |
| --- | --- |
| `LOTFK_Utils.js` | Shared helpers and utility functions |
| `LOTFK_Core.js` | State, factions, corruption, variable sync |
| `LOTFK_CorruptionVFX.js` | Corruption visual effects |
| `LOTFK_DayNightCycle.js` | Day/night phase system |
| `LOTFK_Diplomacy.js` | Faction diplomacy UI and trust gates |
| `LOTFK_TradeAndRoutes.js` | Markets, pricing, contracts, route travel |
| `LOTFK_BrewBattle.js` | Brew swap combat stance mechanics |
| `LOTFK_BeastSummon.js` | Sacred beast summon systems |

## Documentation contract

- `README.txt` describes install flow and pack overview.
- `PLUGIN_SPEC.txt` is the current implementation contract.
- `EVENT_HOOKUPS.txt` is the current editor integration guide.
- This file replaces the old implementation-ticket checklist and prompt-pack artifacts.

## Maintenance rules

- Keep the pack docs aligned with the shipped plugin files.
- Do not reintroduce plan/checklist/prompt docs as the primary pack documentation.
- If the pack’s runtime status changes, update this file and the main docs index together.
