# 更新日志

## [1.0.2] - 2025-01-14

### 🎯 TidyMyDesktop Skill - 全新桌面整理工具

#### ✨ 核心功能
- **智能文件分类**: 根据文件类型自动创建分类文件夹（应用程序、文档、图片、视频等）
- **版本去重**: 自动识别并清理软件的旧版本，保留最新版本
- **未知软件识别**: 通过网络搜索识别不熟悉的软件用途
- **安全整理**: 采用dry-run模式，确保用户完全掌控整理过程
- **详细报告**: 生成完整的Markdown格式整理报告

#### 🛠️ 支持的操作
- `帮我整理桌面` - 自动整理用户桌面
- `帮我整理当前目录` - 整理指定目录（需用户确认）
- 智能关键词搜索和分析

#### 📁 分类规则
- **应用程序**: 开发工具、办公软件、设计工具、通讯工具、娱乐软件、系统工具
- **文档**: PDF文档、Word文档、Excel表格、文本文件
- **媒体文件**: 图片（照片、截图、设计稿）、视频、音频
- **其他**: 压缩包、代码项目、未分类文件

#### 🔧 技术实现
- Node.js脚本支持（跨平台）
- 智能版本号识别（semver）
- 安全的文件操作（dry-run模式）
- 完整的错误处理机制
- 可执行脚本：`tidy-scan`, `tidy-organize`, `tidy-classify`

#### 📊 测试结果
- **功能测试**: 10/10 测试通过（100%通过率）
- **性能指标**: 扫描 < 0.1s，整理 < 0.5s，内存 ~50MB
- **兼容性**: 完美兼容现有drawnote skill和所有agents
- **实际效果**: [查看截图示例](examples/tidymydesktop.png)

### 🔄 改进内容
- **描述更新**: 更新package.json描述，移除机器人图标，添加tidymydesktop skill说明
- **构建优化**: 完善npm打包流程，优化文件包含结构
- **兼容性**: 确保所有现有skill和agent不受影响

### 📦 打包优化
- 文件完整性验证 ✅
- 依赖项正确包含 ✅
- 可执行脚本权限正确 ✅
- 本地安装/卸载测试 ✅

## [未发布]

## [1.0.1] - 2025-11-11

### 🎉 重大版本发布 - DrawNote Skill 集成

AI Agent Team v1.0.1 重大更新！集成专业的 DrawNote Skill 智能笔记功能，提供强大的可视化笔记生成能力。

### 🎨 DrawNote Skill - 核心亮点

#### 🚀 全新智能笔记系统
- **🎨 多彩风格模板**: 彩色手写笔记、专业商务、科技创新、自然清新、现代简约五种风格
- **📋 内置模板系统**: 无需外部文件，内置提示词模板和样式模板
- **🤖 智能内容生成**: 基于 AI 大模型，自动分析内容并生成最适合的笔记结构
- **🔗 无缝集成**: 与 Claude Code 完美集成，一键生成，自动保存

#### 📝 简化使用流程
1. **提供内容** - 输入想要可视化的文本内容
2. **选择风格** - 根据场景选择合适风格或让 AI 自动判断
3. **自动生成** - drawnote-skill 自动生成 HTML 格式的可视化笔记
4. **截图输出** - 使用 Playwright 自动截图，生成高质量 PNG 图片

#### 💡 丰富应用场景
- **📚 学习笔记总结**: 荧光笔高亮、彩色标注等学习元素
- **💼 商务报告可视化**: 数据分析、项目报告、战略规划
- **🔧 技术文档整理**: 技术架构、API文档、开发指南
- **📊 知识梳理总结**: 时间线、流程图、对比表等形式

#### ⚙️ 强大技术栈
- **HTML/CSS/JavaScript**: 现代化的 Web 技术栈
- **Playwright**: 高质量截图引擎
- **Node.js**: 稳定的运行环境
- **AI 大模型**: 智能内容分析和生成

### ✨ 文档更新

#### 📖 README.md 重大改版
- **DrawNote 内容前置**: 将 DrawNote Skill 作为核心特色功能重点展示
- **表格化展示**: 使用表格清晰展示核心功能特色和应用场景
- **实际效果展示**: 添加 drawnote_20251111_172200_2x2.png 实际生成效果
- **使用示例完善**: 增加 DrawNote Skill 的详细使用示例
- **视觉效果优化**: 改进文档布局和视觉呈现

#### 🎨 DrawNote 布局优化
- **2x2 网格布局**: 核心功能展示和应用场景采用统一的 2x2 网格布局
- **视觉一致性**: feature-grid 和 examples-grid 保持视觉一致性
- **实际效果展示**: 生成高质量的实际使用效果图片

