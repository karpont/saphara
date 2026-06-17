import type { FastifyInstance } from "fastify";
import websocket from "@fastify/websocket";
import { RateLimiter } from "@saphara/security";
import { verifyJwt } from "./auth";

/**
 * Realtime gateway: bildirimler + dogrudan mesajlar.
 * Basit oda (room) modeli: her kullanici kendi userId odasina abone olur.
 * Uretimde Redis pub/sub ile coklu sunucuya olceklenir.
 */

type Client = { socket: any; userId: string };

const clients = new Set<Client>();
const sendLimiter = new RateLimiter(30, 0.5); // kullanici basina mesaj sinirlama

export interface WsMessage {
  type: "notification" | "dm" | "presence" | "typing" | "dm_react" | "dm_seen" | "dm_media";
  to?: string;
  from?: string;
  payload: unknown;
  ts?: number;
}

export async function registerRealtime(app: FastifyInstance) {
  await app.register(websocket);

  app.get("/ws", { websocket: true }, (conn, req) => {
    const q = req.query as any;
    // JWT token ile doğrulama (öncelik), yoksa eski query param (backwards compat)
    let userId: string = "anon";
    if (q?.token) {
      const payload = verifyJwt(q.token);
      if (payload?.sub) { userId = payload.sub; }
      else {
        // Geçersiz token — bağlantıyı kapat
        conn.socket.send(JSON.stringify({ type: "notification", payload: { error: "Geçersiz oturum" } }));
        conn.socket.close(4001, "Unauthorized");
        return;
      }
    } else if (q?.userId) {
      userId = q.userId; // eski uyumluluk
    }
    const client: Client = { socket: conn.socket, userId };
    clients.add(client);

    conn.socket.send(JSON.stringify({ type: "presence", payload: { status: "connected", userId } }));

    conn.socket.on("message", (raw: Buffer) => {
      if (!sendLimiter.allow(userId)) {
        conn.socket.send(JSON.stringify({ type: "notification", payload: { error: "Cok hizli mesaj" } }));
        return;
      }
      let msg: WsMessage;
      try { msg = JSON.parse(raw.toString()); } catch { return; }
      msg.from = userId;
      msg.ts = Date.now();

      if (msg.type === "dm" && msg.to) {
        deliverTo(msg.to, msg);          // alıcıya ilet
        conn.socket.send(JSON.stringify({ ...msg, type: "dm", payload: { ...(msg.payload as object), delivered: true } }));
      } else if (msg.type === "typing" && msg.to) {
        deliverTo(msg.to, msg);
      }
    });

    conn.socket.on("close", () => clients.delete(client));
  });
}

/** Belirli kullaniciya (acik tum baglantilarina) gonderir. */
export function deliverTo(userId: string, msg: WsMessage) {
  const data = JSON.stringify(msg);
  for (const c of clients) {
    if (c.userId === userId && c.socket.readyState === 1) c.socket.send(data);
  }
}

/** Sunucu tarafindan tetiklenen bildirim (begeni, takip, bahsis vb.). */
export function pushNotification(userId: string, payload: unknown) {
  deliverTo(userId, { type: "notification", payload, ts: Date.now() });
}
