import React, { useState, useRef } from 'react';

const T = {
  navy: '#0D1B2A', navyMid: '#152438', navyLight: '#1E3A5F',
  gold: '#C9A84C', goldLight: 'rgba(201,168,76,0.15)',
  teal: '#0C7B7A', tealLight: 'rgba(12,123,122,0.15)',
  white: '#EEF2F7', muted: '#7A8FA6',
  border: 'rgba(255,255,255,0.08)',
  red: '#E53E3E', redLight: 'rgba(229,62,62,0.15)',
  green: '#38A169', greenLight: 'rgba(56,161,105,0.15)',
};

const SAR_TEMPLATES = [
  {
    id: 'employer',
    label: 'Employer SAR',
    icon: '🏢',
    recipient: 'HR Department / Data Protection Officer',
    subject: 'Subject Access Request under UK GDPR Article 15 / DPA 2018 Schedule 2',
    body: `I am writing to make a Subject Access Request pursuant to Article 15 of the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.

Please provide me with:
1. All personal data you hold about me, including but not limited to:
   - HR records, personnel files, appraisal records
   - All emails mentioning my name or containing my personal data
   - Grievance, disciplinary and appeal records
   - Sickness/absence records and any occupational health referrals
   - CCTV footage in which I appear
   - Any notes from meetings I attended
   - References provided about me
   - Any communications shared with third parties about me

2. The purposes for which my personal data is processed
3. The categories of personal data held
4. The recipients or categories of recipients to whom the personal data has been disclosed
5. The retention period (or criteria used to determine it)
6. The source of the personal data (where not collected directly from me)

I understand you have one calendar month from receipt of this request to respond. Please confirm receipt by return.

If you require proof of identity, please advise what is needed and I will provide it promptly.`,
  },
  {
    id: 'police',
    label: 'Police / IOPC SAR',
    icon: '👮',
    recipient: 'Data Protection Officer, [Police Force]',
    subject: 'Subject Access Request — UK GDPR Article 15 / Law Enforcement Processing',
    body: `I am writing to make a Subject Access Request in respect of all personal data you hold about me, processed under:
- Part 3 DPA 2018 (law enforcement processing)
- UK GDPR (non-law enforcement processing)

Please provide:
1. All records, incident logs, crime reference numbers relating to me
2. All intelligence records, including speculative / soft intelligence
3. Stop and search records (where I am the subject)
4. Any data shared with other agencies (social services, immigration, HMRC etc.)
5. Body-worn video or CCTV footage in which I appear (specify date/location if known)
6. All CRIS (Crime Recording Information System) entries referencing me
7. Any PNC or CRIMINT entries

Relevant dates/incidents: [INSERT DATES AND LOCATIONS]

I understand the force has one month to respond. I will verify my identity as required.`,
  },
  {
    id: 'council',
    label: 'Council / Public Body',
    icon: '🏛️',
    recipient: 'Data Protection Officer / Information Governance Team',
    subject: 'Subject Access Request — UK GDPR Article 15',
    body: `I write to exercise my right of access under Article 15 UK GDPR and the Data Protection Act 2018.

Please provide all personal data you hold about me, including:
1. All case records, assessments, correspondence relating to me or my household
2. Notes of any meetings, visits or telephone calls
3. Any referrals made to or received from third parties about me
4. Internal communications (emails, memos) in which I am mentioned
5. Any risk assessments or action plans relating to me
6. Records of any decisions made about me and the reasons for them

Relevant service/case reference (if known): [INSERT]
Relevant time period: [INSERT]

Please acknowledge receipt and confirm the expected response date.`,
  },
  {
    id: 'healthcare',
    label: 'NHS / Healthcare',
    icon: '🏥',
    recipient: 'Data Protection Officer / Records Department',
    subject: 'Subject Access Request — UK GDPR Article 15 / Access to Health Records',
    body: `I am making a Subject Access Request under Article 15 of the UK GDPR and the Data Protection Act 2018, and where applicable, the Access to Health Records Act 1990.

Please provide:
1. All medical records held about me, including GP records, hospital records, consultant letters
2. Any mental health records
3. Any occupational health assessments
4. Referrals made by or about me
5. Any records disclosed to third parties (employers, insurers, courts)
6. Any reports or assessments prepared about my capacity or condition

Date of birth: [INSERT]
NHS number (if known): [INSERT]
Relevant dates or departments: [INSERT]

I understand the response time is one calendar month.`,
  },
];

