import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "static.nationalgeographic.fr" },
      { protocol: "https", hostname: "www.annecy-ville.fr" },
      { protocol: "https", hostname: "www.mongr.fr" },
    ],
  },
};
export default nextConfig;
