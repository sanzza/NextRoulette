# =============================================================================
# NextRoulette — image de production (build « standalone » Next.js)
# Multi-stage : deps -> build -> runner minimal.
# =============================================================================

# ---- 1. Dépendances (avec les outils de compilation pour better-sqlite3) -----
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- 2. Build ---------------------------------------------------------------
FROM node:22-alpine AS builder
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# JWT_SECRET factice : nécessaire au build, jamais utilisé à l'exécution.
ENV JWT_SECRET=build-time-only-secret-not-used-at-runtime-32c
RUN npm run build

# ---- 3. Runner (image finale légère) ----------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# La base et les photos vivent ici → à monter sur un VOLUME persistant.
ENV DATABASE_PATH=/app/data/nextroulette.db

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs \
  && mkdir -p /app/data && chown -R nextjs:nodejs /app

# Sortie standalone : serveur + node_modules tracés (dont le binaire natif SQLite).
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0
VOLUME ["/app/data"]

CMD ["node", "server.js"]
