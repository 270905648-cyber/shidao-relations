import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/settings - 获取用户设置
export async function GET() {
  try {
    // 获取或创建设置（单例模式）
    let settings = await db.userSettings.findFirst();

    if (!settings) {
      // 如果不存在，创建默认设置
      settings = await db.userSettings.create({
        data: {
          weeklyBudget: 210, // 默认3.5小时
          dataRetentionDays: 365, // 默认保留1年
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: settings.id,
        weeklyBudget: settings.weeklyBudget,
        dataRetentionDays: settings.dataRetentionDays,
        createdAt: settings.createdAt,
        updatedAt: settings.updatedAt,
      },
    });
  } catch (error) {
    console.error('获取设置失败:', error);
    return NextResponse.json(
      { success: false, error: '获取设置失败' },
      { status: 500 }
    );
  }
}

// PUT /api/settings - 更新用户设置
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证参数
    if (body.weeklyBudget !== undefined) {
      if (typeof body.weeklyBudget !== 'number' || body.weeklyBudget < 0) {
        return NextResponse.json(
          { success: false, error: '周预算必须为非负数' },
          { status: 400 }
        );
      }
    }

    if (body.dataRetentionDays !== undefined) {
      if (typeof body.dataRetentionDays !== 'number' || body.dataRetentionDays < 1) {
        return NextResponse.json(
          { success: false, error: '数据保留天数必须大于0' },
          { status: 400 }
        );
      }
    }

    // 获取现有设置
    let settings = await db.userSettings.findFirst();

    if (!settings) {
      // 如果不存在，创建新设置
      settings = await db.userSettings.create({
        data: {
          weeklyBudget: body.weeklyBudget ?? 210,
          dataRetentionDays: body.dataRetentionDays ?? 365,
        },
      });
    } else {
      // 更新现有设置
      settings = await db.userSettings.update({
        where: { id: settings.id },
        data: {
          ...(body.weeklyBudget !== undefined && { weeklyBudget: body.weeklyBudget }),
          ...(body.dataRetentionDays !== undefined && { dataRetentionDays: body.dataRetentionDays }),
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: settings.id,
        weeklyBudget: settings.weeklyBudget,
        dataRetentionDays: settings.dataRetentionDays,
        updatedAt: settings.updatedAt,
      },
      message: '设置更新成功',
    });
  } catch (error) {
    console.error('更新设置失败:', error);
    return NextResponse.json(
      { success: false, error: '更新设置失败' },
      { status: 500 }
    );
  }
}
