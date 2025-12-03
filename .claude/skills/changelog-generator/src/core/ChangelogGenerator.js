const Handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');

/**
 * ChangelogGenerator - CHANGELOG 生成器
 * 负责根据分类后的提交生成 CHANGELOG.md
 */
class ChangelogGenerator {
  /**
   * @param {Object} config - 配置对象
   */
  constructor(config) {
    this.config = config;
    this.templateCache = null;
    this.registerHelpers();
  }

  /**
   * 注册 Handlebars 辅助函数
   */
  registerHelpers() {
    // 格式化日期
    Handlebars.registerHelper('formatDate', (date, format) => {
      if (!date) return '';
      const d = new Date(date);

      if (format === 'YYYY-MM-DD') {
        return d.toISOString().split('T')[0];
      }

      return d.toLocaleDateString();
    });

    // 条件显示 emoji
    Handlebars.registerHelper('emoji', (emoji, options) => {
      if (this.config.display?.emoji !== false) {
        return emoji + ' ';
      }
      return '';
    });

    // 生成提交链接
    Handlebars.registerHelper('commitLink', (hash, shortHash) => {
      const url = this.config.template?.commitUrl;
      if (url) {
        const link = url.replace('{{hash}}', hash);
        return `[${shortHash}](${link})`;
      }
      return shortHash;
    });

    // 生成 PR 链接
    Handlebars.registerHelper('prLink', (prNumber) => {
      const url = this.config.template?.prUrl;
      if (url) {
        const link = url.replace('{{id}}', prNumber);
        return `[#${prNumber}](${link})`;
      }
      return `#${prNumber}`;
    });

    // 生成 Issue 链接
    Handlebars.registerHelper('issueLink', (issueNumber) => {
      const url = this.config.template?.issueUrl;
      if (url) {
        const link = url.replace('{{id}}', issueNumber);
        return `[#${issueNumber}](${link})`;
      }
      return `#${issueNumber}`;
    });

    // 比较链接
    Handlebars.registerHelper('compareLink', (from, to) => {
      const url = this.config.template?.compareUrl;
      if (url) {
        return url.replace('{{previousTag}}', from).replace('{{currentTag}}', to);
      }
      return '';
    });
  }

  /**
   * 生成 CHANGELOG
   * @param {Object} data - 数据对象
   * @param {Array} data.versions - 版本列表
   * @param {Object} data.config - 配置
   * @returns {Promise<string>} CHANGELOG 内容
   */
  async generate(data) {
    const template = await this.getTemplate();
    const compiled = Handlebars.compile(template);

    const context = {
      ...data,
      config: this.config,
      generatedAt: new Date().toISOString()
    };

    return compiled(context);
  }

  /**
   * 获取模板
   * @returns {Promise<string>} 模板内容
   */
  async getTemplate() {
    if (this.templateCache) {
      return this.templateCache;
    }

    // 如果指定了自定义模板
    if (this.config.template?.path) {
      try {
        this.templateCache = await fs.readFile(this.config.template.path, 'utf-8');
        return this.templateCache;
      } catch (error) {
        console.warn(`Failed to load custom template: ${error.message}`);
        console.warn('Falling back to default template');
      }
    }

    // 使用默认模板
    this.templateCache = this.getDefaultTemplate();
    return this.templateCache;
  }

  /**
   * 获取默认模板
   * @returns {string} 默认模板
   */
  getDefaultTemplate() {
    return `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

{{#each versions}}
## [{{version}}]{{#if date}} - {{formatDate date "YYYY-MM-DD"}}{{/if}}

{{#if breaking}}
{{#if breaking.length}}
### {{emoji "💥" ../config}}BREAKING CHANGES

{{#each breaking}}
- {{#if scope}}**{{scope}}:** {{/if}}{{subject}}{{#if references.prs.length}} ({{#each references.prs}}{{prLink this}}{{#unless @last}}, {{/unless}}{{/each}}){{/if}}
{{#if breaking}}
{{#each breaking}}
  - {{text}}
{{/each}}
{{/if}}
{{/each}}

{{/if}}
{{/if}}

{{#each changes}}
### {{emoji emoji ../config}}{{section}}

{{#each commits}}
- {{#if scope}}**{{scope}}:** {{/if}}{{subject}}{{#if references.prs.length}} ({{#each references.prs}}{{prLink this}}{{#unless @last}}, {{/unless}}{{/each}}){{/if}}{{#if ../config.display.showAuthor}} by @{{author}}{{/if}}
{{/each}}

{{/each}}

{{/each}}

{{#if compareUrl}}
[Unreleased]: {{compareUrl}}
{{/if}}
`;
  }

