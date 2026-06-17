"use client";

import { useState, useEffect, useCallback } from "react";
import { useConnect, useDisconnect, useConnectors, useAccount } from "wagmi";
import {
  X, Loader2, CheckCircle2, Wifi, ArrowRight,
  AlertCircle, Wallet, Shield,
} from "lucide-react";

type Step = "pick" | "sign";

/* Wallet branding keyed by wagmi connector id */
const W: Record<string, { label: string; bg: string; glyph: string; hint?: string }> = {
  metaMask:       { label: "MetaMask",        bg: "#F6851B", glyph: "🦊",  hint: "Browser extension" },
  walletConnect:  { label: "WalletConnect",   bg: "#3B99FC", glyph: "🔗",  hint: "QR code · all mobile wallets" },
  coinbaseWallet: { label: "Coinbase Wallet", bg: "#0052FF", glyph: "💠",  hint: "Coinbase exchange wallet" },
  injected:       { label: "Browser Wallet",  bg: "#7C3AED", glyph: "🌐",  hint: "MetaMask, Rabby, Keplr, OKX…" },
};

/* Override by matching connector name (covers Trust, BNB, Keplr, etc.) */
const NAME_MAP: Array<{ re: RegExp; meta: { label: string; bg: string; glyph: string } }> = [
  { re: /trust/i,          meta: { label: "Trust Wallet", bg: "#3375BB", glyph: "🛡️" } },
  { re: /binance|bnb/i,    meta: { label: "BNB Wallet",   bg: "#F3BA2F", glyph: "⬡"  } },
  { re: /keplr/i,          meta: { label: "Keplr",        bg: "#6B4EFF", glyph: "🔮" } },
  { re: /rabby/i,          meta: { label: "Rabby",        bg: "#7084FF", glyph: "🐰" } },
  { re: /okx/i,            meta: { label: "OKX Wallet",   bg: "#111",    glyph: "⭕" } },
  { re: /phantom/i,        meta: { label: "Phantom",      bg: "#AB9FF2", glyph: "👻" } },
  { re: /bybit/i,          meta: { label: "Bybit Wallet", bg: "#F7A600", glyph: "🅱️" } },
  { re: /safe|gnosis/i,    meta: { label: "Safe",         bg: "#12FF80", glyph: "🔒" } },
];

function walletMeta(connectorId: string, connectorName: string) {
  /* 1. exact id match */
  if (W[connectorId]) return W[connectorId];
  /* 2. name-based fuzzy match */
  for (const { re, meta } of NAME_MAP) {
    if (re.test(connectorName)) return { ...meta, hint: undefined };
  }
  /* 3. fallback */
  return { label: connectorName, bg: "#4B5563", glyph: "⬡", hint: undefined };
}

function detectWallets(): Set<string> {
  if (typeof window === "undefined") return new Set();
  const ev = (window as any).ethereum;
  const d = new Set<string>();
  if (ev?.isMetaMask)  d.add("metaMask");
  if (ev?.isTrust)     d.add("trust");
  if (ev?.isKeplr || (window as any).keplr) d.add("keplr");
  if (ev?.isBinance || (window as any).BinanceChain) d.add("binance");
  if (ev?.isCoinbaseWallet) d.add("coinbaseWallet");
  if (ev)              d.add("injected");
  return d;
}

