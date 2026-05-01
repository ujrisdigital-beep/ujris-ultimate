import React, { useState } from 'react';

const T = {
  navy: '#0D1B2A', navyMid: '#152438', navyLight: '#1E3A5F',
  gold: '#C9A84C', goldLight: 'rgba(201,168,76,0.15)',
  teal: '#0C7B7A', tealLight: 'rgba(12,123,122,0.15)',
  white: '#EEF2F7', muted: '#7A8FA6', border: 'rgba(255,255,255,0.08)',
  red: '#E53E3E', redLight: 'rgba(229,62,62,0.15)',
  orange: '#D97706',
};

const SHAM_INDICATORS = [
  { id: 1, label: 'Outcome was decided before hearing began', weight: 10, desc: 'Evidence: dismissal letter already drafted before meeting concluded, or manager admits decision was pre-made' },
  { id: 2, label: 'Witnesses refused or excluded', weight: 8, desc: 'Employee\'s chosen witnesses denied without reason, or only employer witnesses permitted' },
  { id: 3, label: 'Investigation was inadequate or one-sided', weight: 9, desc: 'Failed to interview key witnesses, ignored contradictory evidence, or relied solely on manager\'s account' },
  { id: 4, label: 'Chair of hearing had prior involvement', weight: 7, desc: 'Disciplinary officer knew about or was involved in the original incident or complaint' },
  { id: 5, label: 'Notice of hearing was unreasonably short', weight: 6, desc: 'Less than 48 hours notice, or documents provided day before without time to prepare' },
  { id: 6, label: 'Right of accompaniment denied', weight: 8, desc: 'Trade union rep or colleague refused — breach of Employment Relations Act 1999 s.10' },
  { id: 7, label: 'No genuine opportunity to respond to allegations', weight: 9, desc: 'Questions asked but answers dismissed, key evidence not put to the employee' },
  { id: 8, label: 'Disproportionate sanction vs alleged misconduct', weight: 7, desc: 'Minor misconduct resulted in dismissal, no consideration of lesser sanctions' },
  { id: 9, label: 'Minutes/notes withheld or altered', weight: 8, desc: 'Notes not provided, produced days later, or differ from contemporaneous records' },
  { id: 10, label: 'Appeal heard by person senior to original decision-maker', weight: 5, desc: 'Appearance of independence without genuine independence' },
  { id: 11, label: 'Protected characteristic mentioned explicitly or coded', weight: 10, desc: 'Direct or indirect reference to race, sex, disability, religion in decision' },
  { id: 12, label: 'Timing coincides with protected disclosure or complaint', weight: 9, desc: 'Disciplinary started within weeks of a grievance, SAR, or whistleblowing disclosure' },
  { id: 13, label: 'Inconsistent application of disciplinary policy', weight: 8, desc: 'Same conduct by comparators not disciplined, or policy applied differently' },
  { id: 14, label: 'Burchell test not genuinely applied', weight: 9, desc: 'Employer did not genuinely investigate, did not hold honest belief, or belief not reasonable on evidence' },
  { id: 15, label: 'Safeguarding weaponised alongside disciplinary', weight: 8, desc: 'Simultaneous safeguarding referral and disciplinary — classic retaliation pattern' },
];

