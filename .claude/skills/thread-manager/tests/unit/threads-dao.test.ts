import { DatabaseManager, ThreadsDAO } from '../../src/database';
import { Thread } from '../../src/types';
import path from 'path';
import fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';

describe('ThreadsDAO', () => {
  const testDir = path.join(__dirname, '../../tmp-test-db');
  let dbPath: string;
  let dbManager: DatabaseManager;
  let threadsDAO: ThreadsDAO;

  beforeAll(() => {
    fs.ensureDirSync(testDir);
  });

  afterAll(() => {
    // fs.removeSync(testDir); // Removed to avoid ENOTEMPTY error across test suites
  });

  beforeEach(() => {
    dbPath = path.join(testDir, `test-threads-${uuidv4()}.db`);
    dbManager = new DatabaseManager(dbPath);
    dbManager.init();
    threadsDAO = new ThreadsDAO(dbManager);
  });

  afterEach(() => {
    dbManager.close();
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
  });

  it('should create a new thread', () => {
    const thread = threadsDAO.create({
      title: 'Test Thread',
      description: 'This is a test thread',
      isActive: true,
      metadata: { tags: ['tag1', 'tag2'] }
    });

    expect(thread).toBeDefined();
    expect(thread.title).toBe('Test Thread');
    expect(thread.isActive).toBe(true);
    expect(thread.metadata.tags).toEqual(['tag1', 'tag2']);

    const foundThread = threadsDAO.findById(thread.id);
    expect(foundThread).toEqual(thread);
  });

  it('should find a thread by ID', () => {
    const thread1 = threadsDAO.create({ title: 'Thread 1' });
    const found = threadsDAO.findById(thread1.id);
    expect(found).toEqual(thread1);
  });

  it('should return null if thread not found', () => {
    const found = threadsDAO.findById('non-existent-id');
    expect(found).toBeNull();
  });

  it('should find all threads', () => {
    threadsDAO.create({ title: 'Thread A', createdAt: new Date(Date.now() - 10000) });
    threadsDAO.create({ title: 'Thread B', createdAt: new Date(Date.now() - 20000) });
    const { threads, total } = threadsDAO.findAll();
    expect(total).toBe(2);
    expect(threads.length).toBe(2);
    // Default sort is by updatedAt DESC, so Thread A should be first (newer)
    expect(threads[0].title).toBe('Thread A');
  });

  it('should find all threads with sorting and pagination', () => {
    threadsDAO.create({ title: 'Thread 1', messageCount: 10, createdAt: new Date('2025-01-01') });
    threadsDAO.create({ title: 'Thread 2', messageCount: 5, createdAt: new Date('2025-01-02') });
    threadsDAO.create({ title: 'Thread 3', messageCount: 15, createdAt: new Date('2025-01-03') });

    let result = threadsDAO.findAll({ sortBy: 'messageCount', order: 'desc', limit: 2 });
    expect(result.total).toBe(3);
    expect(result.threads.length).toBe(2);
    expect(result.threads[0].title).toBe('Thread 3');
    expect(result.threads[1].title).toBe('Thread 1');

    result = threadsDAO.findAll({ sortBy: 'createdAt', order: 'asc', limit: 1, offset: 1 });
    expect(result.total).toBe(3);
    expect(result.threads.length).toBe(1);
    expect(result.threads[0].title).toBe('Thread 2');
  });

  it('should find all threads filtered by tags', () => {
    threadsDAO.create({ title: 'Thread A', metadata: { tags: ['frontend', 'bug'] } });
    threadsDAO.create({ title: 'Thread B', metadata: { tags: ['backend', 'feature'] } });
    threadsDAO.create({ title: 'Thread C', metadata: { tags: ['frontend', 'feature'] } });

    let result = threadsDAO.findAll({ tags: ['frontend'] });
    expect(result.total).toBe(2); // Should find Thread A and Thread C
    expect(result.threads.length).toBe(2);

    const frontendThreads = result.threads.filter(t => t.metadata.tags?.includes('frontend'));
    expect(frontendThreads.length).toBe(2); // Threads A and C

    result = threadsDAO.findAll({ tags: ['backend'] });
    expect(result.total).toBe(1);
    expect(result.threads[0].title).toBe('Thread B');
  });

  it('should update a thread', async () => {
    const thread = threadsDAO.create({ title: 'Original Title' });

    // Add a small delay to ensure updatedAt is strictly greater
    await new Promise(resolve => setTimeout(resolve, 10));

    const updatedThread = threadsDAO.update(thread.id, {
      title: 'Updated Title',
      description: 'Updated Description',
      metadata: { tags: ['newTag'] }
    });

    expect(updatedThread).toBeDefined();
    expect(updatedThread!.title).toBe('Updated Title');
    expect(updatedThread!.description).toBe('Updated Description');
    expect(updatedThread!.metadata.tags).toEqual(['newTag']);
    expect(updatedThread!.updatedAt.getTime()).toBeGreaterThan(thread.updatedAt.getTime());

    const foundThread = threadsDAO.findById(thread.id);
    expect(foundThread).toEqual(updatedThread);
  });

  it('should delete a thread', () => {
    const thread = threadsDAO.create({ title: 'Thread to Delete' });
    const deleted = threadsDAO.delete(thread.id);
    expect(deleted).toBe(true);

    const found = threadsDAO.findById(thread.id);
    expect(found).toBeNull();
  });

  it('should set a thread as active and deactivate others', () => {
    const thread1 = threadsDAO.create({ title: 'Thread 1', isActive: true });
    const thread2 = threadsDAO.create({ title: 'Thread 2', isActive: false });
    const thread3 = threadsDAO.create({ title: 'Thread 3', isActive: false });

    expect(threadsDAO.getActive()?.id).toBe(thread1.id);

    const activated = threadsDAO.setActive(thread2.id);
    expect(activated).toBe(true);

    const activeThread = threadsDAO.getActive();
    expect(activeThread?.id).toBe(thread2.id);

    // Verify thread1 is no longer active
    const thread1After = threadsDAO.findById(thread1.id);
    expect(thread1After?.isActive).toBe(false);
  });

  it('should get the active thread', () => {
    const thread = threadsDAO.create({ title: 'Active Thread', isActive: true });
    const activeThread = threadsDAO.getActive();
    expect(activeThread?.id).toBe(thread.id);
  });

  it('should return null if no active thread', () => {
    threadsDAO.create({ title: 'Inactive Thread', isActive: false });
    const activeThread = threadsDAO.getActive();
    expect(activeThread).toBeNull();
  });
});
