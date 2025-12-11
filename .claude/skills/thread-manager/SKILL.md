# Thread Manager Skill

Thread Manager 为 Claude Code 提供多线程对话管理功能，让你可以并行处理多个任务，保持上下文隔离和专注。

## 功能特性

- **多线程管理**: 创建、切换、更新和删除对话线程。
- **上下文隔离**: 每个线程拥有独立的消息历史和上下文。
- **文件变更追踪**: 自动记录每个线程中修改的文件和代码行数统计。
- **持久化存储**: 使用 SQLite 本地存储所有数据，安全可靠。
- **Git 集成**: 自动检测文件变更详情。

## 安装

本 Skill 通常作为 `ai-agent-team` 项目的一部分安装。如果需要单独安装：

1. 确保已安装 Node.js 18+。
2. 运行 `npm install` 安装依赖。
3. 运行 `npm run build` 编译代码。
4. 将本 Skill 添加到 Claude Code 配置文件 (`config.json`) 中。

## MCP 工具

| 工具名称 | 描述 |
|---------|------|
| `create_thread` | 创建新线程 |
| `list_threads` | 列出所有线程 |
| `switch_thread` | 切换到指定线程 |
| `get_thread` | 获取线程详情 |
| `update_thread` | 更新线程信息 |
| `delete_thread` | 删除线程 |
| `get_current_thread` | 获取当前活跃线程 |
| `track_file_change` | 记录文件变更 (支持自动检测) |
| `search_messages` | 基于语义搜索历史消息 (支持自然语言) |

## Slash Commands

- `/thread new "Title"`: 创建新线程
- `/threads`: 列出所有线程
- `/thread <id>`: 切换线程
- `/thread info`: 查看当前线程详情
- `/memory search "query"`: 搜索历史消息 (需要调用 search_messages)

## 数据存储

数据存储在 `~/.claude/threads/threads.db` (默认) 或环境变量 `THREADS_DB_PATH` 指定的位置。
