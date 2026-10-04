import { useEffect, useRef } from "react";
import { bodyForKey } from "./game.js";
import { createSpawnInput } from "./input.js";

export function useSpawnControls(context) {
  const latest = useRef(context);
  latest.current = context;
  const controller = useRef();
  if (!controller.current)
    controller.current = createSpawnInput(() => latest.current);
  const input = controller.current;
  useEffect(() => {
    if (!context.enabled) input.clear();
  }, [context.enabled, input]);
  useEffect(() => {
    const down = (e) => {
      if (
        e.isComposing ||
        e.ctrlKey ||
        e.altKey ||
        e.metaKey ||
        e.shiftKey ||
        e.target.closest?.('input,textarea,select,[contenteditable="true"]')
      )
        return;
      if (!latest.current.enabled) return;
      const body = bodyForKey(e);
      const canvasKey =
        e.target.tagName === "CANVAS" && (e.key === "Enter" || e.key === " ");
      if (!body && !canvasKey) return;
      e.preventDefault();
      if (e.repeat) return;
      input.press(body?.id || latest.current.selected, e.code || e.key);
    };
    const up = (e) => input.release(e.code || e.key);
    const pointerUp = () => input.release("pointer");
    const clear = () => input.clear();
    const visibility = () => {
      if (document.hidden) clear();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("pointerup", pointerUp);
    window.addEventListener("pointercancel", pointerUp);
    window.addEventListener("blur", clear);
    document.addEventListener("visibilitychange", visibility);
    const timer = setInterval(() => input.tick(), 50);
    return () => {
      clearInterval(timer);
      input.clear();
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("pointerup", pointerUp);
      window.removeEventListener("pointercancel", pointerUp);
      window.removeEventListener("blur", clear);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [input]);
  const move = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    input.move((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
  };
  return {
    onPointerMove: move,
    onPointerEnter: move,
    onPointerLeave: () => input.clear(),
    onPointerDown: (e) => {
      if (e.button !== 0 || e.isPrimary === false) return;
      e.preventDefault();
      e.currentTarget.focus({ preventScroll: true });
      move(e);
      input.press(latest.current.selected, "pointer");
    },
    onPointerUp: () => input.release("pointer"),
    onPointerCancel: () => input.clear(),
    onContextMenu: (e) => e.preventDefault(),
  };
}
