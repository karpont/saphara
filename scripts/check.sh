#!/usr/bin/env bash
# Saphara kurulum-oncesi dogrulama (dry-run). Kurulum yapmadan kontrol eder.
# Kullanim: bash scripts/check.sh

echo "🔍 Saphara dogrulama basliyor..."
echo ""
PASS=0; FAIL=0; WARN=0
ok()   { echo "  ✓ $1"; PASS=$((PASS+1)); }
fail() { echo "  ✗ $1"; FAIL=$((FAIL+1)); }
warn() { echo "  ⚠ $1"; WARN=$((WARN+1)); }

echo "[1] Gereksinimler"
command -v node >/dev/null 2>&1 && ok "node ($(node -v))" || fail "node yok (20+ gerekli)"
command -v pnpm >/dev/null 2>&1 && ok "pnpm ($(pnpm -v))" || fail "pnpm yok (npm i -g pnpm)"
command -v docker >/dev/null 2>&1 && ok "docker" || warn "docker yok (PostgreSQL elle kurulmali)"

echo ""
echo "[2] Proje yapisi"
for d in apps/web apps/admin apps/api packages/config packages/wallet packages/contracts; do
  [ -d "$d" ] && ok "$d" || fail "$d eksik"
done

echo ""
echo "[3] Kritik dosyalar"
for f in package.json pnpm-workspace.yaml turbo.json docker-compose.yml .env.example \
         apps/api/prisma/schema.prisma apps/api/src/server.ts; do
  [ -f "$f" ] && ok "$f" || fail "$f eksik"
done

echo ""
echo "[4] tsconfig butunlugu"
for d in apps/web apps/admin apps/api packages/config packages/wallet packages/media-tools \
         packages/analytics packages/recommendation packages/security packages/ui; do
  [ -f "$d/tsconfig.json" ] && ok "$d/tsconfig.json" || fail "$d/tsconfig.json eksik"
done

echo ""
echo "[5] .env durumu"
if [ -f .env ]; then
  ok ".env mevcut"
  grep -q "DATABASE_URL=.\+" .env && ok "DATABASE_URL dolu" || warn "DATABASE_URL bos"
  grep -q "JWT_SECRET=.\+" .env && ok "JWT_SECRET dolu" || warn "JWT_SECRET bos (uret!)"
  grep -q "GNEWS_API_KEY=.\+" .env && ok "GNEWS_API_KEY dolu" || warn "GNEWS_API_KEY bos (haberler bos gelir)"
else
  warn ".env yok — 'cp .env.example .env' calistir"
fi

echo ""
echo "[6] Adres yapilandirmasi"
grep -q "0xD95aC89029451c57Adf172192176d7264d49305a" packages/config/src/index.ts && ok "PART token adresi yapilandirildi" || fail "PART adresi eksik"
grep -q "0x55B26f8CD67632d7AF9a888c645054Ca76E53455" packages/config/src/index.ts && ok "Treasury adresi yapilandirildi" || fail "Treasury adresi eksik"

echo ""
echo "[7] Prisma sema model sayisi"
MODELS=$(grep -c '^model ' apps/api/prisma/schema.prisma)
[ "$MODELS" -ge 18 ] && ok "$MODELS model tanimli" || warn "$MODELS model (beklenen 18)"

echo ""
echo "═══════════════════════════════════"
echo "  ✓ $PASS gecti · ⚠ $WARN uyari · ✗ $FAIL hata"
echo "═══════════════════════════════════"
if [ "$FAIL" -gt 0 ]; then
  echo "  ✗ Hatalar var — duzelt, sonra 'pnpm setup' calistir."
  exit 1
else
  echo "  ✅ Yapi saglam. 'pnpm setup' ile kuruluma gecebilirsin."
  [ "$WARN" -gt 0 ] && echo "  (Uyarilar bloklamaz ama .env'i tamamlamak iyi olur.)"
fi
