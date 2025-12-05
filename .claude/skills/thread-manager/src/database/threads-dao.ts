import { Database } from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { Thread } from '../types';
import { DatabaseManager } from './db';

export class ThreadsDAO {
  private dbManager: DatabaseManager;

  constructor(dbManager: DatabaseManager) {
    this.dbManager = dbManager;
  }

  private get db(): Database {
    return this.dbManager.getDatabase();
  }

  public create(input: Partial<Thread>): Thread {
    const id = input.id || uuidv4();
    const now = new Date();
    
    const thread: Thread = {
      id,
      sessionId: input.sessionId || id,
      title: input.title || 'New Thread',
      description: input.description,
      gitBranch: input.gitBranch,
      createdAt: input.createdAt || now,
      updatedAt: input.updatedAt || now,
      messageCount: input.messageCount || 0,
      isActive: input.isActive || false,
      metadata: {
        filesChanged: input.metadata?.filesChanged || 0,
        linesAdded: input.metadata?.linesAdded || 0,
        linesDeleted: input.metadata?.linesDeleted || 0,
        tags: input.metadata?.tags || []
      }
    };

    const stmt = this.db.prepare(`
      INSERT INTO threads (
        id, session_id, git_branch, title, description, created_at, updated_at, 
        message_count, is_active, files_changed, 
        lines_added, lines_deleted, tags
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);

    stmt.run(
      thread.id,
      thread.sessionId,
      thread.gitBranch || null,
      thread.title,
      thread.description || null,
      thread.createdAt.getTime(),
      thread.updatedAt.getTime(),
      thread.messageCount,
      thread.isActive ? 1 : 0,
      thread.metadata.filesChanged,
      thread.metadata.linesAdded,
      thread.metadata.linesDeleted,
      JSON.stringify(thread.metadata.tags || [])
    );

    return thread;
  }

  public findById(id: string): Thread | null {
    const stmt = this.db.prepare('SELECT * FROM threads WHERE id = ?');
    const row = stmt.get(id) as any;

    if (!row) return null;

    return this.mapRowToThread(row);
  }

  public findAll(options?: {
    limit?: number;
    offset?: number;
    sortBy?: 'updatedAt' | 'createdAt' | 'messageCount';
    order?: 'asc' | 'desc';
    tags?: string[];
  }): { threads: Thread[], total: number } {
    const { 
      limit = 50, 
      offset = 0, 
      sortBy = 'updatedAt', 
      order = 'desc',
      tags 
    } = options || {};

    let query = 'SELECT * FROM threads';
    let countQuery = 'SELECT COUNT(*) as total FROM threads';
    const params: any[] = [];
    const conditions: string[] = [];

    if (tags && tags.length > 0) {
      // Note: This is a simple implementation. Ideally use FTS or separate tags table.
      // For now, using LIKE on JSON string which is suboptimal but works for MVP.
      const tagConditions = tags.map(tag => {
        params.push(`%"${tag}"%`);
        return 'tags LIKE ?';
      });
      conditions.push(`(${tagConditions.join(' OR ')})`);
    }

    if (conditions.length > 0) {
      const whereClause = ` WHERE ${conditions.join(' AND ')}`;
      query += whereClause;
      countQuery += whereClause;
    }

    const sortColumn = sortBy === 'updatedAt' ? 'updated_at' : 
                       sortBy === 'createdAt' ? 'created_at' : 'message_count';
    
    query += ` ORDER BY ${sortColumn} ${order.toUpperCase()}`;
    query += ` LIMIT ? OFFSET ?`;
    
    // params for where clause + limit + offset
    const queryParams = [...params, limit, offset];
    
    const rows = this.db.prepare(query).all(...queryParams) as any[];
    const totalRow = this.db.prepare(countQuery).get(...params) as { total: number };

    return {
      threads: rows.map(this.mapRowToThread),
      total: totalRow.total
    };
  }

  public update(id: string, updates: Partial<Thread>): Thread | null {
    const current = this.findById(id);
    if (!current) return null;

    // Merge updates
    const updated = { ...current, ...updates };
    updated.updatedAt = new Date(); // Always update updatedAt

    // Ensure metadata is merged correctly if provided
    if (updates.metadata) {
      updated.metadata = { ...current.metadata, ...updates.metadata };
    }

    const stmt = this.db.prepare(`
      UPDATE threads SET
        title = ?,
        description = ?,
        git_branch = ?,
        updated_at = ?,
        message_count = ?,
        is_active = ?,
        files_changed = ?,
        lines_added = ?,
        lines_deleted = ?,
        tags = ?
      WHERE id = ?
    `);

    stmt.run(
      updated.title,
      updated.description || null,
      updated.gitBranch || null,
      updated.updatedAt.getTime(),
      updated.messageCount,
      updated.isActive ? 1 : 0,
      updated.metadata.filesChanged,
      updated.metadata.linesAdded,
      updated.metadata.linesDeleted,
      JSON.stringify(updated.metadata.tags || []),
      id
    );

    return updated;
  }

  public delete(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM threads WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  public setActive(id: string): boolean {
    const trx = this.db.transaction(() => {
      // Deactivate all
      this.db.prepare('UPDATE threads SET is_active = 0').run();
      // Activate target
      const result = this.db.prepare('UPDATE threads SET is_active = 1 WHERE id = ?').run(id);
      return result.changes > 0;
    });
    
    return trx();
  }

  public getActive(): Thread | null {
    const stmt = this.db.prepare('SELECT * FROM threads WHERE is_active = 1 LIMIT 1');
    const row = stmt.get() as any;
    if (!row) return null;
    return this.mapRowToThread(row);
  }

  public findByPrefix(prefix: string): Thread[] {
    const stmt = this.db.prepare(`SELECT * FROM threads WHERE id LIKE ? || '%'`);
    const rows = stmt.all(prefix) as any[];
    return rows.map(this.mapRowToThread);
  }

  private mapRowToThread(row: any): Thread {
    return {
      id: row.id,
      sessionId: row.session_id || row.id,
      title: row.title,
      description: row.description || undefined,
      gitBranch: row.git_branch || undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      messageCount: row.message_count,
      isActive: Boolean(row.is_active),
      metadata: {
        filesChanged: row.files_changed,
        linesAdded: row.lines_added,
        linesDeleted: row.lines_deleted,
        tags: JSON.parse(row.tags || '[]')
      }
    };
  }
}
