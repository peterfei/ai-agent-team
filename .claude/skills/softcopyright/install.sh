#!/bin/bash

# SoftCopyright 安装脚本
# Author: peterfei

echo "🚀 SoftCopyright - 软件著作权申请材料生成工具"
echo "================================================"

# 检查 Node.js 是否已安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未检测到 Node.js，请先安装 Node.js >= 14.0.0"
    echo "   访问 https://nodejs.org/ 下载安装"
    exit 1
fi

# 检查 Node.js 版本
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="14.0.0"

if ! node -e "process.exit(require('semver').gte('$NODE_VERSION', '$REQUIRED_VERSION') ? 0 : 1)" 2>/dev/null; then
    echo "❌ 错误: Node.js 版本过低，当前版本: $NODE_VERSION，要求版本: >= $REQUIRED_VERSION"
    echo "   请升级 Node.js 版本"
    exit 1
fi

echo "✅ Node.js 版本检查通过: $NODE_VERSION"

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 请在 softcopyright 项目目录中运行此脚本"
    exit 1
fi

echo "📦 安装依赖包..."

# 安装依赖
npm install

if [ $? -eq 0 ]; then
    echo "✅ 依赖安装完成"
    echo ""
    echo "🎉 SoftCopyright 安装成功！"
    echo ""
    echo "📖 使用方法:"
    echo "   交互式向导: node scripts/index.js interactive"
    echo "   扫描项目:   node scripts/index.js scan <项目路径>"
    echo "   生成材料:   node scripts/index.js generate --help"
    echo ""
    echo "📚 更多信息请查看 README.md"
else
    echo "❌ 依赖安装失败，请检查网络连接或 npm 配置"
    exit 1
fi