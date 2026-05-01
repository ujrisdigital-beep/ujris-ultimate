import React, { useState, useEffect } from 'react';

const T = {
  navy: '#0D1B2A', navyMid: '#152438', navyLight: '#1E3A5F',
  gold: '#C9A84C', goldLight: 'rgba(201,168,76,0.15)',
  teal: '#0C7B7A', tealLight: 'rgba(12,123,122,0.15)',
  white: '#EEF2F7', muted: '#7A8FA6', border: 'rgba(255,255,255,0.08)',
  red: '#E53E3E', green: '#22C55E',
};

const QUICK_RECIPIENTS = [
  { label: 'ICO', email: 'casework@ico.org.uk', icon: '🏛️' },
  { label: 'EHRC', email: 'correspondence@equalityhumanrights.com', icon: '⚖️' },
  { label: 'ACAS', email: 'earlyconciliation@acas.org.uk', icon: '🤝' },
  { label: 'IOPC', email: 'enquiries@policeconduct.gov.uk', icon: '🚔' },
  { label: 'Protect (Whistleblowing)', email: 'whistle@protect-advice.org.uk', icon: '📢' },
  { label: 'Citizens Advice', email: 'advice@citizensadvice.org.uk', icon: '💬' },
];

const TEMPLATES = {
  sar: {
    label: 'SAR Follow-Up',
    icon: '📂',
    subject: 'Subject Access Request Follow-Up — [Your Name] — Reference [REF]',
    body: `Dear Data Controller,

I am writing to follow up on my Subject Access Request submitted on [DATE].

Under Article 12 of the UK GDPR and the Data Protection Act 2018, you are required to respond within one calendar month of receipt. This deadline has now passed/is approaching.

I request confirmation of:
1. Receipt of my SAR dated [DATE]
2. The expected response date
3. Any extensions invoked under Article 12(3) and the reasons for same

Failure to respond within the statutory period may result in a complaint to the Information Commissioner's Office under DPA 2018 s.165.

Please respond within 5 working days.

Yours sincerely,
[Your Name]
[Date]`,
  },
  grievance: {
    label: 'Formal Grievance',
    icon: '⚠️',
    subject: 'Formal Grievance — [Your Name] — [Nature of Grievance]',
    body: `Dear [HR Manager / Line Manager],

I write to raise a formal grievance in accordance with your grievance procedure and the ACAS Code of Practice on Disciplinary and Grievance Procedures.

Nature of Grievance: [Describe the discriminatory act / unfair treatment]

Relevant dates: [Key dates]

Protected characteristic affected: [Race / Sex / Disability etc.] under Equality Act 2010

Evidence: [Brief reference to evidence]

I request a formal grievance meeting within [X] working days. I reserve the right to be accompanied by a companion under Employment Relations Act 1999 s.10.

I also request preservation of all records relevant to this matter, including emails, CCTV footage, HR records, and any notes made in relation to my employment.

Yours sincerely,
[Your Name]
[Date]`,
  },
  ico: {
    label: 'ICO Complaint',
    icon: '🏛️',
    subject: 'Data Protection Complaint — [Your Name] — [Organisation]',
    body: `Dear ICO Casework Team,

I write to raise a formal complaint against [Organisation Name] under the Data Protection Act 2018 and UK GDPR.

1. Nature of Complaint
[Organisation] has failed to respond to my Subject Access Request submitted on [DATE] within the one-month statutory deadline under GDPR Article 12.

2. Evidence
- SAR submitted: [DATE]
- No acknowledgement received / acknowledgement only, no response
- Reminder sent: [DATE]

3. Data Requested
[Brief description of what you requested]

4. Outcome Sought
- Full SAR response
- Investigation of the controller's compliance
- Any enforcement action ICO considers appropriate

I confirm I have already complained directly to the organisation.

Yours faithfully,
[Your Name]
[Date]`,
  },
  preservation: {
    label: 'Evidence Preservation Notice',
    icon: '🔒',
    subject: 'Evidence Preservation Notice — Legal Proceedings — [Case Reference]',
    body: `LEGAL NOTICE — EVIDENCE PRESERVATION

Dear [Respondent / Solicitor],

RE: CASE REFERENCE [REF] / CLAIM REFERENCE [CLAIM REF]

I hereby put you on formal notice that I am a party to legal proceedings, reference [CLAIM REF], and require preservation of all evidence relevant to my claim.

You are required to immediately preserve and not destroy, alter, or conceal:

1. All CCTV footage from [LOCATION] for the period [DATE RANGE]
2. All emails, internal communications, and correspondence relating to [Your Name]
3. All HR records, disciplinary records, absence records for [DATES]
4. All witness statements, investigation notes, meeting notes
5. All electronic data including metadata

Destruction of evidence in the knowledge of legal proceedings may constitute spoliation and contempt of court. I reserve all rights to make adverse inference applications.

Please confirm preservation within 48 hours.

[Your Name]
[Date]`,
  },
  settlement: {
    label: 'Settlement Response',
    icon: '🤝',
    subject: 'Response to Settlement Offer — [Case Reference]',
    body: `Dear [Solicitor / Respondent],

RE: [CASE REFERENCE] — Settlement Offer dated [DATE]

Thank you for your letter of [DATE]. I have carefully considered the offer of [£AMOUNT] in full and final settlement.

I am unable to accept this offer for the following reasons:

1. The financial compensation does not reflect the Vento upper band which applies to my claim given [reasons].
2. The proposed NDA/confidentiality clause is unacceptably broad.
3. The offer does not include [specific heads of loss].

My current valuation of the claim stands at approximately [£AMOUNT], comprising:
- Injury to feelings (upper Vento): £[X]
- Loss of earnings: £[X]
- Other losses: £[X]

I remain open to without prejudice discussions on a realistic basis. If you wish to make a further offer, please do so before [DATE].

I reserve all rights.

[Your Name]`,
  },
  iopc: {
    label: 'IOPC Complaint',
    icon: '🚔',
    subject: 'Police Conduct Complaint — [Your Name] — [Incident Date]',
    body: `Dear IOPC,

I write to make a formal complaint about the conduct of [Police Force] in relation to [incident/matter].

1. Incident Details
Date: [DATE]
Location: [LOCATION]
Officers involved: [If known]
Complaint reference (if any): [REF]

2. Nature of Complaint
[Describe: excessive force / failure to investigate / racial profiling / perverting the course of justice / collusion with employer]

3. Legal Basis
I believe the conduct breaches:
- Police Reform Act 2002
- PACE 1984 Code [A/B/C/D]
- Victims' Code 2020
- Equality Act 2010

4. What I Am Seeking
[Apology / Discipline / Referral to CPS / Review of decision]

5. Evidence Available
[Describe evidence you hold]

I confirm this complaint is made within 12 months of the incident.

Yours faithfully,
[Your Name]
[Date]`,
  },
  foi: {
    label: 'FOI Request',
    icon: '🔓',
    subject: 'Freedom of Information Request — [Organisation] — [Subject]',
    body: `Dear Freedom of Information Officer,

I am making this request under the Freedom of Information Act 2000.

I request the following information:

1. [Specific information requested — policies, statistics, internal procedures etc.]
2. [Second item if applicable]

Please note this is a request for recorded information only. I do not require you to create new information.

If this request spans multiple teams, please forward to the appropriate department.

I understand you are required to respond within 20 working days under FOIA 2000 s.10.

If you believe a cost limit or exemption applies, please inform me and advise how the request might be refined.

Yours faithfully,
[Your Name]
[Date]`,
  },
};

