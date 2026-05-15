import React, { useState } from 'react';

const T = {
  navy: '#0D1B2A', navyMid: '#152438', navyLight: '#1E3A5F',
  gold: '#C9A84C', goldLight: 'rgba(201,168,76,0.15)',
  teal: '#0C7B7A', tealLight: 'rgba(12,123,122,0.15)',
  white: '#EEF2F7', muted: '#7A8FA6', border: 'rgba(255,255,255,0.08)',
  red: '#E53E3E', green: '#22C55E', orange: '#D97706',
};

const VENTO_BANDS = [
  { band: 'Lower', range: '£1,200 – £11,700', min: 1200, max: 11700, desc: 'Less serious acts, isolated incidents, minor impact' },
  { band: 'Middle', range: '£11,700 – £35,100', min: 11700, max: 35100, desc: 'Sustained or serious acts, persistent pattern, moderate distress' },
  { band: 'Upper', range: '£35,100 – £56,200', min: 35100, max: 56200, desc: 'Exceptional cases — systematic abuse, severe psychological harm, life-altering impact' },
];

function fmt(n) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n || 0);
}

export default function Calculator({ caseId }) {
  const [tab, setTab] = useState('schedule');

  // Schedule of Loss inputs
  const [sol, setSol] = useState({
    weeklyPay: 650,
    weeksBefore: 0,
    weeksAfter: 52,
    futureLoss: 26,
    noticePay: 8,
    bonusDue: 0,
    holidayDue: 5,
    pensionLoss: 0,
    otherLoss: 0,
    ventoLower: 35100,
    ventoUpper: 56200,
    interestRate: 8,
    injuryToFeelings: 45000,
  });

  const [basicAward, setBasicAward] = useState({ weekly: 650, years: 7, age: 42 });

  function updateSol(key, val) {
    setSol(prev => ({ ...prev, [key]: parseFloat(val) || 0 }));
  }

  const pastLoss = sol.weeklyPay * sol.weeksBefore;
  const futureLoss = sol.weeklyPay * sol.weeksAfter;
  const noticePayTotal = sol.weeklyPay * sol.noticePay;
  const totalLoss = pastLoss + futureLoss + noticePayTotal + sol.bonusDue + sol.holidayDue + sol.pensionLoss + sol.otherLoss;
  const midVento = (sol.ventoLower + sol.ventoUpper) / 2;
  const grandTotal = totalLoss + sol.injuryToFeelings;

  function calcBasicAward() {
    const cap = Math.min(basicAward.weekly, 643);
    let multiplier = 0;
    const age = basicAward.age;
    const years = Math.min(basicAward.years, 20);
    for (let i = 0; i < years; i++) {
      const a = age - i;
      if (a >= 41) multiplier += 1.5;
      else if (a >= 22) multiplier += 1;
      else multiplier += 0.5;
    }
    return cap * multiplier;
  }

  const basicAwardTotal = calcBasicAward();

  return (
    <div style={{ minHeight: '100vh', background: T.navy, color: T.white, fontFamily: "'Source Serif 4', Georgia, serif" }}>
      <div style={{ background: T.navyMid, borderBottom: `1px solid ${T.border}`, padding: '24px 32px' }}>
        <h1 style={{ margin: 0, fontSize: 24, fontFamily: "'Playfair Display', Georgia, serif", color: T.gold }}>💰 Schedule of Loss & Vento Calculator</h1>
        <p style={{ margin: '4px 0 0', color: T.muted, fontSize: 13 }}>Employment Tribunal financial calculations — Vento bands, basic award, schedule of loss</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          {['schedule', 'vento', 'basic'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '7px 16px', borderRadius: 8, border: `1px solid ${tab === t ? T.gold : T.border}`,
              background: tab === t ? T.goldLight : 'transparent', color: tab === t ? T.gold : T.muted,
              cursor: 'pointer', fontSize: 13, fontWeight: tab === t ? 700 : 400,
            }}>
              {t === 'schedule' ? '📋 Schedule of Loss' : t === 'vento' ? '⚖️ Vento Bands' : '📊 Basic Award'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '24px 32px', maxWidth: 900, margin: '0 auto' }}>

        {tab === 'schedule' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
            <div>
              <h2 style={{ color: T.gold, fontFamily: "'Playfair Display', Georgia, serif", marginTop: 0, fontSize: 18 }}>Financial Losses</h2>

              {[
                { key: 'weeklyPay', label: 'Weekly Net Pay (£)', note: 'Net after tax/NI' },
                { key: 'weeksBefore', label: 'Weeks Loss Before Dismissal', note: 'Unpaid notice, suspension etc.' },
                { key: 'weeksAfter', label: 'Weeks Future Loss of Earnings', note: 'Until new job / mitigation ceiling' },
                { key: 'noticePay', label: 'Notice Pay Owed (Weeks)', note: 'Statutory or contractual, whichever higher' },
                { key: 'bonusDue', label: 'Unpaid Bonus / Commission (£)', note: '' },
                { key: 'holidayDue', label: 'Accrued Holiday Pay (£)', note: '' },
                { key: 'pensionLoss', label: 'Pension Loss (£)', note: 'Use actuarial tables for long-term' },
                { key: 'otherLoss', label: 'Other Financial Loss (£)', note: 'Benefits, car allowance, etc.' },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', color: T.muted, fontSize: 12, marginBottom: 4 }}>{f.label}{f.note && <span style={{ color: T.muted + '99', fontSize: 11, marginLeft: 6 }}>— {f.note}</span>}</label>
                  <input type="number" value={sol[f.key]} onChange={e => updateSol(f.key, e.target.value)}
                    style={{ width: '100%', background: T.navyMid, border: `1px solid ${T.border}`, borderRadius: 8, color: T.white, padding: '10px 14px', fontSize: 15, boxSizing: 'border-box' }} />
                </div>
              ))}

              <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 20, marginTop: 4 }}>
                <h2 style={{ color: T.gold, fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, marginTop: 0 }}>Injury to Feelings</h2>
                <label style={{ display: 'block', color: T.muted, fontSize: 12, marginBottom: 4 }}>Injury to Feelings Award (£) — Vento Band</label>
                <input type="number" value={sol.injuryToFeelings} onChange={e => updateSol('injuryToFeelings', e.target.value)}
                  style={{ width: '100%', background: T.navyMid, border: `1px solid ${T.gold}`, borderRadius: 8, color: T.white, padding: '10px 14px', fontSize: 15, boxSizing: 'border-box' }} />
                <div style={{ color: T.muted, fontSize: 11, marginTop: 4 }}>Upper Vento: £35,100 – £56,200. Enter your specific claim.</div>
              </div>
            </div>

            {/* Summary Panel */}
            <div style={{ position: 'sticky', top: 80 }}>
              <div style={{ background: T.navyMid, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24 }}>
                <h3 style={{ color: T.gold, fontFamily: "'Playfair Display', Georgia, serif", margin: '0 0 20px', fontSize: 18 }}>Schedule of Loss Summary</h3>

                {[
                  { label: 'Past Loss of Earnings', value: pastLoss },
                  { label: 'Future Loss of Earnings', value: futureLoss },
                  { label: 'Notice Pay', value: noticePayTotal },
                  { label: 'Unpaid Bonus', value: sol.bonusDue },
                  { label: 'Holiday Pay', value: sol.holidayDue },
                  { label: 'Pension Loss', value: sol.pensionLoss },
                  { label: 'Other Losses', value: sol.otherLoss },
                ].map(r => r.value > 0 && (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, paddingBottom: 10, borderBottom: `1px solid ${T.border}` }}>
                    <span style={{ color: T.muted, fontSize: 13 }}>{r.label}</span>
                    <span style={{ color: T.white, fontWeight: 600, fontSize: 13 }}>{fmt(r.value)}</span>
                  </div>
                ))}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, paddingBottom: 10, borderBottom: `1px solid ${T.border}` }}>
                  <span style={{ color: T.muted, fontSize: 13 }}>Total Financial Loss</span>
                  <span style={{ color: T.white, fontWeight: 700, fontSize: 15 }}>{fmt(totalLoss)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, paddingBottom: 10, borderBottom: `1px solid ${T.border}` }}>
                  <span style={{ color: T.muted, fontSize: 13 }}>Injury to Feelings</span>
                  <span style={{ color: T.gold, fontWeight: 700, fontSize: 15 }}>{fmt(sol.injuryToFeelings)}</span>
                </div>

                <div style={{ background: T.goldLight, border: `1px solid ${T.gold}`, borderRadius: 10, padding: 16, marginTop: 8, textAlign: 'center' }}>
                  <div style={{ color: T.muted, fontSize: 12, marginBottom: 4 }}>TOTAL CLAIM VALUE</div>
                  <div style={{ color: T.gold, fontWeight: 900, fontSize: 32, fontFamily: "'Playfair Display', Georgia, serif" }}>{fmt(grandTotal)}</div>
                </div>

                <button onClick={() => window.print()} style={{
                  width: '100%', marginTop: 16, padding: '12px', background: T.teal, color: '#fff',
                  border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 14,
                }}>🖨️ Print / Export PDF</button>
              </div>
            </div>
          </div>
        )}

        {tab === 'vento' && (
          <div>
            <div style={{ background: T.tealLight, border: `1px solid ${T.teal}`, borderRadius: 10, padding: 16, marginBottom: 24 }}>
              <div style={{ color: T.teal, fontWeight: 700, fontSize: 14 }}>⚖️ Vento v Chief Constable of West Yorkshire [2003] — Injury to Feelings</div>
              <div style={{ color: T.muted, fontSize: 13, marginTop: 8, lineHeight: 1.7 }}>
                Vento bands are the guideline ranges for injury to feelings awards in discrimination cases. They are updated periodically by the President of Employment Tribunals. Current (April 2024) figures apply.
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {VENTO_BANDS.map((band, i) => (
                <div key={i} style={{ background: T.navyMid, border: `1px solid ${i === 2 ? T.gold : T.border}`, borderRadius: 16, padding: 24, position: 'relative', overflow: 'hidden' }}>
                  {i === 2 && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${T.gold}, #8B6914)` }} />}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ color: T.muted, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 4 }}>{band.band.toUpperCase()} BAND</div>
                      <div style={{ color: i === 2 ? T.gold : T.white, fontWeight: 900, fontSize: 26, fontFamily: "'Playfair Display', Georgia, serif" }}>{band.range}</div>
                    </div>
                    {i === 2 && <span style={{ background: T.goldLight, color: T.gold, fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>UJRIS TARGET</span>}
                  </div>
                  <div style={{ color: T.muted, fontSize: 14, lineHeight: 1.7 }}>{band.desc}</div>
                  <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
                    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '8px 16px', textAlign: 'center' }}>
                      <div style={{ color: T.muted, fontSize: 10 }}>Minimum</div>
                      <div style={{ color: T.white, fontWeight: 700, fontSize: 16 }}>{fmt(band.min)}</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '8px 16px', textAlign: 'center' }}>
                      <div style={{ color: T.muted, fontSize: 10 }}>Maximum</div>
                      <div style={{ color: T.white, fontWeight: 700, fontSize: 16 }}>{fmt(band.max)}</div>
                    </div>
                    <div style={{ background: T.tealLight, borderRadius: 8, padding: '8px 16px', textAlign: 'center' }}>
                      <div style={{ color: T.teal, fontSize: 10 }}>Midpoint</div>
                      <div style={{ color: T.teal, fontWeight: 700, fontSize: 16 }}>{fmt((band.min + band.max) / 2)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: T.navyMid, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20, marginTop: 24 }}>
              <div style={{ color: T.gold, fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Upper Vento — Factors That Apply (Fairwinds)</div>
              {['Sustained racial harassment over employment period', 'Constructive dismissal following whistleblowing', 'Severe psychological harm — anxiety, depression, sleep disturbance documented', 'Career destruction — unable to return to care sector', 'Systematic institutional failure', 'Power imbalance — immigrant claimant vs corporate employer'].map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
                  <span style={{ color: T.teal, marginTop: 2 }}>✓</span>
                  <span style={{ color: T.muted, fontSize: 13 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'basic' && (
          <div style={{ maxWidth: 600 }}>
            <div style={{ background: T.navyMid, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24, marginBottom: 20 }}>
              <h2 style={{ color: T.gold, fontFamily: "'Playfair Display', Georgia, serif", marginTop: 0 }}>Basic Award Calculator</h2>
              <p style={{ color: T.muted, fontSize: 13, marginBottom: 20 }}>Statutory redundancy / unfair dismissal basic award — Employment Rights Act 1996 s.119</p>

              {[
                { key: 'weekly', label: 'Weekly Gross Pay (capped at £643)', type: 'number' },
                { key: 'years', label: 'Complete Years of Service', type: 'number' },
                { key: 'age', label: 'Age at Dismissal', type: 'number' },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', color: T.muted, fontSize: 12, marginBottom: 4 }}>{f.label}</label>
                  <input type={f.type} value={basicAward[f.key]} onChange={e => setBasicAward(p => ({ ...p, [f.key]: parseFloat(e.target.value) || 0 }))}
                    style={{ width: '100%', background: T.navy, border: `1px solid ${T.border}`, borderRadius: 8, color: T.white, padding: '10px 14px', fontSize: 15, boxSizing: 'border-box' }} />
                </div>
              ))}
            </div>

            <div style={{ background: T.goldLight, border: `1px solid ${T.gold}`, borderRadius: 16, padding: 24, textAlign: 'center' }}>
              <div style={{ color: T.muted, fontSize: 12, marginBottom: 4 }}>BASIC AWARD</div>
              <div style={{ color: T.gold, fontWeight: 900, fontSize: 40, fontFamily: "'Playfair Display', Georgia, serif" }}>{fmt(basicAwardTotal)}</div>
              <div style={{ color: T.muted, fontSize: 12, marginTop: 8 }}>
                Multiplier rules: × 1.5 per year aged 41+, × 1 per year aged 22–40, × 0.5 per year under 22
              </div>
            </div>

            <div style={{ background: T.navyMid, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20, marginTop: 20 }}>
              <div style={{ color: T.teal, fontWeight: 700, marginBottom: 10, fontSize: 14 }}>Weekly Pay Cap — 2024/25</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[['Weekly Pay Cap', '£643'], ['Max Basic Award', '£19,290'], ['Max Years', '20'], ['Max Multiplier', '30']].map(([l, v]) => (
                  <div key={l} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px 14px' }}>
                    <div style={{ color: T.muted, fontSize: 11 }}>{l}</div>
                    <div style={{ color: T.white, fontWeight: 700, fontSize: 16 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
