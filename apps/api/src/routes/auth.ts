import type { FastifyInstance } from "fastify";
import { createPublicClient, http } from "viem";
import { bsc } from "viem/chains";
import { generateSiweNonce, parseSiweMessage } from "viem/siwe";
import { createHmac } from "node:crypto";
import { prisma } from "../db/client";

/**
 * Sign-In With Ethereum (EIP-4361) flow:
 *  1) GET  /auth/nonce    → server produces a one-time nonce
 *  2) Client signs a SIWE message with their wallet
 *  3) POST /auth/verify   → signature verified, short-lived access token + refresh token issued
 *  4) POST /auth/refresh  → swap a valid refresh token for a new pair
 *
 * Replay protection: nonce is single-use with a 5-minute TTL.
 */

const JWT_SECRET = process.env.JWT_SECRET ?? "";
if (!JWT_SECRET) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("FATAL: JWT_SECRET environment variable is not set. Refusing to start in production.");
  }
  console.warn("⚠  JWT_SECRET is not set. Using an insecure fallback — set it before production.");
}
const _SECRET = JWT_SECRET || "dev-only-insecure-secret-change-before-prod";

const EXPECTED_DOMAIN = process.env.AUTH_DOMAIN ?? "localhost:3000";
const NONCE_TTL_MS    = 5 * 60 * 1000;
const ACCESS_TTL_SEC  = 60 * 60 * 2;        // 2 hours
const REFRESH_TTL_SEC = 60 * 60 * 24 * 30;  // 30 days

const nonces = new Map<string, number>();
setInterval(() => {
  const now = Date.now();
  for (const [k, exp] of nonces) { if (exp < now) nonces.delete(k); }
}, 10 * 60 * 1000).unref();

const publicClient = createPublicClient({ chain: bsc, transport: http(process.env.RPC_URL_BSC) });

function b64url(input: Buffer | string) {
  return Buffer.from(input).toString("base64url");
}
function signJwt(payload: object, ttlSec: number) {
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body   = b64url(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + ttlSec }));
  const sig    = createHmac("sha256", _SECRET).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${sig}`;
}
function issueTokenPair(userId: string, address: string) {
  const access  = signJwt({ sub: userId, address, type: "access"  }, ACCESS_TTL_SEC);
  const refresh = signJwt({ sub: userId, address, type: "refresh" }, REFRESH_TTL_SEC);
  return { access, refresh };
}
export function verifyJwt(token: string): any | null {
  const [h, b, s] = token.split(".");
  if (!h || !b || !s) return null;
  const expected = createHmac("sha256", _SECRET).update(`${h}.${b}`).digest("base64url");
  if (expected !== s) return null;
  const payload = JSON.parse(Buffer.from(b, "base64url").toString());
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

export async function registerAuthRoutes(app: FastifyInstance) {
  // 1) Nonce uret
  app.get("/auth/nonce", async () => {
    const nonce = generateSiweNonce();
    nonces.set(nonce, Date.now() + NONCE_TTL_MS);
    return { nonce };
  });

  // 3) Imzayi dogrula, JWT ver
  app.post("/auth/verify", async (req, reply) => {
    const { message, signature } = req.body as { message: string; signature: `0x${string}` };
    if (!message || !signature) return reply.code(400).send({ error: "message ve signature gerekli" });

    let fields;
    try { fields = parseSiweMessage(message); } catch { return reply.code(400).send({ error: "Gecersiz SIWE mesaji" }); }

    // Nonce kontrolu (tek kullanimlik + sureli)
    const exp = fields.nonce ? nonces.get(fields.nonce) : undefined;
    if (!exp || exp < Date.now()) return reply.code(401).send({ error: "Nonce gecersiz veya suresi dolmus" });
    nonces.delete(fields.nonce!); // replay'i engelle

    // Domain kontrolu
    if (fields.domain && fields.domain !== EXPECTED_DOMAIN) {
      return reply.code(401).send({ error: "Domain uyusmuyor" });
    }

    // Imza dogrulama (viem)
    const valid = await publicClient.verifySiweMessage({ message, signature });
    if (!valid) return reply.code(401).send({ error: "Imza dogrulanamadi" });

    const address = fields.address!;

    /* Create or retrieve user by wallet address */
    const handle = `user_${address.slice(2, 8).toLowerCase()}`;
    const user = await prisma.user.upsert({
      where: { walletAddress: address },
      update: {},
      create: { walletAddress: address, handle, name: handle },
      select: { id: true, handle: true, name: true, avatarUrl: true, isOnboarded: true },
    });

    const { access, refresh } = issueTokenPair(user.id, address);
    return {
      token: access,
      refreshToken: refresh,
      user: { id: user.id, handle: user.handle, name: user.name, avatarUrl: user.avatarUrl, address, isOnboarded: user.isOnboarded },
    };
  });

  /* ── Refresh token → new access + refresh pair ─────────────────── */
  app.post("/auth/refresh", async (req, reply) => {
    const { refreshToken } = req.body as { refreshToken?: string };
    if (!refreshToken) return reply.code(400).send({ error: "refreshToken is required" });

    const payload = verifyJwt(refreshToken);
    if (!payload || payload.type !== "refresh") {
      return reply.code(401).send({ error: "Invalid or expired refresh token" });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, handle: true, name: true, avatarUrl: true, walletAddress: true, isOnboarded: true },
    });
    if (!user) return reply.code(401).send({ error: "User not found" });

    const { access, refresh } = issueTokenPair(user.id, user.walletAddress ?? "");
    return {
      token: access,
      refreshToken: refresh,
      user: { id: user.id, handle: user.handle, name: user.name, avatarUrl: user.avatarUrl, address: user.walletAddress, isOnboarded: user.isOnboarded },
    };
  });
}

/** Verify Bearer JWT on protected routes and attach userId to request. */
export function authPlugin(app: FastifyInstance) {
  app.decorateRequest("userId", "");
  app.addHook("preHandler", async (req) => {
    const auth = req.headers.authorization;
    if (auth?.startsWith("Bearer ")) {
      const payload = verifyJwt(auth.slice(7));
      if (payload?.sub && payload.type !== "refresh") {
        (req as any).userId = payload.sub;
      }
    }
  });
}

/** Call from protected handlers. Returns userId or sends 401. */
export function requireAuth(req: any, reply: any): string | undefined {
  const userId = req.userId as string;
  if (!userId) {
    reply.code(401).send({ error: "Authentication required. Please sign in." });
    return undefined;
  }
  return userId;
}
