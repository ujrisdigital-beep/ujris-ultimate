import React, { useState } from 'react';

const T = {
  cream: '#F8F1E9', navy: '#0F2C4A', navyM: '#FAF6F0', gold: '#D4AF37',
  goldBg: 'rgba(212,175,55,0.12)', border: 'rgba(15,44,74,0.12)',
  muted: '#1E3A5F', dim: '#64748B', red: '#DC2626', redBg: 'rgba(220,38,38,0.08)',
  success: '#10B981', successBg: 'rgba(16,185,129,0.1)', warning: '#F59E0B',
};

const CASE_LAW = [
  { ref: 'Equality Act 2010 s.13', title: 'Direct Discrimination', summary: 'Less favourable treatment because of a protected characteristic.' },
  { ref: 'Equality Act 2010 s.19', title: 'Indirect Discrimination', summary: 'A provision, criterion or practice that puts those with a protected characteristic at a particular disadvantage.' },
  { ref: 'Equality Act 2010 s.20-21', title: 'Reasonable Adjustments', summary: 'Duty on employers to make reasonable adjustments for disabled employees.' },
  { ref: 'ERA 1996 s.98', title: 'Unfair Dismissal', summary: 'Dismissal is unfair unless employer can show substantial reason and followed fair procedure.' },
  { ref: 'ERA 1996 s.43A-43L', title: 'Protected Disclosures (Whistleblowing)', summary: 'Workers protected from detriment for making qualifying disclosures in the public interest.' },
  { ref: 'Equality Act 2010 s.26', title: 'Harassment', summary: 'Unwanted conduct related to protected characteristic that violates dignity or creates hostile environment.' },
  { ref: 'Equality Act 2010 s.27', title: 'Victimisation', summary: 'Treating someone badly because they did or might do a protected act under the Equality Act.' },
  { ref: 'Vento v Chief Constable [2002]', title: 'Injury to Feelings (Vento Bands)', summary: 'Injury to feelings awards: Lower (£1,100–£11,200), Middle (£11,200–£33,700), Upper (£33,700–£56,200).' },
];

const SYSTEM_PROMPT = `You are a UK employment law reasoning engine. You are NOT giving legal advice — you are helping a self-represented claimant understand the legal framework.

Analyse the case facts provided. For each analysis:
1. IDENTIFY the legal issues (cite specific Equality Act 2010 sections, ERA 1996, or relevant case law)
2. ASSESS the strength of each issue (Strong/Moderate/Weak) with reasoning
3. IDENTIFY what evidence is needed and what is missing
4. PREDICT likely outcome with confidence percentage (be realistic and honest)
5. FLAG any limitation period issues (Employment Tribunal claims must usually be filed within 3 months less one day)
6. RECOMMEND next actions in priority order

Be specific. Cite sections. Use professional but accessible language. Always caveat that this is informational only and not a substitute for legal advice.`;

async function streamAI(system, userMsg, onChunk, onDone) {
  try {
    const response = await fetch('/api/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'claude-opus-4-5-20251101', max_tokens: 2000, stream: true, system, messages: [{ role: 'user', content: userMsg }] }),
    });
    if (!response.ok) { onChunk('⚠ AI unavailable. Please try again.'); onDone('Error'); return; }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let full = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      for (const line of chunk.split('\n')) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.delta?.text) { full += data.delta.text; onChunk(full); }
          } catch (e) { }
        }
      }
    }
    onDone(full);
  } catch (err) { onChunk('❌ ' + err.message); onDone('Error'); }
}

