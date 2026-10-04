import React, { useState, useRef, useLayoutEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { bodies, skillNodes, ownsSkill } from "./game.js";
import { permanentNodes } from "./skillData.js";
import { verticalLayout, visibleSkills } from "./skillPresentation.js";
import { bulkUpgrade } from "./bulkUpgrade.js";
const savedZoom = { normal: 0.75, permanent: 0.85 };
import { Planet } from "./Planet.jsx";
const themes = ["moon", "earth", "sun", "jupiter", "mercury", "saturn", "redgiant", "neptune"];
const colors = ["#82dbac", "#9ee38c", "#72dfca", "#73cdff", "#84b3ff", "#a8a0ff", "#c797ff", "#f4a1d3", "#ffabb6", "#ffd078", "#ffb075", "#ff956d"];
export function SkillTree({ state, permanent = false, onBuy }) {
  const bulk = useMemo(() => bulkUpgrade(state, permanent), [state, permanent]);
  const tooltipRef = useRef(null);
  const nodes = permanent ? permanentNodes : skillNodes;
  const layout = verticalLayout(nodes, permanent);
  const owned = (id) =>
    permanent ? state.permanentSkills?.[id] === true : ownsSkill(state, id);
  const visible = visibleSkills(nodes, owned);
  const viewKey = permanent ? "permanent" : "normal";
  const unit = permanent ? "조각" : "P",
    balance = permanent ? state.shards : state.points;
  const viewport = useRef(null),
    drag = useRef(null),
    pendingCenter = useRef({ x: layout.center, y: 200 });
  const [dimensions, setDimensions] = useState({ width: 600, height: 520 });
  const [zoom, updateZoom] = useState(() => savedZoom[viewKey]),
    [tip, setTip] = useState(null),
    [selected, setSelected] = useState(null);
  const setZoom = (value) => {
    savedZoom[viewKey] = value;
    updateZoom(value);
  };
  const fit = Math.min(
    dimensions.width / layout.size,
    dimensions.height / layout.size,
  );
  const scale = zoom ?? fit;
  const size = layout.size * scale,
    padX = Math.max(0, (dimensions.width - size) / 2),
    padY = Math.max(0, (dimensions.height - size) / 2);
  useLayoutEffect(() => {
    const el = viewport.current;
    const observer = new ResizeObserver(() =>
      setDimensions({ width: el.clientWidth, height: el.clientHeight }),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  useLayoutEffect(() => {
    const el = viewport.current,
      c = pendingCenter.current;
    if (c) {
      el.scrollLeft = c.x * scale + padX - el.clientWidth / 2;
      el.scrollTop = c.y * scale + padY - el.clientHeight / 2;
      pendingCenter.current = null;
    }
  }, [scale, padX, padY]);
  function changeZoom(value) {
    const el = viewport.current;
    pendingCenter.current = {
      x: (el.scrollLeft + el.clientWidth / 2 - padX) / scale,
      y: (el.scrollTop + el.clientHeight / 2 - padY) / scale,
    };
    setZoom(Math.min(1.5, Math.max(fit, value)));
    setTip(null);
  }
  function fitAll() {
    pendingCenter.current = { x: layout.center, y: layout.center };
    setZoom(null);
    setTip(null);
  }
  function showTip(e, n) {
    const r = e.currentTarget.getBoundingClientRect();
    setTip({ id: n.id, rect: r, x: 8, y: 8 });
  }
  useLayoutEffect(() => {
    if (!tip || !tooltipRef.current) return;
    const box = tooltipRef.current.getBoundingClientRect(),
      r = tip.rect;
    const margin = 12,
      vw = window.innerWidth,
      vh = window.innerHeight;
    let x, y;
    if (r.right + margin + box.width <= vw - 8) {
      x = r.right + margin;
      y = Math.max(8, Math.min(vh - box.height - 8, r.top));
    } else if (r.left - margin - box.width >= 8) {
      x = r.left - margin - box.width;
      y = Math.max(8, Math.min(vh - box.height - 8, r.top));
    } else {
      x = Math.max(8, Math.min(vw - box.width - 8, r.left));
      y =
        r.top - margin >= box.height + 8
          ? r.top - margin - box.height
          : r.bottom + margin;
    }
    if (tip.x !== x || tip.y !== y) setTip({ ...tip, x, y });
  }, [tip, state.points, state.shards]);
  const tipNode = nodes.find((n) => n.id === tip?.id);
  function status(n) {
    const missing = n.requires.filter((id) => !owned(id));
    return owned(n.id)
      ? "습득 완료"
      : missing.length
        ? "선행 스킬: " +
          missing.map((id) => nodes.find((p) => p.id === id).name).join(" · ")
        : balance < n.cost
          ? `${n.cost - balance} ${unit} 부족`
          : "구매 가능";
  }
  return (
    <div className={`skill-tree radial-tree simple-tree ${permanent ? "eternal" : ""}`}>
      <div className="tree-summary">
        <strong>{permanent ? "영구 스킬트리" : "성장 스킬트리"}</strong>
        <span>
          {nodes.filter((n) => owned(n.id)).length} / {nodes.length} 습득 · 보유{" "}
          <b className="tree-wallet">
            {balance.toLocaleString()} {unit}
          </b>
        </span>
      </div>
      <div className="tree-toolbar" aria-label="스킬트리 확대 축소">
        <button
          aria-label="스킬트리 축소"
          disabled={scale <= fit + 0.001}
          onClick={() => changeZoom(scale / 1.35)}
        >
          −
        </button>
        <input
          aria-label="스킬트리 배율"
          type="range"
          min={Math.round(fit * 100)}
          max="150"
          value={Math.round(scale * 100)}
          onChange={(e) => changeZoom(Number(e.target.value) / 100)}
        />
        <button
          aria-label="스킬트리 확대"
          disabled={scale >= 1.5}
          onClick={() => changeZoom(scale * 1.35)}
        >
          ＋
        </button>
        <output>{Math.round(scale * 100)}%</output>
        <button onClick={fitAll}>전체 보기</button>
      </div>
      <div
        className="radial-viewport"
        ref={viewport}
        tabIndex={0}
        role="region"
        aria-label={permanent ? "영구 스킬 연결도" : "80개 성장 스킬 연결도"}
        onScroll={() => setTip(null)}
        onDragStart={(e) => e.preventDefault()}
        onPointerDown={(e) => {
          if (e.button !== 0 || e.target.closest("button")) return;
          e.preventDefault();
          drag.current = {
            x: e.clientX,
            y: e.clientY,
            left: e.currentTarget.scrollLeft,
            top: e.currentTarget.scrollTop,
          };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          e.currentTarget.scrollLeft =
            drag.current.left + drag.current.x - e.clientX;
          e.currentTarget.scrollTop =
            drag.current.top + drag.current.y - e.clientY;
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
        onLostPointerCapture={() => (drag.current = null)}
      >
        <div
          style={{
            width: Math.max(dimensions.width, size),
            height: Math.max(dimensions.height, size),
            position: "relative",
          }}
        >
          <div
            className="radial-board"
            style={{
              width: layout.size,
              height: layout.size,
              transform: `translate(${padX}px,${padY}px) scale(${scale})`,
            }}
          >
            <svg width={layout.size} height={layout.size} aria-hidden="true">
              {visible.flatMap((n) =>
                n.requires.map((id) => {
                  const a = layout.positions[id],
                    b = layout.positions[n.id];
                  return (
                    <path
                      key={id + n.id}
                      d={`M ${a.x} ${a.y} V ${(a.y + b.y) / 2} H ${b.x} V ${b.y}`}
                      className={owned(id) ? "active" : ""}
                    />
                  );
                }),
              )}
            </svg>
            {visible.map((n) => {
              const done = owned(n.id),
                ready = n.requires.every(owned),
                p = layout.positions[n.id];
              return (
                <article
                  key={n.id}
                  className={`radial-node ${done ? "learned" : ready ? "available" : "locked"} ${selected === n.id ? "selected" : ""}`}
                  style={{ left: p.x, top: p.y, "--stage-color": colors[Math.min(11, permanent ? n.row * 2 : n.tier - 1)] }}
                  onPointerEnter={(e) => showTip(e, n)}
                  onPointerLeave={() => setTip(null)}
                  onFocus={(e) => showTip(e, n)}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget))
                      setTip(null);
                  }}
                >
                  <button
                    className="celestial-skill"
                    aria-label={n.name + " · " + status(n)}
                    aria-describedby={tip?.id === n.id ? "skill-tooltip" : undefined}
                    aria-disabled={done || !ready || balance < n.cost}
                    onClick={() => {
                      setSelected(n.id);
                      if (!done && ready && balance >= n.cost) onBuy(n.id);
                    }}
                  >
                    <Planet body={bodies.find(b => b.id === themes[n.col % themes.length])} />
                    <span className="skill-stage">{permanent ? n.row + 1 : n.tier}단계</span>
                    <strong>{n.name}</strong>
                    <span className={!done && balance < n.cost ? "unaffordable-text skill-cost" : "skill-cost"}>
                      {done ? "✓ 완료" : n.cost.toLocaleString() + " " + unit}
                    </span>
                  </button>
                </article>
              );
            })}
          </div>
        </div>
      </div>
      <div className="bulk-upgrade">
        <button
          disabled={!bulk.count}
          onClick={() => {
            onBuy("__all__");
            setTip(null);
          }}
        >
          일괄 강화 · {bulk.count}개 / {bulk.spent.toLocaleString()} {unit}
        </button>
        <small>
          선행 조건을 만족하는 스킬부터 저렴한 순서로 구매
          {permanent ? " · 반복 심화는 제외" : ""}
        </small>
      </div>
      <p className="tree-help">스킬은 위에서 아래로 성장합니다. 스킬에 커서를 올리면 효과와 누적 보너스, 구매 조건을 확인할 수 있고, 카드를 눌러 각각 강화할 수 있어요. ＋ / − 또는 배율 슬라이더로 확대·축소하고, 빈 공간을 드래그하여 이동하세요.</p>
      {!permanent && <div className="tree-milestones restored-explanations"><p>자동 생성: 강화 {nodes.filter(n => owned(n.id)).length}/80개 · 40개를 강화하면 1초마다 각 천체의 쿨타임이 끝났는지 확인해 자동 소환합니다. 60개부터는 1초 간격 없이 각 천체의 쿨타임이 끝나는 즉시 자동 소환합니다.</p><div className="overdrive-goal">✦ 80개 풀강 보상 · 특이점 폭주<span>흡수 질량 ×10 · 생성 속도 ×2 (최소 쿨타임 0.12초) · 레벨업 포인트 ×3 · 환생 전까지 유지</span></div></div>}
      {tipNode &&
        createPortal(
          <div
            ref={tooltipRef}
            id="skill-tooltip"
            role="tooltip"
            className="skill-tooltip"
            style={{ left: tip.x, top: tip.y }}
          >
            <strong
              className={
                !owned(tipNode.id) && balance < tipNode.cost
                  ? "unaffordable-text"
                  : ""
              }
            >
              {tipNode.name} · {tipNode.cost} {unit}
            </strong>
            <p>{tipNode.description}</p>
            <small>{status(tipNode)}</small>
          </div>,
          document.body,
        )}
      {permanent && (state.permanent.mass > 0 || state.permanent.time > 0) && (
        <p className="tree-help">
          이전 영구 강화 유지 중: 질량 {state.permanent.mass}단계 · 시간{" "}
          {state.permanent.time}단계
        </p>
      )}
    </div>
  );
}
