import { Coins, ShieldCheck, Video, Users, Sparkles, Wallet } from "lucide-react";

/** Neden Saphara? Deger onermesi — manipulatif degil, gercek fayda odakli. */
export default function AboutPage() {
  const reasons = [
    { icon: Coins, title: "Uretici gercekten kazanir", desc: "Bahsis ve market satislarinda parayi dogrudan sen alirsin. Platform sadece seffaf %2.5 komisyon alir; gizli kesinti yok." },
    { icon: Video, title: "Video-first, hepsi bir arada", desc: "Reels, akis, resim, muzik. Tarayicidan kes, filtrele, yayinla — baska uygulama gerekmez." },
    { icon: ShieldCheck, title: "Cuzdaninla guvenli giris", desc: "Sifre yok. Kimligini imzayla kanitlarsin. Anti-bot ve anti-fraud korumasiyla gercek topluluk." },
    { icon: Sparkles, title: "Kaliteli akis, dopamin tuzagi degil", desc: "Oneri algoritmasi ilgi + kalite + tazelik + cesitlilik gozetir. Seni saatlerce tutmak icin degil, deger sunmak icin tasarlandi." },
    { icon: Users, title: "Topluluk + guncel dunya", desc: "Anketler, yorumlar, mesajlar ve gercek dunya haber akisi tek yerde. Edutainment ve mikro-topluluklar one cikar." },
    { icon: Wallet, title: "Crypto-native", desc: "BNB Chain ve EVM cuzdan destegi. PART token ile destek, market ve odul ekonomisi." },
  ];
  return (
    <div className="about">
      <header className="topbar"><h1>Neden Saphara?</h1></header>
      <div className="about-hero">
        <h2>Olustur. Paylas. Kazan.</h2>
        <p className="muted">Saphara, ureticinin gercekten kazandigi, toplulugun guvende oldugu ve dunyanin nabzinin attigi crypto-sosyal ag.</p>
      </div>
      <div className="about-grid">
        {reasons.map((r) => (
          <div key={r.title} className="about-card">
            <r.icon size={26} className="about-icon" />
            <h3>{r.title}</h3>
            <p className="muted">{r.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
