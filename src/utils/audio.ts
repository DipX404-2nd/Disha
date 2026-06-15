// Rich Web Audio synthesizer to add luxury cinematic chime chords and interactive soundscapes.
let audioCtx: AudioContext | null = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Sparkle dream chime sweep
export function playChimeTrail() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const notes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51]; // Pentatonic luxury stack
    
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      
      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.08 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.8);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 1.0);
    });
  } catch (e) {
    console.warn('Audio play triggered before user gesture or failed to construct Context:', e);
  }
}

// Gentle warm chord sweep for scene transition
export function playDreamyChord() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const chord = [261.63, 329.63, 392.00, 523.25, 659.25]; // C major add9 luxury warm colors
    
    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, now);
      filter.frequency.exponentialRampToValueAtTime(300, now + 1.5);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 2.0);
    });
  } catch (e) {
    console.warn('Audio failed:', e);
  }
}

// Candle wick ignition click / flicker sound
export function playMatchStrike() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.Q.setValueAtTime(3, now);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    
    noiseNode.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    noiseNode.start(now);
    noiseNode.stop(now + 0.12);
  } catch (e) {
    console.warn(e);
  }
}

// Cake Cutting Confetti blast fanfare!
export function playCelebrantFanfare() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const melody = [523.25, 523.25, 587.33, 523.25, 659.25, 587.33]; // Happy celebration intervals
    const times = [0, 0.15, 0.3, 0.45, 0.6, 0.8];
    const lengths = [0.12, 0.12, 0.12, 0.12, 0.18, 0.35];
    
    melody.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + times[idx]);
      
      gain.gain.setValueAtTime(0, now + times[idx]);
      gain.gain.linearRampToValueAtTime(0.15, now + times[idx] + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + times[idx] + lengths[idx]);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + times[idx]);
      osc.stop(now + times[idx] + lengths[idx] + 0.1);
    });
  } catch (e) {
    console.warn(e);
  }
}
