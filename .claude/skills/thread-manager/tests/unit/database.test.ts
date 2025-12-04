import { DatabaseManager } from '../../src/database/db';
import path from 'path';
import fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';

describe('DatabaseManager', () => {
  const testDir = path.join(__dirname, '../../tmp-test-db');
  const dbPath = path.join(testDir, `test-${uuidv4()}.db`);
  let dbManager: DatabaseManager;

  beforeAll(() => {
    fs.ensureDirSync(testDir);
  });

  afterAll(() => {
    fs.removeSync(testDir);
  });

  beforeEach(() => {
    dbManager = new DatabaseManager(dbPath);
    dbManager.init();
  });

  afterEach(() => {
    dbManager.close();
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
  });

  it('should create database file', () => {
    expect(fs.existsSync(dbPath)).toBe(true);
  });

  it('should create all tables', () => {
    const db = dbManager.getDatabase();
    
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[];
    const tableNames = tables.map(t => t.name);

    expect(tableNames).toContain('threads');
    expect(tableNames).toContain('messages');
    expect(tableNames).toContain('file_changes');
  });

  it('should be able to insert a thread', () => {
    const db = dbManager.getDatabase();
    const id = uuidv4();
    const now = Date.now();

    const stmt = db.prepare(`
      INSERT INTO threads (id, title, created_at, updated_at, is_active)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(id, 'Test Thread', now, now, 1);

    const row = db.prepare('SELECT * FROM threads WHERE id = ?').get(id) as any;
    expect(row).toBeDefined();
    expect(row.title).toBe('Test Thread');
    expect(row.is_active).toBe(1);
  });
});
