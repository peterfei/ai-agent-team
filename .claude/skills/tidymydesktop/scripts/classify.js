#!/usr/bin/env node

/**
 * classify.js - 智能文件分类工具
 * 使用搜索和 AI 辅助对未知文件进行分类
 */

const fs = require('fs-extra');
const path = require('path');
const { program } = require('commander');

/**
 * 软件分类数据库
 * 常见软件及其分类
 */
const SOFTWARE_DATABASE = {
  // 开发工具
  'Development': [
    'visual studio code', 'vscode', 'sublime text', 'atom', 'intellij idea',
    'pycharm', 'webstorm', 'phpstorm', 'android studio', 'xcode',
    'eclipse', 'netbeans', 'vim', 'emacs', 'brackets',
    'git', 'github desktop', 'sourcetree', 'tower', 'gitkraken',
    'docker', 'docker desktop', 'vagrant', 'virtualbox',
    'postman', 'insomnia', 'charles', 'wireshark',
    'terminal', 'iterm', 'hyper', 'warp',
    'node', 'npm', 'yarn', 'python', 'java', 'go', 'rust',
  ],

  // 办公软件
  'Office': [
    'microsoft word', 'word', 'microsoft excel', 'excel',
    'microsoft powerpoint', 'powerpoint', 'microsoft outlook', 'outlook',
    'microsoft teams', 'onenote', 'access',
    'keynote', 'numbers', 'pages',
    'google docs', 'google sheets', 'google slides',
    'libreoffice', 'openoffice', 'wps office',
    'notion', 'evernote', 'bear', 'obsidian',
  ],

  // 设计工具
  'Design': [
    'adobe photoshop', 'photoshop', 'adobe illustrator', 'illustrator',
    'adobe indesign', 'indesign', 'adobe xd', 'xd',
    'adobe premiere', 'premiere', 'adobe after effects', 'after effects',
    'sketch', 'figma', 'invision', 'principle', 'framer',
    'affinity designer', 'affinity photo', 'affinity publisher',
    'gimp', 'inkscape', 'krita', 'blender',
    'canva', 'procreate',
  ],

  // 通讯工具
  'Communication': [
    'slack', 'discord', 'telegram', 'whatsapp', 'wechat', 'qq',
    'zoom', 'microsoft teams', 'skype', 'google meet',
    'facetime', 'messages', 'mail', 'thunderbird',
    'signal', 'viber', 'line', 'kakao',
  ],

  // 娱乐软件
  'Entertainment': [
    'spotify', 'apple music', 'youtube music', 'soundcloud',
    'vlc', 'mpv', 'quicktime', 'plex', 'kodi',
    'netflix', 'disney+', 'amazon prime', 'hulu',
    'steam', 'epic games', 'gog', 'origin', 'uplay',
    'obs studio', 'streamlabs', 'twitch',
  ],

  // 系统工具
  'Utilities': [
    'alfred', 'raycast', 'spotlight', 'launcher',
    'cleanmymac', 'ccleaner', 'malwarebytes', 'avg', 'avast',
    'bartender', 'magnet', 'rectangle', 'spectacle',
    'the unarchiver', 'winrar', 'keka', '7-zip',
    'dropbox', 'google drive', 'onedrive', 'icloud',
    'transmission', 'utorrent', 'qbittorrent',
    'finder', 'explorer', 'activity monitor', 'task manager',
    'calculator', 'calendar', 'clock', 'notes', 'reminders',
  ],

  // 浏览器
  'Browsers': [
    'chrome', 'google chrome', 'firefox', 'safari', 'edge',
    'opera', 'brave', 'vivaldi', 'arc', 'tor browser',
  ],
};

/**
 * 根据软件名称查找分类
 */
function findCategoryByName(filename) {
  const filenameLower = filename.toLowerCase();

  for (const [category, keywords] of Object.entries(SOFTWARE_DATABASE)) {
    for (const keyword of keywords) {
      if (filenameLower.includes(keyword.toLowerCase())) {
        return {
          category,
          confidence: 'high',
          matchedKeyword: keyword,
        };
      }
    }
  }

  return null;
}

/**
 * 生成搜索查询
 */
function generateSearchQuery(filename) {
  // 清理文件名
  const cleanName = filename
    .replace(/\.(app|dmg|pkg|exe)$/i, '')
    .replace(/[v_\s-]?\d+\.\d+(\.\d+)?/gi, '')
    .trim();

  return `${cleanName} 是什么软件 用途`;
}

/**
 * 分析文件并提供分类建议
 */
