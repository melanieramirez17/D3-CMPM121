import {
  type Command,
  type GameState,
  getMissingItems,
  recipes,
} from "../core/mod.ts";

export class RecipeBook {
  state: GameState;
  buttonArray: HTMLButtonElement[] = [];
  constructor(
    list: HTMLElement,
    state: GameState,
    startCraft: (command: Command) => void,
  ) {
    this.state = state;
    for (const recipe of recipes) {
      const recipeList = document.createElement("li");
      const recipeButton = document.createElement("button");
      recipeButton.type = "button";
      recipeList.append(recipeButton);
      list.append(recipeList);
      this.buttonArray.push(recipeButton);
      recipeButton.addEventListener("click", (e) => {
        startCraft({ type: "craft", recipe: recipe });
        // e.detail > 0 checks whether it was a mouse click
        if (e.detail > 0) recipeButton.blur();
      });
    }
  }

  nameButtons() {
    for (const i in recipes) {
      const missing = getMissingItems(this.state, recipes[i]);
      if (missing.length === 0) {
        this.buttonArray[i].textContent = `Craft ${recipes[i].name}`;
      } else {
        this.buttonArray[i].textContent = `Cannot craft ${recipes[i].name}`;
      }
    }
  }
}
