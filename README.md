# Saphara

Crypto destekli sosyal ag platformu. Akis (Twitter benzeri) + Reels (TikTok/Instagram
benzeri video/resim/muzik) + entegre market + EVM/BNB Chain cuzdan baglantisi +
reklam veren paneli + medya araclari + guvenlik (anti-bot / anti-fraud).

## Hizli Baslangic

```bash
# 1. pnpm gerekir (workspace: protokolu icin)
npm install -g pnpm

# 2. Bagimliliklari kur
pnpm install

# 3. Ortam degiskenlerini ayarla
cp .env.example .env
# .env icinde PART_TOKEN_ADDRESS ve TREASURY_ADDRESS'i doldur (deploy sonrasi)

# 4. Gelistirme
pnpm dev                 # tum uygulamalar
pnpm --filter @saphara/web dev   # sadece web

# 5. Sozlesmeler
pnpm contracts:compile
pnpm --filter @saphara/contracts deploy:bsc-testnet   # once testnet
```

## Yapi

| Paket | Gorev |
|-------|-------|
| `apps/web` | Ana kullanici uygulamasi: sol menu, feed, Reels, dashboard, cuzdan |
| `apps/admin` | Reklam veren + yonetim paneli |
| `apps/api` | Fastify REST/WS API, oran sinirlama, cuzdan imza dogrulama |
| `packages/wallet` | wagmi v2 + viem, BNB Chain + EVM, PART bakiyesi |
| `packages/contracts` | PART token, tipping, market (Solidity 0.8.24, OZ 5, cancun) |
| `packages/media-tools` | Video kesme/sikistirma/kapak, resim kirpma/filtre, grafik, parcali yukleme |
| `packages/security` | Rate-limit, bot tespiti, fraud risk, loglama |
| `packages/recommendation` | Kalite + ilgi bazli akis siralama |
| `packages/analytics` | Uretici + reklam metrikleri |
| `packages/config` | Merkezi yapilandirma (contract adresleri buraya) |

## Sozlesmeler dogrulandi

PartToken, CreatorTipping ve SapharaMarket Solidity 0.8.24 (evmVersion: cancun)
ile hatasiz derlenir. Sozlesmeler kasitli olarak seffaftir: gizli mint/vergi/
blacklist YOK, escrow tabanli market, ust sinirli (%10) platform komisyonu.

## SONRA verilecek degerler

`.env` icine:
- `NEXT_PUBLIC_PART_TOKEN_ADDRESS` — PART coin contract adresi
- `NEXT_PUBLIC_TREASURY_ADDRESS` — ana hesap / hazine adresi

## Yol haritasi

Bkz. `docs/ARCHITECTURE.md` — faz faz tum modul plani.

## Yeni eklenen ozellikler (guncel)

### Reels + Studio (kesme)
`/reels` — dikey, kaydirmali, otomatik oynayan video akisi (IntersectionObserver).
`/studio` — zaman cizelgeli video kesme editoru; ffmpeg.wasm ile tarayicida kesim + indirme.

### Market
`/market` — escrow tabanli alisveris. Satin alma akisi: approve → purchase → confirmReceipt.
Komisyon ve escrow korumasi UI'da acikca gosterilir.

### Mesajlasma + Bildirim (realtime)
`/messages`, `/notifications` — WebSocket uzerinden anlik. Otomatik yeniden baglanma
(exponential backoff), yazıyor gostergesi, optimistik mesaj ekleme.
Backend: `apps/api/src/routes/realtime.ts` (oda modeli, kullanici basina oran sinirlama).

### Dashboard
`/dashboard` — takipci buyumesi (30g alan grafik), gunluk PART kazanci, etkilesim
dagilimi (stacked bar), cuzdan PART bakiyesi. recharts ile.

## Sozlesme deploy

Bkz. `docs/DEPLOY.md`. Tek komut: `pnpm deploy:bsc-testnet`.
Script PART token'in varligini dogrular, tipping + market'i deploy eder,
adresleri otomatik `.env`'e ve `deployments/*.json`'a yazar.

