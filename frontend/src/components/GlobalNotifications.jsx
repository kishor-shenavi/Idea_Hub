import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { useEffect, useRef } from 'react';

export default function GlobalNotifications() {
  const navigate = useNavigate();
  const { items, remove } = useNotifications();
  const timersRef = useRef({});

  // auto-dismiss each toast after 6s, but only the visual toast pop-up — doesn't touch the bell's list
  useEffect(() => {
    items.forEach(item => {
      if (!timersRef.current[item.id]) {
        timersRef.current[item.id] = setTimeout(() => {
          delete timersRef.current[item.id];
        }, 6000);
      }
    });
  }, [items]);

  const visibleToasts = items.filter(item => timersRef.current[item.id]);

  if (visibleToasts.length === 0) return null;

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {visibleToasts.map(t => (
        <div
          key={t.id}
          onClick={() => { navigate(t.to); remove(t.id); }}
          className="card fade-in"
          style={{ padding: 14, width: 280, cursor: 'pointer', boxShadow: 'var(--shadow-lg)', borderLeft: '3px solid var(--brand)' }}
        >
          <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 4 }}>{t.title}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{t.body}</div>
        </div>
      ))}
    </div>
  );
}