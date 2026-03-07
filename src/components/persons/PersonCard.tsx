'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Clock, 
  Calendar,
  Users,
  Star
} from 'lucide-react';

// 关系分类枚举
export const categories = [
  '领导', '同事', '竞争者', '八卦圈', 
  '贫困生', '普通学生', '校外家长', 
  '亲戚', '社会人士', '能量黑洞'
] as const;

// 优先级枚举
export const priorities = ['核心维护', '定期维护', '偶尔维护', '边界维护'] as const;

export type Category = typeof categories[number];
export type Priority = typeof priorities[number];

export interface Person {
  id: string;
  name: string;
  category: string;
  priority: string;
  lastContactDate?: string | null;
  contactFrequency?: number | null;
  intimacy?: number | null;
  attitude?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    interactions: number;
    relationsAsPerson1: number;
    relationsAsPerson2: number;
  };
}

interface PersonCardProps {
  person: Person;
  onClick?: (person: Person) => void;
}

// 优先级对应的颜色
const priorityColors: Record<Priority, string> = {
  '核心维护': 'bg-rose-100 text-rose-700 border-rose-200',
  '定期维护': 'bg-amber-100 text-amber-700 border-amber-200',
  '偶尔维护': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  '边界维护': 'bg-gray-100 text-gray-600 border-gray-200',
};

// 优先级对应的图标颜色
const priorityIconColors: Record<Priority, string> = {
  '核心维护': 'text-rose-500',
  '定期维护': 'text-amber-500',
  '偶尔维护': 'text-emerald-500',
  '边界维护': 'text-gray-400',
};

// 分类对应的颜色
const categoryColors: Record<string, string> = {
  '领导': 'bg-purple-100 text-purple-700',
  '同事': 'bg-teal-100 text-teal-700',
  '竞争者': 'bg-orange-100 text-orange-700',
  '八卦圈': 'bg-pink-100 text-pink-700',
  '贫困生': 'bg-cyan-100 text-cyan-700',
  '普通学生': 'bg-green-100 text-green-700',
  '校外家长': 'bg-yellow-100 text-yellow-700',
  '亲戚': 'bg-red-100 text-red-700',
  '社会人士': 'bg-slate-100 text-slate-700',
  '能量黑洞': 'bg-gray-800 text-gray-100',
};

// 计算距离上次联系的天数
function getDaysSinceLastContact(date: string | null | undefined): number | null {
  if (!date) return null;
  const lastContact = new Date(date);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lastContact.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// 格式化上次联系时间
function formatLastContact(date: string | null | undefined): string {
  const days = getDaysSinceLastContact(date);
  if (days === null) return '暂无记录';
  if (days === 0) return '今天';
  if (days === 1) return '昨天';
  if (days < 7) return `${days}天前`;
  if (days < 30) return `${Math.floor(days / 7)}周前`;
  if (days < 365) return `${Math.floor(days / 30)}个月前`;
  return `${Math.floor(days / 365)}年前`;
}

// 获取联系状态
function getContactStatus(person: Person): { 
  status: 'overdue' | 'normal' | 'good' | 'none';
  text: string;
} {
  if (!person.contactFrequency) {
    return { status: 'none', text: '未设置联系频率' };
  }
  
  const days = getDaysSinceLastContact(person.lastContactDate);
  if (days === null) {
    return { status: 'overdue', text: '从未联系' };
  }
  
  const frequency = person.contactFrequency;
  if (days > frequency) {
    const overdue = days - frequency;
    return { status: 'overdue', text: `已超期${overdue}天` };
  } else if (days > frequency * 0.7) {
    return { status: 'normal', text: `${frequency - days}天后需联系` };
  }
  return { status: 'good', text: '联系状态良好' };
}

export function PersonCard({ person, onClick }: PersonCardProps) {
  const contactStatus = getContactStatus(person);
  const priority = person.priority as Priority;
  
  const statusColors = {
    overdue: 'text-rose-600',
    normal: 'text-amber-600',
    good: 'text-emerald-600',
    none: 'text-gray-400',
  };
  
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-all duration-200 border-l-4"
      style={{ 
        borderLeftColor: priority === '核心维护' ? '#e11d48' :
                        priority === '定期维护' ? '#f59e0b' :
                        priority === '偶尔维护' ? '#10b981' : '#9ca3af'
      }}
      onClick={() => onClick?.(person)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* 头像 */}
          <Avatar className="h-12 w-12 rounded-lg">
            <AvatarFallback className={categoryColors[person.category] || 'bg-gray-100 text-gray-700'}>
              {person.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          {/* 主要信息 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 truncate">{person.name}</h3>
              {!person.isActive && (
                <Badge variant="outline" className="text-xs bg-gray-50 text-gray-500">
                  已归档
                </Badge>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge 
                variant="secondary" 
                className={`text-xs ${categoryColors[person.category] || 'bg-gray-100 text-gray-700'}`}
              >
                {person.category}
              </Badge>
              <Badge 
                variant="outline" 
                className={`text-xs ${priorityColors[priority] || 'bg-gray-100 text-gray-600'}`}
              >
                <Star className="h-3 w-3 mr-1" />
                {person.priority}
              </Badge>
            </div>
            
            {/* 联系状态 */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className={`h-4 w-4 ${statusColors[contactStatus.status]}`} />
                <span className={statusColors[contactStatus.status]}>
                  {formatLastContact(person.lastContactDate)}
                </span>
              </div>
              
              {person.contactFrequency && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>每{person.contactFrequency}天</span>
                </div>
              )}
              
              {person._count && (
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{person._count.interactions}次互动</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* 联系提示 */}
        {contactStatus.status === 'overdue' && (
          <div className="mt-3 p-2 bg-rose-50 rounded-md text-xs text-rose-600">
            {contactStatus.text}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PersonCard;