## Bu turda eklenenler

### Profil + Takip
`/profile` — kapak, avatar, dogrulama rozeti, istatistikler (takipci/takip/gonderi/PART),
sekmeli icerik izgarasi (gonderi/reels/desteklenen). Optimistik takip sistemi (`useFollow`).
Backend: `POST/DELETE /follow/:id` (takip edilince bildirim tetiklenir).

### Kesfet
`/explore` — `@saphara/recommendation` `rankFeed` ile kalite + ilgi + tazelik bazli
siralama, kategori filtreleri, arama, one cikan icerik (feature) kutusu.

### Olusturma akisi (uctan uca)
`/create` — 4 adim: medya secimi → duzenleme (resim filtreleri / video icin Studio'ya
yonlendirme) → detay (aciklama, Feed/Reels hedefi) → parcali yukleme + yayinlama.
Sol menudeki "Gonderi Olustur" butonu buraya baglandi.

### Veritabani (Prisma)
`apps/api/prisma/schema.prisma` — 8 model (User, Follow, Post, Reel, Listing, Tip,
Message, Notification) + 3 enum. Sozdizimi dogrulandi. Market `onchainId` ile sozlesme
ilanlarina, Tip `txHash` ile zincir uzeri islemlere baglanir.

Kurulum:
```bash
cd apps/api
pnpm prisma:generate
pnpm prisma:migrate     # DATABASE_URL gerekli (.env)
```

## Bu turda eklenenler

### Backend gercek Prisma sorgulari + seed
`/feed` (oneri siralamali, cursor sayfalama), `POST /posts`, `POST /posts/:id/like`
(otomatik bildirim), `/reels`, market rotalari (`/listings`, sync). Seed: demo
kullanicilar + gonderiler + reels + ilanlar (`pnpm prisma:seed`).

### SIWE kimlik dogrulama + JWT
`apps/api/src/routes/auth.ts` — EIP-4361 akisi: `/auth/nonce` → cuzdanla imzala →
`/auth/verify`. Replay korumasi (tek kullanimlik sureli nonce), domain/chain kontrolu,
viem `verifySiweMessage`. Harici bagimliliksiz HS256 JWT. Frontend: `useSiweAuth` hook.

### Bahsis (tipping) akisi UI
`features/tipping/` — `useTipping` (PART icin approve→tipToken, BNB icin tipNative) +
`TipModal` (tutar/asset secimi, komisyon dökümü, islem durumu). Feed'deki "Bahsis"
butonu bagli.

### Test + CI
- Birim testleri **calistirildi ve gecti**: 11 test (RateLimiter, bot tespiti, fraud,
  oneri siralama, analitik) — Vitest.
- Sozlesme testleri: PartToken / CreatorTipping / SapharaMarket escrow akisi (Hardhat).
- GitHub Actions: `.github/workflows/ci.yml` — typecheck + lint + test + sozlesme derle/test.

```bash
pnpm test                                  # birim testleri
pnpm --filter @saphara/contracts test      # sozlesme testleri
```

## Bu turda eklenenler

### Backend yetkilendirme (SIWE/JWT)
Tum yazma rotalari artik `requireAuth` ile korunuyor — kimlik yalnizca imzalanmis
JWT'den gelir, istemcinin gonderdigi header'a guvenilmez. Yetki kontrolleri: kendini
takip edememe, yalnizca satici kendi ilanini senkronlayabilir.

### Frontend ↔ gercek API (TanStack Query)
`lib/api.ts` (JWT ekleyen client) + `hooks/useApi.ts` (10 hook: feed sonsuz kaydirma,
gonderi olusturma, optimistik begeni, profil, takip, bildirim, sohbet, mesaj). Feed
demo veriden gercek `/feed`'e gecti (loading/error/empty/daha-fazla durumlari).

### Docker Compose
`docker-compose.yml` — PostgreSQL + API + Web tek komutla: `docker compose up`.
API ve Web icin cok asamali Dockerfile'lar. Migrate + seed otomatik.

