// The rules of the game. There is no clock here: a command updates the state at
// once, and the events it returns are a record of what happened. Whoever called
// apply() decides how, or whether, to show them over time.

import { isPassable, type Terrain, terrainAt, yields } from "./terrain.ts";
import { type Recipe } from "./recipe.ts";

export type Cell = { x: number; y: number };

export type Direction = "north" | "south" | "east" | "west";

// Plain data that survives JSON. Terrain is absent because the seed can recompute
// it: besides the seed, only what the player has caused belongs here.
export type GameState = {
  seed: number;
  player: Cell;
  inventory: { item: string; amount: number }[];
  changedCells: Cell[];
};

// Command: https://gameprogrammingpatterns.com/command.html
export type Command =
  | { type: "move"; direction: Direction }
  | { type: "gather"; cell: Cell }
  | { type: "craft"; recipe: Recipe };

// Domain Event: https://martinfowler.com/eaaDev/DomainEvent.html
export type GameEvent =
  | { type: "moved"; from: Cell; to: Cell }
  | { type: "blocked"; at: Cell; toward: Cell; terrain: Terrain }
  | {
    type: "gathered";
    yield: string;
    at: Cell;
    inventory: { item: string; amount: number }[];
  }
  | { type: "empty"; at: Cell }
  | {
    type: "crafted";
    craftedItem: string;
    inventory: { item: string; amount: number }[];
  }
  | {
    type: "cantCraft";
    recipe: string;
    missing: { item: string; amount: number }[];
  };

const STEPS: Record<Direction, Cell> = {
  north: { x: 0, y: -1 },
  south: { x: 0, y: 1 },
  east: { x: 1, y: 0 },
  west: { x: -1, y: 0 },
};

// Singleton, avoided on purpose: tests make as many games as they need. https://gameprogrammingpatterns.com/singleton.html
export function newGame(seed: number): GameState {
  return { seed, player: { x: 0, y: 0 }, inventory: [], changedCells: [] };
}

// The single way in. It updates the state it is given and returns the events.
export function apply(state: GameState, command: Command): GameEvent[] {
  switch (command.type) {
    case "move":
      return move(state, command.direction);
    case "gather":
      return gather(state, command.cell);
    case "craft":
      return craft(state, command.recipe);
  }
}

function move(state: GameState, direction: Direction): GameEvent[] {
  const step = STEPS[direction];
  // Events are retained and played back later, while state keeps changing. So an
  // event gets cells of its own, never an object that state still holds.
  // Aliasing Bug: https://martinfowler.com/bliki/AliasingBug.html
  // Cells in events act as a Value Object: https://martinfowler.com/bliki/ValueObject.html
  const from = { ...state.player };
  const to = { x: from.x + step.x, y: from.y + step.y };
  const terrain = terrainAt(state.seed, to.x, to.y);
  if (!isPassable(terrain)) {
    return [{ type: "blocked", at: from, toward: to, terrain }];
  }
  state.player.x = to.x;
  state.player.y = to.y;
  return [{ type: "moved", from, to }];
}

function isChanged(state: GameState, cell: Cell) {
  for (const changed of state.changedCells) {
    if (cell.x === changed.x && cell.y === changed.y) {
      return true;
    }
  }
  return false;
}

export function addToInventory(state: GameState, item: string, amount: number) {
  let found = false;
  for (const object of state.inventory) {
    if (item === object.item) {
      // Cap amount of each item at 99
      object.amount = Math.min(object.amount + amount, 99);
      found = true;
    }
  }
  if (found === false) {
    state.inventory.push({ item: item, amount: Math.min(amount, 99) });
  }
}

function removeFromInventory(state: GameState, item: string, amount: number) {
  let foundItem;
  for (const object of state.inventory) {
    if (item === object.item) {
      object.amount -= amount;
      foundItem = object;
      break;
    }
  }
  // Remove object from inventory if the amount becomes 0 or less
  if (foundItem && foundItem?.amount <= 0) {
    state.inventory.splice(state.inventory.indexOf(foundItem), 1);
  }
}

function gather(state: GameState, cell: Cell): GameEvent[] {
  const cellCopy = { x: cell.x, y: cell.y };
  if (isChanged(state, cellCopy)) {
    return [{ type: "empty", at: { ...cellCopy } }];
  }

  const terrain = terrainAt(state.seed, cellCopy.x, cellCopy.y);
  const yieldOptions = yields[terrain];
  const randomYield =
    yieldOptions[Math.floor(Math.random() * yieldOptions.length)];
  addToInventory(state, randomYield, 1);
  state.changedCells.push(cellCopy);

  return [{
    type: "gathered",
    yield: randomYield,
    at: { ...cellCopy },
    inventory: state.inventory.map((entry) => ({ ...entry })),
  }];
}

export function getMissingItems(state: GameState, recipe: Recipe) {
  const missing = [];
  for (const recipeObj of recipe.itemsNeeded) {
    let amountOwned = 0;
    const owned = state.inventory.find((inventoryObj) =>
      inventoryObj.item === recipeObj.item
    );

    // Check to make sure owned is not equal to undefined
    if (owned) amountOwned = owned.amount;

    if (amountOwned < recipeObj.amount) {
      missing.push({
        item: recipeObj.item,
        amount: recipeObj.amount - amountOwned,
      });
    }
  }
  return missing;
}

function craft(state: GameState, recipe: Recipe): GameEvent[] {
  const missing = getMissingItems(state, recipe);
  // If there are no missing items
  if (missing.length === 0) {
    for (const recipeObj of recipe.itemsNeeded) {
      removeFromInventory(state, recipeObj.item, recipeObj.amount);
    }
    addToInventory(state, recipe.craftedItem.item, recipe.craftedItem.amount);
    return [{
      type: "crafted",
      craftedItem: recipe.craftedItem.item,
      inventory: state.inventory.map((entry) => ({ ...entry })),
    }];
  }
  return [{ type: "cantCraft", recipe: recipe.name, missing: missing }];
}
