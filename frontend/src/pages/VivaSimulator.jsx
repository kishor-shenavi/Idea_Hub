import { useState, useRef } from 'react';
import axios from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';

export default function VivaSimulator() {
  const [file, setFile] = useState(null);
  const [reportTitle, setReportTitle] = useState('');
  const [reportText, setReportText] = useState('');
  const [inputMode, setInputMode] = useState('pdf');
  const [sessionId, setSessionId] = useState(null);
  const [question, setQuestion] = useState('');
  const [log, setLog] = useState([]);
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const mediaRecorder = useRef(null);
  const chunks = useRef([]);

  const speak = (text) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.pitch = 0.9; utter.rate = 0.95;
    window.speechSynthesis.speak(utter);
  };

  const startViva = async () => {
    if (inputMode === 'pdf' && !file) { setError('Upload your project/lab report PDF'); return; }
    if (inputMode === 'paste' && reportText.trim().length < 50) { setError('Paste at least a few paragraphs of report content'); return; }
    setError(''); setLoading(true);

    const formData = new FormData();
    if (inputMode === 'pdf') {
      formData.append('report', file);
    } else {
      formData.append('reportText', reportText);
    }
    formData.append('reportTitle', reportTitle || (file ? file.name : 'Untitled Project'));

    try {
      const res = await axios.post('/api/v1/viva/start', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSessionId(res.data.data.sessionId);
      setQuestion(res.data.data.question);
      speak(res.data.data.question);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not start viva');
    } finally { setLoading(false); }
  };

  const startAnswering = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);
    chunks.current = [];
    mediaRecorder.current.ondataavailable = e => chunks.current.push(e.data);
    mediaRecorder.current.onstop = () => submitAnswer();
    mediaRecorder.current.start();
    setRecording(true);
  };

  const stopAnswering = () => {
    mediaRecorder.current.stop();
    mediaRecorder.current.stream.getTracks().forEach(t => t.stop());
    setRecording(false);
  };

  const submitAnswer = async () => {
    setLoading(true);
    const blob = new Blob(chunks.current, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('audio', blob, 'answer.webm');

    try {
      const res = await axios.post(`/api/v1/viva/${sessionId}/answer`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setLog(l => [...l, { question, answer: res.data.data.answerText, rubric: res.data.data.rubric, action: res.data.data.action }]);
      setQuestion(res.data.data.nextQuestion);
      speak(res.data.data.nextQuestion);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not process answer');
    } finally { setLoading(false); }
  };

  const endViva = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`/api/v1/viva/${sessionId}/end`);
      setReport(res.data.data.report);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not end viva');
    } finally { setLoading(false); }
  };

  const depthColor = { vague: { bg: '#fee2e2', c: '#991b1b' }, adequate: { bg: '#fef3c7', c: '#92400e' }, strong: { bg: '#d1fae5', c: '#065f46' } };

  if (report) {
    return (
      <div className="page-container" style={{ maxWidth: 820 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ fontWeight: 800, fontSize: '1.6rem', letterSpacing: -0.5 }}>Viva Report</h1>
        </div>
        <div className="card" style={{ padding: 28, textAlign: 'center', marginBottom: 20, background: 'linear-gradient(135deg, var(--brand-light), var(--surface))' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Overall Score</div>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--brand)', letterSpacing: -2 }}>{report.overallScore}<span style={{ fontSize: '1.2rem', color: 'var(--muted)' }}>/100</span></div>
        </div>

        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 14 }}>Topic breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {report.topicBreakdown.map(t => (
              <div key={t.topic}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                  <span>{t.topic}</span><span style={{ fontWeight: 700 }}>{t.depthScore}/100</span>
                </div>
                <div style={{ height: 8, borderRadius: 99, background: 'var(--surface2)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${t.depthScore}%`, background: 'var(--brand)', borderRadius: 99 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.7 }}>{report.summary}</p>
        </div>

        <div className="grid-2">
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 14 }}>✓ Strengths</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {report.strengths.map(s => <li key={s} style={{ fontSize: '0.875rem', display: 'flex', gap: 8 }}><span style={{ color: 'var(--success)' }}>●</span> {s}</li>)}
            </ul>
          </div>
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 14 }}>⚠ Weak points</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {report.weakPoints.map(s => <li key={s} style={{ fontSize: '0.875rem', display: 'flex', gap: 8 }}><span style={{ color: 'var(--danger)' }}>●</span> {s}</li>)}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div className="page-container" style={{ maxWidth: 620 }}>
        <LoadingSpinner show={loading} />
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--brand)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 16 }}>🎓</div>
          <h1 style={{ fontWeight: 800, fontSize: '1.6rem', letterSpacing: -0.5 }}>Viva Simulator</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: 6 }}>Upload your report and face adaptive oral-defense questioning.</p>
        </div>

        {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}

        <div className="card" style={{ padding: 28 }}>
          <label className="label">Project title</label>
          <input className="input" placeholder="e.g. Smart Attendance System" value={reportTitle} onChange={e => setReportTitle(e.target.value)} style={{ marginBottom: 20 }} />

          <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: 14, lineHeight: 1.5 }}>
            For the best viva experience, upload your full report — problem statement, approach/methodology,
            implementation details, and results/conclusion. A report with just the problem statement will still work,
            but the examiner will have less to probe.
          </p>

          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button
              onClick={() => setInputMode('pdf')}
              className={inputMode === 'pdf' ? 'btn btn-primary' : 'btn btn-ghost'}
              style={{ flex: 1, justifyContent: 'center' }}
            >Upload PDF</button>
            <button
              onClick={() => setInputMode('paste')}
              className={inputMode === 'paste' ? 'btn btn-primary' : 'btn btn-ghost'}
              style={{ flex: 1, justifyContent: 'center' }}
            >Paste Text</button>
          </div>

          {inputMode === 'pdf' ? (
            <div style={{ border: '1.5px dashed var(--border)', borderRadius: 'var(--radius-sm)', padding: 24, textAlign: 'center', marginBottom: 20 }}>
              <input type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])} />
              {file && <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 10 }}>{file.name}</p>}
            </div>
          ) : (
            <textarea
              className="input"
              placeholder="Paste your project/lab report content here (scanned PDFs can't be read automatically — paste the text instead)"
              value={reportText}
              onChange={e => setReportText(e.target.value)}
              rows={8}
              style={{ marginBottom: 20, resize: 'vertical', fontFamily: 'var(--font)' }}
            />
          )}

          <button onClick={startViva} disabled={loading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 12 }}>
            {loading ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : 'Start Viva'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: 820 }}>
      <LoadingSpinner show={loading} />

      <div className="card" style={{ padding: 24, marginBottom: 20, background: 'var(--brand-light)', borderColor: 'var(--brand)' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Examiner asks</div>
        <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.6 }}>{question}</p>
      </div>

      {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}

      {log.length > 0 && (
        <div className="card" style={{ maxHeight: 320, overflowY: 'auto', padding: 20, marginBottom: 20 }}>
          {log.map((l, i) => (
            <div key={i} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: i < log.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>Q: {l.question}</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 6 }}>A: {l.answer}</p>
              <span className="tag" style={{ background: depthColor[l.rubric.depth]?.bg, color: depthColor[l.rubric.depth]?.c }}>{l.rubric.depth}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        {!recording ? (
          <button onClick={startAnswering} disabled={loading} className="btn btn-primary" style={{ padding: '12px 28px' }}>
            {loading ? 'Examiner is thinking…' : '🎙️ Start Answering'}
          </button>
        ) : (
          <button onClick={stopAnswering} className="btn btn-danger" style={{ padding: '12px 28px' }}>⏹ Stop & Submit</button>
        )}
        <button onClick={endViva} disabled={loading} className="btn btn-outline" style={{ padding: '12px 28px' }}>End Viva</button>
      </div>
    </div>
  );
}
