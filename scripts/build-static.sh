#!/bin/bash

# ========================================
# APK静态导出构建脚本
# 处理API路由与静态导出的冲突
# ========================================

set -e

echo "🚀 开始构建APK静态导出..."

# 项目根目录
PROJECT_ROOT="/home/z/my-project"
cd "$PROJECT_ROOT"

# 临时目录
TEMP_DIR="$PROJECT_ROOT/.temp-api-routes"
API_DIR="$PROJECT_ROOT/src/app/api"

# 步骤1: 临时移动API路由（静态导出不支持API路由）
echo ""
echo "📦 临时移动API路由..."
if [ -d "$API_DIR" ]; then
    mkdir -p "$TEMP_DIR"
    mv "$API_DIR" "$TEMP_DIR/api"
    echo "✅ API路由已临时移动"
else
    echo "⚠️ API目录不存在，跳过"
fi

# 步骤2: 构建静态导出
echo ""
echo "🏗️ 执行静态导出..."
bun run build 2>&1 || {
    echo "❌ 构建失败"
    # 恢复API路由
    if [ -d "$TEMP_DIR/api" ]; then
        mkdir -p "$API_DIR"
        mv "$TEMP_DIR/api" "$API_DIR"
        rm -rf "$TEMP_DIR"
    fi
    exit 1
}

echo "✅ 静态导出完成"

# 步骤3: 恢复API路由
echo ""
echo "🔄 恢复API路由..."
if [ -d "$TEMP_DIR/api" ]; then
    mkdir -p "$API_DIR"
    mv "$TEMP_DIR/api" "$API_DIR"
    rm -rf "$TEMP_DIR"
    echo "✅ API路由已恢复"
fi

# 步骤4: 检查输出
echo ""
echo "📋 构建结果:"
if [ -d "out" ]; then
    echo "✅ 静态文件已生成到 out/ 目录"
    echo "   文件数量: $(find out -type f | wc -l)"
else
    echo "❌ 未找到输出目录"
    exit 1
fi

echo ""
echo "======================================"
echo "  ✅ APK静态导出构建完成！"
echo "======================================"
