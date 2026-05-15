import React, { useState } from 'react';

const T = {
  navy: '#0D1B2A', navyMid: '#152438', navyLight: '#1E3A5F',
  gold: '#C9A84C', goldLight: 'rgba(201,168,76,0.15)',
  teal: '#0C7B7A', tealLight: 'rgba(12,123,122,0.15)',
  white: '#EEF2F7', muted: '#7A8FA6', border: 'rgba(255,255,255,0.08)',
  red: '#E53E3E', redLight: 'rgba(229,62,62,0.15)',
  orange: '#D97706',
};

function daysUntil(d) { return Math.ceil((new Date(d) - new Date()) / 86400000); }

const ALL_CASES = [
  {
    id: 'aldi', icon: '🛒', title: 'Aldi Stores Ltd', ref: '770MC038', type: 'County Court', venue: 'Manchester County Court',
    hearingDate: '2026-05-05', status: 'active', stage: 'Pre-Hearing', priority: 'critical',
    discriminationTypes: ['Assault', 'False Imprisonment', 'Police Collusion', 'Spoliation'],
    attention: ['Witness statements due — 7 days', 'Bundle submission overdue', 'CCTV not yet analysed'],
    progress: 68,
  },
  {
    id: 'fairwinds', icon: '🏥', title: 'Fairwinds Health Care Ltd', ref: '6016884/2025', type: 'Employment Tribunal', venue: 'Manchester ET',
    hearingDate: '2026-07-22', status: 'active', stage: 'Case Management', priority: 'high',
    discriminationTypes: ['Race Discrimination', 'Whistleblowing', 'Constructive Dismissal'],
    attention: ['Comparator evidence needed', 'Vento calculation to update'],
    progress: 42,
  },
];

const URGENCY_CONFIG = {
  critical: { label: 'Critical', color: T.red, bg: T.redLight },
  high: { label: 'High Priority', color: T.orange, bg: 'rgba(217,119,6,0.15)' },
  medium: { label: 'Medium', color: T.gold, bg: T.goldLight },
  low: { label: 'Low', color: T.muted, bg: 'rgba(122,143,166,0.1)' },
};

