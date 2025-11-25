#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const scanner = require('./scanner');
const { generateManualHTML } = require('./simple-doc-generator');
const { exportSourceCodeHTML } = require('./html-source-exporter');
const fs = require('fs-extra');
const path = require('path');

const program = new Command();

program
  .name('softcopyright')
  .description('智能软件著作权申请材料生成工具')
  .version('1.0.3');

program
  .command('generate')
  .description('生成完整的软著申请材料（软件说明书 + 源代码文档）')
  .option('-p, --project <path>', '项目路径', process.cwd())
  .option('-o, --output <path>', '输出目录')
  .option('--auto-pdf', '自动打开浏览器并触发打印对话框', false)
  .action(async (options) => {
    try {
      console.log(chalk.blue.bold('📋 SoftCopyright - 软著材料生成工具'));
      console.log(chalk.gray('='.repeat(60)));

      const projectPath = path.resolve(options.project);
      const defaultOutputDir = path.join(projectPath, 'softcopyright-output');
      const outputDir = options.output ? path.resolve(options.output) : defaultOutputDir;

      await fs.ensureDir(outputDir);

      console.log(chalk.cyan(`📁 项目路径: ${projectPath}`));
      console.log(chalk.cyan(`📁 输出目录: ${outputDir}`));

      console.log(chalk.yellow('\n🔍 扫描项目...'));
      const projectInfo = await scanner.scanProject(projectPath);

      console.log(chalk.yellow('\n📄 生成软件说明书...'));
      const manualPath = await generateManualHTML(projectInfo, outputDir);
      console.log(chalk.green(`✅ ${path.basename(manualPath)}`));

      console.log(chalk.yellow('\n📄 生成源代码文档...'));
      const sourcePath = await exportSourceCodeHTML(projectInfo, outputDir);
      console.log(chalk.green(`✅ ${path.basename(sourcePath)}`));

      console.log(chalk.blue.bold('\n🎉 生成完成！'));
      console.log(chalk.cyan(`\n📁 输出目录: ${outputDir}`));

      // 如果启用了auto-pdf选项，自动打开浏览器
      if (options.autoPdf) {
        console.log(chalk.yellow('\n🌐 自动打开浏览器...'));
        const { openInBrowser, createAutoPrintHTML } = require('./auto-print-pdf');

        const autoPrintManualPath = await createAutoPrintHTML(manualPath);
        await openInBrowser(autoPrintManualPath);

        console.log(chalk.cyan('💡 浏览器将在3秒后自动打开打印对话框'));
        console.log(chalk.white('   选择"保存为PDF"即可导出PDF文件'));
      } else {
        console.log(chalk.white('\n💡 提示: 在浏览器中打开HTML文件，按Cmd+P打印为PDF'));
        console.log(chalk.white('   或者使用 --auto-pdf 选项自动打开浏览器'));
      }

    } catch (error) {
      console.error(chalk.red('❌ 错误:'), error.message);
      process.exit(1);
    }
  });

program
  .command('manual')
  .description('仅生成软件说明书')
  .option('-p, --project <path>', '项目路径', process.cwd())
  .option('-o, --output <path>', '输出目录')
  .option('--auto-pdf', '自动打开浏览器并触发打印对话框', false)
  .action(async (options) => {
    try {
      const projectPath = path.resolve(options.project);
      const defaultOutputDir = path.join(projectPath, 'softcopyright-output');
      const outputDir = options.output ? path.resolve(options.output) : defaultOutputDir;

      await fs.ensureDir(outputDir);

      console.log(chalk.yellow('🔍 扫描项目...'));
      const projectInfo = await scanner.scanProject(projectPath);

      console.log(chalk.yellow('\n📄 生成软件说明书...'));
      const manualPath = await generateManualHTML(projectInfo, outputDir);
      console.log(chalk.green(`✅ 已生成: ${path.basename(manualPath)}`));
      console.log(chalk.cyan(`📁 输出目录: ${outputDir}`));

    } catch (error) {
      console.error(chalk.red('❌ 错误:'), error.message);
      process.exit(1);
    }
  });

program
  .command('source')
  .description('仅生成源代码文档')
  .option('-p, --project <path>', '项目路径', process.cwd())
  .option('-o, --output <path>', '输出目录')
  .option('--auto-pdf', '自动打开浏览器并触发打印对话框', false)
  .action(async (options) => {
    try {
      const projectPath = path.resolve(options.project);
      const defaultOutputDir = path.join(projectPath, 'softcopyright-output');
      const outputDir = options.output ? path.resolve(options.output) : defaultOutputDir;

      await fs.ensureDir(outputDir);

      console.log(chalk.yellow('🔍 扫描项目...'));
      const projectInfo = await scanner.scanProject(projectPath);

      console.log(chalk.yellow('\n📄 生成源代码文档...'));
      const sourcePath = await exportSourceCodeHTML(projectInfo, outputDir);
      console.log(chalk.green(`✅ 已生成: ${path.basename(sourcePath)}`));
      console.log(chalk.cyan(`📁 输出目录: ${outputDir}`));

    } catch (error) {
      console.error(chalk.red('❌ 错误:'), error.message);
      process.exit(1);
    }
  });

program
  .command('scan')
  .description('扫描项目并显示统计信息')
  .argument('<path>', '项目路径')
  .action(async (projectPath) => {
    try {
      const resolvedPath = path.resolve(projectPath);
      const projectInfo = await scanner.scanProject(resolvedPath);

      console.log(chalk.blue.bold('\n📊 项目统计'));
      console.log(chalk.gray('='.repeat(60)));
      console.log(chalk.white(`项目名称: ${projectInfo.name}`));
      console.log(chalk.white(`文件数量: ${projectInfo.files.length}`));
      console.log(chalk.white(`代码行数: ${projectInfo.totalLines}`));
      console.log(chalk.white(`项目大小: ${(projectInfo.totalSize / 1024).toFixed(2)} KB`));
      console.log(chalk.white(`编程语言: ${projectInfo.languages.join(', ')}`));

    } catch (error) {
      console.error(chalk.red('❌ 错误:'), error.message);
      process.exit(1);
    }
  });

program.parse();
