import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// DELETE /api/data/destroy - 一键销毁所有数据
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    // 验证确认参数（需要前端传入 confirm: true）
    if (body.confirm !== true) {
      return NextResponse.json(
        { success: false, error: '请确认是否要销毁所有数据' },
        { status: 400 }
      );
    }

    // 验证确认文本（可选的额外安全措施）
    if (body.confirmText && body.confirmText !== '确认销毁') {
      return NextResponse.json(
        { success: false, error: '确认文本不正确' },
        { status: 400 }
      );
    }

    // 按顺序删除所有数据（考虑外键约束）
    // 1. 删除互动记录
    const deletedInteractions = await db.interaction.deleteMany({});

    // 2. 删除困惑事件
    const deletedConfusions = await db.confusion.deleteMany({});

    // 3. 删除关系记录
    const deletedRelations = await db.relation.deleteMany({});

    // 4. 删除策略库
    const deletedStrategies = await db.strategy.deleteMany({});

    // 5. 删除人物档案
    const deletedPersons = await db.person.deleteMany({});

    // 注意：不删除用户设置，保留基本配置

    return NextResponse.json({
      success: true,
      message: '所有数据已销毁',
      deleted: {
        persons: deletedPersons.count,
        interactions: deletedInteractions.count,
        relations: deletedRelations.count,
        confusions: deletedConfusions.count,
        strategies: deletedStrategies.count,
      },
    });
  } catch (error) {
    console.error('销毁数据失败:', error);
    return NextResponse.json(
      { success: false, error: '销毁数据失败' },
      { status: 500 }
    );
  }
}
