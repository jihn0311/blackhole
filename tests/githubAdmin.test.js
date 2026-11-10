import test from 'node:test';
import assert from 'node:assert/strict';
import { createGithubAdmin } from '../src/githubAdmin.js';
import { readFileSync } from 'node:fs';
const config = JSON.parse(readFileSync(new URL('../src/gameSettings.json', import.meta.url)));
test('web admin authenticates, preserves Unicode, refuses stale writes and forgets logout credentials', async () => {
  const calls = [];
  const api = createGithubAdmin(async (url, options) => {
    calls.push({url,options});
    const value = url.endsWith('/blackhole') ? {permissions:{push:true}} : options.method === 'PUT' ? {commit:{sha:'c'.repeat(40)},content:{sha:'new'}} : {sha:'current',content:Buffer.from(JSON.stringify(config)).toString('base64')};
    return {ok:true,json:async()=>value};
  });
  await assert.rejects(api('local'), /토큰/);
  await api('login',{password:'test-token'});
  const loaded = await api('local');
  assert.equal(loaded.config.gameTitle, config.gameTitle);
  await assert.rejects(api('publish',{config,sha:'old'}), /바뀌/);
  assert.equal(calls.some(c=>c.options.method==='PUT'),false);
  await api('publish',{config,sha:'current'});
  const put=calls.find(c=>c.options.method==='PUT');
  assert.ok(put.url.endsWith('/contents/src/gameSettings.json'));
  assert.equal(JSON.parse(Buffer.from(JSON.parse(put.options.body).content,'base64').toString()).gameTitle,config.gameTitle);
  await api('logout');
  await assert.rejects(api('local'), /토큰/);
});
