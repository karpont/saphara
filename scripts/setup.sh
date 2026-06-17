#!/usr/bin/env bash
# Saphara tek-komut kurulum. Kullanim: bash scripts/setup.sh
set -e

echo "🔵 Saphara kurulum basliyor..."

# 0) Gereksinim kontrolu
command -v pnpm >/dev/null 2>&1 || { echo "pnpm gerekli: npm install -g pnpm"; exit 1; }
command -v docker >/dev/null 2>&1 || echo "⚠ Docker yok — PostgreSQL'i elle kurman gerekir"

# 1) .env yoksa ornek kopyala
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✓ .env olusturuldu (.env.example'dan). API anahtarlarini doldur!"
fi

# 2) Bagimliliklar
echo "📦 Bagimliliklar kuruluyor..."
pnpm install

# 3) PostgreSQL (Docker ile)
if command -v docker >/dev/null 2>&1; then
  echo "🐘 PostgreSQL baslatiliyor (Docker)..."
  docker compose up -d db
  echo "   DB hazir olana kadar bekleniyor..."
  sleep 8
fi

# 4) Prisma: generate + migrate + seed
echo "🗄  Veritabani hazirlaniyor..."
pnpm --filter @saphara/api prisma generate
pnpm --filter @saphara/api prisma migrate dev --name init || pnpm --filter @saphara/api prisma migrate deploy
pnpm --filter @saphara/api prisma:seed

echo ""
echo "✅ Kurulum tamam!"
echo ""
echo "Calistirmak icin:"
echo "  pnpm dev              # tum uygulamalar (web:3000, admin:3001, api:4000)"
echo ""
echo "Eksik adimlar (.env'e ekle):"
echo "  - GNEWS_API_KEY (gnews.io - ucretsiz)"
echo "  - NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID (cloud.walletconnect.com)"
echo "  - S3_* (medya yukleme icin - opsiyonel)"
echo ""
echo "Sozlesme deploy (testnet):"
echo "  cd packages/contracts && pnpm deploy:bsc-testnet"
