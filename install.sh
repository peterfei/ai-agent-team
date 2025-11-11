#!/bin/bash

# AI Agent Team 一键安装脚本
# 使用方法: curl -fsSL https://raw.githubusercontent.com/yourusername/ai-agent-team/main/install.sh | bash

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# 版本信息
VERSION="1.0.1"
REPO="peterfei/ai-agent-team"
BRANCH="main"

# 显示logo
show_logo() {
    echo -e "${CYAN}"
    cat <<'EOF'
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║           🤖 AI Agent Team 智能团队                          ║
║                                                              ║
║         基于Claude Code的专业AI智能体团队系统                ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

# 检查系统要求
check_requirements() {
    echo -e "${YELLOW}🔍 检查系统要求...${NC}"

    # 检查Claude Code
    if ! command -v claude > /dev/null 2>&1; then
        echo -e "${RED}❌ Claude Code未安装${NC}"
        echo -e "${YELLOW}请先安装Claude Code: https://claude.ai/code${NC}"
        exit 1
    fi

    # 检查curl
    if ! command -v curl > /dev/null 2>&1; then
        echo -e "${RED}❌ curl未安装${NC}"
        echo -e "${YELLOW}请安装curl后重试${NC}"
        exit 1
    fi

    echo -e "${GREEN}✅ 系统要求检查通过${NC}"
}

# 获取平台信息
get_platform() {
    OS=$(uname -s | tr '[:upper:]' '[:lower:]')
    ARCH=$(uname -m)

    case $OS in
        darwin)
            OS="macos"
            ;;
        linux)
            OS="linux"
            ;;
        *)
            echo -e "${RED}❌ 不支持的操作系统: $OS${NC}"
            exit 1
            ;;
    esac

    case $ARCH in
        x86_64|amd64)
            ARCH="x64"
            ;;
        arm64|aarch64)
            ARCH="arm64"
            ;;
        *)
            echo -e "${RED}❌ 不支持的架构: $ARCH${NC}"
            exit 1
            ;;
    esac

    echo "${OS}-${ARCH}"
}

# 创建临时目录
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

# 下载安装包
download_package() {
    echo -e "${YELLOW}📦 下载安装包...${NC}"

    local platform=$(get_platform)
    local download_url="https://github.com/${REPO}/archive/refs/heads/${BRANCH}.tar.gz"

    curl -fsSL "$download_url" -o "$TEMP_DIR/ai-agent-team.tar.gz"

    echo -e "${GREEN}✅ 安装包下载完成${NC}"
}

# 解压安装包
extract_package() {
    echo -e "${YELLOW}📂 解压安装包...${NC}"

    cd "$TEMP_DIR"
    tar -xzf ai-agent-team.tar.gz

    # 查找解压后的目录
    EXTRACTED_DIR=$(find . -maxdepth 1 -type d -name "ai-agent-team-*" | head -n1)

    if [ -z "$EXTRACTED_DIR" ]; then
        echo -e "${RED}❌ 解压失败${NC}"
        exit 1
    fi

    echo -e "${GREEN}✅ 安装包解压完成${NC}"
}

# 备份现有配置
backup_existing() {
    local claude_dir="$HOME/.claude"
    local backup_dir="$claude_dir/backup_$(date +%Y%m%d_%H%M%S)"

    if [ -d "$claude_dir/agents" ] || [ -d "$claude_dir/commands" ]; then
        echo -e "${YELLOW}💾 备份现有配置...${NC}"

        mkdir -p "$backup_dir"

        [ -d "$claude_dir/agents" ] && mv "$claude_dir/agents" "$backup_dir/"
        [ -d "$claude_dir/commands" ] && mv "$claude_dir/commands" "$backup_dir/"
        [ -f "$claude_dir/CLAUDE.md" ] && cp "$claude_dir/CLAUDE.md" "$backup_dir/"

        echo -e "${GREEN}✅ 配置已备份到: $backup_dir${NC}"
    fi
}

