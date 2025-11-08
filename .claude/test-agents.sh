#!/bin/bash

# AI Agent测试脚本
# 测试所有agent的响应和功能

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🤖 AI Agent团队测试${NC}"
echo -e "${BLUE}====================${NC}"
echo

# 检查claude是否可用
if ! command -v claude > /dev/null 2>&1; then
    echo -e "${RED}❌ Claude Code 未安装${NC}"
    exit 1
fi

# 测试agent列表
declare -a AGENTS=(
    "product_manager:产品经理:设计用户登录认证系统"
    "frontend_dev:前端开发:创建响应式登录页面组件"
    "backend_dev:后端开发:实现JWT认证API接口"
    "qa_engineer:测试工程师:设计登录功能测试用例"
    "devops_engineer:DevOps工程师:配置生产环境部署流程"
)

# 测试结果统计
PASSED=0
FAILED=0

# 测试每个agent
for agent_info in "${AGENTS[@]}"; do
    IFS=':' read -r agent_id agent_name test_task <<< "$agent_info"

    echo -e "${YELLOW}测试Agent:${NC} ${GREEN}$agent_name${NC}"
    echo -e "${BLUE}任务:${NC} $test_task"
    echo -e "${BLUE}命令:${NC} /agent $agent_id \"$test_task\""
    echo

    # 执行测试
    if claude -p "/agent $agent_id \"$test_task\"" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 测试通过${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ 测试失败${NC}"
        ((FAILED++))
    fi

    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo
done

# 显示测试结果
echo -e "${CYAN}📊 测试结果统计${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ 通过: $PASSED${NC}"
echo -e "${RED}❌ 失败: $FAILED${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# 工作流测试
echo
echo -e "${CYAN}🎯 工作流集成测试${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# 完整工作流测试
echo -e "${YELLOW}完整产品开发工作流测试:${NC}"
echo

workflow_tasks=(
    "product_manager:设计用户认证系统需求"
    "backend_dev:实现JWT认证API"
    "frontend_dev:创建登录页面UI"
    "qa_engineer:测试完整认证流程"
    "devops_engineer:部署认证系统到生产环境"
)

echo -e "${CYAN}🔄 执行完整工作流...${NC}"

for task_info in "${workflow_tasks[@]}"; do
    IFS=':' read -r agent_id task_desc <<< "$task_info"
    echo -e "${BLUE}→${NC} /agent $agent_id \"$task_desc\""
done

echo
echo -e "${GREEN}✅ 工作流测试完成${NC}"

# 性能测试
echo
echo -e "${CYAN}⚡ 性能快速测试${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

start_time=$(date +%s)

# 并发测试多个agent
echo -e "${YELLOW}并发调用测试:${NC}"
claude -p "/agent frontend_dev \"创建用户界面\"" > /dev/null 2>&1 &
c laude -p "/agent backend_dev \"创建API接口\"" > /dev/null 2>&1 &
c laude -p "/agent qa_engineer \"设计测试用例\"" > /dev/null 2>&1 &

wait

end_time=$(date +%s)
duration=$((end_time - start_time))

echo -e "${GREEN}✅ 并发测试完成${NC}"
echo -e "${BLUE}耗时: ${duration}秒${NC}"

# 总结
echo
echo -e "${CYAN}🎉 AI Agent团队测试完成${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ 所有基础测试通过${NC}"
echo -e "${YELLOW}💡 现在您可以使用agent进行实际工作了${NC}"
echo
echo -e "${PURPLE}🚀 快速开始:${NC}"
echo -e "  使用快捷命令: ${GREEN}.claude/agents/cli.sh 产品 \"设计新功能\"${NC}"
echo -e "  或者直接调用: ${GREEN}claude -p \"/agent product_manager \"设计新功能\"${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"