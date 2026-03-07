'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  Plus,
  BookOpen,
  Loader2,
  AlertCircle,
  Edit2,
  Trash2,
  Flame,
  MessageSquare,
  Zap,
  Radio,
  Shield,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// 策略类型定义
interface Strategy {
  id: string;
  category: string;
  title: string;
  content: string;
  targetType: string | null;
  riskLevel: string | null;
  isCustom: boolean;
  createdAt: string;
}

// 策略分类配置
const categories = [
  { id: '测试动作', name: '测试动作库', icon: Flame, color: 'text-orange-500' },
  { id: '转介绍话术', name: '转介绍话术库', icon: MessageSquare, color: 'text-emerald-500' },
  { id: '能量管理', name: '能量管理原则', icon: Zap, color: 'text-amber-500' },
  { id: '舆论利用', name: '舆论利用指南', icon: Radio, color: 'text-purple-500' },
];

// 风险等级配置
const riskLevelConfig: Record<string, { color: string; bgColor: string }> = {
  '低风险': { color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  '中风险': { color: 'text-amber-600', bgColor: 'bg-amber-50' },
  '高风险': { color: 'text-rose-600', bgColor: 'bg-rose-50' },
};

// 策略表单数据类型
interface StrategyFormData {
  title: string;
  content: string;
  category: string;
  targetType: string;
  riskLevel: string;
}

export default function StrategiesPage() {
  const { toast } = useToast();

  // 状态
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // 弹窗状态
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 表单数据
  const [formData, setFormData] = useState<StrategyFormData>({
    title: '',
    content: '',
    category: '测试动作',
    targetType: '',
    riskLevel: '',
  });

  // 获取策略列表
  const fetchStrategies = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);

      const response = await fetch(`/api/strategies?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setStrategies(result.data);
      } else {
        throw new Error('获取策略列表失败');
      }
    } catch (error) {
      console.error('获取策略列表失败:', error);
      toast({
        title: '获取失败',
        description: '无法加载策略列表，请重试',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedCategory, toast]);

  useEffect(() => {
    fetchStrategies();
  }, [fetchStrategies]);

  // 重置表单
  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: selectedCategory !== 'all' ? selectedCategory : '测试动作',
      targetType: '',
      riskLevel: '',
    });
    setEditingStrategy(null);
  };

  // 打开新建弹窗
  const handleOpenCreate = () => {
    resetForm();
    setShowForm(true);
  };

  // 打开编辑弹窗
  const handleOpenEdit = (strategy: Strategy) => {
    setEditingStrategy(strategy);
    setFormData({
      title: strategy.title,
      content: strategy.content,
      category: strategy.category,
      targetType: strategy.targetType || '',
      riskLevel: strategy.riskLevel || '',
    });
    setShowDetail(false);
    setShowForm(true);
  };

  // 点击策略卡片
  const handleStrategyClick = (strategy: Strategy) => {
    setSelectedStrategy(strategy);
    setShowDetail(true);
  };

  // 创建策略
  const handleCreate = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: '请填写完整',
        description: '标题和内容为必填项',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/strategies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          category: formData.category,
          targetType: formData.targetType || null,
          riskLevel: formData.riskLevel || null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: '创建成功',
          description: `策略「${formData.title}」已创建`,
        });
        setShowForm(false);
        resetForm();
        fetchStrategies();
      } else {
        throw new Error(result.error || '创建失败');
      }
    } catch (error) {
      console.error('创建策略失败:', error);
      toast({
        title: '创建失败',
        description: error instanceof Error ? error.message : '无法创建策略',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 更新策略
  const handleUpdate = async () => {
    if (!editingStrategy) return;
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: '请填写完整',
        description: '标题和内容为必填项',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/strategies/${editingStrategy.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          category: formData.category,
          targetType: formData.targetType || null,
          riskLevel: formData.riskLevel || null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: '更新成功',
          description: `策略「${formData.title}」已更新`,
        });
        setShowForm(false);
        resetForm();
        fetchStrategies();
      } else {
        throw new Error(result.error || '更新失败');
      }
    } catch (error) {
      console.error('更新策略失败:', error);
      toast({
        title: '更新失败',
        description: error instanceof Error ? error.message : '无法更新策略',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 删除策略
  const handleDelete = async () => {
    if (!selectedStrategy) return;

    try {
      const response = await fetch(`/api/strategies/${selectedStrategy.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: '删除成功',
          description: '策略已删除',
        });
        setShowDeleteConfirm(false);
        setShowDetail(false);
        setSelectedStrategy(null);
        fetchStrategies();
      } else {
        throw new Error(result.error || '删除失败');
      }
    } catch (error) {
      console.error('删除策略失败:', error);
      toast({
        title: '删除失败',
        description: error instanceof Error ? error.message : '无法删除策略',
        variant: 'destructive',
      });
    }
  };

  // 获取分类统计
  const getCategoryCount = (categoryId: string) => {
    return strategies.filter((s) => s.category === categoryId).length;
  };

  // 根据选中分类筛选策略
  const filteredStrategies = selectedCategory === 'all'
    ? strategies
    : strategies.filter((s) => s.category === selectedCategory);

  return (
    <div className="h-screen flex bg-gray-50">
      {/* 左侧分类导航 */}
      <div className="w-64 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-emerald-600" />
            <h1 className="text-lg font-semibold text-gray-900">策略库</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">知识库与策略参考</p>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {/* 全部分类 */}
            <button
              onClick={() => setSelectedCategory('all')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <FileText className="h-5 w-5" />
              <span className="flex-1">全部策略</span>
              <Badge variant="secondary" className="text-xs">
                {strategies.length}
              </Badge>
            </button>

            {/* 分类列表 */}
            <div className="mt-2 space-y-1">
              {categories.map((cat) => {
                const IconComponent = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <IconComponent className={`h-5 w-5 ${cat.color}`} />
                    <span className="flex-1 text-sm">{cat.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {getCategoryCount(cat.id)}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>
        </ScrollArea>

        {/* 新建按钮 */}
        <div className="p-4 border-t">
          <Button
            onClick={handleOpenCreate}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            添加自定义策略
          </Button>
        </div>
      </div>

      {/* 右侧内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 搜索栏 */}
        <div className="bg-white border-b px-6 py-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索策略标题或内容..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* 内容列表 */}
        <ScrollArea className="flex-1 p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
          ) : filteredStrategies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <AlertCircle className="h-12 w-12 mb-4 text-gray-300" />
              <p>暂无策略数据</p>
              <Button
                variant="link"
                className="mt-2 text-emerald-600"
                onClick={handleOpenCreate}
              >
                点击添加第一个策略
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredStrategies.map((strategy) => {
                const categoryConfig = categories.find((c) => c.id === strategy.category);
                const IconComponent = categoryConfig?.icon || FileText;

                return (
                  <Card
                    key={strategy.id}
                    className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-emerald-500"
                    onClick={() => handleStrategyClick(strategy)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base font-medium flex items-center gap-2">
                          <IconComponent className={`h-4 w-4 ${categoryConfig?.color || 'text-gray-500'}`} />
                          {strategy.title}
                        </CardTitle>
                        <div className="flex items-center gap-1">
                          {strategy.isCustom && (
                            <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-200">
                              自定义
                            </Badge>
                          )}
                          {strategy.riskLevel && (
                            <Badge
                              variant="secondary"
                              className={`text-xs ${riskLevelConfig[strategy.riskLevel]?.bgColor || ''} ${riskLevelConfig[strategy.riskLevel]?.color || ''}`}
                            >
                              {strategy.riskLevel}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {strategy.content}
                      </p>
                      {strategy.targetType && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                          <Shield className="h-3 w-3" />
                          适用: {strategy.targetType}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* 策略详情弹窗 */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedStrategy && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {(() => {
                    const catConfig = categories.find((c) => c.id === selectedStrategy.category);
                    const IconComponent = catConfig?.icon || FileText;
                    return <IconComponent className={`h-5 w-5 ${catConfig?.color || 'text-gray-500'}`} />;
                  })()}
                  {selectedStrategy.title}
                  {selectedStrategy.isCustom && (
                    <Badge variant="outline" className="ml-2 text-emerald-600 border-emerald-200">
                      自定义
                    </Badge>
                  )}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* 分类信息 */}
                <div className="flex items-center gap-4">
                  <Badge variant="secondary">
                    {categories.find((c) => c.id === selectedStrategy.category)?.name || selectedStrategy.category}
                  </Badge>
                  {selectedStrategy.riskLevel && (
                    <Badge
                      variant="secondary"
                      className={`${riskLevelConfig[selectedStrategy.riskLevel]?.bgColor || ''} ${riskLevelConfig[selectedStrategy.riskLevel]?.color || ''}`}
                    >
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {selectedStrategy.riskLevel}
                    </Badge>
                  )}
                </div>

                {/* 适用对象 */}
                {selectedStrategy.targetType && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="h-4 w-4" />
                    <span>适用对象: {selectedStrategy.targetType}</span>
                  </div>
                )}

                {/* 内容 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedStrategy.content}
                  </p>
                </div>
              </div>

              <DialogFooter className="flex justify-between sm:justify-between">
                {selectedStrategy.isCustom ? (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleOpenEdit(selectedStrategy)}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      编辑
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setShowDetail(false);
                        setShowDeleteConfirm(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      删除
                    </Button>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <Shield className="h-4 w-4" />
                    系统预设策略不可修改
                  </div>
                )}
                <Button variant="secondary" onClick={() => setShowDetail(false)}>
                  关闭
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 策略表单弹窗 */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingStrategy ? '编辑策略' : '添加自定义策略'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* 标题 */}
            <div className="space-y-2">
              <Label htmlFor="title">标题 *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="请输入策略标题"
              />
            </div>

            {/* 分类 */}
            <div className="space-y-2">
              <Label htmlFor="category">分类 *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 内容 */}
            <div className="space-y-2">
              <Label htmlFor="content">内容 *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="请输入策略内容"
                rows={6}
              />
            </div>

            {/* 适用对象 */}
            <div className="space-y-2">
              <Label htmlFor="targetType">适用对象（可选）</Label>
              <Input
                id="targetType"
                value={formData.targetType}
                onChange={(e) => setFormData({ ...formData, targetType: e.target.value })}
                placeholder="例如：校外家长、贫困生等"
              />
            </div>

            {/* 风险等级 */}
            <div className="space-y-2">
              <Label htmlFor="riskLevel">风险等级（可选）</Label>
              <Select
                value={formData.riskLevel}
                onValueChange={(value) => setFormData({ ...formData, riskLevel: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择风险等级" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="低风险">低风险</SelectItem>
                  <SelectItem value="中风险">中风险</SelectItem>
                  <SelectItem value="高风险">高风险</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              取消
            </Button>
            <Button
              onClick={editingStrategy ? handleUpdate : handleCreate}
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingStrategy ? '保存' : '创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认弹窗 */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除策略「{selectedStrategy?.title}」吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-rose-600 hover:bg-rose-700"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
