import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// POST /api/voice - 语音转文字
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { audio } = body;

    if (!audio) {
      return NextResponse.json(
        { success: false, error: '音频数据是必填字段' },
        { status: 400 }
      );
    }

    // 初始化 SDK
    const zai = await ZAI.create();

    // 调用 ASR 功能转文字
    const result = await zai.audio.asr.create({
      file_base64: audio,
    });

    return NextResponse.json({
      success: true,
      text: result.text,
    });
  } catch (error: unknown) {
    console.error('语音转文字失败:', error);
    const errorMessage = error instanceof Error ? error.message : '语音转文字失败';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
