"use client";
import { useState, useRef, useEffect } from "react";
import {
  Send, Plus, Search, X, Loader2, Image as ImageIcon,
  Check, CheckCheck, Smile, ChevronLeft, Trash2,
  Mic, Square, CornerUpLeft, Film,
} from "lucide-react";
import { useRealtime } from "../../hooks/useRealtime";
import {
  useConversations, useChat, useMarkMessageSeen, useReactMessage, useMe, useSearchUsers,
} from "../../hooks/useApi";
import { uploadMedia } from "../../lib/upload";
import { api } from "../../lib/api";
import { useQueryClient } from "@tanstack/react-query";

const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥", "🎉", "💯", "👏", "💎", "🚀", "✅"];

const GIF_PREVIEWS = [
  { id: "g1", url: "https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif", title: "Thumbs Up" },
  { id: "g2", url: "https://media.giphy.com/media/xT5LMHxhOfscxPfIfm/giphy.gif", title: "Wow" },
  { id: "g3", url: "https://media.giphy.com/media/26tOZ42Mg6pbTUPHW/giphy.gif", title: "Fire" },
  { id: "g4", url: "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif", title: "Party" },
  { id: "g5", url: "https://media.giphy.com/media/3oEjHAUOqG3lSS0f1C/giphy.gif", title: "Moon" },
  { id: "g6", url: "https://media.giphy.com/media/xUPGcguWZHRC2HyBRS/giphy.gif", title: "Bitcoin" },
];

function Avatar({ url, name, size = 40 }: { url?: string | null; name?: string | null; size?: number }) {
  const initials = (name ?? "?")[0].toUpperCase();
  return url ? (
    <img src={url} alt={name ?? ""} className="dm-avatar" style={{ width: size, height: size }} />
  ) : (
    <div className="dm-avatar-ph" style={{ width: size, height: size, fontSize: size * 0.38 }}>{initials}</div>
  );
}

