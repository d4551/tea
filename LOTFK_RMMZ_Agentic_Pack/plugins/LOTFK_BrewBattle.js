/*:
 * @target MZ
 * @plugindesc LOTFK Brew Swap Battle System v2 — Wuxing stances in combat
 * @author LOTFK Dev
 * @url https://github.com/lotfk
 *
 * @help
 * ============================================================================
 * Leaves of the Fallen Kingdom — Brew Swap Battle System
 * ============================================================================
 *
 * Adds a "Brew Swap" command to the actor battle menu that lets actors
 * switch between five Wuxing (五行) tea stances mid-battle.
 *
 * WUXING CYCLE:
 *   WOOD → FIRE → EARTH → METAL → WATER → WOOD  (Generating)
 *   WOOD → EARTH, FIRE → METAL, EARTH → WATER,   (Overcoming)
 *   METAL → WOOD, WATER → FIRE
 *
 * Each stance applies a state to the actor:
 *   Wood  (State ID from param)  — +ATK, heals over time
 *   Fire  (State ID from param)  — +MAT, crit rate up
 *   Earth (State ID from param)  — +DEF, +MDF
 *   Metal (State ID from param)  — +AGI, pierce DEF
 *   Water (State ID from param)  — +MDF, MP regen
 *
 * CORRUPTION INVERSION:
 *   When corruption >= threshold, stance effects twist:
 *   healing becomes drain, buffs become debuffs on enemies, etc.
 *   This is tracked via the "corrupted" flag on the actor.
 *
 * NOTETAGS (Items/Skills):
 *   <lotfkElement:wood|fire|earth|metal|water>
 *     Skills with this tag gain bonus damage when actor stance matches
 *     the generating cycle (e.g. Wood stance + Fire skill = bonus).
 *
 * PLUGIN ORDER: Load after LOTFK_Core.
 *
 * @param --- State IDs ---
 *
 * @param stateWood
 * @text Wood Stance State
 * @desc State ID for Wood stance (create in Database > States)
 * @type state
 * @default 0
 *
 * @param stateFire
 * @text Fire Stance State
 * @desc State ID for Fire stance
 * @type state
 * @default 0
 *
 * @param stateEarth
 * @text Earth Stance State
 * @desc State ID for Earth stance
 * @type state
 * @default 0
 *
 * @param stateMetal
 * @text Metal Stance State
 * @desc State ID for Metal stance
 * @type state
 * @default 0
 *
 * @param stateWater
 * @text Water Stance State
 * @desc State ID for Water stance
 * @type state
 * @default 0
 *
 * @param --- Settings ---
 *
 * @param commandName
 * @text Command Name
 * @desc Label shown in the actor command menu
 * @type string
 * @default Brew Swap
 *
 * @param stanceBonus
 * @text Generating Cycle Bonus
 * @desc Damage multiplier when stance feeds skill element (e.g. 1.3 = +30%)
 * @type number
 * @decimals 2
 * @min 1.00
 * @max 3.00
 * @default 1.30
 *
 * @param overcomingBonus
 * @text Overcoming Cycle Bonus
 * @desc Damage multiplier for overcoming element matchup
 * @type number
 * @decimals 2
 * @min 1.00
 * @max 3.00
 * @default 1.50
 *
 * @param corruptionThreshold
 * @text Corruption Inversion Threshold
 * @desc Corruption level at which stance effects invert (0 = never)
 * @type number
 * @min 0
 * @max 100
 * @default 50
 *
 * @command EnableBrewSwap
 * @text Enable Brew Swap
 * @desc Enable or disable the Brew Swap battle command globally.
 * @arg enabled
 * @text Enabled
 * @type boolean
 * @default true
 *
 * @command SetActorStance
 * @text Set Actor Stance
 * @desc Force-set an actor's Wuxing stance outside of battle.
 * @arg actorId
 * @text Actor ID
 * @type actor
 * @default 1
 * @arg stance
 * @text Stance
 * @type select
 * @option wood
 * @option fire
 * @option earth
 * @option metal
 * @option water
 * @option none
 * @default wood
 *
 * @command ClearActorStance
 * @text Clear Actor Stance
 * @desc Remove the current stance from an actor.
 * @arg actorId
 * @text Actor ID
 * @type actor
 * @default 1
 */