# 安装文件
install_files() {
    echo -e "${YELLOW}🚀 安装AI Agent Team...${NC}"

    local source_dir="$TEMP_DIR/$EXTRACTED_DIR/.claude"
    local target_dir="$HOME/.claude"

    # 创建目标目录
    mkdir -p "$target_dir"

    # 复制文件
    if [ -d "$source_dir/agents" ]; then
        cp -r "$source_dir/agents" "$target_dir/"

        # 设置CLI脚本权限
        if [ -f "$target_dir/agents/cli.sh" ]; then
            chmod +x "$target_dir/agents/cli.sh"
        fi

        echo -e "${GREEN}✅ 智能体配置安装完成${NC}"
    fi

    if [ -d "$source_dir/commands" ]; then
        cp -r "$source_dir/commands" "$target_dir/"
        echo -e "${GREEN}✅ 快捷命令安装完成${NC}"
    fi

    if [ -f "$source_dir/CLAUDE.md" ]; then
        cp "$source_dir/CLAUDE.md" "$target_dir/"
        echo -e "${GREEN}✅ 项目文档安装完成${NC}"
    fi

    if [ -f "$source_dir/USAGE.md" ]; then
        cp "$source_dir/USAGE.md" "$target_dir/"
        echo -e "${GREEN}✅ 使用指南安装完成${NC}"
    fi
}

