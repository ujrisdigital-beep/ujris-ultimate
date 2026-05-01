import React, { useState, useEffect } from 'react';

/**
 * SubscriptionManager.jsx
 *
 * Complete Stripe subscription management for UJRIS v3
 * Tiers: Essential (free), Justice (£9.99/mo), Sovereign (£19.99/mo), Advocate (£149 one-time)
 *
 * Features:
 * - Tier selection with feature comparison
 * - Stripe Checkout Session creation
 * - localStorage subscription status tracking
 * - Feature gates for premium components
 * - Upgrade CTA integration with other modules
 *
 * Environment: Requires VITE_STRIPE_PUBLIC_KEY
 */

const COLORS = {
  cream_bg: '#F8F1E9',
  navy_text: '#0F2C4A',
  gold_accent: '#D4AF37',
  light_gold: '#E8D4B7',
  danger_red: '#D32F2F',
  warning_orange: '#FF9800',
  success_green: '#4CAF50',
  info_blue: '#2196F3',
  light_gray: '#F5F5F5',
  medium_gray: '#CCCCCC',
  dark_gray: '#666666',
};

const S = {
  get: (key, defaultVal = null) => {
    try {
      const val = localStorage.getItem(`ujris3_${key}`);
      return val ? JSON.parse(val) : defaultVal;
    } catch {
      return defaultVal;
    }
  },
  set: (key, val) => {
    try {
      localStorage.setItem(`ujris3_${key}`, JSON.stringify(val));
      window.dispatchEvent(new CustomEvent('ujris:update', { detail: { key } }));
    } catch (e) {
      console.error('Storage error:', e);
    }
  },
  del: (key) => {
    try {
      localStorage.removeItem(`ujris3_${key}`);
    } catch (e) {
      console.error('Storage error:', e);
    }
  },
};

