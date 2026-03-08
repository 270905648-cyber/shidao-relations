'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Battery,
  ClipboardList,
  Lightbulb,
  Mic,
  PenLine,
  ChevronDown,
  ChevronUp,
  Gift,
  Clock,
  Phone,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Loader2,
  ArrowLeft,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { getApiUrl, isApiConfigured } from '@/lib/api-config'

// 类型定义
interface EnergyData {
  usedMinutes: number
  weeklyBudget: number
  usagePercent: number
  isOverBudget: boolean
  topConsumers: Array<{
    id: string
    name: string
    category: string
    totalMinutes: number
  }>
  weekStart: string
  weekEnd: string
}

interface TodoItem {
  id: string
  type: 'birthday' | 'overdue_contact' | 'referral'
  title: string
  description: string
  personId: string
  personName: string
  priority: number
  metadata?: Record<string, unknown>
}

interface TodosData {
  todos: TodoItem[]
  total: number
  returned: number
}

interface Suggestion {
  id: string
  type: 'upgrade' | 'downgrade' | 'overdue_important'
  title: string
  description: string
  personId: string
  personName: string
  currentPriority: string
  suggestedPriority?: string
  reason: string
  metadata?: Record<string, unknown>
}

interface SuggestionsData {
  suggestions: Suggestion[]
  total: number
  byType: {
    upgrade: number
    downgrade: number
    overdue_important: number
  }
}

