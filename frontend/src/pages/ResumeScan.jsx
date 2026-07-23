import { useState,useRef,useEffect } from 'react';
import axios from '../api/axios';
import { useSocket } from '../context/SocketContext';
import { Link } from 'react-router-dom';
import ResumeResultView from '../components/ResumeResultView';
import { flattenScan } from '../utils/resumeHelpers';

//import { flattenScan } from '../utils/resumeHelpers';
// function ScoreCircle({ score }) {
//   const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : score >= 40 ? '#f97316' : '#ef4444';
//   const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Average' : 'Poor';
//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
//       <div style={{ width: 100, height: 100, borderRadius: '50%', border: `6px solid ${color}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: `${color}10` }}>
//         <span style={{ fontSize: '1.8rem', fontWeight: 800, color, lineHeight: 1 }}>{score}</span>
//         <span style={{ fontSize: '0.65rem', color: 'var(--muted)', fontWeight: 600 }}>/ 100</span>
//       </div>
//       <span style={{ fontSize: '0.8rem', fontWeight: 700, color }}>{label}</span>
//     </div>
//   );
// }

export default function ResumeScan() {
  const [mode, setMode] = useState('text');
  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [jd, setJd] = useState('');
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusLabel, setStatusLabel] = useState(''); // 'Queued...' / 'Analyzing with AI...'
  const pollRef = useRef(null);

  useEffect(() => () => clearInterval(pollRef.current), []); // cleanup if the user navigates away mid-poll
 


 const socket = useSocket();
const [activeScanId, setActiveScanId] = useState(null);

