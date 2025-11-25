const fs = require('fs-extra');
const path = require('path');
const PDFDocument = require('pdfkit');
const moment = require('moment');
const chalk = require('chalk');
const { generateManualHTML } = require('./simple-doc-generator');
const { SUPPORTED_EXTENSIONS } = require('./scanner');

/**
 * 生成软件说明书
 * @param {Object} projectInfo 项目信息
 * @param {string} outputDir 输出目录
 * @returns {Promise<string>} 生成的PDF文件路径
 */
async function generateManual(projectInfo, outputDir) {
  try {
    console.log(chalk.yellow('📝 生成软件说明书...'));

    const timestamp = moment().format('YYYYMMDD_HHMMSS');
    const fileName = `软件说明书_${projectInfo.name}_${timestamp}.pdf`;
    const outputPath = path.join(outputDir, fileName);

    // 初始化字体管理器
    const fontManager = new FontManager();
    const fontPath = await fontManager.getFontPath();

    // 创建PDF文档
    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      },
      info: {
        Title: `软件说明书 - ${projectInfo.name}`,
        Author: 'SoftCopyright',
        Subject: '软件著作权申请材料',
        Creator: 'SoftCopyright Tool',
        Producer: 'SoftCopyright'
      }
    });

    // 管道输出到文件
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // 添加字体
    try {
      doc.font('Helvetica');
    } catch (error) {
      console.warn(chalk.yellow('⚠️  使用默认字体'));
    }

    // 设置字体
    if (fontPath) {
      try {
        doc.font(fontPath);
        console.log(chalk.green(`✅ 使用中文字体: ${path.basename(fontPath)}`));
      } catch (error) {
        console.warn(chalk.yellow('⚠️  中文字体加载失败，使用默认字体'));
        doc.font('Helvetica');
      }
    } else {
      console.warn(chalk.yellow('⚠️  未找到中文字体，使用默认字体'));
      doc.font('Helvetica');
    }

    // 生成说明书内容
    await generateManualContent(doc, projectInfo);

    // 完成文档
    doc.end();

    // 等待文件写入完成
    return new Promise((resolve, reject) => {
      stream.on('finish', () => {
        console.log(chalk.green(`✅ 软件说明书已生成: ${outputPath}`));
        resolve(outputPath);
      });
      stream.on('error', reject);
    });

  } catch (error) {
    throw new Error(`生成软件说明书失败: ${error.message}`);
  }
}

/**
 * 生成说明书内容
 * @param {PDFDocument} doc PDF文档对象
 * @param {Object} projectInfo 项目信息
 */
async function generateManualContent(doc, projectInfo) {
  // 添加封面
  addCoverPage(doc, projectInfo);

  // 添加目录
  addTableOfContents(doc);

  // 生成各章节内容
  await addIntroduction(doc, projectInfo);
  await addSoftwareOverview(doc, projectInfo);
  await addRunningEnvironment(doc, projectInfo);
  await addDesignAndImplementation(doc, projectInfo);
  await addFunctionalModules(doc, projectInfo);
  await addUserGuide(doc, projectInfo);
  await addTestingAndMaintenance(doc, projectInfo);
}

/**
 * 添加封面页
 * @param {PDFDocument} doc PDF文档对象
 * @param {Object} projectInfo 项目信息
 */
function addCoverPage(doc, projectInfo) {
  doc.addPage();

  // 设置标题
  doc.fontSize(28)
     .font('Helvetica-Bold')
     .fillColor('#2C3E50')
     .text('软件说明书', { align: 'center' });

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

  // 添加项目信息
  doc.fontSize(12)
     .fillColor('#2C3E50')
     .text('项目信息', { align: 'center' });

  doc.moveDown(1);

  const projectDetails = [
    `项目名称: ${projectInfo.name}`,
    `开发语言: ${projectInfo.languages.join(', ')}`,
    `源代码文件: ${projectInfo.files.length} 个`,
    `总代码行数: ${projectInfo.totalLines} 行`,
    `项目类型: ${getProjectTypeDescription(projectInfo.features.type)}`
  ];

  projectDetails.forEach(detail => {
    doc.text(detail, { align: 'center' });
    doc.moveDown(0.5);
  });
}

