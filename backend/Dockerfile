FROM node:20-alpine AS base

RUN npm install -g pnpm

WORKDIR /app

FROM base AS builder

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY backend/package.json ./backend/
COPY schema/package.json ./schema/

RUN pnpm install --frozen-lockfile --prod=false --ignore-scripts

COPY backend/ ./backend/
COPY schema/ ./schema/

WORKDIR /app/schema
RUN pnpm compile

WORKDIR /app/backend
RUN pnpm db:generate
RUN pnpm generate:client
RUN pnpm build

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

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]
