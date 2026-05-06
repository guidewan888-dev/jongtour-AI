/** @type {import('next').NextConfig} */
const nextConfig = {
  // ─── Server Environment Variables ─────────────────
  // Ensures these are available at runtime in serverless functions
  env: {
    SUPABASE_URL: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // ─── SEO: Security & Performance Headers ─────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
        ],
      },
      // Cache static assets aggressively
      {
        source: '/og/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, immutable, max-age=31536000' },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, immutable, max-age=31536000' },
        ],
      },
      // No-index for private areas
      {
        source: '/admin/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
      {
        source: '/account/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
    ];
  },

  // ─── SEO: Redirects (old URLs → new) ─────────────
  async redirects() {
    return [
      // Trailing slash normalization
      { source: '/:path+/', destination: '/:path+', permanent: true },
      // Common misspellings
      { source: '/visas/:path*', destination: '/visa/:path*', permanent: true },
      { source: '/blogs/:path*', destination: '/blog/:path*', permanent: true },
    ];
  },
};

export default nextConfig;
