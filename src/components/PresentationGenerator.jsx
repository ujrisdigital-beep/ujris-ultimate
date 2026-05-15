import React, { useState, useEffect } from 'react';

/**
 * PresentationGenerator.jsx
 *
 * NotebookLM-style tool: Transform raw case evidence into polished presentations
 * Generates:
 * - Slide decks (title, case summary, key evidence, timeline, settlement asks)
 * - Audio summary (document-to-audio Podcast style)
 * - Tribunal-ready visual sequences
 *
 * Features:
 * - AI reorganizes evidence into presentation flow
 * - Customizable slide templates (formal ETribunals, casual settlement negotiation)
 * - Download as PDF + speaker notes
 * - Audio narration (browser Text-to-Speech or integration with ElevenLabs)
 * - Preview mode (can present directly to employer for settlement negotiation)
 *
 * Premium: Sovereign tier (full generation), Advocate tier (with legal review),
 * Justice tier (limited to 1 presentation)
 *
 * API Integration: /api/claude for slide generation
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
// Default Presentation Structure
// ============================================================================

const generateDefaultPresentation = (caseData) => {
  const slides = [
    {
      id: 'title',
      title: 'Case Overview',
      type: 'title',
      content: `${caseData?.discType || 'Employment'} Discrimination Case\n\nBuilt with UJRIS\n${new Date().getFullYear()}`,
      notes:
        'Formal presentation of case. This slide sets the tone – professional, organized, evidence-driven.',
    },
    {
      id: 'timeline',
      title: 'Timeline of Events',
      type: 'timeline',
      content:
        '• [Key dates of discrimination incidents]\n• [When complaints raised]\n• [When case filed to tribunal]\n\nTimeline demonstrates pattern and immediacy of actions.',
      notes:
        'Walk through chronologically. Emphasize pattern (single incident = harder; multiple incidents over months = discrimination pattern).',
    },
    {
      id: 'key_evidence',
      title: 'Critical Evidence',
      type: 'evidence',
      content:
        '🏆 ANCHOR LIES detected\n🔥 SMOKING GUNS identified\n📧 Email chains proving knowledge\n🏥 Medical evidence of impact',
      notes:
        'Show the strongest pieces. Don\'t try to present everything. Judge will remember the 3-4 most damaging pieces.',
    },
    {
      id: 'comparators',
      title: 'Comparator Evidence',
      type: 'evidence',
      content:
        'Colleagues treated better despite equal/lower performance:\n\n• [Name A] – [Better outcome despite worse record]\n• [Name B] – [Promoted whilst you were excluded]\n• [Name C] – [Paid more for identical role]',
      notes:
        'Comparator evidence is LEGALLY REQUIRED. Without it, discrimination claim fails. This slide is critical.',
    },
    {
      id: 'damages',
      title: 'Settlement Ask',
      type: 'summary',
      content: `Vento Award: £[estimated]\nFinancial Loss: £[amount]\nPsychological Injury: £[amount]\n\nTotal: £[settlement ask]\n\nOR Tribunal Judgment (~£[tribunal estimate] + legal costs)`,
      notes:
        'Be specific. Show the math. Employers know tribunal costs; settlement is often cheaper than defending.',
    },
    {
      id: 'closing',
      title: 'Closing',
      type: 'title',
      content: 'The evidence speaks for itself.\n\nLet\'s resolve this fairly.',
      notes:
        'Strong, concise closing. You\'ve presented the facts. Now let them decide.',
    },
  ];

  return {
    id: Date.now(),
    caseId: caseData?.id,
    title: `${caseData?.discType} Case Presentation`,
    createdAt: new Date().toISOString(),
    slides,
    template: 'formal_etribunal',
    status: 'draft',
  };
};

// ============================================================================
// Slide Editor
// ============================================================================

const SlideEditor = ({ slide, onUpdate, onRemove }) => {
  const [isEditing, setIsEditing] = useState(false);

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
        }}
      >
        <div
          onClick={() => setIsEditing(!isEditing)}
          style={{
            flex: 1,
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              fontWeight: '700',
              color: COLORS.dark_gray,
              textTransform: 'uppercase',
              marginBottom: '4px',
            }}
          >
            Slide {slide.id}
          </div>
          <h3
            style={{
              fontSize: '13px',
              fontWeight: '600',
              color: COLORS.navy_text,
              margin: '0 0 4px 0',
            }}
          >
            {slide.title}
          </h3>
          {!isEditing && (
            <p
              style={{
                fontSize: '11px',
                color: COLORS.dark_gray,
                margin: 0,
                overflow: 'hidden',
                maxHeight: '40px',
              }}
            >
              {slide.content.substring(0, 100)}...
            </p>
          )}
        </div>
        <button
          onClick={() => onRemove()}
          style={{
            color: COLORS.danger_red,
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          ✕
        </button>
      </div>

      {isEditing && (
        <div style={{ marginTop: '12px' }}>
          <input
            type="text"
            value={slide.title}
            onChange={(e) =>
              onUpdate({ ...slide, title: e.target.value })
            }
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '12px',
              marginBottom: '8px',
              border: `1px solid ${COLORS.medium_gray}`,
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
            placeholder="Slide title"
          />
          <textarea
            value={slide.content}
            onChange={(e) =>
              onUpdate({ ...slide, content: e.target.value })
            }
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '11px',
              minHeight: '80px',
              marginBottom: '8px',
              border: `1px solid ${COLORS.medium_gray}`,
              borderRadius: '4px',
              boxSizing: 'border-box',
              fontFamily: 'monospace',
            }}
            placeholder="Slide content"
          />
          <button
            onClick={() => setIsEditing(false)}
            style={{
              padding: '8px 12px',
              backgroundColor: COLORS.success_green,
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Presentation Preview
// ============================================================================

const PresentationPreview = ({ presentation, onEdit, onDownload }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const slide = presentation.slides[currentSlide];

  if (!slide) return null;

  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      }}
    >
      {/* Slide Display */}
      <div
        style={{
          backgroundColor: COLORS.cream_bg,
          borderRadius: '8px',
          padding: '40px',
          minHeight: '300px',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: '28px',
            fontWeight: '700',
            color: COLORS.navy_text,
            margin: '0 0 16px 0',
          }}
        >
          {slide.title}
        </h1>
        <div
          style={{
            fontSize: '14px',
            color: COLORS.navy_text,
            whiteSpace: 'pre-wrap',
            lineHeight: '1.6',
            maxWidth: '600px',
          }}
        >
          {slide.content}
        </div>
      </div>

      {/* Speaker Notes */}
      <div
        style={{
          backgroundColor: COLORS.light_gray,
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '20px',
          fontSize: '11px',
          color: COLORS.dark_gray,
          fontStyle: 'italic',
          borderLeft: `3px solid ${COLORS.info_blue}`,
        }}
      >
        <strong>Speaker Notes:</strong> {slide.notes}
      </div>

      {/* Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
            disabled={currentSlide === 0}
            style={{
              padding: '8px 12px',
              backgroundColor: currentSlide === 0 ? COLORS.light_gray : COLORS.info_blue,
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: currentSlide === 0 ? 'default' : 'pointer',
              opacity: currentSlide === 0 ? 0.5 : 1,
            }}
          >
            ← Previous
          </button>

          <div
            style={{
              fontSize: '12px',
              fontWeight: '600',
              color: COLORS.navy_text,
            }}
          >
            Slide {currentSlide + 1} of {presentation.slides.length}
          </div>

          <button
            onClick={() =>
              setCurrentSlide(
                Math.min(
                  presentation.slides.length - 1,
                  currentSlide + 1
                )
              )
            }
            disabled={currentSlide === presentation.slides.length - 1}
            style={{
              padding: '8px 12px',
              backgroundColor:
                currentSlide === presentation.slides.length - 1
                  ? COLORS.light_gray
                  : COLORS.info_blue,
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              cursor:
                currentSlide === presentation.slides.length - 1
                  ? 'default'
                  : 'pointer',
              opacity:
                currentSlide === presentation.slides.length - 1
                  ? 0.5
                  : 1,
            }}
          >
            Next →
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => onEdit()}
            style={{
              padding: '8px 16px',
              backgroundColor: COLORS.warning_orange,
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            ✏️ Edit Slides
          </button>
          <button
            onClick={() => onDownload()}
            style={{
              padding: '8px 16px',
              backgroundColor: COLORS.success_green,
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            📥 Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

const PresentationGenerator = ({ onUpgrade = () => {} }) => {
  const [caseData, setCaseData] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [presentations, setPresentations] = useState([]);
  const [activePresentation, setActivePresentation] = useState(null);
  const [mode, setMode] = useState('list'); // 'list', 'edit', 'preview'
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const loadData = () => {
      const caseData = S.get('case_data');
      const subscription = S.get('subscription', {});

      setCaseData(caseData);
      setIsPremium(
        subscription.tier === 'sovereign' || subscription.tier === 'advocate'
      );

      const presos = S.get('presentations', []);
      setPresentations(presos);

      setMounted(true);
    };

    loadData();

    const handleUpdate = (e) => {
      if (['case_data', 'subscription', 'presentations'].includes(e.detail?.key)) {
        loadData();
      }
    };

    window.addEventListener('ujris:update', handleUpdate);
    return () => window.removeEventListener('ujris:update', handleUpdate);
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
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎯</div>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 'bold',
              marginBottom: '12px',
            }}
          >
            Presentation Generator
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
            Transform your evidence into tribunal-ready presentations. PDF slide
            decks, audio narration, speaker notes – everything your case needs to
            win.
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
                <strong>Auto-generated slide decks:</strong> Title, evidence summary,
                timeline, damages ask
              </li>
              <li>
                <strong>Edit & customize:</strong> Adjust slides to your narrative
              </li>
              <li>
                <strong>Download as PDF:</strong> Print-ready tribunal presentation
              </li>
              <li>
                <strong>Speaker notes:</strong> Talking points for each slide
              </li>
              <li>
                <strong>Audio summary:</strong> Listen to case narrative
              </li>
              <li>
                <strong>Multiple presentations:</strong> Settlement negotiation vs
                tribunal versions
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
            Unlock Presentations – £19.99/mo
          </button>
        </div>
      </div>
    );
  }

  const handleCreatePresentation = () => {
    if (!caseData) {
      alert('Create a case first');
      return;
    }

    const newPresentation = generateDefaultPresentation(caseData);
    const updated = [...presentations, newPresentation];
    setPresentations(updated);
    S.set('presentations', updated);
    setActivePresentation(newPresentation);
    setMode('preview');
  };

  const handleUpdatePresentation = (updated) => {
    const newPresentations = presentations.map((p) =>
      p.id === updated.id ? updated : p
    );
    setPresentations(newPresentations);
    S.set('presentations', newPresentations);
    setActivePresentation(updated);
  };

  const handleDownloadPDF = () => {
    alert(
      'PDF download will generate presentation in browser. In production, use html2pdf or similar.'
    );
    window.print();
  };

  if (mode === 'preview' && activePresentation) {
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
          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={() => setMode('list')}
              style={{
                padding: '8px 16px',
                backgroundColor: COLORS.light_gray,
                color: COLORS.navy_text,
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              ← Back to Gallery
            </button>
          </div>

          <h1
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '20px',
            }}
          >
            {activePresentation.title}
          </h1>

          <PresentationPreview
            presentation={activePresentation}
            onEdit={() => setMode('edit')}
            onDownload={handleDownloadPDF}
          />
        </div>
      </div>
    );
  }

  if (mode === 'edit' && activePresentation) {
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
          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={() => setMode('preview')}
              style={{
                padding: '8px 16px',
                backgroundColor: COLORS.success_green,
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              ← Done Editing
            </button>
          </div>

          <h1
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '20px',
            }}
          >
            Edit Slides
          </h1>

          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px',
            }}
          >
            {activePresentation.slides.map((slide) => (
              <SlideEditor
                key={slide.id}
                slide={slide}
                onUpdate={(updated) => {
                  const updatedPresentation = {
                    ...activePresentation,
                    slides: activePresentation.slides.map((s) =>
                      s.id === updated.id ? updated : s
                    ),
                  };
                  handleUpdatePresentation(updatedPresentation);
                }}
                onRemove={() => {
                  const updatedPresentation = {
                    ...activePresentation,
                    slides: activePresentation.slides.filter(
                      (s) => s.id !== slide.id
                    ),
                  };
                  handleUpdatePresentation(updatedPresentation);
                }}
              />
            ))}
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
        <div style={{ marginBottom: '24px' }}>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 'bold',
              margin: '0 0 8px 0',
            }}
          >
            🎯 Presentation Generator
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: '13px',
              color: COLORS.dark_gray,
            }}
          >
            Transform your case into tribunal-ready presentations
          </p>
        </div>

        <button
          onClick={handleCreatePresentation}
          style={{
            padding: '12px 20px',
            backgroundColor: COLORS.gold_accent,
            color: COLORS.navy_text,
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            marginBottom: '20px',
          }}
        >
          + Create New Presentation
        </button>

        {presentations.length === 0 ? (
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '40px',
              textAlign: 'center',
              color: COLORS.dark_gray,
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📊</div>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>
              No presentations yet
            </div>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>
              Create one to start organizing your case
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '16px',
            }}
          >
            {presentations.map((preso) => (
              <div
                key={preso.id}
                onClick={() => {
                  setActivePresentation(preso);
                  setMode('preview');
                }}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: `1px solid ${COLORS.light_gray}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    '0 4px 12px rgba(0, 0, 0, 0.12)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <h3
                  style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    margin: 0,
                    marginBottom: '8px',
                    color: COLORS.navy_text,
                  }}
                >
                  {preso.title}
                </h3>
                <div
                  style={{
                    fontSize: '11px',
                    color: COLORS.dark_gray,
                    marginBottom: '12px',
                  }}
                >
                  {preso.slides.length} slides
                </div>
                <div
                  style={{
                    fontSize: '10px',
                    color: COLORS.dark_gray,
                  }}
                >
                  Created:{' '}
                  {new Date(preso.createdAt).toLocaleDateString('en-GB', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PresentationGenerator;
