"use client";
import { formatUnits } from "viem";
import { useWallet, usePartBalance } from "../hooks/useWallet";
import { useAuth } from "../features/auth/AuthContext";
import { config } from "@saphara/config";

/** Wallet status card shown in the right rail — displays address, balances, sign-in/out. */
export function WalletButton() {
  const w    = useWallet();
  const auth = useAuth();
  const part = usePartBalance(
    config.contracts.partToken !== "0x0000000000000000000000000000000000000000"
      ? config.contracts.partToken : undefined
  );

  if (!w.isConnected) {
    const c = w.connectors[0];
    return (
      <button className="panel connect" onClick={() => c && w.connect({ connector: c })}>
        Connect Wallet
      </button>
    );
  }

  return (
    <div className="panel wallet">
      <div className="addr">{w.address?.slice(0, 6)}…{w.address?.slice(-4)}</div>
      {w.onWrongNetwork ? (
        <button className="warn" onClick={w.switchToPrimary}>Switch to BNB Chain</button>
      ) : (
        <>
          <div className="bal">{w.nativeBalance ? formatUnits(w.nativeBalance.value, w.nativeBalance.decimals).slice(0, 8) : "0"} {w.nativeBalance?.symbol}</div>
          <div className="bal part">{part.formatted.slice(0, 8)} PART</div>
        </>
      )}
      {!auth.isAuthed ? (
        <button className="connect" onClick={() => auth.signIn()}>Sign In</button>
      ) : (
        <button className="ghost" onClick={() => { auth.signOut(); w.disconnect(); }}>Sign Out</button>
      )}
    </div>
  );
}
