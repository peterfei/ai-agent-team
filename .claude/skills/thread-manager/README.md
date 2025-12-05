# Thread Manager

A powerful thread management system for Claude Code, enabling multi-context switching and automated file change tracking.

## Features

- 🧵 **Multi-threading**: Work on multiple tasks in parallel without context pollution.
- 🔄 **Context Switching**: Seamlessly switch between different conversation threads.
- 💬 **Message Recording**: Record and retrieve conversation messages within threads.
- 📊 **Change Tracking**: Automatically track file changes and line stats per thread.
- 💾 **Local Storage**: All data is stored locally in SQLite.
- 🛠️ **MCP & CLI**: Full support for Model Context Protocol and Slash Commands.

## Usage

### Using Slash Commands

```bash
# Create a new thread
/thread new "Fix login bug"

# List threads
/threads

# Switch context
/thread switch <thread-id>

# View current status
/thread info
```

### Using MCP Tools

This skill exposes a set of MCP tools that can be used by AI assistants to manage conversation state programmatically.

**Thread Management:**
- `create_thread` - Create a new conversation thread
- `list_threads` - List all threads with filtering and sorting
- `switch_thread` - Switch to a different thread context
- `get_thread` - Get details about a specific thread
- `get_current_thread` - Get the currently active thread
- `update_thread` - Update thread metadata (title, description, tags)
- `delete_thread` - Delete a thread permanently

**Message Recording:**
- `add_message` - Add a message to the current thread (records conversation history)

**File Tracking:**
- `track_file_change` - Track file changes with automatic git stats detection

#### Example: Recording Messages

```javascript
// Add a user message to the current thread
await add_message({
  role: "user",
  content: "How do I implement authentication?",
  metadata: { timestamp: Date.now() }
});

// Add an assistant response
await add_message({
  role: "assistant",
  content: "Here's how to implement authentication..."
});
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test
```

## License

MIT
