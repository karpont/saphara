"use client";
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
let token: string | null = null;
export function setAdToken(t: string | null) { token = t; }

export async function adApi<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json", ...(opts.headers as any) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, { ...opts, headers });
  if (!res.ok) { let d = res.statusText; try { d = (await res.json()).error ?? d; } catch {} throw new Error(d); }
  return res.json();
}
