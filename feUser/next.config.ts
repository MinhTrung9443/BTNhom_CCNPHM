import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
       dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fakestoreapi.com",
        pathname: "/**",
      },
            { protocol: 'https', hostname: 'placehold.co' },

        {
        protocol: "https",
        hostname: "**", // cho phép tất cả domain https
      },
      {
        protocol: "http",
        hostname: "**", // (nếu cần cả http)
      },
    ],
  },
};

export default nextConfig;