### 🛠️ 技术改进

#### 📦 npm 包优化
- **依赖管理**: 完善 DrawNote Skill 的依赖自动安装机制
- **版本管理**: 统一版本号为 v1.0.1
- **发布流程**: 优化 npm 发布流程，确保完整性

#### 🔧 系统稳定性
- **错误处理**: 完善错误处理和日志记录
- **兼容性**: 确保 Claude Code 的最佳兼容性
- **性能优化**: 优化 DrawNote Skill 的生成性能

---

## 🎯 核心特性

### 六大专业智能体

1. **产品经理智能体** (`product_manager` / 快捷命令 `/pm`)
   - 产品规划、需求分析、用户研究
   - 竞品分析、路线图制定
   - 敏捷开发、利益相关者管理

2. **前端开发智能体** (`frontend_dev` / 快捷命令 `/fe`)
   - UI实现、组件开发、用户体验优化
   - React/Vue/Angular 框架支持
   - 响应式设计、性能优化

3. **后端开发智能体** (`backend_dev` / 快捷命令 `/be`)
   - API设计、数据库优化、服务器端逻辑
   - Node.js/Python/Java 多语言支持
   - 微服务架构、API 安全

4. **测试工程师智能体** (`qa_engineer` / 快捷命令 `/qa`)
   - 功能测试、自动化测试、质量保证
   - 单元测试、集成测试、端到端测试
   - Bug 追踪、性能测试

5. **DevOps工程师智能体** (`devops_engineer` / 快捷命令 `/ops`)
   - 部署运维、基础设施、CI/CD 流水线
   - Docker、Kubernetes、云服务
   - 监控告警、日志分析

6. **技术负责人智能体** (`tech-leader` / 快捷命令 `/tl`)
   - 技术决策、团队协调、架构设计
   - 系统架构、技术选型
   - 代码审查、最佳实践

---

## 🎨 DrawNote Skill - 智能笔记与流程图工具

### 核心功能
- 📝 **学习笔记可视化** - 将文字内容转化为精美的视觉笔记
- 🗺️ **知识梳理与总结** - 自动生成思维导图和信息图
- 📊 **流程图绘制** - 快速创建专业流程图和架构图
- 💡 **概念解释图表** - 复杂概念可视化呈现

### 五种精美风格
1. **专业商务风格**（默认）
   - 适用场景：商业报告、数据分析、项目演示
   - 特点：简洁专业、数据驱动

2. **彩色手写笔记风格** ⭐ 推荐
   - 适用场景：学习笔记、读书总结、知识整理
   - 特点：温馨自然、易于记忆

3. **科技创新风格**
   - 适用场景：技术文档、产品介绍、创新展示
   - 特点：现代科技、未来感强

4. **自然清新风格**
   - 适用场景：环保主题、健康生活、自然科学
   - 特点：清新淡雅、亲和力强

5. **现代简约风格**
   - 适用场景：极简设计、艺术展示、高端品牌
   - 特点：简约大气、设计感强

### 技术实现
- 基于 Playwright 的高质量截图引擎
- 自动生成 HTML 和 PNG 双格式文件
- 智能布局算法，自适应内容
- 支持自定义风格模板扩展

---

## 💡 使用示例

### 智能体快捷命令

```bash
# 产品经理
/pm "设计用户认证系统的产品需求文档"

# 前端开发
/fe "创建响应式登录页面组件，支持OAuth登录"

# 后端开发
/be "实现JWT认证API，包含刷新令牌机制"

# 测试工程师
/qa "编写认证流程的端到端测试用例"

# DevOps工程师
/ops "配置生产环境的Kubernetes部署文件"

# 技术负责人
/tl "评估当前系统架构，提供优化建议"
```

### DrawNote Skill 使用

```bash
# 基础使用
请帮我创建一个关于"人工智能发展历程"的信息图

# 指定风格
请使用彩色手写笔记风格生成"机器学习算法分类"的信息图

# 复杂内容
请创建一个关于"微服务架构设计模式"的流程图，使用科技创新风格
```

---

## 🛠️ 技术实现

### 智能体系统
- **原生集成**：基于 Claude Code 的原生智能体系统
- **提示词工程**：每个智能体都有精心设计的专业提示词
- **上下文理解**：智能理解项目上下文和技术栈
- **协作机制**：支持智能体间的工作流协作

### 安装系统
- **自动化安装**：一键安装所有配置和依赖
- **智能备份**：自动备份现有配置
- **权限管理**：自动设置脚本执行权限
- **依赖处理**：后台守护进程自动安装 Skill 依赖