/**
 * 添加目录
 * @param {PDFDocument} doc PDF文档对象
 */
function addTableOfContents(doc) {
  doc.addPage();

  doc.fontSize(20)
     .font('Helvetica-Bold')
     .fillColor('#2C3E50')
     .text('目录');

  doc.moveDown(1);

  const contents = [
    { title: '1. 引言', page: 3 },
    { title: '   1.1 概述', page: 3 },
    { title: '   1.2 编写目的', page: 3 },
    { title: '   1.3 开发背景', page: 4 },
    { title: '2. 软件概述', page: 4 },
    { title: '   2.1 主要功能', page: 4 },
    { title: '   2.2 应用场景', page: 5 },
    { title: '   2.3 软件特点', page: 5 },
    { title: '   2.4 性能指标', page: 6 },
    { title: '3. 运行环境', page: 6 },
    { title: '   3.1 硬件要求', page: 6 },
    { title: '   3.2 软件要求', page: 7 },
    { title: '   3.3 网络环境', page: 7 },
    { title: '4. 设计思想与实现过程', page: 8 },
    { title: '   4.1 系统架构', page: 8 },
    { title: '   4.2 模块划分', page: 9 },
    { title: '   4.3 开发流程', page: 10 },
    { title: '5. 功能模块详述', page: 10 },
    { title: '   5.1 核心功能模块', page: 10 },
    { title: '   5.2 辅助功能模块', page: 12 },
    { title: '   5.3 用户界面设计', page: 13 },
    { title: '6. 用户指南', page: 14 },
    { title: '   6.1 安装说明', page: 14 },
    { title: '   6.2 使用方法', page: 15 },
    { title: '   6.3 常见问题', page: 16 },
    { title: '7. 测试与维护', page: 17 },
    { title: '   7.1 测试情况', page: 17 },
    { title: '   7.2 维护说明', page: 18 }
  ];

  doc.fontSize(12)
     .font('Helvetica')
     .fillColor('#2C3E50');

  contents.forEach(item => {
    const dots = '.'.repeat(50 - item.title.length - item.page.toString().length);
    doc.text(`${item.title}${dots}${item.page}`);
    doc.moveDown(0.3);
  });
}

/**
 * 添加引言章节
 * @param {PDFDocument} doc PDF文档对象
 * @param {Object} projectInfo 项目信息
 */
async function addIntroduction(doc, projectInfo) {
  doc.addPage();

  doc.fontSize(18)
     .font('Helvetica-Bold')
     .fillColor('#2C3E50')
     .text('1. 引言');

  doc.moveDown(1);

  // 1.1 概述
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor('#34495E')
     .text('1.1 概述');

  doc.moveDown(0.5);

  doc.fontSize(12)
     .font('Helvetica')
     .fillColor('#2C3E50')
     .text(`${projectInfo.name}是一款基于${projectInfo.languages.join('、')}技术开发的${getProjectTypeDescription(projectInfo.features.type)}软件。`
          + `本项目包含${projectInfo.files.length}个源代码文件，总计${projectInfo.totalLines}行代码，体现了良好的软件工程实践和模块化设计理念。`
          + `软件采用了现代化的开发技术和架构设计，具有高度的可扩展性和维护性。`);

  doc.moveDown(1);

  // 1.2 编写目的
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor('#34495E')
     .text('1.2 编写目的');

  doc.moveDown(0.5);

  doc.fontSize(12)
     .font('Helvetica')
     .fillColor('#2C3E50')
     .text('本软件说明书旨在详细描述' + projectInfo.name + '的功能特性、技术架构、运行环境和使用方法，为软件著作权申请提供完整的技术文档。'
          + '本文档将从技术角度全面阐述软件的设计思想、实现方案和创新点，展现软件的技术价值和实用性。');

  doc.moveDown(1);

  // 1.3 开发背景
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor('#34495E')
     .text('1.3 开发背景');

  doc.moveDown(0.5);

  doc.fontSize(12)
     .font('Helvetica')
     .fillColor('#2C3E50')
     .text('随着信息技术的快速发展和数字化转型的深入，用户对高质量软件的需求日益增长。'
          + projectInfo.name + '的开发正是为了满足' + getApplicationScenario(projectInfo) + '的需求。'
          + '项目采用了' + projectInfo.features.frameworks.join('、') + '等主流技术框架，确保了技术的先进性和稳定性。'
          + '通过深入的调研和精心的设计，本软件实现了核心功能的优化和用户体验的提升。');
}