export default function EmailDispatchCentre({ caseId }) {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sent, setSent] = useState(() => {
    const s = localStorage.getItem('ujris_sent_emails');
    return s ? JSON.parse(s) : [];
  });
  const [tab, setTab] = useState('compose');
  const [aiAssist, setAiAssist] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInstructions, setAiInstructions] = useState('');
  const [copyDone, setCopyDone] = useState(false);

  useEffect(() => {
    localStorage.setItem('ujris_sent_emails', JSON.stringify(sent));
  }, [sent]);

  function loadTemplate(key) {
    const t = TEMPLATES[key];
    if (t) { setSubject(t.subject); setBody(t.body); }
  }

  function sendEmail() {
    if (!to || !subject || !body) return;
    const entry = { id: Date.now(), to, subject, preview: body.slice(0, 100) + '...', sentAt: new Date().toISOString(), caseRef: caseId };
    setSent(prev => [entry, ...prev]);
    const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailto);
    setTab('sent');
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(`To: ${to}\nSubject: ${subject}\n\n${body}`);
    setCopyDone(true);
    setTimeout(() => setCopyDone(false), 2000);
  }

  async function runAI() {
    if (!aiInstructions.trim() || !body.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: 'You are a UK legal writing expert. Improve the provided email draft according to the instructions. Return only the improved email body text, no preamble.',
          messages: [{ role: 'user', content: `Instructions: ${aiInstructions}\n\nCurrent draft:\n${body}` }],
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
              if (d.delta?.text) { acc += d.delta.text; setBody(acc); }
            } catch {}
          }
        }
      }
    } catch {}
    setAiLoading(false);
    setAiAssist(false);
  }

  return (
    <div style={{ minHeight: '100vh', background: T.navy, color: T.white, fontFamily: "'Source Serif 4', Georgia, serif" }}>
      <div style={{ background: T.navyMid, borderBottom: `1px solid ${T.border}`, padding: '24px 32px' }}>
        <h1 style={{ margin: 0, fontSize: 24, fontFamily: "'Playfair Display', Georgia, serif", color: T.gold }}>📧 Email Dispatch Centre</h1>
        <p style={{ margin: '4px 0 0', color: T.muted, fontSize: 13 }}>Compose, template, and dispatch legal correspondence with full audit trail</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          {['compose', 'sent'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '7px 16px', borderRadius: 8, border: `1px solid ${tab === t ? T.gold : T.border}`,
              background: tab === t ? T.goldLight : 'transparent', color: tab === t ? T.gold : T.muted,
              cursor: 'pointer', fontSize: 13, fontWeight: tab === t ? 700 : 400, textTransform: 'capitalize',
            }}>{t === 'compose' ? '✍️ Compose' : `📤 Sent Log (${sent.length})`}</button>
          ))}
        </div>
      </div>

      {tab === 'compose' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 0, minHeight: 'calc(100vh - 120px)' }}>
          <div style={{ padding: '24px 32px' }}>
            {/* Quick Recipients */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ color: T.muted, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 10 }}>QUICK RECIPIENTS</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {QUICK_RECIPIENTS.map(r => (
                  <button key={r.email} onClick={() => setTo(r.email)} style={{
                    padding: '6px 12px', borderRadius: 20, border: `1px solid ${to === r.email ? T.gold : T.border}`,
                    background: to === r.email ? T.goldLight : 'transparent', color: to === r.email ? T.gold : T.muted,
                    cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4,
                  }}><span>{r.icon}</span><span>{r.label}</span></button>
                ))}
              </div>
            </div>

            {/* Form */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', color: T.muted, fontSize: 11, marginBottom: 4 }}>To *</label>
              <input value={to} onChange={e => setTo(e.target.value)} placeholder="recipient@organisation.gov.uk"
                style={{ width: '100%', background: T.navyMid, border: `1px solid ${T.border}`, borderRadius: 8, color: T.white, padding: '10px 14px', fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', color: T.muted, fontSize: 11, marginBottom: 4 }}>Subject *</label>
              <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject line..."
                style={{ width: '100%', background: T.navyMid, border: `1px solid ${T.border}`, borderRadius: 8, color: T.white, padding: '10px 14px', fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', color: T.muted, fontSize: 11, marginBottom: 4 }}>Body *</label>
              <textarea value={body} onChange={e => setBody(e.target.value)} rows={16}
                style={{ width: '100%', background: T.navyMid, border: `1px solid ${T.border}`, borderRadius: 8, color: T.white, padding: '12px 14px', fontSize: 13, resize: 'vertical', fontFamily: "'Source Serif 4', Georgia, serif", lineHeight: 1.7, boxSizing: 'border-box' }} />
            </div>

            {aiAssist && (
              <div style={{ background: T.navyMid, border: `1px solid ${T.teal}`, borderRadius: 10, padding: 16, marginBottom: 16 }}>
                <label style={{ display: 'block', color: T.teal, fontSize: 12, marginBottom: 6 }}>AI Improvement Instructions</label>
                <input value={aiInstructions} onChange={e => setAiInstructions(e.target.value)} placeholder="e.g. Make it more formal, add reference to EA 2010 s.13, strengthen the legal argument..."
                  style={{ width: '100%', background: T.navy, border: `1px solid ${T.border}`, borderRadius: 6, color: T.white, padding: '8px 10px', fontSize: 13, boxSizing: 'border-box' }} />
                <button onClick={runAI} disabled={aiLoading} style={{ marginTop: 10, padding: '8px 16px', background: T.teal, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
                  {aiLoading ? '⏳ Improving...' : '✨ Improve with AI'}
                </button>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button onClick={sendEmail} style={{ padding: '12px 24px', background: T.gold, color: T.navy, border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>📤 Open in Mail App</button>
              <button onClick={copyToClipboard} style={{ padding: '12px 24px', background: T.teal, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                {copyDone ? '✅ Copied!' : '📋 Copy to Clipboard'}
              </button>
              <button onClick={() => setAiAssist(a => !a)} style={{ padding: '12px 20px', background: 'transparent', color: T.muted, border: `1px solid ${T.border}`, borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>✨ AI Assist</button>
            </div>
          </div>

          {/* Templates Panel */}
          <div style={{ background: T.navyMid, borderLeft: `1px solid ${T.border}`, padding: 20, overflowY: 'auto' }}>
            <div style={{ color: T.muted, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 12 }}>AI TEMPLATES</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.entries(TEMPLATES).map(([key, t]) => (
                <button key={key} onClick={() => loadTemplate(key)} style={{
                  width: '100%', textAlign: 'left', background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.border}`,
                  borderRadius: 8, padding: '12px 14px', cursor: 'pointer', color: T.white, fontSize: 13,
                  display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s',
                }}>
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'sent' && (
        <div style={{ padding: '24px 32px' }}>
          {sent.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: T.muted }}>No emails sent yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {sent.map(e => (
                <div key={e.id} style={{ background: T.navyMid, border: `1px solid ${T.border}`, borderRadius: 12, padding: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ color: T.gold, fontSize: 13, fontWeight: 600 }}>{e.subject}</div>
                    <div style={{ color: T.muted, fontSize: 11 }}>{new Date(e.sentAt).toLocaleString('en-GB')}</div>
                  </div>
                  <div style={{ color: T.teal, fontSize: 12, marginBottom: 6 }}>To: {e.to}</div>
                  <div style={{ color: T.muted, fontSize: 12, fontStyle: 'italic' }}>{e.preview}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
