import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const T = {
  cream: "#F8F1E9",
  deepNavy: "#0F2C4A",
  midNavy: "#1E3A5F",
  gold: "#D4AF37",
  goldL: "#F5E6B3",
  success: "#10B981",
  warning: "#F59E0B",
  info: "#3B82F6",
  red: "#DC2626",
  slate: "#64748B",
  faint: "rgba(15,44,74,0.04)",
  border: "rgba(15,44,74,0.12)",
  goldBg: "rgba(212,175,55,0.12)",
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleStartFree = () => {
    navigate('/case-entry');
  };

  const handleViewPricing = () => {
    document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ background: T.cream, color: T.deepNavy }}>
      {/* ── NAVIGATION BAR ── */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'rgba(248,241,233,0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${T.border}`,
        zIndex: 1000,
        padding: '0 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 70
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          cursor: 'pointer'
        }} onClick={() => window.scrollTo(0, 0)}>
          <img
            src="/ujris-logo.png"
            alt="UJRIS Justice Intelligence"
            style={{ height: 44, width: 44, borderRadius: 8, objectFit: 'cover' }}
          />
          <span style={{ fontSize: 22, fontWeight: 800, color: T.deepNavy, letterSpacing: '-0.5px' }}>
            <span style={{ color: T.gold }}>UJ</span>RIS
          </span>
        </div>

        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          <a href="#features" style={{
            fontSize: 14,
            color: T.deepNavy,
            textDecoration: 'none',
            fontWeight: 500,
            transition: 'color 0.2s'
          }} onMouseEnter={(e) => e.target.style.color = T.gold}>
            Features
          </a>
          <a href="#pricing" style={{
            fontSize: 14,
            color: T.deepNavy,
            textDecoration: 'none',
            fontWeight: 500,
            transition: 'color 0.2s'
          }} onMouseEnter={(e) => e.target.style.color = T.gold}>
            Pricing
          </a>
          <a href="#faq" style={{
            fontSize: 14,
            color: T.deepNavy,
            textDecoration: 'none',
            fontWeight: 500,
            transition: 'color 0.2s'
          }} onMouseEnter={(e) => e.target.style.color = T.gold}>
            FAQ
          </a>
          <button onClick={handleStartFree} style={{
            background: T.gold,
            color: T.deepNavy,
            border: 'none',
            padding: '10px 24px',
            borderRadius: 6,
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }} onMouseEnter={(e) => {
            e.target.style.background = '#C9A14E';
            e.target.style.transform = 'translateY(-2px)';
          }} onMouseLeave={(e) => {
            e.target.style.background = T.gold;
            e.target.style.transform = 'translateY(0)';
          }}>
            Start Free
          </button>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section style={{
        paddingTop: 140,
        paddingBottom: 100,
        paddingLeft: 40,
        paddingRight: 40,
        maxWidth: 1200,
        margin: '0 auto',
        textAlign: 'center'
      }}>
        {/* LOGO */}
        <div style={{ marginBottom: 40, display: 'flex', justifyContent: 'center' }}>
          <div style={{
            position: 'relative',
            display: 'inline-block',
          }}>
            <div style={{
              position: 'absolute',
              inset: -8,
              borderRadius: 28,
              background: 'linear-gradient(135deg, rgba(212,175,55,0.35), rgba(15,44,74,0.15))',
              filter: 'blur(16px)',
            }} />
            <img
              src="/ujris-logo.png"
              alt="UJRIS Justice Intelligence"
              style={{
                position: 'relative',
                width: 180,
                height: 180,
                borderRadius: 24,
                objectFit: 'cover',
                boxShadow: '0 24px 64px rgba(15,44,74,0.22), 0 4px 16px rgba(212,175,55,0.25)',
                border: '2px solid rgba(212,175,55,0.3)',
                display: 'block',
              }}
            />
          </div>
        </div>

        <div style={{
          fontSize: 64,
          fontWeight: 900,
          marginBottom: 20,
          lineHeight: 1.2,
          color: T.deepNavy
        }}>
          Justice Without the <span style={{ color: T.gold }}>Burden of Lawyers</span>
        </div>

        <p style={{
          fontSize: 20,
          color: T.midNavy,
          marginBottom: 40,
          lineHeight: 1.6,
          maxWidth: 600,
          margin: '0 auto 40px'
        }}>
          UJRIS empowers self-represented UK discrimination claimants with AI-powered evidence analysis, case strategy, and tribunal preparation. No legal fees. All the protection.
        </p>

        <div style={{
          display: 'flex',
          gap: 16,
          justifyContent: 'center',
          marginBottom: 60,
          flexWrap: 'wrap'
        }}>
          <button onClick={handleStartFree} style={{
            background: T.gold,
            color: T.deepNavy,
            border: 'none',
            padding: '16px 40px',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 16,
            cursor: 'pointer',
            transition: 'all 0.3s',
            boxShadow: '0 8px 24px rgba(212,175,55,0.3)'
          }} onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-4px)';
            e.target.style.boxShadow = '0 12px 32px rgba(212,175,55,0.4)';
          }} onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 8px 24px rgba(212,175,55,0.3)';
          }}>
            🚀 Start Free Case
          </button>
          <button onClick={handleViewPricing} style={{
            background: 'transparent',
            color: T.deepNavy,
            border: `2px solid ${T.deepNavy}`,
            padding: '14px 40px',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 16,
            cursor: 'pointer',
            transition: 'all 0.3s'
          }} onMouseEnter={(e) => {
            e.target.style.background = T.faint;
            e.target.style.transform = 'translateY(-4px)';
          }} onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.transform = 'translateY(0)';
          }}>
            View Pricing
          </button>
        </div>

        <div style={{
          background: T.goldBg,
          padding: 20,
          borderRadius: 12,
          marginBottom: 40,
          fontSize: 14,
          color: T.deepNavy,
          maxWidth: 500,
          margin: '0 auto'
        }}>
          ✅ <strong>Free forever for essential tools</strong> — Vento calculator, educational resources, emergency scripts, progress tracking
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 24,
          padding: 40,
          background: 'rgba(212,175,55,0.05)',
          borderRadius: 16,
          marginTop: 40
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>2026 Vento Bands</div>
            <div style={{ fontSize: 13, color: T.midNavy }}>Vento compensation targets updated for 2026</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Evidence Analysis</div>
            <div style={{ fontSize: 13, color: T.midNavy }}>AI-powered document forensics</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🛡</div>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Emergency Safety</div>
            <div style={{ fontSize: 13, color: T.midNavy }}>One-click Stealth Mode to hide app</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎯</div>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Case Strategy</div>
            <div style={{ fontSize: 13, color: T.midNavy }}>Mock tribunal scenarios & negotiation practice</div>
          </div>
        </div>
      </section>

      {/* ── FEATURES SECTION ── */}
      <section id="features" style={{
        paddingTop: 120,
        paddingBottom: 100,
        paddingLeft: 40,
        paddingRight: 40,
        maxWidth: 1200,
        margin: '0 auto',
        borderTop: `1px solid ${T.border}`
      }}>
        <h2 style={{
          fontSize: 48,
          fontWeight: 900,
          textAlign: 'center',
          marginBottom: 60,
          color: T.deepNavy
        }}>
          Complete Toolkit for <span style={{ color: T.gold }}>Your Case</span>
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 32
        }}>
          {[
            {
              icon: '💰',
              title: 'Vento Estimator',
              desc: 'AI-powered compensation calculator based on 2026 Vento bands. Unlock settlement advisor for premium plans.',
              tier: 'free'
            },
            {
              icon: '🎯',
              title: 'Case Matcher',
              desc: 'Review similar tribunal cases, outcomes, and strategic advantages. Justice tier or above.',
              tier: 'justice'
            },
            {
              icon: '🔬',
              title: 'Metadata Shield',
              desc: 'Detect backdated documents, AI-generated content, and timeline inconsistencies. Forensic-grade evidence analysis.',
              tier: 'justice'
            },
            {
              icon: '📚',
              title: 'Educational Hub',
              desc: 'Learn UK employment law from 12+ government & charity sources. Track your progress with milestones.',
              tier: 'free'
            },
            {
              icon: '🔍',
              title: 'Evidence Hunt',
              desc: 'AI identifies critical evidence gaps: missing SAR responses, comparator data, witness statements. Justice tier+',
              tier: 'justice'
            },
            {
              icon: '🤝',
              title: 'Negotiation Simulator',
              desc: '4 practice scenarios: manager confrontation, tribunal cross-exam, ACAS conciliation, authority visits.',
              tier: 'justice'
            },
            {
              icon: '🛡',
              title: 'Emergency Scripts',
              desc: 'Rights-based scripts for dangerous situations. One-click copy. Stealth Mode to instantly hide the app.',
              tier: 'free'
            },
            {
              icon: '📝',
              title: 'ICO Complaint Generator',
              desc: 'Auto-generate formal GDPR Section 165 letters to the Information Commissioner. Track SAR deadlines.',
              tier: 'justice'
            },
            {
              icon: '🎪',
              title: 'Presentations & Case Studies',
              desc: 'Generate tribunal-ready slide decks. Share anonymised success stories. Sovereign tier+',
              tier: 'sovereign'
            }
          ].map((feature, i) => (
            <div key={i} style={{
              padding: 32,
              background: '#FAF6F0',
              border: `1px solid ${T.border}`,
              borderRadius: 16,
              transition: 'all 0.3s'
            }} onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(15,44,74,0.1)';
              e.currentTarget.style.transform = 'translateY(-8px)';
            }} onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>{feature.icon}</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: T.deepNavy }}>
                {feature.title}
              </h3>
              <p style={{ fontSize: 14, color: T.midNavy, lineHeight: 1.6, marginBottom: 12 }}>
                {feature.desc}
              </p>
              <div style={{
                fontSize: 12,
                fontWeight: 600,
                color: T.slate,
                padding: '8px 12px',
                background: feature.tier === 'free' ? 'transparent' : T.goldBg,
                borderRadius: 4,
                display: 'inline-block'
              }}>
                {feature.tier === 'free' ? '🆓 Free' : feature.tier === 'justice' ? '⚖ Justice+' : '👑 Sovereign+'}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING SECTION ── */}
      <section id="pricing" style={{
        paddingTop: 120,
        paddingBottom: 100,
        paddingLeft: 40,
        paddingRight: 40,
        background: T.faint,
        borderTop: `1px solid ${T.border}`
      }}>
        <h2 style={{
          fontSize: 48,
          fontWeight: 900,
          textAlign: 'center',
          marginBottom: 60,
          color: T.deepNavy,
          maxWidth: 800,
          margin: '0 auto 60px'
        }}>
          Simple, Transparent <span style={{ color: T.gold }}>Pricing</span>. Start Free.
        </h2>

        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 32
        }}>
          {[
            {
              name: 'Essential',
              price: 'Free',
              icon: '🆓',
              desc: 'Start your journey',
              features: ['Vento Calculator', 'Emergency Scripts', 'Educational Hub', '1 Active Case', '10 File Vault', 'Progress Streaks', 'Basic Badges']
            },
            {
              name: 'Justice',
              price: '£9.99/mo',
              icon: '⚖',
              desc: 'Or save with annual: £79/yr',
              features: ['Everything in Essential', 'Unlimited Cases', 'Forensic Suite', 'Metadata Shield', 'Case Matcher (3 cases)', 'Evidence Hunt Mode', 'ICO Generator', 'Negotiation Scenarios (4)', 'Email Support']
            },
            {
              name: 'Sovereign',
              price: '£19.99/mo',
              icon: '👑',
              desc: 'Or save with annual: £159/yr',
              features: ['Everything in Justice', 'Unlimited AI Coaching', 'Settlement Advisor', 'Case Study Generator', 'Presentation Generator', 'Shareable Infographics', 'Wisdom Circle Q&A', 'Priority Support']
            },
            {
              name: 'Advocate',
              price: '£149',
              icon: '🏆',
              desc: '3 months of Sovereign',
              features: ['Everything in Sovereign', 'Forensic Report', 'Case Citations', 'Court-Ready Evidence Package', 'Priority Coaching', 'Lifetime Access']
            }
          ].map((plan, i) => (
            <div key={i} style={{
              padding: 32,
              background: plan.name === 'Justice' || plan.name === 'Sovereign' ? '#FFF8F0' : '#FAF6F0',
              border: plan.name === 'Justice' || plan.name === 'Sovereign' ? `2px solid ${T.gold}` : `1px solid ${T.border}`,
              borderRadius: 16,
              position: 'relative'
            }}>
              {(plan.name === 'Justice' || plan.name === 'Sovereign') && (
                <div style={{
                  position: 'absolute',
                  top: -12,
                  left: 16,
                  background: T.gold,
                  color: T.deepNavy,
                  padding: '6px 12px',
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 700
                }}>
                  POPULAR
                </div>
              )}

              <div style={{ fontSize: 32, marginBottom: 12 }}>{plan.icon}</div>
              <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4, color: T.deepNavy }}>{plan.name}</h3>
              <div style={{ fontSize: 32, fontWeight: 900, color: T.gold, marginBottom: 4 }}>{plan.price}</div>
              <p style={{ fontSize: 12, color: T.midNavy, marginBottom: 24 }}>{plan.desc}</p>

              <button onClick={handleStartFree} style={{
                width: '100%',
                padding: '12px 16px',
                background: plan.name === 'Essential' ? T.faint : T.gold,
                color: plan.name === 'Essential' ? T.deepNavy : T.deepNavy,
                border: 'none',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                marginBottom: 24,
                transition: 'all 0.2s'
              }} onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}>
                {plan.name === 'Essential' ? 'Get Started' : 'Unlock Plan'}
              </button>

              <ul style={{ fontSize: 13, color: T.deepNavy, lineHeight: 2 }}>
                {plan.features.map((feature, j) => (
                  <li key={j} style={{ display: 'flex', gap: 8 }}>
                    <span style={{ color: T.success }}>✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{
          textAlign: 'center',
          marginTop: 60,
          padding: 32,
          background: T.goldBg,
          borderRadius: 16,
          maxWidth: 600,
          margin: '60px auto 0'
        }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: T.deepNavy }}>
            💡 18% convert free → paid within 7 days
          </div>
          <p style={{ fontSize: 14, color: T.midNavy, lineHeight: 1.6 }}>
            Most users see premium value immediately. Start free, upgrade when you're ready. No credit card required.
          </p>
        </div>
      </section>

      {/* ── TESTIMONIAL SECTION ── */}
      <section style={{
        paddingTop: 120,
        paddingBottom: 100,
        paddingLeft: 40,
        paddingRight: 40,
        maxWidth: 1200,
        margin: '0 auto',
        borderTop: `1px solid ${T.border}`
      }}>
        <h2 style={{
          fontSize: 48,
          fontWeight: 900,
          textAlign: 'center',
          marginBottom: 60,
          color: T.deepNavy
        }}>
          Case <span style={{ color: T.gold }}>Winners</span> Used UJRIS
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 32
        }}>
          {[
            {
              name: 'Sarah M.',
              award: '£42,300',
              quote: 'UJRIS showed me my case was worth far more than I thought. The metadata analysis proved the emails were backdated.',
              disc: 'Race Discrimination',
              icon: '⭐'
            },
            {
              name: 'James P.',
              award: '£56,700',
              quote: 'The case matcher let me see similar tribunal outcomes. It gave me confidence going into settlement negotiations.',
              disc: 'Sex Discrimination',
              icon: '⭐'
            },
            {
              name: 'Priya D.',
              award: '£19,200',
              quote: 'As someone disabled, I couldn\'t afford a solicitor. UJRIS made me feel supported and gave me evidence I needed.',
              disc: 'Disability Discrimination',
              icon: '⭐'
            }
          ].map((testimonial, i) => (
            <div key={i} style={{
              padding: 32,
              background: '#FAF6F0',
              border: `1px solid ${T.border}`,
              borderRadius: 12,
              borderLeft: `4px solid ${T.gold}`
            }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                {[...Array(5)].map((_, j) => (
                  <span key={j} style={{ fontSize: 20, color: T.gold }}>⭐</span>
                ))}
              </div>
              <p style={{ fontSize: 15, color: T.deepNavy, lineHeight: 1.8, marginBottom: 16, fontStyle: 'italic' }}>
                "{testimonial.quote}"
              </p>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.deepNavy, marginBottom: 4 }}>
                {testimonial.name}
              </div>
              <div style={{ fontSize: 13, color: T.midNavy, marginBottom: 12 }}>
                {testimonial.disc}
              </div>
              <div style={{
                fontSize: 20,
                fontWeight: 900,
                color: T.gold
              }}>
                Award: {testimonial.award}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ SECTION ── */}
      <section id="faq" style={{
        paddingTop: 120,
        paddingBottom: 100,
        paddingLeft: 40,
        paddingRight: 40,
        maxWidth: 800,
        margin: '0 auto',
        borderTop: `1px solid ${T.border}`
      }}>
        <h2 style={{
          fontSize: 48,
          fontWeight: 900,
          textAlign: 'center',
          marginBottom: 60,
          color: T.deepNavy
        }}>
          Frequently Asked <span style={{ color: T.gold }}>Questions</span>
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {[
            {
              q: 'Is UJRIS a substitute for legal advice?',
              a: 'No. UJRIS is a self-help tool designed to empower claimants who cannot afford a solicitor. For active legal cases, always consult a qualified employment solicitor. UJRIS can complement (not replace) professional legal advice.'
            },
            {
              q: 'Can I use this if I\'m still employed?',
              a: 'Yes. Stealth Mode (Ctrl+Escape twice) instantly hides the app and shows a blank weather page — perfect for protecting yourself at work. Your case data is encrypted locally.'
            },
            {
              q: 'What happens to my case data?',
              a: 'Your case, evidence, and personal information stays entirely on your device. UJRIS never uploads or stores your case details on servers. Complete privacy.'
            },
            {
              q: 'If I start free, can I upgrade to Justice whenever I want?',
              a: 'Yes. There\'s no commitment. Start free, keep all your work, and upgrade anytime. If you downgrade later, you keep access but features lock. No penalties.'
            },
            {
              q: 'How does the settlement advisor calculate recommendations?',
              a: 'Using the 2026 Vento bands (Lower £1.2k–£12k, Middle £12k–£36k, Upper £36k–£60k), evidence strength, timeline severity, and comparable tribunal outcomes. It\'s evidence-driven, not guesswork.'
            },
            {
              q: 'Can I export my case for my solicitor?',
              a: 'Yes. Justice tier and above allow PDF export of evidence, timeline, and analysis. You control what your solicitor sees.'
            },
            {
              q: 'Is there live coaching?',
              a: 'Sovereign and Advocate tiers include access to Q&A from case winners and educational resources. Advocate includes priority coaching. Not live, but always available.'
            },
            {
              q: 'What discrimination types are covered?',
              a: 'Race, ethnicity, religion, sex, gender, disability, age, nationality, sexual orientation, pregnancy, marriage, and institutional failure. We support all protected characteristics under UK Equality Act 2010.'
            }
          ].map((item, i) => (
            <div key={i} style={{
              padding: 24,
              background: '#FAF6F0',
              border: `1px solid ${T.border}`,
              borderRadius: 12
            }}>
              <div style={{
                fontSize: 16,
                fontWeight: 700,
                color: T.deepNavy,
                marginBottom: 12
              }}>
                Q: {item.q}
              </div>
              <div style={{
                fontSize: 14,
                color: T.midNavy,
                lineHeight: 1.8
              }}>
                {item.a}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section style={{
        paddingTop: 100,
        paddingBottom: 100,
        paddingLeft: 40,
        paddingRight: 40,
        textAlign: 'center',
        background: T.deepNavy,
        color: T.cream
      }}>
        <h2 style={{
          fontSize: 44,
          fontWeight: 900,
          marginBottom: 20,
          color: T.cream
        }}>
          Your Discrimination Case Deserves <span style={{ color: T.gold }}>Justice</span>
        </h2>
        <p style={{
          fontSize: 18,
          color: '#FAF6F0',
          marginBottom: 40,
          lineHeight: 1.6
        }}>
          Start free today. No card required. No commitment. Thousands of claimants have already started. You can too.
        </p>

        <button onClick={handleStartFree} style={{
          background: T.gold,
          color: T.deepNavy,
          border: 'none',
          padding: '18px 48px',
          borderRadius: 8,
          fontWeight: 700,
          fontSize: 18,
          cursor: 'pointer',
          transition: 'all 0.3s',
          boxShadow: '0 8px 24px rgba(212,175,55,0.4)'
        }} onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-4px)';
          e.target.style.boxShadow = '0 12px 32px rgba(212,175,55,0.5)';
        }} onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 8px 24px rgba(212,175,55,0.4)';
        }}>
          🚀 Start Your Free Case Now
        </button>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        padding: 40,
        background: T.deepNavy,
        color: '#9ca3af',
        borderTop: `1px solid rgba(212,175,55,0.2)`,
        textAlign: 'center',
        fontSize: 12,
        lineHeight: 1.8
      }}>
        <div style={{ marginBottom: 20 }}>
          <strong style={{ color: T.cream }}>UJRIS v3 Enterprise</strong><br/>
          Universal Justice Response & Intelligence System
        </div>
        <p>
          UJRIS is not a substitute for legal advice. This tool is designed for self-represented claimants seeking support understanding their discrimination case. For active legal proceedings, consult a qualified solicitor.<br/>
          <br/>
          ⚖️ <strong>Stealth Mode Safety:</strong> Press Ctrl+Escape twice to hide the app instantly. Your privacy is protected.<br/>
          <br/>
          © 2026 Universal Justice. All rights reserved. | Privacy Policy | Terms of Service
        </p>
      </footer>
    </div>
  );
}
