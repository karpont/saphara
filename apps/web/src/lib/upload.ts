"use client";
import { api } from "./api";
import { chunkedUpload } from "@saphara/media-tools";

/**
 * Dosyayi S3-uyumlu depolamaya cok parcali yukler.
 * Backend imzali URL'leri uretir; parcalar dogrudan depolamaya gider.
 * Donen nihai URL gonderi/reel olustururken mediaUrl olarak kullanilir.
 */
export async function uploadMedia(file: File, onProgress?: (r: number) => void): Promise<string> {
  // 1) Baslat
  const init = await api.post<{ uploadId: string; key: string; s3UploadId: string }>(
    "/uploads/init", { filename: file.name, contentType: file.type }
  );

  const etags: { ETag: string; PartNumber: number }[] = [];
  let partNumber = 0;

  // 2) chunkedUpload her parca icin imzali URL alir ve PUT eder
  const result = await chunkedUpload(file, init.uploadId, {
    getUploadUrl: async ({ partNumber: pn }) => {
      partNumber = pn;
      const { url } = await api.post<{ url: string }>("/uploads/part", {
        key: init.key, s3UploadId: init.s3UploadId, partNumber: pn,
      });
      return url;
    },
    complete: async () => {
      return api.post<{ url: string }>("/uploads/complete", {
        key: init.key, s3UploadId: init.s3UploadId, parts: etags,
      });
    },
    onProgress,
  });

  return result.url;
}
