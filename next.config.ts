import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: process.env.NODE_ENV !== "production",
  images: {
    formats: ["image/webp", "image/avif"],
  },
  webpack: (config) => {
    // Limit parallelism in memory-constrained environments (Docker builds)
    config.parallelism = 20;
    return config;
  },
};

export default nextConfig;
