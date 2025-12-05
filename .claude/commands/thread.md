---
name: thread
description: Manage conversation threads (create, switch, update, delete, show)
---

# Thread Manager Command

This command allows you to manage conversation threads using the `thread-manager` MCP server.

## Usage

- `/thread new "Title" [options]`: Create a new thread
- `/thread switch <id>`: Switch to a specific thread
- `/thread update [options]`: Update current thread metadata
- `/thread delete <id>`: Delete a thread
- `/thread show [id]`: Show thread details
- `/thread` or `/thread info`: Show current thread info

## Subcommands

### New Thread
Create a new thread and optionally switch to it.

```bash
/thread new "Implement User Auth" --tags backend,auth
```

**Options:**
- `--desc "Description"`: Add a description
- `--tags tag1,tag2`: Add tags (comma separated)
- `--no-switch`: Do not switch to the new thread immediately

### Switch Thread
Switch context to another thread.

```bash
/thread switch <thread-id>
/thread <thread-id>
```

### Update Thread
Update the metadata of the *current* or specified thread.

```bash
/thread update --title "New Title" --add-tags tag3
```

### Delete Thread
Delete a thread permanently.

```bash
/thread delete <thread-id> --confirm
```

### Show/Info
Show details about a thread.

```bash
/thread show <thread-id>
/thread info  # Shows current thread
```

## Implementation Details for Claude

### ⚠️ 前置检查（最高优先级）

**在执行任何操作之前，必须先检查 `thread-manager` MCP 服务器是否可用。**

判断方法：检查当前可用的工具列表中是否包含 `mcp__thread-manager__*` 系列工具（如 `mcp__thread-manager__list_threads`、`mcp__thread-manager__switch_thread` 等）。

**如果 MCP 工具不可用，必须立即输出以下错误信息并停止，不要尝试调用任何工具：**

```
❌ thread-manager MCP 服务器未配置

当前项目未配置 thread-manager MCP 服务器，无法使用线程管理功能。

🔧 解决方案：

方案 1：全局安装（推荐，一次配置全局可用）
   claude mcp add thread-manager -s user -- node <path-to-thread-manager>/dist/index.js

方案 2：项目级安装
   claude mcp add thread-manager -s project -- node <path-to-thread-manager>/dist/index.js

方案 3：切换到已配置该服务的项目目录

添加后需要重启 Claude Code 会话才能生效。
```

**🔴 重要：绝对不要在 MCP 不可用时尝试调用工具，这会导致命令卡住无响应！**

---

### 正常流程

当用户调用此命令时，您应该：

1.  **检查 MCP 可用性**：确认 `mcp__thread-manager__*` 工具存在。如不存在，输出上述错误信息并停止。
2.  **解析子命令**：识别它是 `new`、`switch`、`update`、`delete`、`show` 还是 ID（这意味着切换）。
3.  **调用相应的 MCP 工具**：
    - `new` -> `thread-manager.create_thread`
    - `switch` 或 `<id>` -> `thread-manager.switch_thread`
    - `list` -> `thread-manager.list_threads`
    - `update` -> `thread-manager.update_thread`
    - `delete` -> `thread-manager.delete_thread`
    - `show` 或 `info` -> `thread-manager.get_thread` 或 `thread-manager.get_current_thread`
4.  **格式化输出**：将结果美观地呈现给用户。

### 切换线程时的处理

当用户执行 `/thread switch <id>` 或 `/thread <id>` 时：

1.  **调用 `thread-manager.switch_thread`**。
2.  **解析返回结果**，特别是 `message` 字段。
3.  **显示完整的切换横幅**（即 `thread-manager` 返回的 `message`，包含上下文恢复和启动命令）。
4.  **建议用户重启会话以完全隔离上下文**。

**重要提示格式 (由 `thread-manager` 返回的 message 字段已包含此内容)**：

```
⚠️ 为了完全隔离上下文，请执行以下操作之一：

选项 1（推荐）：重启到新 session
exit
claude --session-id <thread-id>

选项 2：在新终端中打开
claude --session-id <thread-id>
```

### 创建线程时的处理

当用户执行 `/thread new "标题"` 时：

1.  **调用 `thread-manager.create_thread`**。
2.  **立即显示创建成功的信息**（即 `thread-manager` 返回的 `message` 字段）。
3.  **提供启动命令**（即 `thread-manager` 返回的 `launchCommand` 字段）。
4.  **🔴 重要：立即结束响应，不要执行任何额外的任务或继续对话**。

**响应格式要求：**
- ✅ 只输出 `thread-manager` 返回的 `message` 内容
- ✅ 保持输出简洁（不超过 20 行）
- ❌ 不要思考或规划后续任务
- ❌ 不要问用户"接下来要做什么"
- ❌ 不要开始执行创建 thread 之外的其他工作

**示例正确响应：**
```
✨ 新线程已创建

📋 标题：测试当前h5
🆔 ID：8458e9d2

🚀 启动独立会话：
   claude --session-id 8458e9d2-cf78-445b-96ed-c4f286b1c83d

或使用快捷命令：
   clt 8458e9d2
```

[响应结束，等待用户下一个命令]

**示例: 创建线程**
如果用户输入: `/thread new "Fix login bug" --tags bug`
您调用:
```javascript
use_mcp_tool({
  server_name: "thread-manager",
  tool_name: "create_thread",
  arguments: {
    title: "Fix login bug",
    tags: ["bug"],
  }
});
```
**示例: 切换线程**
如果用户输入: `/thread T-12345`
您调用:
```javascript
use_mcp_tool({
  server_name: "thread-manager",
  tool_name: "switch_thread",
  arguments: {
    threadId: "T-12345"
  }
});
```
