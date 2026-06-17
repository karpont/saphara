import { describe, it, expect } from "vitest";
import { createHmac } from "node:crypto";

// auth.ts'teki JWT mantiginin testi (izole kopya, bagimliliksiz dogrulama).
const SECRET = "test_secret";
const b64url = (i: string) => Buffer.from(i).toString("base64url");
function signJwt(payload: object, ttlSec = 3600) {
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = b64url(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + ttlSec }));
  const sig = createHmac("sha256", SECRET).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${sig}`;
}
function verifyJwt(token: string): any | null {
  const [h, b, s] = token.split(".");
  if (!h || !b || !s) return null;
  const expected = createHmac("sha256", SECRET).update(`${h}.${b}`).digest("base64url");
  if (expected !== s) return null;
  const payload = JSON.parse(Buffer.from(b, "base64url").toString());
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

describe("JWT", () => {
  it("gecerli token cozulur", () => {
    expect(verifyJwt(signJwt({ sub: "u1" }))?.sub).toBe("u1");
  });
  it("bozulmus imza reddedilir", () => {
    const t = signJwt({ sub: "u1" });
    expect(verifyJwt(t.slice(0, -3) + "xxx")).toBeNull();
  });
  it("payload kurcalama reddedilir", () => {
    const t = signJwt({ sub: "u1" }).split(".");
    const tampered = t[0] + "." + b64url(JSON.stringify({ sub: "hacker", exp: 9999999999 })) + "." + t[2];
    expect(verifyJwt(tampered)).toBeNull();
  });
  it("suresi dolmus token reddedilir", () => {
    expect(verifyJwt(signJwt({ sub: "u" }, -10))).toBeNull();
  });
});
