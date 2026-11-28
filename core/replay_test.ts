import { apply, type Command, type GameEvent, newGame } from "./mod.ts";
import { assertEquals } from "@std/assert";
import run from "./run.json" with { type: "json" };

function runReplay() {
  const state = newGame(run.seed);
  const events: GameEvent[] = [];
  for (const command of run.commands as Command[]) {
    events.push(...apply(state, command));
  }
  return { state, events };
}

Deno.test("Replaying a recorded win returns won", () => {
  const { state } = runReplay();
  assertEquals(state.won, true);
});

Deno.test("the same seed and commands always give the same result", () => { // used similar structure to determinism_test.ts
  const first = runReplay();
  const start = Date.now();
  while (Date.now() === start);
  const second = runReplay();
  assertEquals(first, second);
});
