import React, { useState } from 'react';

const T = {
  cream: '#F8F1E9', navy: '#0F2C4A', navyM: '#FAF6F0', gold: '#D4AF37',
  goldBg: 'rgba(212,175,55,0.12)', border: 'rgba(15,44,74,0.12)',
  muted: '#1E3A5F', dim: '#64748B', red: '#DC2626', redBg: 'rgba(220,38,38,0.08)',
  success: '#10B981', warning: '#F59E0B',
};

const FAIRWINDS_CONTRADICTIONS = [
  {
    id: 'FW-C1', severity: 'CRITICAL', type: 'ANCHOR LIE',
    title: 'The Core Contradiction: "No Supervisions Until Now"',
    document_a: { ref: '2 May 2024 Investigation Notes', says: 'Claimant stated "No supervisions until now." The MANAGER DID NOT CORRECT THIS STATEMENT.' },
    document_b: { ref: '23 May 2024 Probation Review', says: 'Three supervision documents were produced at the probation review meeting.' },
    legal_point: 'The manager\'s failure to correct the statement at the 2 May 2024 meeting constitutes an admission by conduct (implied admission rule). If supervisions had genuinely occurred, the manager would have been expected to correct the statement. The silence is an admission.',
    questions: [
      '"On 2 May 2024, when Mr Ojiaku said \'No supervisions until now\', why did you not correct him?"',
      '"You were present at the 2 May 2024 meeting when Mr Ojiaku said \'No supervisions until now\' – yes?"',
      '"You are saying supervisions occurred, but on 2 May 2024 you allowed Mr Ojiaku\'s statement to pass unchallenged – why?"',
    ],
    impact: 'Destroys Respondent\'s claim that supervisions occurred before May 2024.',
  },
  {
    id: 'FW-C2', severity: 'CRITICAL', type: 'DOCUMENT SUPPRESSION',
    title: 'Documents Shown But Withheld',
    document_a: { ref: '23 May 2024 Probation Review', says: 'Three supervision records were shown to the Claimant during this meeting.' },
    document_b: { ref: '6 May 2025 Pancott Letter', says: 'Letter certifies that "all documents have been disclosed."' },
    legal_point: 'A document "shown" to an opposing party during proceedings but not formally provided constitutes non-disclosure. The Pancott letter\'s certification of full disclosure is demonstrably false given the 3 documents were shown but withheld. This may constitute contempt of court or perverting the course of justice.',
    questions: [
      '"Can you confirm that on 23 May 2024 you showed Mr Ojiaku three supervision documents?"',
      '"Did you then provide copies of those documents to Mr Ojiaku – yes or no?"',
      '"How can the letter of 6 May 2025 certify all documents disclosed when these three documents were never formally provided?"',
    ],
    impact: 'Pancott letter constitutes false certification. Creates perjury/contempt risk for Respondent.',
  },
  {
    id: 'FW-C3', severity: 'MAJOR', type: 'TIMELINE FRAUD',
    title: 'Leaver Letter vs Employment End Date Claims',
    document_a: { ref: 'Respondent\'s Position', says: 'Employment terminated [earlier date].' },
    document_b: { ref: '26 August 2025 Leaver Letter', says: 'Employment continued until 26 August 2025. Leaver processing confirmed.' },
    legal_point: 'Employment continued until 26 August 2025 per the Leaver Letter and payroll records. Any claim of earlier termination is contradicted by documentary evidence. The three-month limitation period runs from the last act of discrimination or dismissal.',
    questions: [
      '"Your records show employment ending on 26 August 2025 – do you agree?"',
      '"Can you explain how the leaver letter of 26 August 2025 is consistent with your claim of earlier termination?"',
    ],
    impact: 'Establishes correct limitation period and undermines Respondent\'s narrative.',
  },
  {
    id: 'FW-C4', severity: 'MAJOR', type: 'WHISTLEBLOWING',
    title: 'CQC Referrals vs No Detriment Claim',
    document_a: { ref: 'CQC Referrals (GFC-00014695, CAS-1302493, CAS-1302478)', says: 'Claimant made qualifying protected disclosures to the CQC regarding care standards.' },
    document_b: { ref: 'Respondent\'s Defence', says: 'Any treatment of Claimant was unrelated to any protected disclosure.' },
    legal_point: 'Under ERA 1996 s.47B, protected disclosures are followed by a presumption of connection if detriment follows within a reasonable period. The burden is on the Respondent to prove the detriment was for an entirely different reason.',
    questions: [
      '"Were you aware at the time that Mr Ojiaku had made a referral to the CQC?"',
      '"Who in management was informed of the CQC referral?"',
      '"What was the timeline between the CQC referral and any disciplinary action taken against Mr Ojiaku?"',
    ],
    impact: 'Establishes causal link for whistleblowing detriment claim.',
  },
];