/**
 * 添加软件概述章节
 * @param {PDFDocument} doc PDF文档对象
 * @param {Object} projectInfo 项目信息
 */
async function addSoftwareOverview(doc, projectInfo) {
  doc.addPage();

  doc.fontSize(18)
     .font('Helvetica-Bold')
     .fillColor('#2C3E50')
     .text('2. 软件概述');

  doc.moveDown(1);

  // 2.1 主要功能
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor('#34495E')
     .text('2.1 主要功能');

  doc.moveDown(0.5);

  doc.fontSize(12)
     .font('Helvetica')
     .fillColor('#2C3E50');

  const mainFunctions = getMainFunctions(projectInfo);
  mainFunctions.forEach((func, index) => {
    doc.text(`${index + 1}. ${func}`);
    doc.moveDown(0.3);
  });

  doc.moveDown(1);

  // 2.2 应用场景
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor('#34495E')
     .text('2.2 应用场景');

  doc.moveDown(0.5);

  doc.fontSize(12)
     .font('Helvetica')
     .fillColor('#2C3E50')
     .text(getApplicationScenario(projectInfo));

  doc.moveDown(1);

  // 2.3 软件特点
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor('#34495E')
     .text('2.3 软件特点');

  doc.moveDown(0.5);

  doc.fontSize(12)
     .font('Helvetica')
     .fillColor('#2C3E50');

  const features = getSoftwareFeatures(projectInfo);
  features.forEach((feature, index) => {
    doc.text(`• ${feature}`);
    doc.moveDown(0.3);
  });

  doc.moveDown(1);

  // 2.4 性能指标
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor('#34495E')
     .text('2.4 性能指标');

  doc.moveDown(0.5);

  doc.fontSize(12)
     .font('Helvetica')
     .fillColor('#2C3E50')
     .text('本软件在性能方面具有以下特点：');

  doc.moveDown(0.5);

  const performance = getPerformanceMetrics(projectInfo);
  performance.forEach((metric, index) => {
    doc.text(`${index + 1}. ${metric}`);
    doc.moveDown(0.3);
  });
}

/**
 * 添加运行环境章节
 * @param {PDFDocument} doc PDF文档对象
 * @param {Object} projectInfo 项目信息
 */
