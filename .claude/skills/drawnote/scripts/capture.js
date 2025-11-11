#!/usr/bin/env node

/**
 * 使用 Playwright 截取 HTML 文件的截图
 *
 * 使用方法:
 *   node capture.js <html-file-path> <output-image-path> [options]
 *
 * 参数:
 *   html-file-path: 输入的 HTML 文件路径
 *   output-image-path: 输出的 PNG 图片路径
 *
 * 选项:
 *   --width: 视口宽度 (默认: 1920)
 *   --height: 视口高度 (默认: auto，自动适应内容高度)
 *   --full-page: 截取整个页面 (默认: true)
 *   --wait: 等待时间(毫秒)，确保页面完全渲染 (默认: 1000)
 *
 * 示例:
 *   node capture.js input.html output.png
 *   node capture.js input.html output.png --width 1920 --height 1080 --full-page
 *   node capture.js input.html output.png --wait 2000
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 解析命令行参数
function parseArgs() {
    const args = process.argv.slice(2);

    if (args.length < 2) {
        console.error('错误: 需要提供 HTML 文件路径和输出图片路径');
        console.error('使用方法: node capture.js <html-file-path> <output-image-path> [options]');
        process.exit(1);
    }

    const config = {
        htmlPath: args[0],
        outputPath: args[1],
        width: 1920,
        height: 1080,
        fullPage: true,
        wait: 1000
    };

    // 解析选项
    for (let i = 2; i < args.length; i++) {
        if (args[i] === '--width' && i + 1 < args.length) {
            config.width = parseInt(args[i + 1]);
            i++;
        } else if (args[i] === '--height' && i + 1 < args.length) {
            config.height = parseInt(args[i + 1]);
            i++;
        } else if (args[i] === '--full-page') {
            config.fullPage = true;
        } else if (args[i] === '--wait' && i + 1 < args.length) {
            config.wait = parseInt(args[i + 1]);
            i++;
        }
    }

    return config;
}

// 验证文件
function validateFiles(config) {
    // 检查输入文件是否存在
    if (!fs.existsSync(config.htmlPath)) {
        console.error(`错误: HTML 文件不存在: ${config.htmlPath}`);
        process.exit(1);
    }

    // 确保输出目录存在
    const outputDir = path.dirname(config.outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
}

// 主函数
async function captureScreenshot() {
    const config = parseArgs();
    validateFiles(config);

    console.log('截图配置:');
    console.log(`  HTML 文件: ${config.htmlPath}`);
    console.log(`  输出路径: ${config.outputPath}`);
    console.log(`  视口大小: ${config.width}x${config.height}`);
    console.log(`  整页截图: ${config.fullPage ? '是' : '否'}`);
    console.log(`  等待时间: ${config.wait}ms`);
    console.log('');

    let browser;
    try {
        // 启动浏览器
        console.log('启动浏览器...');
        browser = await chromium.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ]
        });

        // 创建页面
        const context = await browser.newContext({
            viewport: {
                width: config.width,
                height: config.height
            },
            acceptDownloads: true,
            ignoreHTTPSErrors: true
        });
        const page = await context.newPage();

        // 设置页面默认行为，避免弹窗
        page.on('dialog', async dialog => {
            await dialog.accept();
        });

        // 转换为绝对路径
        const absoluteHtmlPath = path.resolve(config.htmlPath);
        const fileUrl = `file://${absoluteHtmlPath}`;

        console.log(`加载页面: ${fileUrl}`);
        await page.goto(fileUrl, {
            waitUntil: 'networkidle',
            timeout: 30000
        });

        // 等待页面完全渲染
        console.log(`等待 ${config.wait}ms 确保页面完全渲染...`);
        await page.waitForTimeout(config.wait);

        // 等待所有图片加载完成
        await page.evaluate(() => {
            return Promise.all(
                Array.from(document.images)
                    .filter(img => !img.complete)
                    .map(img => new Promise(resolve => {
                        img.onload = img.onerror = resolve;
                    }))
            );
        });

        // 如果启用了 fullPage，获取实际内容高度
        if (config.fullPage) {
            const contentHeight = await page.evaluate(() => {
                return Math.max(
                    document.documentElement.scrollHeight,
                    document.documentElement.offsetHeight,
                    document.body.scrollHeight,
                    document.body.offsetHeight
                );
            });

            console.log(`检测到内容高度: ${contentHeight}px`);

            // 设置足够的视口高度来容纳完整内容
            await page.setViewportSize({
                width: config.width,
                height: Math.max(contentHeight + 100, config.height)
            });
        }

        // 截图
        console.log('正在截图...');
        await page.screenshot({
            path: config.outputPath,
            fullPage: config.fullPage,
            type: 'png'
        });

        console.log(`✓ 截图成功保存至: ${config.outputPath}`);

        // 获取文件大小
        const stats = fs.statSync(config.outputPath);
        const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
        console.log(`  文件大小: ${fileSizeMB} MB`);

        await browser.close();
        process.exit(0);

    } catch (error) {
        console.error('错误:', error.message);
        if (browser) {
            await browser.close();
        }
        process.exit(1);
    }
}

// 运行
captureScreenshot();
