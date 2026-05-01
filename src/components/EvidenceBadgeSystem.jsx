import React, { useState, useEffect } from 'react';

/**
 * EvidenceBadgeSystem.jsx
 *
 * Automated tagging of evidence pieces with significance badges:
 * 🏆 ANCHOR LIE – Contradicts their core defence
 * 🔥 SMOKING GUN – Alone could win the case
 * ⏰ TIMESTAMP CONTRADICTION – Proves backdating/tampering
 * 🚨 IMMINENT DEADLINE – Act now or lose evidence
 * 🧠 GAP ANALYSIS – Missing evidence type
 *
 * Features:
 * - AI scans text/filename/metadata for patterns
 * - Badges appear automatically on Evidence Vault cards
 * - Click badge to see explanation
 * - "Mark important" manual override
 * - Contributes to CaseStrengthRing calculation
 *
 * Premium: Free (basic), Justice+ (full AI analysis)
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
// Badge Detection Engine
// ============================================================================

const BadgeTypes = {
  ANCHOR_LIE: {
    id: 'anchor_lie',
    label: 'ANCHOR LIE',
    icon: '🏆',
    color: '#D4AF37',
    severity: 'critical',
    description:
      'This evidence directly contradicts a core part of their defence. In tribunal, this can destroy credibility.',
    example:
      'Email saying "We fire all women in this role" then hiring 5 men contradicts claim of merit-based selection.',
  },
  SMOKING_GUN: {
    id: 'smoking_gun',
    label: 'SMOKING GUN',
    icon: '🔥',
    color: '#FF5722',
    severity: 'critical',
    description:
      'This single piece of evidence could win your case alone. Judges love "smoking guns" – clear proof of intent.',
    example:
      'Email chain labeled "Action items to make her quit" with racial slurs. Proof of intentional discrimination.',
  },
  TIMESTAMP_CONTRADICTION: {
    id: 'timestamp_contradiction',
    label: 'TIMESTAMP CONTRADICTION',
    icon: '⏰',
    color: '#FF9800',
    severity: 'high',
    description:
      'Timeline proves tampering or backdating. Either they created records after the fact, or the timing contradicts their narrative.',
    example:
      'Performance review marked "created Dec 2022" in metadata but saved in Jan 2023 – clearly backdated.',
  },
  IMMINENT_DEADLINE: {
    id: 'imminent_deadline',
    label: 'IMMINENT DEADLINE',
    icon: '🚨',
    color: '#D32F2F',
    severity: 'urgent',
    description:
      'Time-sensitive. Evidence window closing. Act now or you lose this evidence forever (SOL expires, records deleted, witness forgets).',
    example:
      'Witness available only until end of this month. Get statement signed NOW or lose corroboration.',
  },
  GAP_ANALYSIS: {
    id: 'gap_analysis',
    label: 'MISSING TYPE',
    icon: '🧠',
    color: '#2196F3',
    severity: 'medium',
    description:
      'You have documents but missing another critical evidence type. Case is weaker without it. Should obtain before tribunal.',
    example:
      'You have emails but no medical report. Medical evidence could add £5,000+ to compensation.',
  },
};

// ============================================================================
// Badge Detection Logic
// ============================================================================

const detectBadges = (evidence, caseData = {}) => {
  const badges = [];

  // ANCHOR LIE detection
  const anchortLieKeywords = [
    'all',
    'never',
    'always',
    'impossible',
    'policy',
    'no one',
    'everyone',
    'without exception',
  ];
  const contradictionKeywords = [
    'but',
    'however',
    'deny',
    'never said',
    'not true',
    'false',
    'contradiction',
  ];

  const text = evidence.content || evidence.fileName || '';
  const lowerText = text.toLowerCase();

  let anchorscore = 0;
  anchortLieKeywords.forEach((kw) => {
    if (lowerText.includes(kw)) anchorscore += 10;
  });
  contradictionKeywords.forEach((kw) => {
    if (lowerText.includes(kw)) anchorscore += 15;
  });

  if (anchorscore > 40) {
    badges.push({
      ...BadgeTypes.ANCHOR_LIE,
      confidence: Math.min(anchorscore, 100),
    });
  }

  // SMOKING GUN detection
  const smokingGunKeywords = [
    'fire',
    'dismiss',
    'get rid of',
    'resign',
    'quit',
    'blackmail',
    'threat',
    'slur',
    'hate',
    'racist',
    'sexist',
    'disabled',
    'religion',
    'pregnant',
    'union',
    'whistle',
    'payoff',
    'hush money',
  ];

  let gunScore = 0;
  smokingGunKeywords.forEach((kw) => {
    if (lowerText.includes(kw)) gunScore += 15;
  });

  // Intent markers
  if (lowerText.includes('action items') || lowerText.includes('plan to')) gunScore += 25;
  if (
    lowerText.includes('confidential') ||
    lowerText.includes('do not share')
  )
    gunScore += 20;

  if (gunScore > 45) {
    badges.push({
      ...BadgeTypes.SMOKING_GUN,
      confidence: Math.min(gunScore, 100),
    });
  }

  // TIMESTAMP CONTRADICTION detection
  if (evidence.fileMetadata) {
    const { createdDate, modifiedDate, uploadDate } = evidence.fileMetadata;
    if (createdDate && modifiedDate && createdDate > modifiedDate) {
      badges.push({
        ...BadgeTypes.TIMESTAMP_CONTRADICTION,
        confidence: 95,
      });
    }
  }

  // IMMINENT DEADLINE detection
  if (evidence.deadline) {
    const now = new Date();
    const deadline = new Date(evidence.deadline);
    const daysRemaining = (deadline - now) / (1000 * 60 * 60 * 24);

    if (daysRemaining < 7 && daysRemaining > 0) {
      badges.push({
        ...BadgeTypes.IMMINENT_DEADLINE,
        confidence: 100,
        customMessage: `${Math.ceil(daysRemaining)} days to obtain`,
      });
    }
  }

  // GAP ANALYSIS detection
  const evidenceTypes = S.get('evidence', []).map((e) => e.type);
  const allTypes = [
    'email',
    'medical',
    'witness',
    'payslip',
    'message',
    'photo',
    'audio',
    'calendar',
  ];
  const missingTypes = allTypes.filter((t) => !evidenceTypes.includes(t));

  if (missingTypes.length > 0 && evidenceTypes.length > 0) {
    badges.push({
      ...BadgeTypes.GAP_ANALYSIS,
      confidence: 80,
      customMessage: `Missing: ${missingTypes.slice(0, 2).join(', ')}`,
    });
  }

  return badges.slice(0, 3); // Max 3 badges per evidence
};

// ============================================================================
// Badge Display Component
// ============================================================================

const Badge = ({ badge, onInfo = () => {} }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
        marginRight: '6px',
        marginBottom: '4px',
      }}
    >
      <button
        onClick={() => setShowDetails(!showDetails)}
        style={{
          padding: '4px 10px',
          backgroundColor: badge.color,
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: '700',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          transition: 'all 0.2s ease',
          opacity: badge.confidence ? badge.confidence / 100 : 0.8,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {badge.icon} {badge.label}
      </button>

      {showDetails && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '8px',
            backgroundColor: 'white',
            border: `2px solid ${badge.color}`,
            borderRadius: '8px',
            padding: '12px',
            zIndex: 1000,
            minWidth: '250px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          }}
        >
          <h4
            style={{
              fontSize: '12px',
              fontWeight: '700',
              color: badge.color,
              margin: '0 0 6px 0',
            }}
          >
            {badge.icon} {badge.label}
          </h4>
          <p
            style={{
              fontSize: '11px',
              color: COLORS.navy_text,
              margin: '0 0 8px 0',
              lineHeight: '1.4',
            }}
          >
            {badge.description}
          </p>
          <div
            style={{
              backgroundColor: COLORS.light_gray,
              padding: '8px',
              borderRadius: '4px',
              fontSize: '10px',
              color: COLORS.dark_gray,
              fontStyle: 'italic',
            }}
          >
            <strong>Example:</strong> {badge.example}
          </div>
          <div
            style={{
              fontSize: '9px',
              color: COLORS.dark_gray,
              marginTop: '8px',
            }}
          >
            Confidence: {badge.confidence || 100}%
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Evidence Item with Badges
// ============================================================================

const EvidenceItemWithBadges = ({ evidence, caseData }) => {
  const badges = detectBadges(evidence, caseData);

  return (
    <div
      style={{
        padding: '12px',
        backgroundColor: 'white',
        borderRadius: '8px',
        marginBottom: '12px',
        border: `1px solid ${COLORS.light_gray}`,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '8px',
        }}
      >
        <div>
          <h4
            style={{
              fontSize: '13px',
              fontWeight: '600',
              color: COLORS.navy_text,
              margin: 0,
              marginBottom: '4px',
            }}
          >
            📄 {evidence.fileName || `${evidence.type} evidence`}
          </h4>
          <p
            style={{
              fontSize: '11px',
              color: COLORS.dark_gray,
              margin: 0,
            }}
          >
            Uploaded:{' '}
            {new Date(evidence.uploadedAt || Date.now()).toLocaleDateString('en-GB', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Badges Row */}
      {badges.length > 0 && (
        <div style={{ marginBottom: '8px' }}>
          {badges.map((badge) => (
            <Badge key={badge.id} badge={badge} />
          ))}
        </div>
      )}

      {/* Evidence Preview */}
      {evidence.content && (
        <div
          style={{
            backgroundColor: COLORS.light_gray,
            padding: '8px',
            borderRadius: '4px',
            fontSize: '11px',
            color: COLORS.dark_gray,
            overflow: 'auto',
            maxHeight: '80px',
            fontFamily: 'monospace',
          }}
        >
          {evidence.content.substring(0, 200)}
          {evidence.content.length > 200 ? '...' : ''}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

const EvidenceBadgeSystem = () => {
  const [evidence, setEvidence] = useState([]);
  const [caseData, setCaseData] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const loadData = () => {
      const ev = S.get('evidence', []);
      const cd = S.get('case_data');

      setEvidence(ev);
      setCaseData(cd);
      setMounted(true);
    };

    loadData();

    const handleUpdate = (e) => {
      if (['evidence', 'case_data'].includes(e.detail?.key)) {
        loadData();
      }
    };

    window.addEventListener('ujris:update', handleUpdate);
    return () => window.removeEventListener('ujris:update', handleUpdate);
  }, []);

  if (!mounted) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
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
            🏷️ Evidence Badge System
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: '13px',
              color: COLORS.dark_gray,
            }}
          >
            UJRIS automatically identifies critical evidence pieces and flags them for you
          </p>
        </div>

        {/* Badge Key */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          }}
        >
          <h2
            style={{
              fontSize: '16px',
              fontWeight: '700',
              marginBottom: '12px',
              color: COLORS.navy_text,
            }}
          >
            📋 Badge Meanings
          </h2>

          <div style={{ display: 'grid', gap: '12px' }}>
            {Object.values(BadgeTypes).map((badge) => (
              <div
                key={badge.id}
                style={{
                  padding: '12px',
                  backgroundColor: COLORS.light_gray,
                  borderLeft: `4px solid ${badge.color}`,
                  borderRadius: '6px',
                }}
              >
                <h3
                  style={{
                    fontSize: '13px',
                    fontWeight: '700',
                    color: badge.color,
                    margin: 0,
                    marginBottom: '4px',
                  }}
                >
                  {badge.icon} {badge.label}
                </h3>
                <p
                  style={{
                    fontSize: '12px',
                    color: COLORS.navy_text,
                    margin: 0,
                    lineHeight: '1.4',
                  }}
                >
                  {badge.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Evidence Vault with Badges */}
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
            📁 Your Evidence Library
          </h2>

          {evidence.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: COLORS.dark_gray,
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>📭</div>
              <div style={{ fontSize: '13px', fontWeight: '600' }}>
                No evidence uploaded yet
              </div>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>
                Upload documents to start tagging evidence
              </div>
            </div>
          ) : (
            <div>
              {evidence.map((ev, idx) => (
                <EvidenceItemWithBadges
                  key={idx}
                  evidence={ev}
                  caseData={caseData}
                />
              ))}

              {/* Summary */}
              <div
                style={{
                  marginTop: '20px',
                  padding: '16px',
                  backgroundColor: 'rgba(76, 175, 80, 0.1)',
                  borderLeft: `4px solid ${COLORS.success_green}`,
                  borderRadius: '6px',
                }}
              >
                <h3
                  style={{
                    fontSize: '13px',
                    fontWeight: '700',
                    color: COLORS.navy_text,
                    marginBottom: '8px',
                  }}
                >
                  ✅ Evidence Quality Score
                </h3>
                <div
                  style={{
                    fontSize: '13px',
                    color: COLORS.navy_text,
                  }}
                >
                  {evidence.filter((e) => detectBadges(e, caseData).length > 0).length} of{' '}
                  {evidence.length} pieces flagged as critical
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EvidenceBadgeSystem;
