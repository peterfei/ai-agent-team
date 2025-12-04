# Thread Manager 与 AI Agent Team 集成指南

## 📋 概述

本文档说明如何将 **Thread Manager**（线程管理）与 **AI Agent Team**（智能体团队）结合使用，实现：
- ✅ 每个任务有独立的上下文隔离
- ✅ 不同角色在独立线程中并行工作
- ✅ Git 分支与对话上下文同步
- ✅ 清晰的任务追踪和管理

---

## 🎯 集成方案

### 方案对比

| 方案 | 命令 | 适用场景 | 优势 |
|------|------|---------|------|
| **方案1：角色直接调用** | `/pm "任务"` | 快速咨询、小任务 | 快速、无需切换 |
| **方案2：角色线程启动** | `/pm-start "任务"` | 产品任务（单角色） | 专门优化 |
| **方案3：通用任务启动** | `/start-task pm "任务"` | 所有角色任务 | 统一、灵活 |
| **方案4：手动创建+调用** | `/thread new` + `/pm` | 需要自定义配置 | 完全控制 |

---

## 🚀 使用方式

### 方式 1: 快速咨询（无线程隔离）

**适用场景**：简单问题、快速建议、< 5 分钟的任务

```bash
# 直接在当前会话中调用
/pm "OAuth2和JWT哪个更适合我们的项目？"
/fe "如何优化这个React组件的性能？"
/be "推荐一个Node.js的日志库"
```

**特点**：
- ✅ 快速响应
- ✅ 无需切换会话
- ❌ 无上下文隔离
- ❌ 混在当前会话历史中

---

### 方式 2: 产品经理专用线程启动

**适用场景**：产品需求分析、路线图规划等产品经理任务

```bash
# 第1步：创建产品线程
/pm-start "设计SaaS平台用户认证系统"

# 输出:
═══════════════════════════════════════
✨ 新线程已创建
═══════════════════════════════════════

📋 标题：设计SaaS平台用户认证系统
🆔 ID：abc123
🏷️  标签：product, pm

🚀 启动独立会话：
   claude --session-id abc-123-def-456...

或使用快捷命令：
   clt abc123

# 第2步：退出当前会话
exit

# 第3步：启动独立会话
$ clt abc123

# 第4步：在新会话中开始工作
/pm "开始设计用户认证系统，包括OAuth2集成和双因素认证"

# 产品经理在独立线程中工作...
```

**特点**：
- ✅ 完整上下文隔离
- ✅ 独立 Git 分支
- ✅ 清晰的任务追踪
- ✅ 适合长期任务

---

### 方式 3: 通用任务启动（推荐）⭐

**适用场景**：所有角色的独立任务

```bash
# 为任何角色创建独立线程
/start-task <角色> "任务标题" [--desc "描述"]

# 支持的角色: pm, fe, be, qa, ops, tl
```

#### 示例：产品经理

```bash
/start-task pm "用户认证系统需求分析"
# → 创建: "产品经理 - 用户认证系统需求分析"
# → 标签: product, pm
```

#### 示例：后端开发

```bash
/start-task be "实现JWT认证API" --desc "支持token刷新和撤销"
# → 创建: "后端开发 - 实现JWT认证API"
# → 标签: backend, be
```

#### 示例：前端开发

```bash
/start-task fe "开发登录表单组件"
# → 创建: "前端开发 - 开发登录表单组件"
# → 标签: frontend, fe
```

---

### 方式 4: 手动创建+调用

**适用场景**：需要完全控制线程配置

```bash
# 第1步：手动创建线程
/thread new "用户认证系统 - 产品需求" \
  --desc "完整的需求分析，包括OAuth2、2FA、密码策略" \
  --tags product,pm,auth,high-priority

# 第2步：切换到线程
/thread switch <thread-id>

# 第3步：退出并启动新会话
exit
$ claude --session-id <thread-id>

# 第4步：在新会话中调用角色
/pm "开始进行用户认证系统的需求分析"
```

---

## 💼 完整工作流示例

### 场景：开发用户认证功能

#### 第1阶段：产品需求分析

```bash
# 1. 创建产品线程
主会话> /start-task pm "用户认证系统需求分析"
主会话> exit

# 2. 启动产品经理会话
$ clt abc123

# 3. 产品经理工作
产品会话> /pm "分析用户认证系统的需求，包括："
         "- 支持的认证方式（邮箱、OAuth2）"
         "- 安全要求（密码强度、2FA）"
         "- 用户体验考虑"

产品经理> [提供完整的需求分析文档...]

# 4. 保存需求文档
产品会话> 将需求写入 docs/requirements/user-auth.md

# 5. 提交到产品分支
产品会话> git add docs/requirements/user-auth.md
产品会话> git commit -m "docs: 用户认证系统需求文档"

产品会话> exit
```

