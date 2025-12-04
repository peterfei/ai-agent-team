#!/bin/bash

# Define the aliases
read -r -d '' CLT_ALIASES << 'EOA'

# --- Claude Thread Manager Aliases ---
function clt() {
  local thread_prefix="$1"
  if [ -z "$thread_prefix" ]; then
    echo "Usage: clt <thread-id-prefix>"
    return 1
  fi
  local db_path="$HOME/.claude/threads/threads.db"
  local full_id=$(sqlite3 "$db_path" "SELECT id FROM threads WHERE id LIKE '$thread_prefix%' LIMIT 1" 2>/dev/null)
  if [ -z "$full_id" ]; then
    echo "❌ Error: Thread not found matching prefix '$thread_prefix'"
    return 1
  fi
  echo "🚀 Launching thread: $full_id"
  local branch=$(sqlite3 "$db_path" "SELECT git_branch FROM threads WHERE id='$full_id'" 2>/dev/null)
  if [ -n "$branch" ]; then
    echo "🌿 Switching branch: $branch"
    git checkout "$branch" 2>/dev/null
  fi
  claude --session-id "$full_id"
}

function clt-list() {
  local db_path="$HOME/.claude/threads/threads.db"
  echo "📋 Available Threads:"
  sqlite3 -header -column "$db_path" "SELECT substr(id, 1, 8) as 'ID Prefix', title as 'Title', message_count as 'Msgs', datetime(updated_at/1000, 'unixepoch', 'localtime') as 'Updated' FROM threads ORDER BY updated_at DESC"
}
# -------------------------------------
EOA

# Append to .zshrc if not already present
if grep -q "Claude Thread Manager Aliases" ~/.zshrc; then
    echo "⚠️  Aliases seem to be already in ~/.zshrc. Skipping append."
else
    echo "$CLT_ALIASES" >> ~/.zshrc
    echo "✅ Aliases added to ~/.zshrc"
fi

echo "To enable them in the current shell, please run:"
echo "source ~/.zshrc"
