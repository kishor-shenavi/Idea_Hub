import { useState, useRef } from 'react';
import axios from '../api/axios';
import { analyzeAudioBlob } from '../utils/audioAnalysis';
import SpeechTimeline from '../components/SpeechTimeline';
import LoadingSpinner from '../components/LoadingSpinner';
import { Link } from 'react-router-dom';
const TOPICS = [
  'Should college students take a gap year?',
  'Is remote work better than office work?',
  'Should AI tools be allowed in interviews?',
];

export default function ExtemporeCoach() {
  const [topic, setTopic] = useState('');
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const mediaRecorder = useRef(null);
  const chunks = useRef([]);
  const timerRef = useRef(null);

  const startRecording = async () => {
    if (!topic.trim()) { setError('Pick or type a topic first'); return; }
    setError(''); setResult(null); setSeconds(0);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);
    chunks.current = [];

    mediaRecorder.current.ondataavailable = e => chunks.current.push(e.data);
    mediaRecorder.current.onstop = () => submitRecording();

    mediaRecorder.current.start();
    setRecording(true);
    timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
  };

  const stopRecording = () => {
    mediaRecorder.current.stop();
    mediaRecorder.current.stream.getTracks().forEach(t => t.stop());
    clearInterval(timerRef.current);
    setRecording(false);
  };

  const submitRecording = async () => {
    setLoading(true);
    setError('');
    const blob = new Blob(chunks.current, { type: 'audio/webm' });

    try {
      const audioAnalysis = await analyzeAudioBlob(blob);

      const formData = new FormData();
      formData.append('audio', blob, 'speech.webm');
      formData.append('topic', topic);
      formData.append('audioAnalysis', JSON.stringify(audioAnalysis));

      const res = await axios.post('/api/v1/extempore/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed');
    } finally { setLoading(false); }
  };

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="page-container" style={{ maxWidth: 820 }}>
      <LoadingSpinner show={loading} />
       <Link to="/extempore-coach/history" style={{ fontSize: '0.8rem', color: 'var(--brand)', marginTop: 8, display: 'inline-block' }}>View history →</Link>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--brand)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 16 }}>🗣️</div>
        <h1 style={{ fontWeight: 800, fontSize: '1.6rem', letterSpacing: -0.5 }}>Public Speaking Coach</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: 6, maxWidth: 480, margin: '6px auto 0' }}>
          Speak for 60–90 seconds and get pace, filler-word, and delivery feedback.
        </p>
      </div>

      {error && <div className="error-msg" style={{ marginBottom: 20 }}>{error}</div>}

      {!result && (
        <div className="card" style={{ padding: 28 }}>
          <label className="label">Topic</label>
          <select
            className="input"
            value={TOPICS.includes(topic) ? topic : ''}
            onChange={e => setTopic(e.target.value)}
            disabled={recording}
            style={{ marginBottom: 10 }}
          >
            <option value="">— Pick a suggested topic —</option>
            {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--muted)', margin: '4px 0 10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>or</div>

          <input
            className="input"
            type="text"
            placeholder="Type your own topic"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            disabled={recording}
            style={{ marginBottom: 24 }}
          />

          <div style={{ textAlign: 'center' }}>
            {!recording ? (
              <button onClick={startRecording} disabled={loading} className="btn btn-primary" style={{ padding: '12px 32px' }}>
                🎙️ Start Speaking
              </button>
            ) : (
              <button onClick={stopRecording} className="btn btn-danger" style={{ padding: '12px 32px' }}>
                ⏹ Stop · {fmt(seconds)}
              </button>
            )}
          </div>
        </div>
      )}

      {result && (
        <div className="fade-in">
          <div className="card" style={{ padding: 28, textAlign: 'center', marginBottom: 20, background: 'linear-gradient(135deg, var(--brand-light), var(--surface))' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Score</div>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--brand)', letterSpacing: -2, marginBottom: 16 }}>
              {result.coachFeedback.overallScore}<span style={{ fontSize: '1.2rem', color: 'var(--muted)' }}>/100</span>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              <span className="tag">{result.metrics.wordsPerMinute} WPM</span>
              <span className="tag">{result.metrics.fillerWordCount} filler words</span>
              <span className="tag">Pitch variance {result.audioAnalysis.pitchStdDev}Hz</span>
              <span className="tag">Monotone score {result.audioAnalysis.monotoneScore}/100</span>
            </div>
          </div>

          <div className="card" style={{ padding: 24, marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 14 }}>Delivery timeline</h3>
            <SpeechTimeline
              audioAnalysis={result.audioAnalysis}
              fillerWords={result.metrics.fillerWords}
              durationSeconds={result.durationSeconds}
            />
          </div>

          <div className="card" style={{ padding: 24, marginBottom: 20 }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.7 }}>{result.coachFeedback.summary}</p>
          </div>

          <div className="grid-2" style={{ marginBottom: 20 }}>
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 14 }}>✓ Strengths</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {result.coachFeedback.strengths.map(s => (
                  <li key={s} style={{ fontSize: '0.875rem', display: 'flex', gap: 8 }}><span style={{ color: 'var(--success)' }}>●</span> {s}</li>
                ))}
              </ul>
            </div>
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 14 }}>→ Improve</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {result.coachFeedback.improvements.map(s => (
                  <li key={s} style={{ fontSize: '0.875rem', display: 'flex', gap: 8 }}><span style={{ color: 'var(--warning)' }}>●</span> {s}</li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button onClick={() => { setResult(null); setTopic(''); }} className="btn btn-outline">Practice again</button>
          </div>
        </div>
      )}
    </div>
  );
}
