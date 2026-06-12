# AI Agent Team v2.1.0 发布说明

很高兴宣布 **AI Agent Team v2.1.0** 正式发布！这个版本聚焦于 **AI 智能体的结构化决策能力** 升级，借鉴业界最佳实践，为所有 7 个技能和智能体注入了清晰的决策树思维框架。

## 🌟 核心亮点

### 1. 🧭 决策树架构 (Decision Tree)

每个 Agent 和 Skill 现在都内置了 **"Pick a branch" 决策树**，让 AI 接到任务时能自动路由到正确的工作模式：

| Agent | 决策分支 |
|-------|---------|
| **全栈开发** | BUILD / EXTEND / DEBUG |
| **技术负责人** | ADR / REVIEW / PLAN / GUIDE |
| **产品经理** | PRD / ANALYSIS / ROADMAP / RESEARCH |
| **前端开发** | COMPONENT / PAGE / OPTIMIZE / FIX |
| **后端开发** | API / SCHEMA / AUTH / OPTIMIZE |
| **QA 工程师** | PLAN / CASES / BUG / AUTOMATE |
| **DevOps 工程师** | PIPELINE / INFRA / OBSERVE / DOCKER |

选择错误路径会浪费整个任务。模糊时默认使用最通用的模式，并在方案顶部明确说明假设。

### 2. 📋 通用规则体系 (Universal Rules)

每个角色新增 5 条**跨分支通用规则**，确保无论走哪条路径，输出质量始终在线。例如全栈开发的规则：

1. **API 契约先行** — 先定义类型接口，再实现前后端
2. **类型安全贯穿全栈** — shared types，改一端必须更新另一端
3. **全链路错误处理** — DB→API→Service→UI 每层有兜底
4. **集成即验证** — 联调不是最后一步，而是每个里程碑的环节
5. **一条命令启动全栈** — docker-compose / pnpm dev / turbo dev

### 3. ✅ 完成检查清单 (When Done)

每个任务结束时，通过 5-7 个检查问题确保产出物完整可交付。例如技术负责人需要确认：
- 决策理由是否记录到 ADR？
- 风险应对是否有 owner 和时间表？
- 技术债务项是否量化了修复成本？
- 严重问题是否确认了修复计划？

### 4. 🔁 跨运行时同步

所有 7 个 Agent 的 SKILL.md 均同步更新了对应的 Agent 文件（`.claude/agents/*.md`），确保在 Claude Code 的 `/agent` 和 `/tl` `/pm` `/fe` 等快捷命令下都能获得一致的决策树指引。

### 5. 📦 独立可安装的 Agent Skills

7 个 Agent Skill 已发布为独立仓库，可通过 `npx skills install` 安装到任意项目中，无需安装整个 `ai-agent-team` 包：

| Skill | 安装方式 |
|-------|---------|
| **全栈开发** | `npx skills install peterfei/ai-agent-fullstack-engineer` |
| **技术负责人** | `npx skills install peterfei/ai-agent-tech-leader` |
| **产品经理** | `npx skills install peterfei/ai-agent-product-manager` |
| **前端开发** | `npx skills install peterfei/ai-agent-frontend-dev` |
| **后端开发** | `npx skills install peterfei/ai-agent-backend-dev` |
| **QA 工程师** | `npx skills install peterfei/ai-agent-qa-engineer` |
| **DevOps 工程师** | `npx skills install peterfei/ai-agent-devops-engineer` |

兼容 Claude Code / Cursor / Codex CLI / Gemini CLI / Windsurf 等 50+ 运行时，每份 Skill 均内含多运行时的配置模板，一条命令即可接入。

---

## 📈 成果

| 维度 | 之前 | v2.1.0 |
|------|------|--------|
| **任务路由准确度** | 依赖隐式理解 | **显式决策树引导** |
| **输出一致性** | 每次可能不同 | **5 条硬规则约束** |
| **交付完整性** | 容易遗漏 | **完成检查清单兜底** |
| **代码变更** | — | **14 个文件，+408 行** |

## 🚀 如何升级

```bash
npm install -g ai-agent-team@2.1.0
ai-agent-team init
```

感谢您选择 AI Agent Team！我们持续致力于让 AI 智能体的行为更可信、输出更可靠。
