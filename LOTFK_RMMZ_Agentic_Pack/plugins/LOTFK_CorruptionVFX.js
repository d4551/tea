/*:
 * @target MZ
 * @plugindesc LOTFK Corruption VFX v1 — Visual corruption effects system
 * @author LOTFK Dev
 * @url https://github.com/lotfk
 *
 * @help
 * ============================================================================
 *  LOTFK_CorruptionVFX — Visual Feedback for Corruption Level
 * ============================================================================
 *
 *  Provides progressive visual effects driven by the global corruption level:
 *  - Screen tint shifts (violet overlay at high corruption)
 *  - Corruption particle spawner on map (ink drips)
 *  - UI textbox border corruption (pulse at thresholds)
 *  - Screen flash on corruption increase
 *
 *  All visuals are driven by $gameSystem._lotfk.corruption.level.
 *
 *  PLUGIN ORDER: Load after LOTFK_Core.
 *
 * @param tintThreshold1
 * @text Minor Tint Threshold
 * @desc Corruption level to begin subtle violet tint.
 * @type number
 * @default 25
 *
 * @param tintThreshold2
 * @text Major Tint Threshold
 * @desc Corruption level for stronger visual distortion.
 * @type number
 * @default 50
 *
 * @param tintThreshold3
 * @text Critical Tint Threshold
 * @desc Corruption level for maximum visual corruption.
 * @type number
 * @default 75
 *
 * @param particleRate
 * @text Particle Spawn Rate
 * @desc Frames between corruption particle spawns (lower = more).
 * @type number
 * @default 120
 *
 * @command ForceCorruptionVFX
 * @text Force Corruption VFX
 * @desc Force the VFX to display as if corruption is at a specific level.
 * @arg level
 * @text Corruption Level
 * @type number
 * @min 0
 * @max 100
 * @default 50
 *
 * @command ClearCorruptionVFX
 * @text Clear Corruption VFX
 * @desc Remove all corruption visual effects immediately.
 *
 * @command PulseCorruptionFlash
 * @text Pulse Corruption Flash
 * @desc Trigger a one-time corruption screen flash effect.
 */
(() => {
  'use strict';

  const PLUGIN_NAME = 'LOTFK_CorruptionVFX';
  const params = PluginManager.parameters(PLUGIN_NAME);
  const THRESHOLD_1 = Number(params.tintThreshold1 || 25);
  const THRESHOLD_2 = Number(params.tintThreshold2 || 50);
  const THRESHOLD_3 = Number(params.tintThreshold3 || 75);
  const PARTICLE_RATE = Number(params.particleRate || 120);

  var forcedLevel = -1;
  var lastAppliedTier = -1;

  /**
   * Returns the effective corruption level for VFX.
   * @returns {number}
   */
  function effectiveCorruption() {
    if (forcedLevel >= 0) return forcedLevel;
    if (!$gameSystem || !$gameSystem._lotfk) return 0;
    return $gameSystem._lotfk.corruption.level;
  }

  /**
   * Determines the corruption tier (0-3) based on level.
   * @param {number} level - Corruption level.
   * @returns {number}
   */
  function corruptionTier(level) {
    if (level >= THRESHOLD_3) return 3;
    if (level >= THRESHOLD_2) return 2;
    if (level >= THRESHOLD_1) return 1;
    return 0;
  }

  /**
   * Applies screen tint based on corruption tier.
   * @param {number} tier - Corruption tier (0-3).
   */
  function applyTint(tier) {
    if (tier === lastAppliedTier) return;
    lastAppliedTier = tier;

    var tints = [
      [0, 0, 0, 0],
      [-15, -25, 10, 0],
      [-30, -50, 20, 15],
      [-50, -70, 35, 30]
    ];
    var tint = tints[tier] || tints[0];
    $gameScreen.startTint(tint, 120);
  }

  /**
   * Clears the corruption tint.
   */
  function clearTint() {
    lastAppliedTier = -1;
    $gameScreen.startTint([0, 0, 0, 0], 60);
  }

  /**
   * Triggers a corruption flash effect.
   */
  function pulseFlash() {
    $gameScreen.startFlash([140, 50, 160, 120], 20);
  }

  /* ── Scene_Map Integration — Periodic VFX Update ───────── */

  const _Scene_Map_update = Scene_Map.prototype.update;

  /**
   * Updates corruption VFX each frame on the map.
   */
  Scene_Map.prototype.update = function () {
    _Scene_Map_update.call(this);

    if (!$gameSystem._lotfk) return;
    var level = effectiveCorruption();
    var tier = corruptionTier(level);

    applyTint(tier);

    if (tier >= 2 && Graphics.frameCount % PARTICLE_RATE === 0) {
      spawnCorruptionParticle();
    }
  };

  /**
   * Spawns a corruption particle on the map.
   * Uses a screen flash as a lightweight particle alternative.
   */
  function spawnCorruptionParticle() {
    var level = effectiveCorruption();
    var intensity = LOTFK_Utils.clamp(Math.floor(level * 0.6), 10, 60);
    $gameScreen.startFlash([80, 20, 100, intensity], 10);
  }

  /* ── Window_Message — Corruption Border Pulse ──────────── */

  const _Window_Message_update = Window_Message.prototype.update;

  /**
   * Adds a corruption pulse to the message window border.
   */
  Window_Message.prototype.update = function () {
    _Window_Message_update.call(this);
    if (!$gameSystem || !$gameSystem._lotfk) return;

    var level = effectiveCorruption();
    var tier = corruptionTier(level);

    if (tier >= 2 && this.isOpen()) {
      var pulse = Math.sin(Graphics.frameCount * 0.08) * 0.3 + 0.7;
      this.opacity = Math.round(255 * pulse);
    } else if (this.isOpen()) {
      this.opacity = 255;
    }
  };

  /* ── Plugin Commands ───────────────────────────────────── */

  PluginManager.registerCommand(PLUGIN_NAME, 'ForceCorruptionVFX', function (args) {
    forcedLevel = LOTFK_Utils.clamp(Number(args.level || 0), 0, 100);
  });

  PluginManager.registerCommand(PLUGIN_NAME, 'ClearCorruptionVFX', function () {
    forcedLevel = -1;
    clearTint();
  });

  PluginManager.registerCommand(PLUGIN_NAME, 'PulseCorruptionFlash', function () {
    pulseFlash();
  });
})();
