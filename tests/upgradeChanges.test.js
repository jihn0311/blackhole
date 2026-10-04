import test from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  autoStage,
  upgradeCount,
  autoInterval,
  skillNodes,
  ownsSkill,
  buy,
  autoCandidates,
  bodies,
  reserve,
  isUnlocked,
} from "../src/game.js";
import { visibleSkills } from "../src/skillPresentation.js";
import { permanentNodes } from "../src/skillData.js";
import { buyPermanent } from "../src/prestige.js";
test("only owned nodes and nodes with all prerequisites learned are visible", () => {
  let s = { ...fresh(), points: 10000 };
  const visible = () => visibleSkills(skillNodes, (id) => ownsSkill(s, id));
  assert.deepEqual(
    visible().map((n) => n.id),
    ["cooldown:1"],
  );
  s = buy(s, "cooldown:1");
  assert.equal(visible().length, 9);
  assert.ok(!visible().some((n) => n.id === "auto:2"));
  s = buy(s, "auto:1");
  assert.ok(visible().some((n) => n.id === "auto:2"));
  for (let i = 0; i < 3; i++) s = buy(s, "auto");
  assert.ok(visible().some((n) => n.id === "auto:5"));
  s = buy(s, "cooldown");
  s = buy(s, "cooldown");
  assert.ok(visible().some((n) => n.id === "auto:5"));
  let p = { ...fresh(), shards: 100 };
  assert.equal(
    visibleSkills(permanentNodes, (id) => p.permanentSkills[id]).length,
    1,
  );
  p = buyPermanent(p, "mass");
  assert.deepEqual(
    visibleSkills(permanentNodes, (id) => p.permanentSkills[id]).map(
      (n) => n.id,
    ),
    ["mass", "time", "research"],
  );
});
test("automatic generation uses total upgrades and shares individual cooldowns", () => {
  const base = { ...fresh(), mass: 300 };
  assert.equal(autoCandidates(base, 1000).length, 0);
  assert.notEqual(reserve(base, "asteroid", 1000), base);
  const nine = {
    ...base,
    upgrades: { ...base.upgrades, auto: 9, stream: 10 },
    holdPermanent: true,
  };
  assert.equal(autoCandidates(nine, 1000).length, 0);
  let full = {
    ...nine,
    upgrades: {
      ...nine.upgrades,
      auto: 10,
      efficiency: 10,
      research: 8,
      bounty: 8,
      stellar: 4,
      expedition: 10,
    },
  };
  assert.equal(upgradeCount(full), 60);
  assert.equal(autoStage(full), 2);
  assert.deepEqual(
    autoCandidates(full, 1000).map((b) => b.id),
    ["asteroid", "pluto", "moon"],
  );
  full = reserve(full, "asteroid", 1000);
  assert.deepEqual(
    autoCandidates(full, 1001).map((b) => b.id),
    ["pluto", "moon"],
  );
  assert.equal(autoCandidates(full, 3000).length, 3);
});
test("unlock gaps increase and are enforced at their exact boundaries", () => {
  let previousGap = 0;
  for (let i = 1; i < bodies.length; i++) {
    const b = bodies[i],
      gap = b.unlock - bodies[i - 1].unlock;
    assert.ok(gap > previousGap);
    previousGap = gap;
    assert.equal(
      isUnlocked({ ...fresh(), rebirths: 3, mass: b.unlock - 1 }, b),
      false,
    );
    assert.equal(
      isUnlocked({ ...fresh(), rebirths: 3, mass: b.unlock }, b),
      true,
    );
  }
});

test("40 upgrades summon all ready bodies each second; 60 remove the shared wait", () => {
  const s = {
    ...fresh(),
    mass: 300,
    upgrades: {
      ...fresh().upgrades,
      auto: 10,
      stream: 10,
      efficiency: 10,
      research: 8,
      bounty: 2,
    },
  };
  assert.equal(upgradeCount(s), 40);
  assert.equal(autoStage({ ...s, upgrades: { ...s.upgrades, bounty: 1 } }), 0);
  assert.equal(autoInterval(s), 1000);
  assert.deepEqual(
    autoCandidates(s, 1000, { lastAt: 0 }).map((b) => b.id),
    ["asteroid", "pluto", "moon"],
  );
  assert.deepEqual(autoCandidates(s, 999, { lastAt: 0 }), []);
  const reserved = reserve(s, "asteroid", 1000);
  assert.deepEqual(
    autoCandidates(reserved, 2000, { lastAt: 1000 }).map((b) => b.id),
    ["pluto", "moon"],
  );
  assert.deepEqual(
    autoCandidates(reserved, 3000, { lastAt: 2000 }).map((b) => b.id),
    ["asteroid", "pluto", "moon"],
  );
  const stage59 = {
    ...s,
    upgrades: { ...s.upgrades, bounty: 8, stellar: 3, expedition: 10 },
  };
  assert.equal(autoStage(stage59), 1);
  assert.deepEqual(autoCandidates(stage59, 1500, { lastAt: 1000 }), []);
  const stage60 = { ...stage59, upgrades: { ...stage59.upgrades, stellar: 4 } };
  assert.equal(autoInterval(stage60), 0);
  assert.equal(autoCandidates(stage60, 1500, { lastAt: 1000 }).length, 3);
  assert.equal(
    autoCandidates({ ...s, upgrades: fresh().upgrades }, 5000).length,
    0,
  );
});
