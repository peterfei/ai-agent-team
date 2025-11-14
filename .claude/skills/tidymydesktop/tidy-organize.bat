@echo off
REM TidyMyDesktop - 整理命令 (Windows)

set SKILL_DIR=%USERPROFILE%\.claude\skills\tidymydesktop

call "%SKILL_DIR%\scripts\run.bat" "%SKILL_DIR%\scripts\organize.js" %*
