import { useState, useEffect } from 'react';
import axios from '../api/axios';

export default function OfferTracker() {
  const [offers, setOffers] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({ company: '', type: '', branch: '', batch: '' });
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ company: '', role: '', package: '', type: 'placement', stipend: '', branch: '', batch: '', location: '' });

  const load = async () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
    const [offersRes, statsRes] = await Promise.all([
      axios.get(`/api/v1/offers?${params}`),
      axios.get('/api/v1/offers/stats'),
    ]);
    setOffers(offersRes.data.data);
    setStats(statsRes.data.data);
  };

  useEffect(() => { load(); }, [filters]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('/api/v1/offers', {
        ...form,
        package: Number(form.package),
        stipend: form.stipend ? Number(form.stipend) : undefined,
        batch: form.batch ? Number(form.batch) : undefined,
      });
      setShowForm(false);
      setForm({ company: '', role: '', package: '', type: 'placement', stipend: '', branch: '', batch: '', location: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not submit');
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: 900 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: '1.6rem', letterSpacing: -0.5 }}>💰 Offer Tracker</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: 4 }}>Anonymous, real placement and internship package data.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ Add your offer'}</button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="card" style={{ padding: 24, marginBottom: 24 }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: 16 }}>Your name is never shown alongside this data — it's fully anonymous.</p>
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
            <div><label className="label">Package (LPA) *</label><input className="input" type="number" step="0.1" required value={form.package} onChange={e => setForm({ ...form, package: e.target.value })} /></div>
          </div>
          {form.type === 'internship' && (
            <div style={{ marginBottom: 14 }}><label className="label">Monthly stipend (₹)</label><input className="input" type="number" value={form.stipend} onChange={e => setForm({ ...form, stipend: e.target.value })} /></div>
          )}
          <div className="grid-2" style={{ marginBottom: 14 }}>
            <div><label className="label">Branch</label><input className="input" value={form.branch} onChange={e => setForm({ ...form, branch: e.target.value })} /></div>
            <div><label className="label">Batch year</label><input className="input" type="number" value={form.batch} onChange={e => setForm({ ...form, batch: e.target.value })} /></div>
          </div>
          <div style={{ marginBottom: 20 }}><label className="label">Location</label><input className="input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Submit anonymously</button>
        </form>
      )}

      {stats?.overall && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
          <div className="card" style={{ padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--brand)' }}>{stats.overall.avgPackage?.toFixed(1) || 0}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Avg package (LPA)</div>
          </div>
          <div className="card" style={{ padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--brand)' }}>{stats.overall.maxPackage || 0}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Highest (LPA)</div>
          </div>
          <div className="card" style={{ padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--brand)' }}>{stats.overall.totalOffers || 0}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Total offers shared</div>
          </div>
        </div>
      )}

      {stats?.byCompany?.length > 0 && (
        <div className="card" style={{ padding: 20, marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 14 }}>By company</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead><tr style={{ borderBottom: '1.5px solid var(--border)' }}>
                {['Company', 'Avg', 'Max', 'Count'].map(h => <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {stats.byCompany.map(c => (
                  <tr key={c._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 600 }}>{c._id}</td>
                    <td style={{ padding: '8px 12px' }}>{c.avgPackage.toFixed(1)} LPA</td>
                    <td style={{ padding: '8px 12px' }}>{c.maxPackage} LPA</td>
                    <td style={{ padding: '8px 12px' }}>{c.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {stats?.internships?.totalInternships > 0 && (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
    <div className="card" style={{ padding: 20, textAlign: 'center' }}>
      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--brand)' }}>₹{Math.round(stats.internships.avgStipend).toLocaleString('en-IN')}</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Avg monthly stipend</div>
    </div>
    <div className="card" style={{ padding: 20, textAlign: 'center' }}>
      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--brand)' }}>₹{stats.internships.maxStipend.toLocaleString('en-IN')}</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Highest stipend</div>
    </div>
    <div className="card" style={{ padding: 20, textAlign: 'center' }}>
      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--brand)' }}>{stats.internships.totalInternships}</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Internships shared</div>
    </div>
  </div>
)}

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <input className="input" style={{ maxWidth: 180 }} placeholder="Filter by company" value={filters.company} onChange={e => setFilters({ ...filters, company: e.target.value })} />
        <select className="input" style={{ maxWidth: 160 }} value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })}>
          <option value="">All types</option><option value="placement">Placement</option><option value="internship">Internship</option>
        </select>
        <input className="input" style={{ maxWidth: 160 }} placeholder="Filter by branch" value={filters.branch} onChange={e => setFilters({ ...filters, branch: e.target.value })} />
      </div>

      {offers.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>No offers logged yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {offers.map(o => (
            <div key={o._id} className="card" style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div style={{ fontWeight: 700 }}>{o.company} — {o.role}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{o.branch} {o.batch ? `· Batch ${o.batch}` : ''} {o.location ? `· ${o.location}` : ''}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, color: 'var(--brand)' }}>{o.package} LPA</div>
                {o.stipend && <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>₹{o.stipend}/mo stipend</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
