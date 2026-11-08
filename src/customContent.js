export function customEndingReady(ending, state, currentLevel) {
  return (
    currentLevel >= ending.level && (state.rebirths || 0) >= ending.rebirths
  );
}
export function validateCustomContent(input, originalIds) {
  const text = (v, max) => {
    if (typeof v !== "string" || !v.trim() || v.length > max)
      throw new Error("추가 콘텐츠의 이름·설명을 올바르게 입력하세요.");
    return v.trim();
  };
  const number = (v, min, max) => {
    if (!Number.isFinite(v) || v < min || v > max)
      throw new Error(`추가 콘텐츠 수치는 ${min}~${max} 범위여야 합니다.`);
    return v;
  };
  const ids = new Set(originalIds);
  const id = (v) => {
    if (
      typeof v !== "string" ||
      !/^custom_[a-z0-9_]{1,60}$/.test(v) ||
      ids.has(v)
    )
      throw new Error("추가 콘텐츠 ID가 잘못되었거나 중복되었습니다.");
    ids.add(v);
    return v;
  };
  const planets = input.customPlanets ?? [],
    endings = input.customEndings ?? [];
  if (
    !Array.isArray(planets) ||
    planets.length > 30 ||
    !Array.isArray(endings) ||
    endings.length > 20
  )
    throw new Error("추가 천체는 최대 30개, 엔딩은 최대 20개입니다.");
  return {
    customPlanets: planets.map((p) => {
      if (!/^#[0-9a-fA-F]{6}$/.test(p.color))
        throw new Error("천체 색상을 확인하세요.");
      return {
        id: id(p.id),
        name: text(p.name, 25),
        en: text(p.name, 25),
        kind: "사용자 제작 천체",
        mass: number(p.mass, 1, 1e12),
        unlock: number(p.unlock, 0, 1e12),
        cooldown: number(p.cooldown, 0.2, 120),
        rebirth: number(p.rebirth, 0, 1000),
        size: number(p.size, 6, 40),
        color: p.color,
        fact: text(p.fact, 500),
      };
    }),
    customEndings: endings.map((e) => {
      if (!["normal", "hacking", "survivor", "happy"].includes(e.style))
        throw new Error("엔딩 연출을 선택하세요.");
      return {
        id: id(e.id),
        name: text(e.name, 60),
        hint: text(e.hint, 200),
        text: text(e.text, 3000),
        level: number(e.level, 1, 1000),
        rebirths: number(e.rebirths, 0, 1000),
        style: e.style,
      };
    }),
  };
}
