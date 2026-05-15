import React, { useState, useEffect } from 'react';

const T = {
  navy: '#0D1B2A', navyMid: '#152438', navyLight: '#1E3A5F',
  gold: '#C9A84C', goldLight: 'rgba(201,168,76,0.15)',
  teal: '#0C7B7A', tealLight: 'rgba(12,123,122,0.15)',
  white: '#EEF2F7', muted: '#7A8FA6',
  border: 'rgba(255,255,255,0.08)', borderSolid: 'rgba(255,255,255,0.12)',
  red: '#E53E3E', redLight: 'rgba(229,62,62,0.15)',
  green: '#38A169', greenLight: 'rgba(56,161,105,0.15)',
};

const CASES = [
  { id: 'aldi', title: 'Aldi Stores Ltd', ref: '770MC038', hearingDate: '2026-05-05', icon: '🛒', strength: 74, stage: 'Pre-Hearing' },
  { id: 'fairwinds', title: 'Fairwinds Health Care Ltd', ref: '6016884/2025', hearingDate: '2026-07-22', icon: '🏥', strength: 58, stage: 'Disclosure' },
];

function daysUntil(d) { return Math.ceil((new Date(d) - new Date()) / 86400000); }

function GaugeMeter({ value, size = 140 }) {
  const r = size / 2 - 14;
  const circ = Math.PI * r;
  const pct = Math.min(100, Math.max(0, value));
  const offset = circ * (1 - pct / 100);
  const color = pct >= 70 ? T.teal : pct >= 45 ? T.gold : T.red;
  return (
    <svg width={size} height={size / 2 + 20} style={{ overflow: 'visible' }}>
      <path d={`M ${14} ${size / 2} A ${r} ${r} 0 0 1 ${size - 14} ${size / 2}`}
        fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={10} strokeLinecap="round" />
      <path d={`M ${14} ${size / 2} A ${r} ${r} 0 0 1 ${size - 14} ${size / 2}`}
        fill="none" stroke={color} strokeWidth={10} strokeLinecap="round"
        strokeDasharray={`${circ} ${circ}`} strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 1.2s ease, stroke 0.6s ease' }} />
      <text x={size / 2} y={size / 2 + 2} textAnchor="middle" fill={color} fontSize={26} fontWeight={800} fontFamily="serif">{pct}%</text>
      <text x={size / 2} y={size / 2 + 18} textAnchor="middle" fill={T.muted} fontSize={10} fontFamily="sans-serif">CASE STRENGTH</text>
    </svg>
  );
}

function StatCard({ label, value, sub, color, icon }) {
  return (
    <div style={{ background: T.navyMid, border: `1px solid ${T.border}`, borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ fontSize: 28 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 800, color: color || T.white, fontFamily: 'serif', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: 10, color: color || T.teal, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

function TimelineBar({ label, pct, color }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: T.muted }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color }}>{pct}%</span>
      </div>
      <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 1s ease' }} />
      </div>
    </div>
  );
}

