import { AchievementToast } from "../../src/AchievementToast.jsx";
import React, { useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { CosmicEnding } from "../../src/CosmicEnding.jsx";
import { collapseStage, endingReached } from "../../src/collapse.js";
import "../../src/style.css";
function Preview() {
  const [achievement, setAchievement] = useState(false);
  const dismiss = useCallback(() => setAchievement(false), []);
  const [seen, setSeen] = useState(false);
  const [level, setLevel] = useState(299),
    [menu, setMenu] = useState(false);
  return (
    <div
      className="app"
      data-collapse={seen ? 0 : collapseStage(level)}
      inert={!seen && endingReached(level) ? true : undefined}
      style={{
        "--glitch": seen ? 0 : Math.min(10, collapseStage(level)),
        minHeight: "100vh",
        padding: 40,
      }}
    >
      {!seen && (
        <CosmicEnding
          level={level}
          onComplete={() => {
            setSeen(true);
            setAchievement(true);
            setMenu(false);
          }}
        />
      )}
      <AchievementToast visible={achievement} onDismiss={dismiss} />
      <header>
        <h1>EVENT HORIZON · 연출 검사</h1>
      </header>
      <main style={{ display: "block", padding: 40 }}>
        <h2>LEVEL {level}</h2>
        <p>저장 데이터를 사용하지 않는 미리보기입니다.</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {[299, 300, 310, 320, 330, 340, 350, 360, 370, 380, 390, 400].map(
            (n) => (
              <button
                key={n}
                onClick={() => setLevel(n)}
                style={{ padding: 12, border: "1px solid #8692a5" }}
              >
                레벨 {n}
              </button>
            ),
          )}
          <button onClick={() => setMenu(true)}>업그레이드 창 열기</button>
        </div>
        <section
          className="space-panel"
          style={{
            height: 380,
            marginTop: 24,
            display: "grid",
            placeItems: "center",
            background: "radial-gradient(ellipse,#392c43,#080b12 60%)",
          }}
        >
          <h2>관측소 · 시공간 안정성</h2>
        </section>
      </main>
      {menu && (
        <div className="modal-backdrop">
          <section className="modal" role="dialog" aria-label="업그레이드 검사">
            <button onClick={() => setMenu(false)}>닫기</button>
            <h2>업그레이드</h2>
            <p>이 창 위에도 균열과 화면 손상 효과가 표시됩니다.</p>
          </section>
        </div>
      )}
    </div>
  );
}
createRoot(document.getElementById("root")).render(<Preview />);
