#!/usr/bin/env node

/**
 * Hook script to record messages to thread-manager database
 * This script is called by Claude Code hooks to automatically record conversation messages
 */

const path = require('path');
const fs = require('fs');

// Use thread-manager's node_modules
const skillPath = '/Users/mac/project/ai-agent/.claude/skills/thread-manager';
const Database = require(path.join(skillPath, 'node_modules', 'better-sqlite3'));
const { v4: uuidv4 } = require(path.join(skillPath, 'node_modules', 'uuid'));

// Get database path
const homeDir = process.env.HOME || process.env.USERPROFILE || '.';
const dbPath = process.env.THREADS_DB_PATH || path.join(homeDir, '.claude', 'threads', 'threads.db');

// Read input from stdin
let inputData = '';

process.stdin.on('data', (chunk) => {
  inputData += chunk;
});

process.stdin.on('end', () => {
  try {
    // Parse hook input
    const hookInput = JSON.parse(inputData);

    // Extract message information
    const role = hookInput.role || 'user';
    const content = hookInput.content || hookInput.user_input || '';
    const timestamp = Date.now();

    // Check if database exists
    if (!fs.existsSync(dbPath)) {
      console.error(`Database not found at ${dbPath}`);
      process.exit(0); // Exit gracefully to not block the hook
    }

    // Open database
    const db = new Database(dbPath);

    try {
      // Get current active thread
      const activeThread = db.prepare('SELECT id FROM threads WHERE is_active = 1 LIMIT 1').get();

      if (!activeThread) {
        console.error('No active thread found');
        db.close();
        process.exit(0);
      }

      const threadId = activeThread.id;
      const messageId = uuidv4();

      // Insert message
      db.prepare(`
        INSERT INTO messages (id, thread_id, role, content, timestamp, metadata)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(messageId, threadId, role, content, timestamp, JSON.stringify({}));

      // Update thread message count and updated_at
      db.prepare(`
        UPDATE threads
        SET message_count = message_count + 1,
            updated_at = ?
        WHERE id = ?
      `).run(timestamp, threadId);

      console.error(`Message recorded to thread ${threadId}`);

      db.close();
      process.exit(0);
    } catch (error) {
      console.error('Database error:', error.message);
      db.close();
      process.exit(0);
    }
  } catch (error) {
    console.error('Error processing hook input:', error.message);
    process.exit(0); // Exit gracefully
  }
});

// Handle cases where there's no stdin input
setTimeout(() => {
  if (inputData === '') {
    console.error('No input received');
    process.exit(0);
  }
}, 5000);
