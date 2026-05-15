import React, { useState, useEffect } from 'react';
import { supabase, getCurrentUser } from '../lib/supabase';

const T = {
  cream: '#F8F1E9', navy: '#0F2C4A', navyM: '#FAF6F0', gold: '#D4AF37',
  goldBg: 'rgba(212,175,55,0.12)', border: 'rgba(15,44,74,0.12)',
  muted: '#1E3A5F', dim: '#64748B', red: '#DC2626',
  success: '#10B981', successBg: 'rgba(16,185,129,0.1)',
};

const DOC_TYPE_ICONS = {
  witness_statement: '📜', grievance_letter: '📮', et1_form: '⚖',
  schedule_loss: '💰', bundle_index: '📁', without_prejudice: '🤝',
  subject_access_request: '🔍', template: '📝', guide: '📚', case_study: '🏆',
};

const DOC_TYPES = Object.keys(DOC_TYPE_ICONS);

function DocCard({ doc, onDownload }) {
  const outcomeColor = { won: T.success, lost: T.red, settled: T.gold, unknown: T.dim };
  return (
    <div style={{ background: 'white', borderRadius: 12, padding: 20, border: `1px solid ${T.border}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 28 }}>{DOC_TYPE_ICONS[doc.document_type] || '📄'}</span>
          <div>
            <h4 style={{ margin: '0 0 4px', fontSize: 14, color: T.navy, fontWeight: 700 }}>{doc.title}</h4>
            <div style={{ fontSize: 11, color: T.dim }}>{doc.document_type?.replace(/_/g,' ')}</div>
          </div>
        </div>
        {doc.outcome && (
          <span style={{ fontSize: 11, fontWeight: 600, color: outcomeColor[doc.outcome] || T.dim, background: `${outcomeColor[doc.outcome]}15`, padding: '2px 8px', borderRadius: 10 }}>
            {doc.outcome.toUpperCase()}
          </span>
        )}
      </div>

      {doc.description && <p style={{ margin: '0 0 10px', fontSize: 12, color: T.muted, lineHeight: 1.5 }}>{doc.description}</p>}

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        {(doc.tags || []).slice(0, 4).map(t => <span key={t} style={{ background: T.goldBg, color: T.navy, fontSize: 10, padding: '2px 8px', borderRadius: 10 }}>{t}</span>)}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
        <div style={{ display: 'flex', gap: 12, fontSize: 11, color: T.dim }}>
          <span>⬇ {doc.download_count || 0}</span>
          <span>👁 {doc.view_count || 0}</span>
          {doc.avg_rating > 0 && <span>★ {doc.avg_rating?.toFixed(1)}</span>}
          {doc.success_rate && <span style={{ color: T.success }}>✓ {doc.success_rate}% success</span>}
        </div>
        <button onClick={() => onDownload(doc)}
          style={{ padding: '8px 16px', background: T.navy, color: 'white', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          Download
        </button>
      </div>
    </div>
  );
}

export default function DocumentMarketplace() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('browse');
  const [filter, setFilter] = useState({ type: '', outcome: '', search: '' });
  const [user, setUser] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    title: '', description: '', document_type: 'template', outcome: 'unknown',
    success_rate: '', tags: '', case_type: '',
  });
  const [uploading, setUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);

  useEffect(() => { getCurrentUser().then(u => setUser(u)); }, []);

  useEffect(() => { loadDocs(); }, [filter.type, filter.outcome]);

  async function loadDocs() {
    setLoading(true);
    let query = supabase
      .from('marketplace_documents')
      .select('id,title,description,document_type,outcome,success_rate,download_count,view_count,avg_rating,tags,is_verified,created_at')
      .eq('is_published', true)
      .order('download_count', { ascending: false })
      .limit(24);

    if (filter.type) query = query.eq('document_type', filter.type);
    if (filter.outcome) query = query.eq('outcome', filter.outcome);

    const { data, error } = await query;
    if (!error) setDocs(data || []);
    setLoading(false);
  }

  async function handleDownload(doc) {
    if (!user) { alert('Sign in to download documents.'); return; }
    const { data: urlData } = await supabase.storage.from('marketplace').createSignedUrl(doc.storage_path, 300);
    if (urlData?.signedUrl) {
      const a = document.createElement('a');
      a.href = urlData.signedUrl;
      a.download = doc.title;
      a.click();
      await supabase.from('document_downloads').insert({ document_id: doc.id, user_id: user.id });
      await supabase.from('marketplace_documents').update({ download_count: (doc.download_count || 0) + 1 }).eq('id', doc.id);
    } else {
      alert('Download temporarily unavailable.');
    }
  }

  async function handleUpload() {
    if (!user || !uploadFile || !uploadForm.title) return;
    setUploading(true);
    const path = `${user.id}/${Date.now()}_${uploadFile.name}`;
    const { error: uploadErr } = await supabase.storage.from('marketplace').upload(path, uploadFile);
    if (uploadErr) { alert('Upload failed: ' + uploadErr.message); setUploading(false); return; }

    const { error: insertErr } = await supabase.from('marketplace_documents').insert({
      author_id: user.id,
      title: uploadForm.title,
      description: uploadForm.description,
      document_type: uploadForm.document_type,
      outcome: uploadForm.outcome,
      success_rate: uploadForm.success_rate ? parseFloat(uploadForm.success_rate) : null,
      tags: uploadForm.tags.split(',').map(t => t.trim()).filter(Boolean),
      case_type: uploadForm.case_type,
      storage_path: path,
      file_size: uploadFile.size,
      file_type: uploadFile.type,
      is_published: true,
    });

    if (insertErr) { alert('Save failed: ' + insertErr.message); } else { alert('Document published! Thank you for contributing.'); setActiveTab('browse'); loadDocs(); }
    setUploading(false);
  }

  const filteredDocs = docs.filter(d => !filter.search || d.title.toLowerCase().includes(filter.search.toLowerCase()) || (d.description || '').toLowerCase().includes(filter.search.toLowerCase()));

  return (
    <div style={{ background: T.cream, fontFamily: "'Inter', sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ color: T.navy, fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>Document Marketplace</h2>
        <p style={{ color: T.muted, fontSize: 13, margin: 0 }}>GitHub for legal documents. Download successful templates. Share anonymised documents. Build community.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Published Documents', value: docs.length, sub: 'Contributed by users' },
          { label: 'Document Types', value: DOC_TYPES.length, sub: 'From ET1 to case studies' },
          { label: 'Free to Download', value: '100%', sub: 'All documents free' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: 10, padding: '14px 18px', border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: T.navy }}>{s.value}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.navy }}>{s.label}</div>
            <div style={{ fontSize: 11, color: T.dim }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 0, borderBottom: `2px solid ${T.border}`, marginBottom: 24 }}>
        {[['browse','Browse'],['upload','Contribute']].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{
            padding: '10px 20px', background: 'none', border: 'none',
            borderBottom: activeTab === id ? `3px solid ${T.gold}` : '3px solid transparent',
            color: activeTab === id ? T.navy : T.dim, fontWeight: activeTab === id ? 700 : 400,
            cursor: 'pointer', fontSize: 13, fontFamily: 'inherit',
          }}>{label}</button>
        ))}
      </div>

      {activeTab === 'browse' && (
        <div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
            <input value={filter.search} onChange={e => setFilter(p => ({ ...p, search: e.target.value }))} placeholder="Search documents..."
              style={{ flex: 1, minWidth: 180, padding: '8px 12px', borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 12, fontFamily: 'inherit' }} />
            <select value={filter.type} onChange={e => setFilter(p => ({ ...p, type: e.target.value }))}
              style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 12, fontFamily: 'inherit' }}>
              <option value="">All types</option>
              {DOC_TYPES.map(t => <option key={t} value={t}>{DOC_TYPE_ICONS[t]} {t.replace(/_/g,' ')}</option>)}
            </select>
            <select value={filter.outcome} onChange={e => setFilter(p => ({ ...p, outcome: e.target.value }))}
              style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 12, fontFamily: 'inherit' }}>
              <option value="">Any outcome</option>
              <option value="won">Won ✓</option>
              <option value="settled">Settled 🤝</option>
              <option value="unknown">Template</option>
            </select>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: T.dim }}>Loading documents...</div>
          ) : filteredDocs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: T.dim }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📂</div>
              <p>No documents yet. Be the first to contribute!</p>
              <button onClick={() => setActiveTab('upload')} style={{ background: T.gold, color: 'white', padding: '10px 24px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600 }}>Upload First Document</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {filteredDocs.map(d => <DocCard key={d.id} doc={d} onDownload={handleDownload} />)}
            </div>
          )}
        </div>
      )}

      {activeTab === 'upload' && (
        <div style={{ background: 'white', borderRadius: 12, padding: 28, border: `1px solid ${T.border}`, maxWidth: 560 }}>
          {!user ? (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: T.muted, marginBottom: 16 }}>Sign in to contribute documents to the marketplace.</p>
              <a href="/auth" style={{ background: T.gold, color: 'white', padding: '10px 24px', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>Sign In</a>
            </div>
          ) : (
            <div>
              <h3 style={{ color: T.navy, margin: '0 0 8px' }}>Contribute a Document</h3>
              <p style={{ color: T.muted, fontSize: 12, marginBottom: 20 }}>Remove all personal identifiers before uploading. Your contribution helps others in similar situations.</p>

              <div style={{ display: 'grid', gap: 12 }}>
                <input value={uploadForm.title} onChange={e => setUploadForm(p => ({ ...p, title: e.target.value }))} placeholder="Document title"
                  style={{ padding: '10px 12px', borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: 'inherit' }} />
                <textarea value={uploadForm.description} onChange={e => setUploadForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description (no personal details)..." rows={3}
                  style={{ padding: '10px 12px', borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: 'inherit', resize: 'vertical' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <select value={uploadForm.document_type} onChange={e => setUploadForm(p => ({ ...p, document_type: e.target.value }))}
                    style={{ padding: '10px 12px', borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 12, fontFamily: 'inherit' }}>
                    {DOC_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g,' ')}</option>)}
                  </select>
                  <select value={uploadForm.outcome} onChange={e => setUploadForm(p => ({ ...p, outcome: e.target.value }))}
                    style={{ padding: '10px 12px', borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 12, fontFamily: 'inherit' }}>
                    <option value="won">Used in won case</option>
                    <option value="settled">Used in settlement</option>
                    <option value="unknown">Template / general</option>
                  </select>
                </div>
                <input value={uploadForm.tags} onChange={e => setUploadForm(p => ({ ...p, tags: e.target.value }))} placeholder="Tags (comma separated): disability, ET1, reasonable adjustments..."
                  style={{ padding: '10px 12px', borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: 'inherit' }} />
                <div>
                  <label style={{ fontSize: 12, color: T.dim, display: 'block', marginBottom: 6 }}>Document File (PDF, DOCX, max 5MB)</label>
                  <input type="file" accept=".pdf,.docx,.doc,.txt" onChange={e => setUploadFile(e.target.files[0])}
                    style={{ fontSize: 12 }} />
                </div>
              </div>

              <div style={{ background: T.goldBg, borderRadius: 8, padding: 12, margin: '16px 0', fontSize: 11, color: T.muted }}>
                ⚠ By uploading you confirm this document contains no personal identifiable information and you have the right to share it. All uploads are reviewed before full publication.
              </div>

              <button onClick={handleUpload} disabled={uploading || !uploadFile || !uploadForm.title}
                style={{ padding: '12px 28px', background: uploading ? T.dim : T.gold, color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: uploading ? 'not-allowed' : 'pointer' }}>
                {uploading ? 'Uploading...' : 'Publish Document'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
