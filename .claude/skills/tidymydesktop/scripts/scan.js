#!/usr/bin/env node

/**
 * scan.js - 目录扫描工具
 * 扫描指定目录，生成文件清单和分析报告
 */

const fs = require('fs-extra');
const path = require('path');
const { program } = require('commander');

// 文件类型定义
const FILE_TYPES = {
  APPLICATION: 'application',
  DOCUMENT: 'document',
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  ARCHIVE: 'archive',
  CODE: 'code',
  OTHER: 'other'
};

// 扩展名映射
const EXTENSION_MAP = {
  // 应用程序
  '.app': FILE_TYPES.APPLICATION,
  '.dmg': FILE_TYPES.APPLICATION,
  '.pkg': FILE_TYPES.APPLICATION,
  '.exe': FILE_TYPES.APPLICATION,

  // 文档
  '.pdf': FILE_TYPES.DOCUMENT,
  '.doc': FILE_TYPES.DOCUMENT,
  '.docx': FILE_TYPES.DOCUMENT,
  '.xls': FILE_TYPES.DOCUMENT,
  '.xlsx': FILE_TYPES.DOCUMENT,
  '.ppt': FILE_TYPES.DOCUMENT,
  '.pptx': FILE_TYPES.DOCUMENT,
  '.txt': FILE_TYPES.DOCUMENT,
  '.md': FILE_TYPES.DOCUMENT,
  '.rtf': FILE_TYPES.DOCUMENT,

  // 图片
  '.jpg': FILE_TYPES.IMAGE,
  '.jpeg': FILE_TYPES.IMAGE,
  '.png': FILE_TYPES.IMAGE,
  '.gif': FILE_TYPES.IMAGE,
  '.bmp': FILE_TYPES.IMAGE,
  '.svg': FILE_TYPES.IMAGE,
  '.webp': FILE_TYPES.IMAGE,
  '.heic': FILE_TYPES.IMAGE,

  // 视频
  '.mp4': FILE_TYPES.VIDEO,
  '.mov': FILE_TYPES.VIDEO,
  '.avi': FILE_TYPES.VIDEO,
  '.mkv': FILE_TYPES.VIDEO,
  '.wmv': FILE_TYPES.VIDEO,
  '.flv': FILE_TYPES.VIDEO,
  '.webm': FILE_TYPES.VIDEO,

  // 音频
  '.mp3': FILE_TYPES.AUDIO,
  '.wav': FILE_TYPES.AUDIO,
  '.flac': FILE_TYPES.AUDIO,
  '.aac': FILE_TYPES.AUDIO,
  '.m4a': FILE_TYPES.AUDIO,
  '.ogg': FILE_TYPES.AUDIO,

  // 压缩包
  '.zip': FILE_TYPES.ARCHIVE,
  '.rar': FILE_TYPES.ARCHIVE,
  '.7z': FILE_TYPES.ARCHIVE,
  '.tar': FILE_TYPES.ARCHIVE,
  '.gz': FILE_TYPES.ARCHIVE,
  '.bz2': FILE_TYPES.ARCHIVE,

  // 代码
  '.js': FILE_TYPES.CODE,
  '.ts': FILE_TYPES.CODE,
  '.jsx': FILE_TYPES.CODE,
  '.tsx': FILE_TYPES.CODE,
  '.py': FILE_TYPES.CODE,
  '.java': FILE_TYPES.CODE,
  '.c': FILE_TYPES.CODE,
  '.cpp': FILE_TYPES.CODE,
  '.h': FILE_TYPES.CODE,
  '.hpp': FILE_TYPES.CODE,
  '.css': FILE_TYPES.CODE,
  '.scss': FILE_TYPES.CODE,
  '.html': FILE_TYPES.CODE,
  '.json': FILE_TYPES.CODE,
  '.xml': FILE_TYPES.CODE,
  '.yaml': FILE_TYPES.CODE,
  '.yml': FILE_TYPES.CODE,
};

/**
 * 提取版本号
 * 支持多种版本号格式：
 * - v1.2.3
 * - 1.2.3
 * - V1.2.3
 * - version 1.2.3
 */
