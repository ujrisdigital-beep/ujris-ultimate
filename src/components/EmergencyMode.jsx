import React, { useState, useEffect } from 'react';
import { getCurrentUser, getAuthHeader } from '../lib/supabase';

const T = {
  cream: '#F8F1E9', navy: '#0F2C4A', navyM: '#FAF6F0', gold: '#D4AF37',
  goldBg: 'rgba(212,175,55,0.12)', border: 'rgba(15,44,74,0.12)',
  muted: '#1E3A5F', dim: '#64748B', red: '#DC2626', redBg: 'rgba(220,38,38,0.08)',
  success: '#10B981', successBg: 'rgba(16,185,129,0.1)', warning: '#F59E0B',
};

const LEVEL_CONFIG = {
  1: { color: T.success, bg: T.successBg, label: 'Level 1 – Preparation', icon: '📋', border: T.success },
  2: { color: T.warning, bg: 'rgba(245,158,11,0.1)', label: 'Level 2 – Urgent Action', icon: '⚠', border: T.warning },
  3: { color: T.red, bg: T.redBg, label: 'Level 3 – Critical', icon: '🚨', border: T.red },
  4: { color: T.red, bg: T.redBg, label: 'Level 4 – EMERGENCY', icon: '🔴', border: T.red },
};

const EMERGENCY_SCRIPTS = [
  {
    title: 'Adjournment Request Script',
    content: `"I am a litigant in person. I am applying under Rule 30 of the Employment Tribunal Procedure Rules for an adjournment on the grounds that [state your reason]. I have not been able to obtain legal representation due to [funding/time constraints]. The interests of justice require that I be given adequate time to prepare."`,
  },
  {
    title: 'Evidence Objection Script',
    content: `"I object to this document being admitted as it was not included in the agreed bundle served by [date]. Under Rule 41, the Tribunal has discretion to exclude late evidence that would cause prejudice to the other party. I respectfully ask the Tribunal to exercise that discretion."`,
  },
  {
    title: 'Witness Summons Script',
    content: `"I make this application under Rule 32 for a witness summons requiring [name/role] to attend. This witness has direct knowledge of the matters in issue and their evidence is essential to the fair determination of this case."`,
  },
  {
    title: 'Opening Statement Scaffold',
    content: `"This is a claim of [type of claim] under the [Equality Act 2010 / ERA 1996]. I am the Claimant. I am representing myself. The key issue before the Tribunal is [state issue]. The Respondent is [employer name]. The relevant period is [dates]. I intend to call [X] witnesses including myself. My core evidence is at Bundle pages [X–Y]."`,
  },
];

