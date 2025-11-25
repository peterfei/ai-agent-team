const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');
const chalk = require('chalk');

/**
 * HTML格式的源代码文档生成器
 * 避免PDF中文乱码问题，使用HTML+CSS确保中文正确显示
 * @param {Object} projectInfo 项目信息
 * @param {string} outputDir 输出目录
 * @returns {Promise<string>} 生成的HTML文件路径
 */
async function exportSourceCodeHTML(projectInfo, outputDir) {
  try {
    console.log(chalk.yellow('💻 生成HTML源代码文档...'));

    const timestamp = moment().format('YYYYMMDD_HHMMSS');
    const fileName = `源代码文档_${projectInfo.name}_${timestamp}.html`;
    const outputPath = path.join(outputDir, fileName);

    // 生成HTML内容
    const htmlContent = await generateSourceCodeHTML(projectInfo);

    // 写入文件
    await fs.writeFile(outputPath, htmlContent, 'utf8');

    console.log(chalk.green(`✅ HTML源代码文档已生成: ${outputPath}`));
    console.log(chalk.blue('💡 提示: 在浏览器中打开HTML文件，然后打印为PDF即可获得符合要求的软著材料'));

    return outputPath;

  } catch (error) {
    console.error(chalk.red('❌ HTML源代码文档生成失败:'), error.message);
    throw error;
  }
}

/**
 * 生成源代码文档的HTML内容
 * @param {Object} projectInfo 项目信息
 * @returns {Promise<string>} HTML内容
 */
