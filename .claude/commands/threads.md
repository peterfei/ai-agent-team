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
Please format the output as a table or a clean list, highlighting the currently active thread with a checkmark (✅) or bold text.
