import { requireAuth } from "./auth";
import { initMultipart, signPartUrl, completeMultipart, abortMultipart } from "../services/storage";
/** Korumali medya yukleme uclari (S3-uyumlu cok parcali). */
export async function registerUploadRoutes(app) {
    // 1) Yuklemeyi baslat
    app.post("/uploads/init", async (req, reply) => {
        const userId = requireAuth(req, reply);
        if (!userId)
            return;
        const { filename, contentType } = req.body;
        const ext = (filename?.split(".").pop() ?? "bin").toLowerCase();
        if (!/^(mp4|mov|webm|jpg|jpeg|png|gif|webp|svg|pdf|mp3|wav|ogg|m4a)$/.test(ext)) {
            return reply.code(400).send({ error: "Desteklenmeyen dosya turu" });
        }
        const info = await initMultipart(userId, ext, contentType ?? "application/octet-stream");
        // s3UploadId + key'i istemciye doner (sonraki cagrilarda gerekir)
        return info;
    });
    // 2) Parca icin imzali URL
    app.post("/uploads/part", async (req, reply) => {
        const userId = requireAuth(req, reply);
        if (!userId)
            return;
        const { key, s3UploadId, partNumber } = req.body;
        // Guvenlik: key kullanicinin kendi klasorunde mi?
        if (!key?.startsWith(`uploads/${userId}/`))
            return reply.code(403).send({ error: "Yetkisiz anahtar" });
        const url = await signPartUrl(key, s3UploadId, partNumber);
        return { url };
    });
    // 3) Tamamla
    app.post("/uploads/complete", async (req, reply) => {
        const userId = requireAuth(req, reply);
        if (!userId)
            return;
        const { key, s3UploadId, parts } = req.body;
        if (!key?.startsWith(`uploads/${userId}/`))
            return reply.code(403).send({ error: "Yetkisiz anahtar" });
        const result = await completeMultipart(key, s3UploadId, parts);
        return result;
    });
    // 4) Iptal (temizlik)
    app.post("/uploads/abort", async (req, reply) => {
        const userId = requireAuth(req, reply);
        if (!userId)
            return;
        const { key, s3UploadId } = req.body;
        if (!key?.startsWith(`uploads/${userId}/`))
            return reply.code(403).send({ error: "Yetkisiz anahtar" });
        await abortMultipart(key, s3UploadId);
        return { ok: true };
    });
}