#### 第2阶段：后端API开发

```bash
# 1. 创建后端线程
主会话> /start-task be "实现JWT认证API"
主会话> exit

# 2. 启动后端开发会话
$ clt def456

# 3. 后端开发工作
后端会话> /be "根据需求文档 docs/requirements/user-auth.md"
         "实现JWT认证API，包括："
         "- 用户注册和登录"
         "- JWT token生成和验证"
         "- Refresh token机制"

后端开发> [实现 API 代码...]

# 4. 运行测试
后端会话> npm test

# 5. 提交代码
后端会话> git add src/api/auth/
后端会话> git commit -m "feat: 实现JWT认证API"

后端会话> exit
```

#### 第3阶段：前端UI开发

```bash
# 1. 创建前端线程
主会话> /start-task fe "开发登录和注册UI"
主会话> exit

# 2. 启动前端开发会话
$ clt ghi789

# 3. 前端开发工作
前端会话> /fe "开发登录和注册表单，对接后端API："
         "- 响应式设计"
         "- 表单验证"
         "- OAuth2集成"
         "- 错误处理"

前端开发> [实现 UI 组件...]

# 4. 提交代码
前端会话> git add src/components/auth/
前端会话> git commit -m "feat: 实现登录和注册UI组件"

前端会话> exit
```

#### 第4阶段：测试

```bash
# 1. 创建测试线程
主会话> /start-task qa "用户认证功能测试"
主会话> exit

# 2. 启动QA会话
$ clt jkl012

# 3. QA测试工作
QA会话> /qa "执行用户认证功能的完整测试："
       "- 单元测试"
       "- 集成测试"
       "- E2E测试"
       "- 安全测试"

QA工程师> [执行测试并报告...]

# 4. 提交测试报告
QA会话> git add tests/auth/
QA会话> git commit -m "test: 添加用户认证测试套件"

QA会话> exit
```

#### 第5阶段：部署

```bash
# 1. 创建部署线程
主会话> /start-task ops "部署用户认证功能"
主会话> exit

# 2. 启动DevOps会话
$ clt mno345

# 3. DevOps工作
DevOps会话> /ops "部署用户认证功能到生产环境："
           "- 配置环境变量"
           "- 数据库迁移"
           "- 零停机部署"
           "- 监控告警配置"

DevOps工程师> [执行部署...]

DevOps会话> exit
```

---

## 📊 多线程并行工作

### 同时在多个终端工作

```bash
# 终端1：产品经理（优化需求）
$ clt abc123
产品会话> /pm "优化OAuth2集成的用户体验流程"

# 终端2：后端开发（新功能）
$ clt def456
后端会话> /be "实现2FA双因素认证"

# 终端3：前端开发（UI优化）
$ clt ghi789
前端会话> /fe "优化登录表单的加载性能"

# 终端4：测试（回归测试）
$ clt jkl012
QA会话> /qa "执行认证功能的回归测试"
```

**优势**：
- ✅ 完全独立的上下文
- ✅ 不同任务不会互相干扰
- ✅ 每个会话有自己的 Git 分支
- ✅ 可以自由切换和并行工作

---

## 🔍 线程管理命令

### 查看所有线程

```bash
/threads

# 输出:
📋 所有对话线程
═══════════════════════════════════════
| ID前缀   | 标题                        | 标签          | 消息数 | 更新时间      |
|----------|----------------------------|--------------|--------|--------------|
| abc123   | 产品经理 - 用户认证需求     | product,pm   | 25     | 1小时前      |
| def456   | 后端开发 - JWT认证API      | backend,be   | 18     | 30分钟前     |
| ghi789   | 前端开发 - 登录UI          | frontend,fe  | 12     | 刚刚         |
| jkl012   | QA - 认证功能测试          | qa,testing   | 8      | 15分钟前     |
```

### 过滤线程

```bash
# 按标签过滤
/threads --tags backend
/threads --tags product,high-priority

# 排序
/threads --sort-by updatedAt --order desc
```

### 切换线程

```bash
# 方式1：通过ID
/thread switch abc123

# 方式2：快捷方式
/thread abc123

# 输出: 完整的切换横幅和启动命令
```

### 更新线程

```bash
# 更新标题
/thread update --title "新标题"

# 添加标签
/thread update --add-tags high-priority,urgent

# 更新描述
/thread update --desc "更新的描述"
```

