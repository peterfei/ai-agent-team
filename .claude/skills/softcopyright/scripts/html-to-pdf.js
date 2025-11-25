/**
 * HTML自动转换为PDF
 * 使用Puppeteer将HTML转换为高质量PDF
 */

const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

/**
 * 将HTML文件转换为PDF
 * @param {string} htmlPath HTML文件路径
 * @param {string} outputPath PDF输出路径
 * @returns {Promise<string>} PDF文件路径
 */
async function convertHTMLToPDF(htmlPath, outputPath) {
  let browser;

  try {
    console.log(chalk.yellow('🔄 正在将HTML转换为PDF...'));

    // 启动Puppeteer浏览器
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--lang=zh-CN,zh,zh-TW,en-US,en',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-default-apps'
      ]
    });

    const page = await browser.newPage();

    // 设置视口
    await page.setViewport({ width: 1200, height: 800 });

    // 设置用户代理
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // 加载HTML文件
    await page.goto(`file://${htmlPath}`, {
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 30000
    });

    // 等待页面完全加载
    await page.waitForTimeout(2000);

    // 检查页面是否正确加载
    const title = await page.title();
    console.log(chalk.cyan(`📄 页面标题: ${title}`));

    // 生成PDF
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      },
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size:10px; text-align:center; width:100%; color:#666; font-family: Arial, 'PingFang SC', sans-serif;">
          软件说明书 - ${path.basename(htmlPath, '.html')}
        </div>
      `,
      footerTemplate: `
        <div style="font-size:10px; text-align:center; width:100%; color:#666; font-family: Arial, 'PingFang SC', sans-serif;">
          <span class="pageNumber"></span> / <span class="totalPages"></span>
        </div>
      `,
      preferCSSPageSize: true,
      scale: 1.0
    });

    console.log(chalk.green(`✅ PDF生成成功: ${outputPath}`));

    return outputPath;

  } catch (error) {
    console.error(chalk.red('❌ PDF转换失败:'), error.message);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * 自动转换HTML为PDF的便捷函数
 * @param {Object} projectInfo 项目信息
 * @param {string} outputDir 输出目录
 * @returns {Promise<string>} PDF文件路径
 */
async function generateManualPDF(projectInfo, outputDir) {
  const moment = require('moment');

  try {
    console.log(chalk.yellow('📝 生成HTML并转换为PDF...'));

    const timestamp = moment().format('YYYYMMDD_HHMMSS');

    // 首先生成HTML
    const { generateManualHTML } = require('./simple-doc-generator');
    const htmlPath = await generateManualHTML(projectInfo, outputDir);

    // 生成PDF文件名
    const pdfFileName = `软件说明书_${projectInfo.name}_${timestamp}.pdf`;
    const pdfPath = path.join(outputDir, pdfFileName);

    // 转换为PDF
    await convertHTMLToPDF(htmlPath, pdfPath);

    // 删除临时HTML文件（可选）
    // await fs.remove(htmlPath);

    console.log(chalk.green(`🎉 完整流程完成！`));
    console.log(chalk.blue(`📄 PDF文件: ${pdfPath}`));
    console.log(chalk.gray(`🌐 HTML文件: ${htmlPath}`));

    return pdfPath;

  } catch (error) {
    throw new Error(`自动PDF生成失败: ${error.message}`);
  }
}

/**
 * 批量转换HTML文件为PDF
 * @param {string} inputDir 输入目录
 * @param {string} outputDir 输出目录
 * @returns {Promise<string[]>} 生成的PDF文件路径列表
 */
async function batchConvertHTMLToPDF(inputDir, outputDir) {
  try {
    console.log(chalk.yellow('🔄 批量转换HTML为PDF...'));

    // 确保输出目录存在
    await fs.ensureDir(outputDir);

    // 查找所有HTML文件
    const htmlFiles = await fs.readdir(inputDir);
    const htmlFileList = htmlFiles.filter(file => file.endsWith('.html'));

    if (htmlFileList.length === 0) {
      console.log(chalk.yellow('⚠️  未找到HTML文件'));
      return [];
    }

    const pdfFiles = [];

    for (const htmlFile of htmlFileList) {
      try {
        const htmlPath = path.join(inputDir, htmlFile);
        const pdfFile = htmlFile.replace('.html', '.pdf');
        const pdfPath = path.join(outputDir, pdfFile);

        console.log(chalk.cyan(`🔄 转换: ${htmlFile} -> ${pdfFile}`));

        await convertHTMLToPDF(htmlPath, pdfPath);
        pdfFiles.push(pdfPath);

      } catch (error) {
        console.error(chalk.red(`❌ 转换失败 ${htmlFile}:`), error.message);
      }
    }

    console.log(chalk.green(`✅ 批量转换完成，生成 ${pdfFiles.length} 个PDF文件`));
    return pdfFiles;

  } catch (error) {
    throw new Error(`批量转换失败: ${error.message}`);
  }
}

/**
 * 检查Puppeteer是否可用
 * @returns {Promise<boolean>}
 */
async function checkPuppeteerAvailability() {
  try {
    await puppeteer.createBrowserFetcher().download('chrome');
    return true;
  } catch (error) {
    console.warn(chalk.yellow('⚠️  Puppeteer检查失败:'), error.message);
    return false;
  }
}

module.exports = {
  convertHTMLToPDF,
  generateManualPDF,
  batchConvertHTMLToPDF,
  checkPuppeteerAvailability
};