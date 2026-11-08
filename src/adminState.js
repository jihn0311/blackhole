import {
  fresh,
  restore,
  SAVE_VERSION,
  upgrades,
  bodies,
  missions,
  levelFloor,
} from "./game.js";

export function adminNumber(value, max = Number.MAX_SAFE_INTEGER) {
  if (String(value).trim() === "") throw new Error("숫자를 입력해주세요.");
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 0 || number > max)
    throw new Error(`0부터 ${max.toLocaleString()}까지의 정수를 입력해주세요.`);
  return number;
}

export function adminPreset(kind, current) {
  const s = { ...fresh(), ...current, cooldowns: {} };
  if (kind === "survivor") return fresh();
  if (kind === "happy")
    return { ...fresh(), unlockedEndings: ["normal", "hacking", "survivor"] };
  if (kind === "normal" || kind === "hacking")
    return {
      ...s,
      mass: levelFloor(400),
      bestMass: Math.max(s.bestMass, levelFloor(400)),
      endingSeen: false,
      endingType: null,
      cheatUsed: kind === "hacking",
      survivorDisqualified: true,
      rebirths: Math.max(3, s.rebirths),
      upgrades: Object.fromEntries(upgrades.map((u) => [u.id, u.max])),
      codex: Object.fromEntries(bodies.map((b) => [b.id, true])),
    };
  throw new Error("알 수 없는 테스트입니다.");
}

export function parseAdminSave(raw) {
  const data = JSON.parse(raw);
  if (
    data?.version !== SAVE_VERSION ||
    !data.state ||
    typeof data.state !== "object"
  )
    throw new Error("현재 버전의 게임 백업 파일을 선택해주세요.");
  const s = data.state;
  for (const key of [
    "mass",
    "points",
    "rebirths",
    "shards",
    "bestMass",
    "mission",
    "expeditions",
    "singularityDepth",
  ]) {
    if (typeof s[key] !== "number")
      throw new Error(`저장 데이터의 ${key} 값이 올바르지 않습니다.`);
    adminNumber(
      s[key],
      key === "mission" ? missions.length : Number.MAX_SAFE_INTEGER,
    );
  }
  for (const u of upgrades) adminNumber(s.upgrades?.[u.id], u.max);
  for (const key of ["mass", "time"]) adminNumber(s.permanent?.[key] ?? 0, 10);
  for (const b of bodies) adminNumber(s.counts?.[b.id] ?? 0);
  return restore(data);
}
