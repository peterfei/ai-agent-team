# changelog-generator

> 智能变更日志生成器 - 自动分析 Git 提交历史，生成符合规范的 CHANGELOG.md

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)

## ✨ 特性

- 🔍 **智能分析** - 自动分析 Git 提交历史
- 📝 **规范生成** - 遵循 [Keep a Changelog](https://keepachangelog.com/) 和 [Conventional Commits](https://www.conventionalcommits.org/) 标准
- 🏷️ **自动分类** - 智能分类提交类型（Features, Fixes, Breaking Changes 等）
- 🔢 **版本管理** - 支持语义化版本管理
- 🌐 **多语言** - 支持中文和英文
- 🎨 **多格式输出** - 支持 Markdown 和 HTML 格式，未来支持 JSON, PDF
- 🌍 **GitHub 集成** - 自动创建 GitHub Releases，支持 PR 信息获取
- 🎯 **自定义模板** - 强大的模板系统，30+ 内置 Handlebars 辅助函数
- 🔄 **增量更新** - 支持增量更新，不破坏历史记录
- 🚀 **易于集成** - 完美融入 CI/CD 流程

## 📦 安装

### 作为 Claude Code Skill 安装

```bash
# 1. 克隆到 skills 目录
cd ~/.claude/skills
git clone https://github.com/peterfei/changelog-generator.git

# 2. 安装依赖
cd changelog-generator
npm install
```

### 全局安装（可选）

```bash
npm install -g changelog-generator
```

## 🚀 快速开始

### 1. 初始化配置

在你的项目目录中运行：

```bash
changelog-generate init
```

这会创建 `.changelogrc.json` 配置文件，并交互式地询问你的配置偏好。

### 2. 生成 CHANGELOG

```bash
# 生成完整的 CHANGELOG
changelog-generate generate --all

# 或增量更新
changelog-generate update
```

### 3. 发布新版本

```bash
changelog-generate release
```

## 📖 使用示例

### 基础用法

```bash
# 首次生成
$ changelog-generate generate --all
✔ CHANGELOG 已生成: CHANGELOG.md

📊 统计信息:
  总提交数: 150
  已包含: 120
  已排除: 30
  破坏性变更: 2
  贡献者: 5 人

📈 提交类型分布:
  ✨ feat: 45
  🐛 fix: 30
  📝 docs: 15
  ♻️ refactor: 20
  ✅ test: 10
```

### 增量更新

```bash
# 更新 [Unreleased] 区域
$ changelog-generate update
✔ CHANGELOG 已更新

新增 15 个提交到 [Unreleased] 区域
```

### 发布版本

```bash
$ changelog-generate release
? 当前版本: 1.0.0，选择版本类型:
  ❯ Patch (1.0.0 -> 1.0.1)
    Minor (1.0.0 -> 1.1.0)
    Major (1.0.0 -> 2.0.0)
    手动输入

✔ 版本 1.0.1 已发布

下一步:
  1. 审查 CHANGELOG.md
  2. 提交变更: git add CHANGELOG.md && git commit -m "chore(release): 1.0.1"
  3. 创建标签: git tag v1.0.1
  4. 推送: git push && git push --tags
```

### HTML 格式导出

生成美观的 HTML 格式变更日志，带搜索功能和交互式界面：

```bash
# 生成 HTML 格式
$ changelog-generate generate --all --format html
✔ CHANGELOG 已生成: CHANGELOG.html

# HTML 文件包含:
# - 美观的渐变设计
# - 实时搜索过滤
# - 响应式布局
# - 统计信息仪表板
# - 平滑动画效果
```

### GitHub Release 集成

自动创建 GitHub Release，包含完整的变更日志：

```bash
# 设置 GitHub Token（二选一）
export GITHUB_TOKEN=your_github_token
# 或在命令中指定
--github-token your_github_token

# 发布版本并创建 GitHub Release
$ changelog-generate release --github-release
✔ 版本 1.0.1 已发布
✔ GitHub Release 已创建
Release URL: https://github.com/owner/repo/releases/tag/v1.0.1

# 创建草稿 Release
$ changelog-generate release --github-release --draft

# 创建预发布版本
$ changelog-generate release --github-release --prerelease
```

## 📝 Commit Message 规范

本工具支持 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

### 格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 示例

```bash
# Feature
git commit -m "feat(auth): add JWT authentication"

# Bug fix
git commit -m "fix(ui): resolve button alignment issue"

# Breaking change
git commit -m "feat!: remove deprecated API"

# With body and footer
git commit -m "feat(api): add user profile endpoint

This adds a new endpoint for retrieving user profiles.

Closes #123"
```

### 支持的类型

| 类型 | 描述 | 显示区域 | Emoji |
|-----|------|---------|-------|
| `feat` | 新功能 | Features | ✨ |
| `fix` | 错误修复 | Bug Fixes | 🐛 |
| `docs` | 文档更新 | Documentation | 📝 |
| `style` | 代码格式 | - (隐藏) | 💄 |
| `refactor` | 代码重构 | Code Refactoring | ♻️ |
| `perf` | 性能优化 | Performance | ⚡ |
| `test` | 测试相关 | Tests | ✅ |
| `build` | 构建系统 | Build System | 📦 |
| `ci` | CI/CD | CI/CD | 👷 |
| `chore` | 其他杂项 | - (隐藏) | 🔧 |

## ⚙️ 配置

### 配置文件

支持以下配置文件（按优先级）：
1. `.changelogrc.json`
2. `.changelogrc.yml`
3. `.changelogrc.yaml`
4. `changelog.config.js`

### 配置示例

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
    "showIssue": true,
    "showCommitHash": false
  },

  "types": [
    { "type": "feat", "section": "Features", "emoji": "✨", "priority": 1 },
    { "type": "fix", "section": "Bug Fixes", "emoji": "🐛", "priority": 2 },
    { "type": "chore", "hidden": true }
  ],

  "template": {
    "commitUrl": "https://github.com/user/repo/commit/{{hash}}",
    "compareUrl": "https://github.com/user/repo/compare/{{previousTag}}...{{currentTag}}",
    "issueUrl": "https://github.com/user/repo/issues/{{id}}",
    "prUrl": "https://github.com/user/repo/pull/{{id}}"
  },

  "exclude": {
    "types": ["style", "chore"],
    "scopes": ["deps"]
  }
}
```

## 🔧 CLI 命令

### `init`

初始化配置文件

```bash
changelog-generate init
```

### `generate`

生成完整的 CHANGELOG

```bash
changelog-generate generate [options]

