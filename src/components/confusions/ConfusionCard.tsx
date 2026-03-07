'use client';

import { Calendar, User, Target, ChevronRight, HelpCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// 状态颜色映射
export const statusColors: Record<string, string> = {
  '待处理': 'bg-rose-100 text-rose-700 border-rose-200',
  '处理中': 'bg-amber-100 text-amber-700 border-amber-200',
  '已解决': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  '已放弃': 'bg-gray-100 text-gray-600 border-gray-200',
};

// 状态列表
export const statuses = ['待处理', '处理中', '已解决', '已放弃'] as const;

export interface Confusion {
  id: string;
  title: string;
  date: string;
  description: string | null;
  goal: string | null;
  action: string | null;
  followUp: string | null;
  status: string;
  personId: string | null;
  person: {
    id: string;
    name: string;
    category: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

interface ConfusionCardProps {
  confusion: Confusion;
  onClick: (confusion: Confusion) => void;
}

export default function ConfusionCard({ confusion, onClick }: ConfusionCardProps) {
  // 格式化日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return '今天';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '昨天';
    } else {
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      });
    }
  };

  // 获取状态左边框颜色
  const getBorderColor = (status: string) => {
    switch (status) {
      case '待处理':
        return 'border-l-rose-500';
      case '处理中':
        return 'border-l-amber-500';
      case '已解决':
        return 'border-l-emerald-500';
      case '已放弃':
        return 'border-l-gray-400';
      default:
        return 'border-l-gray-300';
    }
  };

  return (
    <Card
      className={`overflow-hidden hover:shadow-md transition-all cursor-pointer border-l-4 ${getBorderColor(confusion.status)}`}
      onClick={() => onClick(confusion)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* 标题和状态 */}
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <h3 className="font-medium text-gray-900 truncate">
                {confusion.title}
              </h3>
              <Badge
                variant="outline"
                className={statusColors[confusion.status] || 'bg-gray-50 text-gray-700'}
              >
                {confusion.status}
              </Badge>
            </div>

            {/* 日期和关联人物 */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-2">
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatDate(confusion.date)}</span>
              </div>
              {confusion.person && (
                <div className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  <span>{confusion.person.name}</span>
                  <Badge variant="outline" className="text-xs py-0 h-5">
                    {confusion.person.category}
                  </Badge>
                </div>
              )}
            </div>

            {/* 目标预览 */}
            {confusion.goal && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Target className="h-3.5 w-3.5 text-emerald-500" />
                <span className="truncate">{confusion.goal}</span>
              </div>
            )}

            {/* 描述预览 */}
            {confusion.description && (
              <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                {confusion.description}
              </p>
            )}
          </div>

          <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 ml-2" />
        </div>
      </CardContent>
    </Card>
  );
}
