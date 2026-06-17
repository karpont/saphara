"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../features/auth/AuthContext";
import { Feed } from "../components/Feed";
import { WalletConnectSection } from "../features/auth/WalletConnectSection";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const WALLETS = [
  { label: "MetaMask",       glyph: "🦊" },
  { label: "Trust Wallet",   glyph: "🛡️" },
  { label: "BNB Wallet",     glyph: "⬡"  },
  { label: "WalletConnect",  glyph: "🔗" },
  { label: "Keplr",          glyph: "🔮" },
  { label: "Coinbase",       glyph: "💠" },
  { label: "Rabby",          glyph: "🐰" },
  { label: "OKX Wallet",     glyph: "⭕" },
];

const FEATURES = [
  { icon: "🎬", title: "Short-Form Reels",    desc: "Create and discover vertical videos. Earn PART when your content goes viral.",  href: "/reels"     },
  { icon: "💰", title: "Earn While You Post",  desc: "Tips, quests, daily streaks, and leaderboard rewards — real crypto in your wallet.", href: "/levels"    },
  { icon: "🛒", title: "NFT Marketplace",     desc: "Mint, buy, and sell digital art directly on BNB Smart Chain. Zero middlemen.",   href: "/market"    },
  { icon: "🚀", title: "Token Launchpad",     desc: "Join vetted IDO sales. PART-powered community investing on BNB Chain.",          href: "/launchpad"  },
  { icon: "🔥", title: "Staking & Rewards",   desc: "Stake PART tokens for up to 80% APY in flexible or locked pools.",              href: "/staking"   },
  { icon: "🗳️", title: "DAO Governance",      desc: "Vote on platform proposals. Every PART = 1 vote. Your community, your rules.",  href: "/dao"       },
  { icon: "📝", title: "Creator Blog",        desc: "Long-form posts — tutorials, analysis, deep dives. Readers engage and tip.",    href: "/blog"      },
  { icon: "💬", title: "Encrypted Messaging", desc: "Direct messages and group chats. End-to-end privacy, always.",                  href: "/messages"  },
  { icon: "🌐", title: "Open Communities",    desc: "Create and join topic communities. Govern them with PART token votes.",         href: "/communities"},
];

const STEPS = [
  { n: "01", title: "Connect Your Wallet",    desc: "One click with MetaMask, Trust, BNB Wallet, Keplr, or any Web3 wallet. No forms." },
  { n: "02", title: "Sign & Enter",           desc: "Sign a gasless message to verify ownership. Your private key stays private." },
  { n: "03", title: "Create, Share & Earn",  desc: "Post content, collect tips, complete quests, climb the leaderboard." },
];

interface Stats { users: number; posts: number; reels: number; partDistributed: number }

