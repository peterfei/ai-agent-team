# Thread Manager - 快速摘要

> 完整提案请查看: [THREAD_MANAGER_PROPOSAL.md](./THREAD_MANAGER_PROPOSAL.md)

---

## 🎯 项目目标

为 Claude Code 开发多线程对话管理系统，参考 Amp 的 thread 功能。

**核心价值**:
- 📈 多任务并行，避免上下文混乱
- 🎯 独立线程，保持专注
- 📊 完整追踪代码变更历史
- 🤝 便于团队协作和知识沉淀

---

## 🏗️ 技术方案

### 架构模式
**双模式设计**: MCP Server (后台自动化) + Slash Commands (用户手动控制)

### 技术栈
- **语言**: TypeScript + Node.js 18+
- **数据库**: SQLite (better-sqlite3)
- **MCP SDK**: @modelcontextprotocol/sdk
- **Git**: simple-git

### 核心模块
```
Thread Manager System
├── MCP Tools (8个自动化工具)
├── Slash Commands (8个用户命令)
├── ThreadManager (线程 CRUD)
├── ConversationStore (对话存储)
├── FileTracker (文件变更追踪)
└── SearchEngine (搜索引擎)
```

---

## 📊 数据模型

### 三张核心表

**1. threads** - 线程主表
- id, title, description
- created_at, updated_at
- is_active, message_count
- files_changed, lines_added, lines_deleted
- tags (JSON)

**2. messages** - 消息表
- id, thread_id, role, content
- timestamp, metadata (JSON)

**3. file_changes** - 文件变更表
- id, thread_id, file_path
- change_type, lines_added, lines_deleted
- timestamp, git_commit

---

## 🛠️ 核心功能

### MCP Tools (Claude 自动调用)

| 工具 | 功能 |
|-----|------|
| `create_thread` | 创建新线程 |
| `list_threads` | 列出所有线程 |
| `switch_thread` | 切换线程 |
| `get_thread` | 获取线程详情 |
| `update_thread` | 更新线程信息 |
| `delete_thread` | 删除线程 |
| `get_current_thread` | 获取当前线程 |
| `track_file_change` | 追踪文件变更 |

### Slash Commands (用户直接使用)

| 命令 | 功能 | 示例 |
|-----|------|------|
| `/thread new "标题"` | 创建线程 | `/thread new "修复bug"` |
| `/threads` | 列出线程 | `/threads` |
| `/thread <id>` | 切换线程 | `/thread abc-123` |
| `/thread` | 当前线程 | `/thread` |
| `/thread update` | 更新线程 | `/thread update --title "新标题"` |
| `/thread delete` | 删除线程 | `/thread delete abc-123 --confirm` |
| `/thread show` | 查看详情 | `/thread show abc-123` |
| `/thread search` | 搜索线程 | `/thread search "认证"` |

---

## 📁 项目结构

```
.claude/skills/thread-manager/
├── src/
│   ├── index.ts              # MCP Server 入口
│   ├── tools/                # 8个 MCP 工具
│   ├── core/                 # 业务逻辑层
│   ├── database/             # 数据访问层
│   ├── git/                  # Git 集成
│   ├── types/                # TypeScript 类型
│   └── utils/                # 工具函数
├── tests/                    # 测试文件
├── package.json
└── SKILL.md

.claude/commands/
├── thread.md                 # 主命令
├── threads.md                # 列表命令
└── t.md                      # 短别名
```

---

## 🚀 实施计划

### 8周开发计划

| 周 | 阶段 | 任务 |
|----|------|------|
| 1-2 | 基础架构 | 项目结构、数据库、DAO、ThreadManager |
| 3-4 | MCP 工具 | 实现 8 个 MCP 工具和测试 |
| 4-5 | 文件追踪 | Git 集成、变更检测、FileTracker |
| 5-6 | Commands | 命令解析、格式化输出、文档 |
| 6-7 | 高级功能 | 搜索、标签、导出、性能优化 |
| 7-8 | 测试文档 | 完善测试、编写文档、示例 |
| 8 | 发布准备 | Bug 修复、代码审查、发布 |

### 关键里程碑

- ✅ **Week 2**: 基础框架可运行
- ✅ **Week 4**: MCP 工具完整可用
- ✅ **Week 6**: Commands 完整可用
- ✅ **Week 8**: 正式发布 v1.0

---

## 💡 使用场景示例

### 场景 1: 创建线程
```bash
用户: /thread new "实现用户认证"
Claude: ✅ 已创建线程 "实现用户认证" (T-abc123)
        已自动切换到新线程，可以开始工作了！
```

### 场景 2: 查看线程列表
```bash
用户: /threads
Claude:
📋 线程列表 (共 5 个)
─────────────────────────────────────────────
✅ T-abc123 | 实现用户认证 (当前)
   📊 45 消息 | 12 文件 | +523 -187 行 | 2小时前
   🏷️  auth, backend

─  T-def456 | 前端重构
   📊 32 消息 | 8 文件 | +412 -89 行 | 1天前
   🏷️  frontend, refactor
```

### 场景 3: 切换线程
```bash
用户: /thread T-def456
Claude: ✅ 已切换到线程 "前端重构"
        [加载该线程的对话历史...]
```

### 场景 4: 多任务并行
```bash
# 正在开发认证功能
用户: [在 T-abc123 工作...]

# 突然需要修复紧急 bug
用户: /thread new "修复支付异常" --tags urgent,bugfix
Claude: ✅ 已创建并切换到新线程

# 修复完成，切换回原线程
用户: /thread T-abc123
Claude: ✅ 已切换回原线程，继续之前的工作
```

---

## 🎯 质量目标

### 测试覆盖
- 代码覆盖率: **≥ 80%**
- 关键路径覆盖: **100%**

### 性能目标
| 操作 | 响应时间 |
|-----|----------|
| 创建线程 | < 50ms |
| 切换线程 | < 100ms |
| 列出线程 | < 100ms |
| 搜索线程 | < 200ms |

### 用户体验
- ✅ 命令响应流畅
- ✅ 错误提示清晰
- ✅ 输出格式美观
- ✅ 文档完整易懂

---

## 🌟 未来扩展

### v1.1 - v1.3 (短期)
- 线程模板系统
- 增强导出功能 (Markdown/HTML/PDF)
- 统计分析和可视化

### v2.0 - v2.5 (中期)
- 多人协作支持
- AI 自动标签和分类
- GitHub/Jira 集成

### v3.0+ (长期)
- Web 可视化界面
- 云同步和团队空间
- 插件生态系统

---

## 📦 快速开始

### 安装
```bash
cd .claude/skills/thread-manager
npm install
npm run build
```

### 配置 Claude Code
```json
{
  "mcpServers": {
    "thread-manager": {
      "command": "node",
      "args": ["~/.claude/skills/thread-manager/dist/index.js"]
    }
  }
}
```

### 使用
```bash
# 创建线程
/thread new "我的第一个线程"

# 查看线程
/threads

# 切换线程
/thread <id>
```

---

## 📞 联系和反馈

**完整文档**: [THREAD_MANAGER_PROPOSAL.md](./THREAD_MANAGER_PROPOSAL.md)

**项目仓库**: https://github.com/peterfei/ai-agent-team

**问题反馈**: [GitHub Issues](https://github.com/peterfei/ai-agent-team/issues)

---

**状态**: 📝 提案阶段
**版本**: 1.0.0
**日期**: 2025-12-03