useEffect(() => {
  if (!socket || !activeScanId) return;

  const handleResumeReady = async (payload) => {
      console.log('🔴 resumeReady event received:', payload); // TEMPORARY — remove once confirmed working

    if (payload.scanId !== activeScanId) return; // not this session's job — ignore
    clearInterval(pollRef.current); // socket won the race against polling, stop the redundant checks
    try {
      const res = await axios.get(`/api/v1/resume/history/${activeScanId}`);
      const scan = res.data.data;
      if (scan.status === 'completed') setResult(flattenScan(scan));
      else setError(scan.errorMessage || 'Analysis failed.');
    } catch {
      setError('Could not load the completed result.');
    } finally {
      setLoading(false);
    }
  };

  socket.on('resumeReady', handleResumeReady);
  return () => socket.off('resumeReady', handleResumeReady);
}, [socket, activeScanId]);
 


  const flattenScan = (scan) => ({
    atsScore: scan.atsScore,
    strengths: scan.result?.strengths || [],
    weaknesses: scan.result?.weaknesses || [],
    missingKeywords: scan.result?.missingKeywords || [],
    presentKeywords: scan.result?.presentKeywords || [],
    improvements: scan.result?.improvements || [],
    sectionFeedback: scan.result?.sectionFeedback,
    overallFeedback: scan.result?.overallFeedback,
  });

  const pollForResult = (scanId) => {
  setActiveScanId(scanId);
  let attempts = 0;
  const MAX_ATTEMPTS = 30;

  pollRef.current = setInterval(async () => {
    attempts++;
    try {
      const res = await axios.get(`/api/v1/resume/history/${scanId}`);
      const scan = res.data.data;
      if (scan.status === 'processing') setStatusLabel('Analyzing with AI…');
      if (scan.status === 'completed') {
        clearInterval(pollRef.current);
        setResult(flattenScan(scan));
        setLoading(false);
        setActiveScanId(null);
      } else if (scan.status === 'failed') {
        clearInterval(pollRef.current);
        setError(scan.errorMessage || 'Analysis failed. Please try again.');
        setLoading(false);
        setActiveScanId(null);
      } else if (attempts >= MAX_ATTEMPTS) {
        clearInterval(pollRef.current);
        setError('This is taking longer than expected. Your result will still appear in your Resume History once it\'s ready — no need to resubmit.');
        setLoading(false);
        setActiveScanId(null);
      }
    } catch {
      clearInterval(pollRef.current);
      setError('Lost connection while checking analysis status.');
      setLoading(false);
      setActiveScanId(null);
    }
  }, 2000);
};

  const analyze = async () => {
    setError(''); setLoading(true); setStatusLabel('Queued, waiting to start…');
    try {
      let scanId;
      if (mode === 'file' && file) {
        const fd = new FormData();
        fd.append('resume', file);
        if (targetRole) fd.append('targetRole', targetRole);
        if (jd) fd.append('jobDescription', jd);
        const res = await axios.post('/api/v1/resume/analyze', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        scanId = res.data.data.scanId;
      } else {
        const res = await axios.post('/api/v1/resume/analyze', { resumeText, targetRole, jobDescription: jd });
        scanId = res.data.data.scanId;
      }
      pollForResult(scanId);
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed. Please try again.');
      setLoading(false);
    }
  };

  // ...rest of the component (JSX) is completely unchanged, except the button label below...
  return (
    <div className="page-container" style={{ maxWidth: 860 }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
        <h1 style={{ fontWeight: 800, fontSize: '1.8rem', letterSpacing: -0.5, marginBottom: 8 }}>ATS Resume Checker</h1>
        <p style={{ color: 'var(--muted)', maxWidth: 500, margin: '0 auto' }}>Get an instant ATS score and specific improvements for your resume</p>
      </div>
     <div style={{ textAlign: 'center', marginBottom: 36 }}>
  <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
  <h1 style={{ fontWeight: 800, fontSize: '1.8rem', letterSpacing: -0.5, marginBottom: 8 }}>ATS Resume Checker</h1>
  <p style={{ color: 'var(--muted)', maxWidth: 500, margin: '0 auto' }}>Get an instant ATS score and specific improvements for your resume</p>
  <Link to="/resume/history" style={{ fontSize: '0.8rem', color: 'var(--brand)', marginTop: 8, display: 'inline-block' }}>View past scans →</Link>
</div>
      {!result ? (
        <div className="card" style={{ padding: 28 }}>
          {/* Mode toggle */}
          <div style={{ display: 'flex', gap: 0, border: '1.5px solid var(--border)', borderRadius: 8, overflow: 'hidden', marginBottom: 20, width: 'fit-content' }}>
            {['text', 'file'].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{ padding: '8px 20px', background: mode === m ? 'var(--brand)' : 'transparent', color: mode === m ? '#fff' : 'var(--muted)', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', fontFamily: 'var(--font)' }}>
                {m === 'text' ? '📝 Paste text' : '📎 Upload PDF'}
              </button>
            ))}
          </div>

          {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {mode === 'text' ? (
              <div>
                <label className="label">Resume text *</label>
                <textarea className="input" rows={10} value={resumeText} onChange={e => setResumeText(e.target.value)} placeholder="Paste your entire resume here…" style={{ resize: 'vertical', fontFamily: 'var(--mono)', fontSize: '0.8rem' }} />
              </div>
            ) : (
              <div>
                <label className="label">Resume PDF *</label>
                <div style={{ border: '2px dashed var(--border)', borderRadius: 10, padding: 28, textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.15s' }}
                  onClick={() => document.getElementById('resume-file').click()}
                  onDragOver={e => { e.preventDefault(); }}
                  onDrop={e => { e.preventDefault(); setFile(e.dataTransfer.files[0]); }}
                >
                  <input id="resume-file" type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />
                  {file ? (
                    <div><p style={{ fontWeight: 600, color: 'var(--brand)' }}>✅ {file.name}</p><p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 4 }}>{(file.size / 1024).toFixed(0)} KB</p></div>
                  ) : (
                    <div><p style={{ color: 'var(--muted)' }}>Drop PDF here or click to browse</p><p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 4 }}>Max 5MB</p></div>
                  )}
                </div>
              </div>
            )}

            <div className="grid-2">
              <div><label className="label">Target role (optional)</label><input className="input" value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder="SDE Intern, Data Analyst…" /></div>
            </div>

            <div>
              <label className="label">Job description (optional — improves accuracy)</label>
              <textarea className="input" rows={4} value={jd} onChange={e => setJd(e.target.value)} placeholder="Paste the job description you're applying for…" style={{ resize: 'vertical' }} />
            </div>

            <button className="btn btn-primary" onClick={analyze} disabled={loading || (mode === 'text' && !resumeText.trim()) || (mode === 'file' && !file)} style={{ justifyContent: 'center', padding: '13px 20px' }}>
{loading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> {statusLabel}</> : '✨ Analyze resume'}            </button>
          </div>
        </div>
            ) : (
        <ResumeResultView
          result={result}
          onTryAgain={() => setResult(null)}
        />
      )}
    </div>
  );
}