export default function ShamHearingNavigator({ caseId }) {
  const [scores, setScores] = useState({});
  const [showChallenge, setShowChallenge] = useState(false);
  const [challengeText, setChallengeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState('');
  const [tab, setTab] = useState('checklist');
  const [safeguarding, setSafeguarding] = useState({ answers: {}, analysis: '' });
  const [sgLoading, setSgLoading] = useState(false);

  function setScore(id, val) {
    setScores(prev => ({ ...prev, [id]: val }));
  }

  const totalScore = SHAM_INDICATORS.reduce((acc, ind) => {
    const s = scores[ind.id];
    if (s === 'yes') return acc + ind.weight;
    if (s === 'partial') return acc + Math.floor(ind.weight / 2);
    return acc;
  }, 0);

  const maxScore = SHAM_INDICATORS.reduce((acc, ind) => acc + ind.weight, 0);
  const pct = Math.round((totalScore / maxScore) * 100);
  const confirmedCount = Object.values(scores).filter(v => v === 'yes').length;
  const partialCount = Object.values(scores).filter(v => v === 'partial').length;

  let verdictColor = T.teal, verdictLabel = 'LOW SHAM RISK', verdictDesc = 'The process appears to have been conducted fairly based on the information provided.';
  if (pct >= 70) { verdictColor = T.red; verdictLabel = 'VERY LIKELY SHAM HEARING'; verdictDesc = 'Strong indicators of a predetermined, procedurally flawed process. High tribunal success probability on procedural grounds alone.'; }
  else if (pct >= 45) { verdictColor = T.orange; verdictLabel = 'PROBABLE SHAM HEARING'; verdictDesc = 'Multiple sham indicators present. The process has significant procedural flaws that should be challenged at tribunal.'; }
  else if (pct >= 25) { verdictColor = T.gold; verdictLabel = 'POSSIBLE SHAM HEARING'; verdictDesc = 'Some concerning indicators. Build evidence on the confirmed points and challenge the process in your ET1.'; }

  async function generateChallenge() {
    setLoading(true);
    setChallengeText('');
    const confirmed = SHAM_INDICATORS.filter(ind => scores[ind.id] === 'yes').map(ind => ind.label);
    const partial = SHAM_INDICATORS.filter(ind => scores[ind.id] === 'partial').map(ind => ind.label);
    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: 'You are a UK employment law barrister specialising in unfair dismissal and discrimination cases. Generate a formal procedural challenge document for use in Employment Tribunal proceedings.',
          messages: [{
            role: 'user',
            content: `Generate a formal procedural challenge to a sham disciplinary hearing.

Confirmed sham indicators: ${confirmed.join('; ')}
Partial indicators: ${partial.join('; ')}
Case details: ${details}

Generate:
1. PROCEDURAL CHALLENGE STATEMENT — for use in ET1 or skeleton argument
2. BURCHELL TEST FAILURES — specific ways the Burchell v British Home Stores test was not met
3. KEY AUTHORITIES — relevant cases (Burchell, Polkey, London Underground v Edwards, etc.)
4. CROSS-EXAMINATION STRATEGY — 5 questions to put to the disciplinary officer
5. QUANTUM — how procedural failure affects the award (Polkey reduction considerations)`,
          }],
          stream: true,
        }),
      });
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const d = JSON.parse(line.slice(6));
              if (d.delta?.text) { acc += d.delta.text; setChallengeText(acc); }
            } catch {}
          }
        }
      }
    } catch (e) {
      setChallengeText(`Error: ${e.message}`);
    }
    setLoading(false);
    setShowChallenge(true);
  }

  const SG_QUESTIONS = [
    'Was a safeguarding referral made about you or someone connected to you?',
    'Did the referral coincide with a grievance, tribunal claim, or protected disclosure?',
    'Were specific evidence-based concerns cited, or were allegations vague?',
    'Were you given opportunity to respond to the safeguarding allegations?',
    'Was the referral made by the same person you had a dispute with?',
  ];

  async function analyseSafeguarding() {
    setSgLoading(true);
    try {
      const answers = SG_QUESTIONS.map((q, i) => `Q: ${q}\nA: ${safeguarding.answers[i] || '(not answered)'}`).join('\n\n');
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: 'You are a UK child protection and employment law expert. Analyse whether safeguarding processes have been weaponised and what the legal remedies are.',
          messages: [{ role: 'user', content: `Analyse this safeguarding situation for weaponisation:\n\n${answers}` }],
          stream: true,
        }),
      });
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const d = JSON.parse(line.slice(6));
              if (d.delta?.text) { acc += d.delta.text; setSafeguarding(prev => ({ ...prev, analysis: acc })); }
            } catch {}
          }
        }
      }
    } catch {}
    setSgLoading(false);
  }

  return (
    <div style={{ minHeight: '100vh', background: T.navy, color: T.white, fontFamily: "'Source Serif 4', Georgia, serif" }}>
      <div style={{ background: T.navyMid, borderBottom: `1px solid ${T.border}`, padding: '24px 32px' }}>
        <h1 style={{ margin: 0, fontSize: 24, fontFamily: "'Playfair Display', Georgia, serif", color: T.gold }}>🔍 Sham Hearing Navigator</h1>
        <p style={{ margin: '4px 0 0', color: T.muted, fontSize: 13 }}>15-point sham indicator checklist + safeguarding weaponisation analysis + procedural challenge generator</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          {['checklist', 'safeguarding'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '7px 16px', borderRadius: 8, border: `1px solid ${tab === t ? T.gold : T.border}`,
              background: tab === t ? T.goldLight : 'transparent', color: tab === t ? T.gold : T.muted,
              cursor: 'pointer', fontSize: 13, fontWeight: tab === t ? 700 : 400,
            }}>{t === 'checklist' ? '📋 15-Point Checklist' : '🏹 Safeguarding Weaponisation'}</button>
          ))}
        </div>
      </div>

      {tab === 'checklist' && (
        <div style={{ padding: '24px 32px' }}>
          {/* Score Summary */}
          <div style={{ background: `${verdictColor}22`, border: `2px solid ${verdictColor}`, borderRadius: 16, padding: 24, marginBottom: 24, display: 'flex', gap: 24, alignItems: 'center' }}>
            <div style={{ textAlign: 'center', minWidth: 100 }}>
              <div style={{ color: verdictColor, fontWeight: 900, fontSize: 40, fontFamily: "'Playfair Display', Georgia, serif" }}>{pct}%</div>
              <div style={{ color: verdictColor, fontSize: 11, fontWeight: 700 }}>SHAM RISK</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: verdictColor, fontWeight: 700, fontSize: 18, fontFamily: "'Playfair Display', Georgia, serif", marginBottom: 4 }}>{verdictLabel}</div>
              <div style={{ color: T.muted, fontSize: 13, lineHeight: 1.7 }}>{verdictDesc}</div>
              <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
                <span style={{ color: T.red, fontSize: 13 }}>✓ {confirmedCount} confirmed</span>
                <span style={{ color: T.orange, fontSize: 13 }}>◑ {partialCount} partial</span>
                <span style={{ color: T.muted, fontSize: 13 }}>Score: {totalScore}/{maxScore}</span>
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            {SHAM_INDICATORS.map(ind => (
              <div key={ind.id} style={{ background: T.navyMid, border: `1px solid ${scores[ind.id] === 'yes' ? T.red : scores[ind.id] === 'partial' ? T.orange : T.border}`, borderRadius: 10, padding: 16 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ color: T.muted, fontSize: 12, minWidth: 24, fontWeight: 700 }}>#{ind.id}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: T.white, fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{ind.label}</div>
                    <div style={{ color: T.muted, fontSize: 12, lineHeight: 1.6 }}>{ind.desc}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    {[['yes', '✓ Yes', T.red], ['partial', '◑ Partial', T.orange], ['no', '✗ No', T.muted]].map(([v, l, c]) => (
                      <button key={v} onClick={() => setScore(ind.id, v)} style={{
                        padding: '5px 10px', borderRadius: 6, border: `1px solid ${scores[ind.id] === v ? c : T.border}`,
                        background: scores[ind.id] === v ? `${c}22` : 'transparent', color: scores[ind.id] === v ? c : T.muted,
                        cursor: 'pointer', fontSize: 11, fontWeight: scores[ind.id] === v ? 700 : 400,
                      }}>{l}</button>
                    ))}
                  </div>
                  <span style={{ color: T.muted, fontSize: 10, minWidth: 30, textAlign: 'right' }}>w:{ind.weight}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Case Details + Generate */}
          <div style={{ background: T.navyMid, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20 }}>
            <label style={{ display: 'block', color: T.muted, fontSize: 12, marginBottom: 6 }}>Case context (optional — improves the challenge document)</label>
            <textarea value={details} onChange={e => setDetails(e.target.value)} rows={4}
              placeholder="e.g. Disciplinary was held on 3 March 2026. I was dismissed for alleged misconduct. The manager who investigated was also the person who made the initial complaint against me..."
              style={{ width: '100%', background: T.navy, border: `1px solid ${T.border}`, borderRadius: 8, color: T.white, padding: 12, fontSize: 13, resize: 'vertical', fontFamily: "'Source Serif 4', Georgia, serif", boxSizing: 'border-box', marginBottom: 12 }} />
            <button onClick={generateChallenge} disabled={loading || confirmedCount === 0} style={{
              padding: '12px 24px', background: confirmedCount === 0 ? T.navyLight : T.gold, color: T.navy,
              border: 'none', borderRadius: 8, fontWeight: 700, cursor: confirmedCount === 0 ? 'not-allowed' : 'pointer', fontSize: 14,
            }}>
              {loading ? '⏳ Generating...' : '📄 Generate Procedural Challenge'}
            </button>
          </div>

          {showChallenge && challengeText && (
            <div style={{ background: T.navyMid, border: `1px solid ${T.gold}44`, borderRadius: 16, padding: 28, marginTop: 24 }}>
              <div style={{ color: T.gold, fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 16 }}>PROCEDURAL CHALLENGE DOCUMENT</div>
              <pre style={{ color: T.white, fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-wrap', fontFamily: "'Source Serif 4', Georgia, serif", margin: 0 }}>{challengeText}</pre>
              <button onClick={() => navigator.clipboard.writeText(challengeText)} style={{ marginTop: 16, padding: '8px 16px', background: T.teal, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>📋 Copy</button>
            </div>
          )}
        </div>
      )}

      {tab === 'safeguarding' && (
        <div style={{ padding: '24px 32px', maxWidth: 800 }}>
          <div style={{ background: T.redLight, border: `1px solid ${T.red}`, borderRadius: 10, padding: 16, marginBottom: 24 }}>
            <div style={{ color: T.red, fontWeight: 700, fontSize: 13 }}>⚠️ Safeguarding Weaponisation</div>
            <div style={{ color: T.muted, fontSize: 13, marginTop: 6, lineHeight: 1.7 }}>Safeguarding referrals can be misused as a weapon — particularly against BAME professionals in care, education, and public sector. If a referral coincides with a legal claim or protected disclosure, it may constitute victimisation under EA 2010 s.27.</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
            {SG_QUESTIONS.map((q, i) => (
              <div key={i} style={{ background: T.navyMid, border: `1px solid ${T.border}`, borderRadius: 10, padding: 16 }}>
                <div style={{ color: T.white, fontSize: 14, marginBottom: 10 }}>{i + 1}. {q}</div>
                <textarea value={safeguarding.answers[i] || ''} onChange={e => setSafeguarding(prev => ({ ...prev, answers: { ...prev.answers, [i]: e.target.value } }))}
                  placeholder="Your answer..."
                  rows={2} style={{ width: '100%', background: T.navy, border: `1px solid ${T.border}`, borderRadius: 6, color: T.white, padding: '8px 10px', fontSize: 13, resize: 'vertical', fontFamily: "'Source Serif 4', Georgia, serif", boxSizing: 'border-box' }} />
              </div>
            ))}
          </div>

          <button onClick={analyseSafeguarding} disabled={sgLoading} style={{
            padding: '12px 24px', background: T.red, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 14, marginBottom: 24,
          }}>
            {sgLoading ? '⏳ Analysing...' : '🏹 Analyse for Weaponisation'}
          </button>

          {safeguarding.analysis && (
            <div style={{ background: T.navyMid, border: `1px solid ${T.red}44`, borderRadius: 16, padding: 28 }}>
              <div style={{ color: T.red, fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 12 }}>SAFEGUARDING ANALYSIS</div>
              <div style={{ color: T.white, fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{safeguarding.analysis}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
