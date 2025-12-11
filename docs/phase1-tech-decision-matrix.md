# Phase 1 技术选型决策矩阵

**会议目的**: 确定Phase 1的技术栈和实施优先级
**参与者**: Tech Leader, Backend Team, QA
**预计时长**: 45分钟
**决策方式**: 共识决策（若分歧则TL最终决策）

---

## 🎯 关键决策点（需要团队共识）

### 决策1: 嵌入模型选择 ⭐ 最高优先级

| 选项 | 投票 | 优势 | 劣势 | 推荐度 |
|------|------|------|------|--------|
| **A. @xenova/transformers (本地)** | 👍👍👍 | • 零成本<br>• 隐私安全<br>• 离线可用 | • 首次加载慢（~3s）<br>• 速度略低 | ⭐⭐⭐⭐⭐ |
| B. OpenAI Embeddings API | 👍 | • 质量最高<br>• 零运维 | • 成本（$0.0001/1K tokens）<br>• 网络依赖<br>• 隐私风险 | ⭐⭐ |
| C. sentence-transformers (Python) | 👍👍 | • 速度最快<br>• 生态丰富 | • 需Python栈<br>• 跨语言调用复杂 | ⭐⭐⭐ |

**推荐决策**: **选项A** - @xenova/transformers

**理由**:
1. ✅ MVP阶段零成本最重要
2. ✅ 用户数据隐私（本地处理）
3. ✅ 纯TypeScript栈，降低运维复杂度
4. ⚠️ 首次加载慢可通过预热缓解

**行动项**:
- [ ] 确认团队同意选项A
- [ ] 如有异议，讨论具体场景（如企业客户要求云端API）
- [ ] 设计降级策略（如首选本地，失败则调用云端）

---

### 决策2: 向量存储方案 ⭐ 中等优先级

| 选项 | 适用场景 | 性能 | 复杂度 | 推荐阶段 |
|------|---------|------|--------|---------|
| **A. 内存Brute Force** | < 1万条消息 | 2-5ms | 极低 | **Phase 1 ✅** |
| B. SQLite-VSS扩展 | < 10万条 | 5-20ms | 中等 | Phase 1.5（可选） |
| C. Qdrant独立服务 | 无限规模 | 2-5ms | 高 | Phase 2 |

**推荐决策**: **A → C 渐进式路线**

**Phase 1决策**:
- ✅ 使用内存Brute Force（最简单，快速验证）
- ✅ 数据模型设计时预留Qdrant迁移空间
- ❌ 不引入SQLite-VSS（避免中间状态）

**触发Phase 2升级的条件**:
```typescript
if (messageCount > 10000 || avgSearchLatency > 50ms) {
  // 升级到Qdrant
}
```

**行动项**:
- [ ] 确认团队接受渐进式方案
- [ ] 讨论是否需要预先POC Qdrant（了解迁移成本）
- [ ] 设计数据模型时考虑迁移路径

---

### 决策3: 数据库Schema变更策略 ⭐ 高优先级

#### 选项A: ALTER TABLE（推荐）

```sql
ALTER TABLE messages ADD COLUMN embedding_blob BLOB;
ALTER TABLE messages ADD COLUMN embedding_model TEXT DEFAULT 'all-MiniLM-L6-v2';
ALTER TABLE messages ADD COLUMN embedding_generated_at INTEGER;
```

**优势**:
- ✅ 简单直接，无需重建表
- ✅ 保留所有现有数据和索引
- ✅ 向后兼容（新列允许NULL）

**劣势**:
- ⚠️ 表结构变大（每条消息+1.5KB）

#### 选项B: 创建独立表

```sql
CREATE TABLE message_embeddings (
  message_id TEXT PRIMARY KEY,
  embedding_blob BLOB NOT NULL,
  model TEXT NOT NULL,
  generated_at INTEGER NOT NULL,
  FOREIGN KEY (message_id) REFERENCES messages(id)
);
```

**优势**:
- ✅ 原表保持简洁
- ✅ 可选功能（用户可选择是否启用）

**劣势**:
- ❌ JOIN查询复杂度增加
- ❌ 需要维护两张表的一致性

**推荐决策**: **选项A** - ALTER TABLE

**理由**: Phase 1目标是快速MVP，简单优先。

---

### 决策4: 嵌入生成时机 ⭐ 中等优先级

