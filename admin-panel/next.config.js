/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output as standalone for Docker deployment
  output: 'standalone',
  
  // Disable ESLint during build for faster builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Type checking still runs but doesn't block the build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Improve image optimization
  images: {
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  
  // Force all pages to be server-rendered to prevent build issues
  experimental: {
    // Disable static generation for app pages
    appDir: true,
    serverComponentsExternalPackages: ['@supabase/supabase-js', 'next'],
    esmExternals: 'loose',
    serverActions: {
      bodySizeLimit: '2mb',
    },
    optimizeCss: true,
    scrollRestoration: true,
  },
  
  // Enable SWC transpilation for styled-components
  compiler: {
    styledComponents: true,
  },
  
  // Use React strict mode for better development
  reactStrictMode: true,
  
  // Enable server actions for form submissions
  serverActions: {
    enabled: true,
  },

  // Better error handling
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 4,
  },

  // Performance optimization for webpack
  webpack: (config, { isServer }) => {
    // Fix for module resolution errors
    if (isServer) {
      config.resolve.alias['private-next-rsc-mod-ref-proxy'] = require.resolve('next/dist/build/webpack/loaders/next-flight-loader/module-proxy');
      config.resolve.alias['react-server-dom-webpack/static.edge'] = require.resolve('react-server-dom-webpack/client.edge');
      config.resolve.alias['react-server-dom-webpack/server.edge'] = require.resolve('react-server-dom-webpack/server.edge');
    }
    
    // Optimize production build
    if (!isServer) {
      // Split chunks optimization
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        automaticNameDelimiter: '~',
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      };
    }

    return config;
  },
};

module.exports = nextConfig; 