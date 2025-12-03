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

// 备份现有配置 - 使用安全的复制方式
function backupExisting() {
  const backupDir = path.join(claudeDir, `backup_${Date.now()}`);

  const itemsToBackup = ['agents', 'commands', 'CLAUDE.md', 'USAGE.md'];
  const existingItems = itemsToBackup.filter(item => fs.existsSync(path.join(claudeDir, item)));

  if (existingItems.length === 0) {
    console.log('💡 没有现有配置需要备份');
    return;
  }

  console.log('💾 备份现有配置...');

  try {
    // 确保备份目录存在
    fs.mkdirSync(backupDir, { recursive: true });
    console.log(`📁 创建备份目录: ${backupDir}`);

    // 逐个备份项目
    existingItems.forEach(item => {
      const source = path.join(claudeDir, item);
      const dest = path.join(backupDir, item);

      try {
        if (fs.statSync(source).isDirectory()) {
          // 目录：递归复制
          console.log(`📂 备份目录: ${item}`);
          copyFolderSyncSafe(source, dest);
        } else {
          // 文件：直接复制
          console.log(`📄 备份文件: ${item}`);
          fs.copyFileSync(source, dest);
        }
        console.log(`✅ 备份成功: ${item}`);
      } catch (backupError) {
        console.warn(`⚠️  备份 ${item} 失败: ${backupError.message}`);
        // 继续处理其他项目
      }
    });

    console.log(`✅ 配置已备份到: ${backupDir}`);
  } catch (error) {
    console.warn(`⚠️  备份过程出错: ${error.message}`);
    console.log('💡 继续安装，跳过备份步骤');
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

// 安装 Skills 并启动后台安装依赖
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

    // 遍历所有 Skill 目录并安装依赖
    try {
      const skills = fs.readdirSync(targetSkillsDir);
      skills.forEach(skillName => {
        const skillDir = path.join(targetSkillsDir, skillName);
        if (fs.statSync(skillDir).isDirectory() && fs.existsSync(path.join(skillDir, 'package.json'))) {
          installSkillDependencies(skillDir, skillName);
        }
      });
    } catch (error) {
      console.warn(`⚠️  遍历 Skills 目录失败: ${error.message}`);
    }
  } else {
    console.log('⚠️  未找到 Skills 目录，跳过安装');
  }
}

