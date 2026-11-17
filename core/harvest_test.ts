import { assertEquals } from "@std/assert";
import { apply } from "./mod.ts";
import { findCellTerrain, findTerrainBesidePassable } from "./test_helpers.ts";
import { yields } from "./terrain.ts";

Deno.test("player gathers after moving onto passable terrain", () => {
  const state = findCellTerrain("forest"); // player is on forest
  const { x, y } = state.player; // copy of their coords

  const events = apply(state, { type: "gather", cell: state.player }); // runs gather
  const event = events[0]; // first event

  assertEquals(events.length, 1); // makes sure we only got one event
  assertEquals(event.type, "gathered"); // verifies that it was gathered
  if (event.type !== "gathered") { // checks to make sure we can go on
    throw new Error("Found no suitable cell on this row.");
  }
  assertEquals(event.at, { x, y }); // makes sure we gathered at the coords we started at
  assertEquals(yields["forest"].includes(event.yield), true); // makes sure the item gathered is supposed to be gathered in the forest
  assertEquals(state.inventory, [{ item: event.yield, amount: 1 }]); // makes sure the amount in the inventory is now updated
  assertEquals(state.changedCells, [{ x, y }]); // verifies that the cells changed added the coords we just gathered at
});

Deno.test("already harvested gather", () => {
  const state = findCellTerrain("forest"); // player is on forest
  const { x, y } = state.player; // copy of their coords
  apply(state, { type: "gather", cell: state.player }); // runs gather the first time
  const snapshot = JSON.parse(JSON.stringify(state));
  const events = apply(state, { type: "gather", cell: state.player }); // runs gather again
  assertEquals(state, snapshot);
  assertEquals(events, [{ type: "empty", at: { x, y } }]);
});

Deno.test("a gather event keeps its cells while state moves on", () => {
  const state = findTerrainBesidePassable("forest", true);
  const { x, y } = state.player;

  const first = apply(state, { type: "gather", cell: state.player });
  apply(state, { type: "move", direction: "east" });
  const event = first[0];

  if (event.type !== "gathered") { // checks to make sure we can go on
    throw new Error("Found no suitable cell on this row.");
  }
  assertEquals(event.at, { x, y });
  assertEquals(apply(state, { type: "gather", cell: { x, y } }), [{
    type: "empty",
    at: { x, y },
  }]);
});

Deno.test("a gather event keeps its inventory while state changes", () => {
  const state = findTerrainBesidePassable("forest", true);
  const first = apply(state, { type: "gather", cell: state.player });
  apply(state, { type: "move", direction: "east" });
  const event = first[0];

  if (event.type !== "gathered") { // checks to make sure we can go on
    throw new Error("Found no suitable cell on this row.");
  }
  apply(state, { type: "gather", cell: state.player });
  assertEquals(event.inventory, [{ item: event.yield, amount: 1 }]);
});
