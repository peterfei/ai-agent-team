/**
 * 简单PDF生成器
 * 使用HTML方式生成PDF，避免中文编码问题
 */

const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');
const chalk = require('chalk');
const { execSync } = require('child_process');

/**
 * 生成软件说明书PDF
 * @param {Object} projectInfo 项目信息
 * @param {string} outputDir 输出目录
 * @returns {Promise<string>} 生成的PDF文件路径
 */
async function generateManualPDF(projectInfo, outputDir) {
  try {
    console.log(chalk.yellow('📝 生成软件说明书(HTML方式)...'));

    const timestamp = moment().format('YYYYMMDD_HHMMSS');
    const fileName = `软件说明书_${projectInfo.name}_${timestamp}.pdf`;
    const outputPath = path.join(outputDir, fileName);

    // 生成HTML内容
    const htmlContent = generateHTMLContent(projectInfo);

    // 创建临时HTML文件
    const tempHtmlPath = path.join(outputDir, `temp_manual_${Date.now()}.html`);
    await fs.writeFile(tempHtmlPath, htmlContent, 'utf8');

    // 尝试使用系统工具转换HTML到PDF
    const success = await convertHTMLToPDF(tempHtmlPath, outputPath);

    // 删除临时HTML文件
    await fs.remove(tempHtmlPath);

    if (success) {
      console.log(chalk.green(`✅ 软件说明书已生成: ${outputPath}`));
      return outputPath;
    } else {
      throw new Error('HTML到PDF转换失败');
    }

  } catch (error) {
    throw new Error(`生成软件说明书失败: ${error.message}`);
  }
}

/**
 * 生成HTML内容
 * @param {Object} projectInfo 项目信息
 * @returns {string} HTML内容
 */
function generateHTMLContent(projectInfo) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>软件说明书 - ${projectInfo.name}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&display=swap');

        body {
            font-family: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            background: white;
        }

        .page-break {
            page-break-before: always;
            margin-top: 50px;
        }

        h1 {
            font-size: 28px;
            font-weight: 700;
            text-align: center;
            margin: 30px 0;
            color: #2C3E50;
        }

        h2 {
            font-size: 20px;
            font-weight: 700;
            margin: 25px 0 15px 0;
            color: #34495E;
            border-left: 4px solid #3498DB;
            padding-left: 15px;
        }

        p {
            margin-bottom: 15px;
            font-size: 14px;
            line-height: 1.8;
            text-align: justify;
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin: 30px 0;
            max-width: 600px;
        }

        .info-item {
            padding: 15px;
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
        }

        .info-label {
            font-weight: 700;
            color: #495057;
            margin-bottom: 5px;
        }

        .info-value {
            color: #6c757d;
        }

        ul, ol {
            margin: 20px 0;
            padding-left: 30px;
        }

        li {
            margin: 10px 0;
            font-size: 14px;
        }

        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #6c757d;
            border-top: 1px solid #e9ecef;
            padding-top: 20px;
        }

        @media print {
            body { padding: 20px; }
            .page-break { page-break-before: always; }
        }
    </style>
