#!/usr/bin/env node

/**
 * organize.js - 文件整理工具
 * 根据整理计划执行文件移动、重命名和删除操作
 */

const fs = require('fs-extra');
const path = require('path');
const { program } = require('commander');
const semver = require('semver');

// 分类规则定义
const CATEGORY_RULES = {
  // 应用程序分类
  'Applications': {
    extensions: ['.app', '.dmg', '.pkg', '.exe'],
    subcategories: {
      'Development': ['code', 'visual studio', 'intellij', 'xcode', 'sublime', 'atom', 'vim', 'git', 'docker', 'terminal', 'iterm'],
      'Office': ['word', 'excel', 'powerpoint', 'outlook', 'onenote', 'keynote', 'numbers', 'pages'],
      'Design': ['photoshop', 'illustrator', 'sketch', 'figma', 'affinity', 'gimp', 'inkscape'],
      'Communication': ['slack', 'discord', 'telegram', 'whatsapp', 'zoom', 'teams', 'skype'],
      'Entertainment': ['spotify', 'music', 'vlc', 'netflix', 'steam', 'epic'],
      'Utilities': ['finder', 'calculator', 'calendar', 'notes', 'reminders', 'activity monitor'],
    }
  },

  // 文档分类
  'Documents': {
    extensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.md', '.rtf'],
    subcategories: {
      'PDFs': ['.pdf'],
      'Word': ['.doc', '.docx'],
      'Excel': ['.xls', '.xlsx'],
      'PowerPoint': ['.ppt', '.pptx'],
      'TextFiles': ['.txt', '.md', '.rtf'],
    }
  },

  // 图片分类
  'Images': {
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp', '.heic'],
    subcategories: {
      'Screenshots': ['screen shot', 'screenshot', 'capture'],
      'Photos': ['.jpg', '.jpeg', '.heic'],
      'Designs': ['.png', '.svg', '.psd'],
    }
  },

  // 视频分类
  'Videos': {
    extensions: ['.mp4', '.mov', '.avi', '.mkv', '.wmv', '.flv', '.webm'],
  },

  // 音频分类
  'Audio': {
    extensions: ['.mp3', '.wav', '.flac', '.aac', '.m4a', '.ogg'],
  },

  // 压缩包分类
  'Archives': {
    extensions: ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2'],
  },

  // 代码项目分类
  'CodeProjects': {
    indicators: ['package.json', 'requirements.txt', 'Gemfile', 'pom.xml', '.git'],
  },
};

/**
 * 生成整理计划
 */
function generateOrganizePlan(files, targetPath) {
  const plan = {
    createdAt: new Date().toISOString(),
    targetPath,
    actions: [],
    summary: {
      total: files.length,
      toMove: 0,
      toDelete: 0,
      toKeep: 0,
    }
  };

  // 第一步：按类型分类
  const categorized = categorizeFiles(files);

  // 第二步：识别版本并标记旧版本
  const versionGroups = identifyVersions(files);

  // 生成移动操作
  for (const [category, categoryFiles] of Object.entries(categorized)) {
    for (const file of categoryFiles) {
      // 检查是否是要删除的旧版本
      const versionInfo = findVersionInfo(file, versionGroups);
      if (versionInfo && !versionInfo.isLatest) {
        plan.actions.push({
          type: 'delete',
          file: file.path,
          reason: `旧版本 (${versionInfo.version}), 保留版本: ${versionInfo.latestVersion}`,
          requiresConfirmation: true,
        });
        plan.summary.toDelete++;
      } else {
        // 移动到分类文件夹
        const targetFolder = path.join(targetPath, category);
        const newPath = path.join(targetFolder, file.filename);

        plan.actions.push({
          type: 'move',
          file: file.path,
          target: newPath,
          category,
        });
        plan.summary.toMove++;
      }
    }
  }

  return plan;
}

/**
 * 文件分类
 */
function categorizeFiles(files) {
  const categorized = {};

  for (const file of files) {
    let assigned = false;

    // 遍历所有分类规则
    for (const [category, rule] of Object.entries(CATEGORY_RULES)) {
      if (rule.extensions && rule.extensions.includes(file.extension.toLowerCase())) {
        // 检查是否有子分类
        let subcategory = null;
        if (rule.subcategories) {
          subcategory = findSubcategory(file, rule.subcategories);
        }

        const categoryKey = subcategory ? `${category}/${subcategory}` : category;

        if (!categorized[categoryKey]) {
          categorized[categoryKey] = [];
        }
        categorized[categoryKey].push(file);
        assigned = true;
        break;
      }
    }

    // 如果没有匹配的分类，放入"未分类"
    if (!assigned) {
      if (!categorized['Uncategorized']) {
        categorized['Uncategorized'] = [];
      }
      categorized['Uncategorized'].push(file);
    }
  }

  return categorized;
}

