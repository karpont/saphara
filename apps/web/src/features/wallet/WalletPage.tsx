"use client";
import { Wallet, Coins, ArrowUpRight, Copy, ExternalLink } from "lucide-react";
import { useWallet, usePartBalance } from "../../hooks/useWallet";
import { usePartPrice } from "../../hooks/useApi";
import { useAuth } from "../auth/AuthContext";
import { WalletConnectSection } from "../auth/WalletConnectSection";
import { config } from "@saphara/config";
import { useState } from "react";

/** Cuzdan sayfasi: baglanti, bakiye, PART degeri, hizli islemler. */
export function WalletPage() {
  const w = useWallet();
  const auth = useAuth();
  const part = usePartBalance(
    config.contracts.partToken !== "0x0000000000000000000000000000000000000000" ? config.contracts.partToken : undefined
  );
  const price = usePartPrice();
  const [copied, setCopied] = useState(false);

  const partUsd = price.data?.partUsdRate ?? 0.01;
  const partValue = (Number(part.formatted || 0) * partUsd).toFixed(2);

  const copy = () => { if (w.address) { navigator.clipboard?.writeText(w.address); setCopied(true); setTimeout(() => setCopied(false), 1500); } };

  if (!w.isConnected) {
    return (
      <div className="wallet-page">
        <header className="topbar"><h1><Wallet size={20} /> Cuzdan</h1></header>
        <div className="empty-state">
          <Wallet size={36} className="empty-icon" />
          <p className="empty-title">Cuzdan bagli degil</p>
          <WalletConnectSection auth={auth} />
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-page">
      <header className="topbar"><h1><Wallet size={20} /> Cuzdan</h1></header>

      <div className="wallet-hero">
        <div className="wallet-addr-row">
          <code>{w.address?.slice(0, 10)}…{w.address?.slice(-8)}</code>
          <button onClick={copy} aria-label="Kopyala"><Copy size={15} /></button>
          {copied && <span className="muted">kopyalandi</span>}
        </div>
        {w.onWrongNetwork && <button className="warn" onClick={w.switchToPrimary}>BNB Chain'e gec</button>}
        <div className="wallet-balances">
          <div className="wbal">
            <span className="muted">Native</span>
            <strong>{w.nativeBalance?.formatted.slice(0, 10)} {w.nativeBalance?.symbol}</strong>
          </div>
          <div className="wbal part">
            <span className="muted"><Coins size={14} /> PART</span>
            <strong>{part.formatted.slice(0, 10)}</strong>
            <small className="muted">≈ ${partValue} ({partUsd}$/PART)</small>
          </div>
        </div>
      </div>

      <section className="set-section">
        <h3>Hizli Islemler</h3>
        <div className="wallet-actions">
          <a className="wallet-act" href="/market"><Coins size={18} /> Magazada Harca</a>
          <a className="wallet-act" href={`https://bscscan.com/address/${w.address}`} target="_blank" rel="noopener noreferrer">
            <ExternalLink size={18} /> BscScan'de Gor
          </a>
        </div>
      </section>

      <section className="set-section">
        <h3>PART Token</h3>
        <div className="set-info">Kontrat: <code>{config.contracts.partToken.slice(0,10)}…{config.contracts.partToken.slice(-6)}</code></div>
        <a className="muted" href={`https://bscscan.com/token/${config.contracts.partToken}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13 }}>
          Token detayi <ArrowUpRight size={12} style={{ display: "inline" }} />
        </a>
      </section>
    </div>
  );
}
