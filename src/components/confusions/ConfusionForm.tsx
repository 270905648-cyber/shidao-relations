'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { statuses, type Confusion } from './ConfusionCard';

export interface ConfusionFormData {
  title: string;
  date: string;
  personId: string | null;
  description: string;
  goal: string;
  action: string;
  followUp: string;
  status: string;
}

interface Person {
  id: string;
  name: string;
  category: string;
}

interface ConfusionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ConfusionFormData) => Promise<void>;
  initialData?: Confusion | null;
  isLoading?: boolean;
}

export default function ConfusionForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading = false,
}: ConfusionFormProps) {
  const [formData, setFormData] = useState<ConfusionFormData>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    personId: null,
    description: '',
    goal: '',
    action: '',
    followUp: '',
    status: '待处理',
  });
  const [persons, setPersons] = useState<Person[]>([]);
  const [isLoadingPersons, setIsLoadingPersons] = useState(false);

  // 加载人物列表
  useEffect(() => {
    const fetchPersons = async () => {
      setIsLoadingPersons(true);
      try {
        const response = await fetch('/api/persons?pageSize=100');
        const result = await response.json();
        if (result.success) {
          setPersons(result.data);
        }
      } catch (error) {
        console.error('加载人物列表失败:', error);
      } finally {
        setIsLoadingPersons(false);
      }
    };

    if (open) {
      fetchPersons();
    }
  }, [open]);

  // 初始化表单数据
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        date: new Date(initialData.date).toISOString().split('T')[0],
        personId: initialData.personId,
        description: initialData.description || '',
        goal: initialData.goal || '',
        action: initialData.action || '',
        followUp: initialData.followUp || '',
        status: initialData.status,
      });
    } else {
      setFormData({
        title: '',
        date: new Date().toISOString().split('T')[0],
        personId: null,
        description: '',
        goal: '',
        action: '',
        followUp: '',
        status: '待处理',
      });
    }
  }, [initialData, open]);

  const handleSubmit = async () => {
    if (!formData.title.trim()) return;
    await onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? '编辑困惑事件' : '创建困惑事件'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 标题 */}
          <div className="space-y-2">
            <Label htmlFor="title" className="required">
              标题
            </Label>
            <Input
              id="title"
              placeholder="简述困惑事件..."
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          {/* 日期和状态 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">发生日期</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">状态</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 关联人物 */}
          <div className="space-y-2">
            <Label htmlFor="person">关联人物（可选）</Label>
            <Select
              value={formData.personId || 'none'}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  personId: value === 'none' ? null : value,
                })
              }
              disabled={isLoadingPersons}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择关联人物" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">不关联</SelectItem>
                {persons.map((person) => (
                  <SelectItem key={person.id} value={person.id}>
                    {person.name} ({person.category})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 详细描述 */}
          <div className="space-y-2">
            <Label htmlFor="description">详细描述</Label>
            <Textarea
              id="description"
              placeholder="描述困惑的具体情况..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />
          </div>

          {/* 希望达成的目标 */}
          <div className="space-y-2">
            <Label htmlFor="goal">希望达成的目标</Label>
            <Textarea
              id="goal"
              placeholder="希望通过处理达到什么目标..."
              value={formData.goal}
              onChange={(e) =>
                setFormData({ ...formData, goal: e.target.value })
              }
              rows={2}
            />
          </div>

          {/* 采纳的行动 */}
          <div className="space-y-2">
            <Label htmlFor="action">采纳的行动</Label>
            <Textarea
              id="action"
              placeholder="实际采取了什么行动..."
              value={formData.action}
              onChange={(e) =>
                setFormData({ ...formData, action: e.target.value })
              }
              rows={2}
            />
          </div>

          {/* 后续跟踪 */}
          <div className="space-y-2">
            <Label htmlFor="followUp">后续跟踪</Label>
            <Textarea
              id="followUp"
              placeholder="后续需要关注的事项..."
              value={formData.followUp}
              onChange={(e) =>
                setFormData({ ...formData, followUp: e.target.value })
              }
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formData.title.trim() || isLoading}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {initialData ? '保存' : '创建'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
