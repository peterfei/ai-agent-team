#!/bin/bash

# AI Agent Team 安装脚本
# 用于一键安装和配置AI智能体团队系统

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 显示标题
show_title() {
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                                                              ║"
    echo "║           🤖 AI Agent Team 智能团队安装器                    ║"
    echo "║                                                              ║"
    echo "║         基于Claude Code的专业AI智能体团队系统                ║"
    echo "║                                                              ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# 显示帮助信息
show_help() {
    echo -e "${CYAN}AI Agent Team 安装脚本${NC}"
    echo -e "${CYAN}==================${NC}"
    echo
    echo -e "${YELLOW}使用方法:${NC}"
    echo -e "  $0 [选项]"
    echo
    echo -e "${YELLOW}选项:${NC}"
    echo -e "  -h, --help     显示帮助信息"
    echo -e "  -v, --version  显示版本信息"
    echo -e "  -f, --force    强制覆盖现有配置"
    echo -e "  -d, --dev      安装开发版本"
    echo -e "  -c, --check    仅检查环境，不安装"
    echo
    echo -e "${YELLOW}示例:${NC}"
    echo -e "  $0                # 正常安装"
    echo -e "  $0 --force        # 强制安装"
    echo -e "  $0 --dev          # 开发模式安装"
    echo -e "  $0 --check        # 检查环境"
}

# 显示版本信息
show_version() {
    echo -e "${GREEN}AI Agent Team v1.0.0${NC}"
    echo -e "${BLUE}基于Claude Code的智能体团队系统${NC}"
}

# 检查系统环境
check_environment() {
    echo -e "${YELLOW}🔍 检查系统环境...${NC}"

    # 检查操作系统
    OS=$(uname -s)
    case $OS in
        Darwin*)
            echo -e "${GREEN}✓ macOS系统${NC}"
            ;;
        Linux*)
            echo -e "${GREEN}✓ Linux系统${NC}"
            ;;
        *)
            echo -e "${RED}❌ 不支持的操作系统: $OS${NC}"
            exit 1
            ;;
    esac

    # 检查Claude Code
    if command -v claude > /dev/null 2>&1; then
        CLAUDE_VERSION=$(claude --version 2>/dev/null || echo "unknown")
        echo -e "${GREEN}✓ Claude Code已安装 ($CLAUDE_VERSION)${NC}"
    else
        echo -e "${RED}❌ Claude Code未安装${NC}"
        echo -e "${YELLOW}请先安装Claude Code: https://claude.ai/code${NC}"
        exit 1
    fi

    # 检查Node.js (可选)
    if command -v node > /dev/null 2>&1; then
        NODE_VERSION=$(node --version)
        echo -e "${GREEN}✓ Node.js已安装 ($NODE_VERSION)${NC}"
    else
        echo -e "${YELLOW}⚠️  Node.js未安装 (可选)${NC}"
    fi

    # 检查Git
    if command -v git > /dev/null 2>&1; then
        GIT_VERSION=$(git --version)
        echo -e "${GREEN}✓ Git已安装 ($GIT_VERSION)${NC}"
    else
        echo -e "${YELLOW}⚠️  Git未安装 (推荐)${NC}"
    fi

    # 检查配置目录
    CLAUUDE_DIR="$HOME/.claude"
    if [ -d "$CLAUUDE_DIR" ]; then
        echo -e "${GREEN}✓ Claude配置目录存在${NC}"
    else
        echo -e "${YELLOW}⚠️  Claude配置目录不存在，将创建${NC}"
        mkdir -p "$CLAUUDE_DIR"
    fi

    echo -e "${GREEN}✅ 环境检查完成${NC}"
}

# 备份现有配置
backup_config() {
    CLAUUDE_DIR="$HOME/.claude"
    BACKUP_DIR="$CLAUUDE_DIR/backup_$(date +%Y%m%d_%H%M%S)"

    if [ -d "$CLAUUDE_DIR/agents" ] || [ -d "$CLAUUDE_DIR/commands" ]; then
        echo -e "${YELLOW}📦 备份现有配置...${NC}"
        mkdir -p "$BACKUP_DIR"

        if [ -d "$CLAUUDE_DIR/agents" ]; then
            mv "$CLAUUDE_DIR/agents" "$BACKUP_DIR/"
        fi

        if [ -d "$CLAUUDE_DIR/commands" ]; then
            mv "$CLAUUDE_DIR/commands" "$BACKUP_DIR/"
        fi

        if [ -f "$CLAUUDE_DIR/CLAUDE.md" ]; then
            cp "$CLAUUDE_DIR/CLAUDE.md" "$BACKUP_DIR/"
        fi

        echo -e "${GREEN}✓ 配置已备份到: $BACKUP_DIR${NC}"
    fi
}

