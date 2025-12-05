import { DatabaseManager, ThreadsDAO, FileChangesDAO } from '../../src/database';
import { FileChange } from '../../src/types';
import path from 'path';
import fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';

describe('FileChangesDAO', () => {
  const testDir = path.join(__dirname, '../../tmp-test-db');
  let dbPath: string;
  let dbManager: DatabaseManager;
  let threadsDAO: ThreadsDAO;
  let fileChangesDAO: FileChangesDAO;
  let threadId: string;

  beforeAll(() => {
    fs.ensureDirSync(testDir);
  });

  afterAll(() => {
    // fs.removeSync(testDir); // Removed to avoid ENOTEMPTY error across test suites
  });

  beforeEach(() => {
    dbPath = path.join(testDir, `test-file-changes-${uuidv4()}.db`);
    dbManager = new DatabaseManager(dbPath);
    dbManager.init();
    threadsDAO = new ThreadsDAO(dbManager);
    fileChangesDAO = new FileChangesDAO(dbManager);

    const thread = threadsDAO.create({ title: 'Test Thread for File Changes' });
    threadId = thread.id;
  });

  afterEach(() => {
    dbManager.close();
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
  });

  it('should create a new file change and update thread stats', () => {
    const fileChange = fileChangesDAO.create({
      threadId,
      filePath: '/src/file1.ts',
      changeType: 'added',
      linesAdded: 10,
      linesDeleted: 0
    });

    expect(fileChange).toBeDefined();
    expect(fileChange.threadId).toBe(threadId);
    expect(fileChange.filePath).toBe('/src/file1.ts');

    const fileChanges = fileChangesDAO.findByThreadId(threadId);
    expect(fileChanges.length).toBe(1);
    expect(fileChanges[0].filePath).toBe('/src/file1.ts');

    const updatedThread = threadsDAO.findById(threadId);
    expect(updatedThread?.metadata.filesChanged).toBe(1);
    expect(updatedThread?.metadata.linesAdded).toBe(10);
    expect(updatedThread?.metadata.linesDeleted).toBe(0);
  });

  it('should aggregate file change stats for a thread', () => {
    fileChangesDAO.create({ threadId, filePath: '/src/file1.ts', changeType: 'added', linesAdded: 10, linesDeleted: 0 });
    fileChangesDAO.create({ threadId, filePath: '/src/file2.ts', changeType: 'modified', linesAdded: 5, linesDeleted: 2 });
    fileChangesDAO.create({ threadId, filePath: '/src/file1.ts', changeType: 'modified', linesAdded: 3, linesDeleted: 1 }); // Same file, distinct count for filesChanged

    const updatedThread = threadsDAO.findById(threadId);
    expect(updatedThread?.metadata.filesChanged).toBe(2); // file1.ts and file2.ts
    expect(updatedThread?.metadata.linesAdded).toBe(18); // 10 + 5 + 3
    expect(updatedThread?.metadata.linesDeleted).toBe(3);  // 0 + 2 + 1
  });

  it('should find file changes by thread ID', () => {
    const change1 = fileChangesDAO.create({ threadId, filePath: 'path1', changeType: 'added', timestamp: new Date(Date.now() - 2000) });
    const change2 = fileChangesDAO.create({ threadId, filePath: 'path2', changeType: 'modified', timestamp: new Date(Date.now() - 1000) });

    const foundChanges = fileChangesDAO.findByThreadId(threadId);
    expect(foundChanges.length).toBe(2);
    // Should be sorted by timestamp DESC (newest first)
    expect(foundChanges[0].filePath).toBe('path2');
    expect(foundChanges[1].filePath).toBe('path1');
  });

  it('should handle gitCommit field', () => {
    const commitHash = 'a1b2c3d4e5f6';
    const fileChange = fileChangesDAO.create({
      threadId,
      filePath: '/src/commited.js',
      changeType: 'modified',
      linesAdded: 1,
      linesDeleted: 1,
      gitCommit: commitHash
    });

    const foundChange = fileChangesDAO.findByThreadId(threadId)[0];
    expect(foundChange.gitCommit).toBe(commitHash);
  });
});
