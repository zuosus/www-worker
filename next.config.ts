import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  async redirects() {
    return [
      {
        source: '/',
        destination: 'https://notes.zuos.us',
        permanent: false,
      }
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig

// Cloudflare integration causes issues in development
// Use traditional Next.js API routes for dev, Cloudflare for production
// if (process.env.NODE_ENV === 'development') {
//   import('@opennextjs/cloudflare').then(({ initOpenNextCloudflareForDev }) => {
//     initOpenNextCloudflareForDev();
//   });
// }
