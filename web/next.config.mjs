/** @type {import('next').NextConfig} */
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  transpilePackages: ['three'],
  async redirects() {
    return [
      { source: '/bot', destination: '/dashboard/bot', permanent: false },
      { source: '/bot/:path*', destination: '/dashboard/bot', permanent: false }
    ];
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      encoding: false,
      path: false,
      crypto: false
    };
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './src'),
      '@lib': path.resolve(__dirname, './lib')
    };
    return config;
  }
};

export default nextConfig;
