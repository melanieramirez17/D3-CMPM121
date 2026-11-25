import { assertEquals } from "@std/assert";
import {
  apply,
  type GameState,
  isPassable,
  type Terrain,
  terrainAt,
  unlockedBy,
  yields,
} from "./mod.ts";

const SEED = 121;

function besideBarrier(barrier: Terrain): GameState {
  for (let y = 0; y < 100; y++) {
    for (let x = 2; x < 100; x++) {
      const here = isPassable(terrainAt(SEED, x, y), []);
      const east = terrainAt(SEED, x + 1, y);
      if (here && east === barrier) {
        return {
          seed: SEED,
          player: { x, y },
          inventory: [],
          changedCells: [],
        };
      }
    }
  }
  throw new Error("Found no suitable barrier on this row.");
}

Deno.test("shut before, open after, and gathering works inside", () => {
  const state = besideBarrier("water");
  const { x, y } = state.player;
  const opener = unlockedBy["water"];
  if (opener === null) {
    throw new Error("Terrain doesn't need a opener!");
  }

  // shut before
  const first = apply(state, { type: "move", direction: "east" });
  assertEquals(first, [{
    type: "blocked",
    at: { x, y },
    toward: { x: x + 1, y },
    terrain: "water",
  }]);

  // open after
  state.inventory.push({ item: opener, amount: 1 }); // give the player the opener
  const second = apply(state, { type: "move", direction: "east" }); // now the player should be allowed to move to the previously locked terrain

  assertEquals(second, [{
    type: "moved",
    from: { x: x, y },
    to: { x: x + 1, y },
  }]);

  // gathering works inside
  const third = apply(state, { type: "gather", cell: state.player });
  const gatherEvent = third[0];
  if (gatherEvent.type !== "gathered") {
    throw new Error("Gather Event was expected");
  }
  assertEquals(yields["water"].includes(gatherEvent.yield), true); // makes sure the item gathered is supposed to be gathered in the water
  assertEquals(gatherEvent.at, { x: x + 1, y }); // makes sure we gathered at the coords we started at
});