/**
 * 查找子分类
 */
function findSubcategory(file, subcategories) {
  const filenameLower = file.filename.toLowerCase();
  const extensionLower = file.extension.toLowerCase();

  for (const [subcategoryName, indicators] of Object.entries(subcategories)) {
    for (const indicator of indicators) {
      if (indicator.startsWith('.')) {
        // 扩展名匹配
        if (extensionLower === indicator.toLowerCase()) {
          return subcategoryName;
        }
      } else {
        // 关键词匹配
        if (filenameLower.includes(indicator.toLowerCase())) {
          return subcategoryName;
        }
      }
    }
  }

  return null;
}

/**
 * 识别版本
 */
function identifyVersions(files) {
  const groups = {};

  for (const file of files) {
    if (!file.version) continue;

    // 提取基础名称（去除版本号）
    const baseName = file.basename
      .replace(/[v_\s-]?\d+\.\d+(\.\d+)?/gi, '')
      .trim()
      .toLowerCase();

    if (!groups[baseName]) {
      groups[baseName] = [];
    }

    groups[baseName].push({
      file,
      version: file.version,
    });
  }

  // 对每组版本进行排序，找出最新版本
  for (const [baseName, versions] of Object.entries(groups)) {
    if (versions.length <= 1) continue;

    // 使用 semver 排序
    versions.sort((a, b) => {
      try {
        return semver.rcompare(semver.coerce(a.version), semver.coerce(b.version));
      } catch {
        // 如果无法解析，按字符串比较
        return b.version.localeCompare(a.version);
      }
    });

    // 标记最新版本
    versions[0].isLatest = true;
    const latestVersion = versions[0].version;

    // 标记其他版本
    for (let i = 1; i < versions.length; i++) {
      versions[i].isLatest = false;
      versions[i].latestVersion = latestVersion;
    }
  }

  return groups;
}

/**
 * 查找版本信息
 */
function findVersionInfo(file, versionGroups) {
  if (!file.version) return null;

  const baseName = file.basename
    .replace(/[v_\s-]?\d+\.\d+(\.\d+)?/gi, '')
    .trim()
    .toLowerCase();

  const group = versionGroups[baseName];
  if (!group) return null;

  return group.find(v => v.file.path === file.path);
}

/**
 * 执行整理计划（dry-run 或实际执行）
 */
async function executePlan(plan, dryRun = true) {
  console.log(`\n${dryRun ? '[DRY RUN 模式]' : '[执行模式]'} 开始整理...\n`);

  const results = {
    success: [],
    failed: [],
    skipped: [],
  };

  for (const action of plan.actions) {
    try {
      if (action.type === 'move') {
        console.log(`移动: ${path.basename(action.file)} -> ${action.category}/`);

        if (!dryRun) {
          // 确保目标文件夹存在
          await fs.ensureDir(path.dirname(action.target));

          // 移动文件
          await fs.move(action.file, action.target, { overwrite: false });
        }

        results.success.push(action);

      } else if (action.type === 'delete') {
        console.log(`删除: ${path.basename(action.file)} (${action.reason})`);

        if (!dryRun) {
          // 删除文件
          await fs.remove(action.file);
        }

        results.success.push(action);
      }

    } catch (error) {
      console.error(`失败: ${action.file}`, error.message);
      results.failed.push({ action, error: error.message });
    }
  }

  // 打印摘要
  console.log(`\n=== 整理摘要 ===`);
  console.log(`成功: ${results.success.length}`);
  console.log(`失败: ${results.failed.length}`);
  console.log(`跳过: ${results.skipped.length}`);

  return results;
}

/**
 * 生成 Markdown 报告
 */
