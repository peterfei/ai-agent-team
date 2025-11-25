const { generateManualPDF } = require('./scripts/simple-pdf-generator');
const path = require('path');

// 测试项目信息
const testProjectInfo = {
  name: 'test-project',
  languages: ['javascript'],
  files: [
    { path: 'app.js', lines: 50 },
    { path: 'utils.js', lines: 53 }
  ],
  totalLines: 103,
  features: {
    type: 'javascript',
    frameworks: [],
    hasTests: false,
    hasDocumentation: true
  }
};

// 测试生成
generateManualPDF(testProjectInfo, './')
  .then(outputPath => {
    console.log('✅ PDF生成成功:', outputPath);
  })
  .catch(error => {
    console.error('❌ PDF生成失败:', error);
  });