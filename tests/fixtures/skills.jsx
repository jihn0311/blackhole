import { bulkUpgrade } from "../../src/bulkUpgrade.js";
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { SkillTree } from "../../src/SkillTree.jsx";
import { fresh, buy } from "../../src/game.js";
import { buyPermanent } from "../../src/prestige.js";
import "../../src/style.css";
function Test() {
  const [state, setState] = useState({ ...fresh(), points: 1000, shards: 100 });
  const [open, setOpen] = useState(true);
  return (
    <main
      style={{
        display: "block",
        maxWidth: 980,
        margin: "20px auto",
        padding: 20,
      }}
    >
      <h1>스킬트리 검사 · 저장되지 않는 테스트</h1>
      <p>
        보유 {state.points} P · 조각 {state.shards}
      </p>
      <button onClick={() => setOpen((v) => !v)}>트리 열기/닫기</button>
      <button onClick={() => setState((s) => ({ ...s, points: 0, shards: 0 }))}>
        잔액 0 검사
      </button>
      {open && (
        <>
          <SkillTree
            state={state}
            onBuy={(id) =>
              setState((s) =>
                id === "__all__" ? bulkUpgrade(s).state : buy(s, id),
              )
            }
          />
          <SkillTree
            permanent
            state={state}
            onBuy={(id) =>
              setState((s) =>
                id === "__all__"
                  ? bulkUpgrade(s, true).state
                  : buyPermanent(s, id),
              )
            }
          />
        </>
      )}
    </main>
  );
}
createRoot(document.getElementById("root")).render(<Test />);
