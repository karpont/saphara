"use client";

import { useState, useCallback } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { createSiweMessage } from "viem/siwe";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/**
 * Sign-In With Ethereum (EIP-4361) client flow:
 *  1) Fetch a one-time nonce from /auth/nonce
 *  2) Build a SIWE message and request wallet signature
 *  3) POST message + signature to /auth/verify → receive JWT
 */
export function useSiweAuth() {
  const { address, chainId } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [token, setToken]   = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "signing" | "verifying" | "done" | "error">("idle");
  const [error, setError]   = useState("");

  const signIn = useCallback(async () => {
    if (!address) { setError("Connect your wallet first"); return; }
    try {
      setError("");
      setStatus("signing");

      const { nonce } = await (await fetch(`${API}/auth/nonce`)).json();

      const message = createSiweMessage({
        address,
        chainId: chainId ?? 56,
        domain:  window.location.host,
        uri:     window.location.origin,
        version: "1",
        nonce,
        statement:
          "Sign in to Saphara. This signature proves wallet ownership and will not trigger any blockchain transaction or cost any gas fees.",
      });

      const signature = await signMessageAsync({ message });

      setStatus("verifying");
      const res = await fetch(`${API}/auth/verify`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ message, signature }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Verification failed. Please try again.");
      }

      const data = await res.json();
      setToken(data.token);
      if (typeof window !== "undefined") {
        localStorage.setItem("saphara_jwt",          data.token);
        localStorage.setItem("saphara_refresh_token", data.refreshToken ?? "");
        localStorage.setItem("saphara_user",          JSON.stringify(data.user));
      }
      setStatus("done");
      return data;
    } catch (e: any) {
      const msg = e?.message ?? "Unknown error";
      /* User rejected the signature — friendly message */
      const rejected = msg.toLowerCase().includes("reject") || msg.toLowerCase().includes("denied") || msg.toLowerCase().includes("user refused");
      setError(rejected ? "Signature cancelled. Click 'Sign & Enter Saphara' to try again." : msg);
      setStatus("error");
    }
  }, [address, chainId, signMessageAsync]);

  return { signIn, token, status, error, isAuthed: status === "done" };
}
