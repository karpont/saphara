"use client";
import { useState } from "react";
import { Plus, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useStories, useCreateStory } from "../../hooks/useApi";
import { uploadMedia } from "../../lib/upload";
import { useRef } from "react";

/** Feed ustunde yatay story halkalari + tam ekran goruntuleyici. */
export function StoryBar() {
  const { data } = useStories();
  const rings = data?.rings ?? [];
  const [active, setActive] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const createStory = useCreateStory();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    try {
      const mediaUrl = await uploadMedia(f);
      await createStory.mutateAsync({ mediaUrl, mediaType: f.type.startsWith("video") ? "video" : "image" });
    } catch { /* sessiz */ }
    finally { setUploading(false); }
  };

  return (
    <div className="story-bar">
      <input ref={fileRef} type="file" accept="image/*,video/*" hidden onChange={onFile} />
      <button className="story-ring add" onClick={() => fileRef.current?.click()} disabled={uploading}>
        <div className="ring-img"><Plus size={22} /></div>
        <small>{uploading ? "Yukleniyor" : "Ekle"}</small>
      </button>
      {rings.map((r: any, i: number) => (
        <button key={r.author.id} className="story-ring" onClick={() => setActive(i)}>
          <div className="ring-img" />
          <small>{r.author.handle}</small>
        </button>
      ))}
      {active !== null && rings[active] && (
        <StoryViewer ring={rings[active]} onClose={() => setActive(null)}
          onPrev={() => setActive((a) => (a! > 0 ? a! - 1 : a))}
          onNext={() => setActive((a) => (a! < rings.length - 1 ? a! + 1 : null))} />
      )}
    </div>
  );
}

function StoryViewer({ ring, onClose, onPrev, onNext }: { ring: any; onClose: () => void; onPrev: () => void; onNext: () => void }) {
  const [idx, setIdx] = useState(0);
  const item = ring.items[idx];
  const next = () => (idx < ring.items.length - 1 ? setIdx(idx + 1) : onNext());

  return (
    <div className="story-viewer" onClick={onClose}>
      <div className="story-content" onClick={(e) => e.stopPropagation()}>
        <div className="story-progress">
          {ring.items.map((_: any, i: number) => <div key={i} className={i <= idx ? "seg on" : "seg"} />)}
        </div>
        <div className="story-head">
          <strong>@{ring.author.handle}</strong>
          <button onClick={onClose}><X size={22} /></button>
        </div>
        {item.mediaType === "video"
          ? <video src={item.mediaUrl} autoPlay controls />
          : <img src={item.mediaUrl} alt="" />}
        {item.caption && <p className="story-caption">{item.caption}</p>}
        <button className="story-nav left" onClick={() => (idx > 0 ? setIdx(idx - 1) : onPrev())}><ChevronLeft size={28} /></button>
        <button className="story-nav right" onClick={next}><ChevronRight size={28} /></button>
      </div>
    </div>
  );
}
