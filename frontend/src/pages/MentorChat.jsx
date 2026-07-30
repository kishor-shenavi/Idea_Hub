import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../api/axios';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { getOrCreateKeyPair, importPublicKeyJwk, deriveSharedKey, encryptMessage, decryptMessage } from '../utils/e2ee';

export default function MentorChat() {
  const { id } = useParams();
  const socket = useSocket();
  const { user } = useAuth();
  const { setActiveChat } = useNotifications();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false); // true once the shared key is derived and we can encrypt/decrypt
  const bottomRef = useRef(null);
  const sharedKeyRef = useRef(null);

  useEffect(() => {
    setActiveChat({ type: 'mentorChat', id });
    return () => setActiveChat(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Key exchange + load & decrypt history
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`/api/v1/mentor/requests/${id}`);
        const request = data.data;
        const otherUserId = request.student._id === user.id ? request.senior._id : request.student._id;

        const { privateKey } = await getOrCreateKeyPair();
        const { data: keyRes } = await axios.get(`/api/v1/auth/public-key/${otherUserId}`);
        const theirPublicKey = await importPublicKeyJwk(keyRes.data.publicKey);
        sharedKeyRef.current = await deriveSharedKey(privateKey, theirPublicKey);

        const historyRes = await axios.get(`/api/v1/mentor/${id}/messages`);
        const decrypted = await Promise.all(historyRes.data.data.map(async m => ({
          ...m, text: await decryptMessage(sharedKeyRef.current, m.ciphertext, m.iv),
        })));
        setMessages(decrypted);
        setReady(true);
        axios.put(`/api/v1/mentor/${id}/messages/read`).catch(() => {});
      } catch (err) {
        setError(err.response?.data?.error || 'Could not set up encrypted chat. The other participant may not have opened chat yet — ask them to open this conversation once, then refresh.');
      }
    })();
  }, [id, user.id]);

  useEffect(() => {
    if (!socket) return;
    socket.emit('joinMentorChat', id);

    const handleNew = async (msg) => {
      if (msg.mentorRequest !== id || !sharedKeyRef.current) return;
      const text = await decryptMessage(sharedKeyRef.current, msg.ciphertext, msg.iv);
      setMessages(m => [...m, { ...msg, text }]);
    };
    socket.on('newMentorMessage', handleNew);

    return () => {
      socket.emit('leaveMentorChat', id);
      socket.off('newMentorMessage', handleNew);
    };
  }, [socket, id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || !socket || !sharedKeyRef.current) return;
    const { ciphertext, iv } = await encryptMessage(sharedKeyRef.current, text.trim());
    socket.emit('sendMentorMessage', { requestId: id, ciphertext, iv }, (res) => {
      if (res.status === 'error') setError(res.error);
    });
    setText('');
  };

  return (
    <div className="page-container" style={{ maxWidth: 700 }}>
      <Link to="/mentor" style={{ fontSize: '0.8rem', color: 'var(--brand)', marginBottom: 16, display: 'inline-block' }}>← Back to Mentor Connect</Link>
      <div className="tag" style={{ marginBottom: 12, display: 'inline-flex', background: '#d1fae5', color: '#065f46' }}>🔒 End-to-end encrypted</div>

      {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="card" style={{ height: 480, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {!ready && !error && <p style={{ color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center' }}>Setting up encrypted connection…</p>}
          {messages.map(m => {
            const isMine = m.sender?._id === user?.id;
            return (
              <div key={m._id} style={{ alignSelf: isMine ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                {!isMine && <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: 2 }}>{m.sender?.name}</div>}
                <div style={{ background: isMine ? 'var(--brand)' : 'var(--surface2)', color: isMine ? '#fff' : 'var(--text)', padding: '8px 14px', borderRadius: 14, fontSize: '0.875rem', lineHeight: 1.5 }}>
                  {m.text}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={send} style={{ display: 'flex', gap: 8, padding: 14, borderTop: '1px solid var(--border)' }}>
          <input className="input" placeholder="Type a message…" value={text} onChange={e => setText(e.target.value)} disabled={!ready} style={{ flex: 1 }} />
          <button type="submit" className="btn btn-primary" disabled={!ready}>Send</button>
        </form>
      </div>
    </div>
  );
}