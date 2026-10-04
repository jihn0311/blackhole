import React, { useLayoutEffect, useRef } from "react";
import { edges, polygons } from "./fractureGeometry.js";
export function FinalShatter() {
  const fragments = useRef(null);
  useLayoutEffect(() => {
    const source = document.querySelector("#root > .app");
    if (!source) return;
    const originals = [...source.querySelectorAll("canvas")];
    const images = [...source.querySelectorAll("img")];
    const holders = [...fragments.current.children];
    holders.forEach((holder) => {
      const clone = source.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      clone.inert = true;
      clone.classList.add("frozen-shatter-screen");
      clone.style.width = `${source.getBoundingClientRect().width}px`;
      clone.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));
      clone.querySelectorAll("canvas").forEach((canvas, i) => {
        canvas.getContext("2d")?.drawImage(originals[i], 0, 0);
      });
      // Freeze animated GIFs so each fragment contains the same captured frame.
      clone.querySelectorAll("img").forEach((img, i) => {
        const original = images[i];
        if (!original.complete || !original.naturalWidth) return;
        const canvas = document.createElement("canvas");
        canvas.width = original.naturalWidth;
        canvas.height = original.naturalHeight;
        canvas.className = img.className;
        canvas.style.cssText = img.style.cssText;
        canvas.getContext("2d").drawImage(original, 0, 0);
        img.replaceWith(canvas);
      });
      holder.querySelector('.glass-face').appendChild(clone);
    });
    return () => holders.forEach((holder) => holder.querySelector('.glass-face').replaceChildren());
  }, []);
  return (
    <div
      className="final-shatter screen-shatter"
      role="status"
      aria-label="우주가 산산이 무너지고 있습니다"
    >
      <div className="screen-fragments" ref={fragments} aria-hidden="true">
        {polygons.map((points, i) => (
          <div
            className="screen-fragment"
            key={i}
            style={{
              "--shape": `polygon(${points.map(([x, y]) => `${x}% ${y}%`).join(",")})`,
              "--tilt-x": `${(i % 2 ? 1 : -1) * (24 + i % 5 * 7)}deg`,
              "--tilt-y": `${(i % 3 ? 1 : -1) * (18 + i % 7 * 6)}deg`,
              "--depth": `${-100 + (i % 5) * 55}px`,
              "--dx": `${((i % 7) - 3) * 18}px`,
              "--duration": `${4.6 + (i % 5) * 0.16}s`,
              transformOrigin: `${points.reduce((n, p) => n + p[0], 0) / points.length}% ${points.reduce((n, p) => n + p[1], 0) / points.length}%`,
              "--turn": `${(i % 2 ? 1 : -1) * (5 + (i % 7))}deg`,
              "--delay": `${0.55 + (i % 6) * 0.13}s`,
            }}
          >
            <div className="glass-back" />
            {points.map(([x, y], edge) => {
              const next = points[(edge + 1) % points.length];
              const dx = (next[0] - x) * window.innerWidth / 100;
              const dy = (next[1] - y) * window.innerHeight / 100;
              return <span key={edge} className="glass-edge" style={{
                left: `${x}%`, top: `${y}%`, width: Math.hypot(dx, dy),
                transform: `rotateZ(${Math.atan2(dy, dx)}rad) rotateX(-90deg)`,
              }} />;
            })}
            <div className="glass-face" />
            <div className="glass-reflection" />
            <svg className="glass-bevel" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polygon points={points.map(p => p.join(',')).join(' ')} />
            </svg>
          </div>
        ))}
      </div>
      <svg
        className="final-fractures"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {edges.map((points, i) => (
          <path
            key={i}
            d={points.map(([x, y], j) => `${j ? "L" : "M"}${x} ${y}`).join(" ")}
          />
        ))}
      </svg>
      <div className="shatter-darkness" />
    </div>
  );
}
