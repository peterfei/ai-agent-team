# Thread Manager + AI Agent Team 快速上手指南

## 🚀 5分钟快速开始

### 第1步：选择工作方式

```bash
# 快速咨询（在当前会话）
/pm "这个问题..."

# 独立任务（创建新线程）⭐ 推荐
/pm-start "完整的产品需求分析"
```

### 第2步：启动独立会话（如果使用线程）

```bash
# 退出当前会话
exit

# 启动新会话
clt abc123  # 使用短ID
# 或
claude --session-id abc-123-def-456  # 使用完整ID
```

### 第3步：开始工作

```bash
# 在新会话中调用角色
/pm "开始你的任务..."
```

---

## 📋 命令速查表

### 快速调用（当前会话）

| 命令 | 用途 | 示例 |
|------|------|------|
| `/pm` | 产品经理 | `/pm "设计认证系统"` |
| `/be` | 后端开发 | `/be "实现API"` |
| `/fe` | 前端开发 | `/fe "开发UI"` |
| `/qa` | 测试工程师 | `/qa "执行测试"` |
| `/ops` | DevOps | `/ops "部署"` |
| `/tl` | 技术负责人 | `/tl "架构设计"` |

### 线程启动（独立会话）⭐

| 命令 | 用途 | 示例 |
|------|------|------|
| `/pm-start` | 创建产品线程 | `/pm-start "需求分析"` |
| `/be-start` | 创建后端线程 | `/be-start "API开发"` |
| `/fe-start` | 创建前端线程 | `/fe-start "UI开发"` |
| `/qa-start` | 创建测试线程 | `/qa-start "功能测试"` |
| `/ops-start` | 创建部署线程 | `/ops-start "生产部署"` |
| `/tl-start` | 创建架构线程 | `/tl-start "架构设计"` |
| `/start-task` | 通用创建 | `/start-task pm "任务"` |

### 线程管理

| 命令 | 用途 | 示例 |
|------|------|------|
| `/threads` | 列出所有线程 | `/threads` |
| `/thread switch` | 切换线程 | `/thread switch abc123` |
| `/thread update` | 更新线程 | `/thread update --title "新标题"` |
| `/thread delete` | 删除线程 | `/thread delete abc123 --confirm` |

---

## 🎯 使用场景

### 场景1：快速咨询（1-5分钟）

```bash
# 直接在当前会话中提问
用户: /pm "OAuth2和JWT哪个更适合？"
产品经理: [给出建议]

用户: /be "推荐一个Node.js的日志库"
后端开发: [推荐库]
```

**何时使用**：
- ✅ 简单问题
- ✅ 快速建议
- ✅ 代码审查
- ✅ 文档格式化

---

### 场景2：独立任务（30分钟 - 数小时）⭐

```bash
# 第1步：创建线程
用户: /pm-start "设计用户认证系统"

输出:
═══════════════════════════════════════
✨ 新线程已创建
═══════════════════════════════════════

📋 标题：设计用户认证系统
🆔 ID：abc123

🚀 启动独立会话：
   clt abc123

# 第2步：启动新会话
用户: exit
$ clt abc123

# 第3步：开始工作
用户: /pm "开始设计用户认证系统，包括..."
产品经理: [在独立线程中工作]
```

**何时使用**：
- ✅ 完整功能开发
- ✅ 复杂需求分析
- ✅ 需要独立Git分支
- ✅ 长期任务追踪

---

### 场景3：团队协作（多角色、多任务）

```bash
# 产品经理：需求分析
/pm-start "用户认证需求"
exit && clt abc123
/pm "分析需求..."

# 后端开发：API实现
exit && /be-start "JWT认证API"
clt def456
/be "实现API..."

# 前端开发：UI开发
exit && /fe-start "登录UI组件"
clt ghi789
/fe "开发UI..."

# QA测试：测试
exit && /qa-start "认证功能测试"
clt jkl012
/qa "执行测试..."
```

---

### 场景4：并行开发（多终端）

```bash
# 终端1：产品优化
$ clt abc123
/pm "优化认证体验"

# 终端2：后端新功能
$ clt def456
/be "添加2FA"

# 终端3：前端优化
$ clt ghi789
/fe "性能优化"

# 终端4：测试
$ clt jkl012
/qa "回归测试"
```

**每个终端完全独立，互不干扰！**

---

## 💡 最佳实践

### ✅ 推荐做法

