import test from 'node:test';
import assert from 'node:assert/strict';
import {passwordRecord,passwordMatches,createSessions} from '../server/adminAuth.js';
test('admin passwords use salted hashes and reject wrong or malformed credentials',()=>{
 const a=passwordRecord('test-only-password'),b=passwordRecord('test-only-password');
 assert.notEqual(a.hash,b.hash);
 assert.equal(passwordMatches('test-only-password',a),true);
 assert.equal(passwordMatches('wrong',a),false);
 assert.equal(passwordMatches(null,a),false);
 assert.equal(passwordMatches('test-only-password',{}),false);
});
test('admin session is required and is revoked on logout',()=>{
 const s=createSessions();assert.equal(s.valid(undefined),false);
 const token=s.create();assert.equal(s.valid(token),true);
 assert.equal(s.valid('invented'),false);s.remove(token);assert.equal(s.valid(token),false);
});
