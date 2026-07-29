import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import axios from '../api/axios';
import { useNotifications } from '../context/NotificationContext'; // add import
function isValidId(id) { return /^[a-fA-F0-9]{24}$/.test(id); }

export default function Chat() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);
const [loadError, setLoadError] = useState('');
  useEffect(() => {
    if (!isValidId(projectId)) return navigate('/projects');
  const load = async () => {
  setLoadError('');
  try {
    const [msgRes, projRes] = await Promise.all([
      axios.get(`/api/v1/chat/${projectId}/messages`),
      axios.get(`/api/v1/projects/${projectId}`),
    ]);
    setMessages(msgRes.data.data || []);
    setProject(projRes.data.data);
    axios.put(`/api/v1/chat/${projectId}/messages/read`).catch(() => {});
  } catch (err) {
    console.error(err);
    setLoadError(err.response?.data?.error || 'Could not load this conversation. Please refresh.');
  } finally {
    setLoading(false);
  }
};
    load();
  }, [projectId, navigate]);

  useEffect(() => {
    if (!socket || !projectId) return;
    socket.emit('joinProject', projectId);

    const handleMsg = (msg) => {
      setMessages(prev => prev.some(m => m._id === msg._id) ? prev : [...prev, msg]);
      setTyping(false);
    };
    const handleTyping = ({ userId }) => {
      if (userId !== user?._id) setTyping(true);
    };
    const handleStopTyping = () => setTyping(false);

    socket.on('newProjectMessage', handleMsg);
    socket.on('userTyping', handleTyping);
    socket.on('userStoppedTyping', handleStopTyping);
    return () => {
      socket.off('newProjectMessage', handleMsg);
      socket.off('userTyping', handleTyping);
      socket.off('userStoppedTyping', handleStopTyping);
      socket.emit('leaveProject', projectId);
    };
  }, [socket, projectId, user]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typing]);
 

 const { setActiveChat } = useNotifications(); // add near your other hooks

useEffect(() => {
  setActiveChat({ type: 'project', id: projectId });
  return () => setActiveChat(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [projectId]);
   

  const handleInput = (val) => {
    setInput(val);
    if (!socket) return;
    socket.emit('typing', { projectId });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => socket.emit('stopTyping', { projectId }), 1500);
  };

  const send = () => {
    if (!input.trim() || !socket) return;
    socket.emit('sendProjectMessage', { projectId, content: input.trim() });
    clearTimeout(typingTimer.current);
    socket.emit('stopTyping', { projectId });
    setInput('');
  };

  
const isOwner = (msg) => project?.createdBy?._id === (typeof msg.sender === 'object' ? msg.sender._id : msg.sender);
const isMine = (msg) => (typeof msg.sender === 'object' ? msg.sender._id : msg.sender) === user?.id;
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - var(--nav-h))', color: 'var(--muted)' }}>Loading chat…</div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--nav-h))' }}>
      {/* Header */}
      <div style={{ padding: '14px 20px', background: 'var(--surface)', borderBottom: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15,18 9,12 15,6"/></svg>
        </button>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{project?.title || 'Project Chat'}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>by {typeof project?.createdBy === 'object' ? project.createdBy.name : 'Senior'}</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--bg)' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--muted)' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>💬</div>
            <p style={{ fontWeight: 600, marginBottom: 4 }}>No messages yet</p>
            <p style={{ fontSize: '0.875rem' }}>Start the conversation!</p>
          </div>
        )}
        {messages.map(msg => {
          if (!msg?.sender) return null;
          const mine = isMine(msg);
          const owner = isOwner(msg);
          const senderName = typeof msg.sender === 'object' ? msg.sender.name : 'Unknown';
          return (
            <div key={msg._id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '72%', display: 'flex', flexDirection: 'column', gap: 3, alignItems: mine ? 'flex-end' : 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {!mine && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: owner ? 'var(--brand)' : 'var(--muted)' }}>
                      {owner ? '👑 ' : ''}{senderName}
                    </span>
                  )}
                </div>
                {loadError && (
  <div style={{ padding: '12px 20px', background: '#fee2e2', color: '#991b1b', fontSize: '0.85rem', textAlign: 'center' }}>
    {loadError}
  </div>
)}
                <div style={{
                  padding: '10px 14px', borderRadius: mine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background: mine ? 'var(--brand)' : 'var(--surface)',
                  color: mine ? '#fff' : 'var(--text)',
                  border: mine ? 'none' : '1.5px solid var(--border)',
                  fontSize: '0.875rem', lineHeight: 1.5,
                  boxShadow: mine ? '0 2px 8px rgba(91,76,245,0.2)' : 'var(--shadow)',
                }}>
                  {msg.content}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        {typing && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: '14px 14px 14px 4px', padding: '10px 14px', display: 'flex', gap: 4 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--muted)', animation: `bounce 1.2s ${i * 0.2}s ease-in-out infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '14px 20px', background: 'var(--surface)', borderTop: '1.5px solid var(--border)', display: 'flex', gap: 10 }}>
        <input
          className="input"
          style={{ flex: 1, borderRadius: 24 }}
          value={input}
          onChange={e => handleInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Type a message…"
        />
        <button
          onClick={send}
          disabled={!input.trim()}
          style={{
            width: 42, height: 42, borderRadius: '50%',
            background: input.trim() ? 'var(--brand)' : 'var(--surface2)',
            border: 'none', cursor: input.trim() ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.15s', flexShrink: 0,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={input.trim() ? '#fff' : 'var(--muted)'} strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg>
        </button>
      </div>

      <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }`}</style>
    </div>
  );
}
