# 快速开始：GitHub构建APK

## 🚀 两步完成APK构建

### 第一步：上传代码到GitHub

```bash
# 初始化Git仓库
git init
git add .
git commit -m "初始化项目"

# 连接到GitHub仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/shidao-relations.git
git branch -M main
git push -u origin main
```

### 第二步：触发构建

**方式A：手动触发**
1. 进入 **Actions** 标签页
2. 选择 **"Build Android APK"**
3. 点击 **"Run workflow"**
4. 输入版本号（如 `1.0.0`）

**方式B：发布Tag**
```bash
git tag v1.0.0
git push origin v1.0.0
```

### 第三步：下载APK

- 手动触发：**Actions** → 对应运行记录 → **Artifacts**
- Tag触发：**Releases** 页面

---

## 📱 首次使用配置

APK安装后，需要配置后端API地址：

1. 打开应用，进入**设置**页面
2. 找到**后端API配置**部分
3. 输入后端地址
4. 点击**测试连接**确认可用
5. 点击**保存配置**

---

## 🔧 后端部署方式

### 方式一：使用公共后端

如果项目提供了公共API地址，直接在APK设置中配置即可。

### 方式二：自建后端（推荐）

**部署到Vercel：**

```bash
# 1. Fork本项目到你的GitHub

# 2. 安装Vercel CLI
npm i -g vercel

# 3. 登录
vercel login

# 4. 克隆你Fork的项目
git clone https://github.com/你的用户名/shidao-relations.git
cd shidao-relations

# 5. 部署
vercel --prod

# 6. 部署成功后会得到一个URL，如：
# https://shidao-relations-xxx.vercel.app
```

**将这个URL配置到APK设置中即可使用！**

### 方式三：Railway部署

```bash
# 1. 安装Railway CLI
npm i -g @railway/cli

# 2. 登录并部署
railway login
railway init
railway up

# 3. 获取部署URL并配置到APK
```

---

## 🔑 签名密钥（可选）

如果需要发布版APK，可以配置签名密钥：

### 生成密钥

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

进入 Settings → Secrets → Actions：

| Secret | 说明 |
|--------|------|
| `KEYSTORE_BASE64` | 签名密钥的Base64编码 |
| `KEYSTORE_PASSWORD` | Keystore密码 |
| `KEY_ALIAS` | Key别名（默认：shidao-relations） |
| `KEY_PASSWORD` | Key密码 |

**生成Base64编码：**
```bash
base64 -w 0 release-keystore.jks
```

---

## ⚠️ 注意事项

1. **无需预配置API地址** - 用户在APK中自行配置
2. **数据持久化** - Vercel的文件系统是临时的，建议使用外部数据库
3. **签名密钥** - 请妥善保管，丢失后无法更新应用
4. **版本更新** - 重新安装APK后需要重新配置后端地址

---

## 📚 详细文档

- [完整部署指南](APK_DEPLOYMENT.md)
- [项目README](../README.md)
