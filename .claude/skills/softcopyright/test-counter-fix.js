#!/usr/bin/env node

const path = require('path');
const scanner = require('./scripts/scanner');
const { generateManualHTML } = require('./scripts/simple-doc-generator');
const { exportSourceCodeHTML } = require('./scripts/html-source-exporter');
const fs = require('fs-extra');
const chalk = require('chalk');

async function testCounterFix() {
  try {
    console.log(chalk.blue.bold('🔧 测试页码计数器修复'));
    console.log(chalk.gray('='.repeat(60)));

    const projectPath = process.argv[2] || process.cwd();
    const outputDir = process.argv[3] || path.join(process.cwd(), 'softcopyright-output');

    await fs.ensureDir(outputDir);

    console.log(chalk.yellow('🔍 扫描项目...'));
    const projectInfo = await scanner.scanProject(projectPath);

    console.log(chalk.yellow('\n📄 生成软件说明书...'));
    const manualPath = await generateManualHTML(projectInfo, outputDir);
    console.log(chalk.green(`✅ ${path.basename(manualPath)}`));

    console.log(chalk.yellow('\n📄 生成源代码文档...'));
    const sourcePath = await exportSourceCodeHTML(projectInfo, outputDir);
    console.log(chalk.green(`✅ ${path.basename(sourcePath)}`));

    console.log(chalk.blue.bold('\n🎉 生成完成！'));
    console.log(chalk.cyan('\n✅ 修复内容:'));
    console.log(chalk.white('• 在@page规则中添加 counter-reset: page 1'));
    console.log(chalk.white('• 页码现在应该从"第 1 页"开始'));
    console.log(chalk.white('• 页眉显示"软件名称_版本号"'));
    console.log(chalk.white('• 页脚右下角显示自动递增的页码'));

    console.log(chalk.cyan('\n🖨️ 验证方法:'));
    console.log(chalk.white('1. 在浏览器中打开生成的HTML文件'));
    console.log(chalk.white('2. 按Cmd+P进入打印预览'));
    console.log(chalk.white('3. 检查第一页是否显示"第 1 页"（不是第 0 页）'));
    console.log(chalk.white('4. 检查页眉是否显示"AI智能体_V1.0.2"'));
    console.log(chalk.white('5. 翻到第二页，检查是否显示"第 2 页"'));

    console.log(chalk.cyan(`\n📁 输出目录: ${outputDir}`));

  } catch (error) {
    console.error(chalk.red('❌ 失败:'), error.message);
    throw error;
  }
}

testCounterFix().then(() => {
  console.log(chalk.green('\n✨ 完成！'));
}).catch(() => {
  process.exit(1);
});
