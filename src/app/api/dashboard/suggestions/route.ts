import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// 建议类型
interface Suggestion {
  id: string;
  type: "upgrade" | "downgrade" | "overdue_important";
  title: string;
  description: string;
  personId: string;
  personName: string;
  currentPriority: string;
  suggestedPriority?: string;
  reason: string;
  metadata?: Record<string, unknown>;
}

// GET /api/dashboard/suggestions - 获取动态调整建议
export async function GET() {
  try {
    const now = new Date();
    const suggestions: Suggestion[] = [];

    // 1. 连续3次情绪价值≥4星的人物（建议升级）
    // 获取所有人物的最近互动记录
    const peopleWithInteractions = await db.person.findMany({
      where: {
        isActive: true,
        priority: { in: ["定期维护", "偶尔维护", "边界维护"] }, // 可以升级的
      },
      include: {
        interactions: {
          where: {
            emotionValue: { not: null },
          },
          orderBy: { date: "desc" },
          take: 3,
        },
      },
    });

    peopleWithInteractions.forEach((person) => {
      const recentInteractions = person.interactions;
      if (recentInteractions.length >= 3) {
        // 检查是否连续3次情绪价值>=4
        const allHighEmotion = recentInteractions.every(
          (i) => (i.emotionValue ?? 0) >= 4
        );

        if (allHighEmotion) {
          const priorityMap: Record<string, string> = {
            "定期维护": "核心维护",
            "偶尔维护": "定期维护",
            "边界维护": "偶尔维护",
          };

          suggestions.push({
            id: `upgrade-${person.id}`,
            type: "upgrade",
            title: `⬆️ ${person.name} 建议升级维护优先级`,
            description: `连续3次互动情绪价值≥4星，当前${person.priority}，建议升级为${priorityMap[person.priority] || "核心维护"}`,
            personId: person.id,
            personName: person.name,
            currentPriority: person.priority,
            suggestedPriority: priorityMap[person.priority],
            reason: "连续3次互动情绪价值≥4星",
            metadata: {
              recentEmotionValues: recentInteractions.map((i) => i.emotionValue),
            },
          });
        }
      }
    });

    // 2. 连续3次能量消耗≥4星且收益低的人物（建议降级）
    const peopleForDowngrade = await db.person.findMany({
      where: {
        isActive: true,
        priority: { in: ["核心维护", "定期维护", "偶尔维护"] }, // 可以降级的
      },
      include: {
        interactions: {
          where: {
            energyScore: { not: null },
          },
          orderBy: { date: "desc" },
          take: 3,
        },
      },
    });

    peopleForDowngrade.forEach((person) => {
      const recentInteractions = person.interactions;
      if (recentInteractions.length >= 3) {
        // 检查是否连续3次能量消耗>=4
        const allHighEnergy = recentInteractions.every(
          (i) => (i.energyScore ?? 0) >= 4
        );

        // 判断收益低：情绪价值低 或 没有隐藏收益记录
        const lowBenefit = recentInteractions.every(
          (i) =>
            (i.emotionValue ?? 0) <= 2 ||
            (i.hiddenGain === null || i.hiddenGain === "")
        );

        if (allHighEnergy && lowBenefit) {
          const priorityMap: Record<string, string> = {
            "核心维护": "定期维护",
            "定期维护": "偶尔维护",
            "偶尔维护": "边界维护",
          };

          suggestions.push({
            id: `downgrade-${person.id}`,
            type: "downgrade",
            title: `⬇️ ${person.name} 建议降级维护优先级`,
            description: `连续3次互动高能量消耗且收益低，当前${person.priority}，建议降级为${priorityMap[person.priority] || "边界维护"}`,
            personId: person.id,
            personName: person.name,
            currentPriority: person.priority,
            suggestedPriority: priorityMap[person.priority],
            reason: "连续3次互动高能量消耗(≥4星)且收益低",
            metadata: {
              recentEnergyScores: recentInteractions.map((i) => i.energyScore),
              recentEmotionValues: recentInteractions.map((i) => i.emotionValue),
            },
          });
        }
      }
    });

    // 3. 超过建议频率2倍未联系的重要人物
    const importantPeople = await db.person.findMany({
      where: {
        isActive: true,
        priority: { in: ["核心维护", "定期维护"] },
        contactFrequency: { not: null },
      },
      select: {
        id: true,
        name: true,
        priority: true,
        contactFrequency: true,
        lastContactDate: true,
      },
    });

    importantPeople.forEach((person) => {
      if (person.contactFrequency) {
        const threshold = person.contactFrequency * 2;
        const lastContact = person.lastContactDate
          ? new Date(person.lastContactDate)
          : null;

        let daysSinceContact = Infinity;
        if (lastContact) {
          const diffTime = now.getTime() - lastContact.getTime();
          daysSinceContact = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        }

        if (daysSinceContact >= threshold) {
          suggestions.push({
            id: `overdue-important-${person.id}`,
            type: "overdue_important",
            title: `⚠️ ${person.name} 严重超期未联系`,
            description: `${person.priority}人物，已超过${Math.round(threshold)}天未联系（建议${person.contactFrequency}天/次），可能影响关系维护`,
            personId: person.id,
            personName: person.name,
            currentPriority: person.priority,
            reason: `超过建议频率2倍(${Math.round(threshold)}天)未联系`,
            metadata: {
              contactFrequency: person.contactFrequency,
              daysSinceContact,
              threshold,
            },
          });
        }
      }
    });

    // 按类型分组排序：升级建议 > 降级建议 > 超期提醒
    const typePriority: Record<string, number> = {
      upgrade: 1,
      downgrade: 2,
      overdue_important: 3,
    };

    const sortedSuggestions = suggestions.sort(
      (a, b) => typePriority[a.type] - typePriority[b.type]
    );

    return NextResponse.json({
      success: true,
      data: {
        suggestions: sortedSuggestions,
        total: suggestions.length,
        byType: {
          upgrade: suggestions.filter((s) => s.type === "upgrade").length,
          downgrade: suggestions.filter((s) => s.type === "downgrade").length,
          overdue_important: suggestions.filter(
            (s) => s.type === "overdue_important"
          ).length,
        },
      },
    });
  } catch (error) {
    console.error("获取动态调整建议失败:", error);
    return NextResponse.json(
      { success: false, error: "获取动态调整建议失败" },
      { status: 500 }
    );
  }
}
