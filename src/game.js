import { skillNames, skillDescription } from "./skillPresentation.js";
import { permanentEffect, deepeningMultiplier } from "./skillData.js";
export const bodies = [
  {
    id: "asteroid",
    name: "소행성",
    en: "ASTEROID",
    kind: "암석 천체",
    mass: 10,
    unlock: 0,
    cooldown: 2,
    color: "#afa598",
    size: 6,
    fact: "소행성은 태양을 공전하는 작은 암석 천체입니다. 대부분은 화성과 목성 사이의 소행성대에 있습니다.",
    source: "https://science.nasa.gov/solar-system/asteroids/",
  },
  {
    id: "moon",
    name: "달",
    en: "THE MOON",
    kind: "지구의 위성",
    mass: 35,
    unlock: 100,
    cooldown: 4,
    color: "#c7cbd4",
    size: 9,
    fact: "달은 지구의 유일한 자연 위성입니다. 지구 주위를 공전하는 주기와 자전 주기가 같아 지구에서는 거의 같은 면을 봅니다.",
    source: "https://science.nasa.gov/moon/facts/",
  },
  {
    id: "mars",
    name: "화성",
    en: "MARS",
    kind: "암석 행성",
    mass: 100,
    unlock: 400,
    cooldown: 6,
    color: "#d8835e",
    size: 11,
    fact: "화성은 태양에서 네 번째 행성입니다. 표면의 철 광물이 산화되어 붉게 보입니다.",
    source: "https://science.nasa.gov/mars/facts/",
  },
  {
    id: "earth",
    name: "지구",
    en: "EARTH",
    kind: "암석 행성",
    mass: 250,
    unlock: 1200,
    cooldown: 8,
    color: "#619aca",
    size: 13,
    fact: "지구는 태양에서 세 번째 행성입니다. 표면의 약 71%가 물로 덮여 있습니다.",
    source: "https://science.nasa.gov/earth/facts/",
  },
  {
    id: "saturn",
    name: "토성",
    en: "SATURN",
    kind: "가스 행성",
    mass: 1300,
    unlock: 3500,
    cooldown: 10,
    color: "#d9bb88",
    size: 17,
    fact: "토성은 태양계에서 두 번째로 큰 행성입니다. 눈에 띄는 고리는 주로 얼음 조각과 암석으로 이루어져 있습니다.",
    source: "https://science.nasa.gov/saturn/facts/",
  },
  {
    id: "jupiter",
    name: "목성",
    en: "JUPITER",
    kind: "가스 행성",
    mass: 4000,
    unlock: 10000,
    cooldown: 12,
    color: "#c7a080",
    size: 20,
    fact: "목성은 태양계에서 가장 큰 행성입니다. 대적점은 오랫동안 지속된 거대한 폭풍입니다.",
    source: "https://science.nasa.gov/jupiter/facts/",
  },
  {
    id: "sun",
    name: "태양",
    en: "THE SUN",
    kind: "항성",
    mass: 12000,
    unlock: 30000,
    cooldown: 15,
    color: "#ffbe68",
    size: 24,
    fact: "태양은 태양계 중심에 있는 항성입니다. 중심부에서 수소가 헬륨으로 융합하며 에너지를 내놓습니다.",
    source: "https://science.nasa.gov/sun/facts/",
  },
];
bodies.push(
  ...[
    {
      id: "pluto",
      name: "명왕성",
      en: "PLUTO",
      kind: "왜소행성",
      mass: 20,
      unlock: 50,
      cooldown: 3,
      color: "#c6aea0",
      size: 8,
      fact: "명왕성은 해왕성 너머 카이퍼 벨트에 있는 왜소행성입니다. 표면에는 질소 얼음과 산맥이 있습니다.",
      source: "https://science.nasa.gov/dwarf-planets/pluto/facts/",
    },
    {
      id: "mercury",
      name: "수성",
      en: "MERCURY",
      kind: "암석 행성",
      mass: 65,
      unlock: 220,
      cooldown: 5,
      color: "#b5a699",
      size: 10,
      fact: "수성은 태양에 가장 가까우며 태양계에서 가장 작은 행성입니다. 표면에는 충돌구가 많습니다.",
      source: "https://science.nasa.gov/mercury/facts/",
    },
    {
      id: "venus",
      name: "금성",
      en: "VENUS",
      kind: "암석 행성",
      mass: 180,
      unlock: 750,
      cooldown: 7,
      color: "#dcb775",
      size: 12,
      fact: "금성은 두꺼운 이산화탄소 대기로 인한 강한 온실 효과 때문에 태양계에서 표면이 가장 뜨거운 행성입니다.",
      source: "https://science.nasa.gov/venus/venus-facts/",
    },
    {
      id: "uranus",
      name: "천왕성",
      en: "URANUS",
      kind: "얼음 거대 행성",
      mass: 700,
      unlock: 2000,
      cooldown: 9,
      color: "#8bd0d5",
      size: 15,
      fact: "천왕성은 얼음 거대 행성입니다. 자전축이 크게 기울어져 옆으로 누운 듯한 모습으로 태양을 공전합니다.",
      source: "https://science.nasa.gov/uranus/facts/",
    },
    {
      id: "neptune",
      name: "해왕성",
      en: "NEPTUNE",
      kind: "얼음 거대 행성",
      mass: 2300,
      unlock: 6000,
      cooldown: 11,
      color: "#4b71db",
      size: 17,
      fact: "해왕성은 태양계의 여덟 행성 중 태양에서 가장 멀리 있습니다. 대기에서는 매우 강한 바람이 붑니다.",
      source: "https://science.nasa.gov/neptune/neptune-facts/",
    },
  ],
);
bodies.sort((a, b) => a.unlock - b.unlock);
export const baseBodies = [...bodies];
export const prestigeBodies = [
  {
    id: "redgiant",
    name: "적색거성",
    en: "RED GIANT",
    kind: "진화한 항성",
    mass: 24000,
    unlock: 40000,
    rebirth: 1,
    cooldown: 18,
    color: "#f38951",
    size: 28,
    fact: "적색거성은 중심부의 수소 연료가 줄어든 뒤 바깥층이 크게 팽창한 별입니다. 태양도 미래에 적색거성 단계에 들어갑니다.",
    source: "https://science.nasa.gov/universe/stars/types/",
  },
  {
    id: "whitedwarf",
    name: "백색왜성",
    en: "WHITE DWARF",
    kind: "항성 잔해",
    mass: 60000,
    unlock: 90000,
    rebirth: 2,
    cooldown: 20,
    color: "#cadfff",
    size: 11,
    fact: "백색왜성은 태양과 비슷한 별이 바깥층을 잃은 뒤 남는 뜨겁고 조밀한 중심부입니다. 더 이상 핵융합으로 에너지를 만들지 않습니다.",
    source: "https://science.nasa.gov/universe/stars/types/",
  },
  {
    id: "neutron",
    name: "중성자별",
    en: "NEUTRON STAR",
    kind: "항성 잔해",
    mass: 150000,
    unlock: 200000,
    rebirth: 3,
    cooldown: 24,
    color: "#93ccff",
    size: 9,
    fact: "중성자별은 무거운 별이 초신성 폭발을 겪고 남을 수 있는 매우 조밀한 잔해입니다. 주로 중성자로 이루어져 있습니다.",
    source: "https://science.nasa.gov/universe/stars/types/",
  },
];
bodies.push(...prestigeBodies);
const unlockMasses = [
  0, 80, 220, 550, 1300, 3000, 7000, 16000, 32000, 66000, 132000, 275000,
  560000, 1150000, 2400000,
];
bodies.forEach((body, index) => {
  body.unlock = unlockMasses[index];
});
export const isUnlocked = (s, b) =>
  s.mass >= b.unlock && (s.rebirths || 0) >= (b.rebirth || 0);
