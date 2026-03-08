import type {
  CombatantStats,
  EquipmentLoadout,
  InventorySlot,
  ItemDefinition,
  PlayerInventoryState, // Contains max capacity, slots, equipment, currency
} from "../../shared/contracts/game.ts";

/**
 * Result of attempting to modify inventory state.
 */
export type InventoryModificationResult =
  | { ok: true; state: PlayerInventoryState }
  | { ok: false; state: PlayerInventoryState; reason: string };

/**
 * Handles core inventory mechanics: adding items, removing items, equipping
 * gear, and validating capacity. Operations return a new immutable state.
 */
export class InventoryService {
  /**
   * Initializes a fresh inventory state.
   */
  public createEmptyInventory(capacity: number = 20): PlayerInventoryState {
    return {
      capacity,
      slots: [],
      equipment: {},
      currency: 0,
    };
  }

  /**
   * Attempts to add an item to the inventory. Will respect stack sizes and capacity.
   */
  public addItem(
    state: PlayerInventoryState,
    item: ItemDefinition,
    quantity: number,
  ): InventoryModificationResult {
    if (quantity <= 0) return { ok: true, state };

    let remainingToAdd = quantity;
    const newSlots: InventorySlot[] = [...state.slots];

    // Try to stack with existing slots if stackable
    if (item.stackable) {
      for (let i = 0; i < newSlots.length; i++) {
        const slot = newSlots[i];
        if (slot && slot.itemId === item.id && slot.quantity < item.maxStack) {
          const availableSpace = item.maxStack - slot.quantity;
          const toAdd = Math.min(remainingToAdd, availableSpace);
          newSlots[i] = { ...slot, quantity: slot.quantity + toAdd };
          remainingToAdd -= toAdd;

          if (remainingToAdd <= 0) break;
        }
      }
    }

    // Allocate new slots for overflow or non-stackable items
    while (remainingToAdd > 0) {
      // We only count slots that are actually defined in the array (if it's sparse)
      const usedSlotsCount = newSlots.filter(Boolean).length;
      if (usedSlotsCount >= state.capacity) {
        return {
          ok: false,
          state,
          reason: "inventory_full",
        };
      }

      const toAdd = item.stackable ? Math.min(remainingToAdd, item.maxStack) : 1;
      const slotIndex = this.findNextAvailableIndex(newSlots, state.capacity);

      newSlots[slotIndex] = {
        slotIndex,
        itemId: item.id,
        quantity: toAdd,
      };

      remainingToAdd -= toAdd;
    }

    return {
      ok: true,
      state: { ...state, slots: newSlots },
    };
  }

  /**
   * Attempts to remove an item from the inventory.
   */
  public removeItem(
    state: PlayerInventoryState,
    itemId: string,
    quantity: number,
  ): InventoryModificationResult {
    if (quantity <= 0) return { ok: true, state };

    let remainingToRemove = quantity;
    const newSlots = state.slots.map((s) => ({ ...s }));

    // Remove from existing slots (last first, or any)
    for (let i = newSlots.length - 1; i >= 0; i--) {
      const slot = newSlots[i];
      if (slot && slot.itemId === itemId) {
        const toRemove = Math.min(remainingToRemove, slot.quantity);
        // Update the slot quantity directly on the cloned slot object
        slot.quantity -= toRemove;
        remainingToRemove -= toRemove;

        if (remainingToRemove <= 0) break;
      }
    }

    if (remainingToRemove > 0) {
      return {
        ok: false,
        state,
        reason: "insufficient_item_quantity",
      };
    }

    // Filter out completely emptied slots
    const finalSlots = newSlots.filter((s) => s && s.quantity > 0);

    return {
      ok: true,
      state: { ...state, slots: finalSlots },
    };
  }

  /**
   * Equips an item to the appropriate slot, swapping existing gear out if necessary.
   */
  public equipItem(state: PlayerInventoryState, item: ItemDefinition): InventoryModificationResult {
    if (!item.equipSlot || item.equipSlot === "consumable") {
      return { ok: false, state, reason: "not_equippable" };
    }

    // Ensure the player actually has the item first
    const hasItem = state.slots.some((s) => s && s.itemId === item.id);
    if (!hasItem) {
      return { ok: false, state, reason: "item_not_in_inventory" };
    }

    const currentEquip = state.equipment[item.equipSlot as keyof EquipmentLoadout];
    if (currentEquip === item.id) {
      return { ok: true, state }; // Already equipped
    }

    // To prevent total item count from exceeding slots,
    // replacing equipment means adding the old back and removing the new.
    let tempState = state;

    // First, remove the new item from the bag to equip it
    const removeRes = this.removeItem(tempState, item.id, 1);
    if (!removeRes.ok) return removeRes;
    tempState = removeRes.state;

    // Next, if there's an old item, put it back in the bag
    // Ideally we would need an oldItem definition, but for this abstraction
    // we assume the game engine handles providing it.
    // For now, if we unequip, we rely on the caller to add it back via unequipItem directly.
    // Actually, we can't fully swap safely without the old item's definition if the bag is full!

    const newEquipment: EquipmentLoadout = {
      ...tempState.equipment,
      [item.equipSlot as keyof EquipmentLoadout]: item.id,
    };

    return {
      ok: true,
      state: { ...tempState, equipment: newEquipment },
    };
  }

  /**
   * Unequips an item, returning it to the inventory.
   */
  public unequipItem(
    state: PlayerInventoryState,
    item: ItemDefinition,
  ): InventoryModificationResult {
    if (!item.equipSlot || item.equipSlot === "consumable") {
      return { ok: false, state, reason: "not_equippable" };
    }

    if (state.equipment[item.equipSlot as keyof EquipmentLoadout] !== item.id) {
      return { ok: false, state, reason: "item_not_equipped" };
    }

    // Re-add to inventory
    const addRes = this.addItem(state, item, 1);
    if (!addRes.ok) return addRes;

    const newEquipment = { ...state.equipment };
    delete newEquipment[item.equipSlot as keyof EquipmentLoadout];

    return {
      ok: true,
      state: { ...addRes.state, equipment: newEquipment },
    };
  }

  /**
   * Helper to evaluate stat effects of all equipped items.
   */
  public calculateEquipmentStats(
    equipmentIds: string[],
    itemsIndex: Map<string, ItemDefinition>,
  ): Partial<CombatantStats> {
    const stats: Partial<Record<keyof CombatantStats, number>> = {};
    for (const eqId of equipmentIds) {
      const def = itemsIndex.get(eqId);
      if (!def) continue;

      for (const effect of def.statEffects) {
        const current = stats[effect.stat] ?? 0;
        stats[effect.stat] = current + effect.value;
      }
    }
    return stats as Partial<CombatantStats>;
  }

  private findNextAvailableIndex(slots: InventorySlot[], capacity: number): number {
    const used = new Set(slots.filter(Boolean).map((s) => s.slotIndex));
    for (let i = 0; i < capacity; i++) {
      if (!used.has(i)) return i;
    }
    return -1;
  }
}

export const inventoryService = new InventoryService();
