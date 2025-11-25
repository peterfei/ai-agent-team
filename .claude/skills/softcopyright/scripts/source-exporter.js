const fs = require('fs-extra');
const path = require('path');
const PDFDocument = require('pdfkit');
const moment = require('moment');
const chalk = require('chalk');
const FontManager = require('./font-manager');
const { SUPPORTED_EXTENSIONS } = require('./scanner');

/**
 * 导出源代码文档
 * @param {Object} projectInfo 项目信息
 * @param {string} outputDir 输出目录
 * @param {Object} options 配置选项
 * @returns {Promise<string>} 生成的PDF文件路径
 */
async function exportSourceCode(projectInfo, outputDir, options = {}) {
  try {
    console.log(chalk.yellow('💻 生成源代码文档...'));

    const timestamp = moment().format('YYYYMMDD_HHMMSS');
    const fileName = `源代码文档_${projectInfo.name}_${timestamp}.pdf`;
    const outputPath = path.join(outputDir, fileName);

    // 初始化字体管理器
    const fontManager = new FontManager();
    const fontPath = await fontManager.getFontPath();

    // 默认配置
    const config = {
      maxPages: 60,
      linesPerPage: 50,
      fontSize: 8,
      fontFamily: 'Courier',
      headerFontSize: 10,
      footerFontSize: 8,
      ...options
    };

    // 创建PDF文档
    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 60,
        bottom: 50,
        left: 40,
        right: 40
      }
    });

    // 管道输出到文件
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // 设置字体
    if (fontPath) {
      try {
        doc.font(fontPath);
        console.log(chalk.green(`✅ 源代码文档使用中文字体: ${path.basename(fontPath)}`));
      } catch (error) {
        console.warn(chalk.yellow('⚠️  源代码文档中文字体加载失败，使用等宽字体'));
        doc.font('Courier');
      }
    } else {
      console.warn(chalk.yellow('⚠️  未找到中文字体，源代码文档使用等宽字体'));
      doc.font('Courier');
    }

    // 生成源代码文档内容
    await generateSourceCodeContent(doc, projectInfo, config);

    // 完成文档
    doc.end();

    // 等待文件写入完成
    return new Promise((resolve, reject) => {
      stream.on('finish', () => {
        console.log(chalk.green(`✅ 源代码文档已生成: ${outputPath}`));
        resolve(outputPath);
      });
      stream.on('error', reject);
    });

  } catch (error) {
    throw new Error(`生成源代码文档失败: ${error.message}`);
  }
}

/**
 * 生成源代码文档内容
 * @param {PDFDocument} doc PDF文档对象
 * @param {Object} projectInfo 项目信息
 * @param {Object} config 配置选项
 */
async function generateSourceCodeContent(doc, projectInfo, config) {
  // 添加封面页
  addSourceCodeCover(doc, projectInfo, config);

  // 添加文件列表
  addFileList(doc, projectInfo, config);

  // 添加源代码内容
  await addSourceCodePages(doc, projectInfo, config);

  // 添加结束说明
  addEndPage(doc, projectInfo, config);
}

/**
 * 添加源代码文档封面
 * @param {PDFDocument} doc PDF文档对象
 * @param {Object} projectInfo 项目信息
 * @param {Object} config 配置选项
 */
function addSourceCodeCover(doc, projectInfo, config) {
  doc.addPage();

  // 设置标题
  doc.fontSize(24)
     .font('Helvetica-Bold')
     .fillColor('#2C3E50')
     .text('软件著作权申请 - 源代码文档', { align: 'center' });

  doc.moveDown(2);

  doc.fontSize(20)
     .fillColor('#34495E')
     .text(projectInfo.name, { align: 'center' });

  doc.moveDown(2);

  // 添加版本和日期
  doc.fontSize(14)
     .fillColor('#7F8C8D')
     .text(`版本: 1.0.0`, { align: 'center' });

  doc.text(`生成日期: ${moment().format('YYYY年MM月DD日')}`, { align: 'center' });

  doc.moveDown(3);

  // 添加项目统计信息
  doc.fontSize(12)
     .fillColor('#2C3E50')
     .text('源代码统计信息', { align: 'center' });

  doc.moveDown(1);

  const stats = [
    `总文件数: ${projectInfo.files.length} 个`,
    `代码行数: ${projectInfo.totalLines} 行`,
    `主要语言: ${projectInfo.languages.join(', ')}`,
    `文档页数: ${config.maxPages} 页`,
    `每页行数: ${config.linesPerPage} 行`
  ];

  stats.forEach(stat => {
    doc.text(stat, { align: 'center' });
    doc.moveDown(0.5);
  });

  doc.moveDown(2);

  doc.fontSize(10)
     .fillColor('#95A5A6')
     .text('（本文档仅用于软件著作权申请，不含版权声明、作者信息等注释）',
            { align: 'center' });
}

