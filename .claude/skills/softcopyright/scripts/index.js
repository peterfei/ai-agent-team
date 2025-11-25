#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const inquirer = require('inquirer');
const path = require('path');
const fs = require('fs-extra');
const scanner = require('./scanner');
const { generateManualHTML } = require('./simple-doc-generator');
const { exportSourceCodeHTML } = require('./html-source-exporter');

// 软著关键词检测
const COPYRIGHT_KEYWORDS = [
  '软著', '著作权', '软件著作权', '版权', 'copyright', 'patent', '专利'
];

/**
 * 检测用户输入是否包含软著相关关键词
 * @param {string} input 用户输入
 * @returns {boolean} 是否包含软著关键词
 */
function containsCopyrightKeyword(input) {
  return COPYRIGHT_KEYWORDS.some(keyword =>
    input.toLowerCase().includes(keyword.toLowerCase())
  );
}

/**
 * 智能关键词处理和软著材料生成
 * @param {string} input 用户输入
 * @param {string} projectPath 项目路径
 * @param {string} outputDir 输出路径
 * @returns {Promise<boolean>} 是否执行了软著生成
 */
async function handleCopyrightKeywords(input, projectPath, outputDir) {
  // 如果包含软著关键词，直接启动功能
  if (containsCopyrightKeyword(input)) {
    console.log(chalk.blue.bold('🎯 检测到软著相关关键词，启动SoftCopyright功能'));
    console.log(chalk.cyan(`关键词: "${input}"`));
  } else {
    // 如果不包含软著关键词，询问用户是否要生成软著材料
    console.log(chalk.blue.bold('🤔 检测到您输入了项目信息'));
    console.log(chalk.cyan(`项目名称: "${input}"`));

    const { shouldGenerate } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'shouldGenerate',
        message: `是否要为 "${input}" 生成软件著作权申请材料？`,
        default: true
      }
    ]);

    if (!shouldGenerate) {
      console.log(chalk.yellow('💡 您可能想要：'));
      console.log(chalk.white('  • 软著材料生成: node scripts/index.js generate'));
      console.log(chalk.white('  • 项目扫描分析: node scripts/index.js scan'));
      console.log(chalk.white('  • 交互式生成: node scripts/index.js interactive'));
      console.log(chalk.white('  • 显示帮助: node scripts/index.js help'));
      return false;
    }

    console.log(chalk.cyan('开始生成软件著作权申请材料...'));
  }
  console.log(chalk.gray('='.repeat(50)));

  try {
    // 扫描项目
    console.log(chalk.yellow('📊 分析项目源码...'));
    const projectInfo = await scanner.scanProject(projectPath || process.cwd());

    console.log(chalk.green(`✅ 项目分析完成: ${projectInfo.name}`));
    console.log(chalk.white(`   - 文件数: ${projectInfo.files.length}`));
    console.log(chalk.white(`   - 代码行数: ${projectInfo.totalLines}`));
    console.log(chalk.white(`   - 主要语言: ${projectInfo.languages.join(', ')}`));

    // 显示项目信息并确认
    console.log(chalk.cyan('\n📋 项目信息确认:'));
    const { confirmed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmed',
        message: '是否为该项目生成软著申请材料？',
        default: true
      }
    ]);

    if (!confirmed) {
      console.log(chalk.yellow('❌ 用户取消操作'));
      return false;
    }

    // 询问生成类型
    const { generateType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'generateType',
        message: '请选择要生成的材料类型:',
        choices: [
          { name: '📋 生成全部材料 (HTML自动转PDF)', value: 'auto-pdf' },
          { name: '📖 仅生成软件说明书 (HTML)', value: 'manual' },
          { name: '💻 仅生成源代码文档 (HTML)', value: 'source' },
          { name: '📊 仅查看项目分析', value: 'scan' }
        ]
      }
    ]);

    // 根据选择执行相应操作
    if (generateType === 'scan') {
      console.log(chalk.green('✅ 项目分析完成'));
      return true;
    }

    // 生成材料
    if (generateType === 'auto-pdf') {
      const { generateAutoPrintPDF } = require('./auto-print-pdf');
      console.log(chalk.yellow('📄 生成HTML并自动转换为PDF...'));
      await generateAutoPrintPDF(projectInfo, outputDir);
    } else if (generateType === 'manual') {
      console.log(chalk.yellow('📝 生成软件说明书(HTML格式)...'));
      const manualPath = await generateManualHTML(projectInfo, outputDir);
      console.log(chalk.green(`✅ ${path.basename(manualPath)}`));
      console.log(chalk.cyan('💡 提示: 在浏览器中打开HTML，按Cmd+P打印为PDF'));
    } else if (generateType === 'source') {
      console.log(chalk.yellow('💻 生成源代码文档(HTML格式)...'));
      const sourcePath = await exportSourceCodeHTML(projectInfo, outputDir);
      console.log(chalk.green(`✅ ${path.basename(sourcePath)}`));
      console.log(chalk.cyan('💡 提示: 在浏览器中打开HTML，按Cmd+P打印为PDF'));
    }

    console.log(chalk.green.bold('\n🎉 软著材料生成完成！'));

    return true;

  } catch (error) {
    console.error(chalk.red('❌ 软著材料生成失败:'), error.message);
    return false;
  }
}

