const fs = require('fs').promises;
const path = require('path');
const Handlebars = require('handlebars');

/**
 * TemplateManager - 模板管理器
 * 负责管理、加载和渲染自定义模板
 */
class TemplateManager {
  constructor() {
    this.templates = new Map();
    this.partials = new Map();
    this.helpers = new Map();
    this.registerBuiltInHelpers();
  }

  /**
   * 注册内置辅助函数
   */
  registerBuiltInHelpers() {
    // 日期格式化
    this.registerHelper('formatDate', (date, format = 'YYYY-MM-DD') => {
      if (!date) return '';
      const d = new Date(date);

      if (format === 'YYYY-MM-DD') {
        return d.toISOString().split('T')[0];
      }

      if (format === 'relative') {
        const now = new Date();
        const diff = now - d;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return '今天';
        if (days === 1) return '昨天';
        if (days < 7) return `${days}天前`;
        if (days < 30) return `${Math.floor(days / 7)}周前`;
        if (days < 365) return `${Math.floor(days / 30)}个月前`;
        return `${Math.floor(days / 365)}年前`;
      }

      return d.toLocaleDateString();
    });

    // 条件判断
    this.registerHelper('if_eq', function(a, b, options) {
      return a === b ? options.fn(this) : options.inverse(this);
    });

    this.registerHelper('if_ne', function(a, b, options) {
      return a !== b ? options.fn(this) : options.inverse(this);
    });

    this.registerHelper('if_gt', function(a, b, options) {
      return a > b ? options.fn(this) : options.inverse(this);
    });

    this.registerHelper('if_lt', function(a, b, options) {
      return a < b ? options.fn(this) : options.inverse(this);
    });

    // 数组操作
    this.registerHelper('length', (array) => {
      return Array.isArray(array) ? array.length : 0;
    });

    this.registerHelper('first', (array, n = 1) => {
      if (!Array.isArray(array)) return [];
      return array.slice(0, n);
    });

    this.registerHelper('last', (array, n = 1) => {
      if (!Array.isArray(array)) return [];
      return array.slice(-n);
    });

    this.registerHelper('join', (array, separator = ', ') => {
      if (!Array.isArray(array)) return '';
      return array.join(separator);
    });

    // 字符串操作
    this.registerHelper('uppercase', (str) => {
      return str ? str.toUpperCase() : '';
    });

    this.registerHelper('lowercase', (str) => {
      return str ? str.toLowerCase() : '';
    });

    this.registerHelper('capitalize', (str) => {
      if (!str) return '';
      return str.charAt(0).toUpperCase() + str.slice(1);
    });

    this.registerHelper('truncate', (str, length = 50) => {
      if (!str) return '';
      if (str.length <= length) return str;
      return str.substring(0, length) + '...';
    });

    // Markdown 链接生成
    this.registerHelper('mdLink', (text, url) => {
      return new Handlebars.SafeString(`[${text}](${url})`);
    });

    this.registerHelper('commitLink', (hash, shortHash, urlTemplate) => {
      if (!urlTemplate) return shortHash;
      const url = urlTemplate.replace('{{hash}}', hash);
      return new Handlebars.SafeString(`[${shortHash}](${url})`);
    });

    this.registerHelper('prLink', (prNumber, urlTemplate) => {
      if (!urlTemplate) return `#${prNumber}`;
      const url = urlTemplate.replace('{{id}}', prNumber);
      return new Handlebars.SafeString(`[#${prNumber}](${url})`);
    });

    this.registerHelper('issueLink', (issueNumber, urlTemplate) => {
      if (!urlTemplate) return `#${issueNumber}`;
      const url = urlTemplate.replace('{{id}}', issueNumber);
      return new Handlebars.SafeString(`[#${issueNumber}](${url})`);
    });

    // 条件显示 emoji
    this.registerHelper('emoji', (emoji, showEmoji) => {
      return showEmoji !== false ? emoji + ' ' : '';
    });

    // 数学运算
    this.registerHelper('add', (a, b) => a + b);
    this.registerHelper('subtract', (a, b) => a - b);
    this.registerHelper('multiply', (a, b) => a * b);
    this.registerHelper('divide', (a, b) => b !== 0 ? a / b : 0);

    // JSON 序列化
    this.registerHelper('json', (obj) => {
      return JSON.stringify(obj, null, 2);
    });

    // 循环辅助
    this.registerHelper('times', function(n, block) {
      let result = '';
      for (let i = 0; i < n; i++) {
        result += block.fn(i);
      }
      return result;
    });

    // 默认值
    this.registerHelper('default', (value, defaultValue) => {
      return value != null && value !== '' ? value : defaultValue;
    });
  }

