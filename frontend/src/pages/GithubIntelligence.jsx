import { useState, useEffect } from 'react';
import axios from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';

export default function GithubIntelligence() {
  const [connected, setConnected] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/api/v1/github/status').then(res => setConnected(res.data.connected));
  }, []);

  const connectGithub = () => {
    const token = localStorage.getItem('token');
    window.location.href = `http://localhost:5000/api/v1/auth/github/oauth?token=${token}`;
  };

  const analyze = async () => {
    setError(''); setLoading(true);
    try {
      const res = await axios.post('/api/v1/github/analyze');
      setResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="page-container" style={{ maxWidth: 820 }}>
      <LoadingSpinner show={loading} />

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--brand)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 16 }}>🐙</div>
        <h1 style={{ fontWeight: 800, fontSize: '1.6rem', letterSpacing: -0.5 }}>GitHub Portfolio Intelligence</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: 6, maxWidth: 480, margin: '6px auto 0' }}>
          See exactly what a recruiter would think of your GitHub profile.
        </p>
      </div>

      {error && <div className="error-msg" style={{ marginBottom: 20 }}>{error}</div>}

      {/* Action card */}
      <div className="card" style={{ padding: 28, textAlign: 'center', marginBottom: 28 }}>
        {!connected ? (
          <>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: 20 }}>
              Connect your GitHub account to get started.
            </p>
            <button onClick={connectGithub} className="btn btn-primary" style={{ padding: '12px 28px' }}>
              Connect GitHub
            </button>
          </>
        ) : (
          <>
            <span className="tag" style={{ marginBottom: 16, display: 'inline-flex' }}>✓ GitHub connected</span>
            <div>
              <button onClick={analyze} disabled={loading} className="btn btn-primary" style={{ padding: '12px 28px' }}>
                {loading ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : 'Run Analysis'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="fade-in">
          <div className="card" style={{ padding: 28, textAlign: 'center', marginBottom: 20, background: 'linear-gradient(135deg, var(--brand-light), var(--surface))' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Health Score</div>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--brand)', letterSpacing: -2 }}>{result.healthScore}<span style={{ fontSize: '1.2rem', color: 'var(--muted)' }}>/100</span></div>
          </div>

          <div className="card" style={{ padding: 24, marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 10 }}>First impression</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.7, fontStyle: 'italic' }}>
              "{result.recruiterPerception.firstImpression}"
            </p>
          </div>

          <div className="grid-2" style={{ marginBottom: 20 }}>
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 14 }}>✓ What a recruiter would assume you know</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {result.recruiterPerception.assumedSkills.map(s => (
                  <span key={s} className="tag" style={{ background: '#d1fae5', color: '#065f46' }}>{s}</span>
                ))}
              </div>
            </div>
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 14 }}>⚠ Gaps they'd notice</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {result.recruiterPerception.noticedGaps.map(s => (
                  <span key={s} className="tag" style={{ background: '#fee2e2', color: '#991b1b' }}>{s}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 14 }}>🛠 Fix before applying</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {result.recruiterPerception.fixBeforeApplying.map(s => (
                <li key={s} style={{ fontSize: '0.875rem', color: 'var(--text)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--brand)', flexShrink: 0, fontWeight: 700 }}>→</span> {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
