import React from "react";
import blackHole from "./assets/black-hole.gif";
export function HappyEscape() {
  return <section className="happy-escape" role="status" aria-label="역합성 실행, 귀환 경로가 열립니다">
    <div className="happy-stars" />
    <img src={blackHole} alt="푸른 빛으로 변하며 멀어지는 블랙홀" />
    <div className="happy-transmission"><small>EARTH / SIGNAL RESTORED</small><h2>관측소, 응답하세요.</h2><p>귀환 경로가 열렸습니다.<br />……이제 집으로 돌아오세요.</p></div>
  </section>;
}
export function HappyCredits() {
  return <>
    <p className="credits-eyebrow">ENDING 04 · THE LIGHT RETURNS</p><h1>돌아온 별빛</h1><p className="credits-subtitle">모든 끝에서 배운, 새로운 시작</p>
    <div className="credits-chapter"><h2>세 번의 기록</h2><p>공급은 재앙을 키웠고,<br />제한을 지우자 현실이 무너졌습니다.<br />아무것도 하지 않으면, 혼자만 살아남았습니다.</p></div>
    <div className="credits-chapter"><h2>네 번째 선택</h2><p>당신은 합성 장치의 흐름을 뒤집었습니다.<br />삼켜진 에너지가 별빛이 되어 돌아왔고,<br />멈춰 있던 비상 추진 장치에 다시 불이 켜졌습니다.</p></div>
    <div className="credits-chapter"><h2>태양계는 무사합니다.</h2><p>이번에는 임무도, 당신도 포기하지 않았습니다.<br />푸른 지구에서 귀환 신호가 도착했습니다.</p></div>
    <div className="credits-chapter"><h2>개발</h2><p>codex와 j</p></div>
    <div className="credits-chapter credits-last"><h2>돌아갈 방법은 없었다.</h2><p>그래서 당신은, 돌아갈 방법을 만들었다.</p><span>WELCOME HOME</span></div>
  </>;
}
