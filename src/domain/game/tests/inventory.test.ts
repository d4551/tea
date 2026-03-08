import { describe, expect, test } from "bun:test";
import type { ItemDefinition } from "../../../shared/contracts/game";
import { inventoryService } from "../inventory-service";

const mockPotion: ItemDefinition = {
  id: "item_health_potion",
  labelKey: "item.health_potion.label",
  descriptionKey: "item.health_potion.desc",
  rarity: "common",
  spriteAssetId: "potion.png",
  stackable: true,
  maxStack: 99,
  sellValue: 10,
  statEffects: [],
  useEffects: [],
  createdAtMs: Date.now(),
};

const mockSword: ItemDefinition = {
  id: "item_iron_sword",
  equipSlot: "weapon",
  labelKey: "item.iron_sword.label",
  descriptionKey: "item.iron_sword.desc",
  rarity: "common",
  spriteAssetId: "sword.png",
  stackable: false,
  maxStack: 1,
  sellValue: 50,
  statEffects: [{ stat: "attack", value: 5 }],
  useEffects: [],
  createdAtMs: Date.now(),
};

describe("Inventory System", () => {
  test("creates a new inventory with default capacity", () => {
    const inv = inventoryService.createEmptyInventory();
    expect(inv.capacity).toBe(20);
    expect(inv.slots.length).toBe(0);
    expect(inv.equipment).toBeDefined();
  });

  test("adds an item successfully", () => {
    const inv = inventoryService.createEmptyInventory();

    // Add 5 health potions
    const result1 = inventoryService.addItem(inv, mockPotion, 5);
    expect(result1.ok).toBe(true);
    const state1 = result1.state;
    expect(state1.slots.filter(Boolean).length).toBe(1);
    expect(state1.slots[0]?.itemId).toBe("item_health_potion");
    expect(state1.slots[0]?.quantity).toBe(5);

    // Add 3 more health potions (should stack)
    const result2 = inventoryService.addItem(state1, mockPotion, 3);
    expect(result2.ok).toBe(true);
    const state2 = result2.state;
    expect(state2.slots.filter(Boolean).length).toBe(1);
    expect(state2.slots[0]?.quantity).toBe(8);
  });

  test("removes an item successfully", () => {
    let inv = inventoryService.createEmptyInventory();
    inv = inventoryService.addItem(inv, mockPotion, 10).state;

    // Remove 4 potions
    const removeResult = inventoryService.removeItem(inv, mockPotion.id, 4);
    expect(removeResult.ok).toBe(true);
    inv = removeResult.state;
    expect(inv.slots.find((s) => s?.itemId === mockPotion.id)?.quantity).toBe(6);

    // Remove remaining 6 potions (slot should be cleared)
    inv = inventoryService.removeItem(inv, mockPotion.id, 6).state;
    expect(inv.slots.filter(Boolean).length).toBe(0);
  });

  test("fails to remove an item if quantity is insufficient", () => {
    let inv = inventoryService.createEmptyInventory();
    inv = inventoryService.addItem(inv, mockSword, 1).state;

    const removeResult = inventoryService.removeItem(inv, mockSword.id, 2);
    expect(removeResult.ok).toBe(false);
    expect(inv.slots.find((s) => s?.itemId === mockSword.id)?.quantity).toBe(1); // Unchanged
  });

  test("equips an item", () => {
    let inv = inventoryService.createEmptyInventory();
    inv = inventoryService.addItem(inv, mockSword, 1).state;

    const result = inventoryService.equipItem(inv, mockSword);
    expect(result.ok).toBe(true);
    inv = result.state;

    expect(inv.slots.filter(Boolean).length).toBe(0);
    expect(inv.equipment.weapon).toBe("item_iron_sword");
  });

  test("unequips an item", () => {
    let inv = inventoryService.createEmptyInventory();
    // Equip the item first through the service
    inv = inventoryService.addItem(inv, mockSword, 1).state;
    inv = inventoryService.equipItem(inv, mockSword).state;

    const result = inventoryService.unequipItem(inv, mockSword);
    expect(result.ok).toBe(true);
    inv = result.state;

    expect(inv.equipment.weapon).toBeUndefined();
    expect(inv.slots.find((s) => s?.itemId === mockSword.id)?.quantity).toBe(1);
  });
});
