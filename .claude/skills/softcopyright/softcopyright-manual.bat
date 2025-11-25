@echo off
REM SoftCopyright - 生成软件说明书 (Windows)

set SKILL_DIR=%USERPROFILE%\.claude\skills\softcopyright

call "%SKILL_DIR%\scripts\run.bat" "%SKILL_DIR%\scripts\cli.js" manual %*
