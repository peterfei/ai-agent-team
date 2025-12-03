const simpleGit = require('simple-git');
const conventionalCommitsParser = require('conventional-commits-parser').sync;
const semver = require('semver');

/**
 * GitAnalyzer - Git 提交历史分析器
 * 负责读取和解析 Git 仓库的提交历史
 */
class GitAnalyzer {
  /**
   * @param {string} repoPath - Git 仓库路径
   */
  constructor(repoPath) {
    this.repoPath = repoPath;
    this.git = simpleGit(repoPath);
  }

  /**
   * 获取提交列表
   * @param {Object} options - 选项
   * @param {string} options.from - 起始标签或提交
   * @param {string} options.to - 结束标签或提交
   * @param {number} options.maxCount - 最大提交数量
   * @returns {Promise<Array>} 提交列表
   */
  async getCommits(options = {}) {
    const { from, to = 'HEAD', maxCount } = options;

    try {
      const logOptions = {};

      if (from) {
        logOptions.from = from;
        logOptions.to = to;
      }

      if (maxCount) {
        logOptions.maxCount = maxCount;
      }

      const log = await this.git.log(logOptions);

      // 解析每个提交
      const commits = log.all.map(commit => this.parseCommit(commit));

      return commits;
    } catch (error) {
      throw new Error(`Failed to get commits: ${error.message}`);
    }
  }

  /**
   * 解析单个提交
   * @param {Object} commit - Git 提交对象
   * @returns {Object} 解析后的提交对象
   */
  parseCommit(commit) {
    const parsed = this.parseCommitMessage(commit.message);

    return {
      hash: commit.hash,
      shortHash: commit.hash.substring(0, 7),
      author: commit.author_name,
      email: commit.author_email,
      date: commit.date,
      message: commit.message,
      ...parsed
    };
  }

  /**
   * 解析提交消息（遵循 Conventional Commits 规范）
   * @param {string} message - 提交消息
   * @returns {Object} 解析后的对象
   */
  parseCommitMessage(message) {
    try {
      // 预处理：检测 type! 格式
      let isBreakingBang = false;
      let cleanMessage = message;
      const bangMatch = message.match(/^(\w+)(!)/);
      if (bangMatch) {
        isBreakingBang = true;
        // 移除 ! 让 parser 能正确解析
        cleanMessage = message.replace(/^(\w+)!/, '$1');
      }

      const parsed = conventionalCommitsParser(cleanMessage);

      // 检测破坏性变更
      const breakingChanges = [];

      // 方式1: 通过 notes 检测
      if (parsed.notes && parsed.notes.length > 0) {
        parsed.notes.forEach(note => {
          if (note.title === 'BREAKING CHANGE' || note.title === 'BREAKING-CHANGE') {
            breakingChanges.push({
              title: note.title,
              text: note.text
            });
          }
        });
      }

      // 方式2: 通过 type! 检测（预处理阶段检测到的）
      if (isBreakingBang) {
        breakingChanges.push({
          title: 'BREAKING CHANGE',
          text: parsed.subject
        });
      }

      // 提取 PR 和 Issue 引用
      const references = this.extractReferences(message);

      return {
        type: parsed.type || 'other',
        scope: parsed.scope || null,
        subject: parsed.subject || message.split('\n')[0],
        body: parsed.body || null,
        footer: parsed.footer || null,
        breaking: breakingChanges,
        isBreaking: breakingChanges.length > 0,
        references
      };
    } catch (error) {
      // 如果解析失败，返回基本信息
      return {
        type: 'other',
        scope: null,
        subject: message.split('\n')[0],
        body: null,
        footer: null,
        breaking: [],
        isBreaking: false,
        references: this.extractReferences(message)
      };
    }
  }

  /**
   * 从提交消息中提取 PR 和 Issue 引用
   * @param {string} message - 提交消息
   * @returns {Object} 引用对象
   */
  extractReferences(message) {
    const references = {
      prs: [],
      issues: []
    };

    // 匹配 PR: #123, PR #123, pull request #123
    const prPattern = /(?:PR|pull request|#)[\s#]*(\d+)/gi;
    let match;

    while ((match = prPattern.exec(message)) !== null) {
      const number = parseInt(match[1]);
      if (!references.prs.includes(number)) {
        references.prs.push(number);
      }
    }

    // 匹配 Issue: closes #123, fixes #123, resolves #123
    const issuePattern = /(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)[\s#]*(\d+)/gi;

    while ((match = issuePattern.exec(message)) !== null) {
      const number = parseInt(match[1]);
      if (!references.issues.includes(number)) {
        references.issues.push(number);
      }
    }

    return references;
  }

  /**
   * 获取所有标签
   * @returns {Promise<Array>} 标签列表
   */
  async getTags() {
    try {
      const tags = await this.git.tags();
      return tags.all || [];
    } catch (error) {
      throw new Error(`Failed to get tags: ${error.message}`);
    }
  }

  /**
   * 获取当前版本（最新的语义化版本标签）
   * @returns {Promise<string|null>} 当前版本
   */
  async getCurrentVersion() {
    try {
      const tags = await this.getTags();

      // 过滤出符合语义化版本的标签
      const semverTags = tags
        .filter(tag => {
          // 移除可能的 v 前缀
          const version = tag.replace(/^v/, '');
          return semver.valid(version);
        })
        .map(tag => tag.replace(/^v/, ''));

      if (semverTags.length === 0) {
        return null;
      }

      // 返回最高版本
      return semver.maxSatisfying(semverTags, '*');
    } catch (error) {
      throw new Error(`Failed to get current version: ${error.message}`);
    }
  }

  /**
   * 获取两个标签之间的提交
   * @param {string} fromTag - 起始标签
   * @param {string} toTag - 结束标签
   * @returns {Promise<Array>} 提交列表
   */
  async getCommitsBetweenTags(fromTag, toTag = 'HEAD') {
    try {
      const log = await this.git.log({
        from: fromTag,
        to: toTag
      });

      return log.all.map(commit => this.parseCommit(commit));
    } catch (error) {
      throw new Error(`Failed to get commits between tags: ${error.message}`);
    }
  }

  /**
   * 检查是否是 Git 仓库
   * @returns {Promise<boolean>}
   */
  async isGitRepository() {
    try {
      await this.git.status();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取远程仓库 URL
   * @returns {Promise<string|null>}
   */
  async getRemoteUrl() {
    try {
      const remotes = await this.git.getRemotes(true);
      const origin = remotes.find(remote => remote.name === 'origin');
      return origin ? origin.refs.fetch : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * 从远程 URL 解析仓库信息
   * @param {string} url - 远程 URL
   * @returns {Object|null} 仓库信息
   */
  parseRemoteUrl(url) {
    if (!url) return null;

    // 支持 HTTPS 和 SSH 格式
    // HTTPS: https://github.com/user/repo.git
    // SSH: git@github.com:user/repo.git

    let match;

    // HTTPS 格式
    match = url.match(/https?:\/\/([^/]+)\/([^/]+)\/([^/]+?)(\.git)?$/);
    if (match) {
      return {
        host: match[1],
        owner: match[2],
        repo: match[3].replace('.git', '')
      };
    }

    // SSH 格式
    match = url.match(/git@([^:]+):([^/]+)\/([^/]+?)(\.git)?$/);
    if (match) {
      return {
        host: match[1],
        owner: match[2],
        repo: match[3].replace('.git', '')
      };
    }

    return null;
  }
}

module.exports = GitAnalyzer;
