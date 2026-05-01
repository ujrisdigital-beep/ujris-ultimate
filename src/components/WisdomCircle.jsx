import React, { useState, useEffect } from 'react';

/**
 * WisdomCircle.jsx
 *
 * Community learning platform: Users share lessons from their cases
 * Crowdsourced knowledge from real tribunal experience
 *
 * Features:
 * - Browse anonymized case lessons from other users
 * - Post your own "What I Learned" after case resolution
 * - Rate helpfulness of lessons (like system)
 * - Filter by discrimination type, sector, outcome
 * - Premium: Ask questions in Q&A section (1:1 coaching with winners)
 *
 * Content Examples:
 * - "The email I thought was small turned out to be the smoking gun. Here's why..."
 * - "6 things I wish I'd done earlier in my tribunal prep"
 * - "Settlement negotiation strategy that doubled my offer"
 * - "How to handle aggressive employer tactics in conciliation"
 *
 * Premium: Sovereign tier (access Q&A), Advocate tier (priority coaching)
 *
 * This drives massive engagement: Users stay to read case wisdom, not just
 * generate their own. Creates stickiness. Builds trust.
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
// Mock Wisdom Posts (Pre-loaded)
// ============================================================================

const MOCK_POSTS = [
  {
    id: 'post_001',
    author: 'User from London',
    discType: 'Race',
    sector: 'Finance',
    outcome: 'Won',
    award: 42300,
    title: 'Email Evidence is Everything',
    content:
      'I had 200+ emails. Most seemed unimportant. But one email where my manager said "his promotion shows our commitment to diversity" about another colleague, whilst rejecting my promotion "due to poor timing," destroyed their credibility. The tribunal called it an Anchor Lie. Single email won the case. Don\'t underestimate email threads.',
    helpfulness: 342,
    category: 'Evidence Strategy',
    isPremium: false,
  },
  {
    id: 'post_002',
    author: 'User from Manchester',
    discType: 'Sex',
    sector: 'Healthcare',
    outcome: 'Won',
    award: 56700,
    title: '6 Things I Wish I\'d Done Sooner',
    content: `1. **Get medical evidence immediately.** Don't wait until tribunal. My GP report added £5,000 to award.

2. **Track everything in real time.** Don't rely on memory 6 months later. I kept a notebook.

3. **Send formal complaints to HR.** Yes, they ignore them. But creates paper trail. Tribunal sees it.

4. **Get witness statements in writing.** Verbal promises evaporate. Written statements are gold.

5. **Understand Vento bands early.** Knowing I was in "Upper band" (£36k-£60k range) motivated me to gather more evidence. Aim high.

6. **Get a union rep or solicitor.** Free ACAS conciliation is OK, but having someone in your corner who knows tribunal procedure = confidence boost. Worth every penny.`,
    helpfulness: 567,
    category: 'Case Preparation',
    isPremium: false,
  },
  {
    id: 'post_003',
    author: 'User from Birmingham',
    discType: 'Disability',
    sector: 'Retail',
    outcome: 'Won',
    award: 19200,
    title: 'The Power of Occupational Health Reports',
    content:
      'My employer insisted I didn\'t need adjustments. But I got an occupational health report (they had to pay for it). Report said: "Adjustments recommended: flexible break times, access to private space, reduced shift hours." My employer KNEW I needed adjustments. They refused anyway. That report was worth £6,000 in damages. Occupational health reports are your protection.',
    helpfulness: 213,
    category: 'Medical Evidence',
    isPremium: false,
  },
  {
    id: 'post_004',
    author: 'User from Glasgow',
    discType: 'Unfair Dismissal',
    sector: 'Tech',
    outcome: 'Settled',
    award: 8500,
    title: 'Settlement Negotiation: When to Walk Away',
    content:
      'Initial offer was £3,000. I knew tribunal judgment would be £12,000+. I said no. ACAS conciliator came back with £7,000. Still low. I said: "Show me tribunal costs. Show me how this case looks." Suddenly employer offered £8,500. The key is: don\'t accept first offer. They EXPECT negotiation. Employer was clearly willing to pay.',
    helpfulness: 289,
    category: 'Settlement Strategy',
    isPremium: false,
  },
];

// ============================================================================
// Wisdom Post Card
// ============================================================================

const PostCard = ({ post, onLike }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.helpfulness);

  const handleLike = () => {
    if (!liked) {
      setLiked(true);
      setLikeCount(likeCount + 1);
      onLike?.(post.id);
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        border: `1px solid ${COLORS.light_gray}`,
      }}
    >
      {/* Meta */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '12px',
        }}
      >
        <div>
          <div style={{ fontSize: '12px', color: COLORS.dark_gray }}>
            {post.author} • {post.discType} in {post.sector}
          </div>
          <div
            style={{
              fontSize: '10px',
              color: COLORS.dark_gray,
              marginTop: '2px',
            }}
          >
            {post.outcome.toUpperCase()} • £{post.award.toLocaleString()}
          </div>
        </div>
        <div
          style={{
            backgroundColor:
              post.outcome === 'Won'
                ? COLORS.success_green
                : COLORS.warning_orange,
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: '700',
          }}
        >
          {post.outcome === 'Won' ? '✓ Won' : '🤝 Settled'}
        </div>
      </div>

      {/* Title */}
      <h3
        style={{
          fontSize: '16px',
          fontWeight: '700',
          color: COLORS.navy_text,
          margin: '0 0 8px 0',
        }}
      >
        {post.title}
      </h3>

      {/* Content */}
      <p
        style={{
          fontSize: '13px',
          color: COLORS.dark_gray,
          lineHeight: '1.6',
          margin: '0 0 12px 0',
          whiteSpace: 'pre-line',
        }}
      >
        {post.content.substring(0, 200)}...
      </p>

      {/* Category */}
      <div
        style={{
          display: 'inline-block',
          backgroundColor: COLORS.light_gray,
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: '600',
          marginBottom: '12px',
          color: COLORS.navy_text,
        }}
      >
        📚 {post.category}
      </div>

      {/* Engagement */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '12px',
          borderTop: `1px solid ${COLORS.light_gray}`,
        }}
      >
        <button
          onClick={handleLike}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            backgroundColor: liked ? COLORS.success_green : COLORS.light_gray,
            color: liked ? 'white' : COLORS.navy_text,
            border: 'none',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          {liked ? '♥' : '♡'} Helpful ({likeCount})
        </button>
        <button
          style={{
            padding: '6px 12px',
            backgroundColor: COLORS.light_gray,
            color: COLORS.navy_text,
            border: 'none',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Share
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

const WisdomCircle = ({ onUpgrade = () => {} }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [posts, setPosts] = useState(MOCK_POSTS);
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

  const filteredPosts =
    selectedFilter === 'all'
      ? posts
      : posts.filter((p) => p.discType === selectedFilter);

  const discTypes = ['All', ...new Set(posts.map((p) => p.discType))];

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
            🧘 Wisdom Circle
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: '13px',
              color: COLORS.dark_gray,
            }}
          >
            Learn from real tribunal experiences. Real cases. Real lessons.
          </p>
        </div>

        {/* Info Callout */}
        <div
          style={{
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            borderLeft: `4px solid ${COLORS.success_green}`,
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
          }}
        >
          <h3
            style={{
              fontSize: '13px',
              fontWeight: '700',
              color: COLORS.navy_text,
              margin: '0 0 6px 0',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            💡 Real Lessons from Real Cases
          </h3>
          <p
            style={{
              fontSize: '12px',
              color: COLORS.navy_text,
              margin: 0,
              lineHeight: '1.5',
            }}
          >
            Users who've won tribunal cases share what worked. Skip the mistakes. Learn the
            patterns. This is crowdsourced tribunal wisdom.
          </p>
        </div>

        {/* Filter Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '20px',
            overflowX: 'auto',
            paddingBottom: '8px',
          }}
        >
          {discTypes.map((type) => (
            <button
              key={type}
              onClick={() =>
                setSelectedFilter(type === 'All' ? 'all' : type)
              }
              style={{
                padding: '8px 16px',
                backgroundColor:
                  (type === 'All' && selectedFilter === 'all') ||
                  selectedFilter === type
                    ? COLORS.gold_accent
                    : COLORS.light_gray,
                color:
                  (type === 'All' && selectedFilter === 'all') ||
                  selectedFilter === type
                    ? COLORS.navy_text
                    : COLORS.dark_gray,
                border: 'none',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Posts */}
        {filteredPosts.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 20px',
              backgroundColor: 'white',
              borderRadius: '12px',
              color: COLORS.dark_gray,
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📭</div>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>
              No posts yet in this category
            </div>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={(postId) => {
                // In production: save to DB
              }}
            />
          ))
        )}

        {/* CTA for Premium Features */}
        {!isPremium && (
          <div
            style={{
              marginTop: '40px',
              padding: '24px',
              backgroundColor: COLORS.light_gold,
              borderRadius: '12px',
              textAlign: 'center',
            }}
          >
            <h2
              style={{
                fontSize: '16px',
                fontWeight: '700',
                marginBottom: '8px',
                color: COLORS.navy_text,
              }}
            >
              ✨ Ask the Winners
            </h2>
            <p
              style={{
                fontSize: '13px',
                color: COLORS.dark_gray,
                marginBottom: '16px',
                lineHeight: '1.5',
              }}
            >
              Got a specific question? Users who've WON tribunal cases will answer
              (premium feature).
            </p>
            <button
              onClick={() => onUpgrade()}
              style={{
                padding: '12px 24px',
                backgroundColor: COLORS.gold_accent,
                color: COLORS.navy_text,
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              Unlock Q&A – From £19.99/mo
            </button>
          </div>
        )}

        {/* Premium Q&A Section */}
        {isPremium && (
          <div
            style={{
              marginTop: '40px',
              padding: '20px',
              backgroundColor: 'white',
              borderRadius: '12px',
              borderLeft: `4px solid ${COLORS.gold_accent}`,
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
              💬 Ask the Winners [Premium]
            </h2>
            <textarea
              placeholder="What would you like to ask someone who's already won a tribunal case?"
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '10px',
                border: `1px solid ${COLORS.medium_gray}`,
                borderRadius: '6px',
                fontSize: '12px',
                marginBottom: '12px',
                boxSizing: 'border-box',
              }}
            />
            <button
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: COLORS.info_blue,
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Post Question
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WisdomCircle;
