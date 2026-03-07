#!/bin/bash

# ========================================
# 师道·人际关系智库 - APK本地构建脚本
# ========================================

set -e

echo "🚀 开始构建APK..."

# 检查环境
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ 错误: 未找到 $1，请先安装"
        exit 1
    fi
}

echo "📋 检查构建环境..."
check_command node
check_command bun
check_command java

# 检查Java版本
JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | cut -d'.' -f1)
if [ "$JAVA_VERSION" -lt 17 ]; then
    echo "❌ 错误: 需要Java 17或更高版本，当前版本: $JAVA_VERSION"
    exit 1
fi

echo "✅ 环境检查通过"

# 安装依赖
echo "📦 安装依赖..."
bun install

# 安装Capacitor
echo "📦 安装Capacitor..."
if ! bun list @capacitor/core &> /dev/null; then
    bun add -D @capacitor/core @capacitor/cli @capacitor/android
fi

# 构建静态导出
echo "🏗️ 构建静态导出..."
bun run build:static

# 初始化Capacitor（如果还没初始化）
if [ ! -d "android" ]; then
    echo "📱 初始化Android项目..."
    npx cap add android
fi

# 同步
echo "🔄 同步Capacitor..."
npx cap sync android

# 检查签名配置
KEYSTORE_PATH="android/app/release-keystore.jks"
if [ ! -f "$KEYSTORE_PATH" ]; then
    echo "⚠️ 未找到签名密钥，将构建未签名APK"
    BUILD_TYPE="assembleDebug"
else
    echo "🔑 找到签名密钥，将构建签名APK"
    BUILD_TYPE="assembleRelease"
fi

# 构建APK
echo "📱 构建APK..."
cd android
./gradlew $BUILD_TYPE

# 查找APK文件
if [ "$BUILD_TYPE" = "assembleRelease" ]; then
    APK_PATH="app/build/outputs/apk/release/app-release.apk"
else
    APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
fi

if [ -f "$APK_PATH" ]; then
    # 复制到项目根目录
    VERSION=$(node -p "require('./package.json').version")
    OUTPUT_NAME="shidao-relations-v${VERSION}.apk"
    cp "$APK_PATH" "../$OUTPUT_NAME"
    echo "✅ 构建成功！APK文件: $OUTPUT_NAME"
    echo "📍 完整路径: $(pwd)/../$OUTPUT_NAME"
else
    echo "❌ 构建失败：未找到APK文件"
    exit 1
fi
