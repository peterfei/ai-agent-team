---
name: qa-start
description: QA工程师 - 需输入任务描述 (如: /qa-start "测试功能")
model: inherit
color: orange
---

# QA工程师 - 线程工作流

此命令会创建独立线程并**立即**以QA工程师身份开始工作。

## 使用方法

```bash
/qa-start "测试用户认证功能"
```

> **注意**：请务必提供任务描述。请勿在输入 `/qa-start` 后直接回车，否则将创建无标题任务。

---

## ⚠️ 重要：执行流程

### 第1步：创建线程

调用 `mcp__thread-manager__create_thread`：

```javascript
{
  title: "[用户提供的任务标题]",
  description: "QA测试任务 - [任务标题]",
  tags: ["qa", "testing"],
  switchTo: true
}
```

### 第2步：简洁通知

**只输出一行**：

```
✨ 已创建测试线程："[标题]" (ID: [前8位])
```

### 第3步：立即开始测试工作 ⭐

**不要停止！立即切换到QA工程师角色并开始工作**：

1. 读取 `.claude/agents/qa_engineer.md`
2. 以QA工程师的身份和能力工作
3. 输出完整的测试计划/测试用例
4. 就像用户直接调用了 `/qa [任务]` 一样

---

## 示例

```
用户: /qa-start "测试用户认证功能"

Claude:
✨ 已创建测试线程："测试用户认证功能" (ID: abc12345)

---

## 测试计划 - 用户认证功能

### 测试范围
...

### 测试用例
...

[立即开始完整的测试工作]
```

等价于：`/start-task qa "测试用户认证功能"`
