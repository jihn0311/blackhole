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
        아무것도 삼키지 않았기에,
        <br />
        당신은 삼켜지지 않았습니다.
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
          첫 소행성을 부르지 않았고,
          <br />
          어떤 별의 이름도 지우지 않았습니다.
        </p>
      </div>
      <div className="credits-chapter">
        <h2>멀어지는 빛</h2>
        <p>
          끝없는 허기를 채우는 대신
          <br />
          당신은 사건의 지평선에서 물러났습니다.
        </p>
      </div>
      <div className="credits-chapter">
        <h2>아무것도 얻지 않은 사람</h2>
        <p>
          그래서 모든 것을 잃지 않은 사람.
          <br />
          우주는 여전히 그곳에 있습니다.
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
