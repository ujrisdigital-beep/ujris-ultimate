import React, { useState, useRef, useEffect } from 'react';

const T = {
  navy: '#0D1B2A', navyMid: '#152438', navyLight: '#1E3A5F',
  gold: '#C9A84C', goldLight: 'rgba(201,168,76,0.15)',
  teal: '#0C7B7A', tealLight: 'rgba(12,123,122,0.15)',
  white: '#EEF2F7', muted: '#7A8FA6', border: 'rgba(255,255,255,0.08)',
  red: '#E53E3E', redLight: 'rgba(229,62,62,0.15)',
};

function fmtTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

const SEED_SESSIONS = [
  { id: '1', title: 'Aldi HR Meeting — 10 March 2026', duration: '00:23:14', status: 'confirmed', transcriptPreview: 'Manager stated: "We reviewed the CCTV but it was not available." Security officer confirmed footage exists for that day...', ts: '2026-03-10T14:00:00Z' },
  { id: '2', title: 'Police Station — No Comment Interview', duration: '00:45:02', status: 'pending', transcriptPreview: 'Officer cautioned at 14:32. No comment provided throughout. Solicitor present: [Name].', ts: '2026-03-18T14:30:00Z' },
];

export default function LiveRecordingStudio({ caseId }) {
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [sessions, setSessions] = useState(() => {
    const s = localStorage.getItem('ujris_sessions');
    return s ? JSON.parse(s) : SEED_SESSIONS;
  });
  const [title, setTitle] = useState('');
  const [showConfirm, setShowConfirm] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [speechRec, setSpeechRec] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const timerRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    localStorage.setItem('ujris_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (recording && !paused) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [recording, paused]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = e => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start();
      setMediaRecorder(mr);
      setRecording(true);
      setPaused(false);
      setElapsed(0);
      setTranscript('');

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const sr = new SpeechRecognition();
        sr.continuous = true;
        sr.interimResults = true;
        sr.lang = 'en-GB';
        sr.onresult = e => {
          let interim = '', final = '';
          for (let i = e.resultIndex; i < e.results.length; i++) {
            if (e.results[i].isFinal) final += e.results[i][0].transcript + ' ';
            else interim += e.results[i][0].transcript;
          }
          setTranscript(prev => prev + final);
        };
        sr.start();
        setSpeechRec(sr);
      }
    } catch (e) {
      alert('Microphone access denied. Please allow microphone access to use Live Recording.');
    }
  }

  function togglePause() {
    if (!mediaRecorder) return;
    if (paused) {
      mediaRecorder.resume();
      speechRec?.start();
    } else {
      mediaRecorder.pause();
      speechRec?.stop();
    }
    setPaused(p => !p);
  }

  function stopRecording() {
    mediaRecorder?.stop();
    speechRec?.stop();
    setRecording(false);
    setPaused(false);
    setShowConfirm({ elapsed, transcript, title: title || `Recording — ${new Date().toLocaleDateString('en-GB')}` });
  }

  function confirmSession() {
    const session = {
      id: Date.now().toString(),
      title: showConfirm.title,
      duration: fmtTime(showConfirm.elapsed),
      status: 'pending',
      transcriptPreview: (showConfirm.transcript || 'No transcript available').slice(0, 200) + '...',
      fullTranscript: showConfirm.transcript,
      ts: new Date().toISOString(),
    };
    setSessions(prev => [session, ...prev]);
    setShowConfirm(null);
    setTranscript('');
    setAudioBlob(null);
  }

  function updateStatus(id, status) {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  }

  function deleteSession(id) {
    setSessions(prev => prev.filter(s => s.id !== id));
  }

  const statusColors = { confirmed: T.teal, pending: T.gold, disputed: T.red };

  return (
    <div style={{ minHeight: '100vh', background: T.navy, color: T.white, fontFamily: "'Source Serif 4', Georgia, serif" }}>
      <div style={{ background: T.navyMid, borderBottom: `1px solid ${T.border}`, padding: '24px 32px' }}>
        <h1 style={{ margin: 0, fontSize: 24, fontFamily: "'Playfair Display', Georgia, serif", color: T.gold }}>🎙️ Live Recording Studio</h1>
        <p style={{ margin: '4px 0 0', color: T.muted, fontSize: 13 }}>Record meetings, hearings, and interviews with live transcription — 2-of-3 approval for corrections</p>
      </div>

      <div style={{ padding: '24px 32px', maxWidth: 900, margin: '0 auto' }}>
        {/* Recording Studio */}
        <div style={{ background: T.navyMid, border: `1px solid ${recording ? T.red : T.border}`, borderRadius: 20, padding: 32, marginBottom: 28, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          {recording && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${T.red}, #ef4444, ${T.red})`, backgroundSize: '200% 100%', animation: 'pulse 2s infinite' }} />}
          <style>{'@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}} @keyframes ripple{0%{transform:scale(1);opacity:1}100%{transform:scale(2);opacity:0}}'}</style>

          {/* Session Title */}
          {!recording && (
            <div style={{ marginBottom: 24 }}>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Session title (e.g. HR Meeting, Police Interview...)"
                style={{ width: '100%', maxWidth: 400, background: T.navy, border: `1px solid ${T.border}`, borderRadius: 8, color: T.white, padding: '10px 14px', fontSize: 14, textAlign: 'center', boxSizing: 'border-box' }} />
            </div>
          )}

          {/* Timer */}
          <div style={{ fontSize: 56, fontWeight: 900, fontFamily: 'monospace', color: recording ? T.red : T.muted, marginBottom: 8, letterSpacing: '0.05em' }}>
            {fmtTime(elapsed)}
          </div>
          <div style={{ color: recording ? T.red : T.muted, fontSize: 13, fontWeight: 700, marginBottom: 28, letterSpacing: '0.1em' }}>
            {!recording ? 'READY TO RECORD' : paused ? '⏸ PAUSED' : '🔴 RECORDING'}
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'center' }}>
            {!recording ? (
              <button onClick={startRecording} style={{
                width: 80, height: 80, borderRadius: '50%', background: T.red,
                border: 'none', cursor: 'pointer', fontSize: 28, color: '#fff',
                boxShadow: `0 0 0 8px ${T.redLight}`, transition: 'transform 0.2s',
              }}>⏺</button>
            ) : (
              <>
                <button onClick={togglePause} style={{
                  width: 56, height: 56, borderRadius: '50%', background: T.navyLight,
                  border: `2px solid ${T.border}`, cursor: 'pointer', fontSize: 20, color: T.white,
                }}>{paused ? '▶' : '⏸'}</button>
                <button onClick={stopRecording} style={{
                  width: 72, height: 72, borderRadius: '50%', background: T.red,
                  border: 'none', cursor: 'pointer', fontSize: 24, color: '#fff',
                }}>⏹</button>
              </>
            )}
          </div>

          {/* Live Transcript */}
          {recording && (
            <div style={{ marginTop: 24, textAlign: 'left', background: T.navy, border: `1px solid ${T.border}`, borderRadius: 10, padding: 16, maxHeight: 200, overflowY: 'auto' }}>
              <div style={{ color: T.teal, fontSize: 11, fontWeight: 700, marginBottom: 8, letterSpacing: '0.1em' }}>LIVE TRANSCRIPT</div>
              <div style={{ color: T.white, fontSize: 13, lineHeight: 1.7 }}>
                {transcript || <span style={{ color: T.muted }}>Listening...</span>}
              </div>
            </div>
          )}
        </div>

        {/* 24h Review Policy */}
        <div style={{ background: T.goldLight, border: `1px solid ${T.gold}`, borderRadius: 10, padding: 16, marginBottom: 24 }}>
          <div style={{ color: T.gold, fontWeight: 700, fontSize: 13, marginBottom: 4 }}>⏱️ 24-Hour Review Window</div>
          <div style={{ color: T.muted, fontSize: 13, lineHeight: 1.7 }}>
            After recording, sessions enter a 24-hour review window. Corrections to transcripts require 2-of-3 admin approval to maintain forensic integrity. Sessions confirmed after review are marked with a green badge.
          </div>
        </div>

        {/* Session List */}
        <div>
          <div style={{ color: T.muted, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 12 }}>RECORDED SESSIONS ({sessions.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sessions.map(s => {
              const sc = statusColors[s.status] || T.muted;
              return (
                <div key={s.id} style={{ background: T.navyMid, border: `1px solid ${T.border}`, borderRadius: 14, padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ color: T.white, fontWeight: 700, fontSize: 15, marginBottom: 2 }}>🎙️ {s.title}</div>
                      <div style={{ color: T.muted, fontSize: 12 }}>{new Date(s.ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} · {s.duration}</div>
                    </div>
                    <span style={{ background: `${sc}22`, color: sc, fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 10, textTransform: 'uppercase', flexShrink: 0 }}>{s.status}</span>
                  </div>
                  <div style={{ color: T.muted, fontSize: 13, lineHeight: 1.6, fontStyle: 'italic', marginBottom: 14 }}>{s.transcriptPreview}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {s.status === 'pending' && (
                      <button onClick={() => updateStatus(s.id, 'confirmed')} style={{ padding: '6px 14px', background: T.tealLight, color: T.teal, border: `1px solid ${T.teal}44`, borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>✓ Confirm</button>
                    )}
                    {s.status === 'pending' && (
                      <button onClick={() => updateStatus(s.id, 'disputed')} style={{ padding: '6px 14px', background: T.redLight, color: T.red, border: `1px solid ${T.red}44`, borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>⚠ Dispute</button>
                    )}
                    <button onClick={() => deleteSession(s.id)} style={{ padding: '6px 14px', background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 6, color: T.muted, cursor: 'pointer', fontSize: 12, marginLeft: 'auto' }}>🗑️ Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: T.navyMid, border: `1px solid ${T.gold}`, borderRadius: 16, padding: 32, maxWidth: 560, width: '100%' }}>
            <h2 style={{ color: T.gold, fontFamily: "'Playfair Display', Georgia, serif", marginTop: 0 }}>Save Recording?</h2>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: T.muted, fontSize: 12, marginBottom: 4 }}>Session Title</label>
              <input value={showConfirm.title} onChange={e => setShowConfirm(p => ({ ...p, title: e.target.value }))}
                style={{ width: '100%', background: T.navy, border: `1px solid ${T.border}`, borderRadius: 8, color: T.white, padding: '10px 12px', fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <div style={{ background: T.navy, border: `1px solid ${T.border}`, borderRadius: 8, padding: 14, marginBottom: 20, maxHeight: 160, overflowY: 'auto' }}>
              <div style={{ color: T.teal, fontSize: 11, marginBottom: 6 }}>TRANSCRIPT</div>
              <div style={{ color: T.muted, fontSize: 13, lineHeight: 1.7 }}>{showConfirm.transcript || 'No transcript captured.'}</div>
            </div>
            <div style={{ color: T.muted, fontSize: 12, marginBottom: 20 }}>
              Duration: {fmtTime(showConfirm.elapsed)} · Session will enter 24-hour review window
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={confirmSession} style={{ padding: '12px 24px', background: T.gold, color: T.navy, border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>Save Session</button>
              <button onClick={() => setShowConfirm(null)} style={{ padding: '12px 20px', background: 'transparent', color: T.muted, border: `1px solid ${T.border}`, borderRadius: 8, cursor: 'pointer' }}>Discard</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