export const hasDiscovered = (s, id) =>
  !!s.codex?.[id] || (s.counts[id] || 0) > 0;
export const baseDiscovered = (s) =>
  baseBodies.filter((b) => hasDiscovered(s, b.id)).length;
export const codexComplete = (s) => bodies.every((b) => hasDiscovered(s, b.id));
export const codexPointMultiplier = (s) => (codexComplete(s) ? 3 : 1);
export const permanentMass = (s) =>
  (1 + (s.permanent?.mass || 0) * 0.25 + permanentEffect(s, "mass")) *
  (1 + permanentEffect(s, "core")) *
  deepeningMultiplier(s) *
  (codexComplete(s) ? 20 : 1);
export const permanentTime = (s) =>
  0.9 ** (s.permanent?.time || 0) * (1 - permanentEffect(s, "time"));
export const shortcuts = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "0",
  "-",
  "=",
  "Q",
  "W",
  "E",
];
export function bodyForKey(event) {
  const code = event.code || "";
  const key =
    code.startsWith("Digit") || code.startsWith("Numpad")
      ? code.slice(-1)
      : code === "Minus"
        ? "-"
        : code === "Equal"
          ? "="
          : code.startsWith("Key")
            ? code.slice(3)
            : event.key?.toUpperCase();
  return bodies[shortcuts.indexOf(key)];
}
export const upgrades = [
  {
    id: "cooldown",
    name: "시간 가속",
    label: "TEMPORAL ACCELERATOR",
    symbol: "◷",
    description:
      "단계마다 모든 생성 대기시간이 15%씩 짧아집니다. 12단계까지 강화할 수 있습니다.",
    base: 1,
    max: 12,
  },
  {
    id: "auto",
    name: "쌍성 생성",
    label: "ORBITAL AUTOPILOT",
    symbol: "✧",
    description:
      "단계마다 추가 생성 확률 +2%p. 성공하면 같은 천체를 한 개 더 생성합니다.",
    base: 3,
    max: 10,
  },
  {
    id: "stream",
    name: "치명적 흡수",
    label: "CONTINUOUS CREATION",
    symbol: "∞",
    description:
      "단계마다 크리티컬 확률 +0.9%p. 크리티컬 흡수 질량은 10배입니다. 최종 단계는 영구 크리티컬 확률 +1%p를 추가합니다.",
    base: 1,
    max: 10,
  },
  {
    id: "efficiency",
    name: "질량 증폭",
    label: "MASS MULTIPLIER",
    symbol: "◈",
    description:
      "단계마다 흡수하는 게임 질량이 기본값의 15%만큼 증가합니다. 최대 2.5배로 성장합니다.",
    base: 2,
    max: 10,
  },
  {
    id: "research",
    name: "성장 연구",
    label: "GROWTH RESEARCH",
    symbol: "⌘",
    description:
      "앞으로 레벨업할 때 받는 포인트가 단계마다 1 P 늘어납니다. 높은 단계의 업그레이드에 도전하세요.",
    base: 2,
    max: 8,
  },
  {
    id: "bounty",
    name: "탐사 보상",
    label: "EXPLORATION REWARDS",
    symbol: "◇",
    description:
      "앞으로 수령하는 미션 보상이 단계마다 1 P 늘어납니다. 모든 미션 뒤에도 반복 탐사를 진행할 수 있습니다.",
    base: 2,
    max: 8,
  },
];
upgrades.push(
  {
    id: "stellar",
    name: "항성 포식",
    symbol: "✹",
    base: 2,
    max: 12,
    description:
      "기본 질량 1,000 M 이상 천체의 흡수 질량이 단계마다 10% 증가합니다.",
  },
  {
    id: "expedition",
    name: "심우주 탐사",
    symbol: "⌘",
    base: 2,
    max: 10,
    description: "반복 탐사 보상이 단계마다 2 P 증가합니다.",
  },
);
export const skillNodes = upgrades.flatMap((u, col) =>
  Array.from({ length: u.max }, (_, i) => ({
    id: u.id + ":" + (i + 1),
    branch: u.id,
    tier: i + 1,
    col,
    row: i,
    name: skillNames[u.id][i],
    description: skillDescription(u.id, i + 1),
    cost: upgradeCost(u, i),
    requires: [...(i ? [u.id + ":" + i] : col ? ["cooldown:1"] : [])],
  })),
);
export const ownsSkill = (s, id) => {
  const [branch, tier] = id.split(":");
  return (s.upgrades[branch] || 0) >= Number(tier);
};
export const canLearn = (s, node) =>
  !ownsSkill(s, node.id) && node.requires.every((id) => ownsSkill(s, id));
