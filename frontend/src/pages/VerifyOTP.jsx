import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function VerifyOtp() {
  const { verifyOtpAndRegister, sendOtpForRegister, loading } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [resent, setResent] = useState(false);
  const [email, setEmail] = useState('');
  const inputs = useRef([]);

  useEffect(() => {
    setEmail(localStorage.getItem('pendingEmail') || '');
    inputs.current[0]?.focus();
  }, []);

  const handleChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 3) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').slice(0, 4);
    if (!/^\d+$/.test(text)) return;
    const next = [...otp];
    [...text].forEach((c, i) => { if (i < 4) next[i] = c; });
    setOtp(next);
    inputs.current[Math.min(text.length, 3)]?.focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 4) { setError('Enter the complete 4-digit OTP'); return; }
    setError('');
    try {
      const name = localStorage.getItem('pendingName');
      const pass = localStorage.getItem('pendingPassword');
      const role = localStorage.getItem('pendingRole') || 'student';
      await verifyOtpAndRegister(name, email, pass, role, code);
    } catch (err) {
      setError(err.response?.data?.error || 'OTP verification failed. Please try again.');
      setOtp(['', '', '', '']);
      inputs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    try {
      await sendOtpForRegister(email);
      setResent(true);
      setTimeout(() => setResent(false), 5000);
      setOtp(['', '', '', '']);
    } catch { setError('Failed to resend OTP.'); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'var(--bg)' }}>
      <LoadingSpinner show={loading} />
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📬</div>
          <h1 style={{ fontWeight: 800, fontSize: '1.5rem', letterSpacing: -0.5 }}>Check your email</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginTop: 8 }}>
            We sent a 4-digit code to <strong style={{ color: 'var(--text)' }}>{email}</strong>
          </p>
        </div>

        <div className="card" style={{ padding: 28 }}>
          {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}
          {resent && <div style={{ background: '#d1fae5', color: '#065f46', padding: '10px 14px', borderRadius: 8, fontSize: '0.875rem', marginBottom: 16 }}>OTP resent successfully!</div>}

          <form onSubmit={handleVerify}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={el => inputs.current[i] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  style={{
                    width: 56, height: 60, textAlign: 'center', fontSize: '1.5rem', fontWeight: 700,
                    border: `2px solid ${d ? 'var(--brand)' : 'var(--border)'}`,
                    borderRadius: 12, background: 'var(--surface)', color: 'var(--text)',
                    outline: 'none', fontFamily: 'var(--mono)', transition: 'border-color 0.15s',
                  }}
                />
              ))}
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading || otp.join('').length < 4} style={{ width: '100%', justifyContent: 'center', padding: '12px 20px' }}>
              {loading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Verifying…</> : 'Verify & create account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.8rem', color: 'var(--muted)' }}>
            Didn't get it?{' '}
            <button type="button" onClick={handleResend} style={{ background: 'none', border: 'none', color: 'var(--brand)', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem', padding: 0 }}>
              Resend OTP
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
