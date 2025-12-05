const { generateCompletePDF } = require('./scripts/auto-pdf-generator');
const path = require('path');

const projectPath = process.argv[2] || process.cwd();
const outputDir = process.argv[3] || path.join(process.cwd(), 'softcopyright-output');

// 测试自动PDF生成
generateCompletePDF(projectPath, outputDir)
  .then(pdfPath => {
    console.log('\n🎊 自动PDF生成测试成功！');
    console.log('📄 生成的PDF文件:', pdfPath);
    console.log('💡 文件已经包含完整的中文内容和专业排版');
  })
  .catch(error => {
    console.error('\n❌ 测试失败:', error.message);
    process.exit(1);
  });