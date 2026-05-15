import React, { useState, useEffect } from 'react';

/**
 * SovereignShield.jsx
 * ──────────────────
 * Emergency Confrontation Scripts & Safety Mode
 * 
 * Provides context-specific scripts for high-stress scenarios:
 * - Manager confrontation
 * - Police detention
 * - Social Services visit
 * - Aggression trap detection
 * - Stealth Mode (hides app)
 * 
 * This is a critical safety feature for users still in volatile situations
 */

const confrontationScripts = {
  manager: {
    icon: '👔',
    title: 'Manager Confrontation',
    color: '#2A4D69',
    scripts: [
      {
        scenario: 'You\'re suddenly called to a meeting about "performance issues"',
        script: 'I appreciate you bringing this to my attention. Before we continue, I\'d like a colleague or representative to be present. This is my right under the Employment Relations Act 1999, and I\'d be grateful if you could arrange that. [If they refuse: I don\'t feel comfortable proceeding without a witness.]',
        tip: 'Having a witness protects BOTH parties. A refusal suggests they\'re not being fair.',
      },
      {
        scenario: 'They ask you to resign "to avoid a disciplinary"',
        script: 'Thank you for that option. I\'m not prepared to resign. If you have concerns about my performance, please issue a formal notice outlining the specific issues, my right to respond, and the process. I\'ll be taking contemporaneous notes of this conversation.',
        tip: 'Resignation = giving up all rights. Termination = potential unfair dismissal claim.',
      },
      {
        scenario: 'They say "if you complain, you\'ll be let go"',
        script: 'I\'ve noted that statement. For clarity: retaliation for raising a concern or complaint is a criminal offense under the Public Interest Disclosure Act 1998 and discrimination under the Equality Act 2010. I will be documenting this conversation.',
        tip: 'This is an ANCHOR LIE. Most powerful piece of evidence you can have.',
      },
      {
        scenario: 'They claim they have "dirt on you"',
        script: 'If you have concerns about my conduct, please raise them formally through the proper process. Any threats or attempts to coerce me through blackmail is illegal. I\'m documenting this conversation for my records.',
        tip: 'Stay calm. Blackmail is a Section 21 offence. Document everything immediately.',
      },
    ],
  },

  police: {
    icon: '🚔',
    title: 'Police Detention',
    color: '#DC2626',
    scripts: [
      {
        scenario: 'Police ask you to come to the station',
        script: 'Am I free to leave? [If no:] I am exercising my right to silence. I will not answer any questions without a duty solicitor present. Please arrange for free legal advice immediately.',
        tip: 'You have a right to free legal advice in police custody. This is non-negotiable.',
      },
      {
        scenario: 'They say "this will be quicker if you just talk"',
        script: 'I understand, but I need proper legal representation. I will not be answering questions without a solicitor present. This is my right under Section 6 of the Police & Criminal Evidence Act 1984 (PACE).',
        tip: 'Anything you say can and will be used against you. Solicitors present prevents police pressure.',
      },
      {
        scenario: 'They pressure you about delay',
        script: 'I\'m aware of the clock. However, my right to legal representation is more important than speed. Please provide me with access to a duty solicitor now.',
        tip: 'Police use time pressure. Don\'t fall for it. Better to wait 6 hours with a solicitor than confess without one.',
      },
      {
        scenario: 'Police say "we know what happened, just confirm it"',
        script: 'I will not be making any statement. I am exercising my right to silence under Section 34 of the Criminal Justice Act 1994. Please arrange my solicitor.',
        tip: 'Silence cannot be used against you (with exceptions). Solicitors know these limits.',
      },
    ],
  },

  socialServices: {
    icon: '👨‍👩‍👧',
    title: 'Social Services Visit',
    color: '#10B981',
    scripts: [
      {
        scenario: 'Social Services shows up at your door unannounced',
        script: 'I appreciate your concern. I don\'t consent to a voluntary interview or house inspection at this time. Please send your concerns in writing to my address, and I\'ll respond formally. If you need to proceed, please provide written notice and legal justification.',
        tip: 'Voluntary = you can refuse. Forced = they need a court order or immediate risk.',
      },
      {
        scenario: 'They say "this is routine, we just need to chat"',
        script: 'I understand, but I need proper notice and opportunity to prepare. Please write to me outlining your concerns, and I\'ll arrange a time that works for all parties. I\'d like an independent advocate present.',
        tip: 'Push back on "routine". You have rights. Get advice before talking.',
      },
      {
        scenario: 'They threaten removal of children if you don\'t cooperate',
        script: 'I\'m taking your concerns seriously. To address them properly, I\'d like to involve my solicitor and an independent advocate. Any decisions about my children should go through the Family Court with proper process and evidence.',
        tip: 'Removal is ONLY in immediate danger. Otherwise, they need a court order.',
      },
      {
        scenario: 'They ask about your past or mental health',
        script: 'That\'s a legitimate question, but I\'d prefer to discuss it with my solicitor present to ensure the conversation is recorded accurately. Can we arrange a formal meeting with my representative?',
        tip: 'Everything you say is noted. Professional representation protects you.',
      },
    ],
  },

  aggressionTrap: {
    icon: '⚠️',
    title: 'Aggression Trap Detection',
    color: '#F59E0B',
    scripts: [
      {
        scenario: 'They provoke you with insults or dismissive language',
        script: '[PAUSE. BREATHE.] They are trying to provoke an emotional reaction. Your job is to stay calm, document everything, and respond factually. DO NOT engage with the bait.',
        tip: 'If you get angry and say something rash, THAT becomes the story, not their wrongdoing.',
      },
      {
        scenario: 'They move the goalposts (change the reason for discipline)',
        script: '[Document this immediately in contemporaneous notes.] This shift in narrative shows they\'re improvising, which weakens their case. Their inconsistency is YOUR advantage.',
        tip: 'Shifting reasons = evidence the original claim was false. Gold for tribunal.',
      },
      {
        scenario: 'They gang up (manager + HR + another person suddenly)',
        script: 'I wasn\'t expecting additional people. This feels like an ambush. I don\'t feel comfortable proceeding without representation. I\'m ending this meeting and requesting a formal process with proper notice.',
        tip: 'Gang meetings are intimidation tactics. You can refuse and demand fair process.',
      },
      {
        scenario: 'They record/pressure you to sign something immediately',
        script: 'I will not be signing anything today. I need time to review any documents, take legal advice, and respond formally. Anything I sign will be with legal representation.',
        tip: 'Never sign under pressure. That signature may be later claimed as "agreed".',
      },
    ],
  },
};

