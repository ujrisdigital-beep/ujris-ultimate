import React, { useState } from 'react';

const T = {
  navy: '#0D1B2A', navyMid: '#152438', navyLight: '#1E3A5F',
  gold: '#C9A84C', goldLight: 'rgba(201,168,76,0.15)',
  teal: '#0C7B7A', tealLight: 'rgba(12,123,122,0.15)',
  white: '#EEF2F7', muted: '#7A8FA6', border: 'rgba(255,255,255,0.08)',
  red: '#E53E3E', redLight: 'rgba(229,62,62,0.15)',
  purple: '#7B5EA7', purpleLight: 'rgba(123,94,167,0.15)',
  orange: '#D97706', orangeLight: 'rgba(217,119,6,0.15)',
};

const DETECTORS = [
  {
    id: 'rosetta', name: 'Rosetta Stone Detector', icon: '🗿', color: T.teal, cat: 'Core',
    legal: 'Equality Act 2010 s.136 — Burden of Proof',
    desc: 'Detects when an employer\'s account shifts between contexts — using different explanations for different audiences (HR, tribunal, correspondence) — revealing the "rosetta" inconsistency that exposes pretext.',
    prompt: 'Analyse the following text for Rosetta Stone inconsistencies — places where the account shifts depending on the audience or context. Identify the original explanation vs tribunal explanation, note the discrepancy, and explain the legal significance under EA 2010 s.136.',
  },
  {
    id: 'false-disclosure', name: 'False Disclosure Certificate', icon: '📜', color: T.red, cat: 'Core',
    legal: 'CPR 31 — Disclosure Obligations; EA 2010 s.136',
    desc: 'Identifies when a disclosure list certifies completeness but internal evidence (emails, logs, CCTV) suggest material omissions — the "false certificate" that constitutes contempt.',
    prompt: 'Review the disclosure list and identify: (1) documents that should exist based on context but are absent, (2) gaps in chronological sequences, (3) references in disclosed docs to undisclosed docs. State the legal implications under CPR 31.',
  },
  {
    id: 'temporal', name: 'Temporal Impossibility Detector', icon: '⏱️', color: T.orange, cat: 'Core',
    legal: 'Evidence Act 2019 — Authenticity; Perverting course of justice',
    desc: 'Detects when timestamps, metadata or document creation dates contradict the alleged chronology — proving documents were created after-the-fact or backdated.',
    prompt: 'Examine the timestamps, dates, and metadata in this text. Identify any temporal impossibilities: events claimed before they could have happened, documents with creation dates after alleged events, or sequence breaks that prove fabrication.',
  },
  {
    id: 'anchor-lie', name: 'Anchor Lie Detector', icon: '⚓', color: T.red, cat: 'Core',
    legal: 'EA 2010 s.136; Perjury Act 1911',
    desc: 'Identifies the single "anchor lie" — the first false statement all other lies depend on. Once the anchor is disproved, the entire narrative collapses.',
    prompt: 'Identify the foundational anchor lie in this statement — the single claim all other claims depend on. If proven false, which other claims automatically fail? Map the dependency chain and provide the cross-examination question to expose it.',
  },
  {
    id: 'illusory-truth', name: 'Illusory Truth Effect Detector', icon: '🔄', color: T.purple, cat: 'Systemic',
    legal: 'EA 2010 s.26 — Harassment; s.27 — Victimisation',
    desc: 'Detects when employers repeat false narratives across documents to embed them as "truth" — the psychological technique of repetition to create believability without evidence.',
    prompt: 'Identify repeated false assertions across these documents. Map: original false claim → where repeated → effect of repetition. Show how repetition substituted for evidence and identify the first instance of each repeated falsehood.',
  },
  {
    id: 'racial-hostility', name: 'Racial Hostility Framing Detector', icon: '🎭', color: T.red, cat: 'Core',
    legal: 'EA 2010 s.13 — Direct Discrimination; s.9 — Race',
    desc: 'Detects coded language, microaggression patterns, and structural framing that reveals racial hostility while maintaining plausible deniability.',
    prompt: 'Analyse this text for racial hostility framing: coded language, "culture fit" euphemisms, differential treatment language, and patterns that disproportionately target the claimant\'s protected characteristic. Map each instance to EA 2010 s.13.',
  },
  {
    id: 'arbitrary-power', name: 'Arbitrary Power Exercise Detector', icon: '👑', color: T.orange, cat: 'Systemic',
    legal: 'EA 2010 s.15 — Discrimination arising from disability; Employment Rights Act 1996',
    desc: 'Identifies when managers exercise discretionary powers arbitrarily and in a racially/discriminatorily disparate pattern — using policy as a weapon selectively.',
    prompt: 'Identify instances of arbitrary power exercise: discretionary decisions applied inconsistently, policies applied only to the claimant, unexplained departures from normal procedure. For each, show the comparator who was treated differently.',
  },
  {
    id: 'process-delay', name: 'Weaponised Process Delay Detector', icon: '🐌', color: T.teal, cat: 'Tactical',
    legal: 'Employment Tribunals Rules 2013 r.30 — Postponements; r.29 — Non-compliance',
    desc: 'Detects deliberate process delays — late disclosure, postponement requests, document drip-feeding — used to exhaust SRL claimants with limited resources.',
    prompt: 'Map all process delays in this case timeline. For each delay: who caused it, what was cited as reason, what was the actual effect on the claimant, and whether the pattern suggests deliberate attrition strategy under the ET Rules 2013.',
  },
  {
    id: 'settlement-trap', name: 'Conditional Settlement Trap Detector', icon: '🪤', color: T.red, cat: 'Tactical',
    legal: 'EA 2010 s.147 — Contracting out; ACAS Code',
    desc: 'Identifies settlement offers structured to trap claimants — low offers with onerous conditions (NDA, no public statements, admit guilt) designed to silence rather than compensate.',
    prompt: 'Analyse this settlement offer for trap conditions: NDAs that prevent future employment claims, admission of fault clauses, financial terms below Vento bands, urgency pressure. State the EA 2010 s.147 implications and ACAS Code compliance.',
  },
  {
    id: 'part36', name: 'Part 36 Offer Toxicity Detector', icon: '⚗️', color: T.orange, cat: 'Tactical',
    legal: 'CPR Part 36 — Offers to Settle; County Court Rules',
    desc: 'Detects when Part 36 offers are weaponised against SRL claimants who don\'t understand the costs consequences — offers pitched just above Vento floor to trigger automatic costs if refused.',
    prompt: 'Analyse this Part 36 offer for toxicity: Is the amount above the likely award? When was it served relative to the hearing? What are the costs consequences if refused and the claimant wins less? Is the timing designed to create maximum pressure?',
  },
  {
    id: 'police-reinterview', name: 'Police Re-Interview Manipulation', icon: '🚔', color: T.purple, cat: 'Police',
    legal: 'PACE 1984 Code C; Criminal Procedure and Investigations Act 1996',
    desc: 'Detects when police use re-interviews to create contradictions with previous statements — a deliberate technique to undermine credibility using the stress of repetition.',
    prompt: 'Compare these police interview records. Identify: questions designed to elicit contradictions with previous statements, leading questions not permitted under PACE Code C, absence of legal representation warnings, and any procedural violations.',
  },
  {
    id: 'police-closure', name: 'Police Case Closure Without Consultation', icon: '🚪', color: T.red, cat: 'Police',
    legal: 'Victims Code 2020; IOPC Statutory Guidance',
    desc: 'Identifies when police close cases without notifying victims, without providing reasons, or in violation of the Victims\' Code obligations for consultation.',
    prompt: 'Review this police closure for Victims Code 2020 compliance: Was the victim notified before closure? Were written reasons provided? Was the victim given the right to review? Map each violation to the specific Victims Code obligation breached.',
  },
  {
    id: 'crb-dbs', name: 'CRB/DBS Reputation Destruction Detector', icon: '💣', color: T.red, cat: 'Police',
    legal: 'Rehabilitation of Offenders Act 1974; Data Protection Act 2018; EA 2010',
    desc: 'Detects when CRB/DBS checks are used as a weapon to destroy employment prospects — particularly for Black professionals in care, education, and public sector.',
    prompt: 'Analyse this DBS/CRB situation for weaponisation: Was the check required for the role? Were results shared beyond necessity? Is the information spent under ROA 1974? Does the pattern suggest racial targeting? Map the reputational damage.',
  },
  {
    id: 'collusion', name: 'Collusion Detection Module', icon: '🕸️', color: T.purple, cat: 'Systemic',
    legal: 'EA 2010 s.111 — Liability of employers; PACE 1984 s.76 — Confessions',
    desc: 'Maps relationships between defendants, witnesses, and institutions to identify coordination, shared legal representation, or unified false narrative construction.',
    prompt: 'Build a collusion map from this evidence: Who communicated with whom? When? What was the effect? Did witnesses give suspiciously similar accounts? Is there shared legal representation? Map the network and identify the hub of coordination.',
  },
  {
    id: 'sham-hearing', name: 'Sham Hearing Detector', icon: '🎪', color: T.orange, cat: 'Sham',
    legal: 'Employment Tribunals Rules 2013; Burchell Test; EA 2010 s.98',
    desc: 'Identifies disciplinary or grievance hearings that were predetermined — where the outcome was decided before evidence was heard, witnesses refused, or the Burchell test was not genuinely applied.',
    prompt: 'Analyse this hearing process against the Burchell test: Did they genuinely investigate? Did they hold an honest belief? Was evidence genuinely assessed? Identify procedural flaws: refused witnesses, pre-determined outcome, biased chair, and score against 15 sham indicators.',
  },
  {
    id: 'safeguarding', name: 'Safeguarding Weaponisation Detector', icon: '🏹', color: T.red, cat: 'Sham',
    legal: 'Children Act 1989; EA 2010; PACE 1984; Human Rights Act 1998',
    desc: 'Detects when safeguarding referrals are made as a weapon — particularly against immigrant families, BAME individuals, or whistleblowers — using child protection machinery to retaliate or intimidate.',
    prompt: 'Analyse this safeguarding referral for weaponisation: Was it triggered by a protected disclosure or complaint? Is the timing suspicious? Are the allegations specific and evidenced or vague and retaliatory? Map against Children Act 1989 proper purpose requirements.',
  },
  {
    id: 'probationary', name: 'Probationary Trap Detector', icon: '🪝', color: T.orange, cat: 'Employment',
    legal: 'EA 2010 s.39 — Employees; Employment Rights Act 1996 s.94',
    desc: 'Identifies when probationary periods are used as traps — setting impossible targets, withholding training, moving goalposts — to dismiss without the full ERA 1996 procedural obligations.',
    prompt: 'Analyse this probationary dismissal for trap indicators: Were targets set clearly at start? Was adequate training provided? Were targets changed after the period began? Is there a pattern of dismissing BAME employees during probation? Map the EA 2010 exposure.',
  },
  {
    id: 'leaver-portal', name: 'Leaver Portal Trap Detector', icon: '🌀', color: T.teal, cat: 'Employment',
    legal: 'GDPR Art 17 — Right to erasure; DPA 2018; EA 2010 s.123',
    desc: 'Detects when leaver portals or exit processes are designed to suppress claims — time-limited access to payslips, benefits, and references that expire before the 3-month ET deadline.',
    prompt: 'Analyse this leaver process for trap design: Were payslips, P45, and reference accessible for at least 3 months post-departure? Was access removed before ET deadline? Were benefits calculations clearly provided? Map the information suppression pattern.',
  },
];

