# OpenSpec: changelog-generator - 智能变更日志生成器

**版本**: 1.0.0
**状态**: Proposal
**创建日期**: 2025-12-03
**作者**: Peter Fei

---

## 📋 目录

- [概述](#概述)
- [价值主张](#价值主张)
- [功能规格](#功能规格)
- [技术设计](#技术设计)
- [用户场景](#用户场景)
- [实现路线图](#实现路线图)
- [技术栈](#技术栈)
- [测试计划](#测试计划)
- [安全考虑](#安全考虑)
- [最佳实践](#最佳实践)

---

## 概述

### 产品定位

**changelog-generator** 是一个智能的变更日志生成工具，通过分析 Git 提交历史、PR 信息和代码变更，自动生成符合规范的 CHANGELOG.md 文件。

### 核心功能

- 🔍 智能分析 Git 提交历史
- 📝 自动生成规范的 CHANGELOG.md
- 🏷️ 智能分类（Features, Fixes, Breaking Changes 等）
- 🔢 语义化版本管理支持
- 🌐 多语言支持（中文/英文）
- 🎨 多种输出格式（Markdown, HTML, JSON）
- 🔗 集成 GitHub/GitLab Release Notes
- 📊 生成统计报告

---

## 价值主张

### 解决的痛点

1. **手动编写变更日志耗时** - 每次发版需要回顾所有提交
2. **格式不统一** - 团队成员写法各异，缺乏规范
3. **信息遗漏** - 容易遗漏重要变更
4. **难以追溯** - 历史变更缺乏清晰记录
5. **多语言维护困难** - 需要维护中英文两个版本

### 核心价值

- ⏱️ **节省时间** - 自动化生成，从 30 分钟缩短到 30 秒
- 📐 **统一规范** - 遵循 Keep a Changelog 和 Conventional Commits 标准
- 🎯 **准确完整** - 不遗漏任何重要变更
- 🔄 **持续更新** - 支持增量更新，不影响历史记录
- 🌍 **国际化友好** - 一键生成多语言版本

### 目标用户

- **开源项目维护者** - 需要规范的变更日志
- **企业开发团队** - 需要标准化的发版流程
- **产品经理** - 需要清晰的功能迭代记录
- **技术文档编写者** - 需要生成 Release Notes

---

## 功能规格

### 1. 核心功能模块

#### 1.1 Git 提交分析

**功能描述**: 智能分析 Git 提交历史，提取关键信息

**输入**:
- Git 仓库路径
- 起始版本标签（可选）
- 结束版本标签（可选）
- 时间范围（可选）

**处理逻辑**:
```javascript
// 提取提交信息
commits = getCommits(fromTag, toTag)

// 解析提交格式
for (commit of commits) {
  type = parseCommitType(commit.message)  // feat, fix, docs, etc.
  scope = parseCommitScope(commit.message)
  description = parseCommitDescription(commit.message)
  breakingChanges = parseBreakingChanges(commit.message)

  // 关联 PR 信息
  prInfo = fetchPRInfo(commit.hash)

  // 关联 Issue 信息
  issues = extractIssueNumbers(commit.message)
}
```

**输出**:
- 结构化的提交数据
- 提交分类统计
- 关联的 PR 和 Issue 信息

#### 1.2 智能分类

**功能描述**: 根据 Conventional Commits 规范自动分类变更

**分类规则**:

| 类型 | 显示名称 | 描述 |
|-----|---------|------|
| `feat` | ✨ Features | 新功能 |
| `fix` | 🐛 Bug Fixes | 错误修复 |
| `docs` | 📝 Documentation | 文档更新 |
| `style` | 💄 Styles | 代码格式调整 |
| `refactor` | ♻️ Code Refactoring | 代码重构 |
| `perf` | ⚡ Performance | 性能优化 |
| `test` | ✅ Tests | 测试相关 |
| `build` | 📦 Build System | 构建系统 |
| `ci` | 👷 CI/CD | CI/CD 配置 |
| `chore` | 🔧 Chores | 其他杂项 |
| `revert` | ⏪ Reverts | 回滚 |
| `breaking` | 💥 BREAKING CHANGES | 破坏性变更 |

**智能识别**:
- 支持自定义 commit 格式
- 支持多语言 commit message
- 自动识别破坏性变更
- 智能合并相似提交

#### 1.3 CHANGELOG 生成

**功能描述**: 生成符合规范的 CHANGELOG.md 文件

**模板结构**:
```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [版本号] - YYYY-MM-DD

### ✨ Features
- feat(scope): description (#PR)

### 🐛 Bug Fixes
- fix(scope): description (#PR)

### 💥 BREAKING CHANGES
- breaking: description

### 📝 Documentation
- docs: description

### ⚡ Performance
- perf: description

### ♻️ Code Refactoring
- refactor: description

### ✅ Tests
- test: description

### 🔧 Chores
- chore: description
```

**配置选项**:
```json
{
  "format": "keepachangelog",  // 或 "custom"
  "language": "zh-CN",  // 或 "en-US"
  "emoji": true,  // 是否使用 emoji
  "groupByType": true,  // 按类型分组
  "linkPR": true,  // 链接 PR
  "linkIssue": true,  // 链接 Issue
  "linkCommit": true,  // 链接 Commit
  "includeAuthors": true,  // 包含作者信息
  "excludeTypes": ["chore", "style"]  // 排除的类型
}
```

#### 1.4 版本管理

**功能描述**: 支持语义化版本管理

**版本号生成规则**:
```javascript
function determineNextVersion(commits, currentVersion) {
  hasBreakingChange = commits.some(c => c.isBreaking)
  hasFeature = commits.some(c => c.type === 'feat')
  hasFix = commits.some(c => c.type === 'fix')

  if (hasBreakingChange) {
    return incrementMajor(currentVersion)  // 1.0.0 -> 2.0.0
  } else if (hasFeature) {
    return incrementMinor(currentVersion)  // 1.0.0 -> 1.1.0
  } else if (hasFix) {
    return incrementPatch(currentVersion)  // 1.0.0 -> 1.0.1
  }

  return currentVersion
}
```

**手动覆盖**:
- 允许用户手动指定版本号
- 支持预发布版本（alpha, beta, rc）
- 支持构建元数据

#### 1.5 多格式输出

**支持格式**:

1. **Markdown** (默认)
   - 标准 CHANGELOG.md
   - 适合 GitHub/GitLab

2. **HTML**
   - 美观的网页版本
   - 支持搜索和过滤
   - 适合内部文档站点

3. **JSON**
   - 结构化数据
   - 适合程序化处理
   - 支持 API 集成

4. **PDF**
   - 适合归档和打印
   - 包含完整的格式化

**示例配置**:
```bash
# 生成多种格式
changelog-generate --output-formats md,html,json,pdf
```

### 2. 高级功能

#### 2.1 增量更新

**功能描述**: 支持增量更新 CHANGELOG，不覆盖历史记录

**实现逻辑**:
```javascript
function updateChangelog(existingChangelog, newChanges) {
  // 1. 解析现有 CHANGELOG
  parsed = parseExistingChangelog(existingChangelog)

  // 2. 检查 [Unreleased] 区域
  unreleased = parsed.sections.find(s => s.version === 'Unreleased')

  // 3. 添加新变更到 [Unreleased]
  unreleased.changes.push(...newChanges)

  // 4. 保持历史版本不变
  return generateChangelog(parsed)
}
```

#### 2.2 发布版本

**功能描述**: 将 [Unreleased] 的变更转换为正式版本

**命令**:
```bash
# 自动确定版本号
changelog-generate release

# 手动指定版本号
changelog-generate release --version 2.0.0

# 预发布版本
changelog-generate release --version 2.0.0-beta.1
```

**处理流程**:
1. 读取 [Unreleased] 区域的变更
2. 根据规则确定新版本号
3. 创建新的版本区域
4. 添加发布日期
5. 清空 [Unreleased] 区域
6. 更新版本链接

#### 2.3 自定义模板

**功能描述**: 支持自定义 CHANGELOG 模板

**模板引擎**: Handlebars

**模板变量**:
```handlebars
{{#each versions}}
## [{{version}}] - {{date}}

{{#if breakingChanges}}
### 💥 BREAKING CHANGES
{{#each breakingChanges}}
- {{description}} {{#if pr}}(#{{pr}}){{/if}}
{{/each}}
{{/if}}

{{#each categories}}
### {{emoji}} {{title}}
{{#each commits}}
- {{scope}}: {{description}} {{#if pr}}(#{{pr}}){{/if}} {{#if author}}by @{{author}}{{/if}}
{{/each}}
{{/each}}

{{/each}}
```

**自定义配置**:
```json
{
  "templatePath": "./custom-template.hbs",
  "categories": [
    {
      "type": "feat",
      "title": "新功能",
      "emoji": "✨"
    },
    {
      "type": "fix",
      "title": "缺陷修复",
      "emoji": "🐛"
    }
  ]
}
```

#### 2.4 GitHub/GitLab 集成

**功能描述**: 与 GitHub/GitLab 深度集成

**GitHub Release**:
```bash
# 生成并创建 GitHub Release
changelog-generate release --create-github-release

# 上传到现有 Release
changelog-generate release --update-github-release v2.0.0
```

**GitLab Release**:
```bash
# 生成并创建 GitLab Release
changelog-generate release --create-gitlab-release
```

**集成功能**:
- 自动获取 PR 标题和描述
- 链接到 PR 和 Issue
- 获取 PR 标签（bug, feature, enhancement 等）
- 识别 PR 作者
- 支持 GitHub Actions / GitLab CI 自动化

#### 2.5 配置管理

**配置文件**: `.changelogrc.json`

**完整配置示例**:
```json
{
  "version": "1.0.0",
  "format": "keepachangelog",
  "language": "zh-CN",
  "outputFormats": ["md", "html"],

  "git": {
    "remoteUrl": "https://github.com/user/repo",
    "compareUrlFormat": "https://github.com/user/repo/compare/{{previousTag}}...{{currentTag}}"
  },

  "display": {
    "emoji": true,
    "groupByType": true,
    "showAuthor": true,
    "showPR": true,
    "showIssue": true,
    "showCommitHash": false
  },

  "types": [
    { "type": "feat", "section": "Features", "emoji": "✨" },
    { "type": "fix", "section": "Bug Fixes", "emoji": "🐛" },
    { "type": "docs", "section": "Documentation", "emoji": "📝" },
    { "type": "style", "hidden": true },
    { "type": "refactor", "section": "Code Refactoring", "emoji": "♻️" },
    { "type": "perf", "section": "Performance", "emoji": "⚡" },
    { "type": "test", "section": "Tests", "emoji": "✅" },
    { "type": "build", "section": "Build System", "emoji": "📦" },
    { "type": "ci", "section": "CI/CD", "emoji": "👷" },
    { "type": "chore", "hidden": true }
  ],

  "template": {
    "path": null,
    "header": "# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n",
    "commitUrl": "https://github.com/user/repo/commit/{{hash}}",
    "compareUrl": "https://github.com/user/repo/compare/{{previousTag}}...{{currentTag}}",
    "issueUrl": "https://github.com/user/repo/issues/{{id}}",
    "prUrl": "https://github.com/user/repo/pull/{{id}}"
  },

  "release": {
    "autoVersion": true,
    "versionPrefix": "v",
    "createGitTag": true,
    "pushTag": true,
    "createGithubRelease": false,
    "draftRelease": false
  },

  "exclude": {
    "types": ["style", "chore"],
    "scopes": ["deps"],
    "commits": ["^chore\\(release\\):"]
  }
}
```

---

## 技术设计

### 系统架构

```
┌─────────────────────────────────────────────────────────┐
│                    CLI Interface                        │
│         (commander, inquirer, chalk)                    │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                  Core Engine                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Git Analyzer │  │ Classifier   │  │ Version Mgr  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                Data Processing Layer                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Parser       │  │ Transformer  │  │ Generator    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                Integration Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ GitHub API   │  │ GitLab API   │  │ File System  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 核心模块设计

#### 1. Git Analyzer Module

**职责**: 分析 Git 提交历史

**主要类/函数**:
```javascript
class GitAnalyzer {
  constructor(repoPath) {
    this.repo = new GitRepository(repoPath)
  }

  // 获取提交列表
  async getCommits(fromTag, toTag) {
    const commits = await this.repo.log({
      from: fromTag,
      to: toTag || 'HEAD'
    })
    return commits
  }

  // 解析提交消息
  parseCommitMessage(message) {
    // 使用 conventional-commits-parser
    const parsed = conventionalCommitsParser.sync(message)
    return {
      type: parsed.type,
      scope: parsed.scope,
      subject: parsed.subject,
      body: parsed.body,
      footer: parsed.footer,
      breaking: parsed.notes.filter(n => n.title === 'BREAKING CHANGE'),
      references: parsed.references  // PR, Issue 引用
    }
  }

  // 获取标签列表
  async getTags() {
    return await this.repo.tags()
  }

  // 获取当前版本
  async getCurrentVersion() {
    const tags = await this.getTags()
    return semver.maxSatisfying(tags.all, '*')
  }
}
```

#### 2. Classifier Module

**职责**: 分类和组织提交

**主要类/函数**:
```javascript
class CommitClassifier {
  constructor(config) {
    this.config = config
    this.categories = config.types
  }

  // 分类提交
  classify(commits) {
    const classified = {}

    for (const commit of commits) {
      const category = this.determineCategory(commit)

      if (!classified[category]) {
        classified[category] = []
      }

      classified[category].push(commit)
    }

    return classified
  }

  // 确定分类
  determineCategory(commit) {
    const categoryConfig = this.categories.find(c => c.type === commit.type)

    if (categoryConfig && categoryConfig.hidden) {
      return null  // 隐藏此类型
    }

    return categoryConfig ? categoryConfig.section : 'Other'
  }

  // 合并相似提交
  mergeSimilarCommits(commits) {
    // 实现智能合并逻辑
  }

  // 排序
  sortCommits(commits) {
    // 按重要性和时间排序
  }
}
```

#### 3. Version Manager Module

**职责**: 管理版本号

**主要类/函数**:
```javascript
class VersionManager {
  constructor(config) {
    this.config = config
  }

  // 确定下一个版本号
  determineNextVersion(commits, currentVersion) {
    if (this.config.release.autoVersion === false) {
      return null  // 需要手动指定
    }

    const hasBreaking = commits.some(c => c.breaking.length > 0)
    const hasFeature = commits.some(c => c.type === 'feat')
    const hasFix = commits.some(c => c.type === 'fix')

    if (hasBreaking) {
      return semver.inc(currentVersion, 'major')
    } else if (hasFeature) {
      return semver.inc(currentVersion, 'minor')
    } else if (hasFix) {
      return semver.inc(currentVersion, 'patch')
    }

    return currentVersion
  }

  // 创建 Git 标签
  async createTag(version, message) {
    const tagName = this.config.release.versionPrefix + version
    await this.git.tag([tagName, '-a', '-m', message])

    if (this.config.release.pushTag) {
      await this.git.push(['origin', tagName])
    }
  }
}
```

#### 4. Generator Module

**职责**: 生成 CHANGELOG 文件

**主要类/函数**:
```javascript
class ChangelogGenerator {
  constructor(config) {
    this.config = config
    this.template = this.loadTemplate()
  }

  // 加载模板
  loadTemplate() {
    if (this.config.template.path) {
      return fs.readFileSync(this.config.template.path, 'utf-8')
    }
    return this.getDefaultTemplate()
  }

  // 生成 CHANGELOG
  generate(data) {
    const template = Handlebars.compile(this.template)
    const markdown = template(data)
    return markdown
  }

  // 增量更新
  async updateExisting(newChanges) {
    const existing = await this.readExistingChangelog()
    const updated = this.mergeChanges(existing, newChanges)
    return this.generate(updated)
  }

  // 发布新版本
  async releaseVersion(version) {
    const changelog = await this.readExistingChangelog()

    // 将 Unreleased 转换为版本区域
    const unreleased = changelog.versions.find(v => v.version === 'Unreleased')

    if (unreleased && unreleased.changes.length > 0) {
      changelog.versions.splice(1, 0, {
        version: version,
        date: new Date().toISOString().split('T')[0],
        changes: unreleased.changes
      })

      // 清空 Unreleased
      unreleased.changes = []
    }

    return this.generate(changelog)
  }

  // 导出多格式
  async exportToFormats(data, formats) {
    const exports = {}

    for (const format of formats) {
      switch (format) {
        case 'md':
          exports.md = this.generate(data)
          break
        case 'html':
          exports.html = this.generateHTML(data)
          break
        case 'json':
          exports.json = JSON.stringify(data, null, 2)
          break
        case 'pdf':
          exports.pdf = await this.generatePDF(data)
          break
      }
    }

    return exports
  }
}
```

#### 5. GitHub/GitLab Integration Module

**职责**: 与代码托管平台集成

**主要类/函数**:
```javascript
class GitHubIntegration {
  constructor(token) {
    this.octokit = new Octokit({ auth: token })
  }

  // 获取 PR 信息
  async getPRInfo(owner, repo, prNumber) {
    const { data } = await this.octokit.pulls.get({
      owner,
      repo,
      pull_number: prNumber
    })

    return {
      number: data.number,
      title: data.title,
      body: data.body,
      labels: data.labels.map(l => l.name),
      author: data.user.login,
      mergedAt: data.merged_at
    }
  }

  // 创建 Release
  async createRelease(owner, repo, version, changelog) {
    const { data } = await this.octokit.repos.createRelease({
      owner,
      repo,
      tag_name: version,
      name: version,
      body: changelog,
      draft: this.config.release.draftRelease
    })

    return data
  }

  // 从提交消息中提取 PR 号
  extractPRNumber(message) {
    const match = message.match(/#(\d+)/)
    return match ? parseInt(match[1]) : null
  }
}
```

### 数据流

```
1. 用户输入
   ↓
2. Git Analyzer: 读取提交历史
   ↓
3. Parser: 解析提交消息
   ↓
4. Classifier: 分类和组织
   ↓
5. Version Manager: 确定版本号
   ↓
6. Generator: 生成 CHANGELOG
   ↓
7. Integration: 发布到平台（可选）
   ↓
8. File System: 保存文件
```

### 文件结构

```
changelog-generator/
├── bin/
│   └── changelog-generate.js       # CLI 入口
├── src/
│   ├── core/
│   │   ├── GitAnalyzer.js          # Git 分析器
│   │   ├── CommitClassifier.js     # 提交分类器
│   │   ├── VersionManager.js       # 版本管理器
│   │   └── ChangelogGenerator.js   # CHANGELOG 生成器
│   ├── parsers/
│   │   ├── ConventionalCommitParser.js
│   │   ├── ChangelogParser.js
│   │   └── ConfigParser.js
│   ├── integrations/
│   │   ├── GitHubIntegration.js
│   │   ├── GitLabIntegration.js
│   │   └── BitbucketIntegration.js
│   ├── templates/
│   │   ├── default.hbs
│   │   ├── keepachangelog.hbs
│   │   └── angular.hbs
│   ├── exporters/
│   │   ├── MarkdownExporter.js
│   │   ├── HTMLExporter.js
│   │   ├── JSONExporter.js
│   │   └── PDFExporter.js
│   └── utils/
│       ├── gitUtils.js
│       ├── semverUtils.js
│       └── fileUtils.js
├── templates/
│   └── html/
│       └── changelog.html
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── docs/
│   ├── API.md
│   ├── CONFIGURATION.md
│   └── TEMPLATES.md
├── package.json
├── README.md
└── .changelogrc.json               # 默认配置
```

---

## 用户场景

### 场景 1: 首次生成 CHANGELOG

**用户**: 开源项目维护者，项目已有多个提交但没有 CHANGELOG

**步骤**:
```bash
# 1. 安装 skill
cd ~/.claude/skills
git clone https://github.com/username/changelog-generator.git

# 2. 进入项目目录
cd ~/my-project

# 3. 初始化配置
changelog-generate init

# 4. 生成完整的 CHANGELOG
changelog-generate generate --all
```

**预期结果**:
- 自动分析所有历史提交
- 按版本标签分组
- 生成完整的 CHANGELOG.md
- 包含所有历史版本的变更记录

### 场景 2: 准备发布新版本

**用户**: 技术负责人，准备发布 v2.0.0 版本

**步骤**:
```bash
# 1. 生成 [Unreleased] 区域的变更
changelog-generate update

# 2. 查看将要发布的内容
changelog-generate preview

# 3. 发布新版本
changelog-generate release --version 2.0.0

# 4. 创建 Git 标签
git push --tags

# 5. 创建 GitHub Release（可选）
changelog-generate release --create-github-release
```

**预期结果**:
- [Unreleased] 的内容转换为 v2.0.0
- 添加发布日期
- 创建 Git 标签
- 可选：创建 GitHub Release

### 场景 3: 增量更新 CHANGELOG

**用户**: 开发者，每天提交多次代码，需要及时更新 CHANGELOG

**步骤**:
```bash
# 在每次提交后自动更新
git commit -m "feat: add new feature"
changelog-generate update --auto

# 或在 Git Hook 中配置
# .git/hooks/post-commit
#!/bin/bash
changelog-generate update --auto --quiet
```

**预期结果**:
- 新提交自动添加到 [Unreleased] 区域
- 不影响已发布的版本
- 支持静默模式，不打断开发流程

### 场景 4: 多语言 CHANGELOG

**用户**: 国际化项目维护者，需要中英文两个版本

**步骤**:
```bash
# 生成中文版本
changelog-generate generate --language zh-CN --output CHANGELOG.zh-CN.md

# 生成英文版本
changelog-generate generate --language en-US --output CHANGELOG.md

# 或一次生成多个
changelog-generate generate --languages zh-CN,en-US
```

**预期结果**:
- 生成 CHANGELOG.zh-CN.md（中文）
- 生成 CHANGELOG.md（英文）
- 保持内容同步，仅语言不同

### 场景 5: 自定义模板

**用户**: 企业团队，有自己的 CHANGELOG 格式规范

**步骤**:
```bash
# 1. 创建自定义模板
cat > .changelog-template.hbs << 'EOF'
# 变更日志

## {{version}} ({{date}})

{{#each categories}}
**{{title}}**
{{#each commits}}
- {{description}} - @{{author}}
{{/each}}

{{/each}}
EOF

# 2. 配置使用自定义模板
changelog-generate config set template.path .changelog-template.hbs

# 3. 生成 CHANGELOG
changelog-generate generate
```

**预期结果**:
- 使用企业自定义的格式
- 保持团队规范统一
- 满足特定的文档要求

### 场景 6: CI/CD 集成

**用户**: DevOps 工程师，需要在 CI/CD 中自动生成 CHANGELOG

**GitHub Actions 配置**:
```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
        with:
          fetch-depth: 0  # 获取完整历史

      - name: Generate Changelog
        run: |
          npx changelog-generate release \
            --version ${{ github.ref_name }} \
            --create-github-release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Commit Changelog
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add CHANGELOG.md
          git commit -m "docs: update changelog for ${{ github.ref_name }}"
          git push
```

**预期结果**:
- 自动生成 CHANGELOG
- 创建 GitHub Release
- 提交更新后的 CHANGELOG.md

---

## 实现路线图

### Phase 1: MVP (2-3 周)

**目标**: 实现核心功能，能生成基本的 CHANGELOG

**功能清单**:
- ✅ Git 提交历史读取
- ✅ Conventional Commits 解析
- ✅ 基本的提交分类
- ✅ Markdown 格式输出
- ✅ 简单的 CLI 命令
- ✅ 配置文件支持

**可交付成果**:
- 可运行的 CLI 工具
- 基本的 CHANGELOG 生成功能
- README 和基础文档

### Phase 2: 增强功能 (2-3 周)

**目标**: 添加高级功能和集成

**功能清单**:
- ✅ 增量更新支持
- ✅ 版本发布功能
- ✅ 自定义模板
- ✅ GitHub API 集成
- ✅ 多格式输出（HTML, JSON）
- ✅ 配置向导

**可交付成果**:
- 功能完善的工具
- GitHub Release 集成
- 详细的使用文档

### Phase 3: 优化和扩展 (1-2 周)

**目标**: 提升用户体验和扩展性

**功能清单**:
- ✅ 多语言支持
- ✅ GitLab 集成
- ✅ PDF 导出
- ✅ 智能提交合并
- ✅ 性能优化
- ✅ 单元测试覆盖

**可交付成果**:
- 生产就绪的工具
- 完整的测试套件
- 最佳实践文档

### Phase 4: 高级特性 (可选)

**目标**: 提供更多高级功能

**功能清单**:
- ✅ AI 辅助分类
- ✅ 自动翻译
- ✅ 变更统计分析
- ✅ Web 界面
- ✅ VS Code 插件
- ✅ 企业级功能

**可交付成果**:
- 企业级解决方案
- 可视化界面
- 编辑器集成

---

## 技术栈

### 核心依赖

```json
{
  "dependencies": {
    "simple-git": "^3.20.0",           // Git 操作
    "conventional-commits-parser": "^5.0.0",  // Commit 解析
    "semver": "^7.5.4",                // 版本管理
    "handlebars": "^4.7.8",            // 模板引擎
    "commander": "^11.1.0",            // CLI 框架
    "inquirer": "^9.2.12",             // 交互式命令行
    "chalk": "^5.3.0",                 // 终端颜色
    "ora": "^7.0.1",                   // 加载动画
    "marked": "^10.0.0",               // Markdown 解析
    "puppeteer": "^21.5.2",            // PDF 生成
    "@octokit/rest": "^20.0.2",        // GitHub API
    "@gitbeaker/node": "^35.8.1",      // GitLab API
    "js-yaml": "^4.1.0",               // YAML 配置
    "dotenv": "^16.3.1"                // 环境变量
  },
  "devDependencies": {
    "jest": "^29.7.0",                 // 测试框架
    "eslint": "^8.54.0",               // 代码检查
    "prettier": "^3.1.0",              // 代码格式化
    "@types/node": "^20.10.0"          // TypeScript 类型
  }
}
```

### 开发工具

- **Node.js**: >= 16.0.0
- **npm**: >= 8.0.0
- **Git**: >= 2.0.0

### 可选依赖

- **GitHub CLI** (`gh`): GitHub 集成
- **GitLab CLI** (`glab`): GitLab 集成

---

## 测试计划

### 单元测试

**覆盖模块**:
- GitAnalyzer
- CommitClassifier
- VersionManager
- ChangelogGenerator
- 各种 Parser

**测试用例示例**:
```javascript
describe('GitAnalyzer', () => {
  test('should parse conventional commit correctly', () => {
    const message = 'feat(api): add user authentication'
    const parsed = analyzer.parseCommitMessage(message)

    expect(parsed.type).toBe('feat')
    expect(parsed.scope).toBe('api')
    expect(parsed.subject).toBe('add user authentication')
  })

  test('should detect breaking changes', () => {
    const message = 'feat!: remove deprecated API'
    const parsed = analyzer.parseCommitMessage(message)

    expect(parsed.breaking).toHaveLength(1)
  })
})

describe('VersionManager', () => {
  test('should increment major version for breaking change', () => {
    const commits = [
      { type: 'feat', breaking: ['Remove old API'] }
    ]
    const nextVersion = versionManager.determineNextVersion(commits, '1.0.0')

    expect(nextVersion).toBe('2.0.0')
  })

  test('should increment minor version for feature', () => {
    const commits = [
      { type: 'feat', breaking: [] }
    ]
    const nextVersion = versionManager.determineNextVersion(commits, '1.0.0')

    expect(nextVersion).toBe('1.1.0')
  })
})
```

### 集成测试

**测试场景**:
1. 完整的 CHANGELOG 生成流程
2. GitHub Release 创建
3. 多格式导出
4. 配置文件解析

**测试仓库**:
- 准备测试用的 Git 仓库
- 包含各种类型的提交
- 包含多个版本标签

### E2E 测试

**测试场景**:
```bash
# 1. 初始化项目
changelog-generate init

# 2. 生成 CHANGELOG
changelog-generate generate

# 3. 更新 CHANGELOG
git commit -m "feat: new feature"
changelog-generate update

# 4. 发布版本
changelog-generate release --version 1.0.0

# 验证输出文件
test -f CHANGELOG.md
grep "1.0.0" CHANGELOG.md
```

### 性能测试

**测试指标**:
- 处理 1000+ 提交的性能
- 大型仓库的处理时间
- 内存使用情况

---

## 安全考虑

### 1. 输入验证

```javascript
// 验证版本号格式
function validateVersion(version) {
  if (!semver.valid(version)) {
    throw new Error(`Invalid version: ${version}`)
  }
}

// 验证 Git 仓库
function validateRepository(path) {
  if (!fs.existsSync(path + '/.git')) {
    throw new Error(`Not a git repository: ${path}`)
  }
}
```

### 2. Token 安全

```javascript
// 不记录敏感信息
if (process.env.GITHUB_TOKEN) {
  console.log('GitHub token found (hidden for security)')
}

// 使用环境变量
const token = process.env.GITHUB_TOKEN || config.github.token

// 提示用户不要提交 token
console.warn('⚠️  Do not commit your .changelogrc.json with tokens')
```

### 3. 文件权限

```javascript
// 检查写入权限
function checkWritePermission(path) {
  try {
    fs.accessSync(path, fs.constants.W_OK)
  } catch (err) {
    throw new Error(`No write permission: ${path}`)
  }
}
```

### 4. Git 操作安全

```javascript
// 防止意外推送
if (config.release.pushTag) {
  const answer = await inquirer.prompt([{
    type: 'confirm',
    name: 'confirm',
    message: 'Push tags to remote? This will publish the release.',
    default: false
  }])

  if (!answer.confirm) {
    console.log('Tag push cancelled')
    return
  }
}
```

---

## 最佳实践

### 1. Commit Message 规范

**推荐格式**: Conventional Commits

```
<type>(<scope>): <subject>

<body>

<footer>
```

**示例**:
```
feat(auth): add JWT authentication

Implement JWT-based authentication system with refresh tokens.

BREAKING CHANGE: Old session-based auth is no longer supported.
Closes #123
```

### 2. 版本管理策略

**语义化版本 (Semantic Versioning)**:
- **Major**: 不兼容的 API 变更
- **Minor**: 向后兼容的新功能
- **Patch**: 向后兼容的问题修复

### 3. CHANGELOG 维护

**建议**:
- 每次发版前更新 CHANGELOG
- 保持 [Unreleased] 区域始终存在
- 使用统一的日期格式 (YYYY-MM-DD)
- 提供版本对比链接

### 4. 自动化流程

**Git Hooks**:
```bash
# .husky/commit-msg
#!/bin/sh
npx commitlint --edit $1
```

**GitHub Actions**:
```yaml
on:
  push:
    branches: [main]

jobs:
  update-changelog:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: changelog-generate update --auto
      - run: git commit -am "docs: update changelog" || true
      - run: git push
```

### 5. 团队协作

**规范**:
- 统一使用 Conventional Commits
- 代码审查时检查 commit message
- 提供 commit message 模板
- 定期审查 CHANGELOG 质量

---

## 附录

### A. Conventional Commits 类型说明

| 类型 | 说明 | 影响版本 |
|-----|------|---------|
| feat | 新功能 | Minor |
| fix | 错误修复 | Patch |
| docs | 文档更新 | - |
| style | 代码格式（不影响功能） | - |
| refactor | 重构（不修复bug，不新增功能） | - |
| perf | 性能优化 | Patch |
| test | 测试相关 | - |
| build | 构建系统或外部依赖 | - |
| ci | CI 配置文件和脚本 | - |
| chore | 其他不修改源代码的变更 | - |
| revert | 回滚之前的提交 | - |

### B. Keep a Changelog 规范

**标准区域**:
- `Added`: 新功能
- `Changed`: 现有功能的变更
- `Deprecated`: 即将移除的功能
- `Removed`: 已移除的功能
- `Fixed`: 任何错误修复
- `Security`: 安全相关的修复

### C. 配置示例库

查看完整的配置示例:
- [默认配置](./examples/default-config.json)
- [企业配置](./examples/enterprise-config.json)
- [开源项目配置](./examples/opensource-config.json)

### D. 常见问题

**Q: 如何处理不规范的 commit message?**
A: 使用 `--fallback-category` 选项将不规范的提交归类到特定区域。

**Q: 如何跳过某些提交?**
A: 在配置文件的 `exclude.commits` 中添加正则表达式。

**Q: 如何自定义日期格式?**
A: 在模板中使用 Handlebars helper: `{{formatDate date "YYYY-MM-DD"}}`

**Q: 支持 monorepo 吗?**
A: 支持。可以使用 scope 过滤特定包的变更。

---

## 总结

changelog-generator 是一个强大而灵活的工具，旨在解决开发团队在维护变更日志时遇到的各种痛点。通过智能分析 Git 提交历史、支持多种配置和输出格式、深度集成代码托管平台，它能够显著提升开发效率和文档质量。

**核心优势**:
- ⏱️ 节省时间 - 自动化生成，从 30 分钟到 30 秒
- 📐 统一规范 - 遵循业界标准，保持一致性
- 🔄 持续更新 - 支持增量更新，不破坏历史
- 🌍 国际化 - 轻松维护多语言版本
- 🚀 易于集成 - 完美融入 CI/CD 流程

**下一步**:
1. 审查和完善此 OpenSpec
2. 开始 MVP 开发
3. 收集早期用户反馈
4. 迭代优化功能
5. 发布正式版本

---

**文档版本**: 1.0.0
**最后更新**: 2025-12-03
**反馈**: 欢迎提出建议和改进意见！
