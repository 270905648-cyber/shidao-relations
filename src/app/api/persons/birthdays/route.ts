import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/persons/birthdays - 获取本月/本周生日的人物
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'month'; // month 或 week
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentDate = now.getDate();
    
    let persons;
    
    if (type === 'week') {
      // 获取本周生日的人物
      const startOfWeek = new Date(now);
      const dayOfWeek = now.getDay(); // 0 (周日) 到 6 (周六)
      
      // 计算本周开始（周一）
      const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startOfWeek.setDate(now.getDate() - diffToMonday);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      // SQLite 不支持直接的日期函数比较月份和日期
      // 所以我们需要获取所有有生日的人物，然后在 JS 中过滤
      const allPersonsWithBirthday = await db.person.findMany({
        where: {
          birthday: {
            not: null,
          },
          isActive: true,
        },
        orderBy: {
          birthday: 'asc',
        },
      });
      
      persons = allPersonsWithBirthday.filter(person => {
        if (!person.birthday) return false;
        
        const birthday = new Date(person.birthday);
        const birthdayMonth = birthday.getMonth() + 1;
        const birthdayDate = birthday.getDate();
        
        // 创建今年生日的日期
        const thisYearBirthday = new Date(currentYear, birthdayMonth - 1, birthdayDate);
        
        // 检查是否在本周范围内
        return thisYearBirthday >= startOfWeek && thisYearBirthday <= endOfWeek;
      });
    } else {
      // 获取本月生日的人物
      const allPersonsWithBirthday = await db.person.findMany({
        where: {
          birthday: {
            not: null,
          },
          isActive: true,
        },
      });
      
      persons = allPersonsWithBirthday.filter(person => {
        if (!person.birthday) return false;
        
        const birthday = new Date(person.birthday);
        const birthdayMonth = birthday.getMonth() + 1;
        
        return birthdayMonth === currentMonth;
      });
      
      // 按日期排序
      persons.sort((a, b) => {
        if (!a.birthday || !b.birthday) return 0;
        const dateA = new Date(a.birthday).getDate();
        const dateB = new Date(b.birthday).getDate();
        return dateA - dateB;
      });
    }
    
    // 添加计算字段：距离生日的天数
    const personsWithDaysUntil = persons.map(person => {
      if (!person.birthday) return { ...person, daysUntilBirthday: null };
      
      const birthday = new Date(person.birthday);
      const birthdayMonth = birthday.getMonth() + 1;
      const birthdayDate = birthday.getDate();
      
      // 创建今年生日的日期
      let thisYearBirthday = new Date(currentYear, birthdayMonth - 1, birthdayDate);
      
      // 如果今年的生日已过，计算明年的
      if (thisYearBirthday < now) {
        thisYearBirthday = new Date(currentYear + 1, birthdayMonth - 1, birthdayDate);
      }
      
      const diffTime = thisYearBirthday.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return {
        ...person,
        daysUntilBirthday: diffDays,
        formattedBirthday: `${birthdayMonth}月${birthdayDate}日`,
      };
    });
    
    return NextResponse.json({
      success: true,
      data: personsWithDaysUntil,
      meta: {
        type,
        currentMonth,
        currentYear,
      },
    });
  } catch (error) {
    console.error('获取生日人物失败:', error);
    return NextResponse.json(
      { success: false, error: '获取生日人物失败' },
      { status: 500 }
    );
  }
}
