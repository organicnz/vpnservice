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
  // Server Actions are enabled by default in Next.js 14
};

module.exports = nextConfig; 