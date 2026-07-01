import { useState } from 'react';
import axios from '../api/axios';

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

export default function ResumeScan() {
  const [mode, setMode] = useState('text'); // text | file
  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [jd, setJd] = useState('');
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyze = async () => {
    setError(''); setLoading(true);
    try {
      let data;
      if (mode === 'file' && file) {
        const fd = new FormData();
        fd.append('resume', file);
        if (targetRole) fd.append('targetRole', targetRole);
        if (jd) fd.append('jobDescription', jd);
        const res = await axios.post('/api/v1/resume/analyze', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        data = res.data.data;
      } else {
        const res = await axios.post('/api/v1/resume/analyze', { resumeText, targetRole, jobDescription: jd });
        data = res.data.data;
      }
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="page-container" style={{ maxWidth: 860 }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
        <h1 style={{ fontWeight: 800, fontSize: '1.8rem', letterSpacing: -0.5, marginBottom: 8 }}>ATS Resume Checker</h1>
        <p style={{ color: 'var(--muted)', maxWidth: 500, margin: '0 auto' }}>Get an instant ATS score and specific improvements for your resume</p>
      </div>

      {!result ? (
        <div className="card" style={{ padding: 28 }}>
          {/* Mode toggle */}
          <div style={{ display: 'flex', gap: 0, border: '1.5px solid var(--border)', borderRadius: 8, overflow: 'hidden', marginBottom: 20, width: 'fit-content' }}>
            {['text', 'file'].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{ padding: '8px 20px', background: mode === m ? 'var(--brand)' : 'transparent', color: mode === m ? '#fff' : 'var(--muted)', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', fontFamily: 'var(--font)' }}>
                {m === 'text' ? '📝 Paste text' : '📎 Upload PDF'}
              </button>
            ))}
          </div>

          {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {mode === 'text' ? (
              <div>
                <label className="label">Resume text *</label>
                <textarea className="input" rows={10} value={resumeText} onChange={e => setResumeText(e.target.value)} placeholder="Paste your entire resume here…" style={{ resize: 'vertical', fontFamily: 'var(--mono)', fontSize: '0.8rem' }} />
              </div>
            ) : (
              <div>
                <label className="label">Resume PDF *</label>
                <div style={{ border: '2px dashed var(--border)', borderRadius: 10, padding: 28, textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.15s' }}
                  onClick={() => document.getElementById('resume-file').click()}
                  onDragOver={e => { e.preventDefault(); }}
                  onDrop={e => { e.preventDefault(); setFile(e.dataTransfer.files[0]); }}
                >
                  <input id="resume-file" type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />
                  {file ? (
                    <div><p style={{ fontWeight: 600, color: 'var(--brand)' }}>✅ {file.name}</p><p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 4 }}>{(file.size / 1024).toFixed(0)} KB</p></div>
                  ) : (
                    <div><p style={{ color: 'var(--muted)' }}>Drop PDF here or click to browse</p><p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 4 }}>Max 5MB</p></div>
                  )}
                </div>
              </div>
            )}

            <div className="grid-2">
              <div><label className="label">Target role (optional)</label><input className="input" value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder="SDE Intern, Data Analyst…" /></div>
            </div>

            <div>
              <label className="label">Job description (optional — improves accuracy)</label>
              <textarea className="input" rows={4} value={jd} onChange={e => setJd(e.target.value)} placeholder="Paste the job description you're applying for…" style={{ resize: 'vertical' }} />
            </div>

            <button className="btn btn-primary" onClick={analyze} disabled={loading || (mode === 'text' && !resumeText.trim()) || (mode === 'file' && !file)} style={{ justifyContent: 'center', padding: '13px 20px' }}>
              {loading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Analyzing with AI…</> : '✨ Analyze resume'}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Score card */}
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
            <button className="btn btn-ghost" onClick={() => setResult(null)}>Try again</button>
          </div>

          <div className="grid-2">
            {/* Strengths */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--success)', marginBottom: 12 }}>✅ Strengths</h3>
              <ul style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {result.strengths?.map((s, i) => <li key={i} style={{ fontSize: '0.875rem', display: 'flex', gap: 8 }}><span>→</span>{s}</li>)}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--danger)', marginBottom: 12 }}>❌ Weaknesses</h3>
              <ul style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {result.weaknesses?.map((w, i) => <li key={i} style={{ fontSize: '0.875rem', display: 'flex', gap: 8 }}><span>→</span>{w}</li>)}
              </ul>
            </div>
          </div>

          {/* Keywords */}
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

          {/* Improvements */}
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

          {/* Section feedback */}
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
      )}
    </div>
  );
}
