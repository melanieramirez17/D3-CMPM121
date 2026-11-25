import { type Recipe } from "./recipe.ts";
import { type Terrain, unlockedBy, yields } from "./terrain.ts";

export function cantReach(recipes: Recipe[]) {
  const reached = new Set<string>();
  const made = new Set<Recipe>();

  const terrainItems = Object.entries(unlockedBy);
  for (const [terrain, opener] of terrainItems) { // every entry has a terrain and what opens the terrain
    if (opener === null) { // if a terrain is open off rip
      for (const item of yields[terrain as Terrain]) {
        reached.add(item);
      }
    }
  }

  let changed = true;

  while (changed) {
    changed = false;

    for (const recipe of recipes) {
      // Skip current recipe if it is already in made
      if (made.has(recipe)) continue;
      let canCraft = true;
      // Check that ingredients to make recipe are currently obtainable
      for (const ingredients of recipe.itemsNeeded) {
        if (!reached.has(ingredients.item)) canCraft = false;
      }
      // If the recipe is currently craftable, add the recipe to made and the new crafted item to reached
      if (canCraft) {
        made.add(recipe);
        reached.add(recipe.craftedItem.item);
        changed = true;

        for (const [terrain, opener] of terrainItems) {
          if (opener === recipe.craftedItem.item) {
            // Add all yields for that terrain if it's opener was crafted
            for (const item of yields[terrain as Terrain]) {
              reached.add(item);
            }
          }
        }
      }
    }
    // Filter out recipes that are in made and creates a new array with remaining recipes
    const cannotCraft = recipes.filter((recipe) => !made.has(recipe));
    return cannotCraft;
  }
}
