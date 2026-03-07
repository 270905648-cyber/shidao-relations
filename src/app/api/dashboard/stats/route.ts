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

// 净收益计算：情绪价值 - 能量消耗
function calculateNetGain(interaction: {
  emotionValue: number | null;
  energyScore: number | null;
}): number {
  const emotion = interaction.emotionValue ?? 3; // 默认中等
  const energy = interaction.energyScore ?? 3; // 默认中等
  return emotion - energy;
}

// GET /api/dashboard/stats - 获取数据看板
export async function GET() {
  try {
    const now = new Date();
    const weekStart = getWeekStart(now);

    // 1. 本周主动联系总时长
    const weeklyActiveInteractions = await db.interaction.findMany({
      where: {
        date: {
          gte: weekStart,
          lte: now,
        },
        initiative: "主动",
      },
      select: {
        duration: true,
        personId: true,
      },
    });

    const totalActiveMinutes = weeklyActiveInteractions.reduce(
      (sum, i) => sum + (i.duration ?? 0),
      0
    );

    // 2. 本周净收益最高/最低人物
    const weeklyInteractionsWithReview = await db.interaction.findMany({
      where: {
        date: {
          gte: weekStart,
          lte: now,
        },
        emotionValue: { not: null },
        energyScore: { not: null },
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

    // 按人物计算净收益总和
    const personNetGainMap = new Map<
      string,
      {
        name: string;
        category: string;
        priority: string;
        totalNetGain: number;
        interactionCount: number;
      }
    >();

    weeklyInteractionsWithReview.forEach((interaction) => {
      if (interaction.person) {
        const personId = interaction.person.id;
        const netGain = calculateNetGain(interaction);

        const existing = personNetGainMap.get(personId);
        if (existing) {
          existing.totalNetGain += netGain;
          existing.interactionCount += 1;
        } else {
          personNetGainMap.set(personId, {
            name: interaction.person.name,
            category: interaction.person.category,
            priority: interaction.person.priority,
            totalNetGain: netGain,
            interactionCount: 1,
          });
        }
      }
    });

    // 找出净收益最高和最低的人物
    let highestGainPerson: {
      id: string;
      name: string;
      category: string;
      priority: string;
      netGain: number;
    } | null = null;

    let lowestGainPerson: {
      id: string;
      name: string;
      category: string;
      priority: string;
      netGain: number;
    } | null = null;

    personNetGainMap.forEach((data, personId) => {
      if (!highestGainPerson || data.totalNetGain > highestGainPerson.netGain) {
        highestGainPerson = {
          id: personId,
          name: data.name,
          category: data.category,
          priority: data.priority,
          netGain: data.totalNetGain,
        };
      }
      if (!lowestGainPerson || data.totalNetGain < lowestGainPerson.netGain) {
        lowestGainPerson = {
          id: personId,
          name: data.name,
          category: data.category,
          priority: data.priority,
          netGain: data.totalNetGain,
        };
      }
    });

    // 3. 长期未联系重要人物预警
    const coreMaintainThreshold = 14; // 核心维护 > 14天
    const regularMaintainThreshold = 30; // 定期维护 > 30天

    const coreOverduePeople = await db.person.findMany({
      where: {
        isActive: true,
        priority: "核心维护",
      },
      select: {
        id: true,
        name: true,
        category: true,
        lastContactDate: true,
      },
    });

    const regularOverduePeople = await db.person.findMany({
      where: {
        isActive: true,
        priority: "定期维护",
      },
      select: {
        id: true,
        name: true,
        category: true,
        lastContactDate: true,
      },
    });

    const longUncontactedWarnings: Array<{
      id: string;
      name: string;
      category: string;
      priority: string;
      daysSinceContact: number;
      threshold: number;
    }> = [];

    coreOverduePeople.forEach((person) => {
      const lastContact = person.lastContactDate
        ? new Date(person.lastContactDate)
        : null;
      let daysSinceContact = Infinity;
      if (lastContact) {
        const diffTime = now.getTime() - lastContact.getTime();
        daysSinceContact = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      }

      if (daysSinceContact > coreMaintainThreshold) {
        longUncontactedWarnings.push({
          id: person.id,
          name: person.name,
          category: person.category,
          priority: "核心维护",
          daysSinceContact,
          threshold: coreMaintainThreshold,
        });
      }
    });

    regularOverduePeople.forEach((person) => {
      const lastContact = person.lastContactDate
        ? new Date(person.lastContactDate)
        : null;
      let daysSinceContact = Infinity;
      if (lastContact) {
        const diffTime = now.getTime() - lastContact.getTime();
        daysSinceContact = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      }

      if (daysSinceContact > regularMaintainThreshold) {
        longUncontactedWarnings.push({
          id: person.id,
          name: person.name,
          category: person.category,
          priority: "定期维护",
          daysSinceContact,
          threshold: regularMaintainThreshold,
        });
      }
    });

    // 按天数降序排序
    longUncontactedWarnings.sort(
      (a, b) => b.daysSinceContact - a.daysSinceContact
    );

    // 4. 待解决困惑事件数量
    const pendingConfusions = await db.confusion.count({
      where: {
        status: { in: ["待处理", "处理中"] },
      },
    });

    // 5. 额外统计：本周互动总次数
    const weeklyInteractionCount = await db.interaction.count({
      where: {
        date: {
          gte: weekStart,
          lte: now,
        },
      },
    });

    // 6. 额外统计：本周接触的人物数量
    const weeklyUniquePeople = await db.interaction.findMany({
      where: {
        date: {
          gte: weekStart,
          lte: now,
        },
      },
      select: {
        personId: true,
      },
      distinct: ["personId"],
    });

    return NextResponse.json({
      success: true,
      data: {
        weeklyStats: {
          activeMinutes: totalActiveMinutes,
          activeHours: Math.round((totalActiveMinutes / 60) * 10) / 10,
          interactionCount: weeklyInteractionCount,
          uniquePeopleCount: weeklyUniquePeople.length,
        },
        netGain: {
          highest: highestGainPerson,
          lowest: lowestGainPerson,
        },
        longUncontactedWarnings,
        longUncontactedCount: longUncontactedWarnings.length,
        pendingConfusions,
        weekStart: weekStart.toISOString(),
        weekEnd: now.toISOString(),
      },
    });
  } catch (error) {
    console.error("获取数据看板失败:", error);
    return NextResponse.json(
      { success: false, error: "获取数据看板失败" },
      { status: 500 }
    );
  }
}
