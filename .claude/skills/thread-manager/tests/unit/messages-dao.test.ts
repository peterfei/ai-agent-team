import { DatabaseManager, ThreadsDAO, MessagesDAO } from '../../src/database';
import { Message } from '../../src/types';
import path from 'path';
import fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';

describe('MessagesDAO', () => {
  const testDir = path.join(__dirname, '../../tmp-test-db');
  let dbPath: string;
  let dbManager: DatabaseManager;
  let threadsDAO: ThreadsDAO;
  let messagesDAO: MessagesDAO;
  let threadId: string;

  beforeAll(() => {
    fs.ensureDirSync(testDir);
  });

  afterAll(() => {
    // fs.removeSync(testDir); 
  });

  beforeEach(() => {
    dbPath = path.join(testDir, `test-messages-${uuidv4()}.db`);
    dbManager = new DatabaseManager(dbPath);
    dbManager.init();
    threadsDAO = new ThreadsDAO(dbManager);
    messagesDAO = new MessagesDAO(dbManager);

    const thread = threadsDAO.create({ title: 'Test Thread for Messages' });
    threadId = thread.id;
  });

  afterEach(() => {
    dbManager.close();
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
  });

  it('should create a new message and update thread messageCount', () => {
    const message = messagesDAO.create({
      threadId,
      role: 'user',
      content: 'Hello, Claude!'
    });

    expect(message).toBeDefined();
    expect(message.threadId).toBe(threadId);
    expect(message.role).toBe('user');
    expect(message.content).toBe('Hello, Claude!');

    const messages = messagesDAO.findByThreadId(threadId);
    expect(messages.length).toBe(1);
    expect(messages[0].content).toBe('Hello, Claude!');

    const updatedThread = threadsDAO.findById(threadId);
    expect(updatedThread?.messageCount).toBe(1);
  });

  it('should create message with custom ID and timestamp', () => {
    const customId = uuidv4();
    const customTime = new Date('2023-01-01');
    const message = messagesDAO.create({
      id: customId,
      timestamp: customTime,
      threadId,
      role: 'system',
      content: 'System init'
    });

    expect(message.id).toBe(customId);
    expect(message.timestamp).toEqual(customTime);
    expect(message.metadata).toEqual({}); // Default empty metadata
  });

  it('should find messages by thread ID with pagination', () => {
    for (let i = 0; i < 5; i++) {
      messagesDAO.create({
        threadId,
        role: 'user',
        content: `Message ${i}`,
        timestamp: new Date(Date.now() + i * 1000) // Ensure distinct timestamps for order
      });
    }

    // Default findByThreadId sorts DESC (newest first)
    let messages = messagesDAO.findByThreadId(threadId, { limit: 2 });
    expect(messages.length).toBe(2);
    expect(messages[0].content).toBe('Message 4');
    expect(messages[1].content).toBe('Message 3');

    messages = messagesDAO.findByThreadId(threadId, { limit: 2, offset: 2 });
    expect(messages.length).toBe(2);
    expect(messages[0].content).toBe('Message 2');
    expect(messages[1].content).toBe('Message 1');
  });

  it('should delete messages by thread ID', () => {
    messagesDAO.create({ threadId, role: 'user', content: 'Msg 1' });
    messagesDAO.create({ threadId, role: 'assistant', content: 'Resp 1' });

    let messages = messagesDAO.findByThreadId(threadId);
    expect(messages.length).toBe(2);

    messagesDAO.deleteByThreadId(threadId);
    messages = messagesDAO.findByThreadId(threadId);
    expect(messages.length).toBe(0);

    const updatedThread = threadsDAO.findById(threadId);
    expect(updatedThread?.messageCount).toBe(2); 
  });

  it('should handle metadata correctly', () => {
    const metadata = { toolCall: { name: 'my_tool', id: 'call_1' } };
    const message = messagesDAO.create({
      threadId,
      role: 'assistant',
      content: 'Tool output',
      metadata: metadata
    });

    const foundMessage = messagesDAO.findByThreadId(threadId)[0];
    expect(foundMessage.metadata).toEqual(metadata);
  });
});