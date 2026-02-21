# ─── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace configuration (needed for npm workspaces + shared package)
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/web/package.json ./apps/web/

# Install all dependencies
RUN npm ci

# Copy source files
COPY packages/shared/ ./packages/shared/
COPY apps/web/ ./apps/web/

# Build the frontend
WORKDIR /app/apps/web
RUN npm run build

# ─── Stage 2: Serve with nginx ─────────────────────────────────────────────────
FROM nginx:alpine

COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