export default function HomePage() {
  const auth = useAuth();
  const { isAuthed } = auth;
  const [mounted, setMounted] = useState(false);
  const [stats, setStats]     = useState<Stats | null>(null);
  const [showWallet, setShowWallet] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch(`${API}/stats`)
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => {});
  }, []);

  if (!mounted) return null;
  if (isAuthed) {
    return (
      <>
        <header className="topbar home-topbar">
          <div className="home-logo">
            <img src="/saphara-logo.svg" alt="Saphara" height={32} />
          </div>
        </header>
        <Feed />
      </>
    );
  }

  const fmt = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K+`;
    return String(n);
  };

  return (
    <div className="landing">

      {/* ── NAV ── */}
      <nav className="land-nav">
        <span className="land-brand">Saphara</span>
        <div className="land-nav-links">
          <a href="#features">Features</a>
          <a href="#how">How It Works</a>
          <a href="/blog">Blog</a>
          <a href="/launchpad">Launchpad</a>
        </div>
        <WalletConnectSection auth={auth} />
      </nav>

      {/* ── HERO ── */}
      <section className="land-hero">
        <div className="land-hero-glow" />
        <div className="land-hero-content">
          <div className="land-badge">Built on BNB Smart Chain</div>
          <h1 className="land-headline">
            Create. Share.<br />
            <span className="land-gold">Earn Crypto.</span>
          </h1>
          <p className="land-sub">
            The social network where your creativity pays — in real PART tokens.
            Own your identity with your wallet. No ads that track you, no algorithms that silence you.
          </p>
          <div className="land-hero-actions">
            <WalletConnectSection auth={auth} />
            <a href="#features" className="land-cta-btn land-cta-ghost">See Features ↓</a>
          </div>
          <p className="land-hero-hint">
            Works with MetaMask, Trust Wallet, BNB Wallet, Keplr &amp; more
          </p>
        </div>
        <div className="land-hero-visual">
          <div className="land-phone-mock">
            <div className="land-phone-screen">
              <div className="land-mock-post">
                <div className="land-mock-avatar" />
                <div className="land-mock-lines">
                  <div className="land-mock-line w70" />
                  <div className="land-mock-line w100" />
                  <div className="land-mock-line w55" />
                </div>
              </div>
              <div className="land-mock-video" />
              <div className="land-mock-stats">
                <span>❤️ 1,204</span>
                <span>💬 88</span>
                <span className="land-mock-earn">+5 PART</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LIVE STATS ── */}
      <section className="land-stats">
        <div className="land-stat">
          <span className="land-stat-num">{stats ? fmt(stats.users) : "10K+"}</span>
          <span className="land-stat-label">Creators</span>
        </div>
        <div className="land-stat-div" />
        <div className="land-stat">
          <span className="land-stat-num">{stats ? fmt(stats.posts + stats.reels) : "250K+"}</span>
          <span className="land-stat-label">Posts &amp; Reels</span>
        </div>
        <div className="land-stat-div" />
        <div className="land-stat">
          <span className="land-stat-num">{stats ? fmt(Number(stats.partDistributed)) : "1.2M"}</span>
          <span className="land-stat-label">PART Distributed</span>
        </div>
        <div className="land-stat-div" />
        <div className="land-stat">
          <span className="land-stat-num">BNB</span>
          <span className="land-stat-label">Smart Chain</span>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="land-section" id="features">
        <div className="land-section-head">
          <h2>Everything you need. <span className="land-gold">Nothing you don&apos;t.</span></h2>
          <p>A full Web3 social platform — built on crypto rails, not surveillance capitalism.</p>
        </div>
        <div className="land-features-grid">
          {FEATURES.map((f) => (
            <a key={f.title} href={f.href} className="land-feature-card">
              <span className="land-feature-icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </a>
          ))}
        </div>
      </section>

      {/* ── QUICK LINKS STRIP ── */}
      <section className="land-quicklinks">
        <a href="/launchpad" className="land-ql-card">
          <span>🚀</span>
          <div>
            <div className="land-ql-title">Launchpad</div>
            <div className="land-ql-sub">Token IDO sales live now</div>
          </div>
          <span className="land-ql-arrow">→</span>
        </a>
        <a href="/staking" className="land-ql-card">
          <span>🔥</span>
          <div>
            <div className="land-ql-title">Staking</div>
            <div className="land-ql-sub">Up to 80% APY</div>
          </div>
          <span className="land-ql-arrow">→</span>
        </a>
        <a href="/dao" className="land-ql-card">
          <span>🗳️</span>
          <div>
            <div className="land-ql-title">DAO Governance</div>
            <div className="land-ql-sub">Vote on proposals</div>
          </div>
          <span className="land-ql-arrow">→</span>
        </a>
        <a href="/blog" className="land-ql-card">
          <span>📝</span>
          <div>
            <div className="land-ql-title">Blog</div>
            <div className="land-ql-sub">DeFi, NFT, guides</div>
          </div>
          <span className="land-ql-arrow">→</span>
        </a>
        <a href="/market" className="land-ql-card">
          <span>🛒</span>
          <div>
            <div className="land-ql-title">Marketplace</div>
            <div className="land-ql-sub">Buy &amp; sell with PART</div>
          </div>
          <span className="land-ql-arrow">→</span>
        </a>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="land-section land-how" id="how">
        <div className="land-section-head">
          <h2>Up and running <span className="land-gold">in 30 seconds.</span></h2>
          <p>No sign-up form. No verification email. Just your wallet.</p>
        </div>
        <div className="land-steps">
          {STEPS.map((s) => (
            <div key={s.n} className="land-step">
              <div className="land-step-num">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── WALLETS ── */}
      <section className="land-section" id="wallets">
        <div className="land-section-head">
          <h2>Works with your <span className="land-gold">favourite wallet.</span></h2>
          <p>If it&apos;s Web3, it&apos;s welcome here.</p>
        </div>
        <div className="land-wallets-grid">
          {WALLETS.map((w) => (
            <div key={w.label} className="land-wallet-pill">
              <span>{w.glyph}</span>
              <span>{w.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── EARN SECTION ── */}
      <section className="land-earn">
        <div className="land-earn-inner">
          <div className="land-earn-text">
            <h2>Your content.<br /><span className="land-gold">Your earnings.</span></h2>
            <p>
              Every post, reel, comment, and share earns XP and PART tokens.
              Complete daily quests, maintain streaks, and climb the leaderboard
              to unlock bonus rewards — paid directly to your wallet.
            </p>
            <ul className="land-earn-list">
              <li>🔥 Daily login streak bonuses</li>
              <li>🏆 Weekly leaderboard prizes</li>
              <li>🎯 Quest-based XP &amp; PART rewards</li>
              <li>💸 Tips from your fans — no platform cut</li>
              <li>🔥 Staking: up to 80% APY on PART</li>
              <li>🗳️ DAO voting power with every token held</li>
            </ul>
            <a href="/levels" className="land-cta-btn land-cta-outline" style={{ marginTop: 16, display: "inline-flex" }}>
              View Leaderboard &amp; Levels →
            </a>
          </div>
          <div className="land-earn-card">
            <div className="land-earn-row">
              <span className="land-earn-label">Daily Login Streak</span>
              <span className="land-earn-val land-gold">+5 PART</span>
            </div>
            <div className="land-earn-row">
              <span className="land-earn-label">Post goes viral</span>
              <span className="land-earn-val land-gold">+50 XP</span>
            </div>
            <div className="land-earn-row">
              <span className="land-earn-label">Fan tip received</span>
              <span className="land-earn-val land-gold">100% yours</span>
            </div>
            <div className="land-earn-row">
              <span className="land-earn-label">7-day streak bonus</span>
              <span className="land-earn-val land-gold">+20 PART</span>
            </div>
            <div className="land-earn-row">
              <span className="land-earn-label">Staking LP Farm APY</span>
              <span className="land-earn-val land-gold">up to 80%</span>
            </div>
            <div className="land-earn-divider" />
            <div className="land-earn-level">
              <span>Level: <strong>Content Creator</strong></span>
              <div className="land-earn-bar">
                <div className="land-earn-fill" style={{ width: "62%" }} />
              </div>
              <span className="land-earn-xp">620 / 1000 XP</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="land-final-cta">
        <div className="land-final-glow" />
        <h2>Ready to own your social presence?</h2>
        <p>Connect your wallet and join thousands of creators already earning PART.</p>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <WalletConnectSection auth={auth} />
        </div>
        <p className="land-final-hint">No email. No password. No data sold.</p>
      </section>

      {/* ── FOOTER ── */}
      <footer className="land-footer">
        <div className="land-footer-brand">Saphara</div>
        <div className="land-footer-links">
          <a href="/terms">Terms</a>
          <a href="/privacy">Privacy</a>
          <a href="/blog">Blog</a>
          <a href="/market">Market</a>
          <a href="/launchpad">Launchpad</a>
          <a href="/staking">Staking</a>
          <a href="/dao">DAO</a>
          <a href="/levels">Leaderboard</a>
        </div>
        <div className="land-footer-copy">
          © {new Date().getFullYear()} Saphara · Built on BNB Smart Chain
        </div>
      </footer>

      <style>{`
        .land-quicklinks {
          display: flex;
          gap: 10px;
          padding: 12px 40px 0;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .land-ql-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 18px;
          background: var(--surface);
          border: 1.5px solid var(--border);
          border-radius: 14px;
          text-decoration: none;
          color: var(--text);
          white-space: nowrap;
          font-size: 22px;
          flex-shrink: 0;
          transition: all .15s;
        }
        .land-ql-card:hover {
          border-color: var(--accent);
          transform: translateY(-2px);
        }
        .land-ql-title { font-size: 13px; font-weight: 700; }
        .land-ql-sub   { font-size: 11px; color: var(--muted); margin-top: 1px; }
        .land-ql-arrow { font-size: 16px; color: var(--accent); margin-left: 4px; }
        .land-feature-card { text-decoration: none; color: inherit; display: flex; flex-direction: column; }
        .land-feature-card:hover { border-color: var(--accent); transform: translateY(-3px); }
        .wm-trigger {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 10px;
          background: var(--accent, #f0b429);
          color: #1a1300;
          font-size: 14px;
          font-weight: 800;
          border: none;
          cursor: pointer;
          transition: opacity .15s;
        }
        .wm-trigger:hover { opacity: .88; }
      `}</style>
    </div>
  );
}