export const fresh = () => ({
  mass: 0,
  points: 0,
  counts: {},
  upgrades: Object.fromEntries(upgrades.map((u) => [u.id, 0])),
  mission: 0,
  cooldowns: {},
  autoEnabled: true,
  expeditions: 0,
  rebirths: 0,
  shards: 0,
  permanent: { mass: 0, time: 0 },
  permanentSkills: {},
  singularityDepth: 0,
  prestigeNoticeSeen: false,
  codexNoticeSeen: false,
  endingSeen: false,
  cheatUsed: false,
  survivorDisqualified: false,
  endingType: null,
  unlockedEndings: [],
  codex: {},
  bestMass: 0,
  holdPermanent: false,
});
// Blend 80% of the cubic curve with 20% of the previous quadratic curve.
export function level(mass) {
  const value = Math.max(0, Number.isFinite(mass) ? mass : 0);
  let low = 1,
    high = Math.max(2, Math.ceil(Math.cbrt(value / 100) * 2) + 2);
  while (low + 1 < high) {
    const mid = Math.floor((low + high) / 2);
    if (levelFloor(mid) <= value) low = mid;
    else high = mid;
  }
  return low;
}
export const levelFloor = (lv) => 10 * lv * (lv - 1) ** 2 * (2 * lv + 1);
export function levelProgress(mass) {
  const lv = level(mass),
    floor = levelFloor(lv),
    target = levelFloor(lv + 1);
  return {
    level: lv,
    floor,
    target,
    earned: mass - floor,
    required: target - floor,
    remaining: Math.max(0, target - mass),
    fraction: Math.max(0, Math.min(1, (mass - floor) / (target - floor))),
  };
}
const exactMassFormatter = new Intl.NumberFormat("ko-KR", {
  maximumFractionDigits: 0,
});
export const fmtExact = (n) => exactMassFormatter.format(n);
export function upgradeCost(u, n) {
  return u.base + 2 * n + 2 * Math.max(0, n - 2) ** 2;
}
export const fullyUpgraded = (s) =>
  upgrades.every((u) => (s.upgrades[u.id] || 0) >= u.max);
