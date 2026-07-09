import { useState, useEffect, useRef } from 'react';
import axios from '../api/axios';
import { 
  FaMicrophone, 
  FaMicrophoneSlash, 
  FaVolumeUp, 
  FaVolumeMute, 
  FaPlay, 
  FaHistory, 
  FaArrowLeft, 
  FaSpinner, 
  FaCheck, 
  FaTimes, 
  FaChevronDown, 
  FaChevronUp, 
  FaKeyboard,
  FaFilePdf
} from 'react-icons/fa';

function ScoreCircle({ score }) {
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : score >= 40 ? '#f97316' : '#ef4444';
  const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Average' : 'Poor';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 110, height: 110, borderRadius: '50%', border: `6px solid ${color}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: `${color}10`, boxShadow: `0 4px 20px ${color}15` }}>
        <span style={{ fontSize: '2rem', fontWeight: 800, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 600 }}>/ 100</span>
      </div>
      <span style={{ fontSize: '0.85rem', fontWeight: 700, color }}>{label}</span>
    </div>
  );
}

export default function MockInterview() {
  // Navigation modes: 'setup' | 'active' | 'report' | 'history'
  const [viewMode, setViewMode] = useState('setup');
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Setup Form State
  const [targetRole, setTargetRole] = useState('');
  const [difficulty, setDifficulty] = useState('mid');
  const [interviewType, setInterviewType] = useState('technical');
  const [topics, setTopics] = useState('');
  const [questionsLimit, setQuestionsLimit] = useState(5);
  const [resumeSource, setResumeSource] = useState('none'); // none | paste | file
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState(null);

  // Voice State
  const [voiceOutput, setVoiceOutput] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [transcribing, setTranscribing] = useState(false);
  const [candidateText, setCandidateText] = useState('');
  const [fallbackToText, setFallbackToText] = useState(false);

  // Accordion state for Q&A report
  const [expandedQA, setExpandedQA] = useState({});

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const utteranceRef = useRef(null);

  // Audio Context & Silence Detection Refs
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const silenceStartRef = useRef(null);
  const rafIdRef = useRef(null);
  const autoSubmitRef = useRef(false);

  // Fetch past interview history
  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/v1/interview/history');
      setSessions(res.data.data);
      setViewMode('history');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch interview history');
    } finally {
      setLoading(false);
    }
  };

  // Start new interview session
  const startInterview = async () => {
    if (!targetRole.trim()) {
      setError('Please specify a target role first.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append('targetRole', targetRole);
      fd.append('difficulty', difficulty);
      fd.append('interviewType', interviewType);
      fd.append('topics', topics);
      fd.append('questionsLimit', questionsLimit);

      if (resumeSource === 'paste' && resumeText) {
        fd.append('resumeText', resumeText);
      } else if (resumeSource === 'file' && resumeFile) {
        fd.append('resume', resumeFile);
      }

      const res = await axios.post('/api/v1/interview/start', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const session = res.data.data;
      setActiveSession(session);
      setCandidateText('');
      setViewMode('active');
      
      // Speak first question
      const lastMsg = session.messages[session.messages.length - 1];
      if (lastMsg && lastMsg.role === 'interviewer') {
        speakText(lastMsg.content);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start interview session');
    } finally {
      setLoading(false);
    }
  };

  // Speak interviewer question (Text-to-Speech)
  const speakText = (text) => {
    if (!voiceOutput || !('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel(); // Stop any current speaking
    
    // Clean text of markdown characters
    const cleanText = text.replace(/[*_#`~]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utteranceRef.current = utterance;

    // Try to load a nice English voice
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en-US') && v.name.includes('Google')) ||
                         voices.find(v => v.lang.startsWith('en-US')) ||
                         voices.find(v => v.lang.startsWith('en'));
    if (englishVoice) utterance.voice = englishVoice;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  // Stop Text-to-Speech
  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // Start Voice Recording (with Web Audio API silence detection)
  const startRecording = async () => {
    setError('');
    audioChunksRef.current = [];
    setRecordingSeconds(0);
    autoSubmitRef.current = false;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Determine the best supported mimeType dynamically
      let options = {};
      if (typeof MediaRecorder.isTypeSupported === 'function') {
        if (MediaRecorder.isTypeSupported('audio/webm')) {
          options = { mimeType: 'audio/webm' };
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          options = { mimeType: 'audio/mp4' };
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          options = { mimeType: 'audio/ogg' };
        } else if (MediaRecorder.isTypeSupported('audio/wav')) {
          options = { mimeType: 'audio/wav' };
        }
      }

      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const mimeType = recorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        await handleAudioUpload(audioBlob);
        
        // Stop all audio tracks to release microphone
        stream.getTracks().forEach(t => t.stop());
      };

      // Set up Silence Detection
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        const audioContext = new AudioContextClass();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        
        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        silenceStartRef.current = null;
      }

      recorder.start();
      setIsRecording(true);

      // Start recording timer
      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);

      // Silence detection loop
      setTimeout(() => {
        detectSilence();
      }, 500);
    } catch (err) {
      setError('Could not access microphone. Please check permissions or type your answer.');
      setFallbackToText(true);
    }
  };

  // Silence Detection Loop (VAD)
  const detectSilence = () => {
    if (!analyserRef.current || !mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') {
      return;
    }
    
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      const val = (dataArray[i] - 128) / 128;
      sum += val * val;
    }
    const rms = Math.sqrt(sum / bufferLength);

    // RMS volume threshold for silence (RMS < 0.015 represents ambient silence)
    const isSilent = rms < 0.015;

    if (isSilent) {
      if (!silenceStartRef.current) {
        silenceStartRef.current = Date.now();
      } else {
        const silentDuration = Date.now() - silenceStartRef.current;
        // Auto-submit after 3.5 seconds of continuous silence
        if (silentDuration > 3500) {
          silenceStartRef.current = null;
          handleAutoSubmit();
          return;
        }
      }
    } else {
      silenceStartRef.current = null;
    }

    rafIdRef.current = requestAnimationFrame(detectSilence);
  };

  // Trigger auto submit when silence limit is reached
  const handleAutoSubmit = () => {
    autoSubmitRef.current = true;
    stopRecording();
  };

  // Stop Voice Recording & Clean up contexts
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
    
    // Cancel Animation Frame loop
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    
    // Close Web Audio Context
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  };

  // Send Recorded Audio to Backend for transcription (stateless STT)
  const handleAudioUpload = async (audioBlob) => {
    setTranscribing(true);
    setError('');
    const fd = new FormData();
    const extension = audioBlob.type.split('/')[1]?.split(';')[0] || 'webm';
    fd.append('audio', audioBlob, `response.${extension}`);

    try {
      const res = await axios.post('/api/v1/interview/transcribe', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const responseText = res.data.text || '';
      setCandidateText(responseText);

      // Auto-submit if silence-triggered
      if (autoSubmitRef.current) {
        autoSubmitRef.current = false;
        if (responseText.trim()) {
          await submitAnswerText(responseText);
        } else {
          setError("Silence detected, but we couldn't transcribe any speech. Please try speaking again or type your answer.");
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to transcribe audio. You can type your answer.');
      setFallbackToText(true);
      autoSubmitRef.current = false;
    } finally {
      setTranscribing(false);
    }
  };

  // Shared submit text answer core logic
  const submitAnswerText = async (textToSubmit) => {
    stopSpeaking();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post(`/api/v1/interview/${activeSession._id}/respond`, {
        answer: textToSubmit
      });

      const result = res.data;
      if (result.status === 'completed') {
        setActiveSession(result.data.session);
        setViewMode('report');
      } else {
        const nextSession = result.data.session;
        setActiveSession(nextSession);
        setCandidateText('');
        
        // Speak next question
        const lastMsg = nextSession.messages[nextSession.messages.length - 1];
        if (lastMsg && lastMsg.role === 'interviewer') {
          speakText(lastMsg.content);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit answer');
    } finally {
      setLoading(false);
    }
  };

  // Submit text answer
  const submitAnswer = () => {
    if (!candidateText.trim()) {
      setError('Please provide an answer first.');
      return;
    }
    submitAnswerText(candidateText);
  };

  // View specific session details (from history)
  const viewSessionDetails = async (sessionId) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/v1/interview/${sessionId}`);
      setActiveSession(res.data.data);
      setViewMode('report');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load interview details');
    } finally {
      setLoading(false);
    }
  };

  // Format seconds to MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const toggleAccordion = (index) => {
    setExpandedQA(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="page-container" style={{ maxWidth: 860 }}>
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {viewMode !== 'setup' && (
            <button 
              className="btn btn-ghost" 
              onClick={() => {
                stopSpeaking();
                setViewMode('setup');
                setError('');
              }}
              style={{ padding: 8, borderRadius: '50%', width: 36, height: 36, justifyContent: 'center' }}
            >
              <FaArrowLeft />
            </button>
          )}
          <div>
            <h1 style={{ fontWeight: 800, fontSize: '1.6rem', letterSpacing: -0.5, display: 'flex', alignItems: 'center', gap: 10 }}>
              🎙️ AI Mock Interview
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Practice your interviewing skills with our voice-enabled AI coach</p>
          </div>
        </div>

        {viewMode === 'setup' && (
          <button className="btn btn-ghost" onClick={fetchHistory}>
            <FaHistory /> History
          </button>
        )}
      </div>

      {error && <div className="error-msg" style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{error}</span>
        <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 700 }}>×</button>
      </div>}

      {/* SETUP VIEW */}
      {viewMode === 'setup' && (
        <div className="card fade-in" style={{ padding: 28 }}>
          <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 18 }}>Start Your Interview Session</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Target Role & Questions Limit */}
            <div className="grid-2">
              <div>
                <label className="label">Target Role *</label>
                <input 
                  className="input" 
                  value={targetRole} 
                  onChange={e => setTargetRole(e.target.value)} 
                  placeholder="e.g. SDE Intern, Frontend Engineer, Data Analyst"
                />
              </div>
              <div>
                <label className="label">Questions Limit</label>
                <select 
                  className="input" 
                  value={questionsLimit} 
                  onChange={e => setQuestionsLimit(e.target.value)}
                  style={{ background: 'var(--surface)' }}
                >
                  <option value={3}>3 Questions (Fast)</option>
                  <option value={5}>5 Questions (Standard)</option>
                  <option value={10}>10 Questions (Thorough)</option>
                </select>
              </div>
            </div>

            {/* Type & Difficulty */}
            <div className="grid-2">
              <div>
                <label className="label">Interview Type</label>
                <select 
                  className="input" 
                  value={interviewType} 
                  onChange={e => setInterviewType(e.target.value)}
                  style={{ background: 'var(--surface)' }}
                >
                  <option value="technical">Technical Interview</option>
                  <option value="behavioral">Behavioral (HR) Interview</option>
                  <option value="system_design">System Design Interview</option>
                </select>
              </div>
              <div>
                <label className="label">Difficulty</label>
                <select 
                  className="input" 
                  value={difficulty} 
                  onChange={e => setDifficulty(e.target.value)}
                  style={{ background: 'var(--surface)' }}
                >
                  <option value="junior">Junior Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                </select>
              </div>
            </div>

            {/* Focus Topics */}
            <div>
              <label className="label">Focus Topics (Optional)</label>
              <input 
                className="input" 
                value={topics} 
                onChange={e => setTopics(e.target.value)} 
                placeholder="e.g. React Hooks, Node event loop, JavaScript closures, SQL joints"
              />
            </div>

            {/* Resume Selection */}
            <div>
              <label className="label">Add Resume Context (Optional)</label>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                {[
                  { key: 'none', label: 'No Resume' },
                  { key: 'paste', label: '✍️ Paste Text' },
                  { key: 'file', label: '📎 Upload PDF' }
                ].map(opt => (
                  <button 
                    key={opt.key}
                    type="button"
                    onClick={() => setResumeSource(opt.key)}
                    className="btn"
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      background: resumeSource === opt.key ? 'var(--brand-light)' : 'transparent',
                      color: resumeSource === opt.key ? 'var(--brand)' : 'var(--muted)',
                      borderColor: resumeSource === opt.key ? 'var(--brand)' : 'var(--border)'
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {resumeSource === 'paste' && (
                <textarea 
                  className="input font-mono" 
                  rows={6} 
                  value={resumeText} 
                  onChange={e => setResumeText(e.target.value)} 
                  placeholder="Paste resume details (text) here…"
                  style={{ fontSize: '0.8rem' }}
                />
              )}

              {resumeSource === 'file' && (
                <div 
                  style={{ 
                    border: '2px dashed var(--border)', 
                    borderRadius: 10, 
                    padding: 24, 
                    textAlign: 'center', 
                    cursor: 'pointer',
                    background: resumeFile ? 'var(--bg)' : 'transparent'
                  }}
                  onClick={() => document.getElementById('interview-resume-file').click()}
                >
                  <input 
                    id="interview-resume-file" 
                    type="file" 
                    accept=".pdf" 
                    style={{ display: 'none' }} 
                    onChange={e => setResumeFile(e.target.files[0])} 
                  />
                  {resumeFile ? (
                    <div>
                      <FaFilePdf size={24} style={{ color: 'var(--brand)', marginBottom: 8 }} />
                      <p style={{ fontWeight: 600, color: 'var(--brand)' }}>✅ {resumeFile.name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{(resumeFile.size / 1024).toFixed(0)} KB</p>
                    </div>
                  ) : (
                    <div>
                      <FaFilePdf size={24} style={{ color: 'var(--muted)', marginBottom: 8 }} />
                      <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Click or drop a PDF here to parse and inject</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 4 }}>Max size 5MB</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Voice Settings */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'var(--surface2)', borderRadius: 10 }}>
              <div>
                <span style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block' }}>Voice Output (Text-to-Speech)</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>The AI interviewer will read the questions out loud</span>
              </div>
              <button 
                type="button" 
                onClick={() => setVoiceOutput(!voiceOutput)}
                className={`btn ${voiceOutput ? 'btn-primary' : 'btn-ghost'}`}
                style={{ padding: '8px 16px' }}
              >
                {voiceOutput ? <><FaVolumeUp /> Enabled</> : <><FaVolumeMute /> Disabled</>}
              </button>
            </div>

            {/* Submit Button */}
            <button 
              className="btn btn-primary" 
              onClick={startInterview} 
              disabled={loading}
              style={{ padding: '14px 20px', justifyContent: 'center', marginTop: 8 }}
            >
              {loading ? <><FaSpinner className="spinner" /> Preparing Session…</> : '🚀 Start Interview Now'}
            </button>
          </div>
        </div>
      )}

      {/* ACTIVE INTERVIEW VIEW */}
      {viewMode === 'active' && activeSession && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="fade-in">
          
          {/* Question Index Progress */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px' }}>
            <span className="tag" style={{ fontSize: '0.8rem', padding: '4px 12px' }}>
              Round {activeSession.messages.filter(m => m.role === 'interviewer').length} of {activeSession.questionsLimit}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--muted)', textTransform: 'capitalize' }}>
              {activeSession.difficulty} • {activeSession.interviewType.replace('_', ' ')}
            </span>
          </div>

          {/* Interviewer Card */}
          <div className="card" style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
            
            {/* Visual sound waves if AI is speaking */}
            {isSpeaking && (
              <div style={{ position: 'absolute', top: 12, right: 24, display: 'flex', gap: 3, alignItems: 'center', height: 20 }}>
                {[1,2,3,4,5].map(i => (
                  <div key={i} style={{ 
                    width: 3, 
                    height: 14, 
                    background: 'var(--brand)', 
                    borderRadius: 99, 
                    animation: `spin 1s ease-in-out infinite alternate`,
                    animationDelay: `${i * 0.15}s`
                  }} />
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ 
                width: 46, 
                height: 46, 
                borderRadius: '50%', 
                background: 'var(--brand)', 
                color: '#fff', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1rem',
                boxShadow: isSpeaking ? '0 0 15px rgba(91,76,245,0.4)' : 'none',
                transform: isSpeaking ? 'scale(1.05)' : 'none',
                transition: 'all 0.2s',
                flexShrink: 0
              }}>
                AI
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>AI Interviewer</span>
                  {voiceOutput && (
                    <button 
                      className="btn btn-ghost" 
                      onClick={() => speakText(activeSession.messages[activeSession.messages.length - 1].content)}
                      style={{ padding: '4px 8px', fontSize: '0.75rem', height: 26 }}
                      title="Replay Audio"
                    >
                      <FaVolumeUp /> Replay
                    </button>
                  )}
                </div>
                <p style={{ 
                  fontSize: '0.95rem', 
                  lineHeight: 1.6, 
                  color: 'var(--text)', 
                  fontWeight: 500,
                  whiteSpace: 'pre-line'
                }}>
                  {activeSession.messages[activeSession.messages.length - 1].content}
                </p>
              </div>
            </div>
          </div>

          {/* Candidate Response Card */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              👤 Your Response
            </h3>

            {/* Visual audio wave bouncing bars when recording */}
            {isRecording && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, margin: '20px 0' }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', height: 40 }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => (
                    <div 
                      key={i} 
                      style={{ 
                        width: 4, 
                        height: Math.random() * 25 + 10, 
                        background: 'var(--success)', 
                        borderRadius: 99, 
                        animation: 'bounce 0.8s ease-in-out infinite alternate',
                        animationDelay: `${i * 0.05}s`
                      }} 
                    />
                  ))}
                </div>
                <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: '1rem', fontFamily: 'var(--mono)' }}>
                  Recording… {formatTime(recordingSeconds)}
                </span>
                <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Speak clearly. When finished, press "Stop Recording"</p>
              </div>
            )}

            {/* Transcribing Indicator */}
            {transcribing && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, margin: '30px 0' }}>
                <FaSpinner className="spinner" style={{ width: 28, height: 28 }} />
                <span style={{ color: 'var(--brand)', fontWeight: 600, fontSize: '0.85rem' }}>Transcribing your speech in real-time...</span>
              </div>
            )}

            {/* Record Controls & Input Fallback */}
            {!isRecording && !transcribing && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                {/* Voice toggle vs text typing */}
                {!fallbackToText ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '20px 0', border: '1.5px dashed var(--border)', borderRadius: 12 }}>
                    <button 
                      onClick={startRecording}
                      style={{ 
                        width: 70, 
                        height: 70, 
                        borderRadius: '50%', 
                        background: 'var(--brand)', 
                        color: '#fff', 
                        border: 'none', 
                        cursor: 'pointer',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '1.6rem',
                        boxShadow: '0 4px 15px rgba(91,76,245,0.3)',
                        transition: 'transform 0.15s'
                      }}
                      onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }}
                      onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                    >
                      <FaMicrophone />
                    </button>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', display: 'block' }}>Click to Speak</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Speak your answer clearly into your microphone</span>
                    </div>
                    <button 
                      className="btn btn-ghost" 
                      onClick={() => setFallbackToText(true)}
                      style={{ fontSize: '0.75rem', padding: '6px 12px', marginTop: 4 }}
                    >
                      <FaKeyboard /> Or type instead
                    </button>
                  </div>
                ) : (
                  <div>
                    <label className="label">Type your response</label>
                    <textarea 
                      className="input" 
                      rows={5} 
                      value={candidateText}
                      onChange={e => setCandidateText(e.target.value)}
                      placeholder="Type your detailed interview answer here…"
                    />
                    <button 
                      className="btn btn-ghost" 
                      onClick={() => setFallbackToText(false)}
                      style={{ fontSize: '0.75rem', padding: '6px 12px', marginTop: 6 }}
                    >
                      🎙️ Switch back to microphone
                    </button>
                  </div>
                )}

                {/* Edit Area if Audio was transcribed */}
                {candidateText && !fallbackToText && (
                  <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)' }}>TRANSCRIBED ANSWER (Feel free to edit before submitting)</span>
                      <button className="btn btn-ghost" style={{ padding: '2px 8px', fontSize: '0.7rem' }} onClick={() => setCandidateText('')}>Clear</button>
                    </div>
                    <textarea 
                      className="input" 
                      rows={4} 
                      value={candidateText} 
                      onChange={e => setCandidateText(e.target.value)} 
                    />
                  </div>
                )}

                {/* Submission Control Bar */}
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 10 }}>
                  <button 
                    className="btn btn-ghost"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to end the interview early? You will receive evaluation up to this point.')) {
                        setLoading(true);
                        axios.post(`/api/v1/interview/${activeSession._id}/respond`, { answer: 'I would like to complete the interview.' })
                          .then(res => {
                            setActiveSession(res.data.data.session);
                            setViewMode('report');
                          })
                          .catch(() => setError('Failed to complete interview.'))
                          .finally(() => setLoading(false));
                      }
                    }}
                    disabled={loading}
                  >
                    End Early
                  </button>
                  
                  <button 
                    className="btn btn-primary"
                    onClick={submitAnswer}
                    disabled={loading || !candidateText.trim()}
                    style={{ padding: '10px 24px' }}
                  >
                    {loading ? <FaSpinner className="spinner" /> : 'Submit Answer'}
                  </button>
                </div>
              </div>
            )}

            {/* Stop Recording control if Active */}
            {isRecording && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 14 }}>
                <button 
                  className="btn btn-danger" 
                  onClick={stopRecording} 
                  style={{ borderRadius: 99, padding: '12px 24px' }}
                >
                  <FaMicrophoneSlash /> Stop Recording & Transcribe
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PERFORMANCE REPORT VIEW */}
      {viewMode === 'report' && activeSession && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="fade-in">
          
          {/* Summary Card */}
          <div className="card" style={{ padding: 28, display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
            <ScoreCircle score={activeSession.report?.overallScore || 0} />
            <div style={{ flex: 1 }}>
              <h2 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 8 }}>
                Interview Summary ({activeSession.targetRole})
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                {activeSession.report?.summary || 'Feedback generation completed.'}
              </p>
              <div style={{ display: 'flex', gap: 14, marginTop: 14, fontSize: '0.75rem', color: 'var(--muted)' }}>
                <span>Difficulty: <strong style={{ color: 'var(--text)' }}>{activeSession.difficulty}</strong></span>
                <span>Type: <strong style={{ color: 'var(--text)' }}>{activeSession.interviewType.replace('_', ' ')}</strong></span>
                <span>Date: <strong style={{ color: 'var(--text)' }}>{new Date(activeSession.createdAt).toLocaleDateString()}</strong></span>
              </div>
            </div>
          </div>

          <div className="grid-2">
            {/* Strengths */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--success)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FaCheck /> Key Strengths
              </h3>
              <ul style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {activeSession.report?.strengths?.map((s, i) => (
                  <li key={i} style={{ fontSize: '0.85rem', display: 'flex', gap: 8 }}>
                    <span style={{ color: 'var(--success)' }}>→</span>{s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--danger)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FaTimes /> Areas for Improvement
              </h3>
              <ul style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {activeSession.report?.weaknesses?.map((w, i) => (
                  <li key={i} style={{ fontSize: '0.85rem', display: 'flex', gap: 8 }}>
                    <span style={{ color: 'var(--danger)' }}>→</span>{w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Question Breakdown Accordion */}
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 14 }}>Detailed Question Breakdown</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {activeSession.report?.qaFeedback?.map((item, index) => {
                const isExpanded = !!expandedQA[index];
                const itemColor = item.score >= 80 ? 'var(--success)' : item.score >= 60 ? 'var(--warning)' : 'var(--danger)';

                return (
                  <div key={index} className="card" style={{ overflow: 'hidden' }}>
                    {/* Header */}
                    <div 
                      onClick={() => toggleAccordion(index)}
                      style={{ 
                        padding: '16px 20px', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        cursor: 'pointer',
                        background: 'var(--surface2)',
                        borderBottom: isExpanded ? '1.5px solid var(--border)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, marginRight: 16 }}>
                        <span style={{ 
                          width: 32, 
                          height: 32, 
                          borderRadius: '50%', 
                          background: itemColor + '15', 
                          color: itemColor, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          flexShrink: 0
                        }}>
                          {item.score}
                        </span>
                        <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)', margin: 0 }}>
                          {item.question.slice(0, 75)}{item.question.length > 75 ? '…' : ''}
                        </p>
                      </div>
                      <div>
                        {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                      </div>
                    </div>

                    {/* Content */}
                    {isExpanded && (
                      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }} className="fade-in">
                        {/* Question Score */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)' }}>QUESTION SCORE:</span>
                          <span className="tag" style={{ 
                            background: item.score >= 80 ? '#d1fae5' : item.score >= 60 ? '#fef3c7' : '#fee2e2',
                            color: item.score >= 80 ? '#065f46' : item.score >= 60 ? '#92400e' : '#991b1b',
                            fontSize: '0.8rem',
                            fontWeight: 700
                          }}>
                            {item.score} / 100
                          </span>
                        </div>
                        {/* Full Question */}
                        <div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>QUESTION</span>
                          <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{item.question}</p>
                        </div>
                        {/* Candidate Answer */}
                        <div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>YOUR ANSWER</span>
                          <p style={{ fontSize: '0.875rem', color: 'var(--text)', background: 'var(--bg)', padding: '10px 14px', borderRadius: 8, fontStyle: 'italic', border: '1px solid var(--border)' }}>
                            {item.answer || '(No answer provided)'}
                          </p>
                        </div>
                        {/* Critique */}
                        <div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>AI FEEDBACK & IMPROVEMENTS</span>
                          <p style={{ fontSize: '0.875rem', lineHeight: 1.6, background: '#f9fafb', padding: '12px 14px', borderRadius: 8, borderLeft: `4px solid ${itemColor}` }}>{item.critique}</p>
                        </div>
                        {/* Model Answer */}
                        {item.modelAnswer && (
                          <div style={{ padding: '12px 16px', background: 'var(--brand-light)', borderRadius: 8, border: '1px solid var(--border)' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand)', display: 'block', marginBottom: 4 }}>MODEL ANSWER GUIDELINES</span>
                            <p style={{ fontSize: '0.85rem', color: 'var(--brand)', lineHeight: 1.5, whiteSpace: 'pre-line' }}>{item.modelAnswer}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 14 }}>
            <button className="btn btn-outline" onClick={() => setViewMode('setup')}>
              Take Another Interview
            </button>
          </div>
        </div>
      )}

      {/* HISTORY VIEW */}
      {viewMode === 'history' && (
        <div className="card fade-in" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem' }}>Past Interview Reports</h2>
            <button className="btn btn-ghost" onClick={() => setViewMode('setup')} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
              Back to Start
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <FaSpinner className="spinner" style={{ width: 28, height: 28 }} />
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: 8 }}>Loading history...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)' }}>
              No mock interviews completed yet. Start your first session!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {sessions.map(s => (
                <div 
                  key={s._id} 
                  className="card" 
                  onClick={() => viewSessionDetails(s._id)}
                  style={{ 
                    padding: '14px 20px', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--brand)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  <div>
                    <h4 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>{s.targetRole}</h4>
                    <div style={{ display: 'flex', gap: 10, fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'capitalize' }}>
                      <span>{s.difficulty}</span>
                      <span>•</span>
                      <span>{s.interviewType.replace('_', ' ')}</span>
                      <span>•</span>
                      <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {s.status === 'completed' ? (
                      <span style={{ 
                        padding: '4px 10px', 
                        background: '#d1fae5', 
                        color: '#065f46', 
                        borderRadius: 99, 
                        fontWeight: 700, 
                        fontSize: '0.8rem' 
                      }}>
                        Score: {s.report?.overallScore || 0}%
                      </span>
                    ) : (
                      <span style={{ 
                        padding: '4px 10px', 
                        background: '#fef3c7', 
                        color: '#92400e', 
                        borderRadius: 99, 
                        fontWeight: 600, 
                        fontSize: '0.75rem' 
                      }}>
                        In Progress
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Visual audio wave bounce animation */}
      <style>{`
        @keyframes bounce {
          0% { transform: scaleY(1); }
          100% { transform: scaleY(3); }
        }
      `}</style>
    </div>
  );
}