### 删除线程

```bash
/thread delete <thread-id> --confirm
```

---

## 🎨 最佳实践

### 1. 任务命名规范

**好的命名**：
```bash
✅ /start-task pm "设计用户认证系统"
✅ /start-task be "实现JWT token刷新机制"
✅ /start-task fe "开发响应式导航栏组件"
```

**避免的命名**：
```bash
❌ /start-task pm "做点事"        # 太模糊
❌ /start-task be "fix"          # 不够描述性
❌ /start-task fe "update ui"    # 不具体
```

### 2. 合理使用标签

```bash
# 功能模块标签
--tags auth,user,payment,order

# 优先级标签
--tags high-priority,urgent,low-priority

# 类型标签
--tags bugfix,feature,refactor,docs

# 组合使用
/thread new "修复登录Bug" --tags auth,bugfix,high-priority
```

### 3. 何时使用线程隔离？

**应该使用独立线程**：
- ✅ 预计工作时间 > 30 分钟
- ✅ 涉及多个文件修改
- ✅ 需要独立的 Git 分支
- ✅ 复杂的需求分析或设计
- ✅ 完整的功能开发

**可以在当前会话**：
- ✅ 快速咨询（< 5 分钟）
- ✅ 简单问题解答
- ✅ 文档格式化
- ✅ 代码审查建议
- ✅ 小的修改和调整

### 4. Git 分支管理

```bash
# Thread Manager 会自动创建分支
# 命名格式: thread/<thread-id-prefix>

# 查看当前分支
git branch
# * thread/abc123

# 线程工作完成后，合并到主分支
git checkout main
git merge thread/abc123

# 删除线程分支（可选）
git branch -d thread/abc123
```

### 5. 团队协作规范

```bash
# 清晰的任务分工
/start-task pm "产品需求分析"      # 产品经理
/start-task be "后端API开发"       # 后端开发
/start-task fe "前端UI实现"        # 前端开发
/start-task qa "功能测试"          # 测试工程师

# 每个线程独立工作，避免冲突
# 最后通过 Git 合并集成
```

---

## 🔧 故障排除

### Q1: 创建线程后如何开始工作？

**A:** 需要两步：
1. 执行 `exit` 退出当前会话
2. 执行 `claude --session-id <thread-id>` 或 `clt <short-id>` 启动新会话

### Q2: 可以在当前会话中直接切换吗？

**A:** 可以，但**不推荐**：
- `/thread switch <id>` 会切换 Git 分支
- 但对话历史仍在当前会话中（非完全隔离）
- 推荐重启会话以获得完全隔离

### Q3: 如何在线程间共享信息？

**A:** 几种方式：
1. **通过文件**：将信息写入文件，其他线程读取
2. **通过 Git**：提交到分支，其他线程合并
3. **通过文档**：在 docs/ 目录中共享文档

### Q4: 快捷命令 `clt` 如何配置？

**A:** 参考 `docs/THREAD_CONTEXT_ISOLATION_DESIGN.md` 的快捷脚本部分：

```bash
# 添加到 ~/.bashrc 或 ~/.zshrc
function clt() {
  local thread_prefix="$1"
  local db_path="$HOME/.claude/threads/threads.db"
  local full_id=$(sqlite3 "$db_path" \
    "SELECT id FROM threads WHERE id LIKE '$thread_prefix%' LIMIT 1")

  if [ -z "$full_id" ]; then
    echo "❌ 找不到匹配的 thread ID"
    return 1
  fi

  claude --session-id "$full_id"
}
```

### Q5: 如何查看线程的详细信息？

**A:**
```bash
/thread show <thread-id>
# 或
/thread info  # 当前线程
```

---

## 📚 相关文档

- [Thread Manager 设计文档](./THREAD_CONTEXT_ISOLATION_DESIGN.md)
- [AI Agent Team 配置](../.claude/CLAUDE.md)
- [命令参考](../.claude/commands/README.md)

---

## 🎉 总结

Thread Manager 与 AI Agent Team 的集成让你可以：

1. **完整的任务隔离**：每个任务有独立的对话历史
2. **Git 分支同步**：代码状态与对话上下文一致
3. **并行开发**：多个角色同时在不同线程工作
4. **清晰追踪**：通过线程管理追踪所有任务进度
5. **专业工作流**：模拟真实团队的协作模式

**开始使用**：
```bash
# 快速开始
/start-task pm "你的第一个任务"
```

享受高效的 AI 驱动开发体验！🚀
