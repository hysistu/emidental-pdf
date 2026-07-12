import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@react-pdf/renderer"],
  experimental: {
    // Photos + up to 4 STL scans with the order PDF
    proxyClientMaxBodySize: "220mb",
  },
};

export default nextConfig;
