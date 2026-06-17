/**
 * Token-bucket oran sinirlama. API kotuye kullanimini ve bot saldirilarini
 * yavaslatir. Kullaniciya karsi degil, platformu korumak icindir.
 */
export class RateLimiter {
  private buckets = new Map<string, { tokens: number; last: number }>();
  constructor(private capacity: number, private refillPerSec: number) {}

  allow(key: string, cost = 1): boolean {
    const now = Date.now() / 1000;
    const b = this.buckets.get(key) ?? { tokens: this.capacity, last: now };
    b.tokens = Math.min(this.capacity, b.tokens + (now - b.last) * this.refillPerSec);
    b.last = now;
    if (b.tokens < cost) { this.buckets.set(key, b); return false; }
    b.tokens -= cost;
    this.buckets.set(key, b);
    return true;
  }
}
