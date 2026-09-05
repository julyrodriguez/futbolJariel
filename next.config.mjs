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
        hostname: 'apivacas.jariel.com.ar',
      },
      {
        protocol: 'https',
        hostname: 'img.icons8.com',
      }
    ]
  }
};

export default nextConfig;