async function generateSourceCodeHTML(projectInfo) {
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
    <title>${softwareName}源代码文档</title>
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
            line-height: 1.6;
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

        .file-list {
            list-style: none;
            padding: 0;
        }

        .file-list li {
            padding: 15px;
            margin: 10px 0;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #3498db;
            font-size: 16px;
        }

        .file-path {
            font-weight: bold;
            color: #2c3e50;
        }

        .file-info {
            color: #7f8c8d;
            font-size: 14px;
        }

        .code-block {
            background: #2d3748;
            color: #e2e8f0;
            padding: 20px;
            border-radius: 8px;
            overflow-x: auto;
            font-family: 'Courier New', Consolas, monospace;
            font-size: 12px;
            line-height: 1.4;
            margin: 20px 0;
        }

        .code-line {
            display: block;
            margin: 2px 0;
        }

        .line-number {
            color: #718096;
            margin-right: 20px;
            user-select: none;
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }

        .info-item {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #3498db;
        }

        .info-label {
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 5px;
            font-size: 14px;
        }

        .info-value {
            color: #666;
            font-size: 16px;
        }

        .comment {
            color: #68d391;
        }

        .keyword {
            color: #f687b3;
        }

        .string {
            color: #9ae6b4;
        }

        .function {
            color: #63b3ed;
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

        .footer {
            text-align: center;
            margin-top: 50px;
            padding: 30px;
            background: #f8f9fa;
            border-radius: 8px;
            color: #7f8c8d;
            font-size: 14px;
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
            <div class="title">${softwareName}源代码文档</div>
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
                <div class="info-label">源代码文件</div>
                <div class="info-value">${projectInfo.files.length} 个</div>
            </div>
            <div class="info-item">
                <div class="info-label">代码行数</div>
                <div class="info-value">${projectInfo.totalLines} 行</div>
            </div>
            <div class="info-item">
                <div class="info-label">主要语言</div>
                <div class="info-value">${projectInfo.languages.join(', ')}</div>
            </div>
        </div>

        <!-- 文件列表 -->
        <div class="section">
            <div class="section-title">源代码文件列表</div>
            <ul class="file-list">
                ${projectInfo.files.map((file, index) => `
                    <li>
                        <div class="file-path">${index + 1}. ${file.relativePath || file.path}</div>
                        <div class="file-info">
                            语言: ${file.language || '未知'} |
                            代码行数: ${file.lines} 行 |
                            文件大小: ${formatFileSize(file.size)}
                        </div>
                    </li>
                `).join('')}
            </ul>
        </div>

        <!-- 源代码内容 -->
        ${generateFullSourceCode(projectInfo, 50)}

        <!-- 页脚 -->
        <div class="footer">
            <p><strong>源代码文档</strong></p>
            <p>项目名称: ${projectInfo.name}</p>
            <p>生成时间: ${timestamp}</p>
            <p>（本文档由 SoftCopyright 工具自动生成，仅用于软件著作权申请）</p>
        </div>
    </div>

    <script>
        // 全局变量
        let totalPages = 1;

        window.onload = function() {
            console.log('源代码文档已加载完成');
            console.log('点击右上角的打印按钮可以将文档保存为PDF格式');

            // 初始化打印设置
            initializePrintSettings();

            // 计算预估页数
            calculateEstimatedPages();
        };

        window.onbeforeprint = function() {
            console.log('正在准备打印...');
            // 添加打印时的特殊处理
            setupPrintLayout();
        };

        window.onafterprint = function() {
            console.log('打印完成');
            // 清理打印设置
            cleanupPrintLayout();
        };

        // 初始化打印设置
        function initializePrintSettings() {
            // 设置打印样式建议
            const style = document.createElement('style');
            const printCSS = '@media print { ' +
                '.print-header, .print-footer { display: block !important; position: fixed; } ' +
                '.container { margin-top: 20mm; margin-bottom: 20mm; } ' +
                '.print-button { display: none !important; } ' +
                '.section { page-break-inside: avoid; } ' +
                '.code-block { page-break-inside: avoid; max-height: 200mm; overflow: hidden; } ' +
                '}';
            style.innerHTML = printCSS;
            document.head.appendChild(style);
        }

        // 计算预估页数
        function calculateEstimatedPages() {
            // 简单计算：基于内容高度估算页数
            const contentHeight = document.querySelector('.container').scrollHeight;
            const pageHeight = 297; // A4高度 (mm)
            const usableHeight = pageHeight - 40; // 减去页眉页脚 (mm)
            totalPages = Math.ceil(contentHeight / (usableHeight * 3.78)); // 转换为像素
        }

        // 设置打印布局
        function setupPrintLayout() {
            // 可以在这里添加打印前的特殊处理
            console.log('设置打印布局，预估页数:', totalPages);
        }

        // 清理打印设置
        function cleanupPrintLayout() {
            console.log('清理打印布局');
        }

        // 自定义打印函数
        function customPrint() {
            // 打开打印对话框
            window.print();
        }

    </script>
</body>
</html>`;
}

/**
 * 生成示例代码
 * @param {Object} file 文件信息
 * @returns {string} 示例代码HTML
 */

/**
 * 简单的语法高亮
 * @param {string} code 代码行
 * @returns {string} 高亮后的HTML
 */
function highlightSyntax(code) {
  return code
    .replace(/\/\/(.*)$/g, '<span class="comment">//$1</span>')
    .replace(/function\s+(\w+)/g, '<span class="keyword">function</span> <span class="function">$1</span>')
    .replace(/return/g, '<span class="keyword">return</span>')
    .replace(/const/g, '<span class="keyword">const</span>')
    .replace(/console/g, '<span class="function">console</span>')
    .replace(/"([^"]*)"/g, '<span class="string">"$1"</span>')
    .replace(/'([^']*)'/g, '<span class="string">\'$1\'</span>');
}

/**
 * 格式化文件大小
 * @param {number} bytes 字节数
 * @returns {string} 格式化的大小
 */
function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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

    // 尝试从requirements.txt或pyproject.toml读取
    const pyprojectPath = path.join(projectPath, 'pyproject.toml');
    if (await fs.pathExists(pyprojectPath)) {
      const pyprojectContent = await fs.readFile(pyprojectPath, 'utf8');
      const versionMatch = pyprojectContent.match(/version\s*=\s*["']([^"']+)["']/);
      if (versionMatch) {
        return `V${versionMatch[1]}`;
      }
    }

    // 尝试从Go.mod读取版本
    const goModPath = path.join(projectPath, 'go.mod');
    if (await fs.pathExists(goModPath)) {
      const goModContent = await fs.readFile(goModPath, 'utf8');
      // Go module版本通常在go.mod文件中不明确指定，返回默认值
      console.log('Go项目检测到，使用默认版本');
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
            console.log(`从${readmeFile}读取到版本号: ${versionMatch[1]}`);
            return `V${versionMatch[1]}`;
          }
        }
      }
    }

    // 默认版本
    return 'V1.0.0';

  } catch (error) {
    console.warn('读取版本信息失败，使用默认版本:', error.message);
    return 'V1.0.0';
  }
}

// 从scanner.js导入支持的扩展
const SUPPORTED_EXTENSIONS = {
  '.js': {
    single_line: '//',
    multi_line: [/\/\*/, /\*\//],
    language: 'javascript',
    priority: 1
  },
  '.jsx': {
    single_line: '//',
    multi_line: [/\/\*/, /\*\//],
    language: 'jsx',
    priority: 1
  },
  '.ts': {
    single_line: '//',
    multi_line: [/\/\*/, /\*\//],
    language: 'typescript',
    priority: 2
  },
  '.tsx': {
    single_line: '//',
    multi_line: [/\/\*/, /\*\//],
    language: 'tsx',
    priority: 2
  },
  '.css': {
    single_line: null,
    multi_line: [/\/\*/, /\*\//],
    language: 'css',
    priority: 3
  },
  '.scss': {
    single_line: '//',
    multi_line: [/\/\*/, /\*\//],
    language: 'scss',
    priority: 3
  },
  '.html': {
    single_line: null,
    multi_line: [/<!--/, /-->/],
    language: 'html',
    priority: 3
  },
  '.py': {
    single_line: '#',
    multi_line: [/"""/, /"""/],
    language: 'python',
    priority: 1
  },
  '.java': {
    single_line: '//',
    multi_line: [/\/\*/, /\*\//],
    language: 'java',
    priority: 1
  },
  '.c': {
    single_line: '//',
    multi_line: [/\/\*/, /\*\//],
    language: 'c',
    priority: 1
  },
  '.cpp': {
    single_line: '//',
    multi_line: [/\/\*/, /\*\//],
    language: 'cpp',
    priority: 1
  },
  '.h': {
    single_line: '//',
    multi_line: [/\/\*/, /\*\//],
    language: 'c',
    priority: 1
  },
  '.cs': {
    single_line: '//',
    multi_line: [/\/\*/, /\*\//],
    language: 'csharp',
    priority: 1
  },
  '.php': {
    single_line: '//',
    multi_line: [/\/\*/, /\*\//],
    language: 'php',
    priority: 1
  },
  '.rb': {
    single_line: '#',
    multi_line: [/=begin/, /=end/],
    language: 'ruby',
    priority: 1
  },
  '.go': {
    single_line: '//',
    multi_line: [/\/\*/, /\*\//],
    language: 'go',
    priority: 1
  },
  '.rs': {
    single_line: '//',
    multi_line: [/\/\*/, /\*\//],
    language: 'rust',
    priority: 1
  },
  '.kt': {
    single_line: '//',
    multi_line: [/\/\*/, /\*\//],
    language: 'kotlin',
    priority: 1
  },
  '.swift': {
    single_line: '//',
    multi_line: [/\/\*/, /\*\//],
    language: 'swift',
    priority: 1
  },
  '.vue': {
    single_line: '//',
    multi_line: [/\/\*/, /\*\//],
    language: 'vue',
    priority: 1
  }
};

/**
 * 计算软著页数要求
 * @param {number} totalLines 总代码行数
 * @param {number} linesPerPage 每页行数（默认50）
 * @returns {Object} 页数配置
 */
function calculatePages(totalLines, linesPerPage = 50) {
  const totalPages = Math.ceil(totalLines / linesPerPage);

  if (totalPages <= 60) {
    return {
      showAll: true,
      startPage: 1,
      endPage: totalPages,
      totalPages: totalPages
    };
  } else {
    return {
      showAll: false,
      startPage: 1,
      endPage: 30,
      totalPages: totalPages,
      showLast: true,
      lastStartPage: totalPages - 29,
      lastEndPage: totalPages
    };
  }
}

/**
 * 清理代码内容，移除注释和空白行
 * @param {string} content 原始代码内容
 * @param {string} extension 文件扩展名
 * @returns {string} 清理后的代码内容
 */
function cleanCodeContent(content, extension) {
  if (!content) return content;

  const langInfo = SUPPORTED_EXTENSIONS[extension.toLowerCase()];
  if (!langInfo) return content;

  let cleanedContent = content;

  // 1. 删除多行注释 /\*(.|\r\n|\n)*?\*/
  if (langInfo.multi_line && langInfo.multi_line.length >= 2) {
    const [startPattern, endPattern] = langInfo.multi_line;
    const multiLineRegex = new RegExp(
      startPattern.source + '[\\s\\S]*?' + endPattern.source, 'g'
    );
    cleanedContent = cleanedContent.replace(multiLineRegex, '');
  }

  // 2. 删除单行注释 //.*
  if (langInfo.single_line) {
    const singleLineRegex = new RegExp(langInfo.single_line + '.*$', 'gm');
    cleanedContent = cleanedContent.replace(singleLineRegex, '');
  }

  // 3. 删除空白行 ^\\s*(?=\\r?$)\\n
  cleanedContent = cleanedContent.replace(/^\s*$(?:\r\n?|\n)/gm, '');

  // 4. 删除版权声明和作者信息
  const copyrightPatterns = [
    /copyright[\s\S]*?$/gmi,
    /author[\s\S]*?$/gmi,
    /license[\s\S]*?$/gmi,
    /\*\s*@\w+[\s\S]*?\*/g,
    /spdx-license-identifier[\s\S]*?$/gmi
  ];

  copyrightPatterns.forEach(pattern => {
    cleanedContent = cleanedContent.replace(pattern, '');
  });

  return cleanedContent.trim();
}

/**
 * 生成完整的源代码展示
 * @param {Object} projectInfo 项目信息
 * @param {number} linesPerPage 每页行数
 * @returns {string} HTML内容
 */
function generateFullSourceCode(projectInfo, linesPerPage = 50) {
  const pageConfig = calculatePages(projectInfo.totalLines, linesPerPage);

  let htmlContent = '';

  // 页面统计信息
  htmlContent += `
        <div class="section">
            <div class="section-title">源代码统计</div>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">项目名称</div>
                    <div class="info-value">${projectInfo.name}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">总代码行数</div>
                    <div class="info-value">${projectInfo.totalLines} 行</div>
                </div>
                <div class="info-item">
                    <div class="info-label">每页行数</div>
                    <div class="info-value">${linesPerPage} 行</div>
                </div>
                <div class="info-item">
                    <div class="info-label">总页数</div>
                    <div class="info-value">${pageConfig.totalPages} 页</div>
                </div>
                <div class="info-item">
                    <div class="info-label">软著页数</div>
                    <div class="info-value">
                        ${pageConfig.showAll ? '全部' : `前${pageConfig.endPage}页+后${30}页`}
                    </div>
                </div>
            </div>
        </div>
  `;

  // 生成源代码内容
  htmlContent += `
        <div class="section">
            <div class="section-title">源代码内容</div>
  `;

  let currentPage = 1;
  let currentLineOnPage = 0;
  let totalLinesShown = 0;

  // 按优先级排序文件
  const sortedFiles = projectInfo.files
    .filter(file => file.lines > 0) // 只处理有内容的文件
    .sort((a, b) => {
      const langA = SUPPORTED_EXTENSIONS[path.extname(a.path).toLowerCase()];
      const langB = SUPPORTED_EXTENSIONS[path.extname(b.path).toLowerCase()];
      return (langA?.priority || 999) - (langB?.priority || 999);
    });

  // 遍历文件并生成代码块
  for (const file of sortedFiles) {
    try {
      // 使用正确的文件路径 - fullPath是绝对路径，path是相对路径
      const filePath = file.fullPath || file.path;

      // 验证文件存在
      if (!fs.existsSync(filePath)) {
        console.warn(`文件不存在: ${filePath}`);
        continue;
      }

      const fileContent = fs.readFileSync(filePath, 'utf8');

      // 验证文件内容不为空
      if (!fileContent || fileContent.trim().length === 0) {
        console.warn(`文件内容为空: ${filePath}`);
        continue;
      }

      const cleanedContent = cleanCodeContent(fileContent, path.extname(filePath));
      const lines = cleanedContent.split('\n').filter(line => line.trim().length > 0);

      if (lines.length === 0) continue;

      htmlContent += `
                <div style="margin: 30px 0; page-break-inside: avoid;">
                    <h4 style="color: #2c3e50; margin-bottom: 15px; page-break-inside: avoid;">
                        文件: ${file.relativePath || file.path}
                    </h4>
                    <div style="color: #666; margin-bottom: 10px; font-size: 14px;">
                        文件大小: ${formatFileSize(file.size)} | 有效代码: ${lines.length} 行
                    </h4>
                    <div class="code-block" style="page-break-inside: avoid;">
      `;

      // 逐行添加代码
      for (let i = 0; i < lines.length; i++) {
        const lineNumber = i + 1;
        const lineContent = lines[i];

        // 检查是否需要分页
        if (currentLineOnPage >= linesPerPage) {
          currentPage++;
          currentLineOnPage = 0;

          // 如果是前30页，继续添加
          if (currentPage <= 30) {
            htmlContent += `
                    </div>
                </div>
                <div style="page-break-before: always;"></div>
                <div style="margin: 30px 0;">
                    <h4 style="color: #2c3e50; margin-bottom: 15px;">
                        [续页 ${currentPage}] - ${file.relativePath || file.path}
                    </h4>
                    <div class="code-block">
            `;
          }
          // 如果是超过60页的项目，需要判断是否显示最后30页
          else if (pageConfig.showLast && currentPage > 30 && currentPage < (pageConfig.totalPages - 29)) {
            // 跳过中间部分
            currentPage = pageConfig.lastStartPage;
            htmlContent += `
                    </div>
                </div>
                <div style="page-break-before: always; text-align: center; color: #7f8c8d; padding: 50px 0;">
                    <div style="font-size: 18px;">
                        ... 省略中间内容 ...
                    </div>
                    <div style="font-size: 16px; margin-top: 20px;">
                        [注: 软著申请要求超过60页时，只提交前30页和后30页]
                    </div>
                </div>
                <div style="page-break-before: always;"></div>
                <div style="margin: 30px 0;">
                    <h4 style="color: #2c3e50; margin-bottom: 15px;">
                        [后30页 第${currentPage - (pageConfig.lastStartPage - 1) + 1}页] - ${file.relativePath || file.path}
                    </h4>
                    <div class="code-block">
            `;
          }
          // 如果是最后30页范围内，继续添加
          else if (currentPage < pageConfig.totalPages + 30) {
            htmlContent += `
                    </div>
                </div>
                <div style="page-break-before: always;"></div>
                <div style="margin: 30px 0;">
                    <h4 style="color: #2c3e50; margin-bottom: 15px;">
                        [后30页 第${currentPage - (pageConfig.lastStartPage - 1) + 1}页] - ${file.relativePath || file.path}
                    </h4>
                    <div class="code-block">
            `;
          }
          // 已经显示完所有要求的页数
          else {
            break;
          }
        }

        // 添加代码行
        const highlightedLine = highlightSyntax(lineContent);
        const lineNumberStr = lineNumber.toString().padStart(4, ' ');
        htmlContent += `
                        <span class="code-line"><span class="line-number">${lineNumberStr}:</span>${highlightedLine}</span>
        `;

        currentLineOnPage++;
        totalLinesShown++;
      }

      htmlContent += `
                    </div>
                </div>
      `;

      // 限制显示的文件数量（避免文档过长）
      if (totalLinesShown >= 15000) { // 大约300页的限制
        htmlContent += `
                <div style="margin: 30px 0; padding: 30px; background: #f8f9fa; border-radius: 8px; text-align: center; color: #666;">
                    <p style="font-size: 16px; margin: 0;">
                        <strong>注意：</strong>由于代码量较大，已截断显示。
                    </p>
                    <p style="font-size: 14px; margin: 10px 0 0 0;">
                        完整源代码请参考项目文件，共计 ${projectInfo.files.length} 个源代码文件，${projectInfo.totalLines} 行代码。
                    </p>
                </div>
        `;
        break;
      }

    } catch (error) {
      const filePath = file.fullPath || file.path;
      console.error(`读取文件失败 ${filePath}:`, error.message);
      // 跳过这个文件，继续处理其他文件
    }
  }

  htmlContent += `
        </div>
  `;

  return htmlContent;
}

module.exports = { exportSourceCodeHTML };