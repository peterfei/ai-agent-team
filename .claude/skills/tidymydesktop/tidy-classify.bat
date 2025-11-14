@echo off
REM TidyMyDesktop - 分类命令 (Windows)

set SKILL_DIR=%USERPROFILE%\.claude\skills\tidymydesktop

call "%SKILL_DIR%\scripts\run.bat" "%SKILL_DIR%\scripts\classify.js" %*
