import { useState, useEffect, useRef } from 'react';
import axios from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { useSocket } from '../context/SocketContext';
import { useSearchParams } from 'react-router-dom'; 
export default function GithubIntelligence() {
  const [connected, setConnected] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusLabel, setStatusLabel] = useState('');
  const [error, setError] = useState('');
  const pollRef = useRef(null);
 
  const [searchParams, setSearchParams] = useSearchParams();

useEffect(() => {
  const errorParam = searchParams.get('error');
  if (errorParam === 'already_linked') {
    setError('This GitHub account is already connected to a different IdeaHub account. Each GitHub account can only be linked to one profile.');
    setSearchParams({}); // clear the query param so a refresh doesn't re-show the error
  } else if (errorParam === 'connection_failed') {
    setError('Could not connect your GitHub account. Please try again.');
    setSearchParams({});
  }
}, []);

  const socket = useSocket();
const [activeScanId, setActiveScanId] = useState(null);

useEffect(() => {
  if (!socket || !activeScanId) return;
  const handleGithubReady = async (payload) => {
      console.log('🔵 githubScanReady event received:', payload); // add this line first

    if (payload.scanId !== activeScanId) return;
    clearInterval(pollRef.current);
    try {
      const res = await axios.get(`/api/v1/github/scan/${activeScanId}`);
      const scan = res.data.data;
      if (scan.status === 'completed') { setResult(scan); loadHistory(); }
      else setError(scan.errorMessage || 'Analysis failed.');
    } catch {
      setError('Could not load the completed result.');
    } finally {
      setLoading(false); setActiveScanId(null);
    }
  };
  socket.on('githubScanReady', handleGithubReady);
  return () => socket.off('githubScanReady', handleGithubReady);
}, [socket, activeScanId]);









  useEffect(() => {
    axios.get('/api/v1/github/status').then(res => setConnected(res.data.connected));
    loadHistory();
    return () => clearInterval(pollRef.current);
  }, []);

  const loadHistory = async () => {
    try {
      const res = await axios.get('/api/v1/github/history');
      setHistory(res.data.data.filter(s => s.status === 'completed'));
    } catch { /* non-critical, ignore */ }
  };

  const connectGithub = () => {
    const token = localStorage.getItem('token');
    window.location.href = `http://localhost:5000/api/v1/auth/github/oauth?token=${token}`;
  };

  const analyze = async () => {
    setError(''); setLoading(true); setStatusLabel('Queued, waiting to start…'); setResult(null);
    try {
      const res = await axios.post('/api/v1/github/analyze');
      setActiveScanId(res.data.data.scanId);
      pollForResult(res.data.data.scanId);
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed. Please try again.');
      setLoading(false);
    }
  };

  const pollForResult = (scanId) => {
    let attempts = 0;
    pollRef.current = setInterval(async () => {
      attempts++;
      try {
        const res = await axios.get(`/api/v1/github/scan/${scanId}`);
        const scan = res.data.data;
        if (scan.status === 'processing') setStatusLabel('Reading your repositories…');
        if (scan.status === 'completed') {
          clearInterval(pollRef.current);
          setResult(scan);
          setLoading(false);
          loadHistory();
        } else if (scan.status === 'failed') {
          clearInterval(pollRef.current);
          setError(scan.errorMessage || 'Analysis failed.');
          setLoading(false);
        } else if (attempts >= 40) { // GitHub can genuinely take longer than resume (many repo calls) — 80s budget, not 60s
          clearInterval(pollRef.current);
          setError('Taking longer than expected — check your scan history below once it completes.');
          setActiveScanId(null);
          setLoading(false);

        }
      } catch {
        clearInterval(pollRef.current);
        setError('Lost connection while checking analysis status.');
        setActiveScanId(null);
                  setActiveScanId(null);

        setLoading(false);
      }
    }, 2000);
  };

  return (
    <div className="page-container" style={{ maxWidth: 820 }}>
      <LoadingSpinner show={loading} />

      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--brand)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 16 }}>🐙</div>
        <h1 style={{ fontWeight: 800, fontSize: '1.6rem', letterSpacing: -0.5 }}>GitHub Portfolio Intelligence</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: 6, maxWidth: 480, margin: '6px auto 0' }}>
          See exactly what a recruiter would think of your GitHub profile.
        </p>
      </div>

      {error && <div className="error-msg" style={{ marginBottom: 20 }}>{error}</div>}

      <div className="card" style={{ padding: 28, textAlign: 'center', marginBottom: 28 }}>
        {!connected ? (
          <>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: 20 }}>Connect your GitHub account to get started.</p>
            <button onClick={connectGithub} className="btn btn-primary" style={{ padding: '12px 28px' }}>Connect GitHub</button>
          </>
        ) : (
          <>
            <span className="tag" style={{ marginBottom: 16, display: 'inline-flex' }}>✓ GitHub connected</span>
            <div>
              <button onClick={analyze} disabled={loading} className="btn btn-primary" style={{ padding: '12px 28px' }}>
                {loading ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> {statusLabel}</> : 'Run Analysis'}
              </button>
            </div>
          </>
        )}
      </div>

      {result && (
        <div className="fade-in">
          <div className="card" style={{ padding: 28, textAlign: 'center', marginBottom: 20, background: 'linear-gradient(135deg, var(--brand-light), var(--surface))' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Health Score</div>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--brand)', letterSpacing: -2 }}>{result.healthScore}<span style={{ fontSize: '1.2rem', color: 'var(--muted)' }}>/100</span></div>
          </div>
          <div className="card" style={{ padding: 24, marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 10 }}>First impression</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.7, fontStyle: 'italic' }}>"{result.recruiterPerception.firstImpression}"</p>
          </div>
          <div className="grid-2" style={{ marginBottom: 20 }}>
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 14 }}>✓ What a recruiter would assume you know</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {result.recruiterPerception.assumedSkills.map(s => <span key={s} className="tag" style={{ background: '#d1fae5', color: '#065f46' }}>{s}</span>)}
              </div>
            </div>
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 14 }}>⚠ Gaps they'd notice</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {result.recruiterPerception.noticedGaps.map(s => <span key={s} className="tag" style={{ background: '#fee2e2', color: '#991b1b' }}>{s}</span>)}
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

      {history.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 14 }}>Past scans</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {history.map(scan => (
              <div key={scan._id} className="card" style={{ padding: 16, cursor: 'pointer' }} onClick={() => setResult(scan)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{new Date(scan.createdAt).toLocaleString()}</span>
                  <span style={{ fontWeight: 700 }}>{scan.healthScore}/100</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}