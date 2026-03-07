import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// 有效的策略分类
const validCategories = ['测试动作', '转介绍话术', '能量管理', '舆论利用'];

// 有效的风险等级
const validRiskLevels = ['低风险', '中风险', '高风险'];

// GET /api/strategies - 获取策略列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 筛选参数
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const isCustom = searchParams.get('isCustom');

    // 构建查询条件
    const where: Record<string, unknown> = {};

    if (category && validCategories.includes(category)) {
      where.category = category;
    }

    if (isCustom !== null && isCustom !== undefined && isCustom !== '') {
      where.isCustom = isCustom === 'true';
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ];
    }

    const strategies = await db.strategy.findMany({
      where,
      orderBy: [
        { isCustom: 'asc' }, // 系统预设排在前面
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({
      success: true,
      data: strategies,
    });
  } catch (error) {
    console.error('获取策略列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取策略列表失败' },
      { status: 500 }
    );
  }
}

// POST /api/strategies - 创建自定义策略
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证必填字段
    if (!body.title || !body.content || !body.category) {
      return NextResponse.json(
        { success: false, error: '标题、内容和分类为必填字段' },
        { status: 400 }
      );
    }

    // 验证分类是否有效
    if (!validCategories.includes(body.category)) {
      return NextResponse.json(
        { success: false, error: `分类无效，有效分类为: ${validCategories.join(', ')}` },
        { status: 400 }
      );
    }

    // 验证风险等级是否有效（如果提供了）
    if (body.riskLevel && !validRiskLevels.includes(body.riskLevel)) {
      return NextResponse.json(
        { success: false, error: `风险等级无效，有效等级为: ${validRiskLevels.join(', ')}` },
        { status: 400 }
      );
    }

    // 创建自定义策略
    const strategy = await db.strategy.create({
      data: {
        category: body.category,
        title: body.title,
        content: body.content,
        targetType: body.targetType,
        riskLevel: body.riskLevel,
        isCustom: true, // 用户创建的都是自定义策略
      },
    });

    return NextResponse.json({
      success: true,
      data: strategy,
      message: '策略创建成功',
    });
  } catch (error) {
    console.error('创建策略失败:', error);
    return NextResponse.json(
      { success: false, error: '创建策略失败' },
      { status: 500 }
    );
  }
}
