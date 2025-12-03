# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### 📦 Build System
- 为所有 Skill 添加 .npmignore 以排除 node_modules，减小包体积

## [1.0.3] - 2025-12-03

### 🔄 Refactoring
- 重命名 changelog-generator 入口文件为 cli.js 以符合惯例并修复调用错误

### 🐛 Bug Fixes
- 修复 SKILL.md 文档中可能触发 Bash 权限检查的文本模式

### 📝 Documentation
- 更新CHANGELOG.md

### 🚀 Features
- 集成 changelog-generator Skill 并修复依赖自动安装问题

### 📦 Build System
- 更新 .npmignore 以更严格地排除 node_modules，减小发布包体积

### 📚 Documentation Updates
- 更新README等文档

### 🔧 Configuration
- 添加.npmigore文件

## [1.0.2] - 2025-12-03

### 🎨 Features
- 完成ai-agent-team 软著版本开发

### 📚 Documentation
- 添加v1.0.2彩色手写笔记风格版本说明
- 添加NPM发布指南文档
- 调整README结构 - 将TidyMyDesktop Skill放在前面
- 更新README.md - 添加TidyMyDesktop Skill完整介绍

### 📸 Media
- 添加 TidyMyDesktop 截图到发布日志

## [1.0.2] - 2025-11-28

### 🆕 Features
- 完成v1.0.2，增加skill tidymydesktop 功能

### 📚 Documentation
- 更新v1.0.1 版本README

## [1.0.1] - 2025-11-25

### 🔧 Features
- 1.0.1 npm 发布脚本修复

### 🛠️ Configuration
- 更新忽略

### 📚 Documentation
- 优化GitHub仓库信息：添加详细描述、标签和推广内容

## [1.0.0] - 2025-11-20

### 🎉 初始版本：AI Agent Team - 基于Claude Code的专业AI智能体团队系统

#### ✨ 主要特性
- 🤖 六大专业智能体（产品经理、前端开发、后端开发、测试工程师、运维工程师、技术负责人）
- ⚡ 快捷命令系统，提升开发效率
- 🛠️ CLI工具，支持中英文智能体名称映射
- 📚 完整文档和使用指南
- 🚀 多种安装方式（curl、npm、本地安装）

#### 📦 Package Management
- 更新README.md：突出npm全局安装方式

---

## 版本说明

本项目的版本管理遵循 [语义化版本规范 (SemVer)](https://semver.org/)。

- **主版本号 (Major)**：不兼容的 API 修改
- **次版本号 (Minor)**：向下兼容的功能性新增
- **修订号 (Patch)**：向下兼容的问题修正

## 变更类型说明

本变更日志采用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat`: 新功能
- `fix`: 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响代码运行的变动）
- `refactor`: 重构（既不是新增功能，也不是修改bug的代码变动）
- `perf`: 性能优化
- `test`: 增加测试
- `build`: 构建系统或外部依赖的变动
- `ci`: CI配置文件和脚本的变动
- `chore`: 构建过程或辅助工具的变动
- `revert`: 回滚

## 如何生成变更日志

本项目使用内置的 `changelog-generator` 技能自动生成变更日志：

```bash
# 生成完整变更日志
skill changelog-generator

# 或使用快捷命令（如果已配置）
/changelog-generate
```

---

*本变更日志由 [changelog-generator](https://github.com/your-repo/changelog-generator) 自动生成*