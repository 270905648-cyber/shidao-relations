import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/interactions/[id] - 获取单条互动记录详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const interaction = await db.interaction.findUnique({
      where: { id },
      include: {
        person: {
          select: {
            id: true,
            name: true,
            category: true,
            priority: true,
            attitude: true,
            intimacy: true,
          },
        },
      },
    });
    
    if (!interaction) {
      return NextResponse.json(
        { success: false, error: '互动记录不存在' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: interaction,
    });
  } catch (error: any) {
    console.error('获取互动记录详情失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '获取互动记录详情失败' },
      { status: 500 }
    );
  }
}

// PUT /api/interactions/[id] - 更新互动记录
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // 检查互动记录是否存在
    const existingInteraction = await db.interaction.findUnique({
      where: { id },
    });
    
    if (!existingInteraction) {
      return NextResponse.json(
        { success: false, error: '互动记录不存在' },
        { status: 404 }
      );
    }
    
    // 准备更新数据
    const updateData: any = {};
    
    if (body.date !== undefined) {
      updateData.date = new Date(body.date);
    }
    if (body.type !== undefined) {
      updateData.type = body.type;
    }
    if (body.duration !== undefined) {
      updateData.duration = body.duration;
    }
    if (body.initiative !== undefined) {
      updateData.initiative = body.initiative;
    }
    if (body.nature !== undefined) {
      updateData.nature = body.nature;
    }
    if (body.countToBudget !== undefined) {
      updateData.countToBudget = body.countToBudget;
    }
    if (body.energyScore !== undefined) {
      updateData.energyScore = body.energyScore;
    }
    if (body.tags !== undefined) {
      updateData.tags = body.tags;
    }
    if (body.note !== undefined) {
      updateData.note = body.note;
    }
    if (body.surfaceCost !== undefined) {
      updateData.surfaceCost = body.surfaceCost;
    }
    if (body.hiddenGain !== undefined) {
      updateData.hiddenGain = body.hiddenGain;
    }
    if (body.emotionValue !== undefined) {
      updateData.emotionValue = body.emotionValue;
    }
    if (body.spreadTracking !== undefined) {
      updateData.spreadTracking = body.spreadTracking;
    }
    if (body.riskLevel !== undefined) {
      updateData.riskLevel = body.riskLevel;
    }
    
    // 更新互动记录
    const interaction = await db.interaction.update({
      where: { id },
      data: updateData,
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
    
    // 如果日期被更新，同时更新人物的 lastContactDate
    if (body.date !== undefined) {
      await db.person.update({
        where: { id: existingInteraction.personId },
        data: { lastContactDate: new Date(body.date) },
      });
    }
    
    return NextResponse.json({
      success: true,
      data: interaction,
      message: '互动记录更新成功',
    });
  } catch (error: any) {
    console.error('更新互动记录失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '更新互动记录失败' },
      { status: 500 }
    );
  }
}

// DELETE /api/interactions/[id] - 删除互动记录
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // 检查互动记录是否存在
    const existingInteraction = await db.interaction.findUnique({
      where: { id },
    });
    
    if (!existingInteraction) {
      return NextResponse.json(
        { success: false, error: '互动记录不存在' },
        { status: 404 }
      );
    }
    
    // 删除互动记录
    await db.interaction.delete({
      where: { id },
    });
    
    return NextResponse.json({
      success: true,
      message: '互动记录删除成功',
    });
  } catch (error: any) {
    console.error('删除互动记录失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '删除互动记录失败' },
      { status: 500 }
    );
  }
}
