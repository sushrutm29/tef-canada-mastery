# ============================================================
# STAGE 1 — deps
# ============================================================
FROM node:22-slim AS deps

WORKDIR /app
COPY package*.json ./
RUN npm ci

# ============================================================
# STAGE 2 — builder
# ============================================================
FROM node:22-slim AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ============================================================
# STAGE 3 — runner
# ============================================================
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
# Bind to all interfaces or the load balancer can't reach the app.
ENV HOSTNAME=0.0.0.0

# standalone output: self-contained server, 57MB of deps not 469MB.
COPY --from=builder /app/.next/standalone ./

# standalone excludes these (Next assumes a CDN may serve them).
# Without them you get an unstyled page and broken images.
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER node

EXPOSE 3000

# standalone starts with server.js, not "next start".
CMD ["node", "server.js"]