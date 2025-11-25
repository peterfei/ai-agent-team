const { generateManualHTML } = require('./scripts/simple-doc-generator');
const scanner = require('./scripts/scanner');

async function testComplete() {
  try {
    console.log('🔍 扫描项目...');
    const projectInfo = await scanner.scanProject('/Users/mac/Desktop/test-project');

    console.log('📝 生成HTML说明书...');
    const htmlPath = await generateManualHTML(projectInfo, '/Users/mac/Desktop/softcopyright-output');

    console.log('✅ 测试完成!');
    console.log('生成的HTML文件:', htmlPath);
    console.log('💡 在浏览器中打开该文件，然后可以打印为PDF');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testComplete();