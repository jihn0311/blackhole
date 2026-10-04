// Shared, deterministic sprites: drawn once per body, reused by icons and particles.
const cache = new Map();
export function celestialSprite(body) {
  if (cache.has(body.id)) return cache.get(body.id);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 512;
  const c = canvas.getContext("2d"),
    R = 76;
  let seed =
    [...body.id].reduce((n, ch) => Math.imul(n, 31) + ch.charCodeAt(0), 7) >>>
    0;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const ellipse = (x, y, rx, ry, color, rotation = 0) => {
    c.fillStyle = color;
    c.beginPath();
    c.ellipse(x, y, rx, ry, rotation, 0, Math.PI * 2);
    c.fill();
  };
  c.scale(2, 2);
  c.translate(128, 128);
  const star = ["sun", "redgiant", "whitedwarf", "neutron"].includes(body.id);
  const rings = ["saturn", "uranus"].includes(body.id);
  function ring(front) {
    c.save();
    c.rotate(body.id === "uranus" ? -1.1 : -0.36);
    const start = front ? 0 : Math.PI,
      end = front ? Math.PI : Math.PI * 2;
    for (let r = 91; r < 125; r += 2) {
      c.beginPath();
      c.ellipse(0, 0, r, r * 0.31, 0, start, end);
      c.strokeStyle =
        body.id === "saturn"
          ? r > 109 && r < 115
            ? "#46392b88"
            : r % 4
              ? "#b3926288"
              : "#eed6a6aa"
          : "#b0ebea55";
      c.lineWidth = 1.5;
      c.stroke();
    }
    c.restore();
  }
  if (star) {
    const glow = c.createRadialGradient(0, 0, 55, 0, 0, 126);
    glow.addColorStop(0, body.color + "aa");
    glow.addColorStop(0.6, body.color + "28");
    glow.addColorStop(1, body.color + "00");
    c.fillStyle = glow;
    c.fillRect(-128, -128, 256, 256);
    if (body.id === "neutron") {
      c.save();
      c.rotate(-0.55);
      const beam = c.createLinearGradient(0, -128, 0, 128);
      beam.addColorStop(0, "#95e5ff00");
      beam.addColorStop(0.5, "#e6fbffcc");
      beam.addColorStop(1, "#95e5ff00");
      c.fillStyle = beam;
      c.beginPath();
      c.moveTo(-10, -125);
      c.lineTo(4, 0);
      c.lineTo(10, 125);
      c.lineTo(-4, 0);
      c.closePath();
      c.fill();
      c.restore();
    }
  }
  if (rings) ring(false);
  c.save();
  c.beginPath();
  if (body.id === "asteroid") {
    for (let i = 0; i < 15; i++) {
      const a = (i * Math.PI * 2) / 15,
        r = R * (0.82 + random() * 0.18);
      const x = Math.cos(a) * r,
        y = Math.sin(a) * r;
      i ? c.lineTo(x, y) : c.moveTo(x, y);
    }
    c.closePath();
  } else c.arc(0, 0, R, 0, Math.PI * 2);
  c.clip();
  c.fillStyle = body.color;
  c.fillRect(-R, -R, R * 2, R * 2);
  const gas = ["jupiter", "saturn", "uranus", "neptune", "venus"].includes(
    body.id,
  );
  if (gas) {
    const palette = {
      jupiter: ["#f0d3aa", "#9b6547", "#dcad80", "#704b3b"],
      saturn: ["#e6d1a5", "#ac9062", "#ccb37f"],
      uranus: ["#b2eeee", "#67b7c5", "#8ed5d6"],
      neptune: ["#3b69bf", "#184c9c", "#6794df"],
      venus: ["#e7c28a", "#b68b50", "#f4dca9"],
    }[body.id];
    for (let y = -R; y < R; y += 4 + random() * 5) {
      c.strokeStyle = palette[Math.floor(random() * palette.length)];
      c.lineWidth = 3 + random() * 7;
      c.beginPath();
      c.moveTo(-R, y);
      c.bezierCurveTo(-25, y - 10, 35, y + 13, R, y + 3);
      c.stroke();
    }
    if (body.id === "jupiter") {
      ellipse(29, 26, 24, 13, "#8d4837", -0.15);
      ellipse(25, 23, 17, 8, "#d8865a", -0.15);
      ellipse(24, 22, 10, 4, "#e7b27f", -0.15);
    }
    if (body.id === "neptune") {
      ellipse(-25, 20, 18, 9, "#143a75", 0.15);
      ellipse(-26, 8, 21, 2, "#d6f5ff99", 0.15);
    }
  } else if (body.id === "earth") {
    c.fillStyle = "#2169b0";
    c.fillRect(-R, -R, R * 2, R * 2);
    const continent = (points, color) => {
      c.fillStyle = color;
      c.beginPath();
      points.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
      c.closePath();
      c.fill();
    };
    continent(
      [
        [-70, -35],
        [-53, -58],
        [-29, -49],
        [-18, -32],
        [-34, -18],
        [-29, -2],
        [-45, 2],
        [-55, -13],
      ],
      "#629e78",
    );
    continent(
      [
        [-34, 2],
        [-12, 7],
        [-4, 25],
        [-18, 47],
        [-31, 63],
        [-37, 29],
      ],
      "#83a76b",
    );
    continent(
      [
        [4, -42],
        [24, -57],
        [57, -44],
        [75, -22],
        [53, -12],
        [36, -24],
        [29, -6],
        [12, -15],
        [-1, -25],
      ],
      "#82a574",
    );
    continent(
      [
        [6, -13],
        [26, -9],
        [33, 13],
        [17, 40],
        [4, 18],
      ],
      "#b5ae79",
    );
    continent(
      [
        [41, 38],
        [63, 31],
        [73, 43],
        [55, 55],
        [39, 49],
      ],
      "#bca575",
    );
    ellipse(0, -72, 45, 10, "#e6faff");
    ellipse(0, 74, 43, 9, "#e6faff");
    for (let i = 0; i < 16; i++) {
      c.strokeStyle = "#ffffff99";
      c.lineWidth = 2 + random() * 2;
      c.beginPath();
      const x = random() * 130 - 65,
        y = random() * 125 - 62;
      c.moveTo(x, y);
      c.quadraticCurveTo(x + 12, y - 5, x + 30, y + 4);
      c.stroke();
    }
  } else if (star) {
    for (let i = 0; i < 480; i++) {
      const x = random() * R * 2 - R,
        y = random() * R * 2 - R;
      ellipse(
        x,
        y,
        random() * 4 + 1,
        random() * 2 + 1,
        i % 3 === 0 ? "#fff7d655" : "#6a190c25",
      );
    }
    if (body.id === "sun" || body.id === "redgiant") {
      ellipse(-25, 15, 7, 4, "#71332199");
      ellipse(-15, 19, 3, 2, "#562216aa");
    }
  } else {
    for (let i = 0; i < 34; i++) {
      const x = random() * R * 2 - R,
        y = random() * R * 2 - R,
        r = 3 + random() * 13;
      ellipse(x, y, r, r * 0.85, "#221e283f");
      ellipse(x + 1.5, y + 2, r * 0.83, r * 0.68, "#e9dcc31f");
      ellipse(x - 1, y - 2, r * 0.66, r * 0.56, "#26263355");
    }
    if (body.id === "mars") {
      ellipse(9, -68, 24, 11, "#eee2ca");
      c.strokeStyle = "#693b2b88";
      c.lineWidth = 5;
      c.beginPath();
      c.moveTo(-49, 15);
      c.bezierCurveTo(-14, 3, 10, 27, 53, 14);
      c.stroke();
    }
    if (body.id === "pluto") {
      ellipse(14, 2, 17, 22, "#efdbbf", -0.5);
      ellipse(31, -6, 17, 20, "#efdbbf", 0.5);
    }
  }
  // Fine curved cloud filaments and relief follow the spherical surface.
  if (gas) {
    for (let i = 0; i < 70; i++) {
      const y = random() * 144 - 72;
      const width = Math.sqrt(R * R - y * y);
      c.strokeStyle = i % 3 ? "#fff4dd24" : "#18233830";
      c.lineWidth = 0.35 + random() * 1.2;
      c.beginPath();
      c.moveTo(-width, y);
      c.bezierCurveTo(-width * 0.4, y - 5, width * 0.5, y + 7, width, y);
      c.stroke();
    }
  }
  if (!gas && !star && body.id !== "earth") {
    for (let i = 0; i < 85; i++) {
      const x = random() * 148 - 74,
        y = random() * 148 - 74,
        radius = 1 + random() * 3;
      c.beginPath();
      c.ellipse(x, y, radius, radius * 0.65, 0, Math.PI, Math.PI * 2);
      c.strokeStyle = "#fff4dc55";
      c.lineWidth = 0.65;
      c.stroke();
    }
  }
  // Subtle grain remains fixed to each body, avoiding noise flicker in motion.
  for (let i = 0; i < 250; i++)
    ellipse(
      random() * 152 - 76,
      random() * 152 - 76,
      0.5 + random(),
      0.5 + random(),
      i % 2 ? "#ffffff18" : "#00000016",
    );
  const shade = c.createRadialGradient(-29, -33, 7, 14, 12, 105);
  shade.addColorStop(0, star ? "#ffffff77" : "#ffffff45");
  shade.addColorStop(0.45, "#00000000");
  shade.addColorStop(0.8, star ? "#45201544" : "#03081899");
  shade.addColorStop(1, star ? "#48201988" : "#01040bf5");
  c.fillStyle = shade;
  c.fillRect(-R, -R, R * 2, R * 2);
  c.restore();
  if (body.id !== "asteroid") {
    c.beginPath();
    c.arc(0, 0, R - 0.5, 0, Math.PI * 2);
    c.strokeStyle = body.id === "earth" ? "#74d8ff99" : "#ffffff25";
    c.lineWidth = body.id === "earth" ? 2 : 1;
    c.stroke();
  }
  if (["earth", "venus", "neptune", "uranus"].includes(body.id)) {
    c.save();
    const atmosphere = c.createRadialGradient(0, 0, R - 2, 0, 0, R + 7);
    atmosphere.addColorStop(0, "#8adfff00");
    atmosphere.addColorStop(
      0.3,
      body.id === "venus" ? "#fbdc9540" : "#75cbff55",
    );
    atmosphere.addColorStop(1, "#8adfff00");
    c.fillStyle = atmosphere;
    c.beginPath();
    c.arc(0, 0, R + 7, 0, Math.PI * 2);
    c.fill();
    c.restore();
  }
  if (rings) ring(true);
  const result = { canvas, url: canvas.toDataURL("image/png") };
  cache.set(body.id, result);
  return result;
}
