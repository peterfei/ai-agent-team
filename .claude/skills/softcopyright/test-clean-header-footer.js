#!/usr/bin/env node

const path = require('path');
const scanner = require('./scripts/scanner');
const { generateManualHTML } = require('./scripts/simple-doc-generator');
const { exportSourceCodeHTML } = require('./scripts/html-source-exporter');
const fs = require('fs-extra');
const chalk = require('chalk');

async function testCleanHeaderFooter() {
  try {
    console.log(chalk.blue.bold('✨ 测试简化的页眉页脚'));
    console.log(chalk.gray('='.repeat(60)));

    const projectPath = process.argv[2] || process.cwd();
    const outputDir = process.argv[3] || path.join(process.cwd(), 'softcopyright-output');

    await fs.ensureDir(outputDir);

    console.log(chalk.yellow('🔍 扫描项目...'));
    const projectInfo = await scanner.scanProject(projectPath);

    console.log(chalk.yellow('\n📄 生成软件说明书（简化版）...'));
    const manualPath = await generateManualHTML(projectInfo, outputDir);
    console.log(chalk.green(`✅ ${path.basename(manualPath)}`));

    console.log(chalk.yellow('\n📄 生成源代码文档（简化版）...'));
    const sourcePath = await exportSourceCodeHTML(projectInfo, outputDir);
    console.log(chalk.green(`✅ ${path.basename(sourcePath)}`));

    console.log(chalk.blue.bold('\n🎉 生成完成！'));
    console.log(chalk.cyan('\n✅ 页眉页脚简化:'));
    console.log(chalk.white('• 页眉左上角：只显示"软件名称V版本号"'));
    console.log(chalk.white('• 页脚右下角：只显示"第 X 页"'));
    console.log(chalk.white('• 已移除：生成时间信息'));
    console.log(chalk.white('• 已移除：软件著作权申请材料标签'));
    console.log(chalk.white('• 已移除：左下角软件信息'));

    console.log(chalk.cyan('\n🖨️ 验证方法:'));
    console.log(chalk.white('1. 在浏览器中打开HTML文件'));
    console.log(chalk.white('2. 按Cmd+P进入打印预览'));
    console.log(chalk.white('3. 检查页眉是否只显示"AI智能体V1.0.2"'));
    console.log(chalk.white('4. 检查页脚是否只显示"第 X 页"'));

    console.log(chalk.cyan(`\n📁 输出目录: ${outputDir}`));

  } catch (error) {
    console.error(chalk.red('❌ 失败:'), error.message);
    throw error;
  }
}

testCleanHeaderFooter().then(() => {
  console.log(chalk.green('\n✨ 完成！'));
}).catch(() => {
  process.exit(1);
});