const { generateManualHTML } = require('./scripts/simple-doc-generator');
const scanner = require('./scripts/scanner');
const path = require('path');

async function testComplete() {
  try {
    const projectPath = process.argv[2] || process.cwd();
    const outputDir = process.argv[3] || path.join(process.cwd(), 'softcopyright-output');

    console.log('🔍 扫描项目:', projectPath);
    const projectInfo = await scanner.scanProject(projectPath);

    console.log('📝 生成HTML说明书...');
    const htmlPath = await generateManualHTML(projectInfo, outputDir);

    console.log('✅ 测试完成!');
    console.log('生成的HTML文件:', htmlPath);
    console.log('💡 在浏览器中打开该文件，然后可以打印为PDF');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testComplete();