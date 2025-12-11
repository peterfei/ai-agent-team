import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs-extra';

export class DatabaseManager {
  private db: Database.Database | null = null;
  private dbPath: string;

  constructor(dbPath?: string) {
    if (dbPath) {
      this.dbPath = dbPath;
    } else {
      // Default to user's home directory .claude/threads/threads.db
      const homeDir = process.env.HOME || process.env.USERPROFILE || '.';
      this.dbPath = process.env.THREADS_DB_PATH || path.join(homeDir, '.claude', 'threads', 'threads.db');
    }
  }

  public getDatabase(): Database.Database {
    if (!this.db) {
      this.init();
    }
    return this.db!;
  }

  public init(): void {
    if (this.db) return;

    // Ensure directory exists
    const dir = path.dirname(this.dbPath);
    fs.ensureDirSync(dir);

    this.db = new Database(this.dbPath);
    this.db.pragma('journal_mode = WAL'); // Better concurrency

    this.createTables();
  }

  public close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  private createTables(): void {
    if (!this.db) return;

    // Threads Table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS threads (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        message_count INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 0,
        files_changed INTEGER DEFAULT 0,
        lines_added INTEGER DEFAULT 0,
        lines_deleted INTEGER DEFAULT 0,
        tags TEXT
      );
    `);

    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_threads_is_active ON threads(is_active);`);
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_threads_updated_at ON threads(updated_at DESC);`);
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_threads_created_at ON threads(created_at DESC);`);

    // Migration: Add session_id if not exists
    try {
      const info = this.db.pragma('table_info(threads)') as any[];
      if (!info.some(col => col.name === 'session_id')) {
        this.db.exec(`ALTER TABLE threads ADD COLUMN session_id TEXT`);
        this.db.exec(`UPDATE threads SET session_id = id WHERE session_id IS NULL`);
      }
      if (!info.some(col => col.name === 'git_branch')) {
        this.db.exec(`ALTER TABLE threads ADD COLUMN git_branch TEXT`);
      }
    } catch (e) {
      console.error('Error migrating database:', e);
    }

    // Messages Table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        thread_id TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
        content TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        metadata TEXT,
        FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE
      );
    `);

    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);`);
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp DESC);`);

    // Migration: Add embedding columns if not exists
    try {
      const info = this.db.pragma('table_info(messages)') as any[];
      if (!info.some(col => col.name === 'embedding_blob')) {
        this.db.exec(`ALTER TABLE messages ADD COLUMN embedding_blob BLOB`);
        this.db.exec(`ALTER TABLE messages ADD COLUMN embedding_model TEXT`);
        this.db.exec(`ALTER TABLE messages ADD COLUMN embedding_generated_at INTEGER`);
        this.db.exec(`CREATE INDEX IF NOT EXISTS idx_messages_embedding_exists ON messages(embedding_generated_at) WHERE embedding_blob IS NOT NULL`);
      }
    } catch (e) {
      console.error('Error migrating messages table:', e);
    }

    // File Changes Table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS file_changes (
        id TEXT PRIMARY KEY,
        thread_id TEXT NOT NULL,
        file_path TEXT NOT NULL,
        change_type TEXT NOT NULL CHECK(change_type IN ('added', 'modified', 'deleted')),
        lines_added INTEGER DEFAULT 0,
        lines_deleted INTEGER DEFAULT 0,
        timestamp INTEGER NOT NULL,
        git_commit TEXT,
        FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE
      );
    `);

    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_file_changes_thread_id ON file_changes(thread_id);`);
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_file_changes_timestamp ON file_changes(timestamp DESC);`);
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_file_changes_file_path ON file_changes(file_path);`);
  }
}

// Singleton instance for default usage
export const dbManager = new DatabaseManager();
