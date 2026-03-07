import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/interactions - 获取互动记录列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 分页参数
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
    const skip = (page - 1) * pageSize;
    
    // 筛选参数
    const personId = searchParams.get('personId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type');
    const initiative = searchParams.get('initiative');
    const nature = searchParams.get('nature');
    
    // 构建查询条件
    const where: any = {};
    
    if (personId) {
      where.personId = personId;
    }
    
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }
    
    if (type) {
      where.type = type;
    }
    
    if (initiative) {
      where.initiative = initiative;
    }
    
    if (nature) {
      where.nature = nature;
    }
    
    // 查询总数
    const total = await db.interaction.count({ where });
    
    // 查询列表（按日期倒序）
    const interactions = await db.interaction.findMany({
      where,
      include: {
        person: {
          select: {
            id: true,
            name: true,
            category: true,
            priority: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
      skip,
      take: pageSize,
    });
    
    return NextResponse.json({
      success: true,
      data: interactions,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error: any) {
    console.error('获取互动记录列表失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '获取互动记录列表失败' },
      { status: 500 }
    );
  }
}

// POST /api/interactions - 创建新互动记录
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证必填字段
    const { personId, type, initiative, nature } = body;
    
    if (!personId) {
      return NextResponse.json(
        { success: false, error: 'personId 是必填字段' },
        { status: 400 }
      );
    }
    
    if (!type) {
      return NextResponse.json(
        { success: false, error: 'type 是必填字段' },
        { status: 400 }
      );
    }
    
    if (!initiative) {
      return NextResponse.json(
        { success: false, error: 'initiative 是必填字段' },
        { status: 400 }
      );
    }
    
    if (!nature) {
      return NextResponse.json(
        { success: false, error: 'nature 是必填字段' },
        { status: 400 }
      );
    }
    
    // 检查人物是否存在
    const person = await db.person.findUnique({
      where: { id: personId },
    });
    
    if (!person) {
      return NextResponse.json(
        { success: false, error: '人物不存在' },
        { status: 404 }
      );
    }
    
    // 处理日期
    const date = body.date ? new Date(body.date) : new Date();
    
    // 创建互动记录
    const interaction = await db.interaction.create({
      data: {
        personId,
        date,
        type,
        duration: body.duration || null,
        initiative,
        nature,
        countToBudget: body.countToBudget ?? true,
        energyScore: body.energyScore || null,
        tags: body.tags || null,
        note: body.note || null,
        surfaceCost: body.surfaceCost || null,
        hiddenGain: body.hiddenGain || null,
        emotionValue: body.emotionValue || null,
        spreadTracking: body.spreadTracking || null,
        riskLevel: body.riskLevel || null,
      },
      include: {
        person: {
          select: {
            id: true,
            name: true,
            category: true,
            priority: true,
          },
        },
      },
    });
    
    // 更新人物的 lastContactDate
    await db.person.update({
      where: { id: personId },
      data: { lastContactDate: date },
    });
    
    return NextResponse.json({
      success: true,
      data: interaction,
      message: '互动记录创建成功',
    });
  } catch (error: any) {
    console.error('创建互动记录失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '创建互动记录失败' },
      { status: 500 }
    );
  }
}
