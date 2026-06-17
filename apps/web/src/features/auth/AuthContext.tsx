"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { useSiweAuth } from "../../hooks/useSiweAuth";
import { setAuthToken } from "../../lib/api";

interface AuthState {
  user: { id: string; handle: string; address: string; isOnboarded?: boolean } | null;
  isAuthed: boolean;
  isOnboarded: boolean;
  status: string;
  error: string;
  signIn: () => Promise<void>;
  signOut: () => void;
  completeOnboarding: () => void;
}

const Ctx = createContext<AuthState | null>(null);

/** Uygulama genelinde oturum durumu — localStorage'dan oturum geri yuklenir. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const siwe = useSiweAuth();
  const [user, setUser] = useState<AuthState["user"]>(null);

  // Restore persisted session; silently refresh if access token is stale
  useEffect(() => {
    async function restore() {
      const token   = localStorage.getItem("saphara_jwt");
      const refresh = localStorage.getItem("saphara_refresh_token");
      const stored  = localStorage.getItem("saphara_user");

      if (token && stored) {
        try {
          setAuthToken(token);
          setUser(JSON.parse(stored));
          return;
        } catch {
          localStorage.removeItem("saphara_jwt");
          localStorage.removeItem("saphara_user");
        }
      }

      // Try silent refresh if we have a refresh token
      if (refresh) {
        try {
          const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
          const res = await fetch(`${API}/auth/refresh`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ refreshToken: refresh }),
          });
          if (res.ok) {
            const data = await res.json();
            setAuthToken(data.token);
            setUser(data.user);
            localStorage.setItem("saphara_jwt",           data.token);
            localStorage.setItem("saphara_refresh_token", data.refreshToken ?? "");
            localStorage.setItem("saphara_user",          JSON.stringify(data.user));
          } else {
            localStorage.removeItem("saphara_refresh_token");
          }
        } catch {
          /* network error — stay logged out */
        }
      }
    }
    restore();
  }, []);

  const signIn = useCallback(async () => {
    const data = await siwe.signIn();
    if (data?.token) {
      setAuthToken(data.token);   // API client'a JWT'yi ver
      setUser(data.user);
    }
  }, [siwe]);

  const signOut = useCallback(() => {
    setAuthToken(null);
    setUser(null);
    localStorage.removeItem("saphara_jwt");
    localStorage.removeItem("saphara_refresh_token");
    localStorage.removeItem("saphara_user");
  }, []);

  const completeOnboarding = useCallback(() => {
    setUser((u) => u ? { ...u, isOnboarded: true } : u);
    const stored = localStorage.getItem("saphara_user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        localStorage.setItem("saphara_user", JSON.stringify({ ...parsed, isOnboarded: true }));
      } catch { /* ignore */ }
    }
  }, []);

  return (
    <Ctx.Provider value={{
      user, isAuthed: !!user,
      isOnboarded: !!(user?.isOnboarded),
      status: siwe.status, error: siwe.error,
      signIn, signOut, completeOnboarding,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
