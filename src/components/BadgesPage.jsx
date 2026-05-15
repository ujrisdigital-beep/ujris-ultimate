import React, { useState, useEffect } from 'react';

const T = {
  navy: '#0D1B2A', navyMid: '#152438', navyLight: '#1E3A5F',
  gold: '#C9A84C', goldLight: 'rgba(201,168,76,0.15)',
  teal: '#0C7B7A', tealLight: 'rgba(12,123,122,0.15)',
  white: '#EEF2F7', muted: '#7A8FA6',
  border: 'rgba(255,255,255,0.08)',
  red: '#E53E3E', redLight: 'rgba(229,62,62,0.15)',
  green: '#38A169', greenLight: 'rgba(56,161,105,0.15)',
  purple: '#805AD5', purpleLight: 'rgba(128,90,213,0.15)',
};

const ALL_BADGES = [
  // Earned
  { id: 'first_step', icon: '🌟', name: 'First Step', desc: 'Joined UJRIS — began your justice journey', category: 'Journey', earned: true, earnedDate: '2026-04-01', points: 10 },
  // Not yet
  { id: 'evidence_filed', icon: '📎', name: 'Evidence Filed', desc: 'Upload your first piece of evidence', category: 'Evidence', earned: false, progress: 0, goal: 1, points: 25 },
  { id: 'timeline_built', icon: '📅', name: 'Timeline Builder', desc: 'Add 5 events to your case timeline', category: 'Evidence', earned: false, progress: 0, goal: 5, points: 30 },
  { id: 'sar_sent', icon: '📂', name: 'SAR Sent', desc: 'Submit a Subject Access Request via UJRIS', category: 'Evidence', earned: false, progress: 0, goal: 1, points: 40 },
  { id: 'contradiction_found', icon: '⚠️', name: 'Contradiction Caught', desc: 'Flag your first contradiction in the Contradiction Report', category: 'Evidence', earned: false, progress: 0, goal: 1, points: 35 },
  { id: 'hearing_ready', icon: '🚨', name: 'Hearing Ready', desc: 'Complete a Hearing Rush Pack', category: 'Legal', earned: false, progress: 0, goal: 1, points: 50 },
  { id: 'know_rights', icon: '⚖️', name: 'Rights Aware', desc: 'Ask 10 questions in Know Your Rights', category: 'Legal', earned: false, progress: 0, goal: 10, points: 30 },
  { id: 'deadline_set', icon: '⏰', name: 'Deadline Set', desc: 'Add 3 deadlines to the Deadlines Centre', category: 'Legal', earned: false, progress: 0, goal: 3, points: 20 },
  { id: 'action_done', icon: '✅', name: 'Action Complete', desc: 'Mark 5 actions as done', category: 'Legal', earned: false, progress: 0, goal: 5, points: 25 },
  { id: 'community_post', icon: '👥', name: 'Voice Heard', desc: 'Post your first message in Community Forums', category: 'Community', earned: false, progress: 0, goal: 1, points: 20 },
  { id: 'community_reply', icon: '💬', name: 'Supporter', desc: 'Reply to 3 community members', category: 'Community', earned: false, progress: 0, goal: 3, points: 25 },
  { id: 'wellbeing_journal', icon: '💚', name: 'Wellbeing Logger', desc: 'Log your wellbeing for 7 consecutive days', category: 'Wellbeing', earned: false, progress: 0, goal: 7, points: 35 },
  { id: 'forensic_run', icon: '🔬', name: 'Forensic Mind', desc: 'Run a Forensic Analysis on your documents', category: 'Evidence', earned: false, progress: 0, goal: 1, points: 40 },
  { id: 'email_sent', icon: '📧', name: 'Letter Sent', desc: 'Dispatch a legal letter via Email Dispatch Centre', category: 'Legal', earned: false, progress: 0, goal: 1, points: 30 },
  { id: 'victory', icon: '🏆', name: 'Justice Served', desc: 'Record a positive outcome in Case Manager', category: 'Victory', earned: false, progress: 0, goal: 1, points: 200 },
];

const CATEGORIES = ['All', 'Journey', 'Evidence', 'Legal', 'Community', 'Wellbeing', 'Victory'];

const STREAKS = { current: 3, longest: 7, totalDays: 28 };

