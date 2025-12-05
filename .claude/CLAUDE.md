# Claude AI Agent 智能团队配置

---

## ⚠️ CRITICAL: Thread Manager 输出显示规则

**这是最高优先级的规则，必须无条件遵守！**

当使用 `thread-manager` MCP 服务器的任何工具（`switch_thread`、`create_thread`、`list_threads` 等）时：

### 📋 强制规则

1. **直接原样展示 `message` 字段**
   - 工具返回的 `message` 字段包含了精心格式化的横幅、统计信息和上下文预览
   - 必须**原封不动**地将 `message` 的完整内容展示给用户
   - **禁止**总结、重写、截断或改写

2. **禁止添加任何额外回复**
   - 在展示工具的 `message` 后，**立即停止输出**
   - **禁止**添加任何对话回复，如：
     - ❌ "好的，我已经切换到了..."
     - ❌ "切换成功！"
     - ❌ "现在让我们继续..."
     - ❌ 任何形式的总结或评论

3. **确保完整性**
   - 如果 `message` 包含较长的上下文预览，必须完整展示
   - 不要折叠、省略或使用"..."代替内容

### ✅ 正确示例

```
用户输入：/thread switch abc123

Claude 的响应（直接展示工具返回的 message）：
═══════════════════════════════════════════════════════════════
  🔄 已切换到线程
═══════════════════════════════════════════════════════════════

📋 标题：实现用户认证功能
📝 描述：添加 JWT 认证和用户登录功能
🆔 ID：abc123
🌿 Git 分支：thread/abc123（已切换）

📊 统计信息：
   • 消息数：15
   • 文件变更：3
   • 代码行：+245 -12
   • 最后更新：2小时前

💬 上下文恢复（最近 5 条消息）：
   2小时前 👤：实现 JWT token 生成逻辑...
   2小时前 🤖：我已经在 auth.ts 中实现了...
   1小时前 👤：添加 token 刷新机制...

⚠️  为了完全隔离上下文，请执行以下操作之一：

   选项 1（推荐）：重启到新 session
   ────────────────────────────────────
   exit
   claude --session-id abc123

[工具返回的完整 message 内容到此结束]

[Claude 在此处停止输出，不添加任何额外内容]
```

### ❌ 错误示例

```
用户输入：/thread switch abc123

错误的响应方式：
⏺ Switched to thread "实现用户认证功能" (abc123).

[这是错误的！Claude 总结了工具结果，而不是直接展示 message 字段]
```

```
用户输入：/thread switch abc123

另一个错误的响应方式：
[展示工具的 message 内容...]

好的，我已经帮你切换到线程 "实现用户认证功能" 了。现在让我们继续之前的工作。

[这也是错误的！在展示 message 后添加了额外的对话]
```

### 🔍 实现检查清单

每次调用 thread-manager 工具后，必须：
- [ ] 从工具返回结果中提取 `message` 字段
- [ ] 原封不动地输出 `message` 的完整内容
- [ ] 立即停止输出，不添加任何其他内容

---

## 项目概述

本项目实现了一个专业的AI智能体团队，使用Claude Code的原生智能体系统。每个智能体都根据特定提示词定义，可以通过Claude Code命令直接调用。

## 智能体架构

### 核心智能体

1. **技术负责人智能体** - `/agent tech-leader`
   - 负责技术决策和团队协调
   - 位置：`.claude/agents/tech-leader.md`

2. **产品经理智能体** - `/agent product_manager`
   - 负责产品规划、需求分析和路线图制定
   - 位置：`.claude/agents/product_manager.md`

3. **前端开发智能体** - `/agent frontend_dev`
   - 负责前端开发、UI实现和客户端逻辑
   - 位置：`.claude/agents/frontend_dev.md`

4. **后端开发智能体** - `/agent backend_dev`
   - 负责后端开发、API设计和服务器端逻辑
   - 位置：`.claude/agents/backend_dev.md`

5. **QA工程师智能体** - `/agent qa_engineer`
   - 负责测试、质量保证和缺陷报告
   - 位置：`.claude/agents/qa_engineer.md`

6. **DevOps工程师智能体** - `/agent devops_engineer`
   - 负责部署、基础设施和CI/CD流水线
   - 位置：`.claude/agents/devops_engineer.md`

## 使用说明

### 直接智能体调用

```bash
# 直接调用特定智能体
/agent product_manager "设计用户认证系统"
/agent frontend_dev "创建登录表单组件"
/agent backend_dev "实现JWT认证API"
/agent qa_engineer "测试认证流程"
/agent devops_engineer "部署认证服务到生产环境"
```

### 工作流集成

