#!/usr/bin/env node

/**
 * 测试修复后的生成功能
 */

const chalk = require('chalk');
const path = require('path');
const scanner = require('./scripts/scanner');
const { generateManualHTML } = require('./scripts/simple-doc-generator');
const { exportSourceCodeHTML } = require('./scripts/html-source-exporter');

async function testHtmlGeneration() {
    console.log(chalk.blue.bold('\n🧪 测试HTML生成功能\n'));
    console.log(chalk.gray('='.repeat(60)));

    try {
        // 测试项目路径
        const projectPath = process.argv[2] || process.cwd();
        const outputDir = path.join(projectPath, 'test-output');

        console.log(chalk.yellow(`\n📁 测试项目: ${projectPath}`));
        console.log(chalk.yellow(`📁 输出目录: ${outputDir}\n`));

        // 确保输出目录存在
        const fs = require('fs-extra');
        await fs.ensureDir(outputDir);

        // 1. 扫描项目
        console.log(chalk.cyan('步骤1: 扫描项目...'));
        const projectInfo = await scanner.scanProject(projectPath);
        console.log(chalk.green(`✅ 扫描完成: ${projectInfo.files.length}个文件, ${projectInfo.totalLines}行代码\n`));

        // 2. 生成软件说明书HTML
        console.log(chalk.cyan('步骤2: 生成软件说明书HTML...'));
        const manualPath = await generateManualHTML(projectInfo, outputDir);
        console.log(chalk.green(`✅ 软件说明书: ${path.basename(manualPath)}\n`));

        // 3. 生成源代码文档HTML
        console.log(chalk.cyan('步骤3: 生成源代码文档HTML...'));
        const sourcePath = await exportSourceCodeHTML(projectInfo, outputDir);
        console.log(chalk.green(`✅ 源代码文档: ${path.basename(sourcePath)}\n`));

        // 4. 验证文件是否存在且包含中文

        console.log(chalk.cyan('步骤4: 验证生成的文件...'));

        const manualContent = fs.readFileSync(manualPath, 'utf8');
        const sourceContent = fs.readFileSync(sourcePath, 'utf8');

        const hasChinese = (content) => /[\u4e00-\u9fa5]/.test(content);

        if (hasChinese(manualContent)) {
            console.log(chalk.green('✅ 软件说明书包含中文字符'));
        } else {
            console.log(chalk.red('❌ 软件说明书未检测到中文'));
        }

        if (hasChinese(sourceContent)) {
            console.log(chalk.green('✅ 源代码文档包含中文字符'));
        } else {
            console.log(chalk.red('❌ 源代码文档未检测到中文'));
        }

        console.log(chalk.blue.bold('\n🎉 测试完成！\n'));
        console.log(chalk.cyan(`📁 输出目录: ${outputDir}`));
        console.log(chalk.white('💡 请在浏览器中打开HTML文件验证中文显示\n'));

        process.exit(0);

    } catch (error) {
        console.error(chalk.red('\n❌ 测试失败:'), error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// 运行测试
testHtmlGeneration();