### CLI 工具
- **双语支持**：支持中英文智能体名称
- **彩色输出**：美观的终端界面
- **状态检查**：实时查看安装状态
- **错误诊断**：智能错误提示和修复建议

---

## 🔧 安装说明

### npm 全局安装（推荐）

```bash
# 安装
npm install -g ai-agent-team

# 首次运行（自动触发依赖安装）
ai-agent-team status

# 等待 10-20 秒，守护进程会在后台安装 DrawNote Skill 依赖

# 验证安装
cd ~/.claude/skills/drawnote
npm run status

# 重启 Claude Code 以加载 Skills
```

### curl 快速安装

```bash
# macOS/Linux
curl -fsSL https://raw.githubusercontent.com/peterfei/ai-agent-team/main/scripts/install.sh | bash

# 安装完成后重启 Claude Code
```

### 手动安装

```bash
# 1. 克隆仓库
git clone https://github.com/peterfei/ai-agent-team.git
cd ai-agent-team

# 2. 安装依赖
npm install

# 3. 运行安装脚本
npm run postinstall

# 4. 安装 Skill 依赖
cd ~/.claude/skills/drawnote
npm install

# 5. 重启 Claude Code
```

---

## 📦 依赖说明

### 主包依赖
- **Node.js** >= 16.0.0
- **Claude Code** (必须安装)

### DrawNote Skill 依赖
- **Playwright** ^1.40.0
- **Playwright 浏览器** (Chromium)

### 自动安装机制
1. **postinstall 脚本**：复制配置文件，启动守护进程
2. **守护进程**：后台安装 Playwright 依赖（延迟 5 秒启动）
3. **CLI 检测**：首次运行 CLI 时检测并补充安装
4. **多重重试**：三种安装方法自动重试，确保成功

---

## 🔍 安装验证

### 检查安装状态

```bash
# 检查主包安装
ai-agent-team status

# 应该显示：
# ✅ Claude Code 已安装
# ✅ 智能体配置 (6 个)
# ✅ 快捷命令 (7 个)
# ✅ CLI工具

# 检查 Skill 安装
cd ~/.claude/skills/drawnote
npm run status

# 应该显示：
# ✅ node_modules
# ✅ playwright
# ✅ playwright-core
# ✅ DrawNote Skill 已完整安装并可用
```

### 查看守护进程日志

```bash
# 查看安装日志
cat ~/.claude/skills/drawnote/daemon.log

# 应该看到：
# [时间戳] DrawNote Skill 守护进程启动，开始安装依赖...
# [时间戳] 方法1: npm install playwright --save --force
# [时间戳] stdout: added 3 packages, and audited 4 packages in 3s
# [时间戳] ✅ 依赖安装成功 (方法1)
# [时间戳] ✅ Playwright 验证成功
# [时间戳] 守护进程退出
```

---

## 🚀 快速开始

### 1. 使用快捷命令（推荐）

在 Claude Code 中直接输入：

```bash
/pm "设计一个博客系统"
/be "实现文章发布API"
/fe "创建文章列表页面"
/qa "测试文章发布流程"
/ops "配置博客系统部署"
```

### 2. 使用 CLI 工具

```bash
# 查看帮助
ai-agent-team help

# 查看状态
ai-agent-team status

# 测试安装
ai-agent-team test
```

### 3. 使用 DrawNote Skill

在 Claude Code 中输入：

```bash
# 创建学习笔记
请帮我创建一个关于"React Hooks"的学习笔记

# 使用特定风格
请用彩色手写笔记风格生成"Python数据结构"的信息图

# 创建技术文档
请创建一个关于"微服务架构"的技术文档，使用科技创新风格
```

---

## 🎯 完整工作流示例

### 开发一个用户认证系统

```bash
# 1. 产品需求分析
/pm "设计用户认证系统，包含注册、登录、密码重置功能"

# 2. 技术架构评审
/tl "评估认证系统的技术选型，包括JWT vs Session"

# 3. 后端API开发
/be "实现基于JWT的认证API，包含刷新令牌机制"

# 4. 前端页面开发
/fe "创建登录、注册、密码重置的响应式页面"

# 5. 测试验证
/qa "编写认证流程的单元测试和集成测试"

# 6. 部署上线
/ops "配置认证服务的Kubernetes部署和监控"

# 7. 技术文档
请用专业商务风格创建"用户认证系统架构"的技术文档
```

---

## 📚 项目结构

