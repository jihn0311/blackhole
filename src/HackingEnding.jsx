import React, { useEffect, useRef, useState } from "react";
export function HackingEnding() {
  const ref = useRef(null);
  const [message, setMessage] = useState("변조된 기록 발견 · 복구 불가");
  useEffect(() => {
    const canvas = ref.current,
      ctx = canvas.getContext("2d");
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    const start = performance.now();
    let frame;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let previous = -1;
    function draw(now) {
      const elapsed = (now - start) / 1000,
        phase = elapsed < 1.8 ? 0 : elapsed < 4.4 ? 1 : 2;
      if (phase !== previous) {
        previous = phase;
        setMessage(
          [
            "변조된 기록 발견 · 복구 불가",
            "관측 데이터 회수 중…",
            "기록 삭제 완료 · 남은 것은 입력한 코드뿐",
          ][phase],
        );
      }
      ctx.fillStyle = "#000b04";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (elapsed < 5.4) {
        const pull = Math.max(0, Math.min(1, (elapsed - 1.8) / 3.4));
        ctx.font = "15px monospace";
        for (let y = 0; y < canvas.height; y += 27)
          for (let x = 0; x < canvas.width; x += 22) {
            const hash = ((x * 17 + y * 31) % 101) / 101;
            const k = reduced ? 0 : pull * pull;
            ctx.globalAlpha = (1 - pull) * (0.45 + hash * 0.55);
            ctx.fillStyle = hash > 0.85 ? "#c7ffd9" : "#39e977";
            ctx.fillText(
              String((Math.floor(x + y) + Math.floor(now / 160)) % 10),
              x + (canvas.width / 2 - x) * k,
              y + (canvas.height / 2 - y) * k,
            );
          }
        ctx.globalAlpha = 1;
      }
      frame = requestAnimationFrame(draw);
    }
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <div
      className="hacking-ending cheat-terminal"
      role="status"
      aria-label="치트 엔딩 기록 삭제"
    >
      <canvas ref={ref} />
      <div className="cheat-terminal-message">
        <small>JIS / ACCESS REVOKED</small>
        <p>{message}</p>
        <span>_</span>
      </div>
    </div>
  );
}
export function HackingCredits() {
  return (
    <>
      <p className="credits-eyebrow">ENDING 02 · ACCESS VIOLATION</p>
      <h1>변환자</h1>
      <p className="credits-subtitle">
        우주를 삼킨 것은 블랙홀이 아니었습니다.
      </p>
      <div className="credits-chapter">
        <h2>입력한 세 글자</h2>
        <p>jis</p>
        <p>
          기다림은 지워졌고, 숫자는 넘쳐났습니다.
          <br />
          하지만 기록은 당신의 입력을 기억했습니다.
        </p>
      </div>
      <div className="credits-chapter">
        <h2>결과를 고친 대가</h2>
        <p>
          별을 발견하는 대신 값을 바꾸었습니다.
          <br />
          성장을 건너뛰자, 도착할 우주도 사라졌습니다.
        </p>
      </div>
      <div className="credits-chapter">
        <h2>승리 기록: 검증 실패</h2>
        <p>
          400이라는 숫자는 남았습니다.
          <br />
          그곳까지의 여정은 남아 있나요?
        </p>
      </div>
      <div className="credits-chapter">
        <h2>개발</h2>
        <p>codex와 j</p>
      </div>
      <div className="credits-chapter credits-last">
        <h2>이번 결말은 당신이 덮어썼습니다.</h2>
        <p>다음 우주에서는, 과정을 남겨 주세요.</p>
        <span>CONNECTION TERMINATED</span>
      </div>
    </>
  );
}
