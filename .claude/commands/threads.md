---
name: threads
description: List all conversation threads
---

# List Threads Command

List all available conversation threads with their status and statistics.

## Usage

```bash
/threads [options]
```

## Options

- `--sort [field]`: Sort by `updatedAt`, `createdAt`, or `messageCount` (default: `updatedAt`)
- `--order [asc|desc]`: Sort order (default: `desc`)
- `--tags [tag1,tag2]`: Filter by tags
- `--limit [number]`: Limit the number of results (default: 50)

## Implementation Details for Claude

### ⚠️ 前置检查（最高优先级）

**在执行任何操作之前，必须先检查 `thread-manager` MCP 服务器是否可用。**

判断方法：检查当前可用的工具列表中是否包含 `mcp__thread-manager__list_threads` 工具。

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

When the user invokes `/threads`, call the `thread-manager.list_threads` tool.

**Example:**
If user types: `/threads --sort messageCount`
You call:
```javascript
use_mcp_tool({
  server_name: "thread-manager",
  tool_name: "list_threads",
  arguments: {
    sortBy: "messageCount"
  }
});
```

**Output Format:**
Please format the output as a **compact table** with the following structure:

```
 状态  标题                          ID         消息   文件   更新时间
────────────────────────────────────────────────────────────────────────
 ✅   [当前线程标题]                 [short-id]  [n]    [n]   [时间]
      [其他线程标题]                 [short-id]  [n]    [n]   [时间]
      [描述] (如果有)
      ...
────────────────────────────────────────────────────────────────────────
总计: [n] 个线程
```

**格式要求:**
- 当前活跃线程用 ✅ 标记
- ID 显示前 8 位短 ID
- 如果线程有描述，在标题下方缩进显示
- 消息列显示消息数量
- 文件列显示文件变更数量
- 更新时间使用相对时间（如：刚刚、3分钟前、1小时前）
- 表格使用 ASCII 字符分隔线
