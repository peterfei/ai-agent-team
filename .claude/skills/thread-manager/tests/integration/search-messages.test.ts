import { DatabaseManager } from '../../src/database';
import { ThreadManager } from '../../src/core/thread-manager';
// No direct import of XenovaEmbeddingService, as it's fully mocked below.
import { MockEmbeddingService } from '../unit/__mocks__/embedding-service'; // Import the mock service
import path from 'path';
import fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';

// Import tool handlers directly
import { toolHandler as createThread } from '../../src/tools/create-thread';
import { toolHandler as addMessage } from '../../src/tools/add-message';
import { toolHandler as searchMessages } from '../../src/tools/search-messages';
import { toolHandler as switchThread } from '../../src/tools/switch-thread';

jest.mock('../../src/core/embedding-service', () => ({
  // Use a factory function to ensure MockEmbeddingService is defined when accessed
  XenovaEmbeddingService: jest.fn(() => new MockEmbeddingService()),
}));

describe('search_messages MCP Tool Integration', () => {
  const testDir = path.join(__dirname, '../../tmp-test-db');
  let dbPath: string;
  let dbManager: DatabaseManager;
  let threadManager: ThreadManager;
  
  beforeAll(() => {
    fs.ensureDirSync(testDir);
  });

  afterAll(() => {
    fs.removeSync(testDir);
  });

  beforeEach(async () => {
    dbPath = path.join(testDir, `test-search-messages-${uuidv4()}.db`);
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

  it('should find relevant messages in the current thread', async () => {
    // Create and switch to a thread
    const createResult = await callTool(createThread, 'create_thread', { title: 'Fruit & Vehicle Discussion' });
    const threadId = createResult.thread.id;
    await callTool(switchThread, 'switch_thread', { threadId });

    // Add messages
    await callTool(addMessage, 'add_message', { role: 'user', content: 'I love apples and other fruits.' });
    await callTool(addMessage, 'add_message', { role: 'assistant', content: 'Indeed, fruits are very healthy.' });
    await callTool(addMessage, 'add_message', { role: 'user', content: 'My car broke down today, it was a real struggle.' });
    await callTool(addMessage, 'add_message', { role: 'assistant', content: 'Oh no, what kind of vehicle is it?' });
    await callTool(addMessage, 'add_message', { role: 'user', content: 'I had a banana for breakfast.' });

    // Search for fruit-related messages
    const fruitSearchResults = await callTool(searchMessages, 'search_messages', {
      query: 'healthy snacks',
      topK: 3,
      minScore: 0.5
    });

    expect(fruitSearchResults.message).toContain('搜索结果');
    expect(fruitSearchResults.message).toContain('apples and other fruits');
    expect(fruitSearchResults.message).toContain('fruits are very healthy');
    expect(fruitSearchResults.message).toContain('banana');
    expect(fruitSearchResults.message).not.toContain('car');
    expect(fruitSearchResults.message).not.toContain('vehicle');

    // Search for vehicle-related messages
    const vehicleSearchResults = await callTool(searchMessages, 'search_messages', {
      query: 'transport problems',
      topK: 2,
      minScore: 0.5
    });
    expect(vehicleSearchResults.message).toContain('搜索结果');
    expect(vehicleSearchResults.message).toContain('car broke down');
    expect(vehicleSearchResults.message).toContain('kind of vehicle');
    expect(vehicleSearchResults.message).not.toContain('apples');

    // Search for something not present
    const noResults = await callTool(searchMessages, 'search_messages', {
      query: 'random unrelated topic',
      topK: 2,
      minScore: 0.8
    });
    expect(noResults.message).toContain('未找到');

  });

  it('should respect threadId filter', async () => {
    const createResult1 = await callTool(createThread, 'create_thread', { title: 'Thread A' });
    const threadAId = createResult1.thread.id;
    await callTool(addMessage, 'add_message', { role: 'user', content: 'Apple in thread A' });

    const createResult2 = await callTool(createThread, 'create_thread', { title: 'Thread B', switchTo: false }); // Don't switch to B
    const threadBId = createResult2.thread.id;
    
    // Switch to B to add message
    await callTool(switchThread, 'switch_thread', { threadId: threadBId });
    await callTool(addMessage, 'add_message', { role: 'user', content: 'Apple in thread B' });

    // Switch back to A
    await callTool(switchThread, 'switch_thread', { threadId: threadAId });
    
    // Search for 'Apple' specifically in thread A (which is active)
    await callTool(switchThread, 'switch_thread', { threadId: threadAId }); // Ensure A is active
    const searchResultsA = await callTool(searchMessages, 'search_messages', {
      query: 'fruit',
      threadId: threadAId,
      topK: 1
    });
    expect(searchResultsA.message).toContain('Apple in thread A');
    expect(searchResultsA.message).not.toContain('Apple in thread B');

    // Search for 'Apple' specifically in thread B
    const searchResultsB = await callTool(searchMessages, 'search_messages', {
      query: 'fruit',
      threadId: threadBId,
      topK: 1
    });
    expect(searchResultsB.message).toContain('Apple in thread B');
    expect(searchResultsB.message).not.toContain('Apple in thread A');

  });

  it('should return error for invalid input', async () => {
    const errorResults = await callTool(searchMessages, 'search_messages', {
      query: 123, // Invalid type
    });
    expect(errorResults.isError).toBe(true);
    expect(errorResults.message).toContain('Invalid input');
  });
});