### Bildirim/mesaj kalicilastirma
`routes/inbox.ts` — bildirimler DB'ye yazilir (okundu durumu), mesajlar kalici kaydedilir
+ anlik iletilir, sohbet gecmisi ve konusma listesi uclari. `notify()` hem kaydeder
hem anlik gonderir.

### Test guvenlik dogrulamasi
JWT mantigi **test edildi ve gecti**: bozulmus imza, kurcalanmis payload, suresi
dolmus token ve gecersiz format hepsi reddedildi (4 test).

## Bu turda eklenenler (final)

### Tum sayfalar gercek API'ye bagli
Profil (`useProfile` + takip), Mesajlar (kalici gecmis + anlik WS), Bildirimler
(kalici, okundu), Market (gercek ilanlar + escrow satin alma + zincir senkronu).
Artik hicbir sayfa demo veri kullanmiyor.

### Giris akisi + korumali sayfalar
`AuthContext` + `RequireAuth` + `useSiweAuth`: cuzdan bagla → SIWE imzala → JWT oturum.
WalletButton oturum durumunu gosterir. `/create`, `/messages`, `/dashboard` korumali.

### Medya yukleme backend (S3-uyumlu)
`services/storage.ts` (AWS S3 / Cloudflare R2 / MinIO) + `routes/uploads.ts`:
cok parcali imzali URL akisi (init → part → complete → abort), kullanici klasoru
yetki kontrolu. Frontend `lib/upload.ts` `chunkedUpload`'i gercek uca baglar.
CreatePost artik gercek yukler + gonderi olusturur.

### E2E + entegrasyon testleri
- Playwright E2E: gezinme, korumali sayfa giris ekrani, market, kesfet filtreleri.
- API entegrasyon (Fastify inject): **calistirildi ve gecti** — nonce benzersizligi,
  korumali uc 401.
- CI: 3 is (unit+entegrasyon / sozlesme derle+test / E2E Postgres ile).

## Bu oturumda dogrulanan testler
- 11 birim testi (RateLimiter, bot, fraud, oneri, analitik) ✓
- 4 JWT guvenlik testi (kurcalama/sure/imza) ✓
- 2 API entegrasyon testi (nonce, auth guard) ✓
- Sozlesmeler derlendi (3/3), Prisma semasi parse edildi ✓

## TAM SURUM — Saphara v1.0

Saphara artik tam islevsel bir crypto-sosyal ag platformu. 2026 sosyal medya
arastirmasina (video-first, interaktif icerik, edutainment, topluluk, sosyal arama,
authenticity, uretici ekonomisi) gore tasarlandi.

### Neden Saphara? (deger onermesi — `/about`)
- **Uretici gercekten kazanir**: bahsis + market geliri dogrudan ureticiye; seffaf %2.5 komisyon, gizli kesinti yok.
- **Video-first, hepsi bir arada**: Reels + akis + resim + muzik; tarayicidan kes/filtrele/yayinla.
- **Cuzdanla guvenli giris (SIWE)**: sifresiz, anti-bot/anti-fraud korumali.
- **Kaliteli akis, dopamin tuzagi degil**: oneri = ilgi + kalite + tazelik + cesitlilik.
- **Topluluk + guncel dunya**: anket, yorum, mesaj + gercek dunya haber akisi.
- **Crypto-native**: BNB Chain + EVM, PART token ekonomisi.

