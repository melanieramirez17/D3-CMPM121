import { addToInventory, apply, type GameState, recipes } from "./mod.ts";
import {
  assert,
  assertEquals,
  assertExists,
  assertNotEquals,
} from "@std/assert";
import { yields } from "./terrain.ts";

function resetState() {
  const SEED = 121;

  const state: GameState = {
    seed: SEED,
    player: { x: 0, y: 0 },
    inventory: [],
    changedCells: [],
  };

  return state;
}

Deno.test("all items can be crafted if materials in inventory", () => {
  // Add required amount of every material that is needed for crafting each recipe
  const state = resetState();
  for (const recipe of recipes) {
    for (const obj of recipe.itemsNeeded) {
      addToInventory(state, obj.item, obj.amount);
    }
  }
  const inventoryBefore = state.inventory.map((object) => ({ ...object }));
  for (const recipe of recipes) {
    apply(state, { type: "craft", recipe: recipe });

    // Check if crafted item is in inventory. If not, returns undefined
    const found = state.inventory.find((object) => {
      return object.item === recipe.craftedItem.item;
    });
    assertExists(found);
  }
  assertNotEquals(inventoryBefore, state.inventory);
});

Deno.test("cannot craft recipes when not enough materials", () => {
  const state = resetState();

  const stateCopy = JSON.parse(JSON.stringify(state));
  for (const recipe of recipes) {
    apply(state, { type: "craft", recipe: recipe });
  }
  assertEquals(stateCopy, state);
});

Deno.test("all materials needed to craft are obtainable", () => {
  const terrainItems = Object.values(yields);
  const obtainableItems = terrainItems.flat();

  // Put all items you can craft into array of obtainable items
  for (const recipe of recipes) {
    obtainableItems.push(recipe.craftedItem.item);
  }
  // Check each ingredient in recipes and see if they are obtainable by crafting or gathering
  for (const recipe of recipes) {
    for (const obj of recipe.itemsNeeded) {
      assert(obtainableItems.includes(obj.item));
    }
  }
});
