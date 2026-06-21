/**
 * Referral ödül hesaplama — kademeli, USD değeri sabit (PART fiyatına göre otomatik ayarlanır).
 * Baz: $0.01/PART fiyatında 1/10/20/50 PART hedefleri (5/10/20/50. davet kademeleri).
 */
import { getPartMarketData } from "./market-data";

const USD_TIERS: { maxCount: number; usdTarget: number }[] = [
  { maxCount: 5,        usdTarget: 0.01 }, // 1-5. referral    → 1 PART
  { maxCount: 10,       usdTarget: 0.10 }, // 6-10. referral   → 10 PART
  { maxCount: 20,       usdTarget: 0.20 }, // 11-20. referral  → 20 PART
  { maxCount: Infinity, usdTarget: 0.50 }, // 21+. referral    → 50 PART
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
