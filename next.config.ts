import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  devIndicators: {
    position: 'bottom-right',
  },
};

export default nextConfig;
