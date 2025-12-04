#!/bin/bash

# Hook script for UserPromptSubmit event
# Automatically records user messages to thread-manager

# Debug: Log hook execution
echo "[$(date '+%Y-%m-%d %H:%M:%S')] UserPromptSubmit hook triggered" >> /tmp/claude-hooks.log

# Read stdin input
input=$(cat)

# Debug: Log received input
echo "[DEBUG] Input: $input" >> /tmp/claude-hooks.log

# Extract user prompt from the hook data (correct field name is 'prompt')
user_input=$(echo "$input" | jq -r '.prompt // ""')

# If no user input found, exit gracefully
if [ -z "$user_input" ] || [ "$user_input" = "null" ]; then
  echo "[DEBUG] No user input found" >> /tmp/claude-hooks.log
  exit 0
fi

# Debug: Log extracted prompt
echo "[DEBUG] Extracted prompt: $user_input" >> /tmp/claude-hooks.log

# Create JSON for the record-message script
message_data=$(jq -n \
  --arg role "user" \
  --arg content "$user_input" \
  '{role: $role, content: $content}')

# Get the directory of the current script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Call the Node.js script to record the message
echo "$message_data" | node "$SCRIPT_DIR/record-message.js" 2>&1 | tee -a /tmp/claude-hooks.log

# Log the exit status
echo "[DEBUG] Hook exit status: $?" >> /tmp/claude-hooks.log

# Exit successfully
exit 0
