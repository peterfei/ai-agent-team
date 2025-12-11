# Phase 1: 基础向量检索 MVP - 详细实施计划

**版本**: 1.0
**目标周期**: 2-3周（10-15个工作日）
**状态**: 📋 规划中
**负责人**: Backend Team
**优先级**: 🔴 P0 - 关键路径

---

## 一、Phase 1 目标与范围

### 1.1 核心目标

> **为Thread Manager添加语义搜索能力，让AI能够基于意图而非关键词找到相关对话历史**

**成功标准**:
- ✅ 用户可以用自然语言搜索历史消息
- ✅ 搜索结果按语义相似度排序
- ✅ 新消息自动生成嵌入向量
- ✅ P95响应时间 < 100ms（1万条消息规模）
- ✅ 向后兼容：不破坏现有功能

### 1.2 功能范围

**包含 (In Scope)**:
- [x] 集成轻量级嵌入模型（本地运行）
- [x] 为Message实体添加embedding字段
- [x] 实现基础向量相似度搜索（内存Brute Force）
- [x] 新增`search_messages` MCP工具
- [x] 迁移现有消息生成嵌入（异步任务）
- [x] 基础性能测试

**不包含 (Out of Scope)**:
- ❌ Qdrant集成（Phase 2）
- ❌ 分层记忆架构（Phase 2）
- ❌ 语义记忆库（Phase 3）
- ❌ 高级检索（MQE、HyDE）（Phase 4）
- ❌ 生产级性能优化（Phase 5）

---

## 二、技术选型与架构决策

### 2.1 嵌入模型选择

#### 候选方案对比

| 方案 | 优势 | 劣势 | 适合场景 | 评分 |
|------|------|------|---------|------|
| **@xenova/transformers** | • 纯JS实现，零依赖<br>• ONNX Runtime优化<br>• 支持所有平台 | • 首次加载稍慢（下载模型）<br>• 速度略低于原生 | **✅ MVP首选** | ⭐⭐⭐⭐⭐ |
| **sentence-transformers (Python)** | • 速度最快<br>• 模型生态丰富 | • 需要Python环境<br>• 跨语言调用复杂 | 对性能要求极高 | ⭐⭐⭐ |
| **OpenAI Embeddings API** | • 质量最高<br>• 零运维 | • 需要网络<br>• 成本（$0.0001/1K tokens）<br>• 隐私风险 | 云端场景 | ⭐⭐ |
| **transformers.js (Web)** | • 可在浏览器运行 | • Node环境支持有限 | Web应用 | ⭐⭐ |

#### 最终决策: **@xenova/transformers**

**理由**:
1. ✅ **纯TypeScript生态** - 无需额外语言栈，降低部署复杂度
2. ✅ **离线优先** - 模型本地运行，保护用户隐私
3. ✅ **平台兼容** - macOS、Linux、Windows均支持
4. ✅ **性能足够** - 单次嵌入5-10ms，满足MVP需求

**模型选择: `Xenova/all-MiniLM-L6-v2`**
```typescript
{
  dimensions: 384,          // 向量维度
  modelSize: '23MB',        // 模型文件大小
  speed: '5-10ms/句',       // 单句推理速度
  quality: 'MTEB Score 58.8' // 中等质量，足够使用
}
```

### 2.2 向量存储方案

#### 候选方案对比

| 方案 | 适用规模 | 延迟 | 实现难度 | 评分 |
|------|---------|------|---------|------|
| **内存Brute Force** | < 1万条 | 2-5ms | 极低 | ⭐⭐⭐⭐⭐ MVP首选 |
| **SQLite-VSS扩展** | < 10万条 | 5-20ms | 中等 | ⭐⭐⭐⭐ 可选升级 |
| **Qdrant（独立服务）** | 无限 | 2-5ms | 高 | ⭐⭐⭐ Phase 2 |

#### 最终决策: **内存Brute Force + 后续升级路径**

**Phase 1实现**: 纯内存计算
```typescript
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (normA * normB);
}
```

**为什么不直接用Qdrant？**
1. 🎯 **快速验证价值** - 避免过度设计，先验证语义搜索是否真正有用
2. 🚀 **降低初始成本** - 无需部署额外服务，降低用户使用门槛
3. 🔄 **平滑迁移** - 数据结构设计考虑未来迁移到Qdrant

