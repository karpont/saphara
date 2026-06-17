import { loadImage } from "../image/edit";

/** Resim uzerine metin overlay ekler (story/post grafikleri icin). */
export async function addTextOverlay(
  file: File,
  text: string,
  opts: { x?: number; y?: number; size?: number; color?: string } = {}
): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.width; canvas.height = img.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  ctx.font = `bold ${opts.size ?? 48}px sans-serif`;
  ctx.fillStyle = opts.color ?? "#ffffff";
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = 8;
  ctx.fillText(text, opts.x ?? 40, opts.y ?? canvas.height - 60);
  return await new Promise((res) => canvas.toBlob((b) => res(b!), "image/png"));
}

/** Hazir gonderi boyutlari (story, kare post, yatay). */
export const CANVAS_SIZES = {
  story: { w: 1080, h: 1920 },
  square: { w: 1080, h: 1080 },
  landscape: { w: 1280, h: 720 },
  reel: { w: 1080, h: 1920 },
} as const;
