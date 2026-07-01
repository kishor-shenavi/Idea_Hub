import { useState } from 'react';

const CATEGORIES = ['web', 'mobile', 'desktop', 'ai', 'iot', 'other'];
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

export default function ProjectForm({ formData, setFormData, onSubmit, isEditing, loading }) {
  const [tagInput, setTagInput] = useState('');

  const addTag = (e) => {
    e.preventDefault();
    const t = tagInput.trim().toLowerCase();
    if (t && !formData.tags.includes(t) && formData.tags.length < 10) {
      setFormData(p => ({ ...p, tags: [...p.tags, t] }));
      setTagInput('');
    }
  };

  const removeTag = (tag) => setFormData(p => ({ ...p, tags: p.tags.filter(t => t !== tag) }));

  return (
    <div className="page-container" style={{ maxWidth: 700 }}>
      <div className="card" style={{ padding: 32 }}>
        <h1 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: 8 }}>{isEditing ? 'Edit project' : 'Add a project idea'}</h1>
        <p style={{ color: 'var(--muted)', marginBottom: 28, fontSize: '0.9rem' }}>
          {isEditing ? 'Update your project details.' : 'Share a project idea for other students to explore and build.'}
        </p>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label className="label">Title *</label>
            <input className="input" value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Real-time Chat App with Socket.io" required maxLength={100} />
          </div>

          <div>
            <label className="label">Description *</label>
            <textarea className="input" value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="Describe the project — what it does, what you can learn, how to build it…" required rows={4} style={{ resize: 'vertical' }} />
          </div>

          <div className="grid-2">
            <div>
              <label className="label">Category *</label>
              <select className="input" value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Difficulty *</label>
              <select className="input" value={formData.difficulty} onChange={e => setFormData(p => ({ ...p, difficulty: e.target.value }))}>
                {DIFFICULTIES.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Tags * (up to 10)</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="input" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addTag(e); }} placeholder="Add tag and press Enter" />
              <button type="button" className="btn btn-outline" onClick={addTag} style={{ flexShrink: 0 }}>Add</button>
            </div>
            {formData.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                {formData.tags.map(tag => (
                  <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: 'var(--brand-light)', color: 'var(--brand)', borderRadius: 99, fontSize: '0.8rem', fontWeight: 600 }}>
                    #{tag}
                    <button type="button" onClick={() => removeTag(tag)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand)', lineHeight: 1, padding: 0, marginLeft: 2 }}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="label">GitHub URL (optional)</label>
            <input className="input" value={formData.githubUrl} onChange={e => setFormData(p => ({ ...p, githubUrl: e.target.value }))} placeholder="https://github.com/…" type="url" />
          </div>

          <div>
            <label className="label">Documentation URL (optional)</label>
            <input className="input" value={formData.documentationUrl} onChange={e => setFormData(p => ({ ...p, documentationUrl: e.target.value }))} placeholder="https://docs.example.com" type="url" />
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
              {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Saving…</> : (isEditing ? 'Update project' : 'Submit project')}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => window.history.back()}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
