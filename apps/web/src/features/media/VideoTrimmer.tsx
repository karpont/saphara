"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Scissors, Download, Upload as UploadIcon } from "lucide-react";
import { makeScale, clampRange, type TrimRange } from "@saphara/media-tools";

/**
 * Video kesme editoru.
 * - Dosya secilir, video onizlenir.
 * - Zaman cizelgesinde iki tutamac (baslangic / bitis) surulerek aralik secilir.
 * - "Kes" basildiginda ffmpeg.wasm ile tarayicida kesilir.
 *
 * ffmpeg yuklemesi agirdir; lazy (dinamik import) yapilir.
 */
export function VideoTrimmer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string>("");
  const [duration, setDuration] = useState(0);
  const [range, setRange] = useState<TrimRange>({ start: 0, end: 0, duration: 0 });
  const [busy, setBusy] = useState(false);
  const [resultUrl, setResultUrl] = useState<string>("");
  const [progress, setProgress] = useState<string>("");

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setResultUrl("");
    setUrl(URL.createObjectURL(f));
  };

  const onLoadedMeta = () => {
    const d = videoRef.current?.duration ?? 0;
    setDuration(d);
    setRange({ start: 0, end: d, duration: d });
  };

  // Tutamac surukleme
  const dragHandle = useCallback(
    (which: "start" | "end") => (e: React.PointerEvent) => {
      e.preventDefault();
      const track = trackRef.current;
      if (!track || !duration) return;
      const rect = track.getBoundingClientRect();
      const scale = makeScale(duration, rect.width);

      const move = (ev: PointerEvent) => {
        const sec = scale.toSec(Math.max(0, Math.min(ev.clientX - rect.left, rect.width)));
        setRange((prev) => {
          const next = which === "start"
            ? { ...prev, start: Math.min(sec, prev.end - 0.1) }
            : { ...prev, end: Math.max(sec, prev.start + 0.1) };
          const c = clampRange(next, duration);
          if (videoRef.current) videoRef.current.currentTime = which === "start" ? c.start : c.end;
          return c;
        });
      };
      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    },
    [duration]
  );

  const scale = duration ? makeScale(duration, 100) : null; // yuzde bazli
  const startPct = scale ? scale.toPx(range.start) : 0;
  const endPct = scale ? scale.toPx(range.end) : 100;

  const handleTrim = async () => {
    if (!file) return;
    setBusy(true);
    setProgress("ffmpeg yukleniyor…");
    try {
      // Lazy import: ffmpeg paketi agir
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");
      const { toBlobURL } = await import("@ffmpeg/util");
      const { trimVideo } = await import("@saphara/media-tools");

      const ffmpeg = new FFmpeg();
      const base = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
      await ffmpeg.load({
        coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, "application/wasm"),
      });

      setProgress("Kesiliyor…");
      const blob = await trimVideo(ffmpeg, file, range.start, range.end);
      setResultUrl(URL.createObjectURL(blob));
      setProgress("Tamamlandi");
    } catch (err) {
      setProgress("Hata: " + (err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);

  return (
    <div className="trimmer">
      <header className="topbar"><h1>Video Kesme</h1></header>

      {!file ? (
        <label className="dropzone">
          <UploadIcon size={32} />
          <span>Video sec veya surukle</span>
          <input type="file" accept="video/*" onChange={onSelect} hidden />
        </label>
      ) : (
        <div className="trim-stage">
          <video ref={videoRef} src={url} onLoadedMetadata={onLoadedMeta} controls />

          <div className="timeline">
            <div className="track" ref={trackRef}>
              <div
                className="selection"
                style={{ left: `${startPct}%`, width: `${endPct - startPct}%` }}
              />
              <div className="handle start" style={{ left: `${startPct}%` }} onPointerDown={dragHandle("start")} />
              <div className="handle end" style={{ left: `${endPct}%` }} onPointerDown={dragHandle("end")} />
            </div>
            <div className="time-labels">
              <span>{range.start.toFixed(1)}s</span>
              <span>Sure: {(range.end - range.start).toFixed(1)}s</span>
              <span>{range.end.toFixed(1)}s</span>
            </div>
          </div>

          <div className="trim-buttons">
            <button className="primary" disabled={busy} onClick={handleTrim}>
              <Scissors size={18} /> {busy ? "Isleniyor…" : "Kes"}
            </button>
            {resultUrl && (
              <a className="primary" href={resultUrl} download="saphara-kesim.mp4">
                <Download size={18} /> Indir
              </a>
            )}
          </div>
          {progress && <p className="muted">{progress}</p>}
          {resultUrl && <video className="result" src={resultUrl} controls />}
        </div>
      )}
    </div>
  );
}
