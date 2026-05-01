import React, { useState, useEffect } from 'react';

const T = {
  navy: '#0D1B2A', navyMid: '#152438', navyLight: '#1E3A5F',
  gold: '#C9A84C', goldLight: 'rgba(201,168,76,0.15)',
  teal: '#0C7B7A', tealLight: 'rgba(12,123,122,0.15)',
  white: '#EEF2F7', muted: '#7A8FA6', border: 'rgba(255,255,255,0.08)',
  red: '#E53E3E', green: '#22C55E', orange: '#D97706', purple: '#7B5EA7',
};

const MOOD_OPTIONS = [
  { value: 5, label: 'Very Well', emoji: '😊', color: T.green },
  { value: 4, label: 'Okay', emoji: '🙂', color: T.teal },
  { value: 3, label: 'Struggling', emoji: '😐', color: T.gold },
  { value: 2, label: 'Anxious', emoji: '😟', color: T.orange },
  { value: 1, label: 'Very Low', emoji: '😞', color: T.red },
];

const SYMPTOMS = ['Sleep problems', 'Anxiety', 'Depression', 'Flashbacks', 'Panic attacks', 'Loss of appetite', 'Unable to concentrate', 'Social withdrawal', 'Physical pain / tension', 'Nightmares', 'Trust issues', 'Financial stress'];

function fmt(n) { return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n); }

