import type { NextConfig } from "next";

// استيراد مكتبة PWA
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // تعطيل PWA أثناء التطوير
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // إعدادات التصدير الثابت لـ Capacitor و PWA
  output: "export",
  
  images: {
    unoptimized: true, // ضروري جداً للعمل بدون خادم Next.js
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  
  // تجاوز أخطاء الـ Build كما اتفقنا
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

// تصدير الإعدادات مغلفة بـ PWA
module.exports = withPWA(nextConfig);