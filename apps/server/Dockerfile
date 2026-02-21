# ─── Server Dockerfile ─────────────────────────────────────────────────────────
# Uses tsx to run TypeScript in production (compatible with npm workspaces)
FROM node:20-alpine

# Prisma vereist OpenSSL op Alpine Linux
RUN apk add --no-cache openssl

WORKDIR /app

# Copy workspace configuration
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/server/package.json ./apps/server/
COPY apps/web/package.json ./apps/web/

# Install all dependencies (includes tsx and prisma)
RUN npm ci

# Copy source files
COPY packages/shared/ ./packages/shared/
COPY apps/server/ ./apps/server/

# Generate Prisma client
WORKDIR /app/apps/server
RUN npx prisma generate

EXPOSE 3001

ENTRYPOINT ["sh", "entrypoint.sh"]
