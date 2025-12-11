# Thread Manager v2.0 迭代提案
## 基于 HelloAgents 记忆与检索系统的架构升级

**版本**: 2.0.0
**日期**: 2025-12-11
**提案人**: AI Agent Team
**参考文献**: [HelloAgents 第八章 - 记忆与检索](https://github.com/datawhalechina/hello-agents/blob/main/docs/chapter8)

---

## 一、执行摘要

### 1.1 当前痛点

Thread Manager v1.0 虽然实现了基础的线程管理和上下文切换，但存在以下局限性：

| 问题域 | 现状 | 影响 |
|--------|------|------|
| **记忆检索** | 仅按时间顺序返回最近消息 | 无法找到语义相关的历史对话 |
| **上下文相关性** | 所有消息权重相同 | 重要信息可能被埋没在噪音中 |
| **知识积累** | 线程间完全隔离 | 无法复用已解决的问题和知识 |
| **长期记忆** | 无持久化知识库 | AI每次都从零开始，缺乏学习能力 |
| **检索效率** | 全表扫描 | 当消息数量增长时性能下降 |

### 1.2 目标愿景

将 Thread Manager 升级为**具备认知能力的智能记忆系统**，实现：

- ✅ **语义检索**: 基于向量相似度的智能上下文召回
- ✅ **分层记忆**: 工作记忆、情景记忆、语义记忆的三层架构
- ✅ **知识沉淀**: 跨线程的知识共享和持久化
- ✅ **RAG增强**: 检索增强生成，为AI提供精准上下文
- ✅ **时间衰减**: 基于重要性和时间的智能评分机制

---

## 二、技术架构设计

### 2.1 分层记忆架构

```
┌─────────────────────────────────────────────────────────┐
│                   Thread Manager v2.0                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │   Layer 1: 工作记忆 (Working Memory)            │   │
│  │   - 容量: 50条消息                               │   │
│  │   - 存储: 内存 (LRU Cache)                       │   │
│  │   - 检索: TF-IDF + 关键词匹配                    │   │
│  │   - TTL: 30分钟                                  │   │
│  └─────────────────────────────────────────────────┘   │
│                        ▼                                 │
│  ┌─────────────────────────────────────────────────┐   │
│  │   Layer 2: 情景记忆 (Episodic Memory)           │   │
│  │   - 存储: SQLite + Qdrant向量库                  │   │
│  │   - 索引: 时间序列 + 向量嵌入                   │   │
│  │   - 特点: 记录具体事件和对话                    │   │
│  │   - 生命周期: 永久（可按策略清理）               │   │
│  └─────────────────────────────────────────────────┘   │
│                        ▼                                 │
│  ┌─────────────────────────────────────────────────┐   │
│  │   Layer 3: 语义记忆 (Semantic Memory)           │   │
│  │   - 存储: Qdrant向量库 + 知识图谱（可选）       │   │
│  │   - 内容: 抽象概念、解决方案、代码模式          │   │
│  │   - 特点: 跨线程共享知识                        │   │
│  │   - 整合: 定期从情景记忆提炼                    │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 2.2 数据模型扩展

#### 2.2.1 Message 实体增强

```typescript
export interface Message {
  // === 现有字段 ===
  id: string;
  threadId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;

  // === 新增字段 ===
  embedding?: number[];           // 向量嵌入（768维）
  importance: number;             // 重要性评分 (0-1)
  memoryType: 'working' | 'episodic' | 'semantic';  // 记忆类型
  consolidatedTo?: string;        // 如果已整合，指向语义记忆ID
  keywords?: string[];            // 提取的关键词
  summary?: string;               // 摘要（用于长消息）
}
```

#### 2.2.2 新增 SemanticMemory 实体

```typescript
export interface SemanticMemory {
  id: string;                     // UUID
  type: 'concept' | 'solution' | 'pattern' | 'fact';
  title: string;                  // 概念标题
  content: string;                // 知识内容
  embedding: number[];            // 向量嵌入
  sourceThreadIds: string[];      // 来源线程
  sourceMessageIds: string[];     // 来源消息
  createdAt: Date;
  updatedAt: Date;
  accessCount: number;            // 访问次数
  importance: number;             // 重要性 (0-1)
  tags: string[];
  metadata: {
    codeLanguage?: string;        // 如果是代码模式
    category?: string;            // 分类
    relatedConcepts?: string[];   // 关联概念ID
  };
}
```

### 2.3 核心评分算法

#### 工作记忆评分
```typescript
score = (similarity × timeDecay) × (0.8 + importance × 0.4)

where:
  similarity: 向量余弦相似度 (0-1)
  timeDecay: e^(-age_minutes / 30)  // 30分钟半衰期
  importance: 重要性权重 (0-1)
```

#### 情景记忆评分
```typescript
score = (vectorScore × 0.8 + recencyScore × 0.2) × (0.8 + importance × 0.4)

where:
  vectorScore: 向量相似度 (0-1)
  recencyScore: 时间近因性
    = 1.0 if age < 1h
    = 0.8 if age < 24h
    = 0.5 if age < 7d
    = 0.2 if age < 30d
    = 0.1 otherwise
```

#### 语义记忆评分
```typescript
score = vectorScore × (0.8 + importance × 0.4) × (1 + log(1 + accessCount) × 0.1)

// 访问频次提升：被频繁访问的知识获得加权
```

---

## 三、功能模块设计

### 3.1 智能检索引擎

#### 3.1.1 混合检索策略

```typescript
class HybridRetriever {
  /**
   * 多阶段检索流程
   */
  async retrieve(query: string, options: RetrievalOptions): Promise<Memory[]> {
    // Stage 1: 工作记忆（最快）
    const workingResults = await this.searchWorkingMemory(query, { limit: 10 });

    // Stage 2: 情景记忆（当前线程）
    const episodicResults = await this.searchEpisodicMemory(query, {
      threadId: options.threadId,
      limit: 20,
      minScore: 0.6
    });

    // Stage 3: 语义记忆（跨线程知识）
    const semanticResults = await this.searchSemanticMemory(query, {
      types: ['solution', 'pattern'],
      limit: 10,
      minScore: 0.7
    });

    // 合并去重
    return this.mergeAndRank([
      ...workingResults,
      ...episodicResults,
      ...semanticResults
    ]);
  }
}
```

#### 3.1.2 高级检索技术（来自HelloAgents）

**多查询扩展 (Multi-Query Expansion)**
```typescript
async expandQuery(query: string): Promise<string[]> {
  // 使用LLM生成3-5个语义等价的查询变体
  const prompt = `将以下查询改写为3个不同的表述方式：
原始查询: ${query}

要求:
1. 保持核心语义
2. 使用不同的词汇和句式
3. 一行一个，不要编号

改写:`;

  const expanded = await llm.generate(prompt);
  return [query, ...expanded.split('\n').filter(Boolean)];
}

// 使用场景
const queries = await expandQuery("如何实现用户认证");
// 返回: [
//   "如何实现用户认证",
//   "怎样构建登录验证系统",
//   "用户身份验证的实现方法"
// ]
```

**假设文档嵌入 (HyDE)**
```typescript
async hydeRetrieve(query: string): Promise<Memory[]> {
  // 生成假设答案
  const hypotheticalAnswer = await llm.generate(`
针对问题"${query}"，生成一个简短的假设答案（2-3句话）：
`);

  // 使用假设答案的向量检索
  const embedding = await this.embedder.embed(hypotheticalAnswer);
  return await this.vectorStore.search(embedding, { top_k: 10 });
}
```

### 3.2 记忆整合系统

#### 3.2.1 自动记忆整合

```typescript
class MemoryConsolidator {
  /**
   * 将短期记忆整合为长期知识
   */
  async consolidate(threadId: string): Promise<void> {
    // 1. 提取线程中的高价值对话片段
    const messages = await this.messagesDAO.findByThreadId(threadId);
    const importantMessages = messages.filter(m => m.importance > 0.7);

    // 2. 识别知识类型
    const clusters = await this.clusterByTopic(importantMessages);

    for (const cluster of clusters) {
      // 3. 提取结构化知识
      const knowledge = await this.extractKnowledge(cluster);

      // 4. 保存到语义记忆
      await this.semanticMemoryDAO.create({
        type: knowledge.type,
        title: knowledge.title,
        content: knowledge.content,
        embedding: await this.embedder.embed(knowledge.content),
        sourceThreadIds: [threadId],
        sourceMessageIds: cluster.map(m => m.id),
        importance: this.calculateImportance(cluster),
        tags: knowledge.tags
      });
    }
  }

  /**
   * 使用LLM提取知识
   */
  private async extractKnowledge(messages: Message[]): Promise<Knowledge> {
    const context = messages.map(m => `${m.role}: ${m.content}`).join('\n');

    const prompt = `从以下对话中提取可复用的知识：

${context}

请提取：
1. 类型: concept（概念）| solution（解决方案）| pattern（代码模式）| fact（事实）
2. 标题: 简洁的知识标题
3. 内容: 结构化的知识描述（Markdown格式）
4. 标签: 3-5个关键标签

JSON格式输出：`;

    const result = await llm.generate(prompt);
    return JSON.parse(result);
  }
}
```

#### 3.2.2 触发策略

| 触发时机 | 条件 | 操作 |
|---------|------|------|
| **线程关闭** | 用户执行 `/thread close` | 自动整合当前线程 |
| **定期整合** | 每24小时 | 整合所有活跃线程 |
| **手动触发** | `/thread consolidate` | 立即整合指定线程 |
| **达到阈值** | 线程消息数 > 100 | 自动部分整合 |

### 3.3 向量存储集成

#### 3.3.1 Qdrant 集成架构

```typescript
class VectorStoreManager {
  private qdrant: QdrantClient;

  constructor() {
    this.qdrant = new QdrantClient({
      url: process.env.QDRANT_URL || 'http://localhost:6333'
    });
  }

  async initCollections(): Promise<void> {
    // Collection 1: 情景记忆（按线程分区）
    await this.qdrant.createCollection({
      collection_name: 'episodic_memory',
      vectors: {
        size: 768,  // all-MiniLM-L6-v2
        distance: 'Cosine'
      },
      optimizers_config: {
        indexing_threshold: 10000
      }
    });

    // Collection 2: 语义记忆（全局知识）
    await this.qdrant.createCollection({
      collection_name: 'semantic_memory',
      vectors: {
        size: 768,
        distance: 'Cosine'
      },
      payload_schema: {
        type: { type: 'keyword' },
        tags: { type: 'keyword[]' },
        importance: { type: 'float' }
      }
    });
  }

  async upsertMessage(message: Message): Promise<void> {
    if (!message.embedding) {
      message.embedding = await this.embedder.embed(message.content);
    }

    await this.qdrant.upsert({
      collection_name: 'episodic_memory',
      points: [{
        id: message.id,
        vector: message.embedding,
        payload: {
          threadId: message.threadId,
          role: message.role,
          content: message.content,
          timestamp: message.timestamp.getTime(),
          importance: message.importance
        }
      }]
    });
  }
}
```

#### 3.3.2 嵌入模型选择

**三层降级方案**（参考HelloAgents）：

```typescript
class EmbeddingProvider {
  private async embed(text: string): Promise<number[]> {
    // Layer 1: 云端API（百炼、OpenAI等）
    try {
      return await this.cloudEmbed(text);
    } catch (e) {
      console.warn('Cloud embedding failed, fallback to local');
    }

    // Layer 2: 本地Transformer模型
    try {
      return await this.localTransformerEmbed(text);
    } catch (e) {
      console.warn('Local transformer failed, fallback to TF-IDF');
    }

    // Layer 3: TF-IDF（轻量级兜底）
    return await this.tfidfEmbed(text);
  }

  private async localTransformerEmbed(text: string): Promise<number[]> {
    // 使用 @xenova/transformers (ONNX Runtime)
    const { pipeline } = await import('@xenova/transformers');
    const extractor = await pipeline('feature-extraction',
      'Xenova/all-MiniLM-L6-v2');

    const output = await extractor(text, {
      pooling: 'mean',
      normalize: true
    });

    return Array.from(output.data);
  }
}
```

---

## 四、迭代路线图

### Phase 1: 基础向量检索（MVP）
**目标**: 为现有消息添加向量检索能力
**周期**: 2-3周

**任务清单**:
- [x] 集成嵌入模型（@xenova/transformers）
- [ ] 为Message表添加embedding字段（SQLite扩展）
- [ ] 实现基础向量搜索（内存BruteForce）
- [ ] 迁移现有消息生成嵌入
- [ ] 新增 `search_messages` MCP工具

**验收标准**:
```bash
# 用户可以语义搜索历史对话
/thread search "如何实现认证"
# 返回所有相关讨论，按相似度排序
```

### Phase 2: Qdrant集成与分层记忆
**目标**: 引入专业向量数据库和记忆分层
**周期**: 3-4周

**任务清单**:
- [ ] 集成Qdrant（支持Docker本地部署）
- [ ] 实现工作记忆层（LRU缓存）
- [ ] 实现情景记忆层（SQLite + Qdrant）
- [ ] 添加重要性评分机制
- [ ] 实现时间衰减算法

**验收标准**:
```typescript
// 智能检索API
const results = await threadManager.retrieve("用户登录问题", {
  threadId: "current",
  memoryTypes: ['working', 'episodic'],
  minScore: 0.6
});

// 返回多层记忆的综合结果，按综合评分排序
```

### Phase 3: 语义记忆与知识整合
**目标**: 实现跨线程知识共享和自动整合
**周期**: 4-5周

**任务清单**:
- [ ] 创建SemanticMemory表和DAO
- [ ] 实现MemoryConsolidator
- [ ] 集成LLM进行知识提取
- [ ] 实现自动整合触发器
- [ ] 添加 `/thread consolidate` 命令

**验收标准**:
```bash
# 用户关闭线程时自动提取知识
/thread close

# 系统输出：
# ✅ 线程已关闭
# 📚 已整合 3 条知识到语义记忆：
#   - [解决方案] JWT认证实现步骤
#   - [代码模式] Express中间件错误处理
#   - [概念] 刷新令牌vs访问令牌

# 在新线程中可以检索到
/thread new "实现OAuth2"
AI: 我注意到你之前讨论过认证相关话题，我可以参考那些经验...
```

### Phase 4: RAG增强与高级检索
**目标**: 实现MQE、HyDE等高级检索技术
**周期**: 3-4周

**任务清单**:
- [ ] 实现多查询扩展（MQE）
- [ ] 实现假设文档嵌入（HyDE）
- [ ] 实现混合检索策略
- [ ] 添加检索质量评估
- [ ] 优化检索性能

**验收标准**:
```typescript
// RAG增强对话
const enhancedContext = await ragRetriever.retrieve(userQuery, {
  useMQE: true,        // 启用多查询扩展
  useHyDE: true,       // 启用假设文档嵌入
  topK: 5,
  minScore: 0.7
});

// Claude使用增强上下文回答，准确率提升30%+
```

### Phase 5: 可观测性与优化
**目标**: 生产环境监控和性能优化
**周期**: 2-3周

**任务清单**:
- [ ] 添加检索性能监控
- [ ] 实现向量索引优化
- [ ] 添加记忆压缩策略
- [ ] 实现智能缓存预热
- [ ] 完善日志和诊断工具

---

## 五、技术选型对比

### 5.1 向量数据库选择

| 方案 | 优点 | 缺点 | 推荐场景 |
|------|------|------|---------|
| **Qdrant** | 性能优异、支持过滤、易部署 | 需要额外服务 | **推荐** - 生产环境 |
| **SQLite-VSS** | 零依赖、与现有DB集成 | 性能有限（<10万向量） | MVP和轻量场景 |
| **内存BruteForce** | 最简单、无依赖 | 只适合小数据集 | 开发测试 |

**最终决策**: 采用**渐进式策略**
- Phase 1: 内存BruteForce (快速验证)
- Phase 2: Qdrant (性能优化)
- 保留SQLite-VSS作为轻量级选项

### 5.2 嵌入模型选择

| 模型 | 维度 | 速度 | 质量 | 适用场景 |
|------|------|------|------|---------|
| **all-MiniLM-L6-v2** | 384 | 快 | 良好 | **推荐** - 平衡选择 |
| **all-mpnet-base-v2** | 768 | 中 | 优秀 | 高质量要求 |
| **paraphrase-multilingual** | 384 | 中 | 良好 | 多语言场景 |

**最终决策**: all-MiniLM-L6-v2
- 速度快（单条<10ms）
- 质量足够（MTEB排名前20）
- 模型小（90MB，易于本地部署）

---

## 六、数据库Schema变更

### 6.1 Messages表扩展

```sql
-- 添加新列
ALTER TABLE messages ADD COLUMN embedding BLOB;           -- 向量嵌入（序列化）
ALTER TABLE messages ADD COLUMN importance REAL DEFAULT 0.5;
ALTER TABLE messages ADD COLUMN memory_type TEXT DEFAULT 'episodic';
ALTER TABLE messages ADD COLUMN consolidated_to TEXT;     -- 外键到semantic_memory
ALTER TABLE messages ADD COLUMN keywords TEXT;             -- JSON数组
ALTER TABLE messages ADD COLUMN summary TEXT;

-- 创建索引
CREATE INDEX idx_messages_importance ON messages(importance);
CREATE INDEX idx_messages_memory_type ON messages(memory_type);
CREATE INDEX idx_messages_timestamp_desc ON messages(timestamp DESC);
```

### 6.2 新增SemanticMemory表

```sql
CREATE TABLE semantic_memory (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,                      -- concept|solution|pattern|fact
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding BLOB NOT NULL,                 -- 向量嵌入
  source_thread_ids TEXT NOT NULL,         -- JSON数组
  source_message_ids TEXT NOT NULL,        -- JSON数组
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  access_count INTEGER DEFAULT 0,
  importance REAL DEFAULT 0.5,
  tags TEXT NOT NULL,                      -- JSON数组
  metadata TEXT,                           -- JSON对象

  CHECK (type IN ('concept', 'solution', 'pattern', 'fact'))
);

CREATE INDEX idx_semantic_type ON semantic_memory(type);
CREATE INDEX idx_semantic_importance ON semantic_memory(importance DESC);
CREATE INDEX idx_semantic_updated ON semantic_memory(updated_at DESC);
CREATE INDEX idx_semantic_access ON semantic_memory(access_count DESC);
```

### 6.3 迁移脚本

```typescript
class MigrationV2 {
  async up(db: Database): Promise<void> {
    // 1. 扩展messages表
    db.exec(`
      ALTER TABLE messages ADD COLUMN embedding BLOB;
      ALTER TABLE messages ADD COLUMN importance REAL DEFAULT 0.5;
      -- ... 其他字段
    `);

    // 2. 创建semantic_memory表
    db.exec(/* SQL创建语句 */);

    // 3. 为现有消息生成嵌入（异步后台任务）
    const messages = db.prepare('SELECT id, content FROM messages').all();

    for (const msg of messages) {
      const embedding = await embedder.embed(msg.content);
      db.prepare('UPDATE messages SET embedding = ? WHERE id = ?')
        .run(Buffer.from(new Float32Array(embedding).buffer), msg.id);
    }

    console.log(`Migrated ${messages.length} messages to v2`);
  }
}
```

---

## 七、API接口设计

### 7.1 新增MCP工具

#### 7.1.1 search_memory

```json
{
  "name": "search_memory",
  "description": "智能搜索历史对话和知识库",
  "inputSchema": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "搜索查询（自然语言）"
      },
      "threadId": {
        "type": "string",
        "description": "限制在特定线程（可选，默认当前线程）"
      },
      "memoryTypes": {
        "type": "array",
        "items": {
          "enum": ["working", "episodic", "semantic"]
        },
        "description": "搜索的记忆类型"
      },
      "topK": {
        "type": "number",
        "default": 5,
        "description": "返回结果数量"
      },
      "minScore": {
        "type": "number",
        "default": 0.6,
        "description": "最低相似度阈值 (0-1)"
      },
      "useAdvanced": {
        "type": "boolean",
        "default": false,
        "description": "启用高级检索（MQE+HyDE）"
      }
    },
    "required": ["query"]
  }
}
```

**使用示例**:
```typescript
// Claude内部调用
const memories = await search_memory({
  query: "用户认证的JWT实现",
  memoryTypes: ["episodic", "semantic"],
  topK: 5,
  minScore: 0.7
});

