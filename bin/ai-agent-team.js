#!/usr/bin/env node

/**
 * AI Agent Team CLI Tool
 *
 * 这是AI Agent Team的命令行工具，提供便捷的安装和管理功能
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');
const readline = require('readline');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  purple: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function colorize(color, text) {
  return `${colors[color]}${text}${colors.reset}`;
}

// 显示logo
function showLogo() {
  console.log(colorize('cyan', `
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║           🤖 AI Agent Team 智能团队                          ║
║                                                              ║
║         基于Claude Code的专业AI智能体团队系统                ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`));
}

// 显示帮助
function showHelp() {
  showLogo();
  console.log(colorize('yellow', 'AI Agent Team CLI 工具'));
  console.log(colorize('cyan', '========================'));
  console.log();
  console.log(colorize('yellow', '使用方法:'));
  console.log('  ai-agent-team [命令] [选项]');
  console.log();
  console.log(colorize('yellow', '命令:'));
  console.log(colorize('green', '  init         初始化/安装 (推荐)'));
  console.log(colorize('green', '  install      执行标准安装 (默认全局)'));
  console.log(colorize('green', '  uninstall    卸载AI Agent Team'));
  console.log(colorize('green', '  status       显示安装状态'));
  console.log(colorize('green', '  test         测试安装'));
  console.log(colorize('green', '  version      显示版本信息'));
  console.log(colorize('green', '  help         显示帮助信息'));
  console.log();
  console.log(colorize('yellow', '选项:'));
  console.log(colorize('blue', '  --force      强制执行'));
  console.log(colorize('blue', '  --verbose    详细输出'));
  console.log();
}

// 获取用户输入
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

// 检查Claude Code
function checkClaudeCode() {
  try {
    execSync('claude --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// 获取Claude配置目录
// 优先查找当前目录下的 .claude，如果不存在则返回用户目录下的 .claude
function getClaudeConfigDir() {
  const localDir = path.join(process.cwd(), '.claude');
  const homeDir = require('os').homedir();
  const globalDir = path.join(homeDir, '.claude');

  // 如果本地存在，优先使用本地
  if (fs.existsSync(localDir)) {
    return localDir;
  }
  return globalDir;
}

// 检查安装状态
function checkStatus() {
  const claudeDir = getClaudeConfigDir();
  const isLocal = claudeDir === path.join(process.cwd(), '.claude');
  
  const agentsDir = path.join(claudeDir, 'agents');
  const commandsDir = path.join(claudeDir, 'commands');
  const cliScript = path.join(agentsDir, 'cli.sh');

  console.log(colorize('yellow', '🔍 AI Agent Team 安装状态'));
  console.log(colorize('cyan', '================================'));
  console.log(colorize('gray', `配置路径: ${claudeDir} (${isLocal ? '当前项目' : '全局'})`));
  console.log();

  // 检查Claude Code
  if (checkClaudeCode()) {
    console.log(colorize('green', '✅ Claude Code 已安装'));
  } else {
    console.log(colorize('red', '❌ Claude Code 未安装'));
    console.log(colorize('yellow', '   请先安装: https://claude.ai/code'));
    return false;
  }

  // 检查智能体配置
  if (fs.existsSync(agentsDir)) {
    const agentFiles = fs.readdirSync(agentsDir).filter(f => f.endsWith('.md'));
    console.log(colorize('green', `✅ 智能体配置 (${agentFiles.length} 个)`));
  } else {
    console.log(colorize('red', '❌ 智能体配置缺失'));
  }

  // 检查快捷命令
  if (fs.existsSync(commandsDir)) {
    const commandFiles = fs.readdirSync(commandsDir).filter(f => f.endsWith('.md'));
    console.log(colorize('green', `✅ 快捷命令 (${commandFiles.length} 个)`));
  } else {
    console.log(colorize('red', '❌ 快捷命令缺失'));
  }

  // 检查Skills
  const skillsDir = path.join(claudeDir, 'skills');
  if (fs.existsSync(skillsDir)) {
    const skills = fs.readdirSync(skillsDir).filter(f => fs.statSync(path.join(skillsDir, f)).isDirectory());
    console.log(colorize('green', `✅ Skills (${skills.length} 个)`));
    
    // 检查 thread-manager
    if (skills.includes('thread-manager')) {
        console.log(colorize('green', '   - thread-manager: 已安装'));
    }
  } else {
    console.log(colorize('yellow', '⚠️  Skills 目录缺失'));
  }

  return true;
}

// 安装 Skill 依赖 (同步版本，用于 init)
function installSkillDependenciesSync(skillDir, skillName) {
  console.log(colorize('blue', `📦 正在安装依赖: ${skillName}...`));
  
  const nodeModulesPath = path.join(skillDir, 'node_modules');
  
  try {
    // 基础 npm install
    const args = ['install'];
    
    // 特殊处理 drawnote (确保 playwright 安装)
    // 但通常 npm install 就会根据 package.json 安装 playwright
    
    const result = spawnSync('npm', args, {
      cwd: skillDir,
      stdio: 'inherit', // 显示输出给用户看
      encoding: 'utf8',
      shell: true
    });

    if (result.status === 0) {
      console.log(colorize('green', `✅ ${skillName} 依赖安装成功`));
    } else {
      console.log(colorize('red', `❌ ${skillName} 依赖安装失败 (Exit code: ${result.status})`));
      // 尝试 force
      console.log(colorize('yellow', `尝试使用 --force 重试...`));
      spawnSync('npm', ['install', '--force'], {
        cwd: skillDir,
        stdio: 'inherit',
        shell: true
      });
    }
  } catch (error) {
    console.log(colorize('red', `❌ 安装过程出错: ${error.message}`));
  }
}

// 初始化/安装流程
async function init() {
  showLogo();
  console.log(colorize('yellow', '🚀 AI Agent Team 初始化向导'));
  console.log();

  // 1. 选择安装位置
  console.log(colorize('cyan', '请选择安装位置:'));
  console.log('  1) 全局安装 (用户目录 ~/.claude) [推荐用于个人使用]');
  console.log('  2) 当前项目安装 (./.claude) [推荐用于团队共享]');
  
  let targetDir = '';
  while (!targetDir) {
    const ans = await askQuestion(colorize('green', '请输入选项 (1/2) [1]: '));
    if (ans.trim() === '2') {
      targetDir = path.join(process.cwd(), '.claude');
    } else {
      // 默认或 1
      targetDir = path.join(require('os').homedir(), '.claude');
    }
  }
  
  console.log();
  console.log(colorize('yellow', `将在以下位置安装: ${targetDir}`));
  const confirm = await askQuestion(colorize('green', '确认继续? (Y/n) '));
  if (confirm.toLowerCase() === 'n') {
    console.log('已取消。');
    process.exit(0);
  }

  // 2. 执行安装
  install({ targetDir, interactive: true });
}

// 执行安装逻辑
function install(options = {}) {
  const targetDir = options.targetDir || path.join(require('os').homedir(), '.claude');
  const packageDir = path.join(__dirname, '..');
  
  if (!options.interactive) {
      showLogo();
      console.log(colorize('yellow', `🚀 开始安装到: ${targetDir}`));
  }

  // 检查Claude Code
  if (!checkClaudeCode()) {
    console.log(colorize('red', '❌ Claude Code 未安装'));
    console.log(colorize('yellow', '建议先安装Claude Code: https://claude.ai/code'));
    // 不退出，继续安装文件
  }

  // 创建备份
  if (!options.skipBackup && fs.existsSync(targetDir)) {
    const agentsDir = path.join(targetDir, 'agents');
    if (fs.existsSync(agentsDir)) {
        const backupDir = path.join(targetDir, `backup_${Date.now()}`);
        console.log(colorize('gray', `正在备份旧配置到: ${backupDir}...`));
        
        try {
            fs.mkdirSync(backupDir, { recursive: true });
            ['agents', 'commands', 'CLAUDE.md'].forEach(item => {
                const source = path.join(targetDir, item);
                if (fs.existsSync(source)) {
                    copyFolderSync(source, path.join(backupDir, item));
                }
            });
        } catch (e) {
            console.log(colorize('yellow', `⚠️ 备份失败: ${e.message}`));
        }
    }
  }

  // 复制配置文件
  const sourceClaudeDir = path.join(packageDir, '.claude');

  if (fs.existsSync(sourceClaudeDir)) {
    try {
        console.log(colorize('blue', '正在复制文件...'));
        copyFolderSync(sourceClaudeDir, targetDir);
        console.log(colorize('green', '✅ 配置文件复制完成'));

        // 设置CLI脚本权限
        const cliScript = path.join(targetDir, 'agents', 'cli.sh');
        if (fs.existsSync(cliScript)) {
          try {
            fs.chmodSync(cliScript, '755');
          } catch (error) {
            // ignore
          }
        }
        
        // 安装 Skills 依赖
        const skillsDir = path.join(targetDir, 'skills');
        if (fs.existsSync(skillsDir)) {
            const skills = fs.readdirSync(skillsDir);
            console.log();
            console.log(colorize('yellow', '🚀 开始安装 Skills 依赖 (这可能需要几分钟)...'));
            
            for (const skill of skills) {
                const skillDir = path.join(skillsDir, skill);
                if (fs.statSync(skillDir).isDirectory() && fs.existsSync(path.join(skillDir, 'package.json'))) {
                    installSkillDependenciesSync(skillDir, skill);
                }
            }
        }
        
    } catch (e) {
        console.log(colorize('red', `❌ 安装失败: ${e.message}`));
        process.exit(1);
    }
  } else {
    console.log(colorize('red', '❌ 源配置文件不存在 (package corrupted?)'));
    process.exit(1);
  }

  console.log();
  console.log(colorize('green', '🎉 AI Agent Team 安装成功！'));
  console.log();
  showQuickStart(targetDir);
}

// 复制文件夹 (递归)
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

// 卸载
function uninstall() {
  showLogo();
  console.log(colorize('yellow', '🗑️  卸载 AI Agent Team...'));
  
  // 尝试检测
  const claudeDir = getClaudeConfigDir();
  console.log(colorize('gray', `目标目录: ${claudeDir}`));

  const itemsToRemove = ['agents', 'commands', 'skills', 'CLAUDE.md', 'USAGE.md'];
  let removedCount = 0;

  // 二次确认
  // ... 简化起见，直接删除已知组件
  
  itemsToRemove.forEach(item => {
    const itemPath = path.join(claudeDir, item);
    if (fs.existsSync(itemPath)) {
      try {
        if (fs.statSync(itemPath).isDirectory()) {
          fs.rmSync(itemPath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(itemPath);
        }
        console.log(colorize('green', `✅ 已删除: ${item}`));
        removedCount++;
      } catch (error) {
        console.log(colorize('red', `❌ 删除失败: ${item}`));
      }
    }
  });

  if (removedCount > 0) {
    console.log();
    console.log(colorize('green', '🎉 卸载完成！'));
  } else {
    console.log(colorize('yellow', 'ℹ️  没有找到已安装的组件 (或目录不匹配)'));
  }
}

// 测试安装
function test() {
  showLogo();
  console.log(colorize('yellow', '🧪 测试 AI Agent Team 安装...'));
  checkStatus();
}

// 显示快速开始
function showQuickStart(installDir) {
  const isLocal = installDir && installDir !== path.join(require('os').homedir(), '.claude');
  const homeDir = require('os').homedir();
  
  // 计算 thread-manager 的绝对路径
  const threadManagerPath = isLocal 
    ? path.join(process.cwd(), '.claude', 'skills', 'thread-manager', 'dist', 'index.js')
    : path.join(homeDir, '.claude', 'skills', 'thread-manager', 'dist', 'index.js');

  console.log(colorize('yellow', '🚀 快速开始:'));
  console.log();
  
  if (isLocal) {
      console.log(colorize('cyan', '注意: 您已安装在当前项目下 (.claude)。'));
      console.log('请确保 .claude 目录已添加到您的 .gitignore (如果是私有配置) 或提交到仓库 (如果是团队配置)。');
      console.log();
  }
  
  console.log(colorize('purple', '⚠️  关键步骤: 注册 MCP Server'));
  console.log('为了启用 thread-manager 功能，请复制并运行以下命令：');
  console.log(colorize('green', `  claude mcp add thread-manager node "${threadManagerPath}"`));
  console.log();
  
  console.log(colorize('blue', '# 快捷命令'));
  console.log("  /pm '设计用户认证系统'");
  console.log("  /fe '创建登录页面'");
  console.log();
  console.log(colorize('blue', '# 更多信息'));
  console.log(`  查看 ${path.join(installDir || '~/.claude', 'USAGE.md')}`);
  console.log();
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  const options = {
    force: args.includes('--force'),
    verbose: args.includes('--verbose'),
    skipBackup: args.includes('--skip-backup'),
  };

  switch (command) {
    case 'init':
      await init();
      break;
    case 'install':
      // 保持向后兼容，默认安装到全局
      install(options);
      break;
    case 'uninstall':
      uninstall();
      break;
    case 'status':
      checkStatus();
      break;
    case 'test':
      test();
      break;
    case 'version':
      const packageJson = require(path.join(__dirname, '..', 'package.json'));
      console.log(`AI Agent Team v${packageJson.version}`);
      break;
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;
    default:
      console.log(colorize('red', `未知命令: ${command}`));
      console.log(colorize('yellow', '使用 "ai-agent-team help" 查看帮助'));
      process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = {
  install,
  uninstall,
  checkStatus,
  test,
  init
};
