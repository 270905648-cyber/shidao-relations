'use client';

import { useState, useEffect, useCallback } from 'react';
import { format, subDays } from 'date-fns';
import { CalendarIcon, Filter, Plus, X, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import QuickRecordDialog from '@/components/interactions/QuickRecordDialog';
import InteractionList from '@/components/interactions/InteractionList';

// 互动类型枚举
const interactionTypes = [
  '办公室聊天',
  '单独谈话',
  '微信',
  '电话',
  '饭局',
  '礼物',
  '帮忙办事',
  '资助工作',
  '家长沟通',
  '试听课',
  '批量维护',
];

interface Person {
  id: string;
  name: string;
  category: string;
}

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

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export default function InteractionsPage() {
  // 人物列表
  const [persons, setPersons] = useState<Person[]>([]);
  const [personsLoading, setPersonsLoading] = useState(true);

  // 筛选状态 - 使用 'all' 作为默认值而不是空字符串
  const [personId, setPersonId] = useState<string>('all');
  const [type, setType] = useState<string>('all');
  const [startDate, setStartDate] = useState<Date | undefined>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());

  // 互动记录
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // 对话框状态
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // 加载人物列表
  const fetchPersons = useCallback(async () => {
    try {
      setPersonsLoading(true);
      const response = await fetch('/api/persons?pageSize=100');
      const data = await response.json();
      if (data.success) {
        setPersons(data.data || []);
      }
    } catch (error) {
      console.error('加载人物列表失败:', error);
    } finally {
      setPersonsLoading(false);
    }
  }, []);

  // 加载互动记录
  const fetchInteractions = useCallback(
    async (page: number = 1, append: boolean = false) => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        params.set('page', page.toString());
        params.set('pageSize', '20');

        // 只有非 'all' 的值才添加到参数
        if (personId && personId !== 'all') params.set('personId', personId);
        if (type && type !== 'all') params.set('type', type);
        if (startDate) params.set('startDate', startDate.toISOString());
        if (endDate) params.set('endDate', endDate.toISOString());

        const response = await fetch(`/api/interactions?${params.toString()}`);
        const data = await response.json();

        if (data.success) {
          if (append) {
            setInteractions((prev) => [...prev, ...(data.data || [])]);
          } else {
            setInteractions(data.data || []);
          }
          setPagination(data.pagination);
        }
      } catch (error) {
        console.error('加载互动记录失败:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [personId, type, startDate, endDate]
  );

  // 初始化加载
  useEffect(() => {
    fetchPersons();
  }, [fetchPersons]);

  // 筛选条件变化时重新加载
  useEffect(() => {
    fetchInteractions(1);
  }, [personId, type, startDate, endDate, fetchInteractions]);

  // 加载更多
  const handleLoadMore = () => {
    if (pagination.page < pagination.totalPages) {
      fetchInteractions(pagination.page + 1, true);
    }
  };

  // 刷新列表
  const handleRefresh = () => {
    fetchInteractions(1);
  };

  // 记录成功后刷新
  const handleRecordSuccess = () => {
    fetchInteractions(1);
  };

  // 清除筛选
  const clearFilters = () => {
    setPersonId('all');
    setType('all');
    setStartDate(subDays(new Date(), 30));
    setEndDate(new Date());
  };

  // 判断是否有筛选条件
  const hasFilters = personId !== 'all' || type !== 'all';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">关系流水账</h1>
            <p className="text-gray-500 text-sm mt-1">记录和管理你的人际互动</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            快速记录
          </Button>
        </div>

        {/* 筛选区域 */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Filter className="h-4 w-4" />
                筛选条件
              </CardTitle>
              {hasFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  清除筛选
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-4">
              {/* 人物选择 */}
              <div className="flex-1 min-w-[180px]">
                <label className="text-sm text-gray-600 mb-1 block">人物</label>
                <Select value={personId} onValueChange={setPersonId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="全部人物" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部人物</SelectItem>
                    {persons.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.name} ({person.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 互动类型 */}
              <div className="flex-1 min-w-[180px]">
                <label className="text-sm text-gray-600 mb-1 block">互动类型</label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="全部类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部类型</SelectItem>
                    {interactionTypes.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 开始日期 */}
              <div className="min-w-[140px]">
                <label className="text-sm text-gray-600 mb-1 block">开始日期</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !startDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'yyyy/MM/dd') : '选择日期'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* 结束日期 */}
              <div className="min-w-[140px]">
                <label className="text-sm text-gray-600 mb-1 block">结束日期</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !endDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, 'yyyy/MM/dd') : '选择日期'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* 已选筛选条件显示 */}
            {hasFilters && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                {personId !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    人物: {persons.find((p) => p.id === personId)?.name}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setPersonId('all')}
                    />
                  </Badge>
                )}
                {type !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    类型: {type}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setType('all')} />
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 统计信息 */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-600">
            共 <span className="font-medium text-gray-900">{pagination.total}</span> 条记录
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="gap-1"
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            刷新
          </Button>
        </div>

        {/* 互动记录列表 */}
        <InteractionList
          interactions={interactions}
          isLoading={isLoading}
          onLoadMore={handleLoadMore}
          hasMore={pagination.page < pagination.totalPages}
        />
      </div>

      {/* 快速记录对话框 */}
      <QuickRecordDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        persons={persons}
        onSuccess={handleRecordSuccess}
      />
    </div>
  );
}
