import test from "node:test";
import assert from "node:assert/strict";
import {
  validateCustomContent,
  customEndingReady,
} from "../src/customContent.js";
import {
  configureGame,
  bodies,
  originalBodies,
  customEndings,
  fresh,
  restore,
  SAVE_VERSION,
  isUnlocked,
  absorb,
} from "../src/game.js";
const planet = {
  id: "custom_test",
  name: "시험 행성",
  mass: 123,
  unlock: 500,
  cooldown: 3,
  rebirth: 1,
  size: 15,
  color: "#87deea",
  fact: "설명",
};
const ending = {
  id: "custom_finish",
  name: "시험 엔딩",
  hint: "힌트",
  text: "첫 줄\n둘째 줄",
  level: 20,
  rebirths: 1,
  style: "happy",
};
test("custom content validates and rejects duplicate IDs and bad colors", () => {
  const content = validateCustomContent(
    { customPlanets: [planet], customEndings: [ending] },
    ["asteroid"],
  );
  assert.equal(content.customPlanets.length, 1);
  assert.throws(() =>
    validateCustomContent({ customPlanets: [planet, planet] }, []),
  );
  assert.throws(() =>
    validateCustomContent({ customPlanets: [{ ...planet, color: "red" }] }, []),
  );
  assert.throws(() =>
    validateCustomContent(
      { customEndings: [{ ...ending, style: "invalid" }] },
      [],
    ),
  );
  assert.equal(customEndingReady(ending, { rebirths: 1 }, 20), true);
  assert.equal(customEndingReady(ending, { rebirths: 0 }, 20), false);
});
test("custom planets enter gameplay and saved discoveries and ending records survive reload", () => {
  try {
    configureGame({ customPlanets: [planet], customEndings: [ending] });
    assert.equal(bodies.length, originalBodies.length + 1);
    assert.equal(customEndings[0].id, ending.id);
    let s = { ...fresh(), mass: 500, rebirths: 1 };
    assert.ok(isUnlocked(s, bodies.at(-1)));
    s = absorb(s, planet.id);
    s.unlockedEndings = [ending.id];
    const loaded = restore({ version: SAVE_VERSION, state: s });
    assert.equal(loaded.codex[planet.id], true);
    assert.ok(loaded.unlockedEndings.includes(ending.id));
    configureGame({ customPlanets: [planet] });
    assert.equal(bodies.length, originalBodies.length + 1);
  } finally {
    configureGame({});
  }
  assert.equal(bodies.length, originalBodies.length);
});
