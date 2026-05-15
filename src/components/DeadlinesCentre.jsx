import React, { useState, useEffect } from 'react';

const T = {
  navy: '#0D1B2A', navyMid: '#152438', navyLight: '#1E3A5F',
  gold: '#C9A84C', goldLight: 'rgba(201,168,76,0.15)',
  teal: '#0C7B7A', tealLight: 'rgba(12,123,122,0.15)',
  white: '#EEF2F7', muted: '#7A8FA6', border: 'rgba(255,255,255,0.08)',
  red: '#E53E3E', redLight: 'rgba(229,62,62,0.15)',
  green: '#22C55E', greenLight: 'rgba(34,197,94,0.15)',
  orange: '#D97706', orangeLight: 'rgba(217,119,6,0.15)',
};

const UK_REFERENCE = [
  { type: 'Employment Tribunal (ET)', deadline: '3 months minus 1 day from discriminatory act', law: 'EA 2010 s.123', note: 'ACAS Early Conciliation pauses clock' },
  { type: 'ACAS Early Conciliation', deadline: 'Must contact ACAS before ET claim', law: 'ETA 1996 s.18A', note: 'Certificate required to submit ET1' },
  { type: 'County Court (MCOL)', deadline: '6 years (contract) / 6 years (personal injury 3yr)', law: 'Limitation Act 1980', note: 'Claim 770MC038 — Aldi assault' },
  { type: 'SAR Response', deadline: '1 month from request', law: 'GDPR Art 12 / DPA 2018', note: 'Extendable by 2 months for complexity' },
  { type: 'ICO Complaint', deadline: '3 months from SAR breach', law: 'DPA 2018 s.165', note: 'After controller fails to respond' },
  { type: 'Police Complaint (IOPC)', deadline: '12 months from incident', law: 'Police Reform Act 2002', note: 'Can request extension for good reason' },
  { type: 'Part 36 Offer Acceptance', deadline: '21 days (relevant period)', law: 'CPR Part 36.5', note: 'Costs consequences apply after deadline' },
  { type: 'ET Hearing Bundle', deadline: '7 days before hearing', law: 'ET Rules 2013 r.45', note: 'Standard unless ordered otherwise' },
  { type: 'Witness Statements', deadline: 'Usually 14 days before hearing', law: 'ET Rules 2013 r.43', note: 'Per case management order' },
];

function daysUntil(dateStr) {
  return Math.ceil((new Date(dateStr) - new Date()) / 86400000);
}

function urgencyColor(days) {
  if (days < 0) return T.red;
  if (days <= 7) return T.red;
  if (days <= 30) return T.orange;
  if (days <= 90) return T.gold;
  return T.teal;
}

function urgencyLabel(days) {
  if (days < 0) return 'OVERDUE';
  if (days <= 7) return 'CRITICAL';
  if (days <= 30) return 'URGENT';
  if (days <= 90) return 'SOON';
  return 'UPCOMING';
}

const SEED = [
  { id: '1', title: 'Aldi Hearing — County Court', caseRef: '770MC038', date: '2026-05-05', type: 'ET', notes: 'Civil claim, assault + spoliation' },
  { id: '2', title: 'Fairwinds ET Hearing', caseRef: '6016884/2025', date: '2026-07-22', type: 'ET', notes: 'Race discrimination + whistleblowing' },
  { id: '3', title: 'Fairwinds Bundle Deadline', caseRef: '6016884/2025', date: '2026-07-15', type: 'Bundle', notes: '7 days before 22 July hearing' },
];