| 时机 | 优势 | 劣势 | 用户体验 |
|------|------|------|---------|
| **同步生成** | 简单，数据一致 | 消息创建慢（+10ms） | 💛 可接受 |
| **异步队列** | 快速响应 | 复杂度高，可能失败 | 💚 最佳 |
| **懒加载** | 无初始成本 | 首次搜索慢 | 💔 不推荐 |

**推荐决策**: **混合策略**

```typescript
// Phase 1.0: 同步生成（简单）
async createMessage(input) {
  const embedding = await embeddingService.embed(input.content);
  await db.insert({ ...input, embedding });
}

// Phase 1.1: 可选的异步优化（如果性能成为瓶颈）
async createMessage(input) {
  await db.insert({ ...input, embedding: null });
  backgroundQueue.push(() => generateEmbedding(messageId));
}
```

**行动项**:
- [ ] Phase 1.0先实现同步版本
- [ ] 监控消息创建延迟
- [ ] 如果用户反馈慢，则升级到异步

---

## 📊 优先级排序（团队共识）

### P0 - 必须完成（阻塞上线）

| 任务 | 估时 | 风险 | 负责人 |
|------|------|------|--------|
| T1.1 集成@xenova/transformers | 4h | 低 | @backend |
| T1.2 EmbeddingService实现 | 6h | 低 | @backend |
| T2.2 VectorSearchEngine | 8h | 中 | @backend |
| T2.3 集成到MessagesDAO | 4h | 中 | @backend |
| T3.2 search_messages工具 | 6h | 低 | @backend |
| T4.1 新消息自动嵌入 | 4h | 低 | @backend |
| T5.1 E2E集成测试 | 6h | 中 | @qa |

**总计**: 38小时 ≈ 5天

### P1 - 重要（提升质量）

| 任务 | 估时 | 可降级方案 |
|------|------|-----------|
| T4.3 历史消息迁移脚本 | 8h | 手动迁移 |
| T2.5 性能基准测试 | 3h | 简化测试 |
| T5.2 用户文档 | 4h | 简化文档 |

**总计**: 15小时 ≈ 2天

### P2 - 可选（锦上添花）

| 任务 | 估时 | Phase 2补充 |
|------|------|------------|
| T4.5 批量推理优化 | 4h | ✅ |
| T3.3 Slash命令 | 4h | ✅ |

---

## 🚨 风险与决策

### 风险1: @xenova/transformers在某些环境不可用

**场景**: ARM架构、旧版Node等

**缓解方案**:
```typescript
// 降级策略
class EmbeddingServiceFactory {
  create(): IEmbeddingService {
    try {
      return new XenovaEmbeddingService();  // 首选
    } catch {
      return new TFIDFEmbeddingService();   // 兜底
    }
  }
}
```

**决策**: 是否实施降级？
- [ ] ✅ 是 - 增加2天开发时间，但更稳健
- [ ] ❌ 否 - 假设环境兼容，节省时间

**推荐**: Phase 1不实施，Phase 2补充

---

### 风险2: 内存占用过高

**场景**: 用户有5万条消息，内存占用75MB向量数据

**缓解方案**:
1. **懒加载**: 只加载当前线程的向量
2. **LRU缓存**: 保留最近使用的向量
3. **分页搜索**: 分批加载候选集

**决策**: Phase 1是否实施？
- [ ] ✅ 是 - 实施懒加载（4小时）
- [ ] ❌ 否 - 假设用户<1万条消息

**推荐**: 实施懒加载（值得投入）

---

## 🎯 时间轴与里程碑

### Week 1: 核心基础（Days 1-5）

```
Day 1-2: 模型集成 + EmbeddingService
  ├─ T1.1 集成transformers (4h)
  ├─ T1.2 EmbeddingService (6h)
  └─ T1.3 Schema扩展 (3h) [并行]

Day 3-5: 搜索引擎
  ├─ T2.1 余弦相似度 (2h)
  ├─ T2.2 VectorSearchEngine (8h)
  ├─ T2.3 MessagesDAO集成 (4h)
  └─ T2.5 性能测试 (3h)

Milestone 1: ✅ 能够搜索测试数据
```

### Week 2: API与工具（Days 6-10）

