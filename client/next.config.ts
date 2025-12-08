import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    optimizePackageImports: ["lucide-react"]
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // autorise toutes les images web
      }
    ]
  }
};

export default nextConfig;
