import test from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  spawnCount,
  extraSpawnChance,
  criticalChance,
  absorb,
  bodies,
  massGain,
  blackHoleScale,
  level,
  cooldown,
} from "../src/game.js";
import { rebirth } from "../src/prestige.js";
test("extra spawn chance applies once per normal spawn and respects boundaries", () => {
  const base = fresh(),
    s = { ...base, upgrades: { ...base.upgrades, auto: 10 } };
  assert.equal(spawnCount(base, 0), 1);
  assert.equal(extraSpawnChance(s), 0.2);
  assert.equal(spawnCount(s, 0.19999), 2);
  assert.equal(spawnCount(s, 0.2), 1);
  assert.equal(cooldown(s, bodies[0]), cooldown(base, bodies[0]));
});
test("critical absorption multiplies mass by ten but counts one body and pays crossed levels", () => {
  const base = fresh(),
    s = { ...base, mass: 90, upgrades: { ...base.upgrades, stream: 10 } };
  assert.equal(criticalChance(s), 0.1);
  const hit = absorb(s, "asteroid", 0),
    normal = absorb(s, "asteroid", 0.1);
  assert.equal(hit.mass - s.mass, 10 * massGain(s, bodies[0]));
  assert.equal(normal.mass - s.mass, massGain(s, bodies[0]));
  assert.equal(hit.counts.asteroid, 1);
  assert.equal(hit.points, 2 * (level(hit.mass) - level(s.mass)));
  const p = rebirth({
    ...s,
    mass: 1e6,
    rebirths: 1,
    points: 100,
    codex: Object.fromEntries(bodies.slice(0, 12).map((b) => [b.id, true])),
  });
  assert.equal(criticalChance(p), 0.01);
});
test("black hole starts smaller and grows gradually within the viewport", () => {
  assert.equal(blackHoleScale(1), 0.38);
  for (let l = 2; l <= 200; l++) {
    assert.ok(blackHoleScale(l) > blackHoleScale(l - 1));
    assert.ok(blackHoleScale(l) <= 1);
  }
  assert.ok(blackHoleScale(25) > 0.7);
  assert.equal(blackHoleScale(0), 0.38);
});
