# 师道·人际关系智库 V5.0 - APK部署指南

## 📋 目录

1. [架构说明](#架构说明)
2. [快速构建](#快速构建)
3. [后端部署](#后端部署)
4. [APK配置](#apk配置)
5. [签名配置](#签名配置)
6. [常见问题](#常见问题)

---

## 架构说明

### 混合架构

本项目采用**前后端分离**架构：

```
┌─────────────────┐         ┌─────────────────┐
│   APK前端       │  HTTP   │   云端后端      │
│  (Capacitor)    │ ──────> │   (Vercel)      │
│                 │         │                 │
│  - React页面    │         │  - API Routes   │
│  - UI组件       │         │  - 数据库       │
│  - 动态配置     │         │  - AI服务       │
└─────────────────┘         └─────────────────┘
```

### 关键特性

- ✅ **动态配置**: 用户安装后自行配置后端地址，无需构建时预设
- ✅ **连接检测**: 内置连接测试功能，实时显示连接状态
- ✅ **灵活部署**: 支持公共后端或自建后端

---

## 快速构建

### GitHub Actions自动构建（推荐）

**第一步：上传代码**
```bash
git init && git add . && git commit -m "初始化项目"
git remote add origin https://github.com/你的用户名/shidao-relations.git
git push -u origin main
```

**第二步：触发构建**
- 进入 Actions → "Build Android APK" → Run workflow
- 或发布Tag：`git tag v1.0.0 && git push origin v1.0.0`

**第三步：下载APK**
- Artifacts 或 Releases 页面

### 本地构建

```bash
# 安装Java 17+ 和 Android SDK
chmod +x scripts/build-apk-local.sh
./scripts/build-apk-local.sh
```

---

## 后端部署

### 方式一：Vercel（推荐）

```bash
# 1. Fork本项目

# 2. 安装Vercel CLI
npm i -g vercel

# 3. 部署
vercel login
vercel --prod

# 4. 获取URL：https://shidao-relations-xxx.vercel.app
```

### 方式二：Railway

```bash
# 1. 安装CLI
npm i -g @railway/cli

# 2. 部署
railway login
railway init
railway up

# 3. 配置环境变量（如需要）
railway variables set DATABASE_URL="file:./data.db"
```

### 方式三：自托管服务器

需要Node.js环境：

```bash
# 1. 克隆项目
git clone https://github.com/你的用户名/shidao-relations.git
cd shidao-relations

# 2. 安装依赖
bun install

# 3. 初始化数据库
bun run db:push
bun run db:generate

# 4. 构建
bun run build

# 5. 启动（使用PM2）
pm2 start bun --name "shidao" -- run start
```

---

## APK配置

### 首次使用

APK安装后，首次打开需要配置后端地址：

1. 进入**设置**页面
2. 找到**后端API配置**部分
3. 输入后端URL
4. 点击**测试连接**验证
5. 点击**保存配置**

### 配置界面说明

| 状态 | 说明 |
|------|------|
| 🟢 已连接 | 后端连接正常，可以使用 |
| 🔴 未连接 | 后端不可达，请检查URL |
| ⚪ 未配置 | 尚未配置后端地址 |

### 本地开发模式

如果在浏览器中访问（非APK），无需配置后端，直接使用本地API。

---

## 签名配置

### 生成签名密钥

```bash
keytool -genkeypair \
  -alias shidao-relations \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -keystore release-keystore.jks \
  -storetype PKCS12
```

### 配置GitHub Secrets

| Secret | 说明 |
|--------|------|
| `KEYSTORE_BASE64` | `base64 -w 0 release-keystore.jks` |
| `KEYSTORE_PASSWORD` | Keystore密码 |
| `KEY_ALIAS` | Key别名 |
| `KEY_PASSWORD` | Key密码 |

---

## 常见问题

### Q1: APK安装后显示"未配置"？

**正常现象**，首次使用需要在设置中配置后端地址。

### Q2: 连接测试失败？

检查以下几点：
1. URL是否正确（包含 https://）
2. 后端是否已部署成功
3. 网络是否可访问后端地址

### Q3: 数据存储在哪里？

- **本地模式**: 存储在浏览器/服务器本地数据库
- **云端模式**: 存储在云端后端数据库

### Q4: 如何更新APK？

重新下载安装即可。注意：更新后需要重新配置后端地址。

### Q5: 能否离线使用？

APK版本需要网络连接后端。如需离线使用，请直接在浏览器中访问部署后的网址。

---

## 技术支持

如遇问题，请提供：
- APK版本
- 后端部署方式
- 连接测试结果截图
- 错误信息
