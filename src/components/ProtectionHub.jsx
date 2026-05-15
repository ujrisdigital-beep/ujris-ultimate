import React, { useState } from 'react';

const T = {
  navy: '#0D1B2A', navyMid: '#152438', navyLight: '#1E3A5F',
  gold: '#C9A84C', goldLight: 'rgba(201,168,76,0.15)',
  teal: '#0C7B7A', tealLight: 'rgba(12,123,122,0.15)',
  white: '#EEF2F7', muted: '#7A8FA6', border: 'rgba(255,255,255,0.08)',
  red: '#E53E3E', redLight: 'rgba(229,62,62,0.15)',
  purple: '#7B5EA7', purpleLight: 'rgba(123,94,167,0.15)',
};

const SECTIONS = [
  {
    id: 'cps', icon: '👶', title: 'CPS & Safeguarding Rights', color: T.teal,
    content: [
      { heading: 'Your Rights Under Children Act 1989', body: 'Local authorities must work "in partnership" with parents. Safeguarding referrals must be evidence-based. You have the right to see any report made about your children. If safeguarding is used as a weapon in a legal dispute, this constitutes abuse of process.' },
      { heading: 'If Safeguarding Is Weaponised', body: 'If a safeguarding referral coincides with: (a) a legal claim, (b) a protected disclosure, or (c) a complaint against an employer — document the timeline. Courts treat simultaneous timing as evidence of retaliation. Apply for a copy of the referral under DPA 2018.' },
      { heading: 'LADO & Allegations Against Professionals', body: 'If you work in care/education and a safeguarding allegation is made, the Local Authority Designated Officer (LADO) must investigate. You have the right to representation, to know the allegation, and to a fair process. An allegation during tribunal proceedings should be flagged to the tribunal.' },
      { heading: 'Immigrant Families — Enhanced Protection', body: 'Children Act 1989 applies equally regardless of immigration status. No leave to remain does NOT remove parental rights. Children cannot be separated from parents without court order. Section 20 accommodation requires your consent — do NOT sign without legal advice.' },
    ],
  },
  {
    id: 'police', icon: '🚔', title: 'Police Interaction Rights', color: T.red,
    content: [
      { heading: 'Your Right to Silence — PACE 1984', body: 'You have the absolute right to silence at interview. "No Comment" is a complete legal response. The caution says "it may harm your defence if you do not mention something" — but this applies to existing defences, not new ones. Speak to a solicitor before any interview.' },
      { heading: 'Stop and Search — S.1 PACE', body: 'Police may only stop and search if they have reasonable grounds. You have the right to: know the officer\'s name/number, know the reason for the search, receive a copy of the search record. "Reasonable grounds" cannot be based on race, appearance, or past record alone.' },
      { heading: 'Arrest — Rights Under Custody', body: 'On arrest: right to free legal advice (duty solicitor), right to have someone told, right to consult the PACE Codes, right to medical treatment. Do NOT sign anything without legal advice. Do NOT consent to searches beyond what is legally required.' },
      { heading: 'Making a Complaint — IOPC', body: 'Complaints about police conduct go to the Independent Office for Police Conduct (IOPC). Time limit: 12 months from incident. You can complain about: excessive force, racial profiling, failure to investigate, perverting the course of justice, collusion with employers.' },
    ],
  },
  {
    id: 'whistleblowing', icon: '📢', title: 'Whistleblowing Rights', color: T.purple,
    content: [
      { heading: 'Protected Disclosures — PIDA 1998', body: 'Public Interest Disclosure Act 1998 protects workers who make "qualifying disclosures" about: criminal offences, legal obligations breach, health & safety dangers, miscarriage of justice, environmental damage, deliberate concealment. The disclosure must be in the public interest.' },
      { heading: 'Who Can Blow the Whistle', body: 'Workers (not just employees), agency workers, NHS staff, student nurses, and trainees are all protected. You can disclose to: your employer, a prescribed person (CQC, HMRC, Ofsted), or in certain circumstances — publicly. Keep a record of every disclosure made.' },
      { heading: 'Retaliation Is Illegal', body: 'Dismissal, disciplinary action, demotion, or any detriment because of a protected disclosure is automatically unfair dismissal (no qualifying period required). Compensation is uncapped. The burden shifts to the employer to show the reason for treatment was NOT the disclosure.' },
      { heading: 'Prescribed Persons', body: 'You can disclose to: Employment Tribunal Service, HMRC, CQC (health/social care), Ofsted (education), FCA (financial), HSE (health & safety), Environment Agency, Information Commissioner. Disclosure to them does not require employer exhaustion first.' },
    ],
  },
  {
    id: 'vrr', icon: '📄', title: 'VRR Generator', color: T.gold,
    isGenerator: true,
    genType: 'vrr',
  },
  {
    id: 'iopc', icon: '🏛️', title: 'IOPC Complaint Generator', color: T.red,
    isGenerator: true,
    genType: 'iopc',
  },
];

