import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

function toBlob(data: any, type: string): Blob {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return new Blob([data], { type });
}

export async function replaceAudio(ffmpeg: FFmpeg, video: File, audio: File): Promise<Blob> {
  await ffmpeg.writeFile("in.mp4", await fetchFile(video));
  await ffmpeg.writeFile("audio.mp3", await fetchFile(audio));
  await ffmpeg.exec(["-i", "in.mp4", "-i", "audio.mp3", "-c:v", "copy", "-map", "0:v:0", "-map", "1:a:0", "-shortest", "out.mp4"]);
  return toBlob(await ffmpeg.readFile("out.mp4"), "video/mp4");
}

export async function muteVideo(ffmpeg: FFmpeg, video: File): Promise<Blob> {
  await ffmpeg.writeFile("in.mp4", await fetchFile(video));
  await ffmpeg.exec(["-i", "in.mp4", "-c:v", "copy", "-an", "out.mp4"]);
  return toBlob(await ffmpeg.readFile("out.mp4"), "video/mp4");
}

export async function setVolume(ffmpeg: FFmpeg, video: File, volume: number): Promise<Blob> {
  await ffmpeg.writeFile("in.mp4", await fetchFile(video));
  await ffmpeg.exec(["-i", "in.mp4", "-filter:a", `volume=${volume}`, "-c:v", "copy", "out.mp4"]);
  return toBlob(await ffmpeg.readFile("out.mp4"), "video/mp4");
}

export async function extractAudio(ffmpeg: FFmpeg, video: File): Promise<Blob> {
  await ffmpeg.writeFile("in.mp4", await fetchFile(video));
  await ffmpeg.exec(["-i", "in.mp4", "-vn", "-acodec", "libmp3lame", "out.mp3"]);
  return toBlob(await ffmpeg.readFile("out.mp3"), "audio/mp3");
}
