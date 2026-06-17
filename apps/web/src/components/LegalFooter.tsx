"use client";

import Link from "next/link";
import { ShieldCheck, AlertTriangle } from "lucide-react";

export function LegalFooter() {
  return (
    <footer className="legal-footer">
      {/* Risk Uyarısı */}
      <div className="legal-risk">
        <AlertTriangle size={14} className="legal-risk-icon" />
        <p>
          <strong>Yatırım Riski Uyarısı:</strong> Kripto para yatırımları yüksek risk içerir.
          PART ve diğer dijital varlıkların değeri anlık olarak önemli ölçüde artıp azalabilir.
          Geçmiş performans, gelecekteki sonuçların garantisi değildir.
          Bu platform üzerindeki içerikler <strong>yatırım tavsiyesi niteliği taşımaz</strong>.
          Yatırım yapmadan önce finansal danışmanınıza başvurunuz.
        </p>
      </div>

      {/* KVKK / Linkler */}
      <div className="legal-links">
        <div className="legal-kvkk">
          <ShieldCheck size={13} />
          <span>
            Kişisel verileriniz 6698 sayılı <strong>KVKK</strong> kapsamında işlenmektedir.
            Veri sorumlusu: Saphara Teknoloji. Haklarınız için:{" "}
            <a href="mailto:kvkk@saphara.io">kvkk@saphara.io</a>
          </span>
        </div>
        <nav className="legal-nav">
          <Link href="/privacy">Gizlilik Politikası</Link>
          <span>·</span>
          <Link href="/about">Hakkında</Link>
          <span>·</span>
          <a href="mailto:destek@saphara.io">İletişim</a>
          <span>·</span>
          <span className="muted">© {new Date().getFullYear()} Saphara</span>
        </nav>
      </div>

      {/* GDPR kısa özet */}
      <div className="legal-gdpr">
        Saphara, BNB Smart Chain üzerinde çalışan merkezi olmayan bir sosyal platformdur.
        Platform içi işlemler geri alınamaz niteliktedir. Cüzdanınızın güvenliğinden yalnızca siz sorumlusunuz.
        Yalnızca kaybetmeyi göze alabileceğiniz miktarda yatırım yapınız.
      </div>
    </footer>
  );
}
