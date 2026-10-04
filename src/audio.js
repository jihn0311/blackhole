import { startCreditsScore } from "./creditsMusic.js";
// Short procedural effects: no downloads or external sound assets needed.
export function createSoundEngine({
  contextFactory,
  storage,
  hidden = () => false,
  offline = false,
} = {}) {
  let context, master, compressor, reverb, reverbGain, noise;
  let enabled = true;
  let collapse = 0;
  let creditsVariant = "normal";
  let creditsRequested = false,
    stopScore;
  function startScore() {
    if (creditsRequested && enabled && context && !stopScore)
      stopScore = startCreditsScore(context, master, creditsVariant);
  }
  const active = new Set();
  let lastSpawn = -Infinity;
  let lastAbsorb = -Infinity;
  let lastBurst = -Infinity;
  try {
    enabled = storage?.getItem("event-horizon-sound") !== "off";
  } catch {}
  const factory =
    contextFactory ||
    (() => {
      const C = globalThis.AudioContext || globalThis.webkitAudioContext;
      return C ? new C() : null;
    });
  function prepare() {
    if (context) return context;
    try {
      context = factory();
      if (!context) return null;
      master = context.createGain();
      master.gain.value = enabled ? 0.4 : 0;
      compressor = context.createDynamicsCompressor();
      compressor.threshold.value = -14;
      compressor.knee.value = 12;
      compressor.ratio.value = 5;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.2;
      master.connect(compressor);
      compressor.connect(context.destination);
      reverb = context.createConvolver();
      const length = Math.floor(context.sampleRate * 2.4),
        impulse = context.createBuffer(2, length, context.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const data = impulse.getChannelData(ch);
        for (let i = 0; i < length; i++)
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (length * 0.18));
      }
      reverb.buffer = impulse;
      reverbGain = context.createGain();
      reverbGain.gain.value = 0.25;
      reverb.connect(reverbGain);
      reverbGain.connect(master);
      noise = context.createBuffer(
        1,
        Math.ceil(context.sampleRate * 0.2),
        context.sampleRate,
      );
      const data = noise.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      return context;
    } catch {
      context = null;
      return null;
    }
  }
  function register(source, gain) {
    active.add(source);
    source.onended = () => {
      active.delete(source);
      source.disconnect();
      gain.disconnect();
    };
  }
  function tone(
    frequency,
    start,
    duration,
    amplitude,
    type = "sine",
    attack = 0.015,
    endFrequency = frequency,
    wet = false,
  ) {
    const source = context.createOscillator(),
      gain = context.createGain();
    source.type = collapse > 0 && type !== "sine" ? "square" : type;
    if (collapse > 0) {
      frequency = Math.max(
        20,
        Math.round(frequency / (4 + collapse * 3)) * (4 + collapse * 3),
      );
    }
    source.frequency.setValueAtTime(frequency, start);
    source.frequency.exponentialRampToValueAtTime(
      endFrequency,
      start + duration,
    );
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(amplitude, start + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    if (collapse > 0) {
      const at = start + duration * 0.45;
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.setValueAtTime(amplitude * 0.55, at + 0.004 + collapse * 0.001);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    }
    source.connect(gain);
    gain.connect(master);
    if (wet) gain.connect(reverb);
    register(source, gain);
    source.start(start);
    source.stop(start + duration + 0.03);
  }
  function spawn() {
    if (
      !enabled ||
      hidden() ||
      !context ||
      (!offline && context.state !== "running") ||
      active.size > 32
    )
      return false;
    const t = context.currentTime;
    // Avoid a wall of sound when several automatic spawns share one frame.
    if (t - lastSpawn < 0.035) return false;
    lastSpawn = t;
    tone(240, t, 0.22, 0.12, "sine", 0.012, 720);
    tone(480, t + 0.035, 0.26, 0.065, "triangle", 0.015, 960);
    return true;
  }
  function absorb() {
    if (
      !enabled ||
      hidden() ||
      !context ||
      (!offline && context.state !== "running") ||
      active.size > 28
    )
      return false;
    const t = context.currentTime;
    if (t - lastAbsorb < 0.12) return false;
    lastAbsorb = t;
    // Falling pitch and a closing noise filter suggest air pulled into the horizon.
    tone(240, t, 0.32, 0.16, "sine", 0.012, 38);
    // A soft low impact closes the suction, making each absorption tangible.
    tone(95, t + 0.045, 0.23, 0.18, "sine", 0.008, 28);
    const source = context.createBufferSource(),
      gain = context.createGain(),
      filter = context.createBiquadFilter();
    source.buffer = noise;
    source.loop = true;
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1800, t);
    filter.frequency.exponentialRampToValueAtTime(90, t + 0.42);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.1, t + 0.09);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.44);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    register(source, gain);
    const end = source.onended;
    source.onended = () => {
      end();
      filter.disconnect();
    };
    source.start(t);
    source.stop(t + 0.46);
    return true;
  }
  function unlockBody() {
    if (
      !enabled ||
      hidden() ||
      !context ||
      (!offline && context.state !== "running")
    )
      return false;
    const t = context.currentTime;
    // A rising major arpeggio distinguishes discovery from spawning/absorption.
    [523.25, 659.25, 783.99, 1046.5].forEach((frequency, i) =>
      tone(frequency, t + i * 0.11, 0.65, 0.1, "sine", 0.012, frequency, true),
    );
    return true;
  }
  function firstUpgrade() {
    if (!enabled || hidden() || !context || (!offline && context.state !== "running"))
      return false;
    const t = context.currentTime;
    // A compact low impact and suspended chord, distinct from the rebirth swell.
    tone(110, t, 0.65, 0.32, "sine", 0.008, 42);
    [220, 293.66, 440].forEach((frequency, i) =>
      tone(frequency, t + 0.08 + i * 0.045, 1.4, 0.12, "triangle", 0.04, frequency, true),
    );
    tone(880, t + 0.27, 1.1, 0.065, "sine", 0.015, 880, true);
    return true;
  }
  function missionComplete() {
    if (!enabled || hidden() || !context || (!offline && context.state !== "running"))
      return false;
    const t = context.currentTime;
    [659.25, 783.99, 1046.5].forEach((frequency, i) =>
      tone(frequency, t + i * 0.16, 0.8, 0.14, "sine", 0.015, frequency, true),
    );
    tone(523.25, t + 0.32, 1, 0.09, "triangle", 0.02, 523.25, true);
    return true;
  }
  function corruptionBurst() {
    if (
      !enabled ||
      hidden() ||
      !context ||
      (!offline && context.state !== "running") ||
      active.size > 40
    )
      return false;
    const t = context.currentTime;
    if (t - lastBurst < 0.3) return false;
    lastBurst = t;
    tone(85, t, 0.52, 0.35, "sine", 0.006, 24);
    const source = context.createBufferSource(),
      gain = context.createGain(),
      filter = context.createBiquadFilter();
    source.buffer = noise;
    source.loop = true;
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2800, t);
    filter.frequency.exponentialRampToValueAtTime(120, t + 0.55);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.28, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    register(source, gain);
    const end = source.onended;
    source.onended = () => {
      end();
      filter.disconnect();
    };
    source.start(t);
    source.stop(t + 0.63);
    return true;
  }
  function rebirth() {
    if (
      !enabled ||
      hidden() ||
      !context ||
      (!offline && context.state !== "running")
    )
      return false;
    const t = context.currentTime;
    for (const source of [...active]) {
      try {
        source.stop(t);
      } catch {}
    }
    tone(48, t, 2.8, 0.45, "sine", 0.03, 32, true);
    [65.41, 98, 130.81, 164.81, 196, 261.63].forEach((f, i) =>
      tone(
        f,
        t + 0.12 + i * 0.035,
        3.7,
        0.12,
        i < 3 ? "triangle" : "sine",
        0.55,
        f * 1.003,
        true,
      ),
    );
    [261.63, 329.63, 392, 523.25].forEach((f, i) =>
      tone(f, t + 0.6 + i * 0.17, 2.2, 0.15, "sine", 0.06, f, true),
    );
    const source = context.createBufferSource(),
      gain = context.createGain(),
      filter = context.createBiquadFilter();
    source.buffer = noise;
    source.loop = true;
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(120, t);
    filter.frequency.exponentialRampToValueAtTime(4200, t + 1.1);
    filter.frequency.exponentialRampToValueAtTime(200, t + 3.8);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.075, t + 1);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 4);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    gain.connect(reverb);
    register(source, gain);
    const end = source.onended;
    source.onended = () => {
      end();
      filter.disconnect();
    };
    source.start(t);
    source.stop(t + 4.1);
    return true;
  }
  return {
    get enabled() {
      return enabled;
    },
    unlock() {
      if (!enabled || hidden()) return;
      const c = prepare();
      if (!offline && c?.state === "suspended" && c.resume)
        void c
          .resume()
          .then(startScore)
          .catch(() => {});
      else startScore();
    },
    setEnabled(value) {
      enabled = !!value;
      try {
        storage?.setItem("event-horizon-sound", enabled ? "on" : "off");
      } catch {}
      if (master && context) {
        const t = context.currentTime;
        master.gain.cancelScheduledValues(t);
        master.gain.setTargetAtTime(enabled ? 0.4 : 0, t, 0.025);
      }
      if (enabled) this.unlock();
    },
    setCollapse(stage) {
      collapse = Number.isFinite(stage) ? Math.max(0, Math.min(10, stage)) : 0;
    },
    fadeShatter() {
      if (!master || !context) return;
      const t = context.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(enabled ? 0.4 : 0.0001, t);
      master.gain.exponentialRampToValueAtTime(0.0001, t + 6.5);
    },
    restoreVolume() {
      if (!master || !context) return;
      const t = context.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setTargetAtTime(enabled ? 0.4 : 0, t, 0.2);
    },
    playCredits(variant = "normal") {
      const selected = ["hacking", "survivor"].includes(variant)
        ? variant
        : "normal";
      if (selected !== creditsVariant) {
        stopScore?.();
        stopScore = undefined;
      }
      creditsVariant = selected;
      creditsRequested = true;
      startScore();
    },
    stopCredits() {
      creditsRequested = false;
      stopScore?.();
      stopScore = undefined;
    },
    playSpawn: spawn,
    playAbsorb: absorb,
    playCorruptionBurst: corruptionBurst,
    playUnlock: unlockBody,
    playMission: missionComplete,
    playFirstUpgrade: firstUpgrade,
    playRebirth: rebirth,
    // A context is created by a real input gesture, never at page load.
    dispose() {
      this.stopCredits();
      for (const source of active) {
        try {
          source.stop();
        } catch {}
      }
      active.clear();
      if (context?.close) void context.close().catch(() => {});
      context = null;
      master = null;
      lastSpawn = -Infinity;
      lastAbsorb = -Infinity;
      lastBurst = -Infinity;
    },
  };
}
