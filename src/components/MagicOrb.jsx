import React, { useState, useEffect } from 'react';

/**
 * MagicOrb.jsx
 * ───────────────
 * Floating gold orb (bottom-right, fixed position)
 * One-tap access to start a new case or continue existing case
 * Voice command support: "Start my case" or "UJRIS"
 * Mobile-first: triggers PWA install prompt
 * 
 * Integration:
 * - Props: onStartCase (callback when clicked or voice-activated)
 * - Uses browser SpeechRecognition API (Chrome, Edge, Safari)
 * - Stores listening state locally
 */

const MagicOrb = ({ onStartCase }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Initialize SpeechRecognition API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.lang = 'en-GB';
      recognitionInstance.interimResults = false;
      recognitionInstance.continuous = false;

      recognitionInstance.onstart = () => {
        setIsListening(true);
      };

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        // Match voice commands: "start my case", "ujris", "start", "case"
        if (
          transcript.includes('start') ||
          transcript.includes('case') ||
          transcript.includes('ujris')
        ) {
          onStartCase();
        }
        setIsListening(false);
      };

      recognitionInstance.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }

    // PWA install prompt listener
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [onStartCase]);

  const handleVoiceCommand = () => {
    if (recognition) {
      recognition.start();
      // Auto-stop after 5 seconds of silence
      setTimeout(() => {
        if (isListening) {
          recognition.stop();
        }
      }, 5000);
    } else {
      // Fallback if SpeechRecognition not available
      onStartCase();
    }
  };

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  return (
    <>
      {/* Main Magic Orb Button */}
      <div
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          zIndex: 1000,
          cursor: 'pointer',
        }}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleVoiceCommand();
          }
        }}
        aria-label="Start case or voice command"
      >
        <div
          onClick={handleVoiceCommand}
          style={{
            width: '70px',
            height: '70px',
            background: 'linear-gradient(135deg, #D4AF37, #B28B2E)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow:
              '0 4px 15px rgba(0,0,0,0.2), 0 0 0 0 rgba(212,175,55,0.7)',
            animation: 'pulse 1.5s infinite',
            transition: 'transform 0.2s, box-shadow 0.2s',
            border: '2px solid #D4AF37',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.08)';
            e.currentTarget.style.boxShadow =
              '0 6px 20px rgba(212,175,55,0.4), 0 0 0 8px rgba(212,175,55,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow =
              '0 4px 15px rgba(0,0,0,0.2), 0 0 0 0 rgba(212,175,55,0.7)';
          }}
          title="Click or say 'Start my case'"
        >
          <span
            style={{
              fontSize: '32px',
              color: '#0F2C4A',
              fontWeight: 'bold',
            }}
          >
            ⚡
          </span>
        </div>

        {/* Listening Indicator */}
        {isListening && (
          <div
            style={{
              position: 'absolute',
              bottom: '80px',
              right: '10px',
              background: '#0F2C4A',
              color: '#F8F1E9',
              padding: '10px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '500',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              animation: 'slideUp 0.3s ease-out',
            }}
          >
            🎤 Listening... Say "Start my case"
          </div>
        )}

        {/* PWA Install Prompt */}
        {deferredPrompt && (
          <div
            style={{
              position: 'absolute',
              bottom: '80px',
              right: '10px',
              background: '#D4AF37',
              color: '#0F2C4A',
              padding: '10px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              transition: 'transform 0.2s',
            }}
            onClick={handleInstallPWA}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            📱 Install App
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.7);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(212, 175, 55, 0.3);
          }
          70% {
            box-shadow: 0 0 0 15px rgba(212, 175, 55, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(212, 175, 55, 0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
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

export default MagicOrb;
