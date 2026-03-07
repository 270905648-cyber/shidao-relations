import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// 有效的状态列表
const validStatuses = ['待处理', '处理中', '已解决', '已放弃'];

// GET /api/confusions - 获取困惑事件列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 分页参数
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const skip = (page - 1) * pageSize;

    // 筛选参数
    const status = searchParams.get('status');
    const personId = searchParams.get('personId');

    // 构建查询条件
    const where: Record<string, unknown> = {};

    if (status && validStatuses.includes(status)) {
      where.status = status;
    }

    if (personId) {
      where.personId = personId;
    }

    // 并行查询列表和总数
    const [confusions, total] = await Promise.all([
      db.confusion.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: {
          date: 'desc',
        },
        include: {
          person: {
            select: {
              id: true,
              name: true,
              category: true,
            },
          },
        },
      }),
      db.confusion.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: confusions,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('获取困惑事件列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取困惑事件列表失败' },
      { status: 500 }
    );
  }
}

// POST /api/confusions - 创建困惑事件
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证必填字段
    if (!body.title) {
      return NextResponse.json(
        { success: false, error: '标题为必填字段' },
        { status: 400 }
      );
    }

    // 如果有关联人物，验证人物是否存在
    if (body.personId) {
      const person = await db.person.findUnique({
        where: { id: body.personId },
      });

      if (!person) {
        return NextResponse.json(
          { success: false, error: '关联人物不存在' },
          { status: 400 }
        );
      }
    }

    // 验证状态是否有效
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json(
        { success: false, error: `状态无效，有效状态为: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // 创建困惑事件
    const confusion = await db.confusion.create({
      data: {
        title: body.title,
        date: body.date ? new Date(body.date) : new Date(),
        personId: body.personId || null,
        description: body.description,
        goal: body.goal,
        action: body.action,
        followUp: body.followUp,
        status: body.status || '待处理',
      },
      include: {
        person: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: confusion,
      message: '困惑事件创建成功',
    });
  } catch (error) {
    console.error('创建困惑事件失败:', error);
    return NextResponse.json(
      { success: false, error: '创建困惑事件失败' },
      { status: 500 }
    );
  }
}
