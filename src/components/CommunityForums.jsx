import React, { useState, useEffect } from 'react';

const T = {
  navy: '#0D1B2A', navyMid: '#152438', navyLight: '#1E3A5F',
  gold: '#C9A84C', goldLight: 'rgba(201,168,76,0.15)',
  teal: '#0C7B7A', tealLight: 'rgba(12,123,122,0.15)',
  white: '#EEF2F7', muted: '#7A8FA6', border: 'rgba(255,255,255,0.08)',
  red: '#E53E3E', green: '#22C55E', purple: '#7B5EA7',
};

const SEED_POSTS = [
  { id: '1', feed: 'tips', author: 'SRL_Manchester', avatar: '⚖️', title: 'Bundle tip — number pages, not documents', body: 'Always number every individual PAGE not just documents. Tribunals refer to page numbers not document numbers. Use "Tab 1, Page 1" format.', ts: '2026-04-27T10:00:00Z', replies: [{ id: 'r1', author: 'Justice_Seeker', body: 'This saved me. Also put the index at the front.', ts: '2026-04-27T11:00:00Z' }], reactions: { '👍': 14, '🔥': 8 } },
  { id: '2', feed: 'success', author: 'WonMyCase2025', avatar: '🏆', title: 'ET1 accepted — upper Vento awarded after 18 months', body: 'Finally got my result. Constructive dismissal + race discrimination. Upper Vento band. £47,500. The SAR was the key — got the internal emails that proved the anchor lie.', ts: '2026-04-25T09:00:00Z', replies: [], reactions: { '🎉': 31, '💪': 22, '❤️': 18 } },
  { id: '3', feed: 'questions', author: 'NewClaimant_2026', avatar: '❓', title: 'Does the 3-month deadline pause during ACAS?', body: 'I submitted for ACAS EC on 15 March. My original act was 18 Jan. When does my clock restart after ACAS certificate?', ts: '2026-04-28T08:00:00Z', replies: [{ id: 'r2', author: 'LegalMind_UK', body: 'The clock pauses from the day you contact ACAS and resumes 1 month after the EC certificate is issued. So add that time to your original deadline.', ts: '2026-04-28T09:30:00Z' }], reactions: { '👍': 7 } },
  { id: '4', feed: 'support', author: 'Survivor_Healthcare', avatar: '💚', title: 'Just got my hearing date — terrified', body: 'Got the letter today. Hearing in 6 weeks. I\'m representing myself. Has anyone been through this? Any advice on staying calm?', ts: '2026-04-29T07:00:00Z', replies: [{ id: 'r3', author: 'SRL_Manchester', body: 'You\'ve got this. Focus on the facts, not the emotion. Write everything down in chronological order. Tribunals are more informal than courts.', ts: '2026-04-29T07:45:00Z' }], reactions: { '❤️': 19, '💪': 11 } },
];

const FEEDS = [
  { id: 'tips', label: '💡 Tips', color: T.teal },
  { id: 'success', label: '🏆 Success Stories', color: T.gold },
  { id: 'questions', label: '❓ Questions', color: T.purple },
  { id: 'support', label: '💚 Support', color: T.green },
];

const PRIVATE_GROUPS = [
  { id: 'race', icon: '✊', label: 'Race Discrimination', members: 847, color: T.red },
  { id: 'disability', icon: '♿', label: 'Disability Rights', members: 412, color: T.teal },
  { id: 'police', icon: '🚔', label: 'Police Misconduct', members: 234, color: T.purple },
  { id: 'family', icon: '👶', label: 'Family & Safeguarding', members: 318, color: T.gold },
];

const CRISIS = [
  { name: 'Samaritans', contact: '116 123', desc: '24/7 emotional support', icon: '📞', color: T.red },
  { name: 'SHOUT', contact: 'Text SHOUT to 85258', desc: 'Free 24/7 crisis text service', icon: '💬', color: T.purple },
  { name: 'Mind', contact: '0300 123 3393', desc: 'Mental health support', icon: '💚', color: T.green },
  { name: 'Citizens Advice', contact: '0800 144 8848', desc: 'Free legal & welfare advice', icon: '⚖️', color: T.teal },
];

