import { requireAuth } from "./auth";
import { enqueueTranscode, getJob, SERVER_TRANSCODE_THRESHOLD_MB } from "../services/transcode";
/**
 * Transcoding uclari. Istemci once /transcode/should-server ile karar verir:
 * buyuk dosya → sunucu (bu uclar), kucuk → tarayici (ffmpeg.wasm).
 */
export async function registerTranscodeRoutes(app) {
    // Karar: dosya boyutuna gore sunucu mu tarayici mi?
    app.get("/transcode/should-server", async (req) => {
        const sizeMb = Number(req.query.sizeMb ?? 0);
        return {
            useServer: sizeMb > SERVER_TRANSCODE_THRESHOLD_MB,
            thresholdMb: SERVER_TRANSCODE_THRESHOLD_MB,
        };
    });
    // Sunucuda transcode isi baslat (dosya zaten depolamaya yuklenmis olmali)
    app.post("/transcode", async (req, reply) => {
        const userId = requireAuth(req, reply);
        if (!userId)
            return;
        const { inputPath, outputPath, preset } = req.body;
        if (!inputPath || !outputPath)
            return reply.code(400).send({ error: "inputPath ve outputPath gerekli" });
        const job = enqueueTranscode(inputPath, outputPath, preset ?? "hd");
        return reply.code(202).send({ jobId: job.id, status: job.status });
    });
    // Is durumu (ilerleme)
    app.get("/transcode/:id", async (req, reply) => {
        const { id } = req.params;
        const job = getJob(id);
        if (!job)
            return reply.code(404).send({ error: "Is bulunamadi" });
        return { id: job.id, status: job.status, progress: job.progress, error: job.error };
    });
}
