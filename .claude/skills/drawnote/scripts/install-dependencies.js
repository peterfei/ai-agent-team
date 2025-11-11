#!/usr/bin/env node

/**
 * DrawNote Skill 依赖安装脚本
 * 负责 Playwright 浏览器的安装和验证
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🎭 DrawNote Skill - 依赖安装脚本');
console.log('=====================================');

const skillDir = path.dirname(__dirname);
const nodeModulesDir = path.join(skillDir, 'node_modules');
const playwrightDir = path.join(nodeModulesDir, 'playwright');

// 检查是否已经安装
if (fs.existsSync(playwrightDir)) {
  console.log('✅ Playwright 已安装，跳过浏览器下载');
  process.exit(0);
}

console.log('📦 开始安装 Playwright 浏览器...');

// 使用 spawn 异步安装，避免阻塞
const installProcess = spawn('npx', ['playwright', 'install', 'chromium', '--with-deps'], {
  cwd: skillDir,
  stdio: 'inherit',
  detached: true
});

installProcess.on('error', (error) => {
  console.error('❌ 安装失败:', error.message);
  process.exit(1);
});

installProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Playwright 浏览器安装完成');
  } else {
    console.error(`❌ 安装失败，退出码: ${code}`);
    console.log('\n🔧 手动安装步骤:');
    console.log('   cd ~/.claude/skills/drawnote');
    console.log('   npx playwright install chromium --with-deps');
  }
});

// 让进程在后台运行
installProcess.unref();

console.log('🚀 浏览器安装已在后台启动...');
console.log('💡 安装完成后，DrawNote Skill 将自动可用');