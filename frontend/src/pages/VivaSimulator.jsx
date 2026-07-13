import { useState, useRef } from 'react';
import axios from '../api/axios';

export default function VivaSimulator() {
  const [file, setFile] = useState(null);
  const [reportTitle, setReportTitle] = useState('');
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
    utter.pitch = 0.9; utter.rate = 0.95; // steady, serious examiner tone
    window.speechSynthesis.speak(utter);
  };

  const startViva = async () => {
    if (!file) { setError('Upload your project/lab report PDF'); return; }
    setError(''); setLoading(true);
    const formData = new FormData();
    formData.append('report', file);
    formData.append('reportTitle', reportTitle || file.name);

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

  if (report) {
    return (
      <div className="page-container" style={{ maxWidth: 860 }}>
        <h1>Viva Report</h1>
        <h2>Score: {report.overallScore}/100</h2>
        <p>{report.summary}</p>
        <h3>Topic Breakdown</h3>
        <ul>{report.topicBreakdown.map(t => <li key={t.topic}>{t.topic}: {t.depthScore}/100</li>)}</ul>
        <h3>Strengths</h3>
        <ul>{report.strengths.map(s => <li key={s}>{s}</li>)}</ul>
        <h3>Weak Points</h3>
        <ul>{report.weakPoints.map(s => <li key={s}>{s}</li>)}</ul>
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div className="page-container" style={{ maxWidth: 860 }}>
        <h1>Viva Simulator</h1>
        <input placeholder="Project title (optional)" value={reportTitle} onChange={e => setReportTitle(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 8 }} />
        <input type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])} />
        <button onClick={startViva} disabled={loading}>{loading ? 'Preparing...' : 'Start Viva'}</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 12 }}>
  For the best viva experience, upload your full report — problem statement, approach/methodology, 
  implementation details, and results/conclusion. A report with just the problem statement will still work, 
  but the examiner will have less to probe and questions may feel repetitive.
</p>
      </div>
      
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: 860 }}>
      <h2>Examiner: {question}</h2>

      <div style={{ maxHeight: 300, overflowY: 'auto', border: '1px solid #eee', padding: 12, borderRadius: 8, margin: '16px 0' }}>
        {log.map((l, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <p><strong>Q:</strong> {l.question}</p>
            <p><strong>A:</strong> {l.answer} <em>[{l.rubric.depth}]</em></p>
          </div>
        ))}
      </div>

      {!recording ? (
        <button onClick={startAnswering} disabled={loading}>{loading ? 'Examiner is thinking...' : 'Start Answering'}</button>
      ) : (
        <button onClick={stopAnswering}>Stop & Submit Answer</button>
      )}
      <button onClick={endViva} style={{ marginLeft: 10 }} disabled={loading}>End Viva</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}