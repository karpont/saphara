import { describe, it, expect, beforeAll, afterAll } from "vitest";
import Fastify, { type FastifyInstance } from "fastify";
import { generateSiweNonce } from "viem/siwe";

/**
 * Auth akisinin DB gerektirmeyen kismi: nonce uretimi + JWT plugin davranisi.
 * (verify ucu zincir/DB gerektirir; o, sozlesme/e2e katmaninda test edilir.)
 */
describe("Auth entegrasyon (Fastify inject)", () => {
  let app: FastifyInstance;
  const nonces = new Map<string, number>();

  beforeAll(async () => {
    app = Fastify();
    app.get("/auth/nonce", async () => {
      const nonce = generateSiweNonce();
      nonces.set(nonce, Date.now() + 300000);
      return { nonce };
    });
    app.decorateRequest("userId", "");
    app.get("/protected", async (req, reply) => {
      const uid = (req as any).userId;
      if (!uid) return reply.code(401).send({ error: "Giris gerekli" });
      return { uid };
    });
    await app.ready();
  });
  afterAll(async () => { await app.close(); });

  it("nonce ucu benzersiz nonce uretir", async () => {
    const r1 = await app.inject({ method: "GET", url: "/auth/nonce" });
    const r2 = await app.inject({ method: "GET", url: "/auth/nonce" });
    expect(r1.statusCode).toBe(200);
    const n1 = r1.json().nonce, n2 = r2.json().nonce;
    expect(n1).toBeTruthy();
    expect(n1).not.toBe(n2); // benzersiz
  });

  it("korumali uc kimliksiz 401 doner", async () => {
    const r = await app.inject({ method: "GET", url: "/protected" });
    expect(r.statusCode).toBe(401);
  });
});
