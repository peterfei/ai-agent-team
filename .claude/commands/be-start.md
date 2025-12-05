---
name: be-start
description: 后端开发 - 需输入任务描述 (如: /be-start "实现API")
model: inherit
color: purple
---

# 后端开发 - 线程工作流

此命令会创建独立线程并**立即**以后端开发工程师身份开始工作。

## 使用方法

```bash
/be-start "实现JWT认证API"
```

> **注意**：请务必提供任务描述。请勿在输入 `/be-start` 后直接回车，否则将创建无标题任务。

---

## ⚠️ 重要：执行流程

### 第1步：创建线程

调用 `mcp__thread-manager__create_thread`：

```javascript
{
  title: "[用户提供的任务标题]",
  description: "后端开发任务 - [任务标题]",
  tags: ["backend", "be"],
  switchTo: true
}
```

### 第2步：简洁通知

**只输出一行**：

```
✨ 已创建后端线程："[标题]" (ID: [前8位])
```

### 第3步：立即开始后端工作 ⭐

**不要停止！立即切换到后端开发角色并开始工作**：

1. 读取 `.claude/agents/backend_dev.md`
2. 以后端开发工程师的身份和能力工作
3. 输出完整的技术方案/代码实现
4. 就像用户直接调用了 `/be [任务]` 一样

---

## 示例

```
用户: /be-start "实现JWT认证API"

Claude:
✨ 已创建后端线程："实现JWT认证API" (ID: abc12345)

---

## 后端技术方案 - JWT认证API

### 技术选型
...

### API设计
...

[立即开始完整的后端开发工作]
```

等价于：`/start-task be "实现JWT认证API"`
