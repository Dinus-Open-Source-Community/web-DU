import type { NextConfig } from 'next'

/** Next 16: aktifkan `cacheComponents: true` hanya setelah audit route (PPR / `use cache`). */
const nextConfig: NextConfig = {
  // crossOrigin: 'anonymous',
  // allowedDevOrigins: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  // output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lottie.host',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'minio',
        port: '9000',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
