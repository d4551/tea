/*:
 * @target MZ
 * @plugindesc LOTFK Beast Summon v1 — Sacred Beast summon system with gauges
 * @author LOTFK Dev
 * @url https://github.com/lotfk
 *
 * @help
 * ============================================================================
 *  LOTFK_BeastSummon — Shan Hai Jing Sacred Beast Summoning
 * ============================================================================
 *
 *  Implements the four Sacred Beast summon system:
 *  - Azure Dragon (Wood), Vermilion Bird (Fire),
 *    White Tiger (Metal), Black Tortoise (Water)
 *
 *  Beast gauges charge while an actor holds an aligned stance.
 *  When gauge reaches 100 and corruption is below the beast's max threshold,
 *  the actor may cast the beast's finisher skill.
 *
 *  PLUGIN ORDER: Load after LOTFK_BrewBattle.
 *
 * @param beasts
 * @text Beast Definitions
 * @desc JSON array of beast configs.
 * @type string
 * @default [{"id":"azure","name":"Azure Dragon","element":"wood","skillId":50,"animationId":10,"corruptionMax":75,"chargeRate":5},{"id":"vermilion","name":"Vermilion Bird","element":"fire","skillId":51,"animationId":11,"corruptionMax":60,"chargeRate":4},{"id":"white","name":"White Tiger","element":"metal","skillId":52,"animationId":12,"corruptionMax":80,"chargeRate":4},{"id":"black","name":"Black Tortoise","element":"water","skillId":53,"animationId":13,"corruptionMax":90,"chargeRate":3}]
 *
 * @param gaugeWidth
 * @text Gauge Width
 * @desc Width of the beast gauge window in battle.
 * @type number
 * @default 200
 *
 * @command CheckBeastReady
 * @text Check Beast Ready
 * @desc Check if a beast is ready to summon and store result in a switch.
 * @arg beastId
 * @text Beast ID
 * @type string
 * @default azure
 * @arg switchId
 * @text Result Switch
 * @type switch
 * @default 20
 *
 * @command ForceSummon
 * @text Force Summon
 * @desc Force-activate a beast summon (for story events).
 * @arg beastId
 * @text Beast ID
 * @type string
 * @default azure
 *
 * @command ResetBeastGauge
 * @text Reset Beast Gauge
 * @desc Reset a beast's charge gauge to zero.
 * @arg beastId
 * @text Beast ID
 * @type string
 * @default azure
 *
 * @command ResetAllGauges
 * @text Reset All Beast Gauges
 * @desc Reset all beast gauges to zero.
 */
