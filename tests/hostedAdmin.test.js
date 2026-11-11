import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { adminPlugin, trustedRequest } from '../server/adminPlugin.js';
import { createAdminServer } from '../server/start.js';
const origin='https://example.onrender.com';
function setup() {
 let handler;
 adminPlugin({publicOrigin:origin,password:'test-only-password'}).configureServer({config:{root:process.cwd()},middlewares:{use(_p,h){handler=h;}}});
 return async (path, {method='POST', data={}, cookie, requestOrigin=origin}={}) => {
   const req=Readable.from([JSON.stringify(data)]);
   Object.assign(req,{method,url:path,headers:{host:'example.onrender.com',origin:requestOrigin,'x-admin-request':'1','sec-fetch-site':'same-origin','content-type':'application/json',cookie}});
   const headers={};let result;
   const res={setHeader(k,v){headers[k]=v;},end(body){result={status:this.statusCode,body:JSON.parse(body),headers};}};
   await handler(req,res);return result;
 };
}
test('hosted admin requires password, secure session, same-origin and revokes logout', async()=>{
 const call=setup();
 assert.equal((await call('/publish')).status,401);
 assert.equal((await call('/login',{data:{password:'wrong'}})).status,401);
 assert.equal((await call('/login',{data:{password:'test-only-password'},requestOrigin:'https://evil.test'})).status,403);
 const login=await call('/login',{data:{password:'test-only-password'}});
 assert.equal(login.status,200);
 assert.match(login.headers['Set-Cookie'],/HttpOnly; SameSite=Strict/);
 assert.match(login.headers['Set-Cookie'],/; Secure/);
 const cookie=login.headers['Set-Cookie'].split(';')[0];
 assert.equal((await call('/logout',{cookie})).status,200);
 assert.equal((await call('/publish',{cookie})).status,401);
});
test('hosted login blocks repeated incorrect guesses and enforces secure configuration',async()=>{
 const call=setup();
 for(let i=0;i<5;i++) assert.equal((await call('/login',{data:{password:'wrong'}})).status,401);
 assert.equal((await call('/login',{data:{password:'test-only-password'}})).status,429);
 assert.throws(()=>createAdminServer({publicOrigin:'http://example.com',password:'test-password'}));
 assert.throws(()=>createAdminServer({publicOrigin:origin,password:'123'}));
 assert.equal(trustedRequest({method:'GET',headers:{host:'example.onrender.com','x-admin-request':'1','sec-fetch-site':'same-origin'}},origin),true);
 assert.equal(trustedRequest({method:'POST',headers:{host:'example.onrender.com','x-admin-request':'1','sec-fetch-site':'same-origin'}},origin),false);
});
