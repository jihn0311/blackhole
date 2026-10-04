import { celestialSprite } from "./celestialSprites.js";
export function drawInfallBody(ctx, body, particle, cx, cy, horizon) {
  const dx = cx - particle.x,
    dy = cy - particle.y;
  const distance = Math.hypot(dx, dy);
  const pull = Math.max(
    0,
    Math.min(1, 1 - (distance - horizon * 0.75) / (horizon * 3 + 65)),
  );
  const shrink = Math.max(
    0.12,
    Math.min(1, (distance - horizon * 0.65) / (horizon * 0.85 + 12)),
  );
  const diameter = (body.size * 256) / 76;
  const trail = particle.trail || [];
  ctx.save();
  if (pull > 0.05 && trail.length > 1) {
    ctx.lineCap = "round";
    for (let i = 1; i < trail.length; i++) {
      ctx.globalAlpha = (i / trail.length) * pull * 0.28;
      ctx.strokeStyle = body.color;
      ctx.lineWidth = Math.max(
        1,
        body.size * 0.4 * (i / trail.length) * shrink,
      );
      ctx.beginPath();
      ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
      ctx.lineTo(trail[i].x, trail[i].y);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = Math.min(1, shrink * 1.7);
  ctx.translate(particle.x, particle.y);
  ctx.rotate(Math.atan2(dy, dx));
  ctx.scale((1 + pull * 1.8) * shrink, (1 - pull * 0.65) * shrink);
  ctx.drawImage(
    celestialSprite(body).canvas,
    -diameter / 2,
    -diameter / 2,
    diameter,
    diameter,
  );
  ctx.restore();
}
export function advanceInfall(particle, cx, cy, horizon, dt) {
  const dx = cx - particle.x,
    dy = cy - particle.y,
    dist = Math.hypot(dx, dy);
  const pull = Math.max(0, 1 - dist / (horizon * 4 + 100));
  const speed = 65 + 260 / (dist / 70 + 1) + pull * 90;
  const orbit = 0.13 + pull * 0.8;
  particle.trail ||= [];
  particle.trail.push({ x: particle.x, y: particle.y });
  if (particle.trail.length > 12) particle.trail.shift();
  particle.x += ((dx / Math.max(dist, 1)) * speed - dy * orbit) * dt;
  particle.y += ((dy / Math.max(dist, 1)) * speed + dx * orbit) * dt;
  return dist < horizon * 0.75;
}
