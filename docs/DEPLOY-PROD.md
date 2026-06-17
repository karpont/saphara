# Saphara — Production Deploy Rehberi

Onerilen mimari: Web → Vercel · API → Railway/Fly.io · DB → yonetilen PostgreSQL.
Alternatif: hepsi tek sunucuda `docker compose up -d`.

## Secenek A — Yonetilen servisler (onerilen)

### 1. Veritabani (yonetilen PostgreSQL)
- Neon, Supabase, Railway PostgreSQL veya AWS RDS.
- Baglanti string'ini al → `DATABASE_URL`.

### 2. API → Railway
```bash
npm i -g @railway/cli
railway login
railway init                       # yeni proje
railway up                         # apps/api deploy
```
- Ortam degiskenleri (Railway dashboard): DATABASE_URL, JWT_SECRET, RPC_URL_BSC,
  GNEWS_API_KEY, S3_*, AUTH_DOMAIN (web domain'i).
- Dockerfile CMD migrate'i otomatik calistirir.

### 3. Web → Vercel
```bash
npm i -g vercel
vercel link                        # apps/web'i bagla
vercel --prod
```
- Ortam (Vercel dashboard): NEXT_PUBLIC_API_URL (Railway API URL),
  NEXT_PUBLIC_WS_URL, NEXT_PUBLIC_PART_TOKEN_ADDRESS, NEXT_PUBLIC_TREASURY_ADDRESS,
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID.

### 4. Otomatik deploy (GitHub Actions)
`.github/workflows/deploy.yml` hazir. GitHub repo secrets'a ekle:
- VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID
- RAILWAY_TOKEN
main'e push → CI gecer → otomatik deploy.

## Secenek B — Tek sunucu (Docker)
```bash
# Sunucuda (VPS):
git clone <repo> && cd saphara
cp .env.example .env               # production degerleriyle doldur
docker compose up -d               # web:3000 + api:4000 + db
```
- Nginx/Caddy ile reverse proxy + SSL (Let's Encrypt) ekle.

## Deploy oncesi kontrol
- [ ] Sozlesmeler testnet'te test edildi
- [ ] (Mainnet icin) OpenZeppelin audit yapildi
- [ ] JWT_SECRET guclu ve gizli
- [ ] CORS origin production domain'e kisitli (server.ts)
- [ ] S3 bucket public-read politikasi medya icin ayarli
- [ ] Rate limit degerleri production yukune gore ayarli

## Deploy sonrasi
- [ ] /health endpoint 200 donuyor
- [ ] Cuzdan baglanti + SIWE giris calisiyor
- [ ] Owner paneli (treasury cuzdani) erisilebiliyor
- [ ] Bot raporu uretiliyor (scheduler aktif)
