import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../api/axios';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext'; // add import
export default function MentorChat() {
  const { id } = useParams();
  const socket = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

useEffect(() => {
  axios.get(`/api/v1/mentor/${id}/messages`)
    .then(res => setMessages(res.data.data))
    .catch(err => setError(err.response?.data?.error || 'Could not load chat'));
  axios.put(`/api/v1/mentor/${id}/messages/read`).catch(() => {}); // add this line — clears the dot for this conversation
}, [id]);

  useEffect(() => {
    if (!socket) return;
    socket.emit('joinMentorChat', id);

    const handleNew = (msg) => {
      if (msg.mentorRequest === id) setMessages(m => [...m, msg]);
    };
    socket.on('newMentorMessage', handleNew);

    return () => {
      socket.emit('leaveMentorChat', id);
      socket.off('newMentorMessage', handleNew);
    };
  }, [socket, id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = (e) => {
    e.preventDefault();
    if (!text.trim() || !socket) return;
    socket.emit('sendMentorMessage', { requestId: id, content: text.trim() }, (res) => {
      if (res.status === 'error') setError(res.error);
    });
    setText('');
  };

  const { setActiveChat } = useNotifications();

useEffect(() => {
  setActiveChat({ type: 'mentorChat', id });
  return () => setActiveChat(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [id]);
  return (
    <div className="page-container" style={{ maxWidth: 700 }}>
      <Link to="/mentor" style={{ fontSize: '0.8rem', color: 'var(--brand)', marginBottom: 16, display: 'inline-block' }}>← Back to Mentor Connect</Link>

      {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="card" style={{ height: 480, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map(m => {
            const isMine = m.sender?._id === user?.id;
            return (
              <div key={m._id} style={{ alignSelf: isMine ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                {!isMine && <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: 2 }}>{m.sender?.name}</div>}
                <div style={{ background: isMine ? 'var(--brand)' : 'var(--surface2)', color: isMine ? '#fff' : 'var(--text)', padding: '8px 14px', borderRadius: 14, fontSize: '0.875rem', lineHeight: 1.5 }}>
                  {m.content}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={send} style={{ display: 'flex', gap: 8, padding: 14, borderTop: '1px solid var(--border)' }}>
          <input className="input" placeholder="Type a message…" value={text} onChange={e => setText(e.target.value)} style={{ flex: 1 }} />
          <button type="submit" className="btn btn-primary">Send</button>
        </form>
      </div>
    </div>
  );
}