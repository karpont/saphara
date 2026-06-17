"use client";

import { useState, useRef, useCallback } from "react";
import {
  Upload, Image as ImageIcon, Video, Type, Check, Loader2, ArrowRight, ArrowLeft,
  BarChart3, X as XIcon, Plus,
} from "lucide-react";
import { PRESET_FILTERS } from "@saphara/media-tools";
import { uploadMedia } from "../../lib/upload";
import { useCreatePost, useCreatePoll } from "../../hooks/useApi";

type Step = "select" | "edit" | "details" | "publishing" | "done";
type MediaKind = "image" | "video" | "text";

/**
 * Uctan uca olusturma akisi:
 *  select  → medya tipi + dosya secimi
 *  edit    → resim filtresi / video onizleme (kesme icin /studio'ya yonlendirme)
 *  details → baslik, etiket, hedef (Feed / Reels)
 *  publish → parcali yukleme + yayinlama (ilerleme cubugu)
 */
export function CreatePost() {
  const [step, setStep] = useState<Step>("select");
  const [kind, setKind] = useState<MediaKind>("image");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [filter, setFilter] = useState<keyof typeof PRESET_FILTERS>("none");
  const [caption, setCaption] = useState("");
  const [target, setTarget] = useState<"feed" | "reels">("feed");
  const [progress, setProgress] = useState(0);
  const fileInput = useRef<HTMLInputElement>(null);

  const pick = (k: MediaKind) => {
    setKind(k);
    if (k === "text") { setStep("details"); return; }
    fileInput.current?.click();
  };

  const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files ?? []);
    if (list.length === 0) return;
    setFiles(list);
    setPreviews(list.map((f) => URL.createObjectURL(f)));
    setStep("edit");
  };

  const moveItem = (from: number, to: number) => {
    if (to < 0 || to >= files.length) return;
    setFiles((arr) => { const a = [...arr]; const [m] = a.splice(from, 1); a.splice(to, 0, m); return a; });
    setPreviews((arr) => { const a = [...arr]; const [m] = a.splice(from, 1); a.splice(to, 0, m); return a; });
  };
  const removeItem = (i: number) => {
    setFiles((arr) => arr.filter((_, j) => j !== i));
    setPreviews((arr) => arr.filter((_, j) => j !== i));
  };
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const createPost = useCreatePost();
  const createPoll = useCreatePoll();
  const [pollOn, setPollOn] = useState(false);
  const [pollQ, setPollQ] = useState("");
  const [pollOpts, setPollOpts] = useState<string[]>(["", ""]);

  const publish = useCallback(async () => {
    setStep("publishing");
    setProgress(0);
    try {
      const mediaUrls: string[] = [];
      for (let idx = 0; idx < files.length; idx++) {
        const url = await uploadMedia(files[idx], (r) => setProgress(Math.round(((idx + r) / files.length) * 90)));
        mediaUrls.push(url);
      }
      setProgress(95);
      const post: any = await createPost.mutateAsync({
        text: caption || undefined,
        mediaUrl: mediaUrls[0],          // geriye uyumlu (tek)
        mediaUrls: mediaUrls.length > 1 ? mediaUrls : undefined,  // carousel
        mediaType: kind === "video" ? "video" : kind === "image" ? "image" : undefined,
      });
      // Anket eklendiyse gonderiye bagla
      if (pollOn && pollQ.trim() && pollOpts.filter((o) => o.trim()).length >= 2 && post?.id) {
        await createPoll.mutateAsync({ postId: post.id, question: pollQ.trim(), options: pollOpts.filter((o) => o.trim()) });
      }
      setProgress(100);
      setStep("done");
    } catch (e) {
      setStep("details");
    }
  }, [files, caption, kind, createPost, pollOn, pollQ, pollOpts, createPoll]);

  return (
    <div className="create">
      <header className="topbar"><h1>Olustur</h1></header>
      <input ref={fileInput} type="file" multiple hidden onChange={onFiles}
        accept={kind === "video" ? "video/*" : "image/*"} />

      {step === "select" && (
        <div className="create-select">
          <button className="ctype" onClick={() => pick("image")}><ImageIcon size={28} /><span>Resim</span></button>
          <button className="ctype" onClick={() => pick("video")}><Video size={28} /><span>Video / Reels</span></button>
          <button className="ctype" onClick={() => pick("text")}><Type size={28} /><span>Metin</span></button>
        </div>
      )}

      {step === "edit" && (
        <div className="create-edit">
          <div className="edit-preview">
            {kind === "video"
              ? <video src={previews[0]} controls style={{ filter: PRESET_FILTERS[filter] }} />
              : <img src={previews[0]} alt="onizleme" style={{ filter: PRESET_FILTERS[filter] }} />}
            {previews.length > 1 && (
              <>
                <span className="multi-badge">{previews.length} medya · surukleyerek sirala</span>
                <div className="reorder-strip">
                  {previews.map((src, i) => (
                    <div key={i} className={dragIdx === i ? "reorder-item dragging" : "reorder-item"}
                      draggable
                      onDragStart={() => setDragIdx(i)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => { if (dragIdx !== null) moveItem(dragIdx, i); setDragIdx(null); }}>
                      <img src={src} alt={`${i + 1}`} />
                      <span className="reorder-num">{i + 1}</span>
                      <button className="reorder-x" onClick={() => removeItem(i)} aria-label="Kaldir">×</button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {kind === "image" && (
            <div className="filters">
              {(Object.keys(PRESET_FILTERS) as (keyof typeof PRESET_FILTERS)[]).map((k) => (
                <button key={k} className={filter === k ? "filt on" : "filt"} onClick={() => setFilter(k)}>{k}</button>
              ))}
            </div>
          )}
          {kind === "video" && (
            <a className="hint" href="/studio">Videoyu kesmek icin Studio'yu ac →</a>
          )}

          <div className="step-nav">
            <button className="ghost-btn" onClick={() => setStep("select")}><ArrowLeft size={16} /> Geri</button>
            <button className="primary-btn" onClick={() => setStep("details")}>Devam <ArrowRight size={16} /></button>
          </div>
        </div>
      )}

      {step === "details" && (
        <div className="create-details">
          <label>Aciklama
            <textarea rows={3} value={caption} onChange={(e) => setCaption(e.target.value)}
              placeholder="Bir aciklama ve etiket ekle (#saphara)…" />
          </label>
          <div className="poll-builder">
            <button type="button" className={pollOn ? "poll-toggle on" : "poll-toggle"} onClick={() => setPollOn(!pollOn)}>
              <BarChart3 size={16} /> {pollOn ? "Anketi kaldir" : "Anket ekle"}
            </button>
            {pollOn && (
              <div className="poll-fields">
                <input placeholder="Anket sorusu" value={pollQ} onChange={(e) => setPollQ(e.target.value)} />
                {pollOpts.map((opt, i) => (
                  <div key={i} className="poll-opt-row">
                    <input placeholder={`Secenek ${i + 1}`} value={opt}
                      onChange={(e) => setPollOpts((o) => o.map((v, j) => (j === i ? e.target.value : v)))} />
                    {pollOpts.length > 2 && (
                      <button type="button" onClick={() => setPollOpts((o) => o.filter((_, j) => j !== i))}><XIcon size={16} /></button>
                    )}
                  </div>
                ))}
                {pollOpts.length < 4 && (
                  <button type="button" className="add-opt" onClick={() => setPollOpts((o) => [...o, ""])}>
                    <Plus size={14} /> Secenek ekle
                  </button>
                )}
              </div>
            )}
          </div>

          <label>Nereye yayinlansin?
            <div className="chips">
              <button className={target === "feed" ? "chip on" : "chip"} onClick={() => setTarget("feed")}>Akis</button>
              <button className={target === "reels" ? "chip on" : "chip"} onClick={() => setTarget("reels")}>Reels</button>
            </div>
          </label>
          <div className="step-nav">
            <button className="ghost-btn" onClick={() => setStep(kind === "text" ? "select" : "edit")}>
              <ArrowLeft size={16} /> Geri
            </button>
            <button className="primary-btn" onClick={publish}>Yayinla <Check size={16} /></button>
          </div>
        </div>
      )}

      {step === "publishing" && (
        <div className="create-publishing">
          <Loader2 size={36} className="spin" />
          <p>Yukleniyor… %{progress}</p>
          <div className="prog"><div className="prog-bar" style={{ width: `${progress}%` }} /></div>
        </div>
      )}

      {step === "done" && (
        <div className="create-done">
          <div className="done-check"><Check size={40} /></div>
          <h2>Yayinlandi!</h2>
          <p className="muted">Iceriğin {target === "reels" ? "Reels" : "akis"} bolumunde.</p>
          <button className="primary-btn" onClick={() => { setStep("select"); setFiles([]); setPreviews([]); setCaption(""); setFilter("none"); }}>
            Yeni Olustur
          </button>
        </div>
      )}
    </div>
  );
}
