#!/bin/bash
set -e
echo "=== Step 1: Install pnpm ==="
npm install -g pnpm@9
echo "=== Step 2: pnpm install ==="
pnpm install --no-frozen-lockfile
echo "=== Step 3: Build API and deps ==="
pnpm --filter @saphara/api... build
echo "=== Step 4: Prisma generate ==="
cd apps/api && npx prisma generate --schema=./prisma/schema.prisma
cd ../..
echo "=== Build complete ==="
