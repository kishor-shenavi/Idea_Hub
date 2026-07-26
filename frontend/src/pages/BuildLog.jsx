import { useState, useEffect } from 'react';
import axios from '../api/axios';

export default function BuildLog() {
  const [logs, setLogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({
    project: '', projectTitle: '', weekNumber: '', content: '', techUsed: '', githubUrl: '', demoUrl: '', stuck: '', nextWeekPlan: '',
  });

  const load = async () => {
    const res = await axios.get('/api/v1/buildlogs');
    setLogs(res.data.data);
  };

  useEffect(() => {
    load();
    axios.get('/api/v1/projects/user/my').then(res => setProjects(res.data.data)).catch(() => {});
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('/api/v1/buildlogs', {
        ...form,
        weekNumber: Number(form.weekNumber),
        techUsed: form.techUsed.split(',').map(s => s.trim()).filter(Boolean),
        project: form.project || undefined,
      });
      setShowForm(false);
      setForm({ project: '', projectTitle: '', weekNumber: '', content: '', techUsed: '', githubUrl: '', demoUrl: '', stuck: '', nextWeekPlan: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not submit');
    }
  };

  const like = async (id) => {
    await axios.put(`/api/v1/buildlogs/${id}/like`);
    load();
  };

  return (
    <div className="page-container" style={{ maxWidth: 780 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: '1.6rem', letterSpacing: -0.5 }}>🛠️ Build in Public</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: 4 }}>Weekly progress logs from students building real projects.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ Log this week'}</button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="card" style={{ padding: 24, marginBottom: 24 }}>
          {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}
          {projects.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <label className="label">Link to one of your projects (optional)</label>
              <select className="input" value={form.project} onChange={e => {
                const p = projects.find(x => x._id === e.target.value);
                setForm({ ...form, project: e.target.value, projectTitle: p ? p.title : form.projectTitle });
              }}>
                <option value="">— None —</option>
                {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
              </select>
            </div>
          )}
          <div className="grid-2" style={{ marginBottom: 14 }}>
            <div><label className="label">Project title *</label><input className="input" required value={form.projectTitle} onChange={e => setForm({ ...form, projectTitle: e.target.value })} /></div>
            <div><label className="label">Week number *</label><input className="input" type="number" required value={form.weekNumber} onChange={e => setForm({ ...form, weekNumber: e.target.value })} /></div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label className="label">What did you build this week? *</label>
            <textarea className="input" rows={4} required maxLength={2000} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} style={{ resize: 'vertical' }} />
          </div>
          <div style={{ marginBottom: 14 }}><label className="label">Tech used (comma separated)</label><input className="input" placeholder="React, Node.js, MongoDB" value={form.techUsed} onChange={e => setForm({ ...form, techUsed: e.target.value })} /></div>
          <div className="grid-2" style={{ marginBottom: 14 }}>
            <div><label className="label">GitHub URL</label><input className="input" value={form.githubUrl} onChange={e => setForm({ ...form, githubUrl: e.target.value })} /></div>
            <div><label className="label">Demo URL</label><input className="input" value={form.demoUrl} onChange={e => setForm({ ...form, demoUrl: e.target.value })} /></div>
          </div>
          <div style={{ marginBottom: 14 }}><label className="label">What are you stuck on? (optional)</label><textarea className="input" rows={2} value={form.stuck} onChange={e => setForm({ ...form, stuck: e.target.value })} style={{ resize: 'vertical' }} /></div>
          <div style={{ marginBottom: 20 }}><label className="label">Plan for next week</label><textarea className="input" rows={2} value={form.nextWeekPlan} onChange={e => setForm({ ...form, nextWeekPlan: e.target.value })} style={{ resize: 'vertical' }} /></div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Post update</button>
        </form>
      )}

      {logs.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>No build logs yet — be the first to share your progress.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {logs.map(log => (
            <div key={log._id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{log.projectTitle} <span style={{ fontWeight: 500, color: 'var(--muted)', fontSize: '0.85rem' }}>· Week {log.weekNumber}</span></div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{log.author?.name} · {new Date(log.createdAt).toLocaleDateString()}</div>
                </div>
                <button onClick={() => like(log._id)} className="btn btn-ghost" style={{ fontSize: '0.8rem' }}>♥ {log.likes?.length || 0}</button>
              </div>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 10 }}>{log.content}</p>
              {log.techUsed?.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                  {log.techUsed.map(t => <span key={t} className="tag">{t}</span>)}
                </div>
              )}
              {log.stuck && <p style={{ fontSize: '0.85rem', color: 'var(--warning)', marginBottom: 6 }}>⚠ Stuck on: {log.stuck}</p>}
              {log.nextWeekPlan && <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>→ Next: {log.nextWeekPlan}</p>}
              <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                {log.githubUrl && <a href={log.githubUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: 'var(--brand)' }}>GitHub →</a>}
                {log.demoUrl && <a href={log.demoUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: 'var(--brand)' }}>Live demo →</a>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
