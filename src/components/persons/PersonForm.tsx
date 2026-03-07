'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
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
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { 
  ChevronDown, 
  ChevronUp, 
  User, 
  Calendar,
  Heart,
  AlertCircle,
  Users
} from 'lucide-react';
import { categories, priorities, type Person } from './PersonCard';

export interface PersonFormData {
  name: string;
  category: string;
  priority: string;
  subCategory?: string;
  circles?: string;
  energyCost?: number;
  passiveBurden?: number;
  influencePower?: number;
  usableScope?: string;
  coreDriver?: string;
  currentNeed?: string;
  riskLine?: string;
  birthday?: string;
  familyInfo?: string;
  contactFrequency?: number;
  intimacy?: number;
  attitude?: string;
  // 校外家长专用
  childName?: string;
  childGrade?: string;
  childStudyStatus?: string;
  parentType?: string;
  payAbility?: number;
  referralWillingness?: number;
  referralCount?: number;
  potentialReferrals?: string;
  // 贫困生专用
  familySituation?: string;
  aidRecords?: string;
  academicTracking?: string;
  mentalState?: string;
  futurePotential?: string;
  graduationDestination?: string;
  isActive?: boolean;
  wakeupCycle?: string;
  lastContactDate?: string;
}

interface PersonFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PersonFormData) => Promise<void>;
  initialData?: Person | null;
  isLoading?: boolean;
}

// 态度选项
const attitudeOptions = ['友善', '中立', '冷淡', '敌对'];

// 家长类型选项
const parentTypeOptions = ['高知家长', '普通家长', '焦虑型家长', '佛系家长'];

// 年级选项
const gradeOptions = ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级', '初一', '初二', '初三', '高一', '高二', '高三', '大学'];

