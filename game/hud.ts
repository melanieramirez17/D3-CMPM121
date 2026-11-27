import {
  type GameEvent,
  type GameState,
  terrainAt,
  unlockedBy,
} from "../core/mod.ts";
import { recipes } from "../core/recipe.ts";

function element(id: string): HTMLElement {
  return document.getElementById(id)!;
}

for (const recipe of recipes) {
  const term = document.createElement("dt");
  // Capitalize first letter of the recipe
  let firstLetter = recipe.name[0];
  firstLetter = firstLetter.toUpperCase();
  const end = recipe.name.slice(1);
  const name = firstLetter + end;

  term.textContent = name;
  element("recipesHud").append(term);
  for (const item of recipe.itemsNeeded) {
    const detail = document.createElement("dd");
    detail.textContent = `${item.item}: ${item.amount}`;
    element("recipesHud").append(detail);
  }
}

function describe(event: GameEvent): string {
  switch (event.type) {
    case "moved":
      return `Moved to ${event.to.x}, ${event.to.y}`;
    case "blocked": {
      const opener = unlockedBy[event.terrain];
      if (opener !== null) {
        return `Blocked by ${event.terrain} at ${event.toward.x}, ${event.toward.y} (need ${opener})`;
      }
      return `Blocked by ${event.terrain} at ${event.toward.x}, ${event.toward.y}`;
    }
    case "gathered":
      return `Gathered ${event.yield} from ${event.at.x}, ${event.at.y}`;
    case "empty":
      return `Could not gather from ${event.at.x},
        ${event.at.y}. It is empty`;
    case "crafted":
      return `Crafted ${event.craftedItem}`;
    case "cantCraft":
      return `Could not craft ${event.recipe}. Need ${
        event.missing.map((missingObj) =>
          `${missingObj.item}: ${missingObj.amount}`
        ).join(", ")
      }`;
    case "won":
      document.getElementById("winBanner")!.hidden = false;
      return `You won! You have made the ingredients for a super cozy winter!`;
  }
}

// The readout, as ordinary page elements that CSS can style and that assistive
// tools can read. It changes only as events play.
export class Hud {
  private readonly seed: number;

  constructor(state: GameState) {
    this.seed = state.seed;
    this.showPosition(state.player.x, state.player.y);
  }

  show(event: GameEvent) {
    element("live").textContent = describe(event);
    if (event.type === "moved") this.showPosition(event.to.x, event.to.y);
    if (event.type === "gathered" || event.type === "crafted") {
      const inventory = element("inventory");
      inventory.textContent = "";
      for (const { item, amount } of event.inventory) {
        const inventoryItem = document.createElement("li");
        inventoryItem.textContent = `${item}: ${amount}`;
        inventory.append(inventoryItem);
      }
    }
  }

  private showPosition(x: number, y: number) {
    element("position").textContent = `${x}, ${y}`;
    element("terrain").textContent = terrainAt(this.seed, x, y);
  }
}