function extractVersion(filename) {
  const patterns = [
    /v(\d+\.\d+\.\d+)/i,
    /version[_\s-]?(\d+\.\d+\.\d+)/i,
    /(\d+\.\d+\.\d+)/,
    /v(\d+\.\d+)/i,
    /(\d+\.\d+)/,
  ];

  for (const pattern of patterns) {
    const match = filename.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

/**
 * 获取文件类型
 */
function getFileType(filename) {
  const ext = path.extname(filename).toLowerCase();
  return EXTENSION_MAP[ext] || FILE_TYPES.OTHER;
}

/**
 * 获取文件信息
 */
async function getFileInfo(filePath) {
  const stats = await fs.stat(filePath);
  const filename = path.basename(filePath);
  const ext = path.extname(filename);
  const basename = path.basename(filename, ext);

  return {
    path: filePath,
    filename,
    basename,
    extension: ext,
    type: getFileType(filename),
    size: stats.size,
    created: stats.birthtime,
    modified: stats.mtime,
    isDirectory: stats.isDirectory(),
    version: extractVersion(filename),
  };
}

/**
 * 扫描目录
 */
async function scanDirectory(targetPath) {
  console.log(`扫描目录: ${targetPath}`);

  if (!await fs.pathExists(targetPath)) {
    throw new Error(`目录不存在: ${targetPath}`);
  }

  const files = [];
  const items = await fs.readdir(targetPath);

  for (const item of items) {
    // 跳过隐藏文件（以 . 开头的文件）
    if (item.startsWith('.')) {
      continue;
    }

    const itemPath = path.join(targetPath, item);

    try {
      const fileInfo = await getFileInfo(itemPath);
      files.push(fileInfo);
    } catch (error) {
      console.warn(`警告: 无法读取文件信息 ${itemPath}:`, error.message);
    }
  }

  return files;
}

/**
 * 分析扫描结果
 */
function analyzeFiles(files) {
  const analysis = {
    total: files.length,
    byType: {},
    byExtension: {},
    totalSize: 0,
    duplicates: [],
    versions: {},
  };

  // 按类型分组
  for (const file of files) {
    if (!analysis.byType[file.type]) {
      analysis.byType[file.type] = [];
    }
    analysis.byType[file.type].push(file);

    // 按扩展名分组
    if (file.extension) {
      if (!analysis.byExtension[file.extension]) {
        analysis.byExtension[file.extension] = 0;
      }
      analysis.byExtension[file.extension]++;
    }

    // 累计大小
    analysis.totalSize += file.size;

    // 识别可能的版本
    if (file.version) {
      const baseName = file.basename.replace(/[v_\s-]?\d+\.\d+(\.\d+)?/gi, '').trim();
      if (!analysis.versions[baseName]) {
        analysis.versions[baseName] = [];
      }
      analysis.versions[baseName].push({
        filename: file.filename,
        version: file.version,
        path: file.path,
      });
    }
  }

  return analysis;
}

/**
 * 格式化文件大小
 */
function formatSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * 生成报告
 */
function generateReport(targetPath, files, analysis) {
  console.log('\n=== 扫描报告 ===\n');
  console.log(`目录: ${targetPath}`);
  console.log(`总文件数: ${analysis.total}`);
  console.log(`总大小: ${formatSize(analysis.totalSize)}\n`);

  console.log('文件类型分布:');
  for (const [type, typeFiles] of Object.entries(analysis.byType)) {
    console.log(`  ${type}: ${typeFiles.length} 个文件`);
  }

  console.log('\n扩展名分布:');
  const sortedExtensions = Object.entries(analysis.byExtension)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  for (const [ext, count] of sortedExtensions) {
    console.log(`  ${ext}: ${count} 个文件`);
  }

  console.log('\n检测到的版本:');
  for (const [baseName, versions] of Object.entries(analysis.versions)) {
    if (versions.length > 1) {
      console.log(`  ${baseName}:`);
      for (const v of versions) {
        console.log(`    - ${v.filename} (v${v.version})`);
      }
    }
  }
}

/**
 * 主函数
 */
async function main() {
  program
    .name('scan')
    .description('扫描目录并生成文件清单')
    .argument('<path>', '要扫描的目录路径')
    .option('-o, --output <file>', '输出 JSON 文件路径')
    .option('-v, --verbose', '显示详细信息')
    .parse();

  const targetPath = path.resolve(program.args[0]);
  const options = program.opts();

  try {
    const files = await scanDirectory(targetPath);
    const analysis = analyzeFiles(files);

    generateReport(targetPath, files, analysis);

    // 如果指定了输出文件，保存 JSON
    if (options.output) {
      const outputPath = path.resolve(options.output);
      const data = {
        scannedAt: new Date().toISOString(),
        targetPath,
        files,
        analysis,
      };

      await fs.writeJson(outputPath, data, { spaces: 2 });
      console.log(`\n报告已保存到: ${outputPath}`);
    }

    // 返回结果供其他脚本使用
    return { files, analysis };

  } catch (error) {
    console.error('错误:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

// 导出供其他模块使用
module.exports = {
  scanDirectory,
  analyzeFiles,
  getFileType,
  extractVersion,
};