# 安装插件
install_plugins() {
    echo -e "${YELLOW}🔌 安装Claude插件...${NC}"

    local source_plugin_dir="$TEMP_DIR/$EXTRACTED_DIR/.claude-plugin"
    local target_plugin_dir="$HOME/.claude-plugin"

    if [ -d "$source_plugin_dir" ]; then
        # 创建目标目录
        mkdir -p "$target_plugin_dir"

        # 复制插件文件
        cp -r "$source_plugin_dir"/* "$target_plugin_dir/"

        # 设置安装脚本权限
        if [ -f "$target_plugin_dir/install.sh" ]; then
            chmod +x "$target_plugin_dir/install.sh"
        fi
        if [ -f "$target_plugin_dir/uninstall.sh" ]; then
            chmod +x "$target_plugin_dir/uninstall.sh"
        fi

        echo -e "${GREEN}✅ 插件文件复制完成${NC}"

        # 检查是否安装了 Node.js
        if command -v node > /dev/null 2>&1; then
            echo -e "${YELLOW}📦 安装插件依赖...${NC}"

            # 安装 drawnote-skill 依赖
            if [ -d "$target_plugin_dir/drawnote-skill" ]; then
                cd "$target_plugin_dir/drawnote-skill"
                npm install > /dev/null 2>&1

                # 安装 Playwright 浏览器
                if npx playwright install chromium > /dev/null 2>&1; then
                    echo -e "${GREEN}✅ DrawNote Skill 依赖安装完成${NC}"
                else
                    echo -e "${YELLOW}⚠️  Playwright 浏览器安装失败，请手动运行:${NC}"
                    echo -e "${YELLOW}   cd ~/.claude-plugin/drawnote-skill && npx playwright install chromium${NC}"
                fi
            fi
        else
            echo -e "${YELLOW}⚠️  未检测到 Node.js，跳过插件依赖安装${NC}"
            echo -e "${YELLOW}   如需使用插件，请先安装 Node.js，然后运行:${NC}"
            echo -e "${YELLOW}   ~/.claude-plugin/install.sh${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  未找到插件目录，跳过插件安装${NC}"
    fi
}

# 验证安装
verify_installation() {
    echo -e "${YELLOW}🔍 验证安装...${NC}"

    local target_dir="$HOME/.claude"
    local errors=0

    # 检查智能体
    if [ -d "$target_dir/agents" ]; then
        local agent_count=$(find "$target_dir/agents" -name "*.md" -not -name "README.md" | wc -l)
        echo -e "${GREEN}✅ 智能体配置 ($agent_count 个)${NC}"
    else
        echo -e "${RED}❌ 智能体配置缺失${NC}"
        errors=$((errors + 1))
    fi

    # 检查命令
    if [ -d "$target_dir/commands" ]; then
        local cmd_count=$(find "$target_dir/commands" -name "*.md" -not -name "README.md" | wc -l)
        echo -e "${GREEN}✅ 快捷命令 ($cmd_count 个)${NC}"
    else
        echo -e "${RED}❌ 快捷命令缺失${NC}"
        errors=$((errors + 1))
    fi

    # 检查CLI
    if [ -x "$target_dir/agents/cli.sh" ]; then
        echo -e "${GREEN}✅ CLI工具${NC}"
    else
        echo -e "${RED}❌ CLI工具不可用${NC}"
        errors=$((errors + 1))
    fi

    if [ $errors -eq 0 ]; then
        echo -e "${GREEN}✅ 安装验证通过${NC}"
        return 0
    else
        echo -e "${RED}❌ 安装验证失败 ($errors 个错误)${NC}"
        return 1
    fi
}

# 显示完成信息
show_completion() {
    echo -e "${CYAN}"
    cat <<'EOF'
╔══════════════════════════════════════════════════════════════╗
║                      🎉 安装完成！                            ║
╚══════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"

    echo -e "${GREEN}🚀 快速开始:${NC}"
    echo
    echo -e "${BLUE}# 使用快捷命令 (推荐)${NC}"
    echo -e "${YELLOW}/pm '设计用户认证系统'${NC}"
    echo -e "${YELLOW}/fe '创建登录页面'${NC}"
    echo -e "${YELLOW}/be '实现JWT认证API'${NC}"
    echo -e "${YELLOW}/qa '测试认证流程'${NC}"
    echo -e "${YELLOW}/ops '部署到生产环境'${NC}"
    echo -e "${YELLOW}/tl '评估系统架构'${NC}"
    echo
    echo -e "${BLUE}# 使用完整命令${NC}"
    echo -e "${YELLOW}claude -p \"/agent product_manager '设计用户认证系统'\"${NC}"
    echo
    echo -e "${BLUE}# 使用CLI工具${NC}"
    echo -e "${YELLOW}~/.claude/agents/cli.sh pm \"设计用户认证系统\"${NC}"
    echo
    echo -e "${BLUE}# 使用插件${NC}"
    echo -e "${YELLOW}请帮我创建一个关于"人工智能"的信息图${NC}"
    echo -e "${YELLOW}请使用彩色手写笔记风格生成"机器学习"的信息图${NC}"
    echo
    echo -e "${GREEN}📚 更多资源:${NC}"
    echo -e "${BLUE}• 使用指南: ~/.claude/USAGE.md${NC}"
    echo -e "${BLUE}• 项目主页: https://github.com/${REPO}${NC}"
    echo -e "${BLUE}• 问题反馈: https://github.com/${REPO}/issues${NC}"
    echo
    echo -e "${PURPLE}💡 提示: 重启Claude Code以确保配置生效${NC}"
    echo
    echo -e "${CYAN}感谢使用 AI Agent Team! 🤖${NC}"
}

# 主安装流程
main() {
    show_logo

    # 解析命令行参数
    FORCE_INSTALL=false
    SKIP_BACKUP=false

    for arg in "$@"; do
        case $arg in
            --force)
                FORCE_INSTALL=true
                ;;
            --skip-backup)
                SKIP_BACKUP=true
                ;;
            --help|-h)
                echo "AI Agent Team 一键安装脚本"
                echo
                echo "使用方法:"
                echo "  curl -fsSL https://raw.githubusercontent.com/${REPO}/main/install.sh | bash"
                echo
                echo "选项:"
                echo "  --force       强制安装，覆盖现有配置"
                echo "  --skip-backup 跳过备份现有配置"
                echo "  --help        显示帮助信息"
                echo
                echo "示例:"
                echo "  curl -fsSL https://raw.githubusercontent.com/${REPO}/main/install.sh | bash"
                echo "  curl -fsSL https://raw.githubusercontent.com/${REPO}/main/install.sh | bash -s -- --force"
                exit 0
                ;;
        esac
    done

    check_requirements

    if [ "$FORCE_INSTALL" = false ]; then
        backup_existing
    fi

    download_package
    extract_package
    install_files
    install_plugins

    if verify_installation; then
        show_completion
    else
        echo -e "${RED}❌ 安装失败，请检查错误信息${NC}"
        exit 1
    fi
}

# 执行安装
main "$@"