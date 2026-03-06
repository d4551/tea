/*:
 * @target MZ
 * @plugindesc LOTFK Diplomacy v1 — Faction HUD, trust gates, alliance events
 * @author LOTFK Dev
 * @url https://github.com/lotfk
 *
 * @help
 * ============================================================================
 *  LOTFK_Diplomacy — Faction Trust HUD & Event Gates
 * ============================================================================
 *
 *  Provides a real-time faction trust meter overlay and trust-threshold
 *  triggered Common Events for narrative branching.
 *
 *  FEATURES:
 *  - Window_FactionHUD: map overlay showing Shu/Wu/Wei trust meters
 *  - Trust Gate system: fire Common Events when trust crosses thresholds
 *  - Scene_FactionStatus: full-screen faction detail view (from menu)
 *
 *  PLUGIN ORDER: Load after LOTFK_Core, before LOTFK_TradeAndRoutes.
 *
 * @param hudX
 * @text HUD X Position
 * @desc X position of the faction HUD on map screen.
 * @type number
 * @default 10
 *
 * @param hudY
 * @text HUD Y Position
 * @desc Y position of the faction HUD on map screen.
 * @type number
 * @default 80
 *
 * @param hudWidth
 * @text HUD Width
 * @desc Width of the faction HUD window.
 * @type number
 * @default 220
 *
 * @param shuGates
 * @text Shu Trust Gates
 * @desc Comma-separated threshold:commonEventId pairs (e.g. 30:10,60:11)
 * @type string
 * @default
 *
 * @param wuGates
 * @text Wu Trust Gates
 * @desc Comma-separated threshold:commonEventId pairs
 * @type string
 * @default
 *
 * @param weiGates
 * @text Wei Pressure Gates
 * @desc Comma-separated threshold:commonEventId pairs
 * @type string
 * @default
 *
 * @command ShowFactionHUD
 * @text Show Faction HUD
 * @desc Display the faction trust meters on the map screen.
 *
 * @command HideFactionHUD
 * @text Hide Faction HUD
 * @desc Hide the faction trust meters.
 *
 * @command CheckTrustGate
 * @text Check Trust Gate
 * @desc Manually check and trigger any pending trust gate events.
 * @arg faction
 * @text Faction
 * @type select
 * @option shu
 * @option wu
 * @option wei
 * @default shu
 */
