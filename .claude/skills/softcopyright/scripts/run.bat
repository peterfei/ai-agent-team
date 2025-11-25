@echo off
REM SoftCopyright 运行包装脚本 (Windows)

REM 检查 Node.js 是否可用
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 错误: 未找到 Node.js
    echo.
    echo 请安装 Node.js ^(^>= 14.0.0^):
    echo   - 使用 nvm-windows: https://github.com/coreybutler/nvm-windows
    echo   - 官方下载: https://nodejs.org/
    exit /b 1
)

REM 切换到 skill 目录并执行脚本
cd /d %USERPROFILE%\.claude\skills\softcopyright
node %*