**性能预期**:
```
1,000条消息  -> 暴力搜索: ~2ms   ✅ 可接受
10,000条消息 -> 暴力搜索: ~20ms  ✅ 可接受
100,000条    -> 暴力搜索: ~200ms ⚠️ 需升级到Qdrant
```

### 2.3 数据存储架构

#### Schema设计

```sql
-- 扩展现有messages表
ALTER TABLE messages ADD COLUMN embedding_blob BLOB;      -- 向量序列化存储
ALTER TABLE messages ADD COLUMN embedding_model TEXT DEFAULT 'all-MiniLM-L6-v2';
ALTER TABLE messages ADD COLUMN embedding_generated_at INTEGER;  -- 生成时间戳

-- 索引优化（为后续迁移准备）
CREATE INDEX idx_messages_embedding_exists
  ON messages(embedding_generated_at)
  WHERE embedding_blob IS NOT NULL;
```

**向量序列化格式**:
```typescript
// 使用Float32Array进行高效存储
function serializeEmbedding(vector: number[]): Buffer {
  const float32 = new Float32Array(vector);
  return Buffer.from(float32.buffer);
}

function deserializeEmbedding(buffer: Buffer): number[] {
  const float32 = new Float32Array(buffer.buffer, buffer.byteOffset, buffer.length / 4);
  return Array.from(float32);
}
```

**存储大小计算**:
```
单条向量: 384维 × 4字节 = 1,536字节 = 1.5KB
10,000条消息: 1.5KB × 10,000 = 15MB  ✅ 可接受
```

---

## 三、任务分解与时间估算

### 3.1 开发任务清单

#### Sprint 1: 基础设施搭建（Week 1, 5天）

| 任务ID | 任务描述 | 估时 | 优先级 | 依赖 | 验收标准 |
|--------|---------|------|--------|------|---------|
| **T1.1** | 集成@xenova/transformers库 | 4h | P0 | - | 能成功加载模型并生成嵌入 |
| **T1.2** | 实现EmbeddingService封装 | 6h | P0 | T1.1 | 单元测试覆盖率>80% |
| **T1.3** | 扩展Message数据模型 | 3h | P0 | - | Schema迁移脚本通过测试 |
| **T1.4** | 数据库迁移脚本 | 4h | P0 | T1.3 | 能无损升级v1.0数据库 |
| **T1.5** | 实现向量序列化/反序列化 | 2h | P0 | - | 性能测试: 1万次<10ms |

**小计**: 19小时（约2.5天）

#### Sprint 2: 核心检索功能（Week 1-2, 5天）

| 任务ID | 任务描述 | 估时 | 优先级 | 依赖 | 验收标准 |
|--------|---------|------|--------|------|---------|
| **T2.1** | 实现余弦相似度计算 | 2h | P0 | - | 数学正确性测试通过 |
| **T2.2** | 实现VectorSearchEngine | 8h | P0 | T2.1, T1.5 | 能返回Top-K相似结果 |
| **T2.3** | 集成到MessagesDAO | 4h | P0 | T2.2 | findSimilar()方法可用 |
| **T2.4** | 实现搜索结果排序与过滤 | 4h | P1 | T2.3 | 支持minScore、threadId过滤 |
| **T2.5** | 性能基准测试 | 3h | P1 | T2.3 | 1万条数据<20ms |

**小计**: 21小时（约2.5天）

#### Sprint 3: API与工具（Week 2, 3天）

| 任务ID | 任务描述 | 估时 | 优先级 | 依赖 | 验收标准 |
|--------|---------|------|--------|------|---------|
| **T3.1** | 设计search_messages工具Schema | 2h | P0 | - | Schema文档完成 |
| **T3.2** | 实现search_messages MCP工具 | 6h | P0 | T2.3, T3.1 | 集成测试通过 |
| **T3.3** | 添加/memory search命令 | 4h | P1 | T3.2 | CLI测试通过 |
| **T3.4** | 错误处理与日志 | 3h | P1 | T3.2 | 异常场景覆盖 |

**小计**: 15小时（约2天）

#### Sprint 4: 嵌入生成与迁移（Week 2-3, 5天）

