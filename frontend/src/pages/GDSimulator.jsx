import { useState, useRef, useEffect, useCallback } from 'react';
import axios from '../api/axios';

export default function GDSimulator() {
  const [topic, setTopic] = useState('');
  const [session, setSession] = useState(null);
  const [personas, setPersonas] = useState([]);
  const [transcript, setTranscript] = useState([]);
  const [eagerness, setEagerness] = useState([]);
  const [speakingId, setSpeakingId] = useState(null); // personaId currently "talking" via TTS, or 'student'
  const [recording, setRecording] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const mediaRecorder = useRef(null);
  const chunks = useRef([]);
  const advanceTimer = useRef(null);

  const startSession = async () => {
    if (!topic.trim()) { setError('Enter a topic'); return; }
    setError('');
    const res = await axios.post('/api/v1/gd/start', { topic });
    setSession(res.data.data.session);
    setPersonas(res.data.data.personas);
    setTranscript(res.data.data.session.transcript);
    speakTurn(res.data.data.session.transcript.at(-1), res.data.data.personas);
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
    // auto-pace: after a short window, advance to the top-eagerness persona unless student jumped in
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

  // student clicks "Jump In" — works whether a persona is currently speaking (interruption) or in the gap window
  const jumpIn = async () => {
    clearTimeout(advanceTimer.current);
    const wasInterruption = speakingId !== null && speakingId !== 'student';
    if (wasInterruption) window.speechSynthesis.cancel(); // stop persona mid-sentence

    setSpeakingId('student');
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);
    chunks.current = [];
    mediaRecorder.current.ondataavailable = e => chunks.current.push(e.data);
    mediaRecorder.current.onstop = () => submitStudentTurn(wasInterruption);
    mediaRecorder.current.start();
    setRecording(true);
    mediaRecorder.current._wasInterruption = wasInterruption;
  };

  const stopSpeaking = () => {
    mediaRecorder.current.stop();
    mediaRecorder.current.stream.getTracks().forEach(t => t.stop());
    setRecording(false);
  };

  const submitStudentTurn = async (wasInterruption) => {
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
    }
  };

  const endSession = async () => {
    clearTimeout(advanceTimer.current);
    window.speechSynthesis.cancel();
    const res = await axios.post(`/api/v1/gd/${session._id}/end`);
    setReport(res.data.data.report);
  };

  useEffect(() => () => { clearTimeout(advanceTimer.current); window.speechSynthesis.cancel(); }, []);

  if (report) {
    return (
      <div className="page-container" style={{ maxWidth: 860 }}>
        <h1>GD Report</h1>
        <p>Speaking time: {report.speakingTimePercent}% | Interrupted others: {report.timesInterrupted} times</p>
        <p>Initiated: {report.initiatorVsReactor.initiated} | Reacted: {report.initiatorVsReactor.reacted}</p>
        <p>Built on others' points: {report.builtOnOthersPoints ? 'Yes' : 'No'}</p>
        <p>{report.summary}</p>
        <h3>Strengths</h3>
        <ul>{report.strengths.map(s => <li key={s}>{s}</li>)}</ul>
        <h3>Improve</h3>
        <ul>{report.improvements.map(s => <li key={s}>{s}</li>)}</ul>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="page-container" style={{ maxWidth: 860 }}>
        <h1>GD Simulator</h1>
        <input placeholder="Enter a GD topic" value={topic} onChange={e => setTopic(e.target.value)} style={{ width: '100%', padding: 8 }} />
        <button onClick={startSession}>Start Discussion</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: 860 }}>
      <h2>{session.topic}</h2>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        {personas.map(p => {
          const e = eagerness.find(x => x.personaId === p.id);
          const isSpeaking = speakingId === p.id;
          const wantsToSpeak = !isSpeaking && e && e.eagerness > 55;
          return (
            <div key={p.id} style={{
              padding: 8, borderRadius: 8, textAlign: 'center', flex: 1,
              background: isSpeaking ? '#4f46e5' : wantsToSpeak ? '#fef3c7' : '#f3f4f6',
              color: isSpeaking ? '#fff' : '#333',
              boxShadow: wantsToSpeak ? '0 0 0 2px #f59e0b' : 'none',
            }}>
              <div style={{ fontWeight: 700 }}>{p.name}</div>
              <div style={{ fontSize: '0.7rem' }}>{p.style}</div>
              {isSpeaking && <div style={{ fontSize: '0.7rem' }}>speaking...</div>}
              {wantsToSpeak && <div style={{ fontSize: '0.7rem' }}>wants to speak</div>}
            </div>
          );
        })}
      </div>

      <div style={{ maxHeight: 320, overflowY: 'auto', border: '1px solid #eee', padding: 12, borderRadius: 8, marginBottom: 16 }}>
        {transcript.map((t, i) => {
          const p = personas.find(x => x.id === t.speaker);
          return (
            <p key={i}><strong>{t.speaker === 'student' ? 'You' : p?.name}{t.wasInterruption ? ' (interrupted)' : ''}:</strong> {t.text}</p>
          );
        })}
      </div>

      {!recording ? (
        <button onClick={jumpIn} style={{ background: speakingId && speakingId !== 'student' ? '#dc2626' : undefined }}>
          {speakingId && speakingId !== 'student' ? 'Interrupt & Jump In' : 'Jump In'}
        </button>
      ) : (
        <button onClick={stopSpeaking}>Stop Speaking</button>
      )}
      <button onClick={endSession} style={{ marginLeft: 10 }}>End Discussion</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}