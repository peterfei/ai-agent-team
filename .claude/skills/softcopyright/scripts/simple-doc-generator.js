/**
 * 简化的文档生成器
 * 生成HTML格式的软件说明书，避免PDF字体问题
 */

const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');
const chalk = require('chalk');
const { SUPPORTED_EXTENSIONS } = require('./scanner');

/**
 * 生成软件说明书（HTML格式）
 * @param {Object} projectInfo 项目信息
 * @param {string} outputDir 输出目录
 * @returns {Promise<string>} 生成的文件路径
 */
async function generateManualHTML(projectInfo, outputDir) {
  try {
    console.log(chalk.yellow('📝 生成HTML格式的软件说明书...'));

    const timestamp = moment().format('YYYYMMDD_HHMMSS');
    const fileName = `软件说明书_${projectInfo.name}_${timestamp}.html`;
    const outputPath = path.join(outputDir, fileName);

    // 生成HTML内容
    const htmlContent = await generateHTMLContent(projectInfo);

    // 写入HTML文件
    await fs.writeFile(outputPath, htmlContent, 'utf8');

    console.log(chalk.green(`✅ HTML软件说明书已生成: ${outputPath}`));
    console.log(chalk.blue('💡 提示: 可以在浏览器中打开HTML文件，然后打印为PDF'));

    return outputPath;

  } catch (error) {
    throw new Error(`生成HTML软件说明书失败: ${error.message}`);
  }
}

/**
 * 生成HTML内容
 * @param {Object} projectInfo 项目信息
 * @returns {Promise<string>} HTML内容
 */
async function generateHTMLContent(projectInfo) {
  const timestamp = moment().format('YYYY年MM月DD日 HH:mm:ss');

  // 设置CSS变量用于页眉页脚
  const softwareName = getSoftwareName(projectInfo.name);
  const version = await getProjectVersion(projectInfo);
  const headerText = `${softwareName}_${version}`;
  const footerText = `软件著作权申请材料 | 生成时间: ${timestamp}`;

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${softwareName}软件使用手册</title>
    <style>
        :root {
            --header-text: "${headerText}";
            --footer-text: "${footerText}";
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Helvetica Neue', Arial, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
            line-height: 1.8;
            color: #333;
            background: #fff;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

        .container {
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            border-radius: 8px;
            padding: 40px;
            margin: 20px 0;
        }

        .header {
            text-align: center;
            border-bottom: 3px solid #3498db;
            padding-bottom: 30px;
            margin-bottom: 40px;
        }

        .title {
            font-size: 36px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
        }

        .subtitle {
            font-size: 24px;
            color: #7f8c8d;
            margin-bottom: 20px;
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 30px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #3498db;
        }

        .info-item {
            text-align: center;
        }

        .info-label {
            font-size: 14px;
            color: #7f8c8d;
            margin-bottom: 5px;
        }

        .info-value {
            font-size: 20px;
            font-weight: bold;
            color: #2c3e50;
        }

        .section {
            margin: 40px 0;
            padding: 20px 0;
            border-bottom: 1px solid #ecf0f1;
        }

        .section:last-child {
            border-bottom: none;
        }

        .section-title {
            font-size: 28px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
        }

        .section-title:before {
            content: '';
            width: 6px;
            height: 28px;
            background: #3498db;
            margin-right: 15px;
            border-radius: 3px;
        }

        .subsection {
            margin: 25px 0;
        }

        .subsection-title {
            font-size: 20px;
            font-weight: 600;
            color: #34495e;
            margin-bottom: 15px;
        }

        p {
            font-size: 16px;
            line-height: 1.8;
            margin-bottom: 15px;
            text-align: justify;
        }

        ul, ol {
            margin: 20px 0;
            padding-left: 30px;
        }

        li {
            font-size: 16px;
            margin: 10px 0;
            line-height: 1.6;
        }

        .highlight-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }

        .feature-list {
            list-style: none;
            padding: 0;
        }

        .feature-list li {
            padding: 10px 0;
            border-bottom: 1px solid #ecf0f1;
            position: relative;
            padding-left: 30px;
        }

        .feature-list li:before {
            content: '✓';
            position: absolute;
            left: 0;
            color: #27ae60;
            font-weight: bold;
        }

        .footer {
            text-align: center;
            margin-top: 50px;
            padding: 30px;
            background: #f8f9fa;
            border-radius: 8px;
            color: #7f8c8d;
            font-size: 14px;
        }

        .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #3498db;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-size: 16px;
            cursor: pointer;
            box-shadow: 0 2px 10px rgba(52, 152, 219, 0.3);
            transition: all 0.3s ease;
        }

        .print-button:hover {
            background: #2980b9;
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(52, 152, 219, 0.4);
        }

        /* 打印时的页眉页脚样式 */
        .print-header {
            display: none; /* 屏幕显示时隐藏 */
        }

        .print-footer {
            display: none; /* 屏幕显示时隐藏 */
        }

        .page-number {
            display: none; /* 屏幕显示时隐藏 */
        }

        @media print {
            body {
                background: white;
                padding: 0;
                margin: 0;
                counter-reset: page 1;  /* 初始化页码计数器从1开始 */
            }

            .container {
                box-shadow: none;
                border-radius: 0;
                padding: 60px 40px 80px 40px;
                margin: 0;
            }

            .print-button {
                display: none;
            }

            .print-instructions {
                display: none;
            }

            .page-break {
                page-break-before: always;
            }

            /* 页面设置 */
            @page {
                size: A4;
                margin: 20mm 15mm;
            }

            .print-header {
                display: block;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                height: 15mm;
                text-align: left;
                font-size: 10pt;
                font-weight: bold;
                color: #2c3e50;
                background: white;
                border: none !important;
                outline: none !important;
                box-shadow: none !important;
                padding-top: 5mm;
                padding-left: 15mm;
                z-index: 9999;
            }

            .print-footer {
                display: none; /* 隐藏，使用浏览器自带的页眉页脚功能 */
            }

            /* 确保内容不被页眉页脚遮挡 */
            .container {
                margin-top: 20mm !important;
                margin-bottom: 20mm !important;
            }
        }

        .toc {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 8px;
            margin: 30px 0;
        }

        .toc-title {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 20px;
            text-align: center;
        }

        .toc-list {
            list-style: none;
            padding: 0;
        }

        .toc-item {
            padding: 8px 0;
            font-size: 16px;
            color: #34495e;
            border-left: 3px solid transparent;
            padding-left: 20px;
            transition: all 0.3s ease;
        }

        .toc-item:hover {
            border-left-color: #3498db;
            background: #ecf0f1;
        }
    </style>
