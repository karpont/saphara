import { describe, it, expect } from "vitest";
import { RateLimiter } from "../src/rate-limit";
import { scoreBotLikelihood, requiresChallenge } from "../src/bot-detection";
import { fraudRiskLevel } from "../src/fraud";

describe("RateLimiter", () => {
  it("kapasite kadar gecirir, sonra reddeder", () => {
    const rl = new RateLimiter(3, 0); // yenilenme yok
    expect(rl.allow("a")).toBe(true);
    expect(rl.allow("a")).toBe(true);
    expect(rl.allow("a")).toBe(true);
    expect(rl.allow("a")).toBe(false);
  });

  it("farkli anahtarlar bagimsiz", () => {
    const rl = new RateLimiter(1, 0);
    expect(rl.allow("a")).toBe(true);
    expect(rl.allow("b")).toBe(true);
  });
});

describe("bot detection", () => {
  it("insan benzeri trafik dusuk skor alir", () => {
    const s = scoreBotLikelihood({
      hasMouseMovement: true, requestIntervalMsStdDev: 200,
      userAgentKnownBad: false, headlessHints: false, ipReputationScore: 0.1,
    });
    expect(s).toBeLessThan(0.6);
    expect(requiresChallenge(s)).toBe(false);
  });

  it("bot benzeri trafik challenge tetikler", () => {
    const s = scoreBotLikelihood({
      hasMouseMovement: false, requestIntervalMsStdDev: 1,
      userAgentKnownBad: true, headlessHints: true, ipReputationScore: 0.9,
    });
    expect(requiresChallenge(s)).toBe(true);
  });
});

describe("fraud risk", () => {
  it("temiz hesap low doner", () => {
    expect(fraudRiskLevel({
      deviceFingerprintReuseCount: 1, walletAgeDays: 365,
      rapidFollowActions: 2, payoutVelocityScore: 0.1,
    })).toBe("low");
  });

  it("supheli hesap high doner", () => {
    expect(fraudRiskLevel({
      deviceFingerprintReuseCount: 5, walletAgeDays: 0,
      rapidFollowActions: 100, payoutVelocityScore: 0.95,
    })).toBe("high");
  });
});