(() => {
  'use strict';

  const PLUGIN_NAME = "LOTFK_BrewBattle";

  // ── Parameters ──────────────────────────────────────────────────────
  const params = PluginManager.parameters(PLUGIN_NAME);

  const STATE_IDS = {
    wood:  Number(params.stateWood  || 0),
    fire:  Number(params.stateFire  || 0),
    earth: Number(params.stateEarth || 0),
    metal: Number(params.stateMetal || 0),
    water: Number(params.stateWater || 0),
  };

  const COMMAND_NAME      = String(params.commandName || "Brew Swap");
  const GENERATING_BONUS  = Number(params.stanceBonus || 1.30);
  const OVERCOMING_BONUS  = Number(params.overcomingBonus || 1.50);
  const CORRUPTION_THRESH = Number(params.corruptionThreshold || 50);

  const STANCES = ["wood", "fire", "earth", "metal", "water"];

  // ── Wuxing Cycle Tables ─────────────────────────────────────────────
  // Generating cycle: each element feeds the next
  const GENERATING = {
    wood: "fire", fire: "earth", earth: "metal",
    metal: "water", water: "wood"
  };

  // Overcoming cycle: each element conquers another
  const OVERCOMING = {
    wood: "earth", fire: "metal", earth: "water",
    metal: "wood", water: "fire"
  };

  let brewSwapEnabled = true;

  // ── Stance Management ───────────────────────────────────────────────

  function getAllStanceStateIds() {
    return STANCES.map(s => STATE_IDS[s]).filter(id => id > 0);
  }

  function removeAllStanceStates(actor) {
    const ids = getAllStanceStateIds();
    for (const id of ids) {
      if (actor.isStateAffected(id)) {
        actor.removeState(id);
      }
    }
  }

  function applyStance(actor, stance) {
    if (!actor) return;
    removeAllStanceStates(actor);
    actor._lotfkStance = stance === "none" ? "" : String(stance);
    const stateId = STATE_IDS[stance];
    if (stateId > 0) {
      actor.addState(stateId);
    }
  }

  function getActorStance(actor) {
    return actor ? (actor._lotfkStance || "") : "";
  }

  function isCorrupted() {
    if (CORRUPTION_THRESH <= 0) return false;
    const st = window.LOTFK?.ensureState ? window.LOTFK.ensureState() : null;
    return st ? st.corruption.level >= CORRUPTION_THRESH : false;
  }

  // ── Wuxing Bonus Calculation ────────────────────────────────────────

  function getSkillElement(item) {
    if (!item || !item.meta) return "";
    return String(item.meta.lotfkElement || "").toLowerCase().trim();
  }

  function getWuxingMultiplier(actorStance, skillElement) {
    if (!actorStance || !skillElement) return 1.0;
    // Generating: actor stance feeds skill element → bonus
    if (GENERATING[actorStance] === skillElement) return GENERATING_BONUS;
    // Overcoming: actor stance conquers skill element → bigger bonus
    if (OVERCOMING[actorStance] === skillElement) return OVERCOMING_BONUS;
    return 1.0;
  }

  // ── Damage Formula Integration ──────────────────────────────────────
  // Alias Game_Action.makeDamageValue to apply Wuxing bonuses
  const _Game_Action_makeDamageValue = Game_Action.prototype.makeDamageValue;
  Game_Action.prototype.makeDamageValue = function(target, critical) {
    let value = _Game_Action_makeDamageValue.apply(this, arguments);
    const subject = this.subject();
    if (subject && subject.isActor()) {
      const stance = getActorStance(subject);
      const element = getSkillElement(this.item());
      const mult = getWuxingMultiplier(stance, element);
      if (mult !== 1.0) {
        value = Math.round(value * mult);
      }
      // Corruption inversion: positive healing becomes damage drain
      if (isCorrupted() && value < 0 && stance) {
        value = Math.abs(value);
      }
    }
    return value;
  };

  // ── Actor Command Window — Add "Brew Swap" ──────────────────────────
  const _Window_ActorCommand_makeCommandList =
    Window_ActorCommand.prototype.makeCommandList;
  Window_ActorCommand.prototype.makeCommandList = function() {
    _Window_ActorCommand_makeCommandList.apply(this, arguments);
    if (brewSwapEnabled && this._actor) {
      this.addCommand(COMMAND_NAME, "lotfkBrewSwap", true);
    }
  };

  // ── Brew Swap Selection Window ──────────────────────────────────────
  function Window_BrewSwap() {
    this.initialize(...arguments);
  }

  Window_BrewSwap.prototype = Object.create(Window_Command.prototype);
  Window_BrewSwap.prototype.constructor = Window_BrewSwap;

  Window_BrewSwap.prototype.initialize = function(rect) {
    Window_Command.prototype.initialize.call(this, rect);
    this.hide();
    this.deactivate();
    this._actor = null;
  };

  Window_BrewSwap.prototype.setActor = function(actor) {
    this._actor = actor;
    this.refresh();
  };

  Window_BrewSwap.prototype.makeCommandList = function() {
    const currentStance = this._actor ? getActorStance(this._actor) : "";
    const corrupted = isCorrupted();
    for (const stance of STANCES) {
      const label = this.stanceLabel(stance, currentStance, corrupted);
      const enabled = stance !== currentStance;
      this.addCommand(label, "stance", enabled, stance);
    }
  };

  Window_BrewSwap.prototype.stanceLabel = function(stance, current, corrupted) {
    const names = {
      wood:  "Wood  (木)",
      fire:  "Fire  (火)",
      earth: "Earth (土)",
      metal: "Metal (金)",
      water: "Water (水)"
    };
    let label = names[stance] || stance;
    if (stance === current) label += " [Active]";
    if (corrupted) label += " *";
    return label;
  };

  Window_BrewSwap.prototype.numVisibleRows = function() {
    return STANCES.length;
  };

  // ── Scene_Battle Integration ────────────────────────────────────────
  const _Scene_Battle_createAllWindows = Scene_Battle.prototype.createAllWindows;
  Scene_Battle.prototype.createAllWindows = function() {
    _Scene_Battle_createAllWindows.apply(this, arguments);
    this.createBrewSwapWindow();
  };

  Scene_Battle.prototype.createBrewSwapWindow = function() {
    const rect = this.brewSwapWindowRect();
    this._brewSwapWindow = new Window_BrewSwap(rect);
    this._brewSwapWindow.setHandler("stance", this.onBrewSwapSelect.bind(this));
    this._brewSwapWindow.setHandler("cancel", this.onBrewSwapCancel.bind(this));
    this.addWindow(this._brewSwapWindow);
  };

  Scene_Battle.prototype.brewSwapWindowRect = function() {
    const ww = 300;
    const wh = this.calcWindowHeight(STANCES.length, true);
    const wx = Graphics.boxWidth - ww;
    const wy = Graphics.boxHeight - wh - this.calcWindowHeight(4, true);
    return new Rectangle(wx, wy, ww, wh);
  };

  // Hook into the actor command window to handle "Brew Swap" selection
  const _Scene_Battle_createActorCommandWindow =
    Scene_Battle.prototype.createActorCommandWindow;
  Scene_Battle.prototype.createActorCommandWindow = function() {
    _Scene_Battle_createActorCommandWindow.apply(this, arguments);
    this._actorCommandWindow.setHandler(
      "lotfkBrewSwap",
      this.commandBrewSwap.bind(this)
    );
  };

  Scene_Battle.prototype.commandBrewSwap = function() {
    this._brewSwapWindow.setActor(BattleManager.actor());
    this._brewSwapWindow.refresh();
    this._brewSwapWindow.show();
    this._brewSwapWindow.activate();
    this._brewSwapWindow.select(0);
  };

  Scene_Battle.prototype.onBrewSwapSelect = function() {
    const stance = this._brewSwapWindow.currentExt();
    const actor = BattleManager.actor();
    if (actor && stance) {
      applyStance(actor, stance);
    }
    this._brewSwapWindow.hide();
    this._brewSwapWindow.deactivate();
    // Return to actor command after selecting stance (costs the turn action)
    this._actorCommandWindow.activate();
  };

  Scene_Battle.prototype.onBrewSwapCancel = function() {
    this._brewSwapWindow.hide();
    this._brewSwapWindow.deactivate();
    this._actorCommandWindow.activate();
  };

  // ── Plugin Commands ─────────────────────────────────────────────────

  PluginManager.registerCommand(PLUGIN_NAME, "EnableBrewSwap", (args) => {
    brewSwapEnabled = String(args.enabled) !== "false";
  });

  PluginManager.registerCommand(PLUGIN_NAME, "SetActorStance", (args) => {
    const actor = $gameActors.actor(Number(args.actorId || 1));
    if (actor) applyStance(actor, String(args.stance || "wood"));
  });

  PluginManager.registerCommand(PLUGIN_NAME, "ClearActorStance", (args) => {
    const actor = $gameActors.actor(Number(args.actorId || 1));
    if (actor) applyStance(actor, "none");
  });

  // ── Save/Load — Persist Stance ──────────────────────────────────────
  // Stances are stored on actor._lotfkStance which is a simple string.
  // RMMZ auto-saves actor properties, so this persists naturally.
  // On load, re-apply stance states to ensure state consistency.
  const _DataManager_extractSaveContents_brew = DataManager.extractSaveContents;
  DataManager.extractSaveContents = function(contents) {
    _DataManager_extractSaveContents_brew.apply(this, arguments);
    // Re-apply stance states for all actors after load
    for (const actor of $gameParty.members()) {
      const stance = getActorStance(actor);
      if (stance) applyStance(actor, stance);
    }
  };

  // ── Public API ──────────────────────────────────────────────────────
  window.LOTFK = window.LOTFK || {};
  window.LOTFK.setActorStance = applyStance;
  window.LOTFK.getActorStance = getActorStance;
  window.LOTFK.getWuxingMultiplier = getWuxingMultiplier;
  window.LOTFK.isCorrupted = isCorrupted;
  window.LOTFK.GENERATING = GENERATING;
  window.LOTFK.OVERCOMING = OVERCOMING;

})();
