import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function SeniorPaths() {
  const { user } = useAuth();
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [branch, setBranch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', branch: '', currentRole: '', company: '', passingYear: '', years: [] });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (branch) params.set('branch', branch);
        const { data } = await axios.get(`/api/v1/paths?${params}`);
        setPaths(data.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, [search, branch]);

  const handleLike = async (id) => {
    if (!user) return;
    try {
      await axios.put(`/api/v1/paths/${id}/like`);
      setPaths(p => p.map(x => x._id === id ? { ...x, likes: x.likes?.includes(user.id) ? x.likes.filter(i => i !== user.id) : [...(x.likes || []), user.id] } : x));
    } catch { }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('/api/v1/paths', form);
      setShowForm(false);
      setForm({ title: '', branch: '', currentRole: '', company: '', passingYear: '', years: [] });
      const { data } = await axios.get('/api/v1/paths');
      setPaths(data.data);
    } catch { } finally { setSubmitting(false); }
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: '1.6rem', letterSpacing: -0.5, marginBottom: 4 }}>Senior paths</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Year-by-year journeys shared by seniors who've been where you are</p>
        </div>
        {user && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ Share your path'}
          </button>
        )}
      </div>

      {/* Quick add form */}
      {showForm && (
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Share your journey</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="grid-2">
              <div><label className="label">Title *</label><input className="input" required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="My CSE journey to Google" /></div>
              <div><label className="label">Branch *</label><input className="input" required value={form.branch} onChange={e => setForm(p => ({ ...p, branch: e.target.value }))} placeholder="Computer Science" /></div>
              <div><label className="label">Current role</label><input className="input" value={form.currentRole} onChange={e => setForm(p => ({ ...p, currentRole: e.target.value }))} placeholder="SDE-2" /></div>
              <div><label className="label">Company</label><input className="input" value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} placeholder="Google" /></div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ alignSelf: 'flex-start' }}>
              {submitting ? 'Submitting…' : 'Submit path'}
            </button>
            <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>You can add year-by-year details after creating the path.</p>
          </form>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <input className="input" style={{ flex: 1, minWidth: 200 }} placeholder="Search paths…" value={search} onChange={e => setSearch(e.target.value)} />
        <input className="input" style={{ width: 180 }} placeholder="Filter by branch…" value={branch} onChange={e => setBranch(e.target.value)} />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--muted)' }}>Loading…</div>
      ) : paths.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🗺️</div>
          <p style={{ fontWeight: 600, color: 'var(--muted)' }}>No paths yet</p>
          {user && <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginTop: 8 }}>Be the first to share your journey!</p>}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {paths.map(path => (
            <div key={path._id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 6 }}>{path.title}</h3>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 500 }}>by {path.author?.name || 'Anonymous'}</span>
                    {path.branch && <span className="tag" style={{ background: 'var(--surface2)', color: 'var(--muted)' }}>{path.branch}</span>}
                    {path.currentRole && <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600 }}>{path.currentRole} {path.company ? `@ ${path.company}` : ''}</span>}
                  </div>
                  {path.years?.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                      {path.years.map(y => (
                        <div key={y.year} style={{ background: 'var(--surface2)', borderRadius: 8, padding: '4px 10px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand)' }}>Y{y.year}</span>
                          {y.title && <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginLeft: 4 }}>{y.title}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <button onClick={() => handleLike(path._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: path.likes?.includes(user?.id) ? 'var(--danger)' : 'var(--muted)', fontWeight: 600, fontSize: '0.875rem', padding: 4 }}>
                    {path.likes?.includes(user?.id) ? '❤️' : '🤍'} {path.likes?.length || 0}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
