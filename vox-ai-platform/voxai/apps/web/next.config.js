/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@voxai/shared"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ["bullmq", "ioredis"],
  },
};

module.exports = nextConfig;