# 安装智能体配置
install_agents() {
    echo -e "${YELLOW}🤖 安装智能体配置...${NC}"

    SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/.claude"
    TARGET_DIR="$HOME/.claude"

    # 复制智能体配置
    if [ -d "$SOURCE_DIR/agents" ]; then
        cp -r "$SOURCE_DIR/agents" "$TARGET_DIR/"
        echo -e "${GREEN}✓ 智能体配置已安装${NC}"

        # 设置CLI脚本权限
        if [ -f "$TARGET_DIR/agents/cli.sh" ]; then
            chmod +x "$TARGET_DIR/agents/cli.sh"
            echo -e "${GREEN}✓ CLI脚本权限已设置${NC}"
        fi

        # 显示安装的智能体
        AGENT_COUNT=$(find "$TARGET_DIR/agents" -name "*.md" -not -name "README.md" | wc -l)
        echo -e "${BLUE}📋 已安装 $AGENT_COUNT 个智能体${NC}"
    else
        echo -e "${RED}❌ 智能体配置目录不存在: $SOURCE_DIR/agents${NC}"
        exit 1
    fi
}

# 安装快捷命令
install_commands() {
    echo -e "${YELLOW}⚡ 安装快捷命令...${NC}"

    SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/.claude"
    TARGET_DIR="$HOME/.claude"

    if [ -d "$SOURCE_DIR/commands" ]; then
        cp -r "$SOURCE_DIR/commands" "$TARGET_DIR/"
        echo -e "${GREEN}✓ 快捷命令已安装${NC}"

        # 显示安装的命令
        CMD_COUNT=$(find "$TARGET_DIR/commands" -name "*.md" -not -name "README.md" | wc -l)
        echo -e "${BLUE}📋 已安装 $CMD_COUNT 个快捷命令${NC}"
    else
        echo -e "${RED}❌ 快捷命令目录不存在: $SOURCE_DIR/commands${NC}"
        exit 1
    fi
}

# 安装项目文档
install_docs() {
    echo -e "${YELLOW}📚 安装项目文档...${NC}"

    SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/.claude"
    TARGET_DIR="$HOME/.claude"

    if [ -f "$SOURCE_DIR/CLAUDE.md" ]; then
        cp "$SOURCE_DIR/CLAUDE.md" "$TARGET_DIR/"
        echo -e "${GREEN}✓ 项目文档已安装${NC}"
    fi

    if [ -f "$SOURCE_DIR/USAGE.md" ]; then
        cp "$SOURCE_DIR/USAGE.md" "$TARGET_DIR/"
        echo -e "${GREEN}✓ 使用指南已安装${NC}"
    fi
}