```
Day 6-7: MCP工具
  ├─ T3.1 Schema设计 (2h)
  ├─ T3.2 search_messages实现 (6h)
  └─ T3.4 错误处理 (3h)

Day 8-10: 嵌入生成
  ├─ T4.1 自动嵌入Hook (4h)
  ├─ T4.2 批量队列 (6h)
  ├─ T4.3 迁移脚本 (8h)
  └─ T4.4 进度监控 (4h)

Milestone 2: ✅ 历史数据迁移完成
```

### Week 3: 测试与发布（Days 11-15）

```
Day 11-12: 测试
  ├─ T5.1 E2E测试 (6h)
  ├─ T2.5 性能基准 (3h)
  └─ 缺陷修复 (buffer)

Day 13-14: 文档与发布
  ├─ T5.2 用户文档 (4h)
  ├─ T5.3 API文档 (3h)
  └─ Release Notes (2h)

Day 15: 上线与验证
  └─ 发布 v2.0-beta

Milestone 3: ✅ Phase 1 交付
```

---

## 💡 团队讨论议题

### 议题1: 是否支持多语言混合检索？

**背景**: 用户可能同时用中英文提问

**选项**:
- A. 使用多语言模型（如paraphrase-multilingual）- 增加10MB模型体积
- B. 保持英文模型，中文效果稍差但可接受
- C. 让用户自行配置模型

**投票**: 请团队选择 A / B / C

---

### 议题2: 是否实现搜索结果解释？

**功能**: 告诉用户"为什么这条消息被匹配"

```typescript
{
  message: "JWT认证通过生成token...",
  score: 0.87,
  explanation: "匹配关键词: [JWT, 认证, token]，语义相似度: 87%"
}
```

**成本**: 增加4小时开发

**价值**: 提升用户信任度

**投票**: 是 / 否 / Phase 2

---

### 议题3: 测试数据集准备

**需求**: 验证搜索质量需要真实对话数据

**选项**:
- A. 使用合成数据（GPT生成100条对话）
- B. 使用团队真实聊天记录（脱敏处理）
- C. 开源数据集（如MSMARCO）

**行动**: 指定负责人准备测试集

---

## 📋 决策记录表（会议后填写）

| 决策点 | 最终决定 | 理由 | 反对意见 | 负责人 |
|--------|---------|------|---------|--------|
| 嵌入模型 | @xenova/transformers | 成本、隐私、简单 | 无 | @backend |
| 向量存储 | 内存Brute Force | 快速MVP | 担心性能 | @backend |
| Schema策略 | ALTER TABLE | 简单 | 无 | @backend |
| 嵌入时机 | 同步生成 | Phase 1简单优先 | 性能顾虑 | @backend |
| 懒加载 | 实施 | 防止内存问题 | 增加复杂度 | @backend |
| 多语言 | B - 保持英文模型 | 节省成本 | 中文效果打折 | @team |
| 搜索解释 | Phase 2 | 时间优先 | 用户体验 | @pm |

---

## ✅ 会后行动项

| 行动项 | 负责人 | 截止日期 | 状态 |
|--------|--------|---------|------|
| 创建Phase 1开发分支 | @backend | Day 1 | ⏳ |
| 添加@xenova/transformers依赖 | @backend | Day 1 | ⏳ |
| 准备测试数据集 | @qa | Day 3 | ⏳ |
| 设计数据库迁移脚本 | @backend | Day 2 | ⏳ |
| 编写技术设计文档 | @tech-lead | Day 2 | ⏳ |

---

## 📚 参考资料

- [Phase 1详细实施计划](./phase1-implementation-plan.md)
- [Thread Manager v2.0提案](./thread-manager-v2-proposal.md)
- [@xenova/transformers文档](https://huggingface.co/docs/transformers.js)
- [all-MiniLM-L6-v2模型卡片](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2)

---

**会议准备清单**:
- [ ] 所有参会者提前阅读Phase 1实施计划
- [ ] 技术负责人准备POC代码演示（可选）
- [ ] 准备投票工具（Miro、Figma Voting等）
- [ ] 预约会议室/线上会议

**会议预期产出**:
1. ✅ 所有关键决策达成共识
2. ✅ 任务优先级排序确认
3. ✅ 团队成员分工明确
4. ✅ 下一步行动项清晰

---

*本决策矩阵旨在提高技术讨论效率，帮助团队快速达成共识。建议在正式开发前完成所有决策。*