const QUIZ_QUESTIONS = [
  { q: 'You are arrested for an alleged offence connected to your employer. What should you say in interview?', options: ['Answer all questions fully', '"No Comment" and request a solicitor', 'Deny everything immediately', 'Ask to speak to HR first'], answer: 1, explanation: '"No Comment" is a complete and lawful response. Always have a solicitor present before answering any questions.' },
  { q: 'A safeguarding referral is made 2 days after you lodge a tribunal claim. What does this suggest?', options: ['Coincidence — safeguarding is independent', 'Possible retaliation — document the timing as evidence', 'Your claim was wrongly filed', 'You should withdraw the claim'], answer: 1, explanation: 'Simultaneous timing of safeguarding referrals with legal proceedings is a recognised pattern of retaliation. Courts and tribunals take this seriously.' },
  { q: 'Under PIDA 1998, which of these disclosures is protected?', options: ['Telling friends your boss is rude', 'Reporting illegal wage practices to HMRC', 'Complaining about your colleagues\' behaviour', 'Criticising company policy on social media'], answer: 1, explanation: 'Reporting illegal wage practices to HMRC is a qualifying protected disclosure to a prescribed person under PIDA 1998.' },
  { q: 'Police close your criminal case without telling you. What law have they breached?', options: ['Nothing — they have discretion', 'Victims\' Code 2020 — you must be told and consulted', 'PACE 1984 only applies to interviews', 'Only civil courts require notification'], answer: 1, explanation: 'The Victims\' Code 2020 requires police to notify victims before closing cases and provide written reasons.' },
];

