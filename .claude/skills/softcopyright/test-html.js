const { generateManualHTML } = require('./scripts/simple-doc-generator');

// 测试项目信息
const testProjectInfo = {
  name: 'calculator-app',
  languages: ['javascript'],
  files: [
    { path: 'app.js', lines: 50 },
    { path: 'utils.js', lines: 53 }
  ],
  totalLines: 103,
  features: {
    type: 'javascript',
    frameworks: [],
    packageManagers: ['npm'],
    hasTests: false,
    hasDocumentation: true
  }
};

// 测试生成HTML
generateManualHTML(testProjectInfo, './')
  .then(outputPath => {
    console.log('✅ HTML生成成功:', outputPath);
    console.log('💡 在浏览器中打开该文件，然后可以打印为PDF');
  })
  .catch(error => {
    console.error('❌ HTML生成失败:', error);
  });