# Phase 1 文档导航
## Thread Manager 语义搜索 MVP

**版本**: 1.0 | **状态**: 📋 规划中 | **目标交付**: 2026-01-03

---

## 🗺️ 文档地图

根据你的角色和需求，选择合适的文档：

```
Phase 1 规划文档包
│
├─ 📊 [执行摘要](./phase1-executive-summary.md)
│   👥 适合: Tech Leader, PM, 管理层
│   ⏱️  阅读: 5分钟
│   📋 内容: 投入产出、风险评估、Go/No-Go决策
│
├─ 🔧 [详细实施计划](./phase1-implementation-plan.md)
│   👥 适合: 开发团队, QA
│   ⏱️  阅读: 30分钟
│   📋 内容: 任务分解、代码示例、测试策略
│
├─ 🎯 [技术选型决策矩阵](./phase1-tech-decision-matrix.md)
│   👥 适合: 技术团队（评审会使用）
│   ⏱️  阅读: 20分钟
│   📋 内容: 技术选型对比、优先级排序、决策记录
│
└─ 🚀 [完整v2.0提案](./thread-manager-v2-proposal.md)
    👥 适合: 所有人（背景了解）
    ⏱️  阅读: 60分钟
    📋 内容: 长期愿景、架构设计、5个Phase路线图
```

---

## 🚦 快速导航（按场景）

### 场景1: "我是TL，需要快速决策是否启动"

1. 阅读 → [执行摘要](./phase1-executive-summary.md)（5分钟）
2. 检查 → Go/No-Go清单
3. 决策 → 批准或要求更多信息

**关键问题**:
- ✅ 投入产出合理吗？→ 12.5天换取30-50%准确率提升
- ✅ 风险可控吗？→ 低风险，可回滚
- ✅ 时间合理吗？→ 3周，有20%缓冲

---

### 场景2: "我是开发，准备开始编码"

1. 阅读 → [详细实施计划](./phase1-implementation-plan.md)（30分钟）
2. 重点看 → 第四章"详细技术实现方案"
3. 复制 → 代码示例到IDE
4. 执行 → 按Sprint顺序开发

**关键步骤**:
```bash
# Step 1: 安装依赖
npm install @xenova/transformers

# Step 2: 创建分支
git checkout -b feature/semantic-search-phase1

# Step 3: 开始T1.1任务
# 参考实施计划第4.1节代码示例
```

---

### 场景3: "我们需要开技术评审会"

1. 提前分发 → [技术选型决策矩阵](./phase1-tech-decision-matrix.md)
2. 会议议程 → 使用决策矩阵的结构
3. 现场投票 → 嵌入模型、向量存储、优先级
4. 记录决策 → 填写"决策记录表"

**会议时长**: 45分钟
**参会人员**: Tech Lead, Backend Team, QA Lead, PM（可选）

**议程**:
```
0-5min:   背景介绍（TL讲解）
5-20min:  技术选型讨论（4个关键决策）
20-35min: 优先级排序和任务分工
35-40min: 风险评估
40-45min: 行动项确认
```

---

### 场景4: "PM想了解长期规划"

1. 阅读 → [v2.0完整提案](./thread-manager-v2-proposal.md)（60分钟）
2. 重点看 → 第一章"执行摘要"和第四章"迭代路线图"
3. 理解 → Phase 1在整体规划中的位置

**5个Phase概览**:
```
Phase 1 (3周) → 基础向量检索 ✅ 我们在这里
Phase 2 (4周) → Qdrant + 分层记忆
Phase 3 (5周) → 语义记忆 + 知识整合 ⭐ 最大价值
Phase 4 (4周) → RAG增强（MQE、HyDE）
Phase 5 (3周) → 生产优化
```

---

## 📊 可视化架构

### Phase 1 系统架构

```
┌─────────────────────────────────────────────────────┐
│                    Thread Manager                    │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────────┐         ┌───────────────────┐  │
│  │  MessagesDAO   │────────▶│ EmbeddingService  │  │
│  │                │         │ (@xenova/trans.)  │  │
│  │  - create()    │         │                   │  │
│  │  - search()    │         │ - embed()         │  │
│  └────────────────┘         │ - embedBatch()    │  │
│          │                  └───────────────────┘  │
│          │                           │              │
│          ▼                           ▼              │
│  ┌────────────────┐         ┌───────────────────┐  │
│  │    SQLite      │         │ VectorSearchEngine│  │
│  │                │         │                   │  │
│  │  messages      │         │ - cosineSim()     │  │
│  │  ├─ content    │         │ - search()        │  │
│  │  ├─ embedding  │◀────────│                   │  │
│  │  └─ ...        │         └───────────────────┘  │
│  └────────────────┘                                │
│                                                      │
└─────────────────────────────────────────────────────┘
                      │
                      ▼
            ┌──────────────────┐
            │   MCP Protocol   │
            │                  │
            │ search_messages  │
            └──────────────────┘
                      │
                      ▼
                 [ Claude AI ]
```

### 数据流

