'use client';

import { useState } from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Edit, 
  Trash2, 
  Calendar, 
  Clock, 
  Heart,
  AlertCircle,
  Users,
  Star,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  GraduationCap,
  Baby,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import { categories, priorities, type Person } from './PersonCard';

export interface Interaction {
  id: string;
  date: string;
  type: string;
  duration?: number | null;
  initiative: string;
  nature: string;
  energyScore?: number | null;
  note?: string | null;
  tags?: string | null;
}

export interface RelatedPerson {
  id: string;
  name: string;
  category: string;
  priority: string;
}

export interface Relation {
  id: string;
  type: string;
  intimacy?: number | null;
  note?: string | null;
  relatedPerson: RelatedPerson;
}

export interface PersonDetailData extends Person {
  interactions?: Interaction[];
  relations?: Relation[];
  // 校外家长字段
  childName?: string | null;
  childGrade?: string | null;
  childStudyStatus?: string | null;
  parentType?: string | null;
  payAbility?: number | null;
  referralWillingness?: number | null;
  referralCount?: number | null;
  potentialReferrals?: string | null;
  // 贫困生字段
  familySituation?: string | null;
  aidRecords?: string | null;
  academicTracking?: string | null;
  mentalState?: string | null;
  futurePotential?: string | null;
  graduationDestination?: string | null;
  wakeupCycle?: string | null;
  // 其他字段
  subCategory?: string | null;
  circles?: string | null;
  energyCost?: number | null;
  passiveBurden?: number | null;
  influencePower?: number | null;
  usableScope?: string | null;
  coreDriver?: string | null;
  currentNeed?: string | null;
  riskLine?: string | null;
  birthday?: string | null;
  familyInfo?: string | null;
}

interface PersonDetailProps {
  person: PersonDetailData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (person: PersonDetailData) => void;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}

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

// 优先级对应的颜色
const priorityColors: Record<string, string> = {
  '核心维护': 'bg-rose-100 text-rose-700 border-rose-200',
  '定期维护': 'bg-amber-100 text-amber-700 border-amber-200',
  '偶尔维护': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  '边界维护': 'bg-gray-100 text-gray-600 border-gray-200',
};

// 态度对应的颜色
const attitudeColors: Record<string, string> = {
  '友善': 'text-emerald-600',
  '中立': 'text-amber-600',
  '冷淡': 'text-gray-500',
  '敌对': 'text-rose-600',
};

// 格式化日期
function formatDate(date: string | null | undefined): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('zh-CN');
}