function BadgeCard({ badge, onClick }) {
  return (
    <div onClick={() => onClick(badge)} style={{
      background: badge.earned ? T.navyLight : T.navyMid,
      border: `1px solid ${badge.earned ? T.gold : T.border}`,
      borderRadius: 14, padding: '20px 16px', textAlign: 'center', cursor: 'pointer',
      transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${badge.earned ? 'rgba(201,168,76,0.2)' : 'rgba(0,0,0,0.3)'}` }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
    >
      {badge.earned && (
        <div style={{ position: 'absolute', top: 8, right: 8, background: T.gold, color: T.navy, fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 4, letterSpacing: '0.05em' }}>EARNED</div>
      )}
      <div style={{ fontSize: 36, marginBottom: 8, filter: badge.earned ? 'none' : 'grayscale(80%) opacity(0.4)' }}>{badge.icon}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: badge.earned ? T.gold : T.muted, marginBottom: 4 }}>{badge.name}</div>
      <div style={{ fontSize: 10, color: T.muted, lineHeight: 1.4, marginBottom: badge.earned ? 0 : 8 }}>{badge.desc}</div>
      {!badge.earned && badge.progress !== undefined && (
        <div style={{ marginTop: 8 }}>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: `${(badge.progress / badge.goal) * 100}%`, height: '100%', background: T.teal, borderRadius: 2 }} />
          </div>
          <div style={{ fontSize: 10, color: T.muted, marginTop: 4 }}>{badge.progress}/{badge.goal}</div>
        </div>
      )}
      <div style={{ marginTop: 8, fontSize: 10, color: badge.earned ? T.gold : 'rgba(201,168,76,0.4)', fontWeight: 700 }}>+{badge.points} pts</div>
    </div>
  );
}

export default function BadgesPage() {
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState(null);

  const earnedCount = ALL_BADGES.filter(b => b.earned).length;
  const totalPoints = ALL_BADGES.filter(b => b.earned).reduce((s, b) => s + b.points, 0);
  const pct = Math.round((earnedCount / ALL_BADGES.length) * 100);

  const visible = filter === 'All' ? ALL_BADGES : ALL_BADGES.filter(b => b.category === filter);

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: T.white, fontFamily: "'Playfair Display', serif", fontSize: 26, margin: 0 }}>
          🏅 Justice Journey
        </h1>
        <p style={{ color: T.muted, margin: '6px 0 0', fontSize: 13 }}>Earn badges as you build your case. Every action you take is evidence of your commitment to justice.</p>
      </div>

      {/* Progress overview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14, marginBottom: 28 }}>
        <div style={{ background: T.navyMid, border: `1px solid ${T.gold}`, borderRadius: 14, padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: T.gold, fontFamily: 'serif' }}>{earnedCount}/{ALL_BADGES.length}</div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>Badges Earned</div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden', marginTop: 10 }}>
            <div style={{ width: `${pct}%`, height: '100%', background: T.gold, borderRadius: 2 }} />
          </div>
          <div style={{ fontSize: 10, color: T.gold, marginTop: 4 }}>{pct}% complete</div>
        </div>
        <div style={{ background: T.navyMid, border: `1px solid ${T.border}`, borderRadius: 14, padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: T.teal, fontFamily: 'serif' }}>{totalPoints}</div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>Justice Points</div>
          <div style={{ fontSize: 10, color: T.teal, marginTop: 6 }}>Level: Seeker</div>
        </div>
        <div style={{ background: T.navyMid, border: `1px solid ${T.border}`, borderRadius: 14, padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: T.white, fontFamily: 'serif' }}>{STREAKS.current}🔥</div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>Day Streak</div>
          <div style={{ fontSize: 10, color: T.muted, marginTop: 6 }}>Best: {STREAKS.longest} days</div>
        </div>
        <div style={{ background: T.navyMid, border: `1px solid ${T.border}`, borderRadius: 14, padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: T.purple, fontFamily: 'serif' }}>{STREAKS.totalDays}</div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>Days Active</div>
          <div style={{ fontSize: 10, color: T.muted, marginTop: 6 }}>Since April 2026</div>
        </div>
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)} style={{
            padding: '7px 16px', borderRadius: 8, border: `1px solid ${filter === cat ? T.gold : T.border}`,
            background: filter === cat ? T.goldLight : 'transparent', color: filter === cat ? T.gold : T.muted,
            cursor: 'pointer', fontSize: 12, fontWeight: 600,
          }}>{cat}</button>
        ))}
      </div>

      {/* Badge grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14 }}>
        {visible.map(b => <BadgeCard key={b.id} badge={b} onClick={setSelected} />)}
      </div>

      {/* Detail modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}
          onClick={() => setSelected(null)}>
          <div style={{ background: T.navyMid, border: `1px solid ${selected.earned ? T.gold : T.border}`, borderRadius: 20, padding: 36, maxWidth: 380, width: '90%', textAlign: 'center' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 56, marginBottom: 16, filter: selected.earned ? 'none' : 'grayscale(60%)' }}>{selected.icon}</div>
            <h2 style={{ color: selected.earned ? T.gold : T.white, fontSize: 20, fontFamily: "'Playfair Display', serif", margin: '0 0 8px' }}>{selected.name}</h2>
            <p style={{ color: T.muted, fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>{selected.desc}</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 20 }}>
              <span style={{ background: T.goldLight, color: T.gold, padding: '4px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>+{selected.points} pts</span>
              <span style={{ background: T.navyLight, color: T.muted, padding: '4px 14px', borderRadius: 8, fontSize: 12 }}>{selected.category}</span>
            </div>
            {selected.earned
              ? <div style={{ color: T.teal, fontSize: 13, fontWeight: 700 }}>✅ Earned {selected.earnedDate}</div>
              : (
                <div>
                  {selected.goal && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${(selected.progress / selected.goal) * 100}%`, height: '100%', background: T.teal, borderRadius: 3 }} />
                      </div>
                      <div style={{ fontSize: 11, color: T.muted, marginTop: 6 }}>{selected.progress} of {selected.goal} required</div>
                    </div>
                  )}
                  <div style={{ color: T.muted, fontSize: 12 }}>🔒 Not yet earned — keep going!</div>
                </div>
              )}
            <button onClick={() => setSelected(null)} style={{ marginTop: 20, background: T.gold, color: T.navy, border: 'none', borderRadius: 10, padding: '10px 28px', fontWeight: 700, cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}

      {/* Encouragement strip */}
      <div style={{ marginTop: 28, background: T.tealLight, border: `1px solid ${T.teal}`, borderRadius: 12, padding: '16px 20px', textAlign: 'center' }}>
        <div style={{ color: T.teal, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Every badge you earn is evidence of your fight for justice.</div>
        <div style={{ color: T.muted, fontSize: 12 }}>
          Your persistence is your power. {ALL_BADGES.length - earnedCount} badges left to unlock — keep building your case.
        </div>
      </div>
    </div>
  );
}
