import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

const TYPE_COLORS = { internship: { bg: '#dbeafe', color: '#1e40af' }, placement: { bg: '#d1fae5', color: '#065f46' } };

export default function Internships() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ company: '', role: '', description: '', stipend: '', duration: '', location: '', applyLink: '', type: 'internship', howIGotIt: '', interviewProcess: '' });
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const load = async () => {
    try {
      const params = new URLSearchParams();
      if (type) params.set('type', type);
      if (search) params.set('search', search);
      const { data } = await axios.get(`/api/v1/internships?${params}`);
      setItems(data.data);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [type, search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('/api/v1/internships', form);
      setShowForm(false);
      await load();
    } catch { } finally { setSubmitting(false); }
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: '1.6rem', letterSpacing: -0.5, marginBottom: 4 }}>Internships & Placements</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Opportunities shared by seniors along with how they got them</p>
        </div>
        {user && <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? '✕ Cancel' : '+ Share opportunity'}</button>}
      </div>

      {showForm && (
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Share an opportunity</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="grid-2">
              <div><label className="label">Company *</label><input className="input" required value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} placeholder="Razorpay" /></div>
              <div><label className="label">Role *</label><input className="input" required value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} placeholder="Backend Intern" /></div>
              <div><label className="label">Type</label>
                <select className="input" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                  <option value="internship">Internship</option>
                  <option value="placement">Placement</option>
                </select>
              </div>
              <div><label className="label">Stipend / Package</label><input className="input" value={form.stipend} onChange={e => setForm(p => ({ ...p, stipend: e.target.value }))} placeholder="₹50,000/month or 12 LPA" /></div>
              <div><label className="label">Location</label><input className="input" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="Bangalore (Hybrid)" /></div>
              <div><label className="label">Apply link</label><input className="input" type="url" value={form.applyLink} onChange={e => setForm(p => ({ ...p, applyLink: e.target.value }))} placeholder="https://…" /></div>
            </div>
            <div><label className="label">Description *</label><textarea className="input" required rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="What will you work on?" style={{ resize: 'vertical' }} /></div>
            <div><label className="label">How I got it (optional)</label><textarea className="input" rows={2} value={form.howIGotIt} onChange={e => setForm(p => ({ ...p, howIGotIt: e.target.value }))} placeholder="LinkedIn cold message, referral, campus drive…" style={{ resize: 'vertical' }} /></div>
            <div><label className="label">Interview process (optional)</label><textarea className="input" rows={2} value={form.interviewProcess} onChange={e => setForm(p => ({ ...p, interviewProcess: e.target.value }))} placeholder="Round 1: DSA, Round 2: System design…" style={{ resize: 'vertical' }} /></div>
            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ alignSelf: 'flex-start' }}>{submitting ? 'Submitting…' : 'Submit'}</button>
          </form>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <input className="input" style={{ flex: 1, minWidth: 200 }} placeholder="Search company, role…" value={search} onChange={e => setSearch(e.target.value)} />
        <div style={{ display: 'flex', gap: 0, border: '1.5px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
          {['', 'internship', 'placement'].map(t => (
            <button key={t} onClick={() => setType(t)} style={{ padding: '8px 14px', background: type === t ? 'var(--brand)' : 'var(--surface)', color: type === t ? '#fff' : 'var(--muted)', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', fontFamily: 'var(--font)' }}>
              {t === '' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 48, color: 'var(--muted)' }}>Loading…</div>
        : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}><div style={{ fontSize: 40, marginBottom: 12 }}>🏢</div><p style={{ fontWeight: 600, color: 'var(--muted)' }}>No opportunities yet</p></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {items.map(item => (
              <div key={item._id} className="card" style={{ padding: 20, cursor: 'pointer' }} onClick={() => setExpanded(expanded === item._id ? null : item._id)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                      <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>{item.company}</h3>
                      <span style={{ ...TYPE_COLORS[item.type], padding: '2px 10px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 600 }}>{item.type}</span>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginBottom: 4 }}>{item.role}</p>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      {item.stipend && <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--success)' }}>{item.stipend}</span>}
                      {item.location && <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>📍 {item.location}</span>}
                      {item.duration && <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>⏱ {item.duration}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {item.applyLink && <a href={item.applyLink} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>Apply</a>}
                  </div>
                </div>
                {expanded === item._id && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div><div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6 }}>Description</div><p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>{item.description}</p></div>
                    {item.howIGotIt && <div><div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6 }}>How they got it</div><p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>{item.howIGotIt}</p></div>}
                    {item.interviewProcess && <div><div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6 }}>Interview process</div><p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>{item.interviewProcess}</p></div>}
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Shared by {item.postedBy?.name || 'Anonymous'}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}
