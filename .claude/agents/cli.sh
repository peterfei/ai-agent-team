#!/bin/bash

# AI Agent Team CLI - 快捷命令调用工具
# 使用方法: ./cli.sh [agent] [task]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Agent映射
declare -A AGENTS=(
    ["pm"]="product_manager"
    ["product"]="product_manager"
    ["产品"]="product_manager"
    ["fe"]="frontend_dev"
    ["frontend"]="frontend_dev"
    ["前端"]="frontend_dev"
    ["be"]="backend_dev"
    ["backend"]="backend_dev"
    ["后端"]="backend_dev"
    ["qa"]="qa_engineer"
    ["test"]="qa_engineer"
    ["测试"]="qa_engineer"
    ["ops"]="devops_engineer"
    ["devops"]="devops_engineer"
    ["运维"]="devops_engineer"
)

# 显示帮助信息
show_help() {
    echo -e "${CYAN}🤖 AI Agent Team CLI${NC}"
    echo -e "${CYAN}===================${NC}"
    echo
    echo -e "${YELLOW}使用方法:${NC}"
    echo -e "  ./cli.sh [agent] [task]"
    echo
    echo -e "${YELLOW}可用Agent:${NC}"
    echo -e "  ${GREEN}pm | product | 产品${NC}        - 产品经理"
    echo -e "  ${GREEN}fe | frontend | 前端${NC}      - 前端开发"
    echo -e "  ${GREEN}be | backend | 后端${NC}       - 后端开发"
    echo -e "  ${GREEN}qa | test | 测试${NC}          - 测试工程师"
    echo -e "  ${GREEN}ops | devops | 运维${NC}       - DevOps工程师"
    echo
    echo -e "${YELLOW}示例:${NC}"
    echo -e "  ./cli.sh pm \"设计用户认证系统\""
    echo -e "  ./cli.sh 前端 \"创建登录页面\""
    echo -e "  ./cli.sh backend \"实现JWT认证API\""
    echo -e "  ./cli.sh 测试 \"测试登录功能\""
    echo -e "  ./cli.sh 运维 \"部署到生产环境\""
    echo
    echo -e "${YELLOW}工作流示例:${NC}"
    echo -e "  # 完整的产品开发流程"
    echo -e "  ./cli.sh 产品 \"设计用户登录功能\""
    echo -e "  ./cli.sh 后端 \"实现登录API接口\""
    echo -e "  ./cli.sh 前端 \"创建登录页面UI\""
    echo -e "  ./cli.sh 测试 \"测试完整登录流程\""
    echo -e "  ./cli.sh 运维 \"部署登录功能到生产环境\""
}

# 检查参数
if [ $# -lt 2 ]; then
    show_help
    exit 1
fi

AGENT_ALIAS=$1
TASK_DESCRIPTION="$2"

# 检查agent是否存在
if [[ -z "${AGENTS[$AGENT_ALIAS]}" ]]; then
    echo -e "${RED}❌ 未知的agent: $AGENT_ALIAS${NC}"
    echo -e "${YELLOW}可用agent:${NC} pm, fe, be, qa, ops"
    exit 1
fi

AGENT_NAME="${AGENTS[$AGENT_ALIAS]}"

# 显示调用信息
echo -e "${CYAN}🤖 AI Agent Team CLI${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Agent:${NC} ${GREEN}$AGENT_ALIAS${NC} (${AGENT_NAME})"
echo -e "${YELLOW}任务:${NC} $TASK_DESCRIPTION"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo

# 构建agent命令
AGENT_CMD="/agent $AGENT_NAME \"$TASK_DESCRIPTION\""

# 显示实际执行的命令（调试用）
if [[ "${DEBUG:-false}" == "true" ]]; then
    echo -e "${PURPLE}[DEBUG] 执行命令: $AGENT_CMD${NC}"
    echo
fi

# 执行agent命令
echo -e "${CYAN}正在调用agent...${NC}"
echo

# 使用claude执行agent命令
if command -v claude > /dev/null 2>&1; then
    claude -p "$AGENT_CMD"
else
    echo -e "${RED}❌ Claude Code 未安装或未配置${NC}"
    echo -e "${YELLOW}请确保已安装Claude Code并正确配置${NC}"
    exit 1
fi

# 显示完成信息
echo
echo -e "${GREEN}✅ Agent任务完成${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# 提供下一步建议
case $AGENT_ALIAS in
    "pm"|"product"|"产品")
        echo -e "${CYAN}💡 建议下一步:${NC}"
        echo -e "  - 使用 '${GREEN}./cli.sh 后端${NC}' 开发API接口"
        echo -e "  - 使用 '${GREEN}./cli.sh 前端${NC}' 创建用户界面"
        ;;
    "be"|"backend"|"后端")
        echo -e "${CYAN}💡 建议下一步:${NC}"
        echo -e "  - 使用 '${GREEN}./cli.sh 前端${NC}' 开发用户界面"
        echo -e "  - 使用 '${GREEN}./cli.sh 测试${NC}' 进行API测试"
        ;;
    "fe"|"frontend"|"前端")
        echo -e "${CYAN}💡 建议下一步:${NC}"
        echo -e "  - 使用 '${GREEN}./cli.sh 测试${NC}' 进行功能测试"
        echo -e "  - 使用 '${GREEN}./cli.sh 运维${NC}' 部署到服务器"
        ;;
    "qa"|"test"|"测试")
        echo -e "${CYAN}💡 建议下一步:${NC}"
        echo -e "  - 使用 '${GREEN}./cli.sh 运维${NC}' 部署到测试环境"
        echo -e "  - 修复发现的问题后重新测试"
        ;;
    "ops"|"devops"|"运维")
        echo -e "${CYAN}💡 建议下一步:${NC}"
        echo -e "  - 监控部署后的系统状态"
        echo -e "  - 使用 '${GREEN}./cli.sh 测试${NC}' 进行生产环境验证"
        ;;
esac

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}🎯 使用 '${GREEN}./cli.sh 状态${NC}' 查看团队整体状态${NC}"