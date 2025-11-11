@echo off
setlocal EnableDelayedExpansion

REM AI Agent Team 一键安装脚本 (Windows 批处理版本)
REM 使用方法: curl -fsSL https://raw.githubusercontent.com/peterfei/ai-agent-team/main/install.bat -o install.bat && install.bat

set VERSION=1.0.1
set REPO=peterfei/ai-agent-team
set BRANCH=main

REM 显示logo
call :ShowLogo

REM 检查参数
set FORCE_INSTALL=false
set SKIP_BACKUP=false

:parse_args
if "%~1"=="--force" (
    set FORCE_INSTALL=true
    shift
    goto parse_args
)
if "%~1"=="--skip-backup" (
    set SKIP_BACKUP=true
    shift
    goto parse_args
)
if "%~1"=="--help" goto show_help
if "%~1"=="-h" goto show_help
if not "%~1"=="" goto show_help

REM 检查系统要求
call :CheckRequirements

REM 备份配置
if "%FORCE_INSTALL%"=="false" call :BackupExisting

REM 创建临时目录
set TEMP_DIR=%TEMP%\ai-agent-team-%date:~0,4%%date:~5,2%%date:~8,2%%time:~0,2%%time:~3,2%%time:~6,2%
set TEMP_DIR=%TEMP_DIR: =0%
if not exist "%TEMP_DIR%" mkdir "%TEMP_DIR%"

REM 下载安装包
call :DownloadPackage "%TEMP_DIR%"

REM 解压安装包
call :ExtractPackage "%TEMP_DIR%"

REM 安装文件
call :InstallFiles "%TEMP_DIR%"

REM 验证安装
call :VerifyInstallation

REM 清理
if exist "%TEMP_DIR%" rmdir /s /q "%TEMP_DIR%"

REM 显示完成信息
call :ShowCompletion
goto end

REM ========================================
REM 功能函数
REM ========================================

:ShowLogo
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║           🤖 AI Agent Team 智能团队                          ║
echo ║                                                              ║
echo ║         基于Claude Code的专业AI智能体团队系统                ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
goto :eof

:show_help
echo AI Agent Team 一键安装脚本 (Windows 批处理版本)
echo.
echo 使用方法:
echo   install.bat
echo.
echo 选项:
echo   --force       强制安装，覆盖现有配置
echo   --skip-backup 跳过备份现有配置
echo   --help        显示帮助信息
echo.
echo 示例:
echo   install.bat
echo   install.bat --force
goto end

:CheckRequirements
echo 🔍 检查系统要求...

REM 检查Claude Code
where claude >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Claude Code未安装
    echo 请先安装Claude Code: https://claude.ai/code
    exit /b 1
)

REM 检查curl
where curl >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ curl不可用
    echo 请确保curl可用
    exit /b 1
)

echo ✅ 系统要求检查通过
goto :eof

:DownloadPackage
set TEMP_DIR=%~1
echo 📦 下载安装包...

set DOWNLOAD_URL=https://github.com/%REPO%/archive/refs/heads/%BRANCH%.zip
set ZIP_FILE=%TEMP_DIR%\ai-agent-team.zip

REM 使用curl下载
curl -fsSL "%DOWNLOAD_URL%" -o "%ZIP_FILE%"
if %errorlevel% neq 0 (
    echo ❌ 下载失败
    exit /b 1
)

echo ✅ 安装包下载完成
goto :eof

:ExtractPackage
set TEMP_DIR=%~1
echo 📂 解压安装包...

set ZIP_FILE=%TEMP_DIR%\ai-agent-team.zip
set EXTRACT_DIR=%TEMP_DIR%\extracted

if not exist "%EXTRACT_DIR%" mkdir "%EXTRACT_DIR%"

REM 使用tar解压 (Windows 10/11内置)
tar -xzf "%ZIP_FILE%" -C "%EXTRACT_DIR%"
if %errorlevel% neq 0 (
    echo ❌ 解压失败，尝试使用PowerShell...
    powershell -Command "Expand-Archive -Path '%ZIP_FILE%' -DestinationPath '%EXTRACT_DIR%' -Force"
    if %errorlevel% neq 0 (
        echo ❌ 解压失败
        exit /b 1
    )
)

echo ✅ 安装包解压完成
goto :eof

:BackupExisting
set CLAUDE_DIR=%USERPROFILE%\.claude
set BACKUP_DIR=%CLAUDE_DIR%\backup_%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set BACKUP_DIR=%BACKUP_DIR: =0%

if exist "%CLAUDE_DIR%\agents" or exist "%CLAUDE_DIR%\commands" (
    echo 💾 备份现有配置...

    if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

    if exist "%CLAUDE_DIR%\agents" move "%CLAUDE_DIR%\agents" "%BACKUP_DIR%\" >nul
    if exist "%CLAUDE_DIR%\commands" move "%CLAUDE_DIR%\commands" "%BACKUP_DIR%\" >nul
    if exist "%CLAUDE_DIR%\CLAUDE.md" copy "%CLAUDE_DIR%\CLAUDE.md" "%BACKUP_DIR%\" >nul

    echo ✅ 配置已备份到: %BACKUP_DIR%
)
goto :eof

