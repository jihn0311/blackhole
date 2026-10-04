import test from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  absorb,
  level,
  levelFloor,
  reserve,
  buy,
  claim,
  missions,
  discovered,
  bodies,
  baseBodies,
  upgrades,
  upgradeCost,
  cooldown,
  massGain,
  autoInterval,
  restore,
  SAVE_VERSION,
  bodyForKey,
  holdUnlocked,
} from "../src/game.js";
test("mass gain awards points once per crossed level", () => {
  let s = fresh();
  for (let i = 0; i < 10; i++) s = absorb(s, "asteroid");
  assert.equal(s.mass, 100);
  assert.equal(level(s.mass), 2);
  assert.equal(s.points, 2);
  s = absorb(s, "asteroid");
  assert.equal(s.points, 2);
  assert.equal(levelFloor(3), 840);
});
test("locked bodies cannot spawn; cooldowns are per body", () => {
  let s = fresh();
  assert.equal(reserve(s, "moon", 1000), s);
  s = { ...s, mass: 300 };
  s = reserve(s, "asteroid", 1000);
  assert.equal(reserve(s, "asteroid", 1001), s);
  assert.notEqual(reserve(s, "moon", 1001), s);
  assert.notEqual(reserve(s, "asteroid", 3000), s);
});
test("upgrades enforce price and cap", () => {
  let s = fresh();
  assert.equal(buy(s, "auto"), s);
  s.points = 1000;
  for (let i = 0; i < 12; i++) s = buy(s, "cooldown");
  assert.equal(s.upgrades.cooldown, 12);
  assert.equal(s.points, 286);
  assert.equal(buy(s, "cooldown"), s);
});
test("missions pay once and stay in order", () => {
  let s = fresh();
  assert.equal(claim(s), s);
  for (let i = 0; i < 5; i++) s = absorb(s, "asteroid");
  s = claim(s);
  assert.equal(s.mission, 1);
  assert.equal(s.points, 1);
  assert.equal(claim(s), s);
  s = buy(s, "cooldown");
  s = claim(s);
  assert.equal(s.mission, 2);
  assert.equal(s.points, 1);
});
test("full progression can finish all missions without deadlock", () => {
  let s = fresh();
  for (let i = 0; i < 5; i++) s = absorb(s, "asteroid");
  s = claim(s);
  s = buy(s, "cooldown");
  s = claim(s);
  for (const b of baseBodies) {
    while (s.mass < b.unlock)
      s = absorb(s, baseBodies.filter((x) => x.unlock <= s.mass).at(-1).id);
    for (let i = 0; i < 3; i++) s = absorb(s, b.id);
    while (
      missions[s.mission] &&
      missions[s.mission].value(s) >= missions[s.mission].target
    )
      s = claim(s);
    if (s.points >= 3 && !s.upgrades.auto) {
      s = buy(s, "auto");
      s = claim(s);
    }
  }
  assert.equal(discovered(s), baseBodies.length);
  assert.equal(s.mission, missions.length);
  assert.ok(absorb(s, "sun").mass > s.mass);
});

