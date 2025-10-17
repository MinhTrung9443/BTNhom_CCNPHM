import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
   turbopack: {
    root: path.join(__dirname), // đặt root chính là thư mục feUser
  },
  eslint: { ignoreDuringBuilds: true },
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
