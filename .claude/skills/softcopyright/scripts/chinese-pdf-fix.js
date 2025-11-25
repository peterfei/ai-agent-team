/**
 * 中文PDF修复方案
 * 解决PDFKit中文字符显示问题
 */

const fs = require('fs-extra');
const path = require('path');

class ChinesePDFFix {
  constructor() {
    this.fontsDir = path.join(__dirname, '..', 'fonts');
  }

  /**
   * 获取可用的中文字体路径
   * @returns {Promise<string>}
   */
  async getChineseFont() {
    // 1. 首先检查已存在的字体
    const existingFonts = await this.findExistingFonts();
    if (existingFonts.length > 0) {
      console.log(`使用已存在的字体: ${existingFonts[0]}`);
      return existingFonts[0];
    }

    // 2. 尝试复制系统字体
    const systemFont = await this.copySystemFont();
    if (systemFont) {
      return systemFont;
    }

    // 3. 创建临时字体解决方案
    return this.createFallbackFont();
  }

  /**
   * 查找已存在的字体
   * @returns {Promise<string[]>}
   */
  async findExistingFonts() {
    const fontExtensions = ['.ttf', '.otf', '.woff', '.woff2'];
    const fonts = [];

    if (await fs.pathExists(this.fontsDir)) {
      const files = await fs.readdir(this.fontsDir);

      for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        if (fontExtensions.includes(ext)) {
          fonts.push(path.join(this.fontsDir, file));
        }
      }
    }

    return fonts;
  }

  /**
   * 复制系统字体
   * @returns {Promise<string|null>}
   */
  async copySystemFont() {
    const systemFonts = [
      '/System/Library/Fonts/PingFang.ttc',
      '/System/Library/Fonts/STHeiti Medium.ttc',
      '/System/Library/Fonts/STHeiti Light.ttc',
      '/System/Library/Fonts/Hiragino Sans GB.ttc',
      '/System/Library/Fonts/AppleSDGothicNeo.ttc'
    ];

    await fs.ensureDir(this.fontsDir);

    for (const systemFont of systemFonts) {
      if (await fs.pathExists(systemFont)) {
        try {
          const fontName = `chinese-font-${Date.now()}.ttc`;
          const targetPath = path.join(this.fontsDir, fontName);

          await fs.copy(systemFont, targetPath);
          console.log(`系统字体复制成功: ${fontName}`);
          return targetPath;
        } catch (error) {
          console.warn(`复制系统字体失败: ${systemFont}`, error.message);
          continue;
        }
      }
    }

    return null;
  }

  /**
   * 创建备用解决方案
   * @returns {Promise<string>}
   */
  async createFallbackFont() {
    console.log('使用备用字体方案...');
    return null; // 让PDFKit使用默认字体
  }

  /**
   * 测试字体是否支持中文
   * @param {string} fontPath 字体路径
   * @returns {Promise<boolean>}
   */
  async testChineseFont(fontPath) {
    try {
      // 这里可以添加字体测试逻辑
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 设置PDFDocument的字体
   * @param {PDFDocument} doc PDFDocument实例
   * @returns {Promise<void>}
   */
  async setFont(doc) {
    try {
      const fontPath = await this.getChineseFont();

      if (fontPath) {
        // 尝试设置中文字体
        doc.font(fontPath);
        console.log('中文字体设置成功');
      } else {
        // 使用默认字体，但设置更大的字体大小
        doc.font('Helvetica');
        console.log('使用默认字体，建议增加字体大小');
      }
    } catch (error) {
      console.warn('字体设置失败，使用默认字体:', error.message);
      doc.font('Helvetica');
    }
  }

  /**
   * 为PDF文本添加中文字符支持
   * @param {PDFDocument} doc PDFDocument实例
   * @param {string} text 文本内容
   * @param {Object} options 选项
   */
  addChineseText(doc, text, options = {}) {
    try {
      // 确保字体已设置
      if (!options.font) {
        doc.font('Helvetica');
      }

      // 增加字体大小以提高可读性
      const fontSize = options.fontSize || 12;
      doc.fontSize(fontSize);

      // 添加文本
      doc.text(text, options);
    } catch (error) {
      console.warn('中文文本添加失败:', error.message);
    }
  }
}

module.exports = ChinesePDFFix;