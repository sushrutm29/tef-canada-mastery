# ============================================================
# STAGE 1 — builder: install everything, generate Prisma, compile
# ============================================================
FROM node:22-slim AS builder

WORKDIR /app

# Install deps first, separately from source code.
# Docker caches each step; package files change less often than
# source, so this layer gets reused on most rebuilds.
COPY package*.json ./
RUN npm ci

# Schema must exist before generating the client.
COPY prisma ./prisma

# Generate Prisma client BEFORE compiling TypeScript.
# Your schema outputs to src/generated/prisma, and nest build (tsc)
# needs those files to exist or it fails with "cannot find module".
RUN npx prisma generate

COPY . .
RUN npm run build

# Drop dev dependencies — needed to build, never to run.
RUN npm prune --omit=dev

# ============================================================
# STAGE 2 — runner: clean image, only what runs
# ============================================================
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/src/generated ./src/generated

# Non-root user: if the app is compromised, the attacker isn't root.
USER node

EXPOSE 4000

CMD ["node", "dist/main"]