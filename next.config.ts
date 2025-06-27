import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Remove output: 'export' if it's there
  reactStrictMode: true,
  // Optional: use standalone for production Docker/serverless deployment
  output: "standalone",
};

export default nextConfig;
