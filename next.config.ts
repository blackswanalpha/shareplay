import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  images: {
    formats: ["image/webp", "image/avif"],
  },
};

export default nextConfig;