(() => {
  'use strict';

  const PLUGIN_NAME = 'LOTFK_BeastSummon';
  const params = PluginManager.parameters(PLUGIN_NAME);

  var BEASTS = [];
  var beastRaw = params.beasts || '[]';
  BEASTS = JSON.parse(beastRaw);

  const GAUGE_W = Number(params.gaugeWidth || 200);

  /**
   * Finds a beast definition by ID.
   * @param {string} id - Beast identifier.
   * @returns {object|null}
   */
  function beastDef(id) {
    for (var i = 0; i < BEASTS.length; i++) {
      if (BEASTS[i].id === id) return BEASTS[i];
    }
    return null;
  }

  /**
   * Checks if a beast is ready to summon.
   * @param {string} beastId - Beast identifier.
   * @returns {boolean}
   */
  function isBeastReady(beastId) {
    var beast = beastDef(beastId);
    if (!beast) return false;
    var st = LOTFK_Utils.lotfk();
    var gauge = st.beastGauges[beastId] || 0;
    var corruption = st.corruption.level;
    return gauge >= 100 && corruption <= beast.corruptionMax;
  }

  /**
   * Charges beast gauges for actors in aligned stances.
   * Called at end of each battle turn.
   */
  function chargeBeastGauges() {
    var st = LOTFK_Utils.lotfk();
    var party = $gameParty.battleMembers();

    for (var i = 0; i < party.length; i++) {
      var actor = party[i];
      var stanceElement = null;

      for (var j = 0; j < BEASTS.length; j++) {
        var beast = BEASTS[j];
        var stateIds = getStanceStateIds();
        for (var s = 0; s < actor.states().length; s++) {
          var state = actor.states()[s];
          if (stateIds.indexOf(state.id) !== -1) {
            var notetag = LOTFK_Utils.parseLotfkNotetag(state, 'lotfkElement');
            if (notetag === beast.element) {
              st.beastGauges[beast.id] = LOTFK_Utils.clamp(
                (st.beastGauges[beast.id] || 0) + beast.chargeRate, 0, 100
              );
            }
          }
        }
      }
    }
  }

  /**
   * Gets all stance state IDs from BrewBattle config.
   * @returns {number[]}
   */
  function getStanceStateIds() {
    var bbParams = PluginManager.parameters('LOTFK_BrewBattle');
    if (!bbParams) return [];
    return [
      Number(bbParams.stateWood || 0),
      Number(bbParams.stateFire || 0),
      Number(bbParams.stateEarth || 0),
      Number(bbParams.stateMetal || 0),
      Number(bbParams.stateWater || 0)
    ].filter(function (n) { return n > 0; });
  }

  /* ── Window_BeastGauge ─────────────────────────────────── */

  /**
   * Battle overlay showing sacred beast charge gauges.
   * @constructor
   */
  function Window_BeastGauge() {
    this.initialize.apply(this, arguments);
  }

  Window_BeastGauge.prototype = Object.create(Window_Base.prototype);
  Window_BeastGauge.prototype.constructor = Window_BeastGauge;

  /**
   * Initializes the gauge window.
   * @param {Rectangle} rect - Window bounds.
   */
  Window_BeastGauge.prototype.initialize = function (rect) {
    Window_Base.prototype.initialize.call(this, rect);
    this.opacity = 160;
    this.refresh();
  };

  /**
   * Redraws all beast gauges.
   */
  Window_BeastGauge.prototype.refresh = function () {
    this.contents.clear();
    var st = LOTFK_Utils.lotfk();
    var y = 0;
    var lineH = 22;

    this.contents.fontSize = 11;
    this.changeTextColor(ColorManager.systemColor());
    this.drawText('Sacred Beasts', 0, y, this.innerWidth, 'center');
    y += lineH + 2;

    var colors = {
      azure: '#57c49a',
      vermilion: '#e4a380',
      white: '#b9a2c4',
      black: '#7c8ca0'
    };

    for (var i = 0; i < BEASTS.length; i++) {
      var beast = BEASTS[i];
      var gauge = st.beastGauges[beast.id] || 0;
      var ready = isBeastReady(beast.id);
      var label = beast.name + (ready ? ' ★' : '');

      this.resetFontSettings();
      this.contents.fontSize = 10;
      this.drawText(label, 0, y, this.innerWidth, 'left');

      var barY = y + 14;
      var barW = this.innerWidth;
      var barH = 4;
      var pct = LOTFK_Utils.clamp(gauge / 100, 0, 1);
      var color = colors[beast.id] || '#ffffff';

      this.contents.fillRect(0, barY, barW, barH, 'rgba(255,255,255,0.12)');
      this.contents.fillRect(0, barY, Math.round(barW * pct), barH, color);
      y += lineH;
    }
  };

  /**
   * Updates the gauge display each frame.
   */
  Window_BeastGauge.prototype.update = function () {
    Window_Base.prototype.update.call(this);
    if (Graphics.frameCount % 30 === 0) {
      this.refresh();
    }
  };

  /* ── Scene_Battle Integration ──────────────────────────── */

  const _Scene_Battle_createAllWindows = Scene_Battle.prototype.createAllWindows;

  /**
   * Creates the beast gauge window in battle.
   */
  Scene_Battle.prototype.createAllWindows = function () {
    _Scene_Battle_createAllWindows.call(this);
    var h = 30 + (BEASTS.length * 22);
    var x = Graphics.boxWidth - GAUGE_W - 10;
    var rect = new Rectangle(x, 10, GAUGE_W, h);
    this._beastGauge = new Window_BeastGauge(rect);
    this.addWindow(this._beastGauge);
  };

  /* ── Turn-end gauge charging ───────────────────────────── */

  const _BattleManager_endTurn = BattleManager.endTurn;

  /**
   * Charges beast gauges at end of each battle turn.
   */
  BattleManager.endTurn = function () {
    _BattleManager_endTurn.call(this);
    chargeBeastGauges();
  };

  /* ── Plugin Commands ───────────────────────────────────── */

  PluginManager.registerCommand(PLUGIN_NAME, 'CheckBeastReady', function (args) {
    var beastId = String(args.beastId || 'azure');
    var switchId = Number(args.switchId || 20);
    $gameSwitches.setValue(switchId, isBeastReady(beastId));
  });

  PluginManager.registerCommand(PLUGIN_NAME, 'ForceSummon', function (args) {
    var beastId = String(args.beastId || 'azure');
    var beast = beastDef(beastId);
    if (!beast) return;
    var actor = $gameParty.leader();
    if (actor && beast.animationId) {
      actor.startAnimation(beast.animationId);
    }
    var st = LOTFK_Utils.lotfk();
    st.beastGauges[beastId] = 0;
  });

  PluginManager.registerCommand(PLUGIN_NAME, 'ResetBeastGauge', function (args) {
    var beastId = String(args.beastId || 'azure');
    var st = LOTFK_Utils.lotfk();
    st.beastGauges[beastId] = 0;
  });

  PluginManager.registerCommand(PLUGIN_NAME, 'ResetAllGauges', function () {
    var st = LOTFK_Utils.lotfk();
    st.beastGauges = { azure: 0, vermilion: 0, white: 0, black: 0 };
  });
})();
