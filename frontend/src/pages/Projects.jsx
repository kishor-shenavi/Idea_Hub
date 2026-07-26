import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import ProjectCard from '../components/ProjectCard';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { useSocket } from '../context/SocketContext'; // add
const CATEGORIES = ['web', 'mobile', 'desktop', 'ai', 'iot', 'other'];
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

export default function Projects() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [tab, setTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [sort, setSort] = useState('newest');
  const [selectedProject, setSelectedProject] = useState(null);
  const observerRef = useRef();
  const lastCardRef = useRef();


  const socket = useSocket();
const [unreadProjectIds, setUnreadProjectIds] = useState(new Set());

useEffect(() => {
  if (!user) return;
  axios.get('/api/v1/chat/unread').then(res => {
    setUnreadProjectIds(new Set(Object.keys(res.data.data)));
  });
}, [user]);

useEffect(() => {
  if (!socket) return;
  const handleNotif = (payload) => {
    setUnreadProjectIds(prev => new Set(prev).add(payload.projectId));
  };
  socket.on('newProjectMessageNotification', handleNotif);
  return () => socket.off('newProjectMessageNotification', handleNotif);
}, [socket]);

  useEffect(() => {
    if (location.state?.showMineOnly) setTab('my');
  }, [location.state]);

  const fetchProjects = useCallback(async (pg = 1, append = false) => {
    try {
      setLoading(true);
      let url = `/api/v1/projects?page=${pg}&limit=12`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (category) url += `&category=${category}`;
      if (difficulty) url += `&difficulty=${difficulty}`;
      if (sort === 'likes') url += `&sort=likes`;

      const promises = [axios.get(url)];
      if (user) promises.push(axios.get('/api/v1/projects/user/my'));

      const [allRes, myRes] = await Promise.all(promises);
      const newProjects = allRes.data.data;

      setProjects(prev => append ? [...prev, ...newProjects] : newProjects);
      setHasMore(pg < allRes.data.totalPages);
      setPage(pg);
      if (myRes) setMyProjects(myRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, category, difficulty, sort, user]);

  useEffect(() => { fetchProjects(1); }, [fetchProjects]);

  // Infinite scroll
  useEffect(() => {
    if (tab !== 'all') return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        fetchProjects(page + 1, true);
      }
    });
    if (lastCardRef.current) observerRef.current.observe(lastCardRef.current);
  }, [hasMore, loading, page, fetchProjects, tab]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await axios.delete(`/api/v1/projects/${id}`);
      setProjects(p => p.filter(x => x._id !== id));
      setMyProjects(p => p.filter(x => x._id !== id));
      if (selectedProject?._id === id) setSelectedProject(null);
    } catch { alert('Failed to delete.'); }
  };

  const handleLike = (id, liked, count) => {
    const update = p => p.map(x => x._id === id ? { ...x, likes: liked ? [...x.likes, user.id] : x.likes.filter(i => i !== user.id) } : x);
    setProjects(update);
    setMyProjects(update);
    if (selectedProject?._id === id) setSelectedProject(p => ({ ...p, likes: liked ? [...p.likes, user.id] : p.likes.filter(i => i !== user.id) }));
  };

  const displayed = tab === 'all' ? projects : myProjects;

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - var(--nav-h))', position: 'relative' }}>
      {/* Main */}
      <div style={{ flex: 1, padding: '28px 24px', transition: 'margin-right 0.3s', marginRight: selectedProject ? 420 : 0, minWidth: 0 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <div>
            <h1 style={{ fontWeight: 800, fontSize: '1.6rem', letterSpacing: -0.5 }}>{tab === 'all' ? 'Project ideas' : 'My projects'}</h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginTop: 2 }}>{tab === 'all' ? 'Browse and get inspired' : 'Projects you submitted'}</p>
          </div>
          {user && (
            <Link to="/projects/create" className="btn btn-primary">+ Add project</Link>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1.5px solid var(--border)', marginBottom: 20 }}>
          {['all', ...(user ? ['my'] : [])].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.875rem', fontFamily: 'var(--font)',
              color: tab === t ? 'var(--brand)' : 'var(--muted)',
              borderBottom: tab === t ? '2px solid var(--brand)' : '2px solid transparent',
              marginBottom: -1.5, transition: 'color 0.15s',
            }}>
              {t === 'all' ? 'All projects' : 'My projects'}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input className="input" style={{ paddingLeft: 36 }} placeholder="Search by title, tags…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input" style={{ width: 'auto' }} value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
          <select className="input" style={{ width: 'auto' }} value={difficulty} onChange={e => setDifficulty(e.target.value)}>
            <option value="">All levels</option>
            {DIFFICULTIES.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
          </select>
          <select className="input" style={{ width: 'auto' }} value={sort} onChange={e => setSort(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="likes">Most liked</option>
          </select>
        </div>

        {/* Grid */}
        {loading && projects.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <LoadingSpinner show inline />
          </div>
        ) : displayed.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <p style={{ fontWeight: 600, marginBottom: 6 }}>No projects found</p>
            <p style={{ fontSize: '0.875rem' }}>{tab === 'all' ? 'Try adjusting filters' : 'Create your first project!'}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${selectedProject ? '260px' : '300px'}, 1fr))`, gap: 16 }}>
            {displayed.map((p, i) => {
              const isLast = i === displayed.length - 1 && tab === 'all';
              return (
                <div key={p._id} ref={isLast ? lastCardRef : null}>
              <ProjectCard
  project={p}
  onLike={handleLike}
  onDelete={handleDelete}
  isMyProject={tab === 'my'}
  onClick={() => setSelectedProject(prev => prev?._id === p._id ? null : p)}
  hasUnread={unreadProjectIds.has(p._id)}
/>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Side Panel */}
      {selectedProject && (
        <div style={{
          position: 'fixed', top: 'var(--nav-h)', right: 0, width: 420, height: 'calc(100vh - var(--nav-h))',
          background: 'var(--surface)', borderLeft: '1.5px solid var(--border)',
          overflowY: 'auto', zIndex: 50, display: 'flex', flexDirection: 'column',
        }} className="slide-in-right">
          <div style={{ padding: 24, flex: 1 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <h2 style={{ fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.3, flex: 1, marginRight: 12 }}>{selectedProject.title}</h2>
              <button onClick={() => setSelectedProject(null)} style={{ background: 'var(--surface2)', border: '1.5px solid var(--border)', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Badges */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
              <span className={`tag badge-${selectedProject.category}`}>{selectedProject.category}</span>
              <span className={`tag badge-${selectedProject.difficulty}`}>{selectedProject.difficulty}</span>
            </div>

            {/* Description */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 }}>Description</div>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.7, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>{selectedProject.description}</p>
            </div>

            {/* Tags */}
            {selectedProject.tags?.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 }}>Tags</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {selectedProject.tags.map(t => <span key={t} className="tag">#{t}</span>)}
                </div>
              </div>
            )}

            {/* Tech stack */}
            {selectedProject.techStack?.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 }}>Tech stack</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {selectedProject.techStack.map(t => <span key={t} style={{ display: 'inline-block', background: 'var(--surface2)', color: 'var(--text)', padding: '3px 10px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 500, fontFamily: 'var(--mono)' }}>{t}</span>)}
                </div>
              </div>
            )}

            {/* Links */}
            {(selectedProject.githubUrl || selectedProject.documentationUrl || selectedProject.demoUrl) && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 }}>Links</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {selectedProject.githubUrl && <a href={selectedProject.githubUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.875rem', color: 'var(--brand)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>⚡</span> GitHub Repository
                  </a>}
                  {selectedProject.documentationUrl && <a href={selectedProject.documentationUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.875rem', color: 'var(--brand)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>📖</span> Documentation
                  </a>}
                  {selectedProject.demoUrl && <a href={selectedProject.demoUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.875rem', color: 'var(--brand)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>🚀</span> Live demo
                  </a>}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: '16px 24px', borderTop: '1.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{typeof selectedProject.createdBy === 'object' ? selectedProject.createdBy?.name : 'Unknown'}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{new Date(selectedProject.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
            </div>
            {user && user.id !== (typeof selectedProject.createdBy === 'object' ? selectedProject.createdBy._id : selectedProject.createdBy) && (
              <button className="btn btn-outline" style={{ fontSize: '0.8rem' }} onClick={() => navigate(`/chat/${selectedProject._id}/${typeof selectedProject.createdBy === 'object' ? selectedProject.createdBy._id : selectedProject.createdBy}`)}>
                💬 Chat with senior
              </button>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .slide-in-right { width: 100% !important; }
        }
      `}</style>
    </div>
  );
}
