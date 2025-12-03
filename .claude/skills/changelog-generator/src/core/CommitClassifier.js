/**
 * CommitClassifier - 提交分类器
 * 负责对提交进行分类、分组和排序
 */
class CommitClassifier {
  /**
   * @param {Object} config - 配置对象
   */
  constructor(config) {
    this.config = config;
    this.types = config.types || this.getDefaultTypes();
    this.excludeTypes = config.exclude?.types || [];
    this.excludeScopes = config.exclude?.scopes || [];
  }

  /**
   * 获取默认的提交类型配置
   * @returns {Array} 类型配置数组
   */
  getDefaultTypes() {
    return [
      { type: 'feat', section: 'Features', emoji: '✨', priority: 1 },
      { type: 'fix', section: 'Bug Fixes', emoji: '🐛', priority: 2 },
      { type: 'perf', section: 'Performance', emoji: '⚡', priority: 3 },
      { type: 'refactor', section: 'Code Refactoring', emoji: '♻️', priority: 4 },
      { type: 'docs', section: 'Documentation', emoji: '📝', priority: 5 },
      { type: 'test', section: 'Tests', emoji: '✅', priority: 6 },
      { type: 'build', section: 'Build System', emoji: '📦', priority: 7 },
      { type: 'ci', section: 'CI/CD', emoji: '👷', priority: 8 },
      { type: 'style', section: 'Styles', emoji: '💄', priority: 9, hidden: true },
      { type: 'chore', section: 'Chores', emoji: '🔧', priority: 10, hidden: true },
      { type: 'revert', section: 'Reverts', emoji: '⏪', priority: 11 }
    ];
  }

  /**
   * 分类提交列表
   * @param {Array} commits - 提交列表
   * @returns {Object} 分类后的提交对象
   */
  classify(commits) {
    // 过滤和分类
    const filtered = commits.filter(commit => this.shouldInclude(commit));

    // 按类型分组
    const grouped = this.groupByType(filtered);

    // 分离破坏性变更
    const { breaking, regular } = this.separateBreakingChanges(grouped);

    // 排序
    const sorted = this.sortGroups(regular);

    return {
      breaking,
      changes: sorted,
      stats: this.generateStats(commits, filtered)
    };
  }

  /**
   * 判断是否应该包含此提交
   * @param {Object} commit - 提交对象
   * @returns {boolean}
   */
  shouldInclude(commit) {
    // 检查是否排除此类型
    if (this.excludeTypes.includes(commit.type)) {
      return false;
    }

    // 检查是否排除此 scope
    if (commit.scope && this.excludeScopes.includes(commit.scope)) {
      return false;
    }

    // 检查配置中是否标记为 hidden
    const typeConfig = this.types.find(t => t.type === commit.type);
    if (typeConfig && typeConfig.hidden) {
      return false;
    }

    return true;
  }

  /**
   * 按类型分组
   * @param {Array} commits - 提交列表
   * @returns {Object} 分组后的对象
   */
  groupByType(commits) {
    const groups = {};

    commits.forEach(commit => {
      const type = commit.type || 'other';

      if (!groups[type]) {
        groups[type] = [];
      }

      groups[type].push(commit);
    });

    return groups;
  }

  /**
   * 分离破坏性变更
   * @param {Object} grouped - 分组后的提交
   * @returns {Object} { breaking: [], regular: {} }
   */
  separateBreakingChanges(grouped) {
    const breaking = [];
    const regular = {};

    Object.keys(grouped).forEach(type => {
      const commits = grouped[type];

      regular[type] = [];

      commits.forEach(commit => {
        if (commit.isBreaking) {
          breaking.push(commit);
        } else {
          regular[type].push(commit);
        }
      });

      // 如果该类型没有非破坏性提交，删除这个键
      if (regular[type].length === 0) {
        delete regular[type];
      }
    });

    return { breaking, regular };
  }

  /**
   * 排序分组
   * @param {Object} groups - 分组对象
   * @returns {Array} 排序后的数组
   */
  sortGroups(groups) {
    const sorted = [];

    // 获取所有类型并按优先级排序
    const types = Object.keys(groups).sort((a, b) => {
      const configA = this.types.find(t => t.type === a);
      const configB = this.types.find(t => t.type === b);

      const priorityA = configA ? configA.priority : 999;
      const priorityB = configB ? configB.priority : 999;

      return priorityA - priorityB;
    });

    types.forEach(type => {
      const typeConfig = this.types.find(t => t.type === type) || {
        type,
        section: this.capitalize(type),
        emoji: '📝',
        priority: 999
      };

      // 按 scope 分组
      const byScope = this.groupByScope(groups[type]);

      sorted.push({
        type,
        section: typeConfig.section,
        emoji: typeConfig.emoji,
        commits: groups[type],
        byScope
      });
    });

    return sorted;
  }

  /**
   * 按 scope 分组
   * @param {Array} commits - 提交列表
   * @returns {Object} 按 scope 分组的对象
   */
  groupByScope(commits) {
    const byScope = {};

    commits.forEach(commit => {
      const scope = commit.scope || 'general';

      if (!byScope[scope]) {
        byScope[scope] = [];
      }

      byScope[scope].push(commit);
    });

    return byScope;
  }

  /**
   * 生成统计信息
   * @param {Array} allCommits - 所有提交
   * @param {Array} includedCommits - 包含的提交
   * @returns {Object} 统计对象
   */
  generateStats(allCommits, includedCommits) {
    const stats = {
      total: allCommits.length,
      included: includedCommits.length,
      excluded: allCommits.length - includedCommits.length,
      byType: {},
      breaking: 0,
      authors: new Set()
    };

    includedCommits.forEach(commit => {
      // 按类型统计
      const type = commit.type || 'other';
      if (!stats.byType[type]) {
        stats.byType[type] = 0;
      }
      stats.byType[type]++;

      // 统计破坏性变更
      if (commit.isBreaking) {
        stats.breaking++;
      }

      // 统计作者
      stats.authors.add(commit.author);
    });

    // 转换 Set 为数组
    stats.authors = Array.from(stats.authors);

    return stats;
  }

  /**
   * 合并相似的提交
   * @param {Array} commits - 提交列表
   * @returns {Array} 合并后的提交列表
   */
  mergeSimilarCommits(commits) {
    // TODO: 实现智能合并逻辑
    // 例如：将多个相似的小改动合并为一个条目
    return commits;
  }

  /**
   * 首字母大写
   * @param {string} str - 字符串
   * @returns {string}
   */
  capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * 获取类型配置
   * @param {string} type - 类型名称
   * @returns {Object|null}
   */
  getTypeConfig(type) {
    return this.types.find(t => t.type === type) || null;
  }

  /**
   * 验证提交格式
   * @param {Object} commit - 提交对象
   * @returns {Object} 验证结果
   */
  validateCommit(commit) {
    const errors = [];
    const warnings = [];

    // 检查类型是否有效
    const typeConfig = this.getTypeConfig(commit.type);
    if (!typeConfig && commit.type !== 'other') {
      warnings.push(`Unknown commit type: ${commit.type}`);
    }

    // 检查 subject 长度
    if (commit.subject && commit.subject.length > 100) {
      warnings.push('Subject is too long (>100 characters)');
    }

    // 检查是否有 subject
    if (!commit.subject || commit.subject.trim() === '') {
      errors.push('Commit must have a subject');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}

module.exports = CommitClassifier;
