@echo off
REM SoftCopyright - 生成源代码文档 (Windows)

set SKILL_DIR=%USERPROFILE%\.claude\skills\softcopyright

call "%SKILL_DIR%\scripts\run.bat" "%SKILL_DIR%\scripts\cli.js" source %*