const ALDI_CONTRADICTIONS = [
  {
    id: 'AL-C1', severity: 'CRITICAL', type: 'FABRICATED REPORT vs CCTV',
    title: 'The Core Contradiction: False "Wheel Basket" Report',
    document_a: { ref: 'ASEL Security Incident Report', says: 'Security personnel allege the Claimant was involved in a "wheel basket" incident at the Aldi store on 3 December 2025.' },
    document_b: { ref: 'CCTV Footage – Exhibit OO-1', says: 'CCTV footage from the store on 3 December 2025 shows NO wheel basket incident involving the Claimant.' },
    legal_point: 'The security incident report is the sole justification for the detention of the Claimant. If that report is false – which the CCTV directly demonstrates – the entire legal basis for detention collapses. A detention without lawful basis is false imprisonment: Christie v Leachinsky [1947] AC 573.',
    questions: [
      '"Can you point to the moment in the CCTV footage (Exhibit OO-1) where you say the wheel basket incident occurred?"',
      '"Did you write your incident report before or after reviewing the CCTV footage?"',
      '"Is it your evidence that the CCTV footage in Exhibit OO-1 does show a wheel basket incident involving Mr Ojiaku?"',
    ],
    impact: 'Destroys the legal basis for the detention. Establishes false imprisonment. Exposes ASEL to claims of malicious falsehood.',
  },
  {
    id: 'AL-C2', severity: 'CRITICAL', type: 'SPOLIATION',
    title: 'Police Dashcam "Lost" After Complaint Filed',
    document_a: { ref: 'SYP Dashcam Equipment', says: 'SYP officers had active dashcam recording during the 3 December 2025 incident. The dashcam was operating when officers attended.' },
    document_b: { ref: 'SYP SAR Response', says: 'South Yorkshire Police confirm the dashcam footage from 3 December 2025 has been "lost" and is unavailable.' },
    legal_point: 'Spoliation doctrine: where a party destroys or loses evidence relevant to litigation, the court may draw an adverse inference that the evidence would have been unfavourable to that party. SYP had a statutory duty to preserve this evidence upon receipt of complaint CO/0006726.',
    questions: [
      '"When did the dashcam footage first become unavailable?"',
      '"When did SYP first become aware of complaint reference CO/0006726?"',
      '"Was the dashcam footage available after the complaint was filed – yes or no?"',
      '"Who made the decision not to preserve the dashcam footage?"',
    ],
    impact: 'Court should draw adverse inference. Footage would have supported Claimant\'s account.',
  },
  {
    id: 'AL-C3', severity: 'MAJOR', type: 'POLICE COLLUSION',
    title: 'Police Accepted False Account Without Investigation',
    document_a: { ref: 'SYP Officers\' Conduct – 3 December 2025', says: 'Officers attended and accepted the account given by ASEL Security personnel without proper independent investigation.' },
    document_b: { ref: 'Claimant\'s Account + CCTV OO-1', says: 'Claimant\'s account (confirmed by CCTV) is that no wheel basket incident occurred. Officers failed to take or credit the Claimant\'s account.' },
    legal_point: 'Police officers have a duty to act impartially and investigate all accounts fairly. A failure to investigate, combined with acceptance of one party\'s account without scrutiny, may constitute misfeasance in public office where there is evidence of bad faith: Three Rivers DC v Bank of England [2003].',
    questions: [
      '"What steps did you take to independently verify the account given by ASEL Security before acting on it?"',
      '"Did you view the CCTV footage before forming any conclusions?"',
      '"Did you take a statement from Mr Ojiaku before deciding how to proceed?"',
    ],
    impact: 'Supports claim of police collusion and misfeasance.',
  },
];

