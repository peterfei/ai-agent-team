---
name: changelog-generator
description: "智能变更日志生成器 - 自动分析Git提交历史，生成符合规范的CHANGELOG.md。支持语义化版本管理、多种输出格式、增量更新和GitHub/GitLab集成。"
license: MIT
---

# changelog-generator - 智能变更日志生成器

## 概述

当用户需要生成或更新 CHANGELOG 时，此 skill 会自动完成以下流程：
1. 分析 Git 提交历史
2. 根据 Conventional Commits 规范解析提交
3. 智能分类和组织变更
4. 生成符合 Keep a Changelog 标准的 CHANGELOG.md
5. 支持版本发布和增量更新

## 支持的触发指令

用户可以通过以下方式触发此 skill：
- "changelog" - 简易触发词
- "变更日志" - 简易触发词
- "帮我生成 CHANGELOG" - 生成完整的 CHANGELOG
- "更新 CHANGELOG" - 增量更新 CHANGELOG
- "发布新版本" - 发布正式版本
- "初始化 changelog 配置" - 创建配置文件

## 工作流程

### 步骤 1: 初始化配置（首次使用）

**命令**:
```bash
cd ~/.claude/skills/changelog-generator
npm install

# 在项目目录中初始化配置
cd /path/to/your/project
changelog-generate init
```

**配置文件**: `.changelogrc.json`

交互式配置会询问：
- 当前版本号
- 语言选择（中文/英文）
- 是否使用 emoji
- 是否显示作者信息

### 步骤 2: 生成 CHANGELOG

**场景 A: 首次生成完整 CHANGELOG**

```bash
# 生成所有历史提交的 CHANGELOG
changelog-generate generate --all

# 生成指定范围的 CHANGELOG
changelog-generate generate --from v1.0.0 --to v2.0.0
```

**场景 B: 增量更新 CHANGELOG**

```bash
# 更新 [Unreleased] 区域
changelog-generate update

# 从指定标签开始更新
changelog-generate update --from v2.0.0
```

**场景 C: 发布新版本**

```bash
# 自动确定版本号（交互式）
changelog-generate release

# 手动指定版本号
changelog-generate release --version 2.1.0

# 指定日期
changelog-generate release --version 2.1.0 --date 2023-11-10
```

### 步骤 3: 输出文件

**默认输出路径**: `./CHANGELOG.md`

**生成的 CHANGELOG 示例**:
```markdown
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [2.0.0] - 2023-11-10

### 💥 BREAKING CHANGES

- **api:** Remove deprecated v1 endpoints (#123)

### ✨ Features

- **auth:** Add JWT authentication (#120)
- **api:** Add user profile endpoint (#121)

### 🐛 Bug Fixes

- **ui:** Fix button alignment issue (#122)

### 📝 Documentation

- Update API documentation

## [1.0.0] - 2023-10-01

...
```

## 核心功能

### 1. 智能提交解析

支持 Conventional Commits 规范：

```
feat(auth): add login functionality
^    ^      ^
type scope  subject

BREAKING CHANGE: Remove old auth API
```

**支持的提交类型**:
- `feat`: ✨ Features
- `fix`: 🐛 Bug Fixes
- `docs`: 📝 Documentation
- `style`: 💄 Styles (可隐藏)
- `refactor`: ♻️ Code Refactoring
- `perf`: ⚡ Performance
- `test`: ✅ Tests
- `build`: 📦 Build System
- `ci`: 👷 CI/CD
- `chore`: 🔧 Chores (可隐藏)

### 2. 自动版本管理

根据提交类型自动确定版本号：

| 提交类型 | 版本影响 | 示例 |
|---------|---------|------|
| BREAKING CHANGE | Major | 1.0.0 → 2.0.0 |
| feat | Minor | 1.0.0 → 1.1.0 |
| fix | Patch | 1.0.0 → 1.0.1 |

### 3. PR 和 Issue 引用

自动识别和链接：

```
feat: add new feature (#123)
fix: resolve bug (fixes #456)
```

生成链接：
```markdown
- **feat:** add new feature ([#123](https://github.com/user/repo/pull/123))
```

### 4. 破坏性变更检测

两种检测方式：

**方式 1**: 使用 `BREAKING CHANGE` footer
```
feat: add new API

BREAKING CHANGE: Old API is removed
```

**方式 2**: 使用 "!" (感叹号) 标记
```
feat!: remove deprecated method
```

## 配置选项

### 完整配置示例

```json
{
  "version": "1.0.0",
  "format": "keepachangelog",
  "language": "zh-CN",

  "display": {
    "emoji": true,
    "groupByType": true,
    "showAuthor": true,
    "showPR": true,
    "showIssue": true
  },

  "types": [
    { "type": "feat", "section": "Features", "emoji": "✨" },
    { "type": "fix", "section": "Bug Fixes", "emoji": "🐛" },
    { "type": "chore", "hidden": true }
  ],

  "exclude": {
    "types": ["style", "chore"],
    "scopes": ["deps"]
  }
}
```

## 使用场景

### 场景 1: 新项目首次生成

```bash
# 1. 初始化配置
changelog-generate init

# 2. 生成 CHANGELOG
changelog-generate generate --all

# 输出: CHANGELOG.md 包含所有历史提交
```

### 场景 2: 日常开发增量更新

```bash
# 在每次 PR 合并后或定期更新
git pull
changelog-generate update

# 查看 [Unreleased] 的内容
changelog-generate preview
```

