#!/bin/bash
set -e
echo "[1/3] Install pnpm..."
npm install -g pnpm@9

echo "[2/3] Install workspace dependencies..."
pnpm install --no-frozen-lockfile

echo "[3/3] Generate Prisma client..."
pnpm --filter @saphara/api exec prisma generate

echo "Build complete!"
