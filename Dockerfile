# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy deps from build stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source
COPY . .

# Ensure logs dir exists and is owned by appuser
RUN mkdir -p logs && chown -R appuser:appgroup /app

USER appuser

EXPOSE 3000

# Health check hits /api/health — if down, container is marked unhealthy
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "src/server.js"]
