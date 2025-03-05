# Use Node.js 20 as the base image
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci || npm install

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production
# Provide dummy values for build time to prevent build failures
# These will be overridden at runtime with real values
ENV NEXT_PUBLIC_SUPABASE_URL=https://dummy-value-for-build.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=dummy-key-for-build-only
ENV NEXT_PUBLIC_API_URL=http://localhost:3000

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create a non-root user and set permissions
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Expose the listening port
EXPOSE 3000

# Set the correct permission for prerender cache
RUN mkdir -p .next/cache/images
RUN mkdir -p /tmp/next
RUN chmod -R 777 /tmp/next

# Set the command to run the app
CMD ["node", "server.js"] 