const fs = require('fs-extra');
const path = require('path');
const PDFDocument = require('pdfkit');
const moment = require('moment');
const chalk = require('chalk');
const { SUPPORTED_EXTENSIONS } = require('./scanner');

/**
 * 生成英文版软件说明书
 * @param {Object} projectInfo 项目信息
 * @param {string} outputDir 输出目录
 * @returns {Promise<string>} 生成的PDF文件路径
 */
async function generateManualEnglish(projectInfo, outputDir) {
  try {
    console.log(chalk.yellow('📝 Generating English Software Manual...'));

    const timestamp = moment().format('YYYYMMDD_HHMMSS');
    const fileName = `Software_Manual_${projectInfo.name}_${timestamp}.pdf`;
    const outputPath = path.join(outputDir, fileName);

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
        Title: `Software Manual - ${projectInfo.name}`,
        Author: 'SoftCopyright',
        Subject: 'Software Copyright Application Materials',
        Creator: 'SoftCopyright Tool',
        Producer: 'SoftCopyright'
      }
    });

    // 管道输出到文件
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // 使用系统字体
    doc.font('Helvetica');

    // 生成英文版说明书内容
    await generateEnglishManualContent(doc, projectInfo);

    // 完成文档
    doc.end();

    // 等待文件写入完成
    return new Promise((resolve, reject) => {
      stream.on('finish', () => {
        console.log(chalk.green(`✅ English Software Manual generated: ${outputPath}`));
        resolve(outputPath);
      });
      stream.on('error', reject);
    });

  } catch (error) {
    throw new Error(`Failed to generate English software manual: ${error.message}`);
  }
}

/**
 * 生成英文版说明书内容
 * @param {PDFDocument} doc PDF文档对象
 * @param {Object} projectInfo 项目信息
 */
async function generateEnglishManualContent(doc, projectInfo) {
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
     .text('Software Manual', { align: 'center' });

  doc.moveDown(2);

  doc.fontSize(20)
     .fillColor('#34495E')
     .text(projectInfo.name, { align: 'center' });

  doc.moveDown(2);

  // 添加版本和日期
  doc.fontSize(14)
     .fillColor('#7F8C8D')
     .text(`Version: 1.0.0`, { align: 'center' });

  doc.text(`Generated: ${moment().format('YYYY-MM-DD')}`, { align: 'center' });

  doc.moveDown(3);

  // 添加项目信息
  doc.fontSize(12)
     .fillColor('#2C3E50')
     .text('Project Information', { align: 'center' });

  doc.moveDown(1);

  const projectDetails = [
    `Project Name: ${projectInfo.name}`,
    `Programming Languages: ${projectInfo.languages.join(', ')}`,
    `Source Files: ${projectInfo.files.length}`,
    `Total Lines: ${projectInfo.totalLines}`,
    `Project Type: ${getProjectTypeDescription(projectInfo.features.type)}`
  ];

  projectDetails.forEach(detail => {
    doc.text(detail, { align: 'center' });
    doc.moveDown(0.5);
  });

  doc.moveDown(2);

  doc.fontSize(10)
     .fillColor('#95A5A6')
     .text('(This document is generated for software copyright application, copyright statements and author information are excluded)',
            { align: 'center' });
}

