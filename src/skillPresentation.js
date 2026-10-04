export const skillNames = {
  cooldown: [
    "시간의 균열",
    "초침 가속",
    "궤도 단축",
    "찰나의 도약",
    "시공간 압축",
    "역행하는 시계",
    "시간의 소용돌이",
    "광속의 문턱",
    "순간의 지배자",
    "멈춘 지평선",
    "무한한 찰나",
    "시간 초월",
  ],
  auto: [
    "쌍성의 씨앗",
    "분열하는 궤도",
    "복제 파동",
    "동반 천체",
    "우주의 메아리",
    "별의 분신",
    "이중 성운",
    "쌍둥이 은하",
    "차원 복제",
    "끝없는 쌍성",
  ],
  stream: [
    "급소 관측",
    "핵심 조준",
    "균열 포착",
    "치명적 공명",
    "핵 붕괴",
    "파괴의 섬광",
    "초신성 강타",
    "심연의 일격",
    "절대 관통",
    "운명의 크리티컬",
  ],
  efficiency: [
    "밀도 응축",
    "물질 회수",
    "흡수 공명",
    "핵심 추출",
    "고밀도 포식",
    "질량 정제",
    "에너지 수확",
    "심연의 허기",
    "완전한 흡수",
    "포식의 정점",
  ],
  research: [
    "관측의 시작",
    "중력 해석",
    "우주 방정식",
    "사건의 기록",
    "암흑물질 연구",
    "차원 이론",
    "특이점 해독",
    "우주의 진리",
  ],
  bounty: [
    "탐험의 첫발",
    "임무 기록관",
    "성과 분석",
    "탐사 계약",
    "미지의 보상",
    "우주 개척자",
    "은하의 명성",
    "전설의 탐험가",
  ],
  stellar: [
    "별빛 감지",
    "항성 추적",
    "플라스마 수확",
    "별의 껍질",
    "핵융합 포식",
    "태양의 잔향",
    "거성 사냥",
    "초신성 채집",
    "별무리 흡수",
    "성운의 연회",
    "은하의 포식자",
    "별들의 종착지",
  ],
  expedition: [
    "심우주 신호",
    "장거리 항해",
    "탐사 거점",
    "외곽 항로",
    "미지의 성도",
    "은하 횡단",
    "공허의 보물",
    "경계 너머",
    "끝없는 원정",
    "우주의 끝에서",
  ],
};
export function skillDescription(branch, tier) {
  switch (branch) {
    case "cooldown":
      return `모든 천체의 현재 소환 대기시간을 추가로 15% 줄입니다. 이 계열 누적 감소율: ${Math.round((1 - 0.85 ** tier) * 100)}%.`;
    case "auto":
      return (
        `추가 생성 확률 +2%p. 현재 계열 누적 확률 ${tier * 2}%. 성공하면 같은 천체가 1개 더 나오며 추가 천체는 재복제되지 않습니다.` +
        (tier === 10 ? " 추가 생성 확률 최대 20% 달성." : "")
      );
    case "stream":
      return (
        `크리티컬 확률 +0.9%p. 현재 계열 누적 확률 ${(tier * 0.9).toFixed(1)}%. 크리티컬 흡수 시 질량 10배.` +
        (tier === 10
          ? " 최종 보상: 환생해도 유지되는 크리티컬 확률 +1%p (총 10%)."
          : "")
      );
    case "efficiency":
      return `기본 흡수 질량 대비 보너스 +15%를 추가합니다. 이 계열 누적 보너스: +${tier * 15}%.`;
    case "research":
      return `앞으로 레벨업할 때 받는 포인트 +1 P. 레벨 성장 보너스에 추가됩니다. 이 계열 적용 시 기본 레벨업 보상: ${2 + tier} P.`;
    case "bounty":
      return `앞으로 받는 미션과 반복 탐사 보상 +1 P. 이 계열 누적 추가 보상: +${tier} P.`;
    case "stellar":
      return `기본 질량 1,000 M 이상 천체의 흡수 배율에 +10%를 추가합니다. 이 계열 누적 보너스: +${tier * 10}%.`;
    case "expedition":
      return `반복 탐사 완료 보상 +2 P. 이 계열 누적 추가 보상: +${tier * 2} P. 순차 미션 10개 완료 후 적용됩니다.`;
  }
}
// The center is the first skill; eight branches fan out into successive paired rings.
export function radialLayout(nodes, permanent = false) {
  const size = permanent ? 1300 : 2400,
    center = size / 2;
  return {
    size,
    center,
    positions: Object.fromEntries(
      nodes.map((n, index) => {
        if (index === 0) return [n.id, { x: center, y: center }];
        let angle, radius;
        if (permanent) {
          const specs = {
            time: [-155, 210],
            research: [-25, 210],
            auto: [-155, 350],
            bounty: [-25, 350],
            stream: [155, 350],
            stellar: [25, 350],
            seed: [140, 510],
            core: [40, 510],
            eternity: [90, 510],
          };
          [angle, radius] = specs[n.id];
          angle *= Math.PI / 180;
        } else {
          const i = n.branch === "cooldown" ? n.tier - 2 : n.tier - 1;
          angle =
            -Math.PI / 2 +
            (n.col * Math.PI) / 4 +
            (i === 0 ? 0 : (i - 1) % 2 === 0 ? -0.19 : 0.19);
          radius = i === 0 ? 210 : 360 + Math.floor((i - 1) / 2) * 145;
        }
        return [
          n.id,
          {
            x: center + Math.cos(angle) * radius,
            y: center + Math.sin(angle) * radius,
          },
        ];
      }),
    ),
  };
}

export const visibleSkills = (nodes, owned) =>
  nodes.filter((n) => owned(n.id) || n.requires.every(owned));

// Columns describe an effect family; rows always advance toward its final skill.
export function verticalLayout(nodes, permanent = false) {
  const size = permanent ? 1000 : 1960;
  return {
    size, center: size / 2,
    positions: Object.fromEntries(nodes.map((n, index) => [n.id, {
      x: permanent ? 260 + n.col * 240 : index === 0 ? size / 2 : 145 + n.col * 230,
      y: permanent ? 110 + n.row * 145 : index === 0 ? 100 : 310 + (n.tier - (n.branch === 'cooldown' ? 2 : 1)) * 140,
    }])),
  };
}
