import { type GameEvent, type GameState, terrainAt } from "../core/mod.ts";

function element(id: string): HTMLElement {
  return document.getElementById(id)!;
}

function describe(event: GameEvent): string {
  switch (event.type) {
    case "moved":
      return `Moved to ${event.to.x}, ${event.to.y}`;
    case "blocked":
      return `Blocked by ${event.terrain} at ${event.toward.x}, ${event.toward.y}`;
    case "gathered":
      return `Gathered ${event.yield} from ${event.at.x}, ${event.at.y}`;
    case "empty":
      return `Could not gather from ${event.at.x},
        ${event.at.y}. It is empty`;
    case "crafted":
      return `Crafted ${event.craftedItem}`;
    case "cantCraft":
      return `Could not craft ${event.recipe}. Need: ${
        event.missing.map((missingObj) =>
          `${missingObj.item}: ${missingObj.amount}`
        ).join(", ")
      }`;
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
