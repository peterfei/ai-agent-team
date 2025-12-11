import { Database } from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '../types';
import { DatabaseManager } from './db';
import { IEmbeddingService } from '../core/embedding-service';
import { serializeEmbedding, deserializeEmbedding } from '../core/vector-utils';
import { VectorSearchEngine, SearchResult } from '../core/vector-search-engine';

export class MessagesDAO {
  private dbManager: DatabaseManager;
  private embeddingService: IEmbeddingService;
  private searchEngine: VectorSearchEngine;

  constructor(dbManager: DatabaseManager, embeddingService: IEmbeddingService) {
    this.dbManager = dbManager;
    this.embeddingService = embeddingService;
    this.searchEngine = new VectorSearchEngine();
  }

  private get db(): Database {
    return this.dbManager.getDatabase();
  }

  public async create(input: Partial<Message> & { threadId: string, role: string, content: string }): Promise<Message> {
    const id = input.id || uuidv4();
    const now = input.timestamp || new Date();

    // Generate embedding (Async)
    let embedding: number[] | undefined;
    let embeddingBlob: Buffer | null = null;
    let embeddingModel: string | null = null;
    let embeddingGeneratedAt: number | null = null;

    try {
      embedding = await this.embeddingService.embed(input.content);
      if (embedding) {
        embeddingBlob = serializeEmbedding(embedding);
        const modelInfo = this.embeddingService.getModelInfo();
        embeddingModel = modelInfo.name;
        embeddingGeneratedAt = Date.now();
      }
    } catch (e) {
      console.error('Failed to generate embedding:', e);
      // Proceed without embedding
    }
    
    const message: Message = {
      id,
      threadId: input.threadId,
      role: input.role as any,
      content: input.content,
      timestamp: now,
      metadata: input.metadata || {},
      embedding
    };

    const stmt = this.db.prepare(`
      INSERT INTO messages (
        id, thread_id, role, content, timestamp, metadata,
        embedding_blob, embedding_model, embedding_generated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);

    stmt.run(
      message.id,
      message.threadId,
      message.role,
      message.content,
      message.timestamp.getTime(),
      JSON.stringify(message.metadata || {}),
      embeddingBlob,
      embeddingModel,
      embeddingGeneratedAt
    );

    // Update thread message count
    this.updateThreadMessageCount(message.threadId);

    return message;
  }

  public findByThreadId(threadId: string, options?: { limit?: number, offset?: number }): Message[] {
    const { limit = 50, offset = 0 } = options || {};
    
    const stmt = this.db.prepare(`
      SELECT * FROM messages 
      WHERE thread_id = ? 
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `);

    const rows = stmt.all(threadId, limit, offset) as any[];

    return rows.map(this.mapRowToMessage);
  }

  /**
   * Semantically search for messages
   */
  public async searchSimilar(
    query: string,
    options: {
      threadId?: string;
      topK?: number;
      minScore?: number;
    } = {}
  ): Promise<Array<Message & { score: number }>> {
    const { threadId, topK = 10, minScore = 0.5 } = options;

    // 1. Generate query vector
    const queryVector = await this.embeddingService.embed(query);

    // 2. Load candidate messages (all messages with embeddings)
    // Optimization: Filter by threadId in SQL if provided to reduce memory usage
    let sql = 'SELECT * FROM messages WHERE embedding_blob IS NOT NULL';
    const params: any[] = [];

    if (threadId) {
      sql += ' AND thread_id = ?';
      params.push(threadId);
    }

    const rows = this.db.prepare(sql).all(...params) as any[];

    // 3. Build corpus
    const corpus = rows.map(row => ({
      id: row.id,
      vector: deserializeEmbedding(row.embedding_blob),
      payload: this.mapRowToMessage(row)
    }));

    // 4. Perform vector search
    const results = this.searchEngine.search(queryVector, corpus, {
      topK,
      minScore
    });

    // 5. Map results
    return results.map(result => ({
      ...result.payload!,
      score: result.score
    }));
  }
  
  public deleteByThreadId(threadId: string): void {
      const stmt = this.db.prepare('DELETE FROM messages WHERE thread_id = ?');
      stmt.run(threadId);
  }

  private updateThreadMessageCount(threadId: string): void {
      const countStmt = this.db.prepare('SELECT COUNT(*) as count FROM messages WHERE thread_id = ?');
      const result = countStmt.get(threadId) as { count: number };
      
      const updateStmt = this.db.prepare('UPDATE threads SET message_count = ? WHERE id = ?');
      updateStmt.run(result.count, threadId);
  }

  private mapRowToMessage(row: any): Message {
    const message: Message = {
      id: row.id,
      threadId: row.thread_id,
      role: row.role,
      content: row.content,
      timestamp: new Date(row.timestamp),
      metadata: JSON.parse(row.metadata || '{}')
    };

    if (row.embedding_blob) {
      message.embedding = deserializeEmbedding(row.embedding_blob);
    }

    return message;
  }
}