function timeAgo(ts) {
  const diff = (Date.now() - new Date(ts)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function CommunityForums() {
  const [posts, setPosts] = useState(() => {
    const s = localStorage.getItem('ujris_posts');
    return s ? JSON.parse(s) : SEED_POSTS;
  });
  const [feed, setFeed] = useState('tips');
  const [tab, setTab] = useState('feeds');
  const [showNew, setShowNew] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', body: '', anon: false });
  const [replyText, setReplyText] = useState({});
  const [showReply, setShowReply] = useState({});

  useEffect(() => {
    localStorage.setItem('ujris_posts', JSON.stringify(posts));
  }, [posts]);

  function submitPost() {
    if (!newPost.title || !newPost.body) return;
    const post = {
      id: Date.now().toString(),
      feed,
      author: newPost.anon ? 'Anonymous' : 'You',
      avatar: '👤',
      title: newPost.title,
      body: newPost.body,
      ts: new Date().toISOString(),
      replies: [],
      reactions: {},
    };
    setPosts(prev => [post, ...prev]);
    setNewPost({ title: '', body: '', anon: false });
    setShowNew(false);
  }

  function submitReply(postId) {
    const text = replyText[postId];
    if (!text?.trim()) return;
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      return { ...p, replies: [...(p.replies || []), { id: Date.now().toString(), author: 'You', body: text, ts: new Date().toISOString() }] };
    }));
    setReplyText(prev => ({ ...prev, [postId]: '' }));
    setShowReply(prev => ({ ...prev, [postId]: false }));
  }

  function addReaction(postId, emoji) {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const reactions = { ...(p.reactions || {}) };
      reactions[emoji] = (reactions[emoji] || 0) + 1;
      return { ...p, reactions };
    }));
  }

  const filteredPosts = posts.filter(p => p.feed === feed);
  const currentFeed = FEEDS.find(f => f.id === feed);

  return (
    <div style={{ minHeight: '100vh', background: T.navy, color: T.white, fontFamily: "'Source Serif 4', Georgia, serif" }}>
      <div style={{ background: T.navyMid, borderBottom: `1px solid ${T.border}`, padding: '24px 32px' }}>
        <h1 style={{ margin: 0, fontSize: 24, fontFamily: "'Playfair Display', Georgia, serif", color: T.gold }}>👥 Community Forums</h1>
        <p style={{ margin: '4px 0 0', color: T.muted, fontSize: 13 }}>Connect with other self-represented claimants — tips, support, success stories</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          {['feeds', 'groups', 'crisis'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '7px 16px', borderRadius: 8, border: `1px solid ${tab === t ? T.gold : T.border}`,
              background: tab === t ? T.goldLight : 'transparent', color: tab === t ? T.gold : T.muted,
              cursor: 'pointer', fontSize: 13, fontWeight: tab === t ? 700 : 400,
            }}>{t === 'feeds' ? '💬 Discussion Feeds' : t === 'groups' ? '🔒 Private Groups' : '🆘 Crisis Support'}</button>
          ))}
        </div>
      </div>

      {tab === 'feeds' && (
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', minHeight: 'calc(100vh - 120px)' }}>
          {/* Feed Nav */}
          <div style={{ background: T.navyMid, borderRight: `1px solid ${T.border}`, padding: '16px 0' }}>
            {FEEDS.map(f => (
              <button key={f.id} onClick={() => setFeed(f.id)} style={{
                width: '100%', textAlign: 'left', background: feed === f.id ? `${f.color}22` : 'transparent',
                border: 'none', borderLeft: feed === f.id ? `3px solid ${f.color}` : '3px solid transparent',
                color: feed === f.id ? f.color : T.muted, padding: '10px 16px', cursor: 'pointer', fontSize: 13, transition: 'all 0.15s',
              }}>{f.label}</button>
            ))}
          </div>

          {/* Posts */}
          <div style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ color: currentFeed?.color, fontWeight: 700, fontSize: 16 }}>{currentFeed?.label}</div>
              <button onClick={() => setShowNew(true)} style={{ padding: '8px 18px', background: T.gold, color: T.navy, border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>+ New Post</button>
            </div>

            {showNew && (
              <div style={{ background: T.navyMid, border: `1px solid ${T.gold}`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
                <input value={newPost.title} onChange={e => setNewPost(p => ({ ...p, title: e.target.value }))} placeholder="Post title..."
                  style={{ width: '100%', background: T.navy, border: `1px solid ${T.border}`, borderRadius: 8, color: T.white, padding: '10px 12px', fontSize: 14, marginBottom: 10, boxSizing: 'border-box' }} />
                <textarea value={newPost.body} onChange={e => setNewPost(p => ({ ...p, body: e.target.value }))} rows={5} placeholder="Share your experience, tip, or question..."
                  style={{ width: '100%', background: T.navy, border: `1px solid ${T.border}`, borderRadius: 8, color: T.white, padding: '10px 12px', fontSize: 13, resize: 'vertical', fontFamily: "'Source Serif 4', Georgia, serif", boxSizing: 'border-box' }} />
                <div style={{ display: 'flex', gap: 10, marginTop: 12, alignItems: 'center' }}>
                  <button onClick={submitPost} style={{ padding: '9px 20px', background: T.gold, color: T.navy, border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Post</button>
                  <button onClick={() => setShowNew(false)} style={{ padding: '9px 16px', background: 'transparent', color: T.muted, border: `1px solid ${T.border}`, borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Cancel</button>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: T.muted, fontSize: 12, cursor: 'pointer', marginLeft: 'auto' }}>
                    <input type="checkbox" checked={newPost.anon} onChange={e => setNewPost(p => ({ ...p, anon: e.target.checked }))} />
                    Post anonymously
                  </label>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {filteredPosts.map(post => (
                <div key={post.id} style={{ background: T.navyMid, border: `1px solid ${T.border}`, borderRadius: 14, padding: 20 }}>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                    <span style={{ fontSize: 28 }}>{post.avatar}</span>
                    <div>
                      <div style={{ color: T.gold, fontWeight: 700, fontSize: 14 }}>{post.author}</div>
                      <div style={{ color: T.muted, fontSize: 11 }}>{timeAgo(post.ts)}</div>
                    </div>
                  </div>
                  <div style={{ color: T.white, fontWeight: 700, fontSize: 15, marginBottom: 8, fontFamily: "'Playfair Display', Georgia, serif" }}>{post.title}</div>
                  <div style={{ color: T.muted, fontSize: 13, lineHeight: 1.7 }}>{post.body}</div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                    {['👍', '🔥', '❤️', '💪', '🎉'].map(emoji => (
                      <button key={emoji} onClick={() => addReaction(post.id, emoji)} style={{
                        padding: '4px 10px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.border}`,
                        borderRadius: 20, cursor: 'pointer', fontSize: 13, color: T.white,
                        display: 'flex', alignItems: 'center', gap: 4,
                      }}>
                        {emoji} {post.reactions?.[emoji] > 0 && <span style={{ fontSize: 11, color: T.muted }}>{post.reactions[emoji]}</span>}
                      </button>
                    ))}
                    <button onClick={() => setShowReply(prev => ({ ...prev, [post.id]: !prev[post.id] }))} style={{
                      padding: '4px 12px', background: 'transparent', border: `1px solid ${T.border}`,
                      borderRadius: 20, cursor: 'pointer', fontSize: 12, color: T.muted, marginLeft: 'auto',
                    }}>💬 {(post.replies || []).length} replies</button>
                  </div>

                  {(post.replies || []).length > 0 && (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${T.border}` }}>
                      {(post.replies || []).map(r => (
                        <div key={r.id} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                          <span style={{ color: T.muted, fontSize: 16 }}>💬</span>
                          <div>
                            <span style={{ color: T.gold, fontSize: 12, fontWeight: 600 }}>{r.author}</span>
                            <span style={{ color: T.muted, fontSize: 11, marginLeft: 8 }}>{timeAgo(r.ts)}</span>
                            <div style={{ color: T.muted, fontSize: 13, marginTop: 2, lineHeight: 1.6 }}>{r.body}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {showReply[post.id] && (
                    <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
                      <input value={replyText[post.id] || ''} onChange={e => setReplyText(prev => ({ ...prev, [post.id]: e.target.value }))}
                        placeholder="Write a reply..."
                        style={{ flex: 1, background: T.navy, border: `1px solid ${T.border}`, borderRadius: 8, color: T.white, padding: '8px 12px', fontSize: 13 }} />
                      <button onClick={() => submitReply(post.id)} style={{ padding: '8px 16px', background: T.teal, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Reply</button>
                    </div>
                  )}
                </div>
              ))}
              {filteredPosts.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: T.muted }}>No posts in this feed yet. Be the first to share.</div>}
            </div>
          </div>
        </div>
      )}

      {tab === 'groups' && (
        <div style={{ padding: '24px 32px' }}>
          <div style={{ background: T.tealLight, border: `1px solid ${T.teal}`, borderRadius: 10, padding: 14, marginBottom: 24 }}>
            <div style={{ color: T.teal, fontWeight: 700, fontSize: 13 }}>🔒 Private Groups are invite-only spaces for sensitive discussions</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {PRIVATE_GROUPS.map(g => (
              <div key={g.id} style={{ background: T.navyMid, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24 }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{g.icon}</div>
                <div style={{ color: g.color, fontWeight: 700, fontSize: 16, fontFamily: "'Playfair Display', Georgia, serif", marginBottom: 6 }}>{g.label}</div>
                <div style={{ color: T.muted, fontSize: 12, marginBottom: 16 }}>{g.members.toLocaleString()} members · Private</div>
                <button style={{ width: '100%', padding: '10px', background: `${g.color}22`, color: g.color, border: `1px solid ${g.color}44`, borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>🔒 Request Access</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'crisis' && (
        <div style={{ padding: '32px 32px', maxWidth: 700 }}>
          <div style={{ background: T.redLight, border: `1px solid ${T.red}`, borderRadius: 12, padding: 20, marginBottom: 28 }}>
            <div style={{ color: T.red, fontWeight: 700, fontSize: 15, marginBottom: 6 }}>If you are in immediate danger — call 999</div>
            <div style={{ color: T.muted, fontSize: 13 }}>Legal battles are stressful. Your wellbeing matters more than your case. Please reach out for support.</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {CRISIS.map(c => (
              <div key={c.name} style={{ background: T.navyMid, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20, display: 'flex', gap: 16, alignItems: 'center' }}>
                <span style={{ fontSize: 32 }}>{c.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: c.color, fontWeight: 700, fontSize: 15 }}>{c.name}</div>
                  <div style={{ color: T.white, fontSize: 16, fontWeight: 700, margin: '4px 0' }}>{c.contact}</div>
                  <div style={{ color: T.muted, fontSize: 13 }}>{c.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