(() => {
  'use strict';

  const PLUGIN_NAME = 'LOTFK_Diplomacy';
  const params = PluginManager.parameters(PLUGIN_NAME);
  const HUD_X = Number(params.hudX || 10);
  const HUD_Y = Number(params.hudY || 80);
  const HUD_W = Number(params.hudWidth || 220);

  /**
   * Parses gate config strings into threshold/event arrays.
   * @param {string} str - Config string (e.g. '30:10,60:11').
   * @returns {Array<{threshold:number, eventId:number}>}
   */
  function parseGates(str) {
    if (!str) return [];
    return str.split(',').map(function (pair) {
      var parts = pair.trim().split(':');
      return { threshold: Number(parts[0]), eventId: Number(parts[1]) };
    }).filter(function (g) { return g.threshold > 0 && g.eventId > 0; });
  }

  const GATES = {
    shu: parseGates(params.shuGates),
    wu: parseGates(params.wuGates),
    wei: parseGates(params.weiGates)
  };

  /* ── Trust Gate Check ──────────────────────────────────── */

  /**
   * Checks if a faction's trust has crossed any gate thresholds.
   * @param {string} faction - Faction key (shu, wu, wei).
   */
  function checkTrustGates(faction) {
    var st = LOTFK_Utils.lotfk();
    var gates = GATES[faction];
    if (!gates || !gates.length) return;

    var value;
    if (faction === 'wei') {
      value = st.factions.wei.pressure;
    } else {
      value = st.factions[faction].trust;
    }

    var triggered = st.diplomacy.triggeredGates;

    for (var i = 0; i < gates.length; i++) {
      var gate = gates[i];
      var key = faction + ':' + gate.threshold;
      if (value >= gate.threshold && triggered.indexOf(key) === -1) {
        triggered.push(key);
        $gameTemp.reserveCommonEvent(gate.eventId);
      }
    }
  }

  /* ── Window_FactionHUD ─────────────────────────────────── */

  /**
   * Map overlay window showing faction trust meters.
   * @constructor
   */
  function Window_FactionHUD() {
    this.initialize.apply(this, arguments);
  }

  Window_FactionHUD.prototype = Object.create(Window_Base.prototype);
  Window_FactionHUD.prototype.constructor = Window_FactionHUD;

  /**
   * Initializes the HUD window.
   * @param {Rectangle} rect - Window bounds.
   */
  Window_FactionHUD.prototype.initialize = function (rect) {
    Window_Base.prototype.initialize.call(this, rect);
    this.opacity = 180;
    this.refresh();
  };

  /**
   * Redraws all faction meters.
   */
  Window_FactionHUD.prototype.refresh = function () {
    this.contents.clear();
    var st = LOTFK_Utils.lotfk();
    var lineH = 28;
    var y = 0;

    this.contents.fontSize = 13;
    this.changeTextColor(ColorManager.systemColor());
    this.drawText('Faction Trust', 0, y, this.innerWidth, 'center');
    y += lineH + 4;

    this._drawMeter('Shu (' + st.factions.shu.trust + ')', st.factions.shu.trust, y, '#57c49a');
    y += lineH;
    this._drawMeter('Wu (' + st.factions.wu.trust + ')', st.factions.wu.trust, y, '#e4a3b3');
    y += lineH;
    this._drawMeter('Wei (' + st.factions.wei.pressure + ')', st.factions.wei.pressure, y, '#c6a04d');
  };

  /**
   * Draws a single faction meter bar.
   * @param {string} label - Faction label.
   * @param {number} value - Trust/pressure value (-100 to 100).
   * @param {number} y - Y position.
   * @param {string} color - Bar color hex.
   */
  Window_FactionHUD.prototype._drawMeter = function (label, value, y, color) {
    var w = this.innerWidth;
    this.resetFontSettings();
    this.contents.fontSize = 11;
    this.drawText(label, 0, y, w, 'left');

    var barY = y + 16;
    var barW = w;
    var barH = 6;
    var pct = LOTFK_Utils.clamp((value + 100) / 200, 0, 1);

    this.contents.fillRect(0, barY, barW, barH, 'rgba(255,255,255,0.15)');
    this.contents.fillRect(0, barY, Math.round(barW * pct), barH, color);
  };

  /**
   * Updates the HUD each frame.
   */
  Window_FactionHUD.prototype.update = function () {
    Window_Base.prototype.update.call(this);
    if (Graphics.frameCount % 60 === 0) {
      this.refresh();
    }
  };

  /* ── Scene_Map Integration ─────────────────────────────── */

  const _Scene_Map_createAllWindows = Scene_Map.prototype.createAllWindows;

  /**
   * Creates the faction HUD window on the map scene.
   */
  Scene_Map.prototype.createAllWindows = function () {
    _Scene_Map_createAllWindows.call(this);
    var h = 120;
    var rect = new Rectangle(HUD_X, HUD_Y, HUD_W, h);
    this._factionHud = new Window_FactionHUD(rect);
    this._factionHud.visible = false;
    this.addWindow(this._factionHud);
  };

  const _Scene_Map_update = Scene_Map.prototype.update;

  /**
   * Updates HUD visibility based on diplomacy state.
   */
  Scene_Map.prototype.update = function () {
    _Scene_Map_update.call(this);
    if (this._factionHud && $gameSystem._lotfk) {
      this._factionHud.visible = $gameSystem._lotfk.diplomacy.hudVisible;
    }
  };

  /* ── Scene_FactionStatus ───────────────────────────────── */

  /**
   * Full-screen faction status scene accessible from menu.
   * @constructor
   */
  function Scene_FactionStatus() {
    this.initialize.apply(this, arguments);
  }

  Scene_FactionStatus.prototype = Object.create(Scene_MenuBase.prototype);
  Scene_FactionStatus.prototype.constructor = Scene_FactionStatus;

  /**
   * Creates the faction status windows.
   */
  Scene_FactionStatus.prototype.create = function () {
    Scene_MenuBase.prototype.create.call(this);
    var st = LOTFK_Utils.lotfk();
    var w = Graphics.boxWidth - 100;
    var h = Graphics.boxHeight - 100;
    var rect = new Rectangle(50, 50, w, h);
    this._statusWindow = new Window_Base(rect);
    this._statusWindow.contents.fontSize = 14;

    var y = 0;
    var lineH = 30;
    this._statusWindow.drawText('Faction Status', 0, y, w - 40, 'center');
    y += lineH + 10;

    var factions = [
      { name: 'Kingdom of Shu', key: 'shu', field: 'trust', color: '#57c49a' },
      { name: 'Kingdom of Wu', key: 'wu', field: 'trust', color: '#e4a3b3' },
      { name: 'Wei Empire', key: 'wei', field: 'pressure', color: '#c6a04d' }
    ];

    for (var i = 0; i < factions.length; i++) {
      var f = factions[i];
      var val = st.factions[f.key][f.field];
      this._statusWindow.drawText(f.name + ': ' + val, 0, y, w - 40, 'left');
      y += lineH;
    }

    y += 10;
    this._statusWindow.drawText('Trade Reputation: ' + st.playerTrade.reputation, 0, y, w - 40, 'left');
    y += lineH;
    this._statusWindow.drawText('Day: ' + st.day, 0, y, w - 40, 'left');

    this.addWindow(this._statusWindow);
  };

  window.Scene_FactionStatus = Scene_FactionStatus;

  /* ── Plugin Commands ───────────────────────────────────── */

  PluginManager.registerCommand(PLUGIN_NAME, 'ShowFactionHUD', function () {
    var st = LOTFK_Utils.lotfk();
    st.diplomacy.hudVisible = true;
  });

  PluginManager.registerCommand(PLUGIN_NAME, 'HideFactionHUD', function () {
    var st = LOTFK_Utils.lotfk();
    st.diplomacy.hudVisible = false;
  });

  PluginManager.registerCommand(PLUGIN_NAME, 'CheckTrustGate', function (args) {
    var faction = String(args.faction || 'shu');
    checkTrustGates(faction);
  });

  /* ── Auto-check gates on faction trust changes ─────────── */
  const _Scene_Map_onMapLoaded = Scene_Map.prototype.onMapLoaded;

  /**
   * Checks all faction gates when a map loads.
   */
  Scene_Map.prototype.onMapLoaded = function () {
    _Scene_Map_onMapLoaded.call(this);
    checkTrustGates('shu');
    checkTrustGates('wu');
    checkTrustGates('wei');
  };
})();
