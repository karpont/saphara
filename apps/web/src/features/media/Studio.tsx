"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import {
  Scissors, Type, Sparkles, Image as ImageIcon, Music, Minimize2,
  Upload, Download, Loader2, Zap, RotateCw, Split,
  Sliders, Captions, Gauge, Crop, Send, Check,
} from "lucide-react";
import { makeScale, clampRange, type TrimRange, PRESET_FILTERS } from "@saphara/media-tools";
import { uploadMedia } from "../../lib/upload";
import { useCreatePost } from "../../hooks/useApi";

type Tool = "trim"|"split"|"text"|"filter"|"thumb"|"audio"|"compress"|"speed"|"crop"|"brightness"|"subtitle"|"rotate"|"effect";

async function loadFFmpeg() {
  const { FFmpeg } = await import("@ffmpeg/ffmpeg");
  const { toBlobURL } = await import("@ffmpeg/util");
  const ff = new FFmpeg();
  const base = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
  await ff.load({
    coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, "application/wasm"),
  });
  return ff;
}

const TOOLS: { id: Tool; label: string; icon: any }[] = [
  { id: "trim",       label: "Kes/Kırp",       icon: Scissors  },
  { id: "split",      label: "Böl",             icon: Split     },
  { id: "speed",      label: "Hız",             icon: Gauge     },
  { id: "crop",       label: "Boyut/Oran",      icon: Crop      },
  { id: "rotate",     label: "Döndür",          icon: RotateCw  },
  { id: "brightness", label: "Renk & Işık",     icon: Sliders   },
  { id: "filter",     label: "Filtre",          icon: Sparkles  },
  { id: "effect",     label: "Efekt",           icon: Zap       },
  { id: "text",       label: "Metin",           icon: Type      },
  { id: "subtitle",   label: "Altyazı",         icon: Captions  },
  { id: "audio",      label: "Ses",             icon: Music     },
  { id: "thumb",      label: "Kapak",           icon: ImageIcon },
  { id: "compress",   label: "Boyut Küçült",    icon: Minimize2 },
];

const FILTER_NAMES = ["none","vivid","vintage","b&w","dramatic","warm","cool","fade"];
const ASPECT_OPTS  = [
  { label: "Serbest", value: "free"  },
  { label: "16:9",    value: "16:9"  },
  { label: "9:16 Reels", value: "9:16" },
  { label: "1:1",     value: "1:1"   },
  { label: "4:3",     value: "4:3"   },
];

