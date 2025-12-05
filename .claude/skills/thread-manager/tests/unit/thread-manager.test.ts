import { DatabaseManager, ThreadsDAO, MessagesDAO, FileChangesDAO } from '../../src/database';
import { ThreadManager } from '../../src/core/thread-manager';
import { Thread, Message, FileChange } from '../../src/types';
import path from 'path';
import fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';

describe('ThreadManager', () => {
  const testDir = path.join(__dirname, '../../tmp-test-db');
  let dbPath: string;
  let dbManager: DatabaseManager;
  let threadManager: ThreadManager;
  let threadsDAO: ThreadsDAO; // For direct assertions where ThreadManager methods are not suitable

  beforeAll(() => {
    fs.ensureDirSync(testDir);
  });

  afterAll(() => {
    // fs.removeSync(testDir); // Managed by database.test.ts for full cleanup
  });

  beforeEach(() => {
    dbPath = path.join(testDir, `test-thread-manager-${uuidv4()}.db`);
    dbManager = new DatabaseManager(dbPath);
    dbManager.init();
    threadsDAO = new ThreadsDAO(dbManager);
    threadManager = new ThreadManager(dbManager);
  });

  afterEach(() => {
    dbManager.close();
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
  });

  it('should create a new thread and set it as active', async () => {
    const { thread, message } = await threadManager.createThread({
      title: 'New Feature',
      description: 'Implement a new user feature',
      tags: ['feature', 'frontend']
    });

    expect(thread).toBeDefined();
    expect(thread.title).toBe('New Feature');
    expect(thread.isActive).toBe(true);
    expect(message).toContain('新线程已创建');

    const activeThread = await threadManager.getCurrentThread();
    expect(activeThread.thread?.id).toBe(thread.id);
  });

  it('should create a new thread without switching', async () => {
    const { thread: thread1 } = await threadManager.createThread({ title: 'Thread 1', switchTo: true });
    const { thread: thread2 } = await threadManager.createThread({ title: 'Thread 2', switchTo: false });

    expect(thread1.isActive).toBe(true); // thread1 should remain active
    expect(thread2.isActive).toBe(false); // thread2 should NOT be active

    const current = await threadManager.getCurrentThread();
    expect(current.thread?.id).toBe(thread1.id); // Thread1 was activated, then thread2 created without switch, so thread1 stays active
  });

  it('should get a thread by ID', async () => {
    const { thread: createdThread } = await threadManager.createThread({ title: 'Get Test' });
    const { thread: foundThread } = await threadManager.getThread(createdThread.id);

    expect(foundThread).toEqual(createdThread);
  });

  it('should list threads and show the current active one', async () => {
    const { thread: thread1 } = await threadManager.createThread({ title: 'List Thread 1', switchTo: true });
    const { thread: thread2 } = await threadManager.createThread({ title: 'List Thread 2', switchTo: false });

    const { threads, total, currentThreadId } = await threadManager.listThreads({});
    expect(total).toBe(2);
    expect(threads.length).toBe(2);
    expect(currentThreadId).toBe(thread1.id);
  });

  it('should update a thread', async () => {
    const { thread: createdThread } = await threadManager.createThread({ title: 'Update Test' });
    const { success, thread: updatedThread } = await threadManager.updateThread(createdThread.id, { title: 'Updated Title', description: 'New Desc' });

    expect(success).toBe(true);
    expect(updatedThread?.title).toBe('Updated Title');
    expect(updatedThread?.description).toBe('New Desc');

    const { thread: foundThread } = await threadManager.getThread(createdThread.id);
    expect(foundThread?.title).toBe('Updated Title');
  });

  it('should not update a non-existent thread', async () => {
    const { success, message } = await threadManager.updateThread('non-existent', { title: 'X' });
    expect(success).toBe(false);
    expect(message).toContain('not found');
  });

  it('should delete a thread', async () => {
    const { thread: threadToDelete } = await threadManager.createThread({ title: 'To Delete', switchTo: false });
    const { success, message } = await threadManager.deleteThread(threadToDelete.id);

    expect(success).toBe(true);
    expect(message).toContain('deleted successfully');

    const { thread: foundThread } = await threadManager.getThread(threadToDelete.id);
    expect(foundThread).toBeNull();
  });

  it('should not delete the active thread', async () => {
    const { thread: activeThread } = await threadManager.createThread({ title: 'Active One', switchTo: true });
    const { success, message } = await threadManager.deleteThread(activeThread.id);

    expect(success).toBe(false);
    expect(message).toContain('Cannot delete the currently active thread');
  });

  it('should switch to a different thread', async () => {
    const { thread: thread1 } = await threadManager.createThread({ title: 'Thread One', switchTo: true });
    const { thread: thread2 } = await threadManager.createThread({ title: 'Thread Two', switchTo: false });

    expect(threadsDAO.getActive()?.id).toBe(thread1.id);

    const { success, thread: switchedThread, message } = await threadManager.switchThread(thread2.id);
    expect(success).toBe(true);
    expect(switchedThread?.id).toBe(thread2.id);
    expect(switchedThread?.isActive).toBe(true);
    expect(message).toContain('已切换到线程');

    const currentActive = await threadManager.getCurrentThread();
    expect(currentActive.thread?.id).toBe(thread2.id);
    expect((await threadsDAO.findById(thread1.id))?.isActive).toBe(false);
  });

  it('should get the current active thread', async () => {
    const { thread: createdThread } = await threadManager.createThread({ title: 'Current Active' });
    const { thread: activeThread } = await threadManager.getCurrentThread();
    expect(activeThread?.id).toBe(createdThread.id);
  });

  it('should add a message to the active thread', async () => {
    const { thread: activeThread } = await threadManager.createThread({ title: 'Message Test' });
    const message = await threadManager.addMessageToThread(activeThread.id, 'user', 'First message');

    expect(message).toBeDefined();
    expect(message.content).toBe('First message');

    const { thread: updatedThread } = await threadManager.getThread(activeThread.id);
    expect(updatedThread?.messageCount).toBe(1);

    const { messages } = await threadManager.getThread(activeThread.id, true);
    expect(messages?.length).toBe(1);
    expect(messages?.[0].content).toBe('First message');
  });

  it('should not add a message to a non-active thread', async () => {
    const { thread: thread1 } = await threadManager.createThread({ title: 'Thread 1', switchTo: true });
    const { thread: thread2 } = await threadManager.createThread({ title: 'Thread 2', switchTo: false });

    await expect(threadManager.addMessageToThread(thread2.id, 'user', 'Message'))
      .rejects.toThrow(/not the active thread/);
  });

  it('should track a file change for the active thread', async () => {
    const { thread: activeThread } = await threadManager.createThread({ title: 'File Change Test' });
    const fileChange = await threadManager.trackFileChange(activeThread.id, 'src/index.ts', 'modified', 10, 5);

    expect(fileChange).toBeDefined();
    expect(fileChange.filePath).toBe('src/index.ts');

    const { thread: updatedThread, fileChanges } = await threadManager.getThread(activeThread.id, false, true);
    expect(updatedThread?.metadata.filesChanged).toBe(1);
    expect(updatedThread?.metadata.linesAdded).toBe(10);
    expect(updatedThread?.metadata.linesDeleted).toBe(5);
    expect(fileChanges?.length).toBe(1);
    expect(fileChanges?.[0].filePath).toBe('src/index.ts');
  });

  it('should not track a file change for a non-active thread', async () => {
    const { thread: thread1 } = await threadManager.createThread({ title: 'Thread 1', switchTo: true });
    const { thread: thread2 } = await threadManager.createThread({ title: 'Thread 2', switchTo: false });

    await expect(threadManager.trackFileChange(thread2.id, 'src/file.ts', 'added', 1, 0))
      .rejects.toThrow(/not the active thread/);
  });

  it('createThread should deactivate previous active thread when switchTo is true', async () => {
    const { thread: thread1 } = await threadManager.createThread({ title: 'Thread 1', switchTo: true });
    const { thread: thread2 } = await threadManager.createThread({ title: 'Thread 2', switchTo: true });

    const foundThread1 = await threadsDAO.findById(thread1.id);
    expect(foundThread1?.isActive).toBe(false);
    expect(thread2.isActive).toBe(true);
  });

  it('createThread should not deactivate previous active thread when switchTo is false', async () => {
    const { thread: thread1 } = await threadManager.createThread({ title: 'Thread 1', switchTo: true });
    const { thread: thread2 } = await threadManager.createThread({ title: 'Thread 2', switchTo: false });

    const foundThread1 = await threadsDAO.findById(thread1.id);
    expect(foundThread1?.isActive).toBe(true);
    expect(thread2.isActive).toBe(false);
  });
});