async function addRunningEnvironment(doc, projectInfo) {
  doc.addPage();

  doc.fontSize(18)
     .font('Helvetica-Bold')
     .fillColor('#2C3E50')
     .text('3. 运行环境');

  doc.moveDown(1);

  // 3.1 硬件要求
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor('#34495E')
     .text('3.1 硬件要求');

  doc.moveDown(0.5);

  doc.fontSize(12)
     .font('Helvetica')
     .fillColor('#2C3E50')
     .text('最低硬件配置：');

  doc.moveDown(0.5);

  const hardwareReqs = [
    '处理器：双核 2.0GHz 或更高',
    '内存：4GB RAM 或更高',
    '存储空间：至少 1GB 可用空间',
    '显卡：支持 DirectX 11 或 OpenGL 4.0',
    '网络：稳定的互联网连接（如需要在线功能）'
  ];

  hardwareReqs.forEach(req => {
    doc.text(`• ${req}`);
    doc.moveDown(0.3);
  });

  doc.moveDown(1);

  doc.fontSize(12)
     .font('Helvetica')
     .fillColor('#2C3E50')
     .text('推荐硬件配置：');

  doc.moveDown(0.5);

  const recommendedHardware = [
    '处理器：四核 3.0GHz 或更高',
    '内存：8GB RAM 或更高',
    '存储空间：SSD，至少 2GB 可用空间',
    '显卡：独立显卡，支持最新图形标准',
    '网络：宽带互联网连接'
  ];

  recommendedHardware.forEach(req => {
    doc.text(`• ${req}`);
    doc.moveDown(0.3);
  });

  doc.moveDown(1);

  // 3.2 软件要求
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor('#34495E')
     .text('3.2 软件要求');

  doc.moveDown(0.5);

  const softwareReqs = getSoftwareRequirements(projectInfo);
  softwareReqs.forEach(req => {
    doc.text(`• ${req}`);
    doc.moveDown(0.3);
  });

  doc.moveDown(1);

  // 3.3 网络环境
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor('#34495E')
     .text('3.3 网络环境');

  doc.moveDown(0.5);

  doc.fontSize(12)
     .font('Helvetica')
     .fillColor('#2C3E50')
     .text('本软件支持以下网络环境：');

  doc.moveDown(0.5);

  const networkReqs = [
    '局域网环境：支持内网部署和访问',
    '互联网环境：支持公网访问和云端服务',
    '网络协议：HTTP/HTTPS、TCP/IP、WebSocket',
    '数据传输：支持加密传输，确保数据安全',
    '防火墙：支持企业级防火墙配置'
  ];

  networkReqs.forEach(req => {
    doc.text(`• ${req}`);
    doc.moveDown(0.3);
  });
}

/**
 * 添加设计思想与实现过程章节
 * @param {PDFDocument} doc PDF文档对象
 * @param {Object} projectInfo 项目信息
 */
async function addDesignAndImplementation(doc, projectInfo) {
  doc.addPage();

  doc.fontSize(18)
     .font('Helvetica-Bold')
     .fillColor('#2C3E50')
     .text('4. 设计思想与实现过程');

  doc.moveDown(1);

  // 4.1 系统架构
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor('#34495E')
     .text('4.1 系统架构');

  doc.moveDown(0.5);

  doc.fontSize(12)
     .font('Helvetica')
     .fillColor('#2C3E50')
     .text(getSystemArchitecture(projectInfo));

  doc.moveDown(1);

  // 4.2 模块划分
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor('#34495E')
     .text('4.2 模块划分');

  doc.moveDown(0.5);

  const modules = getModuleDivision(projectInfo);
  modules.forEach((module, index) => {
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#34495E')
       .text(`${index + 1}. ${module.name}`);

    doc.moveDown(0.3);

    doc.fontSize(11)
       .font('Helvetica')
       .fillColor('#2C3E50')
       .text(module.description);

    doc.moveDown(0.8);
  });

  // 4.3 开发流程
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor('#34495E')
     .text('4.3 开发流程');

  doc.moveDown(0.5);

  doc.fontSize(12)
     .font('Helvetica')
     .fillColor('#2C3E50')
     .text(getDevelopmentProcess(projectInfo));
}

/**
 * 添加功能模块详述章节
 * @param {PDFDocument} doc PDF文档对象
 * @param {Object} projectInfo 项目信息
 */
