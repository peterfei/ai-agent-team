import { ThreadManager } from '../../src/core/thread-manager';
import { DatabaseManager } from '../../src/database';
import path from 'path';
import fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';

// Mock GitIntegration
const mockGetFileStats = jest.fn();
const mockGetCurrentCommit = jest.fn();

jest.mock('../../src/git/git-integration', () => {
  return {
    GitIntegration: jest.fn().mockImplementation(() => {
      return {
        getFileStats: mockGetFileStats,
        getCurrentCommit: mockGetCurrentCommit,
        isGitRepo: jest.fn().mockResolvedValue(true)
      };
    })
  };
});

describe('FileTracker Integration', () => {
  const testDir = path.join(__dirname, '../../tmp-test-db');
  let dbPath: string;
  let dbManager: DatabaseManager;
  let threadManager: ThreadManager;

  beforeAll(() => {
    fs.ensureDirSync(testDir);
  });

  afterAll(() => {
     // fs.removeSync(testDir);
  });

  beforeEach(async () => {
    dbPath = path.join(testDir, `test-file-tracker-${uuidv4()}.db`);
    dbManager = new DatabaseManager(dbPath);
    dbManager.init();
    threadManager = new ThreadManager(dbManager);
    
    // Create an active thread
    await threadManager.createThread({ title: 'Tracking Thread' });
    
    jest.clearAllMocks();
  });

  afterEach(() => {
    dbManager.close();
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
  });

  it('should track file change with provided stats', async () => {
    const activeThread = (await threadManager.getCurrentThread()).thread!;
    
    const result = await threadManager.trackFileChange(
        activeThread.id,
        'src/manual.ts',
        'modified',
        10,
        5
    );

    expect(result.filePath).toBe('src/manual.ts');
    expect(result.linesAdded).toBe(10);
    expect(result.linesDeleted).toBe(5);
    
    // GitIntegration should NOT be called for stats
    expect(mockGetFileStats).not.toHaveBeenCalled();
  });

  it('should auto-detect stats if not provided', async () => {
    const activeThread = (await threadManager.getCurrentThread()).thread!;
    
    mockGetFileStats.mockResolvedValue({
        added: 20,
        deleted: 8,
        changeType: 'modified'
    });
    mockGetCurrentCommit.mockResolvedValue('hash123');

    const result = await threadManager.trackFileChange(
        activeThread.id,
        'src/auto.ts'
    );

    expect(result.filePath).toBe('src/auto.ts');
    expect(result.linesAdded).toBe(20);
    expect(result.linesDeleted).toBe(8);
    expect(result.changeType).toBe('modified');
    expect(result.gitCommit).toBe('hash123');
    
    expect(mockGetFileStats).toHaveBeenCalledWith('src/auto.ts');
  });

  it('should update thread metadata after tracking', async () => {
    const activeThread = (await threadManager.getCurrentThread()).thread!;
    
    mockGetFileStats.mockResolvedValue({ added: 5, deleted: 0, changeType: 'added' });
    
    await threadManager.trackFileChange(activeThread.id, 'src/new.ts');
    
    const updatedThread = (await threadManager.getThread(activeThread.id)).thread!;
    expect(updatedThread.metadata.filesChanged).toBe(1);
    expect(updatedThread.metadata.linesAdded).toBe(5);
  });
});