const TIERS = {
  essential: {
    id: 'essential',
    name: 'Essential',
    price: 0,
    interval: 'forever',
    description: 'Get started with UJRIS',
    color: COLORS.info_blue,
    icon: '✨',
    cta: 'You are here',
    ctaVariant: 'disabled',
    features: [
      { feature: '1 active case', included: true },
      { feature: 'Guided Assessment', included: true },
      { feature: 'Evidence Vault (10 files)', included: true },
      { feature: 'Basic Timeline', included: true },
      { feature: 'Vento Band Estimate', included: true },
      { feature: 'Educational Hub', included: true },
      { feature: 'Media Gallery', included: true },
      { feature: 'SovereignShield (scripts)', included: true },
      { feature: 'Metadata Shield', included: false },
      { feature: 'Case Matcher', included: false },
      { feature: 'Negotiation Simulator', included: false },
      { feature: '1:1 AI Coaching', included: false },
    ],
    userLimit: 1,
    evidenceLimit: 10,
    customSupport: false,
    exportFormat: 'PDF only',
  },
  justice: {
    id: 'justice',
    name: 'Justice',
    price: 9.99,
    priceAnnual: 79.99,
    interval: 'month',
    description: 'Full forensic analysis & AI coaching',
    color: COLORS.gold_accent,
    icon: '⚖️',
    cta: 'Subscribe £9.99/mo',
    ctaVariant: 'primary',
    stripePriceId: import.meta.env.VITE_STRIPE_JUSTICE_PRICE_ID || 'price_justice_monthly',
    features: [
      { feature: 'Unlimited cases', included: true },
      { feature: 'Full Evidence Vault (unlimited)', included: true },
      { feature: 'Advanced Timeline with AI insights', included: true },
      { feature: 'Forensic Auditor (full access)', included: true },
      { feature: 'Metadata Shield', included: true },
      { feature: 'Case Matcher (limited)', included: true },
      { feature: 'Negotiation Simulator', included: true },
      { feature: 'Evidence Hunt Mode', included: true },
      { feature: 'ICO Complaint Generator', included: true },
      { feature: 'Case Value Tracker (premium)', included: true },
      { feature: 'AI Document Generation', included: true },
      { feature: '1:1 AI Coaching (3/month)', included: false },
    ],
    userLimit: 1,
    evidenceLimit: 999,
    customSupport: false,
    exportFormat: 'PDF, DOCX, encrypted share',
  },
  sovereign: {
    id: 'sovereign',
    name: 'Sovereign',
    price: 19.99,
    priceAnnual: 159.99,
    interval: 'month',
    description: 'Unlimited AI coaching + settlement negotiation',
    color: COLORS.danger_red,
    icon: '👑',
    cta: 'Subscribe £19.99/mo',
    ctaVariant: 'primary',
    stripePriceId: import.meta.env.VITE_STRIPE_SOVEREIGN_PRICE_ID || 'price_sovereign_monthly',
    features: [
      { feature: 'Everything in Justice', included: true },
      { feature: '1:1 AI Coaching (unlimited)', included: true },
      { feature: 'Settlement Negotiation AI', included: true },
      { feature: 'Case Matcher (full)', included: true },
      { feature: 'Priority support (48h response)', included: true },
      { feature: 'White-label case templates', included: true },
      { feature: 'Presentation Generator', included: true },
      { feature: 'Case Study Generator', included: true },
      { feature: 'Shareable badges & infographics', included: true },
      { feature: 'Wisdom Circle (premium access)', included: true },
      { feature: 'Multi-case accountability partner', included: true },
      { feature: 'Advanced analytics + recommendations', included: true },
    ],
    userLimit: 1,
    evidenceLimit: 999,
    customSupport: true,
    exportFormat: 'All formats + encrypted cloud backup',
  },
  advocate: {
    id: 'advocate',
    name: 'Justice Advocate',
    price: 149,
    interval: 'one-time',
    description: '3 months Sovereign + tamper proof + case citations',
    color: COLORS.success_green,
    icon: '🏆',
    cta: 'One-Time: £149',
    ctaVariant: 'success',
    stripePriceId: import.meta.env.VITE_STRIPE_ADVOCATE_PRICE_ID || 'price_advocate_onetime',
    features: [
      { feature: '3 months of Sovereign access', included: true },
      { feature: 'Full Metadata Shield (forensic report)', included: true },
      { feature: 'Case Matcher with case citations', included: true },
      { feature: 'Court-ready evidence report', included: true },
      { feature: 'Expert testimony prep', included: true },
      { feature: 'Settlement proposal AI', included: true },
      { feature: 'Tribunal presentation generator', included: true },
      { feature: '1:1 compensation negotiation AI', included: true },
      { feature: 'Priority support (24h response)', included: true },
      { feature: 'Certificate of case readiness', included: true },
      { feature: 'Shareable impact report', included: true },
      { feature: 'Access to expert network', included: true },
    ],
    userLimit: 1,
    evidenceLimit: 999,
    customSupport: true,
    exportFormat: 'All formats + certified PDF',
  },
};

// ============================================================================
// Stripe Session Creation
// ============================================================================

const createCheckoutSession = async (tierId) => {
  try {
    const tier = TIERS[tierId];
    if (!tier) {
      throw new Error(`Unknown tier: ${tierId}`);
    }

    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tierId,
        userId: S.get('userId', 'anonymous'),
        email: S.get('userEmail', ''),
      }),
    });

    const session = await response.json();
    if (!response.ok) {
      throw new Error(session.error || 'Checkout session creation failed');
    }

    if (session.url) {
      window.location.href = session.url;
      return;
    }

    throw new Error('Stripe checkout URL was not returned');
  } catch (error) {
    console.error('Failed to create checkout session:', error);
    alert('Could not start checkout. Please try again or contact support.');
  }
};

// ============================================================================
// Feature Comparison Table
// ============================================================================

