# ============================================================
# mini-star Dockerfile
# Single container with Nginx for static hosting
# ============================================================

# Use node:20-bullseye as base image with nginx
FROM node:20-bullseye

# Set working directory
WORKDIR /app

# Install git, nginx and other dependencies
RUN apt-get update && apt-get install -y --no-install-recommends  nginx && \
    rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN npm i nrm && nrm use taobao && npm install -g pnpm@7

# Copy the entire project (original repository state)
COPY . ./

# Install all dependencies
RUN pnpm install --force --ignore-scripts

# Build mini-star package
RUN pnpm exec tsc -p mini-star/tsconfig.build.json

# Build playground
WORKDIR /app/playground
RUN pnpm run build

# Copy built files to nginx html directory
RUN cp -r /app/playground/dist/* /usr/share/nginx/html/  && apt-get update && apt-get install -y --no-install-recommends  git && \
    rm -rf /var/lib/apt/lists/*


# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=5s --timeout=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]