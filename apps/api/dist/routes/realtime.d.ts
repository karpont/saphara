import type { FastifyInstance } from "fastify";
export interface WsMessage {
    type: "notification" | "dm" | "presence" | "typing" | "dm_react" | "dm_seen" | "dm_media";
    to?: string;
    from?: string;
    payload: unknown;
    ts?: number;
}
export declare function registerRealtime(app: FastifyInstance): Promise<void>;
/** Belirli kullaniciya (acik tum baglantilarina) gonderir. */
export declare function deliverTo(userId: string, msg: WsMessage): void;
/** Sunucu tarafindan tetiklenen bildirim (begeni, takip, bahsis vb.). */
export declare function pushNotification(userId: string, payload: unknown): void;
