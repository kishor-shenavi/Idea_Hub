import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['academics', 'projects', 'internship', 'skills', 'networking', 'other'];
const CAT_COLORS = {
  academics: '#dbeafe', projects: '#ede9fe', internship: '#d1fae5',
  skills: '#fef3c7', networking: '#fce7f3', other: '#f1f0fb',
};
const CAT_TEXT = {
  academics: '#1e40af', projects: '#5b21b6', internship: '#065f46',
  skills: '#92400e', networking: '#9d174d', other: '#6b6890',
};

export default function RegretBoard() {
  const { user } = useAuth();
  const [regrets, setRegrets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [year, setYear] = useState('');
  const [category, setCategory] = useState('other');
  const [filterCat, setFilterCat] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    try {
      const params = new URLSearchParams();
      if (filterCat) params.set('category', filterCat);
      const { data } = await axios.get(`/api/v1/regrets?${params}`);
      setRegrets(data.data);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filterCat]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      await axios.post('/api/v1/regrets', { content, yearItHappened: year || undefined, category });
      setContent(''); setYear(''); setCategory('other'); setShowForm(false);
      await load();
    } catch { } finally { setSubmitting(false); }
  };

  const handleUpvote = async (id) => {
    if (!user) return;
    try {
      await axios.put(`/api/v1/regrets/${id}/upvote`);
      setRegrets(p => p.map(r => r._id === id ? {
        ...r,
        upvotes: r.upvotes?.includes(user.id) ? r.upvotes.filter(i => i !== user.id) : [...(r.upvotes || []), user.id]
      } : r));
    } catch { }
  };

  return (
    <div className="page-container" style={{ maxWidth: 780 }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>😬</div>
        <h1 style={{ fontWeight: 800, fontSize: '1.8rem', letterSpacing: -0.5, marginBottom: 8 }}>Regret Board</h1>
        <p style={{ color: 'var(--muted)', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
          Anonymous confessions from seniors — what they wish they had done differently. 100% anonymous. No names, no judgment.
        </p>
      </div>

      {/* Post form */}
      {user && (
        <div className="card" style={{ padding: 20, marginBottom: 28, borderStyle: showForm ? 'solid' : 'dashed', cursor: showForm ? 'default' : 'pointer' }} onClick={() => !showForm && setShowForm(true)}>
          {!showForm ? (
            <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '0.9rem', padding: '8px 0' }}>
              + Share your regret anonymously
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label className="label">What do you regret? *</label><textarea className="input" required rows={3} value={content} onChange={e => setContent(e.target.value)} placeholder="I wish I had started competitive programming in Year 1 instead of Year 3…" style={{ resize: 'vertical' }} maxLength={500} /></div>
              <div className="grid-2">
                <div><label className="label">Year it happened</label>
                  <select className="input" value={year} onChange={e => setYear(e.target.value)}>
                    <option value="">Don't say</option>
                    {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                  </select>
                </div>
                <div><label className="label">Category</label>
                  <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Posting…' : 'Post anonymously'}</button>
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Your name is never shown. Ever.</p>
            </form>
          )}
        </div>
      )}

      {/* Filter */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        <button onClick={() => setFilterCat('')} style={{ padding: '5px 12px', borderRadius: 99, background: filterCat === '' ? 'var(--brand)' : 'var(--surface2)', color: filterCat === '' ? '#fff' : 'var(--muted)', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.78rem', fontFamily: 'var(--font)' }}>All</button>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setFilterCat(c)} style={{ padding: '5px 12px', borderRadius: 99, background: filterCat === c ? CAT_COLORS[c] : 'var(--surface2)', color: filterCat === c ? CAT_TEXT[c] : 'var(--muted)', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.78rem', fontFamily: 'var(--font)' }}>
            {c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 48, color: 'var(--muted)' }}>Loading…</div>
        : regrets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60 }}><p style={{ color: 'var(--muted)' }}>No regrets yet — be the first to share!</p></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {regrets.map(r => (
              <div key={r._id} className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => handleUpvote(r._id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, background: 'none', border: '1.5px solid var(--border)', borderRadius: 8, padding: '8px 10px', cursor: user ? 'pointer' : 'default', minWidth: 44, flexShrink: 0, transition: 'background 0.15s', background: r.upvotes?.includes(user?.id) ? 'var(--brand-light)' : 'transparent' }}>
                    <span style={{ fontSize: 14 }}>{r.upvotes?.includes(user?.id) ? '▲' : '△'}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: r.upvotes?.includes(user?.id) ? 'var(--brand)' : 'var(--muted)' }}>{r.upvotes?.length || 0}</span>
                  </button>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 10 }}>{r.content}</p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ background: CAT_COLORS[r.category] || '#f1f0fb', color: CAT_TEXT[r.category] || '#6b6890', padding: '2px 10px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 600 }}>{r.category}</span>
                      {r.yearItHappened && <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Year {r.yearItHappened}</span>}
                      <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginLeft: 'auto' }}>{new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