async function classifyFile(filePath, enableSearch = false) {
  const filename = path.basename(filePath);
  const ext = path.extname(filename);

  console.log(`\n分析文件: ${filename}`);

  // 1. 首先尝试从数据库匹配
  const dbMatch = findCategoryByName(filename);
  if (dbMatch) {
    console.log(`✓ 找到匹配: ${dbMatch.category} (关键词: ${dbMatch.matchedKeyword})`);
    return {
      filename,
      category: dbMatch.category,
      confidence: dbMatch.confidence,
      source: 'database',
      matchedKeyword: dbMatch.matchedKeyword,
    };
  }

  // 2. 如果启用了搜索，生成搜索建议
  if (enableSearch) {
    const searchQuery = generateSearchQuery(filename);
    console.log(`? 未找到匹配，建议搜索: "${searchQuery}"`);

    return {
      filename,
      category: 'Uncategorized',
      confidence: 'low',
      source: 'unknown',
      searchQuery,
      needsSearch: true,
    };
  }

  // 3. 无法分类
  console.log(`✗ 无法分类，将放入"未分类"文件夹`);
  return {
    filename,
    category: 'Uncategorized',
    confidence: 'low',
    source: 'unknown',
  };
}

/**
 * 批量分类文件
 */
async function classifyBatch(files, enableSearch = false) {
  const results = [];

  console.log(`开始分类 ${files.length} 个文件...\n`);

  for (const file of files) {
    const result = await classifyFile(file, enableSearch);
    results.push(result);
  }

  // 生成摘要
  const summary = {
    total: results.length,
    categorized: results.filter(r => r.category !== 'Uncategorized').length,
    uncategorized: results.filter(r => r.category === 'Uncategorized').length,
    needsSearch: results.filter(r => r.needsSearch).length,
    byCategory: {},
  };

  for (const result of results) {
    if (!summary.byCategory[result.category]) {
      summary.byCategory[result.category] = 0;
    }
    summary.byCategory[result.category]++;
  }

  console.log(`\n=== 分类摘要 ===`);
  console.log(`总文件数: ${summary.total}`);
  console.log(`已分类: ${summary.categorized}`);
  console.log(`未分类: ${summary.uncategorized}`);
  if (summary.needsSearch > 0) {
    console.log(`需要搜索: ${summary.needsSearch}`);
  }

  console.log(`\n分类分布:`);
  for (const [category, count] of Object.entries(summary.byCategory)) {
    console.log(`  ${category}: ${count}`);
  }

  return { results, summary };
}

/**
 * 生成搜索建议报告
 */
function generateSearchSuggestionsReport(results) {
  const needsSearch = results.filter(r => r.needsSearch);

  if (needsSearch.length === 0) {
    return null;
  }

  let report = `# 需要搜索的文件\n\n`;
  report += `以下 ${needsSearch.length} 个文件无法自动分类，需要搜索确定用途：\n\n`;

  for (const result of needsSearch) {
    report += `## ${result.filename}\n\n`;
    report += `**搜索建议**: ${result.searchQuery}\n\n`;
    report += `**状态**: 待搜索\n\n`;
    report += `**建议分类**: _（搜索后填写）_\n\n`;
    report += `---\n\n`;
  }

  return report;
}

/**
 * 主函数
 */
async function main() {
  program
    .name('classify')
    .description('智能文件分类工具')
    .option('-f, --file <path>', '单个文件路径')
    .option('-d, --directory <path>', '目录路径（批量分类）')
    .option('-s, --search', '启用搜索建议', false)
    .option('-o, --output <file>', '输出分类结果到 JSON 文件')
    .option('-r, --report <file>', '生成搜索建议报告')
    .parse();

  const options = program.opts();

  try {
    let results, summary;

    if (options.file) {
      // 单个文件分类
      const filePath = path.resolve(options.file);
      const result = await classifyFile(filePath, options.search);
      results = [result];
      summary = { total: 1 };

    } else if (options.directory) {
      // 批量分类
      const dirPath = path.resolve(options.directory);
      const items = await fs.readdir(dirPath);
      const files = items.map(item => path.join(dirPath, item));

      const batchResult = await classifyBatch(files, options.search);
      results = batchResult.results;
      summary = batchResult.summary;

    } else {
      console.error('错误: 必须指定 --file 或 --directory');
      process.exit(1);
    }

    // 保存结果到 JSON
    if (options.output) {
      const outputPath = path.resolve(options.output);
      await fs.writeJson(outputPath, { results, summary }, { spaces: 2 });
      console.log(`\n分类结果已保存到: ${outputPath}`);
    }

    // 生成搜索建议报告
    if (options.report && options.search) {
      const report = generateSearchSuggestionsReport(results);
      if (report) {
        const reportPath = path.resolve(options.report);
        await fs.writeFile(reportPath, report, 'utf8');
        console.log(`搜索建议报告已保存到: ${reportPath}`);
      }
    }

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
  classifyFile,
  classifyBatch,
  findCategoryByName,
  generateSearchQuery,
  SOFTWARE_DATABASE,
};
