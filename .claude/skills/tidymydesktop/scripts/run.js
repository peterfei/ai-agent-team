#!/usr/bin/env node

/**
 * 跨平台启动脚本
 * 支持 Windows、macOS 和 Linux
 */

const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

// 检查 Node.js 版本
const nodeVersion = process.version.slice(1).split('.')[0];
if (parseInt(nodeVersion) < 14) {
  console.error(`警告: Node.js 版本过低 (当前: ${process.version}, 要求: >= v14.0.0)`);
  console.error('建议升级 Node.js');
}

// 获取要执行的脚本路径
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('错误: 请指定要执行的脚本');
  console.error('用法: node run.js <script> [args...]');
  process.exit(1);
}

const scriptPath = path.resolve(__dirname, args[0]);
const scriptArgs = args.slice(1);

// 执行脚本
const child = spawn(process.execPath, [scriptPath, ...scriptArgs], {
  stdio: 'inherit',
  cwd: path.dirname(__dirname),
});

child.on('exit', (code) => {
  process.exit(code || 0);
});

child.on('error', (err) => {
  console.error('执行错误:', err.message);
  process.exit(1);
});
