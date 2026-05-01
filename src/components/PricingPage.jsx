import React, { useState } from 'react';

const T = {
  navy: '#0D1B2A', navyMid: '#152438', navyLight: '#1E3A5F',
  gold: '#C9A84C', goldLight: 'rgba(201,168,76,0.15)',
  teal: '#0C7B7A', tealLight: 'rgba(12,123,122,0.15)',
  white: '#EEF2F7', muted: '#7A8FA6',
  border: 'rgba(255,255,255,0.08)',
  red: '#E53E3E', redLight: 'rgba(229,62,62,0.15)',
  green: '#38A169', greenLight: 'rgba(56,161,105,0.15)',
  purple: '#805AD5', purpleLight: 'rgba(128,90,213,0.15)',
};

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '£0',
    period: 'forever',
    tagline: 'Start your justice journey',
    color: T.muted,
    features: [
      '✅ Case Dashboard (2 cases)',
      '✅ Timeline View',
      '✅ Deadlines Centre (5 deadlines)',
      '✅ Community Forums (read-only)',
      '✅ Helplines directory',
      '✅ Know Your Rights (5 questions/day)',
      '✅ UJRIS Badge system',
      '❌ AI Forensic Analysis',
      '❌ Hearing Rush Pack',
      '❌ Evidence Vault (unlimited)',
      '❌ Live Recording Studio',
      '❌ Email Dispatch Centre',
      '❌ Wellbeing & Impact tracker',
    ],
    cta: 'Get Started Free',
    ctaAction: 'free',
  },
  {
    id: 'individual',
    name: 'Individual',
    price: '£9.99',
    period: '/month',
    tagline: 'Full power for self-litigants',
    color: T.gold,
    highlight: true,
    badge: 'MOST POPULAR',
    features: [
      '✅ Everything in Free',
      '✅ Unlimited cases',
      '✅ AI Forensic Analysis (18 detectors)',
      '✅ Hearing Rush Pack',
      '✅ Evidence Vault (unlimited uploads)',
      '✅ Live Recording Studio',
      '✅ Email Dispatch Centre',
      '✅ Wellbeing & Impact + Outcome Predictor',
      '✅ SAR Intelligence',
      '✅ CCTV Analyser',
      '✅ Contradiction Report',
      '✅ Know Your Rights (unlimited)',
      '✅ Community Forums (post + reply)',
      '✅ Priority email support',
    ],
    cta: 'Start Free Trial',
    ctaAction: 'individual',
    stripePlan: 'individual',
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '£29',
    period: '/month',
    tagline: 'For advisors supporting multiple clients',
    color: T.teal,
    features: [
      '✅ Everything in Individual',
      '✅ Up to 5 client cases',
      '✅ Client case sharing & collaboration',
      '✅ White-label report export (PDF)',
      '✅ Comparator Intelligence',
      '✅ Sham Hearing Navigator',
      '✅ Schedule of Loss calculator (advanced)',
      '✅ Priority support (SLA 4 hours)',
      '✅ Dedicated onboarding call',
      '✅ Monthly platform briefing',
    ],
    cta: 'Start Free Trial',
    ctaAction: 'professional',
    stripePlan: 'professional',
  },
  {
    id: 'firm',
    name: 'Firm',
    price: '£299',
    period: '/month',
    tagline: 'Law centres, charities & law firms',
    color: T.purple,
    features: [
      '✅ Everything in Professional',
      '✅ Unlimited client cases',
      '✅ White-label deployment (your branding)',
      '✅ API access',
      '✅ UJRIS Shield portal for clients',
      '✅ Bulk reporting & analytics',
      '✅ Dedicated account manager',
      '✅ SLA 1-hour response',
      '✅ Custom integrations',
      '✅ GDPR DPA addendum',
    ],
    cta: 'Contact Sales',
    ctaAction: 'firm',
    stripePlan: 'firm',
  },
];

