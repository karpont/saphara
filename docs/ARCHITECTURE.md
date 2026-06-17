# Saphara — Mimari & Yol Haritasi

Crypto destekli sosyal ag platformu. Twitter benzeri akis + TikTok/Instagram benzeri Reels
+ entegre market + EVM (BNB Chain dahil) cuzdan baglantisi + reklam veren paneli.

## 1. Monorepo Yapisi

```
saphara/
├── apps/
│   ├── web/          Next.js 14 (App Router) — ana kullanici uygulamasi
│   ├── admin/        Reklam veren + platform yonetim paneli
│   └── api/          Fastify tabanli REST + WebSocket API
├── packages/
│   ├── ui/           Paylasilan React bilesen kutuphanesi (tasarim sistemi)
│   ├── media-tools/  Video / resim / grafik / yukleme / kesme araclari
│   ├── wallet/       wagmi + viem cuzdan baglantisi (EVM + BNB Chain)
│   ├── contracts/    Solidity sozlesmeleri (PART token, market, tipping)
│   ├── analytics/    Etkilesim ve buyume analitigi
│   ├── recommendation/ Icerik onerisi (kalite + ilgi bazli, manipulatif degil)
│   ├── security/     Anti-bot, anti-fraud, rate-limit, hata izleme
│   └── config/       Paylasilan TS/ESLint/ortam yapilandirmasi
└── docs/
```

## 2. Teknoloji Secimleri

| Katman        | Teknoloji                                  |
|---------------|--------------------------------------------|
| Frontend      | Next.js 14, React 18, TypeScript, Tailwind |
| State         | Zustand + TanStack Query                   |
| Backend       | Fastify, Prisma (PostgreSQL)               |
| Realtime      | WebSocket (feed, bildirim, mesaj)          |
| Medya         | ffmpeg.wasm (istemci), S3-uyumlu depolama  |
| Cuzdan        | wagmi v2 + viem, WalletConnect             |
| Zincir        | BNB Smart Chain (birincil) + EVM uyumlu    |
| Sozlesme      | Solidity 0.8.x, Hardhat, OpenZeppelin      |
| Guvenlik      | Cloudflare Turnstile, device fingerprint   |

## 3. Modul Sorumluluklari

### web (kullanici uygulamasi)
- Sol sabit menu: Anasayfa / Kesfet / Reels / Market / Cuzdan / Mesajlar /
  Bildirimler / Profil / Ayarlar
- Orta kolon: guncel haber akisi (feed)
- Sag kolon: trendler, onerilen hesaplar
- Reels gorunumu: dikey video + resim + muzik
- Kisiye ozel dashboard: kazanc, etkilesim, takipci buyumesi, icerik performansi

### media-tools
- **video**: kirpma (trim), birlestirme, altyazi, kapak secimi, sikistirma
- **image**: kirpma, filtre, yeniden boyutlandirma, format donusumu
- **graphics**: metin overlay, sticker, sablon (story/post boyutlari)
- **upload**: parcali (chunked) yukleme, devam ettirme, ilerleme
- **trim**: zaman cizelgesi tabanli hassas kesme arayuzu
- Tarayicida ffmpeg.wasm ile islenir; sunucuya yuk binmez.

### wallet
- Coklu cuzdan: MetaMask, WalletConnect, Coinbase Wallet
- Ag: BNB Smart Chain (56), opsiyonel Ethereum/Polygon/Base
- Bakiye gosterimi, PART token bakiyesi, islem imzalama
- Tipping (bahsis) ve market odemeleri icin hook'lar

### contracts
- **PartToken.sol**: standart, seffaf ERC-20. Gizli mint YOK, gizli fee YOK,
  blacklist YOK. Sahip yetkileri minimal ve aciktir.
- **SapharaMarket.sol**: ilan olusturma, satin alma, escrow, platform komisyonu
- **CreatorTipping.sol**: icerik ureticiye dogrudan bahsis
- Adresler config uzerinden enjekte edilir (kullanici daha sonra verecek).

### recommendation
- Sinyaller: ilgi alani, etkilesim kalitesi, tazelik, cesitlilik
- Anti-pattern: sonsuz dopamin dongusu optimizasyonu kasitli olarak YAPILMAZ.
  Bunun yerine "kaliteli eslestirme" + kullanici kontrollu bildirim.

### security (kullanicinin "bot/bocek koruma" istegi)
- Anti-bot: Turnstile, davranis analizi, oran sinirlama
- Anti-fraud: sahte hesap tespiti, coklu hesap parmak izi
- Hata izleme: yapilandirilmis loglama + Sentry-uyumlu hook
- Cuzdan guvenligi: imza dogrulama, replay koruma, islem onay ekrani

## 4. Crypto Tasarim Ilkeleri (seffaflik)

- PART token sozlesmesi denetlenebilir ve standarttir.
- Kullaniciyi kandiran gizli mekanik (rug-pull, gizli vergi) BULUNMAZ.
- Tum platform komisyonlari arayuzde acikca gosterilir.
- Cuzdan baglantisi opsiyoneldir; platform cuzdansiz da kullanilabilir.

## 5. Sonradan Doldurulacak Yapilandirma

`.env` ve `packages/config` icindeki placeholder degerler:
- `PART_TOKEN_ADDRESS` — PART coin contract adresi (kullanici verecek)
- `TREASURY_ADDRESS` — ana hesap / hazine adresi (kullanici verecek)
- `RPC_URL_BSC`, `WALLETCONNECT_PROJECT_ID`, depolama anahtarlari

## 6. Yol Haritasi (faz faz)

1. **Iskelet** — monorepo, config, tasarim sistemi (bu asama)
2. **Feed & Reels** — akis, gonderi olusturma, Reels oynatici
3. **Medya araclari** — yukleme, kesme, filtre, grafik
4. **Cuzdan** — baglanti, bakiye, ag degistirme
5. **Sozlesmeler** — PART token, market, tipping (test agi)
6. **Dashboard & analitik** — kazanc/etkilesim panelleri
7. **Reklam paneli** — kampanya olusturma, hedefleme, raporlama
8. **Guvenlik** — anti-bot, anti-fraud, izleme sertlestirme
9. **Market** — ilan, escrow, odeme akisi
10. **Sertlestirme & denetim** — sozlesme denetimi, yuk testi