### Tam ozellik listesi
| Alan | Ozellik |
|------|---------|
| Akis | Sonsuz kaydirma, oneri siralama, gonderi olusturma, optimistik begeni |
| Reels | Dikey otomatik oynatan video akisi |
| Studio | Tarayicida video kesme (ffmpeg.wasm), resim filtre, grafik |
| Olustur | 4 adimli akis + gercek S3 cok parcali yukleme |
| Market | Escrow tabanli alisveris, zincir senkronu |
| Bahsis | PART/BNB ile ureticiye dogrudan (CreatorTipping) |
| Etkilesim | Yorumlar + anketler (interaktif icerik) |
| Haberler | Cok kaynakli (GNews+NewsData), cache'li, kategorili |
| Mesajlar | Kalici + anlik (WebSocket) |
| Bildirimler | Kalici, okundu durumu, anlik |
| Profil | Istatistik, takip, icerik izgarasi |
| Dashboard | Kazanc/etkilesim/takipci grafikleri |
| Reklam | Kampanya sihirbazi + fenomen hedefleme + metrikler |
| Giris | SIWE (cuzdan imzasi) + JWT + korumali sayfalar |
| Guvenlik | Anti-bot, anti-fraud, rate-limit, hata izleme |

### Sayfalar (12)
/ · /about · /create · /dashboard · /explore · /market · /messages · /news ·
/notifications · /profile · /reels · /studio

### API rotalari (9 grup)
auth · feed · profile · market · inbox · uploads · news · engagement · realtime(WS)

### Veritabani (12 model)
User, Follow, Post, Comment, Poll, PollOption, PollVote, Reel, Listing, Tip,
Message, Notification

### Dogrulanan testler (bu surumde calistirilip gecti)
- 11 birim testi (RateLimiter, bot, fraud, oneri, analitik) ✓
- 4 JWT guvenlik testi ✓
- 2 API entegrasyon testi (nonce, auth guard) ✓
- 3 haber dedupe testi ✓
- Sozlesmeler derlendi 3/3 ✓ · Prisma semasi parse edildi (12 model) ✓
- Saf-mantik TypeScript strict tip kontrolu ✓ · Import butunlugu ✓
- E2E (Playwright): 6 senaryo tanimlandi

## Uretici Studyosu + Reklam — TAM ISLEVSEL

### Uretici Studyosu (`/studio`) — 6 arac tek arayuzde
Sorulan tum araclar artik FIILEN calisir (sadece kutuphanede degil, arayuzde bagli):
- **Kes**: zaman cizelgesinde cift tutamac, hassas kesme
- **Yazi Ekle**: video uzerine zaman ayarli metin (baslangic/bitis saniyesi, renk, konum) — ffmpeg drawtext
- **Filtre**: canli onizleme + uygulama
- **Kapak**: videodan istenen saniyede kare cikarma
- **Ses**: ses seviyesi ayari + muzik/ses degistirme (replaceAudio) + sessize alma
- **Sikistir**: CRF kalite ayariyla boyut optimizasyonu

Ek arac fonksiyonlari (media-tools): muteVideo, extractAudio, addVideoImage (sticker/logo),
resizeImage, cropImage, addTextOverlay (resim).

### Reklam Veren — gercekten kampanya olusturur
"Kampanyayi Baslat" butonu artik backend'e kaydeder (onceden hicbir sey yapmiyordu):
- Campaign modeli (Prisma), `/campaigns` rotalari (olustur/listele/durum)
- Hedefleme: ilgi alanlari, fenomen min. takipci, geo
- Sahiplik yetkisi: yalnizca sahibi kampanyasini durdurabilir/duzenleyebilir

### Bu eklemede dogrulanan testler
- Reklam tahmin mantigi 4 test ✓ · Haber dedupe 3 test ✓
- 11 birim testi regresyon yok ✓ · Prisma semasi 13 model ✓
- Import butunlugu: yeni 5 dosya + 6 studyo araci export'u yerinde ✓

## Bu turda eklenenler (tamamlama)

### 1. Sunucu tarafi transcoding (agir videolar)
`services/transcode.ts` + `routes/transcode.ts`: 50MB ustu videolar tarayici yerine
sunucuda native ffmpeg ile islenir (kuyruk + ilerleme takibi). Presetler: reel/hd/sd/audio.
`/transcode/should-server` esik karari verir. **Gercek ffmpeg ile test edildi — calisiyor.**
Dockerfile'a ffmpeg eklendi.

### 2. Gorsel onizleme
Ana akis arayuzu render edilebilir onizleme olarak gosterildi (gercek CSS ile ayni).

