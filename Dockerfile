# ============================================================
# mini-star Dockerfile
# Single container with Nginx for static hosting
# ============================================================

# Stage 1: Build the playground app
FROM node:20-bullseye AS builder

WORKDIR /app

# Copy the entire mini-star project
COPY . ./

# (可选) 安装必要环境 等操作 
RUN apt-get update && apt-get install -y --no-install-recommends git && \
    npm install -g pnpm@7 && pnpm install --force --ignore-scripts && \
    rm -rf /var/lib/apt/lists/*


# Build mini-star package first using pnpm exec
WORKDIR /app
RUN pnpm exec rimraf ./lib/**/*.d.ts && pnpm exec tsc -p ./tsconfig.build.json

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