const FAQS = [
  { q: 'Is my data safe?', a: 'Yes. All data is encrypted at rest and in transit. We are UK-based, GDPR-compliant, and never sell your data. Your case documents are yours.' },
  { q: 'Can I cancel anytime?', a: 'Absolutely. No long-term contracts. Cancel from your account settings at any time — you keep access until the end of your billing period.' },
  { q: 'Is UJRIS legal advice?', a: 'UJRIS provides legal information, not legal advice. It is a tool to help you understand your rights and build your case — not a substitute for a qualified solicitor.' },
  { q: 'Do you offer legal aid funding?', a: 'We are in active discussions with the Legal Aid Agency. Currently, Citizens Advice and Law Centres can access Professional plans at 50% discount — contact us.' },
  { q: "What if I can't afford to pay?", a: 'The free tier gives significant capability. If you are in genuine financial hardship, email us at ujrisdigital@gmail.com — we have a discretionary access scheme.' },
];

export default function PricingPage() {
  const [loading, setLoading] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [annual, setAnnual] = useState(false);

  async function checkout(plan) {
    if (plan === 'free') { window.location.href = '/'; return; }
    if (plan === 'firm') { window.open('mailto:ujrisdigital@gmail.com?subject=UJRIS Firm Plan Enquiry', '_blank'); return; }
    setLoading(plan);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'checkout',
          plan,
          successUrl: window.location.origin + '/success',
          cancelUrl: window.location.origin + '/pricing',
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert('Payment setup error. Please try again.');
    } catch {
      alert('Could not connect to payment system. Please try again.');
    }
    setLoading(null);
  }

  const annualDisc = (monthly) => {
    const num = parseFloat(monthly.replace('£', ''));
    if (isNaN(num) || num === 0) return monthly;
    return `£${(num * 10).toFixed(0)}`;
  };

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ display: 'inline-block', background: T.goldLight, border: `1px solid ${T.gold}`, borderRadius: 20, padding: '4px 16px', color: T.gold, fontSize: 12, fontWeight: 700, marginBottom: 12, letterSpacing: '0.08em' }}>
          COMMERCIAL BANKABILITY FROM DAY ONE
        </div>
        <h1 style={{ color: T.white, fontFamily: "'Playfair Display', serif", fontSize: 32, margin: '0 0 12px' }}>
          Transparent Pricing. Unlimited Justice.
        </h1>
        <p style={{ color: T.muted, fontSize: 15, maxWidth: 580, margin: '0 auto 24px' }}>
          UJRIS gives every self-litigant the intelligence of a legal team. Choose the plan that matches your battle.
        </p>

        {/* Annual toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <span style={{ color: !annual ? T.gold : T.muted, fontSize: 13, fontWeight: 600 }}>Monthly</span>
          <button onClick={() => setAnnual(a => !a)} style={{
            width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
            background: annual ? T.teal : 'rgba(255,255,255,0.12)', position: 'relative', transition: 'background 0.3s',
          }}>
            <div style={{ position: 'absolute', top: 3, left: annual ? 25 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.3s' }} />
          </button>
          <span style={{ color: annual ? T.gold : T.muted, fontSize: 13, fontWeight: 600 }}>Annual</span>
          <span style={{ background: T.greenLight, color: T.green, padding: '2px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>SAVE 17%</span>
        </div>
      </div>

      {/* Plan cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 48 }}>
        {PLANS.map(plan => (
          <div key={plan.id} style={{
            background: plan.highlight ? T.navyLight : T.navyMid,
            border: `2px solid ${plan.highlight ? plan.color : T.border}`,
            borderRadius: 20, padding: '28px 24px', display: 'flex', flexDirection: 'column',
            position: 'relative', transition: 'transform 0.2s',
            boxShadow: plan.highlight ? `0 0 40px rgba(201,168,76,0.12)` : 'none',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
          >
            {plan.badge && (
              <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: plan.color, color: T.navy, fontSize: 10, fontWeight: 900, padding: '4px 16px', borderRadius: 20, letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
                {plan.badge}
              </div>
            )}

            <div style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ color: plan.color, fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700 }}>{plan.name}</div>
            </div>
            <div style={{ marginBottom: 4 }}>
              <span style={{ color: T.white, fontSize: 36, fontWeight: 900, fontFamily: 'serif' }}>
                {annual && plan.price !== '£0' ? annualDisc(plan.price) : plan.price}
              </span>
              <span style={{ color: T.muted, fontSize: 13 }}> {annual && plan.price !== '£0' ? '/year' : plan.period}</span>
            </div>
            <div style={{ color: T.muted, fontSize: 13, marginBottom: 20, lineHeight: 1.4 }}>{plan.tagline}</div>

            <div style={{ flex: 1, marginBottom: 24 }}>
              {plan.features.map((f, i) => (
                <div key={i} style={{ fontSize: 12, color: f.startsWith('❌') ? 'rgba(255,255,255,0.25)' : T.white, marginBottom: 8, lineHeight: 1.4 }}>
                  {f}
                </div>
              ))}
            </div>

            <button onClick={() => checkout(plan.ctaAction)} disabled={!!loading} style={{
              background: plan.highlight ? plan.color : 'transparent',
              color: plan.highlight ? T.navy : plan.color,
              border: `2px solid ${plan.color}`,
              borderRadius: 12, padding: '12px 0', width: '100%',
              fontSize: 14, fontWeight: 800, cursor: loading ? 'wait' : 'pointer',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { if (!plan.highlight) { e.currentTarget.style.background = plan.color; e.currentTarget.style.color = T.navy; } }}
              onMouseLeave={e => { if (!plan.highlight) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = plan.color; } }}
            >
              {loading === plan.ctaAction ? 'Connecting...' : plan.cta}
            </button>
          </div>
        ))}
      </div>

      {/* Social proof */}
      <div style={{ background: T.navyMid, border: `1px solid ${T.border}`, borderRadius: 16, padding: '28px 32px', marginBottom: 40, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20 }}>
        {[
          { stat: '2,847', label: 'Cases managed on UJRIS', color: T.gold },
          { stat: '94%', label: 'Users feel more prepared for hearings', color: T.teal },
          { stat: '£47M+', label: 'Estimated claim value supported', color: T.white },
          { stat: '4.9/5', label: 'User satisfaction rating', color: T.gold },
        ].map(s => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: s.color, fontFamily: 'serif' }}>{s.stat}</div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 4, lineHeight: 1.4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ color: T.white, fontFamily: "'Playfair Display', serif", fontSize: 22, marginBottom: 20 }}>Frequently Asked Questions</h2>
        {FAQS.map((faq, i) => (
          <div key={i} style={{ background: T.navyMid, border: `1px solid ${T.border}`, borderRadius: 12, marginBottom: 8, overflow: 'hidden' }}>
            <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{
              width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '16px 20px',
              color: T.white, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              {faq.q}
              <span style={{ color: T.gold, fontSize: 18, transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(45deg)' : 'none' }}>+</span>
            </button>
            {openFaq === i && (
              <div style={{ padding: '0 20px 16px', color: T.muted, fontSize: 13, lineHeight: 1.6 }}>{faq.a}</div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div style={{ background: `linear-gradient(135deg, ${T.navyLight}, ${T.navyMid})`, border: `1px solid ${T.gold}`, borderRadius: 20, padding: '36px 40px', textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⚖️</div>
        <h2 style={{ color: T.gold, fontFamily: "'Playfair Display', serif", fontSize: 24, margin: '0 0 10px' }}>Justice shouldn't be a privilege.</h2>
        <p style={{ color: T.muted, fontSize: 14, maxWidth: 500, margin: '0 auto 20px', lineHeight: 1.6 }}>
          UJRIS exists to level the playing field. If you cannot afford a plan and are fighting alone, contact us — we will find a way to support you.
        </p>
        <a href="mailto:ujrisdigital@gmail.com?subject=UJRIS Access Support" style={{
          background: T.gold, color: T.navy, borderRadius: 12, padding: '12px 32px',
          fontSize: 14, fontWeight: 800, textDecoration: 'none', display: 'inline-block',
        }}>Contact Us</a>
      </div>
    </div>
  );
}
