import test from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  bodies,
  upgrades,
  skillNodes,
  massGain,
  cooldown,
  levelReward,
  levelPoints,
  missionReward,
  expeditionReward,
  missions,
  claim,
  absorb,
  codexComplete,
  restore,
  SAVE_VERSION,
} from "../src/game.js";
import { rebirth } from "../src/prestige.js";
import { permanentNodes } from "../src/skillData.js";
import { bulkUpgrade } from "../src/bulkUpgrade.js";

test("bulk upgrades spend only available currency and unlock prerequisites in sequence", () => {
  const poor = fresh();
  assert.equal(bulkUpgrade(poor).state, poor);
  const small = bulkUpgrade({ ...fresh(), points: 2 });
  assert.equal(small.count, 2);
  assert.equal(small.state.upgrades.cooldown, 1);
  assert.equal(small.state.upgrades.stream, 1);
  assert.equal(small.spent, 2);
  for (const permanent of [false, true]) {
    const s = { ...fresh(), points: 100000, shards: 10000 };
    const result = bulkUpgrade(s, permanent),
      nodes = permanent ? permanentNodes : skillNodes;
    assert.equal(result.count, nodes.length);
    assert.equal(
      result.spent,
      nodes.reduce((sum, n) => sum + n.cost, 0),
    );
    assert.equal(result.state.singularityDepth, 0);
    assert.equal(bulkUpgrade(result.state, permanent).count, 0);
    assert.equal(s.points, 100000);
    assert.equal(s.shards, 10000);
  }
});
test("repeat exploration increases rewards on each claim without duplicate payouts", () => {
  let s = { ...fresh(), mission: missions.length, counts: { asteroid: 300 } };
  for (const amount of [5, 10, 15]) {
    assert.equal(expeditionReward(s), amount);
    const n = claim(s);
    assert.equal(n.points - s.points, amount);
    s = n;
  }
  assert.equal(claim(s), s);
});
test("full codex unlocks lasting rewards that stack with overdrive", () => {
  const base = { ...fresh(), points: 100, mass: 1e7, rebirths: 3 };
  const almost = {
    ...base,
    codex: Object.fromEntries(bodies.slice(0, -1).map((b) => [b.id, true])),
  };
  assert.equal(codexComplete(almost), false);
  const full = absorb(almost, bodies.at(-1).id);
  assert.equal(codexComplete(full), true);
  assert.equal(massGain(full, bodies[0]), massGain(base, bodies[0]) * 20);
  assert.equal(cooldown(full, bodies[0]), cooldown(base, bodies[0]) * 0.6);
  assert.equal(levelReward(full, 10), levelReward(base, 10) * 3);
  assert.equal(levelPoints(full, 8, 12), levelPoints(base, 8, 12) * 3);
  assert.equal(
    missionReward(full, missions[0]),
    missionReward(base, missions[0]) * 3,
  );
  assert.equal(expeditionReward(full), expeditionReward(base) * 3);
  const overdrive = {
    ...full,
    upgrades: Object.fromEntries(upgrades.map((u) => [u.id, u.max])),
  };
  const unmastered = { ...overdrive, codex: {}, counts: {} };
  assert.equal(
    massGain(overdrive, bodies[0]),
    massGain(unmastered, bodies[0]) * 20,
  );
  const next = rebirth(full);
  assert.equal(next.mass, 0);
  assert.equal(codexComplete(next), true);
  assert.equal(massGain(next, bodies[0]), 200);
  assert.equal(
    codexComplete(restore({ version: SAVE_VERSION, state: next })),
    true,
  );
  const before = full.points;
  assert.equal(restore({ version: SAVE_VERSION, state: full }).points, before);
});
