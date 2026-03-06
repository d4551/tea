/*:
 * @target MZ
 * @plugindesc LOTFK Trade & Routes v2 — Markets, pricing, contracts, travel
 * @author LOTFK Dev
 * @url https://github.com/lotfk
 *
 * @help
 * ============================================================================
 * Leaves of the Fallen Kingdom — Trade & Routes System
 * ============================================================================
 *
 * Implements:
 * - Scene_LOTFKMarket  (Buy / Sell / Contracts / Exit)
 * - Scene_LOTFKRouteMap (Node-based travel with risk/event rolls)
 * - Dynamic pricing with supply/demand + corruption modifiers
 * - Contract system with faction trust rewards
 * - Market refresh tied to day advancement
 *
 * PRICING FORMULA:
 *   price = baseItemPrice * marketMultiplier * S/D multiplier * corruption mult
 *
 *   S/D multiplier = clamp(0.5, 2.0, 1 + (demand - supply) / 100)
 *   Corruption mult (pure):    1 + corruptionLevel * 0.01
 *   Corruption mult (tainted): clamp(0.5, 1.0, 1 - corruptionLevel * 0.005)
 *
 * NOTETAGS (Items):
 *   <lotfkTainted:true>  — Item is tainted; cheaper at high corruption
 *   <lotfkTea:green>     — Tea type identifier
 *
 * TRAVEL EVENTS:
 *   When traveling between markets, a risk roll determines random events:
 *   - Bandit ambush (battle)
 *   - Corruption spread
 *   - Merchant gift (gold)
 *   - Wei patrol (pressure increase)
 *
 * PLUGIN ORDER: Load after LOTFK_Core.
 *
 * @param Markets
 * @text Market Definitions
 * @type struct<LOTFKMarket>[]
 * @desc Define each market node on the trade route map.
 * @default []
 *
 * @param --- Travel ---
 *
 * @param travelTroopIds
 * @text Bandit Troop IDs
 * @desc Comma-separated troop IDs for risk levels 1-5 (e.g. 1,2,3,4,5)
 * @type string
 * @default 1,2,3,4,5
 *
 * @param travelGoldBase
 * @text Merchant Gift Base Gold
 * @desc Base gold for random merchant encounters (multiplied by risk)
 * @type number
 * @min 10
 * @default 100
 *
 * @param --- Contracts ---
 *
 * @param contractRewardGold
 * @text Contract Gold Reward
 * @desc Base gold reward for completing a contract
 * @type number
 * @min 0
 * @default 500
 *
 * @param contractTrustReward
 * @text Contract Trust Reward
 * @desc Trust points gained with contract faction on completion
 * @type number
 * @min 0
 * @default 5
 *
 * @command OpenMarket
 * @text Open Market
 * @desc Open the market scene for buying/selling at a specific market.
 * @arg marketId
 * @text Market ID
 * @type string
 * @default YANGTZE_TEA_HOUSE
 *
 * @command RefreshMarket
 * @text Refresh Market
 * @desc Refresh a market's supply/demand values (call on day advance).
 * @arg marketId
 * @text Market ID
 * @type string
 * @default YANGTZE_TEA_HOUSE
 *
 * @command OpenRouteMap
 * @text Open Route Map
 * @desc Open the travel route map scene.
 *
 * @command TravelTo
 * @text Travel To Market
 * @desc Travel to a market (advances days, risk roll, updates location).
 * @arg marketId
 * @text Market ID
 * @type string
 * @default YANGTZE_TEA_HOUSE
 *
 * @command AddContract
 * @text Add Contract
 * @desc Add a delivery contract to the player's active contracts.
 * @arg itemId
 * @text Item
 * @type item
 * @default 1
 * @arg quantity
 * @text Quantity
 * @type number
 * @min 1
 * @default 5
 * @arg targetMarketId
 * @text Destination Market
 * @type string
 * @default YANGTZE_TEA_HOUSE
 * @arg faction
 * @text Faction
 * @type select
 * @option shu
 * @option wu
 * @option neutral
 * @default shu
 */

