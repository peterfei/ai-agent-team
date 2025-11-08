#!/usr/bin/env node

/**
 * AI Agent Team npm preinstall script
 * 检查系统环境和依赖
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🔍 AI Agent Team - 安装前检查...');

// 检查Node.js版本
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 16) {
  console.error('❌ 需要Node.js 16或更高版本');
  console.error(`当前版本: ${nodeVersion}`);
  process.exit(1);
}

console.log(`✅ Node.js版本: ${nodeVersion}`);

// 检查系统平台
const platforms = ['darwin', 'linux'];
const currentPlatform = process.platform;

if (!platforms.includes(currentPlatform)) {
  console.warn(`⚠️ 未测试的平台: ${currentPlatform}`);
  console.warn('  支持的平台: macOS, Linux');
} else {
  console.log(`✅ 平台: ${currentPlatform}`);
}

console.log('✅ 环境检查完成，继续安装...');