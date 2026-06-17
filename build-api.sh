#!/bin/bash
set -e
npm install -g pnpm@9
pnpm install --no-frozen-lockfile
pnpm --filter @saphara/api... build
pnpm --filter @saphara/api exec prisma generate
