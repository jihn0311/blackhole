import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function StoryWarning({ level, cheat, ended, generation }) {
  const stage = level >= 380 ? 3 : level >= 340 ? 2 : level >= 300 ? 1 : 0;
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!stage || ended) { setVisible(false); return; }
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 6500);
    return () => clearTimeout(timer);
  }, [stage, ended, generation]);
  if (!visible || ended || !stage) return null;
  const messages = cheat
    ? ["합성 장치 안전 제한 해제", "관측소 데이터 변환 진행 중", "변환 대상에 운용자가 포함되었습니다"]
    : ["공급 중단 권고", "블랙홀 성장 억제 실패", "관측소 이탈 불가"];
  const details = cheat
    ? ["금지 명령 JIS 감지 · 복제 대상 검증 불가", "인공 천체와 현실의 경계가 소실됩니다", "장치가 당신을 새로운 재료로 인식합니다"]
    : ["공급량 증가가 블랙홀의 성장을 가속하고 있습니다", "태양계 보호 계획 실패 · 비상 철수 경로 계산 중", "사건의 지평선 접근 · 모든 통신이 곧 중단됩니다"];
  return createPortal(<section className="story-warning" role="alert">
    <div className="story-warning-frame">
      <span className="warning-stripes" />
      <div className="warning-symbol" aria-hidden="true">△<b>!</b></div>
      <span className="warning-code">WARNING / EH-0{stage}</span>
      <h2>{messages[stage - 1]}</h2>
      <p>{details[stage - 1]}</p>
      <span className="warning-stripes" />
    </div>
  </section>, document.body);
}
