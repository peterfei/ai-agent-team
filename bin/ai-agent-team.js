#!/usr/bin/env node

/**
 * AI Agent Team CLI Tool
 *
 * 这是AI Agent Team的命令行工具，提供便捷的安装和管理功能
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  purple: '\x1b[35m',
  cyan: '\x1b[36m',
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
  console.log(colorize('green'), '  install      安装AI Agent Team');
  console.log(colorize('green'), '  uninstall    卸载AI Agent Team');
  console.log(colorize('green'), '  update       更新AI Agent Team');
  console.log(colorize('green'), '  status       显示安装状态');
  console.log(colorize('green'), '  test         测试安装');
  console.log(colorize('green'), '  doctor       诊断问题');
  console.log(colorize('green'), '  version      显示版本信息');
  console.log(colorize('green'), '  help         显示帮助信息');
  console.log();
  console.log(colorize('yellow', '选项:'));
  console.log(colorize('blue'), '  --force      强制执行');
  console.log(colorize('blue'), '  --dev        开发模式');
  console.log(colorize('blue'), '  --verbose    详细输出');
  console.log();
  console.log(colorize('yellow', '示例:'));
  console.log(colorize('white'), '  ai-agent-team install');
  console.log(colorize('white'), '  ai-agent-team install --force');
  console.log(colorize('white'), '  ai-agent-team status');
  console.log();
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
function getClaudeConfigDir() {
  const homeDir = require('os').homedir();
  return path.join(homeDir, '.claude');
}

// 检查安装状态
function checkStatus() {
  const claudeDir = getClaudeConfigDir();
  const agentsDir = path.join(claudeDir, 'agents');
  const commandsDir = path.join(claudeDir, 'commands');
  const cliScript = path.join(agentsDir, 'cli.sh');

  console.log(colorize('yellow', '🔍 AI Agent Team 安装状态'));
  console.log(colorize('cyan', '================================'));

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

  // 检查CLI工具
  if (fs.existsSync(cliScript)) {
    console.log(colorize('green', '✅ CLI工具'));
  } else {
    console.log(colorize('red', '❌ CLI工具缺失'));
  }

  return true;
}

// 安装
function install(options = {}) {
  showLogo();
  console.log(colorize('yellow', '🚀 开始安装 AI Agent Team...'));
  console.log();

  // 检查Claude Code
  if (!checkClaudeCode()) {
    console.log(colorize('red', '❌ Claude Code 未安装'));
    console.log(colorize('yellow', '请先安装Claude Code: https://claude.ai/code'));
    process.exit(1);
  }

  const claudeDir = getClaudeConfigDir();
  const packageDir = __dirname;

  // 创建备份
  if (!options.skipBackup && (fs.existsSync(path.join(claudeDir, 'agents')) ||
      fs.existsSync(path.join(claudeDir, 'commands')))) {
    const backupDir = path.join(claudeDir, `backup_${Date.now()}`);
    fs.mkdirSync(backupDir, { recursive: true });

    ['agents', 'commands', 'CLAUDE.md'].forEach(item => {
      const source = path.join(claudeDir, item);
      if (fs.existsSync(source)) {
        fs.renameSync(source, path.join(backupDir, item));
      }
    });

    console.log(colorize('yellow', `💾 配置已备份到: ${backupDir}`));
  }

  // 复制配置文件
  const sourceClaudeDir = path.join(packageDir, '..', '.claude');

  if (fs.existsSync(sourceClaudeDir)) {
    copyFolderSync(sourceClaudeDir, claudeDir);
    console.log(colorize('green', '✅ 配置文件安装完成'));

    // 设置CLI脚本权限
    const cliScript = path.join(claudeDir, 'agents', 'cli.sh');
    if (fs.existsSync(cliScript)) {
      try {
        fs.chmodSync(cliScript, '755');
        console.log(colorize('green', '✅ CLI工具权限设置完成'));
      } catch (error) {
        console.log(colorize('yellow', '⚠️  无法设置CLI工具权限'));
      }
    }
  } else {
    console.log(colorize('red', '❌ 配置文件不存在'));
    process.exit(1);
  }

  console.log();
  console.log(colorize('green'), '🎉 安装完成！');
  console.log();
  showQuickStart();
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

// 卸载
function uninstall() {
  showLogo();
  console.log(colorize('yellow', '🗑️  卸载 AI Agent Team...'));
  console.log();

  const claudeDir = getClaudeConfigDir();

  const itemsToRemove = ['agents', 'commands', 'CLAUDE.md', 'USAGE.md'];
  let removedCount = 0;

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
    console.log(colorize('green'), '🎉 卸载完成！');
  } else {
    console.log(colorize('yellow'), 'ℹ️  没有找到已安装的组件');
  }
}

// 测试安装
function test() {
  showLogo();
  console.log(colorize('yellow', '🧪 测试 AI Agent Team 安装...'));
  console.log();

  // 测试Claude Code
  if (!checkClaudeCode()) {
    console.log(colorize('red', '❌ Claude Code 测试失败'));
    return;
  }

  console.log(colorize('green', '✅ Claude Code 测试通过'));

  // 测试智能体文件
  const claudeDir = getClaudeConfigDir();
  const agentsDir = path.join(claudeDir, 'agents');

  if (fs.existsSync(agentsDir)) {
    const agentFiles = fs.readdirSync(agentsDir).filter(f => f.endsWith('.md'));
    console.log(colorize('green', `✅ 智能体文件测试通过 (${agentFiles.length} 个)`));
  } else {
    console.log(colorize('red', '❌ 智能体文件测试失败'));
  }

  // 测试命令文件
  const commandsDir = path.join(claudeDir, 'commands');
  if (fs.existsSync(commandsDir)) {
    const commandFiles = fs.readdirSync(commandsDir).filter(f => f.endsWith('.md'));
    console.log(colorize('green', `✅ 命令文件测试通过 (${commandFiles.length} 个)`));
  } else {
    console.log(colorize('red', '❌ 命令文件测试失败'));
  }

  console.log();
  console.log(colorize('green'), '🎉 测试完成！');
}

// 显示快速开始
function showQuickStart() {
  console.log(colorize('yellow'), '🚀 快速开始:');
  console.log();
  console.log(colorize('blue'), '# 快捷命令 (推荐)');
  console.log(colorize('white'), "/pm '设计用户认证系统'");
  console.log(colorize('white'), "/fe '创建登录页面'");
  console.log(colorize('white'), "/be '实现JWT认证API'");
  console.log(colorize('white'), "/qa '测试认证流程'");
  console.log(colorize('white'), "/ops '部署到生产环境'");
  console.log(colorize('white'), "/tl '评估系统架构'");
  console.log();
  console.log(colorize('blue'), '# CLI工具');
  console.log(colorize('white'), '~/.claude/agents/cli.sh pm "设计用户认证系统"');
  console.log();
  console.log(colorize('blue'), '# 完整命令');
  console.log(colorize('white'), "claude -p \"/agent product_manager '设计用户认证系统'\"");
  console.log();
}

// 主函数
function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  const options = {
    force: args.includes('--force'),
    dev: args.includes('--dev'),
    verbose: args.includes('--verbose'),
    skipBackup: args.includes('--skip-backup'),
  };

  switch (command) {
    case 'install':
      install(options);
      break;
    case 'uninstall':
      uninstall();
      break;
    case 'update':
      console.log(colorize('yellow'), '🔄 更新功能开发中...');
      break;
    case 'status':
      checkStatus();
      break;
    case 'test':
      test();
      break;
    case 'doctor':
      console.log(colorize('yellow'), '🔧 诊断功能开发中...');
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
      console.log(colorize('red'), `未知命令: ${command}`);
      console.log(colorize('yellow'), '使用 "ai-agent-team help" 查看帮助');
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
};