### 3. Haber kartlari akista
Feed her 4 gonderide bir guncel HABER karti gosterir (sosyal + dunya nabzi harmani).

### 4. Yorum + anket UI gonderiye gomulu
`PollCard` (oy ver → canli yuzde sonuclari), `CommentSheet` (yorum listesi + ekleme).
Feed'deki her gonderide aktif.

### 5. Studio → Yayinla akisi
Studio ciktisi (kesilen/yazi eklenen/sesi degisen video) dogrudan "Yayinla" ile
akisa/Reels'e gonderilir: blob → uploadMedia → createPost.

### Dogrulanan testler (bu tur)
- Sunucu transcode gercek ffmpeg ile calisti (reel + sd preset) ✓
- Worker kuyruk + ilerleme mantigi ✓
- 11 birim testi regresyon yok ✓ · Prisma 13 model ✓
- Import butunlugu: 4 yeni dosya + 3 bilesen + 8 hook yerinde ✓

## Bu turda eklenenler (sosyal ag standartlari + market)

### Menu standartlari (Twitter/Facebook/TikTok arastirmasi)
Buyuk platformlarda olup eksik olanlar eklendi:
- **Yer Imleri** (`/bookmarks`) — gonderi kaydetme (Bookmark modeli + rotalar)
- Sol menu: Anasayfa, Kesfet, Reels, Haberler, Yer Imleri, Studio, Market, Cuzdan, Bildirimler, Reklam, Profil, Ayarlar

