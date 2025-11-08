# AI Agent Team - 原生Claude Code使用指南

## 🚀 快速开始

### 直接调用Agent
```bash
# 使用agent命令直接调用
claude -p "/agent product_manager \"设计用户登录认证系统\""

# 或者使用快捷CLI
./.claude/agents/cli.sh 产品 \"设计用户登录认证系统\""
```

### 5大核心Agent

1. **产品经理** (`product_manager`)
   - 职责: 产品规划、需求分析、用户研究
   - 使用: `/agent product_manager "设计新功能需求"`

2. **前端开发** (`frontend_dev`)
   - 职责: UI实现、交互开发、性能优化
   - 使用: `/agent frontend_dev "创建响应式登录页面"`

3. **后端开发** (`backend_dev`)
   - 职责: API开发、数据库设计、系统集成
   - 使用: `/agent backend_dev "实现JWT认证API"`

4. **测试工程师** (`qa_engineer`)
   - 职责: 功能测试、自动化测试、质量保障
   - 使用: `/agent qa_engineer "设计登录功能测试用例"`

5. **DevOps工程师** (`devops_engineer`)
   - 职责: 部署运维、CI/CD、监控告警
   - 使用: `/agent devops_engineer "配置生产环境部署"`

## 🎯 实际工作流程示例

### 1. 产品规划阶段
```bash
# 产品经理分析需求
claude -p "/agent product_manager \"分析用户认证系统需求，包括功能规格、用户故事和验收标准\""

# 输出将包括:
# - 业务目标分析
# - 用户需求整理
# - 功能规格说明
# - 技术可行性评估
# - 实施路线图
```

### 2. 开发实现阶段
```bash
# 后端开发API
claude -p "/agent backend_dev \"基于需求分析，实现JWT认证API，包括登录、注册、token刷新功能\""

# 前端开发UI
claude -p "/agent frontend_dev \"创建React登录组件，包含表单验证、错误处理和响应式设计\""
```

### 3. 质量保证阶段
```bash
# 测试工程师设计测试
claude -p "/agent qa_engineer \"设计完整的用户认证系统测试用例，包括功能测试、边界测试和错误处理测试\""

# 执行测试并报告问题
claude -p "/agent qa_engineer \"执行登录功能的自动化测试，使用Jest和Cypress进行端到端测试\""
```

### 4. 部署运维阶段
```bash
# DevOps配置部署
claude -p "/agent devops_engineer \"配置用户认证系统的生产环境部署，包括Docker容器化、CI/CD流水线和监控告警\""
```

## 📋 快捷命令对照表

| 命令 | Agent | 中文 | 用途 |
|-----|-------|------|------|
| `pm` | product_manager | 产品经理 | 产品规划、需求分析 |
| `fe` | frontend_dev | 前端开发 | UI实现、交互开发 |
| `be` | backend_dev | 后端开发 | API开发、系统集成 |
| `qa` | qa_engineer | 测试工程师 | 功能测试、质量保障 |
| `ops` | devops_engineer | DevOps工程师 | 部署运维、监控管理 |

## 🔄 完整工作流程

### 产品开发工作流
```bash
# 1. 产品需求分析
./.claude/agents/cli.sh pm "设计用户认证系统需求规格"

# 2. 后端API开发
./.claude/agents/cli.sh be "实现JWT认证API接口"

# 3. 前端UI开发
./.claude/agents/cli.sh fe "创建React登录页面组件"

# 4. 功能测试验证
./.claude/agents/cli.sh qa "设计用户认证系统测试用例"

# 5. 生产环境部署
./.claude/agents/cli.sh ops "配置认证系统生产环境部署"
```

### 并行开发模式
```bash
# 前后端并行开发
claude -p "/agent backend_dev \"实现用户管理API\"" &
claude -p "/agent frontend_dev \"创建用户管理界面\"" &
wait

# 测试集成
claude -p "/agent qa_engineer \"测试用户管理完整功能\""
```

## 🛠️ 高级用法

### 复杂任务分解
```bash
# 大型功能分解为多个子任务
claude -p "/agent product_manager \"将电商系统设计分解为用户管理、商品管理、订单处理、支付系统等模块的需求规格\""

# 每个模块分别开发
for module in "用户管理" "商品管理" "订单处理" "支付系统"; do
    claude -p "/agent backend_dev \"实现${module}模块的API接口\""
    claude -p "/agent frontend_dev \"创建${module}模块的管理界面\""
done
```

### 代码审查和质量检查
```bash
# 交叉审查
claude -p "/agent backend_dev \"审查前端用户认证实现的安全性和API设计合理性\""
claude -p "/agent frontend_dev \"审查后端认证API的接口设计和错误处理机制\""
```

### 性能优化
```bash
# 性能分析和优化
claude -p "/agent backend_dev \"分析用户认证系统的性能瓶颈，并提供优化建议\""
claude -p "/agent devops_engineer \"配置用户认证系统的性能监控和告警规则\""
```

