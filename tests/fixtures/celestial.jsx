import React from "react";
import { createRoot } from "react-dom/client";
import { Planet } from "../../src/Planet.jsx";
import { bodies } from "../../src/game.js";
import { advanceInfall, drawInfallBody } from "../../src/infall.js";
import "../../src/style.css";
function Preview() {
  const ref = React.useRef();
  React.useEffect(() => {
    const c = ref.current.getContext("2d");
    let frame,
      last = 0,
      particles = [];
    function draw(now) {
      const dt = Math.min(0.04, (now - last) / 1000 || 0.016);
      last = now;
      if (particles.length === 0)
        particles = bodies
          .slice(0, 12)
          .map((body, i) => ({
            body,
            x: 360 + Math.cos((i / 12) * Math.PI * 2) * 290,
            y: 210 + Math.sin((i / 12) * Math.PI * 2) * 175,
          }));
      c.fillStyle = "#080b12";
      c.fillRect(0, 0, 720, 420);
      c.strokeStyle = "#fc965577";
      c.beginPath();
      c.arc(360, 210, 32, 0, Math.PI * 2);
      c.stroke();
      particles = particles.filter((p) => !advanceInfall(p, 360, 210, 32, dt));
      particles.forEach((p) => drawInfallBody(c, p.body, p, 360, 210, 32));
      frame = requestAnimationFrame(draw);
    }
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <canvas ref={ref} width="720" height="420" style={{ maxWidth: "100%" }} />
  );
}
createRoot(document.getElementById("root")).render(
  <div style={{ padding: 32, maxWidth: 1100, margin: "auto" }}>
    <h1>천체 디테일 · 흡수 효과 검사</h1>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(5,1fr)",
        gap: 24,
        margin: "24px 0",
      }}
    >
      {bodies.map((b) => (
        <div
          key={b.id}
          style={{
            textAlign: "center",
            padding: 12,
            background: "#101722",
            borderRadius: 16,
          }}
        >
          <Planet body={b} large />
          <p>{b.name}</p>
        </div>
      ))}
    </div>
    <Preview />
  </div>,
);
