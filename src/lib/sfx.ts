// Small, dependency-free UI sound effects synthesized with the Web Audio
// API. No asset files to host or load — and cheap, slightly lo-fi bleeps
// suit the salvaged-tech aesthetic better than clean sample packs would.

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return null;
    ctx = new AudioCtx();
  }
  // Browsers suspend audio contexts until a user gesture; resume on each
  // call, cheap no-op if already running.
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(
  freq: number,
  duration: number,
  { type = 'square', gain = 0.06, glideTo }: { type?: OscillatorType; gain?: number; glideTo?: number } = {}
) {
  const c = getCtx();
  if (!c) return;

  const osc = c.createOscillator();
  const amp = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime);
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, c.currentTime + duration);

  amp.gain.setValueAtTime(gain, c.currentTime);
  amp.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);

  osc.connect(amp);
  amp.connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + duration);
}

function noiseBurst(duration: number, gain = 0.04) {
  const c = getCtx();
  if (!c) return;

  const bufferSize = c.sampleRate * duration;
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);

  const src = c.createBufferSource();
  src.buffer = buffer;
  const amp = c.createGain();
  amp.gain.setValueAtTime(gain, c.currentTime);
  src.connect(amp);
  amp.connect(c.destination);
  src.start();
}

export const sfx = {
  hover: () => tone(880, 0.04, { type: 'sine', gain: 0.02 }),
  click: () => tone(220, 0.06, { type: 'square', gain: 0.05, glideTo: 140 }),
  error: () => tone(120, 0.15, { type: 'sawtooth', gain: 0.05, glideTo: 60 }),
  sweep: () => noiseBurst(0.9, 0.03),

  // Reveal chime, pitched by rarity — legendary gets a little fanfare,
  // common gets a flat, unimpressed blip (on purpose).
  reveal: (rarity: 'common' | 'uncommon' | 'rare' | 'legendary') => {
    const c = getCtx();
    if (!c) return;
    const now = c.currentTime;

    const sequences: Record<string, number[]> = {
      common: [220],
      uncommon: [330, 440],
      rare: [440, 550, 660],
      legendary: [440, 554, 659, 880]
    };

    sequences[rarity].forEach((freq, i) => {
      setTimeout(() => tone(freq, 0.18, { type: rarity === 'legendary' ? 'triangle' : 'square', gain: 0.07 }), i * 90);
    });
  },

  copy: () => tone(660, 0.08, { type: 'sine', gain: 0.05, glideTo: 990 }),
  success: () => {
    tone(523, 0.12, { type: 'sine', gain: 0.06 });
    setTimeout(() => tone(784, 0.16, { type: 'sine', gain: 0.06 }), 90);
  }
};
