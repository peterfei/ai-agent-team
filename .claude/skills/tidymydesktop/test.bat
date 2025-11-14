@echo off
REM TidyMyDesktop Skill 测试脚本 (Windows)

echo ===================================
echo TidyMyDesktop Skill 测试
echo ===================================

REM 1. 创建测试目录
set TEST_DIR=%TEMP%\tidymydesktop-test-%RANDOM%
echo [1/5] 创建测试目录: %TEST_DIR%
mkdir "%TEST_DIR%"
cd /d "%TEST_DIR%"

REM 2. 创建测试文件
echo [2/5] 创建测试文件...
type nul > "Visual Studio Code v1.85.0.dmg"
type nul > "Visual Studio Code v1.84.2.dmg"
type nul > "Photoshop 2024.dmg"
type nul > "Slack v4.0.0.app"
type nul > "Slack v3.9.5.app"
type nul > "document.pdf"
type nul > "report.docx"
type nul > "screenshot.png"
type nul > "video.mp4"
type nul > "music.mp3"
echo 创建了 10 个测试文件

REM 3. 扫描测试
echo.
echo [3/5] 运行扫描测试...
cd /d "%USERPROFILE%\.claude\skills\tidymydesktop"
node scripts\run.js scripts\scan.js "%TEST_DIR%"

REM 4. Dry-run 测试
echo.
echo [4/5] 运行 Dry-run 整理测试...
node scripts\run.js scripts\organize.js --source "%TEST_DIR%" --dry-run

REM 5. 实际整理测试
echo.
echo [5/5] 执行实际整理...
node scripts\run.js scripts\organize.js --source "%TEST_DIR%" --report "%TEST_DIR%\report.md"

REM 显示结果
echo.
echo ===================================
echo 测试完成！
echo ===================================
echo.
echo 测试目录: %TEST_DIR%
echo 整理报告: %TEST_DIR%\report.md
echo.
echo 查看整理后的结构:
echo   dir "%TEST_DIR%" /s
echo.
echo 查看整理报告:
echo   type "%TEST_DIR%\report.md"
echo.
echo 清理测试环境:
echo   rmdir /s /q "%TEST_DIR%"
echo.
