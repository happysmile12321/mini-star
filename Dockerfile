# ============================================================
# mini-star Dockerfile
# Single container with Nginx for static hosting
# ============================================================

# Stage 1: Build the playground app using existing bun image
FROM oven/bun:1 AS builder

WORKDIR /app

# Install npm and pnpm
RUN apt-get update && apt-get install -y --no-install-recommends npm && \
    npm install -g pnpm@7 && \
    rm -rf /var/lib/apt/lists/*

# Copy source files
COPY . .

# Install dependencies using pnpm
RUN pnpm install --force --ignore-scripts

# Build mini-star package first
WORKDIR /app
RUN pnpm exec rimraf ./lib/**/*.d.ts && pnpm exec tsc -p ./tsconfig.build.json

# Build playground
WORKDIR /app/playground
RUN pnpm run build

# Stage 2: Serve with nginx
FROM nginx:alpine AS runner

# Copy built files
COPY --from=builder /app/playground/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=5s --timeout=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]