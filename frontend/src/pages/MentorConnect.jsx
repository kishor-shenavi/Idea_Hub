import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useNotifications } from '../context/NotificationContext'; // add import

const statusColor = {
  pending: { bg: '#fef3c7', c: '#92400e' },
  accepted: { bg: '#d1fae5', c: '#065f46' },
  rejected: { bg: '#fee2e2', c: '#991b1b' },
};
export default function MentorConnect() {
  const { user } = useAuth();
  const [tab, setTab] = useState('browse');
  const [seniors, setSeniors] = useState([]);
  const [search, setSearch] = useState('');
  const [sent, setSent] = useState([]);
  const [received, setReceived] = useState([]);
  const [requestModal, setRequestModal] = useState(null); // senior being requested
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const { setActiveView } = useNotifications();

useEffect(() => {
  setActiveView(tab === 'received' ? 'mentor-received' : null);
  return () => setActiveView(null);
}, [tab]);


  const loadSeniors = async () => {
    const res = await axios.get(`/api/v1/mentor/seniors${search ? `?search=${search}` : ''}`);
    setSeniors(res.data.data);
  };
  const loadSent = async () => { const res = await axios.get('/api/v1/mentor/requests/sent'); setSent(res.data.data); };
  const loadReceived = async () => { const res = await axios.get('/api/v1/mentor/requests/received'); setReceived(res.data.data); };
  

  const socket = useSocket();
const [unreadChats, setUnreadChats] = useState(new Set());

useEffect(() => {
  axios.get('/api/v1/mentor/unread').then(res => setUnreadChats(new Set(res.data.data)));
}, []);

useEffect(() => {
  if (!socket) return;

  const handleNewRequest = (req) => setReceived(prev => [req, ...prev]);
  const handleStatusUpdate = (req) => setSent(prev => prev.map(r => r._id === req._id ? req : r));
  const handleMsgNotif = (payload) => setUnreadChats(prev => new Set(prev).add(payload.requestId));

  socket.on('newMentorRequest', handleNewRequest);
  socket.on('mentorRequestUpdate', handleStatusUpdate);
  socket.on('mentorMessageNotification', handleMsgNotif);

  return () => {
    socket.off('newMentorRequest', handleNewRequest);
    socket.off('mentorRequestUpdate', handleStatusUpdate);
    socket.off('mentorMessageNotification', handleMsgNotif);
  };
}, [socket]); 

  useEffect(() => {
    if (tab === 'browse') loadSeniors();
    if (tab === 'sent') loadSent();
    if (tab === 'received') loadReceived();
  }, [tab]);

  useEffect(() => { if (tab === 'browse') loadSeniors(); }, [search]);

  const sendRequest = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('/api/v1/mentor/request', { seniorId: requestModal._id, message });
      setRequestModal(null);
      setMessage('');
      setTab('sent');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not send request');
    }
  };

  const respond = async (id, status) => {
    await axios.put(`/api/v1/mentor/requests/${id}/respond`, { status });
    loadReceived();
  };

  const cancel = async (id) => {
    await axios.delete(`/api/v1/mentor/requests/${id}`);
    loadSent();
  };

  const TABS = user?.role === 'senior' ? ['browse', 'sent', 'received'] : ['browse', 'sent'];

  return (
    <div className="page-container" style={{ maxWidth: 820 }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <h1 style={{ fontWeight: 800, fontSize: '1.6rem', letterSpacing: -0.5 }}>🎯 Mentor Connect</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: 4 }}>Reach out to seniors for guidance, or manage requests you've received.</p>
      </div>

      <div style={{ display: 'flex', borderBottom: '1.5px solid var(--border)', marginBottom: 24, justifyContent: 'center' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', fontFamily: 'var(--font)', color: tab === t ? 'var(--brand)' : 'var(--muted)', borderBottom: tab === t ? '2px solid var(--brand)' : '2px solid transparent', marginBottom: -1.5, textTransform: 'capitalize' }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'browse' && (
        <>
          <input className="input" placeholder="Search seniors by name" value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: 20 }} />
          {seniors.length === 0 ? (
            <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>No seniors found.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
              {seniors.map(s => (
                <div key={s._id} className="card" style={{ padding: 20 }}>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{s.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: 10 }}>{s.branch}</div>
                  {s.bio && <p style={{ fontSize: '0.8rem', color: 'var(--text)', marginBottom: 12, lineHeight: 1.5 }}>{s.bio}</p>}
                  <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem' }} onClick={() => setRequestModal(s)}>Request mentorship</button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'sent' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sent.length === 0 ? <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>No requests sent yet.</div> :
            sent.map(r => (
              <div key={r._id} className="card" style={{ padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{r.senior?.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{r.senior?.branch}</div>
                    <p style={{ fontSize: '0.85rem', marginTop: 6 }}>{r.message}</p>
                    {r.responseMessage && <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 6, fontStyle: 'italic' }}>Reply: {r.responseMessage}</p>}
                  </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
  <span className="tag" style={{ background: statusColor[r.status]?.bg, color: statusColor[r.status]?.c }}>{r.status}</span>
  {r.status === 'accepted' && (
    <Link to={`/mentor/chat/${r._id}`} className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '4px 10px', position: 'relative' }}>
      Open chat
      {unreadChats.has(r._id) && <span style={{ position: 'absolute', top: -3, right: -3, width: 8, height: 8, borderRadius: '50%', background: '#22c55e', border: '1.5px solid var(--surface)' }} />}
    </Link>
  )}
  {r.status === 'pending' && <button onClick={() => cancel(r._id)} className="btn btn-danger" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>Cancel</button>}
</div>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {tab === 'received' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {received.length === 0 ? <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>No requests received yet.</div> :
            received.map(r => (
              <div key={r._id} className="card" style={{ padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{r.student?.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{r.student?.branch} · Year {r.student?.year}</div>
                    <p style={{ fontSize: '0.85rem', marginTop: 6 }}>{r.message}</p>
                  </div>
               {r.status === 'pending' ? (
  <div style={{ display: 'flex', gap: 8 }}>
    <button onClick={() => respond(r._id, 'accepted')} className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '6px 12px', background: 'var(--success)', borderColor: 'var(--success)' }}>Accept</button>
    <button onClick={() => respond(r._id, 'rejected')} className="btn btn-danger" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>Decline</button>
  </div>
) : r.status === 'accepted' ? (
  <Link to={`/mentor/chat/${r._id}`} className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '6px 12px', position: 'relative' }}>
    Open chat
    {unreadChats.has(r._id) && <span style={{ position: 'absolute', top: -3, right: -3, width: 8, height: 8, borderRadius: '50%', background: '#22c55e', border: '1.5px solid var(--surface)' }} />}
  </Link>
) : (
  <span className="tag" style={{ background: statusColor[r.status]?.bg, color: statusColor[r.status]?.c }}>{r.status}</span>
)}
                </div>
              </div>
            ))
          }
        </div>
      )}

      {requestModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }} onClick={() => setRequestModal(null)}>
          <form onSubmit={sendRequest} className="card" style={{ padding: 28, maxWidth: 420, width: '90%' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Request mentorship from {requestModal.name}</h3>
            {error && <div className="error-msg" style={{ marginBottom: 14 }}>{error}</div>}
            <textarea className="input" rows={4} required maxLength={500} placeholder="Introduce yourself and what you'd like guidance on..." value={message} onChange={e => setMessage(e.target.value)} style={{ marginBottom: 16, resize: 'vertical' }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setRequestModal(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Send request</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
