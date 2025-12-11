# Thread Manager (线程管理器)

一个为 Claude Code 设计的强大线程管理系统，支持多上下文切换和自动化文件变更追踪。

## ✨ 主要特性

- 🧵 **多线程管理**: 并行处理多个任务，互不干扰，保持上下文隔离。
- 🔄 **上下文切换**: 在不同的对话线程之间无缝切换。
- 🧠 **语义搜索**: 使用自然语言搜索对话历史（例如：“我们是如何修复登录 bug 的？”）。
- 💬 **消息记录**: 在线程内记录和检索对话消息。
- 📊 **变更追踪**: 自动追踪每个线程的文件变更和代码行数统计。
- 💾 **本地存储**: 所有数据（包括向量嵌入）均存储在本地 SQLite 数据库中。
- 🛠️ **MCP & CLI**: 全面支持 Model Context Protocol (MCP) 和 Slash Commands。

## 🚀 使用指南

### 1. 使用 Slash Commands (斜杠命令)

```bash
# 创建新线程
/thread new "修复登录 Bug"

# 列出所有线程
/threads

# 切换上下文
/thread switch <thread-id>

# 查看当前状态
/thread info
```

### 2. 使用 MCP 工具

本 Skill 提供了一组 MCP 工具，AI 助手可以使用这些工具以编程方式管理对话状态。

**线程管理:**
- `create_thread` - 创建新的对话线程
- `list_threads` - 列出所有线程（支持过滤和排序）
- `switch_thread` - 切换到不同的线程上下文
- `get_thread` - 获取特定线程的详情
- `get_current_thread` - 获取当前活跃的线程
- `update_thread` - 更新线程元数据（标题、描述、标签）
- `delete_thread` - 永久删除线程

**消息记录与搜索:**
- `add_message` - 向当前线程添加消息（记录对话历史）
- `search_messages` - 使用自然语言进行语义搜索

**文件追踪:**
- `track_file_change` - 追踪文件变更（支持自动检测 Git 统计信息）

#### 示例：语义搜索

您现在可以基于意图搜索过去的消息：

```javascript
// 搜索概念，而不仅仅是关键词
await search_messages({
  query: "用户认证实现的细节",
  topK: 5
});
```

#### 示例：记录消息

```javascript
// 添加用户消息
await add_message({
  role: "user",
  content: "我该如何实现认证功能？",
  metadata: { timestamp: Date.now() }
});

// 添加助手回复
await add_message({
  role: "assistant",
  content: "这是实现认证的方法..."
});
```

## 🛠️ 开发指南

```bash
# 安装依赖
npm install

# 编译构建
npm run build

# 运行测试
npm test
```

## 📦 迁移指南

### 升级到 v1.1.0 (语义搜索)

如果您在 v1.1.0 之前已经创建了消息，这些消息不会自动拥有向量嵌入。要启用对这些旧消息的搜索功能，请运行迁移脚本：

```bash
# 运行迁移工具
npm run migrate
```

此命令将下载嵌入模型（本地运行）并处理所有遗留消息。

## ❓ 常见问题 (FAQ)

### Q: MCP 会默认加载吗？
**A: 不会。** MCP 技能需要被明确配置和启用。您需要在 Claude Code 的配置文件（如 `config.json`）中添加 `thread-manager` 技能。一旦启动，它包含的所有工具（包括新版 `search_messages`）会自动注册并可供使用。

### Q: 这里的 MCP 和之前的版本是同一个吗？
**A: 是的。** 它们指代同一个 `thread-manager` 技能实例。本次更新 (v1.1.0) 只是在这个已有的技能中**增加了新功能**（如语义搜索、自动嵌入），并没有改变 MCP 协议本身，也不是创建了一个新的独立服务。

### Q: 如何更新到最新版本？
由于不是自动更新，请按以下步骤手动操作：
1. **获取代码**: `git pull`（如果适用）。
2. **安装依赖**: `cd .claude/skills/thread-manager && npm install`。
3. **重新编译**: `npm run build`。
4. **迁移数据**: `npm run migrate`（为旧消息生成向量嵌入）。
5. **重启**: 重启 Claude Code 以加载新工具。

### Q: 能存储代码的变更吗？
**A: 可以。** 使用 `track_file_change` 工具可以记录文件的修改、新增或删除。更棒的是，它支持 **Git 自动集成**，可以自动检测变更的代码行数和 Git commit hash，并将其关联到当前对话线程中，方便后续追踪任务进度。

### Q: 上下文有优化吗？会消耗太多 Claude 的 Token 吗？
**A: 有针对性优化，不会造成浪费。**
- **任务隔离**: 切换线程时会重置上下文窗口，移除不相关的历史对话，只保留当前任务的关键信息。
- **精简注入**: 动态维护的 `current-context.md` 只包含最近的少量关键消息摘要和元数据，而非全部历史。
- **按需加载**: 完整的历史记录存储在本地数据库中，只有在您主动搜索或请求时（Lazy Loading）才会检索并提供给 Claude，从而极大节省 Token 消耗。

## 📄 许可证

MIT