// 启动安装守护进程
function installSkillDependencies(skillDir, skillName) {
  const { spawn } = require('child_process');
  
  // 简单的显示名称映射
  const displayNames = {
    'drawnote': 'DrawNote (绘图)',
    'changelog-generator': 'Changelog (日志)',
    'softcopyright': 'SoftCopyright (软著)',
    'tidymydesktop': 'TidyDesktop (整理)'
  };
  const displayName = displayNames[skillName] || skillName;

  // 检查是否已安装 (简单的 node_modules 检查)
  const nodeModulesPath = path.join(skillDir, 'node_modules');
  // 对于 DrawNote 特别检查 playwright
  const isDrawNote = skillName === 'drawnote';
  const playwrightPath = path.join(nodeModulesPath, 'playwright');
  
  if (fs.existsSync(nodeModulesPath)) {
    if (!isDrawNote || fs.existsSync(playwrightPath)) {
      console.log(`✅ ${displayName} 依赖已安装`);
      return;
    }
  }

  // 检查是否有守护进程正在运行
  const lockFile = path.join(skillDir, '.daemon.lock');
  if (fs.existsSync(lockFile)) {
    try {
      const pid = parseInt(fs.readFileSync(lockFile, 'utf8').trim());
      process.kill(pid, 0); // 测试进程是否存在
      console.log(`📦 ${displayName} 安装进程已在运行`);
      return;
    } catch (e) {
      // 进程不存在，删除过期的锁文件
      try { fs.unlinkSync(lockFile); } catch (err) {}
    }
  }

  // 创建守护进程脚本
  const daemonScript = path.join(skillDir, '.install-daemon.js');

  const daemonCode = `
const fs = require('fs');
const path = require('path');
const { spawnSync, execSync } = require('child_process');

const skillDir = path.dirname(__filename);
const skillName = path.basename(skillDir);
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
  if (!fs.existsSync(nodeModulesPath)) return false;
  
  // DrawNote 特殊检查
  if (skillName === 'drawnote') {
    const playwrightPath = path.join(nodeModulesPath, 'playwright');
    return fs.existsSync(playwrightPath);
  }
  
  return true;
}

process.on('exit', cleanup);
process.on('SIGINT', () => { cleanup(); process.exit(0); });
process.on('SIGTERM', () => { cleanup(); process.exit(0); });

// 延迟启动避免争抢资源
setTimeout(() => {
  log('开始安装依赖: ' + skillName);
  log('工作目录: ' + skillDir);
  log('PID: ' + process.pid);

  try {
    // 方法1: 标准安装
    log('方法1: npm install --save --force');
    // 对于 DrawNote，我们需要 playwright
    const args = ['install', '--save', '--force'];
    if (skillName === 'drawnote') {
      args.push('playwright');
    }

    const result1 = spawnSync('npm', args, {
      cwd: skillDir,
      stdio: 'pipe',
      encoding: 'utf8'
    });

    if (result1.stdout) log('stdout: ' + result1.stdout.trim());
    if (result1.stderr) log('stderr: ' + result1.stderr.trim());
    log('exit code: ' + result1.status);

    // 等待文件系统刷新
    const startWait = Date.now();
    while (Date.now() - startWait < 2000) {
      if (verifyInstallation()) {
        log('✅ 依赖安装成功 (方法1)');
        cleanup();
        process.exit(0);
      }
    }

    // 方法2: 仅 install --force (不指定包名)
    log('⚠️ 方法1验证失败，尝试方法2: npm install --force');
    const result2 = spawnSync('npm', ['install', '--force'], {
      cwd: skillDir,
      stdio: 'pipe',
      encoding: 'utf8'
    });
    
    if (verifyInstallation()) {
      log('✅ 依赖安装成功 (方法2)');
      cleanup();
      process.exit(0);
    }

    // 方法3: 清除并重新安装
    log('⚠️ 方法2验证失败，尝试方法3: 清除并重新安装');
    try {
      execSync('rm -rf node_modules', { cwd: skillDir });
    } catch (e) { log('清除 node_modules 失败: ' + e.message); }

    const result3 = spawnSync('npm', ['install'], {
      cwd: skillDir,
      stdio: 'pipe',
      encoding: 'utf8'
    });

    if (verifyInstallation()) {
      log('✅ 依赖安装成功 (方法3)');
    } else {
      log('❌ 所有安装方法都失败');
    }

  } catch (error) {
    log('❌ 安装异常: ' + error.message);
  }

  cleanup();
  process.exit(0);
}, 1000 + Math.random() * 2000); // 随机延迟，避免多个 skill 同时启动造成拥堵
`;

  try {
    // 写入守护进程脚本
    fs.writeFileSync(daemonScript, daemonCode);

    // 启动守护进程 (detached + ignore stdio)
    const daemon = spawn('node', [daemonScript], {
      cwd: skillDir,
      detached: true,
      stdio: 'ignore'
    });

    // 分离进程
    daemon.unref();

    console.log(`📦 ${displayName} 依赖后台安装中...`);

  } catch (error) {
    console.log(`⚠️  ${displayName} 安装脚本启动失败`);
    console.log('🔧 请手动安装:');
    console.log(`   cd ${skillDir} && npm install`);
  }
}

// 安全的目录复制函数
function copyFolderSyncSafe(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  try {
    const files = fs.readdirSync(source);

    files.forEach(file => {
      const sourcePath = path.join(source, file);
      const targetPath = path.join(target, file);

      try {
        if (fs.statSync(sourcePath).isDirectory()) {
          copyFolderSyncSafe(sourcePath, targetPath);
        } else {
          fs.copyFileSync(sourcePath, targetPath);
        }
      } catch (fileError) {
        console.warn(`⚠️  跳过文件 ${file}: ${fileError.message}`);
      }
    });
  } catch (readError) {
    console.warn(`⚠️  读取目录失败: ${readError.message}`);
    throw readError;
  }
}

// 原有的复制函数（保持兼容）
function copyFolderSync(source, target) {
  return copyFolderSyncSafe(source, target);
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
