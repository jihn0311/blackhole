import test from "node:test";
import assert from "node:assert/strict";
import { createSoundEngine } from "../src/audio.js";
function fake() {
  const calls = [];
  const param = () => ({
    value: 0,
    setValueAtTime() {},
    exponentialRampToValueAtTime() {},
    cancelScheduledValues() {},
    setTargetAtTime(v) {
      calls.push(["volume", v]);
    },
  });
  const node = () => ({
    gain: param(),
    frequency: param(),
    threshold: param(),
    knee: param(),
    ratio: param(),
    attack: param(),
    release: param(),
    connect() {},
    disconnect() {},
    start(t) {
      calls.push(["start", t, this.type]);
    },
    stop(t) {
      calls.push(["stop", t]);
    },
  });
  const c = {
    state: "running",
    currentTime: 0,
    sampleRate: 1000,
    destination: {},
    createGain: node,
    createDynamicsCompressor: node,
    createConvolver: node,
    createOscillator: node,
    createBufferSource: node,
    createBiquadFilter: node,
    createBuffer: (channels, length) => ({
      getChannelData: () => new Float32Array(length),
    }),
    close: () => Promise.resolve(),
  };
  return { c, calls };
}
test("sound requires gesture unlock, honors mute, and remembers preference", () => {
  const f = fake(),
    stored = [];
  let created = 0;
  const engine = createSoundEngine({
    contextFactory: () => {
      created++;
      return f.c;
    },
    storage: { getItem: () => null, setItem: (k, v) => stored.push(v) },
  });
  assert.equal(created, 0);
  assert.equal(engine.playSpawn(), false);
  engine.unlock();
  assert.equal(created, 1);
  assert.equal(engine.playSpawn(), true);
  assert.equal(f.calls.filter((x) => x[0] === "start").length, 2);
  engine.setEnabled(false);
  assert.equal(engine.playSpawn(), false);
  assert.equal(engine.playRebirth(), false);
  assert.equal(stored.at(-1), "off");
  engine.setEnabled(true);
  assert.equal(engine.playRebirth(), true);
  assert.ok(f.calls.some((x) => x[0] === "stop" && x[1] >= 4));
  engine.dispose();
});
test("background tabs and unsupported audio fail silently", () => {
  const f = fake();
  let hidden = false;
  const engine = createSoundEngine({
    contextFactory: () => f.c,
    hidden: () => hidden,
  });
  engine.unlock();
  hidden = true;
  assert.equal(engine.playSpawn(), false);
  assert.equal(engine.playRebirth(), false);
  assert.equal(f.calls.length, 0);
  const unsupported = createSoundEngine({ contextFactory: () => null });
  unsupported.unlock();
  assert.equal(unsupported.playSpawn(), false);
  assert.equal(unsupported.playRebirth(), false);
});
test("rapid duplicate effects are bounded while repeated valid spawns play", () => {
  const f = fake(),
    engine = createSoundEngine({ contextFactory: () => f.c });
  engine.unlock();
  assert.equal(engine.playSpawn(), true);
  assert.equal(engine.playSpawn(), false);
  f.c.currentTime = 0.12;
  assert.equal(engine.playSpawn(), true);
  engine.dispose();
});

test("collapse corrupts tones, restores them after ending and still honors mute", () => {
  const f = fake();
  const engine = createSoundEngine({ contextFactory: () => f.c });
  engine.unlock();
  engine.setCollapse(10);
  assert.equal(engine.playSpawn(), true);
  assert.ok(f.calls.some((c) => c[0] === "start" && c[2] === "square"));
  f.calls.length = 0;
  f.c.currentTime = 1;
  engine.setCollapse(0);
  assert.equal(engine.playSpawn(), true);
  assert.ok(f.calls.some((c) => c[0] === "start" && c[2] === "triangle"));
  assert.ok(!f.calls.some((c) => c[0] === "start" && c[2] === "square"));
  engine.setCollapse(10);
  engine.setEnabled(false);
  assert.equal(engine.playSpawn(), false);
  engine.dispose();
});

