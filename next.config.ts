import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'postkit.pro',
      },
      {
        protocol: 'https',
        hostname: 'images.trvl-media.com',
      }
    ],
  },
};

export default nextConfig;
