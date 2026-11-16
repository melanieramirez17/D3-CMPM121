import { type GameState, isPassable, terrainAt } from "./mod.ts";
import { Terrain } from "./terrain.ts";

// Each test has a Given-When-Then shape: https://martinfowler.com/bliki/GivenWhenThen.html
const SEED = 121;

// A state with the player at the target terrain.
export function findCellTerrain(target: Terrain): GameState {
  for (let x = 2; x < 10_000; x++) {
    const here = terrainAt(SEED, x, 0);
    if (here === target) {
      return {
        seed: SEED,
        player: { x, y: 0 },
        inventory: [],
        changedCells: [],
      };
    }
  }
  throw new Error("Found no suitable cell on this row.");
}
export function findTerrainBesidePassable(
  target: Terrain,
  passable: boolean,
): GameState {
  for (let x = 2; x < 10_000; x++) {
    const east = isPassable(terrainAt(SEED, x + 1, 0));
    const here = terrainAt(SEED, x, 0) === target;
    if (here && east === passable) {
      return {
        seed: SEED,
        player: { x, y: 0 },
        inventory: [],
        changedCells: [],
      };
    }
  }
  throw new Error("Found no suitable cell on this row.");
}
