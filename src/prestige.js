import {
  fresh,
  baseDiscovered,
  baseBodies,
  holdUnlocked,
  fullyUpgraded,
} from "./game.js";
import { permanentNodes, permanentEffect } from "./skillData.js";
export const permanentUpgrades = permanentNodes;
export const rebirthTarget = (s) => 100000 * 2 ** Math.min(s.rebirths || 0, 30);
export const POINTS_PER_SHARD = 100;
export const deepeningUnlocked = (s) =>
  permanentNodes.every((n) => s.permanentSkills?.[n.id] === true);
export const deepeningCost = (s) =>
  Math.min(
    Number.MAX_SAFE_INTEGER,
    50 * 2 ** Math.min(s.singularityDepth || 0, 48),
  );
export const prestigeUnlocked = (s) =>
  (s.rebirths || 0) > 0 || fullyUpgraded(s);
export const canRebirth = (s) =>
  prestigeUnlocked(s) &&
  baseDiscovered(s) === baseBodies.length &&
  s.mass >= rebirthTarget(s) &&
  s.points >= POINTS_PER_SHARD;
export const rebirthReward = (s) => Math.floor(s.points / POINTS_PER_SHARD);
export const permanentCost = (s, id) =>
  id === "deepening"
    ? deepeningCost(s)
    : (permanentNodes.find((n) => n.id === id)?.cost ?? Infinity);
export function buyPermanent(s, id) {
  if (id === "deepening") {
    const cost = deepeningCost(s),
      next = (s.singularityDepth || 0) + 1;
    if (!deepeningUnlocked(s) || s.shards < cost || !Number.isSafeInteger(next))
      return s;
    return { ...s, shards: s.shards - cost, singularityDepth: next };
  }
  const node = permanentNodes.find((n) => n.id === id);
  if (
    !node ||
    s.permanentSkills?.[id] ||
    node.requires.some((key) => !s.permanentSkills?.[key]) ||
    s.shards < node.cost
  )
    return s;
  return {
    ...s,
    shards: s.shards - node.cost,
    permanentSkills: { ...s.permanentSkills, [id]: true },
  };
}
export function rebirth(s) {
  if (!canRebirth(s)) return s;
  const codex = { ...s.codex };
  for (const [id, count] of Object.entries(s.counts))
    if (count > 0) codex[id] = true;
  return {
    ...fresh(),
    rebirths: (s.rebirths || 0) + 1,
    prestigeNoticeSeen: true,
    codexNoticeSeen: s.codexNoticeSeen === true,
    endingSeen: s.endingSeen === true,
    cheatUsed: s.cheatUsed === true,
    survivorDisqualified: true,
    endingType: s.endingType || null,
    unlockedEndings: s.unlockedEndings || [],
    shards: (s.shards || 0) + rebirthReward(s),
    permanent: { ...s.permanent },
    permanentSkills: { ...s.permanentSkills },
    singularityDepth: s.singularityDepth || 0,
    points: permanentEffect(s, "seed"),
    codex,
    bestMass: Math.max(s.bestMass || 0, s.mass),
    holdPermanent: holdUnlocked(s),
    autoEnabled: s.autoEnabled,
  };
}