const program = new Command();

// 版本信息
program
  .name('softcopyright')
  .description('智能软件著作权申请材料生成工具')
  .version('1.0.0');

// 主命令 - 生成软著材料
program
  .command('generate')
  .description('生成软件著作权申请材料')
  .option('-p, --path <path>', '项目路径', process.cwd())
  .option('-t, --type <type>', '生成类型 (manual|source|all)', 'all')
  .option('-o, --output <path>', '输出路径')
  .option('--auto-pdf', '自动打开浏览器并触发打印对话框', false)
  .action(async (options) => {
    try {
      console.log(chalk.blue.bold('🚀 SoftCopyright - 软件著作权申请材料生成工具'));
      console.log(chalk.gray('='.repeat(60)));

      // 确认项目路径
      const projectPath = path.resolve(options.path);
      if (!await fs.pathExists(projectPath)) {
        console.error(chalk.red(`❌ 项目路径不存在: ${projectPath}`));
        process.exit(1);
      }

      console.log(chalk.cyan(`📁 项目路径: ${projectPath}`));

      // 设置默认输出路径为项目目录下的softcopyright-output
      const defaultOutputDir = path.join(projectPath, 'softcopyright-output');
      const outputDir = options.output ? path.resolve(options.output) : defaultOutputDir;
      await fs.ensureDir(outputDir);
      console.log(chalk.cyan(`📁 输出目录: ${outputDir}`));

      // 询问生成类型
      if (options.type === 'all') {
        const { type } = await inquirer.prompt([
          {
            type: 'list',
            name: 'type',
            message: '请选择要生成的材料类型:',
            choices: [
              { name: '📋 生成全部材料 (推荐)', value: 'all' },
              { name: '📖 仅生成软件说明书', value: 'manual' },
              { name: '💻 仅生成源代码文档', value: 'source' }
            ]
          }
        ]);
        options.type = type;
      }

      console.log(chalk.yellow(`🔍 开始分析项目...`));

      // 扫描项目
      const projectInfo = await scanner.scanProject(projectPath);
      console.log(chalk.green(`✅ 项目分析完成，发现 ${projectInfo.files.length} 个源代码文件`));
      await fs.ensureDir(outputDir);

      // 生成材料
      if (options.type === 'manual' || options.type === 'all') {
        console.log(chalk.yellow('📝 生成软件说明书(HTML格式)...'));
        const manualPath = await generateManualHTML(projectInfo, outputDir);
        console.log(chalk.green(`✅ 软件说明书已生成: ${manualPath}`));
      }

      if (options.type === 'source' || options.type === 'all') {
        console.log(chalk.yellow('💻 生成源代码文档(HTML格式)...'));
        const sourcePath = await exportSourceCodeHTML(projectInfo, outputDir);
        console.log(chalk.green(`✅ 源代码文档已生成: ${sourcePath}`));
      }

      console.log(chalk.blue.bold('\n🎉 生成完成！'));
      console.log(chalk.gray(`输出目录: ${outputDir}`));

      // 如果启用了auto-pdf选项，自动打开浏览器
      if (options.autoPdf) {
        console.log(chalk.yellow('\n🌐 自动打开浏览器...'));
        const { openInBrowser, createAutoPrintHTML } = require('./auto-print-pdf');

        if (options.type === 'manual' || options.type === 'all') {
          const autoPrintPath = await createAutoPrintHTML(manualPath);
          await openInBrowser(autoPrintPath);
        }

        console.log(chalk.cyan('💡 浏览器将在3秒后自动打开打印对话框'));
        console.log(chalk.white('   选择"保存为PDF"即可导出PDF文件'));
      } else {
        console.log(chalk.cyan('\n💡 提示: 在浏览器中打开HTML文件，按Cmd+P打印为PDF'));
        console.log(chalk.white('   或者使用 --auto-pdf 选项自动打开浏览器'));
      }

    } catch (error) {
      console.error(chalk.red('❌ 生成失败:'), error.message);
      process.exit(1);
    }
  });

