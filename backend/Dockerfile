# backend/Dockerfile  —  producción
# Build multi-stage para imagen liviana

# ── Etapa 1: dependencias ─────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# ── Etapa 2: imagen final ─────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Usuario sin privilegios (seguridad)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=deps /app/node_modules ./node_modules
COPY src ./src
COPY package.json ./

# Directorio para uploads (si se necesita)
RUN mkdir -p uploads exports && chown -R appuser:appgroup /app

USER appuser

ENV NODE_ENV=production
EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "src/app.js"]
