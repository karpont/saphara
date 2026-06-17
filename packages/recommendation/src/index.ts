/**
 * Icerik onerisi. Kalite + ilgi + tazelik + cesitlilik sinyallerini
 * birlestirir. Kasitli "bagimlilik dongusu" optimizasyonu YAPMAZ; aksine
 * cesitlilik bonusu ve tekrar cezasi ile saglikli bir akis hedefler.
 */
export interface ContentSignals {
  affinity: number;      // 0-1 kullanici ilgisiyle uyum
  quality: number;       // 0-1 icerik kalite skoru (etkilesim/sikayet orani)
  freshnessHours: number;// icerik yasi
  alreadySeen: boolean;
  creatorDiversityPenalty: number; // ayni ureticiyi cok gostermeyi cezalandirir
}

export function scoreContent(s: ContentSignals): number {
  const freshness = Math.exp(-s.freshnessHours / 48); // 48 saatte yariya iner
  let score =
    0.4 * s.affinity +
    0.35 * s.quality +
    0.25 * freshness;
  if (s.alreadySeen) score *= 0.3;
  score -= s.creatorDiversityPenalty * 0.15;
  return Math.max(0, score);
}

/** Akisi siralar; ayni ureticiden art arda gosterimi sinirlar. */
export function rankFeed<T extends { creatorId: string; signals: ContentSignals }>(
  items: T[]
): T[] {
  return [...items]
    .map((it) => ({ it, s: scoreContent(it.signals) }))
    .sort((a, b) => b.s - a.s)
    .map((x) => x.it);
}
