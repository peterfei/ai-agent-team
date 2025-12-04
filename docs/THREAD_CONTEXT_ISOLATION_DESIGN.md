# Thread Manager 上下文隔离设计方案

## 文档信息

- **创建时间**: 2025-12-04
- **版本**: 1.0
- **状态**: 设计中
- **作者**: AI Agent Team

## 目录

1. [背景和问题](#背景和问题)
2. [核心发现](#核心发现)
3. [技术方案](#技术方案)
4. [实现细节](#实现细节)
5. [使用示例](#使用示例)
6. [实施计划](#实施计划)
7. [FAQ](#faq)

---

## 背景和问题

### 1.1 当前状况

Thread Manager 目前实现了：
- ✅ 对话历史记录到数据库
- ✅ Thread 的创建、切换、删除
- ✅ 消息和文件变更的跟踪
- ✅ 通过 Hook 自动记录对话

### 1.2 存在的问题

**核心问题：没有实现真正的上下文隔离**

```
场景：
[Thread A: 讨论登录功能]
用户: 修复登录 bug
Claude: 好的，我已经修复了...

[用户执行 /thread switch thread-b]

[Thread B: 讨论支付功能]
用户: 实现支付接口
Claude: (仍然记得 Thread A 的所有内容！)
      我看到你刚才在修复登录 bug... ← 泄露了！
```

**问题根源：**
- 当前实现只是把消息**记录**到数据库
- Claude 的实际对话上下文**没有改变**
- 切换 thread 后，Claude 仍然能"记住"所有 thread 的内容
- **不同 thread 的上下文会互相干扰**

### 1.3 需求目标

用户期望的体验：

1. **完全独立的上下文**
   - 切换到 Thread A，Claude 只能看到 Thread A 的历史
   - 切换到 Thread B，Claude 只能看到 Thread B 的历史
   - 不同 thread 之间**零干扰**

2. **文件状态隔离**
   - 不同 thread 可以有不同的代码状态
   - 可以并行开发不同的功能
   - 避免代码冲突

3. **清晰的视觉反馈**
   - 切换时有明显的横幅提示
   - 显示当前 thread 的信息
   - 自动恢复历史上下文

---

## 核心发现

### 2.1 Claude Code 的 Session 机制

通过研究 Claude Code 的文件系统，我们发现了其对话管理机制：

#### 存储结构

```
~/.claude/
├── history.jsonl                    # 全局历史索引
├── projects/
│   └── <project-name>/              # 每个项目一个目录
│       ├── <session-id-1>.jsonl     # Session 1 的完整对话历史
│       ├── <session-id-2>.jsonl     # Session 2 的完整对话历史
│       └── ...
└── session-env/                     # Session 环境变量
    └── <session-id>/
```

#### Session 文件内容

每个 `<session-id>.jsonl` 文件记录了完整的对话：

```jsonl
{"type":"user", "snapshot": {...}}           # 用户消息
{"type":"assistant", "snapshot": {...}}      # Claude 回复
{"type":"tool_use", "snapshot": {...}}       # 工具调用
{"type":"tool_result", "snapshot": {...}}    # 工具结果
{"type":"thinking", "snapshot": {...}}       # 思考过程
```

#### Resume 机制

```bash
# 启动新会话
claude
# 自动生成 session-id: abc-123-def

# 恢复之前的会话
claude --resume abc-123-def
# 或
claude --session-id abc-123-def
```

**工作原理：**
1. 读取 `~/.claude/projects/<project>/<session-id>.jsonl`
2. 加载所有历史消息
3. 重建完整的对话上下文
4. 继续在这个上下文中对话

### 2.2 关键洞察

**不同的 session ID = 完全隔离的对话历史文件**

这意味着：
- ✅ 每个 session 有独立的 `.jsonl` 文件
- ✅ 切换 session 就是切换对话历史文件
- ✅ **没有跨 session 的记忆泄露**
- ✅ 原生支持，无需额外开发

**结论：我们可以直接利用 Claude Code 的原生 session 机制实现真正的上下文隔离！**

---

## 技术方案

### 3.1 核心设计

**Thread ID = Session ID**

每个 Thread 使用独立的 Claude Code session ID，利用原生机制实现上下文隔离。

### 3.2 架构图

```
┌─────────────────────────────────────────────────────────┐
│                    Thread Manager                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Thread A                    Thread B                   │
│  ├── ID: uuid-aaa            ├── ID: uuid-bbb          │
│  ├── Session ID: uuid-aaa    ├── Session ID: uuid-bbb  │
│  ├── Git Branch: thread/aaa  ├── Git Branch: thread/bbb│
│  └── Title: 修复登录         └── Title: 支付功能        │
│                                                         │
└─────────────────────────────────────────────────────────┘
                    ↓                    ↓
┌─────────────────────────────────────────────────────────┐
│              Claude Code Session Layer                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Session uuid-aaa            Session uuid-bbb           │
│  ├── history: aaa.jsonl      ├── history: bbb.jsonl    │
│  ├── context: 登录相关        ├── context: 支付相关      │
│  └── isolated ✅              └── isolated ✅            │
│                                                         │
└─────────────────────────────────────────────────────────┘
                    ↓                    ↓
┌─────────────────────────────────────────────────────────┐
│                 Git Branch Layer                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Branch: thread/aaa          Branch: thread/bbb         │
│  ├── 登录相关代码             ├── 支付相关代码           │
│  └── commits: login fixes    └── commits: payment api  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 3.3 数据模型

#### Thread 数据结构

```typescript
interface Thread {
  // 基本信息
  id: string;                    // UUID，同时作为 session ID
  sessionId: string;             // = id（保持一致）
  title: string;
  description?: string;

  // Git 集成
  gitBranch?: string;            // 关联的 Git 分支名

  // 元数据
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
  messageCount: number;

  metadata: {
    filesChanged: number;
    linesAdded: number;
    linesDeleted: number;
    tags: string[];
  };
}
```

#### 数据库 Schema 更新

```sql
-- 添加新字段
ALTER TABLE threads ADD COLUMN session_id TEXT;
ALTER TABLE threads ADD COLUMN git_branch TEXT;

-- 为现有 thread 更新 session_id
UPDATE threads SET session_id = id WHERE session_id IS NULL;
```

### 3.4 工作流程

#### 创建 Thread

```
用户: /thread new "修复登录Bug"

执行流程：
1. 生成 UUID 作为 thread-id
2. 创建 Thread 记录（thread-id = session-id）
3. 创建对应的 Git 分支（可选）
4. 提示用户使用 --session-id 启动

输出：
✨ 新线程已创建
🚀 启动命令：claude --session-id <thread-id>
```

#### 切换 Thread

```
用户: /thread switch <thread-id>

执行流程：
1. 查找目标 Thread
2. 切换 Git 分支（如果有）
3. 更新 CLAUDE.md（注入上下文提示）
4. 提示用户重启会话

输出：
🔄 已切换到线程：修复登录Bug
⚠️  为了完全隔离上下文，请执行：
   exit
   claude --session-id <thread-id>

或在新终端中：
   claude --session-id <thread-id>
```

#### 并行工作

```
终端 1：
$ claude --session-id thread-a
# 只能看到 Thread A 的历史

终端 2：
$ claude --session-id thread-b
# 只能看到 Thread B 的历史

# 两个会话完全独立，互不干扰
```

---

## 实现细节

### 4.1 核心代码修改

#### 1. 更新 Thread Manager

```typescript
// src/core/thread-manager.ts

public async createThread(input: CreateThreadInput): Promise<{
  thread: Thread,
  message: string,
  launchCommand: string
}> {
  const { title, description, tags } = input;

  // 1. 生成 UUID
  const threadId = uuidv4();

  // 2. 创建 Git 分支（可选）
  let gitBranch: string | undefined;
  if (await this.gitIntegration.isGitRepo()) {
    gitBranch = `thread/${threadId.substring(0, 8)}`;
    await this.gitIntegration.createAndCheckoutBranch(gitBranch);
  }

  // 3. 创建 Thread 记录
  const newThread = this.threadsDAO.create({
    id: threadId,
    sessionId: threadId,  // 相同
    title,
    description,
    gitBranch,
    isActive: false,  // 不自动激活，需要用户启动新会话
    metadata: {
      filesChanged: 0,
      linesAdded: 0,
      linesDeleted: 0,
      tags: tags || []
    }
  });

  // 4. 生成启动命令
  const launchCommand = `claude --session-id ${threadId}`;

  // 5. 返回结果
  return {
    thread: newThread,
    message: this.formatCreateMessage(newThread),
    launchCommand
  };
}

private formatCreateMessage(thread: Thread): string {
  const shortId = thread.id.substring(0, 8);
  return `
═══════════════════════════════════════════════════════════════
  ✨ 新线程已创建
═══════════════════════════════════════════════════════════════

📋 标题：${thread.title}
🆔 ID：${shortId}
${thread.gitBranch ? `🌿 Git 分支：${thread.gitBranch}` : ''}

🚀 启动独立会话：

   claude --session-id ${thread.id}

或使用快捷命令（需要先创建别名）：

   clt ${shortId}

💡 提示：
   • 每个线程有独立的对话历史
   • 不同线程的上下文完全隔离
   • 可以在多个终端并行工作

═══════════════════════════════════════════════════════════════
`;
}
```

#### 2. 更新 Switch Thread

```typescript
public async switchThread(
  id: string,
  options?: { forceIsolate?: boolean }
): Promise<{
  success: boolean,
  thread?: Thread,
  messages?: Message[],
  message: string,
  launchCommand?: string
}> {
  // 1. 查找目标 thread
  const targetThread = this.threadsDAO.findById(id);
  if (!targetThread) {
    return {
      success: false,
      message: `Thread with ID ${id} not found.`
    };
  }

  // 2. 切换 Git 分支
  if (targetThread.gitBranch) {
    const switched = await this.gitIntegration.checkoutBranch(
      targetThread.gitBranch
    );
    if (!switched) {
      return {
        success: false,
        message: `Failed to switch to Git branch ${targetThread.gitBranch}`
      };
    }
  }

  // 3. 更新 CLAUDE.md（注入上下文提示）
  await this.updateClaudeMd(targetThread);

  // 4. 加载历史消息
  const messages = this.messagesDAO.findByThreadId(id, { limit: 50 });

  // 5. 生成切换消息
  const launchCommand = `claude --session-id ${targetThread.id}`;

  return {
    success: true,
    thread: targetThread,
    messages,
    message: this.formatSwitchMessage(targetThread, messages),
    launchCommand
  };
}

private formatSwitchMessage(thread: Thread, messages: Message[]): string {
  const shortId = thread.id.substring(0, 8);

  // 格式化最近的消息
  const recentMessages = messages
    .slice(-3)
    .reverse()
    .map(msg => {
      const time = formatDistanceToNow(msg.timestamp, { locale: zhCN });
      const preview = msg.content.substring(0, 100);
      const icon = msg.role === 'user' ? '👤' : '🤖';
      return `   ${time} ${icon}：${preview}${msg.content.length > 100 ? '...' : ''}`;
    })
    .join('\n');

  return `
═══════════════════════════════════════════════════════════════
  🔄 已切换到线程
═══════════════════════════════════════════════════════════════

📋 标题：${thread.title}
📝 描述：${thread.description || '无'}
🆔 ID：${shortId}
${thread.gitBranch ? `🌿 Git 分支：${thread.gitBranch}（已切换）` : ''}

📊 统计信息：
   • 消息数：${thread.messageCount}
   • 文件变更：${thread.metadata.filesChanged}
   • 代码行：+${thread.metadata.linesAdded} -${thread.metadata.linesDeleted}
   • 最后更新：${formatDistanceToNow(thread.updatedAt, { locale: zhCN })}

${messages.length > 0 ? `💬 上下文恢复（最近 ${Math.min(messages.length, 3)} 条消息）：
${recentMessages}` : '💬 这是一个新线程，还没有对话记录'}

⚠️  为了完全隔离上下文，请执行以下操作之一：

   选项 1（推荐）：重启到新 session
   ────────────────────────────────────
   exit
   claude --session-id ${thread.id}

   选项 2：在新终端中打开
   ────────────────────────────────────
   claude --session-id ${thread.id}

   选项 3：使用快捷命令
   ────────────────────────────────────
   clt ${shortId}

如果您选择继续当前会话（不推荐），我会尽量遵守上下文隔离规则。

═══════════════════════════════════════════════════════════════
`;
}
```

#### 3. 更新 CLAUDE.md

```typescript
private async updateClaudeMd(thread: Thread): Promise<void> {
  const contextPath = '.claude/.threads/current-context.md';

  // 加载历史消息
  const messages = this.messagesDAO.findByThreadId(thread.id);

  // 格式化历史消息
  const historyText = messages.map(msg => {
    const time = new Date(msg.timestamp).toLocaleString('zh-CN');
    const roleText = msg.role === 'user' ? '用户' : '助手';
    return `### [${time}] ${roleText}\n\n${msg.content}\n`;
  }).join('\n---\n\n');

  const content = `# 📋 当前线程上下文

**⚠️ 重要：上下文隔离规则**

您当前在独立的对话线程中工作。请**严格遵守**以下规则：

1. **只参考本文档中的历史对话**
2. **忽略本线程之外的所有内容**
3. **不要引用或提及其他线程的信息**

---

## 线程信息

- 📋 标题：${thread.title}
- 📝 描述：${thread.description || '无'}
- 🆔 ID：${thread.id}
- 🏷️  标签：${thread.metadata.tags.join(', ') || '无'}
- 📊 消息数：${thread.messageCount}

---

## 历史对话

${historyText || '暂无历史对话'}

---

**再次强调：请只参考上述对话内容进行回复，忽略本线程之外的所有历史记录。**
`;

  // 确保目录存在
  await fs.ensureDir('.claude/.threads');

  // 写入文件
  await fs.writeFile(contextPath, content, 'utf-8');
}
```

### 4.2 扩展 Git Integration

```typescript
// src/git/git-integration.ts

export class GitIntegration {
  // ... 现有代码

  /**
   * 获取当前分支名
   */
  public async getCurrentBranch(): Promise<string | null> {
    try {
      const result = await this.git.branch();
      return result.current;
    } catch (e) {
      return null;
    }
  }

  /**
   * 创建并切换到新分支
   */
  public async createAndCheckoutBranch(branchName: string): Promise<boolean> {
    try {
      await this.git.checkoutLocalBranch(branchName);
      return true;
    } catch (e) {
      console.error('Error creating branch:', e);
      return false;
    }
  }

  /**
   * 切换到已存在的分支
   */
  public async checkoutBranch(branchName: string): Promise<boolean> {
    try {
      await this.git.checkout(branchName);
      return true;
    } catch (e) {
      console.error('Error checking out branch:', e);
      return false;
    }
  }

  /**
   * 检查分支是否存在
   */
  public async branchExists(branchName: string): Promise<boolean> {
    try {
      const branches = await this.git.branch();
      return branches.all.includes(branchName);
    } catch (e) {
      return false;
    }
  }

  /**
   * 删除分支
   */
  public async deleteBranch(
    branchName: string,
    force: boolean = false
  ): Promise<boolean> {
    try {
      await this.git.branch([force ? '-D' : '-d', branchName]);
      return true;
    } catch (e) {
      console.error('Error deleting branch:', e);
      return false;
    }
  }
}
```

### 4.3 快捷脚本工具

#### 创建 `claude-thread` 别名

```bash
# ~/.bashrc 或 ~/.zshrc

# Claude Thread 快捷命令
function clt() {
  local thread_prefix="$1"

  if [ -z "$thread_prefix" ]; then
    echo "用法: clt <thread-id-prefix>"
    echo "示例: clt 11a2a6a2"
    return 1
  fi

  # 查询数据库获取完整 ID
  local db_path="$HOME/.claude/threads/threads.db"
  local full_id=$(sqlite3 "$db_path" \
    "SELECT id FROM threads WHERE id LIKE '$thread_prefix%' LIMIT 1" 2>/dev/null)

  if [ -z "$full_id" ]; then
    echo "❌ 错误：找不到匹配的 thread ID"
    return 1
  fi

  echo "🚀 启动 thread: $full_id"

  # 获取并切换 Git 分支
  local branch=$(sqlite3 "$db_path" \
    "SELECT git_branch FROM threads WHERE id='$full_id'" 2>/dev/null)

  if [ -n "$branch" ]; then
    echo "🌿 切换分支: $branch"
    git checkout "$branch" 2>/dev/null
  fi

  # 启动 Claude 会话
  claude --session-id "$full_id"
}

# 列出所有 threads
function clt-list() {
  local db_path="$HOME/.claude/threads/threads.db"

  echo "📋 所有线程："
  sqlite3 -header -column "$db_path" \
    "SELECT
       substr(id, 1, 8) as 'ID前缀',
       title as '标题',
       message_count as '消息数',
       datetime(updated_at/1000, 'unixepoch', 'localtime') as '更新时间'
     FROM threads
     ORDER BY updated_at DESC"
}
```

### 4.4 命令文档更新

```markdown
<!-- .claude/commands/thread.md -->

## 切换线程时的处理

当用户执行 `/thread switch <id>` 时：

1. **调用 `thread-manager.switch_thread`**
2. **解析返回结果**
3. **显示完整的切换横幅**（包含上下文恢复和启动命令）
4. **建议用户重启会话以完全隔离上下文**

### 重要提示格式

必须在切换后显示：

```
⚠️ 为了完全隔离上下文，请执行以下操作之一：

选项 1（推荐）：重启到新 session
exit
claude --session-id <thread-id>

选项 2：在新终端中打开
claude --session-id <thread-id>
```

## 创建线程时的处理

当用户执行 `/thread new "标题"` 时：

1. **调用 `thread-manager.create_thread`**
2. **显示创建成功的横幅**
3. **提供启动命令**
4. **说明上下文隔离的优势**
```

---

## 使用示例

### 5.1 基本工作流

#### 创建新线程

```bash
$ claude
用户: /thread new "修复登录Bug"

Claude:
═══════════════════════════════════════════════════
✨ 新线程已创建
═══════════════════════════════════════════════════

📋 标题：修复登录Bug
🆔 ID：11a2a6a2
🌿 Git 分支：thread/11a2a6a2

🚀 启动独立会话：
   claude --session-id 11a2a6a2-f4d6-4dd1-97f2-e010f4d6373f

或使用快捷命令：
   clt 11a2a6a2

用户: exit
```

#### 启动线程会话

```bash
$ clt 11a2a6a2
🚀 启动 thread: 11a2a6a2-f4d6-4dd1-97f2-e010f4d6373f
🌿 切换分支: thread/11a2a6a2

# Claude 启动，只能看到这个线程的历史
用户: 开始修复登录问题
Claude: 好的，让我帮您修复登录问题...
```

### 5.2 并行开发

#### 终端 1：修复登录

```bash
$ clt 11a2a6a2
用户: 实现 JWT token 刷新
Claude: [只能看到登录相关的历史]
      我将实现 token 刷新机制...
```

#### 终端 2：开发支付功能

```bash
$ clt 22b3c7d8
用户: 集成支付宝支付接口
Claude: [只能看到支付相关的历史]
      我将帮您集成支付宝 API...
```

**两个会话完全独立，互不干扰！**

### 5.3 切换已有线程

```bash
$ claude
用户: /threads

Claude:
═══════════════════════════════════════════════════
📋 所有对话线程
═══════════════════════════════════════════════════

| ID前缀   | 标题         | 消息数 | 更新时间            |
|----------|--------------|--------|---------------------|
| 11a2a6a2 | 修复登录Bug  | 15     | 2025-12-04 14:30   |
| 22b3c7d8 | 支付功能     | 8      | 2025-12-04 12:15   |
| 33c4d9e0 | 前端优化     | 0      | 2025-12-03 10:00   |

用户: /thread switch 22b3c7d8

Claude:
═══════════════════════════════════════════════════
🔄 已切换到线程：支付功能
═══════════════════════════════════════════════════

[显示完整的切换信息和启动命令]

用户: exit

$ clt 22b3c7d8
# 继续开发支付功能...
```

---

## 实施计划

### 6.1 开发阶段

#### Phase 1: 核心功能（1-2天）

- [ ] 更新数据库 schema（添加 session_id, git_branch 字段）
- [ ] 实现 Thread 创建时生成 session ID
- [ ] 实现 Git 分支自动创建和切换
- [ ] 更新 switch_thread 工具

#### Phase 2: UI 增强（1天）

- [ ] 实现切换时的完整横幅输出
- [ ] 更新 CLAUDE.md 动态注入
- [ ] 优化命令文档（thread.md, threads.md）

#### Phase 3: 工具和文档（1天）

- [ ] 创建 `clt` 快捷命令脚本
- [ ] 编写用户文档
- [ ] 添加使用示例

#### Phase 4: 测试和优化（1天）

- [ ] 测试上下文隔离效果
- [ ] 测试并行工作场景
- [ ] 测试 Git 分支切换
- [ ] 性能优化

### 6.2 测试计划

#### 单元测试

```typescript
describe('Thread Context Isolation', () => {
  it('should create thread with unique session ID', async () => {
    const result = await threadManager.createThread({
      title: 'Test Thread'
    });

    expect(result.thread.id).toBe(result.thread.sessionId);
    expect(result.launchCommand).toContain(result.thread.id);
  });

  it('should switch Git branch when switching thread', async () => {
    const thread = await createTestThread();
    const result = await threadManager.switchThread(thread.id);

    const currentBranch = await gitIntegration.getCurrentBranch();
    expect(currentBranch).toBe(thread.gitBranch);
  });
});
```

#### 集成测试

1. **创建并启动新线程**
   - 创建 Thread A
   - 使用 session-id 启动
   - 验证只能看到 Thread A 的历史

2. **并行工作测试**
   - 终端 1：启动 Thread A
   - 终端 2：启动 Thread B
   - 验证两个会话完全独立

3. **切换测试**
   - 在 Thread A 中工作
   - 切换到 Thread B
   - 验证 Git 分支已切换
   - 验证上下文已隔离

---

## FAQ

### Q1: 为什么不能在当前会话中自动切换上下文？

**A:** Claude Code 的会话机制决定了：
- 当前会话的所有历史消息都保存在内存中
- 无法通过编程方式"清空"或"重置"对话历史
- 只能通过重启会话加载不同的 session 文件

虽然可以通过 CLAUDE.md 提示 Claude "忽略"其他内容，但这不是真正的隔离，可能会有信息泄露。

### Q2: 是否可以自动重启会话？

**A:** 技术上不可行：
- MCP Tool 只能返回文本，不能控制 Claude Code 进程
- 不能通过工具调用执行 `exit` 命令
- 需要用户手动重启或在新终端打开

### Q3: 快捷命令 `clt` 是必须的吗？

**A:** 不是必须的，但强烈推荐：
- 简化操作：`clt 11a2a6a2` vs `claude --session-id 11a2a6a2-f4d6-4dd1-97f2-e010f4d6373f`
- 自动切换 Git 分支
- 提供更好的用户体验

用户也可以直接使用完整命令。

### Q4: 如果不重启会话会怎样？

**A:** 会出现"软隔离"：
- CLAUDE.md 会提醒 Claude 遵守隔离规则
- Claude 会尽量忽略其他线程的内容
- 但**不能保证 100% 隔离**，可能会有信息泄露
- Git 分支仍然会正确切换

建议：对于重要的独立任务，务必重启会话。

### Q5: 如何删除不需要的线程？

**A:** 使用 `/thread delete <id>` 命令：
- 会删除数据库记录
- **不会删除** Claude Code 的 session 文件（由 Claude Code 管理）
- **不会删除** Git 分支（需要手动删除）

建议在删除线程后：
```bash
# 手动清理 Git 分支
git branch -d thread/11a2a6a2
```

### Q6: 能否在不同项目间共享线程？

**A:** 不能：
- Session 文件存储在 `~/.claude/projects/<project>/` 下
- 每个项目有独立的 session 存储
- Thread Manager 的数据库也是项目级别的

这是合理的设计，因为不同项目的代码和上下文应该隔离。

---

## 总结

### 核心优势

1. **✅ 真正的上下文隔离**
   - 利用 Claude Code 原生 session 机制
   - 不同 thread 完全独立
   - 零信息泄露

2. **✅ Git 分支集成**
   - 代码状态与对话上下文同步
   - 支持并行开发
   - 避免代码冲突

3. **✅ 零额外成本**
   - 不需要修改 Claude Code 源码
   - 不需要额外的存储
   - 完全基于现有机制

4. **✅ 灵活性**
   - 支持快速切换（软隔离）
   - 支持完全隔离（硬隔离）
   - 支持并行工作

### 技术亮点

- 深入研究了 Claude Code 内部机制
- 巧妙利用 session ID 实现隔离
- Git 分支自动管理
- 良好的用户体验设计

### 下一步

1. 实现核心功能
2. 创建快捷工具
3. 编写用户文档
4. 充分测试验证

---

**文档版本历史**

- v1.0 (2025-12-04): 初始版本，完整设计方案