export const levelReward = (s, currentLevel = level(s.mass)) =>
  (2 +
    s.upgrades.research +
    permanentEffect(s, "research") +
    Math.max(0, currentLevel - 5) ** 2) *
  (fullyUpgraded(s) ? 3 : 1) *
  codexPointMultiplier(s);
const squareSum = (n) => (n * (n + 1) * (2 * n + 1)) / 6;
export function levelPoints(s, from, to) {
  const count = Math.max(0, to - from);
  if (!count) return 0;
  const bonus =
    squareSum(Math.max(0, to - 6)) - squareSum(Math.max(0, from - 6));
  return (
    (count * (2 + s.upgrades.research + permanentEffect(s, "research")) +
      bonus) *
    (fullyUpgraded(s) ? 3 : 1) *
    codexPointMultiplier(s)
  );
}
export const massGain = (s, b) =>
  Math.round(
    b.mass *
      (1 + s.upgrades.efficiency * 0.15) *
      permanentMass(s) *
      (fullyUpgraded(s) ? 10 : 1) *
      (b.mass >= 1000
        ? 1 + (s.upgrades.stellar || 0) * 0.1 + permanentEffect(s, "stellar")
        : 1),
  );
export const holdUnlocked = (s) =>
  s.holdPermanent === true || s.upgrades.stream >= 10;
export const upgradeCount = (s) =>
  upgrades.reduce((sum, u) => sum + (s.upgrades[u.id] || 0), 0);
export const autoStage = (s) =>
  upgradeCount(s) >= 60 ? 2 : upgradeCount(s) >= 40 ? 1 : 0;
export const autoInterval = (s) =>
  autoStage(s) === 1 ? 1000 : autoStage(s) === 2 ? 0 : Infinity;
export const autoUnlocked = (s) => autoStage(s) > 0;
export function autoCandidates(s, now, schedule = { lastAt: -Infinity }) {
  const stage = autoStage(s);
  if (!stage) return [];
  const available = bodies.filter(
    (b) => isUnlocked(s, b) && (s.cooldowns[b.id] || 0) <= now,
  );
  if (stage === 2) return available;
  if (now - schedule.lastAt < 1000) return [];
  return available;
}
export const missionReward = (s, m) =>
  (m.reward + s.upgrades.bounty + permanentEffect(s, "bounty")) *
  codexPointMultiplier(s);
export const expeditionReward = (s) =>
  (5 +
    5 * (s.expeditions || 0) +
    s.upgrades.bounty +
    2 * (s.upgrades.expedition || 0) +
    permanentEffect(s, "bounty")) *
  codexPointMultiplier(s);
export const expeditionTarget = (s) => 100 * ((s.expeditions || 0) + 1);
export const total = (s) => Object.values(s.counts).reduce((a, b) => a + b, 0);
export const discovered = (s) =>
  bodies.filter((b) => hasDiscovered(s, b.id)).length;
