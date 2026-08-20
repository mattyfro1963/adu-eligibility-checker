import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["@mapbox/mapbox-sdk"],
};

export default nextConfig;