export function Studio() {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const trackRef  = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const audioInput = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [url,  setUrl]  = useState("");
  const [duration, setDuration] = useState(0);
  const [tool, setTool] = useState<Tool>("trim");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [resultUrl,  setResultUrl]  = useState("");
  const [resultUrl2, setResultUrl2] = useState(""); // split parça 2
  const [resultType, setResultType] = useState<"video"|"image"|"audio">("video");
  const [publishState, setPublishState] = useState<"idle"|"publishing"|"done"|"error">("idle");
  const [publishMsg,   setPublishMsg]   = useState("");
  const createPost = useCreatePost();

  // ── Araç durumları ───────────────────────────────────────
  const [range,      setRange]      = useState<TrimRange>({ start: 0, end: 0, duration: 0 });
  const [splitAt,    setSplitAt]    = useState(0);
  const [text,       setText]       = useState("Saphara");
  const [textColor,  setTextColor]  = useState("white");
  const [textStart,  setTextStart]  = useState(0);
  const [textEnd,    setTextEnd]    = useState(0);
  const [filter,     setFilter]     = useState("none");
  const [thumbTime,  setThumbTime]  = useState(1);
  const [volume,     setVolume]     = useState(1);
  const [crf,        setCrf]        = useState(28);
  const [speed,      setSpeed]      = useState(1.0);
  const [brightness, setBrightness] = useState(1.0);
  const [contrast,   setContrast]   = useState(1.0);
  const [saturation, setSaturation] = useState(1.0);
  const [gamma,      setGamma]      = useState(1.0);
  const [subtitleText, setSubtitleText] = useState("");
  const [rotationAngle, setRotationAngle] = useState(0);
  const [cropW,   setCropW]   = useState(100);
  const [cropH,   setCropH]   = useState(100);
  const [aspect,  setAspect]  = useState("free");
  const [effect,  setEffect]  = useState("Yok");

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f); setResultUrl(""); setResultUrl2(""); setUrl(URL.createObjectURL(f));
    setProgress(""); setPublishState("idle"); setPublishMsg("");
  };

  const onLoadedMeta = () => {
    const d = videoRef.current?.duration ?? 0;
    setDuration(d);
    setRange({ start: 0, end: d, duration: d });
    setTextEnd(d); setSplitAt(d / 2);
  };

  // Timeline sürükleme
  const dragHandle = useCallback((which: "start" | "end") => (e: React.PointerEvent) => {
    e.preventDefault();
    const track = trackRef.current;
    if (!track || !duration) return;
    const rect  = track.getBoundingClientRect();
    const scale = makeScale(duration, rect.width);
    const move  = (ev: PointerEvent) => {
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
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }, [duration]);

  const scale    = duration ? makeScale(duration, 100) : null;
  const startPct = scale ? scale.toPx(range.start)  : 0;
  const endPct   = scale ? scale.toPx(range.end)    : 100;
  const splitPct = scale ? scale.toPx(splitAt)      : 50;

  // ── Ana işlem ───────────────────────────────────────────
  const run = async () => {
    if (!file) return;
    setBusy(true); setProgress("FFmpeg yükleniyor…"); setResultUrl(""); setResultUrl2("");
    try {
      const mt = await import("@saphara/media-tools");
      const ff = await loadFFmpeg();
      let blob: Blob;

      switch (tool) {
        case "trim":
          setProgress("Kesiliyor…");
          blob = await mt.trimVideo(ff, file, range.start, range.end);
          setResultType("video"); break;

        case "split": {
          setProgress("Bölünüyor…");
          const [p1, p2] = await mt.splitVideo(ff, file, splitAt);
          setResultUrl(URL.createObjectURL(p1));
          setResultUrl2(URL.createObjectURL(p2));
          setResultType("video");
          setProgress("Bölme tamamlandı — 2 parça");
          setBusy(false); return;
        }

        case "speed":
          setProgress(`Hız ${speed}x ayarlanıyor…`);
          blob = await mt.changeSpeed(ff, file, speed);
          setResultType("video"); break;

        case "rotate":
          setProgress(`${rotationAngle}° döndürülüyor…`);
          blob = await mt.rotateVideo(ff, file, rotationAngle);
          setResultType("video"); break;

        case "crop":
          setProgress("Kırpılıyor…");
          blob = await mt.cropVideo(ff, file, cropW, cropH, aspect !== "free" ? aspect : undefined);
          setResultType("video"); break;

        case "brightness":
          setProgress("Renk ayarlanıyor…");
          blob = await mt.adjustColors(ff, file, brightness, contrast, saturation, gamma);
          setResultType("video"); break;

        case "filter":
          setProgress(`${filter} filtresi uygulanıyor…`);
          blob = await mt.applyFilterPreset(ff, file, filter);
          setResultType("video"); break;

        case "text":
          setProgress("Metin ekleniyor…");
          blob = await mt.addVideoText(ff, file, { text, color: textColor, startSec: textStart, endSec: textEnd || duration });
          setResultType("video"); break;

        case "subtitle":
          setProgress("Altyazı ekleniyor…");
          blob = await mt.addVideoText(ff, file, { text: subtitleText, color: textColor, startSec: textStart, endSec: textEnd || duration });
          setResultType("video"); break;

        case "thumb":
          setProgress("Kapak çıkarılıyor…");
          blob = await mt.extractThumbnail(ff, file, thumbTime);
          setResultType("image"); break;

        case "audio":
          setProgress("Ses ayarlanıyor…");
          blob = await mt.setVolume(ff, file, volume);
          setResultType("video"); break;

        case "compress":
          setProgress("Sıkıştırılıyor…");
          blob = await mt.compressVideo(ff, file, crf);
          setResultType("video"); break;

        case "effect":
          setProgress(`${effect} efekti uygulanıyor…`);
          blob = await mt.applyFilterPreset(ff, file, effect === "Yok" ? "none" : effect.toLowerCase());
          setResultType("video"); break;

        default: throw new Error("Bilinmeyen araç");
      }
      setResultUrl(URL.createObjectURL(blob));
      setProgress("Tamamlandı ✓");
    } catch (e) {
      setProgress("Hata: " + (e as Error).message);
    } finally { setBusy(false); }
  };

  // Ses değiştirme
  const onAudioFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = e.target.files?.[0];
    if (!audio || !file) return;
    setBusy(true); setProgress("Ses değiştiriliyor…");
    try {
      const mt = await import("@saphara/media-tools");
      const ff = await loadFFmpeg();
      const blob = await mt.replaceAudio(ff, file, audio);
      setResultUrl(URL.createObjectURL(blob)); setResultType("video");
      setProgress("Ses değiştirildi ✓");
    } catch (err) {
      setProgress("Hata: " + (err as Error).message);
    } finally { setBusy(false); }
  };

  // Yayınla
  const publishResult = async (src = resultUrl) => {
    if (!src || resultType === "audio") return;
    setPublishState("publishing"); setPublishMsg("Yükleniyor…");
    try {
      const blob = await (await fetch(src)).blob();
      const ext  = resultType === "image" ? "jpg" : "mp4";
      const out  = new File([blob], `saphara-studio.${ext}`, { type: blob.type });
      const mediaUrl = await uploadMedia(out, (r) => setPublishMsg(`Yükleniyor… %${Math.round(r * 100)}`));
      await createPost.mutateAsync({ text: "Studio ile düzenlendi 🎬", mediaUrl, mediaType: resultType === "image" ? "image" : "video" });
      setPublishState("done"); setPublishMsg("Yayınlandı! Akışta görülebilir.");
    } catch (e) {
      setPublishState("error"); setPublishMsg((e as Error).message.slice(0, 80));
    }
  };

  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);

  return (
    <div className="studio">
      <header className="topbar"><h1>Üretici Stüdyosu</h1></header>
      <input ref={fileInput}  type="file" accept="video/*,image/*" hidden onChange={onSelect} />
      <input ref={audioInput} type="file" accept="audio/*"         hidden onChange={onAudioFile} />

      {!file ? (
        <label className="dropzone" onClick={() => fileInput.current?.click()}>
          <Upload size={36} />
          <span>Video veya fotoğraf seç</span>
          <small className="muted">MP4, MOV, WebM, JPG, PNG · max 512MB</small>
        </label>
      ) : (
        <div className="studio-layout">

          {/* Sol: araç sekmeleri */}
          <nav className="studio-tools">
            {TOOLS.map(({ id, label, icon: Icon }) => (
              <button key={id} className={tool === id ? "stool on" : "stool"} onClick={() => setTool(id)}>
                <Icon size={18} /><span>{label}</span>
              </button>
            ))}
          </nav>

          {/* Orta: önizleme + araç paneli */}
          <div className="studio-main">
            <div className="studio-preview">
              <video ref={videoRef} src={url} onLoadedMetadata={onLoadedMeta} controls
                style={{
                  filter: tool === "filter" && filter !== "none"
                    ? PRESET_FILTERS[filter as keyof typeof PRESET_FILTERS] ?? "none"
                    : tool === "brightness"
                      ? `brightness(${brightness}) contrast(${contrast}) saturate(${saturation})`
                      : "none",
                }} />
            </div>

            <div className="tool-panel">

              {/* ── Kes/Kırp ── */}
              {tool === "trim" && (
                <>
                  <div className="track" ref={trackRef}>
                    <div className="selection" style={{ left: `${startPct}%`, width: `${endPct - startPct}%` }} />
                    <div className="handle start" style={{ left: `${startPct}%` }} onPointerDown={dragHandle("start")} />
                    <div className="handle end"   style={{ left: `${endPct}%`   }} onPointerDown={dragHandle("end")} />
                  </div>
                  <div className="time-labels">
                    <span>{range.start.toFixed(1)}s</span>
                    <span>Süre: {(range.end - range.start).toFixed(1)}s</span>
                    <span>{range.end.toFixed(1)}s</span>
                  </div>
                </>
              )}

              {/* ── Böl ── */}
              {tool === "split" && (
                <div className="ctrl-grid">
                  <label>Kesim Noktası
                    <input type="range" min={0.1} max={duration - 0.1} step={0.1} value={splitAt}
                      onChange={(e) => setSplitAt(Number(e.target.value))} />
                    <span>{splitAt.toFixed(1)}s / {duration.toFixed(1)}s</span>
                  </label>
                  <div className="track" style={{ pointerEvents: "none" }}>
                    <div className="handle start" style={{ left: `${splitPct}%`, background: "var(--danger)" }} />
                  </div>
                  <p className="muted" style={{ fontSize: 12 }}>Video 2 parçaya bölünür: 0–{splitAt.toFixed(1)}s ve {splitAt.toFixed(1)}–{duration.toFixed(1)}s</p>
                </div>
              )}

              {/* ── Hız ── */}
              {tool === "speed" && (
                <div className="ctrl-grid">
                  <label>Hız Çarpanı
                    <input type="range" min={0.25} max={4} step={0.25} value={speed}
                      onChange={(e) => setSpeed(Number(e.target.value))} />
                    <span>{speed}x {speed < 1 ? "— Yavaş Çekim" : speed > 1 ? "— Hızlı" : "— Normal"}</span>
                  </label>
                  <div className="speed-presets">
                    {[0.25, 0.5, 1, 1.5, 2, 3, 4].map((s) => (
                      <button key={s} className={speed === s ? "filt on" : "filt"} onClick={() => setSpeed(s)}>{s}x</button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Boyut/Oran ── */}
              {tool === "crop" && (
                <div className="ctrl-grid">
                  <div className="speed-presets">
                    {ASPECT_OPTS.map((o) => (
                      <button key={o.value} className={aspect === o.value ? "filt on" : "filt"}
                        onClick={() => setAspect(o.value)}>{o.label}</button>
                    ))}
                  </div>
                  {aspect === "free" && (
                    <>
                      <label>Genişlik %
                        <input type="range" min={20} max={100} value={cropW} onChange={(e) => setCropW(Number(e.target.value))} />
                        <span>{cropW}%</span>
                      </label>
                      <label>Yükseklik %
                        <input type="range" min={20} max={100} value={cropH} onChange={(e) => setCropH(Number(e.target.value))} />
                        <span>{cropH}%</span>
                      </label>
                    </>
                  )}
                </div>
              )}

              {/* ── Döndür ── */}
              {tool === "rotate" && (
                <div className="ctrl-grid">
                  <div className="speed-presets">
                    {[-90, 0, 90, 180].map((a) => (
                      <button key={a} className={rotationAngle === a ? "filt on" : "filt"}
                        onClick={() => setRotationAngle(a)}>{a === -90 ? "−90°" : `${a}°`}</button>
                    ))}
                  </div>
                  <label>Özel Açı
                    <input type="range" min={-180} max={180} step={1} value={rotationAngle}
                      onChange={(e) => setRotationAngle(Number(e.target.value))} />
                    <span>{rotationAngle}°</span>
                  </label>
                </div>
              )}

              {/* ── Renk & Işık ── */}
              {tool === "brightness" && (
                <div className="ctrl-grid">
                  <label>Parlaklık
                    <input type="range" min={0.2} max={2} step={0.05} value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))} />
                    <span>{brightness > 1 ? "+" : ""}{Math.round((brightness - 1) * 100)}%</span>
                  </label>
                  <label>Kontrast
                    <input type="range" min={0.2} max={3} step={0.05} value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))} />
                    <span>{contrast > 1 ? "+" : ""}{Math.round((contrast - 1) * 100)}%</span>
                  </label>
                  <label>Doygunluk
                    <input type="range" min={0} max={3} step={0.05} value={saturation}
                      onChange={(e) => setSaturation(Number(e.target.value))} />
                    <span>{saturation > 1 ? "+" : ""}{Math.round((saturation - 1) * 100)}%</span>
                  </label>
                  <label>Gamma
                    <input type="range" min={0.5} max={2} step={0.05} value={gamma}
                      onChange={(e) => setGamma(Number(e.target.value))} />
                    <span>{gamma.toFixed(2)}</span>
                  </label>
                </div>
              )}

              {/* ── Filtre ── */}
              {(tool === "filter" || tool === "effect") && (
                <div className="filters">
                  {(tool === "filter" ? FILTER_NAMES : ["Yok","Bulanık","Vinyel","Film","Vintage","Gece","Siyah-Beyaz","Sepia","Canlı","Pastel"]).map((f) => (
                    <button key={f} className={(tool === "filter" ? filter : effect) === f ? "filt on" : "filt"}
                      onClick={() => tool === "filter" ? setFilter(f) : setEffect(f)}>{f}</button>
                  ))}
                </div>
              )}

              {/* ── Metin ── */}
              {(tool === "text" || tool === "subtitle") && (
                <div className="ctrl-grid">
                  <label>{tool === "subtitle" ? "Altyazı Metni" : "Metin"}
                    {tool === "subtitle"
                      ? <textarea value={subtitleText} rows={3} onChange={(e) => setSubtitleText(e.target.value)} />
                      : <input value={text} onChange={(e) => setText(e.target.value)} />
                    }
                  </label>
                  <label>Renk
                    <select value={textColor} onChange={(e) => setTextColor(e.target.value)}>
                      <option value="white">Beyaz</option>
                      <option value="#f0b429">Altın</option>
                      <option value="black">Siyah</option>
                      <option value="#e5484d">Kırmızı</option>
                      <option value="#5b8def">Mavi</option>
                      <option value="#3fb950">Yeşil</option>
                    </select>
                  </label>
                  <label>Başlangıç (s)
                    <input type="number" value={textStart} min={0} max={duration}
                      onChange={(e) => setTextStart(Number(e.target.value))} />
                  </label>
                  <label>Bitiş (s)
                    <input type="number" value={textEnd || duration} min={0} max={duration}
                      onChange={(e) => setTextEnd(Number(e.target.value))} />
                  </label>
                </div>
              )}

              {/* ── Kapak ── */}
              {tool === "thumb" && (
                <label>Kare Zamanı
                  <input type="range" min={0} max={duration} step={0.1} value={thumbTime}
                    onChange={(e) => { setThumbTime(Number(e.target.value)); if (videoRef.current) videoRef.current.currentTime = Number(e.target.value); }} />
                  <span>{thumbTime.toFixed(1)}s</span>
                </label>
              )}

              {/* ── Ses ── */}
              {tool === "audio" && (
                <div className="ctrl-grid">
                  <label>Ses Seviyesi
                    <input type="range" min={0} max={2} step={0.1} value={volume}
                      onChange={(e) => setVolume(Number(e.target.value))} />
                    <span>{volume.toFixed(1)}x {volume === 0 ? "— Sessiz" : volume > 1 ? "— Yüksek" : ""}</span>
                  </label>
                  <button className="ghost-btn" onClick={() => audioInput.current?.click()}>
                    <Music size={16} /> Müzik/Ses Değiştir
                  </button>
                </div>
              )}

              {/* ── Sıkıştır ── */}
              {tool === "compress" && (
                <label>Kalite (CRF)
                  <input type="range" min={18} max={36} value={crf}
                    onChange={(e) => setCrf(Number(e.target.value))} />
                  <span>CRF {crf} · {crf <= 22 ? "Yüksek Kalite" : crf <= 28 ? "Standart" : "Küçük Dosya"}</span>
                </label>
              )}

              {/* ── Eylemler ── */}
              <div className="tool-actions">
                <button className="primary-btn" disabled={busy} onClick={run}>
                  {busy ? <><Loader2 size={16} className="spin" /> İşleniyor…</> : "Uygula"}
                </button>
              </div>
              {progress && (
                <p className={`muted ${progress.includes("✓") ? "studio-ok" : ""}`}>{progress}</p>
              )}

              {/* Tek parça sonuç */}
              {resultUrl && tool !== "split" && (
                <div className="studio-result">
                  <h4>Sonuç</h4>
                  {resultType === "video" && <video src={resultUrl} controls />}
                  {resultType === "image" && <img src={resultUrl} alt="kapak" />}
                  {resultType === "audio" && <audio src={resultUrl} controls />}
                  <div className="tool-actions">
                    <a className="ghost-btn" href={resultUrl}
                      download={`saphara.${resultType === "image" ? "jpg" : resultType === "audio" ? "mp3" : "mp4"}`}>
                      <Download size={16} /> İndir
                    </a>
                    {resultType !== "audio" && (
                      <button className="primary-btn" disabled={publishState === "publishing"} onClick={() => publishResult()}>
                        {publishState === "publishing" ? <><Loader2 size={16} className="spin" /> Yayınlanıyor…</>
                          : publishState === "done" ? <><Check size={16} /> Yayınlandı</>
                          : <><Send size={16} /> Yayınla</>}
                      </button>
                    )}
                  </div>
                  {publishMsg && (
                    <p style={{ color: publishState === "done" ? "#3fb950" : "var(--danger)", fontSize: 13 }}>{publishMsg}</p>
                  )}
                </div>
              )}

              {/* Bölme — 2 parça */}
              {tool === "split" && resultUrl && resultUrl2 && (
                <div className="studio-result">
                  <h4>Parça 1</h4>
                  <video src={resultUrl}  controls />
                  <div className="tool-actions">
                    <a className="ghost-btn" href={resultUrl}  download="saphara-part1.mp4"><Download size={16} /> Parça 1</a>
                    <button className="primary-btn" onClick={() => publishResult(resultUrl)}><Send size={16} /> Yayınla</button>
                  </div>
                  <h4 style={{ marginTop: 16 }}>Parça 2</h4>
                  <video src={resultUrl2} controls />
                  <div className="tool-actions">
                    <a className="ghost-btn" href={resultUrl2} download="saphara-part2.mp4"><Download size={16} /> Parça 2</a>
                    <button className="primary-btn" onClick={() => publishResult(resultUrl2)}><Send size={16} /> Yayınla</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
