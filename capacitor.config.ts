import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.shidao.relations',
  appName: '师道·人际关系智库',
  webDir: 'out',
  server: {
    // 如果使用云端后端，配置API地址
    // url: 'https://your-backend-url.com',
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a1a2e',
      showSpinner: false,
    },
    Keyboard: {
      resize: 'body'
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  }
};

export default config;