async function addFunctionalModules(doc, projectInfo) {
  doc.addPage();

  doc.fontSize(18)
     .font('Helvetica-Bold')
     .fillColor('#2C3E50')
     .text('5. 功能模块详述');

  doc.moveDown(1);

  // 5.1 核心功能模块
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor('#34495E')
     .text('5.1 核心功能模块');

  doc.moveDown(0.5);

  const coreModules = getCoreModules(projectInfo);
  coreModules.forEach((module, index) => {
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#34495E')
       .text(`5.1.${index + 1} ${module.name}`);

    doc.moveDown(0.3);

    doc.fontSize(11)
       .font('Helvetica')
       .fillColor('#2C3E50')
       .text(`功能描述：${module.description}`);

    doc.moveDown(0.3);

    doc.text(`技术实现：${module.implementation}`);

    doc.moveDown(0.5);

    if (module.screenshot) {
      doc.text(`界面截图：${module.screenshot}`);
      doc.moveDown(0.5);
    }

    doc.moveDown(0.5);
  });

  doc.addPage();

  // 5.2 辅助功能模块
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor('#34495E')
     .text('5.2 辅助功能模块');

  doc.moveDown(0.5);

  const auxiliaryModules = getAuxiliaryModules(projectInfo);
  auxiliaryModules.forEach((module, index) => {
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#34495E')
       .text(`5.2.${index + 1} ${module.name}`);

    doc.moveDown(0.3);

    doc.fontSize(11)
       .font('Helvetica')
       .fillColor('#2C3E50')
       .text(module.description);

    doc.moveDown(0.8);
  });

  // 5.3 用户界面设计
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor('#34495E')
     .text('5.3 用户界面设计');

  doc.moveDown(0.5);

  doc.fontSize(12)
     .font('Helvetica')
     .fillColor('#2C3E50')
     .text(getUIDesignDescription(projectInfo));

  doc.moveDown(1);

  doc.text('主要界面包括：');

  doc.moveDown(0.5);

  const interfaces = getMainInterfaces(projectInfo);
  interfaces.forEach((iface, index) => {
    doc.text(`${index + 1}. ${iface}`);
    doc.moveDown(0.3);
  });
}

/**
 * 添加用户指南章节
 * @param {PDFDocument} doc PDF文档对象
 * @param {Object} projectInfo 项目信息
 */
async function addUserGuide(doc, projectInfo) {
  doc.addPage();

  doc.fontSize(18)
     .font('Helvetica-Bold')
     .fillColor('#2C3E50')
     .text('6. 用户指南');

  doc.moveDown(1);

  // 6.1 安装说明
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor('#34495E')
     .text('6.1 安装说明');

  doc.moveDown(0.5);

  doc.fontSize(12)
     .font('Helvetica')
     .fillColor('#2C3E50')
     .text(getInstallationGuide(projectInfo));

  doc.moveDown(1);

  // 6.2 使用方法
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor('#34495E')
     .text('6.2 使用方法');

  doc.moveDown(0.5);

  doc.fontSize(12)
     .font('Helvetica')
     .fillColor('#2C3E50')
     .text(getUsageInstructions(projectInfo));

  doc.moveDown(1);

  // 6.3 常见问题
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor('#34495E')
     .text('6.3 常见问题');

  doc.moveDown(0.5);

  const faq = getFAQ(projectInfo);
  faq.forEach((item, index) => {
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#34495E')
       .text(`问题${index + 1}：${item.question}`);

    doc.moveDown(0.3);

    doc.fontSize(11)
       .font('Helvetica')
       .fillColor('#2C3E50')
       .text(`回答：${item.answer}`);

    doc.moveDown(0.8);
  });
}

/**
 * 添加测试与维护章节
 * @param {PDFDocument} doc PDF文档对象
 * @param {Object} projectInfo 项目信息
 */
async function addTestingAndMaintenance(doc, projectInfo) {
  doc.addPage();

  doc.fontSize(18)
     .font('Helvetica-Bold')
     .fillColor('#2C3E50')
     .text('7. 测试与维护');

  doc.moveDown(1);

  // 7.1 测试情况
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor('#34495E')
     .text('7.1 测试情况');

  doc.moveDown(0.5);

  doc.fontSize(12)
     .font('Helvetica')
     .fillColor('#2C3E50')
     .text(getTestingInfo(projectInfo));

  doc.moveDown(1);

  // 7.2 维护说明
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor('#34495E')
     .text('7.2 维护说明');

  doc.moveDown(0.5);

  doc.fontSize(12)
     .font('Helvetica')
     .fillColor('#2C3E50')
     .text(getMaintenanceInfo(projectInfo));
}

// 辅助函数：获取项目类型描述
function getProjectTypeDescription(type) {
  const typeMap = {
    'web': 'Web应用',
    'python': 'Python应用',
    'java': 'Java应用',
    'javascript': 'JavaScript应用',
    'unknown': '通用'
  };
  return typeMap[type] || '通用';
}

