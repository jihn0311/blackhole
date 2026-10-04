import test from "node:test";
import assert from "node:assert/strict";
import { skillNodes, fresh, buy, ownsSkill } from "../src/game.js";
import { permanentNodes } from "../src/skillData.js";
import { radialLayout } from "../src/skillPresentation.js";
test("every skill has a distinct name and a specific effect description", () => {
  const all = [...skillNodes, ...permanentNodes];
  assert.equal(new Set(all.map((n) => n.name)).size, 90);
  for (const n of all) {
    assert.ok(n.description.length > 8);
    assert.ok(!/ \d+$/.test(n.name));
  }
  assert.equal(new Set(skillNodes.map((n) => n.description)).size, 80);
});
test("buying an exact skill cannot silently buy another tier", () => {
  let s = { ...fresh(), points: 1000 };
  assert.equal(buy(s, "cooldown:12"), s);
  assert.equal(buy(s, "auto:1"), s);
  s = buy(s, "cooldown:1");
  assert.ok(ownsSkill(s, "cooldown:1"));
  assert.equal(buy(s, "cooldown:1"), s);
  assert.equal(buy(s, "cooldown:3"), s);
  const next = buy(s, "auto:1");
  assert.equal(next.points, s.points - 3);
  assert.equal(next.upgrades.auto, 1);
  assert.equal(next.upgrades.cooldown, 1);
  assert.equal(buy(next, "unknown:1"), next);
});
test("radial trees place roots at center and every node within bounds without overlapping", () => {
  for (const [nodes, permanent] of [
    [skillNodes, false],
    [permanentNodes, true],
  ]) {
    const { size, center, positions } = radialLayout(nodes, permanent);
    assert.deepEqual(positions[nodes[0].id], { x: center, y: center });
    for (const n of nodes) {
      const p = positions[n.id];
      assert.ok(p.x >= 62 && p.x <= size - 62 && p.y >= 38 && p.y <= size - 38);
    }
    for (let i = 0; i < nodes.length; i++)
      for (let j = i + 1; j < nodes.length; j++) {
        const a = positions[nodes[i].id],
          b = positions[nodes[j].id];
        assert.ok(
          Math.abs(a.x - b.x) >= 124 || Math.abs(a.y - b.y) >= 76,
          `${nodes[i].name} overlaps ${nodes[j].name}`,
        );
      }
  }
});

// All connectors must lead downwards and cards must remain distinct at full progress.
import { verticalLayout } from '../src/skillPresentation.js';
test('vertical skill trees keep all cards in bounds, separate and below their prerequisites', () => {
  for (const [nodes, permanent] of [[skillNodes, false], [permanentNodes, true]]) {
    const { size, positions } = verticalLayout(nodes, permanent);
    for (const node of nodes) {
      const p = positions[node.id];
      assert.ok(p.x >= 92 && p.x <= size - 92 && p.y >= 55 && p.y <= size - 55);
      for (const parent of node.requires) assert.ok(positions[parent].y < p.y);
      for (const other of nodes) {
        if (other.id === node.id) continue;
        const q = positions[other.id];
        assert.ok(Math.abs(p.x-q.x) >= 184 || Math.abs(p.y-q.y) >= 110);
      }
    }
  }
});
