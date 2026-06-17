"use client";

import { useState } from "react";
import { DollarSign, X, Loader2, Check, AlertCircle } from "lucide-react";
import { useTipping, type PayAsset } from "./useTipping";
import { config } from "@saphara/config";

const PRESETS: Record<PayAsset, string[]> = {
  USDT: ["1", "5", "10", "25", "50"],
  PART: ["100", "500", "1000", "5000"],
  BNB:  ["0.01", "0.05", "0.1", "0.5"],
};
const DEFAULT_AMOUNT: Record<PayAsset, string> = { USDT: "5", PART: "100", BNB: "0.05" };

const ASSET_COLOR: Record<PayAsset, string> = {
  USDT: "#26a17b",
  PART: "var(--accent)",
  BNB:  "#F3BA2F",
};

export function TipModal({
  creatorAddress, creatorHandle, onClose,
}: { creatorAddress: `0x${string}`; creatorHandle: string; onClose: () => void }) {
  const tip = useTipping();
  const [asset, setAsset] = useState<PayAsset>("USDT");
  const [amount, setAmount] = useState(DEFAULT_AMOUNT["USDT"]);
  const [step, setStep] = useState<"input" | "pending" | "done" | "error">("input");
  const [msg, setMsg] = useState("");

  const feePct = (config.fees.platformBps / 100).toFixed(1);
  const fee = (Number(amount) * config.fees.platformBps / 10000).toFixed(4);
  const net = (Number(amount) - Number(fee)).toFixed(4);

  const changeAsset = (a: PayAsset) => {
    setAsset(a);
    setAmount(DEFAULT_AMOUNT[a]);
    setStep("input");
    setMsg("");
  };

  const send = async () => {
    if (Number(amount) <= 0) return;
    try {
      setStep("pending"); setMsg("Cüzdan onayı bekleniyor…");
      if (asset === "USDT") await tip.tipWithUsdt(creatorAddress, amount);
      else if (asset === "PART") await tip.tipWithPart(creatorAddress, amount);
      else await tip.tipWithBnb(creatorAddress, amount);
      setStep("done");
      setMsg(`${net} ${asset} @${creatorHandle} hesabına gönderildi ✓`);
    } catch (e) {
      setStep("error");
      setMsg((e as Error).message.slice(0, 100));
    }
  };

  return (
    <div className="tip-backdrop" onClick={onClose}>
      <div className="tip-modal" onClick={(e) => e.stopPropagation()}>
        <button className="tip-close" onClick={onClose}><X size={20} /></button>
        <h2 style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <DollarSign size={22} style={{ color: ASSET_COLOR[asset] }} />
          @{creatorHandle} destekle
        </h2>

        {step === "done" ? (
          <div className="tip-result">
            <div className="done-check"><Check size={36} /></div>
            <p>{msg}</p>
            <button className="ghost-btn" onClick={onClose} style={{ marginTop: 12 }}>Kapat</button>
          </div>
        ) : (
          <>
            {/* Varlık seçimi */}
            <div className="tip-assets">
              {(["USDT", "PART", "BNB"] as PayAsset[]).map((a) => (
                <button key={a} className={asset === a ? "on" : ""}
                  style={asset === a ? { borderColor: ASSET_COLOR[a], color: ASSET_COLOR[a] } : {}}
                  onClick={() => changeAsset(a)}>{a}</button>
              ))}
            </div>

            {asset === "USDT" && (
              <p className="muted" style={{ fontSize: 12, marginBottom: 8 }}>
                BSC Mainnet · Tether USD · 18 decimal
              </p>
            )}

            {/* Miktar önayarları */}
            <div className="tip-presets">
              {PRESETS[asset].map((p) => (
                <button key={p} className={amount === p ? "on" : ""} onClick={() => setAmount(p)}>
                  {p} {asset}
                </button>
              ))}
            </div>
            <input className="tip-amount" type="number" value={amount}
              onChange={(e) => setAmount(e.target.value)} min="0" step={asset === "BNB" ? "0.01" : "1"} />

            <div className="tip-breakdown">
              <span>Platform komisyonu (%{feePct})</span>
              <span style={{ color: "var(--muted)" }}>{fee} {asset}</span>
              <span>Üretici alır</span>
              <span className="net" style={{ color: ASSET_COLOR[asset] }}>{net} {asset}</span>
            </div>

            {step === "error" && (
              <div className="tip-error">
                <AlertCircle size={16} /> {msg}
              </div>
            )}

            <button className="tip-send" disabled={step === "pending" || Number(amount) <= 0} onClick={send}
              style={{ background: ASSET_COLOR[asset] }}>
              {step === "pending"
                ? <><Loader2 size={18} className="spin" /> İşleniyor…</>
                : <>Gönder {amount} {asset}</>}
            </button>

            {!tip.contractReady && (
              <p className="muted" style={{ fontSize: 11, textAlign: "center", marginTop: 8 }}>
                Doğrudan cüzdandan üreticiye transfer
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