// 返回
[
  {
    type: "semantic",
    title: "JWT认证实现方案",
    content: "...",
    score: 0.92,
    source: "线程abc123"
  },
  {
    type: "episodic",
    role: "assistant",
    content: "你可以使用jsonwebtoken库...",
    score: 0.87,
    timestamp: "2025-12-10 14:30"
  }
]
```

#### 7.1.2 consolidate_thread

```json
{
  "name": "consolidate_thread",
  "description": "将线程对话整合为长期知识",
  "inputSchema": {
    "type": "object",
    "properties": {
      "threadId": {
        "type": "string",
        "description": "线程ID（可选，默认当前线程）"
      },
      "minImportance": {
        "type": "number",
        "default": 0.7,
        "description": "最低重要性阈值"
      },
      "autoTag": {
        "type": "boolean",
        "default": true,
        "description": "自动生成标签"
      }
    }
  }
}
```

#### 7.1.3 get_semantic_knowledge

```json
{
  "name": "get_semantic_knowledge",
  "description": "获取语义记忆中的知识条目",
  "inputSchema": {
    "type": "object",
    "properties": {
      "types": {
        "type": "array",
        "items": {
          "enum": ["concept", "solution", "pattern", "fact"]
        }
      },
      "tags": {
        "type": "array",
        "items": { "type": "string" }
      },
      "sortBy": {
        "enum": ["importance", "accessCount", "updatedAt"],
        "default": "importance"
      },
      "limit": {
        "type": "number",
        "default": 20
      }
    }
  }
}
```

### 7.2 扩展的Slash命令

```bash
# 记忆搜索
/memory search <query>              # 搜索所有记忆
/memory search --thread current <query>  # 仅当前线程
/memory search --semantic <query>   # 仅语义记忆

