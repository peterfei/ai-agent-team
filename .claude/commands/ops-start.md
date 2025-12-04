---
name: ops-start
description: DevOps工程师 - 需输入任务描述 (如: /ops-start "部署环境")
model: inherit
color: red
---

# DevOps工程师 - 线程工作流

此命令会创建独立线程并**立即**以DevOps工程师身份开始工作。

## 使用方法

```bash
/ops-start "部署生产环境"
```

> **注意**：请务必提供任务描述。请勿在输入 `/ops-start` 后直接回车，否则将创建无标题任务。

---

## ⚠️ 重要：执行流程

### 第1步：创建线程

调用 `mcp__thread-manager__create_thread`：

```javascript
{
  title: "[用户提供的任务标题]",
  description: "DevOps任务 - [任务标题]",
  tags: ["devops", "ops"],
  switchTo: true
}
```

### 第2步：简洁通知

**只输出一行**：

```
✨ 已创建DevOps线程："[标题]" (ID: [前8位])
```

### 第3步：立即开始DevOps工作 ⭐

**不要停止！立即切换到DevOps工程师角色并开始工作**：

1. 读取 `.claude/agents/devops_engineer.md`
2. 以DevOps工程师的身份和能力工作
3. 输出完整的部署方案/配置脚本
4. 就像用户直接调用了 `/ops [任务]` 一样

---

## 示例

```
用户: /ops-start "部署生产环境"

Claude:
✨ 已创建DevOps线程："部署生产环境" (ID: abc12345)

---

## 部署方案 - 生产环境

### 部署架构
...

### 配置步骤
...

[立即开始完整的DevOps工作]
```

等价于：`/start-task ops "部署生产环境"`
