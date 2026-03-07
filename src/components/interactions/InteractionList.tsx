'use client';

import { Star, Clock, User, MessageSquare, ArrowUpDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

// 互动类型颜色映射
const typeColors: Record<string, string> = {
  '办公室聊天': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  '单独谈话': 'bg-purple-50 text-purple-700 border-purple-200',
  '微信': 'bg-green-50 text-green-700 border-green-200',
  '电话': 'bg-orange-50 text-orange-700 border-orange-200',
  '饭局': 'bg-amber-50 text-amber-700 border-amber-200',
  '礼物': 'bg-pink-50 text-pink-700 border-pink-200',
  '帮忙办事': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  '资助工作': 'bg-rose-50 text-rose-700 border-rose-200',
  '家长沟通': 'bg-sky-50 text-sky-700 border-sky-200',
  '试听课': 'bg-violet-50 text-violet-700 border-violet-200',
  '批量维护': 'bg-teal-50 text-teal-700 border-teal-200',
};

// 主动/被动颜色映射
const initiativeColors: Record<string, string> = {
  '主动': 'bg-amber-100 text-amber-800',
  '被动': 'bg-slate-100 text-slate-700',
};

interface Interaction {
  id: string;
  date: string;
  type: string;
  duration: number | null;
  initiative: string;
  nature: string;
  energyScore: number | null;
  note: string | null;
  person: {
    id: string;
    name: string;
    category: string;
    priority: string;
  };
}

interface InteractionListProps {
  interactions: Interaction[];
  isLoading: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export default function InteractionList({
  interactions,
  isLoading,
  onLoadMore,
  hasMore = false,
}: InteractionListProps) {
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
        month: 'numeric',
        day: 'numeric',
        weekday: 'short',
      });
    }
  };

  // 格式化时长
  const formatDuration = (minutes: number | null) => {
    if (!minutes) return '-';
    if (minutes < 60) return `${minutes}分钟`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
  };

  // 能量消耗星星
  const renderEnergyStars = (score: number | null) => {
    if (!score) return <span className="text-gray-400 text-sm">-</span>;
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3.5 w-3.5 ${
              star <= score
                ? 'fill-amber-400 text-amber-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
    );
  };

  // 加载骨架屏
  if (isLoading && interactions.length === 0) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Skeleton className="h-12 w-16 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // 空状态
  if (!isLoading && interactions.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <MessageSquare className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">暂无互动记录</p>
          <p className="text-gray-400 text-sm mt-1">点击右上角「快速记录」添加第一条记录</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {interactions.map((interaction) => (
        <Card
          key={interaction.id}
          className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              {/* 日期 */}
              <div className="flex-shrink-0 w-16 text-center py-1">
                <div className="text-lg font-semibold text-gray-900">
                  {formatDate(interaction.date)}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(interaction.date).toLocaleDateString('zh-CN', {
                    month: 'numeric',
                    day: 'numeric',
                  })}
                </div>
              </div>

              {/* 分隔线 */}
              <div className="w-px bg-gray-200 h-14" />

              {/* 主要内容 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  {/* 人物 */}
                  <div className="flex items-center gap-1.5">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-gray-900">
                      {interaction.person.name}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {interaction.person.category}
                    </Badge>
                  </div>
                </div>

                {/* 类型和标签 */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge
                    variant="outline"
                    className={typeColors[interaction.type] || 'bg-gray-50 text-gray-700'}
                  >
                    {interaction.type}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className={initiativeColors[interaction.initiative] || ''}
                  >
                    {interaction.initiative}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {interaction.nature}
                  </Badge>
                </div>

                {/* 时长和能量 */}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatDuration(interaction.duration)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">能量:</span>
                    {renderEnergyStars(interaction.energyScore)}
                  </div>
                </div>

                {/* 备注 */}
                {interaction.note && (
                  <div className="mt-2 text-sm text-gray-600 line-clamp-2 bg-gray-50 rounded px-2 py-1">
                    {interaction.note}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* 加载更多 */}
      {hasMore && (
        <div className="flex justify-center py-4">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <ArrowUpDown className="h-4 w-4 animate-spin" />
                加载中...
              </>
            ) : (
              '加载更多'
            )}
          </Button>
        </div>
      )}

      {/* 加载指示器 */}
      {isLoading && interactions.length > 0 && (
        <div className="flex justify-center py-4">
          <ArrowUpDown className="h-5 w-5 animate-spin text-gray-400" />
        </div>
      )}
    </div>
  );
}
