const STYLES = ["adventurer", "bottts", "lorelei", "bottts-neutral"] as const;
const BG = ["b6e3f4", "ffdfbf", "c0aede", "d1d4f9", "ffd5dc", "b6f4b6"] as const;

export function getAvatarUrl(handle: string, avatarUrl?: string | null): string {
  if (avatarUrl) return avatarUrl;
  const code = handle ? handle.charCodeAt(0) + (handle.charCodeAt(1) || 0) : 0;
  const style = STYLES[code % STYLES.length];
  const bg    = BG[code % BG.length];
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(handle)}&backgroundColor=${bg}&size=150`;
}
