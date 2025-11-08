# AI Agent Team - Claude Code智能团队

<div align="center">

![AI Agent Team](https://img.shields.io/badge/AI_Agent_Team-Claude%20Code-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Version](https://img.shields.io/badge/Version-1.0.0-orange)

🤖 **基于Claude Code的专业AI智能体团队系统**

一键部署您的24/7全栈开发团队，包含产品经理、前后端开发、测试、运维和技术负责人六大专业角色。

</div>

## ✨ 特性亮点

- 🎯 **六大专业智能体** - 产品经理、前端开发、后端开发、测试工程师、DevOps工程师、技术负责人
- ⚡ **原生集成** - 完全基于Claude Code的原生智能体系统
- 🚀 **一键安装** - 支持npm全局安装，自动配置智能体环境
- ⚡ **快捷命令** - 简化的命令行调用方式，提升开发效率
- 🔄 **完整工作流** - 支持完整的产品开发流程和团队协作
- 📚 **详细文档** - 包含使用指南、最佳实践和示例
- 🛠️ **易于扩展** - 模块化设计，支持自定义智能体

## 🚀 快速开始

### 系统要求

- Claude Code (已安装并配置)
- Git

### 一键安装

#### 方式1：npm安装（推荐）
```bash
npm install -g ai-agent-team
```

#### 方式2：curl安装
```bash
curl -fsSL https://raw.githubusercontent.com/peterfei/ai-agent-team/main/install.sh | bash
```

#### 方式3：手动安装

1. **克隆仓库**
```bash
git clone https://github.com/peterfei/ai-agent-team.git
cd ai-agent-team
```

2. **安装智能体配置**
```bash
# 复制智能体配置到您的Claude配置目录
cp -r .claude/* ~/.claude/
```

3. **验证安装**
```bash
# 测试智能体是否正常工作
claude -p "/agent product_manager '测试功能'"
```

### 快速使用

```bash
# 产品经理 - 需求分析
/pm "设计用户认证系统"

# 前端开发 - UI实现
/fe "创建登录页面组件"

# 后端开发 - API开发
/be "实现JWT认证接口"

# 测试工程师 - 质量保证
/qa "测试用户认证流程"

# 运维工程师 - 部署运维
/ops "部署到生产环境"

# 技术负责人 - 架构设计
/tl "评估系统架构"
```

## 📋 智能体角色

### 🎯 产品经理 (`/pm`)
- **职责**: 产品规划、需求分析、用户研究、竞品分析
- **专长**: 敏捷开发、路线图制定、利益相关者管理
- **使用场景**: 功能需求分析、产品规划、用户体验设计

### 🎨 前端开发 (`/fe`)
- **职责**: UI实现、组件开发、用户体验优化
- **专长**: React/Vue/Angular、响应式设计、性能优化
- **使用场景**: 页面开发、组件设计、前端架构

### ⚙️ 后端开发 (`/be`)
- **职责**: API设计、数据库优化、服务器端逻辑
- **专长**: Node.js/Python/Java、数据库设计、API架构
- **使用场景**: API开发、数据库设计、系统集成

### 🧪 测试工程师 (`/qa`)
- **职责**: 功能测试、自动化测试、质量保证
- **专长**: 单元测试、集成测试、端到端测试
- **使用场景**: 测试设计、自动化测试、缺陷管理

### 🔧 DevOps工程师 (`/ops`)
- **职责**: 部署运维、基础设施、CI/CD流水线
- **专长**: Docker、Kubernetes、云服务、监控告警
- **使用场景**: 系统部署、运维监控、性能优化

### 👨‍💼 技术负责人 (`/tl`)
- **职责**: 技术决策、团队协调、架构设计
- **专长**: 系统架构、技术选型、团队管理
- **使用场景**: 架构评审、技术选型、团队规划

## 💼 工作流程示例

### 完整产品开发流程

```bash
# 1. 需求分析阶段
/pm "分析用户认证系统需求，包括功能规格、用户故事和验收标准"

# 2. 技术设计阶段
/tl "设计用户认证系统的技术架构，包括前后端分离、JWT认证、数据库设计"

# 3. 后端开发阶段
/be "实现JWT认证API，包括登录、注册、token刷新功能"

# 4. 前端开发阶段
/fe "创建React登录组件，包含表单验证、错误处理和响应式设计"

# 5. 测试验证阶段
/qa "设计用户认证系统的完整测试用例，包括功能测试和安全测试"

# 6. 部署上线阶段
/ops "配置用户认证系统的生产环境部署，包括Docker容器化和CI/CD流水线"
```

### 并行开发模式

```bash
# 需求定义
/pm "分析实时协作功能需求"

# 并行开发
/be "构建WebSocket实时协作API" &
/fe "创建协作编辑界面" &

# 等待前后端开发完成
wait

# 集成测试
/qa "测试实时协作端到端流程"

# 部署
/ops "部署协作功能到生产环境"
```

## 🛠️ CLI工具

项目包含一个便捷的CLI工具，提供更友好的命令行界面：

```bash
# 使用CLI工具调用智能体
./.claude/agents/cli.sh pm "设计用户认证系统"
./.claude/agents/cli.sh 前端 "创建登录页面"
./.claude/agents/cli.sh backend "实现JWT API"
./.claude/agents/cli.sh 测试 "测试认证流程"
./.claude/agents/cli.sh 运维 "部署到生产环境"
```

CLI工具特性：
- 🎨 彩色输出界面
- 🔍 智能体名称映射（支持中英文）
- 💡 下一步建议
- ❌ 错误处理和帮助信息
- 📊 调试模式支持

## 📁 项目结构

```
ai-agent-team/
├── .claude/
│   ├── agents/                  # 智能体配置文件
│   │   ├── product_manager.md   # 产品经理智能体
│   │   ├── frontend_dev.md      # 前端开发智能体
│   │   ├── backend_dev.md       # 后端开发智能体
│   │   ├── qa_engineer.md       # 测试工程师智能体
│   │   ├── devops_engineer.md   # 运维工程师智能体
│   │   ├── tech-leader.md       # 技术负责人智能体
│   │   └── cli.sh              # CLI工具脚本
│   ├── commands/               # 快捷命令配置
│   │   ├── pm.md              # 产品经理快捷命令
│   │   ├── fe.md              # 前端开发快捷命令
│   │   ├── be.md              # 后端开发快捷命令
│   │   ├── qa.md              # 测试工程师快捷命令
│   │   ├── ops.md             # 运维工程师快捷命令
│   │   ├── tl.md              # 技术负责人快捷命令
│   │   └── README.md          # 命令说明文档
│   ├── CLAUDE.md              # 项目说明文档
│   └── USAGE.md               # 详细使用指南
├── docs/                      # 文档目录
│   └── BEST_PRACTICES.md      # 最佳实践指南
├── examples/                  # 示例项目
│   └── web-app/               # Web应用开发示例
├── scripts/                   # 辅助脚本
│   └── install.sh            # 安装脚本
├── bin/                       # 可执行文件
│   └── ai-agent-team.js      # CLI工具
├── install.sh                 # 一键安装脚本
├── package.json               # npm包配置
├── README.md                  # 项目说明
├── LICENSE                    # 开源许可证
├── CONTRIBUTING.md            # 贡献指南
└── CHANGELOG.md               # 更新日志

## 📦 npm包信息

- **包名**: `ai-agent-team`
- **版本**: 1.0.0
- **安装**: `npm install -g ai-agent-team`
- **npm页面**: https://www.npmjs.com/package/ai-agent-team

## 🎯 使用场景

### 1. 个人开发者
- 快速原型开发
- 全栈项目开发
- 技术学习参考

### 2. 初创团队
- MVP快速开发
- 团队协作规范
- 技术选型指导

### 3. 企业开发
- 标准化开发流程
- 新人培训
- 最佳实践推广

### 4. 教育培训
- 编程教学辅助
- 项目实战指导
- 团队协作培训

## 📈 最佳实践

### 1. 清晰的任务描述
```bash
# 好的示例
/pm "为电商网站设计购物车功能，包括添加商品、数量调整、价格计算和结算流程"

# 避免模糊描述
/pm "做个购物车"
```

### 2. 提供上下文信息
```bash
# 包含项目背景
/be "基于我们现有的Express.js用户系统，添加OAuth2集成功能"
```

### 3. 迭代式开发
```bash
# 分阶段实施
/pm "第一阶段：设计用户认证的MVP功能"
/be "第一阶段：实现基础的注册和登录API"
/fe "第一阶段：创建简单的登录表单"
```

### 4. 团队协作
```bash
# 确保智能体间的工作协调
/fe "基于产品需求文档和后端API设计，创建用户界面"
/qa "测试前端界面与后端API的完整集成"
```

## 🔧 高级配置

### 自定义智能体

1. 创建智能体配置文件：
```bash
cp .claude/agents/product_manager.md .claude/agents/custom_agent.md
```

2. 编辑配置文件，修改角色和能力
3. 创建对应的快捷命令：
```bash
cp .claude/commands/pm.md .claude/commands/custom.md
```

### 环境变量配置
```bash
# Claude Code配置
export CLAUDE_API_KEY="your-api-key"
export CLAUDE_MODEL="claude-3-sonnet"

# 智能体配置
export AGENT_TIMEOUT=300
export AGENT_MAX_TOKENS=4000
```

## ❓ 常见问题

<details>
<summary>智能体无响应怎么办？</summary>

1. 检查Claude Code是否正确安装：`claude --version`
2. 验证配置文件是否存在：`ls ~/.claude/agents/`
3. 测试基础功能：`claude -p "测试连接"`
4. 重新安装配置：`./scripts/install.sh`
</details>

<details>
<summary>如何提高任务完成质量？</summary>

1. 提供详细的任务描述和上下文
2. 分步骤分解复杂任务
3. 明确指定技术栈和约束条件
4. 提供示例和参考资料
</details>

<details>
<summary>支持哪些编程语言和框架？</summary>

智能体支持主流的编程语言和框架：
- 前端：React, Vue, Angular, Svelte等
- 后端：Node.js, Python, Java, Go, PHP等
- 数据库：MySQL, PostgreSQL, MongoDB, Redis等
- 云服务：AWS, Azure, GCP, 阿里云等
</details>

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 贡献方式

1. **报告问题** - 在Issues中提交bug报告或功能建议
2. **提交代码** - Fork项目并提交Pull Request
3. **完善文档** - 改进文档质量和完整性
4. **分享经验** - 分享使用案例和最佳实践

### 开发流程

1. Fork项目 (在 https://github.com/peterfei/ai-agent-team)
2. 创建功能分支：`git checkout -b feature/new-feature`
3. 提交更改：`git commit -m 'Add new feature'`
4. 推送分支：`git push origin feature/new-feature`
5. 创建Pull Request

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源许可证。

## 🙏 致谢

- 感谢 [Anthropic](https://anthropic.com) 提供强大的Claude Code平台
- 感谢所有贡献者和用户的支持和反馈
- 感谢开源社区的技术和灵感

## 📞 联系我们

- 📧 Email: [peterfeispace@gmail.com](mailto:peterfeispace@gmail.com)
- 🐛 Issues: [GitHub Issues](https://github.com/peterfei/ai-agent-team/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/peterfei/ai-agent-team/discussions)

---

<div align="center">

**⭐ 如果这个项目对您有帮助，请给我们一个Star！⭐**

Made with ❤️ by AI Agent Team

</div>