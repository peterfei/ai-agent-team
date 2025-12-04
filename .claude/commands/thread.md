---
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

When the user invokes this command, you should:

1.  **Parse the subcommand**: Identify if it's `new`, `switch`, `update`, `delete`, `show`, or an ID (which implies switch).
2.  **Call the appropriate MCP tool**:
    - `new` -> `thread-manager.create_thread`
    - `switch` or `<id>` -> `thread-manager.switch_thread`
    - `list` -> `thread-manager.list_threads`
    - `update` -> `thread-manager.update_thread`
    - `delete` -> `thread-manager.delete_thread`
    - `show` or `info` -> `thread-manager.get_thread` or `thread-manager.get_current_thread`
3.  **Format the output**: Present the result nicely to the user.

**Example: Creating a thread**
If user types: `/thread new "Fix login bug" --tags bug`
You call:
```javascript
use_mcp_tool({
  server_name: "thread-manager",
  tool_name: "create_thread",
  arguments: {
    title: "Fix login bug",
    tags: ["bug"],
    switchTo: true
  }
});
```

**Example: Switching thread**
If user types: `/thread T-12345`
You call:
```javascript
use_mcp_tool({
  server_name: "thread-manager",
  tool_name: "switch_thread",
  arguments: {
    threadId: "T-12345"
  }
});
```
