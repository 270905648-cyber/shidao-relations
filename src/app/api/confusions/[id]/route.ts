import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// 有效的状态列表
const validStatuses = ['待处理', '处理中', '已解决', '已放弃'];

// GET /api/confusions/[id] - 获取困惑事件详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const confusion = await db.confusion.findUnique({
      where: { id },
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

    if (!confusion) {
      return NextResponse.json(
        { success: false, error: '困惑事件不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: confusion,
    });
  } catch (error) {
    console.error('获取困惑事件详情失败:', error);
    return NextResponse.json(
      { success: false, error: '获取困惑事件详情失败' },
      { status: 500 }
    );
  }
}

// PUT /api/confusions/[id] - 更新困惑事件
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // 检查困惑事件是否存在
    const existingConfusion = await db.confusion.findUnique({
      where: { id },
    });

    if (!existingConfusion) {
      return NextResponse.json(
        { success: false, error: '困惑事件不存在' },
        { status: 404 }
      );
    }

    // 如果有关联人物，验证人物是否存在
    if (body.personId !== undefined && body.personId !== null) {
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

    // 更新困惑事件
    const confusion = await db.confusion.update({
      where: { id },
      data: {
        title: body.title,
        date: body.date ? new Date(body.date) : undefined,
        personId: body.personId === null ? null : body.personId,
        description: body.description,
        goal: body.goal,
        action: body.action,
        followUp: body.followUp,
        status: body.status,
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
      message: '困惑事件更新成功',
    });
  } catch (error) {
    console.error('更新困惑事件失败:', error);
    return NextResponse.json(
      { success: false, error: '更新困惑事件失败' },
      { status: 500 }
    );
  }
}

// DELETE /api/confusions/[id] - 删除困惑事件
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 检查困惑事件是否存在
    const existingConfusion = await db.confusion.findUnique({
      where: { id },
    });

    if (!existingConfusion) {
      return NextResponse.json(
        { success: false, error: '困惑事件不存在' },
        { status: 404 }
      );
    }

    // 删除困惑事件
    await db.confusion.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: '困惑事件删除成功',
    });
  } catch (error) {
    console.error('删除困惑事件失败:', error);
    return NextResponse.json(
      { success: false, error: '删除困惑事件失败' },
      { status: 500 }
    );
  }
}