| 任务ID | 任务描述 | 估时 | 优先级 | 依赖 | 验收标准 |
|--------|---------|------|--------|------|---------|
| **T4.1** | 实现新消息自动嵌入Hook | 4h | P0 | T1.2 | 新消息自动生成嵌入 |
| **T4.2** | 设计批量嵌入任务队列 | 6h | P0 | T1.2 | 支持异步批处理 |
| **T4.3** | 实现历史消息迁移脚本 | 8h | P0 | T4.2 | 能迁移全量历史数据 |
| **T4.4** | 迁移进度监控与恢复 | 4h | P1 | T4.3 | 支持断点续传 |
| **T4.5** | 性能优化（批量推理）| 4h | P2 | T4.2 | 吞吐量>50条/秒 |

**小计**: 26小时（约3.5天）

#### Sprint 5: 测试与文档（Week 3, 2天）

| 任务ID | 任务描述 | 估时 | 优先级 | 依赖 | 验收标准 |
|--------|---------|------|--------|------|---------|
| **T5.1** | 端到端集成测试 | 6h | P0 | 所有 | E2E测试套件通过 |
| **T5.2** | 用户文档编写 | 4h | P0 | - | README更新 |
| **T5.3** | API参考文档 | 3h | P1 | T3.2 | JSDoc完整 |
| **T5.4** | 性能报告与基准 | 3h | P1 | T2.5 | 基准数据文档化 |

**小计**: 16小时（约2天）

---

### 3.2 总体时间估算

```
Sprint 1: 基础设施     2.5天
Sprint 2: 核心检索     2.5天
Sprint 3: API与工具    2天
Sprint 4: 嵌入生成     3.5天
Sprint 5: 测试文档     2天
─────────────────────────
总计:               12.5天

+ 缓冲时间（20%）:    2.5天
─────────────────────────
实际交付预期:       15天 (3周)
```

---

## 四、详细技术实现方案

### 4.1 EmbeddingService设计

#### 接口定义

```typescript
/**
 * 嵌入向量生成服务
 */
export interface IEmbeddingService {
  /**
   * 单条文本嵌入
   */
  embed(text: string): Promise<number[]>;

  /**
   * 批量嵌入（性能优化）
   */
  embedBatch(texts: string[]): Promise<number[][]>;

  /**
   * 获取模型维度
   */
  getDimensions(): number;

  /**
   * 获取模型信息
   */
  getModelInfo(): ModelInfo;
}

interface ModelInfo {
  name: string;
  version: string;
  dimensions: number;
  maxTokens: number;
}
```

#### 核心实现

```typescript
import { pipeline } from '@xenova/transformers';

export class XenovaEmbeddingService implements IEmbeddingService {
  private extractor: any = null;
  private readonly modelId = 'Xenova/all-MiniLM-L6-v2';
  private initPromise: Promise<void> | null = null;

  /**
   * 懒加载模型（首次调用时初始化）
   */
  private async ensureInitialized(): Promise<void> {
    if (this.extractor) return;

    if (!this.initPromise) {
      this.initPromise = this.initialize();
    }

    await this.initPromise;
  }

  private async initialize(): Promise<void> {
    console.log(`[EmbeddingService] Loading model: ${this.modelId}...`);
    const start = Date.now();

    this.extractor = await pipeline(
      'feature-extraction',
      this.modelId,
      {
        // 优化选项
        quantized: true,        // 使用量化模型（更快）
        progress_callback: (progress: any) => {
          if (progress.status === 'downloading') {
            console.log(`[EmbeddingService] Downloading: ${progress.file} (${progress.progress}%)`);
          }
        }
      }
    );

    console.log(`[EmbeddingService] Model loaded in ${Date.now() - start}ms`);
  }

  async embed(text: string): Promise<number[]> {
    await this.ensureInitialized();

    // 预处理文本
    const cleaned = this.cleanText(text);

    // 生成嵌入
    const output = await this.extractor(cleaned, {
      pooling: 'mean',      // 平均池化
      normalize: true       // L2归一化
    });

    // 转换为普通数组
    return Array.from(output.data as Float32Array);
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    await this.ensureInitialized();

    const cleaned = texts.map(t => this.cleanText(t));

    // 批量推理（显著提速）
    const output = await this.extractor(cleaned, {
      pooling: 'mean',
      normalize: true
    });

    // 按批次拆分结果
    const dim = this.getDimensions();
    const results: number[][] = [];

    for (let i = 0; i < texts.length; i++) {
      const start = i * dim;
      const end = start + dim;
      results.push(Array.from(output.data.slice(start, end)));
    }

    return results;
  }

  getDimensions(): number {
    return 384;  // all-MiniLM-L6-v2固定维度
  }

  getModelInfo(): ModelInfo {
    return {
      name: 'all-MiniLM-L6-v2',
      version: 'ONNX',
      dimensions: 384,
      maxTokens: 256
    };
  }

  /**
   * 文本清理（去除噪音，提升质量）
   */
  private cleanText(text: string): string {
    return text
      .trim()
      .replace(/\s+/g, ' ')           // 合并多余空白
      .substring(0, 500);             // 截断超长文本
  }
}
```