export function Messages() {
  const { data: myData } = useMe();
  const me = myData?.id ?? "";

  const rt = useRealtime(me);
  const qc = useQueryClient();
  const { data: convos, isLoading, refetch: refetchConvos } = useConversations();

  const [active, setActive]     = useState<string>("");
  const [showNew, setShowNew]   = useState(false);
  const [searchQ, setSearchQ]   = useState("");
  const [text, setText]         = useState("");
  const [showEmojiFor, setShowEmojiFor] = useState<string | null>(null);
  const [typingUser, setTypingUser]     = useState<string | null>(null);
  const [uploading, setUploading]       = useState(false);
  const [uploadPct, setUploadPct]       = useState(0);
  const [mobileChat, setMobileChat]     = useState(false);
  const [replyTo, setReplyTo]   = useState<{ id: string; text?: string; author?: string } | null>(null);
  const [showGifs, setShowGifs] = useState(false);
  const [recording, setRecording]   = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recChunksRef     = useRef<Blob[]>([]);
  const recTimerRef      = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      recChunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) recChunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(recChunksRef.current, { type: "audio/webm" });
        const file = new File([blob], `voice_${Date.now()}.webm`, { type: "audio/webm" });
        setUploading(true);
        try {
          const url = await uploadMedia(file, r => setUploadPct(Math.round(r * 100)));
          await api.post("/messages", { to: active, mediaUrl: url, mediaType: "audio" });
          rt.sendDM(active, "[sesli mesaj]");
          qc.invalidateQueries({ queryKey: ["chat", active] });
          qc.invalidateQueries({ queryKey: ["conversations"] });
        } finally { setUploading(false); }
      };
      mr.start();
      setRecording(true);
      setRecSeconds(0);
      recTimerRef.current = setInterval(() => setRecSeconds(s => s + 1), 1000);
    } catch { /* mic permission denied */ }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    if (recTimerRef.current) clearInterval(recTimerRef.current);
  };

  const sendGif = async (url: string) => {
    if (!active) return;
    setShowGifs(false);
    await api.post("/messages", { to: active, mediaUrl: url, mediaType: "image" });
    rt.sendDM(active, "[GIF]");
    qc.invalidateQueries({ queryKey: ["chat", active] });
    qc.invalidateQueries({ queryKey: ["conversations"] });
  };

  const chat       = useChat(active);
  const reactMsg   = useReactMessage();
  const markSeen   = useMarkMessageSeen();
  const searchRes  = useSearchUsers(searchQ);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaInputRef  = useRef<HTMLInputElement>(null);
  const inputRef       = useRef<HTMLInputElement>(null);

  const threads = convos?.threads ?? [];
  const history = chat.data?.items ?? [];
  const live    = rt.messages.filter((m: any) => m.from === active || m.to === active);
  const all     = [...history, ...live];

  const activeThread = threads.find((t: any) => t.withId === active);

  useEffect(() => {
    const handler = (e: any) => {
      if (e.detail?.from === active) {
        setTypingUser(active);
        setTimeout(() => setTypingUser(null), 3000);
      }
    };
    window.addEventListener("saphara_typing", handler);
    return () => window.removeEventListener("saphara_typing", handler);
  }, [active]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [all.length]);

  useEffect(() => {
    if (!active || history.length === 0) return;
    const unread = history.filter((m: any) => m.toId === me && !m.read);
    unread.forEach((m: any) => markSeen.mutate(m.id));
  }, [active, history.length]);

  // Live DM gelince conversation listesini yenile
  useEffect(() => {
    if (rt.messages.length > 0) refetchConvos();
  }, [rt.messages.length]);

  const openConvo = (withId: string) => {
    setActive(withId);
    setMobileChat(true);
    setShowNew(false);
    setSearchQ("");
  };

  const sendText = async () => {
    if (!text.trim() || !active) return;
    const body = text.trim();
    setText("");
    await api.post("/messages", { to: active, text: body });
    rt.sendDM(active, body);
    qc.invalidateQueries({ queryKey: ["chat", active] });
    qc.invalidateQueries({ queryKey: ["conversations"] });
  };

  const sendMedia = async (file: File) => {
    if (!active) return;
    setUploading(true); setUploadPct(0);
    try {
      const mediaUrl  = await uploadMedia(file, (r) => setUploadPct(Math.round(r * 100)));
      const mediaType = file.type.startsWith("video") ? "video" : "image";
      await api.post("/messages", { to: active, mediaUrl, mediaType });
      rt.sendDM(active, `[${mediaType}]`);
      qc.invalidateQueries({ queryKey: ["chat", active] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    } catch (e) {
      console.error("Medya gönderilemedi:", e);
    } finally { setUploading(false); }
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    sendMedia(file);
    e.target.value = "";
  };

  const react = (msgId: string, emoji: string) => {
    reactMsg.mutate({ id: msgId, emoji });
    setShowEmojiFor(null);
  };

  const deleteMsg = async (id: string) => {
    await api.del(`/messages/${id}`);
    qc.invalidateQueries({ queryKey: ["chat", active] });
  };

  const formatTime = (ts: string | number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  };
  const formatRelative = (ts: string | number) => {
    const now = Date.now();
    const diff = now - new Date(ts).getTime();
    if (diff < 60_000) return "şimdi";
    if (diff < 3600_000) return `${Math.floor(diff / 60_000)}dk`;
    if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}sa`;
    return new Date(ts).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
  };

  return (
    <div className={`dm ${mobileChat ? "dm-mobile-chat" : ""}`}>
      {/* ── Sol panel: sohbet listesi ── */}
      <aside className="dm-list">
        <header className="dm-list-header">
          <h1>Mesajlar</h1>
          <button className="dm-new-btn" title="Yeni mesaj" onClick={() => { setShowNew(true); setSearchQ(""); }}>
            <Plus size={18} />
          </button>
        </header>

        {/* Yeni mesaj arama modalı */}
        {showNew && (
          <div className="dm-search-wrap">
            <div className="dm-search-box">
              <Search size={15} className="muted" />
              <input
                autoFocus
                placeholder="Kullanıcı ara…"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
              />
              <button className="ghost-btn icon-btn" onClick={() => setShowNew(false)}>
                <X size={15} />
              </button>
            </div>
            {searchQ.length >= 2 && (
              <div className="dm-search-results">
                {searchRes.isLoading && <div className="dm-search-item muted"><Loader2 size={14} className="spin" /> Aranıyor…</div>}
                {(searchRes.data?.users ?? []).map((u: any) => (
                  <button key={u.id} className="dm-search-item" onClick={() => openConvo(u.id)}>
                    <Avatar url={u.avatarUrl} name={u.name} size={34} />
                    <div>
                      <strong>{u.name}</strong>
                      <small className="muted"> @{u.handle}</small>
                    </div>
                  </button>
                ))}
                {!searchRes.isLoading && (searchRes.data?.users ?? []).length === 0 && (
                  <div className="dm-search-item muted">Kullanıcı bulunamadı</div>
                )}
              </div>
            )}
          </div>
        )}

        {isLoading && <div className="feed-state"><Loader2 size={20} className="spin" /></div>}
        {!showNew && threads.length === 0 && !isLoading && (
          <p className="muted" style={{ padding: "24px 20px", textAlign: "center", fontSize: 14 }}>
            Henüz mesaj yok.<br />
            <button className="dm-start-btn" onClick={() => setShowNew(true)}>
              <Plus size={14} /> İlk mesajı gönder
            </button>
          </p>
        )}

        {threads.map((t: any) => (
          <button
            key={t.withId}
            className={`dm-thread ${active === t.withId ? "on" : ""}`}
            onClick={() => openConvo(t.withId)}
          >
            <Avatar url={t.withAvatarUrl} name={t.withName ?? t.withHandle} size={44} />
            <div className="dm-thread-body">
              <div className="dm-thread-top">
                <span className="dm-thread-name">
                  {t.withName ?? t.withHandle ?? t.withId.slice(0, 8)}
                  {t.withVerified && <span className="dm-verified">✓</span>}
                </span>
                <span className="dm-thread-time">{formatRelative(t.lastAt)}</span>
              </div>
              <div className="dm-thread-preview">
                <span className={`dm-thread-last ${t.unread > 0 ? "unread-text" : ""}`}>
                  {t.fromMe ? "Sen: " : ""}
                  {t.lastMediaType === "image" ? "📷 Görsel" :
                   t.lastMediaType === "video" ? "🎥 Video" :
                   (t.lastText?.slice(0, 36) ?? "")}
                </span>
                {t.unread > 0 && <span className="dm-unread-badge">{t.unread}</span>}
              </div>
            </div>
          </button>
        ))}
      </aside>

      {/* ── Sağ panel: chat alanı ── */}
      <section className="dm-chat">
        {/* Header */}
        <header className="dm-chat-header">
          <button className="dm-back-btn" onClick={() => setMobileChat(false)}>
            <ChevronLeft size={20} />
          </button>
          {active && activeThread ? (
            <div className="dm-chat-user">
              <Avatar url={activeThread.withAvatarUrl} name={activeThread.withName} size={36} />
              <div>
                <strong>{activeThread.withName ?? activeThread.withHandle}</strong>
                {activeThread.withHandle && <div className="muted" style={{ fontSize: 12 }}>@{activeThread.withHandle}</div>}
              </div>
              <span className={rt.connected ? "dm-online on" : "dm-online"}>
                {rt.connected ? "● Çevrimiçi" : ""}
              </span>
            </div>
          ) : (
            <span className="muted">Sohbet seç</span>
          )}
        </header>

        {/* Mesajlar */}
        <div className="dm-messages">
          {!active && (
            <div className="dm-empty">
              <div className="dm-empty-icon">💬</div>
              <p>Sohbet seç veya yeni mesaj başlat</p>
              <button className="primary-btn" onClick={() => setShowNew(true)}>
                <Plus size={15} /> Yeni Mesaj
              </button>
            </div>
          )}

          {active && chat.isLoading && (
            <div className="feed-state"><Loader2 size={20} className="spin" /></div>
          )}

          {active && !chat.isLoading && all.length === 0 && (
            <p className="muted" style={{ textAlign: "center", marginTop: 60, fontSize: 14 }}>
              Henüz mesaj yok — ilk mesajı gönder!
            </p>
          )}

          {all.map((m: any, i: number) => {
            const isMe  = (m.fromId ?? m.from) === me;
            const msgId = m.id ?? String(i);
            const mUrl  = m.mediaUrl ?? m.payload?.mediaUrl;
            const mType = m.mediaType ?? m.payload?.mediaType;
            const mText = m.text ?? m.payload?.text;
            const ts    = m.createdAt ?? m.ts;

            return (
              <div
                key={msgId}
                className={`dm-msg-row ${isMe ? "me" : ""}`}
                onMouseLeave={() => setShowEmojiFor(null)}
              >
                {!isMe && (
                  <Avatar url={activeThread?.withAvatarUrl} name={activeThread?.withName} size={28} />
                )}

                <div className="dm-msg-wrap">
                  <div className={`dm-bubble ${isMe ? "me" : ""}`}>
                    {mText && <span>{mText}</span>}

                    {mUrl && mType === "image" && (
                      <a href={mUrl} target="_blank" rel="noopener noreferrer">
                        <img src={mUrl} alt="" className="dm-msg-media" />
                      </a>
                    )}
                    {mUrl && mType === "video" && (
                      <video src={mUrl} controls preload="metadata" className="dm-msg-media" />
                    )}
                    {mUrl && mType === "audio" && (
                      <audio src={mUrl} controls style={{ width: "100%", minWidth: 180, height: 36 }} />
                    )}

                    {m.reactions?.length > 0 && (
                      <div className="dm-reactions">
                        {m.reactions.map((r: any) => (
                          <span key={r.id} className="dm-reaction">{r.emoji}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="dm-msg-meta">
                    {ts && <span className="dm-msg-time">{formatTime(ts)}</span>}
                    {isMe && (
                      <span className="dm-receipt">
                        {m.read ? <CheckCheck size={11} className="seen" /> : <Check size={11} />}
                      </span>
                    )}
                  </div>
                </div>

                {/* Aksiyon butonları */}
                <div className="dm-msg-actions">
                  {m.id && (
                    <button className="dm-emoji-trigger" title="Yanıtla"
                      onClick={() => setReplyTo({ id: msgId, text: mText?.slice(0, 60), author: isMe ? "Sen" : (activeThread?.withName ?? "Kullanıcı") })}>
                      <CornerUpLeft size={13} />
                    </button>
                  )}
                  {!isMe && m.id && (
                    <button className="dm-emoji-trigger" onClick={() => setShowEmojiFor(showEmojiFor === msgId ? null : msgId)}>
                      <Smile size={13} />
                    </button>
                  )}
                  {isMe && m.id && (
                    <button className="dm-emoji-trigger" onClick={() => deleteMsg(m.id)}>
                      <Trash2 size={13} />
                    </button>
                  )}
                  {showEmojiFor === msgId && (
                    <div className="dm-emoji-picker">
                      {QUICK_EMOJIS.map((e) => (
                        <button key={e} className="dm-emoji-btn" onClick={() => react(m.id, e)}>{e}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {typingUser && (
            <div className="dm-typing">
              <span /><span /><span />
              <small className="muted">yazıyor…</small>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Yükleniyor çubuğu */}
        {uploading && (
          <div className="dm-upload-bar">
            <Loader2 size={14} className="spin" />
            <div className="dm-upload-track">
              <div className="dm-upload-fill" style={{ width: `${uploadPct}%` }} />
            </div>
            <span>{uploadPct}%</span>
          </div>
        )}

        {/* Giriş alanı */}
        {active && (
          <div className="dm-input-wrap" style={{ position: "relative" }}>
            {/* GIF seçici */}
            {showGifs && (
              <div className="dm-gif-picker" style={{
                position: "absolute", bottom: "calc(100% + 8px)", left: 8, right: 8,
                background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12,
                padding: 12, zIndex: 50, boxShadow: "0 -4px 20px rgba(0,0,0,.3)",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)" }}>GIF Seç</span>
                  <button className="ghost-btn icon-btn" onClick={() => setShowGifs(false)}><X size={14} /></button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                  {GIF_PREVIEWS.map(g => (
                    <button key={g.id} onClick={() => sendGif(g.url)} style={{
                      border: "none", borderRadius: 8, overflow: "hidden", padding: 0,
                      cursor: "pointer", aspectRatio: "1", background: "var(--border)",
                    }}>
                      <img src={g.url} alt={g.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Yanıtlama çubuğu */}
            {replyTo && (
              <div className="dm-reply-bar" style={{
                display: "flex", alignItems: "center", gap: 8, padding: "6px 12px",
                background: "var(--card)", borderTop: "1px solid var(--border)",
                fontSize: 12, color: "var(--muted)",
              }}>
                <CornerUpLeft size={13} style={{ color: "var(--accent)", flexShrink: 0 }} />
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  <strong style={{ color: "var(--text)" }}>{replyTo.author}: </strong>
                  {replyTo.text ?? "Medya"}
                </span>
                <button className="ghost-btn icon-btn" onClick={() => setReplyTo(null)}><X size={13} /></button>
              </div>
            )}

            <div className="dm-input-bar" style={{ position: "relative" }}>
              <input ref={mediaInputRef} type="file" accept="image/*,video/*" hidden onChange={onFileSelect} />

              {/* Resim/Video ekle */}
              <button className="dm-attach-btn" title="Resim/Video" disabled={uploading}
                onClick={() => mediaInputRef.current?.click()}>
                <ImageIcon size={18} />
              </button>

              {/* GIF butonu */}
              <button className="dm-attach-btn" title="GIF gönder" disabled={uploading}
                onClick={() => setShowGifs(v => !v)}
                style={{ color: showGifs ? "var(--accent)" : undefined }}>
                <Film size={18} />
              </button>

              {recording ? (
                /* Kayıt modu */
                <>
                  <div style={{
                    flex: 1, display: "flex", alignItems: "center", gap: 8,
                    padding: "0 12px", color: "var(--accent)", fontWeight: 700, fontSize: 14,
                  }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: "50%", background: "#ef4444",
                      animation: "dm-rec-blink 1s step-start infinite",
                    }} />
                    {String(Math.floor(recSeconds / 60)).padStart(2, "0")}:{String(recSeconds % 60).padStart(2, "0")}
                    <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 400 }}>Kaydediliyor…</span>
                  </div>
                  <button className="dm-send-btn" title="Kaydı durdur ve gönder" onClick={stopRecording}
                    style={{ background: "#ef4444" }}>
                    <Square size={16} />
                  </button>
                </>
              ) : (
                /* Normal mod */
                <>
                  <input
                    ref={inputRef}
                    className="dm-text-input"
                    value={text}
                    placeholder="Mesaj yaz…"
                    disabled={uploading}
                    onChange={(e) => { setText(e.target.value); rt.sendTyping(active); }}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendText())}
                  />
                  {text.trim() ? (
                    <button className="dm-send-btn" disabled={uploading} onClick={sendText}>
                      <Send size={17} />
                    </button>
                  ) : (
                    <button className="dm-attach-btn" title="Sesli mesaj kaydet" disabled={uploading}
                      onClick={startRecording}>
                      <Mic size={18} />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
