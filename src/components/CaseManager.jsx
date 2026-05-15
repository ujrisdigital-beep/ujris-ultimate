import React, { useState, useEffect } from 'react';

const T = {
  navy: '#0D1B2A', navyMid: '#152438', navyLight: '#1E3A5F',
  gold: '#C9A84C', goldLight: 'rgba(201,168,76,0.15)',
  teal: '#0C7B7A', tealLight: 'rgba(12,123,122,0.15)',
  white: '#EEF2F7', muted: '#7A8FA6', border: 'rgba(255,255,255,0.08)',
  red: '#E53E3E', redLight: 'rgba(229,62,62,0.15)',
};

const ICONS = ['⚖', '🏢', '🏪', '🏥', '🏦', '🏫', '🚔', '📋', '🏠', '🛡', '👶', '💔', '🛒', '🏛', '📢'];
const DISC_TYPES = ['Race', 'Sex', 'Disability', 'Age', 'Religion', 'Sexual Orientation', 'Pregnancy', 'Marriage', 'Gender Reassignment', 'Whistleblowing', 'Unfair Dismissal', 'Constructive Dismissal', 'Assault', 'Police Misconduct', 'Other'];
const VENUES = ['Manchester Employment Tribunal', 'London Central Employment Tribunal', 'Birmingham Employment Tribunal', 'Leeds Employment Tribunal', 'Bristol Employment Tribunal', 'Manchester County Court', 'Central London County Court', 'ACAS Early Conciliation', 'Other'];
const STATUSES = ['active', 'stayed', 'settled', 'won', 'lost', 'withdrawn'];

const STATUS_COLORS = {
  active: T.teal, stayed: T.gold, settled: '#7B5EA7', won: '#22C55E', lost: T.red, withdrawn: T.muted,
};

const SEED_CASES = [
  {
    id: 'aldi-seed', icon: '🛒', title: 'Aldi Stores Ltd', employer: 'Aldi Stores Ltd', ref: '770MC038',
    discTypes: ['Assault', 'False Imprisonment', 'Police Misconduct'],
    venue: 'Manchester County Court', hearingDate: '2026-05-05', status: 'active',
    notes: 'Civil assault claim. CCTV spoliation. Police collusion allegation.',
  },
  {
    id: 'fairwinds-seed', icon: '🏥', title: 'Fairwinds Health Care Ltd', employer: 'Fairwinds Health Care Ltd', ref: '6016884/2025',
    discTypes: ['Race', 'Whistleblowing', 'Constructive Dismissal'],
    venue: 'Manchester Employment Tribunal', hearingDate: '2026-07-22', status: 'active',
    notes: 'Race discrimination + whistleblowing retaliation. Constructive dismissal.',
  },
];

function daysUntil(d) { return Math.ceil((new Date(d) - new Date()) / 86400000); }