### 场景 3: 发布新版本

```bash
# 1. 更新 CHANGELOG
changelog-generate update

# 2. 预览将要发布的内容
changelog-generate preview

# 3. 发布版本
changelog-generate release

# 4. 提交和推送
git add CHANGELOG.md
git commit -m "chore(release): 2.0.0"
git tag v2.0.0
git push && git push --tags
```

### 场景 4: CI/CD 自动化

**GitHub Actions**:
```yaml
name: Update Changelog

on:
  push:
    branches: [main]

jobs:
  changelog:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
        with:
          fetch-depth: 0

      - name: Update Changelog
        run: |
          npm install -g changelog-generate
          changelog-generate update

      - name: Commit
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add CHANGELOG.md
          git commit -m "docs: update changelog" || true
          git push
```

## CLI 命令参考

### `init` - 初始化配置

```bash
changelog-generate init
```

交互式创建 `.changelogrc.json` 配置文件。

### `generate` - 生成 CHANGELOG

```bash
changelog-generate generate [options]

Options:
  -f, --from <tag>    起始标签
  -t, --to <tag>      结束标签 (默认: HEAD)
  -o, --output <file> 输出文件 (默认: CHANGELOG.md)
  --all               包含所有历史提交
```

### `update` - 增量更新

```bash
changelog-generate update [options]

Options:
  -f, --from <tag>    起始标签（默认为最新标签）
  -o, --output <file> CHANGELOG 文件 (默认: CHANGELOG.md)
```

### `release` - 发布版本

```bash
changelog-generate release [options]

Options:
  -v, --version <version> 版本号
  -d, --date <date>       发布日期
  -o, --output <file>     CHANGELOG 文件
```

### `preview` - 预览 Unreleased

```bash
changelog-generate preview
```

显示 [Unreleased] 区域的内容。

## 最佳实践

### 1. 规范的 Commit Message

使用 Conventional Commits 规范：

```bash
# 好的示例
git commit -m "feat(auth): add OAuth2 support"
git commit -m "fix(ui): resolve button alignment issue"
git commit -m "docs: update installation guide"

# 避免的示例
git commit -m "update code"
git commit -m "fix bug"
git commit -m "wip"
```

### 2. 使用 Commitlint

安装 commitlint 检查提交消息：

```bash
npm install --save-dev @commitlint/cli @commitlint/config-conventional
```

配置 `.commitlintrc.json`:
```json
{
  "extends": ["@commitlint/config-conventional"]
}
```

### 3. Git Hooks 自动化

使用 husky 在提交时检查：

```bash
npm install --save-dev husky

# .husky/commit-msg
npx commitlint --edit $1
```

### 4. 定期更新

建议在以下时机更新 CHANGELOG：
- 每次 PR 合并后
- 每周定期更新
- 发布前必须更新

### 5. 版本发布流程

```bash
# 1. 确保所有变更已提交
git status

# 2. 更新 CHANGELOG
changelog-generate update

# 3. 预览内容
changelog-generate preview

# 4. 发布版本
changelog-generate release

# 5. 审查 CHANGELOG.md
git diff CHANGELOG.md

# 6. 提交和标签
git add CHANGELOG.md
git commit -m "chore(release): 2.0.0"
git tag v2.0.0

# 7. 推送
git push && git push --tags
```

## 依赖安装

```bash
# 使用 nvm 管理 Node.js 版本
nvm use 18

# 安装依赖
cd ~/.claude/skills/changelog-generator
npm install
```

## 技术栈

- **simple-git**: Git 操作
- **conventional-commits-parser**: 提交解析
- **semver**: 版本管理
- **handlebars**: 模板引擎
- **commander**: CLI 框架
- **inquirer**: 交互式命令行
- **chalk**: 终端颜色
- **ora**: 加载动画

## 故障排除

### 问题 1: 找不到 Git 仓库

**错误**: `Not a git repository`

**解决**:
```bash
# 确保在 Git 仓库目录中
git status

# 或初始化 Git 仓库
git init
```

### 问题 2: 无法解析提交

**原因**: 提交消息不符合 Conventional Commits 规范

**解决**: 修改配置，将不符合规范的提交归类到 "Other" 类型。

### 问题 3: 生成的 CHANGELOG 为空

**检查**:
```bash
# 查看提交历史
git log --oneline

# 检查配置中的排除规则
cat .changelogrc.json | grep exclude
```

## 扩展和自定义

### 自定义模板

创建自定义模板 `custom-template.hbs`:

```handlebars
# 变更日志

{{#each versions}}
## 版本 {{version}} ({{date}})

{{#each changes}}
**{{section}}**
{{#each commits}}
- {{subject}}
{{/each}}

{{/each}}
{{/each}}
```

配置使用：
```json
{
  "template": {
    "path": "./custom-template.hbs"
  }
}
```

### 添加新的提交类型

在 `.changelogrc.json` 中添加：

```json
{
  "types": [
    {
      "type": "security",
      "section": "Security",
      "emoji": "🔒",
      "priority": 2
    }
  ]
}
```

## 与其他工具集成

### 与 semantic-release 集成

```json
{
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/changelog",
    "@semantic-release/npm",
    "@semantic-release/git"
  ]
}
```

### 与 Renovate 集成

`.renovate.json`:
```json
{
  "automerge": true,
  "prCreation": "immediate",
  "commitMessagePrefix": "chore(deps):"
}
```

---

**版本**: 1.0.0
**作者**: Peter Fei
**许可**: MIT
