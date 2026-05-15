import React, { useState, useRef, useEffect } from 'react';

const T = {
  navy: '#0D1B2A', navyMid: '#152438', navyLight: '#1E3A5F',
  gold: '#C9A84C', goldLight: 'rgba(201,168,76,0.15)',
  teal: '#0C7B7A', tealLight: 'rgba(12,123,122,0.15)',
  white: '#EEF2F7', muted: '#7A8FA6',
  border: 'rgba(255,255,255,0.08)',
  red: '#E53E3E', redLight: 'rgba(229,62,62,0.15)',
};

const SYSTEM_PROMPT = `You are UJRIS LegalMind — a specialist UK discrimination law assistant for self-litigants and victims of workplace, public service, and housing discrimination in England and Wales.

You advise on:
- Equality Act 2010 (all 9 protected characteristics)
- Employment Rights Act 1996 (unfair dismissal, whistleblowing)
- PIDA 1998 (protected disclosures)
- PACE 1984 (police powers)
- Human Rights Act 1998
- Employment Tribunal procedure (ET1, ET3, preliminary hearings, Caselaw)
- ACAS Early Conciliation process
- ICO / SAR rights under UK GDPR / DPA 2018

Rules:
- Always clarify this is general legal information, not personal legal advice
- Cite specific statutory provisions and key cases (e.g., Vento v Chief Constable of West Yorkshire [2002])
- Be direct, practical, and empowering — your users are self-litigants facing powerful opponents
- Recommend escalation paths (EHRC, ICO, IOPC, ACAS) where appropriate
- Keep responses clear, structured, and under 500 words unless the question demands more
- Never tell users to "just get a lawyer" without first giving substantive guidance
- Use plain English wherever possible`;

const QUICK_QUESTIONS = [
  { label: 'Time limits for ET claim', q: 'What are the time limits for bringing an Employment Tribunal claim for discrimination? What happens if I miss the deadline?' },
  { label: 'What is direct discrimination?', q: 'Explain direct discrimination under the Equality Act 2010, with examples and key case law.' },
  { label: 'SAR rights at work', q: 'How do I make a Subject Access Request to my employer? What are they required to disclose and within what timeframe?' },
  { label: 'Vento bands 2025', q: 'What are the current Vento bands for injury to feelings awards in discrimination cases? How do tribunals decide which band applies?' },
  { label: 'Adjustments for disability', q: 'What is the duty to make reasonable adjustments under section 20 Equality Act 2010? What counts as reasonable?' },
  { label: 'Whistleblowing protection', q: 'I reported wrongdoing at work and am now being victimised. What protection do I have under PIDA 1998?' },
  { label: 'Police stop and search', q: 'What rights do I have if stopped and searched by police? When can they use section 60 powers without suspicion?' },
  { label: 'Pregnancy discrimination', q: 'My employer is treating me differently since I announced my pregnancy. What does the law say about pregnancy and maternity discrimination?' },
];

const CATEGORIES = ['All', 'Workplace', 'Police & Public Authority', 'Housing & Services', 'Procedure & Time Limits'];

export default function KnowYourRights() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Welcome to **UJRIS LegalMind** — your AI specialist in UK discrimination law.

Ask me anything about your rights under the Equality Act 2010, Employment Rights Act, PACE, PIDA, or Employment Tribunal procedure. I give practical, statute-backed guidance for self-litigants.

