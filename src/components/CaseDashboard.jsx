import React, { useState, useEffect } from 'react';

const T = {
  cream: '#F8F1E9', navy: '#0F2C4A', navyM: '#FAF6F0', gold: '#D4AF37',
  goldBg: 'rgba(212,175,55,0.12)', border: 'rgba(15,44,74,0.12)',
  muted: '#1E3A5F', dim: '#64748B', red: '#DC2626', redBg: 'rgba(220,38,38,0.08)',
  success: '#10B981', successBg: 'rgba(16,185,129,0.1)', warning: '#F59E0B',
};

const TODAY = new Date();
const ALDI_HEARING = new Date('2026-05-05');
const FAIRWINDS_HEARING = new Date('2026-07-22');

function daysUntil(date) {
  return Math.ceil((date - TODAY) / (1000 * 60 * 60 * 24));
}

function CountdownRing({ days, total, color, size = 120 }) {
  const pct = Math.max(0, Math.min(1, days / total));
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * (1 - pct);

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EDE4D9" strokeWidth={10} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={10}
        strokeDasharray={circ} strokeDashoffset={dash} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fill={color} fontSize={24} fontWeight="800" style={{ transform: 'rotate(90deg)', transformOrigin: '50% 50%' }}>{days}</text>
    </svg>
  );
}

