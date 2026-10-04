// UI navigation and audio preferences are not gameplay. Legacy click-based
// disqualification must not permanently block an otherwise untouched run.
export function survivorEligible(state) {
  return !state.endingSeen && !state.cheatUsed &&
    state.mass === 0 && state.rebirths === 0 &&
    Object.keys(state.cooldowns || {}).length === 0 &&
    Object.values(state.counts || {}).every(value => value === 0) &&
    Object.values(state.upgrades || {}).every(value => value === 0);
}
