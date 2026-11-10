// 100% Free Multi-Track Web Audio Studio Synthesizer (Generates downloadable WAV audio tracks in-browser at $0 cost)

export type FreeMusicGenre = 'cosmic' | 'synthwave' | 'lofi' | 'cyberpunk' | 'lullaby';

function writeWavString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

function audioBufferToWavDataUrl(buffer: AudioBuffer): string {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const numSamples = buffer.length;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = numSamples * blockAlign;
  const arrayBuffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(arrayBuffer);

  writeWavString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeWavString(view, 8, 'WAVE');
  writeWavString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeWavString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  const channels: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) {
    channels.push(buffer.getChannelData(c));
  }

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    for (let c = 0; c < numChannels; c++) {
      const sample = Math.max(-1, Math.min(1, channels[c][i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  const uint8 = new Uint8Array(arrayBuffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < uint8.length; i += chunkSize) {
    binary += String.fromCharCode(...uint8.subarray(i, i + chunkSize));
  }
  return `data:audio/wav;base64,${btoa(binary)}`;
}

const GENRE_SCALES: Record<FreeMusicGenre, { bpm: number; notes: number[]; wave: OscillatorType }> = {
  cosmic: {
    bpm: 92,
    notes: [220.0, 261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 659.25],
    wave: 'sine',
  },
  synthwave: {
    bpm: 118,
    notes: [196.0, 233.08, 261.63, 293.66, 349.23, 392.0, 466.16, 587.33],
    wave: 'sawtooth',
  },
  lofi: {
    bpm: 80,
    notes: [174.61, 220.0, 261.63, 329.63, 349.23, 440.0, 523.25],
    wave: 'triangle',
  },
  cyberpunk: {
    bpm: 128,
    notes: [164.81, 196.0, 246.94, 293.66, 329.63, 392.0, 493.88],
    wave: 'sawtooth',
  },
  lullaby: {
    bpm: 72,
    notes: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 659.25],
    wave: 'sine',
  },
};

export async function synthesizeFreeStudioTrack(
  genre: FreeMusicGenre,
  durationSeconds = 18
): Promise<string> {
  const sampleRate = 24000;
  const offlineCtx = new OfflineAudioContext(2, sampleRate * durationSeconds, sampleRate);
  const preset = GENRE_SCALES[genre] || GENRE_SCALES.cosmic;
  const beatDur = 60 / preset.bpm;

  // Master compressor/gain
  const masterGain = offlineCtx.createGain();
  masterGain.gain.setValueAtTime(0.55, 0);
  masterGain.connect(offlineCtx.destination);

  // 1. Warm Stereo Pad Chords
  const chordRoots = [0, 3, 4, 2];
  const barDur = beatDur * 4;
  for (let t = 0; t < durationSeconds; t += barDur) {
    const barIdx = Math.floor(t / barDur) % chordRoots.length;
    const rootIdx = chordRoots[barIdx];
    const triad = [
      preset.notes[rootIdx % preset.notes.length] * 0.5,
      preset.notes[(rootIdx + 2) % preset.notes.length] * 0.5,
      preset.notes[(rootIdx + 4) % preset.notes.length] * 0.5,
    ];

    triad.forEach((freq, i) => {
      const osc = offlineCtx.createOscillator();
      const gain = offlineCtx.createGain();
      const panner = offlineCtx.createStereoPanner();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      panner.pan.setValueAtTime((i - 1) * 0.45, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.11, t + 0.4);
      gain.gain.setValueAtTime(0.11, Math.min(durationSeconds - 0.3, t + barDur - 0.35));
      gain.gain.linearRampToValueAtTime(0.001, Math.min(durationSeconds, t + barDur));

      osc.connect(gain);
      gain.connect(panner);
      panner.connect(masterGain);

      osc.start(t);
      osc.stop(Math.min(durationSeconds, t + barDur));
    });
  }

  // 2. Melodic Arpeggiator Lead
  const stepDur = beatDur * 0.5;
  const pattern = [0, 2, 4, 6, 5, 4, 2, 1];
  let stepIndex = 0;
  for (let t = 0; t < durationSeconds - stepDur; t += stepDur) {
    const noteFreq = preset.notes[pattern[stepIndex % pattern.length] % preset.notes.length];
    stepIndex++;

    const osc = offlineCtx.createOscillator();
    const filter = offlineCtx.createBiquadFilter();
    const gain = offlineCtx.createGain();
    const pan = offlineCtx.createStereoPanner();

    osc.type = preset.wave;
    osc.frequency.setValueAtTime(noteFreq, t);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(genre === 'cyberpunk' ? 1900 : 1200, t);

    pan.pan.setValueAtTime(Math.sin(t * 1.5) * 0.5, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.12, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.002, t + stepDur * 0.92);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(pan);
    pan.connect(masterGain);

    osc.start(t);
    osc.stop(t + stepDur);
  }

  // 3. Soft Sub-Bass Pulse on Beats
  for (let t = 0; t < durationSeconds - beatDur; t += beatDur) {
    const kickOsc = offlineCtx.createOscillator();
    const kickGain = offlineCtx.createGain();
    kickOsc.type = 'sine';
    kickOsc.frequency.setValueAtTime(115, t);
    kickOsc.frequency.exponentialRampToValueAtTime(42, t + 0.14);

    kickGain.gain.setValueAtTime(0.24, t);
    kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    kickOsc.connect(kickGain);
    kickGain.connect(masterGain);

    kickOsc.start(t);
    kickOsc.stop(t + 0.24);
  }

  const renderedBuffer = await offlineCtx.startRendering();
  return audioBufferToWavDataUrl(renderedBuffer);
}
