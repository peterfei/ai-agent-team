#!/bin/bash

# AI Agent Team - 软件著作权申请材料生成脚本
# 使用方法: ./generate-copyright.sh

echo "🤖 AI Agent Team - 软件著作权申请材料生成器"
echo "=================================================="

# 检查softcopyright技能是否安装
if [ ! -f ~/.claude/skills/softcopyright/softcopyright-generate ]; then
    echo "❌ SoftCopyright技能未安装"
    echo "💡 请先安装: npm install -g ai-agent-team"
    exit 1
fi

# 获取项目目录
PROJECT_DIR=$(pwd)
echo "📁 项目目录: $PROJECT_DIR"

# 检查项目是否包含源代码文件
if [ ! -d "$PROJECT_DIR/src" ] && [ ! -f "$PROJECT_DIR/package.json" ] && [ ! -f "$PROJECT_DIR/main.py" ]; then
    echo "⚠️  未检测到明显的项目源代码结构"
    echo "💡 确保在包含源代码的项目目录中运行此脚本"
    read -p "是否继续? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ 用户取消"
        exit 1
    fi
fi

echo "🚀 开始生成软件著作权申请材料..."
echo ""

# 使用softcopyright技能生成材料
~/.claude/skills/softcopyright/softcopyright-generate --project "$PROJECT_DIR" --auto-pdf

echo ""
echo "✅ 软著材料生成完成！"
echo ""
echo "📄 生成的文件位置:"
echo "   $PROJECT_DIR/softcopyright-output/"
echo ""
echo "💡 提示:"
echo "   • 浏览器已自动打开打印对话框"
echo "   • 选择'保存为PDF'即可导出软著申请材料"
echo "   • 如需重新生成，可删除output目录后再次运行"
echo ""
