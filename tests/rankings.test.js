import test from 'node:test';
import assert from 'node:assert/strict';
import {validScore} from '../server/rankings.js';
test('ranking validates mass, nickname, identity and cheat exclusion',()=>{
 const data={token:'a'.repeat(64),nickname:'우주',mass:100,cheatUsed:false};
 const result=validScore(data);assert.equal(result.p_mass,100);assert.notEqual(result.p_hash,data.token);
 for(const change of [{mass:Infinity},{mass:-1},{mass:'100'},{nickname:''},{nickname:'x'.repeat(17)},{cheatUsed:true},{token:'bad'}]) assert.throws(()=>validScore({...data,...change}));
});