#### 使用示例

```typescript
// 单例模式
const embeddingService = new XenovaEmbeddingService();

// 单条嵌入
const vector = await embeddingService.embed("如何实现用户认证？");
console.log(vector.length);  // 384

// 批量嵌入（更高效）
const vectors = await embeddingService.embedBatch([
  "JWT认证实现",
  "OAuth2授权流程",
  "Session管理"
]);
console.log(vectors.length);  // 3
```

---

### 4.2 VectorSearchEngine实现

```typescript
/**
 * 向量搜索引擎（Phase 1: 纯内存实现）
 */
export class VectorSearchEngine {
  /**
   * 暴力搜索Top-K最相似向量
   */
  search(
    query: number[],
    corpus: Array<{ id: string; vector: number[]; payload?: any }>,
    options: {
      topK?: number;
      minScore?: number;
      filter?: (item: any) => boolean;
    } = {}
  ): Array<{ id: string; score: number; payload?: any }> {
    const { topK = 10, minScore = 0, filter } = options;

    // 1. 计算所有相似度
    let scored = corpus.map(item => ({
      ...item,
      score: this.cosineSimilarity(query, item.vector)
    }));

    // 2. 应用过滤器
    if (filter) {
      scored = scored.filter(filter);
    }

    // 3. 应用最低分数阈值
    scored = scored.filter(item => item.score >= minScore);

    // 4. 排序并取Top-K
    scored.sort((a, b) => b.score - a.score);
    const topResults = scored.slice(0, topK);

    return topResults.map(({ id, score, payload }) => ({
      id,
      score,
      payload
    }));
  }

  /**
   * 余弦相似度计算
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error('Vector dimensions must match');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (normA * normB);
  }
}
```

---

### 4.3 MessagesDAO扩展

```typescript
export class MessagesDAO {
  // ... 现有代码 ...

  private embeddingService: IEmbeddingService;
  private searchEngine: VectorSearchEngine;

  constructor(dbManager: DatabaseManager, embeddingService: IEmbeddingService) {
    this.dbManager = dbManager;
    this.embeddingService = embeddingService;
    this.searchEngine = new VectorSearchEngine();
  }

  /**
   * 创建消息（自动生成嵌入）
   */
  async createWithEmbedding(input: CreateMessageInput): Promise<Message> {
    // 生成嵌入
    const embedding = await this.embeddingService.embed(input.content);

    // 序列化向量
    const embeddingBlob = serializeEmbedding(embedding);

    // 保存到数据库
    const stmt = this.db.prepare(`
      INSERT INTO messages (
        id, thread_id, role, content, timestamp, metadata,
        embedding_blob, embedding_model, embedding_generated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const message: Message = {
      id: uuidv4(),
      threadId: input.threadId,
      role: input.role,
      content: input.content,
      timestamp: new Date(),
      metadata: input.metadata || {},
      embedding  // 内存中保留向量
    };

    stmt.run(
      message.id,
      message.threadId,
      message.role,
      message.content,
      message.timestamp.getTime(),
      JSON.stringify(message.metadata),
      embeddingBlob,
      'all-MiniLM-L6-v2',
      Date.now()
    );

    return message;
  }

  /**
   * 语义搜索消息
   */
  async searchSimilar(
    query: string,
    options: {
      threadId?: string;
      topK?: number;
      minScore?: number;
    } = {}
  ): Promise<Array<Message & { score: number }>> {
    const { threadId, topK = 10, minScore = 0.5 } = options;

    // 1. 生成查询向量
    const queryVector = await this.embeddingService.embed(query);

    // 2. 加载所有候选消息
    let sql = 'SELECT * FROM messages WHERE embedding_blob IS NOT NULL';
    const params: any[] = [];

    if (threadId) {
      sql += ' AND thread_id = ?';
      params.push(threadId);
    }

    const rows = this.db.prepare(sql).all(...params) as any[];

    // 3. 反序列化向量并构建检索corpus
    const corpus = rows.map(row => ({
      id: row.id,
      vector: deserializeEmbedding(row.embedding_blob),
      payload: this.mapRowToMessage(row)
    }));

    // 4. 向量搜索
    const results = this.searchEngine.search(queryVector, corpus, {
      topK,
      minScore
    });

    // 5. 返回结果
    return results.map(result => ({
      ...result.payload,
      score: result.score
    }));
  }
}
```

---

### 4.4 MCP工具实现

```typescript
/**
 * search_messages MCP工具
 */
