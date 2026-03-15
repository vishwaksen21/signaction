/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  rewrites: async () => {
    return {
      beforeFiles: [
        {
          source: '/translate-text',
          destination: 'http://localhost:8000/translate-text',
        },
        {
          source: '/translate-speech',
          destination: 'http://localhost:8000/translate-speech',
        },
        {
          source: '/assets/:path*',
          destination: 'http://localhost:8000/assets/:path*',
        },
        {
          source: '/placeholder/:path*',
          destination: 'http://localhost:8000/placeholder/:path*',
        },
        {
          source: '/api/translate/:path*',
          destination: 'http://localhost:8000/api/translate/:path*',
        },
        {
          source: '/health',
          destination: 'http://localhost:8000/health',
        },
      ],
    };
  },
};

export default nextConfig;
