#!/usr/bin/env node

const chalk = require('chalk');
const path = require('path');

/**
 * 性能测试脚本
 * 对比优化前后的性能差异
 */

async function runPerformanceTest() {
    console.log(chalk.blue.bold('\n========================================'));
    console.log(chalk.blue.bold('  SoftCopyright 性能测试'));
    console.log(chalk.blue.bold('========================================\n'));

    // 测试项目路径
    const testPath = process.argv[2] || process.cwd();
    console.log(chalk.cyan(`测试项目: ${testPath}\n`));

    // 测试1: 使用优化版本
    console.log(chalk.yellow('📊 测试1: 优化版本（默认）'));
    console.log(chalk.gray('----------------------------------------'));

    delete require.cache[require.resolve('./scripts/scanner')];
    const scannerOptimized = require('./scripts/scanner');

    const start1 = Date.now();
    const result1 = await scannerOptimized.scanProject(testPath);
    const time1 = Date.now() - start1;

    console.log(chalk.green(`✅ 完成! 耗时: ${time1}ms`));
    console.log(chalk.cyan(`   - 文件数: ${result1.files.length}`));
    console.log(chalk.cyan(`   - 代码行数: ${result1.totalLines}`));
    console.log(chalk.cyan(`   - 扫描耗时: ${result1.performance.scanTime}ms`));
    console.log(chalk.cyan(`   - 分析耗时: ${result1.performance.analysisTime}ms\n`));

    // 测试2: 禁用优化
    console.log(chalk.yellow('📊 测试2: 禁用优化'));
    console.log(chalk.gray('----------------------------------------'));

    process.env.SOFTCOPYRIGHT_NO_OPTIMIZATION = '1';
    delete require.cache[require.resolve('./scripts/scanner')];
    const scannerOriginal = require('./scripts/scanner');

    const start2 = Date.now();
    const result2 = await scannerOriginal.scanProject(testPath);
    const time2 = Date.now() - start2;

    console.log(chalk.green(`✅ 完成! 耗时: ${time2}ms`));
    console.log(chalk.cyan(`   - 文件数: ${result2.files.length}`));
    console.log(chalk.cyan(`   - 代码行数: ${result2.totalLines}\n`));

    // 恢复环境变量
    delete process.env.SOFTCOPYRIGHT_NO_OPTIMIZATION;

    // 性能对比
    console.log(chalk.blue.bold('========================================'));
    console.log(chalk.blue.bold('  性能对比结果'));
    console.log(chalk.blue.bold('========================================\n'));

    const improvement = ((time2 - time1) / time2 * 100).toFixed(1);
    const speedup = (time2 / time1).toFixed(2);

    console.log(chalk.green(`性能提升: ${improvement}%`));
    console.log(chalk.green(`加速倍数: ${speedup}x`));
    console.log(chalk.cyan(`优化版耗时: ${time1}ms`));
    console.log(chalk.cyan(`原始版耗时: ${time2}ms`));
    console.log(chalk.cyan(`节省时间: ${time2 - time1}ms\n`));

    // 详细对比
    if (result1.performance) {
        console.log(chalk.yellow('详细性能指标:'));
        console.log(chalk.gray('----------------------------------------'));
        console.log(chalk.cyan(`文件扫描: ${result1.performance.scanTime}ms`));
        console.log(chalk.cyan(`文件分析: ${result1.performance.analysisTime}ms`));
        console.log(chalk.cyan(`处理文件: ${result1.performance.filesProcessed}`));
        console.log(chalk.cyan(`跳过文件: ${result1.performance.filesSkipped}`));

        if (result1.performance.filesProcessed > 0) {
            const avgTime = result1.performance.analysisTime / result1.performance.filesProcessed;
            console.log(chalk.cyan(`平均每文件: ${avgTime.toFixed(2)}ms\n`));
        }
    }

    // 性能评级
    console.log(chalk.yellow('性能评级:'));
    console.log(chalk.gray('----------------------------------------'));

    let rating = '';
    let color = chalk.green;

    if (improvement >= 70) {
        rating = '🌟🌟🌟🌟🌟 优秀';
        color = chalk.green.bold;
    } else if (improvement >= 50) {
        rating = '🌟🌟🌟🌟 良好';
        color = chalk.green;
    } else if (improvement >= 30) {
        rating = '🌟🌟🌟 中等';
        color = chalk.yellow;
    } else if (improvement >= 10) {
        rating = '🌟🌟 一般';
        color = chalk.yellow;
    } else {
        rating = '🌟 较差';
        color = chalk.red;
    }

    console.log(color(rating));
    console.log('');

    // 建议
    if (improvement < 30) {
        console.log(chalk.yellow('💡 优化建议:'));
        console.log(chalk.gray('----------------------------------------'));
        console.log(chalk.cyan('- 项目文件较少，优化效果不明显'));
        console.log(chalk.cyan('- 尝试在更大的项目上测试'));
        console.log(chalk.cyan('- 考虑启用更多优化选项\n'));
    }

    console.log(chalk.blue.bold('========================================\n'));
}

// 运行测试
runPerformanceTest().catch(error => {
    console.error(chalk.red('❌ 测试失败:'), error.message);
    console.error(error.stack);
    process.exit(1);
});