async function runAIAnalysis(text, caseId, question) {
  const res = await fetch('/api/analyse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, caseId, analysisType: question }),
  });
  const data = await res.json();
  return data.analysis || '';
}

export default function ContradictionReport() {
  const [activeCase, setActiveCase] = useState('aldi');
  const [expandedId, setExpandedId] = useState(null);
  const [customText, setCustomText] = useState('');
  const [customAnalysis, setCustomAnalysis] = useState('');
  const [analysing, setAnalysing] = useState(false);
  const [activeTab, setActiveTab] = useState('known');

  const contradictions = activeCase === 'aldi' ? ALDI_CONTRADICTIONS : FAIRWINDS_CONTRADICTIONS;

  async function analyseCustom() {
    if (!customText.trim()) return;
    setAnalysing(true);
    setCustomAnalysis('');
    try {
      const result = await runAIAnalysis(customText, activeCase, 'contradictions');
      setCustomAnalysis(result);
    } catch (e) { setCustomAnalysis('Error: ' + e.message); }
    setAnalysing(false);
  }

  const sevColor = { CRITICAL: T.red, MAJOR: T.warning, MINOR: T.dim };

  return (
    <div style={{ background: T.cream, fontFamily: "'Inter', sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ color: T.navy, fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>Contradiction & Anchor Lie Report</h2>
        <p style={{ color: T.muted, fontSize: 13, margin: 0 }}>Forensic analysis of inconsistencies. Every contradiction includes cross-examination questions for court.</p>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {[['aldi','Aldi 770MC038',T.red],['fairwinds','Fairwinds 6016884/2025',T.gold]].map(([id, label, color]) => (
          <button key={id} onClick={() => { setActiveCase(id); setExpandedId(null); }} style={{ padding: '10px 20px', borderRadius: 8, border: `2px solid ${activeCase === id ? color : T.border}`, background: activeCase === id ? `${color}15` : 'white', color: T.navy, fontWeight: activeCase === id ? 700 : 400, cursor: 'pointer', fontSize: 13 }}>{label}</button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 0, borderBottom: `2px solid ${T.border}`, marginBottom: 20 }}>
        {[['known','Known Contradictions'],['analyse','AI Analyse New Document']].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{ padding: '10px 20px', background: 'none', border: 'none', borderBottom: activeTab === id ? `3px solid ${T.gold}` : '3px solid transparent', color: activeTab === id ? T.navy : T.dim, fontWeight: activeTab === id ? 700 : 400, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>{label}</button>
        ))}
      </div>

      {activeTab === 'known' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
            {['CRITICAL','MAJOR','MINOR'].map(sev => {
              const count = contradictions.filter(c => c.severity === sev).length;
              return (
                <div key={sev} style={{ background: 'white', borderRadius: 10, padding: '14px 18px', border: `2px solid ${count > 0 ? sevColor[sev] : T.border}` }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: sevColor[sev] }}>{count}</div>
                  <div style={{ fontSize: 12, color: T.dim }}>{sev} contradictions</div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            {contradictions.map(c => (
              <div key={c.id} style={{ background: 'white', borderRadius: 12, border: `2px solid ${expandedId === c.id ? sevColor[c.severity] : T.border}`, overflow: 'hidden' }}>
                <div onClick={() => setExpandedId(expandedId === c.id ? null : c.id)} style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, background: sevColor[c.severity], color: 'white', padding: '3px 8px', borderRadius: 4 }}>{c.severity}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, background: T.goldBg, color: T.navy, padding: '3px 8px', borderRadius: 4 }}>{c.type}</span>
                  </div>
                  <div style={{ flex: 1, fontSize: 14, fontWeight: 700, color: T.navy }}>{c.id}: {c.title}</div>
                  <span style={{ color: T.dim, fontSize: 18 }}>{expandedId === c.id ? '▲' : '▼'}</span>
                </div>

                {expandedId === c.id && (
                  <div style={{ padding: '0 20px 20px', borderTop: `1px solid ${T.border}` }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, margin: '16px 0' }}>
                      <div style={{ padding: '12px 14px', background: T.redBg, borderLeft: `3px solid ${T.red}`, borderRadius: 4 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: T.red, marginBottom: 6 }}>{c.document_a.ref}</div>
                        <div style={{ fontSize: 12, color: T.navy, lineHeight: 1.6 }}>"{c.document_a.says}"</div>
                      </div>
                      <div style={{ padding: '12px 14px', background: T.successBg, borderLeft: `3px solid ${T.success}`, borderRadius: 4 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: T.success, marginBottom: 6 }}>{c.document_b.ref}</div>
                        <div style={{ fontSize: 12, color: T.navy, lineHeight: 1.6 }}>"{c.document_b.says}"</div>
                      </div>
                    </div>

                    <div style={{ background: T.goldBg, borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 12, color: T.muted, lineHeight: 1.6 }}>
                      <strong style={{ color: T.navy }}>Legal Point:</strong> {c.legal_point}
                    </div>

                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: T.navy, marginBottom: 6 }}>Cross-Examination Questions:</div>
                      {c.questions.map((q, i) => (
                        <div key={i} style={{ fontSize: 12, color: T.muted, padding: '6px 0', borderBottom: i < c.questions.length - 1 ? `1px solid ${T.border}` : 'none', lineHeight: 1.5 }}>
                          Q{i + 1}: <em>"{q}"</em>
                        </div>
                      ))}
                    </div>

                    <div style={{ background: T.navy, color: 'white', borderRadius: 6, padding: '8px 12px', fontSize: 11, fontWeight: 600 }}>
                      Impact: {c.impact}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <button onClick={() => window.print()} style={{ padding: '10px 20px', background: T.navy, color: 'white', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>🖨 Print Contradiction Report</button>
          </div>
        </div>
      )}

      {activeTab === 'analyse' && (
        <div style={{ background: 'white', borderRadius: 12, padding: 24, border: `1px solid ${T.border}` }}>
          <h4 style={{ color: T.navy, margin: '0 0 8px' }}>AI Contradiction Finder</h4>
          <p style={{ color: T.muted, fontSize: 12, marginBottom: 12 }}>Paste any document. Claude will compare it against known case facts and find every contradiction, anchor lie, and inconsistency.</p>
          <textarea value={customText} onChange={e => setCustomText(e.target.value)} rows={10} placeholder="Paste document text here..."
            style={{ width: '100%', padding: '12px', borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 12, fontFamily: 'inherit', lineHeight: 1.6, resize: 'vertical', boxSizing: 'border-box' }} />
          <button onClick={analyseCustom} disabled={analysing || !customText.trim()}
            style={{ marginTop: 12, padding: '10px 24px', background: analysing ? T.dim : T.red, color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: analysing ? 'not-allowed' : 'pointer' }}>
            {analysing ? 'Analysing...' : '🔍 Find Contradictions'}
          </button>
          {customAnalysis && (
            <div style={{ marginTop: 16, background: T.navyM, borderRadius: 8, padding: '16px', fontSize: 12, lineHeight: 1.8, color: T.navy, whiteSpace: 'pre-wrap' }}>
              {customAnalysis}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
