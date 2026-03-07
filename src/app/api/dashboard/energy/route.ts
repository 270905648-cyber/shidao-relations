import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// 获取本周的起始日期（周一）
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // 调整为周一
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// GET /api/dashboard/energy - 获取能量预算数据
export async function GET() {
  try {
    const now = new Date();
    const weekStart = getWeekStart(now);

    // 获取用户设置（周预算）
    const userSettings = await db.userSettings.findFirst();
    const weeklyBudget = userSettings?.weeklyBudget ?? 210; // 默认 210 分钟

    // 获取本周非必需社交的互动记录
    const weeklyInteractions = await db.interaction.findMany({
      where: {
        date: {
          gte: weekStart,
          lte: now,
        },
        nature: "非必需社交",
        countToBudget: true,
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

    // 计算本周已用时长
    const usedMinutes = weeklyInteractions.reduce(
      (sum, interaction) => sum + (interaction.duration ?? 0),
      0
    );

    // 计算使用百分比
    const usagePercent = Math.round((usedMinutes / weeklyBudget) * 100);

    // 判断是否超预算
    const isOverBudget = usedMinutes > weeklyBudget;

    // 如果超预算，计算消耗 TOP 人物
    let topConsumers: Array<{
      id: string;
      name: string;
      category: string;
      totalMinutes: number;
    }> = [];

    if (isOverBudget) {
      // 按人物分组统计时长
      const personTimeMap = new Map<
        string,
        { name: string; category: string; totalMinutes: number }
      >();

      weeklyInteractions.forEach((interaction) => {
        if (interaction.person) {
          const personId = interaction.person.id;
          const existing = personTimeMap.get(personId);
          if (existing) {
            existing.totalMinutes += interaction.duration ?? 0;
          } else {
            personTimeMap.set(personId, {
              name: interaction.person.name,
              category: interaction.person.category,
              totalMinutes: interaction.duration ?? 0,
            });
          }
        }
      });

      // 排序取 TOP 5
      topConsumers = Array.from(personTimeMap.entries())
        .map(([id, data]) => ({
          id,
          name: data.name,
          category: data.category,
          totalMinutes: data.totalMinutes,
        }))
        .sort((a, b) => b.totalMinutes - a.totalMinutes)
        .slice(0, 5);
    }

    return NextResponse.json({
      success: true,
      data: {
        usedMinutes,
        weeklyBudget,
        usagePercent,
        isOverBudget,
        topConsumers,
        weekStart: weekStart.toISOString(),
        weekEnd: now.toISOString(),
      },
    });
  } catch (error) {
    console.error("获取能量预算数据失败:", error);
    return NextResponse.json(
      { success: false, error: "获取能量预算数据失败" },
      { status: 500 }
    );
  }
}
