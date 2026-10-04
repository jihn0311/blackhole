import { skillNodes, ownsSkill, buy } from "./game.js";
import { permanentNodes } from "./skillData.js";
import { buyPermanent } from "./prestige.js";
export function bulkUpgrade(state, permanent = false) {
  const nodes = permanent ? permanentNodes : skillNodes;
  const currency = permanent ? "shards" : "points";
  let next = state,
    count = 0;
  for (let i = 0; i < nodes.length; i++) {
    const owned = (id) =>
      permanent ? !!next.permanentSkills?.[id] : ownsSkill(next, id);
    const node = nodes
      .filter(
        (n) =>
          !owned(n.id) && n.requires.every(owned) && n.cost <= next[currency],
      )
      .sort(
        (a, b) => a.cost - b.cost || nodes.indexOf(a) - nodes.indexOf(b),
      )[0];
    if (!node) break;
    next = permanent ? buyPermanent(next, node.id) : buy(next, node.id);
    count++;
  }
  return { state: next, count, spent: state[currency] - next[currency] };
}
