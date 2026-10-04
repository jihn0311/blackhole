import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh, restore, SAVE_VERSION} from '../src/game.js';
import {rebirth} from '../src/prestige.js';
test('cheat evidence and earned ending survive saves without guessing legacy cheat use',()=>{
 const base=fresh();
 assert.equal(base.cheatUsed,false);
 const saved=restore({version:SAVE_VERSION,state:{...base,cheatUsed:true,endingSeen:true,endingType:'hacking'}});
 assert.equal(saved.cheatUsed,true);
 assert.equal(saved.endingType,'hacking');
 const legacy=restore({version:SAVE_VERSION,state:{...base,endingSeen:true,endingType:undefined,cheatUsed:undefined}});
 assert.equal(legacy.cheatUsed,false);
 assert.equal(legacy.endingType,'normal');
});

test('survivor ending and abandoned idle eligibility survive reload',()=>{
 const saved=restore({version:SAVE_VERSION,state:{...fresh(),endingSeen:true,endingType:'survivor',survivorDisqualified:true}});
 assert.equal(saved.endingType,'survivor');
 assert.equal(saved.survivorDisqualified,true);
 assert.equal(fresh().survivorDisqualified,false);
});
