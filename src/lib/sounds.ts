// All sounds are synthesized live with the Web Audio API — no audio files needed.
let ctx: AudioContext | null = null;
let muted = false;
let melodyBus: GainNode | null = null;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function setMuted(value: boolean) {
  muted = value;
  if (value) stopMelody();
}

function noiseBuffer(c: AudioContext, seconds: number) {
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * seconds), c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

/** Wax seal cracking: short sharp filtered noise bursts. */
export function playSealCrack() {
  const c = ac();
  if (!c || muted) return;
  const now = c.currentTime;
  [0, 0.05, 0.11].forEach((offset, i) => {
    const src = c.createBufferSource();
    src.buffer = noiseBuffer(c, 0.08);
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1800 + i * 700;
    bp.Q.value = 1.5;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, now + offset);
    g.gain.exponentialRampToValueAtTime(0.5 - i * 0.12, now + offset + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.07);
    src.connect(bp).connect(g).connect(c.destination);
    src.start(now + offset);
  });
}

/** Paper rustle: noise with a wobbling filter and amplitude. */
export function playPaperRustle(duration = 0.7, volume = 0.22) {
  const c = ac();
  if (!c || muted) return;
  const now = c.currentTime;
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c, duration);
  const hp = c.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 900;
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 0.8;
  bp.frequency.setValueAtTime(2500, now);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, now);
  const steps = 14;
  for (let i = 1; i <= steps; i++) {
    const t = now + (duration * i) / steps;
    const env = Math.sin((Math.PI * i) / steps);
    g.gain.linearRampToValueAtTime(volume * env * (0.4 + Math.random() * 0.6), t);
    bp.frequency.linearRampToValueAtTime(1800 + Math.random() * 3500, t);
  }
  src.connect(hp).connect(bp).connect(g).connect(c.destination);
  src.start(now);
}

/** Soft thud when the envelope closes. */
export function playThud() {
  const c = ac();
  if (!c || muted) return;
  const now = c.currentTime;
  const o = c.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(160, now);
  o.frequency.exponentialRampToValueAtTime(60, now + 0.18);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.35, now + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
  o.connect(g).connect(c.destination);
  o.start(now);
  o.stop(now + 0.3);
}

function bell(c: AudioContext, out: AudioNode, freq: number, start: number, dur: number, vol = 0.18) {
  [1, 2, 3.01].forEach((mult, i) => {
    const o = c.createOscillator();
    o.type = i === 0 ? "triangle" : "sine";
    o.frequency.value = freq * mult;
    const g = c.createGain();
    const v = vol / (i * 2.2 + 1);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(v, start + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur + 0.4);
    o.connect(g).connect(out);
    o.start(start);
    o.stop(start + dur + 0.5);
  });
}

/** Magical sparkle arpeggio. */
export function playSparkle() {
  const c = ac();
  if (!c || muted) return;
  const now = c.currentTime;
  [1046.5, 1318.5, 1568, 2093, 2637].forEach((f, i) => bell(c, c.destination, f, now + i * 0.07, 0.25, 0.08));
}

const N: Record<string, number> = {
  G4: 392, A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99,
};

// "Parabéns pra você" / Happy Birthday melody: [note, beats]
const SONG: [string, number][] = [
  ["G4", 0.75], ["G4", 0.25], ["A4", 1], ["G4", 1], ["C5", 1], ["B4", 2],
  ["G4", 0.75], ["G4", 0.25], ["A4", 1], ["G4", 1], ["D5", 1], ["C5", 2],
  ["G4", 0.75], ["G4", 0.25], ["G5", 1], ["E5", 1], ["C5", 1], ["B4", 1], ["A4", 2],
  ["F5", 0.75], ["F5", 0.25], ["E5", 1], ["C5", 1], ["D5", 1], ["C5", 3],
];

export function playMelody() {
  const c = ac();
  if (!c || muted) return;
  stopMelody();
  const bus = c.createGain();
  bus.gain.value = 1;
  bus.connect(c.destination);
  melodyBus = bus;
  const beat = 0.42;
  let t = c.currentTime + 0.15;
  for (const [note, beats] of SONG) {
    bell(c, bus, N[note] ?? 440, t, beats * beat * 0.9);
    t += beats * beat;
  }
}

export function stopMelody() {
  if (!ctx || !melodyBus) return;
  const bus = melodyBus;
  melodyBus = null;
  bus.gain.setTargetAtTime(0, ctx.currentTime, 0.08);
  setTimeout(() => bus.disconnect(), 600);
}
