import { DatabaseManager, ThreadsDAO, MessagesDAO } from '../../src/database';
// No direct import of XenovaEmbeddingService, as it's fully mocked below.
import { MockEmbeddingService } from '../unit/__mocks__/embedding-service'; // Import the mock service directly
import { cosineSimilarity } from '../../src/core/vector-utils';
import path from 'path';
import fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';

jest.mock('../../src/core/embedding-service', () => ({
  // Use a factory function to ensure MockEmbeddingService is defined when accessed
  XenovaEmbeddingService: jest.fn(() => new MockEmbeddingService()),
}));

describe('Vector Search Integration', () => {
  const testDir = path.join(__dirname, '../../tmp-test-vector');
  let dbPath: string;
  let dbManager: DatabaseManager;
  let threadsDAO: ThreadsDAO;
  let messagesDAO: MessagesDAO;
  let embeddingService: MockEmbeddingService;
  let threadId: string;

  beforeAll(() => {
    fs.ensureDirSync(testDir);
  });

  afterAll(() => {
    fs.removeSync(testDir);
  });

  beforeEach(() => {
    dbPath = path.join(testDir, `test-vector-${uuidv4()}.db`);
    dbManager = new DatabaseManager(dbPath);
    dbManager.init();
    
    embeddingService = new MockEmbeddingService();
    threadsDAO = new ThreadsDAO(dbManager);
    messagesDAO = new MessagesDAO(dbManager, embeddingService);

    const thread = threadsDAO.create({ title: 'Vector Test Thread' });
    threadId = thread.id;
  });

  afterEach(() => {
    dbManager.close();
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
  });

  it('should generate embedding when creating message', async () => {
    const message = await messagesDAO.create({
      threadId,
      role: 'user',
      content: 'I like apple'
    });

    expect(message.embedding).toBeDefined();
    expect(message.embedding).toHaveLength(384);
    
    // Verify stored in DB
    const db = dbManager.getDatabase();
    const row = db.prepare('SELECT embedding_blob FROM messages WHERE id = ?').get(message.id) as any;
    expect(row.embedding_blob).toBeDefined();
    expect(row.embedding_blob.length).toBe(384 * 4); // Float32 (4 bytes)
  });

  it('should perform semantic search', async () => {
    // 1. Add messages
    await messagesDAO.create({ threadId, role: 'user', content: 'I like eating an apple' }); // Related
    await messagesDAO.create({ threadId, role: 'assistant', content: 'Apple is a fruit' });   // Related
    await messagesDAO.create({ threadId, role: 'user', content: 'My car is fast' });          // Unrelated
    
    // 2. Search
    const results = await messagesDAO.searchSimilar('fruit', {
      threadId,
      topK: 5,
      minScore: 0.1
    });

    // 3. Verify results
    expect(results.length).toBeGreaterThanOrEqual(2);
    
    // Check that we found relevant messages (case-insensitive)
    const contents = results.map(r => r.content.toLowerCase());
    expect(contents.some(c => c.includes('apple'))).toBe(true);
    expect(contents.some(c => c.includes('fruit'))).toBe(true);
    
    // 'car' should be much lower score or filtered if we set higher threshold
    const carMsg = results.find(r => r.content.includes('car'));
    if (carMsg) {
      // The car message vector has 0.9 at index 1, fruit has 0.9 at index 0.
      // Dot product should be 0.
      expect(carMsg.score).toBeLessThan(0.1); 
    }
  });

  it('should calculate cosine similarity correctly', () => {
    const vecA = [1, 0, 0];
    const vecB = [1, 0, 0];
    const vecC = [0, 1, 0];
    const vecD = [0.7071, 0.7071, 0];

    expect(cosineSimilarity(vecA, vecB)).toBeCloseTo(1);
    expect(cosineSimilarity(vecA, vecC)).toBeCloseTo(0);
    expect(cosineSimilarity(vecA, vecD)).toBeCloseTo(0.7071);
  });
});
