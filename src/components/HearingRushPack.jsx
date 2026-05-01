import React, { useState, useRef } from 'react';

const T = {
  cream: '#F8F1E9', navy: '#0F2C4A', navyM: '#FAF6F0', gold: '#D4AF37',
  goldBg: 'rgba(212,175,55,0.12)', border: 'rgba(15,44,74,0.12)',
  muted: '#1E3A5F', dim: '#64748B', red: '#DC2626', redBg: 'rgba(220,38,38,0.08)',
  success: '#10B981', successBg: 'rgba(16,185,129,0.1)',
};

const TODAY = new Date('2026-04-27');
const ALDI_HEARING = new Date('2026-05-05');
const FAIRWINDS_HEARING = new Date('2026-07-22');
const DAYS_TO_ALDI = Math.ceil((ALDI_HEARING - TODAY) / (1000 * 60 * 60 * 24));
const DAYS_TO_FAIRWINDS = Math.ceil((FAIRWINDS_HEARING - TODAY) / (1000 * 60 * 60 * 24));

const PRINT_STYLES = `
@media print {
  body { font-family: 'Times New Roman', serif !important; color: #000 !important; background: white !important; }
  .no-print { display: none !important; }
  .print-only { display: block !important; }
  .page-break { page-break-before: always; }
  h1, h2, h3, h4 { color: #000 !important; }
  .pack-section { page-break-inside: avoid; }
  @page { size: A4; margin: 25mm 20mm; }
}
@media screen {
  .print-only { display: none; }
}
`;

