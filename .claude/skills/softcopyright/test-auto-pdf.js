const { generateCompletePDF } = require('./scripts/auto-pdf-generator');

// 测试自动PDF生成
generateCompletePDF('/Users/mac/Desktop/test-project', '/Users/mac/Desktop/softcopyright-output')
  .then(pdfPath => {
    console.log('\n🎊 自动PDF生成测试成功！');
    console.log('📄 生成的PDF文件:', pdfPath);
    console.log('💡 文件已经包含完整的中文内容和专业排版');
  })
  .catch(error => {
    console.error('\n❌ 测试失败:', error.message);
    process.exit(1);
  });