// 扫描命令
program
  .command('scan')
  .description('扫描项目源码')
  .argument('<path>', '项目路径')
  .action(async (projectPath) => {
    try {
      const resolvedPath = path.resolve(projectPath);
      console.log(chalk.blue(`🔍 扫描项目: ${resolvedPath}`));

      const projectInfo = await scanner.scanProject(resolvedPath);

      console.log(chalk.green('\n📊 扫描结果:'));
      console.log(chalk.white(`项目名称: ${projectInfo.name}`));
      console.log(chalk.white(`源代码文件: ${projectInfo.files.length} 个`));
      console.log(chalk.white(`总代码行数: ${projectInfo.totalLines} 行`));
      console.log(chalk.white(`主要语言: ${projectInfo.languages.join(', ')}`));

      // 显示文件统计
      console.log(chalk.cyan('\n📁 文件类型统计:'));
      Object.entries(projectInfo.fileStats).forEach(([ext, count]) => {
        console.log(chalk.white(`  ${ext}: ${count} 个文件`));
      });

    } catch (error) {
      console.error(chalk.red('❌ 扫描失败:'), error.message);
      process.exit(1);
    }
  });

// 交互式命令
program
  .command('interactive')
  .description('交互式生成软著材料')
  .action(async () => {
    try {
      console.log(chalk.blue.bold('🎯 欢迎使用 SoftCopyright 交互式向导'));
      console.log(chalk.gray('='.repeat(60)));

      // 询问项目路径
      const { projectPath } = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectPath',
          message: '请输入项目路径:',
          default: process.cwd(),
          validate: async (input) => {
            const resolvedPath = path.resolve(input);
            return await fs.pathExists(resolvedPath) || '路径不存在，请重新输入';
          }
        }
      ]);

      console.log(chalk.yellow(`🔍 分析项目: ${projectPath}`));
      const projectInfo = await scanner.scanProject(projectPath);

      // 显示项目信息
      console.log(chalk.cyan('\n📊 项目信息:'));
      console.log(chalk.white(`  检测到的项目名称: ${projectInfo.name}`));
      console.log(chalk.white(`  源代码文件数: ${projectInfo.files.length}`));
      console.log(chalk.white(`  主要编程语言: ${projectInfo.languages.join(', ')}`));

      // 确认项目信息
      const { confirmed } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirmed',
          message: '项目信息是否正确？',
          default: true
        }
      ]);

      if (!confirmed) {
        console.log(chalk.yellow('❌ 操作已取消'));
        return;
      }

      // 选择生成内容
      const { generateType } = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'generateType',
          message: '请选择要生成的内容:',
          choices: [
            { name: '📋 软件说明书 (约2000-3000字)', value: 'manual', checked: true },
            { name: '💻 源代码文档 (60页，每页50行)', value: 'source', checked: true }
          ]
        }
      ]);

      if (generateType.length === 0) {
        console.log(chalk.yellow('⚠️  请至少选择一种生成内容'));
        return;
      }

      // 询问输出路径和是否自动PDF
      const outputAnswers = await inquirer.prompt([
        {
          type: 'input',
          name: 'outputPath',
          message: '输出目录路径:',
          default: path.join(projectPath, 'softcopyright-output')
        },
        {
          type: 'confirm',
          name: 'autoPdf',
          message: '是否自动在浏览器中打开并触发打印对话框？',
          default: true
        }
      ]);

      const outputPath = outputAnswers.outputPath;
      const autoPdf = outputAnswers.autoPdf;

      await fs.ensureDir(outputPath);

      // 开始生成
      console.log(chalk.blue('\n🚀 开始生成...'));

      if (generateType.includes('manual')) {
        console.log(chalk.yellow('📝 生成软件说明书(HTML格式)...'));
        const manualPath = await generateManualHTML(projectInfo, outputPath);
        console.log(chalk.green(`✅ 软件说明书: ${manualPath}`));
        console.log(chalk.cyan('💡 提示: 在浏览器中打开HTML，按Cmd+P打印为PDF'));
      }

      if (generateType.includes('source')) {
        console.log(chalk.yellow('💻 生成源代码文档(HTML格式)...'));
        const sourcePath = await exportSourceCodeHTML(projectInfo, outputPath);
        console.log(chalk.green(`✅ 源代码文档: ${sourcePath}`));
        console.log(chalk.cyan('💡 提示: 在浏览器中打开HTML，按Cmd+P打印为PDF'));
      }

      console.log(chalk.blue.bold('\n🎉 生成完成！'));
      console.log(chalk.gray(`文件已保存到: ${outputPath}`));

      // 自动打开浏览器（如果用户选择了）
      if (autoPdf) {
        console.log(chalk.yellow('\n🌐 自动打开浏览器...'));
        const { openInBrowser, createAutoPrintHTML } = require('./auto-print-pdf');

        if (generateType.includes('manual')) {
          const autoPrintPath = await createAutoPrintHTML(manualPath);
          await openInBrowser(autoPrintPath);
        }

        console.log(chalk.cyan('💡 浏览器将在3秒后自动打开打印对话框'));
        console.log(chalk.white('   选择"保存为PDF"即可导出PDF文件'));
      }

    } catch (error) {
      console.error(chalk.red('❌ 操作失败:'), error.message);
      process.exit(1);
    }
  });

