import { Database } from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { FileChange } from '../types';
import { DatabaseManager } from './db';

export class FileChangesDAO {
  private dbManager: DatabaseManager;

  constructor(dbManager: DatabaseManager) {
    this.dbManager = dbManager;
  }

  private get db(): Database {
    return this.dbManager.getDatabase();
  }

  public create(input: Partial<FileChange> & { threadId: string, filePath: string, changeType: string }): FileChange {
    const id = input.id || uuidv4();
    const now = input.timestamp || new Date();

    const change: FileChange = {
      id,
      threadId: input.threadId,
      filePath: input.filePath,
      changeType: input.changeType as any,
      linesAdded: input.linesAdded || 0,
      linesDeleted: input.linesDeleted || 0,
      timestamp: now,
      gitCommit: input.gitCommit
    };

    const stmt = this.db.prepare(`
      INSERT INTO file_changes (
        id, thread_id, file_path, change_type, 
        lines_added, lines_deleted, timestamp, git_commit
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);

    stmt.run(
      change.id,
      change.threadId,
      change.filePath,
      change.changeType,
      change.linesAdded,
      change.linesDeleted,
      change.timestamp.getTime(),
      change.gitCommit || null
    );
    
    // Update thread stats
    this.updateThreadStats(change.threadId);

    return change;
  }

  public findByThreadId(threadId: string): FileChange[] {
    const stmt = this.db.prepare(`
      SELECT * FROM file_changes 
      WHERE thread_id = ? 
      ORDER BY timestamp DESC
    `);
    const rows = stmt.all(threadId) as any[];
    return rows.map(this.mapRowToFileChange);
  }

  private updateThreadStats(threadId: string): void {
    // Calculate aggregate stats
    const statsStmt = this.db.prepare(`
      SELECT 
        COUNT(DISTINCT file_path) as files_changed,
        SUM(lines_added) as lines_added,
        SUM(lines_deleted) as lines_deleted
      FROM file_changes
      WHERE thread_id = ?
    `);
    
    const stats = statsStmt.get(threadId) as { 
      files_changed: number, 
      lines_added: number, 
      lines_deleted: number 
    };

    const updateStmt = this.db.prepare(`
      UPDATE threads SET 
        files_changed = ?,
        lines_added = ?,
        lines_deleted = ?
      WHERE id = ?
    `);

    updateStmt.run(
      stats.files_changed || 0,
      stats.lines_added || 0,
      stats.lines_deleted || 0,
      threadId
    );
  }

  private mapRowToFileChange(row: any): FileChange {
    return {
      id: row.id,
      threadId: row.thread_id,
      filePath: row.file_path,
      changeType: row.change_type,
      linesAdded: row.lines_added,
      linesDeleted: row.lines_deleted,
      timestamp: new Date(row.timestamp),
      gitCommit: row.git_commit || undefined
    };
  }
}