/**
 * 添加文件列表
 * @param {PDFDocument} doc PDF文档对象
 * @param {Object} projectInfo 项目信息
 * @param {Object} config 配置选项
 */
function addFileList(doc, projectInfo, config) {
  doc.addPage();

  // 添加标题
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .fillColor('#2C3E50')
     .text('源代码文件列表');

  doc.moveDown(1);

  // 创建文件列表（使用简单文本格式）
  doc.fontSize(9)
     .font('Helvetica')
     .fillColor('#2C3E50');

  // 表头
  const headerText = `序号  文件路径${' '.repeat(40)} 语言  行数  大小`;
  doc.text(headerText);
  doc.text('-'.repeat(80));

  // 文件列表
  projectInfo.files.forEach((file, index) => {
    const fileNum = String(index + 1).padStart(3, ' ');
    const filePath = file.path.substring(0, 35).padEnd(35, ' ');
    const language = (file.language || '未知').padEnd(4, ' ');
    const lines = String(file.lines).padStart(4, ' ');
    const size = formatFileSize(file.size).padStart(6, ' ');

    const lineText = `${fileNum}  ${filePath} ${language} ${lines} ${size}`;
    doc.text(lineText);
  });

  doc.moveDown(1);

  // 添加统计信息
  doc.fontSize(10)
     .font('Helvetica')
     .fillColor('#7F8C8D')
     .text(`注：共 ${projectInfo.files.length} 个文件，总计 ${projectInfo.totalLines} 行代码`);
}

/**
 * 添加源代码页面
 * @param {PDFDocument} doc PDF文档对象
 * @param {Object} projectInfo 项目信息
 * @param {Object} config 配置选项
 */
async function addSourceCodePages(doc, projectInfo, config) {
  let currentPage = 1;
  let currentLineOnPage = 0;
  let totalLinesAdded = 0;
  const maxTotalLines = config.maxPages * config.linesPerPage;

  // 过滤和处理文件
  const processedFiles = await processFiles(projectInfo.files, maxTotalLines);

  for (const file of processedFiles) {
    if (totalLinesAdded >= maxTotalLines) break;

    try {
      const cleanedContent = await cleanCodeContent(file.content, file.extension);
      const lines = cleanedContent.split('\n').filter(line => line.trim().length > 0);

      // 添加文件标题
      if (currentLineOnPage === 0) {
        addPageHeader(doc, file, currentPage);
        currentLineOnPage += 3; // 标题占用行数
      }

      // 添加代码行
      for (const line of lines) {
        if (totalLinesAdded >= maxTotalLines) break;

        // 检查是否需要新页面
        if (currentLineOnPage >= config.linesPerPage) {
          doc.addPage();
          currentPage++;
          currentLineOnPage = 0;
          addPageHeader(doc, file, currentPage);
          currentLineOnPage += 3;
        }

        // 添加代码行
        addCodeLine(doc, line, config);
        currentLineOnPage++;
        totalLinesAdded++;
      }

      // 文件间添加分隔
      if (totalLinesAdded < maxTotalLines) {
        addFileSeparator(doc, config);
        currentLineOnPage += 1;
      }

    } catch (error) {
      console.warn(chalk.yellow(`⚠️  处理文件 ${file.path} 时出错: ${error.message}`));
      continue;
    }
  }
}

/**
 * 处理文件，按重要性排序
 * @param {Array} files 文件列表
 * @param {number} maxLines 最大行数
 * @returns {Array} 处理后的文件列表
 */
async function processFiles(files, maxLines) {
  // 按重要性和行数排序
  const sortedFiles = files
    .filter(file => file.lines > 0)
    .sort((a, b) => {
      // 优先级：主要语言文件优先
      const priorityA = a.priority || 999;
      const priorityB = b.priority || 999;

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // 行数多的优先
      return b.lines - a.lines;
    });

  // 限制文件数量以确保不超过最大行数
  const processedFiles = [];
  let totalLines = 0;

  for (const file of sortedFiles) {
    if (totalLines + file.lines > maxLines) {
      // 如果添加这个文件会超过限制，可以考虑截取或跳过
      continue;
    }
    processedFiles.push(file);
    totalLines += file.lines;
  }

  return processedFiles;
}

/**
 * 清理代码内容，移除注释和空行
 * @param {string} content 原始内容
 * @param {string} extension 文件扩展名
 * @returns {string} 清理后的内容
 */
