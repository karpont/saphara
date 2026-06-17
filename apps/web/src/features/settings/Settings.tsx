"use client";
import { useState, useEffect } from "react";
import { User, Bell, Palette, Shield, Loader2, Check, ExternalLink } from "lucide-react";
import { useMe, useUpdateProfile, useNotifPrefs, useSaveNotifPrefs } from "../../hooks/useApi";

export function Settings() {
  const me = useMe();
  const update = useUpdateProfile();
  const notifPrefsQ = useNotifPrefs();
  const saveNotifPrefs = useSaveNotifPrefs();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);
  const [notifSaved, setNotifSaved] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const [prefs, setPrefs] = useState({
    likes: true, comments: true, follows: true, tips: true, dm: true, reposts: true,
  });

  // Profil verisi yükle
  useEffect(() => {
    if (me.data) { setName(me.data.name ?? ""); setBio(me.data.bio ?? ""); }
  }, [me.data]);

  // Bildirim tercihleri API'den yükle
  useEffect(() => {
    if (notifPrefsQ.data) setPrefs((p) => ({ ...p, ...notifPrefsQ.data }));
  }, [notifPrefsQ.data]);

  // Tema localStorage + DOM
  useEffect(() => {
    const saved = (localStorage.getItem("saphara_theme") as "dark" | "light") ?? "dark";
    setTheme(saved);
  }, []);

  const applyTheme = (t: "dark" | "light") => {
    setTheme(t);
    localStorage.setItem("saphara_theme", t);
    document.documentElement.setAttribute("data-theme", t);
  };

  const saveProfile = () => {
    update.mutate({ name, bio }, {
      onSuccess: () => { setProfileSaved(true); setTimeout(() => setProfileSaved(false), 2000); },
    });
  };

  const saveNotifPrefsHandler = () => {
    saveNotifPrefs.mutate(prefs, {
      onSuccess: () => { setNotifSaved(true); setTimeout(() => setNotifSaved(false), 2000); },
    });
  };

  return (
    <div className="settings">
      <header className="topbar"><h1>Ayarlar</h1></header>

      {/* Profil */}
      <section className="set-section">
        <h3><User size={18} /> Profil</h3>
        {me.isLoading ? <Loader2 className="spin" /> : (
          <div className="set-fields">
            <label>Ad
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={50} />
            </label>
            <label>Bio
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={300} rows={3} />
              <small className="muted">{bio.length}/300</small>
            </label>
            <button className="primary-btn" disabled={update.isPending} onClick={saveProfile}>
              {update.isPending ? <Loader2 size={16} className="spin" /> : profileSaved ? <><Check size={16} /> Kaydedildi</> : "Kaydet"}
            </button>
          </div>
        )}
      </section>

      {/* Görünüm / Tema */}
      <section className="set-section">
        <h3><Palette size={18} /> Görünüm</h3>
        <div className="theme-opts">
          <button className={theme === "dark" ? "theme-opt on" : "theme-opt"} onClick={() => applyTheme("dark")}>
            <div className="theme-prev dark" /> Koyu
          </button>
          <button className={theme === "light" ? "theme-opt on" : "theme-opt"} onClick={() => applyTheme("light")}>
            <div className="theme-prev light" /> Açık
          </button>
        </div>
        <small className="muted">Tema tercihiniz tarayıcıya kaydedilir.</small>
      </section>

      {/* Bildirim Tercihleri — API'ye kaydedilir */}
      <section className="set-section">
        <h3><Bell size={18} /> Bildirim Tercihleri</h3>
        {notifPrefsQ.isLoading ? <Loader2 className="spin" /> : (
          <>
            <div className="pref-list">
              {([
                ["likes",    "Beğeniler"],
                ["comments", "Yorumlar"],
                ["follows",  "Takipler"],
                ["tips",     "Bahşişler"],
                ["dm",       "Mesajlar"],
                ["reposts",  "Yeniden Paylaşımlar"],
              ] as const).map(([k, label]) => (
                <label key={k} className="pref-row">
                  <span>{label}</span>
                  <input type="checkbox" checked={prefs[k]}
                    onChange={(e) => setPrefs((p) => ({ ...p, [k]: e.target.checked }))} />
                </label>
              ))}
            </div>
            <button className="primary-btn" style={{ marginTop: 12 }}
              disabled={saveNotifPrefs.isPending} onClick={saveNotifPrefsHandler}>
              {saveNotifPrefs.isPending
                ? <Loader2 size={16} className="spin" />
                : notifSaved ? <><Check size={16} /> Kaydedildi</> : "Tercihleri Kaydet"}
            </button>
          </>
        )}
      </section>

      {/* Hesap & Güvenlik */}
      <section className="set-section">
        <h3><Shield size={18} /> Hesap & Güvenlik</h3>
        <div className="set-fields">
          {me.data?.walletAddress && (
            <div className="set-info">
              Bağlı cüzdan: <code>{me.data.walletAddress.slice(0, 6)}…{me.data.walletAddress.slice(-4)}</code>
            </div>
          )}
          <div className="set-info muted">Kullanıcı adı: @{me.data?.handle}</div>
        </div>
      </section>

      {/* Gizlilik & KVKK */}
      <section className="set-section">
        <h3><Shield size={18} /> Gizlilik & KVKK</h3>
        <p className="muted" style={{ fontSize: 14, marginBottom: 12 }}>
          Verilerinizi indirin, rıza tercihlerinizi yönetin veya hesabınızı silin.
        </p>
        <a href="/privacy" className="primary-btn" style={{ textDecoration: "none", display: "inline-flex", gap: 8, alignItems: "center" }}>
          <ExternalLink size={16} /> Gizlilik Merkezi
        </a>
      </section>
    </div>
  );
}
