/**
 * Anti-fraud: sahte/coklu hesap ve supheli cuzdan aktivitesi tespiti.
 * Karari otomatik banlamak degil, incelemeye almak (review queue) icindir.
 */
export interface AccountSignals {
  deviceFingerprintReuseCount: number; // ayni cihazda kac hesap
  walletAgeDays: number;
  rapidFollowActions: number;          // kisa surede asiri takip
  payoutVelocityScore: number;         // ani buyuk para cekme
}

export function fraudRiskLevel(s: AccountSignals): "low" | "medium" | "high" {
  let pts = 0;
  if (s.deviceFingerprintReuseCount > 3) pts += 2;
  if (s.walletAgeDays < 2) pts += 1;
  if (s.rapidFollowActions > 50) pts += 2;
  if (s.payoutVelocityScore > 0.8) pts += 2;
  if (pts >= 5) return "high";
  if (pts >= 2) return "medium";
  return "low";
}
