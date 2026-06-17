/** Kesme arayuzu icin zaman cizelgesi yardimci hesaplamalari. */
export interface TrimRange { start: number; end: number; duration: number; }

export function clampRange(r: TrimRange, max: number): TrimRange {
  const start = Math.max(0, Math.min(r.start, max));
  const end = Math.max(start, Math.min(r.end, max));
  return { start, end, duration: end - start };
}

/** Zaman cizelgesinde piksel <-> saniye donusumu. */
export function makeScale(durationSec: number, widthPx: number) {
  return {
    toPx: (sec: number) => (sec / durationSec) * widthPx,
    toSec: (px: number) => (px / widthPx) * durationSec,
  };
}
