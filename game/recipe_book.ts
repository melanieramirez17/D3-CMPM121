import { type Command, type GameState, recipes } from "../core/mod.ts";

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
      recipeButton.textContent = recipe.name;
      recipeList.append(recipeButton);
      list.append(recipeList);
      this.buttonArray.push(recipeButton);
      recipeButton.addEventListener("click", () => {
        startCraft({ type: "craft", recipe: recipe });
      });
    }
  }
}