:InstallFiles
set TEMP_DIR=%~1
echo 🚀 安装AI Agent Team...

set SOURCE_CLAUDE_DIR=%TEMP_DIR%\extracted\ai-agent-team-%BRANCH%\.claude
set TARGET_DIR=%USERPROFILE%\.claude

REM 创建目标目录
if not exist "%TARGET_DIR%" mkdir "%TARGET_DIR%"

REM 复制智能体配置
if exist "%SOURCE_CLAUDE_DIR%\agents" (
    xcopy /e /i /y "%SOURCE_CLAUDE_DIR%\agents" "%TARGET_DIR%\agents\" >nul
    echo ✅ 智能体配置安装完成
)

REM 复制快捷命令
if exist "%SOURCE_CLAUDE_DIR%\commands" (
    xcopy /e /i /y "%SOURCE_CLAUDE_DIR%\commands" "%TARGET_DIR%\commands\" >nul
    echo ✅ 快捷命令安装完成
)

REM 复制项目文档
if exist "%SOURCE_CLAUDE_DIR%\CLAUDE.md" (
    copy /y "%SOURCE_CLAUDE_DIR%\CLAUDE.md" "%TARGET_DIR%\" >nul
    echo ✅ 项目文档安装完成
)

REM 复制使用指南
if exist "%SOURCE_CLAUDE_DIR%\USAGE.md" (
    copy /y "%SOURCE_CLAUDE_DIR%\USAGE.md" "%TARGET_DIR%\" >nul
    echo ✅ 使用指南安装完成
)

REM 复制Skills
if exist "%SOURCE_CLAUDE_DIR%\skills" (
    xcopy /e /i /y "%SOURCE_CLAUDE_DIR%\skills" "%TARGET_DIR%\skills\" >nul
    echo ✅ Skills安装完成

    REM 安装DrawNote Skill依赖
    set DRANOTE_SKILL_DIR=%TARGET_DIR%\skills\drawnote
    if exist "%DRANOTE_SKILL_DIR%\package.json" (
        echo 📦 安装DrawNote Skill依赖...
        cd /d "%DRANOTE_SKILL_DIR%"
        call npm install --production --silent
        if %errorlevel% equ 0 (
            echo ✅ DrawNote Skill依赖安装完成
            echo 💡 提示: DrawNote Skill需要Playwright浏览器
            echo    运行以下命令安装: cd %%USERPROFILE%%\.claude\skills\drawnote && npx playwright install chromium
        ) else (
            echo ⚠️  Skill依赖安装失败，请手动运行:
            echo    cd %%USERPROFILE%%\.claude\skills\drawnote
            echo    npm install
            echo    npx playwright install chromium
        )
        cd /d "%~dp0"
    )
)
goto :eof

:VerifyInstallation
echo 🔍 验证安装...

set TARGET_DIR=%USERPROFILE%\.claude
set ERRORS=0

REM 检查智能体
if exist "%TARGET_DIR%\agents" (
    set AGENT_COUNT=0
    for %%f in ("%TARGET_DIR%\agents\*.md") do (
        if /i not "%%~nxf"=="README.md" set /a AGENT_COUNT+=1
    )
    echo ✅ 智能体配置 (!AGENT_COUNT! 个)
) else (
    echo ❌ 智能体配置缺失
    set /a ERRORS+=1
)

REM 检查命令
if exist "%TARGET_DIR%\commands" (
    set CMD_COUNT=0
    for %%f in ("%TARGET_DIR%\commands\*.md") do (
        if /i not "%%~nxf"=="README.md" set /a CMD_COUNT+=1
    )
    echo ✅ 快捷命令 (!CMD_COUNT! 个)
) else (
    echo ❌ 快捷命令缺失
    set /a ERRORS+=1
)

if %ERRORS% equ 0 (
    echo ✅ 安装验证通过
) else (
    echo ❌ 安装验证失败 (!ERRORS! 个错误)
    exit /b 1
)
goto :eof

:ShowCompletion
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                      🎉 安装完成！                            ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 🚀 快速开始:
echo.
echo # 使用快捷命令 (推荐)
echo /pm '设计用户认证系统'
echo /fe '创建登录页面'
echo /be '实现JWT认证API'
echo /qa '测试认证流程'
echo /ops '部署到生产环境'
echo /tl '评估系统架构'
echo.
echo # 使用完整命令
echo claude -p "/agent product_manager '设计用户认证系统'"
echo.
echo # 使用CLI工具
echo %%USERPROFILE%%\.claude\agents\cli.ps1 pm "设计用户认证系统"
echo.
echo # 使用Skills
echo 请帮我创建一个关于"人工智能"的信息图
echo 请使用彩色手写笔记风格生成"机器学习"的信息图
echo.
echo 📚 更多资源:
echo • 使用指南: %%USERPROFILE%%\.claude\USAGE.md
echo • 项目主页: https://github.com/%REPO%
echo • 问题反馈: https://github.com/%REPO%/issues
echo.
echo 💡 提示: 重启Claude Code以确保配置生效
echo.
echo 感谢使用 AI Agent Team! 🤖
echo.
goto :eof

:end
endlocal