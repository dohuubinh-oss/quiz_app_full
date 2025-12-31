/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/gemini-prod/images/**',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['antd', '@ant-design/icons'],
  },
  allowedDevOrigins: ['https://3000-firebase-quizappmongo-1766828002708.cluster-fkltigo73ncaixtmokrzxhwsfc.cloudworkstations.dev'],
}

export default nextConfig
