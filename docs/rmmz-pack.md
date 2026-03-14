# RPG Maker MZ companion pack documentation

This document tracks the external companion artifacts for `LOTFK_RMMZ_Agentic_Pack`.

## 1) Purpose and ownership

- The pack is maintained as a runtime companion outside TypeScript compilation.
- Documentation and plugin files are part of the repo delivery surface and must stay aligned.
- Changes are owned by the same release discipline as core runtime changes: `docs`, `pack files`, and migration checks move together.

## 2) Artifact map

```mermaid
flowchart LR
  Repo["TEA repo"]
  App["Bun/Elysia application"]
  Pack["LOTFK_RMMZ_Agentic_Pack"]
  Plugins["plugins/*.js"]
  Docs["README + PLUGIN_SPEC + EVENT_HOOKUPS + STATUS"]

  Repo --> App
  Repo --> Pack
  Pack --> Plugins
  Pack --> Docs
```

## 3) Plugin inventory

- `LOTFK_Utils.js`: shared helpers, RNG, notetag parser, state accessor.
- `LOTFK_Core.js`: state, factions, corruption, day cycle, variable sync.
- `LOTFK_CorruptionVFX.js`: corruption visual feedback and screen effects.
- `LOTFK_DayNightCycle.js`: 7-phase time progression and tint updates.
- `LOTFK_Diplomacy.js`: faction trust HUD and trust gates.
- `LOTFK_TradeAndRoutes.js`: market, travel, contracts, pricing updates.
- `LOTFK_BrewBattle.js`: Wuxing stance system in battle.
- `LOTFK_BeastSummon.js`: sacred beast summon gauge and invocation.

## 4) Installation sequence

1. Copy `plugins/*.js` into RPG Maker MZ project's `js/plugins/`.
2. Enable plugins in Plugin Manager, with the order listed in `PLUGIN_SPEC`.
3. Configure plugin parameters (state IDs, variable IDs, markets/triggers).
4. Run `LOTFK_Init` from common events on new game startup.
5. Register event command wiring from `EVENT_HOOKUPS.txt`.

## 5) Runtime capabilities

- Economy and route systems for tea trade.
- Faction diplomacy with trust gating and state events.
- Corruption accumulation with visual feedback and event triggers.
- Wuxing combat stances with elemental modifiers.
- Sacred beast summon system with stance-aligned gauges.
- Day/night time phases (7-step cycle) and related gameplay modifiers.
- Shared utilities and save/load persistence via `DataManager` aliasing.

## 6) Data and event flow

```mermaid
flowchart TB
  P["Plugin events"] --> C["Core state"]
  C --> F["Faction / corruption / trade modules"]
  F --> V["Visual feedback + HUD"]
  V --> E["RPG Maker events"]
  E --> C
```

## 7) Maintenance and synchronization checks

- `LOTFK_RMMZ_Agentic_Pack__README.txt` and `STATUS.txt` must stay consistent.
- Any plugin behavior change must be reflected in `PLUGIN_SPEC.txt`.
- Event wiring changes require `EVENT_HOOKUPS.txt` updates.
- Any rename or file movement requires docs index and manifest alignment.

## 8) Failure and compatibility

- Verify plugin order after any RPG Maker plugin changes.
- Keep variable IDs and IDs stable where possible; if changed, update event flow docs.
- If game behavior diverges, update this pack documentation before changing runtime docs.

## 9) Quick references

- `README`: companion usage and feature index.
- `PLUGIN_SPEC`: current implementation contract.
- `EVENT_HOOKUPS`: event flow templates.
- `STATUS`: implementation and support status.
