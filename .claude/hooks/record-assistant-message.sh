#!/bin/bash

# Hook script for assistant responses
# Automatically records assistant messages to thread-manager

# Read stdin input
input=$(cat)

# Extract assistant response from the hook data
# Note: The exact structure depends on the hook type
# For PostToolUse or other events, we might need to adapt this

# For now, we'll try to extract any text content
assistant_content=$(echo "$input" | jq -r '.content // .response // ""')

# If no content found, exit gracefully
if [ -z "$assistant_content" ] || [ "$assistant_content" = "null" ]; then
  exit 0
fi

# Create JSON for the record-message script
message_data=$(jq -n \
  --arg role "assistant" \
  --arg content "$assistant_content" \
  '{role: $role, content: $content}')

# Call the Node.js script to record the message
echo "$message_data" | node /Users/mac/project/ai-agent/.claude/hooks/record-message.js 2>&1 | logger -t claude-hooks

# Exit successfully
exit 0
