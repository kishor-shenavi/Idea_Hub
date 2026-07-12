export default function SpeechTimeline({ audioAnalysis, fillerWords, durationSeconds }) {
  const { frames, pauseSegments } = audioAnalysis;
  if (!frames || frames.length === 0) return null;

  const width = 800, height = 180, padding = 30;
  const maxTime = durationSeconds;
  const x = t => padding + (t / maxTime) * (width - padding * 2);
  const maxRms = Math.max(...frames.map(f => f.rms), 0.01);
  const yEnergy = rms => height - padding - (rms / maxRms) * (height - padding * 2);

  const energyPath = frames.map((f, i) => `${i === 0 ? 'M' : 'L'} ${x(f.time)} ${yEnergy(f.rms)}`).join(' ');

  const allFillerTimestamps = fillerWords.flatMap(f => f.timestamps);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', background: '#fafafa', borderRadius: 8 }}>
      {/* Pause segments shaded */}
      {pauseSegments.map((seg, i) => (
        <rect key={i} x={x(seg.start)} y={padding} width={x(seg.end) - x(seg.start)} height={height - padding * 2}
          fill="rgba(255,80,80,0.15)" />
      ))}

      {/* Energy line */}
      <path d={energyPath} fill="none" stroke="#4f46e5" strokeWidth="1.5" />

      {/* Filler word markers */}
      {allFillerTimestamps.map((t, i) => (
        <line key={i} x1={x(t)} x2={x(t)} y1={padding} y2={height - padding} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3,2" />
      ))}

      {/* Axis */}
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#ccc" />
      <text x={padding} y={height - 8} fontSize="10" fill="#888">0s</text>
      <text x={width - padding - 20} y={height - 8} fontSize="10" fill="#888">{Math.round(maxTime)}s</text>

      {/* Legend */}
      <text x={padding} y={16} fontSize="10" fill="#4f46e5">— energy</text>
      <text x={padding + 60} y={16} fontSize="10" fill="#f59e0b">┊ filler word</text>
      <text x={padding + 150} y={16} fontSize="10" fill="#e57373">▬ pause</text>
    </svg>
  );
}