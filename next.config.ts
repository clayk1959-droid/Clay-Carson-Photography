import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets `npm run dev` be reached from another device on the home network
  // (phone, tablet) via this Mac's LAN IP -- without it, Next.js blocks its
  // own dev-only resources (HMR, client JS chunks) for any non-localhost
  // origin, which silently breaks client components like RotatingHero.
  allowedDevOrigins: ["192.168.4.93"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