function generateMarkdownReport(plan, results, targetPath) {
  const timestamp = new Date().toLocaleString('zh-CN');
  const reportDate = new Date().toISOString().split('T')[0].replace(/-/g, '');

  let markdown = `# 桌面整理报告\n\n`;
  markdown += `**整理时间**: ${timestamp}\n`;
  markdown += `**整理路径**: ${targetPath}\n\n`;

  markdown += `## 整理概要\n\n`;
  markdown += `- 总文件数: ${plan.summary.total}\n`;
  markdown += `- 已移动文件: ${plan.summary.toMove}\n`;
  markdown += `- 已删除文件: ${plan.summary.toDelete}\n`;
  markdown += `- 保留文件: ${plan.summary.toKeep}\n\n`;

  // 分类详情
  markdown += `## 分类详情\n\n`;
  const categories = {};
  for (const action of plan.actions) {
    if (action.type === 'move') {
      if (!categories[action.category]) {
        categories[action.category] = [];
      }
      categories[action.category].push(path.basename(action.file));
    }
  }

  for (const [category, files] of Object.entries(categories)) {
    markdown += `### ${category} (${files.length} 个)\n\n`;
    for (const file of files.slice(0, 10)) {
      markdown += `- ${file}\n`;
    }
    if (files.length > 10) {
      markdown += `- ... 以及其他 ${files.length - 10} 个文件\n`;
    }
    markdown += `\n`;
  }

  // 版本去重记录
  const deletions = plan.actions.filter(a => a.type === 'delete');
  if (deletions.length > 0) {
    markdown += `## 版本去重记录\n\n`;
    markdown += `| 文件名 | 原因 |\n`;
    markdown += `|-------|------|\n`;
    for (const action of deletions) {
      markdown += `| ${path.basename(action.file)} | ${action.reason} |\n`;
    }
    markdown += `\n`;
  }

  // 执行结果
  if (results) {
    markdown += `## 执行结果\n\n`;
    markdown += `- 成功: ${results.success.length}\n`;
    markdown += `- 失败: ${results.failed.length}\n`;
    markdown += `- 跳过: ${results.skipped.length}\n\n`;

    if (results.failed.length > 0) {
      markdown += `### 失败的操作\n\n`;
      for (const { action, error } of results.failed) {
        markdown += `- ${path.basename(action.file)}: ${error}\n`;
      }
      markdown += `\n`;
    }
  }

  markdown += `## 建议\n\n`;
  markdown += `- 定期整理桌面，保持文件有序\n`;
  markdown += `- 及时删除不需要的文件和旧版本软件\n`;
  if (categories['Uncategorized'] && categories['Uncategorized'].length > 0) {
    markdown += `- 检查"未分类"文件夹中的 ${categories['Uncategorized'].length} 个文件\n`;
  }

  return { markdown, filename: `整理报告_${reportDate}.md` };
}

/**
 * 主函数
 */
async function main() {
  program
    .name('organize')
    .description('根据整理计划执行文件整理操作')
    .option('-s, --source <path>', '源目录路径')
    .option('-p, --plan <file>', '整理计划 JSON 文件')
    .option('-d, --dry-run', '仅模拟，不实际执行', false)
    .option('-r, --report <file>', '生成 Markdown 报告')
    .parse();

  const options = program.opts();

  if (!options.source) {
    console.error('错误: 必须指定源目录路径 (-s 或 --source)');
    process.exit(1);
  }

  const sourcePath = path.resolve(options.source);

  try {
    let plan;

    // 如果提供了计划文件，加载它
    if (options.plan) {
      const planPath = path.resolve(options.plan);
      plan = await fs.readJson(planPath);
    } else {
      // 否则，扫描目录并生成计划
      const { scanDirectory, analyzeFiles } = require('./scan.js');
      const files = await scanDirectory(sourcePath);
      plan = generateOrganizePlan(files, sourcePath);

      // 保存计划
      const planPath = path.join(sourcePath, 'organize-plan.json');
      await fs.writeJson(planPath, plan, { spaces: 2 });
      console.log(`整理计划已保存到: ${planPath}\n`);
    }

    // 执行计划
    const results = await executePlan(plan, options.dryRun);

    // 生成报告
    if (options.report || !options.dryRun) {
      const { markdown, filename } = generateMarkdownReport(plan, results, sourcePath);
      const reportPath = options.report
        ? path.resolve(options.report)
        : path.join(sourcePath, filename);

      await fs.writeFile(reportPath, markdown, 'utf8');
      console.log(`\n报告已保存到: ${reportPath}`);
    }

    if (options.dryRun) {
      console.log(`\n提示: 这是 DRY RUN 模式，没有实际修改文件。`);
      console.log(`如需执行实际操作，请移除 --dry-run 参数。\n`);
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
  generateOrganizePlan,
  executePlan,
  generateMarkdownReport,
};
