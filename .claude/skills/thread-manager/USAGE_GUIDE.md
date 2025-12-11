# Thread Manager - 使用指南

## 概述

Thread Manager 现在支持**消息记录功能**，可以自动跟踪和记录对话历史，让每个线程都保存完整的上下文。

## 问题：为什么 messageCount 一直是 0？

在添加 `add_message` 工具之前，Thread Manager 只能跟踪线程元数据和文件变更，**不会自动记录对话消息**。

现在通过 `add_message` 工具，您可以：
- 📝 记录用户和助手的对话
- 🔍 检索线程的完整对话历史
- 📊 自动更新 messageCount 统计

## 如何使用消息记录功能

### 1. 通过 MCP 工具记录消息

```bash
# 需要重启 Claude Code 以加载新工具
# 重启后，新工具 mcp__thread-manager__add_message 将可用
```

**添加用户消息：**
```javascript
mcp__thread-manager__add_message({
  role: "user",
  content: "如何实现用户认证？"
})
```

**添加助手消息：**
```javascript
mcp__thread-manager__add_message({
  role: "assistant",
  content: "这里是实现用户认证的方法..."
})
```

**添加系统消息（带元数据）：**
```javascript
mcp__thread-manager__add_message({
  role: "system",
  content: "Thread switched to: Fix login bug",
  metadata: { event: "thread_switch", timestamp: Date.now() }
})
```

### 2. 查看线程消息

**获取当前线程及其消息：**
```javascript
mcp__thread-manager__get_current_thread({
  includeMessages: true,
  messageLimit: 50  // 最多返回50条消息
})
```

**获取特定线程的消息：**
```javascript
mcp__thread-manager__get_thread({
  threadId: "your-thread-id",
  includeMessages: true,
  includeFileChanges: true,
  messageLimit: 100
})
```

### 3. 消息自动计数

每次使用 `add_message` 添加消息时：
- ✅ 消息会被保存到数据库
- ✅ Thread 的 `messageCount` 会自动增加
- ✅ Thread 的 `updatedAt` 时间会更新

现在运行 `/threads` 时，您将看到正确的消息计数！

### 4. 语义搜索消息

使用 `search_messages` 工具可以通过自然语言搜索历史对话：

**基本搜索：**
```javascript
mcp__thread-manager__search_messages({
  query: "关于认证的讨论"
})
```

**高级过滤：**
```javascript
mcp__thread-manager__search_messages({
  query: "API接口定义",
  topK: 10,           // 返回最多10条结果
  minScore: 0.7,      // 最低相似度阈值
  threadId: "specific-thread-id" // 在特定线程中搜索
})
```

## 工作流示例

### 场景：跟踪功能开发的完整对话

```bash
# 1. 创建新线程
/thread new "Implement OAuth2 Login" --tags auth,backend

# 2. 记录需求讨论
mcp__thread-manager__add_message({
  role: "user",
  content: "需要实现 OAuth2 登录，支持 Google 和 GitHub"
})

mcp__thread-manager__add_message({
  role: "assistant",
  content: "好的，我会实现以下几个部分：\n1. OAuth2 Provider 配置\n2. 回调路由\n3. Token 管理"
})

# 3. 跟踪文件变更
mcp__thread-manager__track_file_change({
  filePath: "src/auth/oauth.ts"
})

# 4. 记录实现讨论
mcp__thread-manager__add_message({
  role: "user",
  content: "Token 应该存储在哪里？"
})

mcp__thread-manager__add_message({
  role: "assistant",
  content: "建议使用 HttpOnly Cookie 存储 refresh token，access token 可以存在内存中"
})

# 5. 查看完整历史
/thread show <thread-id>  # 显示元数据和统计
mcp__thread-manager__get_current_thread({ includeMessages: true })  # 显示所有消息
```

## 最佳实践

### ⚠️ 重要提示：使用带参数命令

当使用如 `/be-start`、`/fe-start` 等创建线程的命令时，请务必在命令后提供任务描述，不要在输入命令后直接回车。

✅ **正确做法**：
```bash
/be-start "实现JWT认证API"
```

❌ **错误做法**：
```bash
/be-start [回车]  # 这将创建无标题任务或报错
```

### ✅ 推荐做法

1. **及时记录关键对话**
   ```javascript
   // 在每次重要决策后记录
   add_message({ role: "user", content: "决定使用 JWT 而不是 Session" })
   ```

2. **使用元数据标记重要信息**
   ```javascript
   add_message({
     role: "assistant",
     content: "API 端点已实现",
     metadata: {
       files: ["api/auth.ts"],
       status: "completed"
     }
   })
   ```

3. **定期查看线程历史**
   ```bash
   # 每次切换回线程时，查看历史上下文
   /thread switch <id>
   mcp__thread-manager__get_current_thread({ includeMessages: true })
   ```

### ❌ 避免的做法

1. **不要记录过于详细的代码内容** - 文件变更追踪已经处理了这部分
2. **不要重复记录相同信息** - 浪费存储空间
3. **不要在非活跃线程中添加消息** - 会抛出错误

## 技术细节

### 消息存储结构

```typescript
interface Message {
  id: string;              // UUID
  threadId: string;        // 所属线程ID
  role: 'user' | 'assistant' | 'system';
  content: string;         // 消息内容
  timestamp: Date;         // 创建时间
  metadata?: object;       // 自定义元数据
}
```

### 数据库关系

```
threads (1) ----> (N) messages
  - ON DELETE CASCADE: 删除线程时自动删除所有消息
  - messageCount 通过触发器自动更新
```

### 性能考虑

- 消息按时间倒序存储（最新的在前）
- 默认查询限制：50条消息
- 使用 `messageLimit` 参数控制返回数量
- 对于大量消息的线程，考虑分页查询

## 故障排除

### 问题：工具 `add_message` 不可用

**解决方案：**
1. 确认工具已编译：
   ```bash
   ls ~/.claude/skills/thread-manager/dist/tools/add-message.js
   ```

2. 重启 Claude Code 以重新加载 MCP 服务器

3. 验证工具已注册：
   ```bash
   # 在 Claude Code 中运行
   # 应该可以看到 mcp__thread-manager__add_message
   ```

### 问题：提示 "No active thread"

**解决方案：**
```bash
# 确保有一个活跃的线程
/threads  # 查看所有线程
/thread switch <thread-id>  # 切换到目标线程

# 或创建新线程
/thread new "My Task"
```

### 问题：messageCount 没有更新

**解决方案：**
- 确认使用的是 `add_message` 工具（而不是直接操作数据库）
- 检查数据库连接是否正常
- 查看日志输出是否有错误

## 下一步

现在消息记录功能已经就绪，您可以：

1. ✅ 为每个线程记录完整的对话历史
2. ✅ 在切换线程时恢复上下文
3. ✅ 分析对话模式和统计数据
4. ✅ 导出线程数据用于备份或分析

**立即尝试：**
```bash
# 1. 重启 Claude Code
# 2. 创建新线程
/thread new "Test Message Recording"

# 3. 添加测试消息（重启后工具将可用）
# 4. 查看结果
/threads  # 应该看到 messageCount > 0
```

---

**提示：** 如果您想自动记录所有对话，可以考虑创建一个 hook 来拦截用户输入和助手响应。详见高级配置文档。
