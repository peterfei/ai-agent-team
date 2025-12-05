# 快捷命令目录

本目录包含了AI智能体团队的快捷命令文件，用于更方便地调用各个智能体。

## 快捷命令列表

### 角色调用命令

| 命令 | 智能体 | 上下文隔离 | 描述 |
|------|--------|-----------|------|
| `/pm` | 产品经理 | ❌ 当前会话 | 产品规划、需求分析和路线图制定 |
| `/fe` | 前端开发 | ❌ 当前会话 | UI实现、组件开发和用户体验优化 |
| `/be` | 后端开发 | ❌ 当前会话 | API设计、数据库优化和服务器端逻辑开发 |
| `/qa` | QA工程师 | ❌ 当前会话 | 测试、质量保证和缺陷报告 |
| `/ops` | DevOps工程师 | ❌ 当前会话 | 部署、基础设施和CI/CD流水线 |
| `/tl` | 技术负责人 | ❌ 当前会话 | 技术决策和团队协调 |

### 线程启动命令（推荐用于重要任务）⭐

| 命令 | 智能体 | 上下文隔离 | 描述 |
|------|--------|-----------|------|
| `/pm-start` | 产品经理 | ✅ 独立线程 | 创建产品线程并提供启动命令 |
| `/fe-start` | 前端开发 | ✅ 独立线程 | 创建前端线程并提供启动命令 |
| `/be-start` | 后端开发 | ✅ 独立线程 | 创建后端线程并提供启动命令 |
| `/qa-start` | QA工程师 | ✅ 独立线程 | 创建测试线程并提供启动命令 |
| `/ops-start` | DevOps工程师 | ✅ 独立线程 | 创建DevOps线程并提供启动命令 |
| `/tl-start` | 技术负责人 | ✅ 独立线程 | 创建技术线程并提供启动命令 |
| `/start-task` | 通用 | ✅ 独立线程 | 为任何角色创建线程（通用命令） |

### 线程管理命令

| 命令 | 描述 |
|------|------|
| `/thread new "标题"` | 手动创建新线程 |
| `/thread switch <id>` | 切换到指定线程 |
| `/threads` | 列出所有线程 |
| `/thread update` | 更新线程元数据 |
| `/thread delete <id>` | 删除线程 |

## 使用方法

### 快速调用（当前会话）

适用于：快速咨询、简单任务（< 5分钟）

```bash
/pm "设计用户认证系统"
/fe "创建登录表单"
/be "实现JWT API"
/qa "测试认证流程"
/ops "部署到生产环境"
/tl "评估技术架构"
```

### 独立线程工作（推荐用于重要任务）⭐

适用于：完整功能开发、长期任务（> 30分钟）

```bash
# 方式1：角色专用命令
/pm-start "用户认证系统需求分析"
/be-start "实现JWT认证API"
/fe-start "开发登录UI组件"

# 方式2：通用命令
/start-task pm "用户认证系统需求分析"
/start-task be "实现JWT认证API"
/start-task fe "开发登录UI组件"

# 启动独立会话
exit
clt abc123  # 使用快捷命令
# 或
claude --session-id abc-123-def-456  # 使用完整ID
```

## 工作流示例

### 方式1：快速开发流程（单会话）

适用于：简单功能、快速迭代

```bash
# 在同一个会话中依次调用
/pm "定义用户认证功能需求"
/be "实现JWT认证API"
/fe "创建登录UI组件"
/qa "执行完整的认证流程测试"
/ops "部署认证功能到生产环境"
```

### 方式2：独立线程流程（多会话）⭐

适用于：复杂功能、需要上下文隔离

```bash
# 主会话：创建产品线程
/pm-start "用户认证系统需求分析"
exit

# 终端1：产品经理工作
$ clt abc123
产品会话> /pm "开始需求分析..."
产品会话> exit

# 主会话：创建后端线程
/be-start "实现JWT认证API"
exit

# 终端2：后端开发工作
$ clt def456
后端会话> /be "实现API..."
后端会话> exit

# 主会话：创建前端线程
/fe-start "开发登录UI组件"
exit

# 终端3：前端开发工作
$ clt ghi789
前端会话> /fe "开发UI..."
```

### 方式3：并行开发（多终端）

同时在多个终端中工作：

```bash
# 终端1：产品优化
$ clt abc123
/pm "优化认证流程"

# 终端2：后端新功能
$ clt def456
/be "实现2FA双因素认证"

# 终端3：前端优化
$ clt ghi789
/fe "优化登录表单性能"

# 终端4：测试
$ clt jkl012
/qa "执行回归测试"
```

## 最佳实践

### 1. 何时使用独立线程？

**应该使用独立线程**（`/xxx-start` 或 `/start-task`）：
- ✅ 预计工作时间 > 30 分钟
- ✅ 涉及多个文件修改
- ✅ 需要独立的 Git 分支
- ✅ 复杂的需求分析或架构设计
- ✅ 完整的功能开发

**可以在当前会话**（`/xxx`）：
- ✅ 快速咨询（< 5 分钟）
- ✅ 简单问题解答
- ✅ 代码审查建议
- ✅ 文档格式化
- ✅ 小的修改和调整

### 2. 任务命名规范

**好的命名**：
```bash
✅ /pm-start "设计用户认证系统"
✅ /be-start "实现JWT token刷新机制"
✅ /fe-start "开发响应式导航栏组件"
```

**避免的命名**：
```bash
❌ /pm-start "做点事"      # 太模糊
❌ /be-start "fix"        # 不够描述性
❌ /fe-start "update ui"  # 不具体
```

### 3. 上下文信息

提供清晰的背景和依赖关系：
```bash
/be "根据产品需求文档 docs/requirements/auth.md 实现JWT认证API"
/fe "开发登录表单，对接后端API endpoint: POST /api/auth/login"
```

### 4. 团队协作

确保各智能体工作协调一致：
```bash
# 产品经理定义需求
/pm-start "用户认证系统需求"
# → 生成 docs/requirements/auth.md

# 后端基于需求开发
/be-start "实现认证API"
# → 读取 docs/requirements/auth.md
# → 实现并提交代码

# 前端基于API开发
/fe-start "开发登录UI"
# → 读取 API 文档
# → 开发UI组件
```

## 线程管理

### 查看所有线程

```bash
/threads

# 或按标签过滤
/threads --tags backend
/threads --tags product,high-priority
```

### 切换线程

```bash
/thread switch abc123
# 或
/thread abc123
```

### 更新线程

```bash
/thread update --title "新标题"
/thread update --add-tags high-priority
```

### 删除线程

```bash
/thread delete abc123 --confirm
```

## 相关文档

- [Thread Manager 与 AI Agent Team 集成指南](../../docs/THREAD_AGENT_INTEGRATION.md)
- [Thread Manager 设计文档](../../docs/THREAD_CONTEXT_ISOLATION_DESIGN.md)
- [AI Agent Team 配置](../.claude/CLAUDE.md)

## 故障排除

### 命令无法工作

1. 检查文件是否存在于 `.claude/commands/` 目录
2. 确认YAML前置内容格式正确
3. 验证Claude Code是否正确加载命令
4. 可以使用完整的 `/agent [name]` 命令作为替代

### 线程启动问题

1. 确保 thread-manager MCP 服务器已配置
2. 检查数据库文件权限
3. 参考集成指南文档