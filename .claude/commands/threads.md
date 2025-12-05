---
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
