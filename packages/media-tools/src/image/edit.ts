/**
 * Canvas tabanli resim araclari (tarayici). Harici bagimlilik gerektirmez.
 */

export async function loadImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  const img = new Image();
  await new Promise((res, rej) => {
    img.onload = () => res(null);
    img.onerror = rej;
    img.src = url;
  });
  return img;
}

/** Resmi belirtilen dikdortgene kirpar. */
export async function cropImage(
  file: File,
  x: number, y: number, w: number, h: number
): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
  return await new Promise((res) => canvas.toBlob((b) => res(b!), "image/jpeg", 0.92));
}

/** En-boy oranini koruyarak yeniden boyutlandirir (maks. genislik). */
export async function resizeImage(file: File, maxWidth: number): Promise<Blob> {
  const img = await loadImage(file);
  const scale = Math.min(1, maxWidth / img.width);
  const canvas = document.createElement("canvas");
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return await new Promise((res) => canvas.toBlob((b) => res(b!), "image/jpeg", 0.9));
}

/** Basit filtreler (CSS filter string ile). */
export async function applyFilter(file: File, filter: string): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.width; canvas.height = img.height;
  const ctx = canvas.getContext("2d")!;
  ctx.filter = filter; // ornek: "contrast(1.2) saturate(1.3) brightness(1.05)"
  ctx.drawImage(img, 0, 0);
  return await new Promise((res) => canvas.toBlob((b) => res(b!), "image/jpeg", 0.92));
}

export const PRESET_FILTERS = {
  none: "none",
  vivid: "contrast(1.15) saturate(1.4) brightness(1.05)",
  mono: "grayscale(1) contrast(1.1)",
  warm: "sepia(0.3) saturate(1.2)",
  cool: "hue-rotate(-15deg) saturate(1.1)",
  fade: "contrast(0.9) brightness(1.1) saturate(0.85)",
} as const;
