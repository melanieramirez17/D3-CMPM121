import { cantReach } from "./can_reach.ts";
import { assertEquals } from "@std/assert";
import { recipes } from "./recipe.ts";
import { assertNotEquals } from "@std/assert";

Deno.test("real table gives tracer's answer", () => {
  const recipeTest = cantReach(recipes);
  assertEquals(recipeTest, []); // make sure that nothing is unreachable
});

Deno.test("broken table returns unobtainable recipe", () => {
  const brokenRecipes = [...recipes];
  brokenRecipes.push({
    name: "mittens",
    itemsNeeded: [{ item: "mittens", amount: 1 }],
    craftedItem: { item: "mittens", amount: 1 },
  });
  const uncraftableRecipes = cantReach(brokenRecipes);
  assertNotEquals(uncraftableRecipes, []);
});
