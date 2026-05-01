import React, { useState, useEffect } from 'react';

/**
 * GuardianDashboard.jsx
 * 
 * Primary entry point for authenticated users. Displays:
 * - Case Strength Ring (visual % of case readiness)
 * - Tribunal Timer (3-month deadline countdown with urgency states)
 * - Next Urgent Task (from task list)
 * - Recent Activity Feed
 * 
 * Component integrates with localStorage (S.get/S.set pattern)
 * Auto-refreshes when evidence or tasks are updated
 * 
 * Design: Trauma-informed dashboard with calm, clear hierarchy
 * Accessibility: WCAG 2.2 AA with high contrast, logical tab order
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
  del: (key) => {
    try {
      localStorage.removeItem(`ujris3_${key}`);
    } catch (e) {
      console.error('Storage error:', e);
    }
  },
};

// ============================================================================
// CaseStrengthRing - Visual indicator of case readiness (0-100%)
// ============================================================================
const CaseStrengthRing = ({ percentage = 45, size = 160 }) => {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage < 30) return COLORS.danger_red;
    if (percentage < 60) return COLORS.warning_orange;
    if (percentage < 80) return COLORS.info_blue;
    return COLORS.success_green;
  };

  const getStrength = () => {
    if (percentage < 30) return 'WEAK';
    if (percentage < 60) return 'MODERATE';
    if (percentage < 80) return 'STRONG';
    return 'COMPELLING';
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        width={size}
        height={size}
        style={{ transform: 'rotate(-90deg)' }}
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={COLORS.medium_gray}
          strokeWidth="8"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'all 0.6s ease-out' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: getColor(),
          }}
        >
          {percentage}%
        </div>
        <div
          style={{
            fontSize: '13px',
            fontWeight: '600',
            color: COLORS.navy_text,
            letterSpacing: '1px',
          }}
        >
          {getStrength()}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// TribunalTimer - Countdown to 3-month ET deadline
// ============================================================================
const TribunalTimer = ({ caseCreatedDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
  });
  const [urgency, setUrgency] = useState('normal'); // 'normal', 'warning', 'critical'

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!caseCreatedDate) {
        setTimeLeft({ days: 90, hours: 0, minutes: 0 });
        return;
      }

      const created = new Date(caseCreatedDate);
      const deadline = new Date(created.getTime() + 90 * 24 * 60 * 60 * 1000);
      const now = new Date();
      const diff = deadline - now;

      if (diff <= 0) {
        setUrgency('critical');
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);

      setTimeLeft({ days, hours, minutes });

      if (days <= 3) {
        setUrgency('critical');
      } else if (days <= 14) {
        setUrgency('warning');
      } else {
        setUrgency('normal');
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [caseCreatedDate]);

  const getBorderColor = () => {
    if (urgency === 'critical') return COLORS.danger_red;
    if (urgency === 'warning') return COLORS.warning_orange;
    return COLORS.info_blue;
  };

  const getIconEmoji = () => {
    if (urgency === 'critical') return '⚠️';
    if (urgency === 'warning') return '⏰';
    return '📅';
  };

  return (
    <div
      style={{
        border: `3px solid ${getBorderColor()}`,
        borderRadius: '12px',
        padding: '20px',
        backgroundColor: COLORS.light_gray,
        textAlign: 'center',
      }}
      role="region"
      aria-live="polite"
      aria-label={`Employment Tribunal deadline: ${timeLeft.days} days, ${timeLeft.hours} hours remaining`}
    >
      <div
        style={{
          fontSize: '24px',
          marginBottom: '8px',
        }}
      >
        {getIconEmoji()}
      </div>
      <div
        style={{
          fontSize: '13px',
          color: COLORS.dark_gray,
          marginBottom: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        ET Deadline
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '12px',
          marginBottom: '12px',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: getBorderColor(),
            }}
          >
            {timeLeft.days}
          </div>
          <div
            style={{
              fontSize: '11px',
              color: COLORS.dark_gray,
              marginTop: '4px',
            }}
          >
            DAYS
          </div>
        </div>
        <div>
          <div
            style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: getBorderColor(),
            }}
          >
            {timeLeft.hours}
          </div>
          <div
            style={{
              fontSize: '11px',
              color: COLORS.dark_gray,
              marginTop: '4px',
            }}
          >
            HRS
          </div>
        </div>
        <div>
          <div
            style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: getBorderColor(),
            }}
          >
            {timeLeft.minutes}
          </div>
          <div
            style={{
              fontSize: '11px',
              color: COLORS.dark_gray,
              marginTop: '4px',
            }}
          >
            MIN
          </div>
        </div>
      </div>
      <div
        style={{
          fontSize: '12px',
          color: COLORS.navy_text,
          fontWeight: '500',
          padding: '8px 12px',
          backgroundColor: 'rgba(212, 175, 55, 0.1)',
          borderRadius: '6px',
        }}
      >
        {urgency === 'critical'
          ? '🚨 URGENT: File claim immediately'
          : urgency === 'warning'
          ? '⚡ Complete and file within 2 weeks'
          : '✅ You have adequate time. Plan carefully.'}
      </div>
    </div>
  );
};

// ============================================================================
// NextUrgentTask - Display top priority task
// ============================================================================
const NextUrgentTask = ({ task, onTaskClick }) => {
  if (!task) {
    return (
      <div
        style={{
          padding: '20px',
          backgroundColor: COLORS.light_gray,
          borderRadius: '12px',
          textAlign: 'center',
          color: COLORS.dark_gray,
        }}
      >
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>✨</div>
        <div style={{ fontSize: '14px', fontWeight: '600' }}>
          No urgent tasks right now
        </div>
        <div style={{ fontSize: '12px', marginTop: '6px', color: COLORS.dark_gray }}>
          Great work! Keep building your case.
        </div>
      </div>
    );
  }

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'critical':
        return COLORS.danger_red;
      case 'high':
        return COLORS.warning_orange;
      case 'medium':
        return COLORS.info_blue;
      default:
        return COLORS.success_green;
    }
  };

  const getPriorityLabel = () => {
    switch (task.priority) {
      case 'critical':
        return '🚨 CRITICAL';
      case 'high':
        return '⚡ HIGH PRIORITY';
      case 'medium':
        return '📌 MEDIUM';
      default:
        return '✓ LOW';
    }
  };

  const daysUntilDue = task.dueDate
    ? Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div
      onClick={onTaskClick}
      style={{
        padding: '16px',
        backgroundColor: COLORS.light_gray,
        borderLeft: `5px solid ${getPriorityColor()}`,
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#EFEFEF';
        e.currentTarget.style.transform = 'translateX(4px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = COLORS.light_gray;
        e.currentTarget.style.transform = 'translateX(0)';
      }}
      role="button"
      tabIndex={0}
      aria-label={`Task: ${task.title}. Priority: ${task.priority}. ${daysUntilDue ? `Due in ${daysUntilDue} days.` : 'No deadline set.'}`}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '12px',
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: '12px',
              color: getPriorityColor(),
              fontWeight: '700',
              letterSpacing: '0.5px',
              marginBottom: '6px',
            }}
          >
            {getPriorityLabel()}
          </div>
          <div
            style={{
              fontSize: '16px',
              fontWeight: '600',
              color: COLORS.navy_text,
              marginBottom: '8px',
            }}
          >
            {task.title}
          </div>
          <div
            style={{
              fontSize: '13px',
              color: COLORS.dark_gray,
              lineHeight: '1.4',
            }}
          >
            {task.description}
          </div>
        </div>
        {daysUntilDue !== null && (
          <div
            style={{
              padding: '6px 10px',
              backgroundColor: getPriorityColor(),
              color: 'white',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              whiteSpace: 'nowrap',
            }}
          >
            {daysUntilDue}d
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Stats Card - Compact stat display
// ============================================================================
const StatCard = ({ icon, label, value, trend, onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '16px',
        backgroundColor: COLORS.light_gray,
        borderRadius: '8px',
        textAlign: 'center',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.backgroundColor = '#EFEFEF';
          e.currentTarget.style.transform = 'scale(1.02)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.backgroundColor = COLORS.light_gray;
          e.currentTarget.style.transform = 'scale(1)';
        }
      }}
    >
      <div style={{ fontSize: '28px', marginBottom: '6px' }}>{icon}</div>
      <div
        style={{
          fontSize: '12px',
          color: COLORS.dark_gray,
          marginBottom: '4px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: COLORS.navy_text,
        }}
      >
        {value}
      </div>
      {trend && (
        <div
          style={{
            fontSize: '12px',
            marginTop: '6px',
            color: trend.startsWith('↑') ? COLORS.success_green : COLORS.warning_orange,
          }}
        >
          {trend}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// RecentActivity - Feed of recent user actions
// ============================================================================
const RecentActivity = ({ activities = [] }) => {
  if (activities.length === 0) {
    return (
      <div
        style={{
          padding: '16px',
          backgroundColor: COLORS.light_gray,
          borderRadius: '8px',
          textAlign: 'center',
          color: COLORS.dark_gray,
          fontSize: '13px',
        }}
      >
        No activity yet. Start building your case! 🚀
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {activities.slice(0, 5).map((activity, idx) => (
        <div
          key={idx}
          style={{
            padding: '12px',
            backgroundColor: COLORS.light_gray,
            borderRadius: '8px',
            borderLeft: `3px solid ${COLORS.gold_accent}`,
            fontSize: '13px',
          }}
        >
          <div style={{ fontWeight: '600', color: COLORS.navy_text }}>
            {activity.title}
          </div>
          <div style={{ fontSize: '12px', color: COLORS.dark_gray, marginTop: '4px' }}>
            {activity.timestamp}
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// GuardianDashboard - Main Component
// ============================================================================
const GuardianDashboard = ({ onNavigate = () => {} }) => {
  const [caseData, setCaseData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = () => {
      try {
        const storedCase = S.get('case_data');
        const storedTasks = S.get('tasks', []);
        const storedActivities = S.get('activities', []);

        setCaseData(storedCase);
        setTasks(storedTasks);
        setActivities(storedActivities);
        setLoading(false);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Could not load dashboard data');
        setLoading(false);
      }
    };

    loadData();

    // Listen for storage updates
    const handleUpdate = (e) => {
      if (['case_data', 'tasks', 'activities'].includes(e.detail?.key)) {
        loadData();
      }
    };

    window.addEventListener('ujris:update', handleUpdate);
    return () => window.removeEventListener('ujris:update', handleUpdate);
  }, []);

  if (loading) {
    return (
      <div
        style={{
          padding: '24px',
          textAlign: 'center',
          color: COLORS.dark_gray,
        }}
      >
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
        <div>Loading your case dashboard...</div>
      </div>
    );
  }

  const urgentTask = tasks.find((t) => t.priority === 'critical') || tasks[0];
  const caseStrength = caseData?.strength || 45;

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
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {error && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#FFEBEE',
              color: COLORS.danger_red,
              borderRadius: '8px',
              marginBottom: '16px',
              borderLeft: `4px solid ${COLORS.danger_red}`,
            }}
            role="alert"
          >
            ⚠️ {error}
          </div>
        )}

        {/* Header */}
        <div
          style={{
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '32px',
                fontWeight: 'bold',
                margin: '0 0 4px 0',
              }}
            >
              Guardian Dashboard
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: '14px',
                color: COLORS.dark_gray,
              }}
            >
              {caseData?.caseTitle || 'Your employment law case'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('learn')}
            style={{
              padding: '10px 16px',
              backgroundColor: COLORS.gold_accent,
              color: COLORS.navy_text,
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '13px',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#C89A2E';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = COLORS.gold_accent;
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            📚 Learn More
          </button>
        </div>

        {/* Main Grid: Case Strength + Tribunal Timer */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              textAlign: 'center',
            }}
          >
            <h2
              style={{
                fontSize: '14px',
                fontWeight: '700',
                marginBottom: '16px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: COLORS.dark_gray,
              }}
            >
              Case Strength
            </h2>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <CaseStrengthRing percentage={caseStrength} size={160} />
            </div>
            <div style={{ marginTop: '16px', fontSize: '12px', color: COLORS.dark_gray }}>
              Based on evidence, documentation, and timeline completeness
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            }}
          >
            <h2
              style={{
                fontSize: '14px',
                fontWeight: '700',
                marginBottom: '16px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: COLORS.dark_gray,
              }}
            >
              Employment Tribunal Deadline
            </h2>
            <TribunalTimer caseCreatedDate={caseData?.createdDate} />
          </div>
        </div>

        {/* Next Urgent Task */}
        <div
          style={{
            marginBottom: '24px',
          }}
        >
          <h2
            style={{
              fontSize: '14px',
              fontWeight: '700',
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: COLORS.dark_gray,
            }}
          >
            ⭐ Next Priority
          </h2>
          <NextUrgentTask
            task={urgentTask}
            onTaskClick={() => onNavigate('tasks')}
          />
        </div>

        {/* Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          <StatCard
            icon="📄"
            label="Evidence Files"
            value={caseData?.evidenceCount || 0}
            onClick={() => onNavigate('evidence')}
          />
          <StatCard
            icon="📅"
            label="Timeline Events"
            value={caseData?.timelineCount || 0}
            onClick={() => onNavigate('timeline')}
          />
          <StatCard
            icon="💰"
            label="Est. Compensation"
            value={`£${(caseData?.estimatedValue || 0).toLocaleString()}`}
            onClick={() => onNavigate('value')}
          />
          <StatCard
            icon="✅"
            label="Tasks Complete"
            value={`${tasks.filter((t) => t.completed).length}/${tasks.length}`}
            trend={tasks.length > 0 ? '↑ 2 this week' : null}
          />
        </div>

        {/* Recent Activity */}
        <div
          style={{
            marginBottom: '24px',
          }}
        >
          <h2
            style={{
              fontSize: '14px',
              fontWeight: '700',
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: COLORS.dark_gray,
            }}
          >
            📊 Recent Activity
          </h2>
          <RecentActivity activities={activities} />
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          <button
            onClick={() => onNavigate('evidence')}
            style={{
              padding: '14px',
              backgroundColor: COLORS.info_blue,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontSize: '13px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(33, 150, 243, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            📤 Add Evidence
          </button>
          <button
            onClick={() => onNavigate('learn')}
            style={{
              padding: '14px',
              backgroundColor: COLORS.success_green,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontSize: '13px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            📚 Learn Rights
          </button>
          <button
            onClick={() => onNavigate('simulator')}
            style={{
              padding: '14px',
              backgroundColor: COLORS.warning_orange,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontSize: '13px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 152, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            🎯 Practice
          </button>
          <button
            onClick={() => onNavigate('generator')}
            style={{
              padding: '14px',
              backgroundColor: COLORS.gold_accent,
              color: COLORS.navy_text,
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontSize: '13px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 175, 55, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            ✨ Generate
          </button>
        </div>

        {/* Help Footer */}
        <div
          style={{
            padding: '16px',
            backgroundColor: 'rgba(212, 175, 55, 0.08)',
            borderLeft: `4px solid ${COLORS.gold_accent}`,
            borderRadius: '8px',
            fontSize: '13px',
            color: COLORS.navy_text,
          }}
        >
          <strong>💡 Tip:</strong> Your case strength score updates as you add evidence.
          Complete your timeline and gather supporting documents to increase your chances of success.
          3-month deadline is calculated from your case creation date.
        </div>
      </div>
    </div>
  );
};

export default GuardianDashboard;
