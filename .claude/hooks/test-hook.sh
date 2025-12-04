#!/bin/bash

# Test script to verify the hook functionality

echo "Testing hook functionality..."

# Create test input
test_input='{"user_input": "This is a test message from hook testing"}'

# Test the hook script
echo "$test_input" | /Users/mac/project/ai-agent/.claude/hooks/record-user-message.sh

echo "Test completed. Check the database for the new message."

# Query the database to verify
node -e "
const Database = require('/Users/mac/project/ai-agent/.claude/skills/thread-manager/node_modules/better-sqlite3');
const path = require('path');
const homeDir = process.env.HOME || process.env.USERPROFILE || '.';
const dbPath = path.join(homeDir, '.claude', 'threads', 'threads.db');

if (require('fs').existsSync(dbPath)) {
  const db = new Database(dbPath, { readonly: true });
  const messages = db.prepare('SELECT * FROM messages ORDER BY timestamp DESC LIMIT 5').all();
  console.log('\\nRecent messages:');
  console.log(JSON.stringify(messages, null, 2));
  db.close();
} else {
  console.log('Database not found at', dbPath);
}
"
