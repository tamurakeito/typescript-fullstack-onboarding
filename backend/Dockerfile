FROM node:20-alpine AS base

RUN npm install -g pnpm

WORKDIR /app

FROM base AS builder

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY backend/package.json ./backend/

RUN pnpm install --frozen-lockfile --filter backend --prod=false --ignore-scripts

COPY backend/ ./backend/

WORKDIR /app/backend
RUN pnpm db:generate
RUN pnpm build

# デバッグ用：ビルドプロセスを詳細に確認
RUN ls -la src/
RUN ls -la dist/
RUN find dist/ -name "*.js" | head -10

FROM base AS runner

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 hono

WORKDIR /app

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY backend/package.json ./backend/

RUN pnpm install --frozen-lockfile --filter backend --prod=false --ignore-scripts

COPY --from=builder /app/backend/dist ./backend/dist
COPY backend/prisma ./backend/prisma/

USER hono

WORKDIR /app/backend

# デバッグ用：distディレクトリの内容を確認
RUN ls -la dist/

ENV NODE_ENV=production

CMD ["node", "dist/src/index.js"]