/*~struct~LOTFKMarket:
 * @param id
 * @text Market ID
 * @type string
 * @desc Unique identifier (e.g. YANGTZE_TEA_HOUSE)
 *
 * @param name
 * @text Display Name
 * @type string
 * @desc Shown in UI (e.g. "Yangtze Tea House")
 *
 * @param faction
 * @text Faction
 * @type select
 * @option shu
 * @option wu
 * @option wei
 * @option neutral
 * @default neutral
 * @desc Which faction controls this market
 *
 * @param baseMultiplier
 * @text Price Multiplier
 * @type number
 * @decimals 2
 * @min 0.10
 * @max 5.00
 * @default 1.00
 * @desc Base price multiplier for this market
 *
 * @param allowedItems
 * @text Allowed Items
 * @type item[]
 * @default []
 * @desc Items available for trade at this market
 *
 * @param edges
 * @text Connected Markets
 * @type string[]
 * @default []
 * @desc Market IDs reachable from this node
 *
 * @param risk
 * @text Travel Risk
 * @type number
 * @min 1
 * @max 10
 * @default 1
 * @desc Risk level (affects travel days, encounter chance)
 */
(() => {
  'use strict';

  const PLUGIN_NAME = "LOTFK_TradeAndRoutes";

  // ── Helpers ──────────────────────────────────────────────────────────
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const lotfk = () => window.LOTFK?.ensureState ? window.LOTFK.ensureState() : $gameSystem._lotfk;

  // ── Parameters ──────────────────────────────────────────────────────
  const params = PluginManager.parameters(PLUGIN_NAME);
  const rawMarkets = JSON.parse(params.Markets || "[]");
  const MARKETS = rawMarkets.map(s => {
    const m = JSON.parse(s);
    if (typeof m.allowedItems === "string") {
      m.allowedItems = JSON.parse(m.allowedItems || "[]").map(Number);
    }
    if (typeof m.edges === "string") {
      m.edges = JSON.parse(m.edges || "[]");
    }
    return m;
  });

  const TROOP_IDS = (params.travelTroopIds || "1,2,3,4,5")
    .split(",").map(s => Number(s.trim()));
  const GOLD_BASE = Number(params.travelGoldBase || 100);
  const CONTRACT_GOLD = Number(params.contractRewardGold || 500);
  const CONTRACT_TRUST = Number(params.contractTrustReward || 5);

  // ── Market Lookup ───────────────────────────────────────────────────
  function marketDef(id) {
    return MARKETS.find(m => String(m.id) === String(id));
  }

  // ── Market State ────────────────────────────────────────────────────
  function ensureMarketState(marketId) {
    const st = lotfk();
    if (!st.markets[marketId]) {
      st.markets[marketId] = {
        supplyByItemId: {},
        demandByItemId: {},
        lastRefreshDay: 0
      };
    }
    return st.markets[marketId];
  }

  // ── Dynamic Pricing ─────────────────────────────────────────────────
  function computePrice(marketId, item) {
    const state = lotfk();
    const m = marketDef(marketId);
    const base = item ? Number(item.price || 0) : 0;
    const mult = m ? Number(m.baseMultiplier || 1.0) : 1.0;

    const mktState = ensureMarketState(marketId);
    const supply = mktState.supplyByItemId[item.id] ?? 50;
    const demand = mktState.demandByItemId[item.id] ?? 50;
    const sd = clamp(1 + (demand - supply) / 100, 0.5, 2.0);

    const corr = state?.corruption?.level ?? 0;
    const tainted = item?.meta?.lotfkTainted === "true" || item?.meta?.lotfkTainted === true;
    const corrMult = tainted
      ? clamp(1 - corr * 0.005, 0.5, 1.0)
      : (1 + corr * 0.01);

    return Math.max(1, Math.round(base * mult * sd * corrMult));
  }

  // ── Supply/Demand Refresh ───────────────────────────────────────────
  function refreshMarket(marketId) {
    const st = lotfk();
    const def = marketDef(marketId);
    if (!def) return;
    const mkt = ensureMarketState(marketId);
    const items = Array.isArray(def.allowedItems) ? def.allowedItems : [];

    for (const id of items) {
      const oldSupply = mkt.supplyByItemId[id] ?? 50;
      const oldDemand = mkt.demandByItemId[id] ?? 50;
      const drift = Math.floor(Math.random() * 10) - 4;
      mkt.supplyByItemId[id] = clamp(oldSupply + drift, 5, 95);
      mkt.demandByItemId[id] = clamp(
        oldDemand - drift + Math.floor(Math.random() * 6 - 3), 5, 95
      );
    }

    // Corruption reduces supply
    const corr = st.corruption?.level ?? 0;
    if (corr > 30) {
      for (const id of Object.keys(mkt.supplyByItemId)) {
        mkt.supplyByItemId[id] = clamp(
          mkt.supplyByItemId[id] - Math.floor(corr / 20), 5, 95
        );
      }
    }
    mkt.lastRefreshDay = st.day;
  }

  // ── Transaction Logic ───────────────────────────────────────────────
  function executeBuy(marketId, item, quantity) {
    const totalPrice = computePrice(marketId, item) * quantity;
    if ($gameParty.gold() < totalPrice) return false;
    $gameParty.loseGold(totalPrice);
    $gameParty.gainItem(item, quantity);
    // Buying increases demand, decreases supply
    const mkt = ensureMarketState(marketId);
    mkt.demandByItemId[item.id] = clamp(
      (mkt.demandByItemId[item.id] ?? 50) + quantity * 3, 5, 95
    );
    mkt.supplyByItemId[item.id] = clamp(
      (mkt.supplyByItemId[item.id] ?? 50) - quantity * 2, 5, 95
    );
    return true;
  }

  function executeSell(marketId, item, quantity) {
    if ($gameParty.numItems(item) < quantity) return false;
    const sellPrice = Math.max(1, Math.floor(computePrice(marketId, item) * 0.6));
    const totalGold = sellPrice * quantity;
    $gameParty.loseItem(item, quantity);
    $gameParty.gainGold(totalGold);
    // Selling increases supply, decreases demand
    const mkt = ensureMarketState(marketId);
    mkt.supplyByItemId[item.id] = clamp(
      (mkt.supplyByItemId[item.id] ?? 50) + quantity * 2, 5, 95
    );
    mkt.demandByItemId[item.id] = clamp(
      (mkt.demandByItemId[item.id] ?? 50) - quantity, 5, 95
    );
    return true;
  }

  // ── Contract System ─────────────────────────────────────────────────
  function addContract(itemId, quantity, targetMarketId, faction) {
    const st = lotfk();
    st.playerTrade.contracts.push({
      itemId: Number(itemId),
      quantity: Number(quantity),
      targetMarketId: String(targetMarketId),
      faction: String(faction || "neutral"),
      completed: false
    });
  }

  function checkContracts() {
    const st = lotfk();
    const currentMarket = st.route.currentMarketId;
    for (const contract of st.playerTrade.contracts) {
      if (contract.completed) continue;
      if (contract.targetMarketId !== currentMarket) continue;
      const item = $dataItems[contract.itemId];
      if (!item) continue;
      if ($gameParty.numItems(item) >= contract.quantity) {
        // Complete the contract
        $gameParty.loseItem(item, contract.quantity);
        $gameParty.gainGold(CONTRACT_GOLD);
        contract.completed = true;
        st.playerTrade.reputation += 1;
        // Faction trust reward
        if (contract.faction !== "neutral" && contract.faction !== "wei") {
          const faction = st.factions[contract.faction];
          if (faction) faction.trust += CONTRACT_TRUST;
        }
        $gameMessage.add(
          `Contract complete! Delivered ${contract.quantity}x ${item.name}.`
        );
        $gameMessage.add(`Earned ${CONTRACT_GOLD}G and faction trust.`);
        if (window.LOTFK.syncVariables) window.LOTFK.syncVariables();
      }
    }
  }

  // ── Travel Resolution ───────────────────────────────────────────────
  function travelTo(targetId) {
    const st = lotfk();
    const def = marketDef(targetId);
    if (!def) return;

    const risk = clamp(Number(def.risk || 1), 1, 10);
    const travelDays = Math.max(1, risk);
    st.day += travelDays;
    st.route.currentMarketId = targetId;

    // Random event roll
    const roll = Math.random() * 100;
    const corrBonus = (st.corruption?.level ?? 0) * 0.5;
    const threshold = risk * 10 + corrBonus;

    if (roll < threshold) {
      const eventRoll = Math.random();
      if (eventRoll < 0.35) {
        // Bandit ambush
        const troopId = TROOP_IDS[clamp(risk - 1, 0, TROOP_IDS.length - 1)] || 1;
        BattleManager.setup(troopId, true, false);
        SceneManager.push(Scene_Battle);
      } else if (eventRoll < 0.55) {
        // Corruption spread
        st.corruption.level = clamp(st.corruption.level + risk * 2, 0, 100);
        $gameMessage.add("The corruption thickens along the road...");
        if (window.LOTFK.checkCorruptionThresholds) {
          window.LOTFK.checkCorruptionThresholds();
        }
      } else if (eventRoll < 0.75) {
        // Merchant encounter
        const goldFound = Math.floor(Math.random() * GOLD_BASE * risk);
        $gameParty.gainGold(goldFound);
        $gameMessage.add(`A grateful merchant gifts you ${goldFound} gold.`);
      } else {
        // Wei patrol
        st.factions.wei.pressure += risk;
        $gameMessage.add("Wei scouts observe your caravan...");
      }
    }

    // Refresh destination market
    refreshMarket(targetId);
    if (window.LOTFK.syncVariables) window.LOTFK.syncVariables();
  }

  // ══════════════════════════════════════════════════════════════════════
  // SCENE: Market (Buy / Sell / Contracts / Exit)
  // ══════════════════════════════════════════════════════════════════════

  // ── Market Command Window ───────────────────────────────────────────
  function Window_MarketCommand() {
    this.initialize(...arguments);
  }
  Window_MarketCommand.prototype = Object.create(Window_Command.prototype);
  Window_MarketCommand.prototype.constructor = Window_MarketCommand;

  Window_MarketCommand.prototype.initialize = function(rect) {
    Window_Command.prototype.initialize.call(this, rect);
  };

  Window_MarketCommand.prototype.makeCommandList = function() {
    this.addCommand("Buy",       "buy",       true);
    this.addCommand("Sell",      "sell",      true);
    this.addCommand("Contracts", "contracts", true);
    this.addCommand("Exit",      "cancel",    true);
  };

  // ── Market Buy Window ───────────────────────────────────────────────
  function Window_MarketBuy() {
    this.initialize(...arguments);
  }
  Window_MarketBuy.prototype = Object.create(Window_Selectable.prototype);
  Window_MarketBuy.prototype.constructor = Window_MarketBuy;

  Window_MarketBuy.prototype.initialize = function(rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
    this._marketId = "";
    this._data = [];
    this._prices = [];
  };

  Window_MarketBuy.prototype.setMarketId = function(id) {
    this._marketId = id;
    this.refresh();
  };

  Window_MarketBuy.prototype.maxItems = function() {
    return this._data.length;
  };

  Window_MarketBuy.prototype.item = function() {
    return this._data[this.index()] || null;
  };

  Window_MarketBuy.prototype.price = function() {
    return this._prices[this.index()] || 0;
  };

  Window_MarketBuy.prototype.isCurrentItemEnabled = function() {
    return this.item() && this.price() <= $gameParty.gold();
  };

  Window_MarketBuy.prototype.makeItemList = function() {
    const def = marketDef(this._marketId);
    this._data = [];
    this._prices = [];
    if (!def) return;
    const ids = Array.isArray(def.allowedItems) ? def.allowedItems : [];
    for (const id of ids) {
      const item = $dataItems[Number(id)];
      if (item) {
        this._data.push(item);
        this._prices.push(computePrice(this._marketId, item));
      }
    }
  };

  Window_MarketBuy.prototype.refresh = function() {
    this.makeItemList();
    Window_Selectable.prototype.refresh.call(this);
  };

  Window_MarketBuy.prototype.drawItem = function(index) {
    const item = this._data[index];
    const price = this._prices[index];
    if (!item) return;
    const rect = this.itemLineRect(index);
    const enabled = price <= $gameParty.gold();
    this.changePaintOpacity(enabled);
    this.drawItemName(item, rect.x, rect.y, rect.width - 130);
    this.drawText(price + "G", rect.x + rect.width - 120, rect.y, 120, "right");
    this.changePaintOpacity(true);
  };

  // ── Market Sell Window ──────────────────────────────────────────────
  function Window_MarketSell() {
    this.initialize(...arguments);
  }
  Window_MarketSell.prototype = Object.create(Window_Selectable.prototype);
  Window_MarketSell.prototype.constructor = Window_MarketSell;

  Window_MarketSell.prototype.initialize = function(rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
    this._marketId = "";
    this._data = [];
  };

  Window_MarketSell.prototype.setMarketId = function(id) {
    this._marketId = id;
    this.refresh();
  };

  Window_MarketSell.prototype.maxItems = function() {
    return this._data.length;
  };

  Window_MarketSell.prototype.item = function() {
    return this._data[this.index()] || null;
  };

  Window_MarketSell.prototype.sellPrice = function() {
    const item = this.item();
    if (!item) return 0;
    return Math.max(1, Math.floor(computePrice(this._marketId, item) * 0.6));
  };

  Window_MarketSell.prototype.isCurrentItemEnabled = function() {
    return !!this.item();
  };

  Window_MarketSell.prototype.makeItemList = function() {
    this._data = $gameParty.allItems().filter(item => {
      return item && DataManager.isItem(item);
    });
  };

  Window_MarketSell.prototype.refresh = function() {
    this.makeItemList();
    Window_Selectable.prototype.refresh.call(this);
  };

  Window_MarketSell.prototype.drawItem = function(index) {
    const item = this._data[index];
    if (!item) return;
    const rect = this.itemLineRect(index);
    const qty = $gameParty.numItems(item);
    const price = Math.max(1, Math.floor(computePrice(this._marketId, item) * 0.6));
    this.drawItemName(item, rect.x, rect.y, rect.width - 200);
    this.drawText("x" + qty, rect.x + rect.width - 190, rect.y, 60, "right");
    this.drawText(price + "G", rect.x + rect.width - 120, rect.y, 120, "right");
  };

  // ── Contract List Window ────────────────────────────────────────────
  function Window_ContractList() {
    this.initialize(...arguments);
  }
  Window_ContractList.prototype = Object.create(Window_Selectable.prototype);
  Window_ContractList.prototype.constructor = Window_ContractList;

  Window_ContractList.prototype.initialize = function(rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
    this.refresh();
  };

  Window_ContractList.prototype.maxItems = function() {
    const st = lotfk();
    return st ? st.playerTrade.contracts.filter(c => !c.completed).length : 0;
  };

  Window_ContractList.prototype.activeContracts = function() {
    const st = lotfk();
    return st ? st.playerTrade.contracts.filter(c => !c.completed) : [];
  };

  Window_ContractList.prototype.refresh = function() {
    Window_Selectable.prototype.refresh.call(this);
  };

  Window_ContractList.prototype.drawItem = function(index) {
    const contracts = this.activeContracts();
    const c = contracts[index];
    if (!c) return;
    const item = $dataItems[c.itemId];
    if (!item) return;
    const rect = this.itemLineRect(index);
    const have = $gameParty.numItems(item);
    const status = have >= c.quantity ? "[Ready]" : `${have}/${c.quantity}`;
    const dest = marketDef(c.targetMarketId);
    const destName = dest ? dest.name : c.targetMarketId;
    this.drawText(
      `${item.name} x${c.quantity} → ${destName} ${status}`,
      rect.x, rect.y, rect.width
    );
  };

  // ── Scene_LOTFKMarket ───────────────────────────────────────────────
  function Scene_LOTFKMarket() {
    this.initialize(...arguments);
  }
  Scene_LOTFKMarket.prototype = Object.create(Scene_MenuBase.prototype);
  Scene_LOTFKMarket.prototype.constructor = Scene_LOTFKMarket;

  Scene_LOTFKMarket.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
    this._marketId = "";
  };

  Scene_LOTFKMarket.prototype.prepare = function(marketId) {
    this._marketId = marketId;
  };

  Scene_LOTFKMarket.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this.createGoldWindow();
    this.createCommandWindow();
    this.createBuyWindow();
    this.createSellWindow();
    this.createContractWindow();
  };

  Scene_LOTFKMarket.prototype.createGoldWindow = function() {
    const rect = this.goldWindowRect();
    this._goldWindow = new Window_Gold(rect);
    this.addWindow(this._goldWindow);
  };

  Scene_LOTFKMarket.prototype.goldWindowRect = function() {
    const ww = this.mainCommandWidth();
    const wh = this.calcWindowHeight(1, true);
    const wx = Graphics.boxWidth - ww;
    const wy = 0;
    return new Rectangle(wx, wy, ww, wh);
  };

  Scene_LOTFKMarket.prototype.createCommandWindow = function() {
    const rect = this.commandWindowRect();
    this._commandWindow = new Window_MarketCommand(rect);
    this._commandWindow.setHandler("buy",       this.commandBuy.bind(this));
    this._commandWindow.setHandler("sell",      this.commandSell.bind(this));
    this._commandWindow.setHandler("contracts", this.commandContracts.bind(this));
    this._commandWindow.setHandler("cancel",    this.popScene.bind(this));
    this.addWindow(this._commandWindow);
  };

  Scene_LOTFKMarket.prototype.commandWindowRect = function() {
    const ww = this.mainCommandWidth();
    const wh = this.calcWindowHeight(4, true);
    return new Rectangle(0, 0, ww, wh);
  };

  Scene_LOTFKMarket.prototype.mainCommandWidth = function() {
    return 240;
  };

  Scene_LOTFKMarket.prototype.createBuyWindow = function() {
    const rect = this.buyWindowRect();
    this._buyWindow = new Window_MarketBuy(rect);
    this._buyWindow.setMarketId(this._marketId);
    this._buyWindow.setHandler("ok",     this.onBuyOk.bind(this));
    this._buyWindow.setHandler("cancel", this.onBuyCancel.bind(this));
    this._buyWindow.hide();
    this._buyWindow.deactivate();
    this.addWindow(this._buyWindow);
  };

  Scene_LOTFKMarket.prototype.createSellWindow = function() {
    const rect = this.buyWindowRect();
    this._sellWindow = new Window_MarketSell(rect);
    this._sellWindow.setMarketId(this._marketId);
    this._sellWindow.setHandler("ok",     this.onSellOk.bind(this));
    this._sellWindow.setHandler("cancel", this.onSellCancel.bind(this));
    this._sellWindow.hide();
    this._sellWindow.deactivate();
    this.addWindow(this._sellWindow);
  };

  Scene_LOTFKMarket.prototype.createContractWindow = function() {
    const rect = this.buyWindowRect();
    this._contractWindow = new Window_ContractList(rect);
    this._contractWindow.setHandler("cancel", this.onContractCancel.bind(this));
    this._contractWindow.hide();
    this._contractWindow.deactivate();
    this.addWindow(this._contractWindow);
  };

  Scene_LOTFKMarket.prototype.buyWindowRect = function() {
    const cmdW = this.mainCommandWidth();
    const wx = 0;
    const wy = this.calcWindowHeight(4, true);
    const ww = Graphics.boxWidth;
    const wh = Graphics.boxHeight - wy;
    return new Rectangle(wx, wy, ww, wh);
  };

  // ── Command Handlers ────────────────────────────────────────────────
  Scene_LOTFKMarket.prototype.commandBuy = function() {
    this._buyWindow.refresh();
    this._buyWindow.show();
    this._buyWindow.activate();
    this._buyWindow.select(0);
  };

  Scene_LOTFKMarket.prototype.commandSell = function() {
    this._sellWindow.refresh();
    this._sellWindow.show();
    this._sellWindow.activate();
    this._sellWindow.select(0);
  };

  Scene_LOTFKMarket.prototype.commandContracts = function() {
    checkContracts();
    this._contractWindow.refresh();
    this._contractWindow.show();
    this._contractWindow.activate();
    this._contractWindow.select(0);
  };

  // ── Buy/Sell Handlers ───────────────────────────────────────────────
  Scene_LOTFKMarket.prototype.onBuyOk = function() {
    const item = this._buyWindow.item();
    if (item) {
      executeBuy(this._marketId, item, 1);
      this._buyWindow.refresh();
      this._goldWindow.refresh();
    }
    this._buyWindow.activate();
  };

  Scene_LOTFKMarket.prototype.onBuyCancel = function() {
    this._buyWindow.hide();
    this._buyWindow.deactivate();
    this._commandWindow.activate();
  };

  Scene_LOTFKMarket.prototype.onSellOk = function() {
    const item = this._sellWindow.item();
    if (item) {
      executeSell(this._marketId, item, 1);
      this._sellWindow.refresh();
      this._goldWindow.refresh();
    }
    this._sellWindow.activate();
  };

  Scene_LOTFKMarket.prototype.onSellCancel = function() {
    this._sellWindow.hide();
    this._sellWindow.deactivate();
    this._commandWindow.activate();
  };

  Scene_LOTFKMarket.prototype.onContractCancel = function() {
    this._contractWindow.hide();
    this._contractWindow.deactivate();
    this._commandWindow.activate();
  };

  // ══════════════════════════════════════════════════════════════════════
  // SCENE: Route Map (travel between market nodes)
  // ══════════════════════════════════════════════════════════════════════

  // ── Route List Window ───────────────────────────────────────────────
  function Window_RouteList() {
    this.initialize(...arguments);
  }
  Window_RouteList.prototype = Object.create(Window_Command.prototype);
  Window_RouteList.prototype.constructor = Window_RouteList;

  Window_RouteList.prototype.initialize = function(rect) {
    Window_Command.prototype.initialize.call(this, rect);
  };

  Window_RouteList.prototype.makeCommandList = function() {
    const st = lotfk();
    if (!st) return;
    const currentDef = marketDef(st.route.currentMarketId);
    if (!currentDef) return;
    const edges = Array.isArray(currentDef.edges) ? currentDef.edges : [];
    for (const targetId of edges) {
      if (!st.route.unlockedMarketIds.includes(targetId)) continue;
      const targetDef = marketDef(targetId);
      if (!targetDef) continue;
      const risk = clamp(Number(targetDef.risk || 1), 1, 10);
      const days = Math.max(1, risk);
      const label = `${targetDef.name}  [${days}d / Risk ${risk}]`;
      this.addCommand(label, "ok", true, targetId);
    }
  };

  // ── Scene_LOTFKRouteMap ─────────────────────────────────────────────
  function Scene_LOTFKRouteMap() {
    this.initialize(...arguments);
  }
  Scene_LOTFKRouteMap.prototype = Object.create(Scene_MenuBase.prototype);
  Scene_LOTFKRouteMap.prototype.constructor = Scene_LOTFKRouteMap;

  Scene_LOTFKRouteMap.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this.createHeaderWindow();
    this.createRouteWindow();
  };

  Scene_LOTFKRouteMap.prototype.createHeaderWindow = function() {
    const rect = new Rectangle(0, 0, Graphics.boxWidth, this.calcWindowHeight(1, true));
    this._headerWindow = new Window_Base(rect);
    const st = lotfk();
    const currentDef = st ? marketDef(st.route.currentMarketId) : null;
    const name = currentDef ? currentDef.name : "Unknown";
    this._headerWindow.drawText(
      `Current: ${name}  |  Day ${st ? st.day : 1}`,
      0, 0, Graphics.boxWidth - 32, "center"
    );
    this.addWindow(this._headerWindow);
  };

  Scene_LOTFKRouteMap.prototype.createRouteWindow = function() {
    const wy = this.calcWindowHeight(1, true);
    const rect = new Rectangle(0, wy, Graphics.boxWidth, Graphics.boxHeight - wy);
    this._routeWindow = new Window_RouteList(rect);
    this._routeWindow.setHandler("ok",     this.onRouteOk.bind(this));
    this._routeWindow.setHandler("cancel", this.popScene.bind(this));
    this.addWindow(this._routeWindow);
  };

  Scene_LOTFKRouteMap.prototype.onRouteOk = function() {
    const targetId = this._routeWindow.currentExt();
    if (targetId) {
      travelTo(targetId);
      this.popScene();
    } else {
      this._routeWindow.activate();
    }
  };

  // ── Plugin Commands ─────────────────────────────────────────────────

  PluginManager.registerCommand(PLUGIN_NAME, "OpenMarket", (args) => {
    const id = String(args.marketId || "");
    SceneManager.push(Scene_LOTFKMarket);
    SceneManager.prepareNextScene(id);
  });

  PluginManager.registerCommand(PLUGIN_NAME, "RefreshMarket", (args) => {
    refreshMarket(String(args.marketId || ""));
  });

  PluginManager.registerCommand(PLUGIN_NAME, "OpenRouteMap", () => {
    SceneManager.push(Scene_LOTFKRouteMap);
  });

  PluginManager.registerCommand(PLUGIN_NAME, "TravelTo", (args) => {
    travelTo(String(args.marketId || ""));
  });

  PluginManager.registerCommand(PLUGIN_NAME, "AddContract", (args) => {
    addContract(
      Number(args.itemId || 1),
      Number(args.quantity || 5),
      String(args.targetMarketId || "YANGTZE_TEA_HOUSE"),
      String(args.faction || "neutral")
    );
  });

  // ── Public API ──────────────────────────────────────────────────────
  window.LOTFK = window.LOTFK || {};
  window.LOTFK.marketDef = marketDef;
  window.LOTFK.computeMarketPrice = computePrice;
  window.LOTFK.executeBuy = executeBuy;
  window.LOTFK.executeSell = executeSell;
  window.LOTFK.refreshMarket = refreshMarket;
  window.LOTFK.travelTo = travelTo;
  window.LOTFK.addContract = addContract;
  window.LOTFK.checkContracts = checkContracts;

})();