</head>
<body>
    <!-- 封面 -->
    <h1>软件说明书</h1>
    <div style="text-align: center; margin: 40px 0;">
        <h2 style="border: none; padding: 0; font-size: 24px;">${projectInfo.name}</h2>
    </div>

    <div class="info-grid">
        <div class="info-item">
            <div class="info-label">版本</div>
            <div class="info-value">1.0.0</div>
        </div>
        <div class="info-item">
            <div class="info-label">生成日期</div>
            <div class="info-value">${moment().format('YYYY年MM月DD日')}</div>
        </div>
        <div class="info-item">
            <div class="info-label">源代码文件</div>
            <div class="info-value">${projectInfo.files.length} 个</div>
        </div>
        <div class="info-item">
            <div class="info-label">总代码行数</div>
            <div class="info-value">${projectInfo.totalLines} 行</div>
        </div>
    </div>

    <!-- 目录 -->
    <div class="page-break">
        <h1>目录</h1>
        <ol>
            <li>引言</li>
            <li>软件概述</li>
            <li>运行环境</li>
            <li>设计思想与实现过程</li>
            <li>功能模块详述</li>
            <li>用户指南</li>
            <li>测试与维护</li>
        </ol>
    </div>

    <!-- 主要内容 -->
    <div class="page-break">
        <h1>1. 引言</h1>

        <h2>1.1 概述</h2>
        <p>${projectInfo.name}是一款基于${projectInfo.languages.join('、')}技术开发的软件应用。本项目包含${projectInfo.files.length}个源代码文件，总计${projectInfo.totalLines}行代码，体现了良好的软件工程实践和模块化设计理念。软件采用了现代化的开发技术和架构设计，具有高度的可扩展性和维护性。</p>

        <h2>1.2 编写目的</h2>
        <p>本软件说明书旨在详细描述${projectInfo.name}的功能特性、技术架构、运行环境和使用方法，为软件著作权申请提供完整的技术文档。本文档将从技术角度全面阐述软件的设计思想、实现方案和创新点，展现软件的技术价值和实用性。</p>

        <h2>1.3 开发背景</h2>
        <p>随着信息技术的快速发展和数字化转型的深入，用户对高质量软件的需求日益增长。${projectInfo.name}的开发正是为了满足现代化的业务需求。项目采用了主流技术框架，确保了技术的先进性和稳定性。通过深入的调研和精心的设计，本软件实现了核心功能的优化和用户体验的提升。</p>
    </div>

    <div class="page-break">
        <h1>2. 软件概述</h1>

        <h2>2.1 主要功能</h2>
        <ol>
            <li>用户界面管理和交互功能</li>
            <li>数据处理和存储功能</li>
            <li>系统配置和设置功能</li>
            <li>用户认证和权限管理功能</li>
            <li>日志记录和监控功能</li>
        </ol>

        <h2>2.2 软件特点</h2>
        <ul>
            <li>采用模块化设计，具有良好的可扩展性</li>
            <li>使用现代化技术栈，确保技术的先进性</li>
            <li>代码结构清晰，遵循最佳实践和编码规范</li>
            <li>具有完整的错误处理和异常管理机制</li>
            <li>支持多种数据格式和协议</li>
            <li>具有良好的性能和响应速度</li>
        </ul>

        <h2>2.3 性能指标</h2>
        <ul>
            <li>响应时间：主要操作响应时间小于200ms</li>
            <li>并发处理：支持100+并发用户访问</li>
            <li>数据处理：支持大量数据的高效处理</li>
            <li>内存使用：合理的内存占用和垃圾回收机制</li>
            <li>可扩展性：支持水平扩展和负载均衡</li>
        </ul>
    </div>

    <div class="page-break">
        <h1>3. 运行环境</h1>

        <h2>3.1 硬件要求</h2>
        <p><strong>最低配置：</strong></p>
        <ul>
            <li>处理器：双核 2.0GHz 或更高</li>
            <li>内存：4GB RAM 或更高</li>
            <li>存储空间：至少 1GB 可用空间</li>
            <li>网络：稳定的互联网连接</li>
        </ul>

        <p><strong>推荐配置：</strong></p>
        <ul>
            <li>处理器：四核 3.0GHz 或更高</li>
            <li>内存：8GB RAM 或更高</li>
            <li>存储空间：SSD，至少 2GB 可用空间</li>
            <li>网络：宽带互联网连接</li>
        </ul>

        <h2>3.2 软件要求</h2>
        <ul>
            <li>操作系统：Windows 10+、macOS 10.14+、Linux</li>
            <li>运行环境：${projectInfo.languages.join('、')}</li>
        </ul>
    </div>

    <div class="page-break">
        <h1>4. 设计思想与实现过程</h1>

        <h2>4.1 系统架构</h2>
        <p>本软件采用模块化架构设计，包括表示层、业务逻辑层和数据访问层。系统采用分层设计，各层之间通过标准接口进行通信，确保系统的松耦合和高内聚。</p>

        <h2>4.2 模块划分</h2>
        <ol>
            <li><strong>用户界面模块：</strong>负责用户交互和界面展示</li>
            <li><strong>业务逻辑模块：</strong>处理核心业务逻辑</li>
            <li><strong>数据访问模块：</strong>负责数据的存储和检索</li>
            <li><strong>系统配置模块：</strong>管理系统配置和参数设置</li>
        </ol>

        <h2>4.3 开发流程</h2>
        <p>软件开发遵循标准的软件工程流程，包括需求分析、系统设计、编码实现、测试验证和部署维护等阶段。项目采用敏捷开发方法，通过迭代的方式逐步完善功能。版本控制使用Git，确保代码的可追溯性和团队协作效率。</p>
    </div>

    <div class="page-break">
        <h1>5. 功能模块详述</h1>

        <h2>5.1 核心功能模块</h2>
        <ol>
            <li><strong>用户管理模块：</strong>实现用户注册、登录、权限管理等功能</li>
            <li><strong>数据处理模块：</strong>负责数据的增删改查和业务逻辑处理</li>
            <li><strong>API接口模块：</strong>提供RESTful API接口供前端调用</li>
        </ol>

        <h2>5.2 用户界面设计</h2>
        <p>用户界面设计遵循简洁易用的原则，采用现代化的设计风格。界面布局合理，色彩搭配协调，图标和文字清晰可读。支持响应式设计，能够适配不同分辨率的设备。提供统一的交互体验，操作流程简单直观。</p>
    </div>

    <div class="page-break">
        <h1>6. 用户指南</h1>

        <h2>6.1 安装说明</h2>
        <ol>
            <li>环境准备：确保系统满足最低硬件和软件要求</li>
            <li>依赖安装：安装必要的运行环境和依赖包</li>
            <li>软件部署：将软件部署到目标环境</li>
            <li>配置设置：根据实际需求配置系统参数</li>
            <li>启动测试：验证软件是否正常运行</li>
        </ol>

        <h2>6.2 使用方法</h2>
        <ol>
            <li>用户登录：使用有效的用户名和密码登录系统</li>
            <li>功能导航：通过主菜单或导航栏访问各项功能</li>
            <li>数据操作：在相应界面中完成数据的增删改查</li>
            <li>报表查看：通过报表功能查看统计数据和分析结果</li>
        </ol>
    </div>

    <div class="page-break">
        <h1>7. 测试与维护</h1>

        <h2>7.1 测试情况</h2>
        <p>本软件经过全面的测试验证，包括单元测试、集成测试和系统测试。测试覆盖了主要功能模块、边界条件和异常情况，确保软件的稳定性和可靠性。性能测试验证了系统在不同负载下的响应能力，安全测试确保了系统的安全性。</p>

        <h2>7.2 维护说明</h2>
        <p>软件维护包括日常维护、故障排除和功能升级等方面：</p>
        <ul>
            <li><strong>日常维护：</strong>定期检查系统运行状态，备份重要数据</li>
            <li><strong>故障排除：</strong>及时处理系统异常和用户反馈的问题</li>
            <li><strong>功能升级：</strong>根据用户需求和技术发展，持续改进软件功能</li>
            <li><strong>安全维护：</strong>定期更新安全补丁，确保系统安全</li>
        </ul>
    </div>

    <div class="footer">
        <p>（本文档由 SoftCopyright 工具自动生成，仅用于软件著作权申请）</p>
    </div>
