/**
 * 使用系统Chrome生成PDF
 * 避免Puppeteer兼容性问题
 */

const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

/**
 * 检查系统Chrome是否可用
 * @returns {boolean}
 */
function checkSystemChrome() {
  try {
    // macOS Chrome
    execSync('which google-chrome', { stdio: 'ignore' });
    return 'google-chrome';
  } catch (e) {
    try {
      // macOS Chrome Canary
      execSync('which google-chrome-stable', { stdio: 'ignore' });
      return 'google-chrome-stable';
    } catch (e) {
      try {
        // macOS Safari (不支持HTML转PDF)
        execSync('which safari', { stdio: 'ignore' });
        return 'safari';
      } catch (e) {
        return false;
      }
    }
  }
}

/**
 * 使用系统Chrome将HTML转换为PDF
 * @param {string} htmlPath HTML文件路径
 * @param {string} outputPath PDF输出路径
 * @returns {Promise<boolean>}
 */
async function convertHTMLToPDFWithSystemChrome(htmlPath, outputPath) {
  const chromeCommand = checkSystemChrome();

  if (!chromeCommand) {
    console.warn(chalk.yellow('⚠️  未找到系统Chrome浏览器'));
    console.warn(chalk.cyan('💡 建议手动操作:'));
    console.warn(chalk.cyan('   1. 在浏览器中打开HTML文件'));
    console.warn(chalk.cyan('   2. 使用打印功能保存为PDF'));
    return false;
  }

  if (chromeCommand === 'safari') {
    console.warn(chalk.yellow('⚠️  Safari不支持HTML转PDF'));
    console.warn(chalk.cyan('💡 建议手动操作:'));
    console.warn(chalk.cyan('   1. 在Chrome浏览器中打开HTML文件'));
    console.warn(chalk.cyan('   2. 使用打印功能保存为PDF'));
    return false;
  }

  try {
    console.log(chalk.blue(`🔄 使用系统Chrome转换: ${chromeCommand}`));

    // 使用Chrome的无头模式
    const args = [
      '--headless',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--allow-running-insecure-content',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-extensions',
      '--disable-plugins',
      '--disable-default-apps',
      '--mute-audio'
    ];

    const chromeArgs = [
      '--print-to-pdf=' + outputPath,
      '--print-to-pdf-no-header',
      '--virtual-time-budget=10000',
      ...args,
      'file://' + path.resolve(htmlPath)
    ];

    console.log(chalk.gray('命令:'), chromeCommand, chromeArgs.join(' '));

    execSync(`${chromeCommand} ${chromeArgs.join(' ')}`, {
      stdio: 'inherit',
      timeout: 30000
    });

    if (await fs.pathExists(outputPath)) {
      console.log(chalk.green(`✅ PDF转换成功: ${outputPath}`));
      return true;
    } else {
      console.warn(chalk.red('❌ PDF文件未生成'));
      return false;
    }

  } catch (error) {
    console.warn(chalk.red('❌ Chrome转换失败:'), error.message);
    console.warn(chalk.cyan('💡 建议手动操作:'));
    console.warn(chalk.cyan('   1. 在Chrome浏览器中打开HTML文件'));
    console.warn(chalk.cyan('   2. 使用打印功能保存为PDF'));
    return false;
  }
}

/**
 * 自动转换HTML为PDF（带备用方案）
 * @param {string} htmlPath HTML文件路径
 * @param {string} outputPath PDF输出路径
 * @returns {Promise<boolean>}
 */
async function autoConvertHTMLToPDF(htmlPath, outputPath) {
  try {
    console.log(chalk.yellow('🔄 尝试自动HTML转PDF...'));

    // 方法1: 尝试使用系统Chrome
    const chromeSuccess = await convertHTMLToPDFWithSystemChrome(htmlPath, outputPath);
    if (chromeSuccess) {
      return true;
    }

    // 方法2: 提供手动操作指导
    console.log(chalk.blue('\n📋 手动操作指南:'));
    console.log(chalk.white('1. 复制HTML文件路径:'));
    console.log(chalk.cyan(`   ${htmlPath}`));
    console.log(chalk.white('2. 在Chrome浏览器中打开该文件'));
    console.log(chalk.white('3. 按 Cmd+P 打开打印对话框'));
    console.log(chalk.white('4. 选择"保存为PDF"'));
    console.log(chalk.white('5. 选择输出路径和文件名'));

    return false;

  } catch (error) {
    console.error(chalk.red('❌ 转换过程出错:'), error.message);
    return false;
  }
}

/**
 * 完整的自动PDF生成流程（含备用方案）
 * @param {Object} projectInfo 项目信息
 * @param {string} outputDir 输出目录
 * @returns {Promise<{htmlPath: string, pdfPath: string, success: boolean}>}
 */
async function generateAutoPDF(projectInfo, outputDir) {
  try {
    const moment = require('moment');
    const timestamp = moment().format('YYYYMMDD_HHMMSS');

    // 1. 生成HTML
    const { generateManualHTML } = require('./simple-doc-generator');
    console.log(chalk.yellow('📝 步骤1: 生成HTML文档...'));
    const htmlPath = await generateManualHTML(projectInfo, outputDir);

    // 2. 生成PDF文件名
    const pdfFileName = `软件说明书_${projectInfo.name}_${timestamp}.pdf`;
    const pdfPath = path.join(outputDir, pdfFileName);

    // 3. 自动转换HTML为PDF
    console.log(chalk.yellow('📄 步骤2: 自动转换为PDF...'));
    const success = await autoConvertHTMLToPDF(htmlPath, pdfPath);

    // 4. 返回结果
    return {
      htmlPath,
      pdfPath,
      success: success || await fs.pathExists(pdfPath) // 最后检查是否成功
    };

  } catch (error) {
    throw new Error(`自动PDF生成失败: ${error.message}`);
  }
}

/**
 * 创建包含PDF转换指导的HTML文件
 * @param {string} htmlPath 原始HTML路径
 * @returns {Promise<string>} 增强版HTML路径
 */
async function createEnhancedHTML(htmlPath) {
  try {
    const content = await fs.readFile(htmlPath, 'utf8');

    // 在HTML头部添加PDF转换指导
    const enhancedContent = content.replace(
      '<head>',
      `<head>
    <script>
      // 自动打开PDF转换指导
      window.onload = function() {
        console.log('📄 软件说明书已加载');
        console.log('💡 提示: 按下 Cmd+P 可直接打印为PDF');

        // 添加快捷键提示
        document.addEventListener('keydown', function(e) {
          if (e.metaKey && e.key === 'p') {
            e.preventDefault();
            console.log('🖨️  正在打开打印对话框...');
            setTimeout(() => {
              window.print();
            }, 100);
          }
        });
      };
    </script>
    `
    );

    const enhancedPath = htmlPath.replace('.html', '_enhanced.html');
    await fs.writeFile(enhancedPath, enhancedContent, 'utf8');

    console.log(chalk.green(`✅ 增强版HTML已生成: ${enhancedPath}`));
    return enhancedPath;

  } catch (error) {
    console.warn(chalk.yellow('⚠️  创建增强版HTML失败:'), error.message);
    return htmlPath;
  }
}

module.exports = {
  checkSystemChrome,
  convertHTMLToPDFWithSystemChrome,
  autoConvertHTMLToPDF,
  generateAutoPDF,
  createEnhancedHTML
};