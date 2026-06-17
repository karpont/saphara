import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

const toBlob = (data: any, type: string): Blob => new Blob([data], { type });

/**
 * Hız değişimi — setpts (video) + atempo (ses).
 * speed: 0.25–4.0  (1 = normal)
 */
export async function changeSpeed(ffmpeg: FFmpeg, file: File, speed: number): Promise<Blob> {
  await ffmpeg.writeFile("in.mp4", await fetchFile(file));
  const vFilter = `setpts=${(1 / speed).toFixed(4)}*PTS`;
  // atempo sadece 0.5–2.0 aralığında geçerli; dışında zincir oluştur
  let aFilter: string;
  if (speed <= 0.5) {
    aFilter = `atempo=0.5,atempo=${(speed / 0.5).toFixed(4)}`;
  } else if (speed >= 2.0) {
    aFilter = `atempo=2.0,atempo=${(speed / 2.0).toFixed(4)}`;
  } else {
    aFilter = `atempo=${speed.toFixed(4)}`;
  }
  await ffmpeg.exec([
    "-i", "in.mp4",
    "-vf", vFilter,
    "-af", aFilter,
    "-c:v", "libx264", "-crf", "26", "-preset", "veryfast",
    "-c:a", "aac",
    "out.mp4",
  ]);
  return toBlob(await ffmpeg.readFile("out.mp4"), "video/mp4");
}

/**
 * Döndürme — transpose filtresi.
 * angle: 0 | 90 | 180 | -90 (270)
 */
export async function rotateVideo(ffmpeg: FFmpeg, file: File, angle: number): Promise<Blob> {
  await ffmpeg.writeFile("in.mp4", await fetchFile(file));
  let vf: string;
  if (angle === 90)       vf = "transpose=1";
  else if (angle === -90) vf = "transpose=2";
  else if (angle === 180) vf = "transpose=1,transpose=1";
  else                    vf = "null"; // 0 derece
  await ffmpeg.exec([
    "-i", "in.mp4",
    "-vf", vf,
    "-c:v", "libx264", "-crf", "23", "-preset", "veryfast",
    "-c:a", "copy",
    "out.mp4",
  ]);
  return toBlob(await ffmpeg.readFile("out.mp4"), "video/mp4");
}

/**
 * Kırpma — crop filtresi (yüzde cinsinden).
 * cropW/cropH: 0–100 (yüzde)
 * Hedef en-boy oranı: "16:9" | "9:16" | "1:1" | "4:3" | "free"
 */
export async function cropVideo(
  ffmpeg: FFmpeg,
  file: File,
  cropW = 100,
  cropH = 100,
  aspect?: string,
): Promise<Blob> {
  await ffmpeg.writeFile("in.mp4", await fetchFile(file));
  let vf: string;
  if (aspect === "16:9")  vf = "crop=iw:iw*9/16";
  else if (aspect === "9:16") vf = "crop=ih*9/16:ih";
  else if (aspect === "1:1")  vf = "crop=min(iw\\,ih):min(iw\\,ih)";
  else if (aspect === "4:3")  vf = "crop=iw:iw*3/4";
  else {
    const w = `iw*${(cropW / 100).toFixed(3)}`;
    const h = `ih*${(cropH / 100).toFixed(3)}`;
    vf = `crop=${w}:${h}`;
  }
  await ffmpeg.exec([
    "-i", "in.mp4",
    "-vf", vf,
    "-c:v", "libx264", "-crf", "23", "-preset", "veryfast",
    "-c:a", "copy",
    "out.mp4",
  ]);
  return toBlob(await ffmpeg.readFile("out.mp4"), "video/mp4");
}

/**
 * Renk/Parlaklık ayarı — eq filtresi.
 * brightness: -1.0 – 1.0 (ffmpeg eq: -1 koyu, 1 açık; default 0)
 * contrast:    -1000–1000 (ffmpeg; biz 0.2–2 → map -1.0–1.0)
 * saturation:  0–3 (ffmpeg default 1)
 * gamma:       0.1–10 (default 1)
 */