```bash
# 1. 清晰的任务标题
✅ /pm-start "设计SaaS平台的用户认证系统"

# 2. 使用标签分类
✅ /thread new "修复登录Bug" --tags auth,bugfix,high-priority

# 3. 提供详细描述
✅ /be-start "实现支付API" --desc "集成支付宝和微信支付"

# 4. 上下文引用
✅ /fe "根据设计稿 designs/login-ui.png 开发登录表单"
```

### ❌ 避免做法

```bash
# 1. 模糊的标题
❌ /pm-start "做点事"

# 2. 缺少描述
❌ /be-start "fix"

# 3. 无上下文
❌ /fe "update ui"
```

---

## 🔍 常见问题

### Q1: `/pm` 和 `/pm-start` 有什么区别？

**A:**

| 特性 | `/pm` | `/pm-start` |
|------|-------|-------------|
| 上下文隔离 | ❌ 当前会话 | ✅ 独立线程 |
| Git 分支 | ❌ 当前分支 | ✅ 独立分支 |
| 适用场景 | 快速咨询 | 完整任务 |
| 工作时间 | < 5 分钟 | > 30 分钟 |

### Q2: 如何在线程间切换？

**A:**

```bash
# 方式1：在当前会话切换（软切换）
/thread switch abc123
# → Git分支切换
# → 但对话历史仍在当前会话

# 方式2：启动新会话（硬切换）⭐ 推荐
exit
clt abc123
# → 完全独立的上下文
```

### Q3: 如何查看所有线程？

**A:**

```bash
# 列出所有线程
/threads

# 按标签过滤
/threads --tags backend
/threads --tags product,high-priority

# 按时间排序
/threads --sort-by updatedAt --order desc
```

### Q4: 如何删除线程？

**A:**

```bash
# 删除线程
/thread delete abc123 --confirm

# 手动清理Git分支（可选）
git branch -d thread/abc123
```

### Q5: `clt` 快捷命令如何配置？

**A:**

在 `~/.bashrc` 或 `~/.zshrc` 中添加：

```bash
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

---

## 📊 决策流程图

```
开始新任务
    │
    ├─→ 预计时间 < 5分钟？
    │       ├─→ 是 → 使用 /pm, /be, /fe 等快速命令
    │       │           └─→ 在当前会话中完成
    │       │
    │       └─→ 否 ↓
    │
    ├─→ 预计时间 > 30分钟？
    │       ├─→ 是 → 使用 /pm-start, /be-start 等线程命令
    │       │           ├─→ 创建独立线程
    │       │           ├─→ 退出当前会话
    │       │           ├─→ 启动新会话 (clt abc123)
    │       │           └─→ 在独立上下文中工作
    │       │
    │       └─→ 否 → 根据实际情况判断
    │
    └─→ 需要并行开发？
            └─→ 是 → 为每个角色创建独立线程
                        └─→ 在多个终端中同时工作
```

---

## 🎓 学习路径

### 初学者

1. **熟悉快速命令**
   ```bash
   /pm "简单问题"
   /be "简单问题"
   ```

2. **尝试线程管理**
   ```bash
   /threads
   /thread new "测试线程"
   ```

### 进阶

3. **使用线程启动**
   ```bash
   /pm-start "第一个完整任务"
   exit
   clt abc123
   ```

4. **多线程切换**
   ```bash
   /pm-start "任务A"
   /be-start "任务B"
   /threads  # 查看所有线程
   clt abc123  # 切换到任务A
   ```

### 高级

5. **团队协作流程**
   - 产品 → 后端 → 前端 → 测试 → 部署
   - 每个阶段独立线程

6. **并行开发**
   - 多个终端同时工作
   - 不同角色并行推进

---

## 📚 相关文档

- **详细指南**：[Thread Manager 与 AI Agent Team 集成指南](./THREAD_AGENT_INTEGRATION.md)
- **设计文档**：[Thread Context Isolation 设计方案](./THREAD_CONTEXT_ISOLATION_DESIGN.md)
- **命令参考**：[快捷命令目录](../.claude/commands/README.md)

---

## 🎉 开始使用

```bash
# 快速开始第一个任务
/pm-start "你的第一个任务"
```

**祝你使用愉快！** 🚀

有问题？查看 [完整集成指南](./THREAD_AGENT_INTEGRATION.md) 或参考 [故障排除](./THREAD_AGENT_INTEGRATION.md#故障排除)。
