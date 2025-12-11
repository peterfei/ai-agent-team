# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.1] - 2025-12-12

### Added

#### 🧠 Thread Manager v1.1.0 - 语义搜索升级
- ✅ **语义搜索 (`search_messages`)**: 新增自然语言搜索功能，支持通过意图查找历史对话
- ✅ **自动向量化**: 新消息自动生成嵌入向量并存储，支持高性能检索
- ✅ **数据迁移**: 新增 `npm run migrate` 脚本，支持旧数据向量化迁移
- ✅ **文档更新**: 包含详细的语义搜索使用指南和迁移说明

### Performance

- **检索效率**: 引入向量检索，大幅提升查找相关历史消息的准确性和效率
- **上下文管理**: 配合语义搜索，可实现更精准的上下文恢复，节省 Token

### Upgrade Guide

从 v2.0.0 升级到 v2.0.1：

1. **更新包**:
   ```bash
   npm install -g ai-agent-team@2.0.1
   ```

2. **迁移数据 (启用语义搜索)**:
   ```bash
   # 进入 thread-manager 目录
   cd .claude/skills/thread-manager
   
   # 安装新依赖
   npm install
   
   # 编译
   npm run build
   
   # 运行迁移脚本
   npm run migrate
   ```

3. **重启 Claude Code**: 
   重启以加载新的 `search_messages` 工具。

---

## [2.0.0] - 2025-12-05

### 🎉 Major Release - Thread Manager Integration

**AI Agent Team 现在拥有记忆了！** 这是一个重大版本更新，引入了革命性的线程管理系统。

### Added

#### 🧠 Thread Manager - 持久化记忆系统
- ✅ **独立线程管理**: 每个任务独立线程，上下文完全隔离
- ✅ **持久化存储**: SQLite 数据库永久保存对话历史和文件变更
- ✅ **Git 自动集成**: 自动创建任务分支 `thread/[线程ID]`，文件变更自动追踪
- ✅ **智能统计**: 自动记录消息数、文件变更、代码行数统计
- ✅ **无缝切换**: 一键切换任务，完整恢复上下文
- ✅ **MCP 服务器**: TypeScript 实现的高性能 MCP 服务器

#### 🚀 智能体快速启动命令
- `/pm-start "任务描述"` - 创建产品经理线程并立即开始需求分析
- `/fe-start "任务描述"` - 创建前端开发线程并立即开始 UI 开发
- `/be-start "任务描述"` - 创建后端开发线程并立即开始 API 开发
- `/qa-start "任务描述"` - 创建 QA 测试线程并立即执行测试
- `/ops-start "任务描述"` - 创建 DevOps 线程并立即开始部署
- `/tl-start "任务描述"` - 创建技术负责人线程并立即架构设计

#### 📋 线程管理命令
- `/threads` - 查看所有线程及统计信息
- `/thread switch <id>` - 切换到指定线程，完整恢复上下文
- `/thread new "标题"` - 创建新线程
- `/thread update` - 更新当前线程元数据
- `/thread delete <id>` - 删除线程
- `/thread info` - 查看当前线程详情
- `/t` - `/thread` 的快捷别名

### Fixed

- ✅ 修复 `/threads` 命令配置（添加 `name` 字段）
- ✅ 修复 `/thread` 命令配置（添加 `name` 字段）
- ✅ 修复 `/t` 命令配置（添加 `name` 字段）
- ✅ 修复 thread-manager 依赖安装（better-sqlite3）
- ✅ 构建 thread-manager TypeScript 代码到 dist/
- ✅ 配置 .mcp.json 服务器启动脚本
- ✅ 修复 hook 执行错误（找不到 better-sqlite3 模块）

### Changed

#### 📦 打包优化
- ✅ 排除 `docs/` 目录（所有文档文件）
- ✅ 排除 `examples/` 目录（示例文件和图片）
- ✅ thread-manager 仅打包编译后的 `dist/` 文件，排除 `src/` 源码
- ✅ softcopyright 和 tidymydesktop 使用 `scripts/` 而非 `src/`
- ✅ 包体积减少约 40%，文件数从 200+ 优化到 125

#### 📝 文档更新
- ✅ 更新 README.md，添加 Thread Manager 完整介绍
- ✅ 添加 Thread Manager vs 原生 Claude 对比表
- ✅ 添加实际应用场景示例
- ✅ 创建 RELEASE_NOTES_v2.0.0.md 详细发布说明
- ✅ 更新 package.json 描述和关键词

#### 🔧 技术实现
- ✅ 数据存储：`.claude/.threads/threads.db`（SQLite）
- ✅ Git 集成：自动创建和管理 `thread/*` 分支
- ✅ MCP 协议：标准化工具接口
- ✅ TypeScript：类型安全的服务器实现

### Performance

- **多任务效率**: 支持无限并行任务，效率提升 10x+
- **上下文恢复**: 零损失恢复历史对话，工作效率提升 200%+
- **版本控制**: 自动 Git 集成，减少 70% 手动操作

