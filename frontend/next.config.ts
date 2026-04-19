import type { NextConfig } from 'next'

/** Next 16: aktifkan `cacheComponents: true` hanya setelah audit route (PPR / `use cache`). */
const nextConfig: NextConfig = {
  crossOrigin: 'anonymous',
  output: 'standalone',
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
    ],
  },
}

export default nextConfig
