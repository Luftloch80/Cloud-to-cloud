import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow temporary Cloudflare / localtunnel hosts in `next dev`
  allowedDevOrigins: [
    "*.trycloudflare.com",
    "*.loca.lt",
    "habits-often-lips-understood.trycloudflare.com",
    "clear-needles-cheat.loca.lt",
  ],
};

export default nextConfig;
