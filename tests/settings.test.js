import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validateSettings, settingsDiff } from "../src/settingsSchema.js";
import {
  configureGame,
  levelFloor,
  level,
  upgradeCost,
  upgrades,
  bodies,
  fresh,
  massGain,
  cooldown,
} from "../src/game.js";
import { trustedRequest } from "../server/adminPlugin.js";
const config = JSON.parse(
  readFileSync(new URL("../src/gameSettings.json", import.meta.url), "utf8"),
);
test("public settings reject invalid ranges, unsupported properties and inaccessible first body", () => {
  assert.equal(validateSettings(config).version, 1);
  for (const value of [0, Infinity, 11, "2", ""])
    assert.throws(() => validateSettings({ ...config, gainMultiplier: value }));
  assert.throws(() =>
    validateSettings({ ...config, planets: { asteroid: { unlock: 100 } } }),
  );
  assert.throws(() =>
    validateSettings({ ...config, planets: { asteroid: { source: "evil" } } }),
  );
  assert.throws(() =>
    validateSettings({ ...config, planets: { moon: { unlock: 0 } } }),
  );
  assert.throws(() => validateSettings({ ...config, scenes: [] }));
});
test("configured balance changes real gameplay and can restore defaults", () => {
  const s = fresh(),
    b = bodies[0],
    floor = levelFloor(25),
    gain = massGain(s, bodies[0]),
    delay = cooldown(s, b),
    price = upgradeCost(upgrades[0], 3);
  try {
    configureGame({
      levelMassMultiplier: 0.1,
      gainMultiplier: 2,
      cooldownMultiplier: 2,
      upgradeCostMultiplier: 3,
    });
    assert.equal(levelFloor(25), Math.round(floor * 0.1));
    for (const lv of [1, 2, 25, 300, 400, 1000])
      assert.equal(level(levelFloor(lv)), lv);
    assert.equal(massGain(s, bodies[0]), gain * 2);
    assert.equal(cooldown(s, b), delay * 2);
    assert.equal(upgradeCost(upgrades[0], 3), price * 3);
    configureGame({
      planets: { asteroid: { mass: 123, name: "시험 소행성" } },
      upgradeBases: { [upgrades[0].id]: 20 },
    });
    assert.equal(massGain(s, bodies[0]), 123);
    assert.equal(upgradeCost(upgrades[0], 0), 20);
  } finally {
    configureGame({});
  }
  assert.equal(levelFloor(25), floor);
  assert.equal(massGain(s, bodies[0]), gain);
});
test("public setting diff detects additions, deletions and story changes", () => {
  const edited = structuredClone(config);
  edited.scenes[0].title = "변경된 제목";
  edited.planets.asteroid = { mass: 15 };
  const changes = settingsDiff(config, edited);
  assert.ok(changes.some((c) => c.field === "scenes.0.title"));
  assert.ok(changes.some((c) => c.field === "planets.asteroid"));
  assert.equal(settingsDiff(config, config).length, 0);
});
test("publishing API rejects cross-origin, missing custom header and rebinding host", () => {
  const headers = {
    host: "127.0.0.1:5174",
    origin: "http://127.0.0.1:5174",
    "x-admin-request": "1",
    "sec-fetch-site": "same-origin",
  };
  assert.equal(trustedRequest({ headers }), true);
  for (const override of [
    { host: "evil.test:5174" },
    { origin: "https://evil.test" },
    { "x-admin-request": "" },
    { "sec-fetch-site": "cross-site" },
  ])
    assert.equal(
      trustedRequest({ headers: { ...headers, ...override } }),
      false,
    );
});

