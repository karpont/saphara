/**
 * Referral ödül hesaplama — kademeli, USD değeri sabit (PART fiyatına göre otomatik ayarlanır).
 * Baz: $0.01/PART fiyatında 5/10/15/20/25 PART hedefleri.
 */
import { getPartMarketData } from "./market-data";

const USD_TIERS: { maxCount: number; usdTarget: number }[] = [
  { maxCount: 10,       usdTarget: 0.05 }, // 1-10. referral   → 5 PART
  { maxCount: 20,       usdTarget: 0.10 }, // 11-20. referral  → 10 PART
  { maxCount: 30,       usdTarget: 0.15 }, // 21-30. referral  → 15 PART
  { maxCount: 40,       usdTarget: 0.20 }, // 31-40. referral  → 20 PART
  { maxCount: Infinity, usdTarget: 0.25 }, // 41+. referral    → 25 PART
];

const MIN_PRICE_FLOOR = 0.0001; // priceUsd 0'a yakınsa bölme patlamasın

/** referralCount = bu ödülün ait olduğu sıradaki referral numarası (1, 2, 3, ...) */
export async function calcReferralReward(referralCount: number): Promise<number> {
  const tier = USD_TIERS.find((t) => referralCount <= t.maxCount) ?? USD_TIERS[USD_TIERS.length - 1];
  const { priceUsd } = await getPartMarketData();
  const price = priceUsd > MIN_PRICE_FLOOR ? priceUsd : MIN_PRICE_FLOOR;
  const partAmount = tier.usdTarget / price;
  return Math.round(partAmount * 100) / 100;
}
