import { NextResponse } from 'next/server';

/**
 * API健康检查端点
 * 用于APK检测后端连接状态
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '5.0.0',
  });
}