</head>
<body>
    <!-- 打印时的页眉页脚 -->
    <div class="print-header">${headerText}</div>
    <div class="print-footer"></div>

    <button class="print-button" onclick="window.print()">🖨️ 打印PDF</button>

    <div style="position: fixed; top: 80px; right: 20px; background: #fff3cd; padding: 15px; border-radius: 8px; max-width: 300px; font-size: 13px; border: 1px solid #ffc107; z-index: 1000;" class="print-instructions">
        <strong>📋 打印说明：</strong><br/>
        1. 点击"打印PDF"或按Cmd+P<br/>
        2. 在打印设置中，展开"更多设置"<br/>
        3. 勾选"页眉和页脚"选项<br/>
        4. 浏览器会自动添加页码
    </div>

    <div class="container">
        <!-- 封面 -->
        <div class="header">
            <div class="title">${softwareName}软件说明书</div>
            <div class="subtitle">版本 ${version}</div>
            <div style="margin-top: 30px; font-size: 18px; color: #7f8c8d;">
                生成日期: ${timestamp}
            </div>
        </div>

        <!-- 项目信息 -->
        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">项目名称</div>
                <div class="info-value">${projectInfo.name}</div>
            </div>
            <div class="info-item">
                <div class="info-label">开发语言</div>
                <div class="info-value">${projectInfo.languages.join('、')}</div>
            </div>
            <div class="info-item">
                <div class="info-label">源代码文件</div>
                <div class="info-value">${projectInfo.files.length} 个</div>
            </div>
            <div class="info-item">
                <div class="info-label">代码行数</div>
                <div class="info-value">${projectInfo.totalLines} 行</div>
            </div>
        </div>

        <!-- 目录 -->
        <div class="toc">
            <div class="toc-title">目录</div>
            <ul class="toc-list">
                <li class="toc-item">1. 引言</li>
                <li class="toc-item">2. 软件概述</li>
                <li class="toc-item">3. 运行环境</li>
                <li class="toc-item">4. 设计思想与实现过程</li>
                <li class="toc-item">5. 功能模块详述</li>
                <li class="toc-item">6. 用户指南</li>
                <li class="toc-item">7. 测试与维护</li>
            </ul>
        </div>

        <!-- 主要内容 -->
        <div class="section">
            <div class="section-title">1. 引言</div>

            <div class="subsection">
                <div class="subsection-title">1.1 概述</div>
                <p>${projectInfo.name}是一款基于${projectInfo.languages.join('、')}技术开发的${getProjectTypeDescription(projectInfo.features.type)}。本项目包含${projectInfo.files.length}个源代码文件，总计${projectInfo.totalLines}行代码，体现了良好的软件工程实践和模块化设计理念。软件采用了现代化的开发技术和架构设计，具有高度的可扩展性和维护性。</p>
            </div>

            <div class="subsection">
                <div class="subsection-title">1.2 编写目的</div>
                <p>本软件说明书旨在详细描述${projectInfo.name}的功能特性、技术架构、运行环境和使用方法，为软件著作权申请提供完整的技术文档。本文档将从技术角度全面阐述软件的设计思想、实现方案和创新点，展现软件的技术价值和实用性。</p>
            </div>

            <div class="subsection">
                <div class="subsection-title">1.3 开发背景</div>
                <p>随着信息技术的快速发展和数字化转型的深入，用户对高质量软件的需求日益增长。${projectInfo.name}的开发正是为了满足${getApplicationScenario(projectInfo)}的需求。项目采用了${projectInfo.features.frameworks.length > 0 ? projectInfo.features.frameworks.join('、') : '主流'}技术框架，确保了技术的先进性和稳定性。通过深入的调研和精心的设计，本软件实现了核心功能的优化和用户体验的提升。</p>
            </div>
        </div>

        <div class="section">
            <div class="section-title">2. 软件概述</div>

            <div class="subsection">
                <div class="subsection-title">2.1 主要功能</div>
                <ul>
                    ${getMainFunctions(projectInfo).map(func => `<li>${func}</li>`).join('')}
                </ul>
            </div>

            <div class="subsection">
                <div class="subsection-title">2.2 软件特点</div>
                <ul class="feature-list">
                    ${getSoftwareFeatures(projectInfo).map(feature => `<li>${feature}</li>`).join('')}
                </ul>
            </div>

            <div class="subsection">
                <div class="subsection-title">2.3 性能指标</div>
                <ul>
                    ${getPerformanceMetrics(projectInfo).map(metric => `<li>${metric}</li>`).join('')}
                </ul>
            </div>
        </div>

        <div class="section">
            <div class="section-title">3. 运行环境</div>

            <div class="subsection">
                <div class="subsection-title">3.1 硬件要求</div>
                <div class="highlight-box">
                    <h4>最低配置：</h4>
                    <ul>
                        <li>处理器：双核 2.0GHz 或更高</li>
                        <li>内存：4GB RAM 或更高</li>
                        <li>存储空间：至少 1GB 可用空间</li>
                        <li>网络：稳定的互联网连接</li>
                    </ul>
                </div>
            </div>

            <div class="subsection">
                <div class="subsection-title">3.2 软件要求</div>
                <ul>
                    <li>操作系统：Windows 10+、macOS 10.14+、Linux (Ubuntu 18.04+)</li>
                    <li>运行环境：${projectInfo.languages.join('、')}</li>
                    ${projectInfo.features.packageManagers.includes('npm') ? '<li>包管理器：Node.js 14+ 和 npm 6+</li>' : ''}
                </ul>
            </div>
        </div>

        <div class="section">
            <div class="section-title">4. 设计思想与实现过程</div>

            <div class="subsection">
                <div class="subsection-title">4.1 系统架构</div>
                <p>本软件采用模块化架构设计，包括表示层、业务逻辑层和数据访问层。系统采用分层设计，各层之间通过标准接口进行通信，确保系统的松耦合和高内聚。</p>
            </div>

            <div class="subsection">
                <div class="subsection-title">4.2 模块划分</div>
                <ol>
                    <li><strong>用户界面模块：</strong>负责用户交互和界面展示</li>
                    <li><strong>业务逻辑模块：</strong>处理核心业务逻辑</li>
                    <li><strong>数据访问模块：</strong>负责数据的存储和检索</li>
                    <li><strong>系统配置模块：</strong>管理系统配置和参数设置</li>
                </ol>
            </div>

            <div class="subsection">
                <div class="subsection-title">4.3 开发流程</div>
                <p>软件开发遵循标准的软件工程流程，包括需求分析、系统设计、编码实现、测试验证和部署维护等阶段。项目采用敏捷开发方法，通过迭代的方式逐步完善功能。版本控制使用Git，确保代码的可追溯性和团队协作效率。</p>
            </div>
        </div>

        <div class="section">
            <div class="section-title">5. 功能模块详述</div>

            <div class="subsection">
                <div class="subsection-title">5.1 核心功能模块</div>
                <ul>
                    <li><strong>用户管理模块：</strong>实现用户注册、登录、权限管理等功能</li>
                    <li><strong>数据处理模块：</strong>负责数据的增删改查和业务逻辑处理</li>
                    <li><strong>API接口模块：</strong>提供RESTful API接口供前端调用</li>
                </ul>
            </div>

            <div class="subsection">
                <div class="subsection-title">5.2 用户界面设计</div>
                <p>用户界面设计遵循简洁易用的原则，采用现代化的设计风格。界面布局合理，色彩搭配协调，图标和文字清晰可读。支持响应式设计，能够适配不同分辨率的设备。提供统一的交互体验，操作流程简单直观。</p>
            </div>
        </div>

        <div class="section">
            <div class="section-title">6. 用户指南</div>

            <div class="subsection">
                <div class="subsection-title">6.1 安装说明</div>
                <ol>
                    <li>环境准备：确保系统满足最低硬件和软件要求</li>
                    <li>依赖安装：安装必要的运行环境和依赖包</li>
                    <li>软件部署：将软件部署到目标环境</li>
                    <li>配置设置：根据实际需求配置系统参数</li>
                    <li>启动测试：验证软件是否正常运行</li>
                </ol>
            </div>

            <div class="subsection">
                <div class="subsection-title">6.2 使用方法</div>
                <ol>
                    <li>用户登录：使用有效的用户名和密码登录系统</li>
                    <li>功能导航：通过主菜单或导航栏访问各项功能</li>
                    <li>数据操作：在相应界面中完成数据的增删改查</li>
                    <li>报表查看：通过报表功能查看统计数据和分析结果</li>
                </ol>
            </div>
        </div>

        <div class="section">
            <div class="section-title">7. 测试与维护</div>

            <div class="subsection">
                <div class="subsection-title">7.1 测试情况</div>
                <p>本软件经过全面的测试验证，包括单元测试、集成测试和系统测试。测试覆盖了主要功能模块、边界条件和异常情况，确保软件的稳定性和可靠性。性能测试验证了系统在不同负载下的响应能力，安全测试确保了系统的安全性。</p>
            </div>

            <div class="subsection">
                <div class="subsection-title">7.2 维护说明</div>
                <ul>
                    <li><strong>日常维护：</strong>定期检查系统运行状态，备份重要数据</li>
                    <li><strong>故障排除：</strong>及时处理系统异常和用户反馈的问题</li>
                    <li><strong>功能升级：</strong>根据用户需求和技术发展，持续改进软件功能</li>
                    <li><strong>安全维护：</strong>定期更新安全补丁，确保系统安全</li>
                </ul>
            </div>
        </div>

        <!-- 页脚 -->
        <div class="footer">
            <p><strong>软件说明书</strong></p>
            <p>项目名称: ${projectInfo.name}</p>
            <p>生成时间: ${moment().format('YYYY年MM月DD日 HH:mm:ss')}</p>
            <p>（本文档由 SoftCopyright 工具自动生成，仅用于软件著作权申请）</p>
        </div>
    </div>

    <script>
        // 自动添加页码
        window.onload = function() {
            console.log('软件说明书已加载完成');
            console.log('点击右上角的打印按钮可以将文档保存为PDF格式');
        };

        // 打印前处理
        window.onbeforeprint = function() {
            console.log('正在准备打印...');
        };

        // 打印后处理
        window.onafterprint = function() {
            console.log('打印完成');
        };
    </script>
