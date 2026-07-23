function ScoreCircle({ score }) {
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : score >= 40 ? '#f97316' : '#ef4444';
  const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Average' : 'Poor';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 100, height: 100, borderRadius: '50%', border: `6px solid ${color}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: `${color}10` }}>
        <span style={{ fontSize: '1.8rem', fontWeight: 800, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: '0.65rem', color: 'var(--muted)', fontWeight: 600 }}>/ 100</span>
      </div>
      <span style={{ fontSize: '0.8rem', fontWeight: 700, color }}>{label}</span>
    </div>
  );
}

export default function ResumeResultView({ result, onTryAgain }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="card" style={{ padding: 28, display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
        <ScoreCircle score={result.atsScore} />
        <div style={{ flex: 1 }}>
          <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>ATS Score: {result.atsScore}/100</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>{result.overallFeedback}</p>
          {result.scoreBreakdown && (
            <div style={{ display: 'flex', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
              {Object.entries(result.scoreBreakdown).map(([k, v]) => (
                <div key={k} style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{v}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'capitalize' }}>{k}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        {onTryAgain && <button className="btn btn-ghost" onClick={onTryAgain}>Try again</button>}
      </div>

      <div className="grid-2">
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--success)', marginBottom: 12 }}>✅ Strengths</h3>
          <ul style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {result.strengths?.map((s, i) => <li key={i} style={{ fontSize: '0.875rem', display: 'flex', gap: 8 }}><span>→</span>{s}</li>)}
          </ul>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--danger)', marginBottom: 12 }}>❌ Weaknesses</h3>
          <ul style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {result.weaknesses?.map((w, i) => <li key={i} style={{ fontSize: '0.875rem', display: 'flex', gap: 8 }}><span>→</span>{w}</li>)}
          </ul>
        </div>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 14 }}>🔍 Keywords</h3>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success)', marginBottom: 8 }}>PRESENT</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {result.presentKeywords?.map(k => <span key={k} style={{ padding: '3px 10px', background: '#d1fae5', color: '#065f46', borderRadius: 99, fontSize: '0.78rem', fontWeight: 600 }}>{k}</span>)}
            </div>
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--danger)', marginBottom: 8 }}>MISSING</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {result.missingKeywords?.map(k => <span key={k} style={{ padding: '3px 10px', background: '#fee2e2', color: '#991b1b', borderRadius: 99, fontSize: '0.78rem', fontWeight: 600 }}>{k}</span>)}
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 14 }}>🚀 Improvements</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {result.improvements?.map((imp, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 14px', background: 'var(--surface2)', borderRadius: 8 }}>
              <span style={{ fontWeight: 700, color: 'var(--brand)', flexShrink: 0 }}>{i + 1}</span>
              <span style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>{imp}</span>
            </div>
          ))}
        </div>
      </div>

      {result.sectionFeedback && (
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 14 }}>📋 Section feedback</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.entries(result.sectionFeedback).filter(([, v]) => v).map(([section, feedback]) => (
              <div key={section} style={{ paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'capitalize', color: 'var(--brand)', marginBottom: 4 }}>{section}</div>
                <p style={{ fontSize: '0.875rem', color: 'var(--muted)', lineHeight: 1.6 }}>{feedback}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}