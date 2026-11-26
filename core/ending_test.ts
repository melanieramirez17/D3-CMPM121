import { assertEquals } from "@std/assert";
import { apply, newGame, recipes } from "./mod.ts";

const SEED = 121;
Deno.test("won game", () => {
  const state = newGame(SEED);
  const capstone = recipes.find((recipe) => recipe.capstone);
  if (!capstone) throw new Error("No capstone recipe found");
  for (const { item, amount } of capstone.itemsNeeded) {
    state.inventory.push({ item, amount });
  }
  apply(state, { type: "craft", recipe: capstone });
  const snapshot = JSON.parse(JSON.stringify(state));
  const move = apply(state, { type: "move", direction: "east" });
  const gather = apply(state, { type: "gather", cell: state.player });
  const craft = apply(state, { type: "craft", recipe: capstone });
  assertEquals(move, []);
  assertEquals(gather, []);
  assertEquals(craft, []);
  assertEquals(state, snapshot);
});