# 知识管理
/thread consolidate                 # 整合当前线程
/thread consolidate <thread-id>     # 整合指定线程
/knowledge list                     # 列出语义记忆
/knowledge show <id>                # 查看知识详情
/knowledge delete <id>              # 删除知识

# 记忆统计
/memory stats                       # 显示记忆统计
/memory stats --thread <id>         # 指定线程统计

# 高级检索
/memory search --advanced <query>   # 启用MQE+HyDE
/memory similar <message-id>        # 查找相似消息
```

---

## 八、性能优化策略

### 8.1 嵌入生成优化

**批量处理**:
```typescript
class EmbeddingBatcher {
  private queue: string[] = [];
  private batchSize = 32;
  private flushInterval = 100; // ms

  async embed(text: string): Promise<number[]> {
    return new Promise((resolve) => {
      this.queue.push({ text, resolve });

      if (this.queue.length >= this.batchSize) {
        this.flush();
      }
    });
  }

  private async flush() {
    const batch = this.queue.splice(0, this.batchSize);
    const embeddings = await this.model.embed(batch.map(b => b.text));

    batch.forEach((item, i) => {
      item.resolve(embeddings[i]);
    });
  }
}
```

**懒加载策略**:
```typescript
// 新消息入库时不立即生成嵌入
await messagesDAO.create({ content, embedding: null });

