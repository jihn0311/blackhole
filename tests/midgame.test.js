import test from "node:test";
import assert from "node:assert/strict";
import {
  bodies,
  fresh,
  massGain,
  cooldown,
  absorb,
  isUnlocked,
} from "../src/game.js";

test("Uranus onward reaches the next mass gate in at most 60% of the old manual time", () => {
  const oldUnlocks = [
    16000, 36000, 78000, 165000, 360000, 750000, 1600000, 3500000,
  ];
  const oldMasses = [400, 700, 1100, 1800, 5500, 10000, 24000];
  const late = bodies.slice(bodies.findIndex((b) => b.id === "uranus"));
  for (let i = 0; i < late.length - 1; i++) {
    const body = late[i],
      next = late[i + 1];
    let s = { ...fresh(), mass: body.unlock, rebirths: 3 };
    const oldTime =
      Math.ceil((oldUnlocks[i + 1] - oldUnlocks[i]) / oldMasses[i]) *
      cooldown(s, body);
    let elapsed = 0;
    while (!isUnlocked(s, next)) {
      elapsed += cooldown(s, body);
      s = absorb(s, body.id);
      assert.ok(
        elapsed <= oldTime * 0.6,
        `${body.name} to ${next.name} remains too slow`,
      );
    }
    assert.ok(s.points > 0, "crossed levels still award upgrade points");
  }
});

test("early celestial mass and Uranus entry gate retain the existing pacing", () => {
  const early = bodies.slice(0, 7);
  assert.deepEqual(
    early.map((b) => massGain(fresh(), b)),
    [10, 20, 35, 65, 100, 180, 250],
  );
  assert.equal(bodies.find((b) => b.id === "uranus").unlock, 16000);
});