export default function KPILive({ activeCase: propCase }) {
  const [view, setView] = useState('case');
  const [activeCaseId, setActiveCaseId] = useState(propCase?.id || 'aldi');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const caseData = CASES.find(c => c.id === activeCaseId) || CASES[0];
  const days = daysUntil(caseData.hearingDate);
  const evidenceCount = parseInt(localStorage.getItem('ujris_evidence_count') || '23');
  const actionsCount = parseInt(localStorage.getItem('ujris_actions_count') || '14');
  const deadlinesCount = parseInt(localStorage.getItem('ujris_deadlines_count') || '8');
  const strengthColor = caseData.strength >= 70 ? T.teal : caseData.strength >= 45 ? T.gold : T.red;

  const strengthFactors = [
    { label: 'Evidence Volume & Quality', pct: 82, color: T.teal },
    { label: 'Legal Framework Alignment', pct: 74, color: T.gold },
    { label: 'Timeline Integrity', pct: 68, color: T.gold },
    { label: 'Witness Corroboration', pct: 45, color: T.red },
    { label: 'Documentation Completeness', pct: 91, color: T.teal },
  ];

  const platformStats = [
    { label: 'Cases on UJRIS', value: '2,847', icon: '📂', color: T.gold },
    { label: 'Documents Analysed', value: '48,219', icon: '📄', color: T.teal },
    { label: 'Hearings Prepared', value: '1,203', icon: '⚖️', color: T.white },
    { label: 'Community Members', value: '9,441', icon: '👥', color: T.gold },
    { label: 'Avg Case Strength', value: '63%', icon: '💪', color: T.teal },
    { label: 'Settlements Supported', value: '318', icon: '🏆', color: T.green },
  ];

  const tab = (id, label) => (
    <button onClick={() => setView(id)} style={{
      padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
      background: view === id ? T.gold : 'transparent', color: view === id ? T.navy : T.muted,
      transition: 'all 0.2s',
    }}>{label}</button>
  );

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: T.white, fontFamily: "'Playfair Display', serif", fontSize: 26, margin: 0 }}>
          📊 KPI Live
        </h1>
        <p style={{ color: T.muted, margin: '6px 0 0', fontSize: 13 }}>Real-time intelligence across your cases and the UJRIS platform</p>
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 4, background: T.navyMid, borderRadius: 10, padding: 4, width: 'fit-content', marginBottom: 28, border: `1px solid ${T.border}` }}>
        {tab('case', 'My Case')}
        {tab('platform', 'Platform Stats')}
      </div>

      {view === 'case' && (
        <>
          {/* Case selector */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
            {CASES.map(c => (
              <button key={c.id} onClick={() => setActiveCaseId(c.id)} style={{
                padding: '10px 18px', borderRadius: 10, border: `1px solid ${activeCaseId === c.id ? T.gold : T.border}`,
                background: activeCaseId === c.id ? T.goldLight : T.navyMid, color: activeCaseId === c.id ? T.gold : T.muted,
                cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span>{c.icon}</span><span>{c.title}</span>
              </button>
            ))}
          </div>

          {/* Main KPI panel */}
          <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 20, marginBottom: 24 }}>
            {/* Gauge */}
            <div style={{ background: T.navyMid, border: `1px solid ${T.border}`, borderRadius: 16, padding: '28px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <GaugeMeter value={caseData.strength} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: strengthColor, fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                  {caseData.strength >= 70 ? '✅ Strong Position' : caseData.strength >= 45 ? '⚠️ Moderate — Action Required' : '🔴 Needs Reinforcement'}
                </div>
                <div style={{ color: T.muted, fontSize: 11 }}>Based on {strengthFactors.length} weighted indicators</div>
              </div>
              <div style={{ width: '100%', background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px 14px' }}>
                <div style={{ color: T.muted, fontSize: 10, letterSpacing: '0.1em', marginBottom: 6 }}>CASE REF</div>
                <div style={{ color: T.white, fontSize: 12, fontWeight: 700 }}>{caseData.ref}</div>
                <div style={{ color: T.muted, fontSize: 11, marginTop: 2 }}>{caseData.stage}</div>
              </div>
            </div>

            {/* Strength breakdown */}
            <div style={{ background: T.navyMid, border: `1px solid ${T.border}`, borderRadius: 16, padding: '24px 28px' }}>
              <div style={{ color: T.gold, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 16 }}>STRENGTH INDICATORS</div>
              {strengthFactors.map(f => <TimelineBar key={f.label} {...f} />)}
              <div style={{ marginTop: 16, padding: '12px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: 8, fontSize: 12, color: T.muted }}>
                💡 Improve your score by adding witness statements and uploading additional contemporaneous evidence.
              </div>
            </div>
          </div>

          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
            <StatCard label="Days to Hearing" value={`${days}d`} icon="⏳" color={days <= 30 ? T.red : T.gold} sub={new Date(caseData.hearingDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} />
            <StatCard label="Evidence Items" value={evidenceCount} icon="📎" color={T.teal} sub="Across all categories" />
            <StatCard label="Open Actions" value={actionsCount} icon="✅" color={T.gold} sub="3 high priority" />
            <StatCard label="Active Deadlines" value={deadlinesCount} icon="⏰" color={T.red} sub="2 within 7 days" />
          </div>

          {/* Hearing countdown visual */}
          <div style={{ background: T.navyMid, border: `1px solid ${days <= 30 ? T.red : T.border}`, borderRadius: 16, padding: '20px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ color: T.white, fontSize: 14, fontWeight: 700 }}>Hearing Countdown — {caseData.title}</div>
              <div style={{ background: days <= 30 ? T.redLight : T.goldLight, color: days <= 30 ? T.red : T.gold, border: `1px solid ${days <= 30 ? T.red : T.gold}`, borderRadius: 8, padding: '4px 14px', fontSize: 12, fontWeight: 700 }}>
                {days}d REMAINING
              </div>
            </div>
            <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, ((180 - days) / 180) * 100)}%`, height: '100%', background: days <= 30 ? T.red : T.gold, borderRadius: 4, transition: 'width 1s ease' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ fontSize: 10, color: T.muted }}>Case Filed</span>
              <span style={{ fontSize: 10, color: T.muted }}>Hearing: {new Date(caseData.hearingDate).toLocaleDateString('en-GB')}</span>
            </div>
          </div>
        </>
      )}

      {view === 'platform' && (
        <>
          <div style={{ marginBottom: 20, padding: '12px 20px', background: T.tealLight, border: `1px solid ${T.teal}`, borderRadius: 10, fontSize: 12, color: T.teal }}>
            🌐 Platform statistics update every 30 minutes. These figures represent all UJRIS users collectively.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
            {platformStats.map(s => <StatCard key={s.label} {...s} />)}
          </div>

          <div style={{ background: T.navyMid, border: `1px solid ${T.border}`, borderRadius: 16, padding: '24px 28px' }}>
            <div style={{ color: T.gold, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 16 }}>CLAIM TYPE BREAKDOWN — PLATFORM WIDE</div>
            {[
              { label: 'Race Discrimination', pct: 38, color: T.gold },
              { label: 'Disability Discrimination', pct: 27, color: T.teal },
              { label: 'Sex/Gender Discrimination', pct: 19, color: '#8B5CF6' },
              { label: 'Whistleblowing (PIDA)', pct: 10, color: T.red },
              { label: 'Other Protected Characteristics', pct: 6, color: T.muted },
            ].map(f => <TimelineBar key={f.label} {...f} />)}
          </div>
        </>
      )}
    </div>
  );
}
