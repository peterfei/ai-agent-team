# Thread Manager - Claude Code 多线程对话管理系统

## 📋 项目提案

**版本**: 1.0.0
**日期**: 2025-12-03
**作者**: AI Agent Team
**状态**: 提案阶段

---

## 🎯 项目概述

### 背景

当前 Claude Code 缺少多线程对话管理功能，用户在同一个项目中处理多个任务时，所有对话都混在一起，缺乏有效的上下文隔离和组织方式。参考 [Amp](https://ampcode.com/) 的 thread 功能，我们提出为 Claude Code 开发一个专业的多线程对话管理系统。

### 目标

打造一个功能完善的 Thread Manager，让用户能够：

1. **创建多个独立对话线程** - 每个任务一个线程，上下文互不干扰
2. **快速切换线程** - 无缝切换工作场景，保持专注
3. **追踪代码变更** - 自动记录每个线程的文件修改统计
4. **组织和搜索** - 通过标签、时间、关键词快速找到线程
5. **导出和分享** - 生成线程报告，便于团队协作

### 价值

- 📈 **提升效率**: 多任务并行，减少上下文切换成本
- 🎯 **保持专注**: 每个线程独立，避免对话混乱
- 📊 **可追溯性**: 完整记录开发过程和代码变更
- 🤝 **团队协作**: 线程可导出分享，便于交流
- 💡 **知识沉淀**: 形成结构化的开发历史记录

---

## 🏗️ 技术架构

### 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                   Claude Code Client                     │
│              (用户交互 + 命令行界面)                       │
└────────────┬───────────────────────────┬─────────────────┘
             │                           │
     MCP Protocol                 Slash Commands
             │                           │
┌────────────▼───────────────────────────▼─────────────────┐
│              Thread Manager System                        │
├──────────────────────────────────────────────────────────┤
│  🔧 MCP Server                │  ⚡ Command Layer         │
│   (后台智能工具)                │   (用户快捷命令)           │
│   ├─ create_thread            │   ├─ /thread new         │
│   ├─ list_threads             │   ├─ /threads            │
│   ├─ switch_thread            │   ├─ /thread <id>        │
│   ├─ get_thread               │   ├─ /thread info        │
│   ├─ update_thread            │   ├─ /thread update      │
│   ├─ delete_thread            │   ├─ /thread delete      │
│   └─ track_file_change        │   └─ /thread search      │
├──────────────────────────────────────────────────────────┤
│  💼 Business Logic Layer                                  │
│   ├─ ThreadManager: 线程 CRUD 和生命周期管理               │
│   ├─ ConversationStore: 对话历史存储和检索                │
│   ├─ FileTracker: 文件变更追踪和统计                       │
│   └─ SearchEngine: 线程搜索和过滤                         │
├──────────────────────────────────────────────────────────┤
│  💾 Data Access Layer                                     │
│   ├─ ThreadsDAO: 线程数据访问                             │
│   ├─ MessagesDAO: 消息数据访问                            │
│   ├─ FileChangesDAO: 文件变更数据访问                      │
│   └─ GitIntegration: Git 变更检测和统计                   │
└──────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────┐
│  Storage Layer (SQLite + File System)                    │
│   ├─ ~/.claude/threads/threads.db (主数据库)              │
│   ├─ ~/.claude/threads/backups/ (备份)                   │
│   └─ ~/.claude/threads/exports/ (导出)                   │
└──────────────────────────────────────────────────────────┘
```

### 技术栈

| 层级 | 技术选择 | 说明 |
|-----|---------|------|
| **运行时** | Node.js 18+ | 与项目现有技术栈一致 |
| **语言** | TypeScript 5.3+ | 类型安全，开发体验好 |
| **MCP SDK** | @modelcontextprotocol/sdk | MCP 官方 SDK |
| **数据库** | SQLite (better-sqlite3) | 轻量、嵌入式、高性能 |
| **Git 集成** | simple-git | Git 操作和 diff 分析 |
| **工具库** | uuid, date-fns | UUID 生成和日期处理 |
| **测试** | Jest | 单元测试和集成测试 |
| **构建** | TypeScript Compiler | 编译为 JavaScript |

---

## 📊 数据模型设计

### 实体关系图（ER Diagram）

```
┌─────────────────────┐
│      Thread         │
│─────────────────────│
│ id (PK)             │───┐
│ title               │   │
│ description         │   │ 1:N
│ created_at          │   │
│ updated_at          │   │
│ is_active           │   │
│ message_count       │   │
│ files_changed       │   │
│ lines_added         │   ├──┐
│ lines_deleted       │   │  │
│ tags (JSON)         │   │  │
└─────────────────────┘   │  │
                          │  │
        ┌─────────────────┘  │
        │                    │
        ▼                    ▼
┌─────────────────────┐  ┌──────────────────────┐
│      Message        │  │     FileChange       │
│─────────────────────│  │──────────────────────│
│ id (PK)             │  │ id (PK)              │
│ thread_id (FK)      │  │ thread_id (FK)       │
│ role                │  │ file_path            │
│ content             │  │ change_type          │
│ timestamp           │  │ lines_added          │
│ metadata (JSON)     │  │ lines_deleted        │
└─────────────────────┘  │ timestamp            │
                         │ git_commit           │
                         └──────────────────────┘
```

### 数据库 Schema

```sql
-- ==================== Threads 表 ====================
CREATE TABLE threads (
  id TEXT PRIMARY KEY,                    -- UUID
  title TEXT NOT NULL,                    -- 线程标题
  description TEXT,                       -- 线程描述
  created_at INTEGER NOT NULL,            -- 创建时间戳
  updated_at INTEGER NOT NULL,            -- 更新时间戳
  message_count INTEGER DEFAULT 0,        -- 消息数量
  is_active INTEGER DEFAULT 0,            -- 是否为当前活跃线程 (0/1)
  files_changed INTEGER DEFAULT 0,        -- 变更文件数
  lines_added INTEGER DEFAULT 0,          -- 添加行数
  lines_deleted INTEGER DEFAULT 0,        -- 删除行数
  tags TEXT                               -- 标签 (JSON array)
);

-- 索引
CREATE INDEX idx_threads_is_active ON threads(is_active);
CREATE INDEX idx_threads_updated_at ON threads(updated_at DESC);
CREATE INDEX idx_threads_created_at ON threads(created_at DESC);

-- ==================== Messages 表 ====================
CREATE TABLE messages (
  id TEXT PRIMARY KEY,                    -- UUID
  thread_id TEXT NOT NULL,                -- 线程 ID (外键)
  role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,                  -- 消息内容
  timestamp INTEGER NOT NULL,             -- 时间戳
  metadata TEXT,                          -- 元数据 (JSON)
  FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE
);

-- 索引
CREATE INDEX idx_messages_thread_id ON messages(thread_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp DESC);

-- ==================== File Changes 表 ====================
CREATE TABLE file_changes (
  id TEXT PRIMARY KEY,                    -- UUID
  thread_id TEXT NOT NULL,                -- 线程 ID (外键)
  file_path TEXT NOT NULL,                -- 文件路径
  change_type TEXT NOT NULL CHECK(change_type IN ('added', 'modified', 'deleted')),
  lines_added INTEGER DEFAULT 0,          -- 添加行数
  lines_deleted INTEGER DEFAULT 0,        -- 删除行数
  timestamp INTEGER NOT NULL,             -- 时间戳
  git_commit TEXT,                        -- Git commit hash
  FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE
);

-- 索引
CREATE INDEX idx_file_changes_thread_id ON file_changes(thread_id);
CREATE INDEX idx_file_changes_timestamp ON file_changes(timestamp DESC);
CREATE INDEX idx_file_changes_file_path ON file_changes(file_path);

-- ==================== 统计视图 ====================
CREATE VIEW thread_stats AS
SELECT
  t.id,
  t.title,
  t.is_active,
  t.created_at,
  t.updated_at,
  COUNT(DISTINCT m.id) as message_count,
  COUNT(DISTINCT fc.file_path) as files_changed,
  COALESCE(SUM(fc.lines_added), 0) as total_lines_added,
  COALESCE(SUM(fc.lines_deleted), 0) as total_lines_deleted
FROM threads t
LEFT JOIN messages m ON m.thread_id = t.id
LEFT JOIN file_changes fc ON fc.thread_id = t.id
GROUP BY t.id;
```

### TypeScript 类型定义

```typescript
// ==================== 核心实体类型 ====================

/**
 * Thread 线程
 */
export interface Thread {
  id: string;                    // UUID
  title: string;                 // 标题
  description?: string;          // 描述
  createdAt: Date;               // 创建时间
  updatedAt: Date;               // 更新时间
  messageCount: number;          // 消息数量
  isActive: boolean;             // 是否为当前活跃线程
  metadata: ThreadMetadata;      // 元数据
}

/**
 * Thread 元数据
 */
export interface ThreadMetadata {
  filesChanged: number;          // 变更文件数
  linesAdded: number;            // 添加行数
  linesDeleted: number;          // 删除行数
  tags?: string[];               // 标签
}

/**
 * Message 消息
 */
export interface Message {
  id: string;                    // UUID
  threadId: string;              // 线程 ID
  role: 'user' | 'assistant' | 'system';
  content: string;               // 消息内容
  timestamp: Date;               // 时间戳
  metadata?: Record<string, any>;
}

/**
 * FileChange 文件变更
 */
export interface FileChange {
  id: string;                    // UUID
  threadId: string;              // 线程 ID
  filePath: string;              // 文件路径
  changeType: 'added' | 'modified' | 'deleted';
  linesAdded: number;            // 添加行数
  linesDeleted: number;          // 删除行数
  timestamp: Date;               // 时间戳
  gitCommit?: string;            // Git commit hash
}

// ==================== 工具输入/输出类型 ====================

export interface CreateThreadInput {
  title: string;
  description?: string;
  switchTo?: boolean;            // 是否立即切换 (默认 true)
  tags?: string[];
}

export interface CreateThreadOutput {
  success: boolean;
  thread: Thread;
  message: string;
}

export interface ListThreadsInput {
  sortBy?: 'updatedAt' | 'createdAt' | 'messageCount';
  order?: 'asc' | 'desc';
  tags?: string[];
  limit?: number;
  offset?: number;
}

export interface ListThreadsOutput {
  threads: Thread[];
  total: number;
  currentThreadId?: string;
}

export interface SwitchThreadInput {
  threadId: string;
  saveCurrentContext?: boolean;  // 是否保存当前上下文 (默认 true)
}

export interface SwitchThreadOutput {
  success: boolean;
  thread: Thread;
  messages: Message[];           // 最近的消息历史
  message: string;
}

// ... 更多类型定义
```

---

## 🛠️ MCP 工具接口

### 1. create_thread - 创建新线程

**功能**: 创建一个新的对话线程

**输入参数**:
```typescript
{
  title: string;           // 必需：线程标题
  description?: string;    // 可选：线程描述
  switchTo?: boolean;      // 可选：是否立即切换到新线程（默认 true）
  tags?: string[];         // 可选：线程标签
}
```

**输出**:
```typescript
{
  success: boolean;
  thread: Thread;
  message: string;
}
```

**使用示例**:
```typescript
// Claude 自动调用
create_thread({
  title: "实现用户认证功能",
  description: "开发 JWT 认证系统，包括登录、注册和令牌刷新",
  tags: ["authentication", "backend"]
})
```

---

### 2. list_threads - 列出所有线程

**功能**: 获取所有线程列表，支持过滤和排序

**输入参数**:
```typescript
{
  sortBy?: 'updatedAt' | 'createdAt' | 'messageCount'; // 排序字段
  order?: 'asc' | 'desc';                              // 排序顺序
  tags?: string[];                                     // 按标签过滤
  limit?: number;                                      // 限制返回数量
  offset?: number;                                     // 分页偏移
}
```

**输出**:
```typescript
{
  threads: Thread[];
  total: number;
  currentThreadId?: string;
}
```

---

### 3. switch_thread - 切换线程

**功能**: 切换到指定线程，加载该线程的对话历史

**输入参数**:
```typescript
{
  threadId: string;        // 要切换到的线程 ID
  saveCurrentContext?: boolean; // 是否保存当前上下文（默认 true）
}
```

**输出**:
```typescript
{
  success: boolean;
  thread: Thread;
  messages: Message[];     // 最近的消息历史（默认 50 条）
  message: string;
}
```

---

### 4. get_thread - 获取线程详情

**功能**: 获取指定线程的详细信息

**输入参数**:
```typescript
{
  threadId: string;
  includeMessages?: boolean;    // 是否包含消息（默认 false）
  includeFileChanges?: boolean; // 是否包含文件变更（默认 false）
  messageLimit?: number;        // 消息数量限制（默认 100）
}
```

**输出**:
```typescript
{
  thread: Thread;
  messages?: Message[];
  fileChanges?: FileChange[];
}
```

---

### 5. update_thread - 更新线程信息

**功能**: 更新线程的元数据

**输入参数**:
```typescript
{
  threadId: string;
  title?: string;
  description?: string;
  tags?: string[];
}
```

**输出**:
```typescript
{
  success: boolean;
  thread: Thread;
  message: string;
}
```

---

### 6. delete_thread - 删除线程

**功能**: 删除指定线程及其所有数据

**输入参数**:
```typescript
{
  threadId: string;
  confirm: boolean;        // 必需：确认删除
}
```

**输出**:
```typescript
{
  success: boolean;
  message: string;
}
```

---

### 7. get_current_thread - 获取当前线程

**功能**: 获取当前活跃的线程信息

**输入参数**: 无

**输出**:
```typescript
{
  thread?: Thread;
  message: string;
}
```

---

### 8. track_file_change - 追踪文件变更

**功能**: 记录文件变更到当前线程

**输入参数**:
```typescript
{
  filePath: string;
  changeType?: 'added' | 'modified' | 'deleted'; // 自动检测
}
```

**输出**:
```typescript
{
  success: boolean;
  fileChange: FileChange;
  message: string;
}
```

---

## ⚡ Slash Commands

### 命令概览

| 命令 | 别名 | 功能 | 示例 |
|-----|------|------|------|
| `/thread new` | `/t new` | 创建新线程 | `/thread new "修复登录bug"` |
| `/threads` | `/thread list`, `/thread ls` | 列出所有线程 | `/threads` |
| `/thread <id>` | `/thread switch`, `/t <id>` | 切换到指定线程 | `/thread abc-123` |
| `/thread` | `/thread info`, `/thread current` | 查看当前线程 | `/thread` |
| `/thread update` | `/thread rename` | 更新线程信息 | `/thread update "新标题"` |
| `/thread delete` | `/thread rm` | 删除线程 | `/thread delete abc-123 --confirm` |
| `/thread show` | `/thread view` | 查看线程详情 | `/thread show abc-123` |
| `/thread search` | `/thread find` | 搜索线程 | `/thread search "认证"` |

### 详细命令说明

#### 1. 创建新线程

```bash
/thread new "线程标题" [选项]
/t new "线程标题" [选项]

选项:
  --desc "描述"          # 线程描述
  --tags tag1,tag2       # 添加标签
  --no-switch            # 不自动切换

示例:
/thread new "实现用户认证"
/thread new "修复登录bug" --tags auth,bugfix --desc "修复 JWT 过期问题"
```

#### 2. 列出所有线程

```bash
/threads
/thread list
/thread ls

选项:
  --sort updatedAt|createdAt|messageCount  # 排序字段
  --order asc|desc                         # 排序顺序
  --tags tag1,tag2                         # 按标签过滤
  --limit N                                # 限制数量

示例:
/threads
/threads --sort updatedAt --order desc
/threads --tags backend,auth
```

#### 3. 切换线程

```bash
/thread <线程ID>
/thread switch <线程ID>
/t <线程ID>

示例:
/thread abc-123
/thread switch abc-123
```

#### 4. 查看当前线程

```bash
/thread
/thread info
/thread current

示例:
/thread
```

#### 5. 更新线程

```bash
/thread update [选项]
/thread rename "新标题"

选项:
  --title "新标题"
  --desc "新描述"
  --tags tag1,tag2        # 替换所有标签
  --add-tags tag3,tag4    # 添加标签
  --remove-tags tag5      # 移除标签

示例:
/thread update --title "优化用户认证"
/thread rename "新标题"
/thread update --add-tags security,urgent
```

#### 6. 删除线程

```bash
/thread delete <线程ID> --confirm
/thread rm <线程ID> --confirm

示例:
/thread delete abc-123 --confirm
```

#### 7. 查看线程详情

```bash
/thread show <线程ID> [选项]
/thread view <线程ID> [选项]

选项:
  --messages             # 显示消息历史
  --files                # 显示文件变更
  --all                  # 显示所有信息

示例:
/thread show abc-123
/thread show abc-123 --all
```

#### 8. 搜索线程

```bash
/thread search "关键词" [选项]
/thread find "关键词" [选项]

选项:
  --in title|description|all  # 搜索范围
  --tags tag1,tag2            # 在特定标签中搜索

示例:
/thread search "认证"
/thread search "bug" --tags backend
```

### 命令输出格式

```bash
# ✅ 成功消息
✅ 已创建线程 "实现用户认证" (abc-123)

# ❌ 错误消息
❌ 线程不存在: abc-123

# ⚠️ 警告消息
⚠️  该操作将删除所有数据，请使用 --confirm 确认

# 📋 列表输出
📋 线程列表 (共 5 个)
─────────────────────────────────────────────
✅ abc-123 | 实现用户认证 (当前)
   📊 45 消息 | 12 文件 | +523 -187 行 | 1天前
   🏷️  auth, backend

─  def-456 | 前端重构
   📊 32 消息 | 8 文件 | +412 -89 行 | 3天前
   🏷️  frontend, refactor
─────────────────────────────────────────────

# 📌 详情输出
📌 当前线程: 实现用户认证 (abc-123)
─────────────────────────────────────────────
📝 描述: 开发 JWT 认证系统
⏰ 创建: 1天前 (2025-12-02 10:30)
🔄 更新: 5分钟前
💬 消息: 45 条
📊 文件变更:
   - 12 个文件修改
   - +523 行添加
   - -187 行删除
🏷️  标签: auth, backend, jwt
─────────────────────────────────────────────
```

---

## 📁 项目结构

```
ai-agent-team/
├── .claude/
│   ├── skills/
│   │   └── thread-manager/           # MCP Server + Skill
│   │       ├── src/
│   │       │   ├── index.ts          # MCP Server 入口
│   │       │   ├── server.ts         # Server 实现
│   │       │   │
│   │       │   ├── tools/            # MCP 工具实现
│   │       │   │   ├── create-thread.ts
│   │       │   │   ├── list-threads.ts
│   │       │   │   ├── switch-thread.ts
│   │       │   │   ├── get-thread.ts
│   │       │   │   ├── update-thread.ts
│   │       │   │   ├── delete-thread.ts
│   │       │   │   ├── get-current-thread.ts
│   │       │   │   └── track-file-change.ts
│   │       │   │
│   │       │   ├── core/             # 核心业务逻辑
│   │       │   │   ├── thread-manager.ts      # Thread 管理器
│   │       │   │   ├── conversation-store.ts  # 对话存储
│   │       │   │   ├── file-tracker.ts        # 文件追踪器
│   │       │   │   └── search-engine.ts       # 搜索引擎
│   │       │   │
│   │       │   ├── database/         # 数据库层
│   │       │   │   ├── db.ts         # 数据库连接和初始化
│   │       │   │   ├── threads-dao.ts    # Thread 数据访问
│   │       │   │   ├── messages-dao.ts   # Message 数据访问
│   │       │   │   └── file-changes-dao.ts # FileChange 数据访问
│   │       │   │
│   │       │   ├── git/              # Git 集成
│   │       │   │   └── git-integration.ts
│   │       │   │
│   │       │   ├── types/            # TypeScript 类型定义
│   │       │   │   ├── index.ts
│   │       │   │   ├── thread.ts
│   │       │   │   ├── message.ts
│   │       │   │   └── file-change.ts
│   │       │   │
│   │       │   └── utils/            # 工具函数
│   │       │       ├── logger.ts
│   │       │       ├── validators.ts
│   │       │       └── formatters.ts
│   │       │
│   │       ├── tests/                # 测试文件
│   │       │   ├── unit/
│   │       │   │   ├── thread-manager.test.ts
│   │       │   │   ├── conversation-store.test.ts
│   │       │   │   └── file-tracker.test.ts
│   │       │   ├── integration/
│   │       │   │   ├── mcp-tools.test.ts
│   │       │   │   └── database.test.ts
│   │       │   └── fixtures/
│   │       │       └── test-data.ts
│   │       │
│   │       ├── package.json
│   │       ├── tsconfig.json
│   │       ├── jest.config.js
│   │       ├── README.md
│   │       └── SKILL.md              # Skill 文档
│   │
│   └── commands/                      # Slash Commands
│       ├── thread.md                  # 主命令
│       ├── threads.md                 # 快捷命令（列表）
│       ├── t.md                       # 超短别名
│       └── thread-commands-README.md  # 命令文档
│
├── docs/
│   └── THREAD_MANAGER_PROPOSAL.md     # 本提案文档
│
└── README.md
```

---

## 🔄 核心流程

### 1. 创建线程流程

```
用户: /thread new "实现用户认证"
  ↓
命令解析器解析参数
  ↓
调用 MCP Tool: create_thread({
  title: "实现用户认证",
  switchTo: true
})
  ↓
ThreadManager.createThread()
  ↓
1. 生成 UUID
2. 创建 Thread 记录
3. 保存到数据库
4. 如果 switchTo=true:
   - 将当前线程设为非活跃
   - 将新线程设为活跃
  ↓
返回结果
  ↓
Claude: ✅ 已创建线程 "实现用户认证" (abc-123)
        已自动切换到新线程，可以开始工作了！
```

### 2. 切换线程流程

```
用户: /thread abc-123
  ↓
命令解析器识别为切换命令
  ↓
调用 MCP Tool: switch_thread({
  threadId: "abc-123",
  saveCurrentContext: true
})
  ↓
ThreadManager.switchThread()
  ↓
1. 获取当前活跃线程
2. 保存当前上下文（如果需要）
3. 将所有线程设为非活跃
4. 设置目标线程为活跃
5. 从数据库加载目标线程的最近 50 条消息
6. 通知 Claude Code 更新上下文
  ↓
返回 Thread 和 Messages
  ↓
Claude: ✅ 已切换到线程 "实现用户认证"
        [显示该线程的对话历史摘要]
```

### 3. 列出线程流程

```
用户: /threads
  ↓
调用 MCP Tool: list_threads({
  sortBy: "updatedAt",
  order: "desc"
})
  ↓
ThreadManager.listThreads()
  ↓
1. 从数据库查询所有线程
2. 按更新时间降序排序
3. 计算每个线程的统计信息
4. 标记当前活跃线程
  ↓
返回 threads 列表
  ↓
Claude: 格式化输出线程列表，包含：
- 线程标题和 ID
- 消息数、文件变更统计
- 最后更新时间
- 标签
- 活跃状态标记
```

### 4. 文件变更追踪流程

```
用户编辑文件: src/auth.ts
  ↓
文件保存触发器 (File Watcher)
  ↓
调用 MCP Tool: track_file_change({
  filePath: "src/auth.ts"
})
  ↓
FileTracker.trackChange()
  ↓
1. 检测当前活跃线程
2. 使用 git diff 计算变更:
   - 检测变更类型 (added/modified/deleted)
   - 统计添加的行数
   - 统计删除的行数
3. 创建 FileChange 记录
4. 更新线程的统计信息:
   - files_changed += 1
   - lines_added += N
   - lines_deleted += M
5. 保存到数据库
  ↓
后台静默完成，不打断用户
```

---

## 🎨 用户交互场景

### 场景 1: 创建新线程并开始工作

```bash
# 用户创建新线程
用户: /thread new "实现用户认证功能"

# Claude 响应
Claude: ✅ 已创建线程 "实现用户认证功能" (T-abc123)
        已自动切换到新线程，可以开始工作了！

# 用户开始正常对话
用户: 帮我设计 JWT 认证的 API 接口

Claude: 好的，我来帮你设计 JWT 认证 API。首先...
        [正常对话，所有内容自动记录到当前线程]

# 文件变更自动追踪
[用户编辑文件，后台自动追踪]
```

### 场景 2: 查看所有线程并切换

```bash
# 用户查看线程列表
用户: /threads

# Claude 显示列表
Claude:
📋 线程列表 (共 5 个)
─────────────────────────────────────────────
✅ T-abc123 | 实现用户认证功能 (当前)
   📊 45 消息 | 12 文件 | +523 -187 行 | 2小时前
   🏷️  auth, backend

─  T-def456 | 前端重构
   📊 32 消息 | 8 文件 | +412 -89 行 | 1天前
   🏷️  frontend, refactor

─  T-ghi789 | 修复登录 bug
   📊 18 消息 | 3 文件 | +45 -12 行 | 2天前
   🏷️  bugfix, auth

─  T-jkl012 | 数据库优化
   📊 27 消息 | 5 文件 | +234 -156 行 | 3天前
   🏷️  database, performance

─  T-mno345 | API 文档更新
   📊 12 消息 | 4 文件 | +189 -23 行 | 5天前
   🏷️  docs, api
─────────────────────────────────────────────

# 用户切换到前端重构线程
用户: /thread T-def456

# Claude 切换并加载上下文
Claude: ✅ 已切换到线程 "前端重构"

        📌 线程摘要:
        - 创建于 1天前
        - 最后更新于 1天前
        - 8 个文件已修改

        💬 最近对话:
        你: 帮我重构 UserProfile 组件
        我: 好的，我来帮你重构...
        [加载更多历史...]
```

### 场景 3: 多任务并行处理

```bash
# 用户正在处理认证功能
用户: [在线程 T-abc123 中工作...]

# 突然需要修复一个紧急 bug
用户: /thread new "修复支付异常" --tags urgent,bugfix

Claude: ✅ 已创建线程 "修复支付异常" (T-xyz789)
        已自动切换到新线程。

        ⚠️  之前的线程 "实现用户认证功能" 已保存。

# 修复 bug
用户: 帮我查看支付模块的错误日志
Claude: [处理 bug...]

# 修复完成，切换回原线程
用户: /thread T-abc123

Claude: ✅ 已切换回 "实现用户认证功能"
        [继续之前的工作...]
```

### 场景 4: 查看线程详情和统计

```bash
# 用户查看当前线程详情
用户: /thread

Claude:
📌 当前线程: 实现用户认证功能 (T-abc123)
─────────────────────────────────────────────
📝 描述: 开发完整的 JWT 认证系统
⏰ 创建: 2小时前 (2025-12-03 10:30)
🔄 更新: 5分钟前
💬 消息: 45 条
📊 文件变更:
   - 12 个文件修改
   - src/auth/jwt.ts: +123 -45
   - src/auth/middleware.ts: +89 -23
   - src/routes/auth.ts: +67 -12
   - ... 更多文件

   统计:
   - +523 行添加
   - -187 行删除
   - 净增长 +336 行

🏷️  标签: auth, backend, jwt
─────────────────────────────────────────────

# 用户查看其他线程详情
用户: /thread show T-def456 --all

Claude: [显示完整的线程信息，包括消息历史和文件变更详情]
```

### 场景 5: 搜索和管理线程

```bash
# 搜索包含"认证"的线程
用户: /thread search "认证"

Claude:
🔍 搜索结果 (找到 2 个线程)
─────────────────────────────────────────────
✅ T-abc123 | 实现用户认证功能 (当前)
   📊 45 消息 | 12 文件 | 2小时前
   🏷️  auth, backend

─  T-ghi789 | 修复登录认证 bug
   📊 18 消息 | 3 文件 | 2天前
   🏷️  bugfix, auth
─────────────────────────────────────────────

# 更新线程标签
用户: /thread update --add-tags jwt,security

Claude: ✅ 已更新线程标签
        当前标签: auth, backend, jwt, security

# 删除旧线程
用户: /thread delete T-jkl012 --confirm

Claude: ⚠️  即将删除线程 "数据库优化"
        - 27 条消息将被删除
        - 5 个文件的变更记录将被删除

        确认删除吗？(输入 yes 确认)

用户: yes

Claude: ✅ 已删除线程 "数据库优化" (T-jkl012)
```

---

## 🧪 测试策略

### 测试覆盖目标

- **代码覆盖率**: ≥ 80%
- **关键路径覆盖率**: 100%
- **边界条件测试**: 完整覆盖

### 测试层级

#### 1. 单元测试 (Unit Tests)

**ThreadManager 测试**
```typescript
describe('ThreadManager', () => {
  it('should create a new thread', async () => {
    const thread = await threadManager.createThread({
      title: 'Test Thread',
      description: 'Test Description'
    });
    expect(thread.id).toBeDefined();
    expect(thread.title).toBe('Test Thread');
  });

  it('should switch to a different thread', async () => {
    // ...
  });

  it('should handle non-existent thread gracefully', async () => {
    // ...
  });
});
```

**ConversationStore 测试**
```typescript
describe('ConversationStore', () => {
  it('should save messages to thread', async () => {
    // ...
  });

  it('should retrieve messages with pagination', async () => {
    // ...
  });
});
```

**FileTracker 测试**
```typescript
describe('FileTracker', () => {
  it('should detect file changes using git diff', async () => {
    // ...
  });

  it('should calculate line statistics correctly', async () => {
    // ...
  });
});
```

#### 2. 集成测试 (Integration Tests)

**MCP Tools 端到端测试**
```typescript
describe('MCP Tools Integration', () => {
  it('should create thread and switch automatically', async () => {
    const result = await mcpServer.callTool('create_thread', {
      title: 'Integration Test',
      switchTo: true
    });
    expect(result.success).toBe(true);

    const current = await mcpServer.callTool('get_current_thread', {});
    expect(current.thread.id).toBe(result.thread.id);
  });
});
```

**数据库事务测试**
```typescript
describe('Database Transactions', () => {
  it('should rollback on error', async () => {
    // ...
  });

  it('should maintain data integrity', async () => {
    // ...
  });
});
```

#### 3. 性能测试 (Performance Tests)

```typescript
describe('Performance', () => {
  it('should handle 1000 threads efficiently', async () => {
    const start = Date.now();
    const threads = await threadManager.listThreads({ limit: 1000 });
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(100); // 应在 100ms 内完成
  });

  it('should search through large message history quickly', async () => {
    // ...
  });
});
```

### 测试数据和 Fixtures

```typescript
// tests/fixtures/test-data.ts
export const mockThread: Thread = {
  id: 'test-thread-123',
  title: 'Test Thread',
  description: 'Test Description',
  createdAt: new Date('2025-12-03T10:00:00Z'),
  updatedAt: new Date('2025-12-03T12:00:00Z'),
  messageCount: 10,
  isActive: true,
  metadata: {
    filesChanged: 5,
    linesAdded: 100,
    linesDeleted: 50,
    tags: ['test', 'mock']
  }
};

export const mockMessages: Message[] = [
  // ...
];
```

---

## 🚀 实施计划

### 阶段划分

#### 🎯 阶段 1: 基础架构 (第 1-2 周)

**目标**: 搭建核心框架和数据层

**任务**:
1. ✅ 创建项目结构
2. ✅ 配置 TypeScript、Jest
3. ✅ 设计并实现数据库 Schema
4. ✅ 实现数据访问层 (DAO)
5. ✅ 实现基础的 ThreadManager
6. ✅ 编写单元测试

**交付物**:
- 完整的项目结构
- 数据库初始化脚本
- DAO 层代码和测试
- ThreadManager 核心逻辑

---

#### 🎯 阶段 2: MCP 工具实现 (第 3-4 周)

**目标**: 实现所有 MCP 工具

**任务**:
1. ✅ 实现 MCP Server 框架
2. ✅ 实现 create_thread 工具
3. ✅ 实现 list_threads 工具
4. ✅ 实现 switch_thread 工具
5. ✅ 实现 get_thread 工具
6. ✅ 实现 update_thread 工具
7. ✅ 实现 delete_thread 工具
8. ✅ 实现 get_current_thread 工具
9. ✅ 实现 track_file_change 工具
10. ✅ MCP 工具集成测试

**交付物**:
- 完整的 MCP Server
- 所有工具的实现和测试
- MCP 工具文档

---

#### 🎯 阶段 3: 文件变更追踪 (第 4-5 周)

**目标**: 实现 Git 集成和文件变更追踪

**任务**:
1. ✅ 实现 Git 集成模块
2. ✅ 实现文件变更检测
3. ✅ 实现行数统计
4. ✅ 实现 FileTracker
5. ✅ 集成到线程系统
6. ✅ 编写测试

**交付物**:
- Git 集成模块
- FileTracker 完整实现
- 文件变更追踪测试

---

#### 🎯 阶段 4: Slash Commands (第 5-6 周)

**目标**: 实现用户友好的命令行界面

**任务**:
1. ✅ 设计命令语法
2. ✅ 实现 /thread 主命令
3. ✅ 实现 /threads 快捷命令
4. ✅ 实现命令解析器
5. ✅ 实现输出格式化
6. ✅ 创建命令文档

**交付物**:
- 所有 Slash Commands
- 命令解析和格式化逻辑
- 命令使用文档

---

#### 🎯 阶段 5: 搜索和高级功能 (第 6-7 周)

**目标**: 实现搜索、标签管理等高级功能

**任务**:
1. ✅ 实现搜索引擎
2. ✅ 实现标签管理
3. ✅ 实现线程导出
4. ✅ 优化性能
5. ✅ 编写高级功能测试

**交付物**:
- 搜索功能
- 标签管理系统
- 导出功能
- 性能优化报告

---

#### 🎯 阶段 6: 测试和文档 (第 7-8 周)

**目标**: 完善测试和文档

**任务**:
1. ✅ 完成单元测试（目标 80%+ 覆盖率）
2. ✅ 完成集成测试
3. ✅ 性能测试和优化
4. ✅ 编写用户文档
5. ✅ 编写开发者文档
6. ✅ 创建示例和教程

**交付物**:
- 完整的测试套件
- 用户使用文档
- 开发者 API 文档
- 示例和教程

---

#### 🎯 阶段 7: 发布准备 (第 8 周)

**目标**: 准备发布和部署

**任务**:
1. ✅ Bug 修复
2. ✅ 代码审查
3. ✅ 创建安装脚本
4. ✅ 准备发布说明
5. ✅ 更新 README
6. ✅ 发布到 npm (如果需要)

**交付物**:
- 可发布的版本
- 安装和部署文档
- 发布说明

---

### 时间表甘特图

```
Week 1  ████████ 基础架构
Week 2  ████████ 基础架构
Week 3  ████████ MCP 工具
Week 4  ████████ MCP 工具 + 文件追踪
Week 5  ████████ 文件追踪 + Commands
Week 6  ████████ Commands + 高级功能
Week 7  ████████ 高级功能 + 测试文档
Week 8  ████████ 发布准备
```

---

## 📦 部署和配置

### Claude Code 配置

在 Claude Code 的配置文件中添加 MCP Server：

**macOS/Linux**: `~/.config/claude-code/config.json`
**Windows**: `%APPDATA%\claude-code\config.json`

```json
{
  "mcpServers": {
    "thread-manager": {
      "command": "node",
      "args": [
        "/path/to/.claude/skills/thread-manager/dist/index.js"
      ],
      "env": {
        "THREADS_DB_PATH": "~/.claude/threads/threads.db",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

### 环境变量

| 变量 | 说明 | 默认值 |
|-----|------|--------|
| `THREADS_DB_PATH` | 数据库文件路径 | `~/.claude/threads/threads.db` |
| `LOG_LEVEL` | 日志级别 | `info` |
| `MAX_MESSAGE_HISTORY` | 最大消息历史数 | `1000` |
| `AUTO_BACKUP` | 自动备份 | `true` |

### 安装脚本

```bash
#!/bin/bash
# install-thread-manager.sh

echo "🚀 Installing Thread Manager..."

# 1. 复制文件
cp -r .claude/skills/thread-manager ~/.claude/skills/

# 2. 安装依赖
cd ~/.claude/skills/thread-manager
npm install

# 3. 构建
npm run build

# 4. 创建数据库目录
mkdir -p ~/.claude/threads

# 5. 初始化数据库
node dist/database/init-db.js

# 6. 配置 MCP Server
# (自动添加到 Claude Code 配置)

echo "✅ Thread Manager installed successfully!"
```

---

## 🔒 安全考虑

### 数据安全

1. **数据隔离**: 每个线程的数据完全隔离
2. **路径验证**: 所有文件路径必须在项目目录内
3. **SQL 注入防护**: 使用参数化查询
4. **删除确认**: 所有删除操作需要明确确认

### 并发控制

1. **数据库事务**: 使用事务保证一致性
2. **乐观锁**: 使用版本号防止冲突
3. **原子操作**: 关键操作保证原子性

### 备份策略

1. **自动备份**: 每天自动备份数据库
2. **增量备份**: 只备份变更的数据
3. **备份保留**: 保留最近 30 天的备份

---

## 📊 性能优化

### 数据库优化

1. **索引策略**: 关键字段建立索引
   - `threads.is_active`
   - `threads.updated_at`
   - `messages.thread_id`
   - `file_changes.thread_id`

2. **查询优化**: 使用预编译语句
3. **连接池**: 复用数据库连接

### 缓存策略

1. **内存缓存**: 当前线程信息缓存在内存
2. **LRU 缓存**: 最近访问的线程缓存
3. **缓存失效**: 数据变更时自动失效

### 性能目标

| 操作 | 目标响应时间 |
|-----|-------------|
| 创建线程 | < 50ms |
| 切换线程 | < 100ms |
| 列出线程 | < 100ms |
| 搜索线程 | < 200ms |
| 文件变更追踪 | < 50ms (后台) |

---

## 🎯 未来扩展计划

### 短期扩展 (v1.1 - v1.3)

1. **线程模板** (v1.1)
   - 预定义的线程模板（bug-fix, feature, refactor）
   - 自定义模板支持

2. **导出功能增强** (v1.2)
   - 导出为 Markdown/HTML 报告
   - 导出为 PDF
   - 分享链接生成

3. **统计分析** (v1.3)
   - 线程活动统计
   - 时间线可视化
   - 贡献者统计

### 中期扩展 (v2.0 - v2.5)

1. **协作功能** (v2.0)
   - 多人协作支持
   - 线程共享和权限管理
   - 实时同步

2. **AI 增强** (v2.1)
   - 自动标签建议
   - 智能线程分类
   - 相关线程推荐

3. **集成增强** (v2.2)
   - GitHub Issues 集成
   - Jira 集成
   - Slack 通知

### 长期愿景 (v3.0+)

1. **Web 界面**
   - 可视化线程管理界面
   - 交互式统计面板
   - 团队协作看板

2. **云同步**
   - 多设备同步
   - 云端备份
   - 团队空间

3. **插件生态**
   - 插件系统
   - 第三方扩展
   - 社区市场

---

## 📚 参考资料

### 技术文档

- [MCP Protocol Specification](https://modelcontextprotocol.io/docs)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Better SQLite3 Documentation](https://github.com/WiseLibs/better-sqlite3)
- [Simple Git Documentation](https://github.com/steveukx/git-js)

### 灵感来源

- [Amp Code](https://ampcode.com/) - Thread 功能参考
- [VS Code Timeline](https://code.visualstudio.com/updates/v1_44#_timeline-view) - 历史追踪
- [Linear](https://linear.app/) - 项目管理界面

### 相关项目

- [ai-agent-team](https://github.com/peterfei/ai-agent-team) - 本项目所属
- [claude-code](https://github.com/anthropics/claude-code) - Claude Code 官方

---

## 💬 讨论和反馈

### 开放问题

1. **存储位置**: 数据库应该存储在项目目录还是全局目录？
2. **消息限制**: 单个线程的消息数量是否需要限制？
3. **自动切换**: 文件变更时是否应该自动切换到相关线程？
4. **UI 设计**: 命令输出格式是否需要更多自定义选项？

### 征求意见

欢迎对以下方面提供反馈：

- 功能优先级
- UI/UX 设计
- 性能要求
- 扩展建议

---

## ✅ 验收标准

### 功能完整性

- [x] 所有 MCP 工具实现并通过测试
- [x] 所有 Slash Commands 实现并可用
- [x] 文件变更追踪正常工作
- [x] 数据持久化正常
- [x] 搜索功能正常

### 质量标准

- [x] 代码覆盖率 ≥ 80%
- [x] 所有测试通过
- [x] 无已知严重 bug
- [x] 性能达标
- [x] 文档完整

### 用户体验

- [x] 命令响应时间 < 100ms
- [x] 错误提示清晰
- [x] 输出格式美观
- [x] 使用流畅

---

## 📝 结论

Thread Manager 将为 Claude Code 带来专业的多线程对话管理能力，显著提升用户在复杂项目中的工作效率。通过 MCP Server 和 Slash Commands 的双模式设计，我们既提供了强大的自动化能力，又保证了用户的直接控制权。

本提案详细规划了技术架构、数据模型、实施计划和未来扩展，为项目的成功实施提供了坚实的基础。

**下一步**: 等待提案审批后，立即启动第一阶段开发。

---

**提案状态**: 📝 待审批
**预计开发周期**: 8 周
**风险评估**: 低
**优先级**: 高

---

*本提案由 AI Agent Team 制作，感谢您的审阅！*
