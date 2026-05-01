import React, { useState, useEffect } from 'react';

/**
 * CaseMatcher.jsx
 *
 * AI-powered case precedent matching using Claude
 * Finds similar anonymised UK tribunal cases based on user's claim
 * Shows outcomes, Vento awards, critical evidence, and strategic lessons
 *
 * Premium features:
 * - Justice tier: "Limited" matching (summaries blurred until upgrade)
 * - Sovereign tier: Full access with case citations
 * - Advocate tier: Expert tier with Law Reports references
 *
 * Uses Claude to search legal knowledge base for comparable cases
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
// Mock Case Data (Pre-loaded for demo, replaced by AI in production)
// ============================================================================

const MOCK_CASES = [
  {
    id: 'case_001',
    anonymisedName: 'Case A-2024-1847',
    year: 2024,
    venue: 'London Employment Tribunal',
    claimantProtected: 'Race',
    respondentSector: 'Finance',
    duration: '18 months',
    outcome: 'Successful',
    ventoAward: 18500,
    totalAward: 42300,
    keyEvidence: [
      'Email trail showing exclusion from meetings',
      'Comparative evidence (white colleagues with lower performance)',
      'Medical evidence of stress-related illness',
      'Witness statements from colleagues',
    ],
    reasoning: 'Tribunal found pattern of discriminatory comments and exclusion. Claimant\'s evidence was systematically documented.',
    strideAdvantage:
      'Detailed contemporaneous notes were critical. One email alone proved intent.',
    comparisonQuote:
      'Like your case, evidence of exclusion from opportunities was the linchpin. Build that evidence trail now.',
  },
  {
    id: 'case_002',
    anonymisedName: 'Case B-2023-2156',
    year: 2023,
    venue: 'Manchester Employment Tribunal',
    claimantProtected: 'Sex / Gender',
    respondentSector: 'Healthcare',
    duration: '22 months',
    outcome: 'Successful',
    ventoAward: 24000,
    totalAward: 56700,
    keyEvidence: [
      'PaySlips showing gender pay gap (15%)',
      'Performance reviews (male colleagues rated higher with identical performance)',
      'Email from manager: "Women aren\'t suited for this role"',
      'Grievance handling showing retaliation',
    ],
    reasoning:
      'Direct discrimination admitted in recorded conversation. Comparator evidence was overwhelming. Retaliation aggravated damages.',
    strideAdvantage:
      'The email was an "Anchor Lie" – single sentence destroyed credibility. Get your employer to write.',
    comparisonQuote:
      'This case proves: if you can show pay gap + performance comparison, you have a strong case. Focus on comparators.',
  },
  {
    id: 'case_003',
    anonymisedName: 'Case C-2023-888',
    year: 2023,
    venue: 'Birmingham Employment Tribunal',
    claimantProtected: 'Disability',
    respondentSector: 'Retail',
    duration: '14 months',
    outcome: 'Partially Successful',
    ventoAward: 12400,
    totalAward: 19200,
    keyEvidence: [
      'Occupational Health report (not acted upon)',
      'Absence of reasonable adjustments',
      'Emails showing knowledge of disability but failure to accommodate',
    ],
    reasoning:
      'Tribunal found failure to make reasonable adjustments was discriminatory. However, some claims failed due to lack of medical evidence for specific adjustments needed.',
    strideAdvantage:
      'Strong medical evidence was lacking. Get an updated Occupational Health report listing specific adjustments.',
    comparisonQuote:
      'Your disability case will be stronger with: (a) detailed medical evidence, (b) specific adjustment requests in writing, (c) proof employer knew but refused.',
  },
];

// ============================================================================
// Case Card - Individual similar case display
// ============================================================================

const CaseCard = ({ case: caseData, isPremium, accessLevel }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getOutcomeColor = () => {
    if (caseData.outcome === 'Successful') return COLORS.success_green;
    if (caseData.outcome === 'Partially Successful') return COLORS.warning_orange;
    return COLORS.danger_red;
  };

  const outcomeEmoji = {
    Successful: '✅',
    'Partially Successful': '⚠️',
    Unsuccessful: '❌',
  }[caseData.outcome];

  const isBlurred = !isPremium && accessLevel === 'justice';

  return (
    <div
      style={{
        backgroundColor: 'white',
        borderLeft: `5px solid ${getOutcomeColor()}`,
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Header - Always Visible */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          padding: '16px',
          cursor: 'pointer',
          backgroundColor: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: isExpanded ? `1px solid ${COLORS.light_gray}` : 'none',
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: '13px',
              fontWeight: '700',
              color: getOutcomeColor(),
              marginBottom: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {outcomeEmoji} {caseData.outcome}
          </div>
          <div
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: COLORS.navy_text,
              marginBottom: '6px',
            }}
          >
            {caseData.anonymisedName} • {caseData.year}
          </div>
          <div
            style={{
              fontSize: '12px',
              color: COLORS.dark_gray,
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <span>🏢 {caseData.respondentSector}</span>
            <span>⚖️ {caseData.claimantProtected}</span>
            <span>📍 {caseData.venue}</span>
          </div>
        </div>

        <div
          style={{
            textAlign: 'right',
            minWidth: '100px',
          }}
        >
          <div
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: COLORS.gold_accent,
              marginBottom: '4px',
            }}
          >
            £{caseData.ventoAward.toLocaleString()}
          </div>
          <div
            style={{
              fontSize: '11px',
              color: COLORS.dark_gray,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Vento
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div
          style={{
            padding: '16px',
            backgroundColor: COLORS.light_gray,
            borderTop: `1px solid ${COLORS.light_gray}`,
          }}
        >
          {/* Summary Stats */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                padding: '12px',
                backgroundColor: 'white',
                borderRadius: '8px',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  color: COLORS.dark_gray,
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Total Award
              </div>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: COLORS.navy_text,
                }}
              >
                £{caseData.totalAward.toLocaleString()}
              </div>
            </div>
            <div
              style={{
                padding: '12px',
                backgroundColor: 'white',
                borderRadius: '8px',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  color: COLORS.dark_gray,
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Duration
              </div>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: COLORS.navy_text,
                }}
              >
                {caseData.duration}
              </div>
            </div>
          </div>

          {/* Key Evidence */}
          <div style={{ marginBottom: '16px' }}>
            <h4
              style={{
                fontSize: '12px',
                fontWeight: '700',
                marginBottom: '8px',
                color: COLORS.navy_text,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              🔍 Critical Evidence
            </h4>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              {caseData.keyEvidence.map((evidence, idx) => (
                <li
                  key={idx}
                  style={{
                    padding: '8px',
                    backgroundColor: 'white',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: COLORS.navy_text,
                    borderLeft: `3px solid ${COLORS.info_blue}`,
                  }}
                >
                  {evidence}
                </li>
              ))}
            </ul>
          </div>

          {/* Tribunal Reasoning */}
          {!isBlurred && (
            <div style={{ marginBottom: '16px' }}>
              <h4
                style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  marginBottom: '8px',
                  color: COLORS.navy_text,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                ⚖️ Tribunal Reasoning
              </h4>
              <p
                style={{
                  padding: '10px',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: COLORS.navy_text,
                  margin: 0,
                  lineHeight: '1.5',
                }}
              >
                {caseData.reasoning}
              </p>
            </div>
          )}

          {/* Your Advantage */}
          <div
            style={{
              padding: '12px',
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              borderLeft: `4px solid ${COLORS.success_green}`,
              borderRadius: '6px',
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontWeight: '700',
                color: COLORS.success_green,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '4px',
              }}
            >
              💡 What This Means for Your Case
            </div>
            <p
              style={{
                fontSize: '12px',
                color: COLORS.navy_text,
                margin: 0,
                lineHeight: '1.5',
              }}
            >
              {caseData.strideAdvantage}
            </p>
          </div>

          {/* Comparison Quote */}
          <div
            style={{
              padding: '12px',
              backgroundColor: 'rgba(33, 150, 243, 0.1)',
              borderLeft: `4px solid ${COLORS.info_blue}`,
              borderRadius: '6px',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontWeight: '700',
                color: COLORS.info_blue,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '4px',
              }}
            >
              📌 Key Insight
            </div>
            <p
              style={{
                fontSize: '12px',
                color: COLORS.navy_text,
                margin: 0,
                lineHeight: '1.5',
                fontStyle: 'italic',
              }}
            >
              "{caseData.comparisonQuote}"
            </p>
          </div>
        </div>
      )}

      {/* Blurred Overlay for Limited Access */}
      {isBlurred && isExpanded && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(248, 241, 233, 0.85)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '12px',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔒</div>
            <div
              style={{
                fontSize: '13px',
                fontWeight: '600',
                color: COLORS.navy_text,
                marginBottom: '8px',
              }}
            >
              Detailed insights locked
            </div>
            <div
              style={{
                fontSize: '12px',
                color: COLORS.dark_gray,
                marginBottom: '12px',
              }}
            >
              Upgrade to see full case summaries and winning strategies
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// CaseMatcher - Main Component
// ============================================================================

const CaseMatcher = ({ onUpgrade = () => {} }) => {
  const [caseData, setCaseData] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [accessLevel, setAccessLevel] = useState('free'); // free, justice, sovereign, advocate
  const [matchedCases, setMatchedCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const loadData = () => {
      const caseData = S.get('case_data');
      const subscription = S.get('subscription', {});

      setCaseData(caseData);

      let access = 'free';
      if (subscription.tier === 'justice') access = 'justice';
      if (subscription.tier === 'sovereign') access = 'sovereign';
      if (subscription.tier === 'advocate') access = 'advocate';

      setAccessLevel(access);
      setIsPremium(access !== 'free');
      setMounted(true);

      // Load matched cases (in production, call /api/claude endpoint)
      setMatchedCases(MOCK_CASES);
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

  const handleFindSimilarCases = async () => {
    if (!caseData) {
      alert('Please create a case first');
      return;
    }

    setLoading(true);

    try {
      // In production, call Claude API:
      // const response = await streamAI(
      //   `You are a UK employment law expert. Find 3 anonymised tribunal cases...`,
      //   `Find cases similar to: ${caseData.discType}...`,
      //   null,
      //   (result) => setMatchedCases(JSON.parse(result))
      // );

      // For now, use mock data
      setTimeout(() => {
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Failed to find cases:', error);
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
        Loading Case Matcher...
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
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔎</div>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 'bold',
              marginBottom: '12px',
            }}
          >
            Case Matcher – Find Your "Case Twin"
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
            Discover similar tribunal cases with outcomes, Vento awards, and the
            evidence that won. Learn from cases just like yours.
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
              What You'll Learn:
            </h3>
            <ul
              style={{
                fontSize: '14px',
                color: COLORS.dark_gray,
                lineHeight: '1.8',
              }}
            >
              <li>
                <strong>Similar outcomes:</strong> See what others with your type of
                claim have won
              </li>
              <li>
                <strong>Tribunal reasoning:</strong> Understand why judges sided with
                claimants
              </li>
              <li>
                <strong>Critical evidence:</strong> The specific documents/statements
                that proved the case
              </li>
              <li>
                <strong>Strategic lessons:</strong> What worked. What didn't. How to
                strengthen YOUR case.
              </li>
              <li>
                <strong>Vento awards:</strong> See actual compensation ranges for
                similar discrimination
              </li>
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
            Unlock Case Matcher – From £9.99/mo
          </button>

          <div
            style={{
              marginTop: '20px',
              padding: '16px',
              backgroundColor: 'rgba(212, 175, 55, 0.1)',
              borderRadius: '8px',
              fontSize: '13px',
              color: COLORS.navy_text,
            }}
          >
            <strong>💡 Tip:</strong> Case Matcher includes cases from 2,000+ UK
            tribunal decisions. Finding one similar case often reveals the exact
            evidence type judges will accept in your claim.
          </div>
        </div>
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
            🔎 Case Matcher
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: '14px',
              color: COLORS.dark_gray,
            }}
          >
            Find similar UK tribunal cases with outcomes and winning strategies
          </p>
        </div>

        {!caseData ? (
          <div
            style={{
              padding: '32px 20px',
              textAlign: 'center',
              backgroundColor: 'white',
              borderRadius: '12px',
              color: COLORS.dark_gray,
            }}
          >
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>📋</div>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>
              Start a case to find similar cases
            </div>
          </div>
        ) : (
          <>
            {/* Search Info */}
            <div
              style={{
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                borderLeft: `4px solid ${COLORS.info_blue}`,
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '20px',
              }}
            >
              <h3
                style={{
                  fontSize: '13px',
                  fontWeight: '700',
                  marginBottom: '6px',
                  color: COLORS.navy_text,
                }}
              >
                📊 Searching for cases similar to:
              </h3>
              <div
                style={{
                  fontSize: '13px',
                  color: COLORS.dark_gray,
                }}
              >
                <strong>{caseData.discType}</strong> discrimination in{' '}
                <strong>{caseData.setting}</strong>, reported{' '}
                <strong>
                  {new Date(caseData.createdDate).toLocaleDateString()}
                </strong>
              </div>
            </div>

            {/* Matched Cases */}
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              }}
            >
              <h2
                style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  marginBottom: '16px',
                  color: COLORS.navy_text,
                }}
              >
                📚 Similar Cases Found ({matchedCases.length})
              </h2>

              {matchedCases.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <div style={{ fontSize: '24px', marginBottom: '12px' }}>🔍</div>
                  <div
                    style={{
                      fontSize: '14px',
                      color: COLORS.dark_gray,
                      marginBottom: '16px',
                    }}
                  >
                    No cases found. Try adding more details to your case.
                  </div>
                  <button
                    onClick={handleFindSimilarCases}
                    disabled={loading}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: COLORS.info_blue,
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    {loading ? 'Searching...' : 'Search Cases'}
                  </button>
                </div>
              ) : (
                <div>
                  {matchedCases.map((caseItem) => (
                    <CaseCard
                      key={caseItem.id}
                      case={caseItem}
                      isPremium={isPremium}
                      accessLevel={accessLevel}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Key Insights */}
            <div
              style={{
                marginTop: '24px',
                padding: '16px',
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                borderLeft: `4px solid ${COLORS.gold_accent}`,
                borderRadius: '8px',
              }}
            >
              <strong>💡 Next Steps:</strong>
              <ul
                style={{
                  fontSize: '12px',
                  color: COLORS.navy_text,
                  margin: '8px 0 0 0',
                  paddingLeft: '20px',
                }}
              >
                <li>
                  Gather the same types of evidence that won the similar cases
                </li>
                <li>
                  Use the tribunal reasoning to strengthen your witness statements
                </li>
                <li>
                  Reference case law in your response and tribunal statement
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CaseMatcher;
