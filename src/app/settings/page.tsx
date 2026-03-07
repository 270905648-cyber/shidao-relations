'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Settings,
  Battery,
  Database,
  Download,
  Trash2,
  AlertTriangle,
  Shield,
  Loader2,
  ArrowLeft,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ApiConfigSection } from '@/components/settings/ApiConfigSection';

interface UserSettings {
  id: string;
  weeklyBudget: number;
  dataRetentionDays: number;
  updatedAt: string;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [destroying, setDestroying] = useState(false);

  // 表单状态
  const [weeklyBudget, setWeeklyBudget] = useState(210);
  const [dataRetentionDays, setDataRetentionDays] = useState(365);

  // 获取设置
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings');
      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
        setWeeklyBudget(data.data.weeklyBudget);
        setDataRetentionDays(data.data.dataRetentionDays);
      }
    } catch (error) {
      console.error('获取设置失败:', error);
      toast({
        title: '获取设置失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // 保存设置
  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weeklyBudget,
          dataRetentionDays,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
        toast({
          title: '保存成功',
          description: '设置已更新',
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('保存设置失败:', error);
      toast({
        title: '保存失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // 导出数据
  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await fetch('/api/data/export');
      if (!response.ok) throw new Error('导出失败');

      // 获取文件名
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : `师道人际关系数据_${new Date().toISOString().split('T')[0]}.json`;

      // 下载文件
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: '导出成功',
        description: `数据已保存为 ${filename}`,
      });
    } catch (error) {
      console.error('导出数据失败:', error);
      toast({
        title: '导出失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  // 一键销毁
  const handleDestroy = async () => {
    try {
      setDestroying(true);
      const response = await fetch('/api/data/destroy', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: true }),
      });
      const data = await response.json();
      if (data.success) {
        toast({
          title: '数据已销毁',
          description: `已删除 ${data.deleted.persons} 个人物、${data.deleted.interactions} 条互动记录`,
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('销毁数据失败:', error);
      toast({
        title: '销毁失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setDestroying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* 页面标题 */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.history.back()}
            className="text-gray-500"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Settings className="h-6 w-6" />
              系统设置
            </h1>
            <p className="text-gray-500 text-sm mt-1">管理你的能量预算和数据安全</p>
          </div>
        </div>

        {/* 后端API配置 */}
        <ApiConfigSection />

        {/* 能量预算设置 */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Battery className="h-5 w-5 text-emerald-500" />
              能量预算设置
            </CardTitle>
            <CardDescription>
              设置每周用于社交的时间预算，系统会自动追踪你的能量消耗
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="weeklyBudget">周预算（分钟）</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="weeklyBudget"
                    type="number"
                    min={0}
                    value={weeklyBudget}
                    onChange={(e) => setWeeklyBudget(parseInt(e.target.value) || 0)}
                    className="w-32"
                  />
                  <span className="text-sm text-gray-500">
                    ≈ {(weeklyBudget / 60).toFixed(1)} 小时/周
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  默认 210 分钟（3.5 小时），建议根据个人精力调整
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 数据管理 */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="h-5 w-5 text-amber-500" />
              数据管理
            </CardTitle>
            <CardDescription>管理你的数据保留策略和备份</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dataRetentionDays">数据保留天数</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="dataRetentionDays"
                  type="number"
                  min={1}
                  value={dataRetentionDays}
                  onChange={(e) => setDataRetentionDays(parseInt(e.target.value) || 1)}
                  className="w-32"
                />
                <span className="text-sm text-gray-500">天</span>
              </div>
              <p className="text-xs text-gray-400">
                默认 365 天，超过此天数的数据将被自动清理
              </p>
            </div>

            {/* 操作按钮 */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleExport}
                disabled={exporting}
              >
                {exporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                导出数据
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    一键销毁
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-5 w-5" />
                      确认销毁所有数据？
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                      <p className="font-medium text-red-600">
                        ⚠️ 警告：此操作不可恢复！
                      </p>
                      <p>将会删除以下所有数据：</p>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>所有人物档案</li>
                        <li>所有互动记录</li>
                        <li>所有关系网络</li>
                        <li>所有困惑事件</li>
                        <li>所有策略库内容</li>
                      </ul>
                      <p className="text-sm mt-2">
                        建议在销毁前先导出数据备份。
                      </p>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDestroy}
                      disabled={destroying}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {destroying ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          销毁中...
                        </>
                      ) : (
                        '确认销毁'
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {/* 警告提示 */}
            <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-100">
              <p className="text-sm text-red-700 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  一键销毁将删除所有数据，此操作不可恢复！建议定期导出备份。
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 合规提醒 */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-500" />
              合规提醒
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                系统会自动检测以下敏感信息并提醒：
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-amber-600 border-amber-300">
                  补课相关
                </Badge>
                <Badge variant="outline" className="text-amber-600 border-amber-300">
                  有偿家教
                </Badge>
                <Badge variant="outline" className="text-amber-600 border-amber-300">
                  身份证号
                </Badge>
                <Badge variant="outline" className="text-amber-600 border-amber-300">
                  家庭住址
                </Badge>
                <Badge variant="outline" className="text-amber-600 border-amber-300">
                  电话号码
                </Badge>
                <Badge variant="outline" className="text-amber-600 border-amber-300">
                  银行卡号
                </Badge>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                请避免记录敏感个人信息，保护隐私安全
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 保存按钮 */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => window.history.back()}>
            取消
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            保存设置
          </Button>
        </div>
      </div>
    </div>
  );
}