export function WalletConnectSection({ auth }: { auth: any }) {
  const [open, setOpen]       = useState(false);
  const [step, setStep]       = useState<Step>("pick");
  const [detected, setDetected] = useState<Set<string>>(new Set());

  const { connect, isPending, variables } = useConnect();
  const { disconnect }  = useDisconnect();
  const connectors      = useConnectors();
  const { address, isConnected } = useAccount();

  useEffect(() => { setDetected(detectWallets()); }, []);

  /* Move to sign step automatically when wallet connects */
  useEffect(() => {
    if (isConnected && open) setStep("sign");
  }, [isConnected, open]);

  const openModal = useCallback(() => {
    setOpen(true);
    setStep(isConnected ? "sign" : "pick");
  }, [isConnected]);

  const closeModal = useCallback(() => setOpen(false), []);

  const handleConnect = useCallback(
    (connector: ReturnType<typeof useConnectors>[0]) => { connect({ connector }); },
    [connect],
  );

  const handleSign = useCallback(async () => {
    await auth.signIn();
  }, [auth]);

  /* After successful sign close modal */
  useEffect(() => {
    if (auth.status === "done") setOpen(false);
  }, [auth.status]);

  if (auth.isAuthed) return null;

  /* Which connector id is currently connecting */
  const connectingId = isPending
    ? (variables?.connector as any)?.id ?? (variables?.connector as any)?.name ?? ""
    : "";

  /* Separate WalletConnect so it renders full-width at bottom */
  const wcConnector  = connectors.find((c) => c.id === "walletConnect");
  const gridConnectors = connectors.filter((c) => c.id !== "walletConnect");

  return (
    <>
      {/* ── Trigger ─────────────────────────────── */}
      <button className="wm-trigger" onClick={openModal}>
        <Wallet size={18} />
        {isConnected ? "Sign In to Saphara" : "Connect Wallet"}
      </button>

      {/* ── Modal ───────────────────────────────── */}
      {open && (
        <div
          className="wm-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Connect wallet"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="wm-panel">

            {/* Header */}
            <div className="wm-header">
              <div className="wm-header-left">
                <Shield size={20} className="wm-shield" />
                <span className="wm-title">
                  {step === "pick" ? "Connect Your Wallet" : "Verify Ownership"}
                </span>
              </div>
              <button className="wm-close" onClick={closeModal} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <p className="wm-sub">
              {step === "pick"
                ? "Choose how you'd like to connect. No password required."
                : "Sign a free message to prove wallet ownership. No gas fee."}
            </p>

            {/* ── Step: wallet picker ─── */}
            {step === "pick" && (
              <>
                <div className="wm-grid">
                  {gridConnectors.map((c) => {
                    const meta      = walletMeta(c.id, c.name);
                    const isLoading = connectingId === c.id || connectingId === c.name;
                    const isDetect  = detected.has(c.id);

                    return (
                      <button
                        key={c.uid}
                        className="wm-wallet-btn"
                        onClick={() => handleConnect(c)}
                        disabled={isPending}
                      >
                        <span className="wm-icon" style={{ background: meta.bg }}>
                          {meta.glyph}
                        </span>
                        <span className="wm-info">
                          <span className="wm-name">{meta.label}</span>
                          {meta.hint && <span className="wm-hint">{meta.hint}</span>}
                        </span>
                        <span className="wm-right">
                          {isLoading
                            ? <Loader2 size={15} className="spin" />
                            : isDetect
                              ? <span className="wm-detected">Detected</span>
                              : <ArrowRight size={13} className="wm-arrow" />}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* WalletConnect — full width */}
                {wcConnector && (() => {
                  const meta      = walletMeta(wcConnector.id, wcConnector.name);
                  const isLoading = connectingId === wcConnector.id;
                  return (
                    <button
                      className="wm-wallet-btn wm-wallet-btn--wc"
                      onClick={() => handleConnect(wcConnector)}
                      disabled={isPending}
                    >
                      <span className="wm-icon" style={{ background: meta.bg }}>{meta.glyph}</span>
                      <span className="wm-info">
                        <span className="wm-name">{meta.label}</span>
                        <span className="wm-hint">{meta.hint}</span>
                      </span>
                      {isLoading
                        ? <Loader2 size={15} className="spin" />
                        : <ArrowRight size={13} className="wm-arrow" />}
                    </button>
                  );
                })()}

                <div className="wm-footer">
                  <span>🔐 Secure · No password · Your keys, your account</span>
                  <a
                    href="https://metamask.io/learn/crypto/what-is-a-crypto-wallet/"
                    target="_blank"
                    rel="noreferrer"
                    className="wm-learn"
                  >
                    New to wallets? Learn more →
                  </a>
                </div>
              </>
            )}

            {/* ── Step: sign ─── */}
            {step === "sign" && (
              <div className="wm-sign">
                <div className="wm-sign-addr">
                  <CheckCircle2 size={18} className="wm-check" />
                  <code className="wm-addr">{address?.slice(0, 8)}…{address?.slice(-6)}</code>
                  <span className="wm-connected-badge">Connected</span>
                </div>

                <div className="wm-sign-benefits">
                  <div className="wm-benefit">
                    <Wifi size={14} />
                    <span>Free signature — zero gas, no blockchain transaction</span>
                  </div>
                  <div className="wm-benefit">
                    <Shield size={14} />
                    <span>Your wallet stays in your full control at all times</span>
                  </div>
                </div>

                <button
                  className="wm-sign-btn"
                  onClick={handleSign}
                  disabled={auth.status === "signing" || auth.status === "verifying"}
                >
                  {auth.status === "signing" && (
                    <><Loader2 size={16} className="spin" /> Check your wallet…</>
                  )}
                  {auth.status === "verifying" && (
                    <><Loader2 size={16} className="spin" /> Verifying…</>
                  )}
                  {auth.status !== "signing" && auth.status !== "verifying" && (
                    <>Sign & Enter Saphara <ArrowRight size={15} /></>
                  )}
                </button>

                {auth.error && (
                  <div className="wm-error">
                    <AlertCircle size={13} />
                    <span>{auth.error}</span>
                  </div>
                )}

                <button
                  className="wm-disconnect"
                  onClick={() => { disconnect(); setStep("pick"); }}
                >
                  ← Use a different wallet
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}
