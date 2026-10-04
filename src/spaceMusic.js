// Original space nocturne: 120 five-second bars, five evolving movements.
// Schedule only a short lookahead; the complete ten-minute score repeats.
export const SPACE_SCORE_SECONDS = 600;
export function startSpaceScore(context, destination) {
  const bus = context.createGain();
  bus.gain.setValueAtTime(0.0001, context.currentTime);
  bus.gain.exponentialRampToValueAtTime(0.65, context.currentTime + 3);
  bus.connect(destination);
  const voices = new Set();
  const progressions = [
    [[48,55,60,64],[45,52,57,60],[41,48,53,60],[43,50,55,62]],
    [[45,52,57,60],[41,48,53,57],[48,55,60,64],[43,50,59,62]],
    [[53,60,65,69],[50,57,62,65],[48,55,64,67],[43,50,59,62]],
    [[45,52,60,64],[40,47,55,59],[41,48,57,60],[43,50,57,62]],
    [[48,55,60,64],[41,48,55,60],[43,50,59,62],[48,55,60,64]],
  ];
  let bar = 0, next = context.currentTime + 0.1, stopped = false;
  function note(midi, at, duration, volume, soft = false) {
    // Soft piano fundamental and a quiet overtone, or a slow string-like pad.
    for (const [ratio, strength] of [[1,1],[2,soft ? 0.12 : 0.18],[3,0.035]]) {
      const voice = context.createOscillator(), gain = context.createGain();
      voice.type = 'sine';
      voice.frequency.setValueAtTime(440 * 2 ** ((midi - 69) / 12) * ratio, at);
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(volume * strength, at + (soft ? 0.8 : 0.018));
      gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
      voice.connect(gain); gain.connect(bus); voices.add(voice);
      voice.onended = () => { voices.delete(voice); voice.disconnect(); gain.disconnect(); };
      voice.start(at); voice.stop(at + duration + 0.05);
    }
  }
  function schedule() {
    if (stopped || context.state !== 'running') return;
    if (next < context.currentTime - 1) next = context.currentTime + 0.05;
    while (next < context.currentTime + 0.8) {
      const phrase = bar % 120, movement = Math.floor(phrase / 24);
      const chord = progressions[movement][Math.floor(phrase / 2) % 4];
      const variation = Math.floor(phrase / 8) % 3;
      note(chord[0] - 12, next, 4.9, 0.07, true);
      chord.slice(1).forEach((midi) => note(midi, next + 0.08, 5.8, 0.026, true));
      const pattern = variation === 0 ? [0,2,1,3] : variation === 1 ? [3,1,2,0] : [1,2,3,2];
      pattern.forEach((step, beat) => note(chord[step] + 12, next + beat * 1.25, 3.2, 0.095));
      if (movement === 2 || (movement === 4 && phrase % 4 === 0))
        note(chord[(phrase + variation) % 4] + 24, next + 2.5, 3.8, 0.045);
      bar++; next += 5;
    }
  }
  schedule();
  const timer = setInterval(schedule, 200);
  return () => {
    if (stopped) return;
    stopped = true; clearInterval(timer);
    bus.gain.cancelScheduledValues(context.currentTime);
    bus.gain.setTargetAtTime(0, context.currentTime, 0.12);
    for (const voice of voices) { try { voice.stop(context.currentTime + 0.5); } catch {} }
    setTimeout(() => bus.disconnect(), 600);
  };
}
