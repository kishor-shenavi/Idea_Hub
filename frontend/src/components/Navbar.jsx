import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext'; // add import
const NAV_LINKS = [
  { to: '/projects', label: 'Projects' },
  { to: '/interview', label: 'Interview' },
  { to: '/viva-simulator', label: 'Viva' },
  { to: '/resume', label: 'Resume ATS' },
  { to: '/internships', label: 'Internships' },
  { to: '/extempore-coach', label: 'Public Speaking' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (to) => location.pathname === to || location.pathname.startsWith(to + '/');
  const [notifOpen, setNotifOpen] = useState(false);
  const { items, remove } = useNotifications(); // replaces the old `const { totalBadge, recent, acknowledge } = useNotifications();`
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1.5px solid var(--border)',
      height: 'var(--nav-h)',
      display: 'flex', alignItems: 'center',
    }}>
      <div style={{ maxWidth: 1200, width: '100%', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
          <span style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: -1,
          }}>IH</span>
          <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text)', letterSpacing: -0.5 }}>IdeaHub</span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }} className="desktop-nav">
          {NAV_LINKS.map(({ to, label }) => (
            <Link key={to} to={to} style={{
              padding: '6px 12px', borderRadius: 8, fontWeight: 500, fontSize: '0.85rem',
              textDecoration: 'none', whiteSpace: 'nowrap',
              color: isActive(to) ? 'var(--brand)' : 'var(--muted)',
              background: isActive(to) ? 'var(--brand-light)' : 'transparent',
              transition: 'all 0.15s',
            }}>{label}</Link>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: 'var(--brand)', color: '#fff',
                  border: 'none', cursor: 'pointer',
                  fontWeight: 700, fontSize: '0.9rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {user.name?.[0]?.toUpperCase() || 'U'}
              </button>
              {menuOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 46,
                  background: 'var(--surface)', border: '1.5px solid var(--border)',
                  borderRadius: 12, padding: 8, minWidth: 200,
                  boxShadow: 'var(--shadow-lg)', zIndex: 200,
                }} className="fade-in">
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{user.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{user.email}</div>
                  </div>
                  {user.role === 'admin' && (
                    <Link to="/admin" style={menuItemStyle} onClick={() => setMenuOpen(false)}>Admin Panel</Link>
                  )}
                  <button onClick={() => { logout(); setMenuOpen(false); }} style={{ ...menuItemStyle, width: '100%', textAlign: 'left', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--danger)' }}>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )
           : (
            <>
              <Link to="/login" className="btn btn-ghost" style={{ fontSize: '0.85rem', padding: '8px 14px' }}>Sign in</Link>
              <Link to="/register" className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '8px 14px' }}>Get started</Link>
            </>
          )}
{user && (
  <div style={{ position: 'relative' }}>
    <button onClick={() => setNotifOpen(!notifOpen)} style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex' }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
      {items.length > 0 && (
        <span style={{ position: 'absolute', top: 0, right: 0, background: 'var(--danger)', color: '#fff', fontSize: '0.65rem', fontWeight: 700, borderRadius: 99, minWidth: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>
          {items.length > 9 ? '9+' : items.length}
        </span>
      )}
    </button>
    {notifOpen && (
      <div style={{ position: 'absolute', right: 0, top: 42, width: 300, maxHeight: 380, overflowY: 'auto', background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 12, boxShadow: 'var(--shadow-lg)', zIndex: 200 }} className="fade-in">
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: '0.85rem' }}>Notifications</div>
        {items.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--muted)', fontSize: '0.8rem' }}>Nothing new.</div>
        ) : items.map(n => (
          <div key={n.id} style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
            <Link to={n.to} onClick={() => { remove(n.id); setNotifOpen(false); }} style={{ flex: 1, display: 'block', padding: '10px 14px', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{n.title}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>{n.body}</div>
            </Link>
            <button onClick={() => remove(n.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '10px 12px', fontSize: '0.9rem' }} title="Dismiss">✕</button>
          </div>
        ))}
      </div>
    )}
  </div>
)}
          {/* Mobile menu toggle */}
          <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="2">
              {menuOpen
                ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: 'var(--nav-h)', left: 0, right: 0,
          background: 'var(--surface)', borderBottom: '1.5px solid var(--border)',
          padding: 20, zIndex: 99, display: 'none',
          maxHeight: 'calc(100vh - var(--nav-h))', overflowY: 'auto',
        }} className="mobile-menu fade-in">
          {NAV_LINKS.map(({ to, label }) => (
            <Link key={to} to={to} onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '12px 0', color: isActive(to) ? 'var(--brand)' : 'var(--text)', fontWeight: 500, textDecoration: 'none', borderBottom: '1px solid var(--border)' }}>{label}</Link>
          ))}
          {user && user.role === 'admin' && (
            <Link to="/admin" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '12px 0', color: 'var(--text)', fontWeight: 500, textDecoration: 'none', borderBottom: '1px solid var(--border)' }}>Admin Panel</Link>
          )}
          <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
            {user ? (
              <button onClick={() => { logout(); setMenuOpen(false); }} className="btn btn-danger" style={{ flex: 1 }}>Sign out</button>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setMenuOpen(false)}>Sign in</Link>
                <Link to="/register" className="btn btn-primary" style={{ flex: 1 }} onClick={() => setMenuOpen(false)}>Get started</Link>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 1050px) and (min-width: 861px) {
          .desktop-nav a { padding: 6px 8px !important; font-size: 0.78rem !important; }
        }
        @media (max-width: 860px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .mobile-menu { display: block !important; }
        }
      `}</style>
    </nav>
  );
}

const menuItemStyle = {
  display: 'block', padding: '8px 12px', borderRadius: 8,
  color: 'var(--text)', textDecoration: 'none', fontSize: '0.875rem',
  fontWeight: 500, transition: 'background 0.12s',
};
