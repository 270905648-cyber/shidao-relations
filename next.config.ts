import type { NextConfig } from "next";

// 判断是否为静态导出模式（用于APK打包）
const isStaticExport = process.env.BUILD_MODE === 'static';

const nextConfig: NextConfig = {
  // 静态导出模式使用 export，服务器模式使用 standalone
  output: isStaticExport ? 'export' : 'standalone',
  
  // 静态导出时禁用图片优化（需要Node.js运行时）
  images: isStaticExport ? {
    unoptimized: true,
  } : undefined,
  
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  
  // 静态导出时，API路由将被忽略
  // 需要配置后端API地址
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '',
  },
};

export default nextConfig;
