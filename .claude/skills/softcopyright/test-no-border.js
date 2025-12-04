#!/usr/bin/env node

const path = require('path');
const scanner = require('./scripts/scanner');
const { exportSourceCodeHTML } = require('./scripts/html-source-exporter');
const fs = require('fs-extra');
const chalk = require('chalk');

async function testNoBorder() {
  try {
    console.log(chalk.blue.bold('🔧 测试去除打印预览红框'));
    console.log(chalk.gray('='.repeat(60)));

    const projectPath = process.argv[2] || process.cwd();
    const outputDir = process.argv[3] || path.join(process.cwd(), 'softcopyright-output');

    await fs.ensureDir(outputDir);

    console.log(chalk.yellow('🔍 扫描项目...'));
    const projectInfo = await scanner.scanProject(projectPath);

    console.log(chalk.yellow('\n📄 生成源代码文档（无边框版）...'));
    const sourcePath = await exportSourceCodeHTML(projectInfo, outputDir);

    console.log(chalk.green(`✅ 已生成: ${path.basename(sourcePath)}`));

    console.log(chalk.blue.bold('\n🎉 修复完成！'));
    console.log(chalk.cyan('\n✅ 已移除样式:'));
    console.log(chalk.white('• border: none !important'));
    console.log(chalk.white('• outline: none !important'));
    console.log(chalk.white('• box-shadow: none !important'));

    console.log(chalk.cyan('\n🖨️ 验证方法:'));
    console.log(chalk.white('1. 在浏览器中打开生成的HTML文件'));
    console.log(chalk.white('2. 按Cmd+P进入打印预览'));
    console.log(chalk.white('3. 检查页眉页脚是否还有红色高亮框'));
    console.log(chalk.white('4. 红框应该已经消失'));

  } catch (error) {
    console.error(chalk.red('❌ 失败:'), error.message);
    throw error;
  }
}

testNoBorder().then(() => {
  console.log(chalk.green('\n✨ 完成！'));
}).catch(() => {
  process.exit(1);
});