// 辅助函数：获取主要功能
function getMainFunctions(projectInfo) {
  const functions = [];

  if (projectInfo.features.frameworks.includes('React') ||
      projectInfo.features.frameworks.includes('Vue')) {
    functions.push('用户界面管理和交互功能');
  }

  if (projectInfo.features.frameworks.includes('Express') ||
      projectInfo.features.frameworks.includes('NestJS')) {
    functions.push('后端API服务和数据处理功能');
  }

  functions.push('数据存储和管理功能');
  functions.push('系统配置和设置功能');
  functions.push('用户认证和权限管理功能');
  functions.push('日志记录和监控功能');

  return functions;
}

// 辅助函数：获取应用场景
function getApplicationScenario(projectInfo) {
  const scenarios = {
    'web': 'Web应用开发和部署',
    'python': '数据处理和机器学习应用',
    'java': '企业级应用系统开发',
    'javascript': '前端应用和Node.js服务',
    'unknown': '通用软件开发和部署'
  };
  return scenarios[projectInfo.features.type] || scenarios.unknown;
}

// 辅助函数：获取软件特点
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

// 辅助函数：获取性能指标
function getPerformanceMetrics(projectInfo) {
  return [
    '响应时间：主要操作响应时间小于200ms',
    '并发处理：支持100+并发用户访问',
    '数据处理：支持大量数据的高效处理',
    '内存使用：合理的内存占用和垃圾回收机制',
    '可扩展性：支持水平扩展和负载均衡'
  ];
}

// 辅助函数：获取软件要求
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

// 辅助函数：获取系统架构描述
function getSystemArchitecture(projectInfo) {
  let arch = '本软件采用';

  if (projectInfo.features.type === 'web') {
    arch += '前后端分离的架构设计。前端使用';
    if (projectInfo.features.frameworks.includes('React')) {
      arch += 'React框架';
    } else if (projectInfo.features.frameworks.includes('Vue')) {
      arch += 'Vue框架';
    } else {
      arch += '现代JavaScript技术';
    }
    arch += '，后端采用RESTful API设计';
  } else {
    arch += '分层架构设计，包括表示层、业务逻辑层和数据访问层';
  }

  arch += '。系统采用模块化设计，各模块之间通过标准接口进行通信，确保系统的松耦合和高内聚。';

  return arch;
}

// 辅助函数：获取模块划分
function getModuleDivision(projectInfo) {
  const modules = [
    {
      name: '用户界面模块',
      description: '负责用户交互和界面展示，提供直观友好的操作界面'
    },
    {
      name: '业务逻辑模块',
      description: '处理核心业务逻辑，实现系统的核心功能'
    },
    {
      name: '数据访问模块',
      description: '负责数据的存储、检索和管理，确保数据的一致性和完整性'
    },
    {
      name: '系统配置模块',
      description: '管理系统配置和参数设置，支持动态配置和热更新'
    },
    {
      name: '日志监控模块',
      description: '记录系统运行日志，提供系统监控和性能分析功能'
    }
  ];

  return modules;
}

// 辅助函数：获取开发流程
function getDevelopmentProcess(projectInfo) {
  return `软件开发遵循标准的软件工程流程，包括需求分析、系统设计、编码实现、测试验证和部署维护等阶段。
项目采用敏捷开发方法，通过迭代的方式逐步完善功能。在开发过程中，我们重视代码质量，
采用代码审查、单元测试等手段确保软件的可靠性和稳定性。版本控制使用Git，确保代码的可追溯性和团队协作效率。`;
}

// 辅助函数：获取核心模块
function getCoreModules(projectInfo) {
  return [
    {
      name: '用户管理模块',
      description: '实现用户注册、登录、权限管理等功能',
      implementation: '使用JWT进行身份验证，支持角色基础的权限控制',
      screenshot: '[图1: 用户登录界面]'
    },
    {
      name: '数据处理模块',
      description: '负责数据的增删改查和业务逻辑处理',
      implementation: '采用ORM技术进行数据库操作，支持事务管理和数据缓存',
      screenshot: '[图2: 数据管理界面]'
    },
    {
      name: 'API接口模块',
      description: '提供RESTful API接口供前端调用',
      implementation: '使用标准HTTP协议，支持JSON格式数据交换',
      screenshot: '[图3: API接口文档]'
    }
  ];
}

