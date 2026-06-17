/** Icerik uretici ve reklam veren panelleri icin analitik tipleri/yardimcilari. */
export interface CreatorMetrics {
  followers: number;
  followerDelta7d: number;
  impressions: number;
  engagementRate: number; // (begeni+yorum+paylasim)/gosterim
  earningsPart: number;   // PART cinsinden kazanc
  topContentIds: string[];
}

export interface AdCampaignMetrics {
  spendPart: number;
  impressions: number;
  clicks: number;
  ctr: number;            // clicks/impressions
  conversions: number;
  cpaPart: number;        // edinme basina maliyet
}

export function ctr(clicks: number, impressions: number): number {
  return impressions === 0 ? 0 : clicks / impressions;
}
export function engagementRate(interactions: number, impressions: number): number {
  return impressions === 0 ? 0 : interactions / impressions;
}
