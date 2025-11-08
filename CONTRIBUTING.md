# 贡献指南

感谢您对AI Agent Team项目的关注！我们欢迎所有形式的贡献，包括但不限于：

- 🐛 报告Bug
- 💡 提出新功能建议
- 📝 改进文档
- 🔧 提交代码修复
- ✨ 添加新功能
- 🧪 编写测试用例
- 📚 分享使用案例

## 🚀 开始贡献

### 环境准备

1. **Fork 项目**
   ```bash
   # 在 https://github.com/peterfei/ai-agent-team 上Fork项目到您的账户
   # 然后克隆您的Fork
   git clone https://github.com/YOUR_USERNAME/ai-agent-team.git
   cd ai-agent-team
   ```

2. **设置开发环境**
   ```bash
   # 安装依赖（如果有）
   npm install

   # 确保Claude Code已安装并配置
   claude --version
   ```

3. **创建开发分支**
   ```bash
   git checkout -b feature/your-feature-name
   # 或
   git checkout -b fix/your-bug-fix
   ```

### 贡献类型

#### 1. Bug报告

在提交Bug报告前，请确保：

- [ ] 检查是否已有相关的Issue
- [ ] 提供详细的重现步骤
- [ ] 包含系统环境信息
- [ ] 添加相关的错误日志

**Bug报告模板：**
```markdown
## Bug描述
简要描述遇到的问题

## 重现步骤
1. 执行命令 `...`
2. 点击 `...`
3. 看到错误 `...`

## 期望行为
描述您期望发生的情况

## 实际行为
描述实际发生的情况

## 环境信息
- 操作系统: [e.g. macOS 14.0]
- Claude Code版本: [e.g. 1.0.0]
- Node.js版本: [e.g. 18.17.0]
- 项目版本: [e.g. 1.0.0]

## 附加信息
添加任何其他有助于解决问题的信息
```

#### 2. 功能建议

提出新功能建议时，请包含：

- [ ] 功能的详细描述
- [ ] 解决的问题或使用场景
- [ ] 建议的实现方式（可选）
- [ ] 替代方案考虑（可选）

**功能建议模板：**
```markdown
## 功能描述
简要描述您建议的新功能

## 问题背景
描述这个功能要解决的问题

## 解决方案
详细描述您建议的解决方案

## 替代方案
是否考虑过其他实现方式？

## 附加信息
任何其他相关信息或参考资料
```

#### 3. 代码贡献

**代码提交规范：**

