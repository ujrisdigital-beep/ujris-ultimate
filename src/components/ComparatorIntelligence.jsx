import React, { useState } from 'react';

const T = {
  navy: '#0D1B2A', navyMid: '#152438', navyLight: '#1E3A5F',
  gold: '#C9A84C', goldLight: 'rgba(201,168,76,0.15)',
  teal: '#0C7B7A', tealLight: 'rgba(12,123,122,0.15)',
  white: '#EEF2F7', muted: '#7A8FA6', border: 'rgba(255,255,255,0.08)',
  red: '#E53E3E', green: '#22C55E', orange: '#D97706',
};

const FIELD_LABELS = {
  name: 'Name / Description',
  race: 'Race / Ethnicity',
  sex: 'Sex / Gender',
  disability: 'Disability Status',
  age: 'Age',
  role: 'Job Role / Grade',
  department: 'Department',
  qualifications: 'Qualifications / Experience',
  treatment: 'How Treated (the act)',
  employer: 'Same Employer?',
  period: 'Same Time Period?',
  manager: 'Same / Similar Manager?',
  circumstances: 'Relevant Circumstances',
};

export default function ComparatorIntelligence({ caseId }) {
  const [tab, setTab] = useState('direct');
  const [claimant, setClaimant] = useState({
    name: 'You', race: 'Black / African', sex: '', disability: '', age: '',
    role: '', department: '', qualifications: '', treatment: '', employer: 'Yes',
    period: 'Yes', manager: '', circumstances: '',
  });
  const [comparator, setComparator] = useState({
    name: 'Actual Comparator', race: 'White / British', sex: '', disability: '',
    age: '', role: '', department: '', qualifications: '', treatment: '',
    employer: 'Yes', period: 'Yes', manager: '', circumstances: '',
  });
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [comparatorType, setComparatorType] = useState('actual');

  function update(who, key, val) {
    const setter = who === 'claimant' ? setClaimant : setComparator;
    setter(prev => ({ ...prev, [key]: val }));
  }

  async function analyse() {
    setLoading(true);
    setAnalysis('');
    const type = tab === 'direct' ? 'direct discrimination (EA 2010 s.13)' : 'indirect discrimination (EA 2010 s.19)';
    const prompt = `You are a UK discrimination law barrister. Analyse the strength of this ${type} comparator argument.

Claimant profile: ${JSON.stringify(claimant, null, 2)}

Comparator (${comparatorType}): ${JSON.stringify(comparator, null, 2)}

Provide:
1. COMPARATOR VALIDITY — Is this a valid comparator under EA 2010? (Actual comparator test: same/not materially different circumstances. Hypothetical: how would a comparator have been treated?)
2. STRENGTH ASSESSMENT — Rate the comparator strength: STRONG / MODERATE / WEAK, with specific reasons
3. KEY SIMILARITIES — What makes this a valid "like for like" comparison
4. WEAKNESSES — What a respondent will attack, and how to address them
5. CROSS-EXAMINATION LINES — 3 specific questions to put to the employer about differential treatment
6. LEGAL AUTHORITIES — Key cases supporting this comparator (Balamoody, Shamoon, Madarassy etc.)
7. RECOMMENDATION — Whether to use actual comparator, hypothetical comparator, or both`;

    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: prompt,
          messages: [{ role: 'user', content: 'Analyse this comparator.' }],
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
              if (d.delta?.text) { acc += d.delta.text; setAnalysis(acc); }
            } catch {}
          }
        }
      }
    } catch (e) {
      setAnalysis(`Error: ${e.message}`);
    }
    setLoading(false);
  }

  function PersonForm({ label, data, onChange, accent }) {
    return (
      <div style={{ background: T.navyMid, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20, flex: 1 }}>
        <div style={{ color: accent, fontWeight: 700, fontSize: 14, marginBottom: 16, fontFamily: "'Playfair Display', Georgia, serif" }}>{label}</div>
        {Object.entries(FIELD_LABELS).map(([key, lbl]) => (
          <div key={key} style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', color: T.muted, fontSize: 11, marginBottom: 3 }}>{lbl}</label>
            <input value={data[key] || ''} onChange={e => onChange(key, e.target.value)}
              style={{ width: '100%', background: T.navy, border: `1px solid ${T.border}`, borderRadius: 6, color: T.white, padding: '7px 10px', fontSize: 13, boxSizing: 'border-box' }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: T.navy, color: T.white, fontFamily: "'Source Serif 4', Georgia, serif" }}>
      <div style={{ background: T.navyMid, borderBottom: `1px solid ${T.border}`, padding: '24px 32px' }}>
        <h1 style={{ margin: 0, fontSize: 24, fontFamily: "'Playfair Display', Georgia, serif", color: T.gold }}>⚖️ Comparator Intelligence</h1>
        <p style={{ margin: '4px 0 0', color: T.muted, fontSize: 13 }}>Build and analyse actual/hypothetical comparators — EA 2010 s.13 (direct) & s.19 (indirect)</p>

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          {['direct', 'indirect'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '7px 16px', borderRadius: 8, border: `1px solid ${tab === t ? T.gold : T.border}`,
              background: tab === t ? T.goldLight : 'transparent', color: tab === t ? T.gold : T.muted,
              cursor: 'pointer', fontSize: 13, fontWeight: tab === t ? 700 : 400,
            }}>{t === 'direct' ? '⚖️ Direct Discrimination (s.13)' : '🌊 Indirect Discrimination (s.19)'}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '24px 32px' }}>
        {/* Legal Context Banner */}
        <div style={{ background: T.tealLight, border: `1px solid ${T.teal}`, borderRadius: 10, padding: 16, marginBottom: 24 }}>
          <div style={{ color: T.teal, fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
            {tab === 'direct' ? 'EA 2010 s.13 — Direct Discrimination' : 'EA 2010 s.19 — Indirect Discrimination'}
          </div>
          <div style={{ color: T.muted, fontSize: 13, lineHeight: 1.7 }}>
            {tab === 'direct'
              ? 'A person (A) discriminates against another (B) if A treats B less favourably than A treats or would treat others. The comparator must be in the same or not materially different circumstances.'
              : 'Applies where a provision, criterion or practice (PCP) puts people with a protected characteristic at a particular disadvantage. No comparator needed — but group disadvantage must be shown.'}
          </div>
        </div>

        {/* Comparator Type */}
        {tab === 'direct' && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <span style={{ color: T.muted, fontSize: 13, alignSelf: 'center', marginRight: 4 }}>Comparator type:</span>
            {[['actual', 'Actual Comparator'], ['hypothetical', 'Hypothetical Comparator']].map(([v, l]) => (
              <button key={v} onClick={() => setComparatorType(v)} style={{
                padding: '6px 14px', borderRadius: 20, border: `1px solid ${comparatorType === v ? T.gold : T.border}`,
                background: comparatorType === v ? T.goldLight : 'transparent', color: comparatorType === v ? T.gold : T.muted, cursor: 'pointer', fontSize: 12,
              }}>{l}</button>
            ))}
          </div>
        )}

        {/* Side-by-side forms */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          <PersonForm label="Claimant Profile (You)" data={claimant} onChange={(k, v) => update('claimant', k, v)} accent={T.teal} />
          <PersonForm label={`${comparatorType === 'actual' ? 'Actual' : 'Hypothetical'} Comparator`} data={comparator} onChange={(k, v) => update('comparator', k, v)} accent={T.gold} />
        </div>

        <button onClick={analyse} disabled={loading} style={{
          padding: '14px 32px', background: loading ? T.navyLight : T.gold, color: T.navy,
          border: 'none', borderRadius: 10, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontSize: 15, marginBottom: 24,
        }}>
          {loading ? '⏳ Analysing Comparator...' : '⚖️ Analyse Comparator Strength'}
        </button>

        {analysis && (
          <div style={{ background: T.navyMid, border: `1px solid ${T.gold}44`, borderRadius: 16, padding: 28 }}>
            <div style={{ color: T.gold, fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 16 }}>COMPARATOR ANALYSIS</div>
            <div style={{ color: T.white, fontSize: 14, lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>{analysis}</div>
          </div>
        )}
      </div>
    </div>
  );
}
