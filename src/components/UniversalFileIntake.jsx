import React, { useState, useRef } from 'react';

const T = {
  navy: '#0D1B2A', navyMid: '#152438', navyLight: '#1E3A5F',
  gold: '#C9A84C', goldLight: 'rgba(201,168,76,0.15)',
  teal: '#0C7B7A', tealLight: 'rgba(12,123,122,0.15)',
  white: '#EEF2F7', muted: '#7A8FA6', border: 'rgba(255,255,255,0.08)',
  red: '#E53E3E', green: '#22C55E',
};

const ACCEPTED_TYPES = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.gif,.bmp,.tiff,.webp,.mp3,.mp4,.mov,.avi,.wav,.ogg,.zip,.rar,.eml,.msg';

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function getIcon(type) {
  if (type.startsWith('image/')) return '🖼️';
  if (type.startsWith('video/')) return '🎬';
  if (type.startsWith('audio/')) return '🎵';
  if (type.includes('pdf')) return '📄';
  if (type.includes('word') || type.includes('doc')) return '📝';
  if (type.includes('sheet') || type.includes('xls')) return '📊';
  if (type.includes('zip') || type.includes('rar')) return '🗜️';
  return '📎';
}

export default function UniversalFileIntake({ caseId }) {
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [analysing, setAnalysing] = useState(null);
  const [results, setResults] = useState({});
  const [urlInput, setUrlInput] = useState('');
  const [pasteText, setPasteText] = useState('');
  const [tab, setTab] = useState('upload');
  const fileRef = useRef();
  const cameraRef = useRef();

  function addFiles(fileList) {
    const arr = Array.from(fileList).map(f => ({
      id: Date.now() + Math.random(), file: f, name: f.name, type: f.type,
      size: f.size, status: 'ready',
    }));
    setFiles(prev => [...prev, ...arr]);
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }

  function removeFile(id) {
    setFiles(prev => prev.filter(f => f.id !== id));
    setResults(prev => { const n = { ...prev }; delete n[id]; return n; });
  }

  async function analyseFile(item) {
    setAnalysing(item.id);
    setResults(prev => ({ ...prev, [item.id]: { loading: true } }));
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        let content = '';
        if (item.type.startsWith('text/') || item.type.includes('json')) {
          content = e.target.result;
        } else {
          content = `File: ${item.name} (${formatBytes(item.size)}, type: ${item.type}). Binary content not shown. Please describe what this document contains based on its name and context.`;
        }
        try {
          const res = await fetch('/api/claude', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              system: 'You are UJRIS Document Analyst — a UK legal intelligence expert. Analyse the provided document and return: (1) Document type and date if visible, (2) Key legal significance for discrimination/employment claims, (3) Evidence strength rating (HIGH/MEDIUM/LOW), (4) Specific facts that could be used in tribunal, (5) Red flags or concerns. Be specific and practical.',
              messages: [{ role: 'user', content: `Analyse this document for legal significance:\n\n${content}` }],
              stream: true,
            }),
          });
          const reader2 = res.body.getReader();
          const decoder = new TextDecoder();
          let acc = '';
          while (true) {
            const { done, value } = await reader2.read();
            if (done) break;
            const lines = decoder.decode(value).split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const d = JSON.parse(line.slice(6));
                  if (d.delta?.text) { acc += d.delta.text; setResults(prev => ({ ...prev, [item.id]: { result: acc } })); }
                } catch {}
              }
            }
          }
        } catch (err) {
          setResults(prev => ({ ...prev, [item.id]: { error: err.message } }));
        }
      };
      if (item.type.startsWith('text/') || item.type.includes('json')) {
        reader.readAsText(item.file);
      } else {
        reader.readAsArrayBuffer(item.file);
      }
    } catch (e) {
      setResults(prev => ({ ...prev, [item.id]: { error: e.message } }));
    }
    setAnalysing(null);
  }

  async function analyseText() {
    if (!pasteText.trim()) return;
    const id = 'paste-' + Date.now();
    const item = { id, name: 'Pasted Text', type: 'text/plain', size: pasteText.length };
    setFiles(prev => [...prev, item]);
    setAnalysing(id);
    setResults(prev => ({ ...prev, [id]: { loading: true } }));
    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: 'You are UJRIS Document Analyst. Analyse this text for legal significance in a UK discrimination/employment claim.',
          messages: [{ role: 'user', content: pasteText }],
          stream: true,
        }),
      });
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const d = JSON.parse(line.slice(6));
              if (d.delta?.text) { acc += d.delta.text; setResults(prev => ({ ...prev, [id]: { result: acc } })); }
            } catch {}
          }
        }
      }
    } catch (e) {
      setResults(prev => ({ ...prev, [id]: { error: e.message } }));
    }
    setAnalysing(null);
    setPasteText('');
  }

  return (
    <div style={{ minHeight: '100vh', background: T.navy, color: T.white, fontFamily: "'Source Serif 4', Georgia, serif" }}>
      <div style={{ background: T.navyMid, borderBottom: `1px solid ${T.border}`, padding: '24px 32px' }}>
        <h1 style={{ margin: 0, fontSize: 24, fontFamily: "'Playfair Display', Georgia, serif", color: T.gold }}>📁 Universal File Intake</h1>
        <p style={{ margin: '4px 0 0', color: T.muted, fontSize: 13 }}>Any format — PDF, Word, images, audio, video, ZIP, email — AI analysis included</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          {['upload', 'paste', 'camera'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '7px 16px', borderRadius: 8, border: `1px solid ${tab === t ? T.gold : T.border}`,
              background: tab === t ? T.goldLight : 'transparent', color: tab === t ? T.gold : T.muted,
              cursor: 'pointer', fontSize: 13, fontWeight: tab === t ? 700 : 400,
            }}>
              {t === 'upload' ? '📤 Upload Files' : t === 'paste' ? '📋 Paste Text' : '📷 Camera'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '24px 32px' }}>
        {tab === 'upload' && (
          <>
            {/* Drop Zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
              style={{
                border: `2px dashed ${dragging ? T.gold : T.border}`, borderRadius: 16, padding: '48px 32px',
                textAlign: 'center', cursor: 'pointer', background: dragging ? T.goldLight : 'rgba(255,255,255,0.02)',
                transition: 'all 0.2s', marginBottom: 24,
              }}>
              <input ref={fileRef} type="file" multiple accept={ACCEPTED_TYPES} style={{ display: 'none' }} onChange={e => addFiles(e.target.files)} />
              <div style={{ fontSize: 48, marginBottom: 12 }}>📁</div>
              <div style={{ color: T.white, fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Drop files here or click to browse</div>
              <div style={{ color: T.muted, fontSize: 13 }}>PDF • Word • Excel • Images • Audio • Video • ZIP • Email</div>
              <div style={{ color: T.muted, fontSize: 11, marginTop: 8 }}>Any format accepted — AI analysis available for all types</div>
            </div>
          </>
        )}

        {tab === 'paste' && (
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', color: T.muted, fontSize: 12, marginBottom: 8 }}>Paste any text — email, letter, statement, policy, tribunal bundle extract</label>
            <textarea value={pasteText} onChange={e => setPasteText(e.target.value)} rows={10}
              placeholder="Paste text here..."
              style={{ width: '100%', background: T.navyMid, border: `1px solid ${T.border}`, borderRadius: 10, color: T.white, padding: 16, fontSize: 14, resize: 'vertical', fontFamily: "'Source Serif 4', Georgia, serif", lineHeight: 1.7, boxSizing: 'border-box' }} />
            <button onClick={analyseText} disabled={!pasteText.trim()} style={{
              marginTop: 12, padding: '12px 24px', background: T.gold, color: T.navy, border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 14,
            }}>🔬 Analyse Text</button>
          </div>
        )}

        {tab === 'camera' && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>📷</div>
            <div style={{ color: T.white, fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Capture Document with Camera</div>
            <div style={{ color: T.muted, fontSize: 13, marginBottom: 20 }}>Take a photo of letters, notices, or handwritten notes</div>
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={e => { addFiles(e.target.files); setTab('upload'); }} />
            <button onClick={() => cameraRef.current?.click()} style={{ padding: '14px 32px', background: T.teal, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 16 }}>📸 Open Camera</button>
          </div>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div>
            <div style={{ color: T.muted, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 12 }}>UPLOADED FILES ({files.length})</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {files.map(item => {
                const res = results[item.id];
                return (
                  <div key={item.id} style={{ background: T.navyMid, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 28, flexShrink: 0 }}>{getIcon(item.type || '')}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: T.white, fontSize: 14, marginBottom: 2 }}>{item.name}</div>
                        {item.size && <div style={{ color: T.muted, fontSize: 12 }}>{formatBytes(item.size)} · {item.type || 'unknown'}</div>}
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => analyseFile(item)} disabled={analysing === item.id || !item.file} style={{
                          padding: '6px 14px', background: T.tealLight, color: T.teal, border: `1px solid ${T.teal}44`, borderRadius: 6, cursor: 'pointer', fontSize: 12,
                        }}>
                          {analysing === item.id ? '⏳' : '🔬 Analyse'}
                        </button>
                        <button onClick={() => removeFile(item.id)} style={{ padding: '6px 10px', background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 6, color: T.muted, cursor: 'pointer', fontSize: 12 }}>✕</button>
                      </div>
                    </div>
                    {res && (
                      <div style={{ marginTop: 12, background: T.navy, border: `1px solid ${T.teal}44`, borderRadius: 8, padding: 14 }}>
                        {res.loading && <div style={{ color: T.muted, fontSize: 13 }}>⏳ Analysing...</div>}
                        {res.result && <div style={{ color: T.white, fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{res.result}</div>}
                        {res.error && <div style={{ color: T.red, fontSize: 13 }}>Error: {res.error}</div>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
