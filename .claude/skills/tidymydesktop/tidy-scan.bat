@echo off
REM TidyMyDesktop - 扫描命令 (Windows)

set SKILL_DIR=%USERPROFILE%\.claude\skills\tidymydesktop

call "%SKILL_DIR%\scripts\run.bat" "%SKILL_DIR%\scripts\scan.js" %*