export default function WellbeingAndImpact({ caseId }) {
  const [tab, setTab] = useState('journal');
  const [entries, setEntries] = useState(() => {
    const s = localStorage.getItem('ujris_wellbeing');
    return s ? JSON.parse(s) : [];
  });
  const [form, setForm] = useState({ mood: 3, sleep: 6, anxiety: 5, symptoms: [], notes: '' });
  const [saved, setSaved] = useState(false);
  const [prediction, setPrediction] = useState('');
  const [predLoading, setPredLoading] = useState(false);
  const [predContext, setPredContext] = useState('');

  useEffect(() => {
    localStorage.setItem('ujris_wellbeing', JSON.stringify(entries));
  }, [entries]);

  function toggleSymptom(sym) {
    setForm(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(sym) ? prev.symptoms.filter(s => s !== sym) : [...prev.symptoms, sym],
    }));
  }

  function saveEntry() {
    const entry = { ...form, id: Date.now().toString(), date: new Date().toISOString() };
    setEntries(prev => [entry, ...prev]);
    setForm({ mood: 3, sleep: 6, anxiety: 5, symptoms: [], notes: '' });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function runPrediction() {
    setPredLoading(true);
    setPrediction('');
    const avgMood = entries.length ? (entries.reduce((a, e) => a + e.mood, 0) / entries.length).toFixed(1) : form.mood;
    const symFreq = entries.flatMap(e => e.symptoms || []).reduce((acc, s) => { acc[s] = (acc[s] || 0) + 1; return acc; }, {});
    const topSymptoms = Object.entries(symFreq).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([s]) => s).join(', ');

    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: `You are a UK employment tribunal expert. Based on wellbeing impact data and case context, estimate the injury to feelings award and overall outcome probability.`,
          messages: [{
            role: 'user',
            content: `Analyse for injury to feelings / outcome prediction:

Case context: ${predContext || 'Race discrimination + whistleblowing, Fairwinds Health Care. Constructive dismissal. 18 months employment.'}
Average mood score: ${avgMood}/5
Recurring symptoms: ${topSymptoms || 'anxiety, sleep problems'}
Journal entries: ${entries.length}
Current anxiety level: ${form.anxiety}/10

Provide:
1. VENTO BAND RECOMMENDATION — which band applies based on impact evidence, with reasoning
2. ESTIMATED AWARD RANGE — specific £ range for injury to feelings
3. MEDICAL EVIDENCE RECOMMENDATION — what GP/psychiatrist evidence would strengthen the claim
4. IMPACT STATEMENT FRAMEWORK — key points for written impact statement to tribunal
5. OUTCOME PROBABILITY — percentage likelihood of success at tribunal based on available information`,
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
              if (d.delta?.text) { acc += d.delta.text; setPrediction(acc); }
            } catch {}
          }
        }
      }
    } catch (e) {
      setPrediction(`Error: ${e.message}`);
    }
    setPredLoading(false);
  }

  const recentMoods = entries.slice(0, 7).map(e => e.mood);
  const avgMood = recentMoods.length ? (recentMoods.reduce((a, b) => a + b, 0) / recentMoods.length).toFixed(1) : '-';
  const topMoodOption = MOOD_OPTIONS.find(m => m.value === Math.round(parseFloat(avgMood))) || MOOD_OPTIONS[2];

  return (
    <div style={{ minHeight: '100vh', background: T.navy, color: T.white, fontFamily: "'Source Serif 4', Georgia, serif" }}>
      <div style={{ background: T.navyMid, borderBottom: `1px solid ${T.border}`, padding: '24px 32px' }}>
        <h1 style={{ margin: 0, fontSize: 24, fontFamily: "'Playfair Display', Georgia, serif", color: T.gold }}>💚 Wellbeing & Impact</h1>
        <p style={{ margin: '4px 0 0', color: T.muted, fontSize: 13 }}>Document your psychological impact — strengthens Vento band argument at tribunal</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          {['journal', 'metrics', 'predictor'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '7px 16px', borderRadius: 8, border: `1px solid ${tab === t ? T.gold : T.border}`,
              background: tab === t ? T.goldLight : 'transparent', color: tab === t ? T.gold : T.muted,
              cursor: 'pointer', fontSize: 13, fontWeight: tab === t ? 700 : 400,
            }}>
              {t === 'journal' ? '📓 Wellbeing Journal' : t === 'metrics' ? '📊 Impact Metrics' : '🎯 Outcome Predictor'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'journal' && (
        <div style={{ padding: '24px 32px', display: 'grid', gridTemplateColumns: '1fr 360px', gap: 28 }}>
          {/* Entry Form */}
          <div>
            <h2 style={{ color: T.gold, fontFamily: "'Playfair Display', Georgia, serif", marginTop: 0, fontSize: 18 }}>Today's Entry — {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</h2>

            <div style={{ marginBottom: 20 }}>
              <div style={{ color: T.muted, fontSize: 12, marginBottom: 10 }}>HOW ARE YOU FEELING TODAY?</div>
              <div style={{ display: 'flex', gap: 10 }}>
                {MOOD_OPTIONS.map(m => (
                  <button key={m.value} onClick={() => setForm(p => ({ ...p, mood: m.value }))} style={{
                    flex: 1, padding: '14px 8px', background: form.mood === m.value ? `${m.color}22` : 'rgba(255,255,255,0.04)',
                    border: `2px solid ${form.mood === m.value ? m.color : T.border}`, borderRadius: 10, cursor: 'pointer',
                    textAlign: 'center', transition: 'all 0.2s',
                  }}>
                    <div style={{ fontSize: 24, marginBottom: 4 }}>{m.emoji}</div>
                    <div style={{ color: form.mood === m.value ? m.color : T.muted, fontSize: 10, fontWeight: 700 }}>{m.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', color: T.muted, fontSize: 12, marginBottom: 6 }}>Hours Slept Last Night</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="range" min="0" max="12" value={form.sleep} onChange={e => setForm(p => ({ ...p, sleep: parseInt(e.target.value) }))} style={{ flex: 1 }} />
                  <span style={{ color: T.white, fontWeight: 700, minWidth: 30 }}>{form.sleep}h</span>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', color: T.muted, fontSize: 12, marginBottom: 6 }}>Anxiety Level (0-10)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="range" min="0" max="10" value={form.anxiety} onChange={e => setForm(p => ({ ...p, anxiety: parseInt(e.target.value) }))} style={{ flex: 1 }} />
                  <span style={{ color: form.anxiety >= 7 ? T.red : form.anxiety >= 4 ? T.orange : T.teal, fontWeight: 700, minWidth: 20 }}>{form.anxiety}</span>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ color: T.muted, fontSize: 12, marginBottom: 8 }}>SYMPTOMS EXPERIENCED TODAY</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {SYMPTOMS.map(sym => (
                  <button key={sym} onClick={() => toggleSymptom(sym)} style={{
                    padding: '6px 12px', borderRadius: 20, border: `1px solid ${form.symptoms.includes(sym) ? T.red : T.border}`,
                    background: form.symptoms.includes(sym) ? T.redLight : 'transparent',
                    color: form.symptoms.includes(sym) ? T.red : T.muted, cursor: 'pointer', fontSize: 12,
                  }}>{sym}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', color: T.muted, fontSize: 12, marginBottom: 6 }}>Detailed Notes (for tribunal impact statement)</label>
              <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                rows={5} placeholder="Describe how the discrimination / legal proceedings have affected you today. Be specific — this becomes evidence for your Vento band argument..."
                style={{ width: '100%', background: T.navyMid, border: `1px solid ${T.border}`, borderRadius: 10, color: T.white, padding: 14, fontSize: 13, resize: 'vertical', fontFamily: "'Source Serif 4', Georgia, serif", lineHeight: 1.7, boxSizing: 'border-box' }} />
            </div>

            <button onClick={saveEntry} style={{
              padding: '12px 28px', background: saved ? T.teal : T.gold, color: T.navy,
              border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 15, transition: 'background 0.3s',
            }}>
              {saved ? '✓ Entry Saved!' : '💚 Save Today\'s Entry'}
            </button>
          </div>

          {/* Recent Entries */}
          <div>
            <h3 style={{ color: T.muted, fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', marginTop: 0 }}>RECENT ENTRIES</h3>
            {entries.length === 0 ? (
              <div style={{ color: T.muted, fontSize: 13, textAlign: 'center', padding: 40 }}>No entries yet. Start journaling to build your impact evidence.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {entries.slice(0, 10).map(entry => {
                  const moodOpt = MOOD_OPTIONS.find(m => m.value === entry.mood) || MOOD_OPTIONS[2];
                  return (
                    <div key={entry.id} style={{ background: T.navyMid, border: `1px solid ${T.border}`, borderRadius: 10, padding: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 20 }}>{moodOpt.emoji}</span>
                          <span style={{ color: moodOpt.color, fontSize: 12, fontWeight: 700 }}>{moodOpt.label}</span>
                        </div>
                        <span style={{ color: T.muted, fontSize: 11 }}>{new Date(entry.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 12, marginBottom: entry.notes ? 6 : 0 }}>
                        <span style={{ color: T.muted, fontSize: 11 }}>😴 {entry.sleep}h</span>
                        <span style={{ color: entry.anxiety >= 7 ? T.red : T.muted, fontSize: 11 }}>😰 {entry.anxiety}/10</span>
                        {entry.symptoms?.length > 0 && <span style={{ color: T.muted, fontSize: 11 }}>⚠ {entry.symptoms.length} symptoms</span>}
                      </div>
                      {entry.notes && <div style={{ color: T.muted, fontSize: 12, lineHeight: 1.6, fontStyle: 'italic' }}>{entry.notes.slice(0, 120)}{entry.notes.length > 120 ? '...' : ''}</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'metrics' && (
        <div style={{ padding: '24px 32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
            {[
              { label: 'Journal Entries', value: entries.length, color: T.teal, icon: '📓' },
              { label: 'Avg Mood', value: `${avgMood}/5`, color: topMoodOption.color, icon: topMoodOption.emoji },
              { label: 'Avg Sleep', value: entries.length ? `${(entries.reduce((a, e) => a + e.sleep, 0) / entries.length).toFixed(1)}h` : '-', color: T.gold, icon: '😴' },
              { label: 'Avg Anxiety', value: entries.length ? `${(entries.reduce((a, e) => a + e.anxiety, 0) / entries.length).toFixed(1)}/10` : '-', color: T.orange, icon: '😰' },
              { label: 'Days Monitored', value: entries.length > 0 ? Math.ceil((Date.now() - new Date(entries[entries.length - 1]?.date)) / 86400000) : 0, color: T.purple, icon: '📅' },
            ].map(m => (
              <div key={m.label} style={{ background: T.navyMid, border: `1px solid ${T.border}`, borderRadius: 14, padding: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{m.icon}</div>
                <div style={{ color: m.color, fontWeight: 900, fontSize: 28, fontFamily: "'Playfair Display', Georgia, serif" }}>{m.value}</div>
                <div style={{ color: T.muted, fontSize: 12, marginTop: 4 }}>{m.label}</div>
              </div>
            ))}
          </div>

          {/* Symptom frequency */}
          {entries.length > 0 && (
            <div style={{ background: T.navyMid, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24 }}>
              <h3 style={{ color: T.gold, fontFamily: "'Playfair Display', Georgia, serif", marginTop: 0 }}>Symptom Frequency</h3>
              {(() => {
                const freq = entries.flatMap(e => e.symptoms || []).reduce((acc, s) => { acc[s] = (acc[s] || 0) + 1; return acc; }, {});
                return Object.entries(freq).sort((a, b) => b[1] - a[1]).map(([sym, count]) => (
                  <div key={sym} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <span style={{ color: T.muted, fontSize: 13, minWidth: 180 }}>{sym}</span>
                    <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${(count / entries.length) * 100}%`, height: '100%', background: T.red, borderRadius: 4 }} />
                    </div>
                    <span style={{ color: T.red, fontSize: 12, fontWeight: 700, minWidth: 40, textAlign: 'right' }}>{count}×</span>
                  </div>
                ));
              })()}
            </div>
          )}

          <div style={{ background: T.tealLight, border: `1px solid ${T.teal}`, borderRadius: 10, padding: 16, marginTop: 20 }}>
            <div style={{ color: T.teal, fontWeight: 700, fontSize: 13 }}>📋 For Your Tribunal Impact Statement</div>
            <div style={{ color: T.muted, fontSize: 13, marginTop: 6, lineHeight: 1.7 }}>Export this data as part of your written impact statement. Tribunals consider: duration of impact, severity, medical treatment sought, effect on daily life, career impact, and family relationships. Your wellbeing journal provides the chronological evidence for upper Vento band arguments.</div>
            <button onClick={() => window.print()} style={{ marginTop: 12, padding: '8px 16px', background: T.teal, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>🖨️ Print Impact Report</button>
          </div>
        </div>
      )}

      {tab === 'predictor' && (
        <div style={{ padding: '24px 32px', maxWidth: 800, margin: '0 auto' }}>
          <div style={{ background: T.goldLight, border: `1px solid ${T.gold}`, borderRadius: 10, padding: 16, marginBottom: 24 }}>
            <div style={{ color: T.gold, fontWeight: 700, fontSize: 13 }}>⚠️ Indicative Only — Not Legal Advice</div>
            <div style={{ color: T.muted, fontSize: 13, marginTop: 4, lineHeight: 1.7 }}>This AI prediction is based on the information you provide and general pattern data. It is not legal advice. Actual outcomes depend on evidence, legal argument, and the specific tribunal panel.</div>
          </div>

          <div style={{ background: T.navyMid, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24, marginBottom: 24 }}>
            <label style={{ display: 'block', color: T.muted, fontSize: 12, marginBottom: 8 }}>Case context (brief description of your discrimination claim)</label>
            <textarea value={predContext} onChange={e => setPredContext(e.target.value)} rows={5}
              placeholder="e.g. Race discrimination at Fairwinds Health Care. Employed 18 months. Made whistleblowing disclosure about unsafe practices. Constructively dismissed 3 weeks later. Upper Vento factors: systematic harassment, career destruction, severe anxiety documented by GP..."
              style={{ width: '100%', background: T.navy, border: `1px solid ${T.border}`, borderRadius: 8, color: T.white, padding: 12, fontSize: 13, resize: 'vertical', fontFamily: "'Source Serif 4', Georgia, serif", lineHeight: 1.7, boxSizing: 'border-box' }} />
            <button onClick={runPrediction} disabled={predLoading} style={{
              marginTop: 14, padding: '12px 24px', background: predLoading ? T.navyLight : T.gold, color: T.navy,
              border: 'none', borderRadius: 8, fontWeight: 700, cursor: predLoading ? 'not-allowed' : 'pointer', fontSize: 14,
            }}>
              {predLoading ? '⏳ Analysing...' : '🎯 Generate Outcome Prediction'}
            </button>
          </div>

          {prediction && (
            <div style={{ background: T.navyMid, border: `1px solid ${T.gold}44`, borderRadius: 16, padding: 28 }}>
              <div style={{ color: T.gold, fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 16 }}>OUTCOME PREDICTION & VENTO ANALYSIS</div>
              <div style={{ color: T.white, fontSize: 14, lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>{prediction}</div>
            </div>
          )}

          {/* Vento Quick Reference */}
          <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { band: 'Lower', range: '£1,200–£11,700', color: T.teal, desc: 'Isolated acts, minor impact' },
              { band: 'Middle', range: '£11,700–£35,100', color: T.gold, desc: 'Sustained, serious, moderate distress' },
              { band: 'Upper', range: '£35,100–£56,200', color: T.red, desc: 'Exceptional — severe, life-altering' },
            ].map(v => (
              <div key={v.band} style={{ background: T.navyMid, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16, textAlign: 'center' }}>
                <div style={{ color: v.color, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 4 }}>{v.band.toUpperCase()} VENTO</div>
                <div style={{ color: v.color, fontWeight: 700, fontSize: 14 }}>{v.range}</div>
                <div style={{ color: T.muted, fontSize: 11, marginTop: 4 }}>{v.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
