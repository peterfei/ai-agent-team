const fs = require('fs-extra');
const path = require('path');
const https = require('https');
const http = require('http');
const chalk = require('chalk');

/**
 * 字体管理器
 * 处理中文字体的下载和管理
 */
class FontManager {
  constructor() {
    this.fontsDir = path.join(__dirname, '..', 'fonts');
    this.defaultFont = 'NotoSansCJK-Regular';
  }

  /**
   * 初始化字体
   * @returns {Promise<string>} 字体文件路径
   */
  async initFont() {
    await this.ensureFontsDir();

    // 尝试下载字体
    const fontPath = await this.downloadFont();

    if (fontPath) {
      console.log(chalk.green('✅ 中文字体加载成功'));
      return fontPath;
    } else {
      console.log(chalk.yellow('⚠️  使用系统字体'));
      return null;
    }
  }

  /**
   * 确保字体目录存在
   */
  async ensureFontsDir() {
    await fs.ensureDir(this.fontsDir);
  }

  /**
   * 下载中文字体
   * @returns {Promise<string|null>} 字体文件路径
   */
  async downloadFont() {
    const fonts = [
      {
        name: 'NotoSansCJK-Regular',
        url: 'https://fonts.gstatic.com/s/notosanssc/v35/k3kXo84MPvpLmixcA63oeALZTYKL2S24UEg-2_c.woff2',
        filename: 'NotoSansCJK-Regular.woff2'
      },
      {
        name: 'NotoSansSC-Regular',
        url: 'https://fonts.gstatic.com/s/notosanssc/v35/k3kXo84MPvpLmixcA63oeALZTYKL2S24UEg-2_c.woff2',
        filename: 'NotoSansSC-Regular.woff2'
      },
      {
        // 备选方案：使用开源中文字体
        name: 'SourceHanSans-Regular',
        url: 'https://github.com/adobe-fonts/source-han-sans/releases/download/2.004R/SourceHanSansSC-Regular.otf',
        filename: 'SourceHanSansSC-Regular.otf'
      }
    ];

    for (const font of fonts) {
      const fontPath = path.join(this.fontsDir, font.filename);

      // 如果字体已存在，直接返回
      if (await fs.pathExists(fontPath)) {
        console.log(chalk.cyan(`📁 使用已存在的字体: ${font.name}`));
        return fontPath;
      }

      // 尝试下载字体
      console.log(chalk.blue(`📥 下载字体: ${font.name}`));

      try {
        await this.downloadFile(font.url, fontPath);
        console.log(chalk.green(`✅ 字体下载成功: ${font.name}`));
        return fontPath;
      } catch (error) {
        console.warn(chalk.yellow(`⚠️  下载 ${font.name} 失败: ${error.message}`));
        continue;
      }
    }

    // 如果所有字体都下载失败，尝试复制系统字体
    return await this.copySystemFont();
  }

  /**
   * 复制系统字体
   * @returns {Promise<string|null>} 字体文件路径
   */
  async copySystemFont() {
    const systemFonts = [
      '/System/Library/Fonts/STHeiti Medium.ttc',
      '/System/Library/Fonts/STHeiti Light.ttc',
      '/System/Library/Fonts/PingFang.ttc',
      '/System/Library/Fonts/Hiragino Sans GB.ttc',
      '/Windows/Fonts/msyh.ttc',
      '/Windows/Fonts/simhei.ttf',
      '/usr/share/fonts/truetype/wqy/wqy-microhei.ttc'
    ];

    for (const systemFont of systemFonts) {
      if (await fs.pathExists(systemFont)) {
        try {
          const fontName = path.basename(systemFont);
          const targetPath = path.join(this.fontsDir, fontName);

          await fs.copy(systemFont, targetPath);
          console.log(chalk.green(`✅ 系统字体复制成功: ${fontName}`));
          return targetPath;
        } catch (error) {
          console.warn(chalk.yellow(`⚠️  复制系统字体失败: ${systemFont}`));
          continue;
        }
      }
    }

    return null;
  }

  /**
   * 下载文件
   * @param {string} url 下载链接
   * @param {string} targetPath 目标路径
   * @returns {Promise<void>}
   */
  async downloadFile(url, targetPath) {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;

      const fileStream = fs.createWriteStream(targetPath);

      protocol.get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
          return;
        }

        response.pipe(fileStream);

        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });

        fileStream.on('error', (error) => {
          fs.unlink(targetPath, () => {}); // 删除不完整的文件
          reject(error);
        });

      }).on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * 获取字体路径
   * @returns {Promise<string|null>}
   */
  async getFontPath() {
    const fontFiles = await fs.readdir(this.fontsDir);

    for (const file of fontFiles) {
      if (file.match(/\.(ttf|otf|woff|woff2)$/i)) {
        return path.join(this.fontsDir, file);
      }
    }

    return await this.initFont();
  }

  /**
   * 清理旧字体文件
   */
  async cleanupOldFonts() {
    try {
      const files = await fs.readdir(this.fontsDir);
      const maxSize = 5; // 最多保留5个字体文件

      if (files.length > maxSize) {
        // 按修改时间排序，删除最旧的文件
        const fileStats = await Promise.all(
          files.map(async (file) => {
            const filePath = path.join(this.fontsDir, file);
            const stats = await fs.stat(filePath);
            return { file, filePath, mtime: stats.mtime };
          })
        );

        fileStats.sort((a, b) => a.mtime - b.mtime);

        // 删除最旧的文件
        for (let i = 0; i < fileStats.length - maxSize; i++) {
          await fs.remove(fileStats[i].filePath);
          console.log(chalk.gray(`🗑️  删除旧字体: ${fileStats[i].file}`));
        }
      }
    } catch (error) {
      console.warn(chalk.yellow('⚠️  清理字体文件失败:'), error.message);
    }
  }
}

module.exports = FontManager;