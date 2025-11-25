/**
 * HTML PDF生成器
 * 使用HTML + Playwright生成支持中文的PDF
 */

const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');
const chalk = require('chalk');
const { SUPPORTED_EXTENSIONS } = require('./scanner');

/**
 * 使用HTML生成软件说明书PDF
 * @param {Object} projectInfo 项目信息
 * @param {string} outputDir 输出目录
 * @returns {Promise<string>} 生成的PDF文件路径
 */
async function generateManualHTML(projectInfo, outputDir) {
  try {
    console.log(chalk.yellow('📝 使用HTML生成软件说明书...'));

    const timestamp = moment().format('YYYYMMDD_HHMMSS');
    const fileName = `软件说明书_${projectInfo.name}_${timestamp}.pdf`;
    const outputPath = path.join(outputDir, fileName);

    // 生成HTML内容
    const htmlContent = generateManualHTMLContent(projectInfo);

    // 创建临时HTML文件
    const tempHtmlPath = path.join(outputDir, `temp_${Date.now()}.html`);
    await fs.writeFile(tempHtmlPath, htmlContent, 'utf8');

    // 使用Puppeteer生成PDF
    await generatePDFFromHTML(tempHtmlPath, outputPath);

    // 删除临时HTML文件
    await fs.remove(tempHtmlPath);

    console.log(chalk.green(`✅ 软件说明书已生成: ${outputPath}`));
    return outputPath;

  } catch (error) {
    throw new Error(`生成软件说明书失败: ${error.message}`);
  }
}

/**
 * 生成HTML内容
 * @param {Object} projectInfo 项目信息
 * @returns {string} HTML内容
 */
