FROM node:20-alpine AS build

# Install system dependencies
RUN apk --no-cache add wget curl

WORKDIR /app

# Copy package files to leverage Docker's caching
COPY package*.json ./

# Install dependencies with a more resilient approach
RUN if [ -s package-lock.json ] && grep -q "lockfileVersion" package-lock.json; then \
      echo "Valid package-lock.json found, using npm ci"; \
      npm ci --only=production --no-audit --no-fund; \
    else \
      echo "No valid package-lock.json found, using npm install"; \
      npm install --omit=dev --no-audit --no-fund; \
    fi && \
    npm cache clean --force

# Copy application code
COPY . .

# Production stage - multi-stage build to reduce final image size
FROM node:20-alpine AS production

# Create non-root user for security
RUN addgroup -S nodeapp && \
    adduser -S -G nodeapp nodeapp && \
    apk --no-cache add wget curl

WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=build /app/package.json .
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/src ./src

# Create logs directory with proper permissions
RUN mkdir -p logs && \
    chown -R nodeapp:nodeapp logs && \
    chown -R nodeapp:nodeapp .

# Add security hardening
RUN echo "fs.file-max = 65535" > /etc/sysctl.conf && \
    echo "net.ipv4.ip_local_port_range = 1024 65000" >> /etc/sysctl.conf && \
    echo "net.ipv4.tcp_tw_reuse = 1" >> /etc/sysctl.conf && \
    npm i -g npm-audit-ci && \
    npm-audit-ci

# Performance tuning with environment variables
ENV NODE_ENV=production \
    NODE_OPTIONS="--max-old-space-size=2048 --max-http-header-size=16384" \
    UV_THREADPOOL_SIZE=128 \
    NODE_HTTP_PARSER=legacy

# Switch to non-root user for security
USER nodeapp

# Expose the port
EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "src/index.js"] 