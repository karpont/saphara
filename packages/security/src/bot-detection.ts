/**
 * Anti-bot sinyal skorlamasi. Birden cok zayif sinyali birlestirip
 * supheli otomatik trafigi isaretler. Insan kullaniciyi engellemez;
 * yuksek skorlu istekler ek dogrulama (CAPTCHA/Turnstile) ister.
 */
export interface BotSignals {
  hasMouseMovement: boolean;
  requestIntervalMsStdDev: number; // cok duzenli aralik = bot supheli
  userAgentKnownBad: boolean;
  headlessHints: boolean;          // navigator.webdriver vb.
  ipReputationScore: number;       // 0(iyi)-1(kotu)
}

/** 0 (insan) - 1 (kuvvetli bot supheli). */
export function scoreBotLikelihood(s: BotSignals): number {
  let score = 0;
  if (!s.hasMouseMovement) score += 0.2;
  if (s.requestIntervalMsStdDev < 5) score += 0.25; // makine gibi duzenli
  if (s.userAgentKnownBad) score += 0.2;
  if (s.headlessHints) score += 0.2;
  score += s.ipReputationScore * 0.15;
  return Math.min(1, score);
}

export function requiresChallenge(score: number): boolean {
  return score >= 0.6;
}