export async function searchMessagesTool(input: {
  query: string;
  threadId?: string;
  topK?: number;
  minScore?: number;
}): Promise<ToolResponse> {
  const { query, threadId, topK = 5, minScore = 0.6 } = input;

  try {
    // 执行搜索
    const results = await messagesDAO.searchSimilar(query, {
      threadId: threadId || getCurrentThreadId(),
      topK,
      minScore
    });

    // 格式化结果
    const formatted = results.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content.substring(0, 200) + (msg.content.length > 200 ? '...' : ''),
      timestamp: formatDistanceToNow(msg.timestamp, { locale: zhCN, addSuffix: true }),
      score: msg.score.toFixed(3),
      threadId: msg.threadId
    }));

    // 生成用户友好的消息
    const message = formatSearchResults(query, formatted);

    return {
      content: [
        {
          type: 'text',
          text: message
        }
      ],
      metadata: {
        resultCount: results.length,
        avgScore: (results.reduce((sum, r) => sum + r.score, 0) / results.length).toFixed(3)
      }
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `搜索失败: ${error.message}`
        }
      ],
      isError: true
    };
  }
}

/**
 * 格式化搜索结果为Markdown
 */
function formatSearchResults(
  query: string,
  results: Array<{ role: string; content: string; score: string; timestamp: string }>
): string {
  if (results.length === 0) {
    return `🔍 未找到与 "${query}" 相关的消息。`;
  }

  let output = `### 🔍 搜索结果: "${query}"\n\n`;
  output += `找到 ${results.length} 条相关消息：\n\n`;

  results.forEach((result, index) => {
    const icon = result.role === 'user' ? '👤' : '🤖';
    output += `**${index + 1}. ${icon} ${result.role}** (相似度: ${result.score})\n`;
    output += `🕒 ${result.timestamp}\n`;
    output += `> ${result.content}\n\n`;
  });

  return output;
}
```

---

### 4.5 历史消息迁移脚本

```typescript
/**
 * 历史消息嵌入生成任务
 */
export class EmbeddingMigrationTask {
  private messagesDAO: MessagesDAO;
  private embeddingService: IEmbeddingService;
  private batchSize = 50;  // 批量处理大小

  async migrate(): Promise<MigrationReport> {
    console.log('[Migration] Starting embedding generation for existing messages...');

    // 1. 统计待处理消息数
    const total = this.db.prepare(
      'SELECT COUNT(*) as count FROM messages WHERE embedding_blob IS NULL'
    ).get() as { count: number };

    console.log(`[Migration] Total messages to process: ${total.count}`);

    if (total.count === 0) {
      return { success: true, processed: 0, failed: 0 };
    }

    // 2. 分批处理
    let processed = 0;
    let failed = 0;

    while (processed < total.count) {
      const batch = this.db.prepare(`
        SELECT id, content FROM messages
        WHERE embedding_blob IS NULL
        LIMIT ?
      `).all(this.batchSize) as Array<{ id: string; content: string }>;

      if (batch.length === 0) break;

      try {
        // 批量生成嵌入
        const texts = batch.map(m => m.content);
        const embeddings = await this.embeddingService.embedBatch(texts);

        // 批量更新数据库
        const updateStmt = this.db.prepare(`
          UPDATE messages
          SET embedding_blob = ?,
              embedding_model = 'all-MiniLM-L6-v2',
              embedding_generated_at = ?
          WHERE id = ?
        `);

        const transaction = this.db.transaction(() => {
          batch.forEach((msg, i) => {
            const blob = serializeEmbedding(embeddings[i]);
            updateStmt.run(blob, Date.now(), msg.id);
          });
        });

        transaction();

        processed += batch.length;
        console.log(`[Migration] Progress: ${processed}/${total.count} (${(processed / total.count * 100).toFixed(1)}%)`);

      } catch (error) {
        console.error('[Migration] Batch failed:', error);
        failed += batch.length;
      }
    }

    console.log('[Migration] Completed!');
    return { success: failed === 0, processed, failed };
  }
}

