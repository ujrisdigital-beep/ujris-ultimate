import React, { useState, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const T = {
  cream: '#F8F1E9', navy: '#0F2C4A', navyM: '#FAF6F0', gold: '#D4AF37',
  goldBg: 'rgba(212,175,55,0.12)', border: 'rgba(15,44,74,0.12)',
  muted: '#1E3A5F', dim: '#64748B', red: '#DC2626', redBg: 'rgba(220,38,38,0.08)',
  success: '#10B981', successBg: 'rgba(16,185,129,0.1)',
};

export default function EvidenceUploader() {
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [activeCase, setActiveCase] = useState('aldi');
  const [meta, setMeta] = useState({ title: '', description: '', documentDate: '', exhibitRef: '', isKey: false });
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState([]);
  const [textEntry, setTextEntry] = useState('');
  const [analysing, setAnalysing] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [activeTab, setActiveTab] = useState('upload');
  const fileRef = useRef();

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer?.files || e.target.files || []);
    setFiles(dropped);
    if (dropped[0] && !meta.title) {
      setMeta(p => ({ ...p, title: dropped[0].name.replace(/\.[^.]+$/, '') }));
    }
  }, [meta.title]);

  async function uploadFile() {
    if (!files[0]) return;
    setUploading(true);

    try {
      const file = files[0];
      const path = `${activeCase}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

      const { error: storageErr } = await supabase.storage
        .from('ujris_evidence')
        .upload(path, file, { upsert: false });

      if (storageErr) {
        if (storageErr.message.includes('Bucket not found')) {
          alert('Supabase storage bucket "ujris_evidence" not configured. Please create the bucket in your Supabase dashboard first.\n\nFor now, recording the evidence metadata only.');
        } else {
          alert('Upload error: ' + storageErr.message);
          setUploading(false);
          return;
        }
      }

      const { data, error: dbErr } = await supabase.from('my_evidence').insert({
        case_id: activeCase,
        title: meta.title || file.name,
        description: meta.description,
        document_date: meta.documentDate || null,
        exhibit_ref: meta.exhibitRef || null,
        storage_path: storageErr ? null : path,
        file_type: file.type,
        is_key: meta.isKey,
        raw_text: textEntry || null,
      }).select().single();

      if (dbErr) {
        alert('Database error: ' + dbErr.message + '\n\nMake sure you have run the Supabase migration 002_personal_cases.sql');
      } else {
        setUploaded(p => [data, ...p]);
        setFiles([]);
        setMeta({ title: '', description: '', documentDate: '', exhibitRef: '', isKey: false });
        setTextEntry('');
        alert(`✓ "${data.title}" saved successfully!`);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
    setUploading(false);
  }

  async function analyseText() {
    if (!textEntry.trim()) return;
    setAnalysing(true);
    setAnalysis('');
    try {
      const res = await fetch('/api/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textEntry, caseId: activeCase, analysisType: 'full' }),
      });
      const data = await res.json();
      setAnalysis(data.analysis || 'No analysis returned.');
    } catch (err) {
      setAnalysis('Error: ' + err.message);
    }
    setAnalysing(false);
  }

  return (
    <div style={{ background: T.cream, fontFamily: "'Inter', sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ color: T.navy, fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>Evidence Vault</h2>
        <p style={{ color: T.muted, fontSize: 13, margin: 0 }}>Upload PDFs, images, emails. AI analyses every document for contradictions and anchor lies.</p>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {[['aldi','Aldi 770MC038',T.red],['fairwinds','Fairwinds 6016884/2025',T.gold]].map(([id, label, color]) => (
          <button key={id} onClick={() => setActiveCase(id)} style={{
            padding: '10px 20px', borderRadius: 8, border: `2px solid ${activeCase === id ? color : T.border}`,
            background: activeCase === id ? `${color}15` : 'white', color: T.navy, fontWeight: activeCase === id ? 700 : 400, cursor: 'pointer', fontSize: 13,
          }}>{label}</button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 0, borderBottom: `2px solid ${T.border}`, marginBottom: 20 }}>
        {[['upload','Upload File'],['text','Paste Text / Analyse'],['list','My Evidence']].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{
            padding: '10px 20px', background: 'none', border: 'none',
            borderBottom: activeTab === id ? `3px solid ${T.gold}` : '3px solid transparent',
            color: activeTab === id ? T.navy : T.dim, fontWeight: activeTab === id ? 700 : 400, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit',
          }}>{label}</button>
        ))}
      </div>

      {activeTab === 'upload' && (
        <div>
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            style={{ border: `2px dashed ${dragging ? T.gold : T.border}`, borderRadius: 12, padding: '48px 24px', textAlign: 'center', cursor: 'pointer', background: dragging ? T.goldBg : 'white', marginBottom: 20, transition: 'all 0.2s' }}>
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.eml,.msg" multiple onChange={onDrop} style={{ display: 'none' }} />
            <div style={{ fontSize: 40, marginBottom: 12 }}>{files[0] ? '📄' : '📎'}</div>
            {files[0] ? (
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>{files[0].name}</div>
                <div style={{ fontSize: 12, color: T.dim }}>{(files[0].size / 1024 / 1024).toFixed(2)} MB</div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.navy, marginBottom: 4 }}>Drag & drop evidence files here</div>
                <div style={{ fontSize: 12, color: T.dim }}>PDF, Word, JPG, PNG, Email files accepted</div>
              </div>
            )}
          </div>

          {files[0] && (
            <div style={{ background: 'white', borderRadius: 12, padding: 20, border: `1px solid ${T.border}`, marginBottom: 20 }}>
              <h4 style={{ color: T.navy, margin: '0 0 14px' }}>Evidence Details</h4>
              <div style={{ display: 'grid', gap: 12 }}>
                <input value={meta.title} onChange={e => setMeta(p => ({ ...p, title: e.target.value }))} placeholder="Document title / name"
                  style={{ padding: '10px 12px', borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: 'inherit' }} />
                <textarea value={meta.description} onChange={e => setMeta(p => ({ ...p, description: e.target.value }))} placeholder="Brief description of what this document shows and why it matters..." rows={2}
                  style={{ padding: '10px 12px', borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: 'inherit', resize: 'vertical' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <input type="date" value={meta.documentDate} onChange={e => setMeta(p => ({ ...p, documentDate: e.target.value }))}
                    style={{ padding: '10px 12px', borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: 'inherit' }} />
                  <input value={meta.exhibitRef} onChange={e => setMeta(p => ({ ...p, exhibitRef: e.target.value }))} placeholder="Exhibit ref (e.g. OO-1)"
                    style={{ padding: '10px 12px', borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: 'inherit' }} />
                </div>
                <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: T.navy, cursor: 'pointer' }}>
                  <input type="checkbox" checked={meta.isKey} onChange={e => setMeta(p => ({ ...p, isKey: e.target.checked }))} />
                  Mark as KEY evidence (will be highlighted in hearing pack)
                </label>
              </div>
              <button onClick={uploadFile} disabled={uploading}
                style={{ marginTop: 16, padding: '12px 28px', background: uploading ? T.dim : T.gold, color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: uploading ? 'not-allowed' : 'pointer' }}>
                {uploading ? 'Saving...' : 'Save Evidence'}
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'text' && (
        <div style={{ background: 'white', borderRadius: 12, padding: 20, border: `1px solid ${T.border}` }}>
          <h4 style={{ color: T.navy, margin: '0 0 8px' }}>Paste Document Text for AI Analysis</h4>
          <p style={{ color: T.muted, fontSize: 12, marginBottom: 12 }}>Paste the text content of any document. Claude will find contradictions, anchor lies, and key dates.</p>
          <textarea value={textEntry} onChange={e => setTextEntry(e.target.value)} rows={10}
            placeholder="Paste document text here... (e.g. paste the text from the Pancott letter, or the investigation notes, or the ASEL security report)"
            style={{ width: '100%', padding: '12px', borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 12, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6 }} />
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button onClick={analyseText} disabled={analysing || !textEntry.trim()}
              style={{ padding: '10px 24px', background: analysing ? T.dim : T.navy, color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: analysing ? 'not-allowed' : 'pointer' }}>
              {analysing ? 'Analysing...' : '🔍 Analyse for Contradictions'}
            </button>
          </div>
          {analysis && (
            <div style={{ marginTop: 16, background: T.navyM, borderRadius: 8, padding: '16px', fontSize: 12, lineHeight: 1.8, color: T.navy, whiteSpace: 'pre-wrap' }}>
              {analysis}
            </div>
          )}
        </div>
      )}

      {activeTab === 'list' && (
        <EvidenceList activeCase={activeCase} />
      )}
    </div>
  );
}

function EvidenceList({ activeCase }) {
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('my_evidence').select('*').eq('case_id', activeCase).order('document_date', { ascending: true }).then(({ data }) => {
      setEvidence(data || []);
      setLoading(false);
    });
  }, [activeCase]);

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: T.dim }}>Loading evidence...</div>;
  if (evidence.length === 0) return (
    <div style={{ textAlign: 'center', padding: 60, background: 'white', borderRadius: 12, border: `1px solid ${T.border}` }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>📂</div>
      <p style={{ color: T.dim }}>No evidence uploaded yet for this case. Use the Upload tab to add files.</p>
    </div>
  );

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {evidence.map(ev => (
        <div key={ev.id} style={{ background: 'white', borderRadius: 10, padding: '14px 18px', border: `1px solid ${ev.is_key ? T.navy : T.border}`, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div style={{ fontSize: 24, flexShrink: 0 }}>{ev.is_anchor_lie ? '🎯' : ev.is_key ? '⭐' : '📄'}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.navy }}>{ev.title}</div>
              {ev.exhibit_ref && <span style={{ fontSize: 10, background: T.goldBg, color: T.navy, padding: '1px 8px', borderRadius: 10, fontWeight: 600 }}>{ev.exhibit_ref}</span>}
              {ev.is_anchor_lie && <span style={{ fontSize: 10, background: T.redBg, color: T.red, padding: '1px 8px', borderRadius: 10, fontWeight: 600 }}>ANCHOR LIE</span>}
            </div>
            {ev.document_date && <div style={{ fontSize: 11, color: T.dim, marginBottom: 4 }}>{new Date(ev.document_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>}
            {ev.description && <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.5 }}>{ev.description}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
