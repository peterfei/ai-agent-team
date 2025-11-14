@echo off
REM TidyMyDesktop 运行包装脚本 (Windows)
REM 自动检测并使用合适的 Node.js 版本

REM 检查 Node.js 是否可用
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo 错误: 未找到 Node.js
    echo.
    echo 请安装 Node.js ^(^>= 14.0.0^):
    echo   - 官方下载: https://nodejs.org/
    echo   - 使用 nvm-windows: https://github.com/coreybutler/nvm-windows
    echo   - 使用 Chocolatey: choco install nodejs
    exit /b 1
)

REM 检查 Node.js 版本
for /f "tokens=1 delims=." %%a in ('node -v') do set NODE_MAJOR=%%a
set NODE_MAJOR=%NODE_MAJOR:~1%

if %NODE_MAJOR% LSS 14 (
    echo 警告: Node.js 版本过低 ^(当前: %NODE_MAJOR%.x, 要求: ^>= 14.0.0^)
    echo 建议升级 Node.js
)

REM 切换到 skill 目录
cd /d "%USERPROFILE%\.claude\skills\tidymydesktop"

REM 执行传入的脚本
node %*