// 后台异步生成
backgroundQueue.push(async () => {
  const embedding = await embedder.embed(content);
  await messagesDAO.updateEmbedding(messageId, embedding);
});
```

### 8.2 向量检索优化

**1. 使用HNSW索引**（Qdrant自动）:
```typescript
await qdrant.createCollection({
  vectors: {
    size: 384,
    distance: 'Cosine',
    hnsw_config: {
      m: 16,              // 连接数
      ef_construct: 200   // 构建质量
    }
  }
});
```

**2. 过滤前置**:
```typescript
// ❌ 错误：先检索再过滤
const all = await vectorStore.search(embedding, { top_k: 1000 });
const filtered = all.filter(r => r.threadId === currentThread);

// ✅ 正确：利用Qdrant过滤
const results = await qdrant.search({
  vector: embedding,
  filter: {
    must: [
      { key: 'threadId', match: { value: currentThread } }
    ]
  },
  limit: 10
});
```

**3. 结果缓存**:
```typescript
class CachedRetriever {
  private cache = new LRU<string, Memory[]>({ max: 100 });

  async retrieve(query: string): Promise<Memory[]> {
    const cacheKey = hash(query);

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const results = await this.actualRetrieve(query);
    this.cache.set(cacheKey, results);
    return results;
  }
}
```

### 8.3 数据库优化

**分区策略**:
```sql
-- 按时间分区（SQLite不原生支持，使用视图模拟）
CREATE VIEW recent_messages AS
SELECT * FROM messages
WHERE timestamp > (unixepoch('now') - 86400 * 7);  -- 最近7天

