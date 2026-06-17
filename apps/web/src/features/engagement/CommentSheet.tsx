"use client";
import { useState } from "react";
import { X, Send, Loader2 } from "lucide-react";
import { useComments, useAddComment } from "../../hooks/useApi";

/** Gonderi yorumlari paneli (alt sheet). */
export function CommentSheet({ postId, onClose }: { postId: string; onClose: () => void }) {
  const { data, isLoading } = useComments(postId);
  const add = useAddComment(postId);
  const [text, setText] = useState("");
  const items = data?.items ?? [];

  const submit = () => {
    if (!text.trim()) return;
    add.mutate(text.trim(), { onSuccess: () => setText("") });
  };

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="comment-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <h3>Yorumlar</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="comment-list">
          {isLoading && <div className="feed-state"><Loader2 size={20} className="spin" /></div>}
          {!isLoading && items.length === 0 && <p className="muted center">Ilk yorumu sen yaz</p>}
          {items.map((c: any) => (
            <div key={c.id} className="comment">
              <strong>@{c.author?.handle ?? "kullanici"}</strong>
              <p>{c.text}</p>
            </div>
          ))}
        </div>
        <div className="comment-input">
          <input value={text} placeholder="Yorum yaz…"
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()} />
          <button onClick={submit} disabled={add.isPending}><Send size={18} /></button>
        </div>
      </div>
    </div>
  );
}
