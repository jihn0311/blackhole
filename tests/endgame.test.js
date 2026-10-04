import test from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  upgrades,
  levelPoints,
  levelReward,
  fullyUpgraded,
  levelFloor,
  absorb,
  massGain,
  cooldown,
  bodies,
  skillNodes,
  extraSpawnChance,
  criticalChance,
} from "../src/game.js";
import { rebirth } from "../src/prestige.js";
test("early rewards remain unchanged and later rewards accelerate", () => {
  const s = fresh();
  for (let lv = 1; lv <= 5; lv++) assert.equal(levelReward(s, lv), 2);
  assert.equal(levelReward(s, 10), 27);
  assert.equal(levelReward(s, 20), 227);
  assert.ok(
    levelPoints(s, 1, 30) > skillNodes.reduce((sum, n) => sum + n.cost, 0),
  );
});
test("multi-level rewards equal each individual crossing and are paid once", () => {
  const s = { ...fresh(), upgrades: { ...fresh().upgrades, research: 4 } };
  for (let from = 1; from < 30; from++)
    for (let to = from; to < 35; to++) {
      let expected = 0;
      for (let lv = from; lv < to; lv++) expected += levelReward(s, lv);
      assert.equal(levelPoints(s, from, to), expected);
    }
  const next = absorb({ ...s, mass: levelFloor(11) - 1 }, "asteroid");
  assert.equal(next.points, 31);
  assert.equal(absorb(next, "asteroid").points, 31);
});
test("overdrive only begins at full mastery and resets on rebirth", () => {
  const full = {
    ...fresh(),
    mass: 1e6,
    points: 100,
    upgrades: Object.fromEntries(upgrades.map((u) => [u.id, u.max])),
    codex: Object.fromEntries(bodies.slice(0, 12).map((b) => [b.id, true])),
  };
  const almost = { ...full, upgrades: { ...full.upgrades, expedition: 9 } };
  assert.equal(fullyUpgraded(almost), false);
  assert.equal(fullyUpgraded(full), true);
  assert.equal(massGain(full, bodies[0]), 10 * massGain(almost, bodies[0]));
  assert.equal(cooldown(full, bodies[11]), cooldown(almost, bodies[11]) / 2);
  assert.equal(levelReward(full), 3 * levelReward(almost));
  assert.equal(extraSpawnChance(full), 0.2);
  assert.equal(criticalChance(full), 0.1);
  assert.equal(fullyUpgraded(rebirth(full)), false);
});
