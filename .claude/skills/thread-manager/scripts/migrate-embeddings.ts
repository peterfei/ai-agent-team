import { DatabaseManager, MessagesDAO } from '../src/database';
import { XenovaEmbeddingService } from '../src/core/embedding-service';
import { serializeEmbedding } from '../src/core/vector-utils';
import path from 'path';

async function migrate() {
  console.log('[Migration] Starting embedding migration...');

  // Initialize services
  const dbManager = new DatabaseManager();
  dbManager.init(); // Uses default path
  
  const embeddingService = new XenovaEmbeddingService();
  const db = dbManager.getDatabase();

  try {
    // 1. Count total messages to process
    const countStmt = db.prepare('SELECT COUNT(*) as count FROM messages WHERE embedding_blob IS NULL');
    const total = (countStmt.get() as { count: number }).count;

    console.log(`[Migration] Found ${total} messages without embeddings.`);

    if (total === 0) {
      console.log('[Migration] No messages to migrate.');
      return;
    }

    const BATCH_SIZE = 50;
    let processed = 0;
    let failed = 0;

    // 2. Process in batches
    while (processed < total) {
      const batchStmt = db.prepare(`
        SELECT id, content FROM messages 
        WHERE embedding_blob IS NULL 
        LIMIT ?
      `);
      
      const batch = batchStmt.all(BATCH_SIZE) as Array<{ id: string; content: string }>;
      
      if (batch.length === 0) break;

      console.log(`[Migration] Processing batch of ${batch.length} messages...`);
      
      const texts = batch.map(m => m.content);
      
      try {
        // Generate embeddings in batch
        const embeddings = await embeddingService.embedBatch(texts);
        
        // Update database in transaction
        const updateStmt = db.prepare(`
          UPDATE messages 
          SET embedding_blob = ?, 
              embedding_model = ?, 
              embedding_generated_at = ? 
          WHERE id = ?
        `);

        const modelInfo = embeddingService.getModelInfo();
        const now = Date.now();

        const transaction = db.transaction(() => {
          batch.forEach((msg, index) => {
            const blob = serializeEmbedding(embeddings[index]);
            updateStmt.run(blob, modelInfo.name, now, msg.id);
          });
        });

        transaction();
        
        processed += batch.length;
        console.log(`[Migration] Progress: ${processed}/${total} (${((processed / total) * 100).toFixed(1)}%)`);

      } catch (error) {
        console.error('[Migration] Batch failed:', error);
        failed += batch.length;
        // Optionally break or continue depending on error strategy. 
        // For now, we continue to try next batch but skips might happen if limit offset was used, 
        // but here we filter by IS NULL so failed ones will just be picked up again if we don't skip.
        // If we fail, we probably should stop to avoid infinite loop on same bad data if using LIMIT only.
        // But since we use WHERE IS NULL, if update fails, they stay NULL.
        // So we might get stuck in a loop processing the same failing batch.
        // Let's break for safety.
        break;
      }
    }

    console.log('[Migration] Migration completed.');
    console.log(`[Migration] Processed: ${processed}`);
    console.log(`[Migration] Failed: ${failed}`);

  } catch (error) {
    console.error('[Migration] Fatal error:', error);
  } finally {
    dbManager.close();
  }
}

// Run if main
if (require.main === module) {
  migrate().catch(console.error);
}