export default function Dashboard() {
  const [energyData, setEnergyData] = useState<EnergyData | null>(null)
  const [todosData, setTodosData] = useState<TodosData | null>(null)
  const [suggestionsData, setSuggestionsData] = useState<SuggestionsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 弹窗状态
  const [quickRecordOpen, setQuickRecordOpen] = useState(false)
  const [selectedTodo, setSelectedTodo] = useState<TodoItem | null>(null)
  const [recordContent, setRecordContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  // 展开/收起状态
  const [todosExpanded, setTodosExpanded] = useState(false)

  // 获取数据
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // 检查是否配置了后端
      if (!isApiConfigured()) {
        setError('请先在首页配置后端API地址')
        setLoading(false)
        return
      }

      const [energyRes, todosRes, suggestionsRes] = await Promise.all([
        fetch(getApiUrl('/api/dashboard/energy')),
        fetch(getApiUrl('/api/dashboard/todos')),
        fetch(getApiUrl('/api/dashboard/suggestions')),
      ])

      if (!energyRes.ok || !todosRes.ok || !suggestionsRes.ok) {
        throw new Error('无法连接到后端服务')
      }

      const energy = await energyRes.json()
      const todos = await todosRes.json()
      const suggestions = await suggestionsRes.json()

      if (energy.success) setEnergyData(energy.data)
      if (todos.success) setTodosData(todos.data)
      if (suggestions.success) setSuggestionsData(suggestions.data)
    } catch (err) {
      console.error('获取数据失败:', err)
      setError(err instanceof Error ? err.message : '获取数据失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // 获取进度条颜色
  const getProgressColor = (percent: number) => {
    if (percent >= 100) return 'bg-red-500'
    if (percent >= 80) return 'bg-amber-500'
    return 'bg-emerald-500'
  }

  // 获取待办图标
  const getTodoIcon = (type: string) => {
    switch (type) {
      case 'birthday':
        return <Gift className="h-4 w-4 text-pink-500" />
      case 'overdue_contact':
        return <Clock className="h-4 w-4 text-amber-500" />
      case 'referral':
        return <Phone className="h-4 w-4 text-emerald-500" />
      default:
        return <ClipboardList className="h-4 w-4" />
    }
  }

  // 获取建议图标
  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'upgrade':
        return <TrendingUp className="h-4 w-4 text-emerald-500" />
      case 'downgrade':
        return <TrendingDown className="h-4 w-4 text-amber-500" />
      case 'overdue_important':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Lightbulb className="h-4 w-4" />
    }
  }

  // 快速记录
  const handleQuickRecord = (todo: TodoItem) => {
    setSelectedTodo(todo)
    setRecordContent('')
    setQuickRecordOpen(true)
  }

  // 提交快速记录
  const handleSubmitQuickRecord = async () => {
    if (!selectedTodo || !recordContent.trim()) return

    setSubmitting(true)
    try {
      const res = await fetch(getApiUrl('/api/interactions'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personId: selectedTodo.personId,
          type: '单独谈话',
          initiative: '主动',
          nature: '非必需社交',
          note: recordContent,
          date: new Date().toISOString(),
        }),
      })

      const data = await res.json()
      if (data.success) {
        setQuickRecordOpen(false)
        setRecordContent('')
        setSelectedTodo(null)
        fetchData()
      } else {
        alert('提交失败: ' + (data.error || '未知错误'))
      }
    } catch (error) {
      console.error('提交记录失败:', error)
      alert('提交记录失败')
    } finally {
      setSubmitting(false)
    }
  }

  // 处理建议确认
  const handleConfirmSuggestion = async (suggestion: Suggestion) => {
    try {
      const res = await fetch(getApiUrl(`/api/persons/${suggestion.personId}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priority: suggestion.suggestedPriority,
        }),
      })

      if (res.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('确认建议失败:', error)
    }
  }

  // 忽略建议
  const handleIgnoreSuggestion = (suggestionId: string) => {
    if (!suggestionsData) return
    const newSuggestions = suggestionsData.suggestions.filter(s => s.id !== suggestionId)
    setSuggestionsData({
      ...suggestionsData,
      suggestions: newSuggestions,
      total: newSuggestions.length,
    })
  }

  // 错误状态
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">无法加载数据</h2>
        <p className="text-gray-500 text-center mb-4">{error}</p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push('/')}>
            返回配置
          </Button>
          <Button onClick={fetchData}>
            重试
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 头部 */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/')}
            className="text-gray-500"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">能量驾驶舱</h1>
          <Users className="h-5 w-5 text-gray-500 ml-auto" />
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-4 space-y-4">
        {/* 能量预算区域 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Battery className="h-5 w-5 text-emerald-500" />
              本周能量预算
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {energyData && (
              <>
                <div className="space-y-2">
                  <Progress
                    value={Math.min(energyData.usagePercent, 100)}
                    className="h-3"
                  />
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">
                      {energyData.usedMinutes}/{energyData.weeklyBudget} 分钟
                    </span>
                    <Badge
                      variant="outline"
                      className={`${energyData.usagePercent >= 100 ? 'text-red-600 border-red-300' : energyData.usagePercent >= 80 ? 'text-amber-600 border-amber-300' : 'text-emerald-600 border-emerald-300'}`}
                    >
                      {energyData.usagePercent}%
                    </Badge>
                  </div>
                </div>

                <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${getProgressColor(energyData.usagePercent)}`}
                    style={{ width: `${Math.min(energyData.usagePercent, 100)}%` }}
                  />
                </div>

                {energyData.isOverBudget && energyData.topConsumers.length > 0 && (
                  <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-100">
                    <p className="text-sm text-red-700 font-medium mb-2">
                      能量消耗 TOP 人物：
                    </p>
                    <div className="space-y-1">
                      {energyData.topConsumers.slice(0, 3).map((consumer, index) => (
                        <div key={consumer.id} className="flex justify-between text-sm">
                          <span className="text-gray-700">
                            {index + 1}. {consumer.name}
                          </span>
                          <span className="text-red-600 font-medium">
                            {consumer.totalMinutes}分钟
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* 今日待办区域 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="h-5 w-5 text-amber-500" />
              今日待办
              {todosData && todosData.total > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {todosData.total}项
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todosData && todosData.todos.length > 0 ? (
              <div className="space-y-3">
                {todosData.todos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="mt-0.5">{getTodoIcon(todo.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {todo.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {todo.description}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuickRecord(todo)}
                      className="shrink-0 text-xs h-7"
                    >
                      快速记录
                    </Button>
                  </div>
                ))}

                {todosData.total > 3 && (
                  <Collapsible open={todosExpanded} onOpenChange={setTodosExpanded}>
                    <CollapsibleContent>
                    </CollapsibleContent>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-gray-500 text-xs"
                      >
                        {todosExpanded ? (
                          <>
                            收起 <ChevronUp className="h-3 w-3 ml-1" />
                          </>
                        ) : (
                          <>
                            还有 {todosData.total - 3} 项其他提醒{' '}
                            <ChevronDown className="h-3 w-3 ml-1" />
                          </>
                        )}
                      </Button>
                    </CollapsibleTrigger>
                  </Collapsible>
                )}
              </div>
            ) : (
              <div className="py-6 text-center text-gray-400 text-sm">
                今日暂无待办事项
              </div>
            )}
          </CardContent>
        </Card>

        {/* 动态调整建议区域 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              动态调整建议
              {suggestionsData && suggestionsData.total > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {suggestionsData.total}条
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {suggestionsData && suggestionsData.suggestions.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {suggestionsData.suggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-100"
                  >
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5">{getSuggestionIcon(suggestion.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {suggestion.personName}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {suggestion.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          原因：{suggestion.reason}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleIgnoreSuggestion(suggestion.id)}
                        className="text-xs h-7"
                      >
                        忽略
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleConfirmSuggestion(suggestion)}
                        className="text-xs h-7 bg-emerald-600 hover:bg-emerald-700"
                      >
                        确认
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-gray-400 text-sm">
                暂无调整建议
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* 底部浮动按钮 */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t py-3 px-4 z-40">
        <div className="max-w-md mx-auto flex gap-3">
          <Button
            variant="outline"
            className="flex-1 gap-2 h-11"
            onClick={() => router.push('/interactions')}
          >
            <Mic className="h-4 w-4" />
            语音秒记
          </Button>
          <Button
            className="flex-1 gap-2 h-11 bg-emerald-600 hover:bg-emerald-700"
            onClick={() => router.push('/interactions')}
          >
            <PenLine className="h-4 w-4" />
            手动记录
          </Button>
        </div>
      </footer>

      {/* 快速记录弹窗 */}
      <Dialog open={quickRecordOpen} onOpenChange={setQuickRecordOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>快速记录</DialogTitle>
            <DialogDescription>
              记录与 {selectedTodo?.personName} 的互动
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="记录互动内容..."
              value={recordContent}
              onChange={(e) => setRecordContent(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuickRecordOpen(false)}>
              取消
            </Button>
            <Button
              onClick={handleSubmitQuickRecord}
              disabled={!recordContent.trim() || submitting}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                '提交'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