```
ai-agent-team/
├── .claude/                          # Claude 配置目录
│   ├── agents/                       # 智能体配置
│   │   ├── product_manager.md       # 产品经理
│   │   ├── frontend_dev.md          # 前端开发
│   │   ├── backend_dev.md           # 后端开发
│   │   ├── qa_engineer.md           # 测试工程师
│   │   ├── devops_engineer.md       # DevOps工程师
│   │   ├── tech-leader.md           # 技术负责人
│   │   └── cli.sh / cli.ps1         # CLI工具脚本
│   ├── commands/                     # 快捷命令
│   │   ├── pm.md                     # 产品经理快捷命令
│   │   ├── fe.md                     # 前端快捷命令
│   │   ├── be.md                     # 后端快捷命令
│   │   ├── qa.md                     # 测试快捷命令
│   │   ├── ops.md                    # 运维快捷命令
│   │   └── tl.md                     # 技术负责人快捷命令
│   ├── skills/                       # Skills 目录
│   │   └── drawnote/                 # DrawNote Skill
│   │       ├── SKILL.md              # Skill 定义
│   │       ├── package.json          # 依赖配置
│   │       ├── scripts/              # 脚本目录
│   │       │   ├── capture.js        # 截图脚本
│   │       │   ├── install-dependencies.js
│   │       │   ├── verify-installation.js
│   │       │   └── check-status.js
│   │       └── styles/               # 风格模板
│   ├── CLAUDE.md                     # 项目说明
│   └── USAGE.md                      # 使用指南
├── bin/                              # CLI 工具
│   └── ai-agent-team.js             # CLI 主程序
├── scripts/                          # 安装脚本
│   ├── postinstall.js               # npm postinstall
│   ├── preinstall.js                # npm preinstall
│   └── install.sh                   # Shell 安装脚本
├── docs/                            # 文档
│   ├── BEST_PRACTICES.md           # 最佳实践
│   └── promotion/                   # 推广资料
├── package.json                     # npm 配置
├── README.md                        # 项目README
└── CHANGELOG.md                     # 更新日志
```

---

## 🔧 技术细节

### 守护进程安装机制

为了确保 DrawNote Skill 依赖自动安装，我们实现了一个智能守护进程系统：

#### 工作流程
1. **npm install -g ai-agent-team**
   - postinstall 脚本复制配置文件
   - 尝试启动守护进程（可能因环境原因失败）

2. **首次运行 ai-agent-team**
   - CLI 检测 Skill 依赖是否安装
   - 如果缺失，启动守护进程

3. **守护进程执行**
   - 延迟 5 秒启动（确保主进程退出）
   - 使用 spawn detached + unref() 真正后台运行
   - 创建锁文件防止重复安装

4. **多重重试机制**
   - **方法1**：`npm install playwright --save --force`
   - **方法2**：`npm install --force`
   - **方法3**：`rm -rf node_modules && npm install`
   - 每次安装后验证，成功则停止

5. **文件系统轮询**
   - npm 安装完成后，文件系统可能需要时间刷新
   - 2秒轮询等待，每 100ms 检查一次
   - 解决 "added packages" 但验证失败的问题

#### 日志记录
```bash
# 所有操作记录到日志文件
~/.claude/skills/drawnote/daemon.log

# 日志内容包括：
# - 进程启动时间和 PID
# - 每个安装方法的详细输出
# - npm stdout 和 stderr
# - 验证结果和路径检查
# - 错误信息和堆栈
```

### 解决的关键问题

#### 问题1：全局 Playwright 冲突
**现象**：`npm install` 显示 "up to date" 但实际未安装
**原因**：全局安装的 @playwright/mcp 包含 playwright，npm 认为依赖已满足
**解决**：直接安装包名 `npm install playwright --save --force`

#### 问题2：Bin 文件冲突
**现象**：`EEXIST: file already exists /usr/local/bin/playwright`
**原因**：全局 playwright bin 链接已存在
**解决**：使用 `--force` 标志强制覆盖

#### 问题3：文件系统延迟
**现象**：npm 显示 "added 3 packages" 但 node_modules 不存在
**原因**：文件系统刷新延迟
**解决**：添加 2秒轮询等待机制

---

## 📊 相对于初始版本的改进

### 系统稳定性
- ✅ 完善的依赖自动安装机制
- ✅ 多重重试和失败恢复
- ✅ 详细的日志记录和错误诊断
- ✅ 智能检测和补充安装

### 用户体验
- ✅ 一键安装，自动配置
- ✅ 后台静默安装依赖
- ✅ 清晰的安装进度提示
- ✅ 完善的状态检查工具
- ✅ 友好的错误提示和修复建议