CREATE INDEX idx_recent ON messages(timestamp DESC)
WHERE timestamp > (unixepoch('now') - 86400 * 7);
```

**定期清理**:
```typescript
class MemoryCleaner {
  async cleanup(): Promise<void> {
    // 清理低价值工作记忆
    await db.exec(`
      DELETE FROM messages
      WHERE memory_type = 'working'
        AND importance < 0.3
        AND timestamp < (unixepoch('now') - 86400)
    `);

    // 压缩语义记忆（合并重复知识）
    await this.deduplicateSemanticMemory();
  }
}
```

---

## 九、安全与隐私

### 9.1 数据隔离

```typescript
// 确保跨线程搜索时的权限控制
class SecureRetriever {
  async search(query: string, userId: string): Promise<Memory[]> {
    // 获取用户有权访问的线程
    const allowedThreads = await this.getThreadsByUser(userId);

    return await this.vectorStore.search(embedding, {
      filter: {
        must: [
          { key: 'threadId', match: { any: allowedThreads } }
        ]
      }
    });
  }
}
```

### 9.2 敏感信息处理

```typescript
class SensitiveDataFilter {
  async beforeEmbed(text: string): Promise<string> {
    // 移除敏感信息
    return text
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]')
      .replace(/\b\d{16}\b/g, '[CARD]')
      .replace(/\b(?:sk-|pk_)[a-zA-Z0-9]+\b/g, '[API_KEY]');
  }
}
```

---

## 十、成本分析

### 10.1 存储成本

| 组件 | 单位成本 | 100万条消息 | 1000万条消息 |
|------|---------|------------|-------------|
| SQLite（文本） | ~500B/条 | 500MB | 5GB |
| 嵌入向量（384维） | 1.5KB/条 | 1.5GB | 15GB |
| Qdrant索引 | ~2KB/条 | 2GB | 20GB |
| **总计** | | **4GB** | **40GB** |

**优化建议**:
- 对低重要性消息（<0.3）只保留文本，不生成嵌入
- 超过6个月的旧消息归档到冷存储
- 使用量化嵌入（float32 → int8）节省75%空间

### 10.2 计算成本

| 操作 | 延迟 | 吞吐量 | 优化方案 |
|------|------|--------|---------|
| 嵌入生成（本地） | 5-10ms/条 | 100条/秒 | 批处理、GPU加速 |
| 向量检索（Qdrant） | 2-5ms | 1000次/秒 | HNSW索引 |
| LLM知识提取 | 2-5s/次 | 20次/分钟 | 异步队列 |

---

## 十一、测试策略

### 11.1 单元测试

```typescript
describe('HybridRetriever', () => {
  it('should retrieve from multiple memory layers', async () => {
    const retriever = new HybridRetriever(db, vectorStore);

    const results = await retriever.retrieve('JWT authentication', {
      threadId: 'test-thread',
      memoryTypes: ['working', 'episodic', 'semantic']
    });

    expect(results).toHaveLength(10);
    expect(results[0].score).toBeGreaterThan(0.7);
  });

  it('should apply time decay correctly', () => {
    const score1 = calculateScore(0.9, Date.now() - 3600000, 0.8); // 1h ago
    const score2 = calculateScore(0.9, Date.now() - 86400000, 0.8); // 1d ago

    expect(score1).toBeGreaterThan(score2);
  });
});
```

### 11.2 集成测试

```typescript
describe('Memory Consolidation E2E', () => {
  it('should consolidate thread into semantic memory', async () => {
    // 1. 创建线程并添加对话
    const thread = await threadManager.createThread({ title: 'Test' });
    await threadManager.addMessage(thread.id, 'user', '如何实现JWT?');
    await threadManager.addMessage(thread.id, 'assistant', '使用jsonwebtoken库...');

    // 2. 执行整合
    await consolidator.consolidate(thread.id);

    // 3. 验证语义记忆
    const knowledge = await semanticMemoryDAO.findBySourceThread(thread.id);
    expect(knowledge).toHaveLength(1);
    expect(knowledge[0].type).toBe('solution');
    expect(knowledge[0].title).toContain('JWT');
  });
});
```

### 11.3 性能基准测试

```typescript
describe('Performance Benchmarks', () => {
  it('should retrieve from 1M messages in <10ms', async () => {
    // 插入100万条测试消息
    await seedDatabase(1_000_000);

    const start = performance.now();
    const results = await retriever.retrieve('test query');
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(10);
  });
});
```

---

## 十二、监控与可观测性

### 12.1 关键指标

```typescript
interface MemoryMetrics {
  // 检索性能
  retrievalLatency: Histogram;        // p50, p95, p99
  retrievalAccuracy: Gauge;           // 用户反馈的准确率

