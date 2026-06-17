import { S3Client, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, AbortMultipartUploadCommand, } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";
/**
 * S3-uyumlu depolama (AWS S3, Cloudflare R2, MinIO, Backblaze B2).
 * Cok parcali yukleme: istemci her parca icin imzali PUT URL alir,
 * parcalari dogrudan depolamaya yukler (sunucudan gecmez), sonra tamamlatir.
 */
const s3 = new S3Client({
    region: process.env.S3_REGION ?? "auto",
    endpoint: process.env.S3_ENDPOINT, // R2/MinIO icin
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY ?? "",
        secretAccessKey: process.env.S3_SECRET_KEY ?? "",
    },
    forcePathStyle: !!process.env.S3_ENDPOINT, // MinIO/R2 path-style
});
const BUCKET = process.env.S3_BUCKET ?? "saphara-media";
/** Cok parcali yuklemeyi baslatir, S3 uploadId doner. */
export async function initMultipart(userId, ext, contentType) {
    const key = `uploads/${userId}/${randomUUID()}.${ext}`;
    const cmd = new CreateMultipartUploadCommand({ Bucket: BUCKET, Key: key, ContentType: contentType });
    const res = await s3.send(cmd);
    return { uploadId: randomUUID(), key, s3UploadId: res.UploadId };
}
/** Belirli parca icin imzali PUT URL uretir (5 dk gecerli). */
export async function signPartUrl(key, s3UploadId, partNumber) {
    const cmd = new UploadPartCommand({ Bucket: BUCKET, Key: key, UploadId: s3UploadId, PartNumber: partNumber });
    return getSignedUrl(s3, cmd, { expiresIn: 300 });
}
/** Tum parcalar yuklendikten sonra yuklemeyi tamamlar; nihai URL doner. */
export async function completeMultipart(key, s3UploadId, parts) {
    await s3.send(new CompleteMultipartUploadCommand({
        Bucket: BUCKET, Key: key, UploadId: s3UploadId,
        MultipartUpload: { Parts: parts.sort((a, b) => a.PartNumber - b.PartNumber) },
    }));
    const base = process.env.S3_PUBLIC_URL ?? `${process.env.S3_ENDPOINT}/${BUCKET}`;
    return { url: `${base}/${key}` };
}
/** Hata/iptal durumunda yarim yuklemeyi temizler. */
export async function abortMultipart(key, s3UploadId) {
    await s3.send(new AbortMultipartUploadCommand({ Bucket: BUCKET, Key: key, UploadId: s3UploadId }));
}
