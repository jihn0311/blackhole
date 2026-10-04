// Original 56-second orchestral-style space score, synthesized locally.
export function startCreditsScore(context, destination, variant = "normal") {
  const bus = context.createGain();
  bus.gain.setValueAtTime(0.0001, context.currentTime);
  bus.gain.exponentialRampToValueAtTime(1.6, context.currentTime + 2);
  bus.connect(destination);
  const voices = new Set();
  const normalChords = [
    [45, 52, 57, 60],
    [41, 48, 53, 57],
    [45, 52, 57, 60],
    [43, 50, 55, 59],
  ];
  const normalMelody = [
    69, 72, 76, 74, 72, 69, 67, 64, 67, 72, 76, 79, 74, 71, 67, 69,
  ];
  const chords =
    variant === "hacking"
      ? [
          [50, 57, 60, 64],
          [46, 53, 57, 60],
          [53, 60, 64, 67],
          [48, 55, 58, 62],
        ]
      : variant === "normal"
        ? [
            [48, 55, 60, 64],
            [41, 48, 53, 56],
            [38, 45, 50, 53],
            [40, 47, 52, 55],
          ]
        : normalChords;
  const melody =
    variant === "hacking"
      ? [74, 77, 81, 76, 72, 69, 65, 69, 77, 79, 84, 81, 79, 74, 70, 72]
      : variant === "normal"
        ? [72, 71, 69, 64, 68, 65, 64, 60, 65, 64, 62, 57, 64, 62, 59, 57]
        : normalMelody;
  const barLength =
    variant === "hacking" ? 3.6 : variant === "normal" ? 4.8 : 3.5;
  let bar = 0,
    next = context.currentTime + 0.05,
    stopped = false;
  function note(
    midi,
    at,
    duration,
    volume,
    type = "sine",
    attack = Math.min(0.4, duration / 4),
  ) {
    const source = context.createOscillator(),
      gain = context.createGain();
    source.type = type;
    source.frequency.setValueAtTime(440 * 2 ** ((midi - 69) / 12), at);
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(volume, at + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    source.connect(gain);
    gain.connect(bus);
    voices.add(source);
    source.onended = () => {
      voices.delete(source);
      source.disconnect();
      gain.disconnect();
    };
    source.start(at);
    source.stop(at + duration + 0.03);
  }
  function piano(midi, at, duration, volume) {
    // Soft hammer attack with upper harmonics fading before the fundamental.
    note(midi, at, duration, volume, "sine", 0.008);
    note(midi + 12, at, duration * 0.55, volume * 0.24, "sine", 0.005);
    note(midi + 19, at, duration * 0.3, volume * 0.08, "sine", 0.004);
  }
  function schedule() {
    if (stopped || next > context.currentTime + 0.5) return;
    // Resume gracefully if the browser throttled timers in the background.
    next = Math.max(next, context.currentTime + 0.02);
    const chord = chords[bar % 4],
      rise = Math.min(1, 0.45 + (bar % 16) / 12);
    if (variant === "hacking") {
      // Floating piano arpeggios and a distant sustained pad.
      note(chord[0] - 12, next, 4.1, 0.065);
      chord.forEach((pitch) => note(pitch, next, 4.5, 0.018));
      for (let beat = 0; beat < 4; beat++) {
        const at = next + beat * 0.9;
        piano(chord[beat % 4], at, 2.4, 0.075);
        piano(melody[(bar * 4 + beat) % melody.length], at + 0.3, 2.0, 0.095);
      }
    } else if (variant === "normal") {
      // Slow minor pads and widely spaced bell-like notes leave room for silence.
      chord.forEach((pitch) => note(pitch, next, 5.4, 0.045));
      note(chord[0] - 12, next, 4.6, 0.085);
      for (let beat = 0; beat < 3; beat++) {
        const pitch = melody[(bar * 3 + beat) % melody.length];
        note(pitch, next + beat * 1.6, 2.8, 0.12);
        note(pitch + 12, next + beat * 1.6 + 0.03, 1.5, 0.025);
      }
    } else {
      chord.forEach((pitch, i) => {
        note(pitch, next, 4.3, 0.065 * rise, "triangle");
        note(pitch + 12, next + 0.08, 4.1, 0.028 * rise);
      });
      note(chord[0] - 12, next, 3.4, 0.17 * rise);
      for (let beat = 0; beat < 4; beat++) {
        note(
          melody[(bar * 2 + Math.floor(beat / 2)) % melody.length],
          next + beat * 0.875,
          1.5,
          0.08 * rise,
        );
        if (bar % 16 >= 4)
          note(chord[beat % 4] + 24, next + beat * 0.875, 0.65, 0.028);
      }
    }
    bar++;
    next += barLength;
  }
  schedule();
  const timer = setInterval(schedule, 200);
  return () => {
    if (stopped) return;
    stopped = true;
    clearInterval(timer);
    const now = context.currentTime;
    bus.gain.cancelScheduledValues(now);
    bus.gain.setTargetAtTime(0, now, 0.06);
    for (const voice of voices) {
      try {
        voice.stop(now + 0.3);
      } catch {}
    }
    setTimeout(() => bus.disconnect(), 400);
  };
}