// 增强的错误处理
program.on('command:*', (operands) => {
  const unknownCommand = operands[0];
  console.log(chalk.yellow(`💡 检测到未知命令: "${unknownCommand}"`));
  console.log(chalk.cyan('\n您可能想要：'));
  console.log(chalk.white('  • 生成软著材料: node scripts/index.js generate'));
  console.log(chalk.white('  • 交互式生成: node scripts/index.js interactive'));
  console.log(chalk.white('  • 项目扫描: node scripts/index.js scan'));
  console.log(chalk.white('  • 显示帮助: node scripts/index.js help'));
  console.log(chalk.cyan('\n💡 提示:'));
    console.log(chalk.gray("  If \"" + unknownCommand + "\" is your project name,"));
  console.log(chalk.gray('  直接运行软著生成功能会询问您是否要为该项目生成软著材料'));
  console.log(chalk.gray('  例如: node scripts/index.js ' + unknownCommand));
  process.exit(1);
});

// 检查是否包含软著关键词（在命令解析之前）
const userArgs = process.argv.slice(2);
const userArgsStr = userArgs.join(' ');
const projectPath = process.cwd(); // 默认使用当前目录作为项目路径
const outputDir = process.cwd(); // 默认使用当前目录作为输出路径

// 检查是否包含命令选项（以--或-开头的参数）
const hasCommandOptions = userArgs.some(arg => arg.startsWith('--') || arg.startsWith('-'));

// 当用户输入纯参数（不含命令选项和明确命令）时触发智能处理
if (!hasCommandOptions &&
  !userArgs.includes('generate') &&
  !userArgs.includes('scan') &&
  !userArgs.includes('interactive') &&
  !userArgs.includes('help') &&
  userArgs.length > 0 &&
  userArgs.length <= 3) { // 限制参数数量，避免复杂的命令被误判

  console.log(chalk.blue.bold('🤖 SoftCopyright 智能软著生成器启动'));

  handleCopyrightKeywords(userArgsStr, projectPath, outputDir).then(result => {
    if (result !== false) {
      console.log(chalk.green('\n✅ SoftCopyright 处理完成！'));
      console.log(chalk.blue('💡 您可以查看当前目录下生成的HTML文件'));
      console.log(chalk.blue('💡 在浏览器中打开HTML文件，然后打印为PDF即可获得软著材料'));
    }
    process.exit(0);
  }).catch(error => {
    console.error(chalk.red('\n❌ 软著生成失败:'), error.message);
    console.error(chalk.yellow('\n🔧 如果问题持续存在，请尝试：'));
    console.error(chalk.white('  • 确保在正确的项目目录中运行'));
    console.error(chalk.white('  • 检查项目是否包含源代码文件'));
    console.error(chalk.white('  • 使用交互式模式: node scripts/index.js interactive'));
    process.exit(1);
  });

  // 智能处理触发后不再解析命令
} else {
  // 没有检测到关键词，正常解析命令行参数
  program.parse();

  // 如果没有提供命令，显示帮助
  if (!process.argv.slice(2).length) {
    program.outputHelp();
  }
}