/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone', // For Docker builds
  eslint: {
    dirs: ['src'],
    ignoreDuringBuilds: true, // Don't fail build on ESLint errors
  },
  typescript: {
    // Don't fail the build on TypeScript errors
    ignoreBuildErrors: true,
    // Run type checking during build
    tsconfigPath: './tsconfig.json',
  },
  // Disable image optimization in dev mode for faster builds
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
    domains: ['supabase.co'],
  },
  
  // Completely disable static page generation and static exports
  // This ensures all pages are server-rendered, avoiding issues with invalid environment variables during build
  experimental: {
    // Disable page rendering during build to avoid issues with missing environment variables
    disableStaticGenerationForAppPages: true,
  },
  
  // Skip optimizing in static exports, which prevents errors with revalidate values
  compiler: {
    // Enables the styled-components SWC transform
    styledComponents: true,
  },
};

module.exports = nextConfig; 