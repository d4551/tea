/*:
 * @target MZ
 * @plugindesc LOTFK Core Systems v2 — state, factions, corruption, day cycle
 * @author LOTFK Dev
 * @url https://github.com/lotfk
 *
 * @help
 * ============================================================================
 * Leaves of the Fallen Kingdom — Core Systems
 * ============================================================================
 *
 * Manages all persistent game state for LOTFK under $gameSystem._lotfk.
 * Survives save/load via DataManager aliasing.
 *
 * STATE STRUCTURE:
 *   version        — schema version for forward migration
 *   day            — current in-game day (starts at 1)
 *   factions       — { shu: { trust }, wu: { trust }, wei: { pressure } }
 *   corruption     — { level (0-100), flags: {} }
 *   markets        — per-market supply/demand/refresh data
 *   playerTrade    — { reputation, caravanCapacity, contracts[] }
 *   route          — { currentMarketId, unlockedMarketIds[] }
 *
 * VARIABLE SYNC:
 *   The plugin syncs key values to Game Variables so event conditions
 *   can read them without script calls.  Configure variable IDs below.
 *
 * PLUGIN ORDER: Load this FIRST, before LOTFK_TradeAndRoutes and
 * LOTFK_BrewBattle. Place below any VisuStella Tier 0-1 plugins.
 *
 * @param --- Variable Sync ---
 *
 * @param varShuTrust
 * @text Shu Trust Variable
 * @desc Game Variable ID to sync Shu faction trust into (0 = off)
 * @type variable
 * @default 0
 *
 * @param varWuTrust
 * @text Wu Trust Variable
 * @desc Game Variable ID to sync Wu faction trust into (0 = off)
 * @type variable
 * @default 0
 *
 * @param varWeiPressure
 * @text Wei Pressure Variable
 * @desc Game Variable ID to sync Wei pressure into (0 = off)
 * @type variable
 * @default 0
 *
 * @param varCorruption
 * @text Corruption Variable
 * @desc Game Variable ID to sync corruption level into (0 = off)
 * @type variable
 * @default 0
 *
 * @param varDay
 * @text Day Variable
 * @desc Game Variable ID to sync current day into (0 = off)
 * @type variable
 * @default 0
 *
 * @param varReputation
 * @text Trade Reputation Variable
 * @desc Game Variable ID to sync trade reputation into (0 = off)
 * @type variable
 * @default 0
 *
 * @param --- Corruption ---
 *
 * @param corruptionThresholds
 * @text Corruption Thresholds
 * @desc Comma-separated levels that trigger Common Events (e.g. 25,50,75)
 * @type string
 * @default 25,50,75
 *
 * @param corruptionCommonEvents
 * @text Corruption Common Events
 * @desc Common Event IDs matching each threshold (e.g. 10,11,12)
 * @type string
 * @default 0,0,0
 *
 * @command InitGameState
 * @text Init Game State
 * @desc Initialize LOTFK state (safe to call multiple times).
 *
 * @command AdvanceDay
 * @text Advance Day
 * @desc Advance the in-game day counter.
 * @arg days
 * @text Days to Advance
 * @type number
 * @min 1
 * @default 1
 *
 * @command SetFactionTrust
 * @text Set Faction Trust
 * @desc Set a faction's trust/pressure to an exact value.
 * @arg faction
 * @text Faction
 * @type select
 * @option shu
 * @option wu
 * @option wei
 * @default shu
 * @arg value
 * @text Value
 * @type number
 * @min -100
 * @max 100
 * @default 0
 *
 * @command AddFactionTrust
 * @text Add Faction Trust
 * @desc Add (or subtract) from a faction's trust/pressure.
 * @arg faction
 * @text Faction
 * @type select
 * @option shu
 * @option wu
 * @option wei
 * @default shu
 * @arg delta
 * @text Delta
 * @type number
 * @min -100
 * @max 100
 * @default 0
 *
 * @command SetCorruption
 * @text Set Corruption
 * @desc Set the corruption level to an exact value (0-100).
 * @arg value
 * @text Value
 * @type number
 * @min 0
 * @max 100
 * @default 0
 *
 * @command AddCorruption
 * @text Add Corruption
 * @desc Add (or subtract) corruption. Checks thresholds afterward.
 * @arg delta
 * @text Delta
 * @type number
 * @min -100
 * @max 100
 * @default 0
 *
 * @command SetCorruptionFlag
 * @text Set Corruption Flag
 * @desc Set a named corruption flag (for narrative tracking).
 * @arg flag
 * @text Flag Name
 * @type string
 * @default inkTouched
 * @arg value
 * @text Value
 * @type boolean
 * @default true
 *
 * @command UnlockMarket
 * @text Unlock Market
 * @desc Unlock a market node on the route map.
 * @arg marketId
 * @text Market ID
 * @type string
 * @default YANGTZE_TEA_HOUSE
 *
 * @command AddReputation
 * @text Add Trade Reputation
 * @desc Add (or subtract) trade reputation.
 * @arg delta
 * @text Delta
 * @type number
 * @min -100
 * @max 100
 * @default 0
 *
 * @command SyncVariables
 * @text Sync Variables
 * @desc Force-sync all LOTFK values to Game Variables now.
 */
