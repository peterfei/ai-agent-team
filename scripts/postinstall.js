#!/usr/bin/env node

/**
 * AI Agent Team npm postinstall script
 * 自动安装智能体配置
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 AI Agent Team - 安装智能体配置...');

const homeDir = require('os').homedir();
const claudeDir = path.join(homeDir, '.claude');
const packageDir = path.join(__dirname, '..');

// 备份现有配置
function backupExisting() {
  const backupDir = path.join(claudeDir, `backup_${Date.now()}`);

  if (fs.existsSync(path.join(claudeDir, 'agents')) ||
      fs.existsSync(path.join(claudeDir, 'commands'))) {

    console.log('💾 备份现有配置...');
    fs.mkdirSync(backupDir, { recursive: true });

    ['agents', 'commands', 'CLAUDE.md', 'USAGE.md'].forEach(item => {
      const source = path.join(claudeDir, item);
      if (fs.existsSync(source)) {
        const dest = path.join(backupDir, item);
        if (fs.statSync(source).isDirectory()) {
          fs.renameSync(source, dest);
        } else {
          fs.copyFileSync(source, dest);
        }
      }
    });

    console.log(`✅ 配置已备份到: ${backupDir}`);
  }
}

// 安装配置文件
function installConfig() {
  const sourceClaudeDir = path.join(packageDir, '.claude');

  // 创建目标目录
  if (!fs.existsSync(claudeDir)) {
    fs.mkdirSync(claudeDir, { recursive: true });
  }

  // 复制配置文件
  if (fs.existsSync(sourceClaudeDir)) {
    copyFolderSync(sourceClaudeDir, claudeDir);
    console.log('✅ 智能体配置安装完成');

    // 设置CLI脚本权限
    const cliScript = path.join(claudeDir, 'agents', 'cli.sh');
    if (fs.existsSync(cliScript)) {
      try {
        fs.chmodSync(cliScript, '755');
        console.log('✅ CLI工具权限设置完成');
      } catch (error) {
        console.warn('⚠️  无法设置CLI工具权限，请手动执行: chmod +x ~/.claude/agents/cli.sh');
      }
    }
  }
}

// 安装 Skills 并启动守护进程安装依赖
function installSkills() {
  const sourceSkillsDir = path.join(packageDir, '.claude', 'skills');
  const targetSkillsDir = path.join(claudeDir, 'skills');

  if (fs.existsSync(sourceSkillsDir)) {
    console.log('🎨 安装 Claude Skills...');

    // 创建 skills 目录
    if (!fs.existsSync(targetSkillsDir)) {
      fs.mkdirSync(targetSkillsDir, { recursive: true });
    }

    // 复制 skills 文件
    copyFolderSync(sourceSkillsDir, targetSkillsDir);
    console.log('✅ Skills 文件复制完成');

    // 启动守护进程安装 DrawNote Skill 依赖
    const drawnoteSkillDir = path.join(targetSkillsDir, 'drawnote');
    if (fs.existsSync(drawnoteSkillDir)) {
      startInstallDaemon(drawnoteSkillDir);
    }
  } else {
    console.log('⚠️  未找到 Skills 目录，跳过安装');
  }
}

// 启动安装守护进程
function startInstallDaemon(drawnoteSkillDir) {
  const { spawn } = require('child_process');

  // 检查是否已安装
  const playwrightPath = path.join(drawnoteSkillDir, 'node_modules', 'playwright');
  if (fs.existsSync(playwrightPath)) {
    console.log('✅ DrawNote Skill 依赖已安装');
    return;
  }

  // 检查是否有守护进程正在运行
  const lockFile = path.join(drawnoteSkillDir, '.daemon.lock');
  if (fs.existsSync(lockFile)) {
    try {
      const pid = parseInt(fs.readFileSync(lockFile, 'utf8').trim());
      process.kill(pid, 0); // 测试进程是否存在
      console.log('📦 DrawNote Skill 依赖安装守护进程已在运行');
      console.log('💡 依赖将在后台自动安装，请稍候运行: ai-agent-team status');
      return;
    } catch (e) {
      // 进程不存在，删除过期的锁文件
      fs.unlinkSync(lockFile);
    }
  }

  // 创建守护进程脚本
  const daemonScript = path.join(drawnoteSkillDir, '.install-daemon.js');

  const daemonCode = `
const fs = require('fs');
const path = require('path');
const { spawnSync, execSync } = require('child_process');

const skillDir = path.dirname(__filename);
const lockFile = path.join(skillDir, '.daemon.lock');
const logFile = path.join(skillDir, 'daemon.log');

// 创建锁文件
fs.writeFileSync(lockFile, process.pid.toString());

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = '[' + timestamp + '] ' + message + '\\n';
  fs.appendFileSync(logFile, logMessage);
}

function cleanup() {
  try {
    if (fs.existsSync(lockFile)) fs.unlinkSync(lockFile);
  } catch (e) {}
}

function verifyInstallation() {
  const nodeModulesPath = path.join(skillDir, 'node_modules');
  const playwrightPath = path.join(nodeModulesPath, 'playwright');
  return fs.existsSync(nodeModulesPath) && fs.existsSync(playwrightPath);
}

process.on('exit', cleanup);
process.on('SIGINT', () => { cleanup(); process.exit(0); });
process.on('SIGTERM', () => { cleanup(); process.exit(0); });

// 延迟 5 秒开始安装
setTimeout(() => {
  log('DrawNote Skill 守护进程启动，开始安装依赖...');
  log('工作目录: ' + skillDir);
  log('PID: ' + process.pid);

  try {
    // 方法1: 直接安装 playwright（使用 --force 覆盖全局 bin）
    log('方法1: npm install playwright --save --force');
    log('执行目录: ' + process.cwd());
    const result1 = spawnSync('npm', ['install', 'playwright', '--save', '--force'], {
      cwd: skillDir,
      stdio: 'pipe',
      encoding: 'utf8'
    });

    if (result1.stdout) log('stdout: ' + result1.stdout.trim());
    if (result1.stderr) log('stderr: ' + result1.stderr.trim());
    log('exit code: ' + result1.status);

    // 等待文件系统刷新
    const fs = require('fs');
    const startTime = Date.now();
    while (Date.now() - startTime < 2000) {
      if (verifyInstallation()) {
        log('✅ 依赖安装成功 (方法1)');
        log('✅ Playwright 验证成功');
        cleanup();
        log('守护进程退出');
        process.exit(0);
      }
      // 短暂等待
      const busyWait = Date.now() + 100;
      while (Date.now() < busyWait) {}
    }

    log('⚠️ 方法1安装成功但验证超时');
    log('node_modules 路径: ' + path.join(skillDir, 'node_modules'));
    log('playwright 路径: ' + path.join(skillDir, 'node_modules', 'playwright'));
    try {
      const nmExists = fs.existsSync(path.join(skillDir, 'node_modules'));
      const pwExists = fs.existsSync(path.join(skillDir, 'node_modules', 'playwright'));
      log('node_modules exists: ' + nmExists);
      log('playwright exists: ' + pwExists);
    } catch (e) {
      log('验证检查异常: ' + e.message);
    }

    // 方法2: 使用 --force 强制安装
    log('⚠️ 方法1验证失败，尝试方法2: npm install --force');
    const result2 = spawnSync('npm', ['install', '--force'], {
      cwd: skillDir,
      stdio: 'pipe',
      encoding: 'utf8'
    });

    if (result2.stdout) log('stdout: ' + result2.stdout.trim());
    if (result2.stderr) log('stderr: ' + result2.stderr.trim());
    log('exit code: ' + result2.status);

    if (verifyInstallation()) {
      log('✅ 依赖安装成功 (方法2)');
      log('✅ Playwright 验证成功');
      cleanup();
      log('守护进程退出');
      process.exit(0);
    }

    // 方法3: 清除并重新安装
    log('⚠️ 方法2验证失败，尝试方法3: 清除并重新安装');
    const nodeModulesPath = path.join(skillDir, 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
      log('删除现有 node_modules');
      execSync('rm -rf node_modules', { cwd: skillDir });
    }

    const result3 = spawnSync('npm', ['install'], {
      cwd: skillDir,
      stdio: 'pipe',
      encoding: 'utf8'
    });

    if (result3.stdout) log('stdout: ' + result3.stdout.trim());
    if (result3.stderr) log('stderr: ' + result3.stderr.trim());
    log('exit code: ' + result3.status);

    if (verifyInstallation()) {
      log('✅ 依赖安装成功 (方法3)');
      log('✅ Playwright 验证成功');
    } else {
      log('❌ 所有安装方法都失败');
      log('💡 请手动安装: cd ' + skillDir + ' && npm install');
    }

  } catch (error) {
    log('❌ 安装异常: ' + error.message);
    log('Stack: ' + error.stack);
  }

  cleanup();
  log('守护进程退出');
  process.exit(0);
}, 5000);
`;

  try {
    // 写入守护进程脚本
    fs.writeFileSync(daemonScript, daemonCode);

    // 启动守护进程 (detached + ignore stdio)
    const daemon = spawn('node', [daemonScript], {
      cwd: drawnoteSkillDir,
      detached: true,
      stdio: 'ignore'
    });

    // 分离进程
    daemon.unref();

    console.log('📦 DrawNote Skill 依赖安装守护进程已启动');
    console.log('💡 依赖将在后台自动安装（约2-5分钟）');
    console.log('💡 查看进度: cat ~/.claude/skills/drawnote/daemon.log');
    console.log('💡 查看状态: cd ~/.claude/skills/drawnote && npm run status');

  } catch (error) {
    console.log('⚠️  守护进程启动失败');
    console.log('🔧 请手动安装依赖:');
    console.log(`   cd ${drawnoteSkillDir}`);
    console.log('   npm install');
  }
}

// 复制文件夹
function copyFolderSync(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const files = fs.readdirSync(source);

  files.forEach(file => {
    const sourcePath = path.join(source, file);
    const targetPath = path.join(target, file);

    if (fs.statSync(sourcePath).isDirectory()) {
      copyFolderSync(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  });
}

// 显示安装完成信息
function showCompletion() {
  console.log();
  console.log('🎉 AI Agent Team 安装完成！');
  console.log();
  console.log('🚀 快速开始:');
  console.log('  # 智能体快捷命令');
  console.log("  /pm '设计用户认证系统'  # 产品经理");
  console.log("  /fe '创建登录页面'      # 前端开发");
  console.log("  /be '实现JWT认证API'    # 后端开发");
  console.log("  /qa '测试认证流程'      # 测试工程师");
  console.log("  /ops '部署到生产环境'   # 运维工程师");
  console.log("  /tl '评估系统架构'      # 技术负责人");
  console.log();
  console.log('  # DrawNote Skill - 智能笔记');
  console.log("  请帮我创建一个关于\"AI发展\"的信息图");
  console.log("  请使用彩色手写笔记风格生成\"机器学习\"的信息图");
  console.log();
  console.log('📚 更多信息:');
  console.log('  • 使用指南: ~/.claude/USAGE.md');
  console.log('  • Skills 文档: ~/.claude/skills/drawnote/SKILL.md');
  console.log('  • 项目主页: https://github.com/peterfei/ai-agent-team');
  console.log();
  console.log('💡 提示: 重启 Claude Code 以确保 Skills 加载');
  console.log();
}

try {
  console.log('🚀 开始 AI Agent Team 安装流程...');
  backupExisting();
  installConfig();
  installSkills();
  showCompletion();
  console.log('✅ AI Agent Team 安装流程完成');
} catch (error) {
  console.error('\n❌ 安装过程中出现错误:');
  console.error('🔍 错误类型:', error.constructor.name);
  console.error('📝 错误信息:', error.message);
  console.error('\n🔧 如需帮助，请访问: https://github.com/peterfei/ai-agent-team/issues');
  process.exit(1);
}