const FeatureComparison = () => {
  const allFeatures = [
    'Unlimited cases',
    'Evidence Vault',
    'Forensic Auditor',
    'Metadata Shield',
    'Case Matcher',
    'Negotiation Simulator',
    'AI Coaching (unlimited)',
    'Settlement Negotiation AI',
    'Priority Support',
    'Presentation Generator',
    'Shareable Badges',
  ];

  return (
    <div
      style={{
        overflowX: 'auto',
        marginTop: '32px',
        marginBottom: '32px',
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          backgroundColor: 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        }}
      >
        <thead>
          <tr style={{ backgroundColor: COLORS.light_gray }}>
            <th
              style={{
                padding: '16px',
                textAlign: 'left',
                fontSize: '13px',
                fontWeight: '700',
                color: COLORS.navy_text,
                borderRight: `1px solid ${COLORS.medium_gray}`,
              }}
            >
              Feature
            </th>
            {Object.values(TIERS).map((tier) => (
              <th
                key={tier.id}
                style={{
                  padding: '16px',
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: tier.color,
                  borderRight: `1px solid ${COLORS.medium_gray}`,
                }}
              >
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>
                  {tier.icon}
                </div>
                {tier.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allFeatures.map((feature, idx) => (
            <tr
              key={idx}
              style={{
                borderBottom: `1px solid ${COLORS.light_gray}`,
                backgroundColor: idx % 2 === 0 ? 'white' : COLORS.light_gray,
              }}
            >
              <td
                style={{
                  padding: '12px 16px',
                  fontSize: '13px',
                  color: COLORS.navy_text,
                  fontWeight: '500',
                  borderRight: `1px solid ${COLORS.medium_gray}`,
                }}
              >
                {feature}
              </td>
              {Object.values(TIERS).map((tier) => {
                const featureObj = tier.features.find(
                  (f) => f.feature.toLowerCase().includes(feature.toLowerCase())
                );
                const included = featureObj?.included ?? false;

                return (
                  <td
                    key={tier.id}
                    style={{
                      padding: '12px 16px',
                      textAlign: 'center',
                      fontSize: '14px',
                      borderRight: `1px solid ${COLORS.medium_gray}`,
                    }}
                  >
                    {included ? (
                      <span style={{ color: COLORS.success_green, fontWeight: '700' }}>
                        ✓
                      </span>
                    ) : (
                      <span style={{ color: COLORS.medium_gray }}>—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ============================================================================
// Tier Card
// ============================================================================

const TierCard = ({ tier, isCurrentTier, onSelect }) => {
  const isAnnualAvailable = tier.priceAnnual !== undefined;
  const [isAnnual, setIsAnnual] = useState(false);
  const displayPrice = isAnnual ? tier.priceAnnual : tier.price;
  const savings = isAnnual ? Math.round((tier.price * 12 - tier.priceAnnual) / 100) : 0;

  return (
    <div
      style={{
        backgroundColor: 'white',
        border: isCurrentTier
          ? `2px solid ${COLORS.gold_accent}`
          : `1px solid ${COLORS.light_gray}`,
        borderRadius: '12px',
        padding: '24px',
        boxShadow: isCurrentTier
          ? `0 8px 24px rgba(212, 175, 55, 0.2)`
          : '0 2px 8px rgba(0, 0, 0, 0.08)',
        position: 'relative',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={(e) => {
        if (!isCurrentTier) {
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isCurrentTier) {
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      {isCurrentTier && (
        <div
          style={{
            position: 'absolute',
            top: '-12px',
            right: '20px',
            padding: '4px 12px',
            backgroundColor: COLORS.gold_accent,
            color: COLORS.navy_text,
            fontSize: '11px',
            fontWeight: '700',
            borderRadius: '20px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Current Plan
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>{tier.icon}</div>
        <h3
          style={{
            fontSize: '18px',
            fontWeight: '700',
            color: COLORS.navy_text,
            margin: '0 0 4px 0',
          }}
        >
          {tier.name}
        </h3>
        <p
          style={{
            fontSize: '12px',
            color: COLORS.dark_gray,
            margin: 0,
          }}
        >
          {tier.description}
        </p>
      </div>

      {/* Price */}
      <div style={{ marginBottom: '16px' }}>
        <div
          style={{
            fontSize: '32px',
            fontWeight: '700',
            color: tier.color,
          }}
        >
          {tier.price === 0 ? 'Free' : `£${displayPrice.toFixed(2)}`}
        </div>
        <div style={{ fontSize: '12px', color: COLORS.dark_gray }}>
          {tier.interval === 'month' ? (
            <>
              per month
              {isAnnualAvailable && (
                <>
                  {' '}
                  •{' '}
                  <button
                    onClick={() => setIsAnnual(!isAnnual)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: COLORS.gold_accent,
                      fontWeight: '600',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    {isAnnual ? 'Monthly' : 'Save with annual'}
                  </button>
                  {isAnnual && (
                    <span style={{ color: COLORS.success_green, fontWeight: '600' }}>
                      {' '}
                      (save £{savings})
                    </span>
                  )}
                </>
              )}
            </>
          ) : tier.interval === 'one-time' ? (
            'one-time payment'
          ) : (
            'forever'
          )}
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={() => onSelect(tier.id)}
        disabled={isCurrentTier}
        style={{
          padding: '12px 16px',
          backgroundColor: isCurrentTier ? COLORS.light_gray : tier.color,
          color: isCurrentTier ? COLORS.dark_gray : 'white',
          border: 'none',
          borderRadius: '8px',
          fontWeight: '600',
          fontSize: '13px',
          cursor: isCurrentTier ? 'default' : 'pointer',
          transition: 'all 0.3s ease',
          marginBottom: '16px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
        onMouseEnter={(e) => {
          if (!isCurrentTier) {
            e.currentTarget.style.transform = 'scale(1.05)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isCurrentTier) {
            e.currentTarget.style.transform = 'scale(1)';
          }
        }}
      >
        {tier.cta}
      </button>

      {/* Features List */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: '11px',
            fontWeight: '700',
            color: COLORS.dark_gray,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '12px',
          }}
        >
          What's Included
        </div>
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {tier.features.slice(0, 6).map((item, idx) => (
            <li
              key={idx}
              style={{
                fontSize: '12px',
                color: item.included ? COLORS.navy_text : COLORS.dark_gray,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {item.included ? (
                <span style={{ color: COLORS.success_green, fontWeight: '700' }}>
                  ✓
                </span>
              ) : (
                <span style={{ color: COLORS.medium_gray }}>—</span>
              )}
              {item.feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// ============================================================================
// SubscriptionManager - Main Component
// ============================================================================

const SubscriptionManager = ({ onTierChange = () => {} }) => {
  const [currentTier, setCurrentTier] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const subscription = S.get('subscription', {});
    setCurrentTier(subscription.tier || 'essential');
    setMounted(true);

    // Check if returning from Stripe checkout
    const params = new URLSearchParams(window.location.search);
    if (params.get('tier')) {
      const tier = params.get('tier');
      handleSubscriptionSuccess(tier);
    }

    const handleUpdate = (e) => {
      if (e.detail?.key === 'subscription') {
        const subscription = S.get('subscription', {});
        setCurrentTier(subscription.tier || 'essential');
      }
    };

    window.addEventListener('ujris:update', handleUpdate);
    return () => window.removeEventListener('ujris:update', handleUpdate);
  }, []);

  const handleSubscriptionSuccess = (tierId) => {
    const subscription = {
      tier: tierId,
      activeUntil: tierId === 'advocate' 
        ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 3 months
        : null, // Subscription tiers auto-renew
      startedAt: new Date().toISOString(),
      status: 'active',
    };

    S.set('subscription', subscription);
    setCurrentTier(tierId);
    onTierChange(tierId);

    // Clear URL params
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  const handleUpgrade = async (tierId) => {
    if (tierId === 'essential') return; // Free tier, no checkout needed
    if (currentTier === tierId) return; // Already subscribed

    setLoading(true);
    try {
      await createCheckoutSession(tierId);
    } catch (error) {
      console.error('Upgrade failed:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div
        style={{
          padding: '20px',
          textAlign: 'center',
          color: COLORS.dark_gray,
        }}
      >
        Loading subscription options...
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: COLORS.cream_bg,
        color: COLORS.navy_text,
        minHeight: '100vh',
        padding: '16px',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h1
            style={{
              fontSize: '32px',
              fontWeight: 'bold',
              margin: '0 0 12px 0',
            }}
          >
            Choose Your UJRIS Plan
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: '14px',
              color: COLORS.dark_gray,
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            Start free. Upgrade anytime. All plans include our AI-powered forensic
            analysis and UK government-sourced legal guidance.
          </p>
        </div>

        {/* Tier Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
            marginBottom: '32px',
          }}
        >
          {Object.values(TIERS).map((tier) => (
            <TierCard
              key={tier.id}
              tier={tier}
              isCurrentTier={currentTier === tier.id}
              onSelect={handleUpgrade}
            />
          ))}
        </div>

        {/* Comparison Table Toggle */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <button
            onClick={() => setShowComparison(!showComparison)}
            style={{
              padding: '10px 16px',
              backgroundColor: COLORS.light_gray,
              color: COLORS.navy_text,
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = COLORS.medium_gray;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = COLORS.light_gray;
            }}
          >
            {showComparison ? '▼ Hide' : '▶ Show'} Detailed Feature
            Comparison
          </button>
        </div>

        {showComparison && <FeatureComparison />}

        {/* FAQ Section */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          <h2
            style={{
              fontSize: '18px',
              fontWeight: '700',
              marginBottom: '16px',
              color: COLORS.navy_text,
            }}
          >
            Frequently Asked Questions
          </h2>

          <div style={{ display: 'grid', gap: '16px' }}>
            {[
              {
                q: 'Can I switch plans later?',
                a: 'Yes. Switch anytime. If you upgrade mid-cycle, we\'ll prorate the difference.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'All major credit cards via Stripe. We also accept PayPal and bank transfers on request.',
              },
              {
                q: 'Is there a refund guarantee?',
                a: '30-day money-back guarantee on monthly subscriptions. Justice Advocate (one-time) is refundable within 7 days if you haven\'t used the premium features.',
              },
              {
                q: 'Who owns my case data?',
                a: 'You do. All data stays on your device in encrypted localStorage. We never sell, share, or use your case data.',
              },
              {
                q: 'What if I stop paying?',
                a: 'Your plan reverts to Essential (free). All your data remains accessible—you just lose premium features.',
              },
              {
                q: 'Do you provide legal advice?',
                a: 'No. UJRIS is a research and organization tool, not a substitute for legal counsel. Always consult a solicitor for your specific case.',
              },
            ].map((item, idx) => (
              <div key={idx}>
                <h4
                  style={{
                    fontSize: '13px',
                    fontWeight: '700',
                    color: COLORS.navy_text,
                    marginBottom: '6px',
                  }}
                >
                  {item.q}
                </h4>
                <p
                  style={{
                    fontSize: '13px',
                    color: COLORS.dark_gray,
                    margin: 0,
                    lineHeight: '1.6',
                  }}
                >
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Security & Trust */}
        <div
          style={{
            backgroundColor: 'rgba(212, 175, 55, 0.1)',
            borderLeft: `4px solid ${COLORS.gold_accent}`,
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
          }}
        >
          <h3
            style={{
              fontSize: '13px',
              fontWeight: '700',
              marginBottom: '8px',
              color: COLORS.navy_text,
            }}
          >
            🔒 Your Data is Secure
          </h3>
          <ul
            style={{
              fontSize: '12px',
              color: COLORS.dark_gray,
              margin: 0,
              paddingLeft: '20px',
              lineHeight: '1.6',
            }}
          >
            <li>All payments processed by Stripe (PCI DSS Level 1 certified)</li>
            <li>
              Your case data never leaves your device (stays in encrypted localStorage)
            </li>
            <li>HTTPS encryption on all traffic</li>
            <li>
              We never sell, share, or use your personal data for advertising
            </li>
            <li>GDPR and UK DPA 2018 compliant</li>
          </ul>
        </div>

        {/* Current Tier Info */}
        {currentTier && currentTier !== 'essential' && (
          <div
            style={{
              padding: '16px',
              backgroundColor: COLORS.light_gray,
              borderRadius: '8px',
              fontSize: '12px',
              color: COLORS.navy_text,
            }}
          >
            <strong>Your current plan:</strong> {TIERS[currentTier]?.name}
            {TIERS[currentTier]?.price && (
              <>
                {' '}
                – £{TIERS[currentTier].price.toFixed(2)}/month
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionManager;
