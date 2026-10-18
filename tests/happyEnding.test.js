import test from 'node:test';
import assert from 'node:assert/strict';
import { happyEndingUnlocked } from '../src/happyEnding.js';
import { fresh, restore, SAVE_VERSION } from '../src/game.js';
test('happy ending requires all three original endings, not duplicates or itself', () => {
  const ids = ['normal','hacking','survivor'];
  for(let mask=0;mask<8;mask++) {
    const owned = ids.filter((_, i) => mask & (1 << i));
    assert.equal(happyEndingUnlocked([...owned,...owned,'happy']), mask===7);
  }
});
test('happy completion and all ending records survive save restoration', () => {
  const state = {...fresh(), endingSeen:true, endingType:'happy', unlockedEndings:['normal','hacking','survivor','happy']};
  const loaded = restore({version:SAVE_VERSION,state});
  assert.equal(loaded.endingType,'happy');
  assert.deepEqual(loaded.unlockedEndings,state.unlockedEndings);
});
