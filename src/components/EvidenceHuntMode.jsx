import React, { useState, useEffect } from 'react';

/**
 * EvidenceHuntMode.jsx
 *
 * AI-powered evidence gap analysis
 * Scans user's case and identifies missing evidence
 * Provides actionable steps to obtain each piece
 * Features urgency scoring & deadline tracking
 *
 * Premium: Justice tier (limited to 3 gaps), Sovereign tier (unlimited),
 * Advocate tier (with legal research links)
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
// Evidence Gap Database (AI-Generated for case profile)
// ============================================================================

const EvidenceGaps = {
  default: [
    {
      id: 'sar_response',
      name: 'Subject Access Request (SAR) Response',
      description:
        'Formally request all personal data the employer holds about you under UK GDPR Article 15',
      urgency: 'critical',
      impact:
        'Critical: SAR often reveals hidden emails, performance reviews, and management discussions that show discrimination pattern',
      howToObtain: [
        '1. Write SAR letter to employer (template in Documents)',
        '2. Send to HR director + registered mail',
        '3. Employer has 1 month to respond',
        '4. If they refuse or delay, file complaint to ICO',
      ],
      deadline: '30 days from sending',
      actionButton: 'Generate SAR Letter',
      conversationStarter:
        'I am writing to exercise my rights under UK GDPR Article 15 and the Data Protection Act 2018 to request...',
    },
    {
      id: 'comparator_evidence',
      name: 'Comparator Evidence (Same Job, Different Treatment)',
      description:
        'Document colleagues who were treated better despite equal or lower performance (this is legally required to prove discrimination)',
      urgency: 'critical',
      impact:
        'Critical: Without comparator evidence, claims often fail. This is the "gold standard" proof of discrimination.',
      howToObtain: [
        '1. Note names of 2-3 colleagues in similar role',
        '2. Document: their performance, discipline, pay, opportunities they received',
        '3. Use SAR to get their performance reviews (employer must provide)',
        '4. Request witness statements from colleagues willing to corroborate',
      ],
      deadline: 'Gather before tribunal hearing',
      actionButton: 'Create Comparator Matrix',
      conversationStarter:
        'Comparator evidence proves discrimination by showing someone else was treated more favorably in the same circumstances...',
    },
    {
      id: 'medical_report',
      name: 'Medical Evidence (GP / Occupational Health Report)',
      description:
        'Documented evidence of impact on your health (stress, anxiety, depression, physical illness)',
      urgency: 'high',
      impact:
        'High: Medical evidence dramatically increases compensation (Vento award uplift of £5,000–£15,000)',
      howToObtain: [
        '1. Request Occupational Health referral from employer (if available)',
        '2. Book GP appointment, specifically mention workplace discrimination impact',
        '3. Ask GP for written report detailing:',
        '   - Dates you presented with stress/anxiety',
        '   - Diagnosis',
        '   - Whether linked to workplace',
        '   - Recommended adjustments',
        '4. Obtain full GP records (forms available online)',
      ],
      deadline: 'Before tribunal (6+ months ideal)',
      actionButton: 'GP Appointment Tracker',
      conversationStarter:
        'I believe the discrimination and harassment at work has significantly impacted my health...',
    },
    {
      id: 'witness_statements',
      name: 'Witness Statements (From Colleagues)',
      description:
        'Written statements from people who observed the discrimination or relevant events',
      urgency: 'high',
      impact:
        'High: Corroboration from independent witnesses is extremely powerful in tribunal',
      howToObtain: [
        '1. Identify 2-3 colleagues who witnessed key incidents',
        '2. Draft witness statement template for them to sign',
        '3. Provide clear narrative of what they saw/heard',
        '4. They must include: "I confirm this is true to the best of my knowledge"',
        '5. Collect signed, unaltered statements',
        '6. Include with tribunal claim',
      ],
      deadline: 'Before ET1 filing (or before tribunal hearing)',
      actionButton: 'Witness Request Template',
      conversationStarter:
        'As a former colleague, would you be willing to provide a written account of what you witnessed regarding...',
    },
    {
      id: 'forensic_witness_extraction',
      name: 'Forensic Witness Extraction (Minutes & Hearings)',
      description:
        'Use AI to extract potential witness statements and factual findings directly from meeting minutes, hearing transcripts, CCTV logs or other documents.',
      urgency: 'critical',
      impact:
        'Critical: The system pro-actively converts records into legally structured evidence narratives and a witness-as-evidence dossier.',
      howToObtain: [
        '1. Paste or upload meeting minutes/hearing transcripts into the extraction panel',
        '2. Run AI analysis to identify witness references, name/date paths, and objective fact points',
        '3. Generate a draft witness statement using Civil Evidence Act style and statement of truth',
        '4. Preserve original documents with hash/de-duplication and record source paths',
      ],
      deadline: 'Immediately (risk of evidence tampering increases with delay)',
      actionButton: 'Extract Witness Evidence',
      conversationStarter:
        'I have meeting minutes and a hearing transcript. Please parse and generate forensically credible witness statements keyed to source text.',
    },
    {
      id: 'email_trail',
      name: 'Complete Email Extraction & Timeline',
      description:
        'All emails related to the incident, sorted chronologically with annotations',
      urgency: 'critical',
      impact:
        'Critical: Emails are the most trusted evidence. They often contain "smoking gun" contradictions.',
      howToObtain: [
        '1. Export emails from your account (Outlook/Gmail export)',
        '2. Organize by sender/date (use VersatileInput upload)',
        '3. Highlight key emails in different colors:',
        '   - Red: Discriminatory language / intent',
        '   - Orange: Inconsistency with their narrative',
        '   - Green: Your contemporaneous notes / complaints',
        '4. Create timeline annotation document',
      ],
      deadline: 'Immediate (emails often deleted/archived)',
      actionButton: 'Email Extraction Guide',
      conversationStarter:
        'Go through email chains chronologically. Save everything. Bad employers often hide emails.',
    },
    {
      id: 'pay_analysis',
      name: 'Pay & Promotion Analysis (If Pay Discrimination)',
      description:
        'Detailed breakdown of your pay vs. comparators (especially important in sex/race discrimination)',
      urgency: 'medium',
      impact:
        'Medium: Pay gap evidence is straightforward and powerful if comparative data available',
      howToObtain: [
        '1. Gather your payslips (last 2 years minimum)',
        '2. For comparators, use SAR to request their salary info',
        '3. Create spreadsheet showing:',
        '   - Your salary vs. comparators in same role',
        '   - Bonus gaps',
        '   - Promotion opportunities (who got promoted, who didn\'t)',
        '4. Calculate % difference',
      ],
      deadline: 'Before tribunal (important for damages)',
      actionButton: 'Payslip Analyzer Tool',
      conversationStarter:
        'Sex discrimination claims require proof of pay gap. Show that a man in the same or similar role earned more.',
    },
  ],
};

// ============================================================================
// Evidence Gap Card
// ============================================================================

const GapCard = ({ gap, index, isPremium, accessLevel }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getUrgencyColor = () => {
    if (gap.urgency === 'critical') return COLORS.danger_red;
    if (gap.urgency === 'high') return COLORS.warning_orange;
    return COLORS.info_blue;
  };

  const getUrgencyIcon = () => {
    if (gap.urgency === 'critical') return '🚨';
    if (gap.urgency === 'high') return '⚠️';
    return '📌';
  };

  const isBlurred = !isPremium && index >= 3;

  return (
    <div
      style={{
        backgroundColor: 'white',
        borderLeft: `5px solid ${getUrgencyColor()}`,
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.3s ease',
        opacity: isBlurred ? 0.7 : 1,
      }}
    >
      {/* Header */}
      <div
        onClick={() => !isBlurred && setIsExpanded(!isExpanded)}
        style={{
          padding: '16px',
          cursor: isBlurred ? 'default' : 'pointer',
          backgroundColor: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: isExpanded ? `1px solid ${COLORS.light_gray}` : 'none',
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px',
            }}
          >
            <div
              style={{
                fontSize: '14px',
                fontWeight: '700',
                color: getUrgencyColor(),
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {getUrgencyIcon()} {gap.urgency.toUpperCase()}
            </div>
          </div>
          <h3
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: COLORS.navy_text,
              margin: 0,
              marginBottom: '4px',
            }}
          >
            {index + 1}. {gap.name}
          </h3>
          <p
            style={{
              fontSize: '12px',
              color: COLORS.dark_gray,
              margin: 0,
            }}
          >
            {gap.description}
          </p>
        </div>

        {!isBlurred && (
          <div
            style={{
              minWidth: '24px',
              textAlign: 'center',
              color: COLORS.dark_gray,
              fontSize: '16px',
            }}
          >
            {isExpanded ? '▼' : '▶'}
          </div>
        )}
      </div>

      {/* Expanded Details */}
      {isExpanded && !isBlurred && (
        <div
          style={{
            padding: '16px',
            backgroundColor: COLORS.light_gray,
            borderTop: `1px solid ${COLORS.light_gray}`,
          }}
        >
          {/* Impact */}
          <div style={{ marginBottom: '16px' }}>
            <div
              style={{
                fontSize: '11px',
                fontWeight: '700',
                color: COLORS.navy_text,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '6px',
              }}
            >
              💡 Why This Matters
            </div>
            <p
              style={{
                fontSize: '12px',
                color: COLORS.navy_text,
                margin: 0,
                padding: '10px',
                backgroundColor: 'white',
                borderRadius: '6px',
                lineHeight: '1.5',
              }}
            >
              {gap.impact}
            </p>
          </div>

          {/* How to Obtain */}
          <div style={{ marginBottom: '16px' }}>
            <div
              style={{
                fontSize: '11px',
                fontWeight: '700',
                color: COLORS.navy_text,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '6px',
              }}
            >
              📋 Step-by-Step
            </div>
            <div
              style={{
                padding: '10px',
                backgroundColor: 'white',
                borderRadius: '6px',
              }}
            >
              {gap.howToObtain.map((step, idx) => (
                <div
                  key={idx}
                  style={{
                    fontSize: '12px',
                    color: COLORS.navy_text,
                    marginBottom: idx < gap.howToObtain.length - 1 ? '6px' : 0,
                    lineHeight: '1.5',
                  }}
                >
                  {step}
                </div>
              ))}
            </div>
          </div>

          {/* Deadline */}
          <div style={{ marginBottom: '16px' }}>
            <div
              style={{
                fontSize: '11px',
                fontWeight: '700',
                color: COLORS.navy_text,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '6px',
              }}
            >
              ⏰ Deadline
            </div>
            <div
              style={{
                padding: '10px 12px',
                backgroundColor: 'white',
                borderRadius: '6px',
                fontSize: '12px',
                color: COLORS.navy_text,
                fontWeight: '600',
                borderLeft: `3px solid ${getUrgencyColor()}`,
              }}
            >
              {gap.deadline}
            </div>
          </div>

          {/* Action Button */}
          <button
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: COLORS.info_blue,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              marginBottom: '12px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1976D2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = COLORS.info_blue;
            }}
          >
            {gap.actionButton}
          </button>

          {/* Note */}
          <div
            style={{
              padding: '10px',
              backgroundColor: 'rgba(33, 150, 243, 0.1)',
              borderLeft: `3px solid ${COLORS.info_blue}`,
              borderRadius: '4px',
              fontSize: '12px',
              color: COLORS.navy_text,
              fontStyle: 'italic',
            }}
          >
            Conversation starter: "{gap.conversationStarter}"
          </div>
        </div>
      )}

      {/* Locked Overlay for Limited Access */}
      {isBlurred && (
        <div
          style={{
            padding: '16px',
            backgroundColor: 'rgba(248, 241, 233, 0.85)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '14px', marginBottom: '8px' }}>🔒</div>
          <div
            style={{
              fontSize: '12px',
              fontWeight: '600',
              color: COLORS.navy_text,
            }}
          >
            Gap #{index + 1} locked
          </div>
          <div
            style={{
              fontSize: '11px',
              color: COLORS.dark_gray,
              marginTop: '4px',
            }}
          >
            Justice tier includes first 3 gaps. Upgrade to Sovereign for all gaps.
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// EvidenceHuntMode - Main Component
// ============================================================================

const EvidenceHuntMode = ({ onUpgrade = () => {} }) => {
  const [caseData, setCaseData] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [gaps, setGaps] = useState([]);
  const [mounted, setMounted] = useState(false);

  const [extractionInput, setExtractionInput] = useState('');
  const [extractionResult, setExtractionResult] = useState('');
  const [extractionLoading, setExtractionLoading] = useState(false);
  const [extractionError, setExtractionError] = useState(null);

  // File upload & OCR states
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileText, setFileText] = useState('');

  // Persistence & audit trail
  const [auditLog, setAuditLog] = useState([]);
  const [priorExtractions, setPriorExtractions] = useState([]);
  const [showAuditTrail, setShowAuditTrail] = useState(false);

  useEffect(() => {
    const loadData = () => {
      const caseData = S.get('case_data');
      const subscription = S.get('subscription', {});
      const savedExtractions = S.get('forensic_extraction_history', []);
      const savedAuditLog = S.get('forensic_audit_log', []);

      setCaseData(caseData);
      setIsPremium(
        subscription.tier === 'justice' ||
        subscription.tier === 'sovereign' ||
        subscription.tier === 'advocate'
      );
      setPriorExtractions(savedExtractions);
      setAuditLog(savedAuditLog);

      // In production, call Claude API to generate gaps based on case type
      // For now, use default gaps
      setGaps(EvidenceGaps.default);
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

  const hashSourceText = (text) => {
    // Simple hash for chain-of-custody tracking
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setExtractionError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        if (file.type === 'application/pdf') {
          setFileText(`[PDF UPLOADED: ${file.name}]\n\nNote: PDF file uploaded. In production, Tesseract OCR will extract text. For now, please paste extracted text below.\n\nFile size: ${file.size} bytes`);
        } else if (file.type.startsWith('image/')) {
          setFileText(`[IMAGE UPLOADED: ${file.name}]\n\nNote: Image uploaded. In production, Tesseract OCR will extract text. For now, please paste extracted text below.\n\nFile size: ${file.size} bytes`);
        } else {
          setFileText(content);
          setExtractionInput(content);
        }
      }
    };
    reader.readAsText(file);
  };

  const runForensicExtraction = async () => {
    if (!extractionInput.trim()) {
      setExtractionError('Paste meeting/hearing minutes, transcript notes or defendant materials first.');
      return;
    }

    setExtractionLoading(true);
    setExtractionError(null);
    setExtractionResult('');

    const sourceHash = hashSourceText(extractionInput);
    const timestamp = new Date().toISOString();

    const systemPrompt =
      'You are UJRIS Forensic AI. You must parse meeting minutes, hearing transcript snippets, and other case documents to identify potential witnesses, event facts, and generate each witness statement as evidence with a proper statement of truth. Cite exact source lines/sections, mark direct observations vs inference, and flag any gaps requiring confirmation. Use UK Employment Tribunal tone, Civil Evidence Act 1995 compliance, and preserve chain of custody language.';

    const userPrompt =
      `DOCUMENT BASED EVIDENCE INPUT:\n${extractionInput.trim()}\n\nCase context: ${caseData?.discType || 'unknown'} discrimination. Setting: ${caseData?.setting || 'unknown'}.`;

    try {
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-opus-4-1-20250805',
          max_tokens: 1800,
          stream: false,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'AI endpoint returned an error.');
      }

      const data = await response.json();
      const text = data?.completion || data?.output?.text || data?.result || JSON.stringify(data, null, 2);
      setExtractionResult(text);

      // Save to localStorage
      const newExtraction = {
        id: `extraction_${Date.now()}`,
        timestamp,
        sourceHash,
        caseContext: caseData?.discType || 'unknown',
        setting: caseData?.setting || 'unknown',
        sourceLength: extractionInput.length,
        resultLength: text.length,
      };
      const updated = [newExtraction, ...priorExtractions].slice(0, 20);
      S.set('forensic_extraction_history', updated);
      setPriorExtractions(updated);

      // Add to audit log
      const logEntry = {
        timestamp,
        action: 'forensic_witness_extraction',
        status: 'success',
        sourceHash,
        caseContext: caseData?.discType || 'unknown',
      };
      const updatedLog = [logEntry, ...auditLog].slice(0, 100);
      S.set('forensic_audit_log', updatedLog);
      setAuditLog(updatedLog);
    } catch (err) {
      console.error('Forensic extraction failed:', err);
      setExtractionError(err.message || 'Extraction failed. Try again.');

      // Log failure
      const failureEntry = {
        timestamp: new Date().toISOString(),
        action: 'forensic_witness_extraction',
        status: 'error',
        error: err.message,
        caseContext: caseData?.discType || 'unknown',
      };
      const updatedLog = [failureEntry, ...auditLog].slice(0, 100);
      S.set('forensic_audit_log', updatedLog);
      setAuditLog(updatedLog);
    } finally {
      setExtractionLoading(false);
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
        Loading Evidence Hunt Mode...
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
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 'bold',
              marginBottom: '12px',
            }}
          >
            Evidence Hunt Mode
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
            Let UJRIS AI scan your case and show you exactly what evidence you're
            missing. Get actionable steps for gathering it before tribunal.
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
              What You'll Discover:
            </h3>
            <ul
              style={{
                fontSize: '14px',
                color: COLORS.dark_gray,
                lineHeight: '1.8',
              }}
            >
              <li>
                <strong>Critical gaps:</strong> SAR requests, comparator evidence,
                medical reports
              </li>
              <li>
                <strong>Step-by-step action plans:</strong> Exactly how to obtain
                each piece
              </li>
              <li>
                <strong>Urgency scoring:</strong> Which gaps cost you time vs money
              </li>
              <li>
                <strong>Deadline tracking:</strong> When evidence expires (3-month
                ET filing deadline!)
              </li>
              <li>
                <strong>One-click templates:</strong> Generate SAR letters, witness
                request emails
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
            Unlock Evidence Hunt – From £9.99/mo
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
            🔍 Evidence Hunt Mode
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: '14px',
              color: COLORS.dark_gray,
            }}
          >
            {!caseData
              ? 'Start a case to identify missing evidence'
              : `Analysis for: ${caseData.discType} discrimination`}
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
              Create a case to start hunting for evidence
            </div>
          </div>
        ) : (
          <>
            {/* Analysis Summary */}
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
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                📊 Evidence Analysis
              </h3>
              <div
                style={{
                  fontSize: '13px',
                  color: COLORS.navy_text,
                }}
              >
                We've identified <strong>{gaps.length} critical gaps</strong> in your
                evidence that could affect your tribunal outcome. Below are the missing
                pieces, ordered by urgency.
              </div>
            </div>

            {/* Gap Cards */}
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              }}
            >
              {gaps.map((gap, idx) => (
                <GapCard
                  key={gap.id}
                  gap={gap}
                  index={idx}
                  isPremium={isPremium}
                  accessLevel={
                    isPremium ? (isPremium ? 'premium' : 'free') : 'free'
                  }
                />
              ))}
            </div>

            {/* Forensic Witness Extraction */}
            <div
              style={{
                marginTop: '20px',
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '18px',
                boxShadow: '0 1px 6px rgba(0, 0, 0, 0.08)',
                border: `1px solid ${COLORS.light_gray}`,
              }}
            >
              <h3 style={{ margin: '0 0 10px 0', color: COLORS.navy_text }}>
                🧾 Forensic Witness Extraction (Minutes, Hearings, Logs)
              </h3>
              <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: COLORS.dark_gray }}>
                Paste your meeting minutes, hearing transcript, or any incident record. UJRIS AI will extract witness references, fact points, and generate court-ready witness statement drafts with source annotations.
              </p>

              {/* SAFETY WARNING */}
              <div
                style={{
                  padding: '12px',
                  backgroundColor: '#FEF3C7',
                  border: `1px solid #F59E0B`,
                  borderRadius: '8px',
                  marginBottom: '12px',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#92400E', marginBottom: '6px' }}>
                  ⚠️ Witness Consent & Disclosure Risk Notice
                </div>
                <div style={{ fontSize: '12px', color: '#78350F', lineHeight: '1.6' }}>
                  <strong>Important Legal Notice:</strong> Any witness statement, evidence extraction, or statement of truth must be <strong>factually accurate</strong> and made with full knowledge and consent of the witness. You must NOT:
                  <ul style={{ margin: '6px 0', paddingLeft: '18px' }}>
                    <li>Fabricate or alter witness statements</li>
                    <li>Attribute statements to witnesses who did not provide them</li>
                    <li>Use this tool to create false evidence</li>
                  </ul>
                  Misuse violates UK Fraud Act 2006 and Employment Tribunal procedure. All extracted statements must be verified and signed by actual witnesses. UJRIS will not be held liable for user misuse of AI-generated content.
                </div>
              </div>

              {/* FILE UPLOAD */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: COLORS.navy_text }}>
                  📎 Upload PDF/Image (Optional)
                </label>
                <input
                  type="file"
                  accept=".pdf,.txt,.doc,.docx,image/*"
                  onChange={handleFileUpload}
                  style={{
                    display: 'block',
                    padding: '6px',
                    fontSize: '12px',
                    color: COLORS.dark_gray,
                  }}
                />
                {uploadedFile && (
                  <div style={{ fontSize: '11px', color: '#10B981', marginTop: '4px' }}>
                    ✅ File loaded: {uploadedFile.name}
                  </div>
                )}
              </div>

              {/* EXTRACTED FILE TEXT DISPLAY */}
              {fileText && fileText !== extractionInput && (
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: COLORS.navy_text }}>
                    📄 Extracted Text from File
                  </div>
                  <textarea
                    value={fileText}
                    readOnly
                    style={{
                      width: '100%',
                      minHeight: '100px',
                      border: `1px solid ${COLORS.medium_gray}`,
                      borderRadius: '8px',
                      padding: '8px',
                      fontSize: '12px',
                      backgroundColor: '#F9FAFB',
                    }}
                  />
                  <button
                    onClick={() => setExtractionInput(fileText)}
                    style={{
                      marginTop: '8px',
                      padding: '8px 12px',
                      backgroundColor: COLORS.info_blue,
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    Use This Text for Analysis
                  </button>
                </div>
              )}

              {/* TEXT INPUT */}
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: COLORS.navy_text }}>
                ✍️ Meeting Minutes / Hearing Transcript
              </label>
              <textarea
                value={extractionInput}
                onChange={(e) => setExtractionInput(e.target.value)}
                placeholder="Paste meeting minutes, hearing transcript, witness notes, CCTV timestamps, incident logs..."
                style={{
                  width: '100%',
                  minHeight: '140px',
                  border: `1px solid ${COLORS.medium_gray}`,
                  borderRadius: '8px',
                  padding: '10px',
                  fontSize: '13px',
                  marginBottom: '10px',
                  fontFamily: 'monospace',
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={runForensicExtraction}
                  disabled={extractionLoading}
                  style={{
                    padding: '10px 16px',
                    border: 'none',
                    borderRadius: '8px',
                    backgroundColor: extractionLoading ? '#D1D5DB' : COLORS.gold_accent,
                    color: COLORS.navy_text,
                    fontWeight: '700',
                    cursor: extractionLoading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {extractionLoading ? 'Analyzing...' : '🔍 Extract Witness-as-Evidence'}
                </button>
                <button
                  onClick={() => {
                    setExtractionInput('');
                    setExtractionResult('');
                    setExtractionError(null);
                  }}
                  style={{
                    padding: '10px 16px',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    color: COLORS.navy_text,
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  Clear
                </button>
                <button
                  onClick={() => setShowAuditTrail(!showAuditTrail)}
                  style={{
                    padding: '10px 16px',
                    border: '1px solid #94A3B8',
                    borderRadius: '8px',
                    backgroundColor: showAuditTrail ? '#E0E7FF' : 'white',
                    color: COLORS.navy_text,
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  📋 Audit Trail ({auditLog.length})
                </button>
              </div>
              {extractionError && (
                <div style={{ marginTop: '12px', color: COLORS.danger_red, fontSize: '13px' }}>
                  ❌ {extractionError}
                </div>
              )}
              {extractionResult && (
                <div style={{ marginTop: '14px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: COLORS.navy_text }}>
                    ✅ Forensic Witness Output (Source-Anchored)
                  </div>
                  <pre
                    style={{
                      padding: '12px',
                      backgroundColor: '#F7FAFC',
                      borderRadius: '8px',
                      fontSize: '12px',
                      whiteSpace: 'pre-wrap',
                      maxHeight: '380px',
                      overflowY: 'auto',
                      color: COLORS.navy_text,
                      border: `1px solid ${COLORS.light_gray}`,
                    }}
                  >
                    {extractionResult}
                  </pre>
                  <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(extractionResult);
                        alert('Witness statement copied to clipboard');
                      }}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: COLORS.success_green,
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      📋 Copy Output
                    </button>
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(extractionResult);
                        link.download = `witness_extract_${Date.now()}.txt`;
                        link.click();
                      }}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: COLORS.info_blue,
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      💾 Download
                    </button>
                  </div>
                </div>
              )}

              {/* AUDIT TRAIL */}
              {showAuditTrail && auditLog.length > 0 && (
                <div style={{ marginTop: '14px', padding: '12px', backgroundColor: '#F3F4F6', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: '700', color: COLORS.navy_text }}>
                    📜 Forensic Audit Trail
                  </h4>
                  {auditLog.slice(0, 5).map((entry, idx) => (
                    <div
                      key={idx}
                      style={{
                        fontSize: '11px',
                        padding: '8px',
                        marginBottom: idx < 4 ? '8px' : 0,
                        backgroundColor: entry.status === 'error' ? '#FEE2E2' : '#F0FDF4',
                        border: `1px solid ${entry.status === 'error' ? '#FECACA' : '#DCFCE7'}`,
                        borderRadius: '4px',
                      }}
                    >
                      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                        {entry.status === 'error' ? '❌' : '✅'} {new Date(entry.timestamp).toLocaleString()}
                      </div>
                      <div>Case: {entry.caseContext}</div>
                      {entry.sourceHash && <div>Hash: {entry.sourceHash.slice(0, 8)}...</div>}
                      {entry.error && <div style={{ color: 'red' }}>Error: {entry.error}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Plan */}
            <div
              style={{
                marginTop: '24px',
                padding: '16px',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                borderLeft: `4px solid ${COLORS.success_green}`,
                borderRadius: '8px',
              }}
            >
              <h3
                style={{
                  fontSize: '13px',
                  fontWeight: '700',
                  marginBottom: '8px',
                  color: COLORS.navy_text,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                🎯 Your Action Plan
              </h3>
              <ol
                style={{
                  fontSize: '12px',
                  color: COLORS.navy_text,
                  lineHeight: '1.8',
                  margin: 0,
                  paddingLeft: '20px',
                }}
              >
                <li>
                  <strong>This week:</strong> Send SAR letter (critical evidence often
                  hidden in HR files)
                </li>
                <li>
                  <strong>Next week:</strong> Identify 2-3 comparators and their key
                  info
                </li>
                <li>
                  <strong>This month:</strong> Book GP appointment to document health
                  impact
                </li>
                <li>
                  <strong>Ongoing:</strong> Gather witness statements and email
                  evidence
                </li>
                <li>
                  <strong>Before filing ET1:</strong> Assemble all evidence into
                  tribunal bundles
                </li>
              </ol>
            </div>

            {/* Urgency Key */}
            <div
              style={{
                marginTop: '24px',
                padding: '16px',
                backgroundColor: COLORS.light_gray,
                borderRadius: '8px',
              }}
            >
              <h3
                style={{
                  fontSize: '13px',
                  fontWeight: '700',
                  marginBottom: '12px',
                  color: COLORS.navy_text,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                📌 Urgency Key
              </h3>
              <div style={{ display: 'grid', gap: '10px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12px',
                  }}
                >
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      backgroundColor: COLORS.danger_red,
                      borderRadius: '4px',
                    }}
                  />
                  <span>
                    <strong>Critical:</strong> Act in next 7 days or evidence may be
                    lost
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12px',
                  }}
                >
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      backgroundColor: COLORS.warning_orange,
                      borderRadius: '4px',
                    }}
                  />
                  <span>
                    <strong>High:</strong> Gather within 2 weeks for tribunal
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12px',
                  }}
                >
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      backgroundColor: COLORS.info_blue,
                      borderRadius: '4px',
                    }}
                  />
                  <span>
                    <strong>Medium:</strong> Helpful but not case-breaking
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EvidenceHuntMode;
