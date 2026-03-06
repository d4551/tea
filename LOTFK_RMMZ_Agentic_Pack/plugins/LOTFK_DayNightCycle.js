/*:
 * @target MZ
 * @plugindesc LOTFK Day/Night Cycle v1 — Time-of-day system with visual + mechanical effects
 * @author LOTFK Dev
 * @url https://github.com/lotfk
 *
 * @help
 * ============================================================================
 *  LOTFK_DayNightCycle — Phase-Based Time System
 * ============================================================================
 *
 *  Implements a 7-phase day cycle:
 *  dawn → morning → noon → afternoon → dusk → night → midnight
 *
 *  Each phase applies a screen tint overlay. Phases advance automatically
 *  based on step count or manually via plugin commands.
 *
 *  Integration with LOTFK_TradeAndRoutes: night market price bonuses.
 *
 *  PLUGIN ORDER: Load after LOTFK_Core.
 *
 * @param stepsPerPhase
 * @text Steps Per Phase
 * @desc Number of player steps to advance one phase. Set 0 to disable auto-advance.
 * @type number
 * @default 200
 *
 * @param nightMarketBonus
 * @text Night Market Price Bonus (%)
 * @desc Percentage price increase during night phases (for trade integration).
 * @type number
 * @min 0
 * @max 100
 * @default 15
 *
 * @param syncVariable
 * @text Phase Sync Variable
 * @desc Game Variable ID to sync current phase index into (0 = off).
 * @type variable
 * @default 0
 *
 * @command SetDayPhase
 * @text Set Day Phase
 * @desc Manually set the current day phase.
 * @arg phase
 * @text Phase
 * @type select
 * @option dawn
 * @option morning
 * @option noon
 * @option afternoon
 * @option dusk
 * @option night
 * @option midnight
 * @default morning
 *
 * @command AdvancePhase
 * @text Advance Phase
 * @desc Advance to the next day phase.
 *
 * @command GetCurrentPhase
 * @text Get Current Phase
 * @desc Store the current phase name in a Game Variable.
 * @arg variableId
 * @text Variable ID
 * @type variable
 * @default 30
 */
(() => {
  'use strict';

  const PLUGIN_NAME = 'LOTFK_DayNightCycle';
  const params = PluginManager.parameters(PLUGIN_NAME);
  const STEPS_PER_PHASE = Number(params.stepsPerPhase || 200);
  const NIGHT_BONUS = Number(params.nightMarketBonus || 15);
  const SYNC_VAR = Number(params.syncVariable || 0);

  /**
   * All day phases in order.
   * @type {string[]}
   */
  const PHASES = ['dawn', 'morning', 'noon', 'afternoon', 'dusk', 'night', 'midnight'];

  /**
   * Screen tint values for each phase [R, G, B, Gray].
   * @type {object}
   */
  const PHASE_TINTS = {
    dawn:      [20, -5, -20, 0],
    morning:   [0, 0, 0, 0],
    noon:      [10, 5, -5, 0],
    afternoon: [15, 0, -15, 0],
    dusk:      [25, -15, -30, 10],
    night:     [-50, -50, -10, 30],
    midnight:  [-68, -68, -20, 50]
  };

  var stepCounter = 0;
  var lastPhase = '';

  /**
   * Gets the current day phase from state.
   * @returns {string}
   */
  function getCurrentPhase() {
    var st = LOTFK_Utils.lotfk();
    return st.dayPhase || 'morning';
  }

  /**
   * Sets the day phase and applies visual tint.
   * @param {string} phase - Phase name.
   */
  function setPhase(phase) {
    if (PHASES.indexOf(phase) === -1) return;
    var st = LOTFK_Utils.lotfk();
    st.dayPhase = phase;

    var tint = PHASE_TINTS[phase] || [0, 0, 0, 0];
    $gameScreen.startTint(tint, 90);

    if (SYNC_VAR > 0) {
      $gameVariables.setValue(SYNC_VAR, PHASES.indexOf(phase));
    }

    lastPhase = phase;
  }

  /**
   * Advances to the next phase in the cycle.
   * Wraps midnight → dawn and increments the day counter.
   */
  function advancePhase() {
    var current = getCurrentPhase();
    var idx = PHASES.indexOf(current);
    var nextIdx = (idx + 1) % PHASES.length;

    if (nextIdx === 0) {
      var st = LOTFK_Utils.lotfk();
      st.day += 1;
    }

    setPhase(PHASES[nextIdx]);
  }

  /**
   * Checks if the current phase is a night phase.
   * @returns {boolean}
   */
  function isNightPhase() {
    var phase = getCurrentPhase();
    return phase === 'night' || phase === 'midnight' || phase === 'dusk';
  }

  /**
   * Returns the night market price multiplier.
   * @returns {number} Multiplier (1.0 during day, 1.0 + bonus% at night).
   */
  function nightPriceMultiplier() {
    return isNightPhase() ? 1 + (NIGHT_BONUS / 100) : 1.0;
  }

  /* ── Game_Player Step Counting ─────────────────────────── */

  if (STEPS_PER_PHASE > 0) {
    const _Game_Player_increaseSteps = Game_Player.prototype.increaseSteps;

    /**
     * Tracks steps and auto-advances day phase.
     */
    Game_Player.prototype.increaseSteps = function () {
      _Game_Player_increaseSteps.call(this);
      stepCounter++;
      if (stepCounter >= STEPS_PER_PHASE) {
        stepCounter = 0;
        advancePhase();
      }
    };
  }

  /* ── Scene_Map — Apply Tint on Map Load ────────────────── */

  const _Scene_Map_onMapLoaded = Scene_Map.prototype.onMapLoaded;

  /**
   * Reapplies the day phase tint when a map loads.
   */
  Scene_Map.prototype.onMapLoaded = function () {
    _Scene_Map_onMapLoaded.call(this);
    var phase = getCurrentPhase();
    if (phase !== lastPhase) {
      setPhase(phase);
    }
  };

  /* ── DataManager — Persist step counter ────────────────── */

  const _DataManager_makeSaveContents = DataManager.makeSaveContents;

  /**
   * Saves the step counter alongside other save data.
   * @returns {object}
   */
  DataManager.makeSaveContents = function () {
    var contents = _DataManager_makeSaveContents.call(this);
    contents._lotfkDayNightSteps = stepCounter;
    return contents;
  };

  const _DataManager_extractSaveContents = DataManager.extractSaveContents;

  /**
   * Restores the step counter from save data.
   * @param {object} contents - Save data.
   */
  DataManager.extractSaveContents = function (contents) {
    _DataManager_extractSaveContents.call(this, contents);
    stepCounter = contents._lotfkDayNightSteps || 0;
  };

  /* ── Plugin Commands ───────────────────────────────────── */

  PluginManager.registerCommand(PLUGIN_NAME, 'SetDayPhase', function (args) {
    setPhase(String(args.phase || 'morning'));
  });

  PluginManager.registerCommand(PLUGIN_NAME, 'AdvancePhase', function () {
    advancePhase();
  });

  PluginManager.registerCommand(PLUGIN_NAME, 'GetCurrentPhase', function (args) {
    var varId = Number(args.variableId || 30);
    $gameVariables.setValue(varId, getCurrentPhase());
  });

  /* ── Export for inter-plugin access ────────────────────── */
  window.LOTFK_DayNight = {
    getCurrentPhase: getCurrentPhase,
    isNightPhase: isNightPhase,
    nightPriceMultiplier: nightPriceMultiplier,
    advancePhase: advancePhase,
    setPhase: setPhase
  };
})();
