/*:
 * @target MZ
 * @plugindesc LOTFK Shared Utilities v1 — DRY helpers for the LOTFK plugin suite
 * @author LOTFK Dev
 * @url https://github.com/lotfk
 *
 * @help
 * ============================================================================
 *  LOTFK_Utils — Shared Utility Functions
 * ============================================================================
 *
 *  Provides common helpers used by all LOTFK plugins:
 *  - clamp(n, lo, hi)
 *  - lotfk() accessor for $gameSystem._lotfk
 *  - parseLotfkNotetag(item, tag)
 *  - rollChance(percent)
 *  - formatGold(amount)
 *
 *  PLUGIN ORDER: Load FIRST, before LOTFK_Core.
 *
 *  No plugin commands — utility only.
 */
(() => {
  'use strict';

  const ns = {};

  /**
   * Clamps a number between inclusive bounds.
   * @param {number} n - Value to clamp.
   * @param {number} lo - Minimum bound.
   * @param {number} hi - Maximum bound.
   * @returns {number}
   */
  ns.clamp = function (n, lo, hi) {
    return Math.max(lo, Math.min(hi, n));
  };

  /**
   * Returns the canonical LOTFK state object, initializing if absent.
   * @returns {object} The $gameSystem._lotfk state.
   */
  ns.lotfk = function () {
    if (!$gameSystem._lotfk) {
      $gameSystem._lotfk = ns.defaultState();
    }
    return $gameSystem._lotfk;
  };

  /**
   * Creates the default LOTFK state schema.
   * @returns {object} Fresh default state.
   */
  ns.defaultState = function () {
    return {
      version: 2,
      day: 1,
      dayPhase: 'morning',
      factions: {
        shu: { trust: 0 },
        wu: { trust: 0 },
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
        currentMarketId: 'YANGTZE_TEA_HOUSE',
        unlockedMarketIds: ['YANGTZE_TEA_HOUSE']
      },
      beastGauges: {
        azure: 0,
        vermilion: 0,
        white: 0,
        black: 0
      },
      diplomacy: {
        hudVisible: false,
        triggeredGates: []
      }
    };
  };

  /**
   * Parses a LOTFK notetag from an item/skill's note field.
   * @param {object} item - Database item with a .note property.
   * @param {string} tag - Tag name (e.g. 'lotfkTea', 'lotfkElement').
   * @returns {string|null} The tag value, or null if not found.
   */
  ns.parseLotfkNotetag = function (item, tag) {
    if (!item || !item.note) return null;
    var regex = new RegExp('<' + tag + ':([^>]+)>', 'i');
    var match = item.note.match(regex);
    return match ? match[1].trim() : null;
  };

  /**
   * Rolls a percentage chance.
   * @param {number} percent - Chance (0-100).
   * @returns {boolean} True if the roll succeeds.
   */
  ns.rollChance = function (percent) {
    return Math.random() * 100 < percent;
  };

  /**
   * Formats a gold amount with locale-appropriate separators.
   * @param {number} amount - Gold value.
   * @returns {string} Formatted string.
   */
  ns.formatGold = function (amount) {
    return String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  /**
   * Safely retrieves a nested property by dot-separated path.
   * @param {object} obj - Root object.
   * @param {string} path - Dot-separated path (e.g. 'corruption.level').
   * @param {*} fallback - Default value if path is invalid.
   * @returns {*}
   */
  ns.getNestedValue = function (obj, path, fallback) {
    var keys = path.split('.');
    var current = obj;
    for (var i = 0; i < keys.length; i++) {
      if (current === null || current === undefined) return fallback;
      current = current[keys[i]];
    }
    return current !== undefined ? current : fallback;
  };

  window.LOTFK_Utils = ns;
})();
