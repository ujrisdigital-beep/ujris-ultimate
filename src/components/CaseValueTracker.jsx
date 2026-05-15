import React, { useState, useEffect } from 'react';

/**
 * CaseValueTracker.jsx
 *
 * Real-time compensation calculator showing estimated case value
 * as evidence is added. Displays "what if" scenarios to motivate
 * evidence collection and prevent low settlements.
 *
 * Features:
 * - Gauge showing current estimate vs potential max
 * - Impact breakdown (timeline, medical evidence, documents, etc.)
 * - "What If" scenarios (medical report = +£5k, witness = +£8k)
 * - Monthly value indicator (MRR equivalent)
 * - Premium feature: Detailed settlement scenarios
 *
 * Design: Clear visualizations with trauma-informed colors
 * Accessibility: Screen reader support, keyboard navigation
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
};

// ============================================================================
// Vento Band Calculator (2026 UK Vento bands)
// ============================================================================
const calculateVentoBand = (evidenceCount, timelineEvents, traumaScore, medicalEvidence) => {
  let score = 0;

  // Evidence count (0-20 points)
  if (evidenceCount > 20) score += 20;
  else score += evidenceCount;

  // Timeline completeness (0-15 points)
  const timelineScore = Math.min(timelineEvents / 50 * 15, 15);
  score += timelineScore;

  // Trauma/medical evidence (0-15 points)
  if (medicalEvidence) score += 15;
  score += Math.min(traumaScore / 100 * 10, 10);

  // Determine band based on score
  if (score < 20) {
    return { band: 'Lower', min: 1200, max: 12100, score };
  } else if (score < 40) {
    return { band: 'Middle', min: 12100, max: 36400, score };
  } else {
    return { band: 'Upper', min: 36400, max: 60700, score };
  }
};

// ============================================================================
// CompensationGauge - Visual indicator
// ============================================================================
const CompensationGauge = ({ current, potential, band }) => {
  const percentage = (current / potential) * 100;
  const barWidth = Math.min(percentage, 100);

  return (
    <div style={{ marginBottom: '20px' }}>
      <div
        style={{
          marginBottom: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '12px',
              color: COLORS.dark_gray,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '4px',
            }}
          >
            Current Estimate
          </div>
          <div
            style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: COLORS.gold_accent,
            }}
          >
            £{current.toLocaleString()}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontSize: '12px',
              color: COLORS.dark_gray,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '4px',
            }}
          >
            {band}
          </div>
          <div
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: COLORS.navy_text,
            }}
          >
            {band === 'Lower' && '💛 Lower Band'}
            {band === 'Middle' && '🟠 Middle Band'}
            {band === 'Upper' && '🔴 Upper Band'}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          height: '12px',
          backgroundColor: COLORS.medium_gray,
          borderRadius: '6px',
          overflow: 'hidden',
          marginBottom: '12px',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${barWidth}%`,
            background: `linear-gradient(90deg, ${COLORS.info_blue} 0%, ${COLORS.gold_accent} 100%)`,
            transition: 'width 0.6s ease-out',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              height: '100%',
              width: '8px',
              background: 'rgba(255, 255, 255, 0.6)',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '11px',
          color: COLORS.dark_gray,
        }}
      >
        <span>£{band === 'Lower' ? '1,200' : band === 'Middle' ? '12,100' : '36,400'}</span>
        <span>Potential: £{potential.toLocaleString()}</span>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// ImpactBreakdown - Show contributors to case value
// ============================================================================
const ImpactBreakdown = ({ impacts }) => {
  const totalImpact = impacts.reduce((sum, i) => sum + i.impact, 0);

  return (
    <div style={{ marginBottom: '20px' }}>
      <h3
        style={{
          fontSize: '14px',
          fontWeight: '700',
          marginBottom: '12px',
          color: COLORS.navy_text,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        What's Adding Value
      </h3>

      {impacts.map((item, idx) => (
        <div
          key={idx}
          style={{
            marginBottom: '10px',
            padding: '10px 12px',
            backgroundColor: COLORS.light_gray,
            borderRadius: '6px',
            borderLeft: `4px solid ${item.color}`,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '6px',
            }}
          >
            <div
              style={{
                fontSize: '13px',
                fontWeight: '600',
                color: COLORS.navy_text,
              }}
            >
              {item.icon} {item.label}
            </div>
            <div
              style={{
                fontSize: '13px',
                fontWeight: '700',
                color: item.color,
              }}
            >
              +£{item.impact.toLocaleString()}
            </div>
          </div>
          <div
            style={{
              fontSize: '12px',
              color: COLORS.dark_gray,
            }}
          >
            {item.description}
          </div>
          {/* Mini bar */}
          <div
            style={{
              height: '4px',
              backgroundColor: 'rgba(0,0,0,0.1)',
              borderRadius: '2px',
              marginTop: '6px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${(item.impact / totalImpact) * 100}%`,
                backgroundColor: item.color,
              }}
            />
          </div>
        </div>
      ))}

      <div
        style={{
          padding: '12px',
          backgroundColor: 'rgba(212, 175, 55, 0.1)',
          borderRadius: '6px',
          fontSize: '12px',
          color: COLORS.navy_text,
          marginTop: '12px',
        }}
      >
        <strong>Total Impact: £{totalImpact.toLocaleString()}</strong>
      </div>
    </div>
  );
};

