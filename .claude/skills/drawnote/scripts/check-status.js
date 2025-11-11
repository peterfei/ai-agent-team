#!/usr/bin/env node

/**
 * DrawNote Skill 安装状态检查工具
 * 用于查看后台静默安装的进度
 */

const fs = require('fs');
const path = require('path');

console.log('📊 DrawNote Skill 安装状态检查');
console.log('==================================');

const skillDir = path.dirname(__dirname);
const statusFile = path.join(skillDir, '.install-status.json');
const logFile = path.join(skillDir, 'install.log');
const nodeModulesPath = path.join(skillDir, 'node_modules');

function checkDependencies() {
  const playwrightPath = path.join(nodeModulesPath, 'playwright');
  const playwrightCorePath = path.join(nodeModulesPath, 'playwright-core');

  const checks = {
    'node_modules': fs.existsSync(nodeModulesPath),
    'playwright': fs.existsSync(playwrightPath),
    'playwright-core': fs.existsSync(playwrightCorePath)
  };

  return checks;
}

function formatTime(isoString) {
  if (!isoString) return '未知';
  const date = new Date(isoString);
  return date.toLocaleString('zh-CN');
}

function formatDuration(startTime, endTime) {
  if (!startTime) return '未知';

  const start = new Date(startTime);
  const end = endTime ? new Date(endTime) : new Date();
  const duration = Math.floor((end - start) / 1000);

  if (duration < 60) {
    return `${duration}秒`;
  } else if (duration < 3600) {
    return `${Math.floor(duration / 60)}分${duration % 60}秒`;
  } else {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    return `${hours}小时${minutes}分`;
  }
}

function main() {
  console.log(`📁 检查目录: ${skillDir}`);

  // 检查依赖状态
  const dependencies = checkDependencies();
  console.log('\n🔍 依赖状态:');
  Object.entries(dependencies).forEach(([name, exists]) => {
    console.log(`  ${exists ? '✅' : '❌'} ${name}`);
  });

  // 检查安装状态文件
  if (fs.existsSync(statusFile)) {
    try {
      const status = JSON.parse(fs.readFileSync(statusFile));
      console.log('\n📋 安装状态:');
      console.log(`  状态: ${status.status}`);
      console.log(`  消息: ${status.message}`);
      console.log(`  开始时间: ${formatTime(status.startTime)}`);

      if (status.lastUpdate) {
        console.log(`  最后更新: ${formatTime(status.lastUpdate)}`);
        console.log(`  已用时间: ${formatDuration(status.startTime, status.lastUpdate)}`);
      }

      // 根据状态提供建议
      switch (status.status) {
        case 'starting':
          console.log('\n⏳ 正在启动安装进程...');
          break;
        case 'installing':
          console.log('\n📦 正在安装依赖，请耐心等待...');
          console.log('💡 您可以继续使用其他功能，安装在后台进行');
          break;
        case 'completed':
        case 'success':
          console.log('\n🎉 安装完成！DrawNote Skill 已完全可用');
          break;
        case 'error':
          console.log('\n❌ 安装遇到错误');
          console.log('🔧 建议手动执行:');
          console.log(`   cd ${skillDir}`);
          console.log('   npm install');
          break;
      }

    } catch (error) {
      console.log('\n❌ 无法读取安装状态文件');
    }
  } else {
    // 没有状态文件，检查是否已安装
    if (dependencies.node_modules && dependencies.playwright) {
      console.log('\n✅ DrawNote Skill 已完整安装并可用');
    } else {
      console.log('\n❓ 未检测到安装状态，依赖可能缺失');
      console.log('🔧 建议执行安装:');
      console.log(`   cd ${skillDir}`);
      console.log('   npm install');
    }
  }

  // 检查日志文件
  const logFiles = [
    { name: '守护进程日志', file: path.join(skillDir, 'daemon.log') },
    { name: '安装日志', file: logFile }
  ];

  logFiles.forEach(({ name, file }) => {
    if (fs.existsSync(file)) {
      const stats = fs.statSync(file);
      console.log(`\n📝 ${name}:`);
      console.log(`  文件大小: ${(stats.size / 1024).toFixed(1)} KB`);
      console.log(`  最后修改: ${stats.mtime.toLocaleString('zh-CN')}`);
      console.log(`  查看日志: tail -f "${file}"`);
    }
  });

  // 检查守护进程状态
  const lockFile = path.join(skillDir, '.daemon.lock');
  if (fs.existsSync(lockFile)) {
    try {
      const pid = parseInt(fs.readFileSync(lockFile, 'utf8').trim());
      console.log('\n🔒 守护进程状态:');
      console.log(`  PID: ${pid}`);

      // 尝试检查进程是否还在运行
      try {
        process.kill(pid, 0); // 发送信号测试进程是否存在
        console.log('  状态: 运行中');
      } catch (e) {
        console.log('  状态: 进程已退出（锁文件未清理）');
      }
    } catch (error) {
      console.log('\n⚠️  无法读取守护进程锁文件');
    }
  }

  // 提供下一步建议
  console.log('\n💡 可用命令:');
  console.log(`  npm run verify    # 验证和修复安装`);
  console.log(`  npm run test      # 测试截图功能`);
  console.log(`  npm run check     # 检查安装状态（当前命令）`);
}

if (require.main === module) {
  main();
}

module.exports = { checkDependencies };