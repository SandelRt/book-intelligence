'use client'

let audioCtx: AudioContext | null = null;

const initAudio = () => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
};

const playClick = (pitch = 1000, duration = 0.05, type: OscillatorType = 'sine', volume = 0.3) => {
  const ctx = initAudio();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  
  const t = ctx.currentTime;
  osc.frequency.setValueAtTime(pitch, t);
  osc.frequency.exponentialRampToValueAtTime(pitch / 2, t + duration);
  
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start(t);
  osc.stop(t + duration);
};

export const playThock = () => {
  playClick(400, 0.1, 'triangle', 0.4);
  setTimeout(() => playClick(300, 0.15, 'sine', 0.3), 20);
};

export const playZip = (speed: number = 0.5) => {
  const pitch = 200 + (speed * 800);
  playClick(pitch, 0.05, 'sawtooth', 0.15); // Continuous, keep volume low
};

export const playPop = (intensity = 1, volume = 0.05) => {
  const pitch = 600 + (Math.random() * 400 * intensity);
  playClick(pitch, 0.1, 'sine', volume);
};

export const playDopamineChime = () => {
  const ctx = initAudio();
  if (!ctx) return;
  const t = ctx.currentTime;
  
  // Soft major arpeggio for a pleasant, non-scary reward
  [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    
    const timeStart = t + i * 0.06;
    osc.frequency.setValueAtTime(freq, timeStart);
    
    gain.gain.setValueAtTime(0, timeStart);
    gain.gain.linearRampToValueAtTime(0.2, timeStart + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, timeStart + 0.4);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(timeStart);
    osc.stop(timeStart + 0.5);
  });
};
