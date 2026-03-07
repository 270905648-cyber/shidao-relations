#!/bin/bash

# ========================================
# 师道·人际关系智库 - GitHub上传并构建APK
# ========================================

set -e

echo "======================================"
echo "  师道·人际关系智库 - APK自动构建"
echo "======================================"
echo ""

# 配置
GITHUB_USER="270905648-cyber"
REPO_NAME="shidao-relations"
REPO_URL="https://github.com/${GITHUB_USER}/${REPO_NAME}.git"

echo "📌 GitHub用户: $GITHUB_USER"
echo "📌 仓库名称: $REPO_NAME"
echo ""

# 检查是否已经在项目目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

# 检查git状态
echo "📋 检查Git状态..."
if [ -z "$(git status --porcelain)" ]; then
    echo "✅ 代码已提交"
else
    echo "📦 提交未推送的更改..."
    git add .
    git commit -m "update: 更新代码"
fi

# 设置远程仓库
echo ""
echo "🔗 配置远程仓库..."
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_URL"

# 推送代码
echo ""
echo "📤 推送代码到GitHub..."
echo "   (如果提示输入密码，请使用GitHub Personal Access Token)"
echo ""

git branch -M main
git push -u origin main --force

echo ""
echo "✅ 代码已推送到GitHub!"
echo ""
echo "======================================"
echo "  下一步：构建APK"
echo "======================================"
echo ""
echo "请按以下步骤操作："
echo ""
echo "1. 打开浏览器访问："
echo "   https://github.com/${GITHUB_USER}/${REPO_NAME}/actions"
echo ""
echo "2. 点击左侧 'Build Android APK'"
echo ""
echo "3. 点击右侧 'Run workflow' 按钮"
echo ""
echo "4. 输入版本号（如 1.0.0）并点击绿色按钮"
echo ""
echo "5. 等待约5-10分钟后刷新页面"
echo ""
echo "6. 构建完成后，在页面底部 Artifacts 区域下载 shidao-apk"
echo ""
echo "======================================"
