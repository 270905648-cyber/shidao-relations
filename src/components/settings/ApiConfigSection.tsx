'use client';

import { useState, useEffect, useCallback } from 'react';
import { Server, Check, X, Loader2, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  getApiBaseUrl,
  setApiBaseUrl,
  clearApiConfig,
  checkApiConnection,
  isApiConfigured,
  getApiConfig,
} from '@/lib/api-config';

export function ApiConfigSection() {
  const { toast } = useToast();
  const [apiUrl, setApiUrlState] = useState('');
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // 加载已保存的配置 - 使用useEffect但延迟设置状态
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialized) {
      const savedUrl = getApiBaseUrl();
      const config = getApiConfig();
      
      // 使用微任务延迟设置状态，避免在effect中同步设置
      Promise.resolve().then(() => {
        setApiUrlState(savedUrl);
        if (config?.isConnected !== undefined) {
          setIsConnected(config.isConnected);
        }
        setIsInitialized(true);
      });
    }
  }, [isInitialized]);

  // 测试连接
  const handleTestConnection = useCallback(async () => {
    if (!apiUrl.trim()) {
      toast({
        title: '请输入API地址',
        variant: 'destructive',
      });
      return;
    }

    setIsChecking(true);
    
    // 先临时设置URL用于测试
    const originalUrl = getApiBaseUrl();
    setApiBaseUrl(apiUrl);
    
    const result = await checkApiConnection();
    
    if (result.success) {
      setIsConnected(true);
      toast({
        title: '连接成功',
        description: '后端API连接正常',
      });
    } else {
      setIsConnected(false);
      // 恢复原URL
      if (originalUrl) {
        setApiBaseUrl(originalUrl);
      } else {
        clearApiConfig();
      }
      toast({
        title: '连接失败',
        description: result.message,
        variant: 'destructive',
      });
    }
    
    setIsChecking(false);
  }, [apiUrl, toast]);

  // 保存配置
  const handleSave = useCallback(() => {
    if (!apiUrl.trim()) {
      toast({
        title: '请输入API地址',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    setApiBaseUrl(apiUrl);
    
    toast({
      title: '配置已保存',
      description: 'API地址已更新',
    });
    
    setIsSaving(false);
  }, [apiUrl, toast]);

  // 清除配置
  const handleClear = useCallback(() => {
    clearApiConfig();
    setApiUrlState('');
    setIsConnected(null);
    
    toast({
      title: '配置已清除',
      description: '将使用本地API',
    });
  }, [toast]);

  const configured = typeof window !== 'undefined' ? isApiConfigured() : false;

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Server className="h-5 w-5 text-blue-500" />
          后端API配置
          {configured ? (
            <Badge variant="outline" className="text-emerald-600 border-emerald-300 ml-2">
              已配置
            </Badge>
          ) : (
            <Badge variant="outline" className="text-amber-600 border-amber-300 ml-2">
              未配置
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          配置云端后端地址，APK版本必须配置此项才能正常使用
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiUrl">API地址</Label>
            <div className="flex gap-2">
              <Input
                id="apiUrl"
                type="text"
                placeholder="https://your-backend.vercel.app"
                value={apiUrl}
                onChange={(e) => setApiUrlState(e.target.value)}
                className="flex-1"
              />
              {isConnected !== null && (
                <div className="flex items-center">
                  {isConnected ? (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                      <Wifi className="h-3 w-3 mr-1" />
                      已连接
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <WifiOff className="h-3 w-3 mr-1" />
                      未连接
                    </Badge>
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400">
              输入部署后的后端地址，如 https://shidao-relations.vercel.app
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleTestConnection}
              disabled={isChecking || !apiUrl.trim()}
            >
              {isChecking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Wifi className="h-4 w-4" />
              )}
              测试连接
            </Button>
            
            <Button
              className="gap-2 bg-blue-600 hover:bg-blue-700"
              onClick={handleSave}
              disabled={isSaving || !apiUrl.trim()}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              保存配置
            </Button>
            
            {configured && (
              <Button
                variant="ghost"
                className="gap-2 text-gray-500"
                onClick={handleClear}
              >
                <X className="h-4 w-4" />
                清除配置
              </Button>
            )}
          </div>

          {/* 提示信息 */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-sm text-blue-700">
              <strong>使用说明：</strong>
            </p>
            <ul className="text-xs text-blue-600 mt-2 space-y-1 list-disc list-inside">
              <li>本地使用：无需配置，直接使用本地API</li>
              <li>APK使用：必须先部署后端到云端，然后配置此地址</li>
              <li>部署后端：推荐使用Vercel或Railway</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
