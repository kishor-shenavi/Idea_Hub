import { useState, useEffect } from 'react';
import axios from '../api/axios';

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
    // note: passing token as query here is a simplification — your /github/oauth
    // route reads it from the Authorization header via `protect`, so adjust
    // to whichever you implement. Keep this consistent between the two.
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
    <div className="page-container" style={{ maxWidth: 860 }}>
      <h1 style={{ fontWeight: 800, fontSize: '1.8rem' }}>GitHub Portfolio Intelligence</h1>
      {!connected ? (
        <button onClick={connectGithub}>Connect GitHub</button>
      ) : (
        <button onClick={analyze} disabled={loading}>
          {loading ? 'Analyzing...' : 'Run Analysis'}
        </button>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {result && (
        <div>
          <h2>Health Score: {result.healthScore}/100</h2>
          <p>{result.recruiterPerception.firstImpression}</p>
          <h3>What a recruiter would assume you know:</h3>
          <ul>{result.recruiterPerception.assumedSkills.map(s => <li key={s}>{s}</li>)}</ul>
          <h3>Gaps they'd notice:</h3>
          <ul>{result.recruiterPerception.noticedGaps.map(s => <li key={s}>{s}</li>)}</ul>
          <h3>Fix before applying:</h3>
          <ul>{result.recruiterPerception.fixBeforeApplying.map(s => <li key={s}>{s}</li>)}</ul>
        </div>
      )}
    </div>
  );
}