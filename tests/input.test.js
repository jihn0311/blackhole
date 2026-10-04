import test from "node:test";
import assert from "node:assert/strict";
import { fresh, reserve } from "../src/game.js";
import { createSpawnInput } from "../src/input.js";
function harness() {
  let now = 1000;
  const calls = [],
    notes = [];
  const c = {
    state: fresh(),
    enabled: true,
    onSelect: (id) => (c.selected = id),
    notify: (m) => notes.push(m),
    onSpawn: (id, x, y, auto, quiet) => {
      const next = reserve(c.state, id, now, auto);
      if (next !== c.state) {
        calls.push({ id, x, y, quiet });
        c.state = next;
      }
    },
  };
  return {
    c,
    calls,
    notes,
    input: createSpawnInput(() => c),
    time: (n) => (now = n),
  };
}
test("number key selects and spawns at the edge even with the pointer at the center", () => {
  const h = harness();
  h.input.move(0.5, 0.47);
  h.input.press("asteroid", "Digit1");
  assert.equal(h.c.selected, "asteroid");
  assert.equal(h.calls[0].id, "asteroid");
  assert.ok(h.calls[0].x >= 0.15 && h.calls[0].x <= 0.85);
  assert.ok([0.12, 0.85].includes(h.calls[0].y));
  h.input.release("Digit1");
  h.time(10000);
  h.input.press("asteroid", "pointer");
  assert.equal(h.calls.length, 2);
  assert.ok([0.12, 0.85].includes(h.calls[1].y));
});
test("keyboard spawns at an edge without ever entering the canvas", () => {
  const h = harness();
  h.input.press("asteroid", "Digit1");
  assert.equal(h.calls.length, 1);
  assert.ok(h.calls[0].x >= 0.15 && h.calls[0].x <= 0.85);
  assert.ok([0.12, 0.85].includes(h.calls[0].y));
  assert.equal(h.notes.length, 0);
});
test("keyboard works after leaving the canvas and still respects cooldown", () => {
  const h = harness();
  h.input.move(0.5, 0.5);
  h.input.press("asteroid", "Digit1");
  h.input.clear();
  h.input.press("asteroid", "Digit1");
  assert.equal(h.calls.length, 1);
  h.input.release("Digit1");
  h.time(10000);
  h.input.press("asteroid", "Digit1");
  assert.equal(h.calls.length, 2);
  assert.ok([0.12, 0.85].includes(h.calls[1].y));
});
test("outside keyboard spawning respects locks and disabled controls", () => {
  const h = harness();
  h.input.press("moon", "Digit3");
  assert.equal(h.calls.length, 0);
  assert.equal(h.notes.length, 1);
  h.c.enabled = false;
  h.input.press("asteroid", "Digit1");
  assert.equal(h.calls.length, 0);
});
test("keyboard fallback does not create a pointer position for mouse input", () => {
  const h = harness();
  h.input.press("asteroid", "Digit1");
  h.input.release("Digit1");
  h.time(10000);
  h.input.press("asteroid", "pointer");
  assert.equal(h.calls.length, 1);
});
test("holding below the final stage never repeats", () => {
  const h = harness();
  h.c.state.upgrades.stream = 9;
  h.input.move(0.1, 0.2);
  h.input.press("asteroid", "pointer");
  h.time(10000);
  h.input.tick();
  h.input.press("asteroid", "pointer");
  assert.equal(h.calls.length, 1);
  h.input.release("pointer");
  h.input.press("asteroid", "pointer");
  assert.equal(h.calls.length, 2);
});
test("legacy hold repeats at the edge and respects cooldown and release", () => {
  const h = harness();
  h.c.state.upgrades.stream = 10;
  h.input.move(0.1, 0.2);
  h.input.press("asteroid", "Digit1");
  h.input.tick();
  assert.equal(h.calls.length, 1);
  h.time(4000);
  h.input.move(0.8, 0.7);
  h.input.tick();
  assert.equal(h.calls.length, 2);
  assert.ok(h.calls[1].x >= 0.15 && h.calls[1].x <= 0.85);
  assert.ok([0.12, 0.85].includes(h.calls[1].y));
  h.input.release("Digit1");
  h.time(10000);
  h.input.tick();
  assert.equal(h.calls.length, 2);
});
test("pause, modal, blur, and leaving the canvas cancel held input", () => {
  const h = harness();
  h.c.state.upgrades.stream = 10;
  h.input.move(0.1, 0.2);
  h.input.press("asteroid", "pointer");
  h.c.enabled = false;
  h.time(10000);
  h.input.tick();
  h.c.enabled = true;
  h.input.tick();
  assert.equal(h.calls.length, 1);
  h.input.press("asteroid", "pointer");
  assert.equal(h.calls.length, 2);
  h.input.clear();
  h.time(20000);
  h.input.tick();
  h.input.press("asteroid", "pointer");
  assert.equal(h.calls.length, 2);
});

test("new manual mode never repeats from the legacy critical mastery flag", () => {
  const h = harness();
  h.c.allowHold = false;
  h.c.state.upgrades.stream = 10;
  h.c.state.holdPermanent = true;
  h.input.move(0.2, 0.2);
  h.input.press("asteroid", "Digit1");
  h.time(10000);
  h.input.tick();
  assert.equal(h.calls.length, 1);
  h.input.release("Digit1");
  h.input.press("asteroid", "Digit1");
  assert.equal(h.calls.length, 2);
});
