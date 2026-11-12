import test from 'node:test';
import assert from 'node:assert/strict';
import {rankingMass} from '../src/rankingMass.js';
test('ranking excludes legacy cheat highs and preserves separately recorded clean mass',()=>{
 assert.equal(rankingMass({mass:50,bestMass:1e12,cheatUsed:false}),50);
 assert.equal(rankingMass({mass:1e12,bestMass:1e12,cheatUsed:true}),0);
 assert.equal(rankingMass({mass:1e12,rankingBestMass:100,cheatUsed:true}),100);
 assert.equal(rankingMass({mass:0,rankingBestMass:100,cheatUsed:false}),100);
});
