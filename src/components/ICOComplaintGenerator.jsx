import React, { useState, useEffect } from 'react';

/**
 * ICOComplaintGenerator.jsx
 *
 * Automated generation of formal ICO (Information Commissioner's Office)
 * complaints when employer fails to respond to Subject Access Requests (SAR)
 *
 * Under UK GDPR Article 77, users have right to lodge complaint with ICO if:
 * - SAR not responded within 30 days
 * - SAR response incomplete or refused
 * - Data destroyed immediately before SAR filed (suspicion of tampering/spoliation)
 *
 * Features:
 * - SAR tracking form (date sent, employer, details)
 * - Auto-generation of Section 165 formal letter
 * - One-click copy/email
 * - Deadline countdown for ICO filing (no limit, but better to act within 3 months)
 * - Pre-populated with employer details from case_data
 *
 * Premium: Justice tier (limited to 1 complaint draft), Sovereign (unlimited with legal template versioning)
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
// ICO Complaint Template Generator
// ============================================================================

const generateICOComplaint = (sarData) => {
  const {
    employerName,
    employerAddress,
    dateSARSent,
    sarReferenceNo,
    yourName,
    yourAddress,
    yourEmail,
    yourPhone,
    reasonForComplaint,
    specificIssues,
  } = sarData;

  const sarSentDate = new Date(dateSARSent);
  const thirtyDaysLater = new Date(sarSentDate.getTime() + 30 * 24 * 60 * 60 * 1000);
  const todayDate = new Date();
  const complaintDate = todayDate.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
FORMAL COMPLAINT UNDER UK GDPR ARTICLE 77
Information Commissioner's Office

Date: ${complaintDate}

---

TO: Information Commissioner's Office
Wycliffe House
Water Lane
Wilmslow
Cheshire SK9 5AF
United Kingdom

Tel: 0303 123 1113
Web: www.ico.org.uk

---

FROM:

Name: ${yourName}
Address: ${yourAddress}
Email: ${yourEmail}
Phone: ${yourPhone}

---

DETAILS OF THE DATA CONTROLLER:

Name: ${employerName}
Address: ${employerAddress}

---

COMPLAINT SUMMARY

I am writing to lodge a formal complaint under Article 77 of the UK General Data Protection Regulation (UK GDPR) and Section 165 of the Data Protection Act 2018.

I believe the above-named organisation has breached my rights under UK GDPR in relation to my Subject Access Request (SAR).

---

BACKGROUND

On ${sarSentDate.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })}, I submitted a formal Subject Access Request (SAR) to ${employerName} under Articles 13-15 of the UK GDPR.

Reference: ${sarReferenceNo || 'As detailed below'}

A copy of my SAR is attached.

---

REASON FOR COMPLAINT

${reasonForComplaint || 'The organisation has failed to comply with the statutory requirements for processing Subject Access Requests.'}

---

SPECIFIC ISSUES

${specificIssues ? specificIssues.split('\n').map((issue) => `• ${issue}`).join('\n') : `• Failure to respond within 30 calendar days (deadline was: ${thirtyDaysLater.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })})
• No response received despite follow-up contact
• Partial or incomplete response provided
• Refusal to provide records without proper legal basis
• Destruction of records in suspicious proximity to SAR filing`}

---

LEGAL BASIS FOR COMPLAINT

Under Article 77 of the UK GDPR, I have the right to lodge a complaint with the Information Commissioner's Office if I believe the organisation has infringed my rights.

The organisation's failure to comply with my SAR constitutes a breach of Articles 13-15 of the UK GDPR, which require that:

1. A data controller must provide a copy of personal data (Article 15)
2. Response must be provided within 30 calendar days (Article 12(3))
3. No derogation or exemption applies without proper justification (Article 21-23)
4. Refusal must be in writing with specific legal reasoning

The organisation has failed to meet these legal requirements.

---

EVIDENCE

I have enclosed the following evidence:
• Copy of my SAR letter dated ${sarSentDate.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })}
• Proof of delivery (registered mail / email read receipt)
• Correspondence with the organisation (if any)
• Details of reminders sent

---

REQUESTED OUTCOME

I request that the Information Commissioner's Office:

1. Investigate this breach of my data rights
2. Require ${employerName} to provide my full personal data within 14 days
3. Impose a suitable fine (up to €20,000,000 or 4% of annual turnover)
4. Provide written confirmation of compliance

---

SUPPORTING DOCUMENTS

Attached:
• Copy of original SAR
• Proof of delivery
• Any correspondence with the organisation
• Supporting evidence of the breach

---

DECLARATION

I confirm that the information contained in this complaint is, to the best of my knowledge, true and accurate.

I understand that knowingly providing false information could result in prosecution.

Signed: ${yourName}

Date: ${complaintDate}

---

NOTES FOR THE ICO

This complaint relates to data rights that support an ongoing Employment Tribunal claim for discrimination. The personal data requested in my SAR is essential evidence for proving:
- Pattern of discriminatory behaviour
- Timeline of discriminatory acts
- Evidence of knowledge by management

Non-disclosure may allow the organisation to conceal evidence of wrongdoing and undermine my legal rights.

---
`;
};

// ============================================================================
// SAR Tracker Component
// ============================================================================

const SARTracker = ({ onGenerateComplaint }) => {
  const [sars, setSARs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    employerName: '',
    employerAddress: '',
    dateSARSent: '',
    sarReferenceNo: '',
    sarDetails: '',
    status: 'pending',
  });

  useEffect(() => {
    const savedSARs = S.get('sars', []);
    setSARs(savedSARs);
  }, []);

  const handleAddSAR = () => {
    if (!formData.employerName || !formData.dateSARSent) {
      alert('Please fill in employer name and SAR date');
      return;
    }

    const newSAR = {
      id: Date.now(),
      ...formData,
      createdAt: new Date().toISOString(),
    };

    const updatedSARs = [...sars, newSAR];
    setSARs(updatedSARs);
    S.set('sars', updatedSARs);

    setFormData({
      employerName: '',
      employerAddress: '',
      dateSARSent: '',
      sarReferenceNo: '',
      sarDetails: '',
      status: 'pending',
    });
    setShowForm(false);
  };

  const handleDeleteSAR = (id) => {
    const updatedSARs = sars.filter((s) => s.id !== id);
    setSARs(updatedSARs);
    S.set('sars', updatedSARs);
  };

  const getStatus = (dateSent) => {
    const sentDate = new Date(dateSent);
    const thirtyDaysLater = new Date(sentDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    const today = new Date();

    if (today < thirtyDaysLater) {
      const daysRemaining = Math.ceil((thirtyDaysLater - today) / (1000 * 60 * 60 * 24));
      return {
        label: `${daysRemaining} days to respond`,
        color: COLORS.success_green,
        urgency: 'normal',
      };
    } else {
      const daysOverdue = Math.ceil((today - thirtyDaysLater) / (1000 * 60 * 60 * 24));
      return {
        label: `${daysOverdue} days overdue - File ICO complaint now`,
        color: COLORS.danger_red,
        urgency: 'critical',
      };
    }
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      <h2
        style={{
          fontSize: '18px',
          fontWeight: '700',
          marginBottom: '16px',
          color: COLORS.navy_text,
        }}
      >
        📋 Your SAR Tracking
      </h2>

      {sars.length === 0 ? (
        <div
          style={{
            padding: '20px',
            backgroundColor: 'white',
            borderRadius: '8px',
            textAlign: 'center',
            color: COLORS.dark_gray,
          }}
        >
          <p style={{ margin: 0, fontSize: '13px' }}>
            No SARs tracked yet. Add one to track the 30-day deadline.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {sars.map((sar) => {
            const status = getStatus(sar.dateSARSent);
            return (
              <div
                key={sar.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  padding: '16px',
                  borderLeft: `4px solid ${status.color}`,
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
                    <h3 style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>
                      {sar.employerName}
                    </h3>
                    <p style={{ fontSize: '12px', color: COLORS.dark_gray, margin: '4px 0 0 0' }}>
                      SAR sent:{' '}
                      {new Date(sar.dateSARSent).toLocaleDateString('en-GB', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteSAR(sar.id)}
                    style={{
                      backgroundColor: 'transparent',
                      color: COLORS.danger_red,
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600',
                    }}
                  >
                    ✕
                  </button>
                </div>

                <div
                  style={{
                    padding: '8px 12px',
                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: status.color,
                    marginBottom: '12px',
                  }}
                >
                  {status.label}
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                  }}
                >
                  <button
                    onClick={() =>
                      onGenerateComplaint({
                        ...sar,
                        yourName: S.get('case_data', {})?.userName || '',
                        yourAddress: '',
                        yourEmail: '',
                        yourPhone: '',
                      })
                    }
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor:
                        status.urgency === 'critical'
                          ? COLORS.danger_red
                          : COLORS.info_blue,
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    Generate ICO Complaint
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={() => setShowForm(!showForm)}
        style={{
          marginTop: '12px',
          padding: '10px 16px',
          backgroundColor: 'transparent',
          color: COLORS.info_blue,
          border: `2px solid ${COLORS.info_blue}`,
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: '600',
          cursor: 'pointer',
        }}
      >
        {showForm ? '✕ Cancel' : '+ Add New SAR'}
      </button>

      {showForm && (
        <div
          style={{
            marginTop: '12px',
            padding: '16px',
            backgroundColor: 'white',
            borderRadius: '8px',
          }}
        >
          <input
            type="text"
            placeholder="Employer name"
            value={formData.employerName}
            onChange={(e) => setFormData({ ...formData, employerName: e.target.value })}
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '13px',
              marginBottom: '8px',
              border: `1px solid ${COLORS.medium_gray}`,
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
          />
          <input
            type="text"
            placeholder="Employer address"
            value={formData.employerAddress}
            onChange={(e) => setFormData({ ...formData, employerAddress: e.target.value })}
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '13px',
              marginBottom: '8px',
              border: `1px solid ${COLORS.medium_gray}`,
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
          />
          <input
            type="date"
            value={formData.dateSARSent}
            onChange={(e) => setFormData({ ...formData, dateSARSent: e.target.value })}
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '13px',
              marginBottom: '8px',
              border: `1px solid ${COLORS.medium_gray}`,
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
          />
          <input
            type="text"
            placeholder="SAR reference number (optional)"
            value={formData.sarReferenceNo}
            onChange={(e) => setFormData({ ...formData, sarReferenceNo: e.target.value })}
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '13px',
              marginBottom: '8px',
              border: `1px solid ${COLORS.medium_gray}`,
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
          />
          <button
            onClick={handleAddSAR}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: COLORS.info_blue,
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Track SAR
          </button>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// ICOComplaintGenerator - Main Component
// ============================================================================

const ICOComplaintGenerator = ({ onUpgrade = () => {} }) => {
  const [caseData, setCaseData] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [generatedComplaint, setGeneratedComplaint] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const loadData = () => {
      const caseData = S.get('case_data');
      const subscription = S.get('subscription', {});

      setCaseData(caseData);
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

  if (!mounted) {
    return (
      <div
        style={{
          padding: '20px',
          textAlign: 'center',
          color: COLORS.dark_gray,
        }}
      >
        Loading...
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
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>📧</div>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 'bold',
              marginBottom: '12px',
            }}
          >
            ICO Complaint Generator
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
            If your employer doesn't respond to your Subject Access Request (SAR)
            within 30 days, you can file a formal complaint with the Information
            Commissioner's Office.
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
              What You'll Get:
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
                <strong>Auto-generated Section 165 complaint letter</strong> – addresses to the
                ICO
              </li>
              <li>
                <strong>Pre-filled with your details</strong> from your case profile
              </li>
              <li>
                <strong>Legal template</strong> citing correct GDPR articles & rights
              </li>
              <li>One-click copy/email to ICO</li>
              <li>Track multiple SARs with deadline countdown</li>
              <li>
                <strong>Cost:</strong> Free to file (ICO doesn't charge)
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
            Unlock ICO Complaints – From £9.99/mo
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
            📧 ICO Complaint Generator
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: '13px',
              color: COLORS.dark_gray,
            }}
          >
            File a formal complaint with the Information Commissioner's Office if your
            employer fails to respond to your SAR
          </p>
        </div>

        {!generatedComplaint ? (
          <>
            {/* Info Box */}
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
                ⚖️ Your Rights Under GDPR
              </h3>
              <p
                style={{
                  fontSize: '12px',
                  color: COLORS.navy_text,
                  margin: 0,
                  lineHeight: '1.6',
                }}
              >
                Under Article 77 of the UK GDPR, you have the right to file a formal complaint
                with the Information Commissioner's Office if:
              </p>
              <ul
                style={{
                  fontSize: '12px',
                  color: COLORS.navy_text,
                  margin: '8px 0 0 20px',
                  lineHeight: '1.6',
                }}
              >
                <li>Your SAR is not answered within 30 calendar days</li>
                <li>Your SAR is partially answered or data is incomplete</li>
                <li>Your employer refuses to provide personal data without legal justification</li>
                <li>You suspect records were destroyed to hide evidence</li>
              </ul>
            </div>

            {/* SAR Tracker */}
            <SARTracker
              onGenerateComplaint={(sarData) => {
                const complaint = generateICOComplaint(sarData);
                setGeneratedComplaint(complaint);
              }}
            />
          </>
        ) : (
          <>
            {/* Generated Complaint Display */}
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '16px',
              }}
            >
              <pre
                style={{
                  fontSize: '11px',
                  color: COLORS.navy_text,
                  lineHeight: '1.6',
                  overflow: 'auto',
                  maxHeight: '600px',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  fontFamily: 'Georgia, serif',
                }}
              >
                {generatedComplaint}
              </pre>
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '16px',
              }}
            >
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedComplaint);
                  alert('Complaint copied to clipboard!');
                }}
                style={{
                  padding: '12px',
                  backgroundColor: COLORS.success_green,
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                📋 Copy to Clipboard
              </button>
              <button
                onClick={() =>
                  window.print()
                }
                style={{
                  padding: '12px',
                  backgroundColor: COLORS.info_blue,
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                🖨️ Print / Save as PDF
              </button>
            </div>

            {/* Info Box */}
            <div
              style={{
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                borderLeft: `4px solid ${COLORS.success_green}`,
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px',
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
                📬 How to File
              </h3>
              <ol
                style={{
                  fontSize: '12px',
                  color: COLORS.navy_text,
                  margin: 0,
                  lineHeight: '1.6',
                  paddingLeft: '20px',
                }}
              >
                <li>
                  <strong>Print & sign:</strong> Print this complaint and sign it
                </li>
                <li>
                  <strong>Enclose evidence:</strong> Attach copy of original SAR + proof of
                  delivery
                </li>
                <li>
                  <strong>Send by post:</strong> Send to Information Commissioner's Office
                  (address at top)
                </li>
                <li>
                  <strong>Or submit online:</strong> Visit ico.org.uk and use their online form
                </li>
                <li>
                  <strong>Keep copies:</strong> Save all correspondence
                </li>
              </ol>
            </div>

            <button
              onClick={() => setGeneratedComplaint(null)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: COLORS.light_gray,
                color: COLORS.navy_text,
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              ← Back to SAR Tracker
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ICOComplaintGenerator;
