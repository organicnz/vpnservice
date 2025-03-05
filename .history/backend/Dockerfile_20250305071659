FROM node:20-alpine

# Create non-root user for security
RUN addgroup -S nodeapp && \
    adduser -S -G nodeapp nodeapp

WORKDIR /app

# Install system dependencies
RUN apk --no-cache add wget curl

# Copy package files to leverage Docker's caching
COPY package*.json ./

# Install dependencies with production flag to avoid dev dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy application code (exclude development files)
COPY --chown=nodeapp:nodeapp . .

# Create logs directory with proper permissions
RUN mkdir -p logs && \
    chown -R nodeapp:nodeapp logs

# Switch to non-root user for security
USER nodeapp

# Expose the port
EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "src/index.js"] 