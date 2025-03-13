FROM node:20-alpine AS build

# Install system dependencies
RUN apk --no-cache add wget curl

WORKDIR /app

# Accept build arguments for npm flags
ARG NODE_ENV=production
ARG NPM_FLAGS="--no-audit --no-fund"

# Copy package files to leverage Docker's caching
COPY package*.json ./

# Install dependencies with a more streamlined approach
RUN echo "Installing dependencies..." && \
    npm config set registry https://registry.npmjs.org/ && \
    # Try npm ci first (faster and more reliable when package-lock.json is present)
    (npm ci ${NPM_FLAGS} || npm install ${NPM_FLAGS}) && \
    npm cache clean --force

# Copy application code
COPY . .

# Perform linting and apply fixes if possible
RUN echo "Running linting checks..." && \
    if [ -f "fix-lint.js" ]; then \
      node fix-lint.js || echo "Fix script completed with warnings"; \
    fi && \
    if [ -f "package.json" ] && grep -q "lint:fix" package.json; then \
      npm run lint:fix || echo "Linting fix completed with issues"; \
    fi

# Build TypeScript code with better error handling
RUN echo "Building TypeScript code..." && \
    npm run build || \
    (echo "Build failed with errors. See logs above for details." && exit 1)

# Production stage - multi-stage build to reduce final image size
FROM node:20-alpine AS production

# Create non-root user for security
RUN addgroup -S nodeapp && \
    adduser -S -G nodeapp nodeapp && \
    apk --no-cache add wget curl

WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=build /app/package.json .
COPY --from=build /app/package-lock.json* ./
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules

# Create logs directory with proper permissions
RUN mkdir -p logs && \
    chown -R nodeapp:nodeapp logs && \
    chown -R nodeapp:nodeapp .

# Add security hardening
RUN echo "fs.file-max = 65535" > /etc/sysctl.conf && \
    echo "net.ipv4.ip_local_port_range = 1024 65000" >> /etc/sysctl.conf && \
    echo "net.ipv4.tcp_tw_reuse = 1" >> /etc/sysctl.conf

# Install security audit tools only in production
RUN if [ "$NODE_ENV" = "production" ]; then \
      npm i -g npm-audit-ci && \
      npm-audit-ci || echo "Security audit completed with warnings"; \
    fi

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
CMD ["node", "dist/index.js"]