// 辅助函数：获取辅助模块
function getAuxiliaryModules(projectInfo) {
  return [
    {
      name: '文件管理模块',
      description: '处理文件上传、下载和存储功能'
    },
    {
      name: '消息通知模块',
      description: '实现系统消息推送和邮件通知功能'
    },
    {
      name: '报表统计模块',
      description: '生成各类统计报表和数据可视化图表'
    }
  ];
}

// 辅助函数：获取UI设计描述
function getUIDesignDescription(projectInfo) {
  return `用户界面设计遵循简洁易用的原则，采用现代化的设计风格。
界面布局合理，色彩搭配协调，图标和文字清晰可读。
支持响应式设计，能够适配不同分辨率的设备。
提供统一的交互体验，操作流程简单直观。`;
}

// 辅助函数：获取主要界面
function getMainInterfaces(projectInfo) {
  return [
    '登录/注册界面 - 用户身份验证入口',
    '主控制台界面 - 系统功能总览和快速访问',
    '数据管理界面 - 数据的增删改查操作',
    '系统设置界面 - 系统参数配置和管理',
    '用户管理界面 - 用户权限和账户管理',
    '报表分析界面 - 数据统计和可视化展示'
  ];
}

// 辅助函数：获取安装指南
function getInstallationGuide(projectInfo) {
  return `1. 环境准备：确保系统满足最低硬件和软件要求
2. 依赖安装：安装必要的运行环境和依赖包
3. 软件部署：将软件部署到目标环境
4. 配置设置：根据实际需求配置系统参数
5. 启动测试：验证软件是否正常运行`;
}

// 辅助函数：获取使用说明
function getUsageInstructions(projectInfo) {
  return `1. 用户登录：使用有效的用户名和密码登录系统
2. 功能导航：通过主菜单或导航栏访问各项功能
3. 数据操作：在相应界面中完成数据的增删改查
4. 报表查看：通过报表功能查看统计数据和分析结果
5. 系统管理：管理员可以进行系统配置和用户管理`;
}

// 辅助函数：获取常见问题
function getFAQ(projectInfo) {
  return [
    {
      question: '无法登录系统怎么办？',
      answer: '请检查用户名和密码是否正确，如忘记密码可以使用密码找回功能。'
    },
    {
      question: '系统运行缓慢如何解决？',
      answer: '请检查网络连接和系统资源使用情况，必要时清理缓存或重启系统。'
    },
    {
      question: '数据导出失败的原因？',
      answer: '可能是数据量过大或权限不足，建议分批导出或联系管理员。'
    }
  ];
}

// 辅助函数：获取测试信息
function getTestingInfo(projectInfo) {
  let testing = `本软件经过全面的测试验证，包括单元测试、集成测试和系统测试。
`;

  if (projectInfo.features.testing.length > 0) {
    testing += `使用${projectInfo.features.testing.join('、')}等测试框架进行测试验证。
`;
  }

  testing += `测试覆盖了主要功能模块、边界条件和异常情况，确保软件的稳定性和可靠性。
性能测试验证了系统在不同负载下的响应能力，安全测试确保了系统的安全性。`;

  return testing;
}

// 辅助函数：获取维护信息
function getMaintenanceInfo(projectInfo) {
  return `软件维护包括日常维护、故障排除和功能升级等方面。
1. 日常维护：定期检查系统运行状态，备份重要数据
2. 故障排除：及时处理系统异常和用户反馈的问题
3. 功能升级：根据用户需求和技术发展，持续改进软件功能
4. 安全维护：定期更新安全补丁，确保系统安全
5. 性能优化：监控系统性能，持续优化系统响应速度`;
}

module.exports = {
  generateManual,
  generateManualContent
};