</body>
</html>`;
}

/**
 * 转换HTML到PDF
 * @param {string} htmlPath HTML文件路径
 * @param {string} outputPath PDF输出路径
 * @returns {Promise<boolean>} 是否成功
 */
async function convertHTMLToPDF(htmlPath, outputPath) {
  // 方法1: 尝试使用Chrome/Chromium headless
  if (await tryChromeConversion(htmlPath, outputPath)) {
    return true;
  }

  // 方法2: 尝试使用wkhtmltopdf
  if (await tryWkHtmlToPdf(htmlPath, outputPath)) {
    return true;
  }

  // 方法3: 使用Node.js库
  if (await tryNodeJSConversion(htmlPath, outputPath)) {
    return true;
  }

  return false;
}

/**
 * 尝试使用Chrome转换
 */
async function tryChromeConversion(htmlPath, outputPath) {
  try {
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' }
    });

    await browser.close();
    return true;
  } catch (error) {
    console.warn('Chrome转换失败:', error.message);
    return false;
  }
}

/**
 * 尝试使用wkhtmltopdf
 */
async function tryWkHtmlToPdf(htmlPath, outputPath) {
  try {
    execSync(`wkhtmltopdf --page-size A4 --margin-top 20mm --margin-bottom 20mm --margin-left 15mm --margin-right 15mm "${htmlPath}" "${outputPath}"`, { stdio: 'ignore' });
    return true;
  } catch (error) {
    console.warn('wkhtmltopdf转换失败:', error.message);
    return false;
  }
}

/**
 * 尝试使用Node.js库
 */
async function tryNodeJSConversion(htmlPath, outputPath) {
  try {
    // 这里可以使用其他Node.js PDF库，如jsPDF等
    console.log('NodeJS转换暂未实现');
    return false;
  } catch (error) {
    console.warn('NodeJS转换失败:', error.message);
    return false;
  }
}

module.exports = {
  generateManualPDF
};