const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const moment = require('moment');

/**
 * 确保目录存在
 * @param {string} dirPath 目录路径
 */
async function ensureDirectory(dirPath) {
  try {
    await fs.ensureDir(dirPath);
    return true;
  } catch (error) {
    console.error(chalk.red(`❌ 创建目录失败: ${dirPath}`), error.message);
    return false;
  }
}

/**
 * 检查文件是否存在
 * @param {string} filePath 文件路径
 * @returns {Promise<boolean>}
 */
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * 安全地读取文件
 * @param {string} filePath 文件路径
 * @param {string} encoding 编码格式
 * @returns {Promise<string|null>}
 */
async function safeReadFile(filePath, encoding = 'utf8') {
  try {
    return await fs.readFile(filePath, encoding);
  } catch (error) {
    console.warn(chalk.yellow(`⚠️  读取文件失败: ${filePath}`), error.message);
    return null;
  }
}

/**
 * 安全地写入文件
 * @param {string} filePath 文件路径
 * @param {string} content 文件内容
 * @param {string} encoding 编码格式
 * @returns {Promise<boolean>}
 */
async function safeWriteFile(filePath, content, encoding = 'utf8') {
  try {
    await fs.writeFile(filePath, content, encoding);
    return true;
  } catch (error) {
    console.error(chalk.red(`❌ 写入文件失败: ${filePath}`), error.message);
    return false;
  }
}

/**
 * 获取文件大小（人类可读格式）
 * @param {number} bytes 字节数
 * @returns {string}
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 获取相对路径
 * @param {string} fromPath 起始路径
 * @param {string} toPath 目标路径
 * @returns {string}
 */
function getRelativePath(fromPath, toPath) {
  return path.relative(fromPath, toPath).replace(/\\/g, '/');
}

/**
 * 生成时间戳
 * @param {string} format 时间格式
 * @returns {string}
 */
function getTimestamp(format = 'YYYY-MM-DD HH:mm:ss') {
  return moment().format(format);
}

/**
 * 生成唯一文件名
 * @param {string} baseName 基础名称
 * @param {string} extension 文件扩展名
 * @returns {string}
 */
function generateUniqueFileName(baseName, extension = '') {
  const timestamp = moment().format('YYYYMMDD_HHMMSS');
  const random = Math.random().toString(36).substr(2, 6);
  const fileName = `${baseName}_${timestamp}_${random}`;

  return extension ? `${fileName}${extension}` : fileName;
}

/**
 * 延迟执行
 * @param {number} ms 延迟毫秒数
 * @returns {Promise}
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 进度条显示
 * @param {number} current 当前值
 * @param {number} total 总值
 * @param {number} width 进度条宽度
 * @returns {string}
 */
function createProgressBar(current, total, width = 30) {
  const percentage = Math.round((current / total) * 100);
  const filled = Math.round((width * current) / total);
  const empty = width - filled;

  const filledBar = '█'.repeat(filled);
  const emptyBar = '░'.repeat(empty);

  return `[${filledBar}${emptyBar}] ${percentage}% (${current}/${total})`;
}

/**
 * 验证项目路径
 * @param {string} projectPath 项目路径
 * @returns {Promise<{valid: boolean, error?: string}>}
 */