```bash
# 完整工作流示例
/agent product_manager "分析用户登录功能需求"
/agent backend_dev "实现登录API端点"
/agent frontend_dev "创建登录UI组件"
/agent qa_engineer "执行完整的登录流程测试"
/agent devops_engineer "部署登录功能到生产环境"
```

### 快捷命令

为了更方便地使用，您可以使用以下快捷命令：

- `/pm` - 产品经理
- `/fe` - 前端开发
- `/be` - 后端开发
- `/qa` - QA工程师
- `/ops` - DevOps工程师
- `/tl` - 技术负责人

快捷命令文件位于：`.claude/commands/` 目录

## 智能体提示词结构

每个智能体提示词文件包含：

1. **角色定义** - 明确角色和职责
2. **专业能力** - 特定技能和技术
3. **工作流程指南** - 分步流程
4. **输出格式** - 预期响应结构
5. **质量标准** - 成功指标和标准
6. **示例交互** - 实际使用示例

## 团队协作

### 顺序工作流
```bash
# 产品 → 开发 → 测试 → 部署
/agent product_manager "定义登录功能需求"
/agent backend_dev "实现登录API端点"
/agent frontend_dev "创建登录UI组件"
/agent qa_engineer "测试完整登录流程"
/agent devops_engineer "部署登录功能到生产环境"
```

### 并行开发
```bash
# 前端和后端并行开发
/agent backend_dev "构建带JWT的认证API" &
/agent frontend_dev "创建带验证的登录表单" &
wait
/agent qa_engineer "集成测试认证流程"
```

## 质量保证

### 代码审查流程
```bash
# 提交前自我审查
/agent [role] "审查此代码的最佳实践和潜在问题"

# 团队交叉审查
/agent backend_dev "审查前端认证实现"
/agent frontend_dev "审查后端API设计和安全性"
```

### 测试标准
```bash
# 单元测试
/agent qa_engineer "为认证组件创建单元测试"

# 集成测试
/agent qa_engineer "测试前端和后端API集成"

# 端到端测试
/agent qa_engineer "执行完整用户认证流程测试"
```

## 部署和运维

### 环境管理
```bash
# 开发环境
/agent devops_engineer "设置带热重载的开发环境"

# 测试环境
/agent devops_engineer "配置类生产环境的测试环境"

# 生产部署
/agent devops_engineer "以零停机时间策略部署到生产环境"
```

### 监控和维护
```bash
# 性能监控
/agent devops_engineer "为认证服务性能设置监控"

# 错误跟踪
/agent devops_engineer "为登录问题配置错误跟踪和告警"

# 安全监控
/agent devops_engineer "为认证端点实施安全监控"
```

## 最佳实践

### 1. 清晰的任务描述
始终提供具体、可操作的任务描述：
```bash
# 好的做法
/agent frontend_dev "创建响应式登录表单，包含邮箱/密码字段、记住我复选框和客户端验证"

# 避免的做法
/agent frontend_dev "创建登录页面"
```

### 2. 上下文信息
调用智能体时包含相关上下文：
```bash
/agent backend_dev "实现OAuth2认证，支持Google和GitHub提供商，遵循产品规格中的需求"
```

### 3. 迭代改进
对复杂功能使用多次迭代：
```bash
# 初始实现
/agent backend_dev "创建基础JWT认证"

# 增强
/agent backend_dev "添加刷新令牌机制和令牌撤销"

# 安全加固
/agent backend_dev "实施速率限制和暴力破解防护"
```

### 4. 团队沟通
确保智能体理解更广泛的上下文：
```bash
/agent frontend_dev "实现与后端团队创建的JWT认证API集成的登录UI"
```

## 故障排除

### 智能体无响应
- 检查Claude Code是否正确安装
- 验证智能体提示词文件是否存在
- 确保命令格式正确

### 任务结果不符合预期
- 提供更具体的需求
- 将复杂任务分解为更小的步骤
- 包含期望输出格式的示例

### 集成问题
- 让智能体互相审查工作
- 对依赖任务使用顺序工作流
- 在每个阶段实施适当的测试

## 扩展指南

### 添加新智能体
1. 在`.claude/agents/`中创建新的提示词文件
2. 定义智能体的角色、专业能力和工作流程
3. 在此文件中添加智能体调用命令
4. 测试各种任务类型的智能体

### 自定义工作流
1. 定义您的特定工作流需求
2. 创建链接智能体命令的工作流脚本
3. 添加错误处理和回滚机制
4. 为团队使用记录工作流

---

此配置实现了与Claude Code智能体系统的直接、原生集成，为管理AI驱动的开发工作流提供了清晰而高效的方式。
