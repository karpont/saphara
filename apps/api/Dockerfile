FROM node:20-slim AS base
RUN apt-get update -y && apt-get install -y openssl ffmpeg && corepack enable
WORKDIR /app

# Workspace manifest'leri
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* turbo.json ./
COPY apps/api/package.json apps/api/
COPY packages/security/package.json packages/security/
COPY packages/recommendation/package.json packages/recommendation/
RUN pnpm install --frozen-lockfile=false

# Kaynak
COPY packages/security packages/security
COPY packages/recommendation packages/recommendation
COPY apps/api apps/api

WORKDIR /app/apps/api
RUN pnpm prisma generate
EXPOSE 4000
# Migrate + seed sonra calistirilir; basit baslangic:
CMD ["sh", "-c", "pnpm prisma migrate deploy && pnpm tsx src/server.ts"]