export function PersonForm({ 
  open, 
  onOpenChange, 
  onSubmit, 
  initialData, 
  isLoading = false 
}: PersonFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [energyCost, setEnergyCost] = useState<number>(3);
  const [passiveBurden, setPassiveBurden] = useState<number>(3);
  const [intimacy, setIntimacy] = useState<number>(5);
  const [influencePower, setInfluencePower] = useState<number>(3);
  const [payAbility, setPayAbility] = useState<number>(3);
  const [referralWillingness, setReferralWillingness] = useState<number>(3);
  
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<PersonFormData>({
    defaultValues: {
      name: '',
      category: '',
      priority: '偶尔维护',
      isActive: true,
    }
  });

  // 监听分类变化
  const watchCategory = watch('category');

  useEffect(() => {
    setSelectedCategory(watchCategory || '');
  }, [watchCategory]);

  // 初始化编辑数据
  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        birthday: initialData.birthday ? new Date(initialData.birthday).toISOString().split('T')[0] : '',
        lastContactDate: initialData.lastContactDate ? new Date(initialData.lastContactDate).toISOString().split('T')[0] : '',
      });
      setSelectedCategory(initialData.category);
      if (initialData.energyCost) setEnergyCost(initialData.energyCost);
      if (initialData.passiveBurden) setPassiveBurden(initialData.passiveBurden);
      if (initialData.intimacy) setIntimacy(initialData.intimacy);
      if (initialData.influencePower) setInfluencePower(initialData.influencePower);
      if (initialData.payAbility) setPayAbility(initialData.payAbility || 3);
      if (initialData.referralWillingness) setReferralWillingness(initialData.referralWillingness || 3);
    } else {
      reset({
        name: '',
        category: '',
        priority: '偶尔维护',
        isActive: true,
      });
      setSelectedCategory('');
      setEnergyCost(3);
      setPassiveBurden(3);
      setIntimacy(5);
      setInfluencePower(3);
      setPayAbility(3);
      setReferralWillingness(3);
    }
  }, [initialData, reset]);

  const handleFormSubmit = async (data: PersonFormData) => {
    await onSubmit(data);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {initialData ? '编辑人物' : '新建人物'}
          </DialogTitle>
          <DialogDescription>
            填写人物信息，带 * 为必填项
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* 基本信息 */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <User className="h-4 w-4" />
              基本信息
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="required">
                  姓名/代号 <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="输入姓名或代号"
                  {...register('name', { required: '请输入姓名或代号' })}
                  className={errors.name ? 'border-rose-500' : ''}
                />
                {errors.name && (
                  <p className="text-xs text-rose-500">{errors.name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category" className="required">
                  关系分类 <span className="text-rose-500">*</span>
                </Label>
                <Select 
                  onValueChange={(value) => setValue('category', value)}
                  value={watch('category')}
                >
                  <SelectTrigger className={errors.category ? 'border-rose-500' : ''}>
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-xs text-rose-500">请选择关系分类</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">维护优先级</Label>
                <Select 
                  onValueChange={(value) => setValue('priority', value)}
                  defaultValue="偶尔维护"
                  value={watch('priority')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择优先级" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((pri) => (
                      <SelectItem key={pri} value={pri}>
                        <span className="flex items-center gap-2">
                          {pri === '核心维护' && <Badge className="bg-rose-100 text-rose-700">{pri}</Badge>}
                          {pri === '定期维护' && <Badge className="bg-amber-100 text-amber-700">{pri}</Badge>}
                          {pri === '偶尔维护' && <Badge className="bg-emerald-100 text-emerald-700">{pri}</Badge>}
                          {pri === '边界维护' && <Badge className="bg-gray-100 text-gray-600">{pri}</Badge>}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="attitude">对方态度</Label>
                <Select 
                  onValueChange={(value) => setValue('attitude', value)}
                  value={watch('attitude')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择态度" />
                  </SelectTrigger>
                  <SelectContent>
                    {attitudeOptions.map((att) => (
                      <SelectItem key={att} value={att}>{att}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthday">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  生日/纪念日
                </Label>
                <Input
                  id="birthday"
                  type="date"
                  {...register('birthday')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactFrequency">建议联系频率（天）</Label>
                <Input
                  id="contactFrequency"
                  type="number"
                  min={1}
                  placeholder="如：7 表示每周联系"
                  {...register('contactFrequency', { valueAsNumber: true })}
                />
              </div>
            </div>
          </div>
          
          {/* 校外家长专用字段 */}
          {selectedCategory === '校外家长' && (
            <div className="space-y-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="text-sm font-medium text-yellow-800 flex items-center gap-2">
                <Users className="h-4 w-4" />
                家长信息
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="childName">孩子姓名</Label>
                  <Input
                    id="childName"
                    placeholder="孩子姓名"
                    {...register('childName')}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="childGrade">孩子年级</Label>
                  <Select 
                    onValueChange={(value) => setValue('childGrade', value)}
                    value={watch('childGrade')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择年级" />
                    </SelectTrigger>
                    <SelectContent>
                      {gradeOptions.map((grade) => (
                        <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="childStudyStatus">孩子学习情况</Label>
                  <Textarea
                    id="childStudyStatus"
                    placeholder="描述孩子学习情况..."
                    {...register('childStudyStatus')}
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="parentType">家长类型</Label>
                  <Select 
                    onValueChange={(value) => setValue('parentType', value)}
                    value={watch('parentType')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择类型" />
                    </SelectTrigger>
                    <SelectContent>
                      {parentTypeOptions.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>付费能力 (1-5)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[payAbility]}
                      onValueChange={(value) => {
                        setPayAbility(value[0]);
                        setValue('payAbility', value[0]);
                      }}
                      min={1}
                      max={5}
                      step={1}
                      className="flex-1"
                    />
                    <span className="w-8 text-center font-medium">{payAbility}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>转介绍意愿 (1-5)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[referralWillingness]}
                      onValueChange={(value) => {
                        setReferralWillingness(value[0]);
                        setValue('referralWillingness', value[0]);
                      }}
                      min={1}
                      max={5}
                      step={1}
                      className="flex-1"
                    />
                    <span className="w-8 text-center font-medium">{referralWillingness}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="referralCount">已转介绍人数</Label>
                  <Input
                    id="referralCount"
                    type="number"
                    min={0}
                    {...register('referralCount', { valueAsNumber: true })}
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="potentialReferrals">潜在转介绍对象</Label>
                  <Textarea
                    id="potentialReferrals"
                    placeholder="记录潜在转介绍对象..."
                    {...register('potentialReferrals')}
                    rows={2}
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* 贫困生专用字段 */}
          {selectedCategory === '贫困生' && (
            <div className="space-y-4 p-4 bg-cyan-50 rounded-lg border border-cyan-200">
              <h4 className="text-sm font-medium text-cyan-800 flex items-center gap-2">
                <Heart className="h-4 w-4" />
                学生信息
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="familySituation">家庭情况</Label>
                  <Textarea
                    id="familySituation"
                    placeholder="描述家庭情况..."
                    {...register('familySituation')}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="aidRecords">资助记录</Label>
                  <Textarea
                    id="aidRecords"
                    placeholder="记录资助情况..."
                    {...register('aidRecords')}
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="academicTracking">学业跟踪</Label>
                  <Textarea
                    id="academicTracking"
                    placeholder="学业表现跟踪..."
                    {...register('academicTracking')}
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mentalState">心理状态</Label>
                  <Input
                    id="mentalState"
                    placeholder="心理状态评估"
                    {...register('mentalState')}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="futurePotential">未来潜力评估</Label>
                  <Input
                    id="futurePotential"
                    placeholder="潜力评估"
                    {...register('futurePotential')}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="graduationDestination">毕业去向</Label>
                  <Input
                    id="graduationDestination"
                    placeholder="毕业去向"
                    {...register('graduationDestination')}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="wakeupCycle">唤醒周期</Label>
                  <Input
                    id="wakeupCycle"
                    placeholder="如：教师节、考研季"
                    {...register('wakeupCycle')}
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* 八卦圈专用字段 */}
          {selectedCategory === '八卦圈' && (
            <div className="space-y-4 p-4 bg-pink-50 rounded-lg border border-pink-200">
              <h4 className="text-sm font-medium text-pink-800 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                舆论信息
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>舆论影响力 (1-5)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[influencePower]}
                      onValueChange={(value) => {
                        setInfluencePower(value[0]);
                        setValue('influencePower', value[0]);
                      }}
                      min={1}
                      max={5}
                      step={1}
                      className="flex-1"
                    />
                    <span className="w-8 text-center font-medium">{influencePower}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="usableScope">可利用范围</Label>
                  <Input
                    id="usableScope"
                    placeholder="如：教务信息、人事变动"
                    {...register('usableScope')}
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="coreDriver">核心驱动力</Label>
                  <Textarea
                    id="coreDriver"
                    placeholder="如：利益交换、情绪价值..."
                    {...register('coreDriver')}
                    rows={2}
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* 补充信息（可折叠） */}
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 w-full py-2">
              {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              补充信息
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>主动联系能量成本 (1-5)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[energyCost]}
                      onValueChange={(value) => {
                        setEnergyCost(value[0]);
                        setValue('energyCost', value[0]);
                      }}
                      min={1}
                      max={5}
                      step={1}
                      className="flex-1"
                    />
                    <span className="w-8 text-center font-medium">{energyCost}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>被动联系负担 (1-5)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[passiveBurden]}
                      onValueChange={(value) => {
                        setPassiveBurden(value[0]);
                        setValue('passiveBurden', value[0]);
                      }}
                      min={1}
                      max={5}
                      step={1}
                      className="flex-1"
                    />
                    <span className="w-8 text-center font-medium">{passiveBurden}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>关系亲密度 (1-10)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[intimacy]}
                      onValueChange={(value) => {
                        setIntimacy(value[0]);
                        setValue('intimacy', value[0]);
                      }}
                      min={1}
                      max={10}
                      step={1}
                      className="flex-1"
                    />
                    <span className="w-8 text-center font-medium">{intimacy}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subCategory">子分类</Label>
                  <Input
                    id="subCategory"
                    placeholder="更细致的分类"
                    {...register('subCategory')}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="circles">关联圈子</Label>
                  <Input
                    id="circles"
                    placeholder="如：教研组、校友会"
                    {...register('circles')}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastContactDate">最近联系日期</Label>
                  <Input
                    id="lastContactDate"
                    type="date"
                    {...register('lastContactDate')}
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="currentNeed">近期需求/软肋</Label>
                  <Textarea
                    id="currentNeed"
                    placeholder="对方近期的需求或痛点..."
                    {...register('currentNeed')}
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="riskLine">风险红线</Label>
                  <Textarea
                    id="riskLine"
                    placeholder="需要注意的风险点..."
                    {...register('riskLine')}
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="familyInfo">家庭背景</Label>
                  <Textarea
                    id="familyInfo"
                    placeholder="家庭情况、背景信息..."
                    {...register('familyInfo')}
                    rows={2}
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isLoading ? '保存中...' : initialData ? '保存修改' : '创建人物'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default PersonForm;