  /**
   * 更新现有的 CHANGELOG
   * @param {string} changelogPath - CHANGELOG 文件路径
   * @param {Object} newVersion - 新版本数据
   * @returns {Promise<string>} 更新后的内容
   */
  async updateExisting(changelogPath, newVersion) {
    let existingContent = '';

    try {
      existingContent = await fs.readFile(changelogPath, 'utf-8');
    } catch (error) {
      // 文件不存在，创建新的
      return this.generate({ versions: [newVersion] });
    }

    // 解析现有的 CHANGELOG
    const parsed = this.parseChangelog(existingContent);

    // 检查是否已存在 Unreleased 区域
    const unreleasedIndex = parsed.versions.findIndex(v => v.version === 'Unreleased');

    if (unreleasedIndex >= 0) {
      // 更新 Unreleased 区域
      parsed.versions[unreleasedIndex] = newVersion;
    } else {
      // 在开头插入 Unreleased
      parsed.versions.unshift(newVersion);
    }

    // 重新生成
    return this.generate(parsed);
  }

  /**
   * 发布版本（将 Unreleased 转换为正式版本）
   * @param {string} changelogPath - CHANGELOG 文件路径
   * @param {string} version - 版本号
   * @param {string} date - 发布日期
   * @returns {Promise<string>} 更新后的内容
   */
  async releaseVersion(changelogPath, version, date = null) {
    const existingContent = await fs.readFile(changelogPath, 'utf-8');
    const parsed = this.parseChangelog(existingContent);

    // 找到 Unreleased 区域
    const unreleasedIndex = parsed.versions.findIndex(v => v.version === 'Unreleased');

    if (unreleasedIndex < 0) {
      throw new Error('No unreleased changes found');
    }

    const unreleased = parsed.versions[unreleasedIndex];

    // 创建新版本
    const newVersion = {
      ...unreleased,
      version,
      date: date || new Date().toISOString().split('T')[0]
    };

    // 插入新版本
    parsed.versions.splice(unreleasedIndex + 1, 0, newVersion);

    // 清空 Unreleased
    parsed.versions[unreleasedIndex] = {
      version: 'Unreleased',
      date: null,
      breaking: [],
      changes: []
    };

    // 重新生成
    return this.generate(parsed);
  }

  /**
   * 解析现有的 CHANGELOG
   * @param {string} content - CHANGELOG 内容
   * @returns {Object} 解析后的对象
   */
  parseChangelog(content) {
    // 简单的解析实现
    // TODO: 实现更健壮的解析逻辑
    const versions = [];
    const lines = content.split('\n');

    let currentVersion = null;
    let currentSection = null;

    lines.forEach(line => {
      // 匹配版本标题: ## [1.0.0] - 2023-11-10
      const versionMatch = line.match(/^##\s+\[([^\]]+)\](?:\s+-\s+(\d{4}-\d{2}-\d{2}))?/);

      if (versionMatch) {
        if (currentVersion) {
          versions.push(currentVersion);
        }

        currentVersion = {
          version: versionMatch[1],
          date: versionMatch[2] || null,
          breaking: [],
          changes: []
        };
        currentSection = null;
        return;
      }

      // 匹配区域标题: ### Features
      const sectionMatch = line.match(/^###\s+(?:[\u{1F300}-\u{1F9FF}]\s+)?(.+)/u);

      if (sectionMatch && currentVersion) {
        currentSection = {
          section: sectionMatch[1].trim(),
          commits: []
        };

        if (sectionMatch[1].includes('BREAKING')) {
          // 破坏性变更单独处理
        } else {
          currentVersion.changes.push(currentSection);
        }
        return;
      }

      // 匹配提交行: - feat: add new feature (#123)
      if (line.trim().startsWith('-') && currentSection) {
        const commitText = line.trim().substring(1).trim();
        currentSection.commits.push({ subject: commitText });
      }
    });

    if (currentVersion) {
      versions.push(currentVersion);
    }

    return { versions };
  }

  /**
   * 保存 CHANGELOG
   * @param {string} filePath - 文件路径
   * @param {string} content - 内容
   * @returns {Promise<void>}
   */
  async save(filePath, content) {
    await fs.writeFile(filePath, content, 'utf-8');
  }

  /**
   * 生成版本数据
   * @param {string} version - 版本号
   * @param {Object} classified - 分类后的提交
   * @param {string} date - 日期
   * @returns {Object} 版本数据
   */
  createVersionData(version, classified, date = null) {
    return {
      version,
      date: date || new Date().toISOString().split('T')[0],
      breaking: classified.breaking,
      changes: classified.changes,
      stats: classified.stats
    };
  }
}

module.exports = ChangelogGenerator;