async function validateProjectPath(projectPath) {
  try {
    const resolvedPath = path.resolve(projectPath);

    // 检查路径是否存在
    if (!await fs.pathExists(resolvedPath)) {
      return {
        valid: false,
        error: '路径不存在'
      };
    }

    // 检查是否为目录
    const stats = await fs.stat(resolvedPath);
    if (!stats.isDirectory()) {
      return {
        valid: false,
        error: '路径不是目录'
      };
    }

    // 检查是否包含源代码文件
    const files = await fs.readdir(resolvedPath);
    const hasSourceFiles = files.some(file => {
      const ext = path.extname(file);
      return ['.js', '.ts', '.py', '.java', '.c', '.cpp', '.go', '.rs', '.html', '.css'].includes(ext);
    });

    if (!hasSourceFiles) {
      return {
        valid: false,
        error: '目录中未检测到源代码文件'
      };
    }

    return { valid: true };

  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
}

/**
 * 清理文件名，移除非法字符
 * @param {string} fileName 原始文件名
 * @returns {string}
 */
function sanitizeFileName(fileName) {
  // 移除或替换非法字符
  return fileName
    .replace(/[<>:"/\\|?*]/g, '_') // 替换非法字符
    .replace(/\s+/g, '_') // 替换空格
    .replace(/_{2,}/g, '_') // 合并多个下划线
    .replace(/^_|_$/g, ''); // 移除首尾下划线
}

/**
 * 检查磁盘空间
 * @param {string} dirPath 目录路径
 * @returns {Promise<{free: number, total: number}>}
 */
async function checkDiskSpace(dirPath) {
  try {
    const stats = await fs.statvfs(dirPath);
    const free = stats.bavail * stats.bsize;
    const total = stats.blocks * stats.bsize;

    return { free, total };
  } catch (error) {
    // 如果 statvfs 不可用，返回默认值
    return { free: 10 * 1024 * 1024 * 1024, total: 100 * 1024 * 1024 * 1024 }; // 10GB free, 100GB total
  }
}

/**
 * 获取文件扩展名对应的MIME类型
 * @param {string} extension 文件扩展名
 * @returns {string}
 */
function getMimeType(extension) {
  const mimeTypes = {
    '.pdf': 'application/pdf',
    '.js': 'text/javascript',
    '.ts': 'text/typescript',
    '.html': 'text/html',
    '.css': 'text/css',
    '.json': 'application/json',
    '.md': 'text/markdown',
    '.txt': 'text/plain',
    '.xml': 'application/xml',
    '.zip': 'application/zip',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif'
  };

  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
}

/**
 * 创建备份文件
 * @param {string} filePath 原文件路径
 * @returns {Promise<string|null>}
 */
async function createBackup(filePath) {
  try {
    if (!(await fileExists(filePath))) {
      return null;
    }

    const dir = path.dirname(filePath);
    const name = path.basename(filePath);
    const ext = path.extname(filePath);
    const baseName = path.basename(filePath, ext);

    const timestamp = moment().format('YYYYMMDD_HHMMss');
    const backupPath = path.join(dir, `${baseName}_backup_${timestamp}${ext}`);

    await fs.copy(filePath, backupPath);
    return backupPath;

  } catch (error) {
    console.error(chalk.red(`❌ 创建备份失败: ${filePath}`), error.message);
    return null;
  }
}

/**
 * 计算文件哈希值
 * @param {string} filePath 文件路径
 * @param {string} algorithm 哈希算法 (md5, sha1, sha256)
 * @returns {Promise<string>}
 */
async function calculateFileHash(filePath, algorithm = 'md5') {
  try {
    const crypto = require('crypto');
    const hash = crypto.createHash(algorithm);
    const stream = fs.createReadStream(filePath);

    return new Promise((resolve, reject) => {
      stream.on('data', data => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  } catch (error) {
    console.error(chalk.red(`❌ 计算文件哈希失败: ${filePath}`), error.message);
    return '';
  }
}

/**
 * 格式化持续时间
 * @param {number} milliseconds 毫秒数
 * @returns {string}
 */
function formatDuration(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}小时${minutes % 60}分钟${seconds % 60}秒`;
  } else if (minutes > 0) {
    return `${minutes}分钟${seconds % 60}秒`;
  } else {
    return `${seconds}秒`;
  }
}

/**
 * 截断文本
 * @param {string} text 原始文本
 * @param {number} maxLength 最大长度
 * @param {string} suffix 后缀
 * @returns {string}
 */
function truncateText(text, maxLength = 100, suffix = '...') {
  if (text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * 重试机制
 * @param {Function} fn 要执行的函数
 * @param {number} maxRetries 最大重试次数
 * @param {number} delayMs 重试间隔
 * @returns {Promise}
 */
async function retry(fn, maxRetries = 3, delayMs = 1000) {
  let lastError;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (i < maxRetries) {
        console.warn(chalk.yellow(`⚠️  操作失败，${delayMs}ms后重试 (${i + 1}/${maxRetries})`));
        await delay(delayMs);
      }
    }
  }

  throw lastError;
}

module.exports = {
  ensureDirectory,
  fileExists,
  safeReadFile,
  safeWriteFile,
  formatFileSize,
  getRelativePath,
  getTimestamp,
  generateUniqueFileName,
  delay,
  createProgressBar,
  validateProjectPath,
  sanitizeFileName,
  checkDiskSpace,
  getMimeType,
  createBackup,
  calculateFileHash,
  formatDuration,
  truncateText,
  retry
};