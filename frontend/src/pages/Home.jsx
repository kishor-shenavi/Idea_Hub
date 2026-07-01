import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  { icon: '💡', title: 'Project Ideas', desc: 'Browse 100s of project ideas shared by seniors across every tech domain.' },
  { icon: '🗺️', title: 'AI Roadmaps', desc: 'Get a personalized week-by-week learning roadmap powered by AI.' },
  { icon: '📄', title: 'ATS Resume Checker', desc: 'Upload your resume and get an instant ATS score with improvements.' },
  { icon: '🏢', title: 'Company Wiki', desc: 'Know exactly what happens in interviews at Google, Microsoft, Razorpay and more.' },
  { icon: '😬', title: 'Regret Board', desc: 'Anonymous confessions from seniors — what they wish they did earlier.' },
  { icon: '🤝', title: 'Mentor Connect', desc: 'Request a 1-on-1 session with a senior who built what you want to build.' },
];

const STATS = [
  { value: '500+', label: 'Project ideas' },
  { value: '1.2K+', label: 'Students' },
  { value: '200+', label: 'Senior paths' },
  { value: '50+', label: 'Companies covered' },
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
            Project ideas, AI roadmaps, interview prep, salary data, and senior wisdom — everything you need from Year 1 to placement.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {user ? (
              <>
                <Link to="/projects" className="btn btn-primary" style={{ padding: '13px 28px', fontSize: '0.95rem' }}>Browse ideas</Link>
                <Link to="/roadmap" className="btn btn-outline" style={{ padding: '13px 28px', fontSize: '0.95rem' }}>Generate roadmap</Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary" style={{ padding: '13px 28px', fontSize: '0.95rem' }}>Get started free</Link>
                <Link to="/projects" className="btn btn-outline" style={{ padding: '13px 28px', fontSize: '0.95rem' }}>Browse ideas</Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: 'var(--surface)', borderBottom: '1.5px solid var(--border)', padding: '28px 20px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, textAlign: 'center' }}>
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--brand)', letterSpacing: -1 }}>{value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 500, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '72px 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 style={{ fontWeight: 800, fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', letterSpacing: -0.8, marginBottom: 12 }}>Everything in one place</h2>
            <p style={{ color: 'var(--muted)', fontSize: '1rem', maxWidth: 480, margin: '0 auto' }}>No more scattered info across Reddit, seniors' WhatsApp, and random blogs.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {FEATURES.map(({ icon, title, desc }) => (
              <div key={title} className="card" style={{ padding: 24, transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
              >
                <div style={{ fontSize: 28, marginBottom: 12 }}>{icon}</div>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--muted)', lineHeight: 1.6 }}>{desc}</p>
              </div>
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
            {[
              { year: 'Year 1', color: '#d1fae5', textColor: '#065f46', emoji: '🌱', items: ['Explore project ideas', 'Build first projects', 'Learn from senior paths', 'Join clubs & hackathons'] },
              { year: 'Year 2', color: '#dbeafe', textColor: '#1e40af', emoji: '⚡', items: ['AI roadmap generator', 'Start building in public', 'Request a mentor', 'Explore AI project ideas'] },
              { year: 'Year 3', color: '#fef3c7', textColor: '#92400e', emoji: '🎯', items: ['Internship board', 'Market skill tracker', 'Company interview wiki', 'ATS resume checker'] },
              { year: 'Year 4', color: '#fee2e2', textColor: '#991b1b', emoji: '🏆', items: ['Placement board', 'Salary benchmarks', 'Share your own path', 'Become a mentor'] },
            ].map(({ year, color, textColor, emoji, items }) => (
              <div key={year} className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{emoji}</div>
                  <span style={{ fontWeight: 700, color: textColor }}>{year}</span>
                </div>
                <ul style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {items.map(item => (
                    <li key={item} style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                      <span style={{ color: textColor, flexShrink: 0, marginTop: 1 }}>✓</span> {item}
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
          section > div { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 400px) {
          section > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