## 📊 团队状态监控

虽然原生agent没有集中的状态管理，但可以通过查询了解整体情况：

```bash
# 检查最近的活动
echo "最近调用的Agent活动:"
grep -r "agent" ~/.claude/history/ | tail -10

# 统计agent使用频率
for agent in product_manager frontend_dev backend_dev qa_engineer devops_engineer; do
    count=$(grep -c "$agent" ~/.claude/history/* 2>/dev/null || echo 0)
    echo "$agent: $count 次"
done
```

## 🎭 实际演示

### 创建一个完整的用户认证系统

```bash
#!/bin/bash
# 完整演示脚本

echo "🚀 开始用户认证系统开发"

# 1. 需求分析
echo "📋 产品需求分析..."
claude -p "/agent product_manager \"设计完整的用户认证系统，包括注册、登录、密码重置、邮箱验证、JWT token管理等功能的需求规格、用户故事和验收标准\""

# 2. 后端开发
echo "🔧 后端API开发..."
claude -p "/agent backend_dev \"基于需求分析，实现用户认证系统的后端API，包括用户注册、登录、JWT token生成与验证、密码重置、邮箱验证等功能的RESTful API，使用Node.js和Express框架\""

# 3. 前端开发
echo "🎨 前端UI开发..."
claude -p "/agent frontend_dev \"创建用户认证系统的前端界面，包括登录表单、注册表单、密码重置页面、邮箱验证页面等React组件，实现响应式设计和表单验证\""

# 4. 质量保证
echo "🧪 系统测试..."
claude -p "/agent qa_engineer \"设计用户认证系统的完整测试方案，包括单元测试、集成测试、端到端测试、安全测试和性能测试，确保系统的功能完整性和质量\""

# 5. 部署运维
echo "🚀 生产部署..."
claude -p "/agent devops_engineer \"配置用户认证系统的生产环境部署，包括Docker容器化、CI/CD流水线、监控告警、日志收集和安全加固\""

echo "✅ 用户认证系统开发完成！"
```

## 🔧 故障排除

### Agent无响应
```bash
# 检查Claude Code状态
claude --version

# 验证agent定义文件是否存在
ls -la .claude/prompts/

# 测试基础功能
echo "test" | claude -p "respond with OK"
```

### 任务结果不符合预期
```bash
# 提供更详细的上下文
claude -p "/agent product_manager \"基于以下上下文设计需求：我们正在开发一个SaaS平台，目标用户是中小企业，需要多租户架构，支持团队协作功能...\""

# 分步骤细化任务
claude -p "/agent backend_dev \"第一步：先实现基础的用户注册API，包括邮箱验证和密码加密存储\""
claude -p "/agent backend_dev \"第二步：在用户注册基础上，添加JWT token生成功能\""
```

### 性能问题
```bash
# 优化查询和响应
claude -p "/agent backend_dev \"优化数据库查询，添加适当的索引，实现Redis缓存，确保API响应时间在200ms以内\""

# 前端性能优化
claude -p "/agent frontend_dev \"优化React组件性能，实现代码分割，添加图片懒加载，确保首屏加载时间小于3秒\""
```

## 📈 最佳实践

### 1. 清晰的任务描述
```bash
# 好的示例
claude -p "/agent frontend_dev \"创建一个React登录组件，包含邮箱和密码输入框，实现客户端验证，支持记住我功能，使用Tailwind CSS进行样式设计\""

# 避免模糊描述
claude -p "/agent frontend_dev \"做个登录页面\""
```

### 2. 提供上下文信息
```bash
# 包含项目背景
claude -p "/agent backend_dev \"基于我们现有的Express.js用户管理系统，添加OAuth2集成功能，支持Google和GitHub登录，需要与现有的JWT token系统兼容\""
```

### 3. 迭代式开发
```bash
# 分阶段实现
claude -p "/agent product_manager \"第一阶段：设计最小可行产品(MVP)的用户认证功能\""
claude -p "/agent backend_dev \"第一阶段：实现基础的用户注册和登录API\""
claude -p "/agent frontend_dev \"第一阶段：创建简单的登录和注册表单\""

# 然后逐步添加高级功能
```

### 4. 跨团队协作
```bash
# 让不同agent了解彼此的工作
claude -p "/agent frontend_dev \"基于产品经理的需求文档和后端API设计，创建用户认证界面，确保API调用格式正确\""

# 测试时考虑完整集成
claude -p "/agent qa_engineer \"测试前端认证界面与后端API的完整集成，包括成功登录、错误处理、网络异常等场景\""
```

---

**🎯 现在您拥有了一个完整的AI Agent团队，每个成员都可以通过原生Claude Code命令直接调用，实现真正的24/7智能协作开发！**""","file_path":".claude/USAGE.md