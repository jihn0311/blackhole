import test from 'node:test';
import assert from 'node:assert/strict';
import {validateEndingRules,endingRules,collectedRequired} from '../src/endingRules.js';
test('deleted endings are excluded from final ending and ranking requirements',()=>{
 const r=endingRules({hacking:{enabled:false}});
 assert.equal(collectedRequired(r,['normal','survivor'],false),true);
 assert.equal(collectedRequired(r,['normal','survivor']),false);
 assert.equal(collectedRequired(r,['normal','survivor','happy']),true);
});
test('ending conditions default safely and reject invalid input',()=>{
 assert.equal(validateEndingRules().normal.level,400);
 assert.equal(validateEndingRules({normal:{level:500}}).normal.level,500);
 assert.throws(()=>validateEndingRules({normal:{level:0}}));
 assert.throws(()=>validateEndingRules({survivor:{seconds:Infinity}}));
 assert.throws(()=>validateEndingRules({happy:{enabled:'false'}}));
});