export default function ProtectionHub({ caseId }) {
  const [active, setActive] = useState('cps');
  const [genText, setGenText] = useState('');
  const [genResult, setGenResult] = useState('');
  const [genLoading, setGenLoading] = useState(false);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const [tab, setTab] = useState('guides');

  const section = SECTIONS.find(s => s.id === active);

  async function generate(type) {
    if (!genText.trim()) return;
    setGenLoading(true);
    setGenResult('');
    const prompts = {
      vrr: 'You are a UK legal expert. Generate a formal Victim\'s Right to Review (VRR) letter requesting the Crown Prosecution Service or police review a decision not to prosecute or charge. Include: date, reference to relevant incident, grounds for review, Victims\' Code 2020 reference, requested outcome, deadline for response. Use formal legal letter format.',
      iopc: 'You are a UK legal expert. Generate a formal IOPC complaint letter about police misconduct. Include: incident details, specific conduct complained of, relevant law (PACE 1984, Victims\' Code 2020, Police Reform Act 2002), what outcome is sought, whether the complaint is about individual officers or systemic failure. Use formal format.',
    };
    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: prompts[type],
          messages: [{ role: 'user', content: `Case details: ${genText}` }],
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
              if (d.delta?.text) { acc += d.delta.text; setGenResult(acc); }
            } catch {}
          }
        }
      }
    } catch (e) {
      setGenResult(`Error: ${e.message}`);
    }
    setGenLoading(false);
  }

  function answerQuiz(idx) {
    setQuizAnswer(idx);
    if (idx === QUIZ_QUESTIONS[quizIdx].answer) setQuizScore(s => s + 1);
  }

  function nextQuestion() {
    if (quizIdx + 1 >= QUIZ_QUESTIONS.length) {
      setQuizDone(true);
    } else {
      setQuizIdx(q => q + 1);
      setQuizAnswer(null);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: T.navy, color: T.white, fontFamily: "'Source Serif 4', Georgia, serif" }}>
      <div style={{ background: T.navyMid, borderBottom: `1px solid ${T.border}`, padding: '24px 32px' }}>
        <h1 style={{ margin: 0, fontSize: 24, fontFamily: "'Playfair Display', Georgia, serif", color: T.gold }}>🛡️ Protection Hub</h1>
        <p style={{ margin: '4px 0 0', color: T.muted, fontSize: 13 }}>Know your rights — CPS, Police, Whistleblowing, VRR, IOPC</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          {['guides', 'quiz'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '7px 16px', borderRadius: 8, border: `1px solid ${tab === t ? T.gold : T.border}`,
              background: tab === t ? T.goldLight : 'transparent', color: tab === t ? T.gold : T.muted,
              cursor: 'pointer', fontSize: 13, fontWeight: tab === t ? 700 : 400,
            }}>{t === 'guides' ? '📖 Rights Guides' : '🧠 Self-Assessment Quiz'}</button>
          ))}
        </div>
      </div>

      {tab === 'guides' && (
        <div style={{ display: 'flex', minHeight: 'calc(100vh - 120px)' }}>
          <div style={{ width: 220, background: T.navyMid, borderRight: `1px solid ${T.border}`, padding: '16px 0', flexShrink: 0 }}>
            {SECTIONS.map(s => (
              <button key={s.id} onClick={() => { setActive(s.id); setGenResult(''); }} style={{
                width: '100%', textAlign: 'left', background: active === s.id ? `${s.color}22` : 'transparent',
                border: 'none', borderLeft: active === s.id ? `3px solid ${s.color}` : '3px solid transparent',
                color: active === s.id ? s.color : T.muted, padding: '10px 16px',
                cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s',
              }}>
                <span>{s.icon}</span><span>{s.title}</span>
              </button>
            ))}
          </div>

          <div style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
            {section && !section.isGenerator && (
              <div>
                <h2 style={{ color: section.color, fontFamily: "'Playfair Display', Georgia, serif", marginTop: 0, fontSize: 22, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span>{section.icon}</span>{section.title}
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {section.content.map((c, i) => (
                    <div key={i} style={{ background: T.navyMid, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20 }}>
                      <div style={{ color: section.color, fontWeight: 700, fontSize: 14, marginBottom: 10 }}>{c.heading}</div>
                      <div style={{ color: T.muted, fontSize: 13, lineHeight: 1.8 }}>{c.body}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {section && section.isGenerator && (
              <div>
                <h2 style={{ color: section.color, fontFamily: "'Playfair Display', Georgia, serif", marginTop: 0, fontSize: 22, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span>{section.icon}</span>{section.title}
                </h2>
                <div style={{ background: T.navyMid, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24, marginBottom: 20 }}>
                  <label style={{ display: 'block', color: T.muted, fontSize: 12, marginBottom: 8 }}>Describe your situation — who, what, when, where</label>
                  <textarea value={genText} onChange={e => setGenText(e.target.value)}
                    placeholder="e.g. Police closed my assault case without telling me. The assault happened on 15 Jan 2026 at Aldi, ref 770MC038. They failed to collect CCTV and closed the case 3 months later without contacting me..."
                    style={{ width: '100%', height: 140, background: T.navy, border: `1px solid ${T.border}`, borderRadius: 8, color: T.white, padding: 12, fontSize: 13, resize: 'vertical', fontFamily: "'Source Serif 4', Georgia, serif", boxSizing: 'border-box' }} />
                  <button onClick={() => generate(section.genType)} disabled={genLoading} style={{
                    marginTop: 12, padding: '12px 24px', background: section.color, color: '#fff',
                    border: 'none', borderRadius: 8, fontWeight: 700, cursor: genLoading ? 'not-allowed' : 'pointer', fontSize: 14,
                  }}>
                    {genLoading ? '⏳ Generating...' : `✍️ Generate ${section.title}`}
                  </button>
                </div>
                {genResult && (
                  <div style={{ background: T.navyMid, border: `1px solid ${section.color}44`, borderRadius: 12, padding: 24 }}>
                    <div style={{ color: section.color, fontSize: 11, fontWeight: 700, marginBottom: 12, letterSpacing: '0.1em' }}>GENERATED DOCUMENT</div>
                    <pre style={{ color: T.white, fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-wrap', fontFamily: "'Source Serif 4', Georgia, serif", margin: 0 }}>{genResult}</pre>
                    <button onClick={() => navigator.clipboard.writeText(genResult)} style={{ marginTop: 12, padding: '8px 16px', background: T.teal, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>📋 Copy to Clipboard</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'quiz' && (
        <div style={{ padding: 32, maxWidth: 700, margin: '0 auto' }}>
          {!quizDone ? (
            <div>
              <div style={{ background: T.navyMid, border: `1px solid ${T.border}`, borderRadius: 4, height: 4, marginBottom: 24, overflow: 'hidden' }}>
                <div style={{ width: `${((quizIdx) / QUIZ_QUESTIONS.length) * 100}%`, height: '100%', background: T.gold, transition: 'width 0.4s' }} />
              </div>
              <div style={{ color: T.muted, fontSize: 12, marginBottom: 8 }}>Question {quizIdx + 1} of {QUIZ_QUESTIONS.length}</div>
              <h3 style={{ color: T.white, fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, lineHeight: 1.5, marginBottom: 24 }}>{QUIZ_QUESTIONS[quizIdx].q}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {QUIZ_QUESTIONS[quizIdx].options.map((opt, i) => {
                  const answered = quizAnswer !== null;
                  const isCorrect = i === QUIZ_QUESTIONS[quizIdx].answer;
                  const isSelected = i === quizAnswer;
                  let bg = T.navyMid, border = T.border, color = T.white;
                  if (answered && isCorrect) { bg = T.tealLight; border = T.teal; color = T.teal; }
                  else if (answered && isSelected && !isCorrect) { bg = 'rgba(229,62,62,0.12)'; border = T.red; color = T.red; }
                  return (
                    <button key={i} onClick={() => !answered && answerQuiz(i)} style={{
                      padding: '14px 20px', background: bg, border: `2px solid ${border}`,
                      borderRadius: 10, color, fontSize: 14, textAlign: 'left', cursor: answered ? 'default' : 'pointer', transition: 'all 0.2s',
                    }}>{opt}</button>
                  );
                })}
              </div>
              {quizAnswer !== null && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ background: T.tealLight, border: `1px solid ${T.teal}`, borderRadius: 10, padding: 16, marginBottom: 16 }}>
                    <div style={{ color: T.teal, fontWeight: 700, fontSize: 13, marginBottom: 6 }}>📖 Explanation</div>
                    <div style={{ color: T.muted, fontSize: 13, lineHeight: 1.7 }}>{QUIZ_QUESTIONS[quizIdx].explanation}</div>
                  </div>
                  <button onClick={nextQuestion} style={{ padding: '12px 24px', background: T.gold, color: T.navy, border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                    {quizIdx + 1 >= QUIZ_QUESTIONS.length ? 'See Results' : 'Next Question →'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 60, marginBottom: 16 }}>{quizScore >= 3 ? '🏆' : quizScore >= 2 ? '✅' : '📚'}</div>
              <h2 style={{ color: T.gold, fontFamily: "'Playfair Display', Georgia, serif", fontSize: 28 }}>You scored {quizScore}/{QUIZ_QUESTIONS.length}</h2>
              <p style={{ color: T.muted, fontSize: 15, marginBottom: 24 }}>
                {quizScore === 4 ? 'Excellent! You know your rights.' : quizScore >= 2 ? 'Good knowledge — review the guides for areas you missed.' : 'Review the Protection Hub guides to strengthen your knowledge.'}
              </p>
              <button onClick={() => { setQuizIdx(0); setQuizAnswer(null); setQuizScore(0); setQuizDone(false); }} style={{
                padding: '12px 24px', background: T.gold, color: T.navy, border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 14,
              }}>Retake Quiz</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