async function cleanCodeContent(content, extension) {
  const langInfo = SUPPORTED_EXTENSIONS[extension];
  if (!langInfo) return content;

  let cleanedContent = content;

  // 移除多行注释
  if (langInfo.multi_line) {
    const [startPattern, endPattern] = langInfo.multi_line;
    const regex = new RegExp(`${startPattern.source}[\\s\\S]*?${endPattern.source}`, 'g');
    cleanedContent = cleanedContent.replace(regex, '');
  }

  // 移除单行注释
  if (langInfo.single_line) {
    const lines = cleanedContent.split('\n');
    const filteredLines = lines.filter(line => {
      const trimmedLine = line.trim();
      return !trimmedLine.startsWith(langInfo.single_line);
    });
    cleanedContent = filteredLines.join('\n');
  }

  // 移除版权声明和特殊注释
  const copyrightPatterns = [
    /copyright[\s\S]*?/gi,
    /author[\s\S]*?/gi,
    /license[\s\S]*?/gi,
    /\*\s*@\w+[\s\S]*?\*/gi
  ];

  copyrightPatterns.forEach(pattern => {
    cleanedContent = cleanedContent.replace(pattern, '');
  });

  // 移除多余的空行，但保留适当的空行以维持代码结构
  cleanedContent = cleanedContent.replace(/\n\s*\n\s*\n/g, '\n\n');
  cleanedContent = cleanedContent.replace(/^\s+|\s+$/g, '');

  return cleanedContent;
}

/**
 * 添加页面页眉
 * @param {PDFDocument} doc PDF文档对象
 * @param {Object} file 当前文件
 * @param {number} pageNumber 页码
 */
function addPageHeader(doc, file, pageNumber) {
  // 添加文件名作为页眉
  doc.fontSize(10)
     .font('Helvetica-Bold')
     .fillColor('#2C3E50')
     .text(`文件: ${file.path}`, { align: 'left' });

  // 添加页码
  doc.text(`第 ${pageNumber} 页`, { align: 'right' });

  // 添加分隔线
  doc.moveTo(40, doc.y)
     .lineTo(doc.page.width - 40, doc.y)
     .lineWidth(0.5)
     .strokeColor('#BDC3C7')
     .stroke();

  doc.moveDown(0.5);
}

/**
 * 添加代码行
 * @param {PDFDocument} doc PDF文档对象
 * @param {string} line 代码行
 * @param {Object} config 配置选项
 */
function addCodeLine(doc, line, config) {
  // 检查页面空间
  if (doc.y > doc.page.height - 80) {
    doc.addPage();
    return;
  }

  // 设置代码格式
  doc.fontSize(config.fontSize)
     .font(config.fontFamily || 'Courier')
     .fillColor('#2C3E50');

  // 处理长行
  const maxCharsPerLine = 80;
  if (line.length > maxCharsPerLine) {
    // 分割长行
    const words = line.split(' ');
    let currentLine = '';

    for (const word of words) {
      if ((currentLine + word).length > maxCharsPerLine) {
        if (currentLine) {
          doc.text(currentLine);
          currentLine = word + ' ';
        } else {
          // 单词太长，强制分割
          for (let i = 0; i < word.length; i += maxCharsPerLine) {
            doc.text(word.substr(i, maxCharsPerLine));
          }
        }
      } else {
        currentLine += word + ' ';
      }
    }

    if (currentLine.trim()) {
      doc.text(currentLine);
    }
  } else {
    doc.text(line);
  }
}

/**
 * 添加文件分隔符
 * @param {PDFDocument} doc PDF文档对象
 * @param {Object} config 配置选项
 */
function addFileSeparator(doc, config) {
  doc.moveDown(0.5);

  // 添加分隔线
  doc.moveTo(40, doc.y)
     .lineTo(doc.page.width - 40, doc.y)
     .lineWidth(0.3)
     .strokeColor('#95A5A6')
     .stroke();

  doc.moveDown(0.5);
}

/**
 * 添加结束页面
 * @param {PDFDocument} doc PDF文档对象
 * @param {Object} projectInfo 项目信息
 * @param {Object} config 配置选项
 */
function addEndPage(doc, projectInfo, config) {
  doc.addPage();

  doc.fontSize(16)
     .font('Helvetica-Bold')
     .fillColor('#2C3E50')
     .text('源代码文档结束', { align: 'center' });

  doc.moveDown(2);

  doc.fontSize(12)
     .font('Helvetica')
     .fillColor('#7F8C8D')
     .text(`项目名称: ${projectInfo.name}`, { align: 'center' });

  doc.text(`生成时间: ${moment().format('YYYY年MM月DD日 HH:mm:ss')}`, { align: 'center' });

  doc.moveDown(2);

  doc.fontSize(10)
     .fillColor('#95A5A6')
     .text('（本文档由 SoftCopyright 工具自动生成，仅用于软件著作权申请）',
            { align: 'center' });
}

/**
 * 格式化文件大小
 * @param {number} bytes 字节数
 * @returns {string} 格式化后的大小
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

module.exports = {
  exportSourceCode,
  generateSourceCodeContent,
  cleanCodeContent,
  processFiles
};