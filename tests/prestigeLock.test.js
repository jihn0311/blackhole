import test from "node:test";
import assert from "node:assert/strict";
import { fresh, upgrades, baseBodies } from "../src/game.js";
import { prestigeUnlocked, canRebirth, rebirth } from "../src/prestige.js";
test("prestige remains locked until all 80 normal upgrades are learned", () => {
  const s = {
    ...fresh(),
    mass: 1e6,
    points: 100,
    codex: Object.fromEntries(baseBodies.map((b) => [b.id, true])),
  };
  assert.equal(prestigeUnlocked(s), false);
  assert.equal(canRebirth(s), false);
  assert.equal(rebirth(s), s);
  s.upgrades = Object.fromEntries(upgrades.map((u) => [u.id, u.max]));
  for (const u of upgrades) {
    const almost = { ...s, upgrades: { ...s.upgrades, [u.id]: u.max - 1 } };
    assert.equal(prestigeUnlocked(almost), false);
    assert.equal(canRebirth(almost), false);
  }
  assert.equal(prestigeUnlocked(s), true);
  assert.equal(canRebirth(s), true);
  const next = rebirth(s);
  assert.equal(next.rebirths, 1);
  assert.equal(prestigeUnlocked(next), true);
  assert.deepEqual(next.upgrades, fresh().upgrades);
  assert.equal(prestigeUnlocked({ ...fresh(), rebirths: 2 }), true);
});
