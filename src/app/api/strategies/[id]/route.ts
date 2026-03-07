import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// 有效的策略分类
const validCategories = ['测试动作', '转介绍话术', '能量管理', '舆论利用'];

// 有效的风险等级
const validRiskLevels = ['低风险', '中风险', '高风险'];

// GET /api/strategies/[id] - 获取策略详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const strategy = await db.strategy.findUnique({
      where: { id },
    });

    if (!strategy) {
      return NextResponse.json(
        { success: false, error: '策略不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: strategy,
    });
  } catch (error) {
    console.error('获取策略详情失败:', error);
    return NextResponse.json(
      { success: false, error: '获取策略详情失败' },
      { status: 500 }
    );
  }
}

// PUT /api/strategies/[id] - 更新策略（仅自定义策略）
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // 检查策略是否存在
    const existingStrategy = await db.strategy.findUnique({
      where: { id },
    });

    if (!existingStrategy) {
      return NextResponse.json(
        { success: false, error: '策略不存在' },
        { status: 404 }
      );
    }

    // 检查是否为自定义策略
    if (!existingStrategy.isCustom) {
      return NextResponse.json(
        { success: false, error: '系统预设策略不能修改' },
        { status: 403 }
      );
    }

    // 验证分类是否有效（如果提供了分类）
    if (body.category && !validCategories.includes(body.category)) {
      return NextResponse.json(
        { success: false, error: `分类无效，有效分类为: ${validCategories.join(', ')}` },
        { status: 400 }
      );
    }

    // 验证风险等级是否有效（如果提供了风险等级）
    if (body.riskLevel && !validRiskLevels.includes(body.riskLevel)) {
      return NextResponse.json(
        { success: false, error: `风险等级无效，有效等级为: ${validRiskLevels.join(', ')}` },
        { status: 400 }
      );
    }

    // 更新策略
    const updateData: Record<string, unknown> = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.targetType !== undefined) updateData.targetType = body.targetType;
    if (body.riskLevel !== undefined) updateData.riskLevel = body.riskLevel;

    const strategy = await db.strategy.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: strategy,
      message: '策略更新成功',
    });
  } catch (error) {
    console.error('更新策略失败:', error);
    return NextResponse.json(
      { success: false, error: '更新策略失败' },
      { status: 500 }
    );
  }
}

// DELETE /api/strategies/[id] - 删除策略（仅自定义策略）
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 检查策略是否存在
    const existingStrategy = await db.strategy.findUnique({
      where: { id },
    });

    if (!existingStrategy) {
      return NextResponse.json(
        { success: false, error: '策略不存在' },
        { status: 404 }
      );
    }

    // 检查是否为自定义策略
    if (!existingStrategy.isCustom) {
      return NextResponse.json(
        { success: false, error: '系统预设策略不能删除' },
        { status: 403 }
      );
    }

    // 删除策略
    await db.strategy.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: '策略删除成功',
    });
  } catch (error) {
    console.error('删除策略失败:', error);
    return NextResponse.json(
      { success: false, error: '删除策略失败' },
      { status: 500 }
    );
  }
}