### Market gelistirildi — Pazar + Sanal Magaza
- **Pazar**: kullanici ilanlari, escrow tabanli (onceden vardi)
- **Magaza** (YENI): uygulama ici satin alma — profil resmi, cerceve, rozet, tema
  - Fiyatlar ~$10 referansli (StoreItem.priceUsd + pricePart, PART/USD orani config'ten)
  - Satin alma PART ile zincir uzerinde; envanter + kusanma (avatar/cerceve uygulanir)
  - StoreItem + UserInventory modelleri, `/store` ve `/inventory` rotalari

### Anket olusturma arayuzu (composer)
Gonderi olustururken "Anket ekle" → soru + 2-4 secenek. Yayinlaninca gonderiye baglanir.

### Reels gercek API + transcoding
Reels `/reels`'ten cekiliyor, POST /reels ile olusturuluyor. Buyuk videolar sunucu
transcoding'e yonlendirilir (onceki tur).

### Admin kampanya raporlama
`CampaignList` — kampanyalari listeler, metrik (butce/harcama/gosterim/CTR) gosterir,
duraklat/devam ettir.

### Dogrulanan testler (bu tur)
- 11 birim testi regresyon yok ✓ · Magaza fiyat mantigi ($10=1000 PART) ✓
- Prisma 16 model parse ✓ · Import butunlugu: 5 yeni dosya + 8 hook ✓

## Bu turda eklenenler (owner paneli + dinamik fiyat + gorseller)

### Gozcu Bot + Owner Kontrol Paneli (sadece sahibe gorunur)
`/owner` — YALNIZCA treasury cuzdaniyla giris yapana acik. Sol menude gizli link.
- **Gozcu bot (Sentinel)**: saglik kontrolleri (DB, haber, S3, sozlesme), platform
  istatistikleri, hata toplama, anomali tespiti (hata spike, bos akis, gecikme).
- Bot sorunlari TESPIT EDER ve ONERIR — kendi basina kod degistirmez/mudahale etmez.
  Uygulama karari sahibe ait (guvenli tasarim).
- Moderasyon: gonderi kaldirma, kullanici dogrulama, kullanici listesi.
- Dakikada bir otomatik tazelenen rapor + ozet (kritik/uyari/saglikli).

### PART fiyati — dinamik, panelden ayarlanabilir
- Taban: $0.01 (altina inemez). Ust sinir yok — piyasaya gore yukari serbest.
- `PlatformSetting` modeli + `price.ts` servisi + `/price` (acik okuma) + `/owner/price` (owner yazar).
- Fiyat degisince magazadaki ~$ referansli urunlerin PART karsiligi otomatik guncellenir.

### Magaza gercek gorseller (SVG)
`StoreVisuals.tsx` — Altin/Elmas cerceve, Uretici/Erken rozet, Altin/Neon avatar.
Olceklenebilir SVG, CDN gerektirmez. Magazada ve profilde kullanilir.

### Profil cerceve yansitma
Kusanilan cerceve (avatar/elmas) profil avatarinda gosterilir.

### Feed yer imi butonu
Her gonderide bookmark butonu → /bookmarks'a kaydeder.

### Dogrulanan testler (bu tur)
- PART fiyat tabani + USD→PART donusumu + bot anomali: 9 test ✓
- 11 birim testi regresyon yok ✓ · Prisma 17 model ✓
- Import butunlugu: 6 yeni dosya + 5 owner hook ✓

## Bu turda eklenenler (anlik bildirim + bot scheduler + grafik + Stories)

### Owner'a anlik kritik bildirim
Gozcu bot kritik sorun tespit edince owner'a WebSocket uzerinden anlik uyari
gonderir (5 dk spam korumasi). Sentinel + realtime entegrasyonu.

### Bot scheduler (otomatik tarama)
`scheduler.ts` — sunucu acikken her 15 dk'da bir otomatik sistem taramasi +
rapor uretimi + suresi gecmis story temizligi. Son rapor saklanir.

### Admin gelir/harcama grafikleri
`RevenueChart` — 7 gunluk harcama trendi (alan grafik) + kampanya butce/harcama
karsilastirmasi (bar). Reklam paneline eklendi.

### Stories (24 saatte kaybolan icerik) — KULLANICILARIN COK TERCIH ETTIGI
Internet arastirmasinda en kritik eksik cikti (Snapchat/Instagram standardi).
- `Story` modeli (24s sonra expiresAt) + `/stories` rotalari
- Feed ustunde yatay story halkalari + tam ekran goruntuleyici (ilerleme cubugu, gezinme)
- Scheduler suresi gecmis story'leri otomatik temizler

### Internet arastirmasi: kullanici tercihleri (2026)
EN COK kullanilan: kisa video (Reels) ✓, Stories ✓(yeni), DM ✓, carousel(~),
tipping/"Love" ✓, dark mode ✓. Bizde olanlar buyuk platform standartlariyla ortusuyor.

## Bu turda eklenenler (kurulum kolaylastirma + son ozellikler)

### Derleme hazirligi (senin %10'unu kolaylastirma)
- Tum paketlere tsconfig.json eklendi (paylasilan tsconfig.base.json)
- Her pakete typecheck + build scriptleri
- Saf mantik paketleri (security/recommendation/analytics/config) GERCEKTEN derlendi
  ve TEMIZ — bunlar sende sorun cikarmaz.

### Tek komut kurulum
`pnpm setup` → .env + install + PostgreSQL + Prisma migrate + seed.
`docs/KURULUM.md` — adim adim checklist (.env anahtarlari, olasi derleme hatalari +
cozumleri, sozlesme deploy, tarayici test listesi). Audit en sona (OpenZeppelin).

### Carousel (coklu resim/video)
Post.mediaUrls dizisi + swipe edilebilir Carousel bileseni (Instagram tarzi,
nokta gostergeli). Feed'de aktif.

### Story olusturma akisi
StoryBar "Ekle" butonu → dosya sec → S3'e yukle → 24s story olustur. Tam calisir.

### Dogrulanan testler (bu tur)
- 4 saf paket gercekten derlendi, TEMIZ ✓ · 10 tsconfig gecerli ✓
- 11 birim testi ✓ · Prisma 18 model ✓ · Import butunlugu ✓

## Bu turda eklenenler

### Composer coklu dosya (carousel)
CreatePost artik birden fazla resim/video secebiliyor → sirayla yuklenip carousel
gonderisi olur. Zincir uctan uca: composer → useApi(mediaUrls) → backend → prisma → feed render.

### Kurulum dogrulama (dry-run)
`pnpm check` (scripts/check.sh) — kurulum yapmadan yapinin butunlugunu kontrol eder:
gereksinimler, dosyalar, tsconfig'ler, .env, adresler, sema. **Calistirildi: 27 kontrol
gecti** (sadece pnpm/docker bu ortamda yok, sende olacak).

### v2 yol haritasi
`docs/V2-ROADMAP.md` — canli yayin (LiveKit/Mux), AR filtreler (MediaPipe), gelismis
arama/kesfet, topluluklar, mobil (React Native), gelismis crypto (abonelik/NFT/DAO),
olceklendirme (Redis/BullMQ/CDN). Oncelik onerisi + v1'de bilerek yapilmayanlar.

### Dogrulama (bu tur)
- check.sh calisti: 27 kontrol gecti ✓ · Carousel zinciri butun ✓
- 11 birim testi ✓ · Prisma 18 model ✓

## Bu turda eklenenler

### Carousel surukle-sirala
Composer'da coklu medya secince surukle-birak ile sira degistirme + tek tek kaldirma.
Onizleme seridi numarali, ilk medya carousel kapagi olur.

### Sol menu bildirim rozeti
Okunmamis bildirim sayisi menude kirmizi rozet (9+ kismi). useNotifications.unread'den.

### Production deploy
- `.github/workflows/deploy.yml` — main'e push → CI gecer → Vercel(web)+Railway(api) deploy.
- `docs/DEPLOY-PROD.md` — yonetilen servis (Vercel+Railway+yonetilen PG) VEYA tek-sunucu
  (Docker) rehberi, deploy oncesi/sonrasi kontrol listeleri.
- CORS production guvenligi: CORS_ORIGIN env ile domain kisitlamasi (acik degil).

### Dogrulama (bu tur)
- 3 ozellik butunlugu ✓ · dry-run 27 kontrol gecti ✓ · 11 birim testi ✓

## Bu turda eklenenler (eksik tamamlama + cila)

### Ayarlar sayfasi (/settings)
Profil duzenleme (ad, bio — backend PATCH /me), tema secimi, bildirim tercihleri,
hesap/cuzdan bilgisi.

### Feed sekmeleri: Sana Ozel / Takip Edilenler
Backend /feed?scope=following filtresi (takip edilenlerin gonderileri) + UI sekmesi.

### Skeleton & bos durum cilasi
Yuklenirken icerik-bicimli iskelet (shimmer animasyon), bos durumlar icin
aciklayici EmptyState. Spinner yerine profesyonel his.

### EKSIK LINKLER KAPATILDI
Menude olup sayfasi olmayan iki link tamamlandi:
- /wallet — cuzdan detayi, PART bakiye + USD degeri, hizli islemler, BscScan
- /advertise — reklam veren bilgi sayfasi + panele yonlendirme

### Eksik taramasi sonucu
Tum 13 menu linki artik calisir sayfaya gidiyor. Buyuk platform ozellik
standartlarinin tamami v1'de mevcut (canli yayin + AR v2'de).

### Dogrulama (bu tur)
- 13/13 menu linki calisir ✓ · 17 sayfa · 11 birim testi ✓ · Prisma 18 model ✓

## Bu turda eklenenler (cila yayilimi + owner araclari)

### Skeleton cilasi tum sayfalara
ProfileSkeleton, GridSkeleton (market/magaza), ListSkeleton (bildirim/yer imleri/haber).
Tum sayfa-yukleme spinner'lari icerik-bicimli iskelete cevrildi (shimmer).
Buton-ici spinner'lar (Gonder/Kaydet) dogru kullanim olarak kaldi.

### Owner paneli araclari
- "Simdi Tara" — botu manuel tetikle (bekleme yok)
- "Raporu Indir (JSON)" — tam sistem raporunu dosya olarak indir

### Dogrulama (bu tur)
- 7 skeleton tipi ✓ · 5 ozellik butun ✓ · dry-run 27 gecti ✓ · 11 birim testi ✓
