FROM node:20-alpine

WORKDIR /app

# Install wget for healthcheck
RUN apk --no-cache add wget

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies with clean cache to avoid any stale dependencies
RUN npm cache clean --force && \
    npm install && \
    npm cache clean --force

# Copy the rest of the application
COPY . .

# Create logs directory
RUN mkdir -p logs

# Expose the port
EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "src/index.js"] 