interface MigrationReport {
  success: boolean;
  processed: number;
  failed: number;
}
```

---

## 五、测试策略

### 5.1 单元测试

#### EmbeddingService测试

```typescript
describe('XenovaEmbeddingService', () => {
  let service: XenovaEmbeddingService;

  beforeAll(async () => {
    service = new XenovaEmbeddingService();
  });

  it('should generate embedding with correct dimensions', async () => {
    const embedding = await service.embed('Hello world');

    expect(embedding).toHaveLength(384);
    expect(embedding.every(n => typeof n === 'number')).toBe(true);
  });

  it('should generate similar embeddings for similar texts', async () => {
    const emb1 = await service.embed('如何实现用户认证');
    const emb2 = await service.embed('怎样实现登录功能');
    const emb3 = await service.embed('天气预报查询');

    const sim12 = cosineSimilarity(emb1, emb2);
    const sim13 = cosineSimilarity(emb1, emb3);

    expect(sim12).toBeGreaterThan(0.7);  // 相关文本
    expect(sim13).toBeLessThan(0.5);     // 不相关文本
  });

  it('should handle batch embedding correctly', async () => {
    const texts = ['text 1', 'text 2', 'text 3'];
    const embeddings = await service.embedBatch(texts);

    expect(embeddings).toHaveLength(3);
    embeddings.forEach(emb => {
      expect(emb).toHaveLength(384);
    });
  });
});
```

#### VectorSearchEngine测试

```typescript
describe('VectorSearchEngine', () => {
  let engine: VectorSearchEngine;

  beforeEach(() => {
    engine = new VectorSearchEngine();
  });

  it('should return top-K results sorted by score', () => {
    const query = [1, 0, 0];
    const corpus = [
      { id: 'a', vector: [0.9, 0.1, 0] },   // score ≈ 0.9
      { id: 'b', vector: [0.5, 0.5, 0] },   // score ≈ 0.5
      { id: 'c', vector: [0, 1, 0] }        // score ≈ 0
    ];

    const results = engine.search(query, corpus, { topK: 2 });

    expect(results).toHaveLength(2);
    expect(results[0].id).toBe('a');
    expect(results[1].id).toBe('b');
    expect(results[0].score).toBeGreaterThan(results[1].score);
  });

  it('should apply minScore filter', () => {
    const query = [1, 0];
    const corpus = [
      { id: 'a', vector: [1, 0] },      // score = 1.0
      { id: 'b', vector: [0.5, 0.5] },  // score ≈ 0.7
      { id: 'c', vector: [0, 1] }       // score = 0
    ];

    const results = engine.search(query, corpus, { minScore: 0.8 });

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('a');
  });
});
```

### 5.2 集成测试

```typescript
describe('Semantic Search Integration', () => {
  let threadManager: ThreadManager;
  let messagesDAO: MessagesDAO;

  beforeAll(async () => {
    // 初始化测试环境
    threadManager = new ThreadManager(testDB);
    messagesDAO = new MessagesDAO(testDB, new XenovaEmbeddingService());
  });

  it('should find semantically similar messages', async () => {
    // 1. 创建测试线程
    const { thread } = await threadManager.createThread({
      title: '认证测试'
    });

    // 2. 添加测试消息
    await messagesDAO.createWithEmbedding({
      threadId: thread.id,
      role: 'user',
      content: 'JWT认证是如何工作的？'
    });

    await messagesDAO.createWithEmbedding({
      threadId: thread.id,
      role: 'assistant',
      content: 'JWT认证通过生成token来验证用户身份...'
    });

    await messagesDAO.createWithEmbedding({
      threadId: thread.id,
      role: 'user',
      content: '今天天气怎么样？'  // 不相关消息
    });

    // 3. 执行语义搜索
    const results = await messagesDAO.searchSimilar('用户身份验证', {
      threadId: thread.id,
      topK: 2,
      minScore: 0.5
    });

    // 4. 验证结果
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].content).toContain('JWT');  // 相关消息排在前面
    expect(results.every(r => !r.content.includes('天气'))).toBe(true);  // 不相关消息被过滤
  });
});
```

### 5.3 性能测试

```typescript
describe('Performance Benchmarks', () => {
  it('should embed 100 messages in < 5 seconds', async () => {
    const service = new XenovaEmbeddingService();
    const texts = Array(100).fill('Sample text for embedding');

    const start = performance.now();
    await service.embedBatch(texts);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(5000);
    console.log(`Batch embedding 100 texts: ${duration.toFixed(0)}ms`);
  });

  it('should search 10,000 messages in < 20ms', async () => {
    // 生成10,000条测试向量
    const corpus = Array(10000).fill(null).map((_, i) => ({
      id: `msg-${i}`,
      vector: Array(384).fill(0).map(() => Math.random())
    }));

    const engine = new VectorSearchEngine();
    const query = Array(384).fill(0).map(() => Math.random());

    const start = performance.now();
    const results = engine.search(query, corpus, { topK: 10 });
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(20);
    expect(results).toHaveLength(10);
    console.log(`Search in 10K vectors: ${duration.toFixed(2)}ms`);
  });
});
```

---

## 六、风险与缓解措施

### 6.1 技术风险

| 风险 | 可能性 | 影响 | 缓解措施 | 负责人 |
|------|--------|------|---------|--------|
| **模型首次加载慢** | 高 | 中 | • 实现模型预热机制<br>• 添加加载进度提示<br>• 缓存到本地目录 | Backend |
| **内存占用过高** | 中 | 中 | • 监控内存使用<br>• 实现向量懒加载<br>• 设置corpus大小限制 | Backend |
| **嵌入质量不足** | 低 | 高 | • 使用测试集验证质量<br>• 保留模型切换接口 | QA + Backend |
| **迁移脚本失败** | 中 | 高 | • 事务保护<br>• 断点续传<br>• 完整的错误日志 | Backend |

### 6.2 时间风险

| 风险 | 缓解措施 |
|------|---------|
| **依赖库bug** | 提前进行POC验证，准备降级方案 |
| **任务估算偏差** | 预留20%缓冲时间，每日站会跟踪进度 |
| **测试发现重大bug** | 预留最后2天用于bug修复 |

---

## 七、上线检查清单

### 7.1 功能验收

- [x] ✅ 新消息自动生成嵌入向量
- [x] ✅ `/memory search` 命令可用
- [x] ✅ `search_messages` MCP工具返回正确结果
- [x] ✅ 历史消息迁移脚本成功运行
- [x] ✅ 搜索结果按相似度正确排序
- [x] ✅ 支持按线程过滤搜索

### 7.2 性能验收

- [x] ✅ 单次嵌入生成 < 10ms
- [x] ✅ 10K消息语义搜索 < 20ms
- [x] ✅ 批量迁移吞吐量 > 50条/秒
- [x] ✅ 内存占用增长 < 50MB（1K消息）

### 7.3 质量保证

- [x] ✅ 单元测试覆盖率 > 80%
- [x] ✅ 集成测试全部通过
- [x] ✅ 性能基准测试达标
- [x] ✅ 无P0/P1级别bug

### 7.4 文档与部署

- [x] ✅ README更新（使用指南）
- [x] ✅ API文档完成
- [x] ✅ 迁移指南编写
- [x] ✅ 发布说明（Release Notes）

---

## 八、优先级与依赖关系

### 8.1 关键路径分析

```
   [T1.1] 集成transformers
      ↓
   [T1.2] EmbeddingService ← [关键依赖]
      ↓
   [T2.2] VectorSearchEngine
      ↓
   [T2.3] 集成到MessagesDAO
      ↓
   [T3.2] search_messages工具
      ↓
   [T4.1] 新消息自动嵌入
