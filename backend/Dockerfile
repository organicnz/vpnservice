FROM node:20-alpine AS build

# Install system dependencies
RUN apk --no-cache add wget curl

WORKDIR /app

# Copy package files to leverage Docker's caching
COPY package*.json ./

# Install dependencies - using npm install instead of npm ci since package-lock.json might not exist
RUN npm install --omit=dev && \
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

# Switch to non-root user for security
USER nodeapp

# Expose the port
EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "src/index.js"] 