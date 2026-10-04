import test from "node:test";
import assert from "node:assert/strict";
import { installCreditsAcceleration } from "../src/creditsControls.js";
function harness() {
  const target = new EventTarget(),
    visibility = new EventTarget(),
    rates = [];
  const animation = {
    animationName: "credits-rise",
    currentTime: 17000,
    updatePlaybackRate: (r) => rates.push(r),
  };
  const dispose = installCreditsAcceleration(
    { getAnimations: () => [animation] },
    () => {},
    target,
    visibility,
  );
  const key = (type, code = "Space") => {
    const e = new Event(type, { cancelable: true });
    Object.defineProperty(e, "code", { value: code });
    target.dispatchEvent(e);
    return e;
  };
  return { target, visibility, rates, animation, key, dispose };
}
test("space accelerates credits without resetting progress or activating focused buttons", () => {
  const h = harness();
  assert.equal(h.key("keydown").defaultPrevented, true);
  assert.equal(h.rates.at(-1), 4);
  assert.equal(h.animation.currentTime, 17000);
  assert.equal(h.key("keyup").defaultPrevented, true);
  assert.equal(h.rates.at(-1), 1);
  assert.equal(h.key("keydown", "Enter").defaultPrevented, false);
  h.dispose();
});
test("blur, hidden tab, and cleanup release acceleration", () => {
  const h = harness();
  h.key("keydown");
  h.target.dispatchEvent(new Event("blur"));
  assert.equal(h.rates.at(-1), 1);
  h.key("keydown");
  h.visibility.hidden = true;
  h.visibility.dispatchEvent(new Event("visibilitychange"));
  assert.equal(h.rates.at(-1), 1);
  h.key("keydown");
  h.dispose();
  assert.equal(h.rates.at(-1), 1);
  const count = h.rates.length;
  h.key("keydown");
  assert.equal(h.rates.length, count);
});
