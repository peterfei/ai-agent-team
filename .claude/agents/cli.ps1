#!/usr/bin/env pwsh

# AI Agent Team CLI PowerShell版本
# 使用方法: .\cli.ps1 [agent] [task]
# 示例: .\cli.ps1 pm "设计用户认证系统"

param(
    [Parameter(Position=0)]
    [string]$Agent,

    [Parameter(Position=1)]
    [string]$Task = ""
)

# 颜色定义
$colors = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    Blue = "Blue"
    Magenta = "Magenta"
    Cyan = "Cyan"
    White = "White"
}

# 智能体映射
$agentMap = @{
    "pm" = "product_manager"
    "product_manager" = "product_manager"
    "产品经理" = "product_manager"
    "fe" = "frontend_dev"
    "frontend_dev" = "frontend_dev"
    "前端开发" = "frontend_dev"
    "be" = "backend_dev"
    "backend_dev" = "backend_dev"
    "后端开发" = "backend_dev"
    "qa" = "qa_engineer"
    "qa_engineer" = "qa_engineer"
    "测试工程师" = "qa_engineer"
    "ops" = "devops_engineer"
    "devops_engineer" = "devops_engineer"
    "运维工程师" = "devops_engineer"
    "fs" = "fullstack_dev"
    "fullstack_dev" = "fullstack_dev"
    "全栈开发" = "fullstack_dev"
    "tl" = "tech-leader"
    "tech_leader" = "tech-leader"
    "技术负责人" = "tech-leader"
}

# 显示Logo
function Show-Logo {
    Write-Host @"

    ╔══════════════════════════════════════════════════════════════╗
    ║                                                              ║
    ║           🤖 AI Agent Team CLI PowerShell 版本                ║
    ║                                                              ║
    ║         基于Claude Code的专业AI智能体团队系统                ║
    ║                                                              ║
    ╚══════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan
}

# 显示帮助
function Show-Help {
    Write-Host "使用方法:" -ForegroundColor Green
    Write-Host "  .\cli.ps1 [智能体] [任务描述]" -ForegroundColor White
    Write-Host ""
    Write-Host "智能体列表:" -ForegroundColor Green
    Write-Host "  pm, product_manager, 产品经理     - 产品经理智能体" -ForegroundColor White
    Write-Host "  fe, frontend_dev, 前端开发       - 前端开发智能体" -ForegroundColor White
    Write-Host "  be, backend_dev, 后端开发        - 后端开发智能体" -ForegroundColor White
    Write-Host "  qa, qa_engineer, 测试工程师      - QA工程师智能体" -ForegroundColor White
    Write-Host "  ops, devops_engineer, 运维工程师  - DevOps工程师智能体" -ForegroundColor White
    Write-Host "  fs, fullstack_dev, 全栈开发        - 全栈开发智能体" -ForegroundColor White
    Write-Host "  tl, tech_leader, 技术负责人      - 技术负责人智能体" -ForegroundColor White
    Write-Host ""
    Write-Host "快捷命令:" -ForegroundColor Green
    Write-Host "  .\cli.ps1 pm '任务描述'           - 调用产品经理" -ForegroundColor White
    Write-Host "  .\cli.ps1 fe '任务描述'           - 调用前端开发" -ForegroundColor White
    Write-Host "  .\cli.ps1 be '任务描述'           - 调用后端开发" -ForegroundColor White
    Write-Host "  .\cli.ps1 qa '任务描述'           - 调用QA工程师" -ForegroundColor White
    Write-Host "  .\cli.ps1 ops '任务描述'          - 调用DevOps工程师" -ForegroundColor White
    Write-Host "  .\cli.ps1 fs '任务描述'           - 调用全栈开发" -ForegroundColor White
    Write-Host "  .\cli.ps1 tl '任务描述'           - 调用技术负责人" -ForegroundColor White
    Write-Host ""
    Write-Host "示例:" -ForegroundColor Green
    Write-Host "  .\cli.ps1 pm '设计用户认证系统'" -ForegroundColor Yellow
    Write-Host "  .\cli.ps1 fe '创建响应式登录页面'" -ForegroundColor Yellow
    Write-Host "  .\cli.ps1 be '实现JWT认证API'" -ForegroundColor Yellow
    Write-Host "  .\cli.ps1 qa '编写单元测试'" -ForegroundColor Yellow
    Write-Host "  .\cli.ps1 ops '部署到生产环境'" -ForegroundColor Yellow
    Write-Host "  .\cli.ps1 fs '开发用户认证功能'" -ForegroundColor Yellow
    Write-Host "  .\cli.ps1 tl '评估系统架构'" -ForegroundColor Yellow
}

