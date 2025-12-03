# 🎨 AI Agent Team 变更日志

> 📝 **基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/) 规范**
> 🏷️ **遵循 [语义化版本](https://semver.org/lang/zh-CN/)**
> 🎯 **采用 [Conventional Commits](https://www.conventionalcommits.org/) 规范**

---

## 🚧 [未发布] v1.0.5

### 🔄 代码重构
- 🔧 **changelog-generator**: 重命名入口文件为 `cli.js` 以符合 CLI 惯例
- 🛠️ **项目结构**: 优化各 Skill 的目录结构和配置

### 🐛 问题修复
- ✅ 修复 SKILL.md 文档中可能触发 Bash 权限检查的文本模式
- 🔒 修复依赖自动安装过程中的权限问题

### 📦 构建优化
- 📉 **包体积**: 为所有 Skill 添加 `.npmignore`，排除 `node_modules`
- ⚡ **性能**: 更新 `.npmignore` 配置，减小发布包体积

### 📚 文档更新
- 📖 更新项目说明和 README 文档
- 🔗 完善各 Skill 的使用指南
- 🎨 优化文档结构和可读性

---

## ✨ [v1.0.4] - 2025-12-03

### 🎯 主要特性
- 🤖 **智能体团队**: 完整的 6 大专业 AI 智能体架构
  - 📋 **产品经理** (`/pm`) - 需求分析和产品规划
  - 🎨 **前端开发** (`/fe`) - UI 实现和客户端逻辑
  - ⚙️ **后端开发** (`/be`) - API 设计和服务器端逻辑
  - 🔍 **QA工程师** (`/qa`) - 测试和质量保证
  - 🚀 **DevOps工程师** (`/ops`) - 部署和基础设施
  - 👨‍💻 **技术负责人** (`/tl`) - 技术决策和团队协调

### 🛠️ 核心功能
- ⚡ **快捷命令**: 中英文双语智能体调用系统
- 🔄 **工作流支持**: 顺序和并行开发模式
- 📊 **质量保证**: 内置代码审查和测试流程
- 🌍 **国际化**: 完整的中英文支持

### 📦 Skill 集成
- 🎨 **drawnote**: 智能笔记与流程图绘制工具
- 🧹 **tidymydesktop**: 智能桌面和目录整理工具
- 📄 **softcopyright**: 智能软件著作权申请材料生成
- 📋 **changelog-generator**: 智能变更日志生成器

---

## 🔧 [v1.0.3] - 2025-12-02

### 🚀 新增功能
- 🔗 **changelog-generator**: 集成智能变更日志生成技能
- 🛠️ **依赖管理**: 自动修复所有 Skill 的依赖安装问题

### 🐛 问题修复
- 🔧 **CLI 工具**: 更新以支持自动依赖修复功能

### 📦 构建系统
- 📋 优化 npm 包结构和发布配置

---

## 🎨 [v1.0.2] - 2025-12-01

### ✨ 主要更新
- 🧹 **TidyMyDesktop Skill**: 完整集成桌面整理功能
- 📸 **截图功能**: 添加 TidyMyDesktop 操作截图到发布日志
- 🏷️ **软著版本**: 完成 ai-agent-team 软著版本开发

### 📚 文档完善
- 📖 **README 优化**: 调整结构，将 TidyMyDesktop Skill 放在前面
- 🎨 **彩色说明**: 添加 v1.0.2 彩色手写笔记风格版本说明
- 📋 **发布指南**: 添加详细的 NPM 发布指南文档

### 🔧 配置优化
- 📦 **包管理**: 添加 `.npmignore` 文件，优化发布包体积
- 🎯 **仓库信息**: 优化 GitHub 仓库描述、标签和推广内容

---

## 🛠️ [v1.0.1] - 2025-11-25

### 🔧 问题修复
- 📦 **NPM 发布**: 修复 v1.0.1 npm 发布脚本问题
- 🔍 **忽略规则**: 更新文件忽略配置

### 📚 文档更新
- 🌟 **GitHub 优化**: 添加详细仓库描述、标签和推广内容
- 📖 **README**: 更新 v1.0.1 版本文档

---

## 🎉 [v1.0.0] - 2025-11-20

### 🚀 首次发布
- 🤖 **AI 智能体团队**: 基于 Claude Code 的专业 AI 智能体系统
- 👥 **六大角色**: 产品经理、前端开发、后端开发、测试工程师、运维工程师、技术负责人
- ⚡ **快捷命令**: 高效的中英文双语命令系统
- 🛠️ **CLI 工具**: 完整的命令行工具集
- 📚 **完整文档**: 详细的安装、配置和使用指南
- 🚀 **多方式安装**: 支持 curl、npm、本地安装等多种方式

### 📦 包管理
- 🌟 **NPM 集成**: 突出 npm 全局安装方式
- 🔧 **构建优化**: 完善的构建和发布流程

---

## 📊 版本管理规范

### 🏷️ 语义化版本 (SemVer)
- **主版本号 (Major)**: `1.x.x` - 不兼容的 API 修改
- **次版本号 (Minor)**: `x.1.x` - 向下兼容的功能性新增
- **修订号 (Patch)**: `x.x.1` - 向下兼容的问题修正

### 📝 变更类型 (Conventional Commits)
- ✨ `feat`: 新功能
- 🐛 `fix`: 问题修复
- 📚 `docs`: 文档更新
- 🎨 `style`: 代码格式调整
- 🔧 `refactor`: 代码重构
- ⚡ `perf`: 性能优化
- ✅ `test`: 测试相关
- 📦 `build`: 构建系统
- 👷 `ci`: CI 配置
- 🧹 `chore`: 日常维护
- 🔙 `revert`: 回滚操作

---

## 🎨 彩色标记说明

| 标记 | 含义 | 示例 |
|------|------|------|
| ✨ | 新功能 | 新增智能体技能 |
| 🐛 | 问题修复 | 修复依赖安装问题 |
| 📚 | 文档更新 | 完善 README 文档 |
| 🔧 | 配置变更 | 修改构建配置 |
| 🎯 | 主要特性 | 核心 AI 智能体架构 |
| 🚀 | 发布版本 | 新版本发布 |
| 🔄 | 重构优化 | 代码结构优化 |
| 🧹 | 日常维护 | 清理和优化 |
| 📦 | 构建系统 | npm 包管理 |
| 🎨 | 样式调整 | UI 和格式优化 |
| ⚡ | 性能提升 | 运行速度优化 |
| 🔒 | 安全修复 | 权限和安全问题 |
| 🌟 | 突出显示 | 重要更新 |
| 📋 | 说明文档 | 详细说明 |
| 🏷️ | 版本标签 | 版本号管理 |

---

## 🔗 相关链接

- 🏠 **项目主页**: [GitHub Repository](https://github.com/peterfei/ai-agent-team)
- 📦 **NPM 包**: [ai-agent-team](https://www.npmjs.com/package/ai-agent-team)
- 📖 **完整文档**: [README](https://github.com/peterfei/ai-agent-team#readme)
- 🐛 **问题反馈**: [Issues](https://github.com/peterfei/ai-agent-team/issues)
- 📄 **许可证**: [MIT License](LICENSE)

---

## 🤝 贡献指南

我们欢迎所有形式的贡献！请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详细信息。

### 📋 变更日志生成

本项目使用内置的 `changelog-generator` 技能自动生成变更日志：

```bash
# 🎨 生成彩色变更日志
skill changelog-generator

# 🚀 使用快捷命令
/changelog-generate
```

---

<div align="center">

### 🎉 AI Agent Team v1.0.4

**24/7 专业 AI 开发团队，让开发更高效！**

Made with ❤️ by [Peter Fei](https://github.com/peterfei)

*最后更新: 2025-12-03*

</div>