export const permanentNodes = [
  ["mass", "영원한 성장", "흡수 질량 +25%", 1, [], 1, 0],
  [
    "time",
    "시간의 기억",
    "모든 천체 소환 대기시간 10% 감소",
    2,
    ["mass"],
    0,
    1,
  ],
  ["research", "지식의 유산", "레벨업 보상 +2 P", 2, ["mass"], 2, 1],
  [
    "auto",
    "자율 우주",
    "모든 천체의 자동 생성 쿨타임 20% 감소",
    4,
    ["time"],
    0,
    2,
  ],
  [
    "bounty",
    "탐험가의 기억",
    "미션과 반복 탐사 보상 +3 P",
    4,
    ["research"],
    2,
    2,
  ],
  [
    "stream",
    "초월 소환",
    "모든 천체의 자동 생성 쿨타임 15% 감소",
    8,
    ["auto"],
    0,
    3,
  ],
  [
    "stellar",
    "별의 유산",
    "기본 질량 1,000 M 이상 천체의 흡수 배율 +50%",
    8,
    ["bounty"],
    2,
    3,
  ],
  [
    "seed",
    "우주의 씨앗",
    "다음 환생부터 시작 포인트 5 P 지급",
    16,
    ["stream"],
    0,
    4,
  ],
  ["core", "특이점 핵", "모든 흡수 질량 최종 배율 ×1.5", 16, ["stellar"], 2, 4],
  [
    "eternity",
    "영겁의 지평선",
    "모든 흡수 질량 최종 배율 추가 ×2",
    32,
    ["seed", "core"],
    1,
    5,
  ],
].map(([id, name, description, cost, requires, col, row]) => ({
  id,
  name,
  description,
  cost: [1, 2, 6, 18, 54, 162][row],
  requires,
  col,
  row,
}));
export function permanentEffect(s, id) {
  const owned = s.permanentSkills || {};
  if (id === "core")
    return (owned.core ? 1.5 : 1) * (owned.eternity ? 2 : 1) - 1;
  return owned[id]
    ? {
        mass: 0.25,
        time: 0.1,
        research: 2,
        bounty: 3,
        stellar: 0.5,
        auto: 0.2,
        stream: 0.15,
        seed: 5,
      }[id] || 0
    : 0;
}

export const deepeningMultiplier = (s) => 1 + (s.singularityDepth || 0) * 0.1;
