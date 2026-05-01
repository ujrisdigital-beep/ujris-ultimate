import React, { useState, useEffect } from 'react';

/**
 * ProgressStreaks.jsx
 *
 * Daily engagement gamification
 * Tracks consecutive days user opens the app
 * Displays current streak + daily check-in
 * Unlocks milestone rewards (badges, confidence boosts)
 *
 * Features:
 * - Daily streak counter (maintains across days)
 * - Milestone celebrations (3, 7, 14, 30 days)
 * - "Check in today" daily task
 * - Streak-based achievement badges
 * - Motivation copy that changes based on streak length
 * - Breaks if user misses a day
 *
 * Free tier: Basic streak tracking
 * Paid tiers: Additional milestone rewards & backup streaks (can miss 1 day)
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
// Milestone Definitions
// ============================================================================

const MILESTONES = [
  {
    days: 3,
    name: 'First Habit',
    emoji: '🌱',
    reward: 'You\'ve started the legal journey. Consistency matters.',
    message: '3-day momentum unlocked! Small daily actions compound.',
  },
  {
    days: 7,
    name: 'Warrior\'s Week',
    emoji: '⚔️',
    reward: 'One full week of evidence gathering. You\'re serious about this.',
    message: '7 days! Most people quit here. Not you.',
  },
  {
    days: 14,
    name: 'Fortnight Fighter',
    emoji: '💪',
    reward: 'Two weeks. Your case is getting stronger every day.',
    message: '14 days! Your evidence vault is growing. Momentum building.',
  },
  {
    days: 30,
    name: 'Month Master',
    emoji: '👑',
    reward: 'One full month of dedicated case building. This is serious.',
    message: '30 DAYS! You\'re in the 5% of users who reach this. Your case will WIN.',
  },
  {
    days: 60,
    name: 'Tribunal Titan',
    emoji: '🏛️',
    reward: 'Two months. You\'re unstoppable. Tribunal will see that.',
    message: '60 DAYS! Tribunal team can feel your preparation from miles away.',
  },
  {
    days: 90,
    name: '3-Month Legend',
    emoji: '⭐',
    reward: 'Three months of daily case preparation. This is championship level.',
    message: '90 DAYS! You\'ve built an airtight case. Settlement offers coming.',
  },
];

// ============================================================================
// Streak Management Logic
// ============================================================================

const initializeStreak = () => {
  const today = new Date().toDateString();
  const streak = S.get('streak', { current: 0, longest: 0, lastCheckin: null });

  // Check if user checked in today
  if (streak.lastCheckin === today) {
    return streak; // Already checked in today
  }

  const lastCheckinDate = streak.lastCheckin ? new Date(streak.lastCheckin) : null;
  const todayDate = new Date(today);

  if (lastCheckinDate) {
    const daysSinceLastCheckin = Math.floor(
      (todayDate - lastCheckinDate) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastCheckin === 1) {
      // Consecutive day! Continue streak
      streak.current += 1;
    } else if (daysSinceLastCheckin > 1) {
      // Streak broken!
      if (streak.current > streak.longest) {
        streak.longest = streak.current;
      }
      streak.current = 1; // Start new streak
    }
  } else {
    // First time
    streak.current = 1;
  }

  streak.lastCheckin = today;

  // Update longest if needed
  if (streak.current > streak.longest) {
    streak.longest = streak.current;
  }

  S.set('streak', streak);
  return streak;
};

// ============================================================================
// Milestone Grid
// ============================================================================

const MilestoneGrid = ({ currentDays, unlockedMilestones }) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '12px',
        marginBottom: '24px',
      }}
    >
      {MILESTONES.map((milestone, idx) => {
        const isUnlocked = unlockedMilestones.includes(milestone.days);
        const isNext = currentDays < milestone.days;

        return (
          <div
            key={milestone.days}
            style={{
              padding: '16px',
              backgroundColor: isUnlocked ? COLORS.light_gold : COLORS.light_gray,
              borderRadius: '12px',
              textAlign: 'center',
              border: isUnlocked ? `2px solid ${COLORS.gold_accent}` : 'none',
              opacity: isNext ? 0.6 : 1,
              transition: 'all 0.3s ease',
              cursor: isUnlocked ? 'pointer' : 'default',
            }}
            onMouseEnter={(e) => {
              if (isUnlocked) {
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (isUnlocked) {
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '6px' }}>
              {milestone.emoji}
            </div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: '700',
                color: COLORS.navy_text,
                marginBottom: '4px',
                textTransform: 'uppercase',
              }}
            >
              {milestone.days} Days
            </div>
            <div
              style={{
                fontSize: '10px',
                color: COLORS.dark_gray,
                fontWeight: '600',
              }}
            >
              {milestone.name}
            </div>
            {isUnlocked && (
              <div
                style={{
                  fontSize: '18px',
                  marginTop: '6px',
                }}
              >
                ✓
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ============================================================================
// Daily Checkin Widget
// ============================================================================

const DailyCheckIn = ({ streak, onCheckin }) => {
  const today = new Date().toDateString();
  const isCheckedInToday = streak.lastCheckin === today;

  const getMotivationalMessage = () => {
    if (streak.current >= 30) {
      return '👑 You\'re in an elite group. Most people give up. You didn\'t.';
    }
    if (streak.current >= 14) {
      return '💪 Week 2+ consistency. This is where winners are made.';
    }
    if (streak.current >= 7) {
      return '⚔️ One week down. The habit is forming.';
    }
    if (streak.current >= 3) {
      return '🌱 Three days in. You\'re building momentum.';
    }
    return '🎯 First day counts. Show up tomorrow too.';
  };

  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        border: `2px solid ${COLORS.gold_accent}`,
      }}
    >
      <h2
        style={{
          fontSize: '16px',
          fontWeight: '700',
          color: COLORS.navy_text,
          marginBottom: '16px',
        }}
      >
        ✨ Daily Check-In
      </h2>

      <div
        style={{
          textAlign: 'center',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            fontSize: '64px',
            fontWeight: '700',
            color: COLORS.gold_accent,
            marginBottom: '8px',
            lineHeight: 1,
          }}
        >
          {streak.current}
        </div>
        <div
          style={{
            fontSize: '14px',
            fontWeight: '600',
            color: COLORS.navy_text,
            marginBottom: '4px',
          }}
        >
          Day{streak.current !== 1 ? 's' : ''} in a Row
        </div>
        <div
          style={{
            fontSize: '12px',
            color: COLORS.dark_gray,
            marginBottom: '12px',
          }}
        >
          Longest streak: {streak.longest} days
        </div>

        {/* Streak indicator line */}
        <div
          style={{
            width: '100%',
            height: '6px',
            backgroundColor: COLORS.light_gray,
            borderRadius: '3px',
            overflow: 'hidden',
            marginBottom: '12px',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${Math.min((streak.current / 30) * 100, 100)}%`,
              backgroundColor: COLORS.gold_accent,
              transition: 'width 0.5s ease',
            }}
          />
        </div>

        {/* Motivational message */}
        <div
          style={{
            fontSize: '13px',
            color: COLORS.navy_text,
            fontWeight: '600',
            marginBottom: '12px',
          }}
        >
          {getMotivationalMessage()}
        </div>

        {/* Check-in button */}
        {isCheckedInToday ? (
          <div
            style={{
              padding: '12px 24px',
              backgroundColor: COLORS.success_green,
              color: 'white',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '700',
              display: 'inline-block',
            }}
          >
            ✓ Checked in today
          </div>
        ) : (
          <button
            onClick={onCheckin}
            style={{
              padding: '12px 28px',
              backgroundColor: COLORS.gold_accent,
              color: COLORS.navy_text,
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            📌 Check In Today
          </button>
        )}
      </div>

      {/* Break info */}
      {streak.current > 0 && (
        <div
          style={{
            fontSize: '11px',
            color: COLORS.warning_orange,
            textAlign: 'center',
            paddingTop: '12px',
            borderTop: `1px solid ${COLORS.light_gray}`,
          }}
        >
          Miss a day and your streak breaks. Show up tomorrow to keep it going.
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Recent Activity Feed
// ============================================================================

const ActivityFeed = ({ activities = [] }) => {
  const last7Days = activities
    .filter((a) => {
      const actDate = new Date(a.date || Date.now());
      const today = new Date();
      const daysDiff = (today - actDate) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    })
    .slice(0, 10);

  const getActivityIcon = (type) => {
    const icons = {
      evidence_added: '📄',
      timeline_updated: '📅',
      sar_sent: '📧',
      witness_statement: '🙋',
      medical_obtained: '🏥',
      case_created: '🎯',
    };
    return icons[type] || '✓';
  };

  return (
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
          color: COLORS.navy_text,
          marginBottom: '12px',
        }}
      >
        📊 Your Progress This Week
      </h2>

      {last7Days.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '20px',
            color: COLORS.dark_gray,
            fontSize: '12px',
          }}
        >
          No activity yet. Start uploading evidence to build your case.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '8px' }}>
          {last7Days.map((activity, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 0',
                borderBottom: idx < last7Days.length - 1 ? `1px solid ${COLORS.light_gray}` : 'none',
              }}
            >
              <div style={{ fontSize: '16px' }}>
                {getActivityIcon(activity.type)}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: COLORS.navy_text,
                  }}
                >
                  {activity.description}
                </div>
                <div
                  style={{
                    fontSize: '10px',
                    color: COLORS.dark_gray,
                  }}
                >
                  {new Date(activity.date || Date.now()).toLocaleDateString('en-GB', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

const ProgressStreaks = () => {
  const [streak, setStreak] = useState(null);
  const [unlockedMilestones, setUnlockedMilestones] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const streakData = initializeStreak();
    setStreak(streakData);

    const unlocked = MILESTONES.filter(
      (m) => m.days <= streakData.current
    ).map((m) => m.days);
    setUnlockedMilestones(unlocked);

    setMounted(true);
  }, []);

  if (!mounted || !streak) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  const handleCheckin = () => {
    const updated = initializeStreak();
    setStreak(updated);

    const unlocked = MILESTONES.filter(
      (m) => m.days <= updated.current
    ).map((m) => m.days);
    setUnlockedMilestones(unlocked);

    // Log activity
    const activities = S.get('activities', []);
    activities.push({
      type: 'checkin',
      description: `Daily check-in recorded (${updated.current} day streak)`,
      date: new Date().toISOString(),
    });
    S.set('activities', activities.slice(-50)); // Keep last 50
  };

  // Get next milestone
  const nextMilestone = MILESTONES.find((m) => m.days > streak.current);
  const nextMilestoneMessage = nextMilestone
    ? `${nextMilestone.days - streak.current} days to unlock: ${nextMilestone.emoji} ${nextMilestone.name}`
    : 'You\'ve unlocked all milestones!';

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
            🔥 Your Progress Streak
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: '13px',
              color: COLORS.dark_gray,
            }}
          >
            {nextMilestoneMessage}
          </p>
        </div>

        {/* Daily Check-In */}
        <DailyCheckIn streak={streak} onCheckin={handleCheckin} />

        {/* Milestones Grid */}
        <h2
          style={{
            fontSize: '16px',
            fontWeight: '700',
            marginBottom: '12px',
            color: COLORS.navy_text,
          }}
        >
          📈 Unlock Milestones
        </h2>
        <MilestoneGrid currentDays={streak.current} unlockedMilestones={unlockedMilestones} />

        {/* Recent Activity */}
        <ActivityFeed activities={S.get('activities', [])} />

        {/* Tips Box */}
        <div
          style={{
            marginTop: '24px',
            padding: '16px',
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            borderLeft: `4px solid ${COLORS.info_blue}`,
            borderRadius: '8px',
          }}
        >
          <h3
            style={{
              fontSize: '13px',
              fontWeight: '700',
              color: COLORS.navy_text,
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            💡 Daily Engagement Tips
          </h3>
          <ul
            style={{
              fontSize: '12px',
              color: COLORS.navy_text,
              lineHeight: '1.6',
              margin: 0,
              paddingLeft: '20px',
            }}
          >
            <li>Log in once per day to maintain your streak</li>
            <li>Upload one piece of evidence daily</li>
            <li>Review a learning module each day</li>
            <li>Update your timeline with recent events</li>
            <li>By day 30, your case will be substantially stronger</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProgressStreaks;
