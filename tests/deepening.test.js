import test from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  upgrades,
  permanentMass,
  restore,
  SAVE_VERSION,
  baseBodies,
} from "../src/game.js";
import { permanentNodes } from "../src/skillData.js";
import {
  buyPermanent,
  deepeningCost,
  rebirth,
  rebirthReward,
  canRebirth,
} from "../src/prestige.js";
const full = () => ({
  ...fresh(),
  shards: 1000,
  permanentSkills: Object.fromEntries(permanentNodes.map((n) => [n.id, true])),
});
test("deepening spends increasing costs, grows mass and requires all ten skills", () => {
  const locked = { ...full(), permanentSkills: { eternity: true } };
  assert.equal(buyPermanent(locked, "deepening"), locked);
  let s = full();
  const base = permanentMass(s);
  for (const [rank, cost] of [50, 100, 200, 400].entries()) {
    assert.equal(deepeningCost(s), cost);
    const before = s.shards;
    s = buyPermanent(s, "deepening");
    assert.equal(s.shards, before - cost);
    assert.equal(s.singularityDepth, rank + 1);
    assert.ok(
      Math.abs(permanentMass(s) / base - (1 + 0.1 * (rank + 1))) < 1e-10,
    );
  }
  assert.equal(buyPermanent(s, "deepening"), s);
});
test("deepening survives saving and rebirth, old saves keep owned skills and shards", () => {
  let s = buyPermanent(full(), "deepening");
  assert.deepEqual(restore({ version: SAVE_VERSION, state: s }), s);
  s = {
    ...s,
    mass: 100000,
    points: 200,
    upgrades: Object.fromEntries(upgrades.map((u) => [u.id, u.max])),
    codex: Object.fromEntries(baseBodies.map((b) => [b.id, true])),
  };
  const n = rebirth(s);
  assert.equal(n.singularityDepth, 1);
  assert.equal(n.shards, s.shards + 2);
  assert.equal(permanentMass(n), permanentMass(s));
  const old = full();
  delete old.singularityDepth;
  const restored = restore({ version: 4, state: old });
  assert.equal(restored.singularityDepth, 0);
  assert.equal(restored.shards, old.shards);
  assert.deepEqual(restored.permanentSkills, old.permanentSkills);
  assert.deepEqual(
    restore({ version: 4, state: { ...old, singularityDepth: -1 } }),
    fresh(),
  );
});
test("new shard rate and rising permanent costs preserve a reachable first purchase", () => {
  const s = {
    ...fresh(),
    mass: 100000,
    points: 99,
    upgrades: Object.fromEntries(upgrades.map((u) => [u.id, u.max])),
    codex: Object.fromEntries(baseBodies.map((b) => [b.id, true])),
  };
  assert.equal(canRebirth(s), false);
  s.points = 100;
  assert.equal(canRebirth(s), true);
  assert.equal(rebirthReward(s), 1);
  assert.equal(buyPermanent(rebirth(s), "mass").permanentSkills.mass, true);
  assert.equal(
    permanentNodes.reduce((sum, n) => sum + n.cost, 0),
    323,
  );
});