**Quick start:** choose a topic below, or type your own question.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('All');
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send(question) {
    const q = question || input.trim();
    if (!q || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setLoading(true);

    const apiMessages = [
      ...messages.filter(m => m.role !== 'assistant' || messages.indexOf(m) > 0).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: q },
    ];

    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1200,
          stream: true,
          system: SYSTEM_PROMPT,
          messages: apiMessages,
        }),
      });

      if (!res.ok) throw new Error('API error');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = '';
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;
            try {
              const ev = JSON.parse(data);
              const delta = ev.delta?.text || ev.type === 'content_block_delta' && ev.delta?.text || '';
              if (delta) {
                text += delta;
                setMessages(prev => {
                  const msgs = [...prev];
                  msgs[msgs.length - 1] = { role: 'assistant', content: text };
                  return msgs;
                });
              }
            } catch { /* skip non-json lines */ }
          }
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Connection error. Please try again.' }]);
    }
    setLoading(false);
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  function renderContent(text) {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <div key={i} style={{ fontWeight: 700, color: T.white, marginTop: i > 0 ? 8 : 0 }}>{line.slice(2, -2)}</div>;
      }
      if (line.startsWith('- ') || line.startsWith('• ')) {
        return <div key={i} style={{ paddingLeft: 14, color: T.white, opacity: 0.9 }}>• {line.slice(2)}</div>;
      }
      const bold = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      return <div key={i} style={{ color: T.white, opacity: 0.9, lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: bold || '&nbsp;' }} />;
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', maxWidth: 900, margin: '0 auto', padding: '0 32px' }}>
      {/* Header */}
      <div style={{ padding: '24px 0 16px' }}>
        <h1 style={{ color: T.white, fontFamily: "'Playfair Display', serif", fontSize: 24, margin: 0 }}>
          ⚖️ Know Your Rights
        </h1>
        <p style={{ color: T.muted, margin: '4px 0 0', fontSize: 13 }}>AI-powered UK discrimination law guidance — Equality Act 2010, Employment Rights, PACE, PIDA</p>
      </div>

      {/* Quick questions */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {QUICK_QUESTIONS.map(q => (
            <button key={q.label} onClick={() => send(q.q)} disabled={loading} style={{
              padding: '5px 12px', borderRadius: 8, border: `1px solid ${T.border}`,
              background: T.navyMid, color: T.muted, cursor: 'pointer', fontSize: 11, fontWeight: 600,
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.gold; e.currentTarget.style.color = T.gold; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.muted; }}
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat window */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 16 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            marginBottom: 16,
          }}>
            {msg.role === 'assistant' && (
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: T.teal, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, marginRight: 10, flexShrink: 0, marginTop: 4 }}>⚖️</div>
            )}
            <div style={{
              maxWidth: '78%', padding: '14px 18px', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: msg.role === 'user' ? T.goldLight : T.navyMid,
              border: `1px solid ${msg.role === 'user' ? T.gold : T.border}`,
              fontSize: 13, lineHeight: 1.6,
            }}>
              {msg.role === 'user'
                ? <span style={{ color: T.gold }}>{msg.content}</span>
                : renderContent(msg.content)
              }
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: T.teal, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, marginRight: 10 }}>⚖️</div>
            <div style={{ padding: '14px 18px', borderRadius: '16px 16px 16px 4px', background: T.navyMid, border: `1px solid ${T.border}` }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {[0, 1, 2].map(n => (
                  <div key={n} style={{ width: 6, height: 6, borderRadius: '50%', background: T.teal, animation: 'pulse 1.2s infinite', animationDelay: `${n * 0.2}s` }} />
                ))}
              </div>
              <style>{`@keyframes pulse{0%,100%{opacity:0.3}50%{opacity:1}}`}</style>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Disclaimer */}
      <div style={{ background: T.goldLight, border: `1px solid rgba(201,168,76,0.3)`, borderRadius: 8, padding: '8px 14px', marginBottom: 10, fontSize: 11, color: T.muted }}>
        ⚠️ UJRIS provides general legal information — not personal legal advice. Always verify with a qualified solicitor for your specific circumstances.
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 10, paddingBottom: 20 }}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask about your rights under UK law... (Enter to send, Shift+Enter for new line)"
          rows={2}
          style={{
            flex: 1, background: T.navyMid, border: `1px solid ${T.border}`, borderRadius: 12, padding: '12px 16px',
            color: T.white, fontSize: 13, resize: 'none', outline: 'none', fontFamily: "'Source Serif 4', serif",
            lineHeight: 1.5,
          }}
          onFocus={e => { e.currentTarget.style.borderColor = T.teal; }}
          onBlur={e => { e.currentTarget.style.borderColor = T.border; }}
          disabled={loading}
        />
        <button onClick={() => send()} disabled={loading || !input.trim()} style={{
          background: loading || !input.trim() ? 'rgba(201,168,76,0.3)' : T.gold,
          color: T.navy, border: 'none', borderRadius: 12, padding: '0 20px',
          fontWeight: 800, fontSize: 16, cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
        }}>→</button>
      </div>
    </div>
  );
}
