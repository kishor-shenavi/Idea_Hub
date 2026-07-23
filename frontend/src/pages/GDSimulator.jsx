import { useState, useRef, useEffect, useCallback } from 'react';
import axios from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { Link } from 'react-router-dom';

export default function GDSimulator() {
  const [topic, setTopic] = useState('');
  const [session, setSession] = useState(null);
  const [personas, setPersonas] = useState([]);
  const [transcript, setTranscript] = useState([]);
  const [eagerness, setEagerness] = useState([]);
  const [speakingId, setSpeakingId] = useState(null);
  const [recording, setRecording] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const mediaRecorder = useRef(null);
  const chunks = useRef([]);
  const advanceTimer = useRef(null);

  const startSession = async () => {
    if (!topic.trim()) { setError('Enter a topic'); return; }
    setError(''); setBusy(true);
    try {
      const res = await axios.post('/api/v1/gd/start', { topic });
      setSession(res.data.data.session);
      setPersonas(res.data.data.personas);
      setTranscript(res.data.data.session.transcript);
      speakTurn(res.data.data.session.transcript.at(-1), res.data.data.personas);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not start discussion');
    } finally { setBusy(false); }
  };

  const speakTurn = (turn, personaList) => {
    setSpeakingId(turn.speaker);
    const persona = personaList.find(p => p.id === turn.speaker);
    const utter = new SpeechSynthesisUtterance(turn.text);
    if (persona) { utter.pitch = persona.voice.pitch; utter.rate = persona.voice.rate; }
    utter.onend = () => onTurnFinished();
    window.speechSynthesis.speak(utter);
  };

  const onTurnFinished = () => {
    setSpeakingId(null);
    fetchEagerness();
    advanceTimer.current = setTimeout(() => advanceToNextPersona(), 3000);
  };

  const fetchEagerness = useCallback(async () => {
    if (!session) return;
    const res = await axios.get(`/api/v1/gd/${session._id}/eagerness`);
    setEagerness(res.data.data);
  }, [session]);

  const advanceToNextPersona = async () => {
    if (!session) return;
    const res = await axios.get(`/api/v1/gd/${session._id}/eagerness`);
    const top = res.data.data[0];
    const turnRes = await axios.post(`/api/v1/gd/${session._id}/persona-turn`, { personaId: top.personaId });
    const newTurn = { speaker: turnRes.data.data.personaId, text: turnRes.data.data.text };
    setTranscript(t => [...t, newTurn]);
    speakTurn(newTurn, personas);
  };

  const jumpIn = async () => {
    clearTimeout(advanceTimer.current);
    const wasInterruption = speakingId !== null && speakingId !== 'student';
    if (wasInterruption) window.speechSynthesis.cancel();

    setSpeakingId('student');
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);
    chunks.current = [];
    mediaRecorder.current.ondataavailable = e => chunks.current.push(e.data);
    mediaRecorder.current.onstop = () => submitStudentTurn(wasInterruption);
    mediaRecorder.current.start();
    setRecording(true);
  };

  const stopSpeaking = () => {
    mediaRecorder.current.stop();
    mediaRecorder.current.stream.getTracks().forEach(t => t.stop());
    setRecording(false);
  };

  const submitStudentTurn = async (wasInterruption) => {
    setBusy(true);
    const blob = new Blob(chunks.current, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('audio', blob, 'turn.webm');
    formData.append('wasInterruption', wasInterruption);

    try {
      const res = await axios.post(`/api/v1/gd/${session._id}/student-turn`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setTranscript(t => [...t, { speaker: 'student', text: res.data.data.text, wasInterruption }]);
      setSpeakingId(null);
      onTurnFinished();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not process your turn');
      setSpeakingId(null);
    } finally { setBusy(false); }
  };

  const endSession = async () => {
    clearTimeout(advanceTimer.current);
    window.speechSynthesis.cancel();
    setBusy(true);
    try {
      const res = await axios.post(`/api/v1/gd/${session._id}/end`);
      setReport(res.data.data.report);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not end discussion');
    } finally { setBusy(false); }
  };

  useEffect(() => () => { clearTimeout(advanceTimer.current); window.speechSynthesis.cancel(); }, []);

  if (report) {
    return (
      <div className="page-container" style={{ maxWidth: 820 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ fontWeight: 800, fontSize: '1.6rem', letterSpacing: -0.5 }}>GD Report</h1>
        </div>
        <div className="card" style={{ padding: 28, textAlign: 'center', marginBottom: 20, background: 'linear-gradient(135deg, var(--brand-light), var(--surface))' }}>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            <span className="tag">Speaking time {report.speakingTimePercent}%</span>
            <span className="tag">Interrupted others {report.timesInterrupted}x</span>
            <span className="tag">Initiated {report.initiatorVsReactor.initiated}</span>
            <span className="tag">Reacted {report.initiatorVsReactor.reacted}</span>
            <span className="tag" style={{ background: report.builtOnOthersPoints ? '#d1fae5' : '#fee2e2', color: report.builtOnOthersPoints ? '#065f46' : '#991b1b' }}>
              {report.builtOnOthersPoints ? '✓ Built on others\' points' : '✗ Did not build on points'}
            </span>
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
            <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 14 }}>→ Improve</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {report.improvements.map(s => <li key={s} style={{ fontSize: '0.875rem', display: 'flex', gap: 8 }}><span style={{ color: 'var(--warning)' }}>●</span> {s}</li>)}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="page-container" style={{ maxWidth: 620 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--brand)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 16 }}>👥</div>
          <h1 style={{ fontWeight: 800, fontSize: '1.6rem', letterSpacing: -0.5 }}>GD Simulator</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: 6 }}>Practice against 4 AI personas with distinct personalities.</p>
        </div>
        {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}
        <div className="card" style={{ padding: 28 }}>
          <label className="label">Discussion topic</label>
          <input className="input" placeholder="e.g. Should college students take a gap year?" value={topic} onChange={e => setTopic(e.target.value)} style={{ marginBottom: 20 }} />
          <button onClick={startSession} disabled={busy} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 12 }}>
            {busy ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : 'Start Discussion'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: 820 }}>
      <LoadingSpinner show={busy} />
      <h2 style={{ fontWeight: 800, fontSize: '1.3rem', letterSpacing: -0.5, marginBottom: 20 }}>{session.topic}</h2>
     <Link to="/gd-simulator/history" style={{ fontSize: '0.8rem', color: 'var(--brand)', marginTop: 8, display: 'inline-block' }}>View past discussions →</Link>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {personas.map(p => {
          const e = eagerness.find(x => x.personaId === p.id);
          const isSpeaking = speakingId === p.id;
          const wantsToSpeak = !isSpeaking && e && e.eagerness > 55;
          return (
            <div key={p.id} className="card" style={{
              padding: 12, textAlign: 'center', flex: '1 1 130px', minWidth: 130,
              background: isSpeaking ? 'var(--brand)' : wantsToSpeak ? '#fef3c7' : 'var(--surface)',
              border: wantsToSpeak ? '1.5px solid var(--warning)' : undefined,
              transition: 'all 0.2s',
            }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: isSpeaking ? '#fff' : 'var(--text)' }}>{p.name}</div>
              <div style={{ fontSize: '0.7rem', color: isSpeaking ? 'rgba(255,255,255,0.8)' : 'var(--muted)', marginTop: 2 }}>{p.style}</div>
              {isSpeaking && <div style={{ fontSize: '0.7rem', color: '#fff', marginTop: 6, fontWeight: 600 }}>● speaking</div>}
              {wantsToSpeak && <div style={{ fontSize: '0.7rem', color: '#92400e', marginTop: 6, fontWeight: 600 }}>✋ wants to speak</div>}
            </div>
          );
        })}
      </div>

      {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="card" style={{ maxHeight: 340, overflowY: 'auto', padding: 20, marginBottom: 20 }}>
        {transcript.map((t, i) => {
          const p = personas.find(x => x.id === t.speaker);
          const isStudent = t.speaker === 'student';
          return (
            <div key={i} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: i < transcript.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span className="tag" style={isStudent ? { background: 'var(--brand-light)', color: 'var(--brand)' } : {}}>
                  {isStudent ? 'You' : p?.name}
                </span>
                {t.wasInterruption && <span style={{ fontSize: '0.7rem', color: 'var(--danger)', fontWeight: 600 }}>interrupted</span>}
              </div>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>{t.text}</p>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        {!recording ? (
          <button onClick={jumpIn} className={speakingId && speakingId !== 'student' ? 'btn btn-danger' : 'btn btn-primary'} style={{ padding: '12px 28px' }}>
            {speakingId && speakingId !== 'student' ? '⚡ Interrupt & Jump In' : '🎙️ Jump In'}
          </button>
        ) : (
          <button onClick={stopSpeaking} className="btn btn-danger" style={{ padding: '12px 28px' }}>⏹ Stop Speaking</button>
        )}
        <button onClick={endSession} className="btn btn-outline" style={{ padding: '12px 28px' }}>End Discussion</button>
      </div>
    </div>
  );
}