export default function CommandCentre({ onNavigate }) {
  const [view, setView] = useState('grid');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = ALL_CASES.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.title.toLowerCase().includes(q) || c.ref.includes(q);
    const matchFilter = filter === 'all' || c.priority === filter;
    return matchSearch && matchFilter;
  });

  const totalAttention = ALL_CASES.reduce((a, c) => a + (c.attention?.length || 0), 0);

  return (
    <div style={{ minHeight: '100vh', background: T.navy, color: T.white, fontFamily: "'Source Serif 4', Georgia, serif" }}>
      <div style={{ background: T.navyMid, borderBottom: `1px solid ${T.border}`, padding: '24px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontFamily: "'Playfair Display', Georgia, serif", color: T.gold }}>🎯 Command Centre</h1>
            <p style={{ margin: '4px 0 0', color: T.muted, fontSize: 13 }}>All-cases overview — active matters, alerts, and status</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['grid', 'list'].map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: '7px 14px', borderRadius: 8, border: `1px solid ${view === v ? T.gold : T.border}`,
                background: view === v ? T.goldLight : 'transparent', color: view === v ? T.gold : T.muted, cursor: 'pointer', fontSize: 13,
              }}>{v === 'grid' ? '⊞ Grid' : '☰ List'}</button>
            ))}
          </div>
        </div>

        {/* Summary Metrics */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'Active Cases', value: ALL_CASES.filter(c => c.status === 'active').length, color: T.white },
            { label: 'Attention Items', value: totalAttention, color: T.red },
            { label: 'Next Hearing', value: '5 May', color: T.gold },
            { label: 'Days to Aldi', value: daysUntil('2026-05-05'), color: T.red },
          ].map(m => (
            <div key={m.label} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 18px' }}>
              <div style={{ color: m.color, fontWeight: 900, fontSize: 20, fontFamily: "'Playfair Display', Georgia, serif" }}>{m.value}</div>
              <div style={{ color: T.muted, fontSize: 11 }}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div style={{ display: 'flex', gap: 12 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search cases..."
            style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: `1px solid ${T.border}`, borderRadius: 8, color: T.white, padding: '8px 14px', fontSize: 13 }} />
          <div style={{ display: 'flex', gap: 6 }}>
            {['all', 'critical', 'high'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '7px 14px', borderRadius: 8, border: `1px solid ${filter === f ? T.gold : T.border}`,
                background: filter === f ? T.goldLight : 'transparent', color: filter === f ? T.gold : T.muted, cursor: 'pointer', fontSize: 12, textTransform: 'capitalize',
              }}>{f === 'all' ? 'All' : f}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Attention Panel */}
      {totalAttention > 0 && (
        <div style={{ background: T.redLight, borderBottom: `1px solid ${T.red}`, padding: '12px 32px' }}>
          <div style={{ color: T.red, fontWeight: 700, fontSize: 13, marginBottom: 8 }}>🚨 Attention Required ({totalAttention} items)</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {ALL_CASES.flatMap(c => (c.attention || []).map(a => (
              <div key={a} style={{ background: 'rgba(229,62,62,0.15)', border: `1px solid ${T.red}44`, borderRadius: 6, padding: '4px 10px', fontSize: 12, color: T.red }}>
                <span style={{ color: T.muted, marginRight: 4 }}>{c.icon}</span>{a}
              </div>
            )))}
          </div>
        </div>
      )}

      <div style={{ padding: '24px 32px' }}>
        <div style={{ display: view === 'grid' ? 'grid' : 'flex', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', flexDirection: view === 'list' ? 'column' : undefined, gap: 20 }}>
          {filtered.map(c => {
            const days = daysUntil(c.hearingDate);
            const uc = URGENCY_CONFIG[c.priority];
            return (
              <div key={c.id} style={{ background: T.navyMid, border: `2px solid ${days <= 30 ? T.red : T.border}`, borderRadius: 16, padding: 24, position: 'relative', overflow: 'hidden' }}>
                {days <= 30 && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${T.red}, #ef4444)` }} />}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 32, marginBottom: 4 }}>{c.icon}</div>
                    <div style={{ color: T.white, fontWeight: 700, fontSize: 17, fontFamily: "'Playfair Display', Georgia, serif" }}>{c.title}</div>
                    <div style={{ color: T.gold, fontSize: 12, marginTop: 2 }}>{c.ref} · {c.type}</div>
                  </div>
                  <div style={{ textAlign: 'center', background: `${days <= 30 ? T.red : T.teal}22`, borderRadius: 10, padding: '10px 14px', minWidth: 70 }}>
                    <div style={{ color: days <= 30 ? T.red : T.teal, fontWeight: 900, fontSize: 26, fontFamily: "'Playfair Display', Georgia, serif" }}>{days}</div>
                    <div style={{ color: days <= 30 ? T.red : T.teal, fontSize: 9, fontWeight: 700 }}>DAYS</div>
                  </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ color: T.muted, fontSize: 11, marginBottom: 6 }}>CLAIM TYPES</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {c.discriminationTypes.map(d => (
                      <span key={d} style={{ background: T.navyLight, color: T.muted, fontSize: 10, padding: '3px 8px', borderRadius: 6 }}>{d}</span>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: T.muted, fontSize: 11 }}>Case Progress</span>
                    <span style={{ color: T.gold, fontSize: 11, fontWeight: 700 }}>{c.progress}%</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${c.progress}%`, height: '100%', background: T.gold, borderRadius: 3, transition: 'width 1s ease' }} />
                  </div>
                </div>

                {c.attention && c.attention.length > 0 && (
                  <div style={{ background: T.redLight, border: `1px solid ${T.red}44`, borderRadius: 8, padding: 10, marginBottom: 16 }}>
                    {c.attention.map(a => (
                      <div key={a} style={{ color: T.red, fontSize: 12, display: 'flex', gap: 6, marginBottom: 2 }}>
                        <span>⚠️</span><span>{a}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 6, flex: 1, flexWrap: 'wrap' }}>
                    {[
                      { label: '📅 Timeline', tab: 'timeline' },
                      { label: '📎 Evidence', tab: 'evidence' },
                      { label: '🚨 Rush Pack', tab: 'hearing-pack' },
                    ].map(btn => (
                      <button key={btn.tab} onClick={() => onNavigate && onNavigate(btn.tab)} style={{
                        padding: '7px 12px', background: 'rgba(255,255,255,0.06)', border: `1px solid ${T.border}`,
                        borderRadius: 6, color: T.muted, cursor: 'pointer', fontSize: 12,
                      }}>{btn.label}</button>
                    ))}
                  </div>
                  <span style={{ background: uc.bg, color: uc.color, fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 10, alignSelf: 'flex-start', marginTop: 4 }}>{uc.label.toUpperCase()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
