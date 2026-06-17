import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

const toBlob = (data: any, type: string): Blob => new Blob([data], { type });

export async function trimVideo(ffmpeg: FFmpeg, file: File, startSec: number, endSec: number): Promise<Blob> {
  await ffmpeg.writeFile("in.mp4", await fetchFile(file));
  const duration = Math.max(0, endSec - startSec);
  await ffmpeg.exec(["-ss", String(startSec), "-i", "in.mp4", "-t", String(duration), "-c", "copy", "out.mp4"]);
  return toBlob(await ffmpeg.readFile("out.mp4"), "video/mp4");
}
