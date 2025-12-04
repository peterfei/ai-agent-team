---
name: start-task
description: 为任何角色创建独立线程并开始工作
model: inherit
color: green
---

# 统一任务启动命令

此命令为任何 AI Agent 角色创建独立的工作线程。

## 使用方法

```bash
/start-task <角色> "任务标题" [--desc "描述"]
```

### 支持的角色

| 角色代码 | 角色名称 | 标签 |
|---------|---------|------|
| `pm` | 产品经理 | product, pm |
| `fe` | 前端开发 | frontend, fe |
| `be` | 后端开发 | backend, be |
| `qa` | 测试工程师 | qa, testing |
| `ops` | DevOps工程师 | devops, ops |
| `tl` | 技术负责人 | tech-lead, tl |

## 执行流程

### 第1步：解析参数并创建线程

- `<角色>`: 从支持列表中识别角色
- `"任务标题"`: 提取任务标题作为线程标题
- `--desc`: 可选的详细描述

调用 `mcp__thread-manager__create_thread`：

```javascript
{
  title: "[角色名称] - [任务标题]",
  description: 描述（如果提供）,
  tags: 角色对应的标签,
  switchTo: true
}
```

### 第2步：简洁通知

**只输出一行**：

```
✨ 已创建[角色]线程："[标题]" (ID: [前8位])
```

### 第3步：立即开始工作 ⭐ **最重要**

**不要停止！立即切换到对应角色并开始工作**：

1. 根据角色读取对应的 agent prompt
   - `pm` → `.claude/agents/product_manager.md`
   - `be` → `.claude/agents/backend_dev.md`
   - `fe` → `.claude/agents/frontend_dev.md`
   - `qa` → `.claude/agents/qa_engineer.md`
   - `ops` → `.claude/agents/devops_engineer.md`
   - `tl` → `.claude/agents/tech_leader.md`

2. 以该角色的身份和能力工作

3. 输出完整的工作成果（需求文档/代码/测试等）

4. 就像用户直接调用了 `/[角色] [任务]` 一样

## 使用示例

### 产品经理任务

```bash
用户: /start-task pm "设计用户认证系统"

Claude:
✨ 已创建产品线程："产品经理 - 设计用户认证系统" (ID: abc12345)

---

## 产品需求分析 - 用户认证系统

### 执行摘要
...

[立即开始完整的产品分析工作]
```

### 后端开发任务

```bash
用户: /start-task be "实现JWT认证API" --desc "支持access token和refresh token"

Claude:
✨ 已创建后端线程："后端开发 - 实现JWT认证API" (ID: def67890)

---

## 后端技术方案 - JWT认证API

### 技术选型
...

[立即开始完整的后端开发工作]
```

### 前端开发任务

```bash
用户: /start-task fe "开发登录表单组件"

Claude:
✨ 已创建前端线程："前端开发 - 开发登录表单组件" (ID: ghi24680)

---

## 前端组件设计 - 登录表单

### 组件结构
...

[立即开始完整的前端开发工作]
```

## 工作流示例

### 完整产品开发流程

```bash
# 第1步：产品经理创建需求线程
用户: /start-task pm "用户认证系统需求分析"
Claude: [创建线程并返回启动命令]
用户: exit
$ clt abc123
用户在新会话: /pm "开始进行用户认证系统的需求分析"
产品经理: [在独立线程中进行需求分析...]

# 第2步：后端开发创建实现线程
用户: exit  # 退出产品经理线程
$ claude  # 回到主会话
用户: /start-task be "实现JWT认证API"
Claude: [创建新线程]
用户: exit
$ clt def456
用户在新会话: /be "根据产品需求实现JWT认证API"
后端开发: [在独立线程中开发...]

# 第3步：前端开发创建UI线程
用户: /start-task fe "开发登录UI组件"
Claude: [创建新线程]
用户: exit
$ clt ghi789
用户在新会话: /fe "开发与后端API对接的登录表单"
前端开发: [在独立线程中开发...]

# 第4步：QA测试
用户: /start-task qa "测试用户认证功能"
Claude: [创建新线程]
用户: exit
$ clt jkl012
用户在新会话: /qa "执行用户认证的完整测试"
QA工程师: [在独立线程中测试...]
```

## 实现细节

```javascript
// 伪代码示例
function handleStartTask(role, title, description) {
  // 1. 角色映射
  const roleMapping = {
    'pm': { name: '产品经理', tags: ['product', 'pm'] },
    'fe': { name: '前端开发', tags: ['frontend', 'fe'] },
    'be': { name: '后端开发', tags: ['backend', 'be'] },
    'qa': { name: 'QA工程师', tags: ['qa', 'testing'] },
    'ops': { name: 'DevOps工程师', tags: ['devops', 'ops'] },
    'tl': { name: '技术负责人', tags: ['tech-lead', 'tl'] }
  };

  const roleInfo = roleMapping[role];
  if (!roleInfo) {
    return "❌ 不支持的角色。支持的角色: pm, fe, be, qa, ops, tl";
  }

  // 2. 创建线程
  const result = mcp__thread-manager__create_thread({
    title: `${roleInfo.name} - ${title}`,
    description: description || `${roleInfo.name}任务 - ${title}`,
    tags: roleInfo.tags
  });

  // 3. 返回结果
  return result.message;  // 直接返回 thread-manager 的格式化消息
}
```

## 与角色快捷命令的对比

| 命令方式 | 线程隔离 | Git分支 | 适用场景 |
|---------|---------|---------|---------|
| `/pm "任务"` | ❌ 当前会话 | ❌ 当前分支 | 快速咨询、小任务 |
| `/pm-start "任务"` | ✅ 独立线程 | ✅ 独立分支 | 产品经理专用，完整任务 |
| `/start-task pm "任务"` | ✅ 独立线程 | ✅ 独立分支 | 通用方式，所有角色 |

## 最佳实践

### 1. 任务命名规范

```bash
# 好的命名
/start-task pm "设计用户认证系统"
/start-task be "实现JWT token刷新机制"
/start-task fe "开发响应式导航栏组件"

# 避免的命名
/start-task pm "做点事"  # 太模糊
/start-task be "fix"      # 不够描述性
```

### 2. 使用标签组织

```bash
# 通过标签过滤线程
/threads --tags backend
/threads --tags product,high-priority
```

### 3. 清晰的描述

```bash
/start-task be "实现支付API" --desc "集成支付宝和微信支付，支持订单创建、查询、退款"
```

### 4. 并行工作

```bash
# 终端1: 后端开发
$ clt abc123
/be "开发API..."

# 终端2: 前端开发
$ clt def456
/fe "开发UI..."

# 终端3: 测试
$ clt ghi789
/qa "执行测试..."
```

## 注意事项

- ✅ 此命令只创建线程，不执行实际工作
- ✅ 需要在新会话中调用对应的角色命令（如 `/pm`, `/be`）
- ✅ 每个线程有独立的对话历史和 Git 分支
- ✅ 可以同时在多个终端中并行工作
- ⚠️ 创建线程后需要执行 `exit` + `claude --session-id xxx` 完全隔离上下文