test("legacy save preserves progress and refunds gravity exactly once", () => {
  const legacy = {
    version: 1,
    state: {
      ...fresh(),
      mass: 10000,
      points: 4,
      mission: 9,
      counts: { earth: 6 },
      upgrades: { cooldown: 5, auto: 3, gravity: 4 },
    },
  };
  const migrated = restore(legacy);
  assert.equal(migrated.mass, 10000);
  assert.equal(migrated.counts.earth, 6);
  assert.equal(migrated.mission, 9);
  assert.equal(migrated.upgrades.cooldown, 5);
  assert.equal(migrated.upgrades.stream, 0);
  assert.equal(migrated.upgrades.gravity, undefined);
  const oldLevel = 1 + Math.floor(Math.log2(101));
  assert.equal(
    migrated.points,
    4 + 10 + 2 * Math.max(0, level(10000) - oldLevel),
  );
  assert.deepEqual(
    restore({ version: SAVE_VERSION, state: migrated }),
    migrated,
  );
});
test("all shortcut keys match visible catalog order including numpad", () => {
  assert.equal(bodies.length, 15);
  for (let i = 0; i < 9; i++) {
    assert.equal(bodyForKey({ code: "Digit" + (i + 1) }), bodies[i]);
    assert.equal(bodyForKey({ code: "Numpad" + (i + 1) }), bodies[i]);
  }
  assert.equal(bodyForKey({ code: "Digit0" }), bodies[9]);
  assert.equal(bodyForKey({ code: "Minus" }), bodies[10]);
  assert.equal(bodyForKey({ code: "Equal" }), bodies[11]);
  assert.equal(bodyForKey({ code: "KeyQ" }), bodies[12]);
  assert.equal(bodyForKey({ code: "KeyW" }), bodies[13]);
  assert.equal(bodyForKey({ code: "KeyE" }), bodies[14]);
  assert.equal(bodyForKey({ code: "KeyR" }), undefined);
});
test("every expanded upgrade has a useful effect and bounded cost", () => {
  let s = fresh();
  s.points = 10000;
  const massBefore = massGain(s, bodies[0]),
    cdBefore = cooldown(s, bodies[0]);
  for (const u of upgrades) {
    for (let i = 0; i < u.max; i++) s = buy(s, u.id);
    assert.equal(s.upgrades[u.id], u.max);
    assert.equal(buy(s, u.id), s);
  }
  assert.equal(massGain(s, bodies[0]), massBefore * 25);
  assert.ok(cooldown(s, bodies[0]) < cdBefore);
  assert.ok(cooldown(s, bodies[0]) >= 120);
  assert.equal(cooldown(s, bodies[0], true), cooldown(s, bodies[0]));
  assert.equal(autoInterval(s), 0);
  assert.ok(holdUnlocked(s));
  const next = { ...s, mass: 90 };
  assert.equal(absorb(next, "asteroid").points - next.points, 30);
  const m = { ...s, mission: 0, counts: { asteroid: 5 } };
  assert.equal(claim(m).points - m.points, 9);
});
test("quadratic level thresholds and repeated exploration remain reachable", () => {
  for (let lv = 2; lv < 100; lv++) {
    assert.equal(level(levelFloor(lv)), lv);
    assert.equal(level(levelFloor(lv) - 1), lv - 1);
  }
  let s = { ...fresh(), mission: missions.length, counts: { asteroid: 200 } };
  s = claim(s);
  assert.equal(s.points, 5);
  assert.equal(s.expeditions, 1);
  s = claim(s);
  assert.equal(s.points, 15);
  assert.equal(claim(s), s);
});
test("invalid saves do not inject invalid numbers into the simulation", () => {
  assert.deepEqual(
    restore({ version: 2, state: { ...fresh(), mass: Infinity } }),
    fresh(),
  );
  assert.deepEqual(
    restore({ version: 2, state: { ...fresh(), upgrades: { stream: 100 } } }),
    fresh(),
  );
});

test("later skills have strictly increasing prices while existing purchases stay owned", () => {
  for (const u of upgrades) {
    for (let n = 1; n < u.max; n++) {
      assert.ok(upgradeCost(u, n) > upgradeCost(u, n - 1));
      if (n >= 4)
        assert.ok(
          upgradeCost(u, n) - upgradeCost(u, n - 1) >
            upgradeCost(u, n - 1) - upgradeCost(u, n - 2),
        );
    }
  }
  const existing = {
    ...fresh(),
    points: 0,
    upgrades: { ...fresh().upgrades, cooldown: 12 },
  };
  const restored = restore({ version: SAVE_VERSION, state: existing });
  assert.equal(restored.upgrades.cooldown, 12);
  assert.equal(restored.points, 0);
});