  // 记忆统计
  workingMemorySize: Gauge;           // 工作记忆条数
  episodicMemorySize: Gauge;          // 情景记忆条数
  semanticMemorySize: Gauge;          // 语义记忆条数

  // 整合效率
  consolidationRate: Counter;         // 每小时整合次数
  knowledgeExtractionSuccess: Gauge;  // 知识提取成功率

  // 向量存储
  vectorIndexSize: Gauge;             // 索引大小
  vectorSearchQPS: Counter;           // 查询QPS
}
```

### 12.2 诊断工具

```bash
# 记忆健康检查
/memory health

# 输出示例：
Memory System Health Report
━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Working Memory: 42/50 (84%)
✅ Episodic Memory: 1,234 messages, 98% embedded
✅ Semantic Memory: 87 knowledge entries
✅ Vector Store: Qdrant healthy, 2.3ms avg latency
⚠️  Embedding Queue: 23 pending (backlog detected)

Recommendations:
• Consider consolidating older threads
• Increase embedding worker threads
```

---

## 十三、迁移与兼容性

### 13.1 向后兼容保证

```typescript
// v1.0的API继续工作
await threadManager.listThreads();  // ✅ 仍然支持
await threadManager.switchThread(id);  // ✅ 仍然支持

// v2.0新增的API
await threadManager.search('query');  // 🆕 新功能
await threadManager.consolidate(id);  // 🆕 新功能
```

### 13.2 渐进式升级

```typescript
class ThreadManagerV2 extends ThreadManagerV1 {
  // 检测功能支持
  get features(): string[] {
    const features = ['basic_threading']; // v1.0

    if (this.hasVectorStore()) {
      features.push('semantic_search');  // v2.0
    }

    if (this.hasSemanticMemory()) {
      features.push('knowledge_consolidation');  // v2.0
    }

    return features;
  }