function CaseCard({ caseNum, claimNo, hearing, hearingLabel, defendants, claims, isUrgent, onAction, actions }) {
  const days = daysUntil(hearing);
  const totalDays = Math.ceil((hearing - new Date('2025-12-01')) / (1000 * 60 * 60 * 24));
  const color = days <= 14 ? T.red : days <= 60 ? T.warning : T.gold;

  return (
    <div style={{ background: 'white', borderRadius: 16, padding: 24, border: `2px solid ${isUrgent ? T.red : T.border}`, position: 'relative', overflow: 'hidden' }}>
      {isUrgent && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #DC2626, #ef4444)' }} />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
            {isUrgent && <span style={{ background: T.red, color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>🚨 URGENT</span>}
            <span style={{ background: T.goldBg, color: T.navy, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>{claimNo}</span>
          </div>
          <h3 style={{ margin: '0 0 4px', fontSize: 18, color: T.navy, fontWeight: 800 }}>{defendants}</h3>
          <div style={{ fontSize: 12, color: T.dim }}>{hearingLabel}</div>
          <div style={{ fontSize: 13, color: isUrgent ? T.red : T.gold, fontWeight: 700, marginTop: 4 }}>
            {hearing.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <CountdownRing days={days} total={totalDays} color={color} />
          <div style={{ fontSize: 10, color: T.dim, marginTop: -4 }}>days left</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {claims.map(c => (
          <span key={c} style={{ background: T.navyM, color: T.muted, fontSize: 11, padding: '3px 10px', borderRadius: 10 }}>{c}</span>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {actions.map(a => (
          <button key={a.label} onClick={() => onAction(a.id)}
            style={{ padding: '10px 12px', background: a.primary ? (isUrgent ? T.red : T.navy) : 'transparent', color: a.primary ? 'white' : T.muted, border: `1px solid ${a.primary ? 'transparent' : T.border}`, borderRadius: 8, fontSize: 12, fontWeight: a.primary ? 700 : 400, cursor: 'pointer', textAlign: 'center' }}>
            {a.icon} {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function CaseDashboard({ onNavigate }) {
  const aldiDays = daysUntil(ALDI_HEARING);
  const fairwindsDays = daysUntil(FAIRWINDS_HEARING);

  const navigate = onNavigate || (() => {});

  const PRIORITIES = [
    { done: false, text: `Generate Aldi Hearing Rush Pack – 5 May 2026 is ${aldiDays} days away`, urgent: true, action: 'rush-pack' },
    { done: false, text: 'Upload CCTV footage OO-1 (the key exculpatory evidence)', urgent: true, action: 'evidence-upload' },
    { done: false, text: 'Print and review Aldi witness statement', urgent: true, action: 'rush-pack' },
    { done: false, text: 'Confirm tribunal hearing details with court (date, room, bundles served)', urgent: true, action: null },
    { done: false, text: 'Upload Pancott letter to Fairwinds evidence vault', urgent: false, action: 'evidence-upload' },
    { done: false, text: 'Run contradiction analysis on 2 May 2024 Investigation Notes', urgent: false, action: 'contradictions' },
    { done: false, text: 'Complete Fairwinds timeline review', urgent: false, action: 'timeline' },
  ];

  const [checked, setChecked] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ujris3_priorities') || '[]'); } catch { return []; }
  });

  function toggleCheck(i) {
    const next = checked.includes(i) ? checked.filter(x => x !== i) : [...checked, i];
    setChecked(next);
    localStorage.setItem('ujris3_priorities', JSON.stringify(next));
  }

  return (
    <div style={{ background: T.cream, fontFamily: "'Inter', sans-serif" }}>

      {/* HEADER */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ color: T.navy, fontSize: 24, fontWeight: 800, margin: '0 0 4px' }}>Your Cases</h2>
        <p style={{ color: T.muted, fontSize: 13, margin: 0 }}>Onyedika Ojiaku · Two active cases · Today: {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      {/* URGENT ALERT */}
      {aldiDays <= 14 && (
        <div style={{ background: T.redBg, border: `2px solid ${T.red}`, borderRadius: 12, padding: '14px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>🚨</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: T.red }}>ALDI HEARING IN {aldiDays} DAYS – ACTION REQUIRED</div>
            <div style={{ fontSize: 12, color: T.red, marginTop: 2 }}>5 May 2026 · Claim 770MC038 · Generate your Rush Pack now</div>
          </div>
          <button onClick={() => navigate('rush-pack')} style={{ padding: '10px 20px', background: T.red, color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            Generate Rush Pack →
          </button>
        </div>
      )}

      {/* CASE CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20, marginBottom: 28 }}>
        <CaseCard
          claimNo="770MC038"
          defendants="Aldi · ASEL Security · SYP"
          hearingLabel="County Court"
          hearing={ALDI_HEARING}
          isUrgent={true}
          claims={['Assault','False Imprisonment','Police Collusion','Spoliation']}
          onAction={navigate}
          actions={[
            { id: 'rush-pack', label: 'Rush Pack', icon: '🖨', primary: true },
            { id: 'timeline', label: 'Timeline', icon: '📅', primary: false },
            { id: 'contradictions', label: 'Contradictions', icon: '⚠', primary: false },
            { id: 'evidence-upload', label: 'Upload Evidence', icon: '📎', primary: false },
          ]}
        />
        <CaseCard
          claimNo="6016884/2025"
          defendants="Fairwinds Health Care Ltd"
          hearingLabel="Employment Tribunal"
          hearing={FAIRWINDS_HEARING}
          isUrgent={false}
          claims={['Race Discrimination','Whistleblowing','Constructive Dismissal']}
          onAction={navigate}
          actions={[
            { id: 'rush-pack', label: 'Hearing Pack', icon: '🖨', primary: true },
            { id: 'timeline', label: 'Timeline', icon: '📅', primary: false },
            { id: 'contradictions', label: 'Anchor Lies', icon: '🎯', primary: false },
            { id: 'evidence-upload', label: 'Upload Evidence', icon: '📎', primary: false },
          ]}
        />
      </div>

      {/* PRIORITY CHECKLIST */}
      <div style={{ background: 'white', borderRadius: 12, padding: 20, border: `1px solid ${T.border}`, marginBottom: 20 }}>
        <h4 style={{ color: T.navy, margin: '0 0 12px', fontSize: 15, fontWeight: 700 }}>Priority Action List</h4>
        {PRIORITIES.map((item, i) => (
          <div key={i} onClick={() => { toggleCheck(i); if (item.action && !checked.includes(i)) navigate(item.action); }}
            style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: i < PRIORITIES.length - 1 ? `1px solid ${T.border}` : 'none', cursor: 'pointer' }}>
            <div style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${checked.includes(i) ? T.success : item.urgent ? T.red : T.border}`, background: checked.includes(i) ? T.success : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {checked.includes(i) && <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>✓</span>}
            </div>
            <div style={{ flex: 1, fontSize: 13, color: checked.includes(i) ? T.dim : T.navy, textDecoration: checked.includes(i) ? 'line-through' : 'none' }}>
              {item.urgent && !checked.includes(i) && <span style={{ color: T.red, fontWeight: 700, marginRight: 6 }}>URGENT</span>}
              {item.text}
            </div>
            {item.action && <span style={{ fontSize: 11, color: T.dim }}>→</span>}
          </div>
        ))}
      </div>

      {/* KEY EVIDENCE QUICK VIEW */}
      <div style={{ background: 'white', borderRadius: 12, padding: 20, border: `1px solid ${T.border}` }}>
        <h4 style={{ color: T.navy, margin: '0 0 12px', fontSize: 15, fontWeight: 700 }}>Key Evidence Quick Reference</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
          {[
            { ref: 'OO-1', case: 'Aldi', desc: 'CCTV – Disproves wheel basket', isKey: true },
            { ref: 'CO/0006726', case: 'Aldi', desc: 'Police complaint', isKey: false },
            { ref: 'SAR Response', case: 'Aldi', desc: 'Dashcam "lost" – SPOLIATION', isKey: true },
            { ref: 'THE ANCHOR LIE', case: 'Fairwinds', desc: '2 May 2024 – "No supervisions"', isKey: true },
            { ref: 'Pancott Letter', case: 'Fairwinds', desc: '6 May 2025 – False certification', isKey: true },
            { ref: 'GFC-00014695', case: 'Fairwinds', desc: 'CQC referral – Protected disclosure', isKey: false },
          ].map(ev => (
            <div key={ev.ref} style={{ padding: '10px 14px', borderRadius: 8, border: `1px solid ${ev.isKey ? T.navy : T.border}`, background: ev.isKey ? T.navyM : 'transparent' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: ev.case === 'Aldi' ? T.red : T.gold }}>{ev.case}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.navy, margin: '2px 0' }}>{ev.ref}</div>
              <div style={{ fontSize: 11, color: T.dim }}>{ev.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
