'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Settings, Loader2, Wifi, WifiOff, Server } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  getApiBaseUrl,
  setApiBaseUrl,
  checkApiConnection,
  isApiConfigured,
  getApiConfig,
} from '@/lib/api-config'

export default function HomePage() {
  const router = useRouter()
  const [apiUrl, setApiUrlState] = useState('')
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // 初始化检查
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUrl = getApiBaseUrl()
      setApiUrlState(savedUrl)
      
      const config = getApiConfig()
      if (config?.isConnected !== undefined) {
        setIsConnected(config.isConnected)
      }
      
      // 如果已配置且已连接，直接跳转到仪表盘
      if (savedUrl && config?.isConnected) {
        router.push('/dashboard')
        return
      }
      
      setIsLoading(false)
    }
  }, [router])

  // 测试连接
  const handleTestConnection = async () => {
    if (!apiUrl.trim()) return
    
    setIsChecking(true)
    setApiBaseUrl(apiUrl)
    
    const result = await checkApiConnection()
    setIsConnected(result.success)
    setIsChecking(false)
  }

  // 保存并进入
  const handleSaveAndEnter = () => {
    if (!apiUrl.trim()) return
    
    setApiBaseUrl(apiUrl)
    router.push('/dashboard')
  }

  // 跳过配置，离线使用
  const handleSkip = () => {
    router.push('/dashboard')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      <div className="max-w-md mx-auto pt-12">
        {/* Logo和标题 */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
            <Server className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">师道·人际关系智库</h1>
          <p className="text-slate-400 mt-2">V5.0</p>
        </div>

        {/* 配置卡片 */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="h-5 w-5 text-emerald-400" />
              后端配置
              {isApiConfigured() && (
                <Badge variant="outline" className="text-emerald-400 border-emerald-500 ml-2">
                  已配置
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-slate-400">
              配置后端API地址以使用完整功能
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiUrl" className="text-slate-300">API地址</Label>
              <div className="flex gap-2">
                <Input
                  id="apiUrl"
                  type="text"
                  placeholder="https://your-backend.vercel.app"
                  value={apiUrl}
                  onChange={(e) => setApiUrlState(e.target.value)}
                  className="flex-1 bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
                />
                {isConnected !== null && (
                  <div className="flex items-center">
                    {isConnected ? (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500">
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
            </div>

            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                onClick={handleTestConnection}
                disabled={isChecking || !apiUrl.trim()}
              >
                {isChecking ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Wifi className="h-4 w-4 mr-2" />
                )}
                测试连接
              </Button>
              
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                onClick={handleSaveAndEnter}
                disabled={!apiUrl.trim()}
              >
                保存并进入
              </Button>
              
              <Button
                variant="ghost"
                className="w-full text-slate-400 hover:text-slate-300"
                onClick={handleSkip}
              >
                稍后配置
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 说明 */}
        <div className="mt-6 p-4 bg-slate-800/30 rounded-lg border border-slate-700">
          <p className="text-sm text-slate-400">
            <strong className="text-slate-300">使用说明：</strong>
          </p>
          <ul className="text-xs text-slate-500 mt-2 space-y-1 list-disc list-inside">
            <li>请先部署后端到 Vercel 或 Railway</li>
            <li>获取后端URL后在此配置</li>
            <li>如：https://your-app.vercel.app</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
