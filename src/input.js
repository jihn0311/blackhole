import { bodies, holdUnlocked, isUnlocked } from "./game.js";

// One shared controller for mouse and keyboard. Repetition is driven by our
// clock, never by the operating system's variable keyboard repeat speed.
export function createSpawnInput(getContext) {
  let pointer = null;
  let held = null;
  function emit(id, quiet = false) {
    const c = getContext();
    if (!c.enabled) return;
    const position = {
      x: 0.15 + Math.random() * 0.7,
      y: Math.random() < 0.5 ? 0.12 : 0.85,
    };
    c.onSpawn(id, position.x, position.y, false, quiet);
  }
  return {
    move(x, y) {
      if (x < 0 || x > 1 || y < 0 || y > 1) {
        this.clear();
        return;
      }
      pointer = { x, y };
    },
    press(id, token) {
      const c = getContext();
      if (!c.enabled || held?.token === token) return;
      const body = bodies.find((b) => b.id === id);
      if (!body) return;
      if (!isUnlocked(c.state, body)) {
        c.notify(
          `${body.name}은 ${body.rebirth ? body.rebirth + "회 환생 + " : ""}${body.unlock.toLocaleString()} M에 해금돼요.`,
        );
        return;
      }
      c.onSelect(id);
      if (!pointer && token === "pointer") {
        c.notify("마우스를 우주 공간에 올려놓고 소환해 주세요.");
        return;
      }
      held = {
        id,
        token,
      };
      emit(id);
    },
    release(token) {
      if (!token || held?.token === token) held = null;
    },
    clear() {
      held = null;
      pointer = null;
    },
    tick() {
      const c = getContext();
      if (!c.enabled) {
        held = null;
        return;
      }
      if (held && c.allowHold !== false && holdUnlocked(c.state))
        emit(held.id, true);
    },
  };
}