export const missions = [
  {
    title: "첫 번째 만남",
    description: "소행성 5개를 흡수하세요.",
    target: 5,
    value: (s) => s.counts.asteroid || 0,
    reward: 1,
  },
  {
    title: "더 빠른 우주",
    description: "시간 가속을 1회 업그레이드하세요.",
    target: 1,
    value: (s) => s.upgrades.cooldown,
    reward: 1,
  },
  {
    title: "달을 품다",
    description: "달을 3개 흡수하세요.",
    target: 3,
    value: (s) => s.counts.moon || 0,
    reward: 2,
  },
  {
    title: "스스로 자라는 블랙홀",
    description: "쌍성 생성을 1회 강화하세요.",
    target: 1,
    value: (s) => s.upgrades.auto,
    reward: 2,
  },
  {
    title: "붉은 행성",
    description: "화성을 3개 흡수하세요.",
    target: 3,
    value: (s) => s.counts.mars || 0,
    reward: 2,
  },
  {
    title: "푸른 점 너머로",
    description: "지구를 3개 흡수하세요.",
    target: 3,
    value: (s) => s.counts.earth || 0,
    reward: 3,
  },
  {
    title: "고리의 세계",
    description: "토성을 3개 흡수하세요.",
    target: 3,
    value: (s) => s.counts.saturn || 0,
    reward: 3,
  },
  {
    title: "거인을 삼키다",
    description: "목성을 3개 흡수하세요.",
    target: 3,
    value: (s) => s.counts.jupiter || 0,
    reward: 3,
  },
  {
    title: "별을 수집하는 사람",
    description: "서로 다른 천체 7종을 발견하세요.",
    target: 7,
    value: discovered,
    reward: 5,
  },
];
missions.push({
  title: "태양계 완전 탐사",
  description: "추가된 천체까지 12종의 도감을 완성하세요.",
  target: baseBodies.length,
  value: baseDiscovered,
  reward: 8,
});
export const extraSpawnChance = (s) =>
  Math.min(0.2, (s.upgrades.auto || 0) * 0.02);
export const criticalChance = (s) =>
  Math.min(
    0.1,
    ((s.upgrades.stream || 0) * 9 + (holdUnlocked(s) ? 10 : 0)) / 1000,
  );
export const spawnCount = (s, roll) => (roll < extraSpawnChance(s) ? 2 : 1);
export const isCritical = (s, roll) => roll < criticalChance(s);
export const blackHoleScale = (lv) =>
  0.38 + 0.62 * (1 - Math.exp(-(Math.max(1, lv) - 1) / 25));