  /**
   * 注册自定义辅助函数
   * @param {string} name - 辅助函数名称
   * @param {Function} fn - 辅助函数
   */
  registerHelper(name, fn) {
    this.helpers.set(name, fn);
    Handlebars.registerHelper(name, fn);
  }

  /**
   * 注册部分模板
   * @param {string} name - 部分模板名称
   * @param {string} template - 模板内容
   */
  registerPartial(name, template) {
    this.partials.set(name, template);
    Handlebars.registerPartial(name, template);
  }

  /**
   * 从文件加载部分模板
   * @param {string} name - 部分模板名称
   * @param {string} filePath - 文件路径
   */
  async loadPartial(name, filePath) {
    const content = await fs.readFile(filePath, 'utf-8');
    this.registerPartial(name, content);
  }

  /**
   * 加载目录中的所有部分模板
   * @param {string} dirPath - 目录路径
   */
  async loadPartialsFromDir(dirPath) {
    try {
      const files = await fs.readdir(dirPath);

      for (const file of files) {
        if (file.endsWith('.hbs') || file.endsWith('.handlebars')) {
          const filePath = path.join(dirPath, file);
          const name = path.basename(file, path.extname(file));
          await this.loadPartial(name, filePath);
        }
      }
    } catch (error) {
      // 目录不存在，忽略
    }
  }

  /**
   * 加载模板
   * @param {string} name - 模板名称
   * @param {string} template - 模板内容或文件路径
   * @returns {Promise<void>}
   */
  async loadTemplate(name, template) {
    // 检查是否是文件路径
    if (template.includes('/') || template.includes('\\')) {
      try {
        const content = await fs.readFile(template, 'utf-8');
        this.templates.set(name, content);
      } catch (error) {
        throw new Error(`Failed to load template from ${template}: ${error.message}`);
      }
    } else {
      this.templates.set(name, template);
    }
  }

  /**
   * 获取模板
   * @param {string} name - 模板名称
   * @returns {string|null} 模板内容
   */
  getTemplate(name) {
    return this.templates.get(name) || null;
  }

  /**
   * 渲染模板
   * @param {string} name - 模板名称
   * @param {Object} data - 数据对象
   * @returns {string} 渲染后的内容
   */
  render(name, data) {
    const template = this.getTemplate(name);
    if (!template) {
      throw new Error(`Template "${name}" not found`);
    }

    const compiled = Handlebars.compile(template);
    return compiled(data);
  }

  /**
   * 直接渲染模板字符串
   * @param {string} template - 模板字符串
   * @param {Object} data - 数据对象
   * @returns {string} 渲染后的内容
   */
  renderString(template, data) {
    const compiled = Handlebars.compile(template);
    return compiled(data);
  }

  /**
   * 验证模板语法
   * @param {string} template - 模板内容
   * @returns {Object} {valid: boolean, error: string|null}
   */
  validateTemplate(template) {
    try {
      Handlebars.compile(template);
      return { valid: true, error: null };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  /**
   * 列出所有已注册的模板
   * @returns {Array<string>} 模板名称数组
   */
  listTemplates() {
    return Array.from(this.templates.keys());
  }

  /**
   * 列出所有已注册的辅助函数
   * @returns {Array<string>} 辅助函数名称数组
   */
  listHelpers() {
    return Array.from(this.helpers.keys());
  }

  /**
   * 列出所有已注册的部分模板
   * @returns {Array<string>} 部分模板名称数组
   */
  listPartials() {
    return Array.from(this.partials.keys());
  }

  /**
   * 清除所有模板
   */
  clearTemplates() {
    this.templates.clear();
  }

  /**
   * 清除所有部分模板
   */
  clearPartials() {
    this.partials.clear();
    Handlebars.unregisterPartial();
  }

  /**
   * 清除所有辅助函数（除了内置的）
   */
  clearHelpers() {
    this.helpers.clear();
    this.registerBuiltInHelpers();
  }
}

module.exports = TemplateManager;
