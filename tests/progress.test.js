import test from "node:test";
import assert from "node:assert/strict";
import {
  level,
  levelReward,
  levelFloor,
  levelProgress,
  fmtExact,
  fmt,
  fresh,
  absorb,
} from "../src/game.js";
test("exact targets distinguish thresholds previously rounded to the same 1M label", () => {
  const a = levelFloor(142),
    b = levelFloor(143);
  assert.ok(b > a);
  assert.notEqual(fmtExact(a), fmtExact(b));
  assert.equal(fmtExact(levelFloor(4)), "3,240");
});
test("late-game boundaries keep increasing and use the correct level", () => {
  for (const lv of [2, 142, 143, 1000]) {
    const floor = levelFloor(lv),
      next = levelFloor(lv + 1);
    assert.equal(level(floor - 1), lv - 1);
    assert.equal(level(floor), lv);
    assert.equal(level(next - 1), lv);
    assert.equal(level(next), lv + 1);
    const p = levelProgress(floor + 1);
    assert.equal(p.required, 80 * lv ** 3 + 30 * lv ** 2 - 10 * lv);
    assert.equal(p.earned, 1);
    assert.equal(p.remaining, next - floor - 1);
    assert.ok(p.target > floor);
    assert.ok(p.fraction > 0 && p.fraction < 1);
  }
});
test("multi-level absorption updates target and awards every crossed level", () => {
  const s = { ...fresh(), mass: levelFloor(10) - 10 };
  const next = absorb(s, "sun");
  const before = levelProgress(s.mass),
    after = levelProgress(next.mass);
  assert.ok(after.target > before.target);
  assert.equal(
    next.points,
    Array.from({ length: after.level - before.level }, (_, i) =>
      levelReward(s, before.level + i),
    ).reduce((a, b) => a + b, 0),
  );
  assert.equal(after.earned + after.remaining, after.required);
});

test("level costs stay between the previous and hardest curves", () => {
  for (let lv = 2; lv <= 100; lv++) {
    const cost = levelFloor(lv + 1) - levelFloor(lv);
    assert.ok(cost > 150 * lv * lv - 50 * lv);
    assert.ok(cost < 100 * lv ** 3);
    assert.ok(cost >= 0.8 * 100 * lv ** 3);
  }
});
