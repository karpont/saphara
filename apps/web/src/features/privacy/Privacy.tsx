"use client";

import { useState } from "react";
import { Shield, Download, Trash2, CheckCircle2, AlertTriangle, ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { useConsentRecord, useSaveConsent, useRequestDeletion, useAuth } from "../../hooks/useApi";

export function Privacy() {
  const { isAuthed } = useAuth();
  const consent = useConsentRecord();
  const saveConsent = useSaveConsent();
  const requestDeletion = useRequestDeletion();

  const [analytics, setAnalytics] = useState(consent.data?.analytics ?? false);
  const [marketing, setMarketing] = useState(consent.data?.marketing ?? false);
  const [consentSaved, setConsentSaved] = useState(false);
  const [deletionRequested, setDeletionRequested] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>("rights");

  const handleSaveConsent = async () => {
    await saveConsent.mutateAsync({ analytics, marketing });
    setConsentSaved(true);
    setTimeout(() => setConsentSaved(false), 3000);
  };

  const [downloading, setDownloading] = useState(false);
  const handleDownload = async () => {
    setDownloading(true);
    try {
      const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
      const token = localStorage.getItem("saphara_jwt");
      const res = await fetch(`${API}/me/export`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });
      if (!res.ok) throw new Error("İndirme başarısız");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `saphara-verilerim-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Veri indirme başarısız. Lütfen giriş yapın ve tekrar deneyin.");
    } finally { setDownloading(false); }
  };

  const handleDeleteRequest = async () => {
    await requestDeletion.mutateAsync();
    setDeletionRequested(true);
    setShowDeleteConfirm(false);
  };

  const toggle = (id: string) => setOpenSection((s) => (s === id ? null : id));

  return (
    <div className="privacy-page">
      <header className="topbar">
        <h1><Shield size={20} /> Gizlilik & Veri Yönetimi</h1>
      </header>

      <div className="privacy-hero">
        <p>KVKK kapsamında kişisel verileriniz üzerinde tam kontrole sahipsiniz.</p>
      </div>

      {/* Verilerimi İndir */}
      <section className="privacy-section">
        <h2><Download size={18} /> Verilerimi İndir</h2>
        <p className="muted">Saphara'da paylaştığınız tüm verilerinizi (gönderiler, takipler, bildirimler) JSON formatında indirin.</p>
        {isAuthed ? (
          <button className="primary-btn" onClick={handleDownload} disabled={downloading} style={{ marginTop: 12 }}>
            {downloading ? <><Loader2 size={15} className="spin" /> İndiriliyor…</> : <><Download size={16} /> Verilerimi İndir (.json)</>}
          </button>
        ) : (
          <p className="muted" style={{ marginTop: 8 }}>Giriş yapmanız gerekiyor.</p>
        )}
      </section>

      {/* Rıza Yönetimi */}
      <section className="privacy-section">
        <h2><CheckCircle2 size={18} /> Rıza Yönetimi</h2>
        <p className="muted">Hangi amaçlar için verilerinizin kullanılmasına izin verdiğinizi ayarlayın.</p>

        <div className="privacy-consent-list">
          <label className="privacy-consent-row">
            <div>
              <strong>Zorunlu Çerezler</strong>
              <p className="muted">Uygulamanın çalışması için zorunludur, devre dışı bırakılamaz.</p>
            </div>
            <input type="checkbox" checked disabled />
          </label>

          <label className="privacy-consent-row">
            <div>
              <strong>Analitik</strong>
              <p className="muted">Platform kullanımını anlamamıza yardımcı olur (anonim istatistikler).</p>
            </div>
            <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} />
          </label>

          <label className="privacy-consent-row">
            <div>
              <strong>Pazarlama & Kişiselleştirilmiş Reklamlar</strong>
              <p className="muted">İlgi alanlarınıza göre reklam gösterilmesine izin verir.</p>
            </div>
            <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
          </label>
        </div>

        {isAuthed && (
          <button className="primary-btn" onClick={handleSaveConsent} disabled={saveConsent.isPending} style={{ marginTop: 12 }}>
            {saveConsent.isPending ? <Loader2 size={15} className="spin" /> : consentSaved ? <><CheckCircle2 size={15} /> Kaydedildi</> : "Tercihleri Kaydet"}
          </button>
        )}
      </section>

      {/* KVKK Haklarınız — akordiyon */}
      <section className="privacy-section">
        <h2><Shield size={18} /> KVKK Kapsamındaki Haklarınız</h2>

        {[
          {
            id: "rights", title: "Kişisel Veri Haklarınız (Madde 11)",
            content: "KVKK'nın 11. maddesi kapsamında: kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme, aktarıldığı üçüncü kişileri bilme, eksik veya yanlış işlenmesi halinde düzeltilmesini isteme, silinmesini veya yok edilmesini isteme, otomatik sistem tarafından aleyhinize bir sonucun ortaya çıkmasına itiraz etme ve zarara uğramanız durumunda tazminat talep etme haklarına sahipsiniz.",
          },
          {
            id: "data", title: "Hangi Veriler Toplanıyor?",
            content: "Kullanıcı adı, e-posta (varsa), profil bilgileri (isim, biyografi, profil resmi), oluşturduğunuz içerikler (gönderiler, yorumlar, reels), etkileşim verileri (beğeniler, takipler), mesajlaşma geçmişi, cüzdan adresi (bağlandıysa), PART token işlemleri (blok zincirinde herkese açık), IP adresi ve cihaz bilgileri (güvenlik amacıyla).",
          },
          {
            id: "how", title: "Veriler Nasıl Kullanılıyor?",
            content: "Verileriniz; platform hizmetlerini sunmak, hesabınızı doğrulamak, içerik öneri algoritmasını kişiselleştirmek, reklam hedeflemesi (onay verilmişse), güvenlik tehditlerine karşı koruma, yasal yükümlülüklerin yerine getirilmesi amacıyla kullanılır. Verileriniz, açık rızanız olmaksızın üçüncü taraflarla satılmaz veya paylaşılmaz.",
          },
          {
            id: "contact", title: "İletişim & Başvuru",
            content: "KVKK kapsamındaki talepleriniz için: kvkk@saphara.io — Başvurular 30 gün içinde yanıtlanır. Veri Sorumlusu: Saphara Platform Ltd. — BSC Blockchain üzerindeki işlem verilerine erişim, blok zincirinin merkezi olmayan yapısı nedeniyle silinemez; yalnızca platform dahilindeki veriler silinebilir.",
          },
        ].map(({ id, title, content }) => (
          <div key={id} className="privacy-accordion">
            <button className="privacy-accordion-head" onClick={() => toggle(id)}>
              <span>{title}</span>
              {openSection === id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>
            {openSection === id && <p className="privacy-accordion-body muted">{content}</p>}
          </div>
        ))}
      </section>

      {/* Hesap Silme — tehlikeli bölge */}
      {isAuthed && (
        <section className="privacy-section danger-zone">
          <h2><AlertTriangle size={18} /> Hesap Silme</h2>
          <p className="muted">
            Hesabınız silindiğinde tüm gönderileriniz, profiliniz ve platform verileriniz <strong>30 gün sonra kalıcı olarak</strong> silinir.
            Blok zincirindeki PART işlemleri silinemez (merkezi olmayan kayıt).
          </p>

          {deletionRequested ? (
            <div className="privacy-deletion-notice">
              <CheckCircle2 size={18} /> Silme talebi alındı. Hesabınız 30 gün içinde silinecek.
            </div>
          ) : showDeleteConfirm ? (
            <div className="privacy-delete-confirm">
              <p><strong>Emin misiniz?</strong> Bu işlem geri alınamaz.</p>
              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button className="primary-btn danger-btn" onClick={handleDeleteRequest} disabled={requestDeletion.isPending}>
                  {requestDeletion.isPending ? <Loader2 size={15} className="spin" /> : "Evet, Hesabımı Sil"}
                </button>
                <button className="ghost-btn" onClick={() => setShowDeleteConfirm(false)}>İptal</button>
              </div>
            </div>
          ) : (
            <button className="ghost-btn danger-outline-btn" onClick={() => setShowDeleteConfirm(true)} style={{ marginTop: 12 }}>
              <Trash2 size={16} /> Hesap Silme Talep Et
            </button>
          )}
        </section>
      )}
    </div>
  );
}
