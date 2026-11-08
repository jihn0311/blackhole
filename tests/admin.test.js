import test from "node:test";
import assert from "node:assert/strict";
import { adminNumber, adminPreset, parseAdminSave } from "../src/adminState.js";
import { fresh, SAVE_VERSION, level, upgrades } from "../src/game.js";
import { survivorEligible } from "../src/survivorEligibility.js";
import { happyEndingUnlocked } from "../src/happyEnding.js";

test("admin rejects empty, negative, non-finite and out-of-range numeric input", () => {
  for (const value of [
    "",
    " ",
    "-1",
    "1.5",
    "Infinity",
    "NaN",
    "9007199254740992",
  ])
    assert.throws(() => adminNumber(value));
  assert.throws(() => adminNumber(11, 10));
  assert.equal(adminNumber("10000"), 10000);
});
test("admin presets reach the selected ending without altering the original state", () => {
  const current = {
    ...fresh(),
    points: 100,
    cheatUsed: true,
    endingSeen: true,
  };
  assert.equal(level(adminPreset("normal", current).mass), 400);
  assert.equal(adminPreset("normal", current).cheatUsed, false);
  assert.equal(adminPreset("hacking", current).endingSeen, false);
  assert.equal(adminPreset("hacking", current).cheatUsed, true);
  assert.equal(survivorEligible(adminPreset("survivor", current)), true);
  assert.equal(
    happyEndingUnlocked(adminPreset("happy", current).unlockedEndings),
    true,
  );
  assert.equal(current.mass, 0);
  assert.equal(current.endingSeen, true);
});
test("admin backup round trips valid saves and rejects corrupt saves rather than silently resetting", () => {
  const state = adminPreset("hacking", { ...fresh(), points: 12345 });
  const loaded = parseAdminSave(
    JSON.stringify({ version: SAVE_VERSION, state }),
  );
  assert.equal(loaded.points, 12345);
  assert.equal(loaded.mass, state.mass);
  assert.equal(loaded.cheatUsed, true);
  assert.throws(() => parseAdminSave("{}"));
  assert.throws(() =>
    parseAdminSave(
      JSON.stringify({
        version: SAVE_VERSION,
        state: { ...state, points: -1 },
      }),
    ),
  );
  assert.throws(() =>
    parseAdminSave(
      JSON.stringify({
        version: SAVE_VERSION,
        state: {
          ...state,
          upgrades: { ...state.upgrades, [upgrades[0].id]: 999 },
        },
      }),
    ),
  );
});
