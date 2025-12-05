/**
 * 自动打印PDF解决方案
 * 使用系统浏览器自动打开HTML并触发打印
 */

const { exec } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

/**
 * 使用系统默认浏览器打开HTML文件
 * @param {string} htmlPath HTML文件路径
 * @returns {Promise<boolean>}
 */
async function openInBrowser(htmlPath) {
  return new Promise((resolve, reject) => {
    console.log(chalk.blue(`🌐 在浏览器中打开: ${htmlPath}`));

    // macOS使用open命令
    const command = process.platform === 'darwin' ? 'open' :
                   process.platform === 'win32' ? 'start' : 'xdg-open';

    const child = exec(`${command} "${htmlPath}"`, (error) => {
      if (error) {
        console.warn(chalk.yellow('⚠️  浏览器打开失败:'), error.message);
        resolve(false);
      } else {
        console.log(chalk.green('✅ 浏览器已打开'));
        resolve(true);
      }
    });

    // 设置超时
    setTimeout(() => {
      resolve(true); // 假设成功，即使没有回调
    }, 2000);
  });
}

/**
 * 创建包含自动打印功能的HTML文件
 * @param {string} originalHtmlPath 原始HTML路径
 * @returns {Promise<string>} 增强版HTML路径
 */
async function createAutoPrintHTML(originalHtmlPath) {
  try {
    const content = await fs.readFile(originalHtmlPath, 'utf8');

    // 增强的HTML内容，添加自动打印功能
    const enhancedContent = content.replace(
      '</head>',
      `
      <script>
        // 自动打印设置
        window.onload = function() {
          console.log('📄 软件说明书已加载');

          // 显示提示信息
          setTimeout(() => {
            alert('💡 提示：\n1. 本页面将自动打开打印对话框\n2. 可以取消后手动按 Cmd+P 打印\n3. 建议选择"保存为PDF"格式');
          }, 1000);

          // 自动打开打印对话框（延迟2秒，让页面完全加载）
          setTimeout(() => {
            console.log('🖨️ 正在自动打开打印对话框...');
            try {
              window.print();
            } catch (e) {
              console.log('打印对话框打开失败，请手动按 Cmd+P');
            }
          }, 3000);
        };

        // 添加键盘事件监听
        document.addEventListener('keydown', function(e) {
          // Cmd+P 或 Ctrl+P
          if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
            e.preventDefault();
            console.log('🖨️ 手动触发打印...');
            try {
              window.print();
            } catch (e) {
              console.log('打印失败，请检查浏览器设置');
            }
          }
        });

        // 添加打印完成监听
        window.onafterprint = function() {
          console.log('✅ 打印对话框已关闭');
        };

        // 添加页面卸载提醒
        window.addEventListener('beforeunload', function(e) {
          if (!document.printing) {
            return;
          }
        });
      </script>
      </head>
    `.trim() + '\n');

    const enhancedPath = originalHtmlPath.replace('.html', '_auto_print.html');
    await fs.writeFile(enhancedPath, enhancedContent, 'utf8');

    console.log(chalk.green(`✅ 自动打印版HTML已生成: ${enhancedPath}`));
    return enhancedPath;

  } catch (error) {
    console.warn(chalk.yellow('⚠️  创建自动打印版HTML失败:'), error.message);
    return originalHtmlPath;
  }
}

/**
 * 完整的自动打印解决方案
 * @param {Object} projectInfo 项目信息
 * @param {string} outputDir 输出目录
 * @returns {Promise<{htmlPath: string, autoPrintPath: string, browserOpened: boolean}>}
 */
async function generateAutoPrintPDF(projectInfo, outputDir) {
  try {
    const moment = require('moment');

    console.log(chalk.blue.bold('🚀 SoftCopyright - 自动PDF解决方案'));
    console.log(chalk.gray('='.repeat(50)));

    // 1. 扫描项目
    console.log(chalk.yellow('📊 步骤1: 扫描项目源码...'));
    const scanner = require('./scanner');
    let scannedProjectInfo;
    
    if (typeof projectInfo === 'string') {
       scannedProjectInfo = await scanner.scanProject(projectInfo);
    } else if (projectInfo && projectInfo.files) {
       scannedProjectInfo = projectInfo;
    } else {
       scannedProjectInfo = await scanner.scanProject(process.cwd());
    }

    console.log(chalk.green(`✅ 项目扫描完成: ${scannedProjectInfo.name}`));
    console.log(chalk.white(`   - 文件数: ${scannedProjectInfo.files.length}`));
    console.log(chalk.white(`   - 代码行数: ${scannedProjectInfo.totalLines}`));
    console.log(chalk.white(`   - 主要语言: ${scannedProjectInfo.languages.join(', ')}`));

    // 2. 生成原始HTML
    console.log(chalk.yellow('📝 步骤2: 生成HTML文档...'));
    const { generateManualHTML } = require('./simple-doc-generator');
    const htmlPath = await generateManualHTML(scannedProjectInfo, outputDir);

    // 3. 生成自动打印版HTML
    console.log(chalk.yellow('🖨️  步骤3: 创建自动打印版HTML...'));
    const autoPrintPath = await createAutoPrintHTML(htmlPath);

    // 4. 在浏览器中打开
    console.log(chalk.yellow('🌐 步骤4: 在浏览器中打开...'));
    const browserOpened = await openInBrowser(autoPrintPath);

    // 5. 显示结果
    console.log(chalk.green.bold('\n🎉 自动打印方案启动成功！'));
    console.log(chalk.blue(`📄 HTML文件: ${htmlPath}`));
    console.log(chalk.blue(`🖨️ 自动打印版: ${autoPrintPath}`));
    console.log(chalk.green(`🌐 浏览器${browserOpened ? '已打开' : '请手动打开'}: ${autoPrintPath}`));

    console.log(chalk.cyan('\n💡 接下来的操作:'));
    console.log(chalk.white('1. 浏览器将自动打开打印对话框（3秒后）'));
    console.log(chalk.white('2. 选择"保存为PDF"格式'));
    console.log(chalk.white('3. 设置合适的页边距和缩放'));
    console.log(chalk.white('4. 保存PDF文件'));

    console.log(chalk.cyan('\n⌨️  快捷键:'));
    console.log(chalk.white('  - 随时自动打印: 在打印对话框中选择取消'));
    console.log(chalk.white('  - 手动打印: 随时按 Cmd+P (Mac) 或 Ctrl+P (Windows/Linux)'));

    return {
      htmlPath,
      autoPrintPath,
      browserOpened
    };

  } catch (error) {
    console.error(chalk.red('❌ 自动打印方案失败:'), error.message);
    throw error;
  }
}

/**
 * 检查系统浏览器
 * @returns {string} 可用浏览器名称
 */
function checkBrowser() {
  const { execSync } = require('child_process');

  try {
    execSync('which google-chrome', { stdio: 'ignore' });
    return 'Google Chrome';
  } catch (e) {
    try {
      execSync('which chrome', { stdio: 'ignore' });
      return 'Chrome';
    } catch (e) {
      try {
        execSync('which firefox', { stdio: 'ignore' });
        return 'Firefox';
      } catch (e) {
        try {
          execSync('which safari', { stdio: 'ignore' });
          return 'Safari';
        } catch (e) {
          return '系统默认浏览器';
        }
      }
    }
  }
}

module.exports = {
  openInBrowser,
  createAutoPrintHTML,
  generateAutoPrintPDF,
  checkBrowser
};