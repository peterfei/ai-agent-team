import { DatabaseManager } from '../../src/database';
import { ThreadManager } from '../../src/core/thread-manager';
import { MockEmbeddingService } from '../unit/__mocks__/embedding-service';
import path from 'path';
import fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';

// Import tool handlers directly
import { toolHandler as createThread } from '../../src/tools/create-thread';
import { toolHandler as listThreads } from '../../src/tools/list-threads';
import { toolHandler as switchThread } from '../../src/tools/switch-thread';
import { toolHandler as getThread } from '../../src/tools/get-thread';
import { toolHandler as updateThread } from '../../src/tools/update-thread';
import { toolHandler as deleteThread } from '../../src/tools/delete-thread';
import { toolHandler as getCurrentThread } from '../../src/tools/get-current-thread';
import { toolHandler as trackFileChange } from '../../src/tools/track-file-change';

jest.mock('../../src/core/embedding-service', () => ({
  XenovaEmbeddingService: jest.fn(() => new MockEmbeddingService()),
}));

describe('MCP Tools Integration', () => {
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
    dbPath = path.join(testDir, `test-integration-${uuidv4()}.db`);
    dbManager = new DatabaseManager(dbPath);
    dbManager.init();
    threadManager = new ThreadManager(dbManager);
  });

  afterEach(() => {
    dbManager.close();
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
  });

  const callTool = async (handler: any, name: string, input: any) => {
      return await handler({ toolName: name, input }, threadManager);
  };

  it('should create and list threads', async () => {
    // 1. Create a thread
    const createResult = await callTool(createThread, 'create_thread', {
      title: 'Integration Thread',
      description: 'Testing via MCP',
      tags: ['test']
    });

    expect(createResult.thread).toBeDefined();
    expect(createResult.thread.title).toBe('Integration Thread');
    expect(createResult.thread.isActive).toBe(true); // Default switchTo is true

    // 2. List threads
    const listResult = await callTool(listThreads, 'list_threads', {});
    expect(listResult.total).toBe(1);
    expect(listResult.threads[0].id).toBe(createResult.thread.id);
    expect(listResult.currentThreadId).toBe(createResult.thread.id);
  });

  it('should switch threads', async () => {
    const thread1 = (await callTool(createThread, 'create_thread', { title: 'Thread 1', switchTo: true })).thread;
    const thread2 = (await callTool(createThread, 'create_thread', { title: 'Thread 2', switchTo: false })).thread;

    expect(thread1.isActive).toBe(true); 
    
    // Verify current is thread 1
    let current = await callTool(getCurrentThread, 'get_current_thread', {});
    expect(current.thread.id).toBe(thread1.id);

    // Switch to thread 2
    const switchResult = await callTool(switchThread, 'switch_thread', { threadId: thread2.id });
    expect(switchResult.success).toBe(true);
    expect(switchResult.thread.id).toBe(thread2.id);

    // Verify current is thread 2
    current = await callTool(getCurrentThread, 'get_current_thread', {});
    expect(current.thread.id).toBe(thread2.id);
  });

  it('should update a thread', async () => {
    const thread = (await callTool(createThread, 'create_thread', { title: 'Old Title' })).thread;
    
    const updateResult = await callTool(updateThread, 'update_thread', {
      threadId: thread.id,
      title: 'New Title',
      tags: ['updated']
    });

    expect(updateResult.success).toBe(true);
    expect(updateResult.thread.title).toBe('New Title');
    expect(updateResult.thread.metadata.tags).toContain('updated');
  });

  it('should delete a thread', async () => {
    const thread = (await callTool(createThread, 'create_thread', { title: 'To Delete', switchTo: false })).thread;
    
    const deleteResult = await callTool(deleteThread, 'delete_thread', {
      threadId: thread.id,
      confirm: true
    });

    expect(deleteResult.success).toBe(true);

    const listResult = await callTool(listThreads, 'list_threads', {});
    expect(listResult.threads.find((t: any) => t.id === thread.id)).toBeUndefined();
  });

  it('should fail to delete active thread', async () => {
    const thread = (await callTool(createThread, 'create_thread', { title: 'Active', switchTo: true })).thread;
    
    const deleteResult = await callTool(deleteThread, 'delete_thread', {
      threadId: thread.id,
      confirm: true
    });

    expect(deleteResult.success).toBe(false);
    expect(deleteResult.message).toContain('active thread');
  });

  it('should track file changes', async () => {
    // Must have an active thread
    await callTool(createThread, 'create_thread', { title: 'File Work' });

    const trackResult = await callTool(trackFileChange, 'track_file_change', {
      filePath: 'src/main.ts',
      changeType: 'modified',
      linesAdded: 5,
      linesDeleted: 2
    });

    expect(trackResult.success).toBe(true);
    expect(trackResult.fileChange.filePath).toBe('src/main.ts');

    const threadInfo = await callTool(getCurrentThread, 'get_current_thread', { includeFileChanges: true });
    expect(threadInfo.fileChanges.length).toBe(1);
    expect(threadInfo.thread.metadata.linesAdded).toBe(5);
  });
});
