# AI Agent Team 一键安装脚本 (Windows)
# 使用方法: powershell -Command "irm 'https://raw.githubusercontent.com/peterfei/ai-agent-team/main/install.ps1' | iex"

param(
    [switch]$Force = $false,
    [switch]$SkipBackup = $false,
    [switch]$Help = $false
)

# 版本信息
$VERSION = "1.0.1"
$REPO = "peterfei/ai-agent-team"
$BRANCH = "main"

# 显示logo
function Show-Logo {
    Write-Host @"
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║           🤖 AI Agent Team 智能团队                          ║
║                                                              ║
║         基于Claude Code的专业AI智能体团队系统                ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan
}

# 显示帮助
function Show-Help {
    Write-Host "AI Agent Team 一键安装脚本 (Windows)"
    Write-Host ""
    Write-Host "使用方法:"
    Write-Host "  powershell -Command `"irm 'https://raw.githubusercontent.com/$REPO/main/install.ps1' | iex`""
    Write-Host ""
    Write-Host "选项:"
    Write-Host "  -Force       强制安装，覆盖现有配置"
    Write-Host "  -SkipBackup  跳过备份现有配置"
    Write-Host "  -Help        显示帮助信息"
    Write-Host ""
    Write-Host "示例:"
    Write-Host "  powershell -Command `"irm 'https://raw.githubusercontent.com/$REPO/main/install.ps1' | iex`""
    Write-Host "  powershell -Command `"irm 'https://raw.githubusercontent.com/$REPO/main/install.ps1' | iex`" -Force"
    exit 0
}

# 检查系统要求
function Check-Requirements {
    Write-Host "🔍 检查系统要求..." -ForegroundColor Yellow

    # 检查Claude Code
    $claudeExists = Get-Command "claude" -ErrorAction SilentlyContinue
    if (-not $claudeExists) {
        Write-Host "❌ Claude Code未安装" -ForegroundColor Red
        Write-Host "请先安装Claude Code: https://claude.ai/code" -ForegroundColor Yellow
        exit 1
    }

    # 检查PowerShell版本
    if ($PSVersionTable.PSVersion.Major -lt 5) {
        Write-Host "❌ PowerShell版本过低" -ForegroundColor Red
        Write-Host "请升级PowerShell到5.0或更高版本" -ForegroundColor Yellow
        exit 1
    }

    # 检查curl (Windows 10/11内置)
    $curlExists = Get-Command "curl" -ErrorAction SilentlyContinue
    if (-not $curlExists) {
        Write-Host "❌ curl不可用" -ForegroundColor Red
        Write-Host "请确保curl可用" -ForegroundColor Yellow
        exit 1
    }

    Write-Host "✅ 系统要求检查通过" -ForegroundColor Green
}

# 获取平台信息
function Get-Platform {
    $os = "windows"
    $arch = $env:PROCESSOR_ARCHITECTURE.ToLower()

    switch ($arch) {
        "amd64" { $arch = "x64" }
        "x86" { $arch = "x86" }
        "arm64" { $arch = "arm64" }
        default {
            Write-Host "❌ 不支持的架构: $arch" -ForegroundColor Red
            exit 1
        }
    }

    return "$os-$arch"
}

# 创建临时目录
function New-TempDirectory {
    $tempDir = Join-Path $env:TEMP "ai-agent-team-$(Get-Date -Format 'yyyyMMddHHmmss')"
    New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
    return $tempDir
}

# 下载安装包
function Download-Package {
    param($TempDir)

    Write-Host "📦 下载安装包..." -ForegroundColor Yellow

    $downloadUrl = "https://github.com/$REPO/archive/refs/heads/$BRANCH.zip"
    $zipFile = Join-Path $TempDir "ai-agent-team.zip"

    try {
        # 使用内置的Net.HttpClient下载
        $client = New-Object System.Net.Http.HttpClient
        $response = $client.GetAsync($downloadUrl).Result
        $response.EnsureSuccessStatusCode()
        $fileBytes = $response.Content.ReadAsByteArrayAsync().Result
        [System.IO.File]::WriteAllBytes($zipFile, $fileBytes)
        $client.Dispose()

        Write-Host "✅ 安装包下载完成" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ 下载失败: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# 解压安装包
function Extract-Package {
    param($TempDir)

    Write-Host "📂 解压安装包..." -ForegroundColor Yellow

    $zipFile = Join-Path $TempDir "ai-agent-team.zip"
    $extractDir = Join-Path $TempDir "extracted"

    try {
        # 使用.NET的ZipFile类解压
        Add-Type -AssemblyName System.IO.Compression.FileSystem
        [System.IO.Compression.ZipFile]::ExtractToDirectory($zipFile, $extractDir)

        # 查找解压后的目录
        $extractedDir = Get-ChildItem -Path $extractDir -Directory | Select-Object -First 1

        if (-not $extractedDir) {
            Write-Host "❌ 解压失败" -ForegroundColor Red
            exit 1
        }

        Write-Host "✅ 安装包解压完成" -ForegroundColor Green
        return $extractedDir.FullName
    }
    catch {
        Write-Host "❌ 解压失败: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# 备份现有配置
function Backup-Existing {
    $claudeDir = Join-Path $env:USERPROFILE ".claude"
    $backupDir = Join-Path $claudeDir "backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"

    if (Test-Path (Join-Path $claudeDir "agents") -or (Test-Path (Join-Path $claudeDir "commands"))) {
        Write-Host "💾 备份现有配置..." -ForegroundColor Yellow

        New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

        $agentsDir = Join-Path $claudeDir "agents"
        if (Test-Path $agentsDir) {
            Move-Item -Path $agentsDir -Destination $backupDir -Force
        }

        $commandsDir = Join-Path $claudeDir "commands"
        if (Test-Path $commandsDir) {
            Move-Item -Path $commandsDir -Destination $backupDir -Force
        }

        $claudeMd = Join-Path $claudeDir "CLAUDE.md"
        if (Test-Path $claudeMd) {
            Copy-Item -Path $claudeMd -Destination $backupDir -Force
        }

        Write-Host "✅ 配置已备份到: $backupDir" -ForegroundColor Green
    }
}

# 安装文件
function Install-Files {
    param($SourceDir)

    Write-Host "🚀 安装AI Agent Team..." -ForegroundColor Yellow

    $sourceClaudeDir = Join-Path $SourceDir ".claude"
    $targetDir = Join-Path $env:USERPROFILE ".claude"

    # 创建目标目录
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null

    # 复制智能体配置
    $agentsSource = Join-Path $sourceClaudeDir "agents"
    if (Test-Path $agentsSource) {
        Copy-Item -Path $agentsSource -Destination $targetDir -Recurse -Force
        Write-Host "✅ 智能体配置安装完成" -ForegroundColor Green
    }

    # 复制快捷命令
    $commandsSource = Join-Path $sourceClaudeDir "commands"
    if (Test-Path $commandsSource) {
        Copy-Item -Path $commandsSource -Destination $targetDir -Recurse -Force
        Write-Host "✅ 快捷命令安装完成" -ForegroundColor Green
    }

    # 复制项目文档
    $claudeMd = Join-Path $sourceClaudeDir "CLAUDE.md"
    if (Test-Path $claudeMd) {
        Copy-Item -Path $claudeMd -Destination $targetDir -Force
        Write-Host "✅ 项目文档安装完成" -ForegroundColor Green
    }

    # 复制使用指南
    $usageMd = Join-Path $sourceClaudeDir "USAGE.md"
    if (Test-Path $usageMd) {
        Copy-Item -Path $usageMd -Destination $targetDir -Force
        Write-Host "✅ 使用指南安装完成" -ForegroundColor Green
    }

    # 复制Skills
    $skillsSource = Join-Path $sourceClaudeDir "skills"
    if (Test-Path $skillsSource) {
        $targetSkillsDir = Join-Path $targetDir "skills"
        Copy-Item -Path $skillsSource -Destination $targetSkillsDir -Recurse -Force
        Write-Host "✅ Skills安装完成" -ForegroundColor Green

        # 安装DrawNote Skill依赖
        $drawnoteSkillDir = Join-Path $targetSkillsDir "drawnote"
        if (Test-Path $drawnoteSkillDir) {
            $packageJson = Join-Path $drawnoteSkillDir "package.json"
            if (Test-Path $packageJson) {
                Write-Host "📦 安装DrawNote Skill依赖..." -ForegroundColor Yellow

                try {
                    Push-Location $drawnoteSkillDir
                    npm install --production --silent
                    Pop-Location
                    Write-Host "✅ DrawNote Skill依赖安装完成" -ForegroundColor Green
                    Write-Host "💡 提示: DrawNote Skill需要Playwright浏览器" -ForegroundColor Yellow
                    Write-Host "   运行以下命令安装: cd ~/.claude/skills/drawnote && npx playwright install chromium" -ForegroundColor Yellow
                }
                catch {
                    Write-Host "⚠️  Skill依赖安装失败，请手动运行:" -ForegroundColor Yellow
                    Write-Host "   cd ~/.claude/skills/drawnote" -ForegroundColor Yellow
                    Write-Host "   npm install" -ForegroundColor Yellow
                    Write-Host "   npx playwright install chromium" -ForegroundColor Yellow
                }
            }
        }
    }
}

# 验证安装
function Verify-Installation {
    Write-Host "🔍 验证安装..." -ForegroundColor Yellow

    $targetDir = Join-Path $env:USERPROFILE ".claude"
    $errors = 0

    # 检查智能体
    $agentsDir = Join-Path $targetDir "agents"
    if (Test-Path $agentsDir) {
        $agentCount = Get-ChildItem -Path $agentsDir -Filter "*.md" | Where-Object { $_.Name -ne "README.md" } | Measure-Object | Select-Object -ExpandProperty Count
        Write-Host "✅ 智能体配置 ($agentCount 个)" -ForegroundColor Green
    } else {
        Write-Host "❌ 智能体配置缺失" -ForegroundColor Red
        $errors++
    }

    # 检查命令
    $commandsDir = Join-Path $targetDir "commands"
    if (Test-Path $commandsDir) {
        $cmdCount = Get-ChildItem -Path $commandsDir -Filter "*.md" | Where-Object { $_.Name -ne "README.md" } | Measure-Object | Select-Object -ExpandProperty Count
        Write-Host "✅ 快捷命令 ($cmdCount 个)" -ForegroundColor Green
    } else {
        Write-Host "❌ 快捷命令缺失" -ForegroundColor Red
        $errors++
    }

    if ($errors -eq 0) {
        Write-Host "✅ 安装验证通过" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ 安装验证失败 ($errors 个错误)" -ForegroundColor Red
        return $false
    }
}

# 显示完成信息
function Show-Completion {
    Write-Host @"

╔══════════════════════════════════════════════════════════════╗
║                      🎉 安装完成！                            ║
╚══════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

    Write-Host "🚀 快速开始:" -ForegroundColor Green
    Write-Host ""
    Write-Host "# 使用快捷命令 (推荐)" -ForegroundColor Blue
    Write-Host "/pm '设计用户认证系统'" -ForegroundColor Yellow
    Write-Host "/fe '创建登录页面'" -ForegroundColor Yellow
    Write-Host "/be '实现JWT认证API'" -ForegroundColor Yellow
    Write-Host "/qa '测试认证流程'" -ForegroundColor Yellow
    Write-Host "/ops '部署到生产环境'" -ForegroundColor Yellow
    Write-Host "/tl '评估系统架构'" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "# 使用完整命令" -ForegroundColor Blue
    Write-Host "claude -p `"/agent product_manager '设计用户认证系统'`"" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "# 使用CLI工具" -ForegroundColor Blue
    Write-Host "~/.claude/agents/cli.ps1 pm '设计用户认证系统'" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "# 使用Skills" -ForegroundColor Blue
    Write-Host "请帮我创建一个关于`"人工智能`"的信息图" -ForegroundColor Yellow
    Write-Host "请使用彩色手写笔记风格生成`"机器学习`"的信息图" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📚 更多资源:" -ForegroundColor Green
    Write-Host "• 使用指南: ~/.claude/USAGE.md" -ForegroundColor Blue
    Write-Host "• 项目主页: https://github.com/$REPO" -ForegroundColor Blue
    Write-Host "• 问题反馈: https://github.com/$REPO/issues" -ForegroundColor Blue
    Write-Host ""
    Write-Host "💡 提示: 重启Claude Code以确保配置生效" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "感谢使用 AI Agent Team! 🤖" -ForegroundColor Cyan
}

# 主安装流程
function Main {
    Show-Logo

    if ($Help) {
        Show-Help
    }

    Check-Requirements

    if (-not $Force) {
        Backup-Existing
    }

    $tempDir = New-TempDirectory
    try {
        Download-Package -TempDir $tempDir
        $extractedDir = Extract-Package -TempDir $tempDir
        Install-Files -SourceDir $extractedDir

        if (Verify-Installation) {
            Show-Completion
        } else {
            Write-Host "❌ 安装失败，请检查错误信息" -ForegroundColor Red
            exit 1
        }
    }
    finally {
        # 清理临时目录
        Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}

# 执行安装
Main @args