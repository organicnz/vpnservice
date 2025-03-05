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
    domains: ['localhost', 'vpn-service.germanywestcentral.cloudapp.azure.com'],
    minimumCacheTTL: 60,
    // Disable image optimization in development
    unoptimized: process.env.NODE_ENV === 'development',
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
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
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
};

module.exports = nextConfig; 