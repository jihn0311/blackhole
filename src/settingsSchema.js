import { validateCustomContent } from "./customContent.js";
import { originalBodies as bodies, upgrades } from "./game.js";
const object = (v) => v && typeof v === "object" && !Array.isArray(v);
export function validateSettings(input) {
  if (!object(input) || input.version !== 1)
    throw new Error("올바른 게임 설정 파일이 아닙니다.");
  const text = (value, name, max) => {
    if (typeof value !== "string" || !value.trim() || value.length > max)
      throw new Error(`${name}: 1~${max}자로 입력하세요.`);
    return value.trim();
  };
  const num = (value, name, min, max, integer = false) => {
    if (
      typeof value !== "number" ||
      !Number.isFinite(value) ||
      value < min ||
      value > max ||
      (integer && !Number.isInteger(value))
    )
      throw new Error(
        `${name}: ${min}~${max}${integer ? " 정수" : ""} 범위로 입력하세요.`,
      );
    return value;
  };
  const result = {
    version: 1,
    gameTitle: text(input.gameTitle, "게임 이름", 50),
    subtitle: text(input.subtitle, "부제", 80),
  };
  for (const key of [
    "levelMassMultiplier",
    "upgradeCostMultiplier",
    "gainMultiplier",
    "cooldownMultiplier",
  ])
    result[key] = num(input[key], key, 0.1, 10);
  if (!object(input.planets) || !object(input.upgradeBases))
    throw new Error("천체·강화 설정 형식이 올바르지 않습니다.");
  const removed = input.removedPlanets ?? [];
  if (!Array.isArray(removed) || removed.some(id => id === 'asteroid' || !bodies.some(b => b.id === id))) throw new Error('첫 소행성은 삭제할 수 없습니다. 삭제할 천체를 확인하세요.');
  result.removedPlanets = [...new Set(removed)];
  result.planets = {};
  for (const [id, p] of Object.entries(input.planets)) {
    if (!bodies.some((b) => b.id === id) || !object(p))
      throw new Error("알 수 없는 천체입니다.");
    const out = {};
    for (const key of Object.keys(p)) {
      if (["mass", "unlock", "cooldown"].includes(key))
        out[key] = num(
          p[key],
          id + " " + key,
          key === "unlock" ? 0 : key === "cooldown" ? 0.2 : 1,
          key === "cooldown" ? 120 : 1e12,
          key !== "cooldown",
        );
      else if (["name", "fact"].includes(key))
        out[key] = text(p[key], id + " " + key, key === "name" ? 25 : 500);
      else throw new Error("지원하지 않는 천체 설정입니다.");
    }
    result.planets[id] = out;
  }
  if ((result.planets.asteroid?.unlock ?? 0) !== 0)
    throw new Error("첫 소행성은 질량 0에서 소환할 수 있어야 합니다.");
  for (let i = 1; i < bodies.length; i++) {
    const before =
      result.planets[bodies[i - 1].id]?.unlock ?? bodies[i - 1].unlock;
    const after = result.planets[bodies[i].id]?.unlock ?? bodies[i].unlock;
    if (after < before)
      throw new Error("천체 해금 질량은 목록 순서대로 같거나 커야 합니다.");
  }
  result.upgradeBases = {};
  for (const [id, v] of Object.entries(input.upgradeBases)) {
    if (!upgrades.some((u) => u.id === id))
      throw new Error("알 수 없는 강화입니다.");
    result.upgradeBases[id] = num(v, id, 1, 1000000, true);
  }
  if (!Array.isArray(input.scenes) || input.scenes.length !== 8)
    throw new Error("도입부는 8장면이어야 합니다.");
  result.scenes = input.scenes.map((s) => ({
    title: text(s?.title, "장면 제목", 60),
    text: text(s?.text, "장면 설명", 500),
  }));
  Object.assign(
    result,
    validateCustomContent(
      input,
      bodies.map((b) => b.id),
    ),
  );
  return result;
}

export function settingsDiff(previous, next, path = "") {
  const changes = [];
  for (const key of new Set([
    ...Object.keys(previous || {}),
    ...Object.keys(next || {}),
  ])) {
    const a = previous?.[key],
      b = next?.[key],
      label = path ? `${path}.${key}` : key;
    if ((object(a) && object(b)) || (Array.isArray(a) && Array.isArray(b)))
      changes.push(...settingsDiff(a, b, label));
    else if (JSON.stringify(a) !== JSON.stringify(b))
      changes.push({
        field: label,
        before: a ?? "(기본값)",
        after: b ?? "(기본값)",
      });
  }
  return changes;
}