export function absorb(s, id, roll = 1) {
  const b = bodies.find((b) => b.id === id);
  if (!b) return s;
  const mass = s.mass + massGain(s, b) * (isCritical(s, roll) ? 10 : 1);
  return {
    ...s,
    mass,
    bestMass: Math.max(s.bestMass || 0, mass),
    codex: { ...s.codex, [id]: true },
    points: s.points + levelPoints(s, level(s.mass), level(mass)),
    counts: { ...s.counts, [id]: (s.counts[id] || 0) + 1 },
  };
}
export function buy(s, id) {
  if (id.includes(":")) {
    const node = skillNodes.find((n) => n.id === id);
    if (
      !node ||
      !canLearn(s, node) ||
      (s.upgrades[node.branch] || 0) + 1 !== node.tier
    )
      return s;
    id = node.branch;
  }
  const u = upgrades.find((u) => u.id === id);
  if (!u) return s;
  const n = s.upgrades[id],
    cost = upgradeCost(u, n);
  if (
    n >= u.max ||
    s.points < cost ||
    !canLearn(
      s,
      skillNodes.find((node) => node.id === id + ":" + (n + 1)),
    )
  )
    return s;
  return {
    ...s,
    points: s.points - cost,
    upgrades: { ...s.upgrades, [id]: n + 1 },
    holdPermanent: s.holdPermanent === true || (id === "stream" && n + 1 >= 10),
  };
}
export function claim(s) {
  const m = missions[s.mission];
  if (!m) {
    if (total(s) < expeditionTarget(s)) return s;
    return {
      ...s,
      expeditions: (s.expeditions || 0) + 1,
      points: s.points + expeditionReward(s),
    };
  }
  if (m.value(s) < m.target) return s;
  return {
    ...s,
    mission: s.mission + 1,
    points: s.points + missionReward(s, m),
  };
}
export function cooldown(s, b, auto = false) {
  return Math.max(
    120,
    b.cooldown *
      1000 *
      0.85 ** s.upgrades.cooldown *
      permanentTime(s) *
      (fullyUpgraded(s) ? 0.5 : 1) *
      (codexComplete(s) ? 0.6 : 1) *
      (1 - permanentEffect(s, "auto")) *
      (1 - permanentEffect(s, "stream")),
  );
}
export function reserve(s, id, now, auto = false) {
  const b = bodies.find((b) => b.id === id);
  if (!b || !isUnlocked(s, b) || (s.cooldowns[id] || 0) > now) return s;
  return {
    ...s,
    cooldowns: { ...s.cooldowns, [id]: now + cooldown(s, b, auto) },
  };
}
export const SAVE_KEY = "event-horizon-v1";
export const SAVE_VERSION = 4;
export function restore(d, now = Date.now()) {
  if (!d || ![1, 2, 3, 4].includes(d.version) || !d.state) return fresh();
  const s = d.state,
    num = (n) => Number.isFinite(n) && n >= 0,
    int = (n) => Number.isSafeInteger(n) && n >= 0;
  if (
    !num(s.mass) ||
    !int(s.points) ||
    !int(s.mission) ||
    s.mission > missions.length
  )
    return fresh();
  const clean = fresh();
  for (const u of upgrades) {
    const n = s.upgrades?.[u.id] ?? 0;
    if (!int(n) || n > u.max) return fresh();
    clean.upgrades[u.id] = n;
  }
  if (d.version >= 3) {
    if (!int(s.rebirths ?? 0) || !int(s.shards ?? 0) || !num(s.bestMass ?? 0))
      return fresh();
    clean.rebirths = s.rebirths ?? 0;
    clean.prestigeNoticeSeen = s.prestigeNoticeSeen === true;
    clean.codexNoticeSeen = s.codexNoticeSeen === true;
    clean.endingSeen = s.endingSeen === true;
    clean.cheatUsed = s.cheatUsed === true;
    clean.survivorDisqualified = s.survivorDisqualified === true;
    clean.endingType = clean.endingSeen
      ? ["hacking", "survivor"].includes(s.endingType)
        ? s.endingType
        : "normal"
      : null;
    clean.unlockedEndings = [
      ...new Set([
        ...(Array.isArray(s.unlockedEndings) ? s.unlockedEndings : []),
        ...(clean.endingSeen ? [clean.endingType] : []),
      ]),
    ].filter((id) => ["normal", "hacking", "survivor"].includes(id));
    clean.shards = s.shards ?? 0;
    if (!int(s.singularityDepth ?? 0)) return fresh();
    clean.singularityDepth = s.singularityDepth ?? 0;
    for (const id of ["mass", "time"]) {
      const n = s.permanent?.[id] ?? 0;
      if (!int(n) || n > 10) return fresh();
      clean.permanent[id] = n;
    }
    clean.holdPermanent = s.holdPermanent === true;
    if (d.version >= 4) {
      for (const id of [
        "mass",
        "time",
        "research",
        "bounty",
        "stellar",
        "auto",
        "stream",
        "seed",
        "core",
        "eternity",
      ]) {
        if (s.permanentSkills?.[id] === true) clean.permanentSkills[id] = true;
      }
    }
  }
  clean.holdPermanent = clean.holdPermanent || clean.upgrades.stream >= 10;
  clean.bestMass = Math.max(s.mass, d.version >= 3 ? s.bestMass || 0 : 0);
  let refund = 0;
  if (d.version === 1) {
    const old = s.upgrades?.gravity ?? 0;
    if (!int(old) || old > 5) return fresh();
    refund = (old * (old + 1)) / 2;
    const oldLevel = 1 + Math.floor(Math.log2(1 + s.mass / 100));
    refund += Math.max(0, level(s.mass) - oldLevel) * 2;
  }
  for (const b of bodies) {
    if (
      (s.counts?.[b.id] || 0) > 0 ||
      (d.version >= 3 && s.codex?.[b.id] === true)
    )
      clean.codex[b.id] = true;
    if (int(s.counts?.[b.id])) clean.counts[b.id] = s.counts[b.id];
    if (num(s.cooldowns?.[b.id]))
      clean.cooldowns[b.id] = Math.min(
        s.cooldowns[b.id],
        now + b.cooldown * 1000,
      );
  }
  return {
    ...clean,
    mass: s.mass,
    points: s.points + refund,
    mission: s.mission,
    autoEnabled: s.autoEnabled !== false,
    expeditions: int(s.expeditions) ? s.expeditions : 0,
  };
}
export function load() {
  try {
    return restore(JSON.parse(localStorage.getItem(SAVE_KEY)));
  } catch {
    return fresh();
  }
}
export const fmt = (n) =>
  new Intl.NumberFormat("en", {
    maximumFractionDigits: n >= 1000 ? 1 : 0,
    notation: n >= 100000 ? "compact" : "standard",
  }).format(n);
