import test from 'node:test';
import assert from 'node:assert/strict';
import { fresh } from '../src/game.js';
import { survivorEligible } from '../src/survivorEligibility.js';

test('untouched games qualify even after old UI disqualification or a reset with saved endings', () => {
  assert.equal(survivorEligible(fresh()), true);
  assert.equal(survivorEligible({...fresh(), survivorDisqualified: true}), true);
  assert.equal(survivorEligible({...fresh(), unlockedEndings: ['normal']}), true);
});
test('summoning cancels eligibility before absorption, and actual progress or a completed ending blocks it', () => {
  for (const patch of [
    {cooldowns:{asteroid:2000}}, {mass:10}, {rebirths:1},
    {counts:{asteroid:1}}, {upgrades:{auto:1}},
    {cheatUsed:true}, {endingSeen:true},
  ]) assert.equal(survivorEligible({...fresh(), ...patch}), false);
});