export default function DeadlinesCentre({ caseId }) {
  const [deadlines, setDeadlines] = useState(() => {
    const s = localStorage.getItem('ujris_deadlines');
    return s ? JSON.parse(s) : SEED;
  });
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', caseRef: '', date: '', type: 'ET', notes: '' });
  const [activeTab, setActiveTab] = useState('deadlines');

  useEffect(() => {
    localStorage.setItem('ujris_deadlines', JSON.stringify(deadlines));
  }, [deadlines]);

  function addDeadline() {
    if (!form.title || !form.date) return;
    setDeadlines(prev => [...prev, { ...form, id: Date.now().toString() }]);
    setForm({ title: '', caseRef: '', date: '', type: 'ET', notes: '' });
    setShowAdd(false);
  }

  function deleteDeadline(id) {
    setDeadlines(prev => prev.filter(d => d.id !== id));
  }

  const sorted = [...deadlines].sort((a, b) => new Date(a.date) - new Date(b.date));

  const TYPES = ['ET', 'ACAS', 'MCOL', 'SAR', 'Police', 'ICO', 'Bundle', 'Witness', 'Part36', 'Other'];

  return (
    <div style={{ minHeight: '100vh', background: T.navy, color: T.white, fontFamily: "'Source Serif 4', Georgia, serif" }}>
      <div style={{ background: T.navyMid, borderBottom: `1px solid ${T.border}`, padding: '24px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontFamily: "'Playfair Display', Georgia, serif", color: T.gold }}>⏰ Deadlines Command Centre</h1>
            <p style={{ margin: '4px 0 0', color: T.muted, fontSize: 13 }}>Track all UK legal deadlines — ET, ACAS, MCOL, SAR, Police, ICO</p>
          </div>
          <button onClick={() => setShowAdd(true)} style={{
            padding: '10px 20px', background: T.gold, color: T.navy, border: 'none', borderRadius: 8,
            fontWeight: 700, cursor: 'pointer', fontSize: 14,
          }}>+ Add Deadline</button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          {['deadlines', 'reference'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{
              padding: '7px 16px', borderRadius: 8, border: `1px solid ${activeTab === t ? T.gold : T.border}`,
              background: activeTab === t ? T.goldLight : 'transparent', color: activeTab === t ? T.gold : T.muted,
              cursor: 'pointer', fontSize: 13, fontWeight: activeTab === t ? 700 : 400, textTransform: 'capitalize',
            }}>{t === 'deadlines' ? '📅 My Deadlines' : '📖 UK Reference'}</button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      {activeTab === 'deadlines' && (
        <div style={{ display: 'flex', gap: 16, padding: '16px 32px', borderBottom: `1px solid ${T.border}` }}>
          {[
            { label: 'Total', count: deadlines.length, color: T.white },
            { label: 'Critical (<7d)', count: sorted.filter(d => { const x = daysUntil(d.date); return x >= 0 && x <= 7; }).length, color: T.red },
            { label: 'Urgent (<30d)', count: sorted.filter(d => { const x = daysUntil(d.date); return x >= 0 && x <= 30; }).length, color: T.orange },
            { label: 'Overdue', count: sorted.filter(d => daysUntil(d.date) < 0).length, color: T.red },
          ].map(s => (
            <div key={s.label} style={{ background: T.navyMid, border: `1px solid ${T.border}`, borderRadius: 10, padding: '12px 20px', minWidth: 100 }}>
              <div style={{ color: s.color, fontWeight: 700, fontSize: 22, fontFamily: "'Playfair Display', Georgia, serif" }}>{s.count}</div>
              <div style={{ color: T.muted, fontSize: 11 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ padding: '24px 32px' }}>

        {activeTab === 'deadlines' && (
          <>
            {showAdd && (
              <div style={{ background: T.navyMid, border: `1px solid ${T.gold}`, borderRadius: 12, padding: 20, marginBottom: 24 }}>
                <h3 style={{ margin: '0 0 16px', color: T.gold, fontFamily: "'Playfair Display', Georgia, serif" }}>Add Deadline</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                  {[
                    { key: 'title', label: 'Title *', type: 'text', placeholder: 'e.g. ET Bundle submission' },
                    { key: 'caseRef', label: 'Case Reference', type: 'text', placeholder: 'e.g. 770MC038' },
                    { key: 'date', label: 'Deadline Date *', type: 'date' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ display: 'block', color: T.muted, fontSize: 11, marginBottom: 4 }}>{f.label}</label>
                      <input type={f.type} value={form[f.key]} placeholder={f.placeholder}
                        onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                        style={{ width: '100%', background: T.navy, border: `1px solid ${T.border}`, borderRadius: 6, color: T.white, padding: '8px 10px', fontSize: 13, boxSizing: 'border-box' }} />
                    </div>
                  ))}
                  <div>
                    <label style={{ display: 'block', color: T.muted, fontSize: 11, marginBottom: 4 }}>Type</label>
                    <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                      style={{ width: '100%', background: T.navy, border: `1px solid ${T.border}`, borderRadius: 6, color: T.white, padding: '8px 10px', fontSize: 13 }}>
                      {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ marginTop: 12 }}>
                  <label style={{ display: 'block', color: T.muted, fontSize: 11, marginBottom: 4 }}>Notes</label>
                  <input type="text" value={form.notes} placeholder="Additional context..."
                    onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                    style={{ width: '100%', background: T.navy, border: `1px solid ${T.border}`, borderRadius: 6, color: T.white, padding: '8px 10px', fontSize: 13, boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  <button onClick={addDeadline} style={{ padding: '10px 20px', background: T.gold, color: T.navy, border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Save</button>
                  <button onClick={() => setShowAdd(false)} style={{ padding: '10px 20px', background: 'transparent', color: T.muted, border: `1px solid ${T.border}`, borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {sorted.map(d => {
                const days = daysUntil(d.date);
                const col = urgencyColor(days);
                const lbl = urgencyLabel(days);
                return (
                  <div key={d.id} style={{ background: T.navyMid, border: `1px solid ${days <= 7 ? col : T.border}`, borderRadius: 12, padding: 20, display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                    <div style={{ textAlign: 'center', background: `${col}22`, borderRadius: 10, padding: '12px 16px', minWidth: 80, flexShrink: 0 }}>
                      <div style={{ color: col, fontWeight: 900, fontSize: 28, fontFamily: "'Playfair Display', Georgia, serif", lineHeight: 1 }}>{Math.abs(days)}</div>
                      <div style={{ color: col, fontSize: 10, fontWeight: 700, letterSpacing: '0.05em' }}>DAYS {days < 0 ? 'AGO' : 'LEFT'}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ background: `${col}22`, color: col, fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 10, letterSpacing: '0.05em' }}>{lbl}</span>
                        <span style={{ background: T.navyLight, color: T.muted, fontSize: 9, padding: '2px 6px', borderRadius: 6 }}>{d.type}</span>
                        {d.caseRef && <span style={{ color: T.gold, fontSize: 11 }}>{d.caseRef}</span>}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: T.white, marginBottom: 4 }}>{d.title}</div>
                      <div style={{ color: T.muted, fontSize: 12 }}>{new Date(d.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
                      {d.notes && <div style={{ color: T.muted, fontSize: 12, marginTop: 4, fontStyle: 'italic' }}>{d.notes}</div>}
                    </div>
                    <button onClick={() => deleteDeadline(d.id)} style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', fontSize: 16, padding: 4 }}>🗑️</button>
                  </div>
                );
              })}
              {sorted.length === 0 && (
                <div style={{ textAlign: 'center', padding: 60, color: T.muted }}>No deadlines added yet. Click "+ Add Deadline" to start tracking.</div>
              )}
            </div>
          </>
        )}

        {activeTab === 'reference' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: T.tealLight, border: `1px solid ${T.teal}`, borderRadius: 10, padding: 16, marginBottom: 8 }}>
              <div style={{ color: T.teal, fontWeight: 700, fontSize: 13 }}>⚠️ Key Rule — 3 Months Minus 1 Day</div>
              <div style={{ color: T.muted, fontSize: 12, marginTop: 4 }}>The ET deadline is 3 calendar months minus 1 day from the act of discrimination. For ongoing acts, time runs from the last act. ACAS Early Conciliation pauses the clock.</div>
            </div>
            {UK_REFERENCE.map((r, i) => (
              <div key={i} style={{ background: T.navyMid, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, color: T.gold, fontSize: 15, fontFamily: "'Playfair Display', Georgia, serif" }}>{r.type}</div>
                  <span style={{ background: T.tealLight, color: T.teal, fontSize: 10, padding: '2px 8px', borderRadius: 6 }}>{r.law}</span>
                </div>
                <div style={{ color: T.white, fontSize: 13, marginBottom: 6, fontWeight: 600 }}>⏰ {r.deadline}</div>
                <div style={{ color: T.muted, fontSize: 12 }}>{r.note}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
