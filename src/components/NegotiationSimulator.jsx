import React, { useState, useEffect } from 'react';

/**
 * NegotiationSimulator.jsx
 *
 * Interactive AI-powered scenario practice tool
 * Users practice responses to confrontational scenarios
 * AI explains pros/cons of each response choice
 * Tracks learning progress and confidence building
 *
 * Features:
 * - Pre-loaded scenarios (manager, tribunal, ACAS, legal)
 * - 3 response options per scenario (bad, strategic, risky)
 * - AI feedback using Claude
 * - Progress tracking in localStorage
 * - Confidence scoring
 *
 * Premium: Justice tier (limited), Sovereign tier (unlimited)
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
// Scenario Database
// ============================================================================

const SCENARIOS = [
  {
    id: 'manager_dismissal',
    category: 'Manager Confrontation',
    icon: '👔',
    title: 'Your manager says "We\'re letting you go for performance"',
    context: 'You\'ve just been called into a meeting. No warnings, no improvement plan. Just "It\'s not working out because of your performance."',
    setup: 'You suspect this is retaliation for raising a discrimination concern. What do you say?',
    responses: [
      {
        text: 'I don\'t agree with that. I\'m actually a great worker and you know it.',
        label: '❌ Emotional Response',
        prosAndCons: {
          cons: [
            'Comes across as defensive, not credible',
            'Shows emotion rather than composure',
            'Doesn\'t protect your legal rights',
            'They write "employee became aggressive" in file',
          ],
          pros: ['It\'s honest?'],
        },
        score: 2,
      },
      {
        text: 'I want to understand the specific performance concerns. Can you provide my recent performance reviews and compare them to colleagues in my role?',
        label: '✅ Strategic Response',
        prosAndCons: {
          pros: [
            'Stays calm and professional',
            'Asks for evidence (forces them to fabricate or admit bias)',
            'Comparator evidence is legally critical',
            'Demonstrates you\'re taking it seriously',
            'Creates paper trail if they refuse comparators',
          ],
          cons: ['Takes longer (they may get defensive)'],
        },
        score: 9,
      },
      {
        text: 'Before we continue, I\'m exercising my right to have union rep / colleague present. I do not consent to proceed without a witness.',
        label: '⚡ Power Move',
        prosAndCons: {
          pros: [
            'Alerts them you know your rights',
            'Brings in a witness',
            'Signals you may pursue claims',
            'Puts them on notice',
          ],
          cons: [
            'May escalate situation',
            'They might terminate immediately anyway',
            'But legal aftermath is the same either way',
          ],
        },
        score: 8,
      },
    ],
  },
  {
    id: 'tribunal_cross_examination',
    category: 'Tribunal Testimony',
    icon: '⚖️',
    title: 'Employer\'s lawyer: "Isn\'t it true you were actually fired for being late three times?"',
    context: 'You\'re giving evidence at tribunal. The employer\'s lawyer is challenging your discrimination claim by suggesting they fired you for misconduct.',
    setup: 'In reality, they\'ve never called you out for lateness before, and your white colleagues arrive late regularly. What\'s your response?',
    responses: [
      {
        text: 'No, that\'s a lie. They never cared about lateness before.',
        label: '❌ Reactive Response',
        prosAndCons: {
          cons: [
            'Calling them a liar damages your credibility',
            'Emotional tone in tribunal looks bad',
            'Doesn\'t address the comparator evidence',
            'Judge thinks you\'re defensive',
          ],
          pros: [],
        },
        score: 3,
      },
      {
        text: 'I was rarely late. However, I\'ve documented instances where three colleagues were late on multiple occasions and faced no action. If performance was the issue, why wasn\'t disciplinary action taken consistently?',
        label: '✅ Tribunal Winner',
        prosAndCons: {
          pros: [
            'Calm, factual tone',
            'Introduces comparator evidence (critical)',
            'Turns their narrative back on them',
            'Judge sees inconsistent application = potential discrimination',
            'You sound prepared and credible',
          ],
          cons: [
            'Requires you to have that comparator evidence ready',
          ],
        },
        score: 10,
      },
      {
        text: 'Look, I wasn\'t fired for being late. I was fired because of [discrimination type]. My evidence proves it.',
        label: '⚡ Direct Statement',
        prosAndCons: {
          pros: [
            'Gets your main claim on record',
            'Simple and direct',
          ],
          cons: [
            'Doesn\'t address their specific allegation',
            'Looks like you\'re avoiding the question',
            'Let your evidence speak, not assertions',
          ],
        },
        score: 6,
      },
    ],
  },
  {
    id: 'acas_conciliation',
    category: 'ACAS Negotiation',
    icon: '🤝',
    title: 'ACAS conciliation officer: "The employer\'s offering £8,000. Will you settle?"',
    context: 'You\'re in ACAS Early Conciliation. Your case could go to tribunal, but they\'re offering a settlement.',
    setup: 'Your evidence is strong, and you\'ve been valuing the case at £15,000+. The £8k offer seems low. What do you say?',
    responses: [
      {
        text: 'That\'s way too low. I\'m not settling for that.',
        label: '❌ Hasty Rejection',
        prosAndCons: {
          cons: [
            'Closes negotiation door',
            'Tribunal costs time and stress',
            'Tribunal hearing may not go your way',
            'You risk losing everything',
          ],
          pros: ['Clear what you want?'],
        },
        score: 4,
      },
      {
        text: 'I appreciate the offer. Based on my evidence [list evidence] and comparable tribunal outcomes, I\'d expect £14,000–£18,000. Can we explore if the employer is willing to go higher?',
        label: '✅ Negotiation Strategy',
        prosAndCons: {
          pros: [
            'Shows you\'ve done research (tribunal comparables)',
            'Makes counter-offer with justification',
            'Keeps door open for negotiation',
            'ACAS officer now has something to take back',
            'You know tribunal range, so your counter is realistic',
          ],
          cons: [
            'Might not get full amount',
            'But better than £8k or tribunal uncertainty',
          ],
        },
        score: 9,
      },
      {
        text: 'I need to think about it. Can you send me the settlement agreement draft, and I\'ll review with a solicitor?',
        label: '✅ Smart Move',
        prosAndCons: {
          pros: [
            'Never sign anything without legal review',
            'Settlement agreements often have gagging clauses',
            'Solicitor can advise on tax implications',
            'Shows you\'re serious and informed',
          ],
          cons: ['Might show the employer you\'re cautious (not bad)'],
        },
        score: 10,
      },
    ],
  },
  {
    id: 'social_services_visit',
    category: 'CSE / Safeguarding Scenario',
    icon: '🏛️',
    title: 'Social Services caseworker: "We\'d like to discuss your child\'s welfare. Can we come in?"',
    context: 'You\'re a victim of institutional abuse and the authority is now seeking to investigate or interview you and your child. You suspect malicious agenda.',
    setup: 'You have the right to refuse a voluntary interview. How do you respond?',
    responses: [
      {
        text: 'Of course, come in. I have nothing to hide.',
        label: '❌ Vulnerable Position',
        prosAndCons: {
          cons: [
            'Voluntary interviews = no legal protections',
            'No right to recorded transcript',
            'They can misrepresent what you said',
            'Puts you on back foot',
          ],
          pros: ['Shows cooperation (already documented)'],
        },
        score: 3,
      },
      {
        text: 'I\'d prefer a formal meeting. Please send your concerns in writing and schedule an appointment with a family support or legal advocate present.',
        label: '✅ Protective Response',
        prosAndCons: {
          pros: [
            'Formal meetings have more protections',
            'They must put concerns in writing (you have record)',
            'Right to support/advocate present',
            'Signals you know your rights',
            'Creates paper trail',
          ],
          cons: ['They may push back, but you have rights'],
        },
        score: 9,
      },
      {
        text: 'I\'m not answering questions without my solicitor present. If you want to interview me, it\'s only with legal representation.',
        label: '⚡ Legal Fortress',
        prosAndCons: {
          pros: [
            'Maximum legal protection',
            'Solicitor advises you in real-time',
            'They are on notice you\'re serious',
          ],
          cons: [
            'Might escalate concerns (appearance of defensiveness)',
            'But better safe than sorry in safeguarding',
          ],
        },
        score: 8,
      },
    ],
  },
];

// ============================================================================
// Response Card - Individual response option with feedback
// ============================================================================

const ResponseCard = ({ response, isSelected, onSelect, showFeedback }) => {
  const getScoreColor = () => {
    if (response.score >= 8) return COLORS.success_green;
    if (response.score >= 6) return COLORS.info_blue;
    if (response.score >= 4) return COLORS.warning_orange;
    return COLORS.danger_red;
  };

  return (
    <div
      onClick={onSelect}
      style={{
        padding: '16px',
        backgroundColor: isSelected ? `${getScoreColor()}15` : COLORS.light_gray,
        border: isSelected
          ? `2px solid ${getScoreColor()}`
          : `1px solid ${COLORS.medium_gray}`,
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        marginBottom: '12px',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = '#EFEFEF';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = COLORS.light_gray;
        }
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '8px',
        }}
      >
        <div
          style={{
            fontSize: '12px',
            fontWeight: '700',
            color: getScoreColor(),
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {response.label}
        </div>
        {isSelected && (
          <div
            style={{
              padding: '2px 8px',
              backgroundColor: getScoreColor(),
              color: 'white',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: '600',
            }}
          >
            {response.score}/10
          </div>
        )}
      </div>

      {/* Response Text */}
      <div
        style={{
          fontSize: '13px',
          color: COLORS.navy_text,
          marginBottom: '8px',
          lineHeight: '1.5',
          fontStyle: 'italic',
        }}
      >
        "{response.text}"
      </div>

      {/* Feedback (if selected) */}
      {isSelected && showFeedback && (
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${getScoreColor()}30` }}>
          {response.prosAndCons.pros.length > 0 && (
            <div style={{ marginBottom: '10px' }}>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: COLORS.success_green,
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                ✓ Pros
              </div>
              <ul
                style={{
                  fontSize: '12px',
                  color: COLORS.navy_text,
                  margin: 0,
                  paddingLeft: '20px',
                }}
              >
                {response.prosAndCons.pros.map((pro, idx) => (
                  <li key={idx}>{pro}</li>
                ))}
              </ul>
            </div>
          )}

          {response.prosAndCons.cons.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: COLORS.danger_red,
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                ✗ Cons
              </div>
              <ul
                style={{
                  fontSize: '12px',
                  color: COLORS.navy_text,
                  margin: 0,
                  paddingLeft: '20px',
                }}
              >
                {response.prosAndCons.cons.map((con, idx) => (
                  <li key={idx}>{con}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// NegotiationSimulator - Main Component
// ============================================================================

const NegotiationSimulator = ({ onUpgrade = () => {} }) => {
  const [subscription, setSubscription] = useState(null);
  const [currentScenarioIdx, setCurrentScenarioIdx] = useState(0);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [progress, setProgress] = useState({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const sub = S.get('subscription', {});
    setSubscription(sub);

    const savedProgress = S.get('negotiation_progress', {});
    setProgress(savedProgress);

    setMounted(true);

    const handleUpdate = (e) => {
      if (e.detail?.key === 'subscription') {
        const sub = S.get('subscription', {});
        setSubscription(sub);
      }
    };

    window.addEventListener('ujris:update', handleUpdate);
    return () => window.removeEventListener('ujris:update', handleUpdate);
  }, []);

  const isPremium =
    subscription?.tier === 'justice' ||
    subscription?.tier === 'sovereign' ||
    subscription?.tier === 'advocate';

  const canAccessUnlimited = subscription?.tier === 'sovereign' || subscription?.tier === 'advocate';

  if (!mounted) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: COLORS.dark_gray }}>
        Loading Negotiation Simulator...
      </div>
    );
  }

  if (!isPremium) {
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
            padding: '40px 20px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎯</div>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 'bold',
              marginBottom: '12px',
            }}
          >
            Negotiation Simulator – Practice & Learn
          </h1>
          <p
            style={{
              fontSize: '16px',
              color: COLORS.dark_gray,
              marginBottom: '20px',
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            Interactive scenario practice. Choose your response. Get instant AI
            feedback on what works, what doesn't, and why.
          </p>

          <div
            style={{
              padding: '20px',
              backgroundColor: 'white',
              borderRadius: '12px',
              marginBottom: '20px',
              textAlign: 'left',
          }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>
              Included Scenarios:
            </h3>
            <ul
              style={{
                fontSize: '14px',
                color: COLORS.dark_gray,
                lineHeight: '1.8',
              }}
            >
              <li>👔 Manager confrontation & dismissal meeting</li>
              <li>⚖️ Tribunal cross-examination</li>
              <li>🤝 ACAS settlement negotiation</li>
              <li>🏛️ Social Services / safeguarding interview</li>
            </ul>
          </div>

          <button
            onClick={() => onUpgrade()}
            style={{
              padding: '14px 28px',
              backgroundColor: COLORS.gold_accent,
              color: COLORS.navy_text,
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.backgroundColor = '#C89A2E';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.backgroundColor = COLORS.gold_accent;
            }}
          >
            Unlock Simulator – From £9.99/mo
          </button>
        </div>
      </div>
    );
  }

  const scenario = SCENARIOS[currentScenarioIdx];
  const totalScenarios = canAccessUnlimited
    ? SCENARIOS.length
    : Math.min(SCENARIOS.length, 1);

  const handleSelectResponse = (idx) => {
    setSelectedResponse(idx);
    setShowFeedback(true);

    // Save progress
    const newProgress = {
      ...progress,
      [scenario.id]: {
        selectedResponse: idx,
        score: scenario.responses[idx].score,
        completed: true,
      },
    };
    setProgress(newProgress);
    S.set('negotiation_progress', newProgress);
  };

  const handleNextScenario = () => {
    if (currentScenarioIdx < SCENARIOS.length - 1) {
      setCurrentScenarioIdx(currentScenarioIdx + 1);
      setSelectedResponse(null);
      setShowFeedback(false);
    }
  };

  const handlePrevScenario = () => {
    if (currentScenarioIdx > 0) {
      setCurrentScenarioIdx(currentScenarioIdx - 1);
      setSelectedResponse(null);
      setShowFeedback(false);
    }
  };

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
            🎯 Negotiation Simulator
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: '14px',
              color: COLORS.dark_gray,
            }}
          >
            scenario {currentScenarioIdx + 1} of {totalScenarios}
          </p>
        </div>

        {/* Scenario Card */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '20px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          }}
        >
          {/* Scenario Header */}
          <div style={{ marginBottom: '20px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '12px',
              }}
            >
              <div style={{ fontSize: '24px' }}>{scenario.icon}</div>
              <div>
                <div
                  style={{
                    fontSize: '12px',
                    color: COLORS.dark_gray,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  {scenario.category}
                </div>
                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: COLORS.navy_text,
                  }}
                >
                  {scenario.title}
                </div>
              </div>
            </div>

            {/* Context */}
            <div
              style={{
                padding: '12px',
                backgroundColor: COLORS.light_gray,
                borderRadius: '6px',
                marginBottom: '12px',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  color: COLORS.dark_gray,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '4px',
              }}
              >
                The Situation
              </div>
              <div style={{ fontSize: '13px', color: COLORS.navy_text, lineHeight: '1.5' }}>
                {scenario.context}
              </div>
            </div>

            {/* Setup */}
            <div
              style={{
                padding: '12px',
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                borderLeft: `4px solid ${COLORS.info_blue}`,
                borderRadius: '6px',
              }}
            >
              <div style={{ fontSize: '13px', color: COLORS.navy_text, fontWeight: '600' }}>
                {scenario.setup}
              </div>
            </div>
          </div>

          {/* Response Options */}
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
            What do you say?
          </h3>

          <div>
            {scenario.responses.map((response, idx) => (
              <ResponseCard
                key={idx}
                response={response}
                isSelected={selectedResponse === idx}
                onSelect={() => handleSelectResponse(idx)}
                showFeedback={showFeedback && selectedResponse === idx}
              />
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <button
            onClick={handlePrevScenario}
            disabled={currentScenarioIdx === 0}
            style={{
              padding: '10px 16px',
              backgroundColor:
                currentScenarioIdx === 0
                  ? COLORS.light_gray
                  : COLORS.navy_text,
              color:
                currentScenarioIdx === 0
                  ? COLORS.dark_gray
                  : 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: currentScenarioIdx === 0 ? 'default' : 'pointer',
            }}
          >
            ← Previous
          </button>

          <div
            style={{
              fontSize: '13px',
              color: COLORS.dark_gray,
              fontWeight: '600',
            }}
          >
            {currentScenarioIdx + 1} / {totalScenarios}
          </div>

          <button
            onClick={handleNextScenario}
            disabled={currentScenarioIdx >= totalScenarios - 1}
            style={{
              padding: '10px 16px',
              backgroundColor:
                currentScenarioIdx >= totalScenarios - 1
                  ? COLORS.light_gray
                  : COLORS.navy_text,
              color:
                currentScenarioIdx >= totalScenarios - 1
                  ? COLORS.dark_gray
                  : 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              cursor:currentScenarioIdx >= totalScenarios - 1 ? 'default' : 'pointer',
            }}
          >
            Next →
          </button>
        </div>

        {/* Info Box */}
        <div
          style={{
            marginTop: '24px',
            padding: '16px',
            backgroundColor: 'rgba(212, 175, 55, 0.1)',
            borderLeft: `4px solid ${COLORS.gold_accent}`,
            borderRadius: '8px',
            fontSize: '12px',
            color: COLORS.navy_text,
            lineHeight: '1.6',
          }}
        >
          <strong>💡 Tip:</strong> The best responses stay calm, professional, and
          put the burden of proof on the employer. Never accept their version of
          events—always ask for evidence and comparators. The more you practice,
          the more natural these responses become.
        </div>
      </div>
    </div>
  );
};

export default NegotiationSimulator;
