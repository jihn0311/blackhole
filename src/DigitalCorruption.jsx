import React, { useEffect, useRef } from "react";
// The overlay never intercepts input or changes accessible control names.
export function DigitalCorruption({ stage, onBurst }) {
  const ref = useRef(null),
    progress = useRef(stage),
    burst = useRef(onBurst);
  burst.current = onBurst;
  progress.current = stage;
  useEffect(() => {
    const canvas = ref.current,
      ctx = canvas.getContext("2d");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const records = new WeakMap();
    let serial = 0,
      frame,
      last = 0;
    function draw(now) {
      frame = requestAnimationFrame(draw);
      if (now - last < (reduced ? 200 : 32)) return;
      last = now;
      if (canvas.width !== innerWidth || canvas.height !== innerHeight) {
        canvas.width = innerWidth;
        canvas.height = innerHeight;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const targets = document.querySelectorAll(
        "#root > .app button, #root > .app .planet, #root > .app .black-hole-animation, #root > .app .header-status, #root > .app h2, #root > .app h3",
      );
      const tick = Math.floor(now / (reduced ? 1500 : 220));
      targets.forEach((el) => {
        let record = records.get(el);
        if (!record) {
          const id = serial++;
          record = {
            id,
            threshold: ((id * 7) % 10) + 1,
            start: null,
            angle: Math.random() * Math.PI * 2,
          };
          records.set(el, record);
        }
        const r = el.getBoundingClientRect();
        if (
          !r.width ||
          !r.height ||
          r.bottom < 0 ||
          r.top > innerHeight ||
          record.threshold > progress.current
        )
          return;
        if (record.start === null) {
          record.start = now;
          burst.current?.();
          record.label = el.textContent.trim().slice(0, 24);
          record.image = el.tagName === "IMG" ? el : el.querySelector("img");
        }
        const t = reduced ? 1 : Math.min(1, (now - record.start) / 2400),
          ease = 1 - (1 - t) ** 3;
        ctx.save();
        ctx.beginPath();
        ctx.rect(r.x, r.y, r.width, r.height);
        ctx.clip();
        // The tear travels across the surface before its curled edges open fully.
        const upper = [],
          lower = [];
        const tangent = [Math.cos(record.angle), Math.sin(record.angle)];
        const normal = [-tangent[1], tangent[0]];
        const along =
          Math.abs(tangent[0]) * r.width + Math.abs(tangent[1]) * r.height;
        const across =
          Math.abs(normal[0]) * r.width + Math.abs(normal[1]) * r.height;
        const project = (u, offset) => [
          r.x +
            r.width / 2 +
            tangent[0] * (u - 0.5) * along +
            normal[0] * offset,
          r.y +
            r.height / 2 +
            tangent[1] * (u - 0.5) * along +
            normal[1] * offset,
        ];
        for (let j = 0; j <= 20; j++) {
          const u = j / 20;
          const local = reduced
            ? 1
            : Math.max(0, Math.min(1, (t - u * 0.38) / 0.62));
          const opening = local * local * (3 - 2 * local);
          const jag =
            (Math.sin(j * 2.7 + record.id) * 0.6 + (j % 2 ? 0.4 : -0.4)) *
            Math.min(13, across * 0.24) *
            (1 - opening);
          const middle = across * (-0.02 + 0.06 * Math.sin(u * 5)) + jag;
          const gap = across * 0.72 * opening;
          upper.push(project(u, middle - gap));
          lower.push(project(u, middle + gap));
        }
        ctx.beginPath();
        upper.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        [...lower].reverse().forEach(([x, y]) => ctx.lineTo(x, y));
        ctx.closePath();
        ctx.clip();
        ctx.fillStyle = "#001207";
        ctx.fillRect(r.x, r.y, r.width, r.height);
        ctx.font = "bold 13px monospace";
        ctx.fillStyle = "#58fa91";
        for (let y = r.y + 15; y < r.bottom; y += 17)
          for (let x = r.x + 4; x < r.right; x += 11)
            ctx.fillText(
              String(
                (Math.floor(x / 11) +
                  Math.floor(y / 17) * 3 +
                  tick +
                  record.id) %
                  10,
              ),
              x,
              y,
            );
        ctx.restore();
        if (t > 0 && t < 1) {
          ctx.save();
          ctx.beginPath();
          ctx.rect(r.x, r.y, r.width, r.height);
          ctx.clip();
          // Shadow under each lip and a fine highlight make the old skin feel raised.
          for (const [edge, direction] of [
            [upper, -1],
            [lower, 1],
          ]) {
            ctx.beginPath();
            edge.forEach(([x, y], i) =>
              i ? ctx.lineTo(x, y) : ctx.moveTo(x, y),
            );
            ctx.strokeStyle = "rgba(0,0,0,.85)";
            ctx.lineWidth = 9 * (1 - t) + 2;
            ctx.stroke();
            ctx.beginPath();
            edge.forEach(([x, y], i) =>
              i
                ? ctx.lineTo(
                    x + normal[0] * direction * 3,
                    y + normal[1] * direction * 3,
                  )
                : ctx.moveTo(
                    x + normal[0] * direction * 3,
                    y + normal[1] * direction * 3,
                  ),
            );
            ctx.strokeStyle = "rgba(165,204,192," + 0.7 * (1 - t) + ")";
            ctx.lineWidth = 2;
            ctx.stroke();
          }
          ctx.restore();
        }
        if (t <= 0 || t >= 1) return;
        // Expanding shock ring and radial debris make each rupture legible.
        const cx = r.x + r.width / 2,
          cy = r.y + r.height / 2;
        const radius = Math.min(140, Math.max(45, r.width * 0.4)) * ease;
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - t * 4) * 0.55;
        ctx.strokeStyle = "#a0ffd1";
        ctx.lineWidth = 4 * (1 - t) + 1;
        ctx.beginPath();
        ctx.ellipse(cx, cy, radius, radius * 0.7, 0, 0, Math.PI * 2);
        ctx.stroke();
        const glow = ctx.createRadialGradient(
          cx,
          cy,
          0,
          cx,
          cy,
          Math.max(1, radius),
        );
        glow.addColorStop(0, "#baffcf66");
        glow.addColorStop(1, "#39ff8700");
        ctx.fillStyle = glow;
        ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
        for (let spark = 0; spark < 18; spark++) {
          const angle = (spark * Math.PI * 2) / 18 + record.id,
            distance = (35 + (spark % 5) * 16) * ease;
          const x = cx + Math.cos(angle) * distance,
            y = cy + Math.sin(angle) * distance + t * t * 60;
          ctx.strokeStyle = spark % 3 ? "#5effa3" : "#e8fff0";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(
            x - Math.cos(angle) * 12 * (1 - t),
            y - Math.sin(angle) * 12 * (1 - t),
          );
          ctx.stroke();
        }
        ctx.restore();
        // Pieces of the former surface burst outward and fall away.
        for (let k = 0; k < 14; k++) {
          const w = r.width / 14,
            origin = r.x + k * w,
            direction = k % 2 ? 1 : -1;
          const dx = (k - 6.5) * t * 22,
            dy = direction * Math.sin(t * Math.PI * 0.6) * 85 + t * t * 135;
          ctx.save();
          ctx.globalAlpha = (1 - t) * 0.85;
          ctx.translate(origin + w / 2 + dx, r.y + r.height / 2 + dy);
          ctx.rotate(direction * t * 2.4);
          ctx.beginPath();
          ctx.moveTo(-w / 2, -8);
          ctx.lineTo(w / 2, -4);
          ctx.lineTo(w * 0.3, 9);
          ctx.lineTo(-w / 2, 5);
          ctx.closePath();
          ctx.clip();
          ctx.fillStyle = "#233744";
          ctx.fillRect(-w / 2, -9, w, 19);
          if (record.image?.complete && record.image.naturalWidth) {
            const image = record.image;
            ctx.drawImage(
              image,
              (k * image.naturalWidth) / 8,
              0,
              image.naturalWidth / 14,
              image.naturalHeight,
              -w / 2,
              -9,
              w,
              18,
            );
          } else {
            ctx.fillStyle = "#c4d3df";
            ctx.font = "12px sans-serif";
            ctx.fillText(record.label, -w / 2 - k * w, 4);
          }
          ctx.restore();
        }
        ctx.save();
        ctx.globalAlpha = Math.sin(Math.PI * t) * (1 - t);
        ctx.strokeStyle = "#a3ffc0";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(r.x, r.y + r.height / 2);
        ctx.lineTo(r.right, r.y + r.height / 2);
        ctx.stroke();
        ctx.restore();
      });
    }
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <div className="digital-corruption" aria-hidden="true">
      <canvas ref={ref} />
      <div className="digital-corruption-status">
        DATA OVERRIDE · {Math.min(100, stage * 10)}%<br />
        관측 인터페이스 변환 중
      </div>
    </div>
  );
}
