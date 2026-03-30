/** @type {import('next').NextConfig} */

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

const nextConfig = {
  reactStrictMode: true,
  rewrites: async () => {
    return {
      beforeFiles: [
        {
          source: '/translate-text',
          destination: `${BACKEND_URL}/translate-text`,
        },
        {
          source: '/translate-speech',
          destination: `${BACKEND_URL}/translate-speech`,
        },
        {
          source: '/assets/:path*',
          destination: `${BACKEND_URL}/assets/:path*`,
        },
        {
          source: '/placeholder/:path*',
          destination: `${BACKEND_URL}/placeholder/:path*`,
        },
        {
          source: '/api/translate/:path*',
          destination: `${BACKEND_URL}/api/translate/:path*`,
        },
        {
          source: '/health',
          destination: `${BACKEND_URL}/health`,
        },
      ],
    };
  },
};

export default nextConfig;
