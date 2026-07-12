import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '**.cloudinary.com' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: '**.amazonaws.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
  // Deliberately no `env: { REVALIDATE_SECRET }` block here: that config option
  // inlines the value as a build-time constant (like NEXT_PUBLIC_ vars), and
  // REVALIDATE_SECRET is only ever injected at container *runtime* via
  // docker-compose's env_file — inlining it baked in an empty string at image
  // build time and silently broke every revalidation call. The Node.js runtime
  // Route Handler in app/api/revalidate/route.ts reads process.env directly at
  // request time instead, which sees the real value.
}

export default nextConfig
