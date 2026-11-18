import { addToInventory, apply, type GameState, recipes } from "./mod.ts";
import { assertNotEquals } from "@std/assert";

const SEED = 121;

const state: GameState = {
  seed: SEED,
  player: { x: 0, y: 0 },
  inventory: [],
  changedCells: [],
};

// Add 999 of every material that is needed for crafting recipes
for (const recipe of Object.values(recipes)) {
  for (const obj of recipe.itemsNeeded) {
    addToInventory(state, obj.item, 999);
  }
}

Deno.test("all items can be crafted if materials in inventory", () => {
  const inventoryBefore = state.inventory.map((object) => ({ ...object }));
  for (const recipe of recipes) {
    apply(state, { type: "craft", recipe: recipe });
  }
  assertNotEquals(inventoryBefore, state.inventory);
});
