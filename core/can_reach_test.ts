import { cantReach } from "./can_reach.ts";
import { assert, assertEquals } from "@std/assert";
import { recipes } from "./recipe.ts";
import { assertNotEquals } from "@std/assert";

Deno.test("real table gives tracer's answer", () => {
  const recipeTest = cantReach(recipes);
  assertEquals(recipeTest, []); // make sure that nothing is unreachable
});

Deno.test("broken table returns unobtainable recipe", () => {
  const brokenRecipes = [...recipes];
  // Two reachable recipes, one unreachable
  brokenRecipes.push(
    {
      name: "mittens",
      itemsNeeded: [{ item: "fabric", amount: 1 }],
      craftedItem: { item: "mittens", amount: 1 },
    },
    {
      name: "fabric",
      itemsNeeded: [{ item: "grass", amount: 1 }],
      craftedItem: { item: "fabric", amount: 1 },
    },
    {
      name: "earmuffs",
      itemsNeeded: [{ item: "earmuffs", amount: 1 }],
      craftedItem: { item: "earmuffs", amount: 1 },
    },
  );
  const uncraftableRecipes = cantReach(brokenRecipes);
  console.log(uncraftableRecipes);
  assertNotEquals(uncraftableRecipes, []);
});

Deno.test("check that the capstone is reachable", () => {
  const capstone = recipes.find((recipe) => recipe.capstone === true);
  assert(capstone !== undefined);
  const uncraftableRecipes = cantReach(recipes);
  assert(
    (uncraftableRecipes.find((recipe) => recipe === capstone)) === undefined,
  );
});
