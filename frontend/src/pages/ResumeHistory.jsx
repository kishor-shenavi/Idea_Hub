import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';

const statusBadge = {
  pending: { label: 'Queued', bg: '#fef3c7', c: '#92400e' },
  processing: { label: 'Analyzing…', bg: '#dbeafe', c: '#1e40af' },
  completed: { label: 'Completed', bg: '#d1fae5', c: '#065f46' },
  failed: { label: 'Failed', bg: '#fee2e2', c: '#991b1b' },
};

export default function ResumeHistory() {
  const [scans, setScans] = useState([]);
  //const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
 // const pollRef = useRef(null);

  const fetchHistory = async () => {
    const res = await axios.get('/api/v1/resume/history');
    setScans(res.data.data);
    return res.data.data;
  };

  useEffect(() => {
  let cancelled = false;
  let intervalId = null;

  const checkAndMaybeStop = async () => {
    const fresh = await fetchHistory();
    if (cancelled) return;
    const stillPending = fresh.some(s => s.status === 'pending' || s.status === 'processing');
    if (!stillPending && intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  (async () => {
    const data = await fetchHistory();
    if (cancelled) return; // component already unmounted before this resolved — do nothing, don't start a leaked interval
    setLoading(false);
    const hasPending = data.some(s => s.status === 'pending' || s.status === 'processing');
    if (hasPending) {
      intervalId = setInterval(checkAndMaybeStop, 3000);
    }
  })();

  return () => {
    cancelled = true;
    if (intervalId) clearInterval(intervalId);
  };
}, []);

  if (loading) return <div className="page-container" style={{ maxWidth: 760, textAlign: 'center', padding: 60 }}><span className="spinner" /></div>;

  return (
    <div className="page-container" style={{ maxWidth: 760 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontWeight: 800, fontSize: '1.5rem', letterSpacing: -0.5 }}>Resume Scan History</h1>
        <Link to="/resume" className="btn btn-primary">New Scan</Link>
      </div>

      {scans.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
          No scans yet. <Link to="/resume">Run your first analysis</Link>.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {scans.map(scan => {
  const badge = statusBadge[scan.status] || statusBadge.pending;
  const canOpen = scan.status === 'completed';
  const Wrapper = canOpen ? Link : 'div';
  const wrapperProps = canOpen ? { to: `/resume/history/${scan._id}` } : {};

  return (
    <Wrapper
      key={scan._id}
      {...wrapperProps}
      className="card"
      style={{
        padding: 18,
        display: 'block',
        textDecoration: 'none',
        color: 'inherit',
        cursor: canOpen ? 'pointer' : 'default',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
            {scan.targetRole || 'Untitled scan'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
            {new Date(scan.createdAt).toLocaleString()}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {scan.status === 'completed' && (
            <span style={{ fontWeight: 700 }}>{scan.atsScore}/100</span>
          )}
          <span
            className="tag"
            style={{ background: badge.bg, color: badge.c }}
          >
            {badge.label}
          </span>
        </div>
      </div>
    </Wrapper>
  );
})}
        </div>
      )}
    </div>
  );
}