export default function LegalReasoningEngine() {
  const [facts, setFacts] = useState('');
  const [characteristics, setCharacteristics] = useState([]);
  const [caseType, setCaseType] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('analyse');
  const [confidence, setConfidence] = useState(null);

  const CHARACTERISTICS = ['Age','Disability','Gender Reassignment','Marriage & Civil Partnership','Pregnancy & Maternity','Race','Religion or Belief','Sex','Sexual Orientation'];

  function toggleChar(c) {
    setCharacteristics(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  }

  async function runAnalysis() {
    if (!facts.trim()) return;
    setLoading(true);
    setAnalysis('');
    setConfidence(null);

    const userMsg = `CASE FACTS:\n${facts}\n\nCASE TYPE: ${caseType || 'Not specified'}\n\nPROTECTED CHARACTERISTICS INVOLVED: ${characteristics.join(', ') || 'None specified'}\n\nPlease provide a full legal reasoning analysis.`;

    await streamAI(SYSTEM_PROMPT, userMsg,
      (text) => setAnalysis(text),
      (full) => {
        setLoading(false);
        const pctMatch = full.match(/(\d{1,3})%/g);
        if (pctMatch) {
          const nums = pctMatch.map(p => parseInt(p)).filter(n => n >= 20 && n <= 95);
          if (nums.length) setConfidence(Math.round(nums.reduce((a, b) => a + b, 0) / nums.length));
        }
      }
    );
  }

  const tabs = [['analyse','Legal Analysis'],['law','Case Law Library'],['timeline','Timeline Checker']];

  return (
    <div style={{ background: T.cream, minHeight: '60vh', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ color: T.navy, fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>Legal Reasoning Engine</h2>
        <p style={{ color: T.muted, fontSize: 13, margin: 0 }}>AI-powered legal analysis citing Equality Act 2010 and ERA 1996. Not legal advice.</p>
      </div>

      <div style={{ display: 'flex', gap: 0, borderBottom: `2px solid ${T.border}`, marginBottom: 24 }}>
        {tabs.map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{
            padding: '10px 20px', background: 'none', border: 'none', borderBottom: activeTab === id ? `3px solid ${T.gold}` : '3px solid transparent',
            color: activeTab === id ? T.navy : T.dim, fontWeight: activeTab === id ? 700 : 400, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit',
          }}>{label}</button>
        ))}
      </div>

      {activeTab === 'analyse' && (
        <div>
          <div style={{ background: 'white', borderRadius: 12, padding: 20, border: `1px solid ${T.border}`, marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, color: T.dim, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Protected Characteristics</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {CHARACTERISTICS.map(c => (
                <button key={c} onClick={() => toggleChar(c)} style={{
                  padding: '6px 12px', borderRadius: 20, border: `1px solid ${characteristics.includes(c) ? T.navy : T.border}`,
                  background: characteristics.includes(c) ? T.navy : 'transparent', color: characteristics.includes(c) ? 'white' : T.muted,
                  fontSize: 11, cursor: 'pointer', transition: 'all 0.15s',
                }}>{c}</button>
              ))}
            </div>

            <label style={{ display: 'block', fontSize: 12, color: T.dim, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Case Type</label>
            <select value={caseType} onChange={e => setCaseType(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${T.border}`, marginBottom: 16, fontSize: 13, fontFamily: 'inherit' }}>
              <option value="">Select...</option>
              {['Direct Discrimination','Indirect Discrimination','Harassment','Victimisation','Failure to Make Reasonable Adjustments','Unfair Dismissal','Constructive Dismissal','Whistleblowing Detriment','Equal Pay','Other'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            <label style={{ display: 'block', fontSize: 12, color: T.dim, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Case Facts</label>
            <textarea value={facts} onChange={e => setFacts(e.target.value)} rows={8}
              placeholder="Describe your case in detail: what happened, when, who was involved, what was said, what documentation you have, what outcome you experienced..."
              style={{ width: '100%', padding: '12px', borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6 }} />

            <button onClick={runAnalysis} disabled={loading || !facts.trim()}
              style={{ marginTop: 12, padding: '12px 28px', background: loading ? T.dim : T.gold, color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Analysing...' : 'Run Legal Analysis'}
            </button>
          </div>

          {(analysis || loading) && (
            <div style={{ background: 'white', borderRadius: 12, padding: 24, border: `1px solid ${T.border}` }}>
              {confidence !== null && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, padding: '12px 16px', background: confidence >= 60 ? T.successBg : T.redBg, borderRadius: 8 }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: confidence >= 60 ? T.success : T.red }}>{confidence}%</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.navy }}>AI Confidence</div>
                    <div style={{ fontSize: 11, color: T.dim }}>{confidence >= 70 ? 'Strong case indicators' : confidence >= 50 ? 'Moderate case indicators' : 'Weak case – review evidence'}</div>
                  </div>
                </div>
              )}
              <div style={{ fontSize: 13, lineHeight: 1.8, color: T.navy, whiteSpace: 'pre-wrap' }}>{analysis}</div>
              {loading && <div style={{ display: 'inline-block', width: 8, height: 16, background: T.gold, animation: 'blink 1s step-start infinite' }} />}
            </div>
          )}
        </div>
      )}

      {activeTab === 'law' && (
        <div style={{ display: 'grid', gap: 12 }}>
          {CASE_LAW.map(law => (
            <div key={law.ref} style={{ background: 'white', borderRadius: 12, padding: 16, border: `1px solid ${T.border}`, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ background: T.goldBg, color: T.navy, padding: '6px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', minWidth: 100, textAlign: 'center' }}>{law.ref}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.navy, marginBottom: 4 }}>{law.title}</div>
                <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.5 }}>{law.summary}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'timeline' && (
        <div style={{ background: 'white', borderRadius: 12, padding: 24, border: `1px solid ${T.border}` }}>
          <h3 style={{ color: T.navy, margin: '0 0 16px' }}>Limitation Period Checker</h3>
          <p style={{ color: T.muted, fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>Employment Tribunal claims must usually be submitted within <strong>3 months less one day</strong> of the last act of discrimination or dismissal. ACAS Early Conciliation must be initiated first and pauses the clock.</p>
          <LimitationChecker />
        </div>
      )}

      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  );
}

function LimitationChecker() {
  const [incidentDate, setIncidentDate] = useState('');
  const [acasStart, setAcasStart] = useState('');
  const [acasEnd, setAcasEnd] = useState('');
  const [result, setResult] = useState(null);

  function calculate() {
    const incident = new Date(incidentDate);
    const deadline = new Date(incident);
    deadline.setMonth(deadline.getMonth() + 3);
    deadline.setDate(deadline.getDate() - 1);

    let extension = 0;
    if (acasStart && acasEnd) {
      const s = new Date(acasStart);
      const e = new Date(acasEnd);
      extension = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
      deadline.setDate(deadline.getDate() + extension);
    }

    const today = new Date();
    const daysLeft = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
    setResult({ deadline: deadline.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), daysLeft, extension });
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <label style={{ fontSize: 12, color: T.dim, display: 'block', marginBottom: 4 }}>Date of last discriminatory act / dismissal</label>
          <input type="date" value={incidentDate} onChange={e => setIncidentDate(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' }} />
        </div>
        <div />
        <div>
          <label style={{ fontSize: 12, color: T.dim, display: 'block', marginBottom: 4 }}>ACAS EC Start Date (if applicable)</label>
          <input type="date" value={acasStart} onChange={e => setAcasStart(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: T.dim, display: 'block', marginBottom: 4 }}>ACAS EC End Date (if applicable)</label>
          <input type="date" value={acasEnd} onChange={e => setAcasEnd(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' }} />
        </div>
      </div>
      <button onClick={calculate} disabled={!incidentDate}
        style={{ padding: '10px 24px', background: T.navy, color: 'white', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
        Calculate Deadline
      </button>
      {result && (
        <div style={{ marginTop: 16, padding: 16, borderRadius: 8, background: result.daysLeft < 14 ? T.redBg : T.successBg, border: `1px solid ${result.daysLeft < 14 ? T.red : T.success}` }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: result.daysLeft < 14 ? T.red : T.success, marginBottom: 4 }}>
            {result.daysLeft < 0 ? 'DEADLINE PASSED' : `${result.daysLeft} days remaining`}
          </div>
          <div style={{ fontSize: 13, color: T.navy }}>Tribunal Deadline: <strong>{result.deadline}</strong></div>
          {result.extension > 0 && <div style={{ fontSize: 12, color: T.dim, marginTop: 4 }}>Includes {result.extension}-day ACAS extension</div>}
        </div>
      )}
    </div>
  );
}