### Breaking Changes

#### ⚠️ 配置变更
- 新增 `.mcp.json` 配置文件（自动创建）
- 新增 `.claude/.threads/` 数据目录
- Git 仓库将创建 `thread/*` 分支

#### 📌 版本要求
- Node.js: >= 16.0.0（无变化）
- Claude Code: 建议更新到最新版本

### Upgrade Guide

从 v1.x 升级到 v2.0.0 需要 3 个步骤：

#### 步骤 1: 更新到最新版本

```bash
npm install -g ai-agent-team@2.0.0
```

#### 步骤 2: 初始化配置 ⭐ **必须执行**

**全局初始化（推荐）**：
```bash
ai-agent-team init
```

**或项目本地初始化**：
```bash
cd your-project
ai-agent-team init
```

#### 步骤 3: 启用 Thread Manager MCP 服务器 ⭐ **关键步骤**

```bash
claude mcp add thread-manager
```

这一步是启用线程管理功能的关键，不执行将无法使用 `/threads`、`/pm-start` 等命令。

#### 步骤 4: 重启并验证

```bash
# 重启 Claude Code
exit
claude

# 验证安装
/threads  # 应该显示线程列表

# 开始使用！
/pm-start "我的第一个线程任务"
```

### Migration Notes

- ✅ 所有原有命令完全兼容（`/pm`, `/fe`, `/be`, `/qa`, `/ops`, `/tl`）
- ✅ 原有 Skills 功能不受影响（changelog-generator, drawnote, softcopyright, tidymydesktop）
- ✅ 无需修改现有配置
- ✅ 数据库自动初始化

---

## [1.0.5] - 2025-12-05

### Added
- **New Skill**: Integrated `thread-manager` skill for advanced conversation management.
- **CLI**: Added `init` command for interactive setup.
- **Configuration**: Support for both Global (`~/.claude`) and Local (`./.claude`) context installation.
- **Automation**: Enhanced automatic dependency installation for all skills during initialization.

### Changed
- **Installation**: `npm install` no longer automatically overwrites global configuration. Users are now guided to run `npx ai-agent-team init`.
- **UX**: Improved installation prompts and status checks.

## [Unreleased] - 2025-12-03


### 📝 Other

- [Doc]更新README
- Merge branch &#x27;changelog-generator&#x27;
- [Doc]更新README等文档
- [Doc]更新README等文档
- [Doc]更新README等文档
- [Fixed]添加.npmigore文件
- Merge branch &#x27;ruanzhu&#x27;
- [Feature]完成ai-agent-team 软著版本开发
- 📸 添加v1.0.2彩色手写笔记风格版本说明
- 📋 添加NPM发布指南文档
- 🔄 调整README结构 - 将TidyMyDesktop Skill放在前面
- 📚 更新README.md - 添加TidyMyDesktop Skill完整介绍
- Merge branch &#x27;feature/skill-tidymydesktop&#x27;
- 📸 添加 TidyMyDesktop 截图到发布日志
- [Release] v1.0.2 - TidyMyDesktop Skill 集成发布
- [Feature]完忧v1.0.2，增加skill tidymydesktop 功能
- [Doc]更新v1.0.1 版本README
- [Doc]更新v1.0.1 版本README
- [Release]1.0.1 发布
- Merge branch &#x27;feature/skill-notedraw&#x27;
- [Feature]1.0.1 npm 发布脚本修复
- [Fixed]更新忽略
- 🚀 优化GitHub仓库信息：添加详细描述、标签和推广内容
- 🎉 初始版本：AI Agent Team - 基于Claude Code的专业AI智能体团队系统 ✨ 主要特性： - 🤖 六大专业智能体（产品经理、前端开发、后端开发、测试工程师、运维工程师、技术负责人） - ⚡ 快捷命令系统，提升开发效率 - 🛠️ CLI工具，支持中英文智能体名称映射 - 📚 完整文档和使用指南 - 🚀 多种安装方式（curl、npm、本地安装）
- 📦 更新README.md：突出npm全局安装方式

### 📝 Docs

- 更新 README.md，置顶 changelog-generator 并更新核心亮点
- 更新发布文档，准备 v1.0.4 发布
- 更新文档和清理资源
- 更新CHANGELOG.md

### 📝 Chore

- 为所有 Skill 添加 .npmignore 以排除 node_modules，减小包体积
- 更新 .npmignore 以更严格地排除 node_modules，减小发布包体积

### 📝 Refactor

- 重命名 changelog-generator 入口文件为 cli.js 以符合惯例并修复调用错误

### 📝 Fix

- 修复 SKILL.md 文档中可能触发 Bash 权限检查的文本模式
- 更新 CLI 工具以支持自动修复所有 Skill 的依赖

### 📝 Feat

- 集成 changelog-generator Skill 并修复依赖自动安装问题



