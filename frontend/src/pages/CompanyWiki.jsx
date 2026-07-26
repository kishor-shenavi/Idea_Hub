import { useState, useEffect } from 'react';
import axios from '../api/axios';

const ROUND_TYPES = ['online-test', 'dsa', 'system-design', 'hr', 'technical', 'group-discussion', 'other'];

export default function CompanyWiki() {
  const [entries, setEntries] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [filters, setFilters] = useState({ company: '', type: '', role: '' });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    company: '', role: '', type: 'placement', difficulty: 'medium', result: 'selected',
    batch: '', package: '', tips: '', rounds: [],
  });

  useEffect(() => {
    axios.get('/api/v1/wiki/companies').then(res => setCompanies(res.data.data));
  }, []);

  const load = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.company) params.append('company', filters.company);
    if (filters.type) params.append('type', filters.type);
    if (filters.role) params.append('role', filters.role);
    const res = await axios.get(`/api/v1/wiki?${params}`);
    setEntries(res.data.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filters]);

  const addRound = () => {
    setForm(f => ({ ...f, rounds: [...f.rounds, { roundNumber: f.rounds.length + 1, roundType: 'technical', description: '', tips: '' }] }));
  };
  const updateRound = (i, key, val) => {
    setForm(f => ({ ...f, rounds: f.rounds.map((r, idx) => idx === i ? { ...r, [key]: val } : r) }));
  };
  const removeRound = (i) => setForm(f => ({ ...f, rounds: f.rounds.filter((_, idx) => idx !== i) }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('/api/v1/wiki', { ...form, batch: form.batch ? Number(form.batch) : undefined });
      setShowForm(false);
      setForm({ company: '', role: '', type: 'placement', difficulty: 'medium', result: 'selected', batch: '', package: '', tips: '', rounds: [] });
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not submit');
    }
  };

  const upvote = async (id) => {
    await axios.put(`/api/v1/wiki/${id}/upvote`);
    load();
  };

  return (
    <div className="page-container" style={{ maxWidth: 900 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: '1.6rem', letterSpacing: -0.5 }}>🏢 Company Wiki</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: 4 }}>Real interview experiences shared by students and seniors.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ Share your experience'}</button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="card" style={{ padding: 24, marginBottom: 24 }}>
          {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}
          <div className="grid-2" style={{ marginBottom: 14 }}>
            <div><label className="label">Company *</label><input className="input" required value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} /></div>
            <div><label className="label">Role *</label><input className="input" required value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} /></div>
          </div>
          <div className="grid-2" style={{ marginBottom: 14 }}>
            <div>
              <label className="label">Type</label>
              <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="placement">Placement</option><option value="internship">Internship</option>
              </select>
            </div>
            <div>
              <label className="label">Result</label>
              <select className="input" value={form.result} onChange={e => setForm({ ...form, result: e.target.value })}>
                <option value="selected">Selected</option><option value="rejected">Rejected</option><option value="on-hold">On hold</option>
              </select>
            </div>
          </div>
          <div className="grid-2" style={{ marginBottom: 14 }}>
            <div>
              <label className="label">Difficulty</label>
              <select className="input" value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}>
                <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
              </select>
            </div>
            <div><label className="label">Batch year</label><input className="input" type="number" value={form.batch} onChange={e => setForm({ ...form, batch: e.target.value })} /></div>
          </div>
          <div style={{ marginBottom: 14 }}><label className="label">Package (optional)</label><input className="input" placeholder="e.g. 12 LPA" value={form.package} onChange={e => setForm({ ...form, package: e.target.value })} /></div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label className="label" style={{ marginBottom: 0 }}>Interview rounds</label>
              <button type="button" className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '4px 10px' }} onClick={addRound}>+ Add round</button>
            </div>
            {form.rounds.map((r, i) => (
              <div key={i} className="card" style={{ padding: 14, marginBottom: 10, background: 'var(--surface2)' }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                  <select className="input" style={{ flex: 1 }} value={r.roundType} onChange={e => updateRound(i, 'roundType', e.target.value)}>
                    {ROUND_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <button type="button" onClick={() => removeRound(i)} className="btn btn-danger" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>Remove</button>
                </div>
                <textarea className="input" placeholder="What happened in this round?" rows={2} value={r.description} onChange={e => updateRound(i, 'description', e.target.value)} style={{ marginBottom: 8, resize: 'vertical' }} />
                <input className="input" placeholder="Tips for this round" value={r.tips} onChange={e => updateRound(i, 'tips', e.target.value)} />
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 20 }}><label className="label">Overall tips</label><textarea className="input" rows={3} value={form.tips} onChange={e => setForm({ ...form, tips: e.target.value })} style={{ resize: 'vertical' }} /></div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Submit</button>
        </form>
      )}

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <select className="input" style={{ maxWidth: 200 }} value={filters.company} onChange={e => setFilters({ ...filters, company: e.target.value })}>
          <option value="">All companies</option>
          {companies.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="input" style={{ maxWidth: 160 }} value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })}>
          <option value="">All types</option><option value="placement">Placement</option><option value="internship">Internship</option>
        </select>
        <input className="input" style={{ maxWidth: 200 }} placeholder="Filter by role" value={filters.role} onChange={e => setFilters({ ...filters, role: e.target.value })} />
      </div>

      {loading ? <p style={{ color: 'var(--muted)' }}>Loading…</p> : entries.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>No entries yet — be the first to share.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {entries.map(e => (
            <div key={e._id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{e.company} — {e.role}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                    <span className="tag">{e.type}</span>
                    <span className="tag" style={{ background: e.result === 'selected' ? '#d1fae5' : e.result === 'rejected' ? '#fee2e2' : '#fef3c7', color: e.result === 'selected' ? '#065f46' : e.result === 'rejected' ? '#991b1b' : '#92400e' }}>{e.result}</span>
                    {e.difficulty && <span className="tag">{e.difficulty}</span>}
                    {e.batch && <span className="tag">Batch {e.batch}</span>}
                    {e.package && <span className="tag">{e.package}</span>}
                  </div>
                </div>
                <button onClick={() => upvote(e._id)} className="btn btn-ghost" style={{ fontSize: '0.8rem' }}>▲ {e.upvotes?.length || 0}</button>
              </div>
              {e.rounds?.length > 0 && (
                <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {e.rounds.map((r, i) => (
                    <div key={i} style={{ paddingLeft: 12, borderLeft: '2px solid var(--border)' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.8rem', textTransform: 'capitalize' }}>{r.roundType}</div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text)', marginTop: 2 }}>{r.description}</p>
                      {r.tips && <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 2, fontStyle: 'italic' }}>💡 {r.tips}</p>}
                    </div>
                  ))}
                </div>
              )}
              {e.tips && <p style={{ fontSize: '0.85rem', color: 'var(--text)', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>{e.tips}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
