import { spawn } from "node:child_process";
import { createLogger } from "@saphara/security";

/**
 * Sunucu tarafi transcoding. Buyuk videolar tarayicida ffmpeg.wasm ile yavas
 * oldugundan, esik ustu dosyalar buraya yonlendirilir. Sistemde kurulu
 * native ffmpeg kullanir (ffmpeg.wasm'dan cok daha hizli).
 *
 * Basit bellek-ici kuyruk; uretimde BullMQ + Redis ile olceklenir.
 */

const log = createLogger();

export interface TranscodeJob {
  id: string;
  inputPath: string;
  outputPath: string;
  preset: "reel" | "hd" | "sd" | "audio";
  status: "queued" | "processing" | "done" | "error";
  progress: number;
  error?: string;
}

const queue: TranscodeJob[] = [];
const jobs = new Map<string, TranscodeJob>();
let working = false;

/** Esik (MB) — bunun ustu sunucuda islenir, alti tarayicida. */
export const SERVER_TRANSCODE_THRESHOLD_MB = 50;

const PRESETS: Record<TranscodeJob["preset"], string[]> = {
  // 9:16 dikey Reels, web-uyumlu H.264
  reel: ["-vf", "scale=1080:-2", "-c:v", "libx264", "-preset", "fast", "-crf", "26", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart"],
  hd:   ["-vf", "scale=1280:-2", "-c:v", "libx264", "-preset", "fast", "-crf", "23", "-c:a", "aac", "-movflags", "+faststart"],
  sd:   ["-vf", "scale=854:-2",  "-c:v", "libx264", "-preset", "veryfast", "-crf", "28", "-c:a", "aac"],
  audio:["-vn", "-acodec", "libmp3lame", "-b:a", "192k"],
};

export function enqueueTranscode(input: string, output: string, preset: TranscodeJob["preset"]): TranscodeJob {
  const job: TranscodeJob = {
    id: `tc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    inputPath: input, outputPath: output, preset, status: "queued", progress: 0,
  };
  jobs.set(job.id, job);
  queue.push(job);
  void drain();
  return job;
}

export function getJob(id: string): TranscodeJob | undefined {
  return jobs.get(id);
}

async function drain() {
  if (working) return;
  working = true;
  while (queue.length) {
    const job = queue.shift()!;
    job.status = "processing";
    try {
      await runFfmpeg(job);
      job.status = "done"; job.progress = 100;
      log.info("transcode tamam", { id: job.id });
    } catch (e) {
      job.status = "error"; job.error = (e as Error).message;
      log.error("transcode hata", { id: job.id, err: job.error });
    }
  }
  working = false;
}

function runFfmpeg(job: TranscodeJob): Promise<void> {
  return new Promise((resolve, reject) => {
    const args = ["-i", job.inputPath, ...PRESETS[job.preset], "-y", job.outputPath];
    const proc = spawn("ffmpeg", args);
    let totalSec = 0;

    proc.stderr.on("data", (d: Buffer) => {
      const s = d.toString();
      const dur = s.match(/Duration: (\d+):(\d+):(\d+)/);
      if (dur) totalSec = +dur[1] * 3600 + +dur[2] * 60 + +dur[3];
      const cur = s.match(/time=(\d+):(\d+):(\d+)/);
      if (cur && totalSec) {
        const t = +cur[1] * 3600 + +cur[2] * 60 + +cur[3];
        job.progress = Math.min(99, Math.round((t / totalSec) * 100));
      }
    });
    proc.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg cikis kodu ${code}`))));
    proc.on("error", (err) => reject(err)); // ffmpeg kurulu degilse
  });
}