function generateManualHTMLContent(projectInfo) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>软件说明书 - ${projectInfo.name}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap');

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Noto Sans SC', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }

        .page {
            page-break-after: always;
            min-height: 100vh;
            padding: 40px 0;
        }

        h1 {
            font-size: 28px;
            font-weight: 700;
            text-align: center;
            margin-bottom: 30px;
            color: #2C3E50;
        }

        h2 {
            font-size: 22px;
            font-weight: 600;
            margin: 30px 0 15px 0;
            color: #34495E;
            border-left: 4px solid #3498DB;
            padding-left: 15px;
        }

        h3 {
            font-size: 18px;
            font-weight: 600;
            margin: 20px 0 10px 0;
            color: #2C3E50;
        }

        h4 {
            font-size: 16px;
            font-weight: 500;
            margin: 15px 0 8px 0;
            color: #34495E;
        }

        p {
            margin-bottom: 12px;
            text-align: justify;
            font-size: 14px;
            line-height: 1.8;
        }

        .info-box {
            background: #F8F9FA;
            border: 1px solid #E9ECEF;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }

        .info-item {
            margin: 8px 0;
            font-size: 14px;
        }

        .info-label {
            font-weight: 600;
            color: #495057;
        }

        .toc {
            background: #F8F9FA;
            border: 1px solid #DEE2E6;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }

        .toc-item {
            margin: 8px 0;
            padding: 5px 0;
            font-size: 14px;
        }

        .toc-level-1 {
            font-weight: 600;
            color: #2C3E50;
        }

        .toc-level-2 {
            padding-left: 30px;
            font-weight: 400;
            color: #6C757D;
        }

        ul, ol {
            margin: 15px 0;
            padding-left: 30px;
        }

        li {
            margin: 8px 0;
            font-size: 14px;
        }

        .section-title {
            text-align: center;
            font-size: 24px;
            font-weight: 600;
            margin: 40px 0 30px 0;
            color: #2C3E50;
            border-bottom: 2px solid #E9ECEF;
            padding-bottom: 15px;
        }

        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #6C757D;
            border-top: 1px solid #E9ECEF;
            padding-top: 20px;
        }

        .highlight {
            background: #FFF3CD;
            border: 1px solid #FFEAA7;
            border-radius: 4px;
            padding: 2px 4px;
            font-weight: 500;
        }

        @media print {
            body {
                padding: 0;
                margin: 0;
            }

            .page {
                margin: 0;
                padding: 20px;
                page-break-after: always;
            }
        }
    </style>
</head>
<body>
    <!-- 封面页 -->
    <div class="page">
        <h1>软件说明书</h1>
        <div style="text-align: center; margin: 50px 0;">
            <h2 style="border: none; padding: 0; margin: 20px 0;">${projectInfo.name}</h2>
        </div>

        <div class="info-box" style="max-width: 400px; margin: 50px auto;">
            <div class="info-item">
                <span class="info-label">版本:</span> 1.0.0
            </div>
            <div class="info-item">
                <span class="info-label">生成日期:</span> ${moment().format('YYYY年MM月DD日')}
            </div>
        </div>

        <div class="info-box" style="max-width: 400px; margin: 50px auto;">
            <h3 style="text-align: center; border: none; padding: 0; margin: 20px 0;">项目信息</h3>
            <div class="info-item">
                <span class="info-label">项目名称:</span> ${projectInfo.name}
            </div>
            <div class="info-item">
                <span class="info-label">开发语言:</span> ${projectInfo.languages.join('、')}
            </div>
            <div class="info-item">
                <span class="info-label">源代码文件:</span> ${projectInfo.files.length} 个
            </div>
            <div class="info-item">
                <span class="info-label">总代码行数:</span> ${projectInfo.totalLines} 行
            </div>
            <div class="info-item">
                <span class="info-label">项目类型:</span> ${getProjectTypeDescription(projectInfo.features.type)}
            </div>
        </div>

        <div class="footer">
            <p>（本文档仅用于软件著作权申请，不含版权声明、作者信息等注释）</p>
        </div>
    </div>

    <!-- 目录页 -->
    <div class="page">
        <h1>目录</h1>

        <div class="toc">
            <div class="toc-item toc-level-1">1. 引言</div>
            <div class="toc-item toc-level-2">1.1 概述</div>
            <div class="toc-item toc-level-2">1.2 编写目的</div>
            <div class="toc-item toc-level-2">1.3 开发背景</div>

            <div class="toc-item toc-level-1">2. 软件概述</div>
            <div class="toc-item toc-level-2">2.1 主要功能</div>
            <div class="toc-item toc-level-2">2.2 应用场景</div>
            <div class="toc-item toc-level-2">2.3 软件特点</div>
            <div class="toc-item toc-level-2">2.4 性能指标</div>

            <div class="toc-item toc-level-1">3. 运行环境</div>
            <div class="toc-item toc-level-2">3.1 硬件要求</div>
            <div class="toc-item toc-level-2">3.2 软件要求</div>
            <div class="toc-item toc-level-2">3.3 网络环境</div>

            <div class="toc-item toc-level-1">4. 设计思想与实现过程</div>
            <div class="toc-item toc-level-2">4.1 系统架构</div>
            <div class="toc-item toc-level-2">4.2 模块划分</div>
            <div class="toc-item toc-level-2">4.3 开发流程</div>

            <div class="toc-item toc-level-1">5. 功能模块详述</div>
            <div class="toc-item toc-level-2">5.1 核心功能模块</div>
            <div class="toc-item toc-level-2">5.2 辅助功能模块</div>
            <div class="toc-item toc-level-2">5.3 用户界面设计</div>

            <div class="toc-item toc-level-1">6. 用户指南</div>
            <div class="toc-item toc-level-2">6.1 安装说明</div>
            <div class="toc-item toc-level-2">6.2 使用方法</div>
            <div class="toc-item toc-level-2">6.3 常见问题</div>

            <div class="toc-item toc-level-1">7. 测试与维护</div>
            <div class="toc-item toc-level-2">7.1 测试情况</div>
            <div class="toc-item toc-level-2">7.2 维护说明</div>
        </div>
    </div>

    <!-- 引言 -->
    <div class="page">
        <div class="section-title">1. 引言</div>

        <h2>1.1 概述</h2>
        <p>${projectInfo.name}是一款基于${projectInfo.languages.join('、')}技术开发的${getProjectTypeDescription(projectInfo.features.type)}。本项目包含${projectInfo.files.length}个源代码文件，总计${projectInfo.totalLines}行代码，体现了良好的软件工程实践和模块化设计理念。软件采用了现代化的开发技术和架构设计，具有高度的可扩展性和维护性。</p>

        <h2>1.2 编写目的</h2>
        <p>本软件说明书旨在详细描述${projectInfo.name}的功能特性、技术架构、运行环境和使用方法，为软件著作权申请提供完整的技术文档。本文档将从技术角度全面阐述软件的设计思想、实现方案和创新点，展现软件的技术价值和实用性。</p>

        <h2>1.3 开发背景</h2>
        <p>随着信息技术的快速发展和数字化转型的深入，用户对高质量软件的需求日益增长。${projectInfo.name}的开发正是为了满足${getApplicationScenario(projectInfo)}的需求。项目采用了${projectInfo.features.frameworks.join('、')}等主流技术框架，确保了技术的先进性和稳定性。通过深入的调研和精心的设计，本软件实现了核心功能的优化和用户体验的提升。</p>
    </div>

    <!-- 软件概述 -->
    <div class="page">
        <div class="section-title">2. 软件概述</div>

        <h2>2.1 主要功能</h2>
        <ol>
            ${getMainFunctions(projectInfo).map(func => `<li>${func}</li>`).join('')}
        </ol>

        <h2>2.2 应用场景</h2>
        <p>${getApplicationScenario(projectInfo)}</p>

        <h2>2.3 软件特点</h2>
        <ul>
            ${getSoftwareFeatures(projectInfo).map(feature => `<li>${feature}</li>`).join('')}
        </ul>

        <h2>2.4 性能指标</h2>
        <p>本软件在性能方面具有以下特点：</p>
        <ol>
            ${getPerformanceMetrics(projectInfo).map(metric => `<li>${metric}</li>`).join('')}
        </ol>
    </div>

    <!-- 运行环境 -->
    <div class="page">
        <div class="section-title">3. 运行环境</div>

        <h2>3.1 硬件要求</h2>
        <p><strong>最低硬件配置：</strong></p>
        <ul>
            <li>处理器：双核 2.0GHz 或更高</li>
            <li>内存：4GB RAM 或更高</li>
            <li>存储空间：至少 1GB 可用空间</li>
            <li>显卡：支持 DirectX 11 或 OpenGL 4.0</li>
            <li>网络：稳定的互联网连接（如需要在线功能）</li>
        </ul>

        <p><strong>推荐硬件配置：</strong></p>
        <ul>
            <li>处理器：四核 3.0GHz 或更高</li>
            <li>内存：8GB RAM 或更高</li>
            <li>存储空间：SSD，至少 2GB 可用空间</li>
            <li>显卡：独立显卡，支持最新图形标准</li>
            <li>网络：宽带互联网连接</li>
        </ul>

        <h2>3.2 软件要求</h2>
        <ul>
            ${getSoftwareRequirements(projectInfo).map(req => `<li>${req}</li>`).join('')}
        </ul>

        <h2>3.3 网络环境</h2>
        <p>本软件支持以下网络环境：</p>
        <ul>
            <li>局域网环境：支持内网部署和访问</li>
            <li>互联网环境：支持公网访问和云端服务</li>
            <li>网络协议：HTTP/HTTPS、TCP/IP、WebSocket</li>
            <li>数据传输：支持加密传输，确保数据安全</li>
            <li>防火墙：支持企业级防火墙配置</li>
        </ul>
    </div>

    <!-- 结束页 -->
    <div class="page">
        <div style="text-align: center; margin-top: 200px;">
            <h2 style="border: none; padding: 0;">软件说明书结束</h2>
            <div class="info-box" style="max-width: 400px; margin: 50px auto;">
                <div class="info-item">
                    <span class="info-label">项目名称:</span> ${projectInfo.name}
                </div>
                <div class="info-item">
                    <span class="info-label">生成时间:</span> ${moment().format('YYYY年MM月DD日 HH:mm:ss')}
                </div>
            </div>
            <p style="margin-top: 50px; font-size: 12px; color: #6C757D;">
                （本文档由 SoftCopyright 工具自动生成，仅用于软件著作权申请）
            </p>
        </div>
    </div>
</body>
</html>`;
}

/**
 * 使用Puppeteer从HTML生成PDF
 * @param {string} htmlPath HTML文件路径
 * @param {string} outputPath 输出PDF路径
 * @returns {Promise<void>}
 */
async function generatePDFFromHTML(htmlPath, outputPath) {
  let browser;

  try {
    // 启动Puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--lang=zh-CN,zh,zh-TW,en-US,en'
      ]
    });

    const page = await browser.newPage();

    // 设置用户代理和视口
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
    await page.setViewport({ width: 1200, height: 800 });

    // 加载HTML文件
    await page.goto(`file://${htmlPath}`, {
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 30000
    });

    // 等待字体加载
    await page.waitForTimeout(2000);

    // 生成PDF
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        bottom: '20mm',
        left: '15mm',
        right: '15mm'
      },
      displayHeaderFooter: true,
      headerTemplate: '<div style="font-size:10px; text-align:center; width:100%; color:#666;">软件说明书</div>',
      footerTemplate: '<div style="font-size:10px; text-align:center; width:100%; color:#666;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
      preferCSSPageSize: true
    });

    console.log(chalk.green('✅ PDF生成成功'));

  } catch (error) {
    throw new Error(`PDF生成失败: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// 辅助函数
function getProjectTypeDescription(type) {
  const typeMap = {
    'web': 'Web应用',
    'python': 'Python应用',
    'java': 'Java应用',
    'javascript': 'JavaScript应用',
    'unknown': '通用应用'
  };
  return typeMap[type] || '通用应用';
}

function getMainFunctions(projectInfo) {
  const functions = [];
  functions.push('用户界面管理和交互功能');
  functions.push('数据处理和存储功能');
  functions.push('系统配置和设置功能');
  functions.push('用户认证和权限管理功能');
  functions.push('日志记录和监控功能');
  return functions;
}

function getApplicationScenario(projectInfo) {
  return '软件开发和部署场景，满足现代化的业务需求和技术要求';
}

function getSoftwareFeatures(projectInfo) {
  const features = [
    '采用模块化设计，具有良好的可扩展性',
    '使用现代化技术栈，确保技术的先进性',
    '代码结构清晰，遵循最佳实践和编码规范',
    '具有完整的错误处理和异常管理机制',
    '支持多种数据格式和协议',
    '具有良好的性能和响应速度'
  ];

  if (projectInfo.features.hasTests) {
    features.push('包含完整的单元测试和集成测试');
  }

  if (projectInfo.features.hasDocumentation) {
    features.push('提供详细的技术文档和API说明');
  }

  return features;
}

function getPerformanceMetrics(projectInfo) {
  return [
    '响应时间：主要操作响应时间小于200ms',
    '并发处理：支持100+并发用户访问',
    '数据处理：支持大量数据的高效处理',
    '内存使用：合理的内存占用和垃圾回收机制',
    '可扩展性：支持水平扩展和负载均衡'
  ];
}

function getSoftwareRequirements(projectInfo) {
  const reqs = [
    '操作系统：Windows 10+、macOS 10.14+、Linux (Ubuntu 18.04+)',
    `运行环境：${projectInfo.languages.join('、')}`
  ];

  if (projectInfo.features.packageManagers.includes('npm')) {
    reqs.push('包管理器：Node.js 14+ 和 npm 6+');
  }

  if (projectInfo.features.frameworks.length > 0) {
    reqs.push(`框架依赖：${projectInfo.features.frameworks.join('、')}`);
  }

  return reqs;
}

module.exports = {
  generateManualHTML
};