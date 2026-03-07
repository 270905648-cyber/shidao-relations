# 师道·人际关系智库 V5.0

> 高中数学老师的人际关系管理工具 - 通过最小投入获取最大关系回报

## 🎯 项目简介

这是一个专为高中数学老师（兼资助中心主任）设计的人际关系管理工具，帮助用户科学管理复杂的人际关系网络，实现"最小投入，最大回报"的目标。

### 核心功能

- **📊 能量驾驶舱** - 可视化社交能量消耗，智能提醒待办事项
- **👥 人物档案** - 分类管理各类人际关系，支持自定义字段
- **📝 互动记录** - 快速记录社交互动，支持语音秒记
- **🤔 困惑事件** - 记录和追踪人际困惑，辅助决策
- **📖 策略库** - 预设智慧策略，支持自定义扩展
- **🔒 数据安全** - 本地数据库存储，支持导出备份

## 🛠️ 技术栈

| 类型 | 技术 |
|------|------|
| 框架 | Next.js 16 + React 19 |
| 语言 | TypeScript 5 |
| 样式 | Tailwind CSS 4 + shadcn/ui |
| 数据库 | Prisma ORM + SQLite |
| 语音识别 | z-ai-web-dev-sdk (ASR) |
| 状态管理 | Zustand + TanStack Query |

## 🚀 快速开始

### 安装依赖

```bash
bun install
```

### 初始化数据库

```bash
bun run db:push
bun run db:generate
```

### 启动开发服务器

```bash
bun run dev
```

访问 http://localhost:3000 查看应用。

## 📱 APK构建指南

### 方式一：GitHub Actions自动构建（推荐）

1. **上传代码到GitHub**
```bash
git init && git add . && git commit -m "Initial commit"
git remote add origin https://github.com/你的用户名/shidao-relations.git
git push -u origin main
```

2. **触发构建**
   - 手动触发：Actions → "Build Android APK" → Run workflow
   - 或发布Tag：`git tag v1.0.0 && git push origin v1.0.0`

3. **下载APK**
   - 手动触发：Actions → 运行记录 → Artifacts
   - Tag触发：Releases 页面

### 方式二：本地构建

```bash
# 安装Java 17+ 和 Android SDK
chmod +x scripts/build-apk-local.sh
./scripts/build-apk-local.sh
```

### ⚙️ APK首次使用配置

**重要**: APK安装后需要配置后端API地址才能使用！

1. 打开应用 → 设置
2. 找到"后端API配置"
3. 输入后端URL（如 https://your-app.vercel.app）
4. 测试连接 → 保存配置

### 🚀 后端部署

**Vercel（推荐）:**
```bash
npm i -g vercel
vercel --prod
# 获取URL后配置到APK设置中
```

**详细文档**: [docs/QUICK_START.md](docs/QUICK_START.md)

## 📚 详细文档

- [APK部署完整指南](docs/APK_DEPLOYMENT.md)
- [快速开始指南](docs/QUICK_START.md)

## 📁 项目结构

```
src/
├── app/                    # Next.js页面
│   ├── page.tsx           # 能量驾驶舱
│   ├── persons/           # 人物档案
│   ├── interactions/      # 互动记录
│   ├── confusion/         # 困惑事件
│   ├── strategies/        # 策略库
│   ├── settings/          # 系统设置
│   └── api/               # API路由
├── components/            # React组件
│   ├── ui/               # shadcn/ui组件
│   ├── layout/           # 布局组件
│   └── ...               # 功能组件
├── lib/                  # 工具函数
└── hooks/                # 自定义Hooks
```

## 🔐 数据安全

- 所有数据存储在本地SQLite数据库
- 支持一键导出JSON备份
- 可设置主密码加密保护
- 敏感词自动检测

## 📝 更新日志

### V5.0 (当前版本)
- ✨ 全新UI设计，移动端优先
- ✨ 语音秒记功能
- ✨ 能量驾驶舱可视化
- ✨ GitHub Actions自动构建APK
- ✨ 支持云端部署

## 🤝 技术支持

如遇问题，请提供：
- 错误截图或日志
- 操作步骤描述
- 设备和系统信息

---

**⚠️ 重要提示**: APK版本需要配合云端后端使用，请确保已部署后端并配置API地址。
