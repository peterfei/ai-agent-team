#!/bin/bash

# Test script to verify the hook functionality

# Get the directory of the current script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_PATH="$(cd "$SCRIPT_DIR/../skills/thread-manager" && pwd)"

echo "Testing hook functionality..."

# Create test input
test_input='{"user_input": "This is a test message from hook testing"}'

# Test the hook script
echo "$test_input" | "$SCRIPT_DIR/record-user-message.sh"

echo "Test completed. Check the database for the new message."

# Query the database to verify
node -e "
const Database = require('${SKILL_PATH}/node_modules/better-sqlite3');
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
