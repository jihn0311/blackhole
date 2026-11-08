import test from 'node:test';
import assert from 'node:assert/strict';
import { configureGame,bodies,originalBodies,baseBodies,missions,fresh,restore,SAVE_VERSION,baseDiscovered } from '../src/game.js';
test('removing original planets keeps missions reachable and restores saved discoveries',()=>{
 try {
 const removed=originalBodies.filter(b=>b.id!=='asteroid').map(b=>b.id);
 configureGame({removedPlanets:removed});
 assert.equal(bodies.length,1);assert.equal(baseBodies.length,1);
 assert.equal(missions[8].target,1);assert.equal(missions[9].target,1);
 assert.equal(missions[2].value({...fresh(),counts:{asteroid:3}}),3);
 const saved=restore({version:SAVE_VERSION,state:{...fresh(),counts:{moon:5},codex:{moon:true}}});
 assert.equal(saved.counts.moon,5);
 configureGame({});assert.equal(bodies.length,15);assert.equal(missions[9].target,12);
 assert.equal(baseDiscovered(saved),1);
 }finally{configureGame({});}
});
