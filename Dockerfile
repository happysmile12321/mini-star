# ============================================================
# mini-star Dockerfile
# Single container with Nginx for static hosting
# ============================================================

# Stage 1: Build the mini-star package and playground app
FROM node:20-bullseye AS builder

WORKDIR /app

# Install git and other dependencies
RUN apt-get update && apt-get install -y --no-install-recommends git && \
    rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN npm install -g pnpm@7

# Copy the entire project
COPY . ./

# Install all dependencies
RUN pnpm install --force --ignore-scripts

# Build mini-star package first
WORKDIR /app/mini-star
RUN pnpm exec tsc -p tsconfig.build.json

# Build playground
WORKDIR /app/playground
RUN pnpm run build

# Stage 2: Serve with nginx
FROM nginx:alpine AS runner

# Copy built files
COPY --from=builder /app/playground/dist /usr/share/nginx/html

# Copy nginx config from builder
COPY --from=builder /app/nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=5s --timeout=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]