function AldiRushPack() {
  const [customNotes, setCustomNotes] = useState('');
  const [witnessStatement, setWitnessStatement] = useState(
    `I, Onyedika Ojiaku, of [your address], do solemnly and sincerely affirm that:

1. I am the Claimant in this matter (Claim No. 770MC038).

2. On 3 December 2025, I attended the Aldi store at [store address] at approximately [time].

3. I was [describe what you were doing – shopping, at self-checkout etc.].

4. [Describe the incident – when did security approach you, what did they say, what happened next].

5. At no point did I commit any act involving a "wheel basket" or any other improper conduct. The CCTV footage at Exhibit OO-1 confirms this.

6. I was detained by ASEL Security Ltd personnel for approximately [duration]. This detention was unlawful and without justification.

7. South Yorkshire Police were called and attended. [Describe police conduct and any alleged collusion].

8. I subsequently made a formal police complaint (reference CO/0006726) due to the conduct of the officers.

9. I requested dashcam footage via Subject Access Request. South Yorkshire Police confirmed the footage has been "lost." I submit this constitutes spoliation of evidence and invite the Court to draw an adverse inference.

10. The CCTV footage from Exhibit OO-1 directly disproves the false account given by the Respondents' security personnel.

I believe that the facts stated in this witness statement are true.

Signed: ________________________

Date: _________________________

Onyedika Ojiaku`
  );
  const packRef = useRef(null);

  function printPack() {
    window.print();
  }

  return (
    <div>
      <style>{PRINT_STYLES}</style>

      <div className="no-print" style={{ background: T.redBg, border: `2px solid ${T.red}`, borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28 }}>🚨</span>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: T.red }}>ALDI HEARING – {DAYS_TO_ALDI} DAYS TO GO</div>
            <div style={{ fontSize: 13, color: T.red }}>5 May 2026 · Claim 770MC038 · County Court</div>
          </div>
          <button onClick={printPack}
            style={{ marginLeft: 'auto', padding: '12px 28px', background: T.navy, color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            🖨 Print / Save as PDF
          </button>
        </div>
      </div>

      <div ref={packRef} style={{ background: 'white', fontFamily: "'Times New Roman', serif" }}>

        {/* ── COVER PAGE ── */}
        <div className="pack-section" style={{ textAlign: 'center', padding: '60px 40px', borderBottom: '3px solid #000', marginBottom: 0 }}>
          <div style={{ fontSize: 13, letterSpacing: '0.1em', marginBottom: 8 }}>IN THE COUNTY COURT</div>
          <div style={{ fontSize: 13, letterSpacing: '0.1em', marginBottom: 40 }}>CLAIM NO: 770MC038</div>
          <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 20 }}>ONYEDIKA OJIAKU</div>
          <div style={{ fontSize: 16, marginBottom: 4 }}>Claimant</div>
          <div style={{ fontSize: 20, margin: '20px 0' }}>– and –</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
            (1) ALDI STORES LTD<br />
            (2) ASEL SECURITY LTD<br />
            (3) SOUTH YORKSHIRE POLICE
          </div>
          <div style={{ fontSize: 16, marginBottom: 60 }}>Defendants</div>
          <div style={{ borderTop: '2px solid #000', paddingTop: 30, marginTop: 30 }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>HEARING PREPARATION PACK</div>
            <div style={{ fontSize: 14 }}>Hearing Date: 5 May 2026</div>
            <div style={{ fontSize: 14, marginTop: 4 }}>Prepared by: Onyedika Ojiaku (Litigant in Person)</div>
            <div style={{ fontSize: 14, marginTop: 4 }}>Date of Preparation: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          </div>
          <div style={{ marginTop: 40, fontSize: 11, color: '#666' }}>
            CONTAINS: Timeline of Events · Evidence Bundle Index · Contradiction Report · Witness Statement Draft · Cross-Examination Questions
          </div>
        </div>

        {/* ── SECTION 1: TIMELINE ── */}
        <div className="pack-section page-break" style={{ padding: '40px' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, borderBottom: '2px solid #000', paddingBottom: 8, marginBottom: 20 }}>
            SECTION 1: CHRONOLOGICAL TIMELINE OF EVENTS
          </h2>
          <p style={{ fontSize: 12, marginBottom: 20 }}><em>Claim No: 770MC038 | Claimant: Onyedika Ojiaku | Incident: 3 December 2025</em></p>

          {[
            { date: '3 December 2025', title: 'INCIDENT AT ALDI STORE', detail: 'Claimant attended Aldi store. ASEL Security Ltd personnel (Defendant 2) fabricated a false "wheel basket" report against the Claimant. Claimant was subjected to unlawful detention and assault. South Yorkshire Police (Defendant 3) attended and, it is alleged, colluded with the Respondents against the Claimant. Police dashcam was activated and recording during this period.', category: 'KEY EVENT', isKey: true },
            { date: '3 December 2025', title: 'CCTV FOOTAGE CAPTURED – EXHIBIT OO-1', detail: 'CCTV footage from the Aldi store captured the entirety of the incident. This footage (Exhibit OO-1) directly and comprehensively disproves the false "wheel basket" allegation made by ASEL Security Ltd. The Respondents had access to and/or control over this footage.', category: 'KEY EVIDENCE', isKey: true },
            { date: '3 December 2025', title: 'POLICE ATTENDANCE – ALLEGED COLLUSION', detail: 'South Yorkshire Police (SYP) officers attended. Claimant alleges officers failed to investigate the Claimant\'s account fairly and colluded with ASEL Security Ltd. SYP dashcam was recording throughout.', category: 'MISCONDUCT', isKey: true },
            { date: 'December 2025', title: 'Police Complaint Filed – CO/0006726', detail: 'Claimant filed formal police complaint reference CO/0006726 regarding the conduct of SYP officers on 3 December 2025.', category: 'COMPLAINT', isKey: false },
            { date: 'January 2026', title: 'SUBJECT ACCESS REQUEST – SYP DASHCAM RESPONSE', detail: 'Claimant submitted Subject Access Request to South Yorkshire Police requesting dashcam footage from 3 December 2025 incident. SYP confirmed the footage has been "lost." This constitutes SPOLIATION OF EVIDENCE. The Court is invited to draw an adverse inference against the Defendants.', category: 'SPOLIATION', isKey: true },
            { date: 'March 2026', title: 'N244 Application Filed', detail: 'Application Notice N244 filed with the County Court in respect of claim 770MC038.', category: 'DOCUMENT', isKey: false },
            { date: '5 May 2026', title: 'COUNTY COURT HEARING', detail: 'Hearing of Claim 770MC038. Claimant seeks: damages for assault, damages for false imprisonment, damages for collusion, adverse inference from spoliation of dashcam evidence.', category: 'HEARING', isKey: true },
          ].map((ev, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 16, padding: '12px', background: ev.isKey ? '#f0f0f0' : 'transparent', border: ev.isKey ? '1px solid #999' : '1px solid #ddd', borderRadius: 4 }}>
              <div style={{ minWidth: 130, fontSize: 12, fontWeight: 700, paddingTop: 2 }}>{ev.date}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{ev.title}</div>
                  <span style={{ fontSize: 10, background: ev.isKey ? '#000' : '#666', color: 'white', padding: '1px 6px', borderRadius: 3 }}>{ev.category}</span>
                </div>
                <div style={{ fontSize: 12, lineHeight: 1.6 }}>{ev.detail}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── SECTION 2: EVIDENCE BUNDLE INDEX ── */}
        <div className="pack-section page-break" style={{ padding: '40px' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, borderBottom: '2px solid #000', paddingBottom: 8, marginBottom: 20 }}>
            SECTION 2: EVIDENCE BUNDLE INDEX
          </h2>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#000', color: 'white' }}>
                <th style={{ padding: '8px 12px', textAlign: 'left', border: '1px solid #000' }}>Exhibit</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', border: '1px solid #000' }}>Document</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', border: '1px solid #000' }}>Date</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', border: '1px solid #000' }}>Significance</th>
              </tr>
            </thead>
            <tbody>
              {[
                { ref: 'OO-1', doc: 'CCTV Footage from Aldi Store', date: '3 Dec 2025', sig: 'CRITICAL – Directly disproves false "wheel basket" report. Exculpatory.' },
                { ref: 'OO-2', doc: 'N244 Application Notice', date: 'Mar 2026', sig: 'Application filed with County Court.' },
                { ref: 'OO-3', doc: 'Police Complaint CO/0006726', date: 'Dec 2025', sig: 'Formal complaint against SYP conduct. Establishes pattern of misconduct.' },
                { ref: 'OO-4', doc: 'SYP SAR Response re Dashcam', date: 'Jan 2026', sig: 'CRITICAL – SYP confirm dashcam "lost." Spoliation of evidence.' },
                { ref: 'OO-5', doc: 'ASEL Security Incident Report', date: '3 Dec 2025', sig: 'False report alleging "wheel basket" incident. Directly contradicted by OO-1.' },
              ].map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#f9f9f9' }}>
                  <td style={{ padding: '8px 12px', border: '1px solid #ccc', fontWeight: 700 }}>{row.ref}</td>
                  <td style={{ padding: '8px 12px', border: '1px solid #ccc' }}>{row.doc}</td>
                  <td style={{ padding: '8px 12px', border: '1px solid #ccc', whiteSpace: 'nowrap' }}>{row.date}</td>
                  <td style={{ padding: '8px 12px', border: '1px solid #ccc' }}>{row.sig}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: 11, marginTop: 12, fontStyle: 'italic' }}>Note: Add exhibit numbers to any additional documents in numerical order: OO-6, OO-7, etc.</p>
        </div>

        {/* ── SECTION 3: CONTRADICTION REPORT ── */}
        <div className="pack-section page-break" style={{ padding: '40px' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, borderBottom: '2px solid #000', paddingBottom: 8, marginBottom: 20 }}>
            SECTION 3: FORENSIC CONTRADICTION REPORT
          </h2>
          <p style={{ fontSize: 12, marginBottom: 20, fontStyle: 'italic' }}>This section identifies material contradictions between the Defendants' accounts and the documentary evidence.</p>

          {[
            {
              id: 'C-1', severity: 'CRITICAL',
              title: 'THE CCTV CONTRADICTION – False "Wheel Basket" Report',
              what_they_say: 'ASEL Security Ltd (Defendant 2) alleged that the Claimant was involved in a "wheel basket" incident on 3 December 2025, which formed the basis of the detention and referral to police.',
              what_evidence_shows: 'CCTV footage (Exhibit OO-1) directly and comprehensively disproves this account. There is no "wheel basket" incident visible. The CCTV shows [describe what it actually shows].',
              legal_point: 'This fabrication establishes the unlawful basis for the detention. A detention without lawful justification constitutes false imprisonment in tort law (Christie v Leachinsky [1947] AC 573).',
              questions: [
                'Where in the CCTV footage (Exhibit OO-1) do you say you can see a "wheel basket" incident?',
                'Is it right that you wrote your incident report before reviewing the CCTV footage?',
                'Can you explain why the CCTV footage does not show what you describe in your report?',
              ]
            },
            {
              id: 'C-2', severity: 'CRITICAL',
              title: 'SPOLIATION – Dashcam Footage "Lost"',
              what_they_say: 'South Yorkshire Police (Defendant 3) have confirmed via SAR response that dashcam footage from 3 December 2025 has been "lost" or is otherwise unavailable.',
              what_evidence_shows: 'Police dashcam equipment was active during the incident. There is no credible explanation for footage of a contemporaneous incident being "lost." SYP has a statutory duty to retain evidence relevant to complaints under CPIA 1996.',
              legal_point: 'The loss of potentially exculpatory evidence raises a strong inference of spoliation. The Court is invited to draw an adverse inference against SYP: Alfozan v Quastel Midgen LLP [2022]. The destruction/loss of evidence can amount to contempt of court.',
              questions: [
                'When did the dashcam footage first become unavailable?',
                'Who had access to the dashcam system between 3 December 2025 and the date it became "unavailable"?',
                'What is your policy for retaining dashcam footage where a complaint has been filed?',
                'Did you know a complaint (CO/0006726) had been made before the footage was lost?',
              ]
            },
            {
              id: 'C-3', severity: 'MAJOR',
              title: 'POLICE CONDUCT – Alleged Collusion',
              what_they_say: 'South Yorkshire Police officers attended to respond to a security incident at a retail store.',
              what_evidence_shows: 'The Claimant\'s account, supported by what available evidence exists, indicates that the attending officers accepted the false account of ASEL Security without proper investigation, and failed to take the Claimant\'s account seriously or at all.',
              legal_point: 'Police officers have a duty to act impartially. Failure to investigate a detention fairly may constitute misfeasance in public office (Three Rivers DC v Bank of England [2003]).',
              questions: [
                'What steps did you take to obtain the Claimant\'s account of events?',
                'Did you view the CCTV footage (Exhibit OO-1) before forming any conclusion?',
                'Did ASEL Security personnel give you their report before you spoke to the Claimant?',
              ]
            },
          ].map(c => (
            <div key={c.id} className="pack-section" style={{ border: `2px solid ${c.severity === 'CRITICAL' ? '#000' : '#666'}`, borderRadius: 4, padding: '16px 20px', marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
                <span style={{ background: c.severity === 'CRITICAL' ? '#000' : '#444', color: 'white', padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>{c.severity}</span>
                <span style={{ fontWeight: 700, fontSize: 14 }}>[{c.id}] {c.title}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12, fontSize: 12 }}>
                <div style={{ background: '#f5f5f5', padding: '10px 12px', borderLeft: '3px solid #999' }}>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>DEFENDANTS SAY:</div>
                  <div style={{ lineHeight: 1.6 }}>{c.what_they_say}</div>
                </div>
                <div style={{ background: '#f0f7f0', padding: '10px 12px', borderLeft: '3px solid #000' }}>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>EVIDENCE SHOWS:</div>
                  <div style={{ lineHeight: 1.6 }}>{c.what_evidence_shows}</div>
                </div>
              </div>
              <div style={{ fontSize: 12, background: '#fff8e0', padding: '8px 12px', borderLeft: '3px solid #c8a000', marginBottom: 10 }}>
                <strong>Legal Point:</strong> {c.legal_point}
              </div>
              <div style={{ fontSize: 12 }}>
                <strong>Cross-Examination Questions:</strong>
                <ol style={{ margin: '6px 0 0 20px', lineHeight: 1.8 }}>
                  {c.questions.map((q, i) => <li key={i}>"{q}"</li>)}
                </ol>
              </div>
            </div>
          ))}
        </div>

        {/* ── SECTION 4: WITNESS STATEMENT ── */}
        <div className="pack-section page-break" style={{ padding: '40px' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, borderBottom: '2px solid #000', paddingBottom: 8, marginBottom: 20 }}>
            SECTION 4: WITNESS STATEMENT OF ONYEDIKA OJIAKU
          </h2>
          <div style={{ fontSize: 12, border: '1px solid #999', padding: '8px 12px', marginBottom: 16, background: '#f9f9f9' }}>
            <strong>Claim No:</strong> 770MC038 &nbsp;&nbsp; <strong>Claimant:</strong> Onyedika Ojiaku &nbsp;&nbsp; <strong>Hearing:</strong> 5 May 2026
          </div>

          <div className="no-print" style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: T.dim, marginBottom: 8 }}>Edit your witness statement below before printing:</div>
            <textarea
              value={witnessStatement}
              onChange={e => setWitnessStatement(e.target.value)}
              rows={20}
              style={{ width: '100%', padding: '12px', border: '1px solid #ccc', fontSize: 12, fontFamily: "'Times New Roman', serif", lineHeight: 1.8, resize: 'vertical', boxSizing: 'border-box' }}
            />
          </div>

          <div className="print-only" style={{ fontSize: 12, lineHeight: 2, whiteSpace: 'pre-wrap' }}>{witnessStatement}</div>
        </div>

        {/* ── SECTION 5: OPENING STATEMENT ── */}
        <div className="pack-section page-break" style={{ padding: '40px' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, borderBottom: '2px solid #000', paddingBottom: 8, marginBottom: 20 }}>
            SECTION 5: OPENING STATEMENT (SCAFFOLD)
          </h2>
          <div style={{ fontSize: 12, lineHeight: 1.9 }}>
            <p>"Your Honour, I am Onyedika Ojiaku, the Claimant. I am a litigant in person.</p>
            <p>This case concerns events that occurred at an Aldi store on 3 December 2025. On that date, I was unlawfully detained by the Second Defendant's security personnel on the basis of a false report — a report that is directly and comprehensively contradicted by the CCTV footage that I have exhibited as Exhibit OO-1.</p>
            <p>This is a case about three things: <strong>fabrication, collusion, and destruction of evidence.</strong></p>
            <p>First, <strong>fabrication</strong>: ASEL Security Ltd (the Second Defendant) fabricated an incident that never occurred. Their own incident report is disproved by the CCTV footage.</p>
            <p>Second, <strong>collusion</strong>: I will invite the Court to find that South Yorkshire Police (the Third Defendant) accepted the false account of the Second Defendant without proper investigation, in circumstances that suggest partiality.</p>
            <p>Third, <strong>destruction of evidence</strong>: South Yorkshire Police had dashcam footage that would have resolved this matter definitively. They have confirmed it is 'lost.' I will invite this Court to draw the adverse inference that this footage would have supported my account.</p>
            <p>The CCTV footage at Exhibit OO-1 is the cornerstone of this case. I ask the Court to view it carefully."</p>
          </div>
        </div>

        {/* ── SECTION 6: LEGAL FRAMEWORK ── */}
        <div className="pack-section page-break" style={{ padding: '40px' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, borderBottom: '2px solid #000', paddingBottom: 8, marginBottom: 20 }}>
            SECTION 6: LEGAL FRAMEWORK AND REMEDIES SOUGHT
          </h2>
          <div style={{ fontSize: 12, lineHeight: 1.8 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Claims</h3>
            {[
              { claim: '1. Assault', basis: 'Unlawful application of force/apprehension of force by ASEL Security personnel. Defendant: ASEL Security Ltd (D2).', authority: 'Collins v Wilcock [1984] 1 WLR 1172' },
              { claim: '2. False Imprisonment', basis: 'Detention of the Claimant without lawful justification. The false "wheel basket" report (disproved by OO-1) cannot constitute lawful authority. Defendant: ASEL Security Ltd (D2).', authority: 'Christie v Leachinsky [1947] AC 573' },
              { claim: '3. Misfeasance in Public Office', basis: 'SYP officers\' conduct in accepting and acting on a false report without proper investigation. Defendant: South Yorkshire Police (D3).', authority: 'Three Rivers DC v Bank of England [2003]' },
              { claim: '4. Adverse Inference from Spoliation', basis: 'Dashcam footage "lost" after complaint filed. Court should draw adverse inference: footage would have supported Claimant\'s account. Defendant: South Yorkshire Police (D3).', authority: 'Alfozan v Quastel Midgen LLP [2022]; CPIA 1996' },
            ].map((c, i) => (
              <div key={i} style={{ background: i % 2 === 0 ? '#f5f5f5' : 'white', padding: '10px 14px', marginBottom: 8, borderLeft: '3px solid #000' }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{c.claim}</div>
                <div style={{ marginBottom: 4 }}>{c.basis}</div>
                <div style={{ color: '#555', fontStyle: 'italic' }}>Authority: {c.authority}</div>
              </div>
            ))}

            <h3 style={{ fontSize: 14, fontWeight: 700, margin: '20px 0 8px' }}>Remedies Sought</h3>
            <ul style={{ margin: '0 0 0 20px' }}>
              <li>General damages for assault and false imprisonment</li>
              <li>Damages for distress, humiliation, and loss of liberty</li>
              <li>Aggravated damages (conduct of Defendants)</li>
              <li>Adverse inference drawn from spoliation of dashcam evidence</li>
              <li>Costs of proceedings</li>
            </ul>
          </div>
        </div>

        {/* ── ADDITIONAL NOTES ── */}
        {customNotes && (
          <div className="pack-section page-break" style={{ padding: '40px' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, borderBottom: '2px solid #000', paddingBottom: 8, marginBottom: 20 }}>ADDITIONAL NOTES</h2>
            <div style={{ fontSize: 12, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{customNotes}</div>
          </div>
        )}

      </div>

      {/* Controls (no-print) */}
      <div className="no-print" style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap', padding: '20px', background: T.navyM, borderRadius: 12, border: `1px solid ${T.border}` }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 12, color: T.dim, display: 'block', marginBottom: 6, fontWeight: 600 }}>Additional Notes / Instructions to Yourself</label>
          <textarea value={customNotes} onChange={e => setCustomNotes(e.target.value)} placeholder="Any additional notes you want printed at the end of the pack..." rows={3}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 12, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
          <button onClick={printPack} style={{ padding: '14px 28px', background: T.navy, color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            🖨 Print / Save as PDF
          </button>
          <div style={{ fontSize: 11, color: T.dim, textAlign: 'center' }}>
            Chrome: Ctrl+P → Save as PDF<br/>Set margins to "Default" · A4 paper
          </div>
        </div>
      </div>
    </div>
  );
}

function FairwindsRushPack() {
  const packRef = useRef(null);

  return (
    <div>
      <style>{PRINT_STYLES}</style>

      <div className="no-print" style={{ background: T.goldBg, border: `2px solid ${T.gold}`, borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28 }}>⚖</span>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: T.navy }}>FAIRWINDS HEARING – {DAYS_TO_FAIRWINDS} DAYS TO GO</div>
            <div style={{ fontSize: 13, color: T.muted }}>22 July 2026 · Employment Tribunal · Case 6016884/2025</div>
          </div>
          <button onClick={() => window.print()}
            style={{ marginLeft: 'auto', padding: '12px 28px', background: T.navy, color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            🖨 Print / Save as PDF
          </button>
        </div>
      </div>

      <div ref={packRef} style={{ background: 'white', fontFamily: "'Times New Roman', serif" }}>

        {/* COVER */}
        <div style={{ textAlign: 'center', padding: '60px 40px', borderBottom: '3px solid #000' }}>
          <div style={{ fontSize: 13, letterSpacing: '0.1em', marginBottom: 8 }}>IN THE EMPLOYMENT TRIBUNAL</div>
          <div style={{ fontSize: 13, letterSpacing: '0.1em', marginBottom: 40 }}>CASE NO: 6016884/2025</div>
          <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 20 }}>ONYEDIKA OJIAKU</div>
          <div style={{ fontSize: 16, marginBottom: 4 }}>Claimant</div>
          <div style={{ fontSize: 20, margin: '20px 0' }}>– and –</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 60 }}>FAIRWINDS HEALTH CARE LTD</div>
          <div style={{ fontSize: 16, marginBottom: 60 }}>Respondent</div>
          <div style={{ borderTop: '2px solid #000', paddingTop: 30 }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>HEARING PREPARATION PACK</div>
            <div style={{ fontSize: 14 }}>Hearing Date: 22 July 2026</div>
            <div style={{ fontSize: 14, marginTop: 4 }}>Claims: Race Discrimination · Whistleblowing · Constructive Unfair Dismissal</div>
            <div style={{ fontSize: 14, marginTop: 4 }}>Prepared: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          </div>
        </div>

        {/* THE ANCHOR LIE */}
        <div className="pack-section page-break" style={{ padding: '40px' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, borderBottom: '3px solid #000', paddingBottom: 8, marginBottom: 20 }}>SECTION 1: THE ANCHOR LIE – THE CORNERSTONE OF THE CASE</h2>
          <div style={{ border: '3px solid #000', padding: '20px', marginBottom: 20, background: '#fff8f8' }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>THE ANCHOR LIE – 2 May 2024 Investigation Meeting</div>
            <div style={{ fontSize: 13, fontStyle: 'italic', padding: '10px 16px', background: '#f0f0f0', borderLeft: '4px solid #000', marginBottom: 12 }}>
              "No supervisions until now."
              <div style={{ fontSize: 11, marginTop: 4 }}>— Statement by Claimant at investigation meeting, 2 May 2024</div>
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.8 }}>
              <p><strong>Why this is the anchor lie:</strong> The Claimant's statement "No supervisions until now" at the 2 May 2024 investigation meeting was not corrected by the manager present. Under the rules of evidence, a failure to correct a statement in circumstances where correction would be expected constitutes an implied admission. The manager's silence is an admission by conduct that no supervisions had occurred prior to 2 May 2024.</p>
              <p><strong>Why this matters:</strong> The Respondent later attempted to produce supervision records and claim supervisions had taken place. This is directly contradicted by the anchor lie. If supervisions had occurred, the manager would have corrected the Claimant's statement. The manager did not. This is the contradiction on which the Respondent's case collapses.</p>
            </div>
          </div>

          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>The Chain of Fabrication</h3>
          {[
            { step: '1', date: '2 May 2024', event: 'THE ANCHOR LIE', detail: 'Claimant states "No supervisions until now." Manager does NOT correct this. Admission by conduct – no supervisions occurred.', status: 'ESTABLISHED' },
            { step: '2', date: '23 May 2024', event: 'SUPPRESSED DOCUMENTS', detail: 'Three supervision documents shown to Claimant during probation review but then withheld. Why produce documents now that should have existed before the anchor lie?', status: 'SUPPRESSION' },
            { step: '3', date: '6 May 2025', event: 'FALSE CERTIFICATION', detail: 'Pancott letter certifies "all documents disclosed." This is false. The supervision documents were shown but never disclosed.', status: 'FRAUD' },
            { step: '4', date: '26 Aug 2025', event: 'LEAVER LETTER', detail: 'Employment confirmed until August 2025. This proves the timeline and undermines any earlier termination narrative.', status: 'CONFIRMED' },
          ].map(s => (
            <div key={s.step} style={{ display: 'flex', gap: 16, marginBottom: 12, padding: '12px', border: '1px solid #ccc', background: '#fafafa' }}>
              <div style={{ width: 30, height: 30, background: '#000', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>{s.step}</div>
              <div style={{ flex: 1, fontSize: 12 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontWeight: 700 }}>{s.date} – {s.event}</span>
                  <span style={{ fontSize: 10, background: '#000', color: 'white', padding: '1px 6px' }}>{s.status}</span>
                </div>
                <div style={{ lineHeight: 1.6 }}>{s.detail}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CLAIMS */}
        <div className="pack-section page-break" style={{ padding: '40px' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, borderBottom: '2px solid #000', paddingBottom: 8, marginBottom: 20 }}>SECTION 2: LEGAL CLAIMS</h2>
          {[
            { claim: 'Race Discrimination (Direct)', law: 'Equality Act 2010 s.13', facts: 'Claimant (Black British) treated less favourably than comparators of different racial background. Failure to provide supervisions / fraudulent supervision records targets the Claimant.' },
            { claim: 'Whistleblowing Detriment', law: 'ERA 1996 s.47B', facts: 'Protected disclosures made: CQC referrals GFC-00014695, CAS-1302493-Y5Q2J3, CAS-1302478-C5R1C8. Action Fraud RF26020132538C. Subsequent detriment suffered.' },
            { claim: 'Constructive Unfair Dismissal', law: 'ERA 1996 s.95(1)(c)', facts: 'Fundamental breach of contract by Respondent (fraudulent documents, false investigation, suppression of evidence). Claimant entitled to treat contract as repudiated.' },
            { claim: 'Victimisation', law: 'Equality Act 2010 s.27', facts: 'Treatment after CQC referrals/Action Fraud report constitutes victimisation for having done a protected act.' },
          ].map((c, i) => (
            <div key={i} style={{ marginBottom: 16, padding: '12px 16px', borderLeft: '3px solid #000', background: '#f9f9f9', fontSize: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{c.claim}</div>
              <div style={{ color: '#555', marginBottom: 6, fontStyle: 'italic' }}>{c.law}</div>
              <div style={{ lineHeight: 1.6 }}>{c.facts}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default function HearingRushPack() {
  const [activeCase, setActiveCase] = useState('aldi');

  return (
    <div style={{ background: T.cream, fontFamily: "'Inter', sans-serif" }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ color: T.navy, fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>Hearing Rush Pack</h2>
        <p style={{ color: T.muted, fontSize: 13, margin: 0 }}>One-click court-ready hearing pack. Print or save as PDF for your hearing.</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <button onClick={() => setActiveCase('aldi')} style={{
          flex: 1, padding: '16px', borderRadius: 10,
          border: `2px solid ${activeCase === 'aldi' ? T.red : T.border}`,
          background: activeCase === 'aldi' ? T.redBg : 'white',
          cursor: 'pointer', textAlign: 'left',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.red, marginBottom: 2 }}>🚨 URGENT – {DAYS_TO_ALDI} DAYS</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>Aldi – 770MC038</div>
          <div style={{ fontSize: 11, color: T.dim }}>5 May 2026 · County Court</div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>Assault · False Imprisonment · Police Collusion · Spoliation</div>
        </button>
        <button onClick={() => setActiveCase('fairwinds')} style={{
          flex: 1, padding: '16px', borderRadius: 10,
          border: `2px solid ${activeCase === 'fairwinds' ? T.gold : T.border}`,
          background: activeCase === 'fairwinds' ? T.goldBg : 'white',
          cursor: 'pointer', textAlign: 'left',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.gold, marginBottom: 2 }}>📅 {DAYS_TO_FAIRWINDS} DAYS</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>Fairwinds – 6016884/2025</div>
          <div style={{ fontSize: 11, color: T.dim }}>22 July 2026 · Employment Tribunal</div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>Race Discrimination · Whistleblowing · Constructive Dismissal</div>
        </button>
      </div>

      {activeCase === 'aldi' ? <AldiRushPack /> : <FairwindsRushPack />}
    </div>
  );
}