(() => {
  'use strict';

  const PLUGIN_NAME = "LOTFK_Core";
  const SCHEMA_VERSION = 2;

  // ── Helpers ──────────────────────────────────────────────────────────
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

  // ── Plugin Parameters ───────────────────────────────────────────────
  const params = PluginManager.parameters(PLUGIN_NAME);
  const VAR_IDS = {
    shuTrust:    Number(params.varShuTrust    || 0),
    wuTrust:     Number(params.varWuTrust     || 0),
    weiPressure: Number(params.varWeiPressure || 0),
    corruption:  Number(params.varCorruption  || 0),
    day:         Number(params.varDay         || 0),
    reputation:  Number(params.varReputation  || 0),
  };

  const CORRUPTION_THRESHOLDS = (params.corruptionThresholds || "")
    .split(",").map(s => Number(s.trim())).filter(n => n > 0);
  const CORRUPTION_EVENTS = (params.corruptionCommonEvents || "")
    .split(",").map(s => Number(s.trim()));

  // ── Default State Factory ───────────────────────────────────────────
  function defaultState() {
    return {
      version: SCHEMA_VERSION,
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
      markets: {},
      playerTrade: {
        reputation: 0,
        caravanCapacity: 10,
        contracts: []
      },
      route: {
        currentMarketId: "YANGTZE_TEA_HOUSE",
        unlockedMarketIds: ["YANGTZE_TEA_HOUSE"]
      }
    };
  }

  // ── State Init & Migration ──────────────────────────────────────────
  function ensureState() {
    if (!$gameSystem._lotfk) {
      $gameSystem._lotfk = defaultState();
    }
    const st = $gameSystem._lotfk;
    if ((st.version ?? 0) < SCHEMA_VERSION) {
      // v1 → v2: add triggeredThresholds array
      if (!st.corruption.triggeredThresholds) {
        st.corruption.triggeredThresholds = [];
      }
      st.version = SCHEMA_VERSION;
    }
    return st;
  }

  // ── Variable Sync ───────────────────────────────────────────────────
  function syncVariables() {
    const st = ensureState();
    if (VAR_IDS.shuTrust)    $gameVariables.setValue(VAR_IDS.shuTrust,    st.factions.shu.trust);
    if (VAR_IDS.wuTrust)     $gameVariables.setValue(VAR_IDS.wuTrust,     st.factions.wu.trust);
    if (VAR_IDS.weiPressure) $gameVariables.setValue(VAR_IDS.weiPressure, st.factions.wei.pressure);
    if (VAR_IDS.corruption)  $gameVariables.setValue(VAR_IDS.corruption,  st.corruption.level);
    if (VAR_IDS.day)         $gameVariables.setValue(VAR_IDS.day,         st.day);
    if (VAR_IDS.reputation)  $gameVariables.setValue(VAR_IDS.reputation,  st.playerTrade.reputation);
  }

  // ── Corruption Threshold Check ──────────────────────────────────────
  function checkCorruptionThresholds() {
    const st = ensureState();
    const level = st.corruption.level;
    for (let i = 0; i < CORRUPTION_THRESHOLDS.length; i++) {
      const threshold = CORRUPTION_THRESHOLDS[i];
      const eventId = CORRUPTION_EVENTS[i] || 0;
      if (level >= threshold && eventId > 0) {
        if (!st.corruption.triggeredThresholds.includes(threshold)) {
          st.corruption.triggeredThresholds.push(threshold);
          $gameTemp.reserveCommonEvent(eventId);
        }
      }
    }
  }

  // ── Game_System Alias — init on New Game ────────────────────────────
  const _Game_System_initialize = Game_System.prototype.initialize;
  Game_System.prototype.initialize = function() {
    _Game_System_initialize.apply(this, arguments);
    ensureState();
  };

  // ── DataManager Alias — persist across Save/Load ────────────────────
  const _DataManager_makeSaveContents = DataManager.makeSaveContents;
  DataManager.makeSaveContents = function() {
    const contents = _DataManager_makeSaveContents.apply(this, arguments);
    contents.lotfk = $gameSystem._lotfk;
    return contents;
  };

  const _DataManager_extractSaveContents = DataManager.extractSaveContents;
  DataManager.extractSaveContents = function(contents) {
    _DataManager_extractSaveContents.apply(this, arguments);
    if (contents.lotfk) {
      $gameSystem._lotfk = contents.lotfk;
    }
    ensureState();
    syncVariables();
  };

  // ── Scene_Map Alias — sync variables on map load ────────────────────
  const _Scene_Map_onMapLoaded = Scene_Map.prototype.onMapLoaded;
  Scene_Map.prototype.onMapLoaded = function() {
    _Scene_Map_onMapLoaded.apply(this, arguments);
    if ($gameSystem._lotfk) syncVariables();
  };

  // ── Plugin Commands ─────────────────────────────────────────────────

  PluginManager.registerCommand(PLUGIN_NAME, "InitGameState", () => {
    ensureState();
    syncVariables();
  });

  PluginManager.registerCommand(PLUGIN_NAME, "AdvanceDay", (args) => {
    const st = ensureState();
    st.day += Math.max(1, Number(args.days || 1));
    syncVariables();
  });

  PluginManager.registerCommand(PLUGIN_NAME, "SetFactionTrust", (args) => {
    const st = ensureState();
    const faction = String(args.faction || "shu");
    const value = clamp(Number(args.value || 0), -100, 100);
    if (faction === "wei") {
      st.factions.wei.pressure = value;
    } else if (st.factions[faction]) {
      st.factions[faction].trust = value;
    }
    syncVariables();
  });

  PluginManager.registerCommand(PLUGIN_NAME, "AddFactionTrust", (args) => {
    const st = ensureState();
    const faction = String(args.faction || "shu");
    const delta = Number(args.delta || 0);
    if (faction === "wei") {
      st.factions.wei.pressure = clamp(st.factions.wei.pressure + delta, -100, 100);
    } else if (st.factions[faction]) {
      st.factions[faction].trust = clamp(st.factions[faction].trust + delta, -100, 100);
    }
    syncVariables();
  });

  PluginManager.registerCommand(PLUGIN_NAME, "SetCorruption", (args) => {
    const st = ensureState();
    st.corruption.level = clamp(Number(args.value || 0), 0, 100);
    checkCorruptionThresholds();
    syncVariables();
  });

  PluginManager.registerCommand(PLUGIN_NAME, "AddCorruption", (args) => {
    const st = ensureState();
    st.corruption.level = clamp(st.corruption.level + Number(args.delta || 0), 0, 100);
    checkCorruptionThresholds();
    syncVariables();
  });

  PluginManager.registerCommand(PLUGIN_NAME, "SetCorruptionFlag", (args) => {
    const st = ensureState();
    const flag = String(args.flag || "");
    if (flag) st.corruption.flags[flag] = String(args.value) !== "false";
  });

  PluginManager.registerCommand(PLUGIN_NAME, "UnlockMarket", (args) => {
    const st = ensureState();
    const id = String(args.marketId || "");
    if (!id) return;
    if (!st.route.unlockedMarketIds.includes(id)) {
      st.route.unlockedMarketIds.push(id);
    }
  });

  PluginManager.registerCommand(PLUGIN_NAME, "AddReputation", (args) => {
    const st = ensureState();
    st.playerTrade.reputation += Number(args.delta || 0);
    syncVariables();
  });

  PluginManager.registerCommand(PLUGIN_NAME, "SyncVariables", () => {
    syncVariables();
  });

  // ── Script Call API ─────────────────────────────────────────────────
  window.LOTFK = window.LOTFK || {};
  window.LOTFK.ensureState = ensureState;
  window.LOTFK.syncVariables = syncVariables;
  window.LOTFK.checkCorruptionThresholds = checkCorruptionThresholds;

})();
