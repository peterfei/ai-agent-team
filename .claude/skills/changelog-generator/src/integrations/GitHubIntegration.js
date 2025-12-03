const { Octokit } = require('@octokit/rest');

/**
 * GitHubIntegration - GitHub API 集成
 * 负责与 GitHub API 交互，获取 PR 信息、创建 Release 等
 */
class GitHubIntegration {
  /**
   * @param {Object} config - 配置对象
   * @param {string} config.token - GitHub Personal Access Token
   * @param {string} config.owner - 仓库所有者
   * @param {string} config.repo - 仓库名称
   */
  constructor(config) {
    this.config = config;
    this.owner = config.owner;
    this.repo = config.repo;

    // 初始化 Octokit
    this.octokit = new Octokit({
      auth: config.token || process.env.GITHUB_TOKEN
    });
  }

  /**
   * 获取 PR 信息
   * @param {number} prNumber - PR 编号
   * @returns {Promise<Object|null>} PR 信息
   */
  async getPRInfo(prNumber) {
    try {
      const { data } = await this.octokit.pulls.get({
        owner: this.owner,
        repo: this.repo,
        pull_number: prNumber
      });

      return {
        number: data.number,
        title: data.title,
        body: data.body,
        labels: data.labels.map(l => l.name),
        author: data.user.login,
        authorUrl: data.user.html_url,
        mergedAt: data.merged_at,
        url: data.html_url,
        state: data.state,
        merged: data.merged
      };
    } catch (error) {
      console.warn(`Failed to fetch PR #${prNumber}:`, error.message);
      return null;
    }
  }

  /**
   * 批量获取 PR 信息
   * @param {Array<number>} prNumbers - PR 编号数组
   * @returns {Promise<Map<number, Object>>} PR 信息映射
   */
  async getPRInfoBatch(prNumbers) {
    const prInfoMap = new Map();

    // 并发获取 PR 信息
    const promises = prNumbers.map(async (prNumber) => {
      const info = await this.getPRInfo(prNumber);
      if (info) {
        prInfoMap.set(prNumber, info);
      }
    });

    await Promise.all(promises);

    return prInfoMap;
  }

  /**
   * 创建 GitHub Release
   * @param {Object} options - Release 选项
   * @param {string} options.tagName - 标签名称
   * @param {string} options.name - Release 名称
   * @param {string} options.body - Release 描述（Markdown）
   * @param {boolean} options.draft - 是否为草稿
   * @param {boolean} options.prerelease - 是否为预发布
   * @returns {Promise<Object>} Release 信息
   */
  async createRelease(options) {
    try {
      const { data } = await this.octokit.repos.createRelease({
        owner: this.owner,
        repo: this.repo,
        tag_name: options.tagName,
        name: options.name || options.tagName,
        body: options.body,
        draft: options.draft || false,
        prerelease: options.prerelease || false
      });

      return {
        id: data.id,
        url: data.html_url,
        uploadUrl: data.upload_url,
        tagName: data.tag_name
      };
    } catch (error) {
      throw new Error(`Failed to create GitHub Release: ${error.message}`);
    }
  }

  /**
   * 更新现有的 Release
   * @param {number} releaseId - Release ID
   * @param {Object} options - 更新选项
   * @returns {Promise<Object>} 更新后的 Release 信息
   */
  async updateRelease(releaseId, options) {
    try {
      const { data } = await this.octokit.repos.updateRelease({
        owner: this.owner,
        repo: this.repo,
        release_id: releaseId,
        ...options
      });

      return {
        id: data.id,
        url: data.html_url,
        tagName: data.tag_name
      };
    } catch (error) {
      throw new Error(`Failed to update GitHub Release: ${error.message}`);
    }
  }

  /**
   * 根据标签名称查找 Release
   * @param {string} tagName - 标签名称
   * @returns {Promise<Object|null>} Release 信息
   */
  async getReleaseByTag(tagName) {
    try {
      const { data } = await this.octokit.repos.getReleaseByTag({
        owner: this.owner,
        repo: this.repo,
        tag: tagName
      });

      return {
        id: data.id,
        url: data.html_url,
        tagName: data.tag_name,
        name: data.name,
        body: data.body
      };
    } catch (error) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * 获取仓库信息
   * @returns {Promise<Object>} 仓库信息
   */
  async getRepoInfo() {
    try {
      const { data } = await this.octokit.repos.get({
        owner: this.owner,
        repo: this.repo
      });

      return {
        name: data.name,
        fullName: data.full_name,
        description: data.description,
        url: data.html_url,
        defaultBranch: data.default_branch
      };
    } catch (error) {
      throw new Error(`Failed to get repo info: ${error.message}`);
    }
  }

  /**
   * 获取提交的 PR 关联信息
   * @param {string} sha - 提交 SHA
   * @returns {Promise<Array<number>>} PR 编号数组
   */
  async getCommitPRs(sha) {
    try {
      const { data } = await this.octokit.repos.listPullRequestsAssociatedWithCommit({
        owner: this.owner,
        repo: this.repo,
        commit_sha: sha
      });

      return data.map(pr => pr.number);
    } catch (error) {
      console.warn(`Failed to fetch PRs for commit ${sha}:`, error.message);
      return [];
    }
  }

  /**
   * 验证 Token 是否有效
   * @returns {Promise<boolean>} Token 是否有效
   */
  async validateToken() {
    try {
      await this.octokit.users.getAuthenticated();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 从 URL 解析仓库信息
   * @param {string} url - GitHub 仓库 URL
   * @returns {Object|null} 解析后的信息 {owner, repo}
   */
  static parseRepoUrl(url) {
    if (!url) return null;

    // 支持 HTTPS 和 SSH 格式
    // HTTPS: https://github.com/owner/repo.git
    // SSH: git@github.com:owner/repo.git

    let match;

    // HTTPS 格式
    match = url.match(/https?:\/\/github\.com\/([^/]+)\/([^/]+?)(\.git)?$/);
    if (match) {
      return {
        owner: match[1],
        repo: match[2].replace('.git', '')
      };
    }

    // SSH 格式
    match = url.match(/git@github\.com:([^/]+)\/([^/]+?)(\.git)?$/);
    if (match) {
      return {
        owner: match[1],
        repo: match[2].replace('.git', '')
      };
    }

    return null;
  }

  /**
   * 生成 Release Notes（从 CHANGELOG 片段）
   * @param {Object} versionData - 版本数据
   * @returns {string} Release Notes (Markdown)
   */
  generateReleaseNotes(versionData) {
    let notes = '';

    // 添加破坏性变更
    if (versionData.breaking && versionData.breaking.length > 0) {
      notes += '## 💥 BREAKING CHANGES\n\n';
      versionData.breaking.forEach(commit => {
        notes += `- ${commit.scope ? `**${commit.scope}:** ` : ''}${commit.subject}\n`;
      });
      notes += '\n';
    }

    // 添加各类变更
    if (versionData.changes && versionData.changes.length > 0) {
      versionData.changes.forEach(category => {
        notes += `## ${category.emoji || ''} ${category.section}\n\n`;
        category.commits.forEach(commit => {
          const scope = commit.scope ? `**${commit.scope}:** ` : '';
          const pr = commit.references?.prs?.length > 0
            ? ` (#${commit.references.prs.join(', #')})`
            : '';
          notes += `- ${scope}${commit.subject}${pr}\n`;
        });
        notes += '\n';
      });
    }

    return notes.trim();
  }
}

module.exports = GitHubIntegration;
