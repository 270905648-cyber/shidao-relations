'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search,
  Plus,
  HelpCircle,
  Filter,
  Loader2,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

import ConfusionCard, {
  statuses,
  statusColors,
  type Confusion,
} from '@/components/confusions/ConfusionCard';
import ConfusionForm, { type ConfusionFormData } from '@/components/confusions/ConfusionForm';
import ConfusionDetail from '@/components/confusions/ConfusionDetail';

interface ConfusionsResponse {
  success: boolean;
  data: Confusion[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// 状态标签颜色（用于 Tab 图标）
const statusDotColors: Record<string, string> = {
  '待处理': 'bg-rose-500',
  '处理中': 'bg-amber-500',
  '已解决': 'bg-emerald-500',
  '已放弃': 'bg-gray-400',
};

export default function ConfusionPage() {
  const { toast } = useToast();

  // 状态
  const [confusions, setConfusions] = useState<Confusion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('all');

  // 弹窗状态
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedConfusion, setSelectedConfusion] = useState<Confusion | null>(null);
  const [editingConfusion, setEditingConfusion] = useState<Confusion | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 获取困惑事件列表
  const fetchConfusions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      params.append('pageSize', '100');

      const response = await fetch(`/api/confusions?${params.toString()}`);
      const result: ConfusionsResponse = await response.json();

      if (result.success) {
        setConfusions(result.data);
      } else {
        throw new Error('获取困惑事件列表失败');
      }
    } catch (error) {
      console.error('获取困惑事件列表失败:', error);
      toast({
        title: '获取失败',
        description: '无法加载困惑事件列表，请重试',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatus, toast]);

  useEffect(() => {
    fetchConfusions();
  }, [fetchConfusions]);

  // 创建困惑事件
  const handleCreate = async (data: ConfusionFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/confusions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: '创建成功',
          description: `困惑事件「${data.title}」已创建`,
        });
        fetchConfusions();
        setShowForm(false);
      } else {
        throw new Error(result.error || '创建失败');
      }
    } catch (error: unknown) {
      console.error('创建困惑事件失败:', error);
      toast({
        title: '创建失败',
        description: error instanceof Error ? error.message : '无法创建困惑事件',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 更新困惑事件
  const handleUpdate = async (data: ConfusionFormData) => {
    if (!editingConfusion) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/confusions/${editingConfusion.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: '更新成功',
          description: `困惑事件「${data.title}」已更新`,
        });
        fetchConfusions();
        setEditingConfusion(null);
        setShowForm(false);
      } else {
        throw new Error(result.error || '更新失败');
      }
    } catch (error: unknown) {
      console.error('更新困惑事件失败:', error);
      toast({
        title: '更新失败',
        description: error instanceof Error ? error.message : '无法更新困惑事件',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 删除困惑事件
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/confusions/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: '删除成功',
          description: '困惑事件已删除',
        });
        setShowDetail(false);
        setSelectedConfusion(null);
        fetchConfusions();
      } else {
        throw new Error(result.error || '删除失败');
      }
    } catch (error: unknown) {
      console.error('删除困惑事件失败:', error);
      toast({
        title: '删除失败',
        description: error instanceof Error ? error.message : '无法删除困惑事件',
        variant: 'destructive',
      });
    }
  };

  // 更新状态
  const handleStatusChange = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/confusions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: '状态已更新',
          description: `已更新为「${status}」`,
        });
        // 更新本地状态
        setSelectedConfusion((prev) =>
          prev && prev.id === id ? { ...prev, status } : prev
        );
        fetchConfusions();
      } else {
        throw new Error(result.error || '更新失败');
      }
    } catch (error: unknown) {
      console.error('更新状态失败:', error);
      toast({
        title: '更新失败',
        description: error instanceof Error ? error.message : '无法更新状态',
        variant: 'destructive',
      });
    }
  };

  // 点击卡片
  const handleCardClick = (confusion: Confusion) => {
    setSelectedConfusion(confusion);
    setShowDetail(true);
  };

  // 打开编辑
  const handleEdit = (confusion: Confusion) => {
    setSelectedConfusion(null);
    setShowDetail(false);
    setEditingConfusion(confusion);
    setShowForm(true);
  };

  // 按状态分组
  const groupedConfusions = confusions.reduce((acc, confusion) => {
    const status = confusion.status || '待处理';
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(confusion);
    return acc;
  }, {} as Record<string, Confusion[]>);

  // 搜索过滤
  const filteredConfusions = confusions.filter((confusion) => {
    if (!searchTerm) return true;
    return (
      confusion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (confusion.description?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (confusion.person?.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // 根据标签筛选
  const getDisplayedConfusions = () => {
    let result = filteredConfusions;
    if (activeTab !== 'all') {
      result = result.filter((c) => c.status === activeTab);
    }
    return result;
  };

  // 统计数量
  const getStatusCount = (status: string) => {
    return groupedConfusions[status]?.length || 0;
  };

  // 重置筛选
  const handleReset = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    setActiveTab('all');
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 顶部栏 */}
      <div className="bg-white border-b px-4 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-emerald-600" />
            <h1 className="text-xl font-semibold text-gray-900">困惑事件</h1>
            <Badge variant="secondary" className="ml-2">
              {confusions.length} 条
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="text-gray-600"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              重置
            </Button>
            <Button
              onClick={() => {
                setEditingConfusion(null);
                setShowForm(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              新建困惑
            </Button>
          </div>
        </div>

        {/* 搜索和筛选 */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索标题、描述或人物..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="全部状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="bg-white border-b px-4">
            <TabsList className="bg-transparent h-12">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-gray-100 data-[state=active]:shadow-none"
              >
                全部 ({confusions.length})
              </TabsTrigger>
              {statuses.map((status) => (
                <TabsTrigger
                  key={status}
                  value={status}
                  className="data-[state=active]:bg-gray-100 data-[state=active]:shadow-none"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${statusDotColors[status]} mr-1.5`}
                  />
                  {status} ({getStatusCount(status)})
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <ScrollArea className="flex-1 p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              </div>
            ) : getDisplayedConfusions().length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <AlertCircle className="h-12 w-12 mb-4 text-gray-300" />
                <p>暂无困惑事件</p>
                <Button
                  variant="link"
                  className="mt-2 text-emerald-600"
                  onClick={() => setShowForm(true)}
                >
                  点击添加第一个困惑事件
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {getDisplayedConfusions().map((confusion) => (
                  <ConfusionCard
                    key={confusion.id}
                    confusion={confusion}
                    onClick={handleCardClick}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </Tabs>
      </div>

      {/* 困惑事件表单弹窗 */}
      <ConfusionForm
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) setEditingConfusion(null);
        }}
        onSubmit={editingConfusion ? handleUpdate : handleCreate}
        initialData={editingConfusion}
        isLoading={isSubmitting}
      />

      {/* 困惑事件详情弹窗 */}
      <ConfusionDetail
        confusion={selectedConfusion}
        open={showDetail}
        onOpenChange={(open) => {
          setShowDetail(open);
          if (!open) setSelectedConfusion(null);
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
