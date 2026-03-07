import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/persons - 获取人物列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 分页参数
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const skip = (page - 1) * pageSize;
    
    // 筛选参数
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');
    const isActive = searchParams.get('isActive');
    const name = searchParams.get('name');
    
    // 构建查询条件
    const where: any = {};
    
    if (category) {
      where.category = category;
    }
    
    if (priority) {
      where.priority = priority;
    }
    
    if (isActive !== null && isActive !== undefined && isActive !== '') {
      where.isActive = isActive === 'true';
    }
    
    if (name) {
      where.name = {
        contains: name,
      };
    }
    
    // 并行查询列表和总数
    const [persons, total] = await Promise.all([
      db.person.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: {
          updatedAt: 'desc',
        },
        include: {
          _count: {
            select: {
              interactions: true,
              relationsAsPerson1: true,
              relationsAsPerson2: true,
            },
          },
        },
      }),
      db.person.count({ where }),
    ]);
    
    return NextResponse.json({
      success: true,
      data: persons,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('获取人物列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取人物列表失败' },
      { status: 500 }
    );
  }
}

// POST /api/persons - 创建新人物
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证必填字段
    if (!body.name || !body.category) {
      return NextResponse.json(
        { success: false, error: '姓名和分类为必填字段' },
        { status: 400 }
      );
    }
    
    // 验证分类是否有效
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
    
    // 验证优先级是否有效
    const validPriorities = ['核心维护', '定期维护', '偶尔维护', '边界维护'];
    if (body.priority && !validPriorities.includes(body.priority)) {
      return NextResponse.json(
        { success: false, error: `优先级无效，有效优先级为: ${validPriorities.join(', ')}` },
        { status: 400 }
      );
    }
    
    // 创建人物
    const person = await db.person.create({
      data: {
        name: body.name,
        category: body.category,
        priority: body.priority || '偶尔维护',
        subCategory: body.subCategory,
        circles: body.circles,
        energyCost: body.energyCost,
        passiveBurden: body.passiveBurden,
        influencePower: body.influencePower,
        usableScope: body.usableScope,
        coreDriver: body.coreDriver,
        currentNeed: body.currentNeed,
        riskLine: body.riskLine,
        birthday: body.birthday ? new Date(body.birthday) : null,
        familyInfo: body.familyInfo,
        contactFrequency: body.contactFrequency,
        intimacy: body.intimacy,
        attitude: body.attitude,
        // 校外家长专用字段
        childName: body.childName,
        childGrade: body.childGrade,
        childStudyStatus: body.childStudyStatus,
        parentType: body.parentType,
        payAbility: body.payAbility,
        referralWillingness: body.referralWillingness,
        referralCount: body.referralCount || 0,
        potentialReferrals: body.potentialReferrals,
        // 贫困生专用字段
        familySituation: body.familySituation,
        aidRecords: body.aidRecords,
        academicTracking: body.academicTracking,
        mentalState: body.mentalState,
        futurePotential: body.futurePotential,
        graduationDestination: body.graduationDestination,
        isActive: body.isActive ?? true,
        wakeupCycle: body.wakeupCycle,
        lastContactDate: body.lastContactDate ? new Date(body.lastContactDate) : null,
      },
    });
    
    return NextResponse.json({
      success: true,
      data: person,
      message: '人物创建成功',
    });
  } catch (error) {
    console.error('创建人物失败:', error);
    return NextResponse.json(
      { success: false, error: '创建人物失败' },
      { status: 500 }
    );
  }
}