选项:
  -f, --from <tag>       起始标签
  -t, --to <tag>         结束标签 (默认: HEAD)
  -o, --output <file>    输出文件 (默认: CHANGELOG.md)
  --all                  包含所有历史提交
  --format <format>      输出格式: markdown|html (默认: markdown)
```

### `update`

增量更新 CHANGELOG

```bash
changelog-generate update [options]

选项:
  -f, --from <tag>       起始标签（默认为最新标签）
  -o, --output <file>    CHANGELOG 文件 (默认: CHANGELOG.md)
  --format <format>      输出格式: markdown|html (默认: markdown)
```

### `release`

发布新版本

```bash
changelog-generate release [options]

选项:
  -v, --version <version>    版本号（自动或手动指定）
  -d, --date <date>          发布日期（默认今天）
  -o, --output <file>        CHANGELOG 文件 (默认: CHANGELOG.md)
  --github-release           创建 GitHub Release
  --github-token <token>     GitHub Personal Access Token
  --draft                    创建草稿 Release
  --prerelease               标记为预发布版本
```

### `preview`

预览 Unreleased 内容

```bash
changelog-generate preview
```

## 🎨 自定义模板系统

changelog-generator 提供强大的模板系统，基于 Handlebars，内置 30+ 实用辅助函数。

### 内置 Handlebars 辅助函数

#### 日期格式化
- `{{formatDate date "YYYY-MM-DD"}}` - 标准日期格式
- `{{formatDate date "relative"}}` - 相对时间（今天、昨天、N天前）

#### 条件判断
- `{{#if_eq a b}}...{{/if_eq}}` - 相等判断
- `{{#if_ne a b}}...{{/if_ne}}` - 不等判断
- `{{#if_gt a b}}...{{/if_gt}}` - 大于判断
- `{{#if_lt a b}}...{{/if_lt}}` - 小于判断

#### 数组操作
- `{{length array}}` - 获取数组长度
- `{{join array ", "}}` - 连接数组元素
- `{{first array 3}}` - 获取前 N 个元素
- `{{last array 3}}` - 获取后 N 个元素

#### 字符串操作
- `{{uppercase text}}` - 转大写
- `{{lowercase text}}` - 转小写
- `{{capitalize text}}` - 首字母大写
- `{{truncate text 50}}` - 截断字符串

#### Markdown 链接
- `{{mdLink "text" "url"}}` - 创建 Markdown 链接
- `{{commitLink hash shortHash urlTemplate}}` - 创建提交链接
- `{{prLink number urlTemplate}}` - 创建 PR 链接
- `{{issueLink number urlTemplate}}` - 创建 Issue 链接

#### 其他辅助函数
- `{{emoji "🎉" showEmoji}}` - 条件显示 emoji
- `{{default value "fallback"}}` - 默认值
- `{{json obj}}` - JSON 序列化
- `{{add a b}}` / `{{subtract a b}}` / `{{multiply a b}}` / `{{divide a b}}` - 数学运算

### 自定义模板示例

创建自定义模板文件 `custom-template.hbs`:

```handlebars
# {{title}}

{{#each versions}}
## [{{version}}] - {{formatDate date "YYYY-MM-DD"}}

{{#if breaking}}
### 💥 BREAKING CHANGES
{{#each breaking}}
- {{#if scope}}**{{scope}}:** {{/if}}{{subject}}
{{/each}}
{{/if}}

{{#each changes}}
### {{emoji}} {{section}}
{{#each commits}}
- {{#if scope}}**{{scope}}:** {{/if}}{{subject}}
  {{#if references.prs}}
  PRs: {{#each references.prs}}{{prLink this ../../../config.template.prUrl}} {{/each}}
  {{/if}}
{{/each}}
{{/each}}
{{/each}}
```

## 🤝 CI/CD 集成

### GitHub Actions

创建 `.github/workflows/changelog.yml`:

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

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'

      - name: Install changelog-generator
        run: npm install -g changelog-generator

      - name: Update Changelog
        run: changelog-generate update

      - name: Commit changes
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add CHANGELOG.md
          git commit -m "docs: update changelog" || true
          git push
```

### GitLab CI

`.gitlab-ci.yml`:

```yaml
update-changelog:
  stage: deploy
  script:
    - npm install -g changelog-generator
    - changelog-generate update
    - git add CHANGELOG.md
    - git commit -m "docs: update changelog" || true
    - git push
  only:
    - main
```

## 📚 输出示例

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.0] - 2023-11-10

### 💥 BREAKING CHANGES

- **api:** Remove deprecated v1 endpoints ([#123](https://github.com/user/repo/pull/123))

### ✨ Features

- **auth:** Add JWT authentication ([#120](https://github.com/user/repo/pull/120)) by @alice
- **api:** Add user profile endpoint ([#121](https://github.com/user/repo/pull/121)) by @bob

### 🐛 Bug Fixes

- **ui:** Fix button alignment issue ([#122](https://github.com/user/repo/pull/122)) by @charlie

### 📝 Documentation

- Update API documentation by @alice

## [1.0.0] - 2023-10-01

Initial release
```

## 💡 最佳实践

### 1. 使用 Commitlint

确保提交消息符合规范：

```bash
npm install --save-dev @commitlint/cli @commitlint/config-conventional
echo "module.exports = {extends: ['@commitlint/config-conventional']}" > commitlint.config.js
```

### 2. 设置 Git Hooks

使用 Husky 自动检查：

```bash
npm install --save-dev husky
npx husky install
npx husky add .husky/commit-msg 'npx commitlint --edit $1'
```

### 3. 定期更新

建议每次合并 PR 后更新 CHANGELOG：

```bash
git pull
changelog-generate update
git add CHANGELOG.md
git commit -m "docs: update changelog"
git push
```

## 🐛 故障排除

### 问题：找不到 Git 仓库

**错误**: `Not a git repository`

**解决**:
```bash
# 确保在 Git 仓库目录中
git status
```

### 问题：生成的 CHANGELOG 为空

**检查**:
1. 确保有符合规范的提交
2. 检查 `exclude` 配置是否过滤了所有提交
3. 使用 `git log` 查看提交历史

### 问题：版本号不正确

**解决**: 手动指定版本号
```bash
changelog-generate release --version 2.0.0
```

## 🗺️ Roadmap

- [ ] HTML 格式输出
- [ ] JSON 格式输出
- [ ] PDF 导出
- [ ] GitHub Release 集成
- [ ] GitLab Release 集成
- [ ] 自定义模板系统增强
- [ ] AI 辅助提交分类
- [ ] 多语言翻译支持
- [ ] Web UI 界面

## 🤝 贡献

欢迎贡献！请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详情。

## 📄 许可

[MIT](LICENSE) © Peter Fei

## 🙏 致谢

本项目受到以下项目的启发：

- [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog)
- [standard-version](https://github.com/conventional-changelog/standard-version)
- [semantic-release](https://github.com/semantic-release/semantic-release)

## 📞 联系

- 作者: Peter Fei
- Email: peterfeispace@gmail.com
- GitHub: [@peterfei](https://github.com/peterfei)

---

如果这个项目对你有帮助，请给个 ⭐️ 吧！
