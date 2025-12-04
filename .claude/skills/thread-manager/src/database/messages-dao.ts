import { Database } from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '../types';
import { DatabaseManager } from './db';

export class MessagesDAO {
  private dbManager: DatabaseManager;

  constructor(dbManager: DatabaseManager) {
    this.dbManager = dbManager;
  }

  private get db(): Database {
    return this.dbManager.getDatabase();
  }

  public create(input: Partial<Message> & { threadId: string, role: string, content: string }): Message {
    const id = input.id || uuidv4();
    const now = input.timestamp || new Date();
    
    const message: Message = {
      id,
      threadId: input.threadId,
      role: input.role as any,
      content: input.content,
      timestamp: now,
      metadata: input.metadata || {}
    };

    const stmt = this.db.prepare(`
      INSERT INTO messages (
        id, thread_id, role, content, timestamp, metadata
      ) VALUES (
        ?, ?, ?, ?, ?, ?
      )
    `);

    stmt.run(
      message.id,
      message.threadId,
      message.role,
      message.content,
      message.timestamp.getTime(),
      JSON.stringify(message.metadata || {})
    );

    // Update thread message count
    // Note: We're not doing this in a transaction for simplicity/perf, 
    // but in a strict system we might want to.
    this.updateThreadMessageCount(message.threadId);

    return message;
  }

  public findByThreadId(threadId: string, options?: { limit?: number, offset?: number }): Message[] {
    const { limit = 50, offset = 0 } = options || {};
    
    const stmt = this.db.prepare(`
      SELECT * FROM messages 
      WHERE thread_id = ? 
      ORDER BY timestamp DESC -- Newest first generally for retrieval, though UI might invert
      LIMIT ? OFFSET ?
    `);

    const rows = stmt.all(threadId, limit, offset) as any[];

    // Return in chronological order (oldest first) if that's what's typically expected for context
    // But usually paginated queries return pages. Let's return as queried (descending time) 
    // and let consumer reverse if needed for display.
    return rows.map(this.mapRowToMessage);
  }
  
  public deleteByThreadId(threadId: string): void {
      const stmt = this.db.prepare('DELETE FROM messages WHERE thread_id = ?');
      stmt.run(threadId);
      // Trigger update on thread count is not needed if thread is deleted, 
      // but if just clearing messages, it would be needed.
      // Assuming cascade delete handles this when thread is deleted.
  }

  private updateThreadMessageCount(threadId: string): void {
      const countStmt = this.db.prepare('SELECT COUNT(*) as count FROM messages WHERE thread_id = ?');
      const result = countStmt.get(threadId) as { count: number };
      
      const updateStmt = this.db.prepare('UPDATE threads SET message_count = ? WHERE id = ?');
      updateStmt.run(result.count, threadId);
  }

  private mapRowToMessage(row: any): Message {
    return {
      id: row.id,
      threadId: row.thread_id,
      role: row.role,
      content: row.content,
      timestamp: new Date(row.timestamp),
      metadata: JSON.parse(row.metadata || '{}')
    };
  }
}