```
用户查询: "如何实现认证"
    │
    ▼
[1] EmbeddingService.embed()
    │  生成查询向量 [0.12, -0.34, ...]
    │
    ▼
[2] 从SQLite加载候选消息
    │  WHERE embedding IS NOT NULL
    │
    ▼
[3] VectorSearchEngine.search()
    │  计算余弦相似度
    │  排序 + 过滤
    │
    ▼
[4] 返回Top-K结果
    │  [
    │    { score: 0.87, content: "JWT认证..." },
    │    { score: 0.82, content: "OAuth2..." }
    │  ]
    │
    ▼
用户看到结果
```

---

## 📅 关键时间节点

| 日期 | 里程碑 | 交付物 |
|------|--------|--------|
| **2025-12-12** | 📋 规划完成 | 本文档包 |
| **2025-12-13** | 🗳️ 技术评审会 | 决策记录 |
| **2025-12-16** | 🚀 开发启动 | Sprint 1开始 |
| **2025-12-20** | ✅ Milestone 1 | 能搜索测试数据 |
| **2025-12-27** | ✅ Milestone 2 | 历史数据迁移完成 |
| **2026-01-03** | 🎉 Phase 1交付 | v2.0-beta发布 |

---

## 🎯 成功标准速查

### 功能标准
- ✅ 新消息自动生成嵌入
- ✅ `/memory search` 命令可用
- ✅ `search_messages` MCP工具返回正确结果
- ✅ 历史消息迁移脚本成功运行

### 性能标准
- ✅ 单次嵌入 < 10ms
- ✅ 10K消息搜索 < 20ms
- ✅ 批量迁移 > 50条/秒

### 质量标准
- ✅ 代码覆盖率 > 80%
- ✅ 搜索准确率 > 70%
- ✅ 无P0/P1级别bug

---

## 🔧 开发环境设置

### 必需依赖

```json
{
  "dependencies": {
    "@xenova/transformers": "^2.17.2",
    "better-sqlite3": "^11.5.0",
    "uuid": "^11.0.3"
  }
}
```

### 环境变量

```bash
# .env
EMBEDDING_MODEL=Xenova/all-MiniLM-L6-v2
EMBEDDING_CACHE_DIR=~/.cache/xenova-transformers
VECTOR_SEARCH_MIN_SCORE=0.5
```

### 快速验证

```bash
# 测试嵌入模型是否可用
npm run test:embedding

# 预期输出:
# ✅ Model loaded successfully
# ✅ Embedding generated: 384 dimensions
# ✅ Cosine similarity test passed
```

---

## 📞 支持与反馈

### 遇到问题？

1. **技术问题** → 查看[实施计划](./phase1-implementation-plan.md)的"故障排查指南"
2. **决策疑问** → 参考[决策矩阵](./phase1-tech-decision-matrix.md)的"议题讨论"
3. **优先级冲突** → 联系Tech Leader重新评估

### 提供反馈

- 📝 文档改进建议 → 提交PR或Issue
- 💡 技术方案优化 → 在技术评审会提出
- ⚠️ 风险预警 → 立即告知Tech Leader

---

## 🏆 Phase 1成功后...

### 立即收益
- 🎉 用户获得语义搜索能力
- 📈 AI上下文准确率提升30-50%
- 🔧 技术栈为Phase 2做好准备

### 下一步（Phase 2）

**触发条件**:
```typescript
if (messageCount > 10000 || searchLatency > 50ms) {
  planPhase2(); // Qdrant集成 + 分层记忆
}
```

**预计周期**: 3-4周

**核心价值**:
- 10倍性能提升
- 支持百万级消息
- 工作记忆 + 情景记忆分层

---

## 📚 扩展阅读

### 理论基础
- [Sentence Transformers论文](https://arxiv.org/abs/1908.10084)
- [MTEB Benchmark](https://huggingface.co/spaces/mteb/leaderboard)
- [向量检索算法综述](https://arxiv.org/abs/2101.12489)

### 工程实践
- [@xenova/transformers官方文档](https://huggingface.co/docs/transformers.js)
- [Qdrant向量数据库指南](https://qdrant.tech/documentation/)
- [HelloAgents记忆系统设计](https://github.com/datawhalechina/hello-agents/blob/main/docs/chapter8)

---

## ✅ 预启动检查清单

在开始开发前，确保：

- [ ] 所有团队成员已阅读相关文档
- [ ] 技术评审会已完成，决策已记录
- [ ] 开发环境已配置（依赖、环境变量）
- [ ] Git分支已创建 `feature/semantic-search-phase1`
- [ ] 任务已录入项目管理工具（Jira/Trello等）
- [ ] 测试数据集已准备
- [ ] 沟通渠道已建立（Slack频道/微信群）

---

**准备好了吗？让我们开始Phase 1！** 🚀

```bash
# 第一步
git checkout -b feature/semantic-search-phase1

# 第二步
npm install @xenova/transformers

# 第三步
code src/services/embedding-service.ts  # 开始编码！
```

---

*本导航文档将随着Phase 1进展持续更新。最后更新: 2025-12-12*
