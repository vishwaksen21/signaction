/** @type {import('next').NextConfig} */

const BACKEND_URL = process.env.SIGNACTION_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          { key: 'Content-Type', value: 'application/manifest+json' },
          { key: 'Cache-Control', value: 'no-cache' },
        ],
      },
    ];
  },
  rewrites: async () => {
    return {
      beforeFiles: [
        { source: '/translate-text', destination: `${BACKEND_URL}/translate-text` },
        { source: '/translate-speech', destination: `${BACKEND_URL}/translate-speech` },
        { source: '/assets/:path*', destination: `${BACKEND_URL}/assets/:path*` },
        { source: '/placeholder/:path*', destination: `${BACKEND_URL}/placeholder/:path*` },
        { source: '/api/dictionary', destination: `${BACKEND_URL}/dictionary` },
        { source: '/api/translate/:path*', destination: `${BACKEND_URL}/api/translate/:path*` },
        { source: '/health', destination: `${BACKEND_URL}/health` },
      ],
    };
  },
};

export default nextConfig;
