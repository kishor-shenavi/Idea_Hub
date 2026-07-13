import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  { icon: '💡', title: 'Project Ideas', desc: 'Browse project ideas shared by seniors across every tech domain.', to: '/projects' },
  { icon: '🛤️', title: 'Senior Paths', desc: 'See the exact path seniors took — courses, projects, internships, in order.', to: '/paths' },
  { icon: '🗺️', title: 'AI Roadmaps', desc: 'Get a personalized week-by-week learning roadmap powered by AI.', to: '/roadmap' },
  { icon: '📄', title: 'ATS Resume Checker', desc: 'Upload your resume and get an instant ATS score with improvements.', to: '/resume' },
  { icon: '🎙️', title: 'AI Mock Interview', desc: 'Practice real interview questions with an AI interviewer that adapts.', to: '/interview' },
  { icon: '🐙', title: 'GitHub Intelligence', desc: 'Connect GitHub and see exactly what a recruiter would think of your profile.', to: '/github-intelligence' },
  { icon: '🗣️', title: 'Public Speaking Coach', desc: 'Speak on a topic and get pace, filler-word, and pitch feedback.', to: '/extempore-coach' },
  { icon: '👥', title: 'GD Simulator', desc: 'Practice group discussions against AI personas with distinct personalities.', to: '/gd-simulator' },
  { icon: '🎓', title: 'Viva Simulator', desc: 'Upload your project report and face adaptive oral-defense questioning.', to: '/viva-simulator' },
  { icon: '🏢', title: 'Internships', desc: 'Browse internship openings shared by students and seniors.', to: '/internships' },
  { icon: '😬', title: 'Regret Board', desc: 'Anonymous confessions from seniors — what they wish they did earlier.', to: '/regrets' },
];

const YEAR_GUIDE = [
  {
    year: 'Year 1', color: '#d1fae5', textColor: '#065f46', emoji: '🌱',
    items: [
       { label: 'Viva simulator', to: '/viva-simulator' },
      { label: 'Learn from senior paths', to: '/paths' },
       { label: 'AI roadmap generator', to: '/roadmap' },
    ],
  },
  {
    year: 'Year 2', color: '#dbeafe', textColor: '#1e40af', emoji: '⚡',
    items: [
       { label: 'Explore project ideas', to: '/projects' },
      { label: 'GitHub portfolio intelligence', to: '/github-intelligence' },
    ],
  },
  {
    year: 'Year 3', color: '#fef3c7', textColor: '#92400e', emoji: '🎯',
    items: [
      { label: 'Internship board', to: '/internships' },
      { label: 'ATS resume checker', to: '/resume' },
      { label: 'AI mock interview', to: '/interview' },
    ],
  },
  {
    year: 'Year 4', color: '#fee2e2', textColor: '#991b1b', emoji: '🏆',
    items: [
      { label: 'GD simulator', to: '/gd-simulator' },
      { label: 'Public speaking coach', to: '/extempore-coach' },
      { label: 'Regret board', to: '/regrets' },
    ],
  },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div style={{ overflowX: 'hidden' }}>
      {/* Hero */}
      <section style={{
        padding: '80px 20px 60px',
        textAlign: 'center',
        background: 'linear-gradient(160deg, #f0edff 0%, #f8f7ff 50%, #fff5ed 100%)',
        borderBottom: '1.5px solid var(--border)',
      }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ display: 'inline-block', background: 'var(--brand-light)', color: 'var(--brand)', padding: '6px 16px', borderRadius: 99, fontSize: '0.8rem', fontWeight: 700, marginBottom: 24, letterSpacing: 0.5 }}>
            🎓 Built for engineering students
          </div>
          <h1 style={{ fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3.4rem)', lineHeight: 1.15, letterSpacing: -1.5, marginBottom: 20, color: 'var(--text)' }}>
            Your college-to-career{' '}
            <span style={{ color: 'var(--brand)' }}>operating system</span>
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: 'var(--muted)', lineHeight: 1.7, maxWidth: 560, margin: '0 auto 36px' }}>
            Project ideas, AI roadmaps, interview prep, GD and viva practice, and senior wisdom — everything you need from Year 1 to placement.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {user ? (
              <a href="#features" className="btn btn-primary" style={{ padding: '13px 28px', fontSize: '0.95rem' }}>Explore your tools ↓</a>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary" style={{ padding: '13px 28px', fontSize: '0.95rem' }}>Get started free</Link>
                <a href="#features" className="btn btn-outline" style={{ padding: '13px 28px', fontSize: '0.95rem' }}>See what's inside</a>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '72px 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 style={{ fontWeight: 800, fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', letterSpacing: -0.8, marginBottom: 12 }}>Everything in one place</h2>
            <p style={{ color: 'var(--muted)', fontSize: '1rem', maxWidth: 520, margin: '0 auto' }}>
              One dashboard for every tool you need — from your first project idea to your final placement round.
            </p>
            {!user && (
              <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginTop: 8 }}>
                Sign in to open any tool below.
              </p>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {FEATURES.map(({ icon, title, desc, to }) => (
              <Link
                key={title}
                to={to}
                className="card"
                style={{ padding: 24, transition: 'transform 0.2s, box-shadow 0.2s', textDecoration: 'none', color: 'inherit', display: 'block' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
              >
                <div style={{ fontSize: 28, marginBottom: 12 }}>{icon}</div>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--muted)', lineHeight: 1.6 }}>{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Year guide */}
      <section style={{ background: 'var(--surface2)', borderTop: '1.5px solid var(--border)', borderBottom: '1.5px solid var(--border)', padding: '72px 20px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ fontWeight: 800, fontSize: 'clamp(1.4rem, 3vw, 2rem)', letterSpacing: -0.5, textAlign: 'center', marginBottom: 48 }}>
            Built for every year of college
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {YEAR_GUIDE.map(({ year, color, textColor, emoji, items }) => (
              <div key={year} className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{emoji}</div>
                  <span style={{ fontWeight: 700, color: textColor }}>{year}</span>
                </div>
                <ul style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {items.map(({ label, to }) => (
                    <li key={label}>
                      <Link to={to} style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'flex', alignItems: 'flex-start', gap: 6, textDecoration: 'none' }}
                        onMouseEnter={e => { e.currentTarget.style.color = textColor; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; }}
                      >
                        <span style={{ color: textColor, flexShrink: 0, marginTop: 1 }}>✓</span> {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section style={{ padding: '80px 20px', textAlign: 'center', background: 'var(--brand)' }}>
          <h2 style={{ fontWeight: 800, fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', color: '#fff', marginBottom: 16, letterSpacing: -0.5 }}>
            Start your journey today
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1rem', marginBottom: 32, maxWidth: 440, margin: '0 auto 32px' }}>
            Free forever. No spam. Just a community of students helping each other.
          </p>
          <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: 'var(--brand)', padding: '13px 32px', borderRadius: 10, fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none' }}>
            Create free account →
          </Link>
        </section>
      )}

      <style>{`
        @media (max-width: 640px) {
          #features > div > div { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 400px) {
          #features > div > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