// ============================================================================
// WhatIfScenario - "If you add X, value increases by Y"
// ============================================================================
const WhatIfScenario = ({ scenarios, currentValue }) => {
  const [selectedScenario, setSelectedScenario] = useState(null);

  return (
    <div style={{ marginBottom: '20px' }}>
      <h3
        style={{
          fontSize: '14px',
          fontWeight: '700',
          marginBottom: '12px',
          color: COLORS.navy_text,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        ⚡ What If Scenarios
      </h3>

      <div style={{ display: 'grid', gap: '10px', marginBottom: '12px' }}>
        {scenarios.map((scenario, idx) => (
          <button
            key={idx}
            onClick={() =>
              setSelectedScenario(
                selectedScenario?.id === scenario.id ? null : scenario
              )
            }
            style={{
              padding: '12px',
              backgroundColor: COLORS.light_gray,
              border: selectedScenario?.id === scenario.id 
                ? `2px solid ${COLORS.gold_accent}` 
                : `2px solid transparent`,
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => {
              if (selectedScenario?.id !== scenario.id) {
                e.currentTarget.style.backgroundColor = '#EFEFEF';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedScenario?.id !== scenario.id) {
                e.currentTarget.style.backgroundColor = COLORS.light_gray;
              }
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: COLORS.navy_text,
                  }}
                >
                  {scenario.action}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: COLORS.dark_gray,
                    marginTop: '2px',
                  }}
                >
                  {scenario.description}
                </div>
              </div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: COLORS.success_green,
                  textAlign: 'right',
                  minWidth: '80px',
                }}
              >
                +£{scenario.increase.toLocaleString()}
              </div>
            </div>
          </button>
        ))}
      </div>

      {selectedScenario && (
        <div
          style={{
            padding: '14px',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            borderLeft: `4px solid ${COLORS.success_green}`,
            borderRadius: '6px',
            marginBottom: '12px',
          }}
        >
          <div style={{ fontSize: '12px', color: COLORS.dark_gray, marginBottom: '6px' }}>
            If you {selectedScenario.action.toLowerCase()}:
          </div>
          <div style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            color: COLORS.success_green 
          }}>
            £{currentValue.toLocaleString()} → £{(currentValue + selectedScenario.increase).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// SettlementAdvisor - Premium feature preview
// ============================================================================
const SettlementAdvisor = ({ currentValue, isPremium, onUpgrade }) => {
  const settlements = [
    {
      offer: currentValue * 0.6,
      recommendation: '❌ TOO LOW',
      explanation: 'Below Vento band minimum. Risk rejecting mediocre offer.',
      color: COLORS.danger_red,
    },
    {
      offer: currentValue * 0.9,
      recommendation: '⚠️ CONSIDER',
      explanation: 'Mid-band but you could improve position with more evidence.',
      color: COLORS.warning_orange,
    },
    {
      offer: currentValue * 1.1,
      recommendation: '✅ EXCELLENT',
      explanation: 'Above current estimate. Reasonable to settle here.',
      color: COLORS.success_green,
    },
    {
      offer: currentValue * 1.3,
      recommendation: '🎯 DREAM',
      explanation: 'Upper band outcome. Push for tribunal if employer refuses.',
      color: COLORS.info_blue,
    },
  ];

  return (
    <div
      style={{
        padding: '16px',
        backgroundColor: COLORS.light_gray,
        borderRadius: '8px',
        marginBottom: '20px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        <h3
          style={{
            fontSize: '14px',
            fontWeight: '700',
            margin: 0,
            color: COLORS.navy_text,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          🎯 Settlement Advisor
        </h3>
        {!isPremium && (
          <button
            onClick={onUpgrade}
            style={{
              padding: '6px 12px',
              backgroundColor: COLORS.gold_accent,
              color: COLORS.navy_text,
              border: 'none',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#C89A2E';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = COLORS.gold_accent;
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            UPGRADE
          </button>
        )}
      </div>

      {isPremium ? (
        <div style={{ display: 'grid', gap: '10px' }}>
          {settlements.map((settlement, idx) => (
            <div
              key={idx}
              style={{
                padding: '12px',
                backgroundColor: 'white',
                borderLeft: `4px solid ${settlement.color}`,
                borderRadius: '6px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '6px',
                }}
              >
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: settlement.color,
                  }}
                >
                  £{settlement.offer.toLocaleString()}
                </div>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: '700',
                    color: settlement.color,
                  }}
                >
                  {settlement.recommendation}
                </div>
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: COLORS.dark_gray,
                }}
              >
                {settlement.explanation}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ fontSize: '12px', color: COLORS.dark_gray }}>
          See what settlement offers are fair based on your case strength.{' '}
          <strong>Premium feature</strong> 🔒
        </div>
      )}
    </div>
  );
};

// ============================================================================
// CaseValueTracker - Main Component
// ============================================================================
const CaseValueTracker = ({ onUpgrade = () => {} }) => {
  const [caseData, setCaseData] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const loadData = () => {
      const storedCase = S.get('case_data');
      const subscription = S.get('subscription', {});

      setCaseData(storedCase);
      setIsPremium(
        subscription.tier === 'justice' ||
        subscription.tier === 'sovereign' ||
        subscription.tier === 'advocate'
      );
      setMounted(true);
    };

    loadData();

    const handleUpdate = (e) => {
      if (['case_data', 'subscription'].includes(e.detail?.key)) {
        loadData();
      }
    };

    window.addEventListener('ujris:update', handleUpdate);
    return () => window.removeEventListener('ujris:update', handleUpdate);
  }, []);

  if (!mounted || !caseData) {
    return (
      <div
        style={{
          padding: '20px',
          textAlign: 'center',
          color: COLORS.dark_gray,
        }}
      >
        <div style={{ fontSize: '24px', marginBottom: '8px' }}>💰</div>
        <div>Start your case to see compensation estimate</div>
      </div>
    );
  }

  // Calculate Vento band
  const ventoBand = calculateVentoBand(
    caseData.evidenceCount || 0,
    caseData.timelineCount || 0,
    caseData.traumaScore || 0,
    caseData.medicalEvidence || false
  );

  // Calculate current value based on band progress
  const bandRange = ventoBand.max - ventoBand.min;
  const scorePercent = Math.min(ventoBand.score / 50, 1); // Normalize to 0-1
  const currentValue = ventoBand.min + bandRange * scorePercent;

  // Impact breakdown
  const impacts = [];

  if ((caseData.evidenceCount || 0) > 0) {
    impacts.push({
      icon: '📄',
      label: 'Evidence Files',
      description: `${caseData.evidenceCount} documents strengthen your case`,
      impact: Math.min(caseData.evidenceCount * 200, 3000),
      color: COLORS.info_blue,
    });
  }

  if ((caseData.timelineCount || 0) > 0) {
    impacts.push({
      icon: '📅',
      label: 'Timeline Events',
      description: `${caseData.timelineCount} dated incidents establish pattern`,
      impact: Math.min(caseData.timelineCount * 150, 3500),
      color: COLORS.warning_orange,
    });
  }

  if (caseData.medicalEvidence) {
    impacts.push({
      icon: '🏥',
      label: 'Medical Evidence',
      description: 'Documented health impact significantly increases award',
      impact: 5000,
      color: COLORS.danger_red,
    });
  }

  if ((caseData.traumaScore || 0) > 50) {
    impacts.push({
      icon: '💔',
      label: 'Psychological Impact',
      description: 'Emotional distress evidenced by medical professionals',
      impact: Math.min((caseData.traumaScore - 50) * 50, 2500),
      color: COLORS.success_green,
    });
  }

  // What if scenarios
  const scenarios = [
    {
      id: 1,
      action: 'Add medical report',
      description: 'Secure GP/therapist letter documenting impact',
      increase: 5000,
    },
    {
      id: 2,
      action: 'Get witness statement',
      description: 'Colleague corroboration strengthens credibility',
      increase: 3000,
    },
    {
      id: 3,
      action: 'Complete timeline',
      description: 'Document all incidents with dates and witnesses',
      increase: 4000,
    },
    {
      id: 4,
      action: 'Add email evidence',
      description: 'Written communications create audit trail',
      increase: 2500,
    },
    {
      id: 5,
      action: 'Organize evidence',
      description: 'Clean presentation increases tribunal confidence',
      increase: 1500,
    },
  ];

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
          maxWidth: '900px',
          margin: '0 auto',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 'bold',
              margin: '0 0 8px 0',
            }}
          >
            💰 Case Value Tracker
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: '14px',
              color: COLORS.dark_gray,
            }}
          >
            Real-time compensation estimate based on evidence and timeline
          </p>
        </div>

        {/* Main Gauge */}
        <div
          style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            marginBottom: '20px',
          }}
        >
          <CompensationGauge
            current={Math.round(currentValue)}
            potential={ventoBand.max}
            band={ventoBand.band}
          />

          {/* Vento Info Box */}
          <div
            style={{
              padding: '12px',
              backgroundColor: 'rgba(212, 175, 55, 0.1)',
              borderRadius: '6px',
              fontSize: '12px',
              color: COLORS.navy_text,
            }}
          >
            <strong>📊 Vento Band Details:</strong>{' '}
            {ventoBand.band} band typically covers £
            {ventoBand.min.toLocaleString()}–£{ventoBand.max.toLocaleString()} based on
            2026 UK employment law guidelines. Your score:
            <strong> {ventoBand.score.toFixed(0)}/50</strong>
          </div>
        </div>

        {/* Impact Breakdown */}
        {impacts.length > 0 && (
          <div
            style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              marginBottom: '20px',
            }}
          >
            <ImpactBreakdown impacts={impacts} />
          </div>
        )}

        {/* What If Scenarios */}
        <div
          style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            marginBottom: '20px',
          }}
        >
          <WhatIfScenario
            scenarios={scenarios}
            currentValue={Math.round(currentValue)}
          />
        </div>

        {/* Settlement Advisor */}
        <SettlementAdvisor
          currentValue={Math.round(currentValue)}
          isPremium={isPremium}
          onUpgrade={onUpgrade}
        />

        {/* Month Projection */}
        <div
          style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            marginBottom: '20px',
          }}
        >
          <h3
            style={{
              fontSize: '14px',
              fontWeight: '700',
              marginBottom: '12px',
              color: COLORS.navy_text,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            💷 Monthly Equivalent
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '12px',
            }}
          >
            {[6, 12, 24, 36].map((months) => (
              <div
                key={months}
                style={{
                  padding: '12px',
                  backgroundColor: COLORS.light_gray,
                  borderRadius: '6px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    color: COLORS.dark_gray,
                    marginBottom: '4px',
                }}
                >
                  Over {months} months
                </div>
                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: COLORS.gold_accent,
                  }}
                >
                  £{(currentValue / months).toLocaleString('en-GB', {
                    maximumFractionDigits: 0,
                  })}/mo
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              fontSize: '12px',
              color: COLORS.dark_gray,
              marginTop: '12px',
              fontStyle: 'italic',
            }}
          >
            💡 Think of your case value as future income replaced. Higher awards in
            upper Vento band reflect the serious impact of discrimination.
          </div>
        </div>

        {/* Footer CTA */}
        <div
          style={{
            padding: '16px',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            borderLeft: `4px solid ${COLORS.success_green}`,
            borderRadius: '8px',
            marginBottom: '16px',
          }}
        >
          <strong>🎯 Action:</strong> Each piece of evidence you add increases
          your case value. Focus on medical reports and witness statements—they
          have the biggest impact on tribunal decisions.
        </div>
      </div>
    </div>
  );
};

export default CaseValueTracker;