  // 优雅降级
  async search(query: string): Promise<Memory[]> {
    if (this.hasVectorStore()) {
      return await this.vectorSearch(query);  // v2.0
    } else {
      return await this.keywordSearch(query);  // v1.0回退
    }
  }
}
```

---

## 十四、未来展望

### 14.1 潜在扩展方向

**1. 多模态记忆**
```typescript
interface MultimodalMemory extends Message {
  attachments?: {
    type: 'image' | 'code' | 'document';
    embedding: number[];  // 专用模态嵌入
    preview: string;
  }[];
}
```

**2. 联邦学习**
```typescript
// 多用户场景下的隐私保护知识共享
class FederatedMemory {
  async shareKnowledge(knowledge: SemanticMemory): Promise<void> {
    // 差分隐私处理
    const anonymized = await this.anonymize(knowledge);
    await this.globalKnowledgePool.contribute(anonymized);
  }
}
```

**3. 自适应学习**
```typescript
// 根据用户反馈调整检索策略
class AdaptiveRetriever {
  async learn(query: string, selectedResult: Memory): Promise<void> {
    // 强化学习：调整评分权重
    this.updateWeights(query, selectedResult.score);
  }
}
```

### 14.2 社区贡献方向

- 🔌 **插件系统**: 允许自定义嵌入模型和向量存储
- 🌐 **多语言支持**: 支持中英文混合检索
- 📊 **可视化界面**: 记忆网络图谱展示
- 🔗 **集成生态**: Obsidian、Notion同步

---

## 十五、总结

### 核心价值主张

Thread Manager v2.0 将从**简单的对话管理工具**升级为**具备认知能力的AI记忆系统**，实现：

1. **30-50% 的上下文准确率提升** - 通过语义检索替代时间检索
2. **跨线程知识复用** - AI可以学习和积累经验
3. **10倍的检索效率** - 向量索引 vs 全表扫描
4. **更自然的交互体验** - AI能"记住"用户的习惯和偏好

### 技术亮点

- ✨ **三层记忆架构** - 模拟人类认知模型
- 🚀 **渐进式实施** - 不破坏现有功能，平滑升级
- 🔧 **高度可配置** - 支持云端/本地/轻量级多种部署
- 📈 **生产级性能** - 千万级消息下仍保持毫秒级响应

### 实施建议

**推荐路径**: Phase 1 → Phase 2 → Phase 3（优先级递减）

**关键成功因素**:
1. 尽早引入Qdrant，避免后期迁移成本
2. 设计良好的数据模型，为未来扩展留足空间
3. 建立完善的测试和监控体系
4. 保持向后兼容，降低用户迁移成本

---

**附录**:
- A. [Qdrant快速部署指南](./appendix-a-qdrant-setup.md)
- B. [嵌入模型性能对比](./appendix-b-embedding-benchmark.md)
- C. [API完整参考文档](./appendix-c-api-reference.md)
- D. [故障排查手册](./appendix-d-troubleshooting.md)

---

*本提案基于 HelloAgents 记忆与检索系统的最佳实践，结合 Thread Manager 的实际场景需求制定。欢迎团队审阅并提供反馈。*
