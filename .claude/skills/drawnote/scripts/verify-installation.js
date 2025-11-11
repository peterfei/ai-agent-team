#!/usr/bin/env node

/**
 * DrawNote Skill 安装验证和修复工具
 * 检查依赖是否正确安装，并提供修复选项
 */

const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

console.log('🔍 DrawNote Skill 安装验证工具');
console.log('================================');

const skillDir = path.dirname(__dirname);
const nodeModulesDir = path.join(skillDir, 'node_modules');
const playwrightDir = path.join(nodeModulesDir, 'playwright');
const packageJsonPath = path.join(skillDir, 'package.json');

// 验证函数
function verifyInstallation() {
  const issues = [];

  // 检查基本文件
  if (!fs.existsSync(packageJsonPath)) {
    issues.push('❌ package.json 不存在');
  }

  // 检查 node_modules
  if (!fs.existsSync(nodeModulesDir)) {
    issues.push('❌ node_modules 目录不存在');
  } else {
    // 检查 playwright
    if (!fs.existsSync(playwrightDir)) {
      issues.push('❌ Playwright 模块不存在');
    }

    // 检查其他依赖
    const requiredPackages = ['playwright', 'playwright-core'];
    requiredPackages.forEach(pkg => {
      const pkgPath = path.join(nodeModulesDir, pkg);
      if (!fs.existsSync(pkgPath)) {
        issues.push(`❌ ${pkg} 包不存在`);
      }
    });
  }

  return issues;
}

// 修复函数
function attemptFix(issues) {
  console.log('\n🔧 尝试自动修复...');

  try {
    // 检查 npm 是否可用
    execSync('which npm', { stdio: 'ignore' });
  } catch (error) {
    console.log('❌ npm 不可用，请先安装 Node.js 和 npm');
    return false;
  }

  console.log('📦 运行 npm install...');

  const installProcess = spawn('npm', ['install'], {
    cwd: skillDir,
    stdio: 'inherit'
  });

  return new Promise((resolve) => {
    installProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ npm install 完成');
        resolve(true);
      } else {
        console.log(`❌ npm install 失败，退出码: ${code}`);
        resolve(false);
      }
    });

    installProcess.on('error', (error) => {
      console.error('❌ 安装过程出错:', error.message);
      resolve(false);
    });
  });
}

// 测试截图功能
function testScreenshotFunction() {
  console.log('\n🧪 测试截图功能...');

  try {
    // 创建测试 HTML
    const testHtml = `
<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body><h1>DrawNote Test</h1></body>
</html>`;

    const testHtmlPath = path.join(skillDir, 'test.html');
    const testPngPath = path.join(skillDir, 'test.png');

    fs.writeFileSync(testHtmlPath, testHtml);

    // 运行截图脚本
    const captureScript = path.join(skillDir, 'scripts', 'capture.js');
    execSync(`node "${captureScript}" "${testHtmlPath}" "${testPngPath}"`, {
      stdio: 'pipe',
      timeout: 10000
    });

    // 检查输出文件
    if (fs.existsSync(testPngPath)) {
      const stats = fs.statSync(testPngPath);
      console.log(`✅ 截图功能正常 (输出文件大小: ${(stats.size / 1024).toFixed(1)} KB)`);

      // 清理测试文件
      fs.unlinkSync(testHtmlPath);
      fs.unlinkSync(testPngPath);

      return true;
    } else {
      console.log('❌ 截图文件未生成');
      return false;
    }

  } catch (error) {
    console.log(`❌ 截图测试失败: ${error.message}`);
    return false;
  }
}

// 主流程
async function main() {
  console.log(`📁 检查目录: ${skillDir}`);

  const issues = verifyInstallation();

  if (issues.length === 0) {
    console.log('✅ 所有依赖都正确安装');

    // 测试功能
    const testResult = testScreenshotFunction();

    if (testResult) {
      console.log('\n🎉 DrawNote Skill 完全可用！');
    } else {
      console.log('\n⚠️  依赖已安装但功能测试失败');
    }

  } else {
    console.log('\n❌ 发现以下问题:');
    issues.forEach(issue => console.log(`   ${issue}`));

    // 尝试自动修复
    const fixSuccess = await attemptFix(issues);

    if (fixSuccess) {
      console.log('\n🔄 重新验证...');
      setTimeout(() => {
        const newIssues = verifyInstallation();

        if (newIssues.length === 0) {
          console.log('✅ 修复成功！');
          testScreenshotFunction();
        } else {
          console.log('❌ 自动修复未解决所有问题');
          console.log('\n🔧 请手动执行以下命令:');
          console.log(`   cd "${skillDir}"`);
          console.log('   npm install');
          console.log('   npm run install-browsers');
        }
      }, 2000);
    }
  }
}

// 运行主函数
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 验证过程出错:', error);
    process.exit(1);
  });
}

module.exports = { verifyInstallation, testScreenshotFunction };