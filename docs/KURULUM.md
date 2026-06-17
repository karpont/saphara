# Saphara — Kurulum & Yayina Alma Checklisti

Bu dosya, kod tamamlandiktan sonra SENIN yapacagin adimlari sirayla anlatir.
Audit'i sona biraktik (OpenZeppelin'de yapilacak).

## 0. Gereksinimler
- [ ] Node.js 20+ kurulu (`node -v`)
- [ ] pnpm 9+ kurulu (`npm install -g pnpm`)
- [ ] Docker + Docker Compose (PostgreSQL icin; istersen elle de kurabilirsin)
- [ ] Test cuzdani (MetaMask) + biraz BSC testnet BNB (faucet: testnet.bnbchain.org/faucet-smart)

## 1. Tek komutla kurulum (onerilen)
```bash
pnpm setup
```
Bu script: .env olusturur → bagimliliklari kurar → PostgreSQL baslatir →
Prisma generate+migrate+seed yapar. Bittiginde `pnpm dev` ile baslatabilirsin.

## 2. Elle kurulum (script calismadiysa)
```bash
cp .env.example .env          # sonra .env'i duzenle
pnpm install
docker compose up -d db        # veya kendi PostgreSQL'ini kur
pnpm --filter @saphara/api prisma generate
pnpm --filter @saphara/api prisma migrate dev --name init
pnpm --filter @saphara/api prisma:seed
pnpm dev
```

## 3. .env'e doldurulacak anahtarlar
| Anahtar | Nereden | Zorunlu mu? |
|---------|---------|-------------|
| DATABASE_URL | docker compose otomatik / kendi DB | Evet |
| JWT_SECRET | rastgele uzun string uret | Evet |
| NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID | cloud.walletconnect.com | Cuzdan icin |
| GNEWS_API_KEY | gnews.io (ucretsiz) | Haberler icin |
| NEWSDATA_API_KEY | newsdata.io (ucretsiz) | Haber alternatifi |
| S3_* (ENDPOINT/BUCKET/KEY) | Cloudflare R2 / AWS S3 / MinIO | Medya yukleme icin |
| NEXT_PUBLIC_PART_TOKEN_ADDRESS | zaten dolu (0xD95a...) | Evet (dolu) |
| NEXT_PUBLIC_TREASURY_ADDRESS | zaten dolu (0x55B2...) | Evet (dolu) |

> PART token ve treasury adresleri zaten yapilandirildi. Sadece tipping +
> market deploy edilince donen adresler otomatik .env'e yazilir.

## 4. Olasi derleme (build) hatalari ve cozumleri
Saf mantik paketleri (security, recommendation, analytics, config) **temiz derlenir**
(test edildi). Olasi sorunlar React/wagmi/Prisma tarafinda:

- **"Cannot find module '@saphara/...'"** → `pnpm install` tekrar; turbo.json
  transpilePackages zaten ayarli.
- **Prisma tip hatalari** → `pnpm --filter @saphara/api prisma generate` calistir
  (Prisma Client uretilmeden tipler eksik gorunur).
- **wagmi/viem versiyon uyusmazligi** → `pnpm install` lockfile'i tazeler;
  wagmi v2 + viem v2 uyumlu.
- **Next.js "use client" uyarilari** → bilesenlerde zaten var; sorun cikarsa
  ilgili dosyaya `"use client";` ekle.

Tip kontrolu: `pnpm typecheck` (her pakette ayri da calistirilabilir).

## 5. Sozlesme deploy (BSC Testnet)
```bash
cd packages/contracts
# .env'e DEPLOYER_PRIVATE_KEY (SADECE test cuzdani!) ekle
pnpm install
pnpm compile
pnpm deploy:bsc-testnet
```
Donen tipping + market adresleri otomatik repo .env'ine yazilir.
Frontend hicbir kod degisikligi gerektirmez.

## 6. Gercek tarayici testi (manuel kontrol listesi)
`pnpm dev` sonrasi http://localhost:3000:
- [ ] Anasayfa akisi yukleniyor, story bari gorunuyor
- [ ] Cuzdan bagla → SIWE imzala → giris yap
- [ ] Gonderi olustur (anket ekleyerek dene)
- [ ] Studio: video sec → kes/yazi/ses → yayinla
- [ ] Reels akisi kayiyor, otomatik oynuyor
- [ ] Market → Magaza: profil resmi/cerceve satin al → kusan
- [ ] Profil: kusanilan cerceve gorunuyor
- [ ] Bahsis gonder (PART)
- [ ] Mesaj gonder (anlik geliyor mu)
- [ ] Haberler sayfasi (API anahtari varsa) dolu
- [ ] Owner cuzdaniyla giris → /owner paneli gorunuyor, bot raporu geliyor
- [ ] Owner: PART fiyatini degistir → magaza fiyatlari guncellendi mi

## 7. Audit (EN SON — OpenZeppelin)
Para tutan sozlesmeler (PartToken, CreatorTipping, SapharaMarket) mainnet'e
cikmadan once OpenZeppelin / benzeri ile denetlenmeli. Testnet'te sorunsuz
calistiktan sonra yapilir.

## 8. Yayina alma (production)
```bash
docker compose up -d           # web + api + db hep birlikte
```
veya web → Vercel, api → Railway/Fly.io, db → yonetilen PostgreSQL.
