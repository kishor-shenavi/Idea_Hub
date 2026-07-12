// Decodes recorded audio and extracts energy (RMS) + pitch (autocorrelation) per frame,
// then derives pause segments and pitch variance from that.

export async function analyzeAudioBlob(blob) {
  const arrayBuffer = await blob.arrayBuffer();
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

  const channelData = audioBuffer.getChannelData(0); // mono, first channel
  const sampleRate = audioBuffer.sampleRate;

  const frameSize = 2048;
  const hopSize = 1024; // 50% overlap
  const frames = [];

  for (let i = 0; i + frameSize <= channelData.length; i += hopSize) {
    const frame = channelData.slice(i, i + frameSize);
    const time = i / sampleRate;
    const rms = computeRMS(frame);
    const pitch = rms > 0.015 ? detectPitch(frame, sampleRate) : 0; // skip pitch detection on silence, it's noise
    frames.push({ time: round(time, 2), rms: round(rms, 4), pitch: round(pitch, 1) });
  }

  const pauseSegments = extractPauseSegments(frames);
  const pitchStats = computePitchStats(frames);
  const silenceRatio = frames.filter(f => f.rms < 0.015).length / frames.length;

  audioCtx.close();

  return {
    frames: downsample(frames, 150), // cap points sent to backend/rendered, no need for raw resolution
    pauseSegments,
    pitchMean: pitchStats.mean,
    pitchStdDev: pitchStats.stdDev,
    monotoneScore: pitchStats.monotoneScore,
    silenceRatio: round(silenceRatio, 3),
  };
}

function computeRMS(frame) {
  let sum = 0;
  for (let i = 0; i < frame.length; i++) sum += frame[i] * frame[i];
  return Math.sqrt(sum / frame.length);
}

// Autocorrelation-based pitch detection (ACF2+ approach)
function detectPitch(frame, sampleRate) {
  const SIZE = frame.length;
  const c = new Float32Array(SIZE);
  for (let lag = 0; lag < SIZE; lag++) {
    let sum = 0;
    for (let i = 0; i < SIZE - lag; i++) sum += frame[i] * frame[i + lag];
    c[lag] = sum;
  }

  let d = 0;
  while (c[d] > c[d + 1] && d < SIZE - 1) d++; // skip initial decline

  let maxVal = -1, maxPos = -1;
  for (let i = d; i < SIZE; i++) {
    if (c[i] > maxVal) { maxVal = c[i]; maxPos = i; }
  }

  if (maxPos <= 0) return 0;
  const freq = sampleRate / maxPos;
  return (freq > 70 && freq < 400) ? freq : 0; // human voice fundamental frequency range, discard outliers
}

function extractPauseSegments(frames) {
  const segments = [];
  let segStart = null;

  frames.forEach((f, i) => {
    const isSilent = f.rms < 0.015;
    if (isSilent && segStart === null) segStart = f.time;
    if (!isSilent && segStart !== null) {
      const duration = f.time - segStart;
      if (duration > 0.3) segments.push({ start: round(segStart, 2), end: round(f.time, 2), duration: round(duration, 2) });
      segStart = null;
    }
  });

  return segments;
}

function computePitchStats(frames) {
  const voiced = frames.filter(f => f.pitch > 0).map(f => f.pitch);
  if (voiced.length === 0) return { mean: 0, stdDev: 0, monotoneScore: 0 };

  const mean = voiced.reduce((a, b) => a + b, 0) / voiced.length;
  const variance = voiced.reduce((sum, p) => sum + (p - mean) ** 2, 0) / voiced.length;
  const stdDev = Math.sqrt(variance);

  // Heuristic, not a validated metric: higher stdDev = more pitch variation = less monotone
  const monotoneScore = Math.max(0, Math.min(100, Math.round(100 - stdDev * 2.5)));

  return { mean: round(mean, 1), stdDev: round(stdDev, 1), monotoneScore };
}

function downsample(frames, targetCount) {
  if (frames.length <= targetCount) return frames;
  const step = Math.floor(frames.length / targetCount);
  return frames.filter((_, i) => i % step === 0);
}

function round(n, d) { return Math.round(n * 10 ** d) / 10 ** d; }