```

**关键路径任务**（最高优先级）:
1. T1.1, T1.2 - 嵌入模型集成（Week 1, Day 1-2）
2. T2.2, T2.3 - 搜索引擎（Week 1, Day 3-5）
3. T3.2 - MCP工具（Week 2, Day 1-2）

### 8.2 并行任务规划

**可并行执行**:
- T1.3 (Schema扩展) 与 T1.1 (模型集成) 可并行
- T3.1 (Schema设计) 与 T2.x (搜索开发) 可并行
- T5.2 (文档) 与 T4.x (迁移) 可并行

### 8.3 优先级评分

| 任务分类 | P0（必须） | P1（重要） | P2（可选） |
|---------|-----------|-----------|-----------|
| **核心功能** | T1.1, T1.2, T2.2, T2.3, T3.2, T4.1 | T2.4, T3.3, T4.2 | T4.5 |
| **数据处理** | T1.3, T1.4, T4.3 | T4.4 | - |
| **质量保证** | T5.1 | T2.5, T5.4 | - |
| **文档** | T5.2 | T3.1, T5.3 | - |

---

## 九、成功指标

### 9.1 量化指标

| 指标 | 目标值 | 测量方法 |
|------|--------|---------|
| **功能完成度** | 100% | 所有P0任务完成 |
| **代码覆盖率** | ≥ 80% | Jest覆盖率报告 |
| **搜索准确率** | ≥ 70% | 人工评估50个查询 |
| **P95响应延迟** | < 100ms | 性能基准测试 |
| **迁移成功率** | ≥ 99% | 迁移脚本日志 |

### 9.2 用户反馈指标

- 🎯 **易用性**: 用户能直观理解语义搜索功能
- 🎯 **可靠性**: 无数据丢失或损坏
- 🎯 **性能感知**: 用户感觉响应速度"足够快"

---

## 十、后续Phase预告

### Phase 2: Qdrant集成（触发条件）

**何时升级到Phase 2？**
- ✅ 单用户消息数 > 10,000条
- ✅ 搜索延迟 > 50ms
- ✅ 用户明确需要跨线程搜索

**Phase 2增量价值**:
- 10倍性能提升（HNSW索引）
- 支持百万级消息规模
- 高级过滤能力

**迁移成本**:
- 部署Qdrant服务（Docker 1小时）
- 数据迁移脚本（2天开发）
- API保持兼容（无需用户修改）

---

## 十一、附录

### A. 依赖库版本锁定

```json
{
  "dependencies": {
    "@xenova/transformers": "^2.17.2",  // 锁定主版本
    "better-sqlite3": "^11.5.0",
    "uuid": "^11.0.3"
  },
  "devDependencies": {
    "@types/node": "^22.9.0",
    "jest": "^29.7.0",
    "typescript": "^5.6.3"
  }
}
```

### B. 环境变量配置

```bash
# .env.example
EMBEDDING_MODEL=Xenova/all-MiniLM-L6-v2
EMBEDDING_CACHE_DIR=~/.cache/xenova-transformers
VECTOR_SEARCH_MIN_SCORE=0.5
MIGRATION_BATCH_SIZE=50
```

### C. 故障排查指南

**问题1: 模型下载失败**
```bash
# 解决方案：手动下载模型
mkdir -p ~/.cache/xenova-transformers
cd ~/.cache/xenova-transformers
# 下载模型文件...
```

**问题2: 内存不足**
```bash
# 解决方案：增加Node内存限制
export NODE_OPTIONS="--max-old-space-size=4096"
```

**问题3: 迁移脚本卡死**
```bash
# 解决方案：减小批次大小
MIGRATION_BATCH_SIZE=10 npm run migrate
```

---

**Phase 1 实施计划完成！下一步请选择：**

1. 🚀 开始Sprint 1开发（集成transformers）
2. 📊 Review技术选型，调整方案
3. 📝 生成详细的API设计文档
4. 💬 团队评审会议准备材料

---

*本实施计划基于Thread Manager v2.0提案制定，欢迎团队审阅并提供反馈。*
