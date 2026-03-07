'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Calendar,
  User,
  Target,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  ArrowRight,
} from 'lucide-react';
import { statusColors, statuses, type Confusion } from './ConfusionCard';

interface ConfusionDetailProps {
  confusion: Confusion | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (confusion: Confusion) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
}

// 下一个状态映射
const nextStatusMap: Record<string, string> = {
  '待处理': '处理中',
  '处理中': '已解决',
  '已解决': '',
  '已放弃': '',
};

// 状态图标
const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case '待处理':
      return <AlertCircle className="h-4 w-4 text-rose-500" />;
    case '处理中':
      return <Clock className="h-4 w-4 text-amber-500" />;
    case '已解决':
      return <CheckCircle className="h-4 w-4 text-emerald-500" />;
    case '已放弃':
      return <XCircle className="h-4 w-4 text-gray-400" />;
    default:
      return null;
  }
};

export default function ConfusionDetail({
  confusion,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  onStatusChange,
}: ConfusionDetailProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  if (!confusion) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const nextStatus = nextStatusMap[confusion.status];

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <div className="flex items-center gap-2">
              <SheetTitle className="flex-1">{confusion.title}</SheetTitle>
              <Badge
                variant="outline"
                className={statusColors[confusion.status]}
              >
                <StatusIcon status={confusion.status} />
                <span className="ml-1">{confusion.status}</span>
              </Badge>
            </div>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* 基本信息区 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>{formatDate(confusion.date)}</span>
              </div>

              {confusion.person && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4 text-gray-400" />
                  <span>关联人物: </span>
                  <span className="font-medium text-gray-900">
                    {confusion.person.name}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {confusion.person.category}
                  </Badge>
                </div>
              )}
            </div>

            <Separator />

            {/* 详细描述 */}
            {confusion.description && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">详细描述</h4>
                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">
                  {confusion.description}
                </p>
              </div>
            )}

            {/* 希望达成的目标 */}
            {confusion.goal && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Target className="h-4 w-4 text-emerald-500" />
                  希望达成的目标
                </h4>
                <p className="text-sm text-gray-600 bg-emerald-50 rounded-lg p-3">
                  {confusion.goal}
                </p>
              </div>
            )}

            {/* 采纳的行动 */}
            {confusion.action && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-amber-500" />
                  采纳的行动
                </h4>
                <p className="text-sm text-gray-600 bg-amber-50 rounded-lg p-3">
                  {confusion.action}
                </p>
              </div>
            )}

            {/* 后续跟踪 */}
            {confusion.followUp && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-500" />
                  后续跟踪
                </h4>
                <p className="text-sm text-gray-600 bg-purple-50 rounded-lg p-3">
                  {confusion.followUp}
                </p>
              </div>
            )}

            <Separator />

            {/* 状态流转按钮 */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">状态流转</h4>
              <div className="flex flex-wrap gap-2">
                {statuses.map((status) => (
                  <Button
                    key={status}
                    variant={confusion.status === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onStatusChange(confusion.id, status)}
                    className={
                      confusion.status === status
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : ''
                    }
                  >
                    <StatusIcon status={status} />
                    <span className="ml-1">{status}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* 快捷状态流转 */}
            {nextStatus && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => onStatusChange(confusion.id, nextStatus)}
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                标记为「{nextStatus}」
              </Button>
            )}

            <Separator />

            {/* 操作按钮 */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  onOpenChange(false);
                  onEdit(confusion);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                编辑
              </Button>
              <Button
                variant="outline"
                className="flex-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                删除
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* 删除确认对话框 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除困惑事件「{confusion.title}」吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700"
              onClick={() => {
                onDelete(confusion.id);
                setShowDeleteDialog(false);
                onOpenChange(false);
              }}
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
