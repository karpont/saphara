import { ctr } from "@saphara/analytics";

/** Reklam kampanyasi modeli (reklam veren paneli). */
export interface Campaign {
  id: string;
  name: string;
  objective: "awareness" | "traffic" | "conversions" | "creator_collab";
  budgetPart: number;
  bidPart: number;
  targeting: {
    interests: string[];
    minFollowers?: number;     // fenomen/uretici isbirligi hedefleme
    geo?: string[];
    ageRange?: [number, number];
  };
  creative: { mediaUrl: string; headline: string; cta: string };
}

/** Bir kampanyanin tahmini erisim/performans ozeti. */
export function estimatePerformance(c: Campaign) {
  const estImpressions = Math.floor(c.budgetPart / Math.max(c.bidPart, 0.0001) * 1000);
  const estClicks = Math.floor(estImpressions * 0.02); // tahmini %2 CTR
  return { estImpressions, estClicks, estCtr: ctr(estClicks, estImpressions) };
}
