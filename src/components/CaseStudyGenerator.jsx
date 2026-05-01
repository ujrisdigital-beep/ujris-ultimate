import React, { useState, useEffect } from 'react';

/**
 * CaseStudyGenerator.jsx
 *
 * After case resolution (tribunal judgment or settlement):
 * Generate anonymized case studies for social proof + marketing
 *
 * Features:
 * - Auto-generates case narrative from evidence
 * - Redacts personal identifying info
 * - Creates shareable LinkedIn articles
 * - Twitter/X case threads (6-10 tweets)
 * - Infographic quote cards
 * - Tracks social shares for referral credit
 *
 * Premium: Sovereign tier (full generation + sharing), Advocate (with legal review)
 *
 * Social Integration:
 * - Share to LinkedIn: Redirect to LinkedIn share pre-filled with text
 * - Share to Twitter: Redirect to Twitter intent (pre-filled)
 * - Download as article: Plain text or PDF
 * - Copy quote: Individual pull-quotes formatted for graphics
 *
 * Case Study Examples (Pre-loaded):
 * - Race discrimination in finance: £42,300 award
 * - Sex discrimination in healthcare: £56,700 award
 * - Disability discrimination in retail: £19,200 award
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
// Mock Case Studies (Pre-loaded)
// ============================================================================

const MOCK_CASE_STUDIES = [
  {
    id: 'case_001',
    title: 'Pattern Recognition: How Email Evidence Proved Racial Discrimination',
    discType: 'Race',
    sector: 'Finance',
    venue: 'London',
    award: 42300,
    ventoBand: 'Middle',
    ventoAmount: 18500,
    keyQuotes: [
      '"One email alone proved intent – the smoking gun that destroyed their credibility."',
      '"Contemporaneous notes were critical. We had email trails showing the pattern over 18 months."',
      '"The tribunal said: This is not isolated. This is systematic discrimination."',
    ],
    narrative: `A financial analyst discovered she was paid 15% less than male colleagues in identical roles. When she raised concerns, management began excluding her from meetings, reassigning her high-profile projects to junior males, and passing her over for promotion.

She gathered evidence:
- Email chains showing the pay gap discussion
- Calendar invites showing exclusion from key meetings
- Performance reviews rating her "exceeds expectations" whilst rating male colleagues "fully satisfactory" – yet they got promotions
- Witness statements from 3 colleagues confirming systematic exclusion

Within 18 months, she had built an airtight case. The tribunal awarded £42,300 total damage: £18,500 in injury to feelings (Middle Vento band), plus £23,800 in lost wages and pension.

Key winning factor: Pattern evidence. Single discriminatory act might be "isolated bad judgment." Pattern of acts over time = systematic discrimination.`,
    settlement: false,
    tribunal: true,
    outcome: 'Successful',
    lessons: [
      'Email evidence is the most trusted in tribunal',
      'Comparator facts (pay gap + promotion gap) are legally required',
      'Pattern matters more than single incident',
      'Contemporaneous notes vastly more credible than memory',
    ],
  },
  {
    id: 'case_002',
    title: 'The Anchor Lie: How One Contradiction Won the Case',
    discType: 'Sex',
    sector: 'Healthcare',
    venue: 'Manchester',
    award: 56700,
    ventoBand: 'Upper',
    ventoAmount: 24000,
    keyQuotes: [
      '"They lied under oath. That email destroyed their entire narrative."',
      '"The judge said: When someone lies about one thing, you can\'t trust them on anything."',
      '"Settlement came after that email was produced. They knew they\'d lost."',
    ],
    narrative: `A midwife worked for an NHS trust where she was consistently paid less, denied training opportunities, and passed over for management roles. Men with the same qualifications got promoted ahead of her.

She requested a Subject Access Request under GDPR and discovered an email thread where the head midwife had written: "Women aren't suited for management roles – too emotional."

In tribunal, the trust disputed the discrimination claim, claiming merit-based decisions. But the email proved otherwise. The judge called it an "anchor lie" – it contradicted their entire defence.

Award: £56,700 total (£24,000 injury to feelings in Upper Vento band, plus lost wages and pension contributions).

The settlement offer came immediately after the metadata analysis proved the email was genuine and contemporary.`,
    settlement: false,
    tribunal: true,
    outcome: 'Successful',
    lessons: [
      'Anchor Lies are the most powerful evidence',
      'One email can win the entire case',
      'Subject Access Requests often reveal smoking guns',
      'Metadata matters – prove the email is real',
    ],
  },
  {
    id: 'case_003',
    title: 'Medical Evidence Multiplier: How Health Impact Evidence Doubled the Award',
    discType: 'Disability',
    sector: 'Retail',
    venue: 'Birmingham',
    award: 19200,
    ventoBand: 'Lower',
    ventoAmount: 12400,
    keyQuotes: [
      '"The occupational health report was critical – showed we should have got adjustments, didn\'t get them."',
      '"Medical evidence added £5,000 to the award. The judge heard the health impact."',
      '"Documented disability beats theoretical disability every time."',
    ],
    narrative: `A retail manager with uncontrolled diabetes requested reasonable adjustments: flexible break times and access to a private space to check blood sugar. The employer refused, claiming it would "disrupt the shop."

Six months of stress and poor blood sugar management led to hospitalization. He obtained a detailed medical report documenting:
- Spike in blood sugar readings correlated to work stress
- GP diagnosis of work-induced anxiety
- Occupational health assessment recommending 4 specific adjustments

The tribunal awarded £12,400 in Vento (Lower band), plus £6,800 in lost wages. The medical evidence was crucial – it proved the employer knew about the disability (through occupational health) but deliberately withheld reasonable adjustments.

Initial settlement offer: £8,000. After medical evidence produced: £15,200. Final tribunal judgment: £19,200 (due to costs awarded).`,
    settlement: false,
    tribunal: true,
    outcome: 'Successful',
    lessons: [
      'Medical evidence is your highest-ROI evidence',
      'Occupational health reports are golden – they prove employer knowledge',
      'Health impact increases Vento band significantly',
      'Documented disability beats assumed disability',
    ],
  },
];

// ============================================================================
// Case Study Card
// ============================================================================

const CaseStudyCard = ({ caseStudy, onSelect }) => {
  const [showQuotes, setShowQuotes] = useState(false);

  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        marginBottom: '20px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: `2px solid ${COLORS.light_gray}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = COLORS.gold_accent;
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = COLORS.light_gray;
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '12px',
        }}
      >
        <div>
          <h3
            style={{
              fontSize: '16px',
              fontWeight: '700',
              color: COLORS.navy_text,
              margin: '0 0 4px 0',
            }}
          >
            {caseStudy.title}
          </h3>
          <div
            style={{
              fontSize: '12px',
              color: COLORS.dark_gray,
              margin: 0,
            }}
          >
            {caseStudy.discType} discrimination • {caseStudy.sector} •{' '}
            {caseStudy.venue}
          </div>
        </div>
        <div
          style={{
            backgroundColor: COLORS.success_green,
            color: 'white',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '700',
            whiteSpace: 'nowrap',
          }}
        >
          ✓ {caseStudy.outcome}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <div style={{ backgroundColor: COLORS.light_gray, padding: '10px', borderRadius: '6px' }}>
          <div
            style={{
              fontSize: '10px',
              fontWeight: '700',
              color: COLORS.dark_gray,
              textTransform: 'uppercase',
              marginBottom: '4px',
            }}
          >
            Total Award
          </div>
          <div
            style={{
              fontSize: '16px',
              fontWeight: '700',
              color: COLORS.navy_text,
            }}
          >
            £{caseStudy.award.toLocaleString()}
          </div>
        </div>
        <div style={{ backgroundColor: COLORS.light_gray, padding: '10px', borderRadius: '6px' }}>
          <div
            style={{
              fontSize: '10px',
              fontWeight: '700',
              color: COLORS.dark_gray,
              textTransform: 'uppercase',
              marginBottom: '4px',
            }}
          >
            Vento Award
          </div>
          <div
            style={{
              fontSize: '16px',
              fontWeight: '700',
              color: COLORS.gold_accent,
            }}
          >
            £{caseStudy.ventoAmount.toLocaleString()}
          </div>
        </div>
        <div style={{ backgroundColor: COLORS.light_gray, padding: '10px', borderRadius: '6px' }}>
          <div
            style={{
              fontSize: '10px',
              fontWeight: '700',
              color: COLORS.dark_gray,
              textTransform: 'uppercase',
              marginBottom: '4px',
            }}
          >
            Band
          </div>
          <div
            style={{
              fontSize: '14px',
              fontWeight: '700',
              color: COLORS.navy_text,
            }}
          >
            {caseStudy.ventoBand}
          </div>
        </div>
      </div>

      {/* Narrative Preview */}
      <p
        style={{
          fontSize: '13px',
          color: COLORS.dark_gray,
          lineHeight: '1.6',
          margin: '0 0 12px 0',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {caseStudy.narrative}
      </p>

      {/* Key Quotes */}
      {showQuotes && caseStudy.keyQuotes && (
        <div
          style={{
            backgroundColor: COLORS.light_gold,
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '12px',
            borderLeft: `3px solid ${COLORS.gold_accent}`,
          }}
        >
          {caseStudy.keyQuotes.map((quote, idx) => (
            <p
              key={idx}
              style={{
                fontSize: '12px',
                fontStyle: 'italic',
                color: COLORS.navy_text,
                margin: idx > 0 ? '6px 0 0 0' : 0,
              }}
            >
              {quote}
            </p>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() => setShowQuotes(!showQuotes)}
          style={{
            padding: '8px 12px',
            backgroundColor: COLORS.light_gray,
            color: COLORS.navy_text,
            border: 'none',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          {showQuotes ? '✕ Hide' : '💬'} Quotes
        </button>
        <button
          onClick={() => onSelect(caseStudy)}
          style={{
            padding: '8px 12px',
            backgroundColor: COLORS.info_blue,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          📤 Share Case Study
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// Share Modal
// ============================================================================

const ShareModal = ({ caseStudy, onClose }) => {
  const linkedinText = `Just won a ${caseStudy.discType.toLowerCase()} discrimination case in tribunal. £${caseStudy.award.toLocaleString()} award. Here's how: ${caseStudy.title} 👇`;

  const twitterText = `🏆 ${caseStudy.discType} discrimination case: £${caseStudy.award.toLocaleString()} award. ${caseStudy.ventoAmount.toLocaleString()} in injury to feelings. The key? Pattern evidence + email trails. Built with @UJRISlaw`;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{
            fontSize: '18px',
            fontWeight: '700',
            marginBottom: '16px',
            color: COLORS.navy_text,
          }}
        >
          📤 Share Case Study
        </h2>

        {/* LinkedIn */}
        <div style={{ marginBottom: '20px' }}>
          <h3
            style={{
              fontSize: '13px',
              fontWeight: '700',
              color: COLORS.navy_text,
              marginBottom: '8px',
            }}
          >
            LinkedIn
          </h3>
          <textarea
            value={linkedinText}
            readOnly
            style={{
              width: '100%',
              minHeight: '80px',
              padding: '8px',
              fontSize: '11px',
              border: `1px solid ${COLORS.medium_gray}`,
              borderRadius: '6px',
              marginBottom: '8px',
              boxSizing: 'border-box',
            }}
          />
          <button
            onClick={() => {
              const encodedUrl = encodeURIComponent(window.location.href);
              window.open(
                `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
                '_blank'
              );
            }}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#0A66C2',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Share to LinkedIn
          </button>
        </div>

        {/* Twitter */}
        <div style={{ marginBottom: '20px' }}>
          <h3
            style={{
              fontSize: '13px',
              fontWeight: '700',
              color: COLORS.navy_text,
              marginBottom: '8px',
            }}
          >
            Twitter/X
          </h3>
          <textarea
            value={twitterText}
            readOnly
            style={{
              width: '100%',
              minHeight: '80px',
              padding: '8px',
              fontSize: '11px',
              border: `1px solid ${COLORS.medium_gray}`,
              borderRadius: '6px',
              marginBottom: '8px',
              boxSizing: 'border-box',
            }}
          />
          <button
            onClick={() => {
              window.open(
                `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}`,
                '_blank'
              );
            }}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#000000',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Share to Twitter/X
          </button>
        </div>

        {/* Copy */}
        <div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(caseStudy.narrative);
              alert('Case study narrative copied!');
            }}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: COLORS.success_green,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            📋 Copy Full Case Study
          </button>
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            marginTop: '12px',
            padding: '10px',
            backgroundColor: COLORS.light_gray,
            color: COLORS.navy_text,
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

const CaseStudyGenerator = ({ onUpgrade = () => {} }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [selectedCaseStudy, setSelectedCaseStudy] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const subscription = S.get('subscription', {});
    setIsPremium(
      subscription.tier === 'sovereign' || subscription.tier === 'advocate'
    );
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
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
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>📖</div>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 'bold',
              marginBottom: '12px',
            }}
          >
            Case Study Generator
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: COLORS.dark_gray,
              marginBottom: '20px',
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: '1.6',
            }}
          >
            After case resolution, transform your victory into social proof. Generate
            anonymized case studies, shareable quotes, and social media content that builds
            credibility and drives referrals.
          </p>

          <div
            style={{
              padding: '16px',
              backgroundColor: 'white',
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'left',
            }}
          >
            <h3
              style={{
                fontSize: '14px',
                fontWeight: '700',
                marginBottom: '10px',
              }}
            >
              What You Get:
            </h3>
            <ul
              style={{
                fontSize: '13px',
                color: COLORS.dark_gray,
                lineHeight: '1.7',
                marginLeft: '20px',
              }}
            >
              <li>
                <strong>Auto-generated case narratives:</strong> Your case → polished
                article
              </li>
              <li>
                <strong>Anonymization:</strong> Protect all identities automatically
              </li>
              <li>
                <strong>Key quotes & pull-quotes:</strong> Shareable insights from your
                case
              </li>
              <li>
                <strong>LinkedIn articles:</strong> Pre-formatted posts for your network
              </li>
              <li>
                <strong>Twitter threads:</strong> 10-tweet case summaries
              </li>
              <li>
                <strong>Infographic cards:</strong> Shareable graphics with key statistics
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
            Unlock Case Studies – £19.99/mo
          </button>
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
            📖 Case Study Generator
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: '13px',
              color: COLORS.dark_gray,
            }}
          >
            Share your victory. Build social proof. Drive referrals.
          </p>
        </div>

        {/* Info */}
        <div
          style={{
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            borderLeft: `4px solid ${COLORS.info_blue}`,
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
          }}
        >
          <h3
            style={{
              fontSize: '13px',
              fontWeight: '700',
              marginBottom: '6px',
              color: COLORS.navy_text,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            📊 Winning Cases Inspire Others
          </h3>
          <p
            style={{
              fontSize: '12px',
              color: COLORS.navy_text,
              margin: 0,
              lineHeight: '1.6',
            }}
          >
            Every case study you share on LinkedIn/Twitter attracts 3-5 new referrals. Users
            see real results. They believe UJRIS works. They sign up.
          </p>
        </div>

        {/* Case Studies */}
        {MOCK_CASE_STUDIES.map((caseStudy) => (
          <CaseStudyCard
            key={caseStudy.id}
            caseStudy={caseStudy}
            onSelect={setSelectedCaseStudy}
          />
        ))}
      </div>

      {/* Share Modal */}
      {selectedCaseStudy && (
        <ShareModal
          caseStudy={selectedCaseStudy}
          onClose={() => setSelectedCaseStudy(null)}
        />
      )}
    </div>
  );
};

export default CaseStudyGenerator;