function addTableOfContents(doc) {
  doc.addPage();

  doc.fontSize(20)
     .font('Helvetica-Bold')
     .fillColor('#2C3E50')
     .text('Table of Contents');

  doc.moveDown(1);

  const contents = [
    { title: '1. Introduction', page: 3 },
    { title: '   1.1 Overview', page: 3 },
    { title: '   1.2 Purpose', page: 3 },
    { title: '   1.3 Background', page: 4 },
    { title: '2. Software Overview', page: 4 },
    { title: '   2.1 Main Functions', page: 4 },
    { title: '   2.2 Application Scenarios', page: 5 },
    { title: '   2.3 Software Features', page: 5 },
    { title: '   2.4 Performance Metrics', page: 6 },
    { title: '3. Running Environment', page: 6 },
    { title: '   3.1 Hardware Requirements', page: 6 },
    { title: '   3.2 Software Requirements', page: 7 },
    { title: '   3.3 Network Environment', page: 7 },
    { title: '4. Design and Implementation', page: 8 },
    { title: '   4.1 System Architecture', page: 8 },
    { title: '   4.2 Module Division', page: 9 },
    { title: '   4.3 Development Process', page: 10 },
    { title: '5. Functional Modules', page: 10 },
    { title: '   5.1 Core Modules', page: 10 },
    { title: '   5.2 Auxiliary Modules', page: 12 },
    { title: '   5.3 User Interface Design', page: 13 },
    { title: '6. User Guide', page: 14 },
    { title: '   6.1 Installation', page: 14 },
    { title: '   6.2 Usage', page: 15 },
    { title: '   6.3 FAQ', page: 16 },
    { title: '7. Testing and Maintenance', page: 17 },
    { title: '   7.1 Testing', page: 17 },
    { title: '   7.2 Maintenance', page: 18 }
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

async function addIntroduction(doc, projectInfo) {
  doc.addPage();

  doc.fontSize(18)
     .font('Helvetica-Bold')
     .fillColor('#2C3E50')
     .text('1. Introduction');

  doc.moveDown(1);

  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor('#34495E')
     .text('1.1 Overview');

  doc.moveDown(0.5);

  doc.fontSize(12)
     .font('Helvetica')
     .fillColor('#2C3E50')
     .text(`${projectInfo.name} is a ${getProjectTypeDescription(projectInfo.features.type)} developed using ${projectInfo.languages.join(' and ')} technologies. `
          + `This project contains ${projectInfo.files.length} source files with a total of ${projectInfo.totalLines} lines of code, `
          + `demonstrating good software engineering practices and modular design principles. `
          + `The software adopts modern development technologies and architectural design, featuring high scalability and maintainability.`);

  doc.moveDown(1);

  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor('#34495E')
     .text('1.2 Purpose');

  doc.moveDown(0.5);

  doc.fontSize(12)
     .font('Helvetica')
     .fillColor('#2C3E50')
     .text(`This software manual aims to provide a detailed description of ${projectInfo.name}'s functionality, technical architecture, `
          + `runtime environment, and usage methods, providing complete technical documentation for software copyright applications. `
          + `This document will comprehensively describe the software's design philosophy, implementation solutions, and innovative features from a technical perspective, showcasing the software's technical value and practicality.`);

  doc.moveDown(1);

  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor('#34495E')
     .text('1.3 Background');

  doc.moveDown(0.5);

  doc.fontSize(12)
     .font('Helvetica')
     .fillColor('#2C3E50')
     .text(`With the rapid development of information technology and the deepening of digital transformation, the demand for high-quality software is growing. `
          + `The development of ${projectInfo.name} aims to meet the needs of ${getApplicationScenario(projectInfo)}. `
          + `The project adopts mainstream technology frameworks such as ${projectInfo.features.frameworks.join(' and ')}, ensuring technological advancement and stability. `
          + `Through thorough research and careful design, this software achieves optimization of core functions and improved user experience.`);
}

async function addSoftwareOverview(doc, projectInfo) {
  doc.addPage();

  doc.fontSize(18)
     .font('Helvetica-Bold')
     .fillColor('#2C3E50')
     .text('2. Software Overview');

  doc.moveDown(1);

  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor('#34495E')
     .text('2.1 Main Functions');

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

  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor('#34495E')
     .text('2.2 Application Scenarios');

  doc.moveDown(0.5);

  doc.fontSize(12)
     .font('Helvetica')
     .fillColor('#2C3E50')
     .text(getApplicationScenario(projectInfo));

  doc.moveDown(1);

  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor('#34495E')
     .text('2.3 Software Features');

  doc.moveDown(0.5);

  const features = getSoftwareFeatures(projectInfo);
  features.forEach((feature, index) => {
    doc.text(`• ${feature}`);
    doc.moveDown(0.3);
  });

  doc.moveDown(1);

  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor('#34495E')
     .text('2.4 Performance Metrics');

  doc.moveDown(0.5);

  const performance = getPerformanceMetrics(projectInfo);
  performance.forEach((metric, index) => {
    doc.text(`${index + 1}. ${metric}`);
    doc.moveDown(0.3);
  });
}

// 继续添加其他章节的英文版本...
async function addRunningEnvironment(doc, projectInfo) {
  doc.addPage();
  doc.fontSize(18)
     .font('Helvetica-Bold')
     .fillColor('#2C3E50')
     .text('3. Running Environment');

  doc.moveDown(1);
  doc.fontSize(12)
     .font('Helvetica')
     .fillColor('#2C3E50')
     .text('The software runs on standard computing environments with minimum hardware requirements of dual-core 2.0GHz processor, 4GB RAM, and 1GB free disk space.');
}

async function addDesignAndImplementation(doc, projectInfo) {
  doc.addPage();
  doc.fontSize(18)
     .font('Helvetica-Bold')
     .fillColor('#2C3E50')
     .text('4. Design and Implementation');

  doc.moveDown(1);
  doc.fontSize(12)
     .font('Helvetica')
     .fillColor('#2C3E50')
     .text('The software follows modern software engineering practices with modular architecture and clear separation of concerns.');
}

async function addFunctionalModules(doc, projectInfo) {
  doc.addPage();
  doc.fontSize(18)
     .font('Helvetica-Bold')
     .fillColor('#2C3E50')
     .text('5. Functional Modules');

  doc.moveDown(1);
  doc.fontSize(12)
     .font('Helvetica')
     .fillColor('#2C3E50')
     .text('The software consists of core functional modules including user interface, business logic, and data access layers.');
}

async function addUserGuide(doc, projectInfo) {
  doc.addPage();
  doc.fontSize(18)
     .font('Helvetica-Bold')
     .fillColor('#2C3E50')
     .text('6. User Guide');

  doc.moveDown(1);
  doc.fontSize(12)
     .font('Helvetica')
     .fillColor('#2C3E50')
     .text('Users can easily install and run the software following the step-by-step instructions provided.');
}

async function addTestingAndMaintenance(doc, projectInfo) {
  doc.addPage();
  doc.fontSize(18)
     .font('Helvetica-Bold')
     .fillColor('#2C3E50')
     .text('7. Testing and Maintenance');

  doc.moveDown(1);
  doc.fontSize(12)
     .font('Helvetica')
     .fillColor('#2C3E50')
     .text('The software has undergone comprehensive testing including unit tests, integration tests, and system tests.');
}

// 辅助函数
function getProjectTypeDescription(type) {
  const typeMap = {
    'web': 'Web Application',
    'python': 'Python Application',
    'java': 'Java Application',
    'javascript': 'JavaScript Application',
    'unknown': 'General Application'
  };
  return typeMap[type] || 'General Application';
}

function getMainFunctions(projectInfo) {
  const functions = [];
  functions.push('User interface management and interaction');
  functions.push('Data processing and storage');
  functions.push('System configuration and settings');
  functions.push('User authentication and authorization');
  functions.push('Logging and monitoring');
  return functions;
}

function getApplicationScenario(projectInfo) {
  return `software development and deployment for ${projectInfo.features.type} applications`;
}

function getSoftwareFeatures(projectInfo) {
  return [
    'Modular design with high scalability',
    'Modern technology stack ensuring advancement',
    'Clear code structure following best practices',
    'Complete error handling and exception management',
    'Support for multiple data formats and protocols',
    'Good performance and response speed'
  ];
}

function getPerformanceMetrics(projectInfo) {
  return [
    'Response time: Main operations under 200ms',
    'Concurrent processing: Support for 100+ concurrent users',
    'Data processing: Efficient processing of large data sets',
    'Memory usage: Reasonable memory footprint and garbage collection',
    'Scalability: Support for horizontal scaling and load balancing'
  ];
}

module.exports = {
  generateManualEnglish
};