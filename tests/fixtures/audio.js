import { createSoundEngine } from "../../src/audio.js";
const engine = createSoundEngine();
const output = document.querySelector("#result");
for (const kind of ["spawn", "rebirth"])
  document.getElementById(kind).onclick = () => {
    engine.unlock();
    const played = kind === "spawn" ? engine.playSpawn() : engine.playRebirth();
    output.textContent = kind + ": " + (played ? "재생 시작" : "재생 대기");
  };
document.querySelector("#mute").onclick = () => {
  engine.setEnabled(!engine.enabled);
  output.textContent = engine.enabled ? "소리 켜짐" : "음소거 켜짐";
};
document.querySelector("#render").onclick = async () => {
  output.textContent = "분석 중";
  const result = {};
  for (const kind of ["spawn", "rebirth"]) {
    const duration = kind === "spawn" ? 1 : 6;
    const ctx = new OfflineAudioContext(2, 48000 * duration, 48000);
    const test = createSoundEngine({
      contextFactory: () => ctx,
      offline: true,
    });
    test.unlock();
    if (kind === "spawn") test.playSpawn();
    else test.playRebirth();
    const buffer = await ctx.startRendering();
    let sum = 0,
      peak = 0,
      tail = 0;
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      peak = Math.max(peak, Math.abs(data[i]));
      sum += data[i] * data[i];
      if (i >= 48000 * 2) tail += data[i] * data[i];
    }
    result[kind] = {
      duration,
      peak: peak.toFixed(5),
      rms: Math.sqrt(sum / data.length).toFixed(5),
      tailEnergy: tail.toFixed(5),
      pass: peak > 0.001 && peak < 1 && (kind === "spawn" || tail > 0.01),
    };
  }
  output.textContent = JSON.stringify(result);
};