请遵循 [Conventional Commits](https://conventionalcommits.org/) 规范：

```bash
# 功能添加
git commit -m "feat: 添加新的智能体角色配置"

# Bug修复
git commit -m "fix: 修复CLI工具的参数解析问题"

# 文档更新
git commit -m "docs: 更新安装指南"

# 样式调整
git commit -m "style: 调整代码格式"

# 重构代码
git commit -m "refactor: 重构智能体调用逻辑"

# 性能优化
git commit -m "perf: 优化智能体响应速度"

# 测试相关
git commit -m "test: 添加智能体功能测试"
```

**代码质量要求：**

- [ ] 代码符合项目编码规范
- [ ] 添加必要的注释和文档
- [ ] 确保现有测试通过
- [ ] 为新功能添加测试用例
- [ ] 更新相关文档

#### 4. 文档贡献

文档贡献包括：

- README改进
- 使用指南完善
- API文档更新
- 示例代码添加
- 翻译工作

**文档要求：**

- [ ] 内容准确清晰
- [ ] 格式规范统一
- [ ] 包含必要的示例
- [ ] 与代码保持同步

## 📁 项目结构说明

```
ai-agent-team/
├── .claude/                   # Claude Code智能体配置
│   ├── agents/               # 智能体定义文件
│   ├── commands/             # 快捷命令配置
│   └── CLAUDE.md            # 项目说明
├── docs/                     # 项目文档
├── examples/                 # 使用示例
├── scripts/                  # 辅助脚本
├── tests/                    # 测试文件
├── README.md                 # 项目说明
├── LICENSE                   # 开源许可证
└── CONTRIBUTING.md          # 贡献指南
```

## 🔧 开发指南

### 智能体开发

创建新智能体的步骤：

1. **创建智能体配置文件**
   ```bash
   cp .claude/agents/product_manager.md .claude/agents/your_agent.md
   ```

2. **编辑智能体配置**
   - 修改 `name` 和 `description`
   - 定义角色和能力
   - 设置工作流程
   - 添加输出格式规范

3. **创建快捷命令**
   ```bash
   cp .claude/commands/pm.md .claude/commands/your_cmd.md
   ```

4. **测试智能体**
   ```bash
   claude -p "/agent your_agent '测试任务'"
   ```

### CLI工具开发

CLI工具位于 `.claude/agents/cli.sh`：

- 添加新的智能体映射
- 扩展命令行参数
- 改进用户界面
- 增强错误处理

### 测试

运行测试确保代码质量：

```bash
# 运行所有测试
npm test

# 运行特定测试
npm test -- --grep "agent"

# 生成测试覆盖率报告
npm run test:coverage
```

## 📋 提交前检查清单

在提交Pull Request前，请确保：

- [ ] 代码符合项目编码规范
- [ ] 所有测试通过
- [ ] 添加了必要的测试用例
- [ ] 更新了相关文档
- [ ] 提交信息符合规范
- [ ] 没有合并冲突
- [ ] 签署了Contributor License Agreement（如果需要）

## 🔄 Pull Request流程

1. **创建Pull Request**
   - 使用描述性的标题
   - 填写详细的PR描述
   - 关联相关的Issue
   - 添加适当的标签

2. **代码审查**
   - 响应审查意见
   - 根据反馈修改代码
   - 保持友好专业的沟通

3. **合并代码**
   - 确保CI检查通过
   - 获得维护者批准
   - 使用squash合并（除非有特殊需要）

## 🏷️ Issue标签说明

- `bug`: Bug报告
- `enhancement`: 功能增强
- `documentation`: 文档相关
- `good first issue`: 适合新贡献者
- `help wanted`: 需要帮助
- `priority/low`: 低优先级
- `priority/medium`: 中等优先级
- `priority/high`: 高优先级

## 👥 贡献者指南

### 行为准则

我们致力于为每个人提供友好、安全和欢迎的环境，无论：

- 经验水平
- 性别认同和表达
- 性取向
- 残疾状况
- 个人外貌
- 身体大小
- 种族
- 民族
- 年龄
- 宗教
- 国籍

**期望的行为：**
- 使用友好和包容的语言
- 尊重不同的观点和经验
- 优雅地接受建设性批评
- 关注对社区最有利的事情
- 对其他社区成员表示同理心

**不当的行为：**
- 使用性化的语言或图像
- 人身攻击或政治攻击
- 公开或私下骚扰
- 未经明确许可发布他人的私人信息
- 其他在专业环境中可能被认为不当的行为

### 获得帮助

如果您需要帮助或有疑问：

1. 查看现有的文档和FAQ
2. 搜索已有的Issues和Discussions
3. 在GitHub Discussions中提问
4. 联系项目维护者

## 🎉 贡献者认可

我们重视每一位贡献者的努力：

- 在README中列出主要贡献者
- 在发布说明中感谢贡献者
- 提供贡献者徽章
- 邀请活跃贡献者成为核心团队成员

## 📞 联系方式

如有任何关于贡献的问题，请联系：

- 📧 Email: [peterfeispace@gmail.com](mailto:peterfeispace@gmail.com)
- 💬 GitHub Discussions: [https://github.com/peterfei/ai-agent-team/discussions](https://github.com/peterfei/ai-agent-team/discussions)
- 🐛 Issues: [https://github.com/peterfei/ai-agent-team/issues](https://github.com/peterfei/ai-agent-team/issues)

---

再次感谢您的贡献！每一个贡献都让这个项目变得更好。 🙏