export async function adjustColors(
  ffmpeg: FFmpeg,
  file: File,
  brightness = 0,
  contrast   = 1,
  saturation = 1,
  gamma      = 1,
): Promise<Blob> {
  await ffmpeg.writeFile("in.mp4", await fetchFile(file));
  // ffmpeg eq: brightness -1..1, contrast 0..1000, saturation 0..3, gamma 0.1..10
  const b = Math.max(-1, Math.min(1, brightness - 1));   // UI slider 0.2–2 → ffmpeg -1..1
  const c = Math.max(0.1, Math.min(10, contrast));
  const s = Math.max(0,   Math.min(3,  saturation));
  const g = Math.max(0.1, Math.min(10, gamma));
  const eq = `eq=brightness=${b.toFixed(3)}:contrast=${c.toFixed(3)}:saturation=${s.toFixed(3)}:gamma=${g.toFixed(3)}`;
  await ffmpeg.exec([
    "-i", "in.mp4",
    "-vf", eq,
    "-c:v", "libx264", "-crf", "23", "-preset", "veryfast",
    "-c:a", "copy",
    "out.mp4",
  ]);
  return toBlob(await ffmpeg.readFile("out.mp4"), "video/mp4");
}

/**
 * Video bölme — belirtilen noktadan iki parçaya ayırır.
 * splitSec: kesim noktası (saniye)
 * Döner: [part1Blob, part2Blob]
 */
export async function splitVideo(ffmpeg: FFmpeg, file: File, splitSec: number): Promise<[Blob, Blob]> {
  await ffmpeg.writeFile("in.mp4", await fetchFile(file));
  // Part 1: baştan splitSec'e kadar
  await ffmpeg.exec(["-i", "in.mp4", "-t", String(splitSec), "-c", "copy", "part1.mp4"]);
  // Part 2: splitSec'ten sona
  await ffmpeg.exec(["-ss", String(splitSec), "-i", "in.mp4", "-c", "copy", "part2.mp4"]);
  const p1 = toBlob(await ffmpeg.readFile("part1.mp4"), "video/mp4");
  const p2 = toBlob(await ffmpeg.readFile("part2.mp4"), "video/mp4");
  return [p1, p2];
}

/**
 * Filtre uygulama — önceden tanımlı eq ön ayarları.
 */
const FILTER_PRESETS: Record<string, string> = {
  none:       "null",
  vivid:      "eq=contrast=1.3:saturation=1.5",
  vintage:    "eq=contrast=0.9:saturation=0.6:brightness=-0.05,colorchannelmixer=.3:.4:.3:0:.3:.4:.3:0:.3:.4:.3",
  "b&w":      "colorchannelmixer=.3:.59:.11:0:.3:.59:.11:0:.3:.59:.11",
  dramatic:   "eq=contrast=1.5:brightness=-0.1:saturation=1.2",
  warm:       "colorchannelmixer=1:0:0:0:0.9:0:0:0:0.7",
  cool:       "colorchannelmixer=0.8:0:0:0:0.9:0:0:0:1.1",
  fade:       "eq=contrast=0.8:brightness=0.1:saturation=0.7",
};

export async function applyFilterPreset(ffmpeg: FFmpeg, file: File, preset: string): Promise<Blob> {
  await ffmpeg.writeFile("in.mp4", await fetchFile(file));
  const vf = FILTER_PRESETS[preset] ?? "null";
  await ffmpeg.exec([
    "-i", "in.mp4",
    "-vf", vf,
    "-c:v", "libx264", "-crf", "24", "-preset", "veryfast",
    "-c:a", "copy",
    "out.mp4",
  ]);
  return toBlob(await ffmpeg.readFile("out.mp4"), "video/mp4");
}

export const VIDEO_FILTER_PRESETS = Object.keys(FILTER_PRESETS);
