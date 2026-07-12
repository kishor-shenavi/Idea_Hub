import { useState, useRef } from 'react';
import axios from '../api/axios';
import { analyzeAudioBlob } from '../utils/audioAnalysis';
import SpeechTimeline from '../components/SpeechTimeline';

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
      const audioAnalysis = await analyzeAudioBlob(blob); // Phase 2: client-side DSP, runs before upload

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

  return (
    <div className="page-container" style={{ maxWidth: 860 }}>
      <h1 style={{ fontWeight: 800, fontSize: '1.8rem' }}>Extempore Coach</h1>

      <div style={{ marginBottom: 16 }}>
        <select
          value={TOPICS.includes(topic) ? topic : ''}
          onChange={e => setTopic(e.target.value)}
          disabled={recording}
          style={{ marginBottom: 8, width: '100%' }}
        >
          <option value="">-- Pick a suggested topic --</option>
          {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--muted)', margin: '6px 0' }}>or</div>

        <input
          type="text"
          placeholder="Type your own topic"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          disabled={recording}
          style={{ width: '100%', padding: '8px 12px' }}
        />
      </div>

      {!recording ? (
        <button onClick={startRecording} disabled={loading}>
          {loading ? 'Analyzing...' : 'Start Speaking'}
        </button>
      ) : (
        <button onClick={stopRecording}>Stop ({seconds}s)</button>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {result && (
        <div style={{ marginTop: 24 }}>
          <h2>Score: {result.coachFeedback.overallScore}/100</h2>
          <p>
            WPM: {result.metrics.wordsPerMinute} | Filler words: {result.metrics.fillerWordCount} |
            Pitch variance: {result.audioAnalysis.pitchStdDev}Hz | Monotone score: {result.audioAnalysis.monotoneScore}/100
          </p>

          <SpeechTimeline
            audioAnalysis={result.audioAnalysis}
            fillerWords={result.metrics.fillerWords}
            durationSeconds={result.durationSeconds}
          />

          <p style={{ marginTop: 16 }}>{result.coachFeedback.summary}</p>
          <h3>Strengths</h3>
          <ul>{result.coachFeedback.strengths.map(s => <li key={s}>{s}</li>)}</ul>
          <h3>Improve</h3>
          <ul>{result.coachFeedback.improvements.map(s => <li key={s}>{s}</li>)}</ul>
        </div>
      )}
    </div>
  );
}