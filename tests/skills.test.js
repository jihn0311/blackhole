import test from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  upgrades,
  skillNodes,
  ownsSkill,
  buy,
  restore,
  SAVE_VERSION,
  baseBodies,
  massGain,
  levelFloor,
  level,
  expeditionReward,
  claim,
  missions,
} from "../src/game.js";
import { permanentNodes } from "../src/skillData.js";
import { buyPermanent, rebirth, rebirthReward } from "../src/prestige.js";
test("80 connected nodes enforce dependencies, price, single purchase and reachability", () => {
  assert.equal(skillNodes.length, 80);
  assert.equal(new Set(skillNodes.map((n) => n.id)).size, 80);
  let s = { ...fresh(), points: 10000 };
  assert.equal(buy(s, "auto"), s);
  s = buy(s, "cooldown");
  s = buy(s, "auto");
  for (let i = 1; i < 4; i++) s = buy(s, "auto");
  assert.notEqual(buy(s, "auto"), s); // Other branches no longer gate this path.
  for (let pass = 0; pass < 80; pass++)
    for (const n of skillNodes)
      if (!ownsSkill(s, n.id) && n.requires.every((id) => ownsSkill(s, id)))
        s = buy(s, n.branch);
  assert.equal(skillNodes.filter((n) => ownsSkill(s, n.id)).length, 80);
  assert.equal(
    s.points,
    10000 - skillNodes.reduce((sum, n) => sum + n.cost, 0),
  );
  for (const n of skillNodes) assert.equal(buy(s, n.branch), s);
  assert.equal(buy(fresh(), "cooldown").points, 0);
});
test("permanent tree has 10 nodes, ascending depth costs and requires both final parents", () => {
  assert.equal(permanentNodes.length, 10);
  let s = { ...fresh(), shards: 1000 };
  assert.equal(buyPermanent(s, "eternity"), s);
  for (const n of permanentNodes) {
    for (const id of n.requires)
      assert.ok(n.cost > permanentNodes.find((p) => p.id === id).cost);
    s = buyPermanent(s, n.id);
    assert.equal(s.permanentSkills[n.id], true);
    assert.equal(buyPermanent(s, n.id), s);
  }
  assert.equal(s.shards, 1000 - permanentNodes.reduce((a, n) => a + n.cost, 0));
  const ready = {
    ...s,
    mass: 100000,
    points: 137,
    upgrades: Object.fromEntries(upgrades.map((u) => [u.id, u.max])),
    codex: Object.fromEntries(baseBodies.map((b) => [b.id, true])),
  };
  const next = rebirth(ready);
  assert.equal(next.points, 5);
  assert.equal(next.shards, s.shards + 1);
  assert.equal(rebirthReward(ready), 1);
  assert.deepEqual(next.permanentSkills, s.permanentSkills);
  assert.ok(massGain(next, baseBodies[0]) > massGain(fresh(), baseBodies[0]));
  assert.deepEqual(restore({ version: SAVE_VERSION, state: next }), next);
});
test("version 3 keeps every investment, currencies and progress without repeat grants", () => {
  const old = {
    ...fresh(),
    mass: 123456,
    points: 71,
    shards: 28,
    upgrades: {
      cooldown: 12,
      auto: 10,
      stream: 10,
      efficiency: 10,
      research: 8,
      bounty: 8,
    },
    permanent: { mass: 10, time: 8 },
    counts: { sun: 20 },
    mission: 8,
  };
  const s = restore({ version: 3, state: old });
  for (const [id, n] of Object.entries(old.upgrades))
    assert.equal(s.upgrades[id], n);
  assert.equal(s.points, 71);
  assert.equal(s.shards, 28);
  assert.equal(s.mass, 123456);
  assert.deepEqual(s.permanent, old.permanent);
  assert.equal(s.holdPermanent, true);
  assert.deepEqual(restore({ version: SAVE_VERSION, state: s }), s);
});
test("new branches affect large celestial bodies and repeated exploration", () => {
  const base = fresh(),
    boosted = {
      ...base,
      upgrades: { ...base.upgrades, stellar: 12, expedition: 10 },
      mission: missions.length,
      counts: { asteroid: 100 },
    };
  assert.equal(massGain(boosted, baseBodies[0]), massGain(base, baseBodies[0]));
  assert.ok(
    massGain(boosted, baseBodies.at(-1)) > massGain(base, baseBodies.at(-1)),
  );
  assert.equal(claim(boosted).points, expeditionReward(boosted));
  assert.equal(expeditionReward(boosted), 25);
});
test("mass increments grow more sharply at every level", () => {
  for (let lv = 1; lv < 1000; lv++) {
    assert.equal(
      levelFloor(lv + 1) - levelFloor(lv),
      80 * lv ** 3 + 30 * lv ** 2 - 10 * lv,
    );
    assert.equal(level(levelFloor(lv)), lv);
  }
});