const ANALYSIS_PROMPT = `You are a UK data protection expert analysing a Subject Access Request (SAR) response.

When the user pastes a SAR response or describes what they received, analyse it and identify:
1. MISSING DATA — What should have been included but appears absent (based on UK SAR law and common employer/authority data categories)
2. REDACTIONS — Flag excessive or unlawful redactions (SAR exemptions under DPA 2018 Schedule 2 must be specifically claimed)
3. TIME BREACHES — Was the response within 1 calendar month? Any extension claimed?
4. THIRD PARTY DISCLOSURES — Has data been shared without consent?
5. RECOMMENDED ACTION — What should the requester do next?

Be specific, cite DPA 2018 / UK GDPR provisions where relevant, and identify any ICO complaint grounds.`;

export default function SARIntelligence() {
  const [activeTab, setActiveTab] = useState('generate');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customRecipient, setCustomRecipient] = useState('');
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);
  const [sarText, setSarText] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [copied, setCopied] = useState(false);

  const template = SAR_TEMPLATES.find(t => t.id === selectedTemplate);

  function buildLetter() {
    if (!template) return '';
    const today = new Date(customDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    return `${today}

To: ${customRecipient || template.recipient}

Dear Sir/Madam,

Re: ${template.subject}

${template.body}

Yours faithfully,

[YOUR FULL NAME]
[YOUR ADDRESS]
[YOUR EMAIL]
[YOUR PHONE]`;
  }

  async function analyse() {
    if (!sarText.trim() || streaming) return;
    setAnalysis('');
    setStreaming(true);
    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1500,
          stream: true,
          system: ANALYSIS_PROMPT,
          messages: [{ role: 'user', content: `Please analyse this SAR response:\n\n${sarText}` }],
        }),
      });

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let text = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = dec.decode(value);
        for (const line of chunk.split('\n')) {
          if (line.startsWith('data: ')) {
            try {
              const ev = JSON.parse(line.slice(6));
              const delta = ev.delta?.text || '';
              if (delta) { text += delta; setAnalysis(text); }
            } catch { /* skip */ }
          }
        }
      }
    } catch { setAnalysis('⚠️ Analysis failed. Please try again.'); }
    setStreaming(false);
  }

  const copy = (text) => {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const tabs = [
    { id: 'generate', label: '📝 Generate SAR Letter' },
    { id: 'analyse', label: '🔍 Analyse SAR Response' },
    { id: 'rights', label: '⚖️ Know Your Rights' },
  ];

  return (
    <div style={{ padding: '28px 32px', maxWidth: 960, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: T.white, fontFamily: "'Playfair Display', serif", fontSize: 26, margin: 0 }}>📂 SAR Intelligence</h1>
        <p style={{ color: T.muted, margin: '6px 0 0', fontSize: 13 }}>Generate Subject Access Requests and analyse SAR responses for UK GDPR / DPA 2018 compliance</p>
      </div>

      {/* Alert */}
      <div style={{ background: T.goldLight, border: `1px solid ${T.gold}`, borderRadius: 10, padding: '12px 18px', marginBottom: 24, fontSize: 12, color: T.gold }}>
        ⚖️ <strong>Your Right:</strong> You can request ALL personal data held about you. Data controllers have <strong>one calendar month</strong> to respond. Refusal or excessive redaction can be reported to the <strong>ICO (ico.org.uk)</strong> — free of charge.
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: T.navyMid, borderRadius: 10, padding: 4, marginBottom: 28, border: `1px solid ${T.border}`, width: 'fit-content' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
            background: activeTab === t.id ? T.gold : 'transparent', color: activeTab === t.id ? T.navy : T.muted,
          }}>{t.label}</button>
        ))}
      </div>

      {activeTab === 'generate' && (
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20 }}>
          <div>
            <div style={{ color: T.muted, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 10 }}>SELECT RECIPIENT TYPE</div>
            {SAR_TEMPLATES.map(t => (
              <button key={t.id} onClick={() => setSelectedTemplate(t.id)} style={{
                width: '100%', textAlign: 'left', padding: '12px 16px', borderRadius: 10, marginBottom: 8,
                border: `1px solid ${selectedTemplate === t.id ? T.gold : T.border}`,
                background: selectedTemplate === t.id ? T.goldLight : T.navyMid,
                color: selectedTemplate === t.id ? T.gold : T.muted, cursor: 'pointer', fontSize: 13,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span>{t.icon}</span><span>{t.label}</span>
              </button>
            ))}
          </div>
          <div>
            {template ? (
              <div>
                <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ color: T.muted, fontSize: 11, display: 'block', marginBottom: 4 }}>Recipient Name/Organisation</label>
                    <input value={customRecipient} onChange={e => setCustomRecipient(e.target.value)}
                      placeholder={template.recipient}
                      style={{ width: '100%', background: T.navyMid, border: `1px solid ${T.border}`, borderRadius: 8, padding: '8px 12px', color: T.white, fontSize: 12, boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ color: T.muted, fontSize: 11, display: 'block', marginBottom: 4 }}>Date</label>
                    <input type="date" value={customDate} onChange={e => setCustomDate(e.target.value)}
                      style={{ background: T.navyMid, border: `1px solid ${T.border}`, borderRadius: 8, padding: '8px 12px', color: T.white, fontSize: 12 }} />
                  </div>
                </div>
                <div style={{ background: T.navyMid, border: `1px solid ${T.border}`, borderRadius: 12, padding: '20px 24px', marginBottom: 12 }}>
                  <pre style={{ color: T.white, fontSize: 12, lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0, fontFamily: "'Source Serif 4', serif" }}>
                    {buildLetter()}
                  </pre>
                </div>
                <button onClick={() => copy(buildLetter())} style={{
                  background: copied ? T.teal : T.gold, color: T.navy, border: 'none',
                  borderRadius: 10, padding: '10px 24px', fontWeight: 700, cursor: 'pointer', fontSize: 13,
                }}>{copied ? '✓ Copied to clipboard' : '📋 Copy SAR Letter'}</button>
              </div>
            ) : (
              <div style={{ background: T.navyMid, border: `1px solid ${T.border}`, borderRadius: 12, padding: '48px', textAlign: 'center', color: T.muted, fontSize: 13 }}>
                ← Select a recipient type to generate your SAR letter
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'analyse' && (
        <div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ color: T.muted, fontSize: 12, display: 'block', marginBottom: 8 }}>Paste your SAR response below (or describe what you received):</label>
            <textarea value={sarText} onChange={e => setSarText(e.target.value)} rows={8}
              placeholder="Paste the full text of the SAR response you received, or describe what was included/excluded..."
              style={{ width: '100%', background: T.navyMid, border: `1px solid ${T.border}`, borderRadius: 12, padding: '14px 18px', color: T.white, fontSize: 13, resize: 'vertical', outline: 'none', fontFamily: "'Source Serif 4', serif", boxSizing: 'border-box' }} />
          </div>
          <button onClick={analyse} disabled={!sarText.trim() || streaming} style={{
            background: streaming ? 'rgba(12,123,122,0.4)' : T.teal, color: T.white, border: 'none',
            borderRadius: 10, padding: '10px 24px', fontWeight: 700, cursor: streaming ? 'wait' : 'pointer', fontSize: 13, marginBottom: 20,
          }}>{streaming ? '🔍 Analysing...' : '🔍 Analyse SAR Response'}</button>

          {analysis && (
            <div style={{ background: T.navyMid, border: `1px solid ${T.teal}`, borderRadius: 12, padding: '20px 24px' }}>
              <div style={{ color: T.teal, fontSize: 11, fontWeight: 700, marginBottom: 12, letterSpacing: '0.1em' }}>UJRIS SAR ANALYSIS</div>
              <pre style={{ color: T.white, fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0, fontFamily: "'Source Serif 4', serif" }}>{analysis}</pre>
            </div>
          )}
        </div>
      )}

      {activeTab === 'rights' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { icon: '📋', title: 'What is a SAR?', text: 'A Subject Access Request (SAR) is your right under Article 15 UK GDPR to obtain a copy of all personal data held about you by any organisation. There is no fee. They must respond within one calendar month.' },
            { icon: '⏰', title: 'Time Limits', text: 'The controller has 1 calendar month from receipt. They may extend by a further 2 months for complex/numerous requests — but must tell you within the first month.' },
            { icon: '🚫', title: 'Common Unlawful Refusals', text: 'Controllers cannot refuse simply because the data is in emails, relates to a dispute, or they consider the request "vexatious" without genuine grounds. Challenge these refusals via the ICO.' },
            { icon: '📂', title: 'What Must Be Disclosed', text: 'All personal data — emails, letters, notes, reports, database entries, CCTV, call recordings, and third-party disclosures. Exemptions (legal privilege, crime prevention) must be explicitly claimed.' },
            { icon: '⚖️', title: 'If They Refuse or Delay', text: 'Complain to the ICO (ico.org.uk/make-a-complaint) — free. You can also apply to the County Court under s167 DPA 2018. Legal aid may be available. UJRIS can help you draft your ICO complaint.' },
          ].map(item => (
            <div key={item.icon} style={{ background: T.navyMid, border: `1px solid ${T.border}`, borderRadius: 12, padding: '18px 22px', display: 'flex', gap: 16 }}>
              <div style={{ fontSize: 28, flexShrink: 0 }}>{item.icon}</div>
              <div>
                <div style={{ color: T.gold, fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{item.title}</div>
                <div style={{ color: T.muted, fontSize: 13, lineHeight: 1.6 }}>{item.text}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
