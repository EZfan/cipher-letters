/**
 * Tiny 8-bit sound engine — pure WebAudio, no asset files.
 * Square-wave blips for typing and selection, a small arpeggio for
 * solving a case. Respects a global mute; creating the AudioContext
 * lazily on first user gesture keeps browsers happy.
 */

let ctx: AudioContext | null = null;

function audioContext(): AudioContext | null {
  try {
    if (!ctx) {
      const AC =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(
  freq: number,
  duration: number,
  volume: number,
  type: OscillatorType = 'square',
  when = 0,
): void {
  const ac = audioContext();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const start = ac.currentTime + when;
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

/** A single short blip. No-ops when the AudioContext is unavailable. */
export function blip(freq = 660, duration = 0.04, volume = 0.03): void {
  tone(freq, duration, volume);
}

/** Two-note confirmation for selecting a case. */
export function selectSound(): void {
  tone(523, 0.07, 0.04);
  tone(784, 0.09, 0.04, 'square', 0.08);
}

/** Small victory arpeggio for solving a case. */
export function solvedSound(): void {
  const notes = [523, 659, 784, 1047];
  notes.forEach((f, i) => tone(f, 0.12, 0.045, 'square', i * 0.11));
}

/** Low double-buzz for a wrong accusation. */
export function wrongSound(): void {
  tone(196, 0.12, 0.04, 'sawtooth');
  tone(147, 0.16, 0.04, 'sawtooth', 0.13);
}
