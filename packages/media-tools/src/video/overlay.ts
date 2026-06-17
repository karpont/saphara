import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

const toBlob = (data: any, type: string): Blob => new Blob([data], { type });

export interface TextOverlayOpts {
  text: string;
  x?: number;
  y?: number;
  fontSize?: number;
  color?: string;
  startSec?: number;
  endSec?: number;
}

export async function addVideoText(ffmpeg: FFmpeg, video: File, opts: TextOverlayOpts): Promise<Blob> {
  await ffmpeg.writeFile("in.mp4", await fetchFile(video));
  const size = opts.fontSize ?? 36;
  const color = opts.color ?? "white";
  const x = opts.x ?? "(w-text_w)/2";
  const y = opts.y ?? "h-text_h-40";
  const safe = opts.text.replace(/'/g, "").replace(/:/g, "\\:");
  let draw = `drawtext=text='${safe}':fontsize=${size}:fontcolor=${color}:x=${x}:y=${y}:box=1:boxcolor=black@0.4:boxborderw=8`;
  if (opts.startSec != null && opts.endSec != null) {
    draw += `:enable='between(t,${opts.startSec},${opts.endSec})'`;
  }
  await ffmpeg.exec(["-i", "in.mp4", "-vf", draw, "-c:a", "copy", "out.mp4"]);
  return toBlob(await ffmpeg.readFile("out.mp4"), "video/mp4");
}

export async function addVideoImage(ffmpeg: FFmpeg, video: File, image: File, x = 20, y = 20): Promise<Blob> {
  await ffmpeg.writeFile("in.mp4", await fetchFile(video));
  await ffmpeg.writeFile("ovl.png", await fetchFile(image));
  await ffmpeg.exec(["-i", "in.mp4", "-i", "ovl.png", "-filter_complex", `overlay=${x}:${y}`, "-c:a", "copy", "out.mp4"]);
  return toBlob(await ffmpeg.readFile("out.mp4"), "video/mp4");
}
