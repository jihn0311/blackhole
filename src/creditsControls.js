export function installCreditsAcceleration(
  roll,
  onChange,
  target = window,
  visibility = document,
) {
  const setRate = (rate) => {
    const animation = roll
      .getAnimations()
      .find((a) => a.animationName === "credits-rise");
    if (!animation) return false;
    animation.updatePlaybackRate(rate);
    onChange(rate > 1);
    return true;
  };
  let held = false;
  const down = (e) => {
    if (e.code !== "Space" && e.key !== " ") return;
    if (e.ctrlKey || e.altKey || e.metaKey || e.isComposing) return;
    if (!setRate(4)) return;
    held = true;
    e.preventDefault();
    e.stopPropagation();
  };
  const release = () => {
    if (held) {
      held = false;
      setRate(1);
    }
  };
  const up = (e) => {
    if ((e.code === "Space" || e.key === " ") && held) {
      e.preventDefault();
      e.stopPropagation();
      release();
    }
  };
  const hide = () => {
    if (visibility.hidden) release();
  };
  target.addEventListener("keydown", down, { capture: true });
  target.addEventListener("keyup", up, { capture: true });
  target.addEventListener("blur", release);
  visibility.addEventListener("visibilitychange", hide);
  return () => {
    release();
    target.removeEventListener("keydown", down, { capture: true });
    target.removeEventListener("keyup", up, { capture: true });
    target.removeEventListener("blur", release);
    visibility.removeEventListener("visibilitychange", hide);
  };
}
