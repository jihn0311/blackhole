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
        <small>OVERRIDE / ACCESS REVOKED</small>
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
        <h2>열어 버린 보호 덮개</h2>
        <p>SAFETY OVERRIDE</p>
        <p>
          빨간 버튼은 합성 장치의 안전 제한을 해제했습니다.
          <br />
          당신은 경고보다 빠른 성장을 선택했습니다.
        </p>
      </div>
      <div className="credits-chapter">
        <h2>결과를 고친 대가</h2>
        <p>
          장치는 인공 천체와 현실을 구분하지 못했습니다.
          <br />
          관측소와 당신마저 합성 가능한 데이터가 되었습니다.
        </p>
      </div>
      <div className="credits-chapter">
        <h2>변환 대상: 운용자</h2>
        <p>
          초록색 숫자 사이에 당신의 기록이 남았습니다.
          <br />
          제한을 지운 대가로, 돌아갈 현실을 잃었습니다.
        </p>
      </div>
      <div className="credits-chapter">
        <h2>개발</h2>
        <p>codex와 j</p>
      </div>
      <div className="credits-chapter credits-last">
        <h2>이번 결말은 당신이 덮어썼습니다.</h2>
        <p>다음 우주에서는, 경고에 귀를 기울여 주세요.</p>
        <span>CONNECTION TERMINATED</span>
      </div>
    </>
  );
}
