FROM node:20-slim AS base
RUN corepack enable
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* turbo.json ./
COPY apps/web/package.json apps/web/
COPY packages/wallet/package.json packages/wallet/
COPY packages/media-tools/package.json packages/media-tools/
COPY packages/config/package.json packages/config/
COPY packages/analytics/package.json packages/analytics/
COPY packages/recommendation/package.json packages/recommendation/
COPY packages/security/package.json packages/security/
RUN pnpm install --frozen-lockfile=false

COPY packages packages
COPY apps/web apps/web

WORKDIR /app/apps/web
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
