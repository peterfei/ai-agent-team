# 更新日志

## [v1.1.0] - 2025-01-14

### 🎉 新增平台支持

**Windows 支持**:
- ✨ 添加 Windows 批处理脚本：`scripts/run.bat`
- ✨ 创建 Windows 快捷命令：`tidy-scan.bat`, `tidy-organize.bat`, `tidy-classify.bat`
- ✨ 添加 Windows 测试脚本：`test.bat`

**跨平台支持**:
- ✨ 创建跨平台 Node.js 启动脚本：`scripts/run.js`
- ✨ 支持 Windows 10/11, macOS 10.14+, Linux (各种发行版)

### 改进
- 📝 更新 README 添加详细的平台支持说明
- 📝 为不同平台提供专门的使用示例
- 🔧 所有命令现在都有 Unix (`.sh`) 和 Windows (`.bat`) 版本

### 兼容性
- ✅ **Windows**: 使用 .bat 批处理文件
- ✅ **macOS**: 使用 .sh shell 脚本
- ✅ **Linux**: 使用 .sh shell 脚本
- ✅ **跨平台**: 使用 Node.js 脚本

---

## [v1.0.1] - 2025-01-14

### 新增
- ✨ 添加 `scripts/run.sh` 包装脚本，自动检测和处理 nvm
- ✨ 创建快捷命令：`tidy-scan`, `tidy-organize`, `tidy-classify`
- ✨ 自动检测 Node.js 版本并给出友好提示

### 改进
- 🔧 更新 `test.sh` 使用新的包装脚本
- 📝 更新 README 说明，明确 nvm 是可选的
- 🛡️ 增强错误处理，提供更清晰的错误信息

### 修复
- 🐛 修复没有安装 nvm 时脚本执行失败的问题
- 🐛 修复 package.json 中的循环依赖问题

### 兼容性
- ✅ 现在支持没有 nvm 的环境
- ✅ 自动使用系统默认 Node.js（如果可用）
- ✅ 向后兼容原有的使用方式

---

## [v1.0.0] - 2025-01-14

### 初始版本
- ✅ 文件扫描和分析功能
- ✅ 智能分类功能
- ✅ 版本检测和去重
- ✅ Dry-run 安全模式
- ✅ Markdown 报告生成
- ✅ 完整测试套件（10/10 通过）
- ✅ 详细文档和测试报告
