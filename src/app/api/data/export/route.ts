import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/data/export - 导出所有数据为 JSON
export async function GET() {
  try {
    // 并行获取所有数据
    const [persons, interactions, relations, confusions, strategies, settings] =
      await Promise.all([
        db.person.findMany({
          include: {
            interactions: true,
            relationsAsPerson1: true,
            relationsAsPerson2: true,
            confusions: true,
          },
        }),
        db.interaction.findMany(),
        db.relation.findMany(),
        db.confusion.findMany(),
        db.strategy.findMany(),
        db.userSettings.findFirst(),
      ]);

    // 构建导出数据
    const exportData = {
      exportTime: new Date().toISOString(),
      version: '1.0',
      data: {
        persons,
        interactions,
        relations,
        confusions,
        strategies,
        settings: settings
          ? {
              weeklyBudget: settings.weeklyBudget,
              dataRetentionDays: settings.dataRetentionDays,
            }
          : null,
      },
      summary: {
        totalPersons: persons.length,
        totalInteractions: interactions.length,
        totalRelations: relations.length,
        totalConfusions: confusions.length,
        totalStrategies: strategies.length,
      },
    };

    // 返回 JSON 文件
    const filename = `shidao-data-${new Date().toISOString().split('T')[0]}.json`;
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('导出数据失败:', error);
    return NextResponse.json(
      { success: false, error: '导出数据失败' },
      { status: 500 }
    );
  }
}
