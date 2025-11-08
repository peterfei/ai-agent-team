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
  console.log('  # 产品经理');
  console.log("  /pm '设计用户认证系统'");
  console.log();
  console.log('  # 前端开发');
  console.log("  /fe '创建登录页面'");
  console.log();
  console.log('  # 后端开发');
  console.log("  /be '实现JWT认证API'");
  console.log();
  console.log('  # 测试工程师');
  console.log("  /qa '测试认证流程'");
  console.log();
  console.log('  # 运维工程师');
  console.log("  /ops '部署到生产环境'");
  console.log();
  console.log('  # 技术负责人');
  console.log("  /tl '评估系统架构'");
  console.log();
  console.log('📚 更多信息:');
  console.log('  • 使用指南: ~/.claude/USAGE.md');
  console.log('  • 项目主页: https://github.com/peterfei/ai-agent-team');
  console.log();
  console.log('💡 提示: 重启Claude Code以确保配置生效');
}

try {
  backupExisting();
  installConfig();
  showCompletion();
} catch (error) {
  console.error('❌ 安装过程中出现错误:', error.message);
  process.exit(1);
}