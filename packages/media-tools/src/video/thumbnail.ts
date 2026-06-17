import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

const toBlob = (data: any, type: string): Blob => new Blob([data], { type });

export async function extractThumbnail(ffmpeg: FFmpeg, file: File, atSec = 1): Promise<Blob> {
  await ffmpeg.writeFile("in.mp4", await fetchFile(file));
  await ffmpeg.exec(["-ss", String(atSec), "-i", "in.mp4", "-frames:v", "1", "thumb.jpg"]);
  return toBlob(await ffmpeg.readFile("thumb.jpg"), "image/jpeg");
}
