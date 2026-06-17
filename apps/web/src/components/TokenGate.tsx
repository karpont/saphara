"use client";
import { type ReactNode } from "react";
import { Lock, Coins, Zap, ExternalLink } from "lucide-react";
import { useMe } from "../hooks/useApi";
import { useAuth } from "../features/auth/AuthContext";

interface TokenGateProps {
  /** Minimum PART required (default 100) */
  minPart?: number;
  /** Label shown on the lock screen */
  label?: string;
  children: ReactNode;
}

/**
 * Wraps content that should only be visible to PART holders / logged-in users.
 * Falls back to a CTA card that prompts sign-in or acquiring PART.
 */
export function TokenGate({ minPart = 100, label = "Premium İçerik", children }: TokenGateProps) {
  const { isAuthed } = useAuth();
  const { data: me }  = useMe();

  const partBalance = Number(me?.partBalance ?? me?.earningsPart ?? 0);
  const hasAccess   = isAuthed && partBalance >= minPart;

  if (hasAccess) return <>{children}</>;

  return (
    <div style={{
      position: "relative", borderRadius: 16,
      border: "1.5px solid rgba(240,180,41,.35)",
      overflow: "hidden",
      background: "linear-gradient(135deg, rgba(240,180,41,.04), rgba(240,180,41,.01))",
    }}>
      {/* Blurred preview */}
      <div style={{ filter: "blur(6px)", opacity: 0.35, pointerEvents: "none", userSelect: "none" }}>
        {children}
      </div>

      {/* Lock overlay */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 12, textAlign: "center", padding: 24,
        background: "rgba(0,0,0,.55)", backdropFilter: "blur(2px)",
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: "50%",
          background: "rgba(240,180,41,.15)", border: "2px solid var(--accent)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Lock size={22} style={{ color: "var(--accent)" }} />
        </div>

        <div>
          <h4 style={{ fontWeight: 900, fontSize: 16, color: "#fff", marginBottom: 4 }}>{label}</h4>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,.65)", lineHeight: 1.5, maxWidth: 260, margin: "0 auto" }}>
            {isAuthed
              ? `Bu içerik için en az ${minPart} PART gerekiyor. Şu anki bakiyeniz: ${partBalance} PART.`
              : "Bu içeriğe erişmek için giriş yap ve PART token edin."}
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          {!isAuthed && (
            <a href="/" style={{
              display: "flex", alignItems: "center", gap: 6, padding: "9px 18px",
              borderRadius: 10, background: "var(--accent)", color: "#1a1300",
              fontSize: 13, fontWeight: 800, textDecoration: "none",
            }}>
              Giriş Yap
            </a>
          )}
          <a href="/wallet" style={{
            display: "flex", alignItems: "center", gap: 6, padding: "9px 18px",
            borderRadius: 10, border: "1.5px solid var(--accent)", color: "var(--accent)",
            fontSize: 13, fontWeight: 700, textDecoration: "none",
          }}>
            <Coins size={13} /> PART Al
          </a>
          <a href="/staking" style={{
            display: "flex", alignItems: "center", gap: 6, padding: "9px 18px",
            borderRadius: 10, border: "1.5px solid var(--border)", color: "var(--text)",
            fontSize: 13, fontWeight: 600, textDecoration: "none",
          }}>
            <Zap size={13} /> Stake Et
          </a>
        </div>

        <a href="/part" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "rgba(255,255,255,.45)", textDecoration: "none" }}>
          PART token nedir? <ExternalLink size={10} />
        </a>
      </div>
    </div>
  );
}
