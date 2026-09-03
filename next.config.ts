/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Base path for subpath deployment
  basePath: '/comments-plugin',

  // 2. Image optimization (add your CDN or Firebase Storage domain if needed)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // 3. CORS Headers Configuration
  // Note: next.config.js headers apply to all methods. For method-specific CORS 
  // (GET = any origin, POST = strict), we rely on Middleware (provided in Phase 4), 
  // but we set safe defaults here.
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          // Default strict origin. Middleware will override GET to '*' if desired.
          { key: 'Access-Control-Allow-Origin', value: 'https://apps.adityoarr.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
      {
        source: '/comments-plugin/embed.js',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;