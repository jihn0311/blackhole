import test from "node:test";
import assert from "node:assert/strict";
import { collapseStage, endingReached } from "../src/collapse.js";
import {
  level,
  levelFloor,
  restore,
  SAVE_VERSION,
  fresh,
} from "../src/game.js";
test("collapse escalates exactly at each 10-level boundary and ends at 400", () => {
  for (const [lv, stage] of [
    [1, 0],
    [299, 0],
    [300, 1],
    [309, 1],
    [310, 2],
    [319, 2],
    [320, 3],
    [339, 4],
    [340, 5],
    [359, 6],
    [360, 7],
    [379, 8],
    [380, 9],
    [390, 10],
    [399, 10],
    [400, 11],
    [450, 11],
  ]) {
    assert.equal(collapseStage(lv), stage);
    assert.equal(endingReached(lv), lv >= 400);
  }
});
test("saved level 400 resumes the ending and fresh or reborn levels remove collapse", () => {
  const mass = levelFloor(400);
  assert.equal(endingReached(level(mass - 1)), false);
  assert.equal(endingReached(level(mass)), true);
  const restored = restore({
    version: SAVE_VERSION,
    state: { ...fresh(), mass },
  });
  assert.equal(endingReached(level(restored.mass)), true);
  assert.equal(collapseStage(level(fresh().mass)), 0);
});