</body>
</html>`;
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
  const functions = [
    '用户界面管理和交互功能',
    '数据处理和存储功能',
    '系统配置和设置功能',
    '用户认证和权限管理功能',
    '日志记录和监控功能'
  ];
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

/**
 * 获取软件名称
 * @param {string} projectName 项目名称
 * @returns {string} 软件名称
 */
function getSoftwareName(projectName) {
  // 清理项目名称，移除常见后缀
  const cleanedName = projectName
    .replace(/[-_]app$/i, '')
    .replace(/[-_]project$/i, '')
    .replace(/[-_]system$/i, '')
    .replace(/ai-agent/i, 'AI智能体')
    .replace(/-/g, ' ');

  // 首字母大写
  return cleanedName.charAt(0).toUpperCase() + cleanedName.slice(1);
}

/**
 * 从项目中读取版本信息
 * @param {Object} projectInfo 项目信息
 * @returns {Promise<string>} 版本号
 */
async function getProjectVersion(projectInfo) {
  try {
    const projectPath = projectInfo.path || process.cwd();

    // 尝试从package.json读取版本
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (await fs.pathExists(packageJsonPath)) {
      const packageData = await fs.readJson(packageJsonPath);
      if (packageData.version) {
        return `V${packageData.version}`;
      }
    }

    // 尝试从setup.py读取版本
    const setupPyPath = path.join(projectPath, 'setup.py');
    if (await fs.pathExists(setupPyPath)) {
      const setupContent = await fs.readFile(setupPyPath, 'utf8');
      const versionMatch = setupContent.match(/version\s*=\s*['"]([^'"]+)['"]/);
      if (versionMatch) {
        return `V${versionMatch[1]}`;
      }
    }

    // 尝试从Cargo.toml读取版本
    const cargoTomlPath = path.join(projectPath, 'Cargo.toml');
    if (await fs.pathExists(cargoTomlPath)) {
      const cargoContent = await fs.readFile(cargoTomlPath, 'utf8');
      const versionMatch = cargoContent.match(/^version\s*=\s*["']([^"']+)["']/m);
      if (versionMatch) {
        return `V${versionMatch[1]}`;
      }
    }

    // 尝试从pyproject.toml读取
    const pyprojectPath = path.join(projectPath, 'pyproject.toml');
    if (await fs.pathExists(pyprojectPath)) {
      const pyprojectContent = await fs.readFile(pyprojectPath, 'utf8');
      const versionMatch = pyprojectContent.match(/version\s*=\s*["']([^"']+)["']/);
      if (versionMatch) {
        return `V${versionMatch[1]}`;
      }
    }

    // 尝试从README文件读取版本
    const readmeFiles = ['README.md', 'README.txt', 'readme.md', 'README'];
    for (const readmeFile of readmeFiles) {
      const readmePath = path.join(projectPath, readmeFile);
      if (await fs.pathExists(readmePath)) {
        const readmeContent = await fs.readFile(readmePath, 'utf8');

        // 尝试多种版本号格式
        const versionPatterns = [
          /(?:version|版本)[\s:：]*v?(\d+\.\d+\.\d+)/i,
          /^#+\s*v?(\d+\.\d+\.\d+)/m,
          /\*\*(?:version|版本)\*\*[\s:：]*v?(\d+\.\d+\.\d+)/i,
          /\[v?(\d+\.\d+\.\d+)\]/,
        ];

        for (const pattern of versionPatterns) {
          const versionMatch = readmeContent.match(pattern);
          if (versionMatch) {
            console.log(chalk.green(`从${readmeFile}读取到版本号: ${versionMatch[1]}`));
            return `V${versionMatch[1]}`;
          }
        }
      }
    }

    // 默认版本
    return 'V1.0.0';

  } catch (error) {
    console.warn(chalk.yellow('读取版本信息失败，使用默认版本:'), error.message);
    return 'V1.0.0';
  }
}

module.exports = {
  generateManualHTML
};