/**
 * API配置管理 - 运行时配置后端地址
 * 
 * 用户安装APK后，可以在设置页面配置后端API地址
 * 配置存储在localStorage中
 */

const API_URL_KEY = 'shidao_api_url';
const API_CONFIG_KEY = 'shidao_api_config';

export interface ApiConfig {
  baseUrl: string;
  lastChecked?: string;
  isConnected?: boolean;
}

/**
 * 获取API基础URL
 */
export function getApiBaseUrl(): string {
  if (typeof window === 'undefined') return '';
  
  // 优先从localStorage读取用户配置
  const savedUrl = localStorage.getItem(API_URL_KEY);
  if (savedUrl) {
    // 移除末尾斜杠
    return savedUrl.endsWith('/') ? savedUrl.slice(0, -1) : savedUrl;
  }
  
  // 如果没有配置，返回空（需要用户配置）
  return '';
}

/**
 * 设置API基础URL
 */
export function setApiBaseUrl(url: string): void {
  if (typeof window === 'undefined') return;
  
  // 标准化URL
  let normalizedUrl = url.trim();
  if (normalizedUrl && !normalizedUrl.startsWith('http')) {
    normalizedUrl = 'https://' + normalizedUrl;
  }
  if (normalizedUrl.endsWith('/')) {
    normalizedUrl = normalizedUrl.slice(0, -1);
  }
  
  localStorage.setItem(API_URL_KEY, normalizedUrl);
  
  // 更新配置状态
  const config: ApiConfig = {
    baseUrl: normalizedUrl,
    lastChecked: new Date().toISOString(),
  };
  localStorage.setItem(API_CONFIG_KEY, JSON.stringify(config));
}

/**
 * 获取完整API URL
 */
export function getApiUrl(path: string): string {
  const baseUrl = getApiBaseUrl();
  
  // 如果没有配置后端地址，返回本地API路径
  if (!baseUrl) {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return normalizedPath;
  }
  
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

/**
 * 清除API配置
 */
export function clearApiConfig(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(API_URL_KEY);
  localStorage.removeItem(API_CONFIG_KEY);
}

/**
 * 获取API配置信息
 */
export function getApiConfig(): ApiConfig | null {
  if (typeof window === 'undefined') return null;
  
  const configStr = localStorage.getItem(API_CONFIG_KEY);
  if (!configStr) return null;
  
  try {
    return JSON.parse(configStr);
  } catch {
    return null;
  }
}

/**
 * 检查API连接状态
 */
export async function checkApiConnection(): Promise<{ success: boolean; message: string }> {
  const baseUrl = getApiBaseUrl();
  
  if (!baseUrl) {
    return {
      success: false,
      message: '请先配置后端API地址',
    };
  }
  
  try {
    const response = await fetch(`${baseUrl}/api/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (response.ok) {
      // 更新连接状态
      const config = getApiConfig();
      if (config) {
        config.isConnected = true;
        config.lastChecked = new Date().toISOString();
        localStorage.setItem(API_CONFIG_KEY, JSON.stringify(config));
      }
      
      return {
        success: true,
        message: '连接成功',
      };
    } else {
      return {
        success: false,
        message: `连接失败: HTTP ${response.status}`,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `连接失败: ${error instanceof Error ? error.message : '网络错误'}`,
    };
  }
}

/**
 * 检查是否已配置API
 */
export function isApiConfigured(): boolean {
  return !!getApiBaseUrl();
}
