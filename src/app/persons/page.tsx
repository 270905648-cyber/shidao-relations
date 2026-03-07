'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search,
  Plus,
  Users,
  Filter,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { PersonCard, categories, priorities, type Person } from '@/components/persons/PersonCard';
import { PersonForm, type PersonFormData } from '@/components/persons/PersonForm';
import { PersonDetail, type PersonDetailData } from '@/components/persons/PersonDetail';

interface PersonsResponse {
  success: boolean;
  data: Person[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

interface PersonDetailResponse {
  success: boolean;
  data: PersonDetailData;
}

// 分组优先级顺序
const priorityOrder = ['核心维护', '定期维护', '偶尔维护', '边界维护'];

// 优先级图标颜色
const priorityIconColors: Record<string, string> = {
  '核心维护': 'bg-rose-500',
  '定期维护': 'bg-amber-500',
  '偶尔维护': 'bg-emerald-500',
  '边界维护': 'bg-gray-400',
};

export default function PersonsPage() {
  const { toast } = useToast();
  
  // 状态
  const [persons, setPersons] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('all');
  
  // 弹窗状态
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<PersonDetailData | null>(null);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 获取人物列表
  const fetchPersons = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('name', searchTerm);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedPriority !== 'all') params.append('priority', selectedPriority);
      params.append('pageSize', '100');
      
      const response = await fetch(`/api/persons?${params.toString()}`);
      const result: PersonsResponse = await response.json();
      
      if (result.success) {
        setPersons(result.data);
      } else {
        throw new Error('获取人物列表失败');
      }
    } catch (error) {
      console.error('获取人物列表失败:', error);
      toast({
        title: '获取失败',
        description: '无法加载人物列表，请重试',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedCategory, selectedPriority, toast]);

  useEffect(() => {
    fetchPersons();
  }, [fetchPersons]);

  // 获取人物详情
  const fetchPersonDetail = async (id: string) => {
    try {
      const response = await fetch(`/api/persons/${id}`);
      const result: PersonDetailResponse = await response.json();
      
      if (result.success) {
        setSelectedPerson(result.data);
        setShowDetail(true);
      } else {
        throw new Error('获取人物详情失败');
      }
    } catch (error) {
      console.error('获取人物详情失败:', error);
      toast({
        title: '获取失败',
        description: '无法加载人物详情',
        variant: 'destructive',
      });
    }
  };

  // 创建人物
  const handleCreate = async (data: PersonFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/persons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: '创建成功',
          description: `人物「${data.name}」已创建`,
        });
        fetchPersons();
      } else {
        throw new Error(result.error || '创建失败');
      }
    } catch (error: unknown) {
      console.error('创建人物失败:', error);
      toast({
        title: '创建失败',
        description: error instanceof Error ? error.message : '无法创建人物',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 更新人物
  const handleUpdate = async (data: PersonFormData) => {
    if (!editingPerson) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/persons/${editingPerson.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: '更新成功',
          description: `人物「${data.name}」已更新`,
        });
        fetchPersons();
        setEditingPerson(null);
      } else {
        throw new Error(result.error || '更新失败');
      }
    } catch (error: unknown) {
      console.error('更新人物失败:', error);
      toast({
        title: '更新失败',
        description: error instanceof Error ? error.message : '无法更新人物',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 删除人物
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/persons/${id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: '删除成功',
          description: '人物已删除',
        });
        setShowDetail(false);
        setSelectedPerson(null);
        fetchPersons();
      } else {
        throw new Error(result.error || '删除失败');
      }
    } catch (error: unknown) {
      console.error('删除人物失败:', error);
      toast({
        title: '删除失败',
        description: error instanceof Error ? error.message : '无法删除人物',
        variant: 'destructive',
      });
    }
  };

  // 点击卡片
  const handleCardClick = (person: Person) => {
    fetchPersonDetail(person.id);
  };

  // 打开编辑
  const handleEdit = (person: PersonDetailData) => {
    setSelectedPerson(null);
    setShowDetail(false);
    setEditingPerson(person as unknown as Person);
    setShowForm(true);
  };

  // 按优先级分组
  const groupedPersons = persons.reduce((acc, person) => {
    const priority = person.priority || '偶尔维护';
    if (!acc[priority]) {
      acc[priority] = [];
    }
    acc[priority].push(person);
    return acc;
  }, {} as Record<string, Person[]>);

  // 根据标签筛选
  const getFilteredPersons = () => {
    if (activeTab === 'all') {
      return persons;
    }
    return groupedPersons[activeTab] || [];
  };

  // 统计数量
  const getPriorityCount = (priority: string) => {
    return groupedPersons[priority]?.length || 0;
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 顶部栏 */}
      <div className="bg-white border-b px-4 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-emerald-600" />
            <h1 className="text-xl font-semibold text-gray-900">人物档案</h1>
            <Badge variant="secondary" className="ml-2">
              {persons.length} 人
            </Badge>
          </div>
          <Button 
            onClick={() => {
              setEditingPerson(null);
              setShowForm(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            新建人物
          </Button>
        </div>
        
        {/* 搜索和筛选 */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索姓名..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            
            <Select 
              value={selectedCategory} 
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="全部分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部分类</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select 
              value={selectedPriority} 
              onValueChange={setSelectedPriority}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="全部优先级" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部优先级</SelectItem>
                {priorities.map((pri) => (
                  <SelectItem key={pri} value={pri}>{pri}</SelectItem>
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
                全部 ({persons.length})
              </TabsTrigger>
              {priorityOrder.map((priority) => (
                <TabsTrigger 
                  key={priority} 
                  value={priority}
                  className="data-[state=active]:bg-gray-100 data-[state=active]:shadow-none"
                >
                  <span className={`w-2 h-2 rounded-full ${priorityIconColors[priority]} mr-1.5`} />
                  {priority} ({getPriorityCount(priority)})
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              </div>
            ) : persons.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <AlertCircle className="h-12 w-12 mb-4 text-gray-300" />
                <p>暂无人物数据</p>
                <Button 
                  variant="link" 
                  className="mt-2 text-emerald-600"
                  onClick={() => setShowForm(true)}
                >
                  点击添加第一个人物
                </Button>
              </div>
            ) : activeTab !== 'all' ? (
              // 单一优先级视图
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getFilteredPersons().map((person) => (
                  <PersonCard 
                    key={person.id} 
                    person={person}
                    onClick={handleCardClick}
                  />
                ))}
              </div>
            ) : (
              // 全部视图 - 按优先级分组
              <div className="space-y-8">
                {priorityOrder.map((priority) => {
                  const group = groupedPersons[priority];
                  if (!group || group.length === 0) return null;
                  
                  return (
                    <div key={priority}>
                      <div className="flex items-center gap-2 mb-4">
                        <span className={`w-3 h-3 rounded-full ${priorityIconColors[priority]}`} />
                        <h3 className="font-medium text-gray-700">{priority}</h3>
                        <Badge variant="outline" className="text-gray-500">
                          {group.length}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {group.map((person) => (
                          <PersonCard 
                            key={person.id} 
                            person={person}
                            onClick={handleCardClick}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </Tabs>
      </div>
      
      {/* 人物表单弹窗 */}
      <PersonForm
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) setEditingPerson(null);
        }}
        onSubmit={editingPerson ? handleUpdate : handleCreate}
        initialData={editingPerson}
        isLoading={isSubmitting}
      />
      
      {/* 人物详情弹窗 */}
      <PersonDetail
        person={selectedPerson}
        open={showDetail}
        onOpenChange={(open) => {
          setShowDetail(open);
          if (!open) setSelectedPerson(null);
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