test("credits music waits for gesture, starts once and stops all scheduled voices", () => {
  const f = fake();
  const engine = createSoundEngine({ contextFactory: () => f.c });
  engine.playCredits();
  assert.equal(f.calls.length, 0);
  engine.unlock();
  const starts = f.calls.filter((c) => c[0] === "start").length;
  assert.ok(starts > 8);
  engine.playCredits();
  assert.equal(f.calls.filter((c) => c[0] === "start").length, starts);
  f.calls.length = 0;
  engine.stopCredits();
  assert.equal(f.calls.filter((c) => c[0] === "stop").length, starts);
  engine.unlock();
  assert.equal(f.calls.filter((c) => c[0] === "start").length, 0);
  engine.dispose();
});

test("absorption sound requires unlock, limits overlapping events and respects mute and hidden tabs", () => {
  const f = fake();
  let hidden = false;
  const engine = createSoundEngine({
    contextFactory: () => f.c,
    hidden: () => hidden,
  });
  assert.equal(engine.playAbsorb(), false);
  engine.unlock();
  assert.equal(engine.playAbsorb(), true);
  assert.equal(engine.playAbsorb(), false);
  assert.equal(f.calls.filter((c) => c[0] === "start").length, 3);
  f.c.currentTime = 0.2;
  assert.equal(engine.playAbsorb(), true);
  hidden = true;
  f.c.currentTime = 1;
  assert.equal(engine.playAbsorb(), false);
  hidden = false;
  engine.setEnabled(false);
  assert.equal(engine.playAbsorb(), false);
  engine.dispose();
});

test("planet unlock plays a four-note fanfare only with sound enabled and an active context", () => {
  const f = fake();
  let hidden = false;
  const engine = createSoundEngine({
    contextFactory: () => f.c,
    hidden: () => hidden,
  });
  assert.equal(engine.playUnlock(), false);
  engine.unlock();
  assert.equal(engine.playUnlock(), true);
  assert.equal(f.calls.filter((c) => c[0] === "start").length, 4);
  hidden = true;
  assert.equal(engine.playUnlock(), false);
  hidden = false;
  engine.setEnabled(false);
  assert.equal(engine.playUnlock(), false);
  engine.dispose();
});

test("ending music variants have distinct arrangements and changing tracks stops the previous one", () => {
  const f = fake();
  const engine = createSoundEngine({ contextFactory: () => f.c });
  engine.unlock();
  engine.playCredits("hacking");
  assert.ok(f.calls.some((c) => c[0] === "start" && c[2] === "sine"));
  assert.ok(!f.calls.some((c) => c[0] === "start" && c[2] === "square"));
  f.calls.length = 0;
  engine.playCredits("survivor");
  assert.ok(f.calls.some((c) => c[0] === "stop"));
  assert.ok(f.calls.some((c) => c[0] === "start" && c[2] === "sine"));
  assert.ok(!f.calls.some((c) => c[0] === "start" && c[2] === "square"));
  f.calls.length = 0;
  engine.playCredits("normal");
  assert.ok(f.calls.some((c) => c[0] === "start" && c[2] === "sine"));
  engine.dispose();
});

test("corruption bursts play impact and noise once per batch and respect mute", () => {
 const f=fake(), engine=createSoundEngine({contextFactory:()=>f.c});
 assert.equal(engine.playCorruptionBurst(),false);
 engine.unlock();
 assert.equal(engine.playCorruptionBurst(),true);
 assert.equal(engine.playCorruptionBurst(),false);
 assert.equal(f.calls.filter(c=>c[0]==='start').length,2);
 f.c.currentTime=1;
 assert.equal(engine.playCorruptionBurst(),true);
 engine.setEnabled(false);
 assert.equal(engine.playCorruptionBurst(),false);
 engine.dispose();
});
