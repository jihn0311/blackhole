import test from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  upgrades,
  baseBodies,
  prestigeBodies,
  absorb,
  holdUnlocked,
  massGain,
  cooldown,
  restore,
  SAVE_VERSION,
  reserve,
  hasDiscovered,
  discovered,
  isUnlocked,
} from "../src/game.js";
import {
  rebirth,
  canRebirth,
  rebirthReward,
  rebirthTarget,
  buyPermanent,
} from "../src/prestige.js";
const ready = () => ({
  ...fresh(),
  mass: 100000,
  points: 137,
  counts: Object.fromEntries(baseBodies.map((b) => [b.id, 3])),
  mission: 10,
  expeditions: 4,
  upgrades: Object.fromEntries(upgrades.map((u) => [u.id, u.max])),
  cooldowns: { asteroid: 9999999999999 },
});
test("rebirth rewards use only unspent points, including rounding", () => {
  let s = ready();
  assert.equal(rebirthReward(s), 1);
  assert.equal(rebirthReward({ ...s, mass: 10000000 }), 1);
  for (const [points, reward] of [
    [0, 0],
    [9, 0],
    [10, 0],
    [19, 0],
    [20, 0],
    [99, 0],
    [100, 1],
    [199, 1],
    [200, 2],
  ])
    assert.equal(rebirthReward({ ...s, points }), reward);
});
test("all three rebirth requirements are enforced without mutation", () => {
  const s = ready();
  assert.ok(canRebirth(s));
  for (const bad of [
    { ...s, points: 99 },
    { ...s, mass: 99999 },
    { ...s, counts: { asteroid: 50000 } },
  ]) {
    assert.equal(canRebirth(bad), false);
    assert.equal(rebirth(bad), bad);
  }
});
test("rebirth resets the run but keeps codex, record, hold feature, and permanent upgrades", () => {
  let s = ready();
  s.bestMass = 180000;
  s.shards = 2;
  s.permanent = { mass: 2, time: 1 };
  const n = rebirth(s);
  assert.equal(n.mass, 0);
  assert.equal(n.points, 0);
  assert.deepEqual(n.counts, {});
  assert.deepEqual(n.cooldowns, {});
  assert.equal(n.mission, 0);
  assert.equal(n.expeditions, 0);
  assert.deepEqual(n.upgrades, fresh().upgrades);
  assert.equal(n.bestMass, 180000);
  assert.equal(n.shards, 3);
  assert.equal(n.rebirths, 1);
  assert.deepEqual(n.permanent, s.permanent);
  assert.equal(discovered(n), 12);
  assert.ok(holdUnlocked(n));
  assert.ok(hasDiscovered(n, "sun"));
  assert.equal(rebirth(n), n);
  assert.deepEqual(restore({ version: SAVE_VERSION, state: n }), n);
});
test("unearned hold feature is not granted on rebirth", () => {
  const s = ready();
  s.upgrades.stream = 9;
  s.rebirths = 1;
  s.mass = rebirthTarget(s);
  assert.equal(holdUnlocked(rebirth(s)), false);
});
test("special objects require both rebirth count and mass", () => {
  let s = ready();
  s.mass = 1e9;
  for (const b of prestigeBodies) assert.equal(reserve(s, b.id, 1000), s);
  for (let count = 1; count <= 3; count++) {
    s = { ...s, rebirths: count };
    for (const b of prestigeBodies) {
      assert.equal(isUnlocked(s, b), count >= b.rebirth);
      assert.equal(reserve(s, b.id, 1000) === s, count < b.rebirth);
    }
    const b = prestigeBodies[count - 1];
    const low = { ...s, mass: b.unlock - 1 };
    assert.equal(reserve(low, b.id, 1000), low);
    assert.notEqual(reserve({ ...s, mass: b.unlock }, b.id, 1000), s);
  }
});
test("three consecutive rebirths retain discoveries and unlock new chapters", () => {
  let s = ready();
  for (let count = 1; count <= 3; count++) {
    s = { ...s, mass: rebirthTarget(s), points: 100 };
    s = rebirth(s);
    assert.equal(s.rebirths, count);
    assert.equal(s.shards, count);
    assert.equal(discovered(s), 12 + count - 1);
    const b = prestigeBodies[count - 1];
    s = { ...s, mass: b.unlock };
    s = absorb(s, b.id);
    assert.ok(hasDiscovered(s, b.id));
  }
  assert.equal(discovered(s), 15);
});
test("permanent purchases cost shards, have a cap, and apply after rebirth", () => {
  let s = fresh();
  assert.equal(buyPermanent(s, "mass"), s);
  s.shards = 100;
  const b = baseBodies[0],
    before = massGain(s, b);
  s = buyPermanent(s, "mass");
  assert.equal(s.shards, 99);
  assert.ok(massGain(s, b) > before);
  s = buyPermanent(s, "time");
  assert.equal(s.shards, 97);
  assert.ok(cooldown(s, b) < cooldown(fresh(), b));
  assert.equal(s.permanentSkills.mass, true);
  assert.equal(buyPermanent(s, "mass"), s);
  assert.equal(buyPermanent(s, "unknown"), s);
});
test("version 2 migration remembers existing discoveries and earned hold", () => {
  const old = ready();
  delete old.codex;
  delete old.bestMass;
  delete old.permanent;
  delete old.rebirths;
  delete old.shards;
  delete old.holdPermanent;
  const n = restore({ version: 2, state: old });
  assert.equal(n.mass, 100000);
  assert.equal(n.points, 137);
  assert.equal(n.bestMass, 100000);
  assert.equal(n.rebirths, 0);
  assert.equal(discovered(n), 12);
  assert.ok(holdUnlocked(n));
  assert.deepEqual(restore({ version: SAVE_VERSION, state: n }), n);
});
test("invalid permanent save fields are rejected", () => {
  const s = ready();
  assert.deepEqual(
    restore({ version: 3, state: { ...s, shards: -1 } }),
    fresh(),
  );
  assert.deepEqual(
    restore({ version: 3, state: { ...s, permanent: { mass: 99, time: 0 } } }),
    fresh(),
  );
});
