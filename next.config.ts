import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/referal-amount',
        destination: '/referral-amount',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
