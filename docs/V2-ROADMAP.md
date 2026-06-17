# Saphara — v2 Yol Haritasi

v1 tam islevsel (akis, Reels, Stories, carousel, market+magaza, bahsis, mesaj,
bildirim, haberler, Studio, reklam, owner/bot paneli, cuzdan). Bu dosya v1
sonrasi planlanan, yuksek karmasik veya ek altyapi gerektiren ozellikleri sirayla
listeler.

## Faz 1 — Canli Yayin (Live Streaming)
En cok talep edilen ama en yuksek karmasik ozellik. Ayri medya altyapisi gerekir.

- **Altyapi**: WebRTC (dusuk gecikme) veya RTMP→HLS (olcek). Onerilen: LiveKit
  veya Mux gibi yonetilen servis (kendi medya sunucusu kurmak yerine).
- **Veri modeli**: `LiveStream` (yayinci, baslik, durum, izleyici sayisi, kayit URL).
- **Ozellikler**: canli sohbet (mevcut WebSocket gateway genisletilir), canli bahsis
  (mevcut CreatorTipping ile), yayin sonu otomatik VOD (transcode worker ile).
- **Gelir**: canli bahsis + sanal hediye (magaza ile entegre).
- **Tahmini**: 2-3 hafta (yonetilen servisle), kendi altyapisi ile 6+ hafta.

## Faz 2 — AR Filtreler & Efektler
Snapchat/Instagram tarzi yuz filtreleri, lensler.

- **Teknoloji**: MediaPipe (yuz/el takibi, tarayicida) veya 8thWall (ticari).
- **Studio entegrasyonu**: mevcut video araclarina "efekt" sekmesi.
- **Baslangic**: basit overlay/sticker (zaten addVideoImage var) → yuz takipli
  filtreler → 3D AR.
- **Tahmini**: 3-4 hafta (MediaPipe ile temel filtreler).

## Faz 3 — Gelismis Kesfet & Arama
- **Tam metin arama**: PostgreSQL full-text veya Meilisearch/Typesense entegrasyonu.
- **Sosyal arama**: TikTok tarzi — icerik arama motoru gibi (arastirmada one cikti).
- **Hashtag sistemi**: #etiket cikarma, etiket sayfalari, trend hesabi (gercek).
- **Kisisellestirilmis kesfet**: recommendation paketini kullanici gecmisiyle besle.

## Faz 4 — Topluluklar & Listeler
- **Topluluklar (Communities)**: konu bazli gruplar (Twitter/Reddit tarzi).
- **Listeler**: kullanici kurgulu akislar (Twitter Lists).
- **Grup mesajlasma**: mevcut DM'i coklu katilimciya genislet.

## Faz 5 — Mobil Uygulama
- **React Native / Expo**: paylasilan paketler (config, wallet, media-tools) yeniden
  kullanilabilir. UI yeniden yazilir.
- **Push bildirim**: FCM/APNs (mevcut bildirim sistemi backend'i hazir).

## Faz 6 — Gelismis Crypto & Gelir
- **Abonelik (subscription)**: ureticiye aylik PART ile uyelik (Patreon tarzi).
- **NFT icerik**: ozel icerigi NFT olarak satma.
- **Staking/odul**: PART stake → platform odulu.
- **DAO yonetimi**: topluluk oylariyla platform kararlari.

## Faz 7 — Olceklendirme & Operasyon
- **Redis**: WebSocket pub/sub (coklu sunucu), oran sinirlama, cache.
- **BullMQ**: transcode + bildirim + e-posta kuyruklari (mevcut bellek-ici kuyruk yerine).
- **CDN**: medya dagitimi (Cloudflare).
- **Gozlemlenebilirlik**: Sentry (hata), Grafana (metrik) — bot paneli besler.
- **Coklu dil (i18n)**: arayuz cevirisi.

## Oncelik onerisi
1. Once v1'i yayina al + audit (OpenZeppelin) + gercek kullanici geri bildirimi.
2. Geri bildirime gore Faz 1 (canli yayin) veya Faz 3 (arama/kesfet) sec.
3. Mobil (Faz 5) erken degerlidir — kullanicilarin cogu mobilde.

## v1'de bilerek YAPILMAYANLAR (neden)
- Canli yayin: ayri medya altyapisi, v1'i gereksiz agirlastirir.
- AR: yuksek karmasik, niche; once cekirdek deneyim oturmali.
- Bot otomatik mudahale: guvenlik — bot tespit/oneri yapar, karar sahibe ait.
- Manipulatif bagimlilik mekanikleri: etik — saglikli engagement tercih edildi.