export default function EmergencyMode() {
  const [hearingDate, setHearingDate] = useState('');
  const [escalation, setEscalation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('status');
  const [matchedHelpers, setMatchedHelpers] = useState([]);

  useEffect(() => { getCurrentUser().then(u => setUser(u)); }, []);

  async function checkStatus() {
    if (!hearingDate) return;
    setLoading(true);
    try {
      const headers = { ...(await getAuthHeader()), 'Content-Type': 'application/json' };
      const activeCaseId = localStorage.getItem('ujris3_activeCaseId')?.replace(/"/g, '') || 'demo';
      const res = await fetch('/api/emergency', {
        method: 'POST',
        headers,
        body: JSON.stringify({ caseId: activeCaseId, hearingDate }),
      });
      if (res.ok) {
        const data = await res.json();
        setEscalation(data);
        if (data.protocol?.matchedHelpers?.length > 0) setMatchedHelpers(data.protocol.matchedHelpers);
      } else {
        const daysUntilHearing = Math.ceil((new Date(hearingDate) - new Date()) / (1000 * 60 * 60 * 24));
        const level = daysUntilHearing <= 3 ? 4 : daysUntilHearing <= 7 ? 3 : daysUntilHearing <= 14 ? 2 : 1;
        setEscalation({ level, daysUntilHearing, protocol: { actions: getLocalActions(level) } });
      }
    } catch (e) {
      const daysUntilHearing = Math.ceil((new Date(hearingDate) - new Date()) / (1000 * 60 * 60 * 24));
      const level = daysUntilHearing <= 3 ? 4 : daysUntilHearing <= 7 ? 3 : daysUntilHearing <= 14 ? 2 : 1;
      setEscalation({ level, daysUntilHearing, protocol: { actions: getLocalActions(level) } });
    }
    setLoading(false);
  }

  function getLocalActions(level) {
    const actions = {
      1: ['Review evidence bundle','Confirm ET1 is filed','Check ACAS certificate','Draft witness statement outline'],
      2: ['Complete witness statement now','Prepare document bundle','Draft schedule of loss','Contact ACAS','Review similar cases'],
      3: ['Finalise all documents TODAY','Serve bundle on respondent','Contact tribunal','Request helper match','Download emergency scripts','Prepare opening statement'],
      4: ['Contact solicitor IMMEDIATELY','Request emergency adjournment','Ensure all bundles served','Have emergency scripts ready','Call UJRIS: support@ujris.co.uk'],
    };
    return actions[level] || [];
  }

  const cfg = escalation ? LEVEL_CONFIG[escalation.level] || LEVEL_CONFIG[1] : null;

  return (
    <div style={{ background: T.cream, fontFamily: "'Inter', sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #DC2626, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🛡</div>
          <h2 style={{ color: T.navy, fontSize: 22, fontWeight: 700, margin: 0 }}>Emergency Mode – Legal 911</h2>
        </div>
        <p style={{ color: T.muted, fontSize: 13, margin: 0 }}>Hearing in less than 7 days? Activate Emergency Mode for automatic escalation and priority helper matching.</p>
      </div>

      <div style={{ background: 'white', borderRadius: 12, padding: 24, border: `1px solid ${T.border}`, marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 12, color: T.dim, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Hearing Date</label>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input type="date" value={hearingDate} onChange={e => setHearingDate(e.target.value)} min={new Date().toISOString().split('T')[0]}
            style={{ padding: '12px 16px', borderRadius: 8, border: `2px solid ${T.border}`, fontSize: 16, fontFamily: 'inherit', flex: 1 }} />
          <button onClick={checkStatus} disabled={loading || !hearingDate}
            style={{ padding: '12px 24px', background: loading ? T.dim : T.red, color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>
            {loading ? 'Checking...' : 'Activate Emergency Mode'}
          </button>
        </div>
      </div>

      {escalation && (
        <div>
          <div style={{ background: cfg.bg, borderRadius: 12, padding: 24, border: `2px solid ${cfg.border}`, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 32 }}>{cfg.icon}</span>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: cfg.color }}>{cfg.label}</div>
                <div style={{ fontSize: 14, color: T.muted }}>
                  {escalation.daysUntilHearing <= 0 ? 'HEARING IS TODAY' : `${escalation.daysUntilHearing} day${escalation.daysUntilHearing === 1 ? '' : 's'} until hearing`}
                </div>
              </div>
            </div>

            {escalation.level >= 3 && (
              <div style={{ background: 'rgba(220,38,38,0.15)', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 13, fontWeight: 600, color: T.red }}>
                ⚡ Priority helper matching activated. A verified legal helper will be notified.
              </div>
            )}
            {escalation.level === 4 && (
              <div style={{ background: 'rgba(220,38,38,0.2)', borderRadius: 8, padding: '12px 14px', marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.red, marginBottom: 4 }}>🔴 EMERGENCY CONTACT</div>
                <div style={{ fontSize: 12, color: T.red }}>24/7 Emergency Support: <strong>support@ujris.co.uk</strong></div>
                <div style={{ fontSize: 12, color: T.red }}>Solicitor Referral Hotline: <strong>In development</strong></div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 0, borderBottom: `2px solid ${T.border}`, marginBottom: 20 }}>
            {[['status','Action Plan'],['scripts','Emergency Scripts'],['helpers','Helper Match']].map(([id, label]) => (
              <button key={id} onClick={() => setActiveTab(id)} style={{
                padding: '10px 20px', background: 'none', border: 'none',
                borderBottom: activeTab === id ? `3px solid ${T.red}` : '3px solid transparent',
                color: activeTab === id ? T.navy : T.dim, fontWeight: activeTab === id ? 700 : 400,
                cursor: 'pointer', fontSize: 13, fontFamily: 'inherit',
              }}>{label}</button>
            ))}
          </div>

          {activeTab === 'status' && (
            <div style={{ background: 'white', borderRadius: 12, padding: 20, border: `1px solid ${T.border}` }}>
              <h4 style={{ color: T.navy, margin: '0 0 12px' }}>Priority Action Plan</h4>
              {(escalation.protocol?.actions || []).map((action, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 0', borderBottom: i < escalation.protocol.actions.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: cfg.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ fontSize: 13, color: T.navy, lineHeight: 1.4, paddingTop: 3 }}>{action}</div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'scripts' && (
            <div style={{ display: 'grid', gap: 16 }}>
              {EMERGENCY_SCRIPTS.map((script, i) => (
                <div key={i} style={{ background: 'white', borderRadius: 12, padding: 20, border: `1px solid ${T.border}` }}>
                  <h4 style={{ color: T.navy, margin: '0 0 10px', fontSize: 14 }}>{script.title}</h4>
                  <div style={{ background: T.navyM, borderRadius: 8, padding: '12px 16px', fontSize: 12, color: T.muted, lineHeight: 1.7, fontStyle: 'italic', marginBottom: 10 }}>
                    {script.content}
                  </div>
                  <button onClick={() => navigator.clipboard?.writeText(script.content).then(() => alert('Copied!')).catch(() => {})}
                    style={{ padding: '6px 14px', border: `1px solid ${T.border}`, borderRadius: 6, background: 'transparent', fontSize: 11, cursor: 'pointer', color: T.dim }}>
                    Copy Script
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'helpers' && (
            <div>
              {matchedHelpers.length > 0 ? (
                <div style={{ display: 'grid', gap: 12 }}>
                  <p style={{ color: T.muted, fontSize: 13, margin: '0 0 8px' }}>{matchedHelpers.length} high-trust helpers matched for your emergency:</p>
                  {matchedHelpers.map(h => (
                    <div key={h.id} style={{ background: 'white', borderRadius: 10, padding: '16px 20px', border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ fontSize: 28 }}>{h.helper_type === 'solicitor' ? '⚖' : h.helper_type === 'barrister' ? '👨‍⚖️' : '📋'}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>{h.helper_type?.replace(/_/g,' ')}</div>
                        <div style={{ fontSize: 11, color: T.dim }}>Trust Level {h.trust_level} · {(h.specialty || []).slice(0,2).join(', ')}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: T.gold }}>★ {(h.avg_rating || 0).toFixed(1)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ background: 'white', borderRadius: 12, padding: 24, border: `1px solid ${T.border}`, textAlign: 'center', color: T.dim }}>
                  {!user ? (
                    <div>
                      <p>Sign in to activate emergency helper matching.</p>
                      <a href="/auth" style={{ background: T.red, color: 'white', padding: '10px 24px', borderRadius: 8, textDecoration: 'none', fontWeight: 600, display: 'inline-block', marginTop: 8 }}>Sign In for Emergency Help</a>
                    </div>
                  ) : escalation.level < 3 ? (
                    <p>Emergency helper matching activates at Level 3 (7 days or less).</p>
                  ) : (
                    <p>No helpers available right now. Contact support@ujris.co.uk immediately.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: 24, background: T.navyM, borderRadius: 12, padding: 20, border: `1px solid ${T.border}` }}>
        <h4 style={{ color: T.navy, margin: '0 0 8px', fontSize: 13 }}>Emergency Level Guide</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {Object.entries(LEVEL_CONFIG).map(([level, cfg]) => (
            <div key={level} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 11, color: T.dim }}>
              <span style={{ color: cfg.color, fontWeight: 700 }}>{cfg.icon}</span>
              <span><strong style={{ color: cfg.color }}>L{level}:</strong> {level === '1' ? '>14 days' : level === '2' ? '7–14 days' : level === '3' ? '3–7 days' : '<3 days'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
