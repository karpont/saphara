/**
 * Parcali (chunked) yukleme. Buyuk video/resim dosyalarini parcalara boler,
 * ilerleme bildirir ve kesintide devam ettirilebilir.
 */
export interface UploadHandlers {
  /** Her parca icin imzali yukleme URL'i alir (backend saglar). */
  getUploadUrl: (params: { uploadId: string; partNumber: number }) => Promise<string>;
  /** Tum parcalar bitince yuklemeyi tamamlatir. */
  complete: (uploadId: string) => Promise<{ url: string }>;
  onProgress?: (ratio: number) => void;
}

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

export async function chunkedUpload(
  file: File,
  uploadId: string,
  handlers: UploadHandlers
): Promise<{ url: string }> {
  const total = Math.ceil(file.size / CHUNK_SIZE);
  for (let part = 0; part < total; part++) {
    const blob = file.slice(part * CHUNK_SIZE, (part + 1) * CHUNK_SIZE);
    const url = await handlers.getUploadUrl({ uploadId, partNumber: part + 1 });
    await fetch(url, { method: "PUT", body: blob });
    handlers.onProgress?.((part + 1) / total);
  }
  return handlers.complete(uploadId);
}
