import { addToInventory, type GameState, yields } from "./mod.ts";

const SEED = 121;

const state: GameState = {
  seed: SEED,
  player: { x: 0, y: 0 },
  inventory: [],
  changedCells: [],
};

for (const terrain of Object.values(yields)) {
  for (const item of terrain) {
    addToInventory(state, item, 99);
  }
}