const SovereignShield = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [stealthMode, setStealthMode] = useState(false);
  const [volumePress, setVolumePress] = useState(0);

  // Detect double-tap volume down for stealth mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Volume Down key code (browser limitation, but we'll use Escape + Ctrl as fallback)
      if ((e.key === 'Escape' || e.key === 'Delete') && e.ctrlKey) {
        setVolumePress((prev) => prev + 1);
        if (volumePress >= 1) {
          activateStealth();
          setVolumePress(0);
        }
        setTimeout(() => setVolumePress(0), 1000);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [volumePress]);

  const activateStealth = () => {
    setStealthMode(true);
    setTimeout(() => setIsOpen(false), 300);
  };

  // Stealth Mode: Shows blank screen / weather content
  if (stealthMode) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: '#F0F0F0',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
      }}>
        <h1 style={{ color: '#333', fontSize: '28px' }}>Weather</h1>
        <div style={{ fontSize: '64px' }}>🌤️</div>
        <p style={{ color: '#666', fontSize: '16px' }}>Temperature: 12°C</p>
        <p style={{ color: '#888', fontSize: '14px' }}>Partly Cloudy</p>
        <p style={{ color: '#999', fontSize: '12px', marginTop: '20px' }}>
          Tap anywhere to close
        </p>
        <button
          onClick={() => setStealthMode(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            zIndex: -1,
          }}
        />
      </div>
    );
  }

  // Main Shield View
  return (
    <>
      {/* Floating Shield Button */}
      <div
        style={{
          position: 'fixed',
          bottom: '110px',
          right: '30px',
          zIndex: 999,
        }}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: '65px',
            height: '65px',
            background: 'linear-gradient(135deg, #DC2626, #991B1B)',
            borderRadius: '50%',
            border: '2px solid #DC2626',
            color: '#fff',
            fontSize: '28px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(220, 38, 38, 0.3)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(220, 38, 38, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(220, 38, 38, 0.3)';
          }}
          title="Emergency Shield - Confrontation Scripts"
          aria-label="Open emergency shield"
        >
          🛡️
        </button>
        <p style={{
          fontSize: '10px',
          color: '#DC2626',
          textAlign: 'center',
          marginTop: '4px',
          fontWeight: '600',
          whiteSpace: 'nowrap',
        }}>
          Emergency Shield
        </p>
      </div>

      {/* Modal */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'flex-end',
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            style={{
              background: '#FFFFFF',
              width: '100%',
              maxWidth: '500px',
              maxHeight: '80vh',
              borderRadius: '20px 20px 0 0',
              padding: '30px 20px',
              overflowY: 'auto',
              animation: 'slideUp 0.3s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ color: '#0F2C4A', marginTop: 0, marginBottom: '20px', fontSize: '20px' }}>
              🛡️ Sovereign Shield
            </h2>
            <p style={{ color: '#64748B', marginBottom: '25px', fontSize: '13px' }}>
              Quick access to scripts for high-stress confrontations. Choose your scenario below.
            </p>

            {/* Scenario Selector */}
            {!selectedScenario ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {Object.entries(confrontationScripts).map(([key, scenario]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedScenario(key)}
                    style={{
                      background: '#F8F1E9',
                      border: `2px solid ${scenario.color}`,
                      borderRadius: '12px',
                      padding: '16px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = scenario.color;
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#F8F1E9';
                      e.currentTarget.style.color = '#0F2C4A';
                    }}
                  >
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                      {scenario.icon}
                    </div>
                    <div style={{ fontWeight: '600', fontSize: '15px' }}>
                      {scenario.title}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              /* Scripts View */
              <div>
                <button
                  onClick={() => setSelectedScenario(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#D4AF37',
                    fontSize: '13px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    marginBottom: '20px',
                    padding: 0,
                  }}
                >
                  ← Back
                </button>

                <h3 style={{ color: '#0F2C4A', marginTop: 0, marginBottom: '20px', fontSize: '18px' }}>
                  {confrontationScripts[selectedScenario].icon}{' '}
                  {confrontationScripts[selectedScenario].title}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {confrontationScripts[selectedScenario].scripts.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#FAF6F0',
                        borderRadius: '12px',
                        padding: '16px',
                        borderLeft: `4px solid ${confrontationScripts[selectedScenario].color}`,
                      }}
                    >
                      <p style={{ color: '#0F2C4A', fontWeight: '600', margin: '0 0 8px 0', fontSize: '13px' }}>
                        📍 {item.scenario}
                      </p>

                      <div
                        style={{
                          background: '#FFFFFF',
                          borderRadius: '8px',
                          padding: '12px',
                          marginBottom: '10px',
                          borderLeft: '2px solid #D4AF37',
                        }}
                      >
                        <p style={{ color: '#0F2C4A', margin: 0, fontSize: '13px', lineHeight: '1.6' }}>
                          "{item.script}"
                        </p>
                      </div>

                      <p style={{ color: '#64748B', margin: 0, fontSize: '12px', fontStyle: 'italic' }}>
                        💡 {item.tip}
                      </p>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(item.script);
                          alert('Script copied to clipboard');
                        }}
                        style={{
                          background: '#D4AF37',
                          color: '#0F2C4A',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          marginTop: '10px',
                          transition: 'transform 0.2s',
                        }}
                        onMouseEnter={(e) => (e.target.style.transform = 'scale(1.05)')}
                        onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
                      >
                        📋 Copy Script
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{
                  background: '#FFF3E0',
                  borderRadius: '8px',
                  padding: '12px',
                  marginTop: '20px',
                  borderLeft: '4px solid #F59E0B',
                }}>
                  <p style={{ color: '#0F2C4A', margin: 0, fontSize: '12px' }}>
                    ⚠️ <strong>REMEMBER:</strong> Stay calm. Document everything. Get legal advice. You have rights.
                  </p>
                </div>
              </div>
            )}

            {/* Stealth Mode Info */}
            <div style={{
              marginTop: '25px',
              padding: '12px',
              background: 'rgba(220, 38, 38, 0.1)',
              borderRadius: '8px',
              fontSize: '11px',
              color: '#DC2626',
            }}>
              <strong>Stealth Mode:</strong> Press Ctrl+Escape twice to hide this app and show a blank screen.
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(100px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default SovereignShield;
