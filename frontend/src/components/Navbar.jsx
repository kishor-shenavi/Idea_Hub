import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { to: '/projects', label: 'Projects' },
  { to: '/paths', label: 'Paths' },
  { to: '/internships', label: 'Internships' },
  { to: '/regrets', label: 'Regret Board' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (to) => location.pathname === to || location.pathname.startsWith(to + '/');

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
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <span style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: -1,
          }}>IH</span>
          <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text)', letterSpacing: -0.5 }}>IdeaHub</span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
          {NAV_LINKS.map(({ to, label }) => (
            <Link key={to} to={to} style={{
              padding: '6px 14px', borderRadius: 8, fontWeight: 500, fontSize: '0.875rem',
              textDecoration: 'none',
              color: isActive(to) ? 'var(--brand)' : 'var(--muted)',
              background: isActive(to) ? 'var(--brand-light)' : 'transparent',
              transition: 'all 0.15s',
            }}>{label}</Link>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {user ? (
            <>
              <Link to="/projects/create" className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '8px 14px' }}>
                + New Project
              </Link>
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
                    borderRadius: 12, padding: 8, minWidth: 180,
                    boxShadow: 'var(--shadow-lg)', zIndex: 200,
                  }} className="fade-in">
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{user.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{user.email}</div>
                    </div>
                    {user.role === 'admin' && (
                      <Link to="/admin" style={menuItemStyle} onClick={() => setMenuOpen(false)}>Admin Panel</Link>
                    )}
                    <Link to="/roadmap" style={menuItemStyle} onClick={() => setMenuOpen(false)}>My Roadmap</Link>
                    <Link to="/resume" style={menuItemStyle} onClick={() => setMenuOpen(false)}>Resume ATS</Link>
                    <Link to="/buildlogs" style={menuItemStyle} onClick={() => setMenuOpen(false)}>Build in Public</Link>
                    <button onClick={() => { logout(); setMenuOpen(false); }} style={{ ...menuItemStyle, width: '100%', textAlign: 'left', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--danger)' }}>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost" style={{ fontSize: '0.875rem', padding: '8px 14px' }}>Sign in</Link>
              <Link to="/register" className="btn btn-primary" style={{ fontSize: '0.875rem', padding: '8px 14px' }}>Get started</Link>
            </>
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
        }} className="mobile-menu fade-in">
          {NAV_LINKS.map(({ to, label }) => (
            <Link key={to} to={to} onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '12px 0', color: isActive(to) ? 'var(--brand)' : 'var(--text)', fontWeight: 500, textDecoration: 'none', borderBottom: '1px solid var(--border)' }}>{label}</Link>
          ))}
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
        @media (max-width: 768px) {
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
