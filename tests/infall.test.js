import test from "node:test";
import assert from "node:assert/strict";
import { advanceInfall } from "../src/infall.js";
test("infall converges from all directions with bounded trails and finite positions", () => {
  for (const radius of [15,40,90]) for(let i=0;i<12;i++) {
    const p={x:Math.cos(i*Math.PI/6)*450,y:Math.sin(i*Math.PI/6)*450};
    let done=false;
    for(let frame=0;frame<1200&&!done;frame++) {
      done=advanceInfall(p,0,0,radius,1/60);
      assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y));
      assert.ok(p.trail.length<=12);
    }
    assert.ok(done);
  }
  const center={x:0,y:0};
  assert.equal(advanceInfall(center,0,0,40,.04),true);
  assert.ok(Number.isFinite(center.x)&&Number.isFinite(center.y));
});