### 功能完整性
- ✅ DrawNote Skill 完整集成
- ✅ 五种精美可视化风格
- ✅ Playwright 截图引擎
- ✅ 智能内容生成

### 文档完善
- ✅ 详细的安装指南
- ✅ 完整的使用示例
- ✅ 技术实现说明
- ✅ 故障排除指南

---

## ⚠️ 注意事项

### 安装时间
由于需要下载 Playwright（约 80MB），首次安装可能需要 2-5 分钟，具体取决于：
- 网络速度
- npm registry 镜像配置
- 机器性能

**这是正常的！** 请耐心等待，不要中断安装过程。

### Playwright 浏览器
Playwright npm 包会自动安装，但如果需要使用浏览器功能，需要单独安装：

```bash
cd ~/.claude/skills/drawnote
npx playwright install chromium
```

DrawNote Skill 的 postinstall 脚本会智能检测浏览器是否已安装，避免重复下载。

### 手动修复
如果自动安装失败，可以手动修复：

```bash
# 进入 Skill 目录
cd ~/.claude/skills/drawnote

# 运行验证脚本（会自动尝试修复）
npm run verify

# 或手动安装
npm install
npx playwright install chromium
```

---

## 🐛 故障排除

### 问题1：依赖未自动安装
**症状**：运行 DrawNote Skill 时提示 "Cannot find module 'playwright'"

**解决方案**：
```bash
# 方案1：运行验证工具（推荐）
cd ~/.claude/skills/drawnote
npm run verify

# 方案2：手动安装
cd ~/.claude/skills/drawnote
npm install

# 方案3：触发 CLI 检测
ai-agent-team status
# 等待 20 秒，守护进程会自动安装
```

### 问题2：守护进程未启动
**症状**：安装完成后，daemon.log 文件不存在

**解决方案**：
```bash
# 手动触发 CLI 检测
ai-agent-team status

# 检查日志
cat ~/.claude/skills/drawnote/daemon.log

# 查看安装状态
cd ~/.claude/skills/drawnote
npm run status
```

### 问题3：权限问题
**症状**：无法创建文件或安装依赖

**解决方案**：
```bash
# 检查目录权限
ls -la ~/.claude/skills/drawnote

# 修复权限（如果需要）
chmod -R 755 ~/.claude/skills/drawnote

# 重新安装
cd ~/.claude/skills/drawnote
npm install --force
```

---

## 📞 获取帮助

### 文档资源
- [README.md](README.md) - 项目介绍和快速开始
- [.claude/USAGE.md](.claude/USAGE.md) - 详细使用指南
- [docs/BEST_PRACTICES.md](docs/BEST_PRACTICES.md) - 最佳实践
- [.claude/skills/drawnote/SKILL.md](.claude/skills/drawnote/SKILL.md) - Skill 文档
- [.claude/skills/drawnote/风格使用指南.md](.claude/skills/drawnote/风格使用指南.md) - 风格说明

### 在线支持
- **GitHub Issues**: https://github.com/peterfei/ai-agent-team/issues
- **项目主页**: https://github.com/peterfei/ai-agent-team
- **讨论区**: https://github.com/peterfei/ai-agent-team/discussions

### 常用命令
```bash
# 查看 CLI 帮助
ai-agent-team help

# 检查安装状态
ai-agent-team status

# 测试安装
ai-agent-team test

# 查看版本
ai-agent-team version

# 检查 Skill 状态
cd ~/.claude/skills/drawnote && npm run status

# 验证和修复
cd ~/.claude/skills/drawnote && npm run verify

# 查看守护进程日志
cat ~/.claude/skills/drawnote/daemon.log
```

---

## 🎉 致谢

感谢以下技术和项目：
- [Claude](https://claude.ai/) - Anthropic 的 AI 助手
- [Claude Code](https://docs.claude.com/claude-code) - Claude 的代码编辑器
- [Playwright](https://playwright.dev/) - 浏览器自动化工具
- [Node.js](https://nodejs.org/) - JavaScript 运行时

---

## 📄 许可证

MIT License

Copyright (c) 2025 Peter Fei

---

## 🚀 下一步计划

- [ ] 支持更多编程语言的智能体
- [ ] 添加更多 DrawNote 风格模板
- [ ] 支持自定义智能体配置
- [ ] 集成更多开发工具
- [ ] 提供 Web 界面管理

---

**🎉 感谢使用 AI Agent Team！让 AI 成为你的开发伙伴！**

---

*最后更新: 2025-11-11*
*版本: 1.0.1*
*作者: Peter Fei*
