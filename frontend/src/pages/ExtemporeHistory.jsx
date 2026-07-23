import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';

export default function ExtemporeHistory() {
  const [sessions, setSessions] = useState([]);
  useEffect(() => { axios.get('/api/v1/extempore/history').then(res => setSessions(res.data.data)); }, []);

  return (
    <div className="page-container" style={{ maxWidth: 760 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontWeight: 800, fontSize: '1.5rem' }}>Speaking Practice History</h1>
        <Link to="/extempore-coach" className="btn btn-primary">Practice Again</Link>
      </div>
      {sessions.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>No sessions yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sessions.map(s => (
            <div key={s._id} className="card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{s.topic}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{new Date(s.createdAt).toLocaleString()}</div>
                </div>
                <span className="tag" style={{ background: '#d1fae5', color: '#065f46' }}>{s.coachFeedback?.overallScore}/100</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}