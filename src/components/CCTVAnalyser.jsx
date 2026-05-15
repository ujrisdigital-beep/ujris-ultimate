import React, { useState } from 'react';

const T = {
  navy: '#0D1B2A', navyMid: '#152438', navyLight: '#1E3A5F',
  gold: '#C9A84C', goldLight: 'rgba(201,168,76,0.15)',
  teal: '#0C7B7A', tealLight: 'rgba(12,123,122,0.15)',
  white: '#EEF2F7', muted: '#7A8FA6', border: 'rgba(255,255,255,0.08)',
  red: '#E53E3E', redLight: 'rgba(229,62,62,0.15)',
};

export default function CCTVAnalyser({ caseId, activeCase }) {
  const [file, setFile] = useState(null);
  const [analysing, setAnalysing] = useState(false);
  const [result, setResult] = useState(null);
  const [notes, setNotes] = useState('');

  const card = { background: T.navyMid, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24 };
  const label = { color: T.muted, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 8, display: 'block', fontFamily: 'sans-serif' };
  const btn = (active) => ({
    background: active ? T.gold : 'transparent',
    border: `1px solid ${active ? T.gold : T.border}`,
    color: active ? T.navy : T.muted,
    padding: '10px 20px', borderRadius: 8, cursor: 'pointer',
    fontWeight: 700, fontSize: 13, fontFamily: "'Source Serif 4', Georgia, serif",
    transition: 'all 0.15s',
  });

  const handleAnalyse = () => {
    if (!file) return;
    setAnalysing(true);
    setTimeout(() => {
      setResult({
        filename: file.name,
        duration: 'Unknown (upload to server for full analysis)',
        timestamps: [],
        summary: 'CCTV analysis requires server-side processing. Upload the footage and case reference to the secure evidence portal for AI-enhanced frame analysis, metadata extraction, and timestamp verification.',
      });
      setAnalysing(false);
    }, 1200);
  };

  return (
    <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontSize: 32 }}>📹</span>
        <div>
          <h2 style={{ color: T.white, fontFamily: "'Playfair Display', Georgia, serif", margin: 0, fontSize: 22, fontWeight: 700 }}>CCTV Analyser</h2>
          <p style={{ color: T.muted, fontSize: 13, margin: '4px 0 0' }}>{activeCase ? activeCase.title : 'No case selected'} — Footage Intelligence</p>
        </div>
      </div>

      <div style={card}>
        <span style={label}>UPLOAD FOOTAGE</span>
        <div style={{
          border: `2px dashed ${file ? T.gold : T.border}`, borderRadius: 10,
          padding: 40, textAlign: 'center', cursor: 'pointer',
          background: file ? T.goldLight : 'transparent', transition: 'all 0.2s',
        }}
          onClick={() => document.getElementById('cctv-input').click()}
        >
          <input id="cctv-input" type="file" accept="video/*,image/*" style={{ display: 'none' }}
            onChange={e => { setFile(e.target.files[0]); setResult(null); }} />
          <div style={{ fontSize: 36 }}>{file ? '🎬' : '📁'}</div>
          <div style={{ color: file ? T.gold : T.muted, marginTop: 12, fontSize: 14, fontWeight: file ? 700 : 400 }}>
            {file ? file.name : 'Click to select video or image file'}
          </div>
          {file && <div style={{ color: T.muted, fontSize: 11, marginTop: 4 }}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>}
        </div>

        <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
          <button style={btn(!!file)} onClick={handleAnalyse} disabled={!file || analysing}>
            {analysing ? '⏳ Analysing...' : '🔍 Analyse Footage'}
          </button>
          {file && (
            <button style={btn(false)} onClick={() => { setFile(null); setResult(null); }}>
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {result && (
        <div style={card}>
          <span style={label}>ANALYSIS RESULT</span>
          <div style={{ color: T.gold, fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{result.filename}</div>
          <div style={{ color: T.white, fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>{result.summary}</div>

          <div style={{ background: T.redLight, border: `1px solid ${T.red}`, borderRadius: 8, padding: 14, fontSize: 12, color: T.red }}>
            <strong>IMPORTANT:</strong> CCTV metadata and timestamp verification must be conducted by a qualified forensic analyst. Do not rely solely on this tool for evidential purposes.
          </div>
        </div>
      )}

      <div style={card}>
        <span style={label}>ANALYST NOTES</span>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Record observations about footage quality, gaps, timestamps, and relevant events..."
          style={{
            width: '100%', minHeight: 120, background: T.navy, border: `1px solid ${T.border}`,
            borderRadius: 8, color: T.white, padding: 12, fontSize: 13, resize: 'vertical',
            fontFamily: "'Source Serif 4', Georgia, serif", boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ ...card, background: T.tealLight, borderColor: T.teal }}>
        <div style={{ color: T.teal, fontWeight: 700, fontSize: 13, marginBottom: 8 }}>📋 CCTV REQUEST CHECKLIST</div>
        {[
          'Submit SAR for all CCTV footage within 7 days of incident',
          'Request footage from all angles covering the relevant location and time window (±30 min)',
          'Ask for metadata including camera ID, timestamp calibration records, and chain of custody',
          'If footage is withheld, document this in writing and reference ICO guidance',
          'Consider instructing a forensic video analyst for court proceedings',
        ].map((item, i) => (
          <div key={i} style={{ color: T.white, fontSize: 12, padding: '5px 0', borderBottom: i < 4 ? `1px solid rgba(12,123,122,0.2)` : 'none', display: 'flex', gap: 8 }}>
            <span style={{ color: T.teal, flexShrink: 0 }}>✓</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
