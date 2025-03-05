/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone', // For Docker builds
  eslint: {
    dirs: ['src'],
  },
  typescript: {
    // Run type checking during build
    tsconfigPath: './tsconfig.json',
  },
  // Disable image optimization in dev mode for faster builds
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
    domains: ['supabase.co'],
  },
  // Prevent Next.js from attempting to pre-render pages that need dynamic data
  // This will prevent build failures when external services like Supabase are unavailable
  staticPageGenerationTimeout: 30,
  compiler: {
    // Enables the styled-components SWC transform
    styledComponents: true,
  },
};

module.exports = nextConfig; 