const CATEGORIES = ['All', 'Core', 'Systemic', 'Tactical', 'Police', 'Sham', 'Employment'];

const CAT_COLORS = { Core: T.gold, Systemic: T.purple, Tactical: T.orange, Police: T.teal, Sham: T.red, Employment: '#22C55E' };

export default function ForensicIntelligenceHub({ caseId }) {
  const [activeDetector, setActiveDetector] = useState(null);
  const [cat, setCat] = useState('All');
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const filtered = cat === 'All' ? DETECTORS : DETECTORS.filter(d => d.cat === cat);

  async function runDetector(detector) {
    if (!text.trim()) {
      alert('Paste the text you want to analyse first.');
      return;
    }
    setLoading(true);
    setResult('');
    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: `You are UJRIS Forensic AI — a UK discrimination law expert using forensic linguistic analysis. ${detector.prompt}`,
          messages: [{ role: 'user', content: text }],
          stream: true,
        }),
      });
      if (!res.ok) throw new Error('API error');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const d = JSON.parse(line.slice(6));
              if (d.delta?.text) { acc += d.delta.text; setResult(acc); }
            } catch {}
          }
        }
      }
    } catch (e) {
      setResult(`Error: ${e.message}. Ensure the ANTHROPIC_API_KEY is configured.`);
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: '100vh', background: T.navy, color: T.white, fontFamily: "'Source Serif 4', Georgia, serif" }}>
      {/* Header */}
      <div style={{ background: T.navyMid, borderBottom: `1px solid ${T.border}`, padding: '24px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 32 }}>🔬</span>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontFamily: "'Playfair Display', Georgia, serif", color: T.gold }}>Forensic Intelligence Hub</h1>
            <p style={{ margin: 0, color: T.muted, fontSize: 13 }}>18 specialist detectors — UK Equality Act 2010, PACE 1984, Employment Rights Act 1996</p>
          </div>
        </div>

        {/* Category Filter */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{
              padding: '6px 14px', borderRadius: 20, border: `1px solid ${cat === c ? T.gold : T.border}`,
              background: cat === c ? T.goldLight : 'transparent', color: cat === c ? T.gold : T.muted,
              cursor: 'pointer', fontSize: 12, fontWeight: cat === c ? 700 : 400,
            }}>{c}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: activeDetector ? '1fr 420px' : '1fr', gap: 0, minHeight: 'calc(100vh - 120px)' }}>

        {/* Detector Grid */}
        <div style={{ padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {filtered.map((d, i) => (
              <button key={d.id} onClick={() => setActiveDetector(activeDetector?.id === d.id ? null : d)}
                style={{
                  background: activeDetector?.id === d.id ? 'rgba(201,168,76,0.1)' : T.navyMid,
                  border: `1px solid ${activeDetector?.id === d.id ? T.gold : T.border}`,
                  borderRadius: 12, padding: 20, cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.2s', color: T.white,
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <span style={{ fontSize: 28 }}>{d.icon}</span>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ background: CAT_COLORS[d.cat] + '22', color: CAT_COLORS[d.cat], fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 10, letterSpacing: '0.05em' }}>{d.cat}</span>
                    <span style={{ background: T.navyLight, color: T.muted, fontSize: 9, padding: '2px 5px', borderRadius: 6 }}>#{i + 1}</span>
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, color: d.color, marginBottom: 6, fontFamily: "'Playfair Display', Georgia, serif" }}>{d.name}</div>
                <div style={{ fontSize: 11, color: T.teal, marginBottom: 8, fontStyle: 'italic' }}>{d.legal}</div>
                <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.6 }}>{d.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Analysis Panel */}
        {activeDetector && (
          <div style={{ background: T.navyMid, borderLeft: `1px solid ${T.border}`, padding: 24, display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 60, height: 'calc(100vh - 60px)', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: 32 }}>{activeDetector.icon}</span>
                <h3 style={{ margin: '8px 0 4px', fontFamily: "'Playfair Display', Georgia, serif", color: activeDetector.color, fontSize: 16 }}>{activeDetector.name}</h3>
                <div style={{ fontSize: 11, color: T.teal }}>{activeDetector.legal}</div>
              </div>
              <button onClick={() => setActiveDetector(null)} style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 12, fontSize: 12, color: T.muted, lineHeight: 1.7 }}>
              {activeDetector.desc}
            </div>

            <div>
              <label style={{ display: 'block', color: T.muted, fontSize: 11, marginBottom: 6, letterSpacing: '0.05em' }}>PASTE TEXT TO ANALYSE</label>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Paste the document, statement, email, or court bundle extract here..."
                style={{
                  width: '100%', height: 160, background: T.navy, border: `1px solid ${T.border}`,
                  borderRadius: 8, color: T.white, padding: 12, fontSize: 13, resize: 'vertical',
                  fontFamily: "'Source Serif 4', Georgia, serif", boxSizing: 'border-box', lineHeight: 1.6,
                }}
              />
            </div>

            <button onClick={() => runDetector(activeDetector)} disabled={loading} style={{
              padding: '12px 20px', background: loading ? T.navyLight : T.gold, color: T.navy,
              border: 'none', borderRadius: 8, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 14, fontFamily: "'Playfair Display', Georgia, serif",
            }}>
              {loading ? '⏳ Analysing...' : `🔬 Run ${activeDetector.name}`}
            </button>

            {result && (
              <div style={{ background: T.navy, border: `1px solid ${T.teal}`, borderRadius: 8, padding: 16 }}>
                <div style={{ color: T.teal, fontSize: 11, fontWeight: 700, marginBottom: 8, letterSpacing: '0.1em' }}>FORENSIC ANALYSIS</div>
                <div style={{ color: T.white, fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{result}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats Bar */}
      <div style={{ background: T.navyMid, borderTop: `1px solid ${T.border}`, padding: '16px 32px', display: 'flex', gap: 32, flexWrap: 'wrap' }}>
        {[['18', 'Specialist Detectors'], ['6', 'Legal Categories'], ['100%', 'UK Law Focus'], ['EA 2010', 'Primary Statute']].map(([v, l]) => (
          <div key={l}>
            <div style={{ color: T.gold, fontWeight: 700, fontSize: 18, fontFamily: "'Playfair Display', Georgia, serif" }}>{v}</div>
            <div style={{ color: T.muted, fontSize: 11 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
