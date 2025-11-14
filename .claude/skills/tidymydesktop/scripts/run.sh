#!/bin/bash

# TidyMyDesktop 运行包装脚本
# 自动检测 nvm 并使用合适的 Node.js 版本

# 检查是否安装了 nvm
if [ -f ~/.nvm/nvm.sh ]; then
    # 使用 nvm
    source ~/.nvm/nvm.sh > /dev/null 2>&1
    nvm use 18 > /dev/null 2>&1
fi

# 检查 Node.js 是否可用
if ! command -v node &> /dev/null; then
    echo "错误: 未找到 Node.js"
    echo ""
    echo "请安装 Node.js (>= 14.0.0):"
    echo "  - 使用 nvm: https://github.com/nvm-sh/nvm"
    echo "  - 使用 Homebrew: brew install node"
    echo "  - 官方下载: https://nodejs.org/"
    exit 1
fi

# 检查 Node.js 版本
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 14 ]; then
    echo "警告: Node.js 版本过低 (当前: $(node -v), 要求: >= v14.0.0)"
    echo "建议升级 Node.js"
fi

# 执行传入的脚本
cd ~/.claude/skills/tidymydesktop
exec node "$@"
