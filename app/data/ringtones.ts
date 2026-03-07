/**
 * Ringtone definitions — only developers can add new ringtones here.
 * Users can only select from this list and set repeat count in Settings.
 *
 * To add a new ringtone, add an entry to the RINGTONES array with:
 *   - id: unique string identifier (used for localStorage)
 *   - name: display name shown to user
 *   - durationMs: how long one play lasts in milliseconds (used to space repeats)
 *   - play: function that plays the sound using Web Audio API
 */

export interface Ringtone {
  id: string;
  name: string;
  durationMs: number;
  play: () => void;
}

function getAudioCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    return new AC();
  } catch {
    return null;
  }
}

export const RINGTONES: Ringtone[] = [
  {
    id: "chime",
    name: "Chime",
    durationMs: 1000, // 3 tones × 0.18s gap + 0.65s last tone ≈ 1s
    play() {
      const ctx = getAudioCtx();
      if (!ctx) return;
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.value = freq;
        const t = ctx.currentTime + i * 0.18;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.35, t + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
        osc.start(t);
        osc.stop(t + 0.65);
      });
    },
  },
  {
    id: "bell",
    name: "Bell",
    durationMs: 2200,
    play() {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const fundamental = 440;
      const harmonics = [1, 2.756, 5.404, 8.933];
      harmonics.forEach((ratio) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.value = fundamental * ratio;
        const t = ctx.currentTime;
        gain.gain.setValueAtTime(0.3 / harmonics.length, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 2.0);
        osc.start(t);
        osc.stop(t + 2.1);
      });
    },
  },
  {
    id: "digital",
    name: "Digital",
    durationMs: 450, // 0.22 offset + 0.13 beep ≈ 0.35s, add gap
    play() {
      const ctx = getAudioCtx();
      if (!ctx) return;
      [0, 0.22].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "square";
        osc.frequency.value = 880;
        const t = ctx.currentTime + offset;
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.setValueAtTime(0, t + 0.12);
        osc.start(t);
        osc.stop(t + 0.13);
      });
    },
  },
  {
    id: "soft",
    name: "Soft",
    durationMs: 1200,
    play() {
      const ctx = getAudioCtx();
      if (!ctx) return;
      [659.25, 523.25].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.value = freq;
        const t = ctx.currentTime + i * 0.3;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.25, t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
        osc.start(t);
        osc.stop(t + 0.85);
      });
    },
  },
  {
    id: "none",
    name: "Silent",
    durationMs: 0,
    play() {
      // No sound
    },
  },
];

export const DEFAULT_RINGTONE_ID = "chime";
export const DEFAULT_RINGTONE_REPEAT = 1;

export function getRingtoneById(id: string): Ringtone {
  return RINGTONES.find((r) => r.id === id) ?? RINGTONES[0];
}

/**
 * Play a ringtone N times, spacing each repeat after the previous one finishes.
 * Gap of 300ms between repeats for clarity.
 */
export function playRingRepeated(id: string, times: number): void {
  const ringtone = getRingtoneById(id);
  if (ringtone.id === "none" || times <= 0) return;

  const GAP_MS = 300;
  const interval = ringtone.durationMs + GAP_MS;

  for (let i = 0; i < times; i++) {
    if (i === 0) {
      ringtone.play();
    } else {
      setTimeout(() => ringtone.play(), i * interval);
    }
  }
}
