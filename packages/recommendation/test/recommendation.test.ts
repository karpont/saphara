import { describe, it, expect } from "vitest";
import { scoreContent, rankFeed } from "../src/index";

describe("scoreContent", () => {
  it("taze + kaliteli + ilgili icerik yuksek skor alir", () => {
    const high = scoreContent({
      affinity: 0.9, quality: 0.9, freshnessHours: 1,
      alreadySeen: false, creatorDiversityPenalty: 0,
    });
    const low = scoreContent({
      affinity: 0.1, quality: 0.2, freshnessHours: 200,
      alreadySeen: true, creatorDiversityPenalty: 1,
    });
    expect(high).toBeGreaterThan(low);
  });

  it("gorulmus icerik cezalandirilir", () => {
    const base = { affinity: 0.8, quality: 0.8, freshnessHours: 2, creatorDiversityPenalty: 0 };
    const seen = scoreContent({ ...base, alreadySeen: true });
    const fresh = scoreContent({ ...base, alreadySeen: false });
    expect(seen).toBeLessThan(fresh);
  });
});

describe("rankFeed", () => {
  it("skora gore azalan sirada dondurur", () => {
    const items = [
      { creatorId: "a", signals: { affinity: 0.1, quality: 0.1, freshnessHours: 100, alreadySeen: false, creatorDiversityPenalty: 0 } },
      { creatorId: "b", signals: { affinity: 0.9, quality: 0.9, freshnessHours: 1, alreadySeen: false, creatorDiversityPenalty: 0 } },
    ];
    const ranked = rankFeed(items);
    expect(ranked[0].creatorId).toBe("b");
  });
});
