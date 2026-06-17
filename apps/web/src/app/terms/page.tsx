import type { Metadata } from "next";

export const metadata: Metadata = { title: "Kullanım Koşulları — Saphara" };

const SECTIONS = [
  {
    title: "1. Hizmet Tanımı",
    body: `Saphara, BNB Smart Chain üzerinde çalışan bir Web3 sosyal platformudur. Platform; sosyal akış, içerik paylaşımı, dijital pazar, token staking, launchpad ve DAO yönetim araçları sunar. Hizmetlere erişim için kripto cüzdan (MetaMask veya uyumlu bir cüzdan) gereklidir.`,
  },
  {
    title: "2. Kullanıcı Sorumlulukları",
    body: `Saphara'ya erişerek şunları kabul etmektesiniz:\n• Paylaştığınız içerik yalnızca sizin sorumluluğunuzdadır.\n• Yanıltıcı, zararlı, telif hakkı ihlali içeren ya da yasadışı içerik paylaşamazsınız.\n• Başkalarının hesaplarını taklit edemez, platformu kötüye kullanamazsınız.\n• Otomatik bot, kazıyıcı veya spam aracı kullanamaz, platformun güvenlik mekanizmalarını atlatamazsınız.\n• Hesabınızın ve cüzdanınızın güvenliğinden siz sorumlusunuzdur.`,
  },
  {
    title: "3. PART Token ve Kripto Varlıklar",
    body: `PART, Saphara platformunun yardımcı token'ıdır. PART veya diğer kripto varlıklar ile yapılan işlemler geri alınamaz niteliktedir. Platform; token değeri, yatırım getirisi veya staking ödülleri hakkında herhangi bir garanti vermemektedir. Kripto yatırımları yüksek risk içerir — lütfen kendi araştırmanızı yapın (DYOR).`,
  },
  {
    title: "4. Fikri Mülkiyet",
    body: `Platformun tasarımı, kodu ve marka unsurları Saphara'ya aittir. Kullanıcılar paylaştıkları içeriklerin lisansını Saphara'ya tanımış olur; ancak mülkiyeti kendilerinde kalır. İçerikler kaldırılabilir veya gizlenebilir — bu karar Saphara yönetimine aittir.`,
  },
  {
    title: "5. Launchpad ve Pazaryeri",
    body: `Saphara Launchpad'de listelenen projeler üçüncü taraflara aittir. Saphara, bu projelere yönelik inceleme yapar; ancak yatırımın sonuçları için sorumluluk almaz. Pazaryerindeki listeler de kullanıcı tarafından oluşturulur ve Saphara satışın garantörü değildir. Tüm işlemler akıllı sözleşme aracılığıyla yürütülür ve geri alınamaz.`,
  },
  {
    title: "6. Reklam ve Sponsorlu İçerikler",
    body: `Platform, sponsorlu içeriklere ve reklam alanlarına yer verebilir. Reklamlar, editoryal içerikten görsel olarak ayrıştırılarak etiketlenir. Reklam verenler, platform kurallarını ihlal eden içerik yayınlayamaz.`,
  },
  {
    title: "7. Hizmetin Değiştirilmesi ve Sonlandırılması",
    body: `Saphara, özellikler üzerinde herhangi bir bildirim yapmaksızın değişikliğe gitme hakkını saklı tutar. Koşulları ihlal eden hesaplar askıya alınabilir veya kalıcı olarak silinebilir. Büyük değişikliklerde kullanıcılar platform üzerinden bilgilendirilecektir.`,
  },
  {
    title: "8. Sorumluluk Sınırlaması",
    body: `Saphara, hizmet kesintileri, akıllı sözleşme hataları, piyasa dalgalanmaları veya üçüncü taraf protokollerinden kaynaklanan kayıplardan sorumlu tutulamaz. Platformun sağladığı bilgiler yatırım tavsiyesi niteliği taşımaz.`,
  },
  {
    title: "9. Geçerli Hukuk",
    body: `Bu koşullar, Türk Hukuku çerçevesinde yorumlanır ve uygulanır. Anlaşmazlıklarda İstanbul Mahkemeleri yetkilidir.`,
  },
  {
    title: "10. İletişim",
    body: `Kullanım koşullarına ilişkin sorularınız için: destek@saphara.io adresine e-posta gönderebilir ya da platform üzerindeki Destek kanalını kullanabilirsiniz.`,
  },
];

export default function TermsPage() {
  return (
    <div className="terms-page">
      <header className="topbar"><h1>Kullanım Koşulları</h1></header>

      <div className="terms-hero">
        <p className="terms-hero-date">Son güncelleme: 10 Haziran 2025</p>
        <p className="terms-hero-desc">
          Saphara platformunu kullanarak aşağıdaki koşulları okumuş, anlamış ve kabul etmiş sayılırsınız.
          Bu koşulları kabul etmiyorsanız platformu kullanmayınız.
        </p>
      </div>

      <div className="terms-body">
        {SECTIONS.map((s) => (
          <section key={s.title} className="terms-section">
            <h2>{s.title}</h2>
            {s.body.split("\n").map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </section>
        ))}
      </div>

      <div className="terms-footer">
        <p>Sorularınız için <a href="mailto:destek@saphara.io">destek@saphara.io</a> ile iletişime geçin.</p>
        <div className="terms-footer-links">
          <a href="/privacy">Gizlilik Politikası & KVKK</a>
          <a href="/about">Hakkımızda</a>
          <a href="/advertise">Reklam Ver</a>
        </div>
      </div>

      <style>{`
        .terms-page { max-width: 760px; margin: 0 auto; padding-bottom: 80px; }
        .terms-hero { padding: 20px 24px; border-bottom: 1px solid var(--border); }
        .terms-hero-date { font-size: 12px; color: var(--muted); margin-bottom: 8px; }
        .terms-hero-desc { font-size: 14px; color: var(--muted); line-height: 1.7; }
        .terms-body { padding: 0 24px; }
        .terms-section { padding: 24px 0; border-bottom: 1px solid var(--border); }
        .terms-section h2 { font-size: 16px; font-weight: 800; margin-bottom: 12px; }
        .terms-section p { font-size: 14px; color: var(--muted); line-height: 1.75; margin-bottom: 6px; }
        .terms-footer { padding: 24px; text-align: center; font-size: 13px; color: var(--muted); }
        .terms-footer a { color: var(--accent); text-decoration: none; }
        .terms-footer-links { display: flex; gap: 20px; justify-content: center; margin-top: 12px; }
        .terms-footer-links a { color: var(--muted); text-decoration: none; font-size: 12px; }
        .terms-footer-links a:hover { color: var(--text); }
      `}</style>
    </div>
  );
}
