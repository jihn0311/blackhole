import React from "react";
import blackHole from "./assets/black-hole.gif";
export function SurvivorEscape() {
  return (
    <div
      className="survivor-escape"
      role="status"
      aria-label="블랙홀에서 멀어지고 있습니다"
    >
      <div className="escape-stars">
        {Array.from({ length: 90 }, (_, i) => (
          <i
            key={i}
            style={{
              left: `${(i * 73) % 100}%`,
              top: `${(i * 37) % 100}%`,
              opacity: 0.25 + (i % 5) * 0.14,
            }}
          />
        ))}
      </div>
      <img
        src={blackHole}
        className="escaping-hole"
        alt="점점 멀어지는 블랙홀"
      />
      <p>
        공급 명령 미입력 · 비상 철수 개시
        <br />
        관측소가 사건의 지평선에서 벗어납니다.
      </p>
    </div>
  );
}
export function SurvivorCredits() {
  return (
    <>
      <p className="credits-eyebrow">ENDING 03 · BEYOND THE HORIZON</p>
      <h1>생존자</h1>
      <p className="credits-subtitle">가장 조용한 선택</p>
      <div className="credits-chapter">
        <h2>당신은 기다렸습니다.</h2>
        <p>
          당신은 첫 인공 천체를 공급하지 않았고,
          <br />
          2분 뒤 비상 철수 장치가 작동했습니다.
        </p>
      </div>
      <div className="credits-chapter">
        <h2>멀어지는 빛</h2>
        <p>
          공급 임무를 끝내 수행하지 않은 채
          <br />
          당신은 사건의 지평선에서 물러났습니다.
        </p>
      </div>
      <div className="credits-chapter">
        <h2>임무는 미완료로 남았습니다.</h2>
        <p>
          당신은 살아남았습니다.
          <br />
          하지만 태양계의 운명은 알 수 없습니다.
        </p>
      </div>
      <div className="credits-chapter">
        <h2>개발</h2>
        <p>codex와 j</p>
      </div>
      <div className="credits-chapter credits-last">
        <h2>당신은 살아남았습니다.</h2>
        <p>이제, 당신의 우주로 돌아가세요.</p>
        <span>THE SURVIVOR</span>
      </div>
    </>
  );
}
