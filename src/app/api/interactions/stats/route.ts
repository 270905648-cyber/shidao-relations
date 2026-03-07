import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/interactions/stats - 获取统计数据
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 获取时间范围参数（默认为本周）
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    
    // 计算本周的起止日期
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const weekStart = startDateParam 
      ? new Date(startDateParam) 
      : new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset);
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = endDateParam 
      ? new Date(endDateParam) 
      : new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    // 1. 本周非必需社交总时长
    const nonRequiredInteractions = await db.interaction.findMany({
      where: {
        date: {
          gte: weekStart,
          lte: weekEnd,
        },
        nature: '非必需社交',
        countToBudget: true,
      },
      select: {
        duration: true,
      },
    });
    
    const weeklyNonRequiredDuration = nonRequiredInteractions.reduce(
      (sum, interaction) => sum + (interaction.duration || 0),
      0
    );
    
    // 2. 本周主动联系总时长
    const initiativeInteractions = await db.interaction.findMany({
      where: {
        date: {
          gte: weekStart,
          lte: weekEnd,
        },
        initiative: '主动',
        countToBudget: true,
      },
      select: {
        duration: true,
      },
    });
    
    const weeklyInitiativeDuration = initiativeInteractions.reduce(
      (sum, interaction) => sum + (interaction.duration || 0),
      0
    );
    
    // 3. 按人物分组的互动统计
    const interactionsByPerson = await db.interaction.groupBy({
      by: ['personId'],
      where: {
        date: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
      _count: {
        id: true,
      },
      _sum: {
        duration: true,
      },
    });
    
    // 获取人物信息
    const personIds = interactionsByPerson.map(item => item.personId);
    const persons = await db.person.findMany({
      where: {
        id: {
          in: personIds,
        },
      },
      select: {
        id: true,
        name: true,
        category: true,
        priority: true,
      },
    });
    
    // 组合数据
    const personStats = interactionsByPerson.map(item => {
      const person = persons.find(p => p.id === item.personId);
      return {
        personId: item.personId,
        personName: person?.name || '未知',
        personCategory: person?.category || '',
        personPriority: person?.priority || '',
        interactionCount: item._count.id,
        totalDuration: item._sum.duration || 0,
      };
    });
    
    // 按互动次数降序排列
    personStats.sort((a, b) => b.interactionCount - a.interactionCount);
    
    // 4. 按互动类型统计
    const interactionsByType = await db.interaction.groupBy({
      by: ['type'],
      where: {
        date: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
      _count: {
        id: true,
      },
      _sum: {
        duration: true,
      },
    });
    
    const typeStats = interactionsByType.map(item => ({
      type: item.type,
      count: item._count.id,
      totalDuration: item._sum.duration || 0,
    }));
    
    // 5. 本周能量消耗统计
    const energyStats = await db.interaction.findMany({
      where: {
        date: {
          gte: weekStart,
          lte: weekEnd,
        },
        energyScore: {
          not: null,
        },
      },
      select: {
        energyScore: true,
      },
    });
    
    const totalEnergyCost = energyStats.reduce(
      (sum, interaction) => sum + (interaction.energyScore || 0),
      0
    );
    const avgEnergyCost = energyStats.length > 0 
      ? totalEnergyCost / energyStats.length 
      : 0;
    
    // 6. 获取用户设置的周预算
    const userSettings = await db.userSettings.findFirst();
    const weeklyBudget = userSettings?.weeklyBudget || 210; // 默认 3.5 小时
    
    // 计算预算使用情况
    const budgetUsagePercent = weeklyBudget > 0 
      ? Math.round((weeklyNonRequiredDuration / weeklyBudget) * 100) 
      : 0;
    
    return NextResponse.json({
      success: true,
      data: {
        dateRange: {
          start: weekStart.toISOString(),
          end: weekEnd.toISOString(),
        },
        weeklyBudget,
        weeklyNonRequiredDuration,
        weeklyInitiativeDuration,
        budgetUsagePercent,
        energyStats: {
          total: totalEnergyCost,
          average: Math.round(avgEnergyCost * 10) / 10,
          count: energyStats.length,
        },
        byPerson: personStats,
        byType: typeStats,
        summary: {
          totalInteractions: personStats.reduce((sum, p) => sum + p.interactionCount, 0),
          uniquePersons: personStats.length,
          totalDuration: personStats.reduce((sum, p) => sum + p.totalDuration, 0),
        },
      },
    });
  } catch (error: any) {
    console.error('获取统计数据失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '获取统计数据失败' },
      { status: 500 }
    );
  }
}
