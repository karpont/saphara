"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "./AuthContext";
import type { ReactNode } from "react";

const WalletConnectSection = dynamic(
  () => import("./WalletConnectSection").then((m) => ({ default: m.WalletConnectSection })),
  { ssr: false, loading: () => <button className="wm-trigger" disabled>Loading…</button> },
);

const FEATURES = [
  { icon: "✦", text: "Earn PART tokens for every post, like, and share" },
  { icon: "✦", text: "No password — your wallet is your identity" },
  { icon: "✦", text: "Own your content and social graph on BNB Chain" },
  { icon: "✦", text: "Tip creators directly with zero platform cut" },
];

export function RequireAuth({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;
  if (auth.isAuthed) return <>{children}</>;

  return (
    <div className="auth-gate">
      <div className="auth-card">

        {/* Brand */}
        <div className="auth-brand">
          <span className="auth-logo">Saphara</span>
          <span className="auth-tagline">Web3 Social Platform</span>
        </div>

        {/* Hero text */}
        <h1 className="auth-headline">
          Create. Share.<br />
          <span className="auth-headline-accent">Earn.</span>
        </h1>
        <p className="auth-sub">
          The open social platform powered by PART on BNB Chain.
          Connect your wallet to get started — it takes 10 seconds.
        </p>

        {/* Feature pills */}
        <ul className="auth-features">
          {FEATURES.map((f) => (
            <li key={f.text} className="auth-feature-item">
              <span className="auth-feature-icon">{f.icon}</span>
              <span>{f.text}</span>
            </li>
          ))}
        </ul>

        {/* Wallet connector */}
        <div className="auth-connect-wrap">
          <WalletConnectSection auth={auth} />
        </div>

        {/* Supported wallets hint */}
        <p className="auth-wallets-hint">
          MetaMask · Trust · Coinbase · WalletConnect · Keplr · OKX · Rabby · and more
        </p>

      </div>

      {/* Decorative background glow */}
      <div className="auth-glow" aria-hidden="true" />
    </div>
  );
}
