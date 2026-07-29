import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import { getCreatorId, getCreatorName } from '../utils/projectHelpers';

const DIFF_STYLE = {
  beginner: { background: '#d1fae5', color: '#065f46' },
  intermediate: { background: '#fef3c7', color: '#92400e' },
  advanced: { background: '#fee2e2', color: '#991b1b' },
};

const CAT_STYLE = {
  web: { background: '#dbeafe', color: '#1e40af' },
  ai: { background: '#ede9fe', color: '#5b21b6' },
  mobile: { background: '#fce7f3', color: '#9d174d' },
  iot: { background: '#d1fae5', color: '#065f46' },
  desktop: { background: '#fef9c3', color: '#713f12' },
  other: { background: '#f1f0fb', color: '#6b6890' },
};

export default function ProjectCard({ project, onDelete, onLike, isMyProject, onClick, hasUnread }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(user ? project.likes?.includes(user.id) : false);
  const [likeCount, setLikeCount] = useState(project.likes?.length || 0);

  const isOwner = user?.id === getCreatorId(project);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) return navigate('/login');
    const next = !isLiked;
    const count = next ? likeCount + 1 : likeCount - 1;
    setIsLiked(next); setLikeCount(count);
    onLike?.(project._id, next, count);
    try {
      const { data } = await axios.put(`/api/v1/projects/${project._id}/like`);
      setIsLiked(data.isLiked); setLikeCount(data.likeCount);
      onLike?.(project._id, data.isLiked, data.likeCount);
    } catch {
      setIsLiked(!next); setLikeCount(next ? count - 1 : count + 1);
    }
  };

  const handleShare = (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/projects/${project._id}`;
    navigator.share ? navigator.share({ title: project.title, url }) : navigator.clipboard.writeText(url);
  };

  const diff = project.difficulty?.toLowerCase() || 'beginner';
  const cat = project.category?.toLowerCase() || 'other';

  return (
    <div
      onClick={onClick}
      className="card fade-in"
      style={{
        cursor: 'pointer', padding: 20, transition: 'box-shadow 0.2s, transform 0.2s',
        display: 'flex', flexDirection: 'column', gap: 12, height: '100%',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)', marginBottom: 8, lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {project.title}
          </h3>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ ...badge, ...CAT_STYLE[cat] }}>{project.category}</span>
            <span style={{ ...badge, ...DIFF_STYLE[diff] }}>{project.difficulty}</span>
          </div>
        </div>
        {isOwner && isMyProject && (
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            <IconBtn title="Edit" onClick={(e) => { e.stopPropagation(); navigate(`/projects/${project._id}/edit`); }}>
              <EditIcon />
            </IconBtn>
            <IconBtn title="Delete" danger onClick={(e) => { e.stopPropagation(); onDelete?.(project._id); }}>
              <TrashIcon />
            </IconBtn>
          </div>
        )}
      </div>

      {/* Tags */}
      {project.tags?.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {project.tags.slice(0, 4).map(t => (
            <span key={t} style={{ ...badge, background: 'var(--brand-light)', color: 'var(--brand)' }}>#{t}</span>
          ))}
          {project.tags.length > 4 && <span style={{ ...badge, background: 'var(--surface2)', color: 'var(--muted)' }}>+{project.tags.length - 4}</span>}
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)' }}>
            {getCreatorName(project)}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
            {new Date(project.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={handleLike} style={{ ...iconAction, color: isLiked ? '#ef4444' : 'var(--muted)' }} title="Like">
            <HeartIcon filled={isLiked} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{likeCount}</span>
          </button>
          <button onClick={handleShare} style={{ ...iconAction, color: 'var(--muted)' }} title="Share">
            <ShareIcon />
          </button>
          {user && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const creatorId = getCreatorId(project);
                if (!creatorId) return; // can't open a chat with a deleted user
                navigate(`/chat/${project._id}/${creatorId}`);
              }}
              style={{ ...iconAction, color: 'var(--success)', position: 'relative' }}
              title="Chat"
            >
              <ChatIcon />
              {hasUnread && <span style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: '50%', background: '#22c55e', border: '1.5px solid var(--surface)' }} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const badge = { display: 'inline-block', padding: '2px 8px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 600 };
const iconAction = { display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 2px', borderRadius: 6, transition: 'opacity 0.15s' };

function IconBtn({ onClick, danger, children, title }) {
  return (
    <button onClick={onClick} title={title} style={{ width: 30, height: 30, border: '1.5px solid var(--border)', borderRadius: 8, background: 'var(--surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: danger ? 'var(--danger)' : 'var(--muted)', transition: 'all 0.15s' }}>
      {children}
    </button>
  );
}

const EditIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const TrashIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>;
const HeartIcon = ({ filled }) => <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>;
const ShareIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;
const ChatIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;