# 验证安装
verify_installation() {
    echo -e "${YELLOW}🔍 验证安装...${NC}"

    TARGET_DIR="$HOME/.claude"
    ERRORS=0

    # 检查智能体配置
    if [ ! -d "$TARGET_DIR/agents" ]; then
        echo -e "${RED}❌ 智能体配置目录不存在${NC}"
        ERRORS=$((ERRORS + 1))
    else
        AGENT_COUNT=$(find "$TARGET_DIR/agents" -name "*.md" -not -name "README.md" | wc -l)
        if [ $AGENT_COUNT -gt 0 ]; then
            echo -e "${GREEN}✓ 智能体配置 ($AGENT_COUNT 个)${NC}"
        else
            echo -e "${RED}❌ 没有找到智能体配置文件${NC}"
            ERRORS=$((ERRORS + 1))
        fi
    fi

    # 检查快捷命令
    if [ ! -d "$TARGET_DIR/commands" ]; then
        echo -e "${RED}❌ 快捷命令目录不存在${NC}"
        ERRORS=$((ERRORS + 1))
    else
        CMD_COUNT=$(find "$TARGET_DIR/commands" -name "*.md" -not -name "README.md" | wc -l)
        if [ $CMD_COUNT -gt 0 ]; then
            echo -e "${GREEN}✓ 快捷命令 ($CMD_COUNT 个)${NC}"
        else
            echo -e "${RED}❌ 没有找到快捷命令文件${NC}"
            ERRORS=$((ERRORS + 1))
        fi
    fi

    # 检查CLI脚本
    if [ -f "$TARGET_DIR/agents/cli.sh" ]; then
        if [ -x "$TARGET_DIR/agents/cli.sh" ]; then
            echo -e "${GREEN}✓ CLI脚本 (可执行)${NC}"
        else
            echo -e "${YELLOW}⚠️  CLI脚本不可执行${NC}"
        fi
    else
        echo -e "${RED}❌ CLI脚本不存在${NC}"
        ERRORS=$((ERRORS + 1))
    fi

    # 检查文档
    if [ -f "$TARGET_DIR/CLAUDE.md" ]; then
        echo -e "${GREEN}✓ 项目文档${NC}"
    else
        echo -e "${YELLOW}⚠️  项目文档不存在${NC}"
    fi

    if [ $ERRORS -eq 0 ]; then
        echo -e "${GREEN}✅ 安装验证通过${NC}"
        return 0
    else
        echo -e "${RED}❌ 发现 $ERRORS 个错误${NC}"
        return 1
    fi
}

# 显示安装后信息
show_post_install() {
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                      🎉 安装完成！                            ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"

    echo -e "${GREEN}🚀 快速开始:${NC}"
    echo -e "${BLUE}# 产品经理 - 需求分析${NC}"
    echo -e "${YELLOW}claude -p \"/pm '设计用户认证系统'\"${NC}"
    echo
    echo -e "${BLUE}# 前端开发 - UI实现${NC}"
    echo -e "${YELLOW}claude -p \"/fe '创建登录页面'\"${NC}"
    echo
    echo -e "${BLUE}# 后端开发 - API开发${NC}"
    echo -e "${YELLOW}claude -p \"/be '实现JWT认证'\"${NC}"
    echo
    echo -e "${BLUE}# 测试工程师 - 质量保证${NC}"
    echo -e "${YELLOW}claude -p \"/qa '测试认证流程'\"${NC}"
    echo
    echo -e "${BLUE}# 运维工程师 - 部署运维${NC}"
    echo -e "${YELLOW}claude -p \"/ops '部署到生产环境'\"${NC}"
    echo
    echo -e "${BLUE}# 技术负责人 - 架构设计${NC}"
    echo -e "${YELLOW}claude -p \"/tl '评估系统架构'\"${NC}"
    echo
    echo -e "${GREEN}🛠️  使用CLI工具:${NC}"
    echo -e "${YELLOW}~/.claude/agents/cli.sh pm \"设计用户认证系统\"${NC}"
    echo
    echo -e "${GREEN}📚 更多信息:${NC}"
    echo -e "${BLUE}• 使用指南: ~/.claude/USAGE.md${NC}"
    echo -e "${BLUE}• 项目文档: ~/.claude/CLAUDE.md${NC}"
    echo -e "${BLUE}• GitHub: https://github.com/peterfei/ai-agent-team${NC}"
    echo
    echo -e "${PURPLE}💡 提示: 重启Claude Code以确保所有配置生效${NC}"
}

# 主安装流程
main_install() {
    show_title

    # 检查是否强制安装
    if [ "$FORCE" = "true" ]; then
        backup_config
    fi

    check_environment

    if [ "$CHECK_ONLY" = "true" ]; then
        echo -e "${GREEN}✅ 环境检查完成，可以安全安装${NC}"
        return 0
    fi

    install_agents
    install_commands
    install_docs

    if verify_installation; then
        show_post_install
    else
        echo -e "${RED}❌ 安装过程中发现问题，请检查日志${NC}"
        exit 1
    fi
}

# 参数解析
FORCE=false
DEV=false
CHECK_ONLY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -v|--version)
            show_version
            exit 0
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        -d|--dev)
            DEV=true
            shift
            ;;
        -c|--check)
            CHECK_ONLY=true
            shift
            ;;
        *)
            echo -e "${RED}❌ 未知选项: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

# 执行安装
main_install