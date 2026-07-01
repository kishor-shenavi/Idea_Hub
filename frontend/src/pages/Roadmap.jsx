import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Roadmap() {
  const { user } = useAuth();
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeRoadmap, setActiveRoadmap] = useState(null);
  const [form, setForm] = useState({ year: user?.year || 1, branch: user?.branch || '', goalType: user?.goalType || 'product', interests: '' });
  const [view, setView] = useState('list'); // list | generate | detail
  const [quizTopic, setQuizTopic] = useState('');
  const [quiz, setQuiz] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('/api/v1/roadmap/my');
        setRoadmaps(data.data);
      } catch { } finally { setLoading(false); }
    };
    load();
  }, []);

  const generate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const { data } = await axios.post('/api/v1/roadmap/generate', {
        year: form.year,
        branch: form.branch,
        goalType: form.goalType,
        interests: form.interests.split(',').map(s => s.trim()).filter(Boolean),
      });
      setRoadmaps(p => [data.data, ...p]);
      setActiveRoadmap(data.data);
      setView('detail');
    } catch { } finally { setGenerating(false); }
  };

  const toggleWeek = async (roadmapId, weekNumber) => {
    try {
      const { data } = await axios.put(`/api/v1/roadmap/${roadmapId}/week/${weekNumber}/complete`);
      setActiveRoadmap(data.data);
      setRoadmaps(p => p.map(r => r._id === roadmapId ? data.data : r));
    } catch { }
  };

  const generateQuiz = async () => {
    if (!quizTopic.trim()) return;
    setQuizLoading(true); setSelectedAnswer({});
    try {
      const { data } = await axios.post('/api/v1/roadmap/quiz', { topic: quizTopic, count: 5 });
      setQuiz(data.data);
    } catch { } finally { setQuizLoading(false); }
  };

  const completedCount = activeRoadmap?.weeks?.filter(w => w.completed).length || 0;
  const totalWeeks = activeRoadmap?.weeks?.length || 0;
  const progress = totalWeeks ? Math.round((completedCount / totalWeeks) * 100) : 0;

  if (view === 'generate') return (
    <div className="page-container" style={{ maxWidth: 600 }}>
      <button className="btn btn-ghost" style={{ marginBottom: 20 }} onClick={() => setView('list')}>← Back</button>
      <div className="card" style={{ padding: 32 }}>
        <h2 style={{ fontWeight: 800, fontSize: '1.4rem', marginBottom: 6 }}>Generate your roadmap</h2>
        <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: 24 }}>AI will create a personalized 12-week learning plan based on your profile.</p>
        <form onSubmit={generate} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="grid-2">
            <div><label className="label">Your year *</label>
              <select className="input" value={form.year} onChange={e => setForm(p => ({ ...p, year: Number(e.target.value) }))}>
                {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
              </select>
            </div>
            <div><label className="label">Branch *</label><input className="input" required value={form.branch} onChange={e => setForm(p => ({ ...p, branch: e.target.value }))} placeholder="Computer Science" /></div>
            <div><label className="label">Goal *</label>
              <select className="input" value={form.goalType} onChange={e => setForm(p => ({ ...p, goalType: e.target.value }))}>
                {['startup', 'product', 'service', 'research', 'govt'].map(g => <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)} company</option>)}
              </select>
            </div>
          </div>
          <div><label className="label">Interests (comma-separated)</label><input className="input" value={form.interests} onChange={e => setForm(p => ({ ...p, interests: e.target.value }))} placeholder="Web dev, DSA, Machine Learning" /></div>
          <button type="submit" className="btn btn-primary" disabled={generating} style={{ justifyContent: 'center' }}>
            {generating ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Generating with AI…</> : '✨ Generate roadmap'}
          </button>
        </form>
      </div>
    </div>
  );

  if (view === 'detail' && activeRoadmap) return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div>
          <button className="btn btn-ghost" style={{ marginBottom: 8 }} onClick={() => setView('list')}>← My roadmaps</button>
          <h1 style={{ fontWeight: 800, fontSize: '1.4rem', letterSpacing: -0.5 }}>{activeRoadmap.title}</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginTop: 4 }}>{completedCount}/{totalWeeks} weeks completed</p>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ background: 'var(--border)', borderRadius: 99, height: 8, marginBottom: 28, overflow: 'hidden' }}>
        <div style={{ background: 'var(--brand)', height: '100%', width: `${progress}%`, borderRadius: 99, transition: 'width 0.5s ease' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
        {/* Weeks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {activeRoadmap.weeks?.map(week => (
            <div key={week.week} className="card" style={{ padding: 18, borderLeft: week.completed ? '3px solid var(--success)' : '3px solid var(--border)', opacity: week.completed ? 0.85 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--brand)', fontWeight: 600, background: 'var(--brand-light)', padding: '2px 8px', borderRadius: 6 }}>Week {week.week}</span>
                    {week.completed && <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>✓ Done</span>}
                  </div>
                  <h4 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }}>{week.title}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.6 }}>{week.description}</p>
                  {week.resources?.length > 0 && (
                    <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {week.resources.slice(0, 3).map((r, i) => (
                        r.url
                          ? <a key={i} href={r.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: 'var(--brand)', textDecoration: 'none', background: 'var(--brand-light)', padding: '2px 8px', borderRadius: 6 }}>📎 {r.title}</a>
                          : <span key={i} style={{ fontSize: '0.75rem', color: 'var(--muted)', background: 'var(--surface2)', padding: '2px 8px', borderRadius: 6 }}>📌 {r.title}</span>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={() => toggleWeek(activeRoadmap._id, week.week)} style={{ width: 28, height: 28, borderRadius: 8, border: `2px solid ${week.completed ? 'var(--success)' : 'var(--border)'}`, background: week.completed ? 'var(--success)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {week.completed && <span style={{ color: '#fff', fontSize: 14, lineHeight: 1 }}>✓</span>}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Quiz side panel */}
        <div className="card" style={{ padding: 20, position: 'sticky', top: 84 }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 12 }}>🧠 AI Quiz generator</h3>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input className="input" value={quizTopic} onChange={e => setQuizTopic(e.target.value)} placeholder="e.g. React Hooks" style={{ flex: 1 }} onKeyDown={e => e.key === 'Enter' && generateQuiz()} />
            <button className="btn btn-primary" onClick={generateQuiz} disabled={quizLoading} style={{ flexShrink: 0, padding: '8px 12px' }}>
              {quizLoading ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : 'Go'}
            </button>
          </div>
          {quiz && quiz.map((q, qi) => (
            <div key={qi} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: qi < quiz.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <p style={{ fontWeight: 600, fontSize: '0.8rem', marginBottom: 8 }}>Q{qi + 1}. {q.question}</p>
              {q.options?.map((opt, oi) => {
                const selected = selectedAnswer[qi] === oi;
                const correct = oi === q.correctIndex;
                const showResult = selectedAnswer[qi] !== undefined;
                return (
                  <button key={oi} onClick={() => setSelectedAnswer(p => ({ ...p, [qi]: oi }))} style={{
                    display: 'block', width: '100%', textAlign: 'left', padding: '6px 10px', borderRadius: 6, marginBottom: 4,
                    border: `1.5px solid ${showResult ? (correct ? 'var(--success)' : selected ? 'var(--danger)' : 'var(--border)') : 'var(--border)'}`,
                    background: showResult ? (correct ? '#d1fae5' : selected ? '#fee2e2' : 'transparent') : 'transparent',
                    cursor: selectedAnswer[qi] !== undefined ? 'default' : 'pointer',
                    fontSize: '0.78rem', fontFamily: 'var(--font)', color: 'var(--text)',
                  }}>
                    {String.fromCharCode(65 + oi)}. {opt}
                  </button>
                );
              })}
              {selectedAnswer[qi] !== undefined && q.explanation && (
                <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 4, lineHeight: 1.5 }}>💡 {q.explanation}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`@media (max-width: 900px) { .roadmap-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: '1.6rem', letterSpacing: -0.5, marginBottom: 4 }}>My roadmaps</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Personalized 12-week learning plans generated by AI</p>
        </div>
        <button className="btn btn-primary" onClick={() => setView('generate')}>✨ Generate new roadmap</button>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 48, color: 'var(--muted)' }}>Loading…</div>
        : roadmaps.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🗺️</div>
            <h2 style={{ fontWeight: 700, marginBottom: 8 }}>No roadmaps yet</h2>
            <p style={{ color: 'var(--muted)', marginBottom: 24 }}>Generate your first AI-powered learning roadmap</p>
            <button className="btn btn-primary" onClick={() => setView('generate')}>✨ Generate roadmap</button>
          </div>
        ) : (
          <div className="grid-2">
            {roadmaps.map(r => {
              const done = r.weeks?.filter(w => w.completed).length || 0;
              const total = r.weeks?.length || 0;
              const pct = total ? Math.round((done / total) * 100) : 0;
              return (
                <div key={r._id} className="card" style={{ padding: 20, cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
                  onClick={() => { setActiveRoadmap(r); setView('detail'); }}
                >
                  <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 6 }}>{r.title}</h3>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                    <span className="tag">Year {r.year}</span>
                    <span className="tag">{r.goalType}</span>
                    <span className="tag">{r.branch}</span>
                  </div>
                  <div style={{ background: 'var(--border)', borderRadius: 99, height: 6, marginBottom: 6, overflow: 'hidden' }}>
                    <div style={{ background: pct === 100 ? 'var(--success)' : 'var(--brand)', height: '100%', width: `${pct}%`, borderRadius: 99 }} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{done}/{total} weeks done · {pct}%</div>
                </div>
              );
            })}
          </div>
        )
      }
    </div>
  );
}
