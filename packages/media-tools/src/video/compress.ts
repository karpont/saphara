import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

const toBlob = (data: any, type: string): Blob => new Blob([data], { type });

export async function compressVideo(ffmpeg: FFmpeg, file: File, crf = 28): Promise<Blob> {
  await ffmpeg.writeFile("in.mp4", await fetchFile(file));
  await ffmpeg.exec(["-i", "in.mp4", "-vcodec", "libx264", "-crf", String(crf), "-preset", "veryfast", "out.mp4"]);
  return toBlob(await ffmpeg.readFile("out.mp4"), "video/mp4");
}
