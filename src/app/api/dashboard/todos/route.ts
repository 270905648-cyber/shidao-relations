import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// 待办事项类型
interface TodoItem {
  id: string;
  type: "birthday" | "overdue_contact" | "referral";
  title: string;
  description: string;
  personId: string;
  personName: string;
  priority: number; // 数字越小优先级越高
  metadata?: Record<string, unknown>;
}

// GET /api/dashboard/todos - 获取今日待办
export async function GET() {
  try {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const todos: TodoItem[] = [];

    // 1. 今日生日的人物
    const todayMonth = now.getMonth() + 1; // 1-12
    const todayDay = now.getDate(); // 1-31

    // SQLite 中使用 strftime 提取月份和日期
    const birthdayPeople = await db.$queryRaw<Array<{
      id: string;
      name: string;
      category: string;
      birthday: Date;
    }>>`
      SELECT id, name, category, birthday
      FROM Person
      WHERE strftime('%m', birthday) = ${String(todayMonth).padStart(2, '0')}
        AND strftime('%d', birthday) = ${String(todayDay).padStart(2, '0')}
        AND isActive = 1
    `;

    birthdayPeople.forEach((person) => {
      todos.push({
        id: `birthday-${person.id}`,
        type: "birthday",
        title: `🎂 ${person.name} 今天生日`,
        description: `${person.category} - 别忘了送上祝福`,
        personId: person.id,
        personName: person.name,
        priority: 1, // 生日优先级最高
        metadata: {
          category: person.category,
        },
      });
    });

    // 2. 超过建议频率1.5倍未联系的核心维护人物
    const coreMaintainPeople = await db.person.findMany({
      where: {
        priority: "核心维护",
        isActive: true,
        contactFrequency: { not: null },
      },
      select: {
        id: true,
        name: true,
        category: true,
        contactFrequency: true,
        lastContactDate: true,
      },
    });

    coreMaintainPeople.forEach((person) => {
      if (person.contactFrequency) {
        const threshold = person.contactFrequency * 1.5;
        const lastContact = person.lastContactDate
          ? new Date(person.lastContactDate)
          : null;

        let daysSinceContact = Infinity;
        if (lastContact) {
          const diffTime = now.getTime() - lastContact.getTime();
          daysSinceContact = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        }

        if (daysSinceContact >= threshold) {
          todos.push({
            id: `overdue-${person.id}`,
            type: "overdue_contact",
            title: `📞 ${person.name} 久未联系`,
            description: `核心维护人物，已超过 ${Math.round(threshold)} 天未联系（建议${person.contactFrequency}天/次）`,
            personId: person.id,
            personName: person.name,
            priority: 2,
            metadata: {
              category: person.category,
              contactFrequency: person.contactFrequency,
              daysSinceContact,
              threshold,
            },
          });
        }
      }
    });

    // 3. 转介绍开口提醒
    // 条件：校外家长 + 转介绍意愿>=3 + 已转介绍人数>=0 + 没有近期互动
    const referralCandidates = await db.person.findMany({
      where: {
        category: "校外家长",
        isActive: true,
        referralWillingness: { gte: 3 },
        potentialReferrals: { not: null },
      },
      select: {
        id: true,
        name: true,
        referralWillingness: true,
        referralCount: true,
        potentialReferrals: true,
        lastContactDate: true,
      },
    });

    referralCandidates.forEach((person) => {
      // 检查是否有近期互动（7天内）
      const lastContact = person.lastContactDate
        ? new Date(person.lastContactDate)
        : null;
      let daysSinceContact = Infinity;
      if (lastContact) {
        const diffTime = now.getTime() - lastContact.getTime();
        daysSinceContact = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      }

      // 如果超过7天没联系且有潜在转介绍对象
      if (daysSinceContact >= 7 && person.potentialReferrals) {
        todos.push({
          id: `referral-${person.id}`,
          type: "referral",
          title: `🤝 ${person.name} 可尝试转介绍`,
          description: `转介绍意愿${person.referralWillingness}/5，已介绍${person.referralCount}人`,
          personId: person.id,
          personName: person.name,
          priority: 3,
          metadata: {
            referralWillingness: person.referralWillingness,
            referralCount: person.referralCount,
            potentialReferrals: person.potentialReferrals,
            daysSinceContact,
          },
        });
      }
    });

    // 按优先级排序，最多返回3条
    const sortedTodos = todos
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 3);

    return NextResponse.json({
      success: true,
      data: {
        todos: sortedTodos,
        total: todos.length,
        returned: sortedTodos.length,
      },
    });
  } catch (error) {
    console.error("获取今日待办失败:", error);
    return NextResponse.json(
      { success: false, error: "获取今日待办失败" },
      { status: 500 }
    );
  }
}