export default function CaseManager() {
  const [cases, setCases] = useState(() => {
    const s = localStorage.getItem('ujris_cases_mgr');
    return s ? JSON.parse(s) : SEED_CASES;
  });
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    icon: '⚖', title: '', employer: '', ref: '', discTypes: [], venue: '', hearingDate: '', status: 'active', notes: '',
  });

  useEffect(() => {
    localStorage.setItem('ujris_cases_mgr', JSON.stringify(cases));
  }, [cases]);

  function openNew() {
    setEditing(null);
    setForm({ icon: '⚖', title: '', employer: '', ref: '', discTypes: [], venue: '', hearingDate: '', status: 'active', notes: '' });
    setShowForm(true);
  }

  function openEdit(c) {
    setEditing(c.id);
    setForm({ ...c });
    setShowForm(true);
  }

  function saveCase() {
    if (!form.title) return;
    if (editing) {
      setCases(prev => prev.map(c => c.id === editing ? { ...form, id: editing } : c));
    } else {
      setCases(prev => [...prev, { ...form, id: Date.now().toString() }]);
    }
    setShowForm(false);
    setEditing(null);
  }

  function deleteCase(id) {
    if (window.confirm('Delete this case? This cannot be undone.')) {
      setCases(prev => prev.filter(c => c.id !== id));
    }
  }

  function toggleDiscType(dt) {
    setForm(prev => ({
      ...prev,
      discTypes: prev.discTypes.includes(dt) ? prev.discTypes.filter(d => d !== dt) : [...prev.discTypes, dt],
    }));
  }

  return (
    <div style={{ minHeight: '100vh', background: T.navy, color: T.white, fontFamily: "'Source Serif 4', Georgia, serif" }}>
      <div style={{ background: T.navyMid, borderBottom: `1px solid ${T.border}`, padding: '24px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontFamily: "'Playfair Display', Georgia, serif", color: T.gold }}>🗂️ Case Manager</h1>
            <p style={{ margin: '4px 0 0', color: T.muted, fontSize: 13 }}>Create, edit, and manage all your legal cases</p>
          </div>
          <button onClick={openNew} style={{ padding: '10px 20px', background: T.gold, color: T.navy, border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>+ New Case</button>
        </div>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: T.navyMid, border: `1px solid ${T.gold}`, borderRadius: 16, padding: 32, width: '100%', maxWidth: 680, maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ margin: '0 0 24px', color: T.gold, fontFamily: "'Playfair Display', Georgia, serif" }}>{editing ? 'Edit Case' : 'New Case'}</h2>

            {/* Icon picker */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: T.muted, fontSize: 11, marginBottom: 6 }}>Case Icon</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {ICONS.map(ic => (
                  <button key={ic} onClick={() => setForm(p => ({ ...p, icon: ic }))} style={{
                    width: 40, height: 40, fontSize: 20, border: `2px solid ${form.icon === ic ? T.gold : T.border}`,
                    background: form.icon === ic ? T.goldLight : 'transparent', borderRadius: 8, cursor: 'pointer',
                  }}>{ic}</button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { key: 'title', label: 'Case Name *', placeholder: 'e.g. Aldi Stores Ltd' },
                { key: 'employer', label: 'Employer / Respondent', placeholder: 'e.g. Aldi Stores Ltd' },
                { key: 'ref', label: 'Case Reference', placeholder: 'e.g. 770MC038' },
                { key: 'hearingDate', label: 'Hearing Date', type: 'date' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', color: T.muted, fontSize: 11, marginBottom: 4 }}>{f.label}</label>
                  <input type={f.type || 'text'} value={form[f.key] || ''} placeholder={f.placeholder}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    style={{ width: '100%', background: T.navy, border: `1px solid ${T.border}`, borderRadius: 8, color: T.white, padding: '9px 12px', fontSize: 13, boxSizing: 'border-box' }} />
                </div>
              ))}
            </div>

            <div style={{ marginTop: 14 }}>
              <label style={{ display: 'block', color: T.muted, fontSize: 11, marginBottom: 4 }}>Tribunal Venue</label>
              <select value={form.venue} onChange={e => setForm(p => ({ ...p, venue: e.target.value }))}
                style={{ width: '100%', background: T.navy, border: `1px solid ${T.border}`, borderRadius: 8, color: T.white, padding: '9px 12px', fontSize: 13 }}>
                <option value="">Select venue...</option>
                {VENUES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            <div style={{ marginTop: 14 }}>
              <label style={{ display: 'block', color: T.muted, fontSize: 11, marginBottom: 6 }}>Discrimination / Claim Types</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {DISC_TYPES.map(dt => (
                  <button key={dt} onClick={() => toggleDiscType(dt)} style={{
                    padding: '5px 12px', borderRadius: 20, border: `1px solid ${form.discTypes.includes(dt) ? T.teal : T.border}`,
                    background: form.discTypes.includes(dt) ? T.tealLight : 'transparent',
                    color: form.discTypes.includes(dt) ? T.teal : T.muted, cursor: 'pointer', fontSize: 12,
                  }}>{dt}</button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <label style={{ display: 'block', color: T.muted, fontSize: 11, marginBottom: 4 }}>Status</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {STATUSES.map(s => (
                  <button key={s} onClick={() => setForm(p => ({ ...p, status: s }))} style={{
                    padding: '5px 12px', borderRadius: 20, border: `1px solid ${form.status === s ? STATUS_COLORS[s] : T.border}`,
                    background: form.status === s ? `${STATUS_COLORS[s]}22` : 'transparent',
                    color: form.status === s ? STATUS_COLORS[s] : T.muted, cursor: 'pointer', fontSize: 12, textTransform: 'capitalize',
                  }}>{s}</button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <label style={{ display: 'block', color: T.muted, fontSize: 11, marginBottom: 4 }}>Notes</label>
              <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                rows={3} placeholder="Key facts, context, strategy notes..."
                style={{ width: '100%', background: T.navy, border: `1px solid ${T.border}`, borderRadius: 8, color: T.white, padding: '9px 12px', fontSize: 13, resize: 'vertical', fontFamily: "'Source Serif 4', Georgia, serif", boxSizing: 'border-box' }} />
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button onClick={saveCase} style={{ padding: '12px 24px', background: T.gold, color: T.navy, border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                {editing ? 'Save Changes' : 'Create Case'}
              </button>
              <button onClick={() => setShowForm(false)} style={{ padding: '12px 20px', background: 'transparent', color: T.muted, border: `1px solid ${T.border}`, borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: '24px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20 }}>
          {cases.map(c => {
            const days = c.hearingDate ? daysUntil(c.hearingDate) : null;
            const sc = STATUS_COLORS[c.status] || T.muted;
            return (
              <div key={c.id} style={{ background: T.navyMid, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24, position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 36 }}>{c.icon}</span>
                    <div>
                      <div style={{ color: T.white, fontWeight: 700, fontSize: 16, fontFamily: "'Playfair Display', Georgia, serif" }}>{c.title}</div>
                      {c.ref && <div style={{ color: T.gold, fontSize: 12, marginTop: 2 }}>{c.ref}</div>}
                      {c.venue && <div style={{ color: T.muted, fontSize: 11, marginTop: 2 }}>{c.venue}</div>}
                    </div>
                  </div>
                  <span style={{ background: `${sc}22`, color: sc, fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 10, textTransform: 'capitalize', flexShrink: 0 }}>{c.status}</span>
                </div>

                {c.discTypes && c.discTypes.length > 0 && (
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
                    {c.discTypes.map(d => (
                      <span key={d} style={{ background: T.navyLight, color: T.muted, fontSize: 10, padding: '2px 7px', borderRadius: 6 }}>{d}</span>
                    ))}
                  </div>
                )}

                {c.hearingDate && days !== null && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 13 }}>📅</span>
                    <span style={{ color: T.muted, fontSize: 12 }}>{new Date(c.hearingDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    <span style={{ background: days <= 30 ? 'rgba(229,62,62,0.15)' : T.tealLight, color: days <= 30 ? T.red : T.teal, fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 6 }}>{days}d</span>
                  </div>
                )}

                {c.notes && <div style={{ color: T.muted, fontSize: 12, lineHeight: 1.6, marginBottom: 16, fontStyle: 'italic' }}>{c.notes}</div>}

                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => openEdit(c)} style={{ padding: '7px 16px', background: T.tealLight, color: T.teal, border: `1px solid ${T.teal}44`, borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>✏️ Edit</button>
                  <button onClick={() => deleteCase(c.id)} style={{ padding: '7px 16px', background: T.redLight, color: T.red, border: `1px solid ${T.red}44`, borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>🗑️ Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
