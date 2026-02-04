import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // Next.js 16에서 next-pwa(webpack 기반) 사용을 위해 turbopack 비활성화
  turbopack: {},
};

export default withPWA(nextConfig);
