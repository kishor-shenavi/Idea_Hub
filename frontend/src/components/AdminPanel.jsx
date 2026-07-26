import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

const STATUS_COLORS = {
  pending: { bg: '#fef3c7', color: '#92400e' },
  approved: { bg: '#d1fae5', color: '#065f46' },
  rejected: { bg: '#fee2e2', color: '#991b1b' },
  active: { bg: '#d1fae5', color: '#065f46' },
};

export default function AdminPanel() {
  const { user } = useAuth();
  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [internships, setInternships] = useState([]);
  const [users, setUsers] = useState([]);
  const [regrets, setRegrets] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data } = await axios.get('/api/v1/admin/stats');
        setStats(data.data);
      } catch { }
    };
    loadStats();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try { const { data } = await axios.get('/api/v1/admin/projects?status=pending'); setProjects(data.data); } catch { } finally { setLoading(false); }
  };

  const loadInternships = async () => {
    setLoading(true);
    try { const { data } = await axios.get('/api/v1/admin/internships?status=pending'); setInternships(data.data); } catch { } finally { setLoading(false); }
  };

  const loadUsers = async () => {
    setLoading(true);
    try { const { data } = await axios.get('/api/v1/admin/users'); setUsers(data.data); } catch { } finally { setLoading(false); }
  };

  const loadRegrets = async () => {
    setLoading(true);
    try { const { data } = await axios.get('/api/v1/regrets'); setRegrets(data.data); } catch { } finally { setLoading(false); }
  };

  useEffect(() => {
    if (tab === 'projects') loadProjects();
    if (tab === 'internships') loadInternships();
    if (tab === 'users') loadUsers();
    if (tab === 'regrets') loadRegrets();
  }, [tab]);

  const approveProject = async (id, status) => {
    await axios.put(`/api/v1/admin/projects/${id}/approve`, { status });
    setProjects(p => p.filter(x => x._id !== id));
  };

  const approveInternship = async (id, status) => {
    await axios.put(`/api/v1/admin/internships/${id}/approve`, { status });
    setInternships(p => p.filter(x => x._id !== id));
  };

  const updateUserRole = async (id, role) => {
    await axios.put(`/api/v1/admin/users/${id}`, { role });
    setUsers(p => p.map(u => u._id === id ? { ...u, role } : u));
  };

  const removeRegret = async (id) => {
    if (!window.confirm('Remove this regret post? This cannot be undone.')) return;
    await axios.delete(`/api/v1/admin/regrets/${id}`);
    setRegrets(p => p.filter(r => r._id !== id));
  };

  if (!user || user.role !== 'admin') return (
    <div className="page-container" style={{ textAlign: 'center', padding: 80 }}>
      <p style={{ color: 'var(--muted)' }}>You don't have permission to access this page.</p>
    </div>
  );

  const TABS = ['stats', 'projects', 'internships', 'users', 'regrets'];

  return (
    <div className="page-container">
      <h1 style={{ fontWeight: 800, fontSize: '1.6rem', letterSpacing: -0.5, marginBottom: 24 }}>Admin panel</h1>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1.5px solid var(--border)', marginBottom: 24, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', fontFamily: 'var(--font)', color: tab === t ? 'var(--brand)' : 'var(--muted)', borderBottom: tab === t ? '2px solid var(--brand)' : '2px solid transparent', marginBottom: -1.5, textTransform: 'capitalize' }}>
            {t}
          </button>
        ))}
      </div>

      {/* Stats */}
      {tab === 'stats' && stats && (
        <div className="grid-4" style={{ marginBottom: 24 }}>
          {[
            { label: 'Total users', value: stats.totalUsers },
            { label: 'Total projects', value: stats.totalProjects },
            { label: 'Pending projects', value: stats.pendingProjects, warn: true },
            { label: 'Pending internships', value: stats.pendingInternships, warn: true },
          ].map(({ label, value, warn }) => (
            <div key={label} className="card" style={{ padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: warn && value > 0 ? 'var(--warning)' : 'var(--brand)' }}>{value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {tab === 'projects' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {loading ? <p style={{ color: 'var(--muted)' }}>Loading…</p>
            : projects.length === 0 ? <p style={{ color: 'var(--muted)' }}>No pending projects 🎉</p>
            : projects.map(p => (
              <div key={p._id} className="card" style={{ padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>{p.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: 6 }}>by {p.createdBy?.name} · {p.category} · {p.difficulty}</div>
                    <p style={{ fontSize: '0.8rem', lineHeight: 1.6, color: 'var(--text)' }}>{p.description?.slice(0, 200)}{p.description?.length > 200 ? '…' : ''}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '6px 12px', background: 'var(--success)', borderColor: 'var(--success)' }} onClick={() => approveProject(p._id, 'approved')}>✓ Approve</button>
                    <button className="btn btn-danger" style={{ fontSize: '0.8rem', padding: '6px 12px' }} onClick={() => approveProject(p._id, 'rejected')}>✕ Reject</button>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* Internships */}
      {tab === 'internships' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {loading ? <p style={{ color: 'var(--muted)' }}>Loading…</p>
            : internships.length === 0 ? <p style={{ color: 'var(--muted)' }}>No pending internships 🎉</p>
            : internships.map(item => (
              <div key={item._id} className="card" style={{ padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{item.company} — {item.role}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>by {item.postedBy?.name} · {item.type}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '6px 12px', background: 'var(--success)', borderColor: 'var(--success)' }} onClick={() => approveInternship(item._id, 'active')}>✓ Approve</button>
                    <button className="btn btn-danger" style={{ fontSize: '0.8rem', padding: '6px 12px' }} onClick={() => approveInternship(item._id, 'rejected')}>✕ Reject</button>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                {['Name', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, fontSize: '0.8rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{u.name}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>{u.email}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 600, background: u.role === 'admin' ? '#fee2e2' : u.role === 'senior' ? '#ede9fe' : '#f1f0fb', color: u.role === 'admin' ? '#991b1b' : u.role === 'senior' ? '#5b21b6' : '#6b6890' }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: '0.8rem' }}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <select style={{ padding: '4px 8px', border: '1.5px solid var(--border)', borderRadius: 6, fontFamily: 'var(--font)', fontSize: '0.8rem', background: 'var(--surface)', cursor: 'pointer' }} value={u.role} onChange={e => updateUserRole(u._id, e.target.value)}>
                      <option value="student">Student</option>
                      <option value="senior">Senior</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Regrets — NEW */}
      {tab === 'regrets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {loading ? <p style={{ color: 'var(--muted)' }}>Loading…</p>
            : regrets.length === 0 ? <p style={{ color: 'var(--muted)' }}>No regret posts.</p>
            : regrets.map(r => (
              <div key={r._id} className="card" style={{ padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.875rem', lineHeight: 1.6, marginBottom: 6 }}>{r.content}</p>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                      {r.category && <span className="tag" style={{ marginRight: 6 }}>{r.category}</span>}
                      ▲ {r.upvotes?.length || 0} · {new Date(r.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button className="btn btn-danger" style={{ fontSize: '0.8rem', padding: '6px 12px', flexShrink: 0 }} onClick={() => removeRegret(r._id)}>Remove</button>
                </div>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}
