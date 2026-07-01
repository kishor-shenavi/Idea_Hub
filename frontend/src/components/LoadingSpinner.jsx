export default function LoadingSpinner({ show, inline = false }) {
  if (inline) return <span className="spinner" />;
  if (!show) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(248,247,255,0.75)',
      backdropFilter: 'blur(6px)',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 48, height: 48,
          border: '3px solid var(--border)',
          borderTopColor: 'var(--brand)',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }} />
        <span style={{ fontSize: '0.875rem', color: 'var(--muted)', fontWeight: 500 }}>Loading…</span>
      </div>
    </div>
  );
}
