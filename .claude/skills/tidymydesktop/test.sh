#!/bin/bash

# TidyMyDesktop Skill 测试脚本

echo "==================================="
echo "TidyMyDesktop Skill 测试"
echo "==================================="

# 设置颜色
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. 创建测试目录
TEST_DIR="/tmp/tidymydesktop-test-$(date +%s)"
echo -e "${BLUE}[1/5]${NC} 创建测试目录: $TEST_DIR"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"

# 2. 创建测试文件
echo -e "${BLUE}[2/5]${NC} 创建测试文件..."
touch "Visual Studio Code v1.85.0.dmg"
touch "Visual Studio Code v1.84.2.dmg"
touch "Photoshop 2024.dmg"
touch "Slack v4.0.0.app"
touch "Slack v3.9.5.app"
touch "document.pdf"
touch "report.docx"
touch "screenshot.png"
touch "video.mp4"
touch "music.mp3"
echo -e "${GREEN}✓${NC} 创建了 10 个测试文件"

# 3. 扫描测试
echo -e "\n${BLUE}[3/5]${NC} 运行扫描测试..."
~/.claude/skills/tidymydesktop/scripts/run.sh scripts/scan.js "$TEST_DIR"

# 4. Dry-run 测试
echo -e "\n${BLUE}[4/5]${NC} 运行 Dry-run 整理测试..."
~/.claude/skills/tidymydesktop/scripts/run.sh scripts/organize.js --source "$TEST_DIR" --dry-run

# 5. 实际整理测试
echo -e "\n${BLUE}[5/5]${NC} 执行实际整理..."
~/.claude/skills/tidymydesktop/scripts/run.sh scripts/organize.js --source "$TEST_DIR" --report "$TEST_DIR/report.md"

# 显示结果
echo -e "\n${GREEN}==================================="
echo "测试完成！"
echo "===================================${NC}"
echo ""
echo "测试目录: $TEST_DIR"
echo "整理报告: $TEST_DIR/report.md"
echo ""
echo "查看整理后的结构:"
echo "  tree $TEST_DIR"
echo ""
echo "查看整理报告:"
echo "  cat $TEST_DIR/report.md"
echo ""
echo "清理测试环境:"
echo "  rm -rf $TEST_DIR"
echo ""