// 格式化日期时间
function formatDateTime(date: string): string {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// 计算距离上次联系的天数
function getDaysSince(date: string | null | undefined): number | null {
  if (!date) return null;
  const lastDate = new Date(date);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lastDate.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function PersonDetail({ 
  person, 
  open, 
  onOpenChange, 
  onEdit, 
  onDelete,
  isLoading = false 
}: PersonDetailProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!person) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(person.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const daysSinceContact = getDaysSince(person.lastContactDate);
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-hidden flex flex-col">
        <SheetHeader className="space-y-4 pb-4 border-b">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 rounded-xl">
              <AvatarFallback className={`text-xl ${categoryColors[person.category] || 'bg-gray-100 text-gray-700'}`}>
                {person.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-xl">{person.name}</SheetTitle>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge className={categoryColors[person.category] || 'bg-gray-100 text-gray-700'}>
                  {person.category}
                </Badge>
                <Badge variant="outline" className={priorityColors[person.priority] || ''}>
                  <Star className="h-3 w-3 mr-1" />
                  {person.priority}
                </Badge>
                {person.attitude && (
                  <span className={`text-sm ${attitudeColors[person.attitude] || 'text-gray-500'}`}>
                    {person.attitude}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <SheetDescription className="sr-only">
            人物详情信息
          </SheetDescription>
          
          {/* 操作按钮 */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onEdit(person)}
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-1" />
              编辑
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  删除
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>确认删除</AlertDialogTitle>
                  <AlertDialogDescription>
                    确定要删除「{person.name}」吗？此操作不可撤销，所有相关的互动记录和关系网络也会被删除。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-rose-600 hover:bg-rose-700"
                    disabled={isDeleting}
                  >
                    {isDeleting ? '删除中...' : '确认删除'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </SheetHeader>
        
        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6 py-4">
            {/* 联系状态 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">上次联系</div>
                <div className="font-medium">
                  {person.lastContactDate ? (
                    <>
                      {formatDate(person.lastContactDate)}
                      <span className="text-xs text-gray-500 ml-1">
                        ({daysSinceContact}天前)
                      </span>
                    </>
                  ) : '暂无记录'}
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">建议频率</div>
                <div className="font-medium">
                  {person.contactFrequency ? `每${person.contactFrequency}天` : '未设置'}
                </div>
              </div>
            </div>
            
            {/* 校外家长信息 */}
            {person.category === '校外家长' && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Baby className="h-4 w-4" />
                  家长信息
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {person.childName && (
                    <div>
                      <span className="text-gray-500">孩子姓名：</span>
                      <span>{person.childName}</span>
                    </div>
                  )}
                  {person.childGrade && (
                    <div>
                      <span className="text-gray-500">年级：</span>
                      <span>{person.childGrade}</span>
                    </div>
                  )}
                  {person.parentType && (
                    <div>
                      <span className="text-gray-500">家长类型：</span>
                      <span>{person.parentType}</span>
                    </div>
                  )}
                  {person.payAbility && (
                    <div>
                      <span className="text-gray-500">付费能力：</span>
                      <span>{'★'.repeat(person.payAbility)}{'☆'.repeat(5 - person.payAbility)}</span>
                    </div>
                  )}
                  {person.referralWillingness && (
                    <div>
                      <span className="text-gray-500">转介绍意愿：</span>
                      <span>{'★'.repeat(person.referralWillingness)}{'☆'.repeat(5 - person.referralWillingness)}</span>
                    </div>
                  )}
                  {person.referralCount !== undefined && person.referralCount > 0 && (
                    <div>
                      <span className="text-gray-500">已转介绍：</span>
                      <span>{person.referralCount}人</span>
                    </div>
                  )}
                </div>
                {person.childStudyStatus && (
                  <div className="text-sm">
                    <span className="text-gray-500">孩子学习情况：</span>
                    <p className="mt-1 text-gray-700">{person.childStudyStatus}</p>
                  </div>
                )}
                {person.potentialReferrals && (
                  <div className="text-sm">
                    <span className="text-gray-500">潜在转介绍：</span>
                    <p className="mt-1 text-gray-700">{person.potentialReferrals}</p>
                  </div>
                )}
              </div>
            )}
            
            {/* 贫困生信息 */}
            {person.category === '贫困生' && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  学生信息
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {person.mentalState && (
                    <div>
                      <span className="text-gray-500">心理状态：</span>
                      <span>{person.mentalState}</span>
                    </div>
                  )}
                  {person.futurePotential && (
                    <div>
                      <span className="text-gray-500">未来潜力：</span>
                      <span>{person.futurePotential}</span>
                    </div>
                  )}
                  {person.graduationDestination && (
                    <div>
                      <span className="text-gray-500">毕业去向：</span>
                      <span>{person.graduationDestination}</span>
                    </div>
                  )}
                  {person.wakeupCycle && (
                    <div>
                      <span className="text-gray-500">唤醒周期：</span>
                      <span>{person.wakeupCycle}</span>
                    </div>
                  )}
                </div>
                {person.familySituation && (
                  <div className="text-sm">
                    <span className="text-gray-500">家庭情况：</span>
                    <p className="mt-1 text-gray-700">{person.familySituation}</p>
                  </div>
                )}
                {person.aidRecords && (
                  <div className="text-sm">
                    <span className="text-gray-500">资助记录：</span>
                    <p className="mt-1 text-gray-700">{person.aidRecords}</p>
                  </div>
                )}
                {person.academicTracking && (
                  <div className="text-sm">
                    <span className="text-gray-500">学业跟踪：</span>
                    <p className="mt-1 text-gray-700">{person.academicTracking}</p>
                  </div>
                )}
              </div>
            )}
            
            {/* 八卦圈信息 */}
            {person.category === '八卦圈' && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  舆论信息
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {person.influencePower && (
                    <div>
                      <span className="text-gray-500">影响力：</span>
                      <span>{'★'.repeat(person.influencePower)}{'☆'.repeat(5 - person.influencePower)}</span>
                    </div>
                  )}
                  {person.usableScope && (
                    <div>
                      <span className="text-gray-500">可利用范围：</span>
                      <span>{person.usableScope}</span>
                    </div>
                  )}
                </div>
                {person.coreDriver && (
                  <div className="text-sm">
                    <span className="text-gray-500">核心驱动力：</span>
                    <p className="mt-1 text-gray-700">{person.coreDriver}</p>
                  </div>
                )}
              </div>
            )}
            
            {/* 其他详细信息 */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                详细信息
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {person.birthday && (
                  <div>
                    <span className="text-gray-500">生日：</span>
                    <span>{formatDate(person.birthday)}</span>
                  </div>
                )}
                {person.intimacy !== null && person.intimacy !== undefined && (
                  <div>
                    <span className="text-gray-500">亲密度：</span>
                    <span>{person.intimacy}/10</span>
                  </div>
                )}
                {person.energyCost !== null && person.energyCost !== undefined && (
                  <div>
                    <span className="text-gray-500">能量成本：</span>
                    <span>{person.energyCost}/5</span>
                  </div>
                )}
                {person.passiveBurden !== null && person.passiveBurden !== undefined && (
                  <div>
                    <span className="text-gray-500">被动负担：</span>
                    <span>{person.passiveBurden}/5</span>
                  </div>
                )}
                {person.subCategory && (
                  <div>
                    <span className="text-gray-500">子分类：</span>
                    <span>{person.subCategory}</span>
                  </div>
                )}
                {person.circles && (
                  <div className="col-span-2">
                    <span className="text-gray-500">关联圈子：</span>
                    <span>{person.circles}</span>
                  </div>
                )}
              </div>
              {person.currentNeed && (
                <div className="text-sm">
                  <span className="text-gray-500">近期需求：</span>
                  <p className="mt-1 text-gray-700">{person.currentNeed}</p>
                </div>
              )}
              {person.riskLine && (
                <div className="text-sm p-2 bg-rose-50 rounded border border-rose-100">
                  <span className="text-rose-600 font-medium">风险红线：</span>
                  <p className="mt-1 text-rose-700">{person.riskLine}</p>
                </div>
              )}
              {person.familyInfo && (
                <div className="text-sm">
                  <span className="text-gray-500">家庭背景：</span>
                  <p className="mt-1 text-gray-700">{person.familyInfo}</p>
                </div>
              )}
            </div>
            
            {/* 关系网络 */}
            {person.relations && person.relations.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  关系网络 ({person.relations.length})
                </h4>
                <div className="space-y-2">
                  {person.relations.slice(0, 10).map((relation) => (
                    <div 
                      key={relation.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className={`text-xs ${categoryColors[relation.relatedPerson.category] || 'bg-gray-100'}`}>
                            {relation.relatedPerson.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{relation.relatedPerson.name}</div>
                          <div className="text-xs text-gray-500">{relation.type}</div>
                        </div>
                      </div>
                      {relation.intimacy && (
                        <Badge variant="outline" className="text-xs">
                          亲密度 {relation.intimacy}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* 互动记录 */}
            {person.interactions && person.interactions.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  最近互动 ({person.interactions.length})
                </h4>
                <div className="space-y-2">
                  {person.interactions.slice(0, 10).map((interaction) => (
                    <div 
                      key={interaction.id}
                      className="p-3 bg-gray-50 rounded-lg text-sm"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {interaction.type}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              interaction.initiative === '主动' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {interaction.initiative}
                          </Badge>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDateTime(interaction.date)}
                        </span>
                      </div>
                      {interaction.note && (
                        <p className="text-gray-600 mt-1">{interaction.note}</p>
                      )}
                      {interaction.tags && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {interaction.tags.split(',').map((tag, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {tag.trim()}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* 创建/更新时间 */}
            <div className="text-xs text-gray-400 pt-4 border-t">
              <div>创建于 {formatDateTime(person.createdAt)}</div>
              <div>更新于 {formatDateTime(person.updatedAt)}</div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

export default PersonDetail;
