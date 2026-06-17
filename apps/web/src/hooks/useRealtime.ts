"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export interface RealtimeMessage {
  type: "notification" | "dm" | "presence" | "typing";
  to?: string;
  from?: string;
  payload: any;
  ts?: number;
}

const WS_BASE = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:4000";

/**
 * Realtime baglanti. Otomatik yeniden baglanir (exponential backoff).
 * Gelen mesajlari tipe gore ayirir.
 */
export function useRealtime(userId: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const retry = useRef(0);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<RealtimeMessage[]>([]);
  const [notifications, setNotifications] = useState<RealtimeMessage[]>([]);

  const connect = useCallback(() => {
    const ws = new WebSocket(`${WS_BASE}/ws?userId=${encodeURIComponent(userId)}`);
    wsRef.current = ws;

    ws.onopen = () => { setConnected(true); retry.current = 0; };
    ws.onmessage = (ev) => {
      let msg: RealtimeMessage;
      try { msg = JSON.parse(ev.data); } catch { return; }
      if (msg.type === "dm") setMessages((m) => [...m, msg]);
      else if (msg.type === "notification") setNotifications((n) => [msg, ...n]);
    };
    ws.onclose = () => {
      setConnected(false);
      const delay = Math.min(1000 * 2 ** retry.current, 15000);
      retry.current++;
      setTimeout(connect, delay); // yeniden bagla
    };
    ws.onerror = () => ws.close();
  }, [userId]);

  useEffect(() => {
    connect();
    return () => wsRef.current?.close();
  }, [connect]);

  const sendDM = useCallback((to: string, text: string) => {
    wsRef.current?.send(JSON.stringify({ type: "dm", to, payload: { text } }));
    // optimistik ekleme
    setMessages((m) => [...m, { type: "dm", to, from: userId, payload: { text, pending: true }, ts: Date.now() }]);
  }, [userId]);

  const sendTyping = useCallback((to: string) => {
    wsRef.current?.send(JSON.stringify({ type: "typing", to, payload: {} }));
  }, []);

  return { connected, messages, notifications, sendDM, sendTyping };
}
