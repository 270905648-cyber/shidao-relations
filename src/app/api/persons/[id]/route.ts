import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/persons/[id] - 获取单个人物详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const person = await db.person.findUnique({
      where: { id },
      include: {
        // 包含互动记录
        interactions: {
          orderBy: {
            date: 'desc',
          },
          take: 20, // 最近20条互动记录
        },
        // 包含关系网络（作为 person1）
        relationsAsPerson1: {
          include: {
            person2: {
              select: {
                id: true,
                name: true,
                category: true,
                priority: true,
              },
            },
          },
        },
        // 包含关系网络（作为 person2）
        relationsAsPerson2: {
          include: {
            person1: {
              select: {
                id: true,
                name: true,
                category: true,
                priority: true,
              },
            },
          },
        },
        // 包含困惑事件
        confusions: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });
    
    if (!person) {
      return NextResponse.json(
        { success: false, error: '人物不存在' },
        { status: 404 }
      );
    }
    
    // 整理关系网络数据
    const relations = [
      ...person.relationsAsPerson1.map(r => ({
        id: r.id,
        type: r.type,
        intimacy: r.intimacy,
        note: r.note,
        createdAt: r.createdAt,
        relatedPerson: r.person2,
      })),
      ...person.relationsAsPerson2.map(r => ({
        id: r.id,
        type: r.type,
        intimacy: r.intimacy,
        note: r.note,
        createdAt: r.createdAt,
        relatedPerson: r.person1,
      })),
    ];
    
    return NextResponse.json({
      success: true,
      data: {
        ...person,
        relations,
        relationsAsPerson1: undefined,
        relationsAsPerson2: undefined,
      },
    });
  } catch (error) {
    console.error('获取人物详情失败:', error);
    return NextResponse.json(
      { success: false, error: '获取人物详情失败' },
      { status: 500 }
    );
  }
}

// PUT /api/persons/[id] - 更新人物信息
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // 检查人物是否存在
    const existingPerson = await db.person.findUnique({
      where: { id },
    });
    
    if (!existingPerson) {
      return NextResponse.json(
        { success: false, error: '人物不存在' },
        { status: 404 }
      );
    }
    
    // 验证分类是否有效（如果提供了分类）
    if (body.category) {
      const validCategories = [
        '领导', '同事', '竞争者', '八卦圈', '贫困生', 
        '普通学生', '校外家长', '亲戚', '社会人士', '能量黑洞'
      ];
      
      if (!validCategories.includes(body.category)) {
        return NextResponse.json(
          { success: false, error: `分类无效，有效分类为: ${validCategories.join(', ')}` },
          { status: 400 }
        );
      }
    }
    
    // 验证优先级是否有效（如果提供了优先级）
    if (body.priority) {
      const validPriorities = ['核心维护', '定期维护', '偶尔维护', '边界维护'];
      if (!validPriorities.includes(body.priority)) {
        return NextResponse.json(
          { success: false, error: `优先级无效，有效优先级为: ${validPriorities.join(', ')}` },
          { status: 400 }
        );
      }
    }
    
    // 更新人物
    const updateData: any = {};
    
    // 基础字段
    if (body.name !== undefined) updateData.name = body.name;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.subCategory !== undefined) updateData.subCategory = body.subCategory;
    if (body.circles !== undefined) updateData.circles = body.circles;
    if (body.energyCost !== undefined) updateData.energyCost = body.energyCost;
    if (body.passiveBurden !== undefined) updateData.passiveBurden = body.passiveBurden;
    if (body.influencePower !== undefined) updateData.influencePower = body.influencePower;
    if (body.usableScope !== undefined) updateData.usableScope = body.usableScope;
    if (body.coreDriver !== undefined) updateData.coreDriver = body.coreDriver;
    if (body.currentNeed !== undefined) updateData.currentNeed = body.currentNeed;
    if (body.riskLine !== undefined) updateData.riskLine = body.riskLine;
    if (body.birthday !== undefined) updateData.birthday = body.birthday ? new Date(body.birthday) : null;
    if (body.familyInfo !== undefined) updateData.familyInfo = body.familyInfo;
    if (body.contactFrequency !== undefined) updateData.contactFrequency = body.contactFrequency;
    if (body.intimacy !== undefined) updateData.intimacy = body.intimacy;
    if (body.attitude !== undefined) updateData.attitude = body.attitude;
    
    // 校外家长专用字段
    if (body.childName !== undefined) updateData.childName = body.childName;
    if (body.childGrade !== undefined) updateData.childGrade = body.childGrade;
    if (body.childStudyStatus !== undefined) updateData.childStudyStatus = body.childStudyStatus;
    if (body.parentType !== undefined) updateData.parentType = body.parentType;
    if (body.payAbility !== undefined) updateData.payAbility = body.payAbility;
    if (body.referralWillingness !== undefined) updateData.referralWillingness = body.referralWillingness;
    if (body.referralCount !== undefined) updateData.referralCount = body.referralCount;
    if (body.potentialReferrals !== undefined) updateData.potentialReferrals = body.potentialReferrals;
    
    // 贫困生专用字段
    if (body.familySituation !== undefined) updateData.familySituation = body.familySituation;
    if (body.aidRecords !== undefined) updateData.aidRecords = body.aidRecords;
    if (body.academicTracking !== undefined) updateData.academicTracking = body.academicTracking;
    if (body.mentalState !== undefined) updateData.mentalState = body.mentalState;
    if (body.futurePotential !== undefined) updateData.futurePotential = body.futurePotential;
    if (body.graduationDestination !== undefined) updateData.graduationDestination = body.graduationDestination;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.wakeupCycle !== undefined) updateData.wakeupCycle = body.wakeupCycle;
    if (body.lastContactDate !== undefined) updateData.lastContactDate = body.lastContactDate ? new Date(body.lastContactDate) : null;
    
    const person = await db.person.update({
      where: { id },
      data: updateData,
    });
    
    return NextResponse.json({
      success: true,
      data: person,
      message: '人物更新成功',
    });
  } catch (error) {
    console.error('更新人物失败:', error);
    return NextResponse.json(
      { success: false, error: '更新人物失败' },
      { status: 500 }
    );
  }
}

// DELETE /api/persons/[id] - 删除人物
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // 检查人物是否存在
    const existingPerson = await db.person.findUnique({
      where: { id },
    });
    
    if (!existingPerson) {
      return NextResponse.json(
        { success: false, error: '人物不存在' },
        { status: 404 }
      );
    }
    
    // 删除人物（关联数据会级联删除）
    await db.person.delete({
      where: { id },
    });
    
    return NextResponse.json({
      success: true,
      message: '人物删除成功',
    });
  } catch (error) {
    console.error('删除人物失败:', error);
    return NextResponse.json(
      { success: false, error: '删除人物失败' },
      { status: 500 }
    );
  }
}
