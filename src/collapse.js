export function collapseStage(level) {
  if (level < 300) return 0;
  return Math.min(11, 1 + Math.floor((level - 300) / 10));
}
export const endingReached = (level) => level >= 400;
export const collapseMessages = [
  "",
  "관측 신호에 균열이 감지되었습니다",
  "시공간의 연결이 불안정합니다",
  "현실의 경계가 무너지고 있습니다",
  "관측 기록을 복구할 수 없습니다",
  "사건의 지평선이 우주 전체를 삼킵니다",
  "시간 좌표가 뒤섞이고 있습니다",
  "우주의 기억이 손상되었습니다",
  "현실 복구에 실패했습니다",
  "마지막 별빛이 끊어집니다",
  "모든 경계가 소멸합니다",
  "관측 종료",
];