# 执行Claude命令
function Invoke-ClaudeCommand {
    param(
        [string]$AgentName,
        [string]$TaskDesc
    )

    Write-Host "🚀 正在调用 $AgentName 智能体..." -ForegroundColor Yellow
    Write-Host "📝 任务: $TaskDesc" -ForegroundColor Blue
    Write-Host ""

    try {
        # 构建Claude命令
        $claudeCommand = "claude -p `"/agent $AgentName '$TaskDesc'`""

        # 执行命令
        Write-Host "执行命令: $claudeCommand" -ForegroundColor Gray
        Invoke-Expression $claudeCommand

        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ 任务执行完成" -ForegroundColor Green
        } else {
            Write-Host ""
            Write-Host "❌ 任务执行失败 (退出码: $LASTEXITCODE)" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "❌ 执行过程中出现错误: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 显示可用智能体
function Show-AvailableAgents {
    $agentsDir = Join-Path $PSScriptRoot ".."
    $agentFiles = Get-ChildItem -Path $agentsDir -Filter "*.md" | Where-Object { $_.Name -ne "README.md" }

    if ($agentFiles.Count -gt 0) {
        Write-Host "🤖 可用智能体:" -ForegroundColor Green
        Write-Host ""

        foreach ($file in $agentFiles) {
            $agentName = $file.BaseName
            $content = Get-Content -Path $file.FullName -Raw

            # 提取描述信息
            if ($content -match "#\s*([^\r\n]+)") {
                $title = $matches[1]
            } else {
                $title = $agentName
            }

            if ($content -match "##\s*专业能力\s*([^#]*?)(?=\s*##|$)") {
                $skills = $matches[1].Trim()
                # 简化显示
                if ($skills.Length -gt 50) {
                    $skills = $skills.Substring(0, 50) + "..."
                }
            } else {
                $skills = "专业AI智能体"
            }

            Write-Host "  • $agentName" -ForegroundColor Cyan
            Write-Host "    $title" -ForegroundColor White
            Write-Host "    $skills" -ForegroundColor Gray
            Write-Host ""
        }
    } else {
        Write-Host "❌ 未找到智能体配置文件" -ForegroundColor Red
        Write-Host "请检查 .claude/agents/ 目录是否存在 .md 文件" -ForegroundColor Yellow
    }
}

# 主逻辑
function Main {
    Show-Logo

    if ([string]::IsNullOrEmpty($Agent)) {
        Write-Host ""
        Write-Host "请指定智能体和任务描述" -ForegroundColor Yellow
        Show-Help
        Write-Host ""
        Show-AvailableAgents
        return
    }

    if ([string]::IsNullOrEmpty($Task)) {
        Write-Host ""
        Write-Host "请提供任务描述" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "使用方法: .\cli.ps1 [智能体] [任务描述]" -ForegroundColor White
        Write-Host "示例: .\cli.ps1 pm '设计用户认证系统'" -ForegroundColor Yellow
        return
    }

    # 映射智能体名称
    if ($agentMap.ContainsKey($Agent.ToLower())) {
        $resolvedAgent = $agentMap[$Agent.ToLower()]
    } else {
        Write-Host ""
        Write-Host "❌ 未知的智能体: $Agent" -ForegroundColor Red
        Write-Host ""
        Write-Host "可用的智能体:" -ForegroundColor Green
        foreach ($key in $agentMap.Keys) {
            Write-Host "  • $key -> $($agentMap[$key])" -ForegroundColor White
        }
        return
    }

    # 执行命令
    Invoke-ClaudeCommand -AgentName $resolvedAgent -TaskDesc $Task
}

# 检查Claude是否可用
$claudeExists = Get-Command "claude" -ErrorAction SilentlyContinue
if (-not $claudeExists) {
    Write-Host "❌ Claude Code未安装或不在PATH中" -ForegroundColor Red
    Write-Host "请确保Claude Code已安装并添加到系统PATH" -ForegroundColor Yellow
    Write-Host "安装地址: https://claude.ai/code" -ForegroundColor Cyan
    exit 1
}

# 执行主函数
Main