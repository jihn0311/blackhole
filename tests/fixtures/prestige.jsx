// Isolated UI fixture: no localStorage access, and not included in the production build.
import { bulkUpgrade } from "../../src/bulkUpgrade.js";
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { PrestigePanel } from "../../src/PrestigePanel.jsx";
import {
  fresh,
  upgrades,
  baseBodies,
  holdUnlocked,
  discovered,
} from "../../src/game.js";
import { rebirth, buyPermanent } from "../../src/prestige.js";
import "../../src/style.css";
function Fixture() {
  const [state, setState] = useState(() => ({
    ...fresh(),
    mass: 100000,
    points: 137,
    counts: Object.fromEntries(baseBodies.map((b) => [b.id, 3])),
    upgrades: Object.fromEntries(upgrades.map((u) => [u.id, u.max])),
  }));
  const [open, setOpen] = useState(true);
  return (
    <>
      <button onClick={() => setOpen(true)}>환생 화면 열기</button>
      <output data-testid="result">
        질량 {state.mass} · 포인트 {state.points} · 환생 {state.rebirths} · 조각{" "}
        {state.shards} · 도감 {discovered(state)} · 연속 생성{" "}
        {holdUnlocked(state) ? "유지" : "잠김"} · 영구 질량{" "}
        {state.permanent.mass}
      </output>
      {open && (
        <PrestigePanel
          state={state}
          onClose={() => setOpen(false)}
          onBuy={(id) =>
            setState((s) =>
              id === "__all__"
                ? bulkUpgrade(s, true).state
                : buyPermanent(s, id),
            )
          }
          onRebirth={() => {
            setState(rebirth);
            setOpen(false);
          }}
        />
      )}
    </>
  );
}
createRoot(document.getElementById("root")).render(<Fixture />);
