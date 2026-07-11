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

# su-exec : permet à l'entrypoint (root) de lancer l'app en utilisateur non-root
# après avoir réparé la propriété du volume de données.
RUN apk add --no-cache su-exec \
  && addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs \
  && mkdir -p /app/data && chown -R nextjs:nodejs /app

# Sortie standalone : serveur + node_modules tracés (dont le binaire natif SQLite).
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0
# NB : pas d'instruction VOLUME ici (refusée par Railway). Monter un volume
# persistant sur /app/data via l'hébergeur (Railway Volumes, compose, -v…).
# L'entrypoint démarre en root pour chown le volume monté (Railway monte les
# volumes en root:root), puis exécute `node server.js` en utilisateur nextjs.

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server.js"]
