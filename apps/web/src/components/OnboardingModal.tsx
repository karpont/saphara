"use client";

import { useState, useCallback } from "react";
import { useAuth } from "../features/auth/AuthContext";
import { api } from "../lib/api";

const STEPS = [
  {
    icon: "🌟",
    title: "Welcome to Saphara!",
    body:  "You're now part of a global Web3 social community. Create content, earn PART tokens, and own your digital identity — no middlemen.",
  },
  {
    icon: "💰",
    title: "Earn While You Create",
    body:  "Every post, reel, and interaction earns you XP and PART tokens. Complete daily quests, maintain streaks, and climb the leaderboard for bonus rewards.",
    bullets: ["🔥 Daily login streaks", "🎯 Quest-based rewards", "🏆 Weekly leaderboard prizes", "💸 Direct tips from fans"],
  },
  {
    icon: "🛡️",
    title: "Your Wallet, Your Identity",
    body:  "Your wallet address is your account. No email, no password, no data sold. Sign messages to prove ownership — no gas fees, ever.",
  },
  {
    icon: "🚀",
    title: "You're All Set!",
    body:  "Complete your profile, make your first post, and claim your daily login reward. The Saphara community is waiting for you.",
    cta:   "Let's Go →",
  },
];

export function OnboardingModal() {
  const { isAuthed, isOnboarded, completeOnboarding } = useAuth();
  const [step, setStep] = useState(0);
  const [closing, setClosing] = useState(false);

  const finish = useCallback(async () => {
    setClosing(true);
    try { await api.patch("/me/onboarded"); } catch { /* non-critical */ }
    completeOnboarding();
  }, [completeOnboarding]);

  if (!isAuthed || isOnboarded || closing) return null;

  const current = STEPS[step];
  const isLast  = step === STEPS.length - 1;

  return (
    <div className="ob-backdrop" role="dialog" aria-modal="true">
      <div className="ob-panel">

        {/* Progress dots */}
        <div className="ob-dots">
          {STEPS.map((_, i) => (
            <div key={i} className={`ob-dot${i === step ? " ob-dot-active" : i < step ? " ob-dot-done" : ""}`} />
          ))}
        </div>

        {/* Content */}
        <div className="ob-icon">{current.icon}</div>
        <h2 className="ob-title">{current.title}</h2>
        <p className="ob-body">{current.body}</p>

        {current.bullets && (
          <ul className="ob-bullets">
            {current.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        )}

        {/* Actions */}
        <div className="ob-actions">
          {step > 0 && (
            <button className="ob-btn ob-btn-ghost" onClick={() => setStep((s) => s - 1)}>
              ← Back
            </button>
          )}
          {isLast ? (
            <button className="ob-btn ob-btn-primary" onClick={finish}>
              {current.cta ?? "Get Started"}
            </button>
          ) : (
            <button className="ob-btn ob-btn-primary" onClick={() => setStep((s) => s + 1)}>
              Next →
            </button>
          )}
        </div>

        {/* Skip */}
        {!isLast && (
          <button className="ob-skip" onClick={finish}>Skip for now</button>
        )}
      </div>

      <style>{`
        .ob-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.72);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          animation: ob-fade 0.2s ease;
        }
        @keyframes ob-fade { from { opacity: 0; } to { opacity: 1; } }

        .ob-panel {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 40px 36px 32px;
          width: 100%;
          max-width: 460px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          box-shadow: 0 32px 64px rgba(0,0,0,0.5);
          animation: ob-up 0.25s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes ob-up { from { transform: translateY(24px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .ob-dots {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
        }
        .ob-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--surface-2);
          border: 1px solid var(--border);
          transition: all 0.2s;
        }
        .ob-dot-active {
          background: var(--accent);
          border-color: var(--accent);
          width: 24px;
          border-radius: 4px;
        }
        .ob-dot-done {
          background: rgba(240,180,41,0.4);
          border-color: rgba(240,180,41,0.4);
        }

        .ob-icon {
          font-size: 56px;
          line-height: 1;
          margin-bottom: 4px;
        }
        .ob-title {
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.5px;
          text-align: center;
        }
        .ob-body {
          font-size: 15px;
          color: var(--muted);
          line-height: 1.65;
          text-align: center;
          max-width: 360px;
        }

        .ob-bullets {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-self: stretch;
          background: var(--surface-2);
          border-radius: 12px;
          padding: 16px 18px;
        }
        .ob-bullets li {
          font-size: 14px;
          color: var(--text);
        }

        .ob-actions {
          display: flex;
          gap: 10px;
          margin-top: 8px;
          width: 100%;
        }
        .ob-btn {
          flex: 1;
          padding: 13px 20px;
          border-radius: 999px;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          border: none;
          transition: opacity 0.15s, transform 0.15s;
        }
        .ob-btn:hover { opacity: 0.88; transform: translateY(-1px); }
        .ob-btn-primary { background: var(--accent); color: #1a1300; }
        .ob-btn-ghost {
          background: var(--surface-2);
          color: var(--muted);
          border: 1px solid var(--border);
          flex: 0 0 auto;
          padding: 13px 18px;
        }

        .ob-skip {
          background: none;
          border: none;
          color: var(--muted);
          font-size: 13px;
          cursor: pointer;
          padding: 4px 8px;
          transition: color 0.15s;
        }
        .ob-skip:hover { color: var(--text); }

        @media (max-width: 480px) {
          .ob-panel { padding: 28px 20px 24px; border-radius: 16px; }
          .ob-title { font-size: 19px; }
        }
      `}</style>
    </div>
  );
}
