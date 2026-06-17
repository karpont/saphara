import websocket from "@fastify/websocket";
import { RateLimiter } from "@saphara/security";
import { verifyJwt } from "./auth";
const clients = new Set();
const sendLimiter = new RateLimiter(30, 0.5); // kullanici basina mesaj sinirlama
export async function registerRealtime(app) {
    await app.register(websocket);
    app.get("/ws", { websocket: true }, (conn, req) => {
        const q = req.query;
        // JWT token ile doğrulama (öncelik), yoksa eski query param (backwards compat)
        let userId = "anon";
        if (q?.token) {
            const payload = verifyJwt(q.token);
            if (payload?.sub) {
                userId = payload.sub;
            }
            else {
                // Geçersiz token — bağlantıyı kapat
                conn.socket.send(JSON.stringify({ type: "notification", payload: { error: "Geçersiz oturum" } }));
                conn.socket.close(4001, "Unauthorized");
                return;
            }
        }
        else if (q?.userId) {
            userId = q.userId; // eski uyumluluk
        }
        const client = { socket: conn.socket, userId };
        clients.add(client);
        conn.socket.send(JSON.stringify({ type: "presence", payload: { status: "connected", userId } }));
        conn.socket.on("message", (raw) => {
            if (!sendLimiter.allow(userId)) {
                conn.socket.send(JSON.stringify({ type: "notification", payload: { error: "Cok hizli mesaj" } }));
                return;
            }
            let msg;
            try {
                msg = JSON.parse(raw.toString());
            }
            catch {
                return;
            }
            msg.from = userId;
            msg.ts = Date.now();
            if (msg.type === "dm" && msg.to) {
                deliverTo(msg.to, msg); // alıcıya ilet
                conn.socket.send(JSON.stringify({ ...msg, type: "dm", payload: { ...msg.payload, delivered: true } }));
            }
            else if (msg.type === "typing" && msg.to) {
                deliverTo(msg.to, msg);
            }
        });
        conn.socket.on("close", () => clients.delete(client));
    });
}
/** Belirli kullaniciya (acik tum baglantilarina) gonderir. */
export function deliverTo(userId, msg) {
    const data = JSON.stringify(msg);
    for (const c of clients) {
        if (c.userId === userId && c.socket.readyState === 1)
            c.socket.send(data);
    }
}
/** Sunucu tarafindan tetiklenen bildirim (begeni, takip, bahsis vb.). */
export function pushNotification(userId, payload) {
    deliverTo(userId, { type: "notification", payload, ts: Date.now() });
}
