import React, { useState, useEffect } from 'react';

/**
 * VentoEstimator.jsx
 * ──────────────────
 * Dynamic compensation calculator using 2026 Vento bands
 * Shows injury to feelings estimate that updates as evidence is added
 * Visual gauge with gold gradient towards Upper band
 * 
 * Props:
 * - timelineEvents: array of timeline events
 * - evidenceCount: number of pieces of evidence
 * - traumaScore: 1-10 scale of psychological impact
 * - medicalEvidence: boolean, has GP/therapy records
 * - isPremium: boolean, show full case citations (locked for free tier)
 */

const ventoBands2026 = {
  lower: {
    name: 'Lower Band',
    min: 1200,
    max: 12100,
    description: 'Isolated or one-off incidents with minimal impact',
    midpoint: 6650,
    color: '#5DB7AD',
  },
  middle: {
    name: 'Middle Band',
    min: 12100,
    max: 36400,
    description: 'Sustained harassment or significant psychological impact',
    midpoint: 24250,
    color: '#2A4D69',
  },
  upper: {
    name: 'Upper Band',
    min: 36400,
    max: 60700,
    description: 'Severe campaigns, permanent career damage, clinical depression',
    midpoint: 48550,
    color: '#D4AF37',
  },
};

const VentoEstimator = ({
  timelineEvents = [],
  evidenceCount = 0,
  traumaScore = 5,
  medicalEvidence = false,
  isPremium = false,
}) => {
  const [band, setBand] = useState('lower');
  const [estimate, setEstimate] = useState(6650);
  const [breakdown, setBreakdown] = useState({});

  // Recalculate on prop change
  useEffect(() => {
    // Calculate base score
    let score = 0;

    // Timeline events: Each week/incident adds points (max 30)
    const incidentCount = Math.min(timelineEvents.length, 30);
    score += incidentCount * 2;

    // Evidence: Each meaningful piece (max 25)
    const evidenceScore = Math.min(evidenceCount * 2, 25);
    score += evidenceScore;

    // Trauma: Direct 1-to-1 mapping of stated impact (1-10 → 10-100)
    const traumaFactor = traumaScore * 10;
    score += traumaFactor;

    // Medical evidence: +30 points if present
    if (medicalEvidence) {
      score += 30;
    }

    // Determine band
    let selectedBand = 'lower';
    let compensation = ventoBands2026.lower.midpoint;

    if (score > 120) {
      selectedBand = 'upper';
      // Interpolate within upper band
      compensation = Math.round(
        ventoBands2026.upper.min +
          ((Math.min(score, 200) - 120) / 80) *
            (ventoBands2026.upper.max - ventoBands2026.upper.min)
      );
    } else if (score > 60) {
      selectedBand = 'middle';
      compensation = Math.round(
        ventoBands2026.middle.min +
          ((score - 60) / 60) *
            (ventoBands2026.middle.max - ventoBands2026.middle.min)
      );
    } else {
      selectedBand = 'lower';
      compensation = Math.round(
        ventoBands2026.lower.min +
          (score / 60) *
            (ventoBands2026.lower.max - ventoBands2026.lower.min)
      );
    }

    setBand(selectedBand);
    setEstimate(compensation);
    setBreakdown({
      incidentScore: incidentCount,
      evidenceScore,
      traumaScore: traumaFactor,
      medicalBonus: medicalEvidence ? 30 : 0,
      totalScore: score,
    });
  }, [timelineEvents, evidenceCount, traumaScore, medicalEvidence]);

  const bandData = ventoBands2026[band];
  const percentComplete = ((estimate - bandData.min) / (bandData.max - bandData.min)) * 100;

  return (
    <div
      style={{
        background: '#F8F1E9',
        padding: '20px',
        borderRadius: '15px',
        border: `2px solid ${bandData.color}`,
        marginTop: '20px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ color: '#0F2C4A', margin: 0, fontSize: '18px' }}>
          ⚖️ Vento Estimator (2026)
        </h3>
        <span
          style={{
            background: bandData.color,
            color: '#fff',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
          }}
        >
          {bandData.name}
        </span>
      </div>

      <p style={{ fontSize: '14px', color: '#64748B', margin: '8px 0 15px 0' }}>
        {bandData.description}
      </p>

      {/* Visual Gauge */}
      <div style={{ marginBottom: '20px' }}>
        <div
          style={{
            height: '16px',
            background: '#EDE4D9',
            borderRadius: '12px',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Gradient fill */}
          <div
            style={{
              height: '100%',
              width: `${Math.max(5, percentComplete)}%`,
              background: `linear-gradient(90deg, #5DB7AD, #2A4D69, #D4AF37)`,
              transition: 'width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
              borderRadius: '12px',
            }}
          />
        </div>

        {/* Gauge Labels */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: '#64748B',
            marginTop: '6px',
          }}
        >
          <span>£{ventoBands2026.lower.min.toLocaleString()}</span>
          <span>£{ventoBands2026.middle.min.toLocaleString()}</span>
          <span>£{ventoBands2026.upper.max.toLocaleString()}</span>
        </div>
      </div>

      {/* Estimate Display */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 5px 0' }}>
          Estimated Injury to Feelings:
        </p>
        <h2 style={{ color: bandData.color, margin: '0 0 5px 0', fontSize: '32px', fontWeight: 'bold' }}>
          £{estimate.toLocaleString()}
        </h2>
        <p style={{ fontSize: '11px', color: '#64748B', margin: 0 }}>
          within {bandData.name.toLowerCase()} (£{bandData.min.toLocaleString()}–£{bandData.max.toLocaleString()})
        </p>
      </div>

      {/* Breakdown (Expandable) */}
      <details
        style={{
          background: '#fff',
          padding: '12px',
          borderRadius: '8px',
          border: `1px solid ${bandData.color}`,
          marginBottom: '15px',
          cursor: 'pointer',
        }}
      >
        <summary style={{ fontWeight: '600', color: '#0F2C4A', userSelect: 'none' }}>
          📊 Score Breakdown
        </summary>
        <div style={{ marginTop: '10px', fontSize: '13px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span>Timeline events:</span>
            <span style={{ color: bandData.color, fontWeight: '600' }}>+{breakdown.incidentScore}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span>Evidence pieces:</span>
            <span style={{ color: bandData.color, fontWeight: '600' }}>+{breakdown.evidenceScore}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span>Trauma impact (1-10):</span>
            <span style={{ color: bandData.color, fontWeight: '600' }}>+{breakdown.traumaScore}</span>
          </div>
          {medicalEvidence && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span>Medical evidence bonus:</span>
              <span style={{ color: bandData.color, fontWeight: '600' }}>+{breakdown.medicalBonus}</span>
            </div>
          )}
          <hr style={{ margin: '10px 0', border: 'none', borderTop: `1px solid ${bandData.color}` }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700' }}>
            <span>Total Score:</span>
            <span style={{ color: bandData.color }}>{breakdown.totalScore}</span>
          </div>
        </div>
      </details>

      {/* Forensic Tip / Call to Action */}
      <div
        style={{
          background: '#FAF6F0',
          padding: '12px',
          borderRadius: '8px',
          borderLeft: `4px solid ${bandData.color}`,
          marginBottom: '15px',
        }}
      >
        <p style={{ fontSize: '13px', margin: 0, color: '#0F2C4A' }}>
          💡 <strong>Evidence Impact:</strong>{' '}
          {evidenceCount < 5
            ? 'Adding 3–5 more pieces of objective evidence (emails, CCTV, witness statements) could move your case toward the next band, increasing your potential award by £5,000–£10,000+.'
            : evidenceCount < 15
            ? 'Your evidence volume is strong. Focus now on linking these items to psychological impact (medical records, loss of earnings calculations).'
            : 'Excel lent evidence base. Consider strengthening aggravated damages narrative (employer\'s knowledge, deliberate conduct).'}
        </p>
      </div>

      {/* Premium Feature Teaser */}
      {!isPremium && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(212,175,55,0.1), rgba(212,175,55,0.05))',
            padding: '12px',
            borderRadius: '8px',
            border: `1px solid ${bandData.color}`,
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '12px', color: '#0F2C4A', margin: '0 0 8px 0' }}>
            🔒 Premium users unlock:
          </p>
          <ul
            style={{
              fontSize: '12px',
              color: '#64748B',
              margin: 0,
              paddingLeft: '20px',
            }}
          >
            <li>Case law citations matching your exact Vento band</li>
            <li>3 tribunal cases with similar outcomes</li>
            <li>Aggravated damages assessment</li>
            <li>Settlement offer analysis</li>
          </ul>
          <button
            style={{
              marginTop: '10px',
              background: '#D4AF37',
              color: '#0F2C4A',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => (e.target.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
            onClick={() => window.location.href = '/pricing'}
          >
            Unlock Premium ✨
          </button>
        </div>
      )}
    </div>
  );
};

export default VentoEstimator;
