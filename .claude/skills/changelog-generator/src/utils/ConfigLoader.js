const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

/**
 * ConfigLoader - 配置加载器
 * 负责加载和合并配置文件
 */
class ConfigLoader {
  /**
   * @param {string} cwd - 当前工作目录
   */
  constructor(cwd) {
    this.cwd = cwd;
    this.configFiles = [
      '.changelogrc.json',
      '.changelogrc.yml',
      '.changelogrc.yaml',
      'changelog.config.js'
    ];
  }

  /**
   * 加载配置
   * @returns {Promise<Object>} 配置对象
   */
  async load() {
    // 尝试从各个配置文件加载
    for (const configFile of this.configFiles) {
      const configPath = path.join(this.cwd, configFile);

      try {
        await fs.access(configPath);
        const config = await this.loadConfigFile(configPath);
        return this.mergeWithDefaults(config);
      } catch (error) {
        // 文件不存在，继续尝试下一个
        continue;
      }
    }

    // 如果没有找到配置文件，返回默认配置
    console.warn('⚠️  未找到配置文件，使用默认配置');
    return this.getDefaultConfig();
  }

  /**
   * 加载配置文件
   * @param {string} configPath - 配置文件路径
   * @returns {Promise<Object>} 配置对象
   */
  async loadConfigFile(configPath) {
    const ext = path.extname(configPath);

    if (ext === '.json') {
      const content = await fs.readFile(configPath, 'utf-8');
      return JSON.parse(content);
    }

    if (ext === '.yml' || ext === '.yaml') {
      const content = await fs.readFile(configPath, 'utf-8');
      return yaml.load(content);
    }

    if (ext === '.js') {
      return require(configPath);
    }

    throw new Error(`Unsupported config file format: ${ext}`);
  }

  /**
   * 合并配置与默认值
   * @param {Object} config - 用户配置
   * @returns {Object} 合并后的配置
   */
  mergeWithDefaults(config) {
    const defaults = this.getDefaultConfig();
    return this.deepMerge(defaults, config);
  }

  /**
   * 深度合并对象
   * @param {Object} target - 目标对象
   * @param {Object} source - 源对象
   * @returns {Object} 合并后的对象
   */
  deepMerge(target, source) {
    const result = { ...target };

    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }

    return result;
  }

  /**
   * 获取默认配置
   * @returns {Object} 默认配置
   */
  getDefaultConfig() {
    return {
      version: '0.1.0',
      format: 'keepachangelog',
      language: 'zh-CN',

      git: {
        remoteUrl: '',
        compareUrlFormat: ''
      },

      display: {
        emoji: true,
        groupByType: true,
        showAuthor: false,
        showPR: true,
        showIssue: true,
        showCommitHash: false
      },

      types: [
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
      ],

      template: {
        path: null,
        commitUrl: '',
        compareUrl: '',
        issueUrl: '',
        prUrl: ''
      },

      release: {
        autoVersion: true,
        versionPrefix: 'v',
        createGitTag: false,
        pushTag: false,
        createGithubRelease: false,
        draftRelease: false
      },

      exclude: {
        types: [],
        scopes: [],
        commits: []
      }
    };
  }

  /**
   * 保存配置
   * @param {Object} config - 配置对象
   * @param {string} format - 格式（json, yaml）
   * @returns {Promise<void>}
   */
  async save(config, format = 'json') {
    const filename = format === 'json' ? '.changelogrc.json' : '.changelogrc.yml';
    const configPath = path.join(this.cwd, filename);

    let content;

    if (format === 'json') {
      content = JSON.stringify(config, null, 2);
    } else {
      content = yaml.dump(config);
    }

    await fs.writeFile(configPath, content, 'utf-8');
  }
